import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  KeyRound,
  User,
  Database,
  Lock,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Server,
  RefreshCw,
  ExternalLink,
  Code2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AdminSecurityProps {
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const AdminSecurity: React.FC<AdminSecurityProps> = ({ onShowToast }) => {
  const { admin } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    api.getSystemStatus().then(setSystemStatus).catch(console.error);
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      onShowToast('Konfirmasi password baru tidak cocok!', 'error');
      return;
    }
    if (newPassword.length < 6) {
      onShowToast('Password baru minimal harus 6 karakter!', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      onShowToast('Password administrator berhasil diubah!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      onShowToast(err.message || 'Gagal mengubah password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyMigrationSql = () => {
    const sql = `-- =====================================================================
-- SKEMA LENGKAP SUPABASE POSTGRESQL PORTAL PENGAWAS SEKOLAH
-- =====================================================================

-- 1. Tabel Profiles (terhubung dengan auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'pengawas' CHECK (role IN ('admin', 'pengawas', 'kepala_sekolah', 'guru', 'operator')),
  nip TEXT,
  nomor_hp TEXT,
  foto TEXT,
  status TEXT DEFAULT 'aktif',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Profil Pengawas
CREATE TABLE IF NOT EXISTS public.pengawas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  gelar TEXT,
  nip TEXT,
  pangkat_golongan TEXT,
  jabatan TEXT,
  wilayah_kerja TEXT,
  kecamatan TEXT,
  kabupaten TEXT,
  provinsi TEXT,
  email TEXT,
  no_hp TEXT,
  foto TEXT,
  riwayat_pendidikan TEXT,
  pengalaman TEXT,
  kompetensi TEXT,
  tugas_fungsi TEXT,
  peran_pengawas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Sekolah Binaan
CREATE TABLE IF NOT EXISTS public.sekolah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  npsn TEXT UNIQUE NOT NULL,
  jenjang TEXT NOT NULL CHECK (jenjang IN ('TK', 'SD', 'SMP', 'SMA', 'SMK')),
  status TEXT NOT NULL CHECK (status IN ('Negeri', 'Swasta')),
  akreditasi TEXT,
  alamat TEXT,
  desa_kelurahan TEXT,
  kecamatan TEXT,
  kabupaten TEXT,
  telepon TEXT,
  email TEXT,
  website TEXT,
  kepala_sekolah_nama TEXT,
  kepala_sekolah_nip TEXT,
  jumlah_guru INTEGER DEFAULT 0,
  jumlah_siswa INTEGER DEFAULT 0,
  logo TEXT,
  foto_utama TEXT,
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Kepala Sekolah
CREATE TABLE IF NOT EXISTS public.kepala_sekolah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sekolah_id UUID REFERENCES public.sekolah(id) ON DELETE SET NULL,
  sekolah_nama TEXT,
  nama TEXT NOT NULL,
  nip TEXT,
  golongan TEXT,
  pendidikan_terakhir TEXT,
  tmt_jabatan TEXT,
  no_hp TEXT,
  email TEXT,
  foto TEXT,
  sambutan TEXT,
  periode TEXT,
  status_aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Guru
CREATE TABLE IF NOT EXISTS public.guru (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sekolah_id UUID REFERENCES public.sekolah(id) ON DELETE SET NULL,
  sekolah_nama TEXT,
  nama TEXT NOT NULL,
  nip TEXT,
  nuptk TEXT,
  jenis_kelamin TEXT,
  mata_pelajaran TEXT,
  tugas_tambahan TEXT,
  status_kepegawaian TEXT,
  pendidikan_terakhir TEXT,
  email TEXT,
  foto TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Prestasi
CREATE TABLE IF NOT EXISTS public.prestasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sekolah_id UUID REFERENCES public.sekolah(id) ON DELETE SET NULL,
  sekolah_nama TEXT,
  judul TEXT NOT NULL,
  kategori TEXT,
  tingkat TEXT NOT NULL,
  peringkat TEXT,
  tahun INTEGER,
  penyelenggara TEXT,
  nama_peraih TEXT,
  keterangan TEXT,
  foto TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabel Berita
CREATE TABLE IF NOT EXISTS public.berita (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sekolah_id UUID REFERENCES public.sekolah(id) ON DELETE SET NULL,
  sekolah_nama TEXT,
  judul TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  konten TEXT NOT NULL,
  ringkasan TEXT,
  kategori TEXT DEFAULT 'Pengawasan',
  gambar TEXT,
  penulis TEXT DEFAULT 'Pengawas Sekolah',
  dipublikasikan BOOLEAN DEFAULT true,
  tanggal_publikasi TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabel Pengumuman
CREATE TABLE IF NOT EXISTS public.pengumuman (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sekolah_id UUID REFERENCES public.sekolah(id) ON DELETE SET NULL,
  sekolah_nama TEXT,
  judul TEXT NOT NULL,
  isi TEXT NOT NULL,
  kategori TEXT DEFAULT 'Umum',
  prioritas TEXT DEFAULT 'SEDANG',
  tanggal_mulai DATE,
  tanggal_selesai DATE,
  dipublikasikan BOOLEAN DEFAULT true,
  file_lampiran TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabel Galeri
CREATE TABLE IF NOT EXISTS public.galeri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sekolah_id UUID REFERENCES public.sekolah(id) ON DELETE SET NULL,
  sekolah_nama TEXT,
  judul TEXT NOT NULL,
  deskripsi TEXT,
  jenis TEXT DEFAULT 'FOTO',
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  kategori TEXT DEFAULT 'Pendampingan',
  tanggal DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Tabel Buku Tamu
CREATE TABLE IF NOT EXISTS public.buku_tamu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  jabatan TEXT NOT NULL,
  instansi TEXT NOT NULL,
  masukan TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Tabel Pengaturan Website
CREATE TABLE IF NOT EXISTS public.pengaturan_website (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_portal TEXT DEFAULT 'Portal Pengawas Sekolah TK/SD',
  logo TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  deskripsi_singkat TEXT,
  hero_bg_image TEXT,
  email_kontak TEXT,
  telepon_kontak TEXT,
  alamat_kantor TEXT,
  wilayah_kerja TEXT,
  dinas_pendidikan TEXT,
  jam_layanan TEXT,
  facebook TEXT,
  instagram TEXT,
  youtube TEXT,
  peta_embed_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengawas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sekolah ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kepala_sekolah ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guru ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prestasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.berita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengumuman ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buku_tamu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengaturan_website ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public Read Sekolah" ON public.sekolah FOR SELECT USING (true);
CREATE POLICY "Public Read Pengawas" ON public.pengawas FOR SELECT USING (true);
CREATE POLICY "Public Read Kepala Sekolah" ON public.kepala_sekolah FOR SELECT USING (true);
CREATE POLICY "Public Read Guru" ON public.guru FOR SELECT USING (true);
CREATE POLICY "Public Read Prestasi" ON public.prestasi FOR SELECT USING (true);
CREATE POLICY "Public Read Berita" ON public.berita FOR SELECT USING (dipublikasikan = true);
CREATE POLICY "Public Read Pengumuman" ON public.pengumuman FOR SELECT USING (dipublikasikan = true);
CREATE POLICY "Public Read Galeri" ON public.galeri FOR SELECT USING (true);
CREATE POLICY "Public Read Pengaturan" ON public.pengaturan_website FOR SELECT USING (true);
CREATE POLICY "Public Read Buku Tamu" ON public.buku_tamu FOR SELECT USING (true);
CREATE POLICY "Public Insert Buku Tamu" ON public.buku_tamu FOR INSERT WITH CHECK (true);

-- Authenticated Full Access Policies
CREATE POLICY "Auth Full Access Sekolah" ON public.sekolah FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth Full Access Pengawas" ON public.pengawas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth Full Access Guru" ON public.guru FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth Full Access Kepala Sekolah" ON public.kepala_sekolah FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth Full Access Prestasi" ON public.prestasi FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth Full Access Berita" ON public.berita FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth Full Access Pengumuman" ON public.pengumuman FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth Full Access Galeri" ON public.galeri FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth Full Access Buku Tamu" ON public.buku_tamu FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth Full Access Pengaturan" ON public.pengaturan_website FOR ALL TO authenticated USING (true) WITH CHECK (true);
`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
    onShowToast('Script SQL Supabase Migration berhasil disalin ke clipboard!', 'success');
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
          Manajemen Keamanan & Akun Administrator
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola kredensial akun masuk admin, status integrasi Supabase PostgreSQL, dan skema tabel database.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Akun & Ganti Password */}
        <div className="lg:col-span-1 space-y-6">
          {/* Akun Aktif */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              Sesi Administrator Aktif
            </h2>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 block">Nama Lengkap</span>
                <span className="font-semibold text-slate-800">{admin?.name || 'Administrator Portal'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 block">Email Login</span>
                <span className="font-mono text-xs font-semibold text-slate-800">{admin?.email || 'admin@pengawassekolah.id'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 block">Hak Akses / Role</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 mt-1">
                  {admin?.role || 'SUPERADMIN'}
                </span>
              </div>
            </div>
          </div>

          {/* Form Ganti Password */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <KeyRound className="w-5 h-5 text-amber-600" />
              Ganti Password Admin
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Password Saat Ini
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Perbarui Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Database & Supabase Integration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                Status Integrasi Supabase & PostgreSQL
              </h2>
              <span
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isConfigured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                <span>{isConfigured ? 'Supabase Client Terhubung' : 'Siap Terhubung ke Supabase'}</span>
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1">Backend Database Engine</span>
                <span className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                  <Server className="w-4 h-4 text-slate-600" />
                  {systemStatus?.database || 'Persistent JSON Data Store (Supabase Ready)'}
                </span>
                <p className="text-xs text-slate-500 mt-2">
                  Arsitektur hybrid: data tersimpan persisten lokal dan secara instan tersinkronisasi ke PostgreSQL Supabase saat kredensial ditambahkan di environment.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1">Environment Variables</span>
                <div className="space-y-1 mt-1 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">VITE_SUPABASE_URL</span>
                    <span className={import.meta.env.VITE_SUPABASE_URL ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                      {import.meta.env.VITE_SUPABASE_URL ? 'Terisi' : 'Belum diisi'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">VITE_SUPABASE_ANON_KEY</span>
                    <span className={import.meta.env.VITE_SUPABASE_ANON_KEY ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                      {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Terisi' : 'Belum diisi'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SQL Migration Panel */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-indigo-600" />
                    Skema SQL Migrasi Supabase (DDL & RLS)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Jalankan script ini di menu <strong>SQL Editor</strong> di dashboard Supabase Anda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyMigrationSql}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors border border-indigo-200 cursor-pointer"
                >
                  {copiedSql ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Berhasil Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin SQL Lengkap</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950 text-slate-200 p-4 rounded-xl text-xs font-mono max-h-72 overflow-y-auto border border-slate-800">
                <pre>{`-- SKEMA LENGKAP SUPABASE POSTGRESQL PORTAL PENGAWAS SEKOLAH
-- 1. Profiles (Auth linked)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'pengawas',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profil Pengawas
CREATE TABLE IF NOT EXISTS public.pengawas (...);

-- 3. Sekolah Binaan
CREATE TABLE IF NOT EXISTS public.sekolah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  npsn TEXT UNIQUE NOT NULL,
  jenjang TEXT NOT NULL,
  ...
);

-- 4. Kepala Sekolah, 5. Guru, 6. Prestasi, 7. Berita,
-- 8. Pengumuman, 9. Galeri, 10. Buku Tamu, 11. Pengaturan Website
-- (Klik tombol Salin SQL Lengkap di atas untuk seluruh 11 tabel)`}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
