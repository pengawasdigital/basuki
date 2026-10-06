import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  AdminUser,
  PengawasData,
  SekolahData,
  VisiMisiData,
  StrukturOrganisasiData,
  FasilitasData,
  KeunggulanData,
  KepalaSekolahData,
  GuruData,
  PrestasiData,
  BeritaData,
  PengumumanData,
  GaleriData,
  KontakData,
  PengaturanWebsiteData,
  VisitorRecord,
  VisitorStatsSummary,
  VisitorDayStat,
  VisitorTopPage,
  BukuTamuData
} from './types.js';
import { supabaseServer, isServerSupabaseConfigured } from './supabase.js';

interface DatabaseSchema {
  admins: AdminUser[];
  pengawas: PengawasData[];
  sekolah: SekolahData[];
  visiMisi: VisiMisiData[];
  strukturOrganisasi: StrukturOrganisasiData[];
  fasilitas: FasilitasData[];
  keunggulan: KeunggulanData[];
  kepalaSekolah: KepalaSekolahData[];
  guru: GuruData[];
  prestasi: PrestasiData[];
  berita: BeritaData[];
  pengumuman: PengumumanData[];
  galeri: GaleriData[];
  kontak: KontakData[];
  pengaturanWebsite: PengaturanWebsiteData[];
  bukuTamu?: BukuTamuData[];
  visitors?: VisitorRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function formatIndonesianDay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${dayNames[dt.getDay()]}, ${d} ${monthNames[dt.getMonth()]}`;
}

function getPageLabel(p: string): string {
  if (p === '/' || p === '') return 'Beranda Utama';
  if (p === '/profil-pengawas') return 'Profil Pengawas';
  if (p === '/sekolah') return 'Sekolah Binaan';
  if (p.startsWith('/sekolah/')) return 'Detail Sekolah';
  if (p === '/berita') return 'Warta & Pengawasan';
  if (p.startsWith('/berita/')) return 'Detail Berita';
  if (p === '/guru') return 'Direktori Guru';
  if (p === '/prestasi') return 'Prestasi Sekolah';
  if (p === '/galeri') return 'Galeri Dokumentasi';
  if (p === '/kontak') return 'Kontak & Lokasi';
  if (p === '/buku-tamu') return 'Buku Tamu Digital';
  return p;
}

function generateInitialVisitorData(): VisitorRecord[] {
  const records: VisitorRecord[] = [];
  const now = new Date();
  const pages = ['/', '/profil-pengawas', '/sekolah', '/berita', '/guru', '/prestasi', '/galeri', '/kontak', '/buku-tamu'];
  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const targetDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    const dateStr = targetDate.toISOString().split('T')[0];
    const dailyUniqueCount = 18 + Math.floor(Math.sin(dayOffset * 1.7) * 7 + (dayOffset % 3) * 3);
    for (let v = 0; v < dailyUniqueCount; v++) {
      const visitorId = `vis_seed_${dayOffset}_${v}`;
      const hits = 1 + ((v + dayOffset) % 3);
      for (let h = 0; h < hits; h++) {
        const hour = 7 + ((v * 2 + h * 3) % 14);
        const min = (v * 7 + h * 13) % 60;
        const recordTime = new Date(targetDate);
        recordTime.setHours(hour, min, (v * 11) % 60);
        records.push({
          id: `vis-seed-${dayOffset}-${v}-${h}`,
          visitorId,
          path: pages[(v + h) % pages.length],
          timestamp: recordTime.toISOString(),
          date: dateStr
        });
      }
    }
  }
  return records;
}

function getDefaultBukuTamu(): BukuTamuData[] {
  const now = new Date();
  return [
    {
      id: 'bt-001',
      nama: 'H. Muhammad Syarif, M.Pd.',
      jabatan: 'Koordinator Pengawas Sekolah',
      instansi: 'Dinas Pendidikan Kepemudaan dan Olahraga Kab. Kampar',
      masukan: 'Portal pengawas ini sangat inspiratif, inovatif, dan memudahkan pemantauan mutu sekolah binaan secara transparan dan akuntabel. Terus tingkatkan!',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 - 3 * 3600 * 1000).toISOString()
    },
    {
      id: 'bt-002',
      nama: 'Dra. Hj. Ratna Juwita',
      jabatan: 'Pengawas Ahli Madya TK/SD',
      instansi: 'Disdikpora Kabupaten Kampar',
      masukan: 'Sangat mengapresiasi ketersediaan data profil satuan pendidikan, data kepala sekolah, dan dewan guru yang terintegrasi dengan baik.',
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 - 5 * 3600 * 1000).toISOString()
    },
    {
      id: 'bt-003',
      nama: 'Surono, S.Pd.',
      jabatan: 'Kepala Satuan Pendidikan',
      instansi: 'UPT SD Negeri 004 Hangtuah',
      masukan: 'Terima kasih atas bimbingan dan pendampingan berkelanjutan dari Pengawas Pembina. Informasi program sekolah binaan sangat membantu kami di lapangan.',
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 - 1 * 3600 * 1000).toISOString()
    }
  ];
}

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    ensureDataDirectory();
    this.data = this.load();
    this.initSupabaseSync();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        let changed = false;
        if (!parsed.visitors || !Array.isArray(parsed.visitors) || parsed.visitors.length === 0) {
          parsed.visitors = generateInitialVisitorData();
          changed = true;
        }
        if (!parsed.bukuTamu || !Array.isArray(parsed.bukuTamu)) {
          parsed.bukuTamu = getDefaultBukuTamu();
          changed = true;
        }
        if (changed) {
          this.persist(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading database file, initializing fresh data:', e);
    }

    const init: DatabaseSchema = {
      admins: [
        {
          id: 'admin-001',
          email: 'admin@pengawassekolah.id',
          passwordHash: bcrypt.hashSync('Admin123!', 10),
          name: 'Administrator Portal',
          role: 'SUPERADMIN',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      pengawas: [],
      sekolah: [],
      visiMisi: [],
      strukturOrganisasi: [],
      fasilitas: [],
      keunggulan: [],
      kepalaSekolah: [],
      guru: [],
      prestasi: [],
      berita: [],
      pengumuman: [],
      galeri: [],
      kontak: [],
      pengaturanWebsite: [],
      bukuTamu: getDefaultBukuTamu(),
      visitors: generateInitialVisitorData()
    };
    this.persist(init);
    return init;
  }

  private persist(dataToSave?: DatabaseSchema) {
    try {
      ensureDataDirectory();
      const payload = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error persisting database:', e);
    }
  }

  private async initSupabaseSync() {
    if (!isServerSupabaseConfigured() || !supabaseServer) return;
    try {
      // Optional async check to pull schools if table exists in Supabase
      const { data: schoolsData, error } = await supabaseServer.from('sekolah').select('*').limit(5);
      if (!error && schoolsData && schoolsData.length > 0) {
        console.log(`[Supabase] Terhubung ke tabel Supabase PostgreSQL (${schoolsData.length} sampel sekolah terdeteksi).`);
      }
    } catch {
      // Silently continue
    }
  }

  public getRaw(): DatabaseSchema {
    return this.data;
  }

  // --- ADMIN ---
  public findAdminByEmail(email: string): AdminUser | undefined {
    return this.data.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  }

  public findAdminById(id: string): AdminUser | undefined {
    return this.data.admins.find((a) => a.id === id);
  }

  public updateAdmin(id: string, updates: Partial<AdminUser>): AdminUser | null {
    const idx = this.data.admins.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.data.admins[idx] = {
      ...this.data.admins[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.admins[idx];
  }

  // --- PENGAWAS ---
  public getPengawas(): PengawasData {
    if (!this.data.pengawas || this.data.pengawas.length === 0) {
      this.data.pengawas = [
        {
          id: 'pengawas-001',
          nama: 'Basuki',
          gelar: 'S.Kom.',
          nip: '19790719 201406 1 003',
          pangkatGolongan: 'Penata / III.C',
          jabatan: 'Pengawas Sekolah Ahli Muda',
          wilayahKerja: 'Kecamatan Perhentian Raja',
          kecamatan: 'Perhentian Raja',
          kabupaten: 'Kampar',
          provinsi: 'Riau',
          email: 'digitalpengawas@gmail.com',
          noHp: '085761120929',
          foto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600',
          riwayatPendidikan: 'S1 STMIK-AMIK Riau',
          pengalaman: '1. Guru Kelas SD Negeri (1998 - 2008)\n2. Kepala Sekolah Dasar Inti (2008 - 2017)\n3. Pengawas Sekolah TK/SD (2017 - Sekarang)',
          kompetensi: 'Supervisi Akademik Berdiferensiasi, Supervisi Manajerial Transformatif, Analisis Rapor Pendidikan, Kepemimpinan Pembelajaran',
          tugasFungsi: 'Melaksanakan tugas pengawasan akademik dan manajerial pada satuan pendidikan yang meliputi perencanaan program tahunan/semester, pendampingan, dan evaluasi mutu.',
          peranPengawas: '1. Pendampingan Satuan Pendidikan berfokus pada murid\n2. Supervisi Akademik dan Manajerial\n3. Pemantauan & Evaluasi Kurikulum Merdeka',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      this.persist();
    }
    return this.data.pengawas[0];
  }

  public updatePengawas(updates: Partial<PengawasData>): PengawasData {
    const current = this.getPengawas();
    const updatedPengawas = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.data.pengawas[0] = updatedPengawas;

    const settings = this.getSettings();
    const fullNameWithDegree = updatedPengawas.nama
      ? (updatedPengawas.gelar ? `${updatedPengawas.nama}, ${updatedPengawas.gelar}` : updatedPengawas.nama)
      : settings.namaPengawas;

    this.data.pengaturanWebsite[0] = {
      ...settings,
      namaPengawas: fullNameWithDegree,
      nipPengawas: updatedPengawas.nip || settings.nipPengawas,
      fotoPengawas: updatedPengawas.foto || settings.fotoPengawas,
      jabatan: updatedPengawas.jabatan || settings.jabatan,
      kecamatan: updatedPengawas.kecamatan || settings.kecamatan,
      kabupaten: updatedPengawas.kabupaten || settings.kabupaten,
      provinsi: updatedPengawas.provinsi || settings.provinsi,
      email: updatedPengawas.email || settings.email,
      telepon: updatedPengawas.noHp || settings.telepon,
      whatsapp: (updatedPengawas.noHp || settings.telepon || '').replace(/[^0-9]/g, ''),
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.pengawas[0];
  }

  // --- PENGATURAN WEBSITE ---
  public getSettings(): PengaturanWebsiteData {
    if (!this.data.pengaturanWebsite || this.data.pengaturanWebsite.length === 0) {
      this.data.pengaturanWebsite = [
        {
          id: 'default',
          namaPortal: 'PORTAL PENGAWAS SEKOLAH',
          subjudul: 'Informasi, Pendampingan, Dokumentasi dan Pengembangan Mutu Satuan Pendidikan',
          namaPengawas: 'Basuki, S.Kom.',
          fotoPengawas: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600',
          nipPengawas: '19790719 201406 1 003',
          jabatan: 'Pengawas Sekolah Ahli Muda',
          jenjang: 'TK / SD',
          kecamatan: 'Perhentian Raja',
          kabupaten: 'Kampar',
          provinsi: 'Riau',
          email: 'digitalpengawas@gmail.com',
          telepon: '085761120929',
          whatsapp: '085761120929',
          alamat: 'Korwil Perhentian Raja Jl. Pekanbaru - Taluk Kuantan',
          logo: '/logo-kampar.png',
          favicon: '/logo-kampar.png',
          deskripsi: 'Portal resmi pendampingan, informasi, dan pembinaan mutu pendidikan satuan TK/SD untuk mewujudkan pembelajaran yang berpusat pada murid.',
          footer: '© 2026 Pengawas Digital Informasi, Pendampingan, Dokumentasi dan Pengembangan Mutu Satuan Pendidikan. Pengawas Sekolah TK/SD. E-Mail : digitalpengawas@gmail.com',
          facebook: 'https://www.facebook.com/BasukiFaqod',
          instagram: 'https://www.instagram.com/faqodbasoeky/#',
          youtube: 'http://www.youtube.com/@pengawasdigital',
          tiktok: 'https://www.tiktok.com/@basoeky.faqod?lang=id-ID',
          mapsUrl: 'https://maps.google.com/?q=Perhentian+Raja+Kampar',
          latitude: 0.3541,
          longitude: 101.3812,
          updatedAt: new Date().toISOString()
        }
      ];
      this.persist();
    }
    return this.data.pengaturanWebsite[0];
  }

  public updateSettings(updates: Partial<PengaturanWebsiteData>): PengaturanWebsiteData {
    const current = this.getSettings();
    this.data.pengaturanWebsite[0] = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.pengaturanWebsite[0];
  }

  // --- SEKOLAH ---
  public getSchools(query?: { search?: string; jenjang?: string; status?: string }): SekolahData[] {
    let list = this.data.sekolah.map((s) => {
      const actualGuruCount = this.data.guru.filter((g) => g.sekolahId === s.id).length;
      let currentKepsek = s.kepalaSekolahNama;
      if (!currentKepsek) {
        const activeKs = this.data.kepalaSekolah.find(
          (ks) => ks.sekolahId === s.id && (ks.status === 'Aktif' || !ks.status)
        );
        if (activeKs) currentKepsek = activeKs.nama;
      }
      return {
        ...s,
        jumlahGuru: actualGuruCount > 0 ? actualGuruCount : s.jumlahGuru,
        kepalaSekolahNama: currentKepsek
      };
    });

    if (query?.jenjang && query.jenjang !== 'SEMUA') {
      list = list.filter((s) => s.jenjang.toUpperCase() === query.jenjang?.toUpperCase());
    }
    if (query?.status && query.status !== 'SEMUA') {
      list = list.filter((s) => s.status.toLowerCase() === query.status?.toLowerCase());
    }
    if (query?.search) {
      const q = query.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.nama.toLowerCase().includes(q) ||
          s.npsn.includes(q) ||
          s.kecamatan.toLowerCase().includes(q) ||
          (s.kepalaSekolahNama && s.kepalaSekolahNama.toLowerCase().includes(q))
      );
    }
    return list;
  }

  public getSchoolById(id: string): (SekolahData & {
    visiMisi?: VisiMisiData;
    strukturOrganisasi?: StrukturOrganisasiData[];
    fasilitas?: FasilitasData[];
    keunggulan?: KeunggulanData[];
    kepalaSekolah?: KepalaSekolahData[];
    guru?: GuruData[];
    prestasi?: PrestasiData[];
    berita?: BeritaData[];
    galeri?: GaleriData[];
  }) | null {
    const sch = this.data.sekolah.find((s) => s.id === id);
    if (!sch) return null;

    const visiMisi = this.data.visiMisi.find((vm) => vm.sekolahId === id);
    const strukturOrganisasi = this.data.strukturOrganisasi
      .filter((so) => so.sekolahId === id)
      .sort((a, b) => a.urutan - b.urutan);
    const fasilitas = this.data.fasilitas.filter((f) => f.sekolahId === id);
    const keunggulan = this.data.keunggulan.filter((k) => k.sekolahId === id);
    const kepalaSekolah = this.data.kepalaSekolah.filter((ks) => ks.sekolahId === id);
    const guru = this.data.guru.filter((g) => g.sekolahId === id);
    const prestasi = this.data.prestasi.filter((p) => p.sekolahId === id);
    const berita = this.data.berita.filter((b) => b.sekolahId === id);
    const galeri = this.data.galeri.filter((g) => g.sekolahId === id);

    let activeKepsekNama = sch.kepalaSekolahNama;
    const activeKsObj = kepalaSekolah.find((ks) => ks.status === 'Aktif' || !ks.status);
    if (activeKsObj && !activeKepsekNama) {
      activeKepsekNama = activeKsObj.nama;
    }

    return {
      ...sch,
      kepalaSekolahNama: activeKepsekNama,
      jumlahGuru: guru.length > 0 ? guru.length : sch.jumlahGuru,
      visiMisi,
      strukturOrganisasi,
      fasilitas,
      keunggulan,
      kepalaSekolah,
      guru,
      prestasi,
      berita,
      galeri
    };
  }

  public createSchool(item: Omit<SekolahData, 'id' | 'createdAt' | 'updatedAt'>): SekolahData {
    const now = new Date().toISOString();
    const newSchool: SekolahData = {
      ...item,
      id: 'sch-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    this.data.sekolah.push(newSchool);

    if (item.kepalaSekolahNama && item.kepalaSekolahNama.trim()) {
      this.data.kepalaSekolah.push({
        id: 'ks-' + Date.now(),
        sekolahId: newSchool.id,
        nama: item.kepalaSekolahNama.trim(),
        periode: '2022 - Sekarang',
        status: 'Aktif',
        keterangan: 'Kepala Satuan Pendidikan',
        foto: '',
        sambutan: '',
        createdAt: now,
        updatedAt: now
      });
    }

    this.persist();
    return newSchool;
  }

  public createBulkSekolah(items: Omit<SekolahData, 'id' | 'createdAt' | 'updatedAt'>[]): SekolahData[] {
    const now = new Date().toISOString();
    const createdList: SekolahData[] = items.map((item, index) => {
      const schId = 'sch-' + Date.now() + '-' + index + '-' + Math.round(Math.random() * 1000);
      if (item.kepalaSekolahNama && item.kepalaSekolahNama.trim()) {
        this.data.kepalaSekolah.push({
          id: 'ks-' + Date.now() + '-' + index,
          sekolahId: schId,
          nama: item.kepalaSekolahNama.trim(),
          periode: '2022 - Sekarang',
          status: 'Aktif',
          keterangan: 'Kepala Satuan Pendidikan',
          foto: '',
          sambutan: '',
          createdAt: now,
          updatedAt: now
        });
      }
      return {
        ...item,
        id: schId,
        createdAt: now,
        updatedAt: now
      };
    });

    this.data.sekolah.push(...createdList);
    this.persist();
    return createdList;
  }

  public updateSchool(id: string, updates: Partial<SekolahData>): SekolahData | null {
    const idx = this.data.sekolah.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    this.data.sekolah[idx] = {
      ...this.data.sekolah[idx],
      ...updates,
      updatedAt: now
    };

    if (updates.kepalaSekolahNama && updates.kepalaSekolahNama.trim()) {
      const activeKs = this.data.kepalaSekolah.find(
        (ks) => ks.sekolahId === id && (ks.status === 'Aktif' || !ks.status)
      );
      if (activeKs) {
        activeKs.nama = updates.kepalaSekolahNama.trim();
        activeKs.updatedAt = now;
      } else {
        this.data.kepalaSekolah.push({
          id: 'ks-' + Date.now(),
          sekolahId: id,
          nama: updates.kepalaSekolahNama.trim(),
          periode: '2022 - Sekarang',
          status: 'Aktif',
          keterangan: 'Kepala Satuan Pendidikan',
          foto: '',
          sambutan: '',
          createdAt: now,
          updatedAt: now
        });
      }
    }

    this.persist();
    return this.data.sekolah[idx];
  }

  public deleteSchool(id: string): boolean {
    const idx = this.data.sekolah.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.data.sekolah.splice(idx, 1);
    this.data.visiMisi = this.data.visiMisi.filter((x) => x.sekolahId !== id);
    this.data.strukturOrganisasi = this.data.strukturOrganisasi.filter((x) => x.sekolahId !== id);
    this.data.fasilitas = this.data.fasilitas.filter((x) => x.sekolahId !== id);
    this.data.keunggulan = this.data.keunggulan.filter((x) => x.sekolahId !== id);
    this.data.kepalaSekolah = this.data.kepalaSekolah.filter((x) => x.sekolahId !== id);
    this.data.guru = this.data.guru.filter((g) => g.sekolahId !== id);
    this.data.prestasi = this.data.prestasi.filter((p) => p.sekolahId !== id);
    this.data.galeri = this.data.galeri.filter((g) => g.sekolahId !== id);
    this.data.berita = this.data.berita.filter((b) => b.sekolahId !== id);
    this.persist();
    return true;
  }

  // --- VISI MISI ---
  public getVisiMisi(sekolahId: string): VisiMisiData | null {
    return this.data.visiMisi.find((vm) => vm.sekolahId === sekolahId) || null;
  }

  public upsertVisiMisi(sekolahId: string, payload: Partial<VisiMisiData>): VisiMisiData {
    const now = new Date().toISOString();
    const idx = this.data.visiMisi.findIndex((vm) => vm.sekolahId === sekolahId);
    if (idx !== -1) {
      this.data.visiMisi[idx] = {
        ...this.data.visiMisi[idx],
        ...payload,
        updatedAt: now
      };
      this.persist();
      return this.data.visiMisi[idx];
    } else {
      const newItem: VisiMisiData = {
        id: 'vm-' + Date.now(),
        sekolahId,
        visi: payload.visi || '',
        misi: payload.misi || '',
        tujuan: payload.tujuan || '',
        programUnggulan: payload.programUnggulan || '',
        createdAt: now,
        updatedAt: now
      };
      this.data.visiMisi.push(newItem);
      this.persist();
      return newItem;
    }
  }

  // --- STRUKTUR ORGANISASI ---
  public getStruktur(sekolahId?: string): StrukturOrganisasiData[] {
    let list = this.data.strukturOrganisasi;
    if (sekolahId) list = list.filter((s) => s.sekolahId === sekolahId);
    return list.sort((a, b) => a.urutan - b.urutan);
  }

  public createStruktur(item: Omit<StrukturOrganisasiData, 'id' | 'createdAt' | 'updatedAt'>): StrukturOrganisasiData {
    const now = new Date().toISOString();
    const newItem: StrukturOrganisasiData = {
      ...item,
      id: 'so-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    this.data.strukturOrganisasi.push(newItem);
    this.persist();
    return newItem;
  }

  public updateStruktur(id: string, updates: Partial<StrukturOrganisasiData>): StrukturOrganisasiData | null {
    const idx = this.data.strukturOrganisasi.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.data.strukturOrganisasi[idx] = {
      ...this.data.strukturOrganisasi[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.strukturOrganisasi[idx];
  }

  public deleteStruktur(id: string): boolean {
    const idx = this.data.strukturOrganisasi.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.data.strukturOrganisasi.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- FASILITAS ---
  public getFasilitas(sekolahId?: string): FasilitasData[] {
    if (sekolahId) return this.data.fasilitas.filter((f) => f.sekolahId === sekolahId);
    return this.data.fasilitas;
  }

  public createFasilitas(item: Omit<FasilitasData, 'id' | 'createdAt' | 'updatedAt'>): FasilitasData {
    const now = new Date().toISOString();
    const newItem: FasilitasData = {
      ...item,
      id: 'fas-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    this.data.fasilitas.push(newItem);
    this.persist();
    return newItem;
  }

  public updateFasilitas(id: string, updates: Partial<FasilitasData>): FasilitasData | null {
    const idx = this.data.fasilitas.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    this.data.fasilitas[idx] = {
      ...this.data.fasilitas[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.fasilitas[idx];
  }

  public deleteFasilitas(id: string): boolean {
    const idx = this.data.fasilitas.findIndex((f) => f.id === id);
    if (idx === -1) return false;
    this.data.fasilitas.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- KEUNGGULAN ---
  public getKeunggulan(sekolahId?: string): KeunggulanData[] {
    if (sekolahId) return this.data.keunggulan.filter((k) => k.sekolahId === sekolahId);
    return this.data.keunggulan;
  }

  public createKeunggulan(item: Omit<KeunggulanData, 'id' | 'createdAt' | 'updatedAt'>): KeunggulanData {
    const now = new Date().toISOString();
    const newItem: KeunggulanData = {
      ...item,
      id: 'keu-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    this.data.keunggulan.push(newItem);
    this.persist();
    return newItem;
  }

  public updateKeunggulan(id: string, updates: Partial<KeunggulanData>): KeunggulanData | null {
    const idx = this.data.keunggulan.findIndex((k) => k.id === id);
    if (idx === -1) return null;
    this.data.keunggulan[idx] = {
      ...this.data.keunggulan[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.keunggulan[idx];
  }

  public deleteKeunggulan(id: string): boolean {
    const idx = this.data.keunggulan.findIndex((k) => k.id === id);
    if (idx === -1) return false;
    this.data.keunggulan.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- KEPALA SEKOLAH ---
  public getKepalaSekolah(sekolahId?: string): KepalaSekolahData[] {
    if (this.data.sekolah && this.data.sekolah.length > 0) {
      let changed = false;
      for (const sch of this.data.sekolah) {
        if (sch.kepalaSekolahNama && sch.kepalaSekolahNama.trim()) {
          const exists = this.data.kepalaSekolah.some((ks) => ks.sekolahId === sch.id);
          if (!exists) {
            this.data.kepalaSekolah.push({
              id: 'ks-sch-' + sch.id,
              sekolahId: sch.id,
              nama: sch.kepalaSekolahNama.trim(),
              nip: '',
              periode: '2022 - Sekarang',
              status: 'Aktif',
              foto: '',
              keterangan: 'Kepala Satuan Pendidikan ' + sch.nama,
              sambutan: '',
              createdAt: sch.createdAt || new Date().toISOString(),
              updatedAt: sch.updatedAt || new Date().toISOString()
            });
            changed = true;
          }
        }
      }
      if (changed) {
        this.persist();
      }
    }
    if (sekolahId) return this.data.kepalaSekolah.filter((ks) => ks.sekolahId === sekolahId);
    return this.data.kepalaSekolah;
  }

  public createKepalaSekolah(item: Omit<KepalaSekolahData, 'id' | 'createdAt' | 'updatedAt'>): KepalaSekolahData {
    const now = new Date().toISOString();
    const newItem: KepalaSekolahData = {
      ...item,
      id: 'ks-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    this.data.kepalaSekolah.push(newItem);

    if (newItem.status === 'Aktif' || !newItem.status) {
      const schIdx = this.data.sekolah.findIndex((s) => s.id === newItem.sekolahId);
      if (schIdx !== -1) {
        this.data.sekolah[schIdx].kepalaSekolahNama = newItem.nama;
        this.data.sekolah[schIdx].updatedAt = now;
      }
    }
    this.persist();
    return newItem;
  }

  public createBulkKepalaSekolah(items: Omit<KepalaSekolahData, 'id' | 'createdAt' | 'updatedAt'>[]): KepalaSekolahData[] {
    const now = new Date().toISOString();
    const createdList: KepalaSekolahData[] = items.map((item, idx) => {
      const ksItem = {
        ...item,
        id: 'ks-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substring(2, 7),
        createdAt: now,
        updatedAt: now
      };
      if (ksItem.status === 'Aktif' || !ksItem.status) {
        const schIdx = this.data.sekolah.findIndex((s) => s.id === ksItem.sekolahId);
        if (schIdx !== -1) {
          this.data.sekolah[schIdx].kepalaSekolahNama = ksItem.nama;
          this.data.sekolah[schIdx].updatedAt = now;
        }
      }
      return ksItem;
    });
    this.data.kepalaSekolah.push(...createdList);
    this.persist();
    return createdList;
  }

  public updateKepalaSekolah(id: string, updates: Partial<KepalaSekolahData>): KepalaSekolahData | null {
    const idx = this.data.kepalaSekolah.findIndex((ks) => ks.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    this.data.kepalaSekolah[idx] = {
      ...this.data.kepalaSekolah[idx],
      ...updates,
      updatedAt: now
    };
    const updated = this.data.kepalaSekolah[idx];
    if (updated.status === 'Aktif') {
      const schIdx = this.data.sekolah.findIndex((s) => s.id === updated.sekolahId);
      if (schIdx !== -1) {
        this.data.sekolah[schIdx].kepalaSekolahNama = updated.nama;
        this.data.sekolah[schIdx].updatedAt = now;
      }
    }
    this.persist();
    return this.data.kepalaSekolah[idx];
  }

  public deleteKepalaSekolah(id: string): boolean {
    const idx = this.data.kepalaSekolah.findIndex((ks) => ks.id === id);
    if (idx === -1) return false;
    this.data.kepalaSekolah.splice(idx, 1);
    this.persist();
    return true;
  }

  public syncSchoolTeacherCount(sekolahId: string) {
    const schIdx = this.data.sekolah.findIndex((s) => s.id === sekolahId);
    if (schIdx !== -1) {
      const count = this.data.guru.filter((g) => g.sekolahId === sekolahId).length;
      this.data.sekolah[schIdx].jumlahGuru = count;
      this.data.sekolah[schIdx].updatedAt = new Date().toISOString();
    }
  }

  // --- GURU ---
  public getGuru(params?: {
    sekolahId?: string;
    search?: string;
    statusKepegawaian?: string;
    tampilkanPublikOnly?: boolean;
    page?: number;
    limit?: number;
  }): { data: GuruData[]; total: number; page: number; limit: number; totalPages: number } {
    let list = [...this.data.guru];
    if (params?.sekolahId) list = list.filter((g) => g.sekolahId === params.sekolahId);
    if (params?.tampilkanPublikOnly) list = list.filter((g) => g.tampilkanPublik !== false);
    if (params?.statusKepegawaian && params.statusKepegawaian !== 'SEMUA') {
      list = list.filter((g) => g.statusKepegawaian?.toUpperCase() === params.statusKepegawaian?.toUpperCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (g) =>
          g.nama.toLowerCase().includes(q) ||
          g.jabatan.toLowerCase().includes(q) ||
          (g.mapel && g.mapel.toLowerCase().includes(q)) ||
          (g.nip && g.nip.includes(q)) ||
          (g.nuptk && g.nuptk.includes(q))
      );
    }
    const total = list.length;
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);
    return {
      data: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  public createGuru(item: Omit<GuruData, 'id' | 'createdAt' | 'updatedAt'>): GuruData {
    const now = new Date().toISOString();
    const newItem: GuruData = {
      ...item,
      id: 'guru-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    this.data.guru.push(newItem);
    this.persist();
    if (newItem.sekolahId) this.syncSchoolTeacherCount(newItem.sekolahId);
    return newItem;
  }

  public createBulkGuru(items: Omit<GuruData, 'id' | 'createdAt' | 'updatedAt'>[]): GuruData[] {
    const now = new Date().toISOString();
    const affectedSchoolIds = new Set<string>();
    const createdList: GuruData[] = items.map((item, index) => {
      if (item.sekolahId) affectedSchoolIds.add(item.sekolahId);
      return {
        ...item,
        id: 'guru-' + Date.now() + '-' + index + '-' + Math.round(Math.random() * 1000),
        createdAt: now,
        updatedAt: now
      };
    });
    this.data.guru.push(...createdList);
    this.persist();
    affectedSchoolIds.forEach((sid) => this.syncSchoolTeacherCount(sid));
    return createdList;
  }

  public updateGuru(id: string, updates: Partial<GuruData>): GuruData | null {
    const idx = this.data.guru.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    const oldSekolahId = this.data.guru[idx].sekolahId;
    this.data.guru[idx] = {
      ...this.data.guru[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    if (oldSekolahId) this.syncSchoolTeacherCount(oldSekolahId);
    if (updates.sekolahId && updates.sekolahId !== oldSekolahId) {
      this.syncSchoolTeacherCount(updates.sekolahId);
    }
    return this.data.guru[idx];
  }

  public deleteGuru(id: string): boolean {
    const idx = this.data.guru.findIndex((g) => g.id === id);
    if (idx === -1) return false;
    const sekolahId = this.data.guru[idx].sekolahId;
    this.data.guru.splice(idx, 1);
    this.persist();
    if (sekolahId) this.syncSchoolTeacherCount(sekolahId);
    return true;
  }

  // --- PRESTASI ---
  public getPrestasi(params?: { sekolahId?: string; tingkat?: string; search?: string }): (PrestasiData & { sekolahNama?: string })[] {
    let list = this.data.prestasi.map((p) => {
      const sch = this.data.sekolah.find((s) => s.id === p.sekolahId);
      return { ...p, sekolahNama: sch ? sch.nama : 'Umum / Pengawas' };
    });
    if (params?.sekolahId) list = list.filter((p) => p.sekolahId === params.sekolahId);
    if (params?.tingkat && params.tingkat !== 'SEMUA') {
      list = list.filter((p) => p.tingkat.toLowerCase() === params.tingkat?.toLowerCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.namaPrestasi.toLowerCase().includes(q) ||
          p.bidang.toLowerCase().includes(q) ||
          p.peraih.toLowerCase().includes(q) ||
          (p.sekolahNama && p.sekolahNama.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => b.tahun - a.tahun);
  }

  public createPrestasi(item: Omit<PrestasiData, 'id' | 'createdAt' | 'updatedAt'>): PrestasiData {
    const now = new Date().toISOString();
    const newItem: PrestasiData = {
      ...item,
      id: 'pres-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    this.data.prestasi.push(newItem);
    this.persist();
    return newItem;
  }

  public createBulkPrestasi(items: Omit<PrestasiData, 'id' | 'createdAt' | 'updatedAt'>[]): PrestasiData[] {
    const now = new Date().toISOString();
    const createdList: PrestasiData[] = items.map((item, index) => ({
      ...item,
      id: 'pres-' + Date.now() + '-' + index + '-' + Math.round(Math.random() * 1000),
      createdAt: now,
      updatedAt: now
    }));
    this.data.prestasi.push(...createdList);
    this.persist();
    return createdList;
  }

  public updatePrestasi(id: string, updates: Partial<PrestasiData>): PrestasiData | null {
    const idx = this.data.prestasi.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.prestasi[idx] = {
      ...this.data.prestasi[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.prestasi[idx];
  }

  public deletePrestasi(id: string): boolean {
    const idx = this.data.prestasi.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.data.prestasi.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- BERITA ---
  public getBerita(params?: {
    sekolahId?: string;
    kategori?: string;
    search?: string;
    publishOnly?: boolean;
    featuredOnly?: boolean;
  }): (BeritaData & { sekolahNama?: string })[] {
    let list = this.data.berita.map((b) => {
      const sch = this.data.sekolah.find((s) => s.id === b.sekolahId);
      return { ...b, sekolahNama: sch ? sch.nama : 'Pengawas' };
    });
    if (params?.publishOnly) list = list.filter((b) => b.statusPublish);
    if (params?.featuredOnly) list = list.filter((b) => b.featured);
    if (params?.sekolahId) list = list.filter((b) => b.sekolahId === params.sekolahId);
    if (params?.kategori && params.kategori !== 'SEMUA') {
      list = list.filter((b) => b.kategori.toLowerCase() === params.kategori?.toLowerCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (b) =>
          b.judul.toLowerCase().includes(q) ||
          b.ringkasan.toLowerCase().includes(q) ||
          b.konten.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }

  public getBeritaBySlug(slug: string): (BeritaData & { sekolahNama?: string }) | null {
    const b = this.data.berita.find((item) => item.slug === slug);
    if (!b) return null;
    const sch = this.data.sekolah.find((s) => s.id === b.sekolahId);
    return { ...b, sekolahNama: sch ? sch.nama : 'Pengawas' };
  }

  public createBerita(item: Omit<BeritaData, 'id' | 'createdAt' | 'updatedAt'>): BeritaData {
    const now = new Date().toISOString();
    const newItem: BeritaData = {
      ...item,
      id: 'berita-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    this.data.berita.push(newItem);
    this.persist();
    return newItem;
  }

  public updateBerita(id: string, updates: Partial<BeritaData>): BeritaData | null {
    const idx = this.data.berita.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    this.data.berita[idx] = {
      ...this.data.berita[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.berita[idx];
  }

  public deleteBerita(id: string): boolean {
    const idx = this.data.berita.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    this.data.berita.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- PENGUMUMAN ---
  public getPengumuman(publishOnly = false): PengumumanData[] {
    let list = [...this.data.pengumuman];
    if (publishOnly) list = list.filter((p) => p.statusPublish);
    return list.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }

  public createPengumuman(item: Omit<PengumumanData, 'id' | 'createdAt' | 'updatedAt'>): PengumumanData {
    const now = new Date().toISOString();
    const newItem: PengumumanData = {
      ...item,
      id: 'peng-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    this.data.pengumuman.push(newItem);
    this.persist();
    return newItem;
  }

  public updatePengumuman(id: string, updates: Partial<PengumumanData>): PengumumanData | null {
    const idx = this.data.pengumuman.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.pengumuman[idx] = {
      ...this.data.pengumuman[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.pengumuman[idx];
  }

  public deletePengumuman(id: string): boolean {
    const idx = this.data.pengumuman.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.data.pengumuman.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- GALERI ---
  public getGaleri(params?: { sekolahId?: string; kategori?: string; jenis?: string }): (GaleriData & { sekolahNama?: string })[] {
    let list = this.data.galeri.map((g) => {
      const sch = this.data.sekolah.find((s) => s.id === g.sekolahId);
      return { ...g, sekolahNama: sch ? sch.nama : 'Umum' };
    });
    if (params?.sekolahId) list = list.filter((g) => g.sekolahId === params.sekolahId);
    if (params?.kategori && params.kategori !== 'SEMUA') {
      list = list.filter((g) => g.kategori.toLowerCase() === params.kategori?.toLowerCase());
    }
    if (params?.jenis && params.jenis !== 'SEMUA') {
      list = list.filter((g) => g.jenis.toUpperCase() === params.jenis?.toUpperCase());
    }
    return list.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }

  public createGaleri(item: Omit<GaleriData, 'id' | 'createdAt' | 'updatedAt'>): GaleriData {
    const now = new Date().toISOString();
    const newItem: GaleriData = {
      ...item,
      id: 'gal-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    this.data.galeri.push(newItem);
    this.persist();
    return newItem;
  }

  public updateGaleri(id: string, updates: Partial<GaleriData>): GaleriData | null {
    const idx = this.data.galeri.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    this.data.galeri[idx] = {
      ...this.data.galeri[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.galeri[idx];
  }

  public deleteGaleri(id: string): boolean {
    const idx = this.data.galeri.findIndex((g) => g.id === id);
    if (idx === -1) return false;
    this.data.galeri.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- KONTAK ---
  public getKontak(): KontakData[] {
    return [...this.data.kontak].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createKontak(item: Omit<KontakData, 'id' | 'createdAt' | 'updatedAt'>): KontakData {
    const now = new Date().toISOString();
    const newItem: KontakData = {
      ...item,
      id: 'knt-' + Date.now(),
      status: 'Baru',
      createdAt: now,
      updatedAt: now
    };
    this.data.kontak.push(newItem);
    this.persist();
    return newItem;
  }

  public updateKontak(id: string, updates: Partial<KontakData>): KontakData | null {
    const idx = this.data.kontak.findIndex((k) => k.id === id);
    if (idx === -1) return null;
    this.data.kontak[idx] = {
      ...this.data.kontak[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.kontak[idx];
  }

  public deleteKontak(id: string): boolean {
    const idx = this.data.kontak.findIndex((k) => k.id === id);
    if (idx === -1) return false;
    this.data.kontak.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- DASHBOARD STATS ---
  public getDashboardStats() {
    const totalSekolah = this.data.sekolah.length;
    const totalKepalaSekolah = this.data.kepalaSekolah.length;
    const totalGuru = this.data.guru.length;
    const totalPrestasi = this.data.prestasi.length;
    const totalBerita = this.data.berita.length;
    const totalGaleri = this.data.galeri.length;
    const totalPengumuman = this.data.pengumuman.length;
    const totalKontakBaru = this.data.kontak.filter((k) => k.status === 'Baru').length;
    const totalSiswa = this.data.sekolah.reduce((acc, s) => acc + (s.jumlahSiswa || 0), 0);

    const sekolahJenjang = {
      SD: this.data.sekolah.filter((s) => s.jenjang.toUpperCase() === 'SD').length,
      TK: this.data.sekolah.filter((s) => s.jenjang.toUpperCase() === 'TK').length,
      Lainnya: this.data.sekolah.filter((s) => !['SD', 'TK'].includes(s.jenjang.toUpperCase())).length
    };

    const guruStatus = {
      PNS: this.data.guru.filter((g) => g.statusKepegawaian === 'PNS').length,
      PPPK: this.data.guru.filter((g) => g.statusKepegawaian === 'PPPK').length,
      Honorer: this.data.guru.filter((g) => g.statusKepegawaian?.toLowerCase().includes('honorer')).length,
      Lainnya: this.data.guru.filter((g) => !['PNS', 'PPPK'].includes(g.statusKepegawaian || '') && !g.statusKepegawaian?.toLowerCase().includes('honorer')).length
    };

    return {
      totalSekolah,
      totalKepalaSekolah,
      totalGuru,
      totalSiswa,
      totalPrestasi,
      totalBerita,
      totalGaleri,
      totalPengumuman,
      totalKontakBaru,
      sekolahJenjang,
      guruStatus,
      recentBerita: this.data.berita.slice(0, 5),
      recentPrestasi: this.data.prestasi.slice(0, 5),
      visitors: this.getVisitorStats()
    };
  }

  // --- VISITORS TRACKING ---
  public recordVisit(params: { visitorId: string; path: string; referrer?: string; userAgent?: string }) {
    if (!this.data.visitors) {
      this.data.visitors = [];
    }
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const newRecord: VisitorRecord = {
      id: `vis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      visitorId: params.visitorId || `anon-${Math.random().toString(36).substring(2, 9)}`,
      path: params.path || '/',
      referrer: params.referrer,
      userAgent: params.userAgent,
      timestamp: now.toISOString(),
      date: dateStr
    };
    this.data.visitors.push(newRecord);
    if (this.data.visitors.length > 5000) {
      this.data.visitors = this.data.visitors.slice(-5000);
    }
    this.persist();

    const todayVisitors = new Set(
      this.data.visitors.filter((r) => r.date === dateStr).map((r) => r.visitorId)
    ).size;
    const totalVisitors = new Set(this.data.visitors.map((r) => r.visitorId)).size;

    return {
      success: true,
      totalVisitors,
      todayVisitors
    };
  }

  public getVisitorStats(): VisitorStatsSummary {
    const list = this.data.visitors || [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const allVisitorIds = new Set(list.map((r) => r.visitorId));
    const totalVisitors = allVisitorIds.size;
    const totalPageViews = list.length;
    const todayRecords = list.filter((r) => r.date === todayStr);
    const todayVisitors = new Set(todayRecords.map((r) => r.visitorId)).size;
    const todayPageViews = todayRecords.length;
    const sevenDaysAgoTime = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgoTime = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    const fifteenMinsAgoTime = now.getTime() - 15 * 60 * 1000;

    const weekVisitors = new Set(
      list.filter((r) => new Date(r.timestamp).getTime() >= sevenDaysAgoTime).map((r) => r.visitorId)
    ).size;
    const monthVisitors = new Set(
      list.filter((r) => new Date(r.timestamp).getTime() >= thirtyDaysAgoTime).map((r) => r.visitorId)
    ).size;
    const activeNow = Math.max(1, new Set(
      list.filter((r) => new Date(r.timestamp).getTime() >= fifteenMinsAgoTime).map((r) => r.visitorId)
    ).size);

    const recentDays: VisitorDayStat[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateString = d.toISOString().split('T')[0];
      const dayRecs = list.filter((r) => r.date === dateString);
      const dayUniqueVisitors = new Set(dayRecs.map((r) => r.visitorId)).size;
      recentDays.push({
        date: dateString,
        label: formatIndonesianDay(dateString),
        visitors: dayUniqueVisitors,
        pageViews: dayRecs.length
      });
    }

    const pageCounts: Record<string, number> = {};
    for (const rec of list) {
      const p = rec.path || '/';
      pageCounts[p] = (pageCounts[p] || 0) + 1;
    }

    const topPages: VisitorTopPage[] = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([pagePath, views]) => ({
        path: pagePath,
        label: getPageLabel(pagePath),
        views
      }));

    return {
      totalVisitors,
      totalPageViews,
      todayVisitors,
      todayPageViews,
      weekVisitors,
      monthVisitors,
      activeNow,
      recentDays,
      topPages
    };
  }

  // --- GLOBAL SEARCH ---
  public searchGlobal(q: string) {
    if (!q || q.trim() === '') return { schools: [], news: [], achievements: [], teachers: [], gallery: [] };
    const query = q.toLowerCase();

    const schools = this.data.sekolah.filter(
      (s) =>
        s.nama.toLowerCase().includes(query) ||
        s.npsn.includes(query) ||
        s.kecamatan.toLowerCase().includes(query)
    ).slice(0, 5);

    const news = this.data.berita.filter(
      (b) =>
        b.statusPublish &&
        (b.judul.toLowerCase().includes(query) || b.konten.toLowerCase().includes(query))
    ).slice(0, 5);

    const achievements = this.data.prestasi.filter(
      (p) =>
        p.namaPrestasi.toLowerCase().includes(query) ||
        p.peraih.toLowerCase().includes(query) ||
        p.bidang.toLowerCase().includes(query)
    ).slice(0, 5);

    const teachers = this.data.guru.filter(
      (g) =>
        g.tampilkanPublik &&
        (g.nama.toLowerCase().includes(query) ||
          g.jabatan.toLowerCase().includes(query) ||
          (g.mapel && g.mapel.toLowerCase().includes(query)))
    ).slice(0, 5);

    const gallery = this.data.galeri.filter(
      (g) =>
        g.judul.toLowerCase().includes(query) ||
        (g.deskripsi && g.deskripsi.toLowerCase().includes(query))
    ).slice(0, 5);

    return {
      schools,
      news,
      achievements,
      teachers,
      gallery
    };
  }

  // --- SYSTEM DIAGNOSTICS & STATUS ---
  public getSystemStatus() {
    const isSupabaseLive = isServerSupabaseConfigured();
    return {
      mode: isSupabaseLive ? 'SUPABASE_POSTGRESQL' : 'HYBRID_STORE',
      isDemoMode: false,
      isDatabaseConfigured: true,
      isSupabaseConnected: isSupabaseLive,
      databaseType: isSupabaseLive
        ? 'Supabase PostgreSQL (Cloud Database & Auth)'
        : 'Basis Data Terpadu (Persisten & Siap Supabase)',
      storageType: 'Penyimpanan Berkas Terpadu (/public/uploads & Supabase Storage)',
      totalSekolah: this.data.sekolah.length,
      totalGuru: this.data.guru.length,
      totalBerita: this.data.berita.length,
      demoNotice: isSupabaseLive
        ? 'Aplikasi terhubung langsung ke basis data Supabase PostgreSQL & Supabase Auth.'
        : 'Aplikasi berjalan dengan basis data terpadu persisten. Tambahkan VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY di .env untuk menghubungkan ke Supabase Cloud.',
      configurationGuide: {
        databaseUrlGuide: 'Konfigurasi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY untuk menghubungkan project Supabase.',
        jwtSecretGuide: 'Autentikasi diamankan dengan Supabase Auth token.',
        apiUrlGuide: 'Atur variabel API_URL jika frontend di-host di domain terpisah dari backend API.'
      }
    };
  }

  // --- BACKUP & RESTORE DATA DATABASE ---
  public getBackupSummary(): {
    lastUpdated: string;
    fileSizeBytes: number;
    fileSizeKB: string;
    counts: Record<string, number>;
  } {
    let fileSizeBytes = 0;
    try {
      if (fs.existsSync(DB_FILE)) {
        const stat = fs.statSync(DB_FILE);
        fileSizeBytes = stat.size;
      }
    } catch {}

    return {
      lastUpdated: new Date().toISOString(),
      fileSizeBytes,
      fileSizeKB: (fileSizeBytes / 1024).toFixed(2) + ' KB',
      counts: {
        sekolah: this.data.sekolah ? this.data.sekolah.length : 0,
        kepalaSekolah: this.data.kepalaSekolah ? this.data.kepalaSekolah.length : 0,
        guru: this.data.guru ? this.data.guru.length : 0,
        prestasi: this.data.prestasi ? this.data.prestasi.length : 0,
        berita: this.data.berita ? this.data.berita.length : 0,
        galeri: this.data.galeri ? this.data.galeri.length : 0,
        pengumuman: this.data.pengumuman ? this.data.pengumuman.length : 0,
        visiMisi: this.data.visiMisi ? this.data.visiMisi.length : 0,
        fasilitas: this.data.fasilitas ? this.data.fasilitas.length : 0,
        keunggulan: this.data.keunggulan ? this.data.keunggulan.length : 0,
        strukturOrganisasi: this.data.strukturOrganisasi ? this.data.strukturOrganisasi.length : 0,
        kontak: this.data.kontak ? this.data.kontak.length : 0,
        bukuTamu: this.data.bukuTamu ? this.data.bukuTamu.length : 0,
        pengawas: this.data.pengawas ? this.data.pengawas.length : 0,
        pengaturanWebsite: this.data.pengaturanWebsite ? this.data.pengaturanWebsite.length : 0
      }
    };
  }

  // --- BUKU TAMU METHODS ---
  public getBukuTamu(): BukuTamuData[] {
    if (!this.data.bukuTamu || !Array.isArray(this.data.bukuTamu)) {
      this.data.bukuTamu = getDefaultBukuTamu();
      this.persist();
    }
    return [...this.data.bukuTamu].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createBukuTamu(input: {
    nama: string;
    jabatan: string;
    instansi: string;
    masukan: string;
  }): BukuTamuData {
    if (!this.data.bukuTamu) {
      this.data.bukuTamu = [];
    }
    const newItem: BukuTamuData = {
      id: `bt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nama: input.nama.trim(),
      jabatan: input.jabatan.trim(),
      instansi: input.instansi.trim(),
      masukan: input.masukan.trim(),
      createdAt: new Date().toISOString()
    };
    this.data.bukuTamu.unshift(newItem);
    this.persist();
    return newItem;
  }

  public deleteBukuTamu(id: string): boolean {
    if (!this.data.bukuTamu) return false;
    const initialLen = this.data.bukuTamu.length;
    this.data.bukuTamu = this.data.bukuTamu.filter((b) => b.id !== id);
    if (this.data.bukuTamu.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  public restoreRaw(newData: any): { success: boolean; message: string; counts: Record<string, number> } {
    if (!newData || typeof newData !== 'object') {
      throw new Error('Format data cadangan tidak valid.');
    }

    const raw = newData.database || newData.data || newData;
    if (!raw.sekolah && !raw.guru && !raw.pengawas && !raw.berita) {
      throw new Error('Struktur file cadangan tidak dikenali. Pastikan file adalah hasil backup Portal Pengawas.');
    }

    try {
      if (fs.existsSync(DB_FILE)) {
        const backupFile = path.resolve(process.cwd(), `data/store.backup-before-restore-${Date.now()}.json`);
        fs.copyFileSync(DB_FILE, backupFile);
      }
    } catch (e) {
      console.warn('Gagal membuat arsip cadangan sebelum pemulihan:', e);
    }

    const current = this.data;
    this.data = {
      admins: Array.isArray(raw.admins) && raw.admins.length > 0 ? raw.admins : current.admins,
      pengawas: Array.isArray(raw.pengawas) && raw.pengawas.length > 0 ? raw.pengawas : current.pengawas,
      pengaturanWebsite: Array.isArray(raw.pengaturanWebsite) && raw.pengaturanWebsite.length > 0 ? raw.pengaturanWebsite : current.pengaturanWebsite,
      sekolah: Array.isArray(raw.sekolah) ? raw.sekolah : current.sekolah,
      visiMisi: Array.isArray(raw.visiMisi) ? raw.visiMisi : current.visiMisi,
      strukturOrganisasi: Array.isArray(raw.strukturOrganisasi) ? raw.strukturOrganisasi : current.strukturOrganisasi,
      fasilitas: Array.isArray(raw.fasilitas) ? raw.fasilitas : current.fasilitas,
      keunggulan: Array.isArray(raw.keunggulan) ? raw.keunggulan : current.keunggulan,
      kepalaSekolah: Array.isArray(raw.kepalaSekolah) ? raw.kepalaSekolah : current.kepalaSekolah,
      guru: Array.isArray(raw.guru) ? raw.guru : current.guru,
      prestasi: Array.isArray(raw.prestasi) ? raw.prestasi : current.prestasi,
      berita: Array.isArray(raw.berita) ? raw.berita : current.berita,
      galeri: Array.isArray(raw.galeri) ? raw.galeri : current.galeri,
      pengumuman: Array.isArray(raw.pengumuman) ? raw.pengumuman : current.pengumuman,
      kontak: Array.isArray(raw.kontak) ? raw.kontak : current.kontak,
      bukuTamu: Array.isArray(raw.bukuTamu) ? raw.bukuTamu : current.bukuTamu || [],
      visitors: Array.isArray(raw.visitors) ? raw.visitors : current.visitors
    };
    this.persist();
    return {
      success: true,
      message: 'Database berhasil dipulihkan dari data backup.',
      counts: {
        sekolah: this.data.sekolah.length,
        kepalaSekolah: this.data.kepalaSekolah.length,
        guru: this.data.guru.length,
        prestasi: this.data.prestasi.length,
        berita: this.data.berita.length,
        galeri: this.data.galeri.length,
        pengumuman: this.data.pengumuman.length,
        bukuTamu: this.data.bukuTamu ? this.data.bukuTamu.length : 0
      }
    };
  }
}

export const db = new DatabaseService();
