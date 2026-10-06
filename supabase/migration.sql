-- ==============================================================================
-- SKEMA BASIS DATA SUPABASE POSTGRESQL LENGKAP
-- PORTAL PENGAWAS SEKOLAH TK / SD
-- ==============================================================================
-- Jalankan skrip ini langsung pada menu: Supabase Dashboard -> SQL Editor -> New Query
-- ==============================================================================

-- 1. Ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- FUNGSI & TRIGGER OTOMATIS: UPDATE updated_at
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 1. TABEL PROFILES (Terhubung dengan Supabase Auth: auth.users)
-- ==============================================================================
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

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 2. TABEL PENGAWAS (Profil Lengkap Pengawas Pembina)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pengawas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  gelar TEXT,
  nip TEXT UNIQUE,
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

DROP TRIGGER IF EXISTS set_updated_at_pengawas ON public.pengawas;
CREATE TRIGGER set_updated_at_pengawas
BEFORE UPDATE ON public.pengawas
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 3. TABEL SEKOLAH (Satuan Pendidikan Binaan)
-- ==============================================================================
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

CREATE INDEX IF NOT EXISTS idx_sekolah_npsn ON public.sekolah(npsn);
CREATE INDEX IF NOT EXISTS idx_sekolah_jenjang ON public.sekolah(jenjang);
CREATE INDEX IF NOT EXISTS idx_sekolah_status ON public.sekolah(status);

DROP TRIGGER IF EXISTS set_updated_at_sekolah ON public.sekolah;
CREATE TRIGGER set_updated_at_sekolah
BEFORE UPDATE ON public.sekolah
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 4. TABEL VISI & MISI SEKOLAH
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.visi_misi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sekolah_id UUID REFERENCES public.sekolah(id) ON DELETE CASCADE,
  visi TEXT,
  misi TEXT,
  tujuan TEXT,
  program_unggulan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_visi_misi_sekolah UNIQUE (sekolah_id)
);

DROP TRIGGER IF EXISTS set_updated_at_visi_misi ON public.visi_misi;
CREATE TRIGGER set_updated_at_visi_misi
BEFORE UPDATE ON public.visi_misi
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 5. TABEL STRUKTUR ORGANISASI
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.struktur_organisasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sekolah_id UUID REFERENCES public.sekolah(id) ON DELETE CASCADE,
  jabatan TEXT NOT NULL,
  nama TEXT NOT NULL,
  nip TEXT,
  foto TEXT,
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_struktur_sekolah ON public.struktur_organisasi(sekolah_id);

