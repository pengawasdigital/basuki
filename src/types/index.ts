export interface PengawasProfile {
  id: string;
  nama: string;
  gelar: string;
  nip: string;
  pangkatGolongan: string;
  jabatan: string;
  wilayahKerja: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  email: string;
  noHp: string;
  foto: string;
  riwayatPendidikan: string;
  pengalaman: string;
  kompetensi: string;
  tugasFungsi: string;
  peranPengawas: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WebsiteSettings {
  id: string;
  namaPortal: string;
  subjudul?: string;
  namaPengawas?: string;
  fotoPengawas?: string;
  nipPengawas?: string;
  jabatan?: string;
  jenjang?: string;
  kecamatan?: string;
  kabupaten?: string;
  provinsi?: string;
  email?: string;
  telepon?: string;
  whatsapp?: string;
  alamat?: string;
  logo: string;
  favicon?: string;
  deskripsi?: string;
  footer?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  deskripsiSingkat?: string;
  heroBgImage?: string;
  emailKontak?: string;
  teleponKontak?: string;
  alamatKantor?: string;
  wilayahKerja?: string;
  dinasPendidikan?: string;
  jamLayanan?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  mapsUrl?: string;
  petaEmbedUrl?: string;
  latitude?: number;
  longitude?: number;
  updatedAt?: string;
}

export interface School {
  id: string;
  nama: string;
  npsn: string;
  jenjang: string;
  status: string;
  alamat: string;
  desaKelurahan?: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  foto?: string;
  latitude?: number;
  longitude?: number;
  mapsUrl?: string;
  akreditasi?: string;
  kepalaSekolahNama?: string;
  jumlahGuru?: number;
  jumlahSiswa?: number;
  telepon?: string;
  email?: string;
  website?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VisiMisi {
  id?: string;
  sekolahId: string;
  visi: string;
  misi: string;
  tujuan: string;
  programUnggulan: string;
}

export interface StrukturOrganisasi {
  id: string;
  sekolahId: string;
  nama: string;
  jabatan: string;
  bagian?: string;
  foto?: string;
  urutan: number;
  keterangan?: string;
}

export interface Fasilitas {
  id: string;
  sekolahId: string;
  nama: string;
  deskripsi?: string;
  foto?: string;
  kondisi?: string;
  jumlah: number;
  unit: string;
}

export interface Keunggulan {
  id: string;
  sekolahId: string;
  judul: string;
  kategori: string;
  deskripsi: string;
  icon?: string;
}

export interface KepalaSekolah {
  id: string;
  sekolahId: string;
  nama: string;
  nip?: string;
  periode: string;
  status: string;
  foto?: string;
  keterangan?: string;
  sambutan?: string;
}

export interface Guru {
  id: string;
  sekolahId: string;
  nama: string;
  nip?: string;
  nuptk?: string;
  jabatan: string;
  mapel?: string;
  pendidikan?: string;
  statusKepegawaian?: string;
  email?: string;
  foto?: string;
  tampilkanPublik: boolean;
}

export interface Prestasi {
  id: string;
  sekolahId?: string;
  sekolahNama?: string;
  namaPrestasi: string;
  tingkat: string;
  tahun: number;
  bidang: string;
  peraih: string;
  keterangan?: string;
  foto?: string;
}

export interface Berita {
  id: string;
  sekolahId?: string;
  sekolahNama?: string;
  judul: string;
  slug: string;
  thumbnail?: string;
  ringkasan?: string;
  konten: string;
  penulis: string;
  tanggal: string;
  kategori: string;
  statusPublish: boolean;
  featured: boolean;
}

export interface Pengumuman {
  id: string;
  judul: string;
  isi: string;
  tanggal: string;
  prioritas: 'Normal' | 'Penting' | 'Mendesak';
  statusPublish: boolean;
  lampiranUrl?: string;
}

export interface Galeri {
  id: string;
  sekolahId?: string;
  sekolahNama?: string;
  judul: string;
  kategori: string;
  jenis: 'FOTO' | 'VIDEO';
  url: string;
  deskripsi?: string;
  tanggal: string;
}

export interface Kontak {
  id: string;
  nama: string;
  email: string;
  telepon?: string;
  subjek: string;
  pesan: string;
  status: string;
  createdAt: string;
}

export interface VisitorDayStat {
  date: string;
  label: string;
  visitors: number;
  pageViews: number;
}

export interface VisitorTopPage {
  path: string;
  label: string;
  views: number;
}

export interface VisitorStatsSummary {
  totalVisitors: number;
  totalPageViews: number;
  todayVisitors: number;
  todayPageViews: number;
  weekVisitors: number;
  monthVisitors: number;
  activeNow: number;
  recentDays: VisitorDayStat[];
  topPages: VisitorTopPage[];
}

export interface DashboardStats {
  totalSekolah: number;
  totalKepalaSekolah: number;
  totalGuru: number;
  totalSiswa: number;
  totalPrestasi: number;
  totalBerita: number;
  totalGaleri: number;
  totalPengumuman: number;
  totalKontakBaru: number;
  sekolahJenjang: {
    SD: number;
    TK: number;
    Lainnya: number;
  };
  guruStatus: {
    PNS: number;
    PPPK: number;
    Honorer: number;
    Lainnya: number;
  };
  recentBerita: Berita[];
  recentPrestasi: Prestasi[];
  visitors?: VisitorStatsSummary;
}

export interface AdminAuth {
  token: string;
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface BukuTamu {
  id: string;
  nama: string;
  jabatan: string;
  instansi: string;
  masukan: string;
  createdAt: string;
}
