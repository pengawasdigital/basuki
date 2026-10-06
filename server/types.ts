export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface PengawasData {
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
  createdAt: string;
  updatedAt: string;
}

export interface SekolahData {
  id: string;
  nama: string;
  npsn: string;
  jenjang: string;
  status: string;
  alamat: string;
  desaKelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  foto: string;
  latitude: number;
  longitude: number;
  mapsUrl: string;
  akreditasi?: string;
  kepalaSekolahNama: string;
  jumlahGuru: number;
  jumlahSiswa: number;
  telepon: string;
  email: string;
  website: string;
  createdAt: string;
  updatedAt: string;
}

export interface VisiMisiData {
  id: string;
  sekolahId: string;
  visi: string;
  misi: string;
  tujuan: string;
  programUnggulan: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrukturOrganisasiData {
  id: string;
  sekolahId: string;
  nama: string;
  jabatan: string;
  bagian: string;
  foto: string;
  urutan: number;
  keterangan: string;
  createdAt: string;
  updatedAt: string;
}

export interface FasilitasData {
  id: string;
  sekolahId: string;
  nama: string;
  deskripsi: string;
  foto: string;
  kondisi: string;
  jumlah: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export interface KeunggulanData {
  id: string;
  sekolahId: string;
  judul: string;
  kategori: string;
  deskripsi: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface KepalaSekolahData {
  id: string;
  sekolahId: string;
  nama: string;
  nip?: string;
  periode: string;
  status: string;
  foto: string;
  keterangan: string;
  sambutan: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuruData {
  id: string;
  sekolahId: string;
  nama: string;
  nip: string;
  nuptk: string;
  jabatan: string;
  mapel: string;
  pendidikan: string;
  statusKepegawaian: string;
  email: string;
  foto: string;
  tampilkanPublik: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PrestasiData {
  id: string;
  sekolahId?: string;
  namaPrestasi: string;
  tingkat: string;
  tahun: number;
  bidang: string;
  peraih: string;
  keterangan: string;
  foto: string;
  createdAt: string;
  updatedAt: string;
}

export interface BeritaData {
  id: string;
  sekolahId?: string;
  judul: string;
  slug: string;
  thumbnail: string;
  ringkasan: string;
  konten: string;
  penulis: string;
  tanggal: string;
  kategori: string;
  statusPublish: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PengumumanData {
  id: string;
  judul: string;
  isi: string;
  tanggal: string;
  prioritas: string;
  statusPublish: boolean;
  lampiranUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GaleriData {
  id: string;
  sekolahId?: string;
  judul: string;
  kategori: string;
  jenis: 'FOTO' | 'VIDEO';
  url: string;
  deskripsi: string;
  tanggal: string;
  createdAt: string;
  updatedAt: string;
}

export interface KontakData {
  id: string;
  nama: string;
  email: string;
  telepon: string;
  subjek: string;
  pesan: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PengaturanWebsiteData {
  id: string;
  namaPortal: string;
  subjudul: string;
  namaPengawas: string;
  fotoPengawas: string;
  nipPengawas: string;
  jabatan: string;
  jenjang: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  email: string;
  telepon: string;
  whatsapp: string;
  alamat: string;
  logo: string;
  favicon: string;
  deskripsi: string;
  footer: string;
  facebook: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  mapsUrl: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export interface VisitorRecord {
  id: string;
  visitorId: string;
  path: string;
  referrer?: string;
  userAgent?: string;
  timestamp: string;
  date: string;
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

export interface BukuTamuData {
  id: string;
  nama: string;
  jabatan: string;
  instansi: string;
  masukan: string;
  createdAt: string;
}