DROP TRIGGER IF EXISTS set_updated_at_struktur ON public.struktur_organisasi;
CREATE TRIGGER set_updated_at_struktur
BEFORE UPDATE ON public.struktur_organisasi
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 6. TABEL FASILITAS SEKOLAH
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.fasilitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sekolah_id UUID REFERENCES public.sekolah(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  jumlah INTEGER DEFAULT 1,
  kondisi TEXT DEFAULT 'Baik',
  keterangan TEXT,
  foto TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fasilitas_sekolah ON public.fasilitas(sekolah_id);

DROP TRIGGER IF EXISTS set_updated_at_fasilitas ON public.fasilitas;
CREATE TRIGGER set_updated_at_fasilitas
BEFORE UPDATE ON public.fasilitas
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 7. TABEL KEUNGGULAN SEKOLAH
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.keunggulan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sekolah_id UUID REFERENCES public.sekolah(id) ON DELETE CASCADE,
  judul TEXT NOT NULL,
  deskripsi TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_keunggulan_sekolah ON public.keunggulan(sekolah_id);

DROP TRIGGER IF EXISTS set_updated_at_keunggulan ON public.keunggulan;
CREATE TRIGGER set_updated_at_keunggulan
BEFORE UPDATE ON public.keunggulan
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 8. TABEL KEPALA SEKOLAH
-- ==============================================================================
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

CREATE INDEX IF NOT EXISTS idx_kepala_sekolah_sekolah ON public.kepala_sekolah(sekolah_id);
CREATE INDEX IF NOT EXISTS idx_kepala_sekolah_nip ON public.kepala_sekolah(nip);

DROP TRIGGER IF EXISTS set_updated_at_kepala_sekolah ON public.kepala_sekolah;
CREATE TRIGGER set_updated_at_kepala_sekolah
BEFORE UPDATE ON public.kepala_sekolah
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 9. TABEL GURU
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.guru (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sekolah_id UUID REFERENCES public.sekolah(id) ON DELETE SET NULL,
  sekolah_nama TEXT,
  nama TEXT NOT NULL,
  nip TEXT,
  nuptk TEXT,
  jenis_kelamin TEXT CHECK (jenis_kelamin IN ('L', 'P', 'Laki-laki', 'Perempuan')),
  mata_pelajaran TEXT,
  tugas_tambahan TEXT,
  status_kepegawaian TEXT,
  pendidikan_terakhir TEXT,
  email TEXT,
  foto TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guru_sekolah ON public.guru(sekolah_id);
CREATE INDEX IF NOT EXISTS idx_guru_nip ON public.guru(nip);
CREATE INDEX IF NOT EXISTS idx_guru_nuptk ON public.guru(nuptk);

DROP TRIGGER IF EXISTS set_updated_at_guru ON public.guru;
CREATE TRIGGER set_updated_at_guru
BEFORE UPDATE ON public.guru
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 10. TABEL PRESTASI
-- ==============================================================================
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

CREATE INDEX IF NOT EXISTS idx_prestasi_sekolah ON public.prestasi(sekolah_id);
CREATE INDEX IF NOT EXISTS idx_prestasi_tingkat ON public.prestasi(tingkat);
CREATE INDEX IF NOT EXISTS idx_prestasi_tahun ON public.prestasi(tahun);

DROP TRIGGER IF EXISTS set_updated_at_prestasi ON public.prestasi;
CREATE TRIGGER set_updated_at_prestasi
BEFORE UPDATE ON public.prestasi
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 11. TABEL BERITA / ARTIKEL
-- ==============================================================================
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

CREATE INDEX IF NOT EXISTS idx_berita_slug ON public.berita(slug);
CREATE INDEX IF NOT EXISTS idx_berita_dipublikasikan ON public.berita(dipublikasikan);
CREATE INDEX IF NOT EXISTS idx_berita_tanggal ON public.berita(tanggal_publikasi DESC);

DROP TRIGGER IF EXISTS set_updated_at_berita ON public.berita;
CREATE TRIGGER set_updated_at_berita
BEFORE UPDATE ON public.berita
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 12. TABEL PENGUMUMAN
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pengumuman (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sekolah_id UUID REFERENCES public.sekolah(id) ON DELETE SET NULL,
  sekolah_nama TEXT,
  judul TEXT NOT NULL,
  isi TEXT NOT NULL,
  kategori TEXT DEFAULT 'Umum',
  prioritas TEXT DEFAULT 'SEDANG' CHECK (prioritas IN ('RENDAH', 'SEDANG', 'TINGGI')),
  tanggal_mulai DATE,
  tanggal_selesai DATE,
  dipublikasikan BOOLEAN DEFAULT true,
  file_lampiran TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pengumuman_dipublikasikan ON public.pengumuman(dipublikasikan);

DROP TRIGGER IF EXISTS set_updated_at_pengumuman ON public.pengumuman;
CREATE TRIGGER set_updated_at_pengumuman
BEFORE UPDATE ON public.pengumuman
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 13. TABEL GALERI
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.galeri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sekolah_id UUID REFERENCES public.sekolah(id) ON DELETE SET NULL,
  sekolah_nama TEXT,
  judul TEXT NOT NULL,
  deskripsi TEXT,
  jenis TEXT DEFAULT 'FOTO' CHECK (jenis IN ('FOTO', 'VIDEO')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  kategori TEXT DEFAULT 'Pendampingan',
  tanggal DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_galeri_jenis ON public.galeri(jenis);

DROP TRIGGER IF EXISTS set_updated_at_galeri ON public.galeri;
CREATE TRIGGER set_updated_at_galeri
BEFORE UPDATE ON public.galeri
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 14. TABEL KONTAK / KONSULTASI
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.kontak (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  email TEXT NOT NULL,
  telepon TEXT,
  subjek TEXT,
  pesan TEXT NOT NULL,
  status TEXT DEFAULT 'BARU' CHECK (status IN ('BARU', 'DIBACA', 'DIBALAS')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_updated_at_kontak ON public.kontak;
CREATE TRIGGER set_updated_at_kontak
BEFORE UPDATE ON public.kontak
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 15. TABEL BUKU TAMU DIGITAL
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.buku_tamu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  jabatan TEXT NOT NULL,
  instansi TEXT NOT NULL,
  masukan TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buku_tamu_created ON public.buku_tamu(created_at DESC);

DROP TRIGGER IF EXISTS set_updated_at_buku_tamu ON public.buku_tamu;
CREATE TRIGGER set_updated_at_buku_tamu
BEFORE UPDATE ON public.buku_tamu
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 16. TABEL PENGATURAN WEBSITE
-- ==============================================================================
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

DROP TRIGGER IF EXISTS set_updated_at_pengaturan ON public.pengaturan_website;
CREATE TRIGGER set_updated_at_pengaturan
BEFORE UPDATE ON public.pengaturan_website
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 17. TABEL PENGUNJUNG (Visitor Analytics)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  path TEXT NOT NULL,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON public.visitors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_visitor_id ON public.visitors(visitor_id);

-- ==============================================================================
-- AKTIFKAN ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengawas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sekolah ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visi_misi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.struktur_organisasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fasilitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keunggulan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kepala_sekolah ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guru ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prestasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.berita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengumuman ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kontak ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buku_tamu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengaturan_website ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- RLS POLICIES: PUBLIC ACCESS (SELECT / INSERT SPESIFIK)
-- ==============================================================================
CREATE POLICY "Public Read Pengawas" ON public.pengawas FOR SELECT USING (true);
CREATE POLICY "Public Read Sekolah" ON public.sekolah FOR SELECT USING (true);
CREATE POLICY "Public Read Visi Misi" ON public.visi_misi FOR SELECT USING (true);
CREATE POLICY "Public Read Struktur" ON public.struktur_organisasi FOR SELECT USING (true);
CREATE POLICY "Public Read Fasilitas" ON public.fasilitas FOR SELECT USING (true);
CREATE POLICY "Public Read Keunggulan" ON public.keunggulan FOR SELECT USING (true);
CREATE POLICY "Public Read Kepala Sekolah" ON public.kepala_sekolah FOR SELECT USING (true);
CREATE POLICY "Public Read Guru" ON public.guru FOR SELECT USING (true);
CREATE POLICY "Public Read Prestasi" ON public.prestasi FOR SELECT USING (true);
CREATE POLICY "Public Read Berita Dipublikasi" ON public.berita FOR SELECT USING (dipublikasikan = true);
CREATE POLICY "Public Read Pengumuman Dipublikasi" ON public.pengumuman FOR SELECT USING (dipublikasikan = true);
CREATE POLICY "Public Read Galeri" ON public.galeri FOR SELECT USING (true);
CREATE POLICY "Public Read Pengaturan" ON public.pengaturan_website FOR SELECT USING (true);
CREATE POLICY "Public Read Buku Tamu" ON public.buku_tamu FOR SELECT USING (true);
CREATE POLICY "Public Insert Buku Tamu" ON public.buku_tamu FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Kontak" ON public.kontak FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Visitor" ON public.visitors FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- RLS POLICIES: AUTHENTICATED ADMIN FULL ACCESS
-- ==============================================================================
CREATE POLICY "Admin Full Access Pengawas" ON public.pengawas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Sekolah" ON public.sekolah FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Visi Misi" ON public.visi_misi FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Struktur" ON public.struktur_organisasi FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Fasilitas" ON public.fasilitas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Keunggulan" ON public.keunggulan FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Kepala Sekolah" ON public.kepala_sekolah FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Guru" ON public.guru FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Prestasi" ON public.prestasi FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Berita" ON public.berita FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Pengumuman" ON public.pengumuman FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Galeri" ON public.galeri FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Kontak" ON public.kontak FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Buku Tamu" ON public.buku_tamu FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Pengaturan" ON public.pengaturan_website FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Visitors" ON public.visitors FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- SEED DATA AWAL: PENGATURAN & PROFIL PENGAWAS
-- ==============================================================================
INSERT INTO public.pengaturan_website (
  nama_portal,
  logo,
  hero_title,
  hero_subtitle,
  deskripsi_singkat,
  email_kontak,
  telepon_kontak,
  alamat_kantor,
  wilayah_kerja,
  dinas_pendidikan,
  jam_layanan
) VALUES (
  'Portal Pengawas Sekolah TK/SD',
  '/logo-kampar.png',
  'Pendampingan Berkelanjutan Menuju Transformasi Pendidikan Bermutu',
  'Mendorong tata kelola sekolah yang akuntabel, profesionalisme pendidik yang adaptif, dan ekosistem pembelajaran berpusat pada peserta didik.',
  'Portal resmi Pengawas Sekolah TK/SD untuk publikasi program kepengawasan, pendampingan sekolah binaan, direktori pendidik, dan pemantauan mutu pendidikan.',
  'pengawas@disdikpora.id',
  '(0762) 123456',
  'Kompleks Perkantoran Pemerintah Daerah',
  'Wilayah Pembinaan TK & SD',
  'Dinas Pendidikan Kepemudaan dan Olahraga',
  'Senin - Jumat: 08:00 - 16:00 WIB'
) ON CONFLICT DO NOTHING;

INSERT INTO public.pengawas (
  nama,
  gelar,
  nip,
  pangkat_golongan,
  jabatan,
  wilayah_kerja,
  kecamatan,
  kabupaten,
  provinsi,
  email,
  no_hp,
  foto
) VALUES (
  'Basuki',
  'S.Kom.',
  '19790719 201406 1 003',
  'Pembina / IV/a',
  'Pengawas Sekolah Ahli Madya',
  'Wilayah Binaan Gugus TK/SD',
  'Kecamatan Binaan',
  'Kabupaten Kampar',
  'Riau',
  'basuki.pengawas@gmail.com',
  '081234567890',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800'
) ON CONFLICT DO NOTHING;
