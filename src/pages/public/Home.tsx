import React, { useState, useEffect } from 'react';
import {
  School,
  User,
  Users,
  Trophy,
  ArrowRight,
  BookOpen,
  Calendar,
  Sparkles,
  ChevronRight,
  MapPin,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { api } from '../../services/api';
import { School as SchoolType, Berita, Prestasi, Galeri, Pengumuman } from '../../types';

interface HomeProps {
  onNavigate: (path: string) => void;
  onOpenLightbox: (item: Galeri) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, onOpenLightbox }) => {
  const { settings, pengawas } = useSettings();
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [news, setNews] = useState<Berita[]>([]);
  const [achievements, setAchievements] = useState<Prestasi[]>([]);
  const [gallery, setGallery] = useState<Galeri[]>([]);
  const [announcements, setAnnouncements] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schRes, newsRes, presRes, galRes, annRes] = await Promise.all([
          api.getSchools(),
          api.getNews({ publishOnly: true }),
          api.getAchievements(),
          api.getGallery(),
          api.getAnnouncements(true)
        ]);
        setSchools(Array.isArray(schRes) ? schRes : []);
        setNews(Array.isArray(newsRes) ? newsRes.slice(0, 3) : []);
        setAchievements(Array.isArray(presRes) ? presRes.slice(0, 4) : []);
        setGallery(Array.isArray(galRes) ? galRes.slice(0, 6) : []);
        setAnnouncements(Array.isArray(annRes) ? annRes.slice(0, 2) : []);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalTeachers = (Array.isArray(schools) ? schools : []).reduce((acc, s) => acc + (s.jumlahGuru || 0), 0);
  const totalStudents = (Array.isArray(schools) ? schools : []).reduce((acc, s) => acc + (s.jumlahSiswa || 0), 0);

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white pt-12 pb-20 lg:pt-20 lg:pb-32">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-blue-900/60 border border-blue-700/60 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-200 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Portal Resmi Mutu Satuan Pendidikan TK / SD</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {settings?.namaPortal || 'PORTAL PENGAWAS SEKOLAH'}
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
                {settings?.subjudul ||
                  'Pendampingan, Pengawasan dan Pengembangan Mutu Satuan Pendidikan'}
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onNavigate('/sekolah')}
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <School className="w-4 h-4 text-amber-300" />
                  <span>Lihat Sekolah Binaan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('/profil-pengawas')}
                  className="inline-flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-semibold text-sm px-6 py-3.5 rounded-xl transition-all cursor-pointer"
                >
                  <User className="w-4 h-4 text-blue-400" />
                  <span>Profil Pengawas</span>
                </button>
              </div>

              {/* Quick tags */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Fokus Program:</span>
                <span className="bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">Supervisi Akademik</span>
                <span className="bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">Kurikulum Merdeka</span>
                <span className="bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">Literasi & Numerasi</span>
                <span className="bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">Kombel Guru</span>
              </div>
            </div>

            {/* Right Hero Card: Pengawas Highlight Card */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-b from-slate-800/90 to-slate-900/95 border border-slate-700/80 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <img
                    src={
                      pengawas?.foto ||
                      settings?.fotoPengawas ||
                      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'
                    }
                    alt={pengawas?.nama || 'Foto Pengawas'}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-amber-400/50 shadow-md shrink-0"
                  />
                  <div className="text-center sm:text-left">
                    <span className="inline-block text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-950/60 border border-amber-800/60 px-3 py-1 rounded-full mb-1.5">
                      Pengawas Pembina
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                      {pengawas?.nama || settings?.namaPengawas || 'Basuki, S.Kom.'}
                    </h3>
                    <p className="text-sm text-blue-300 mt-1 font-semibold">
                      NIP. {pengawas?.nip || settings?.nipPengawas || '19790719 201406 1 003'}
                    </p>
                    <p className="text-sm text-slate-300 mt-1">
                      {pengawas?.jabatan || 'Pengawas Sekolah Ahli Muda'} • {pengawas?.pangkatGolongan || 'III/c'}
                    </p>
                    <div className="mt-3">
                      <span className="text-xs sm:text-sm bg-blue-900/60 text-blue-100 border border-blue-700/60 px-3 py-1.5 rounded-lg block font-medium">
                        Wilayah: {pengawas?.wilayahKerja || settings?.kecamatan || 'Kecamatan Perhentian Raja'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-700/80 text-sm sm:text-base text-slate-200 italic leading-relaxed font-medium">
                  &ldquo;Mendampingi sekolah bukan sekadar memeriksa kelengkapan administratif, melainkan menyalakan lentera perubahan dan menumbuhkan ekosistem belajar yang berdampak bagi masa depan murid.&rdquo;
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Statistical Metrics Bar */}
      <section className="-mt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
            <div className="flex items-center space-x-4 pt-2 lg:pt-0 lg:px-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <School className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {schools.length}
                </div>
                <div className="text-sm font-semibold text-slate-800">Sekolah Binaan</div>
              </div>
            </div>

            <div
              onClick={() => onNavigate('/kepala-sekolah')}
              className="flex items-center space-x-4 pt-2 lg:pt-0 lg:px-4 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-all group"
              title="Klik untuk melihat data seluruh kepala sekolah"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {schools.filter((s) => s.kepalaSekolahNama).length || schools.length}
                </div>
                <div className="text-sm font-semibold text-slate-800">Kepala Sekolah</div>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-2 lg:pt-0 lg:px-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {totalTeachers > 0 ? totalTeachers : '38+'}
                </div>
                <div className="text-sm font-semibold text-slate-800">Dewan Guru</div>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-2 lg:pt-0 lg:px-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <School className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {totalStudents > 0 ? totalStudents : '630+'}
                </div>
                <div className="text-sm font-semibold text-slate-800">Peserta Didik</div>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-2 lg:pt-0 lg:px-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {achievements.length > 0 ? achievements.length : '12+'}
                </div>
                <div className="text-sm font-semibold text-slate-800">Prestasi Tercatat</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Pengumuman / Agenda Penting Banner */}
      {announcements.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="inline-block text-[11px] font-bold text-amber-800 uppercase tracking-wider bg-amber-200/80 px-2 py-0.5 rounded mr-2">
                  Pengumuman: {announcements[0].prioritas}
                </span>
                <span className="font-semibold text-slate-900 text-sm">
                  {announcements[0].judul}
                </span>
                <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                  {announcements[0].isi}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('/berita')}
              className="text-xs font-bold text-amber-800 hover:text-amber-900 hover:underline shrink-0 flex items-center space-x-1 cursor-pointer"
            >
              <span>Selengkapnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* 4. Sambutan Pengawas Pembina */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-3xl text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400 block">
                Sambutan Resmi Pengawas Sekolah
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                Membangun Transformasi Satuan Pendidikan dengan Kolaborasi dan Pembiasaan Bermakna
              </h2>
              <div className="text-slate-200 text-base sm:text-lg leading-relaxed space-y-3 font-normal">
                <p>
                  Assalamu alaikum Warahmatullahi Wabarakatuh, Salam Sejahtera untuk kita semua.
                </p>
                <p>
                  Puji syukur kita panjatkan ke hadirat Allah SWT, Tuhan Yang Maha Esa. Melalui kehadiran Portal Pengawas Sekolah ini, kami berupaya menyediakan sarana komunikasi, dokumentasi pendampingan, serta etalase capaian mutu pendidikan bagi seluruh satuan pendidikan binaan jenjang TK dan SD.
                </p>
                <p>
                  Peran pengawas sekolah di era Kurikulum Merdeka bergeser dari pengawas formalistis menjadi mitra pendamping yang siap mendengarkan, merefleksikan rapor pendidikan, serta menguatkan kepemimpinan kepala sekolah dan inovasi para guru.
                </p>
              </div>
              <div className="pt-2 flex items-center space-x-4">
                <button
                  onClick={() => onNavigate('/profil-pengawas')}
                  className="inline-flex items-center space-x-1.5 text-sm font-bold text-amber-300 hover:text-white underline cursor-pointer"
                >
                  <span>Baca Selengkapnya Profil & Peran Pengawas</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
              <img
                src={
                  pengawas?.foto ||
                  settings?.fotoPengawas ||
                  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'
                }
                alt="Pengawas"
                className="w-28 h-28 rounded-full object-cover border-4 border-amber-400 mb-3 shadow-lg"
              />
              <span className="font-bold text-white text-lg">
                {pengawas?.nama || settings?.namaPengawas || 'Basuki, S.Kom.'}
              </span>
              <span className="text-sm text-amber-300 mt-0.5 font-medium">
                {pengawas?.jabatan || 'Pengawas Sekolah Ahli Muda'}
              </span>
              <span className="text-xs text-slate-300 mt-1">
                Kecamatan {pengawas?.kecamatan || settings?.kecamatan || 'Perhentian Raja'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Sekolah Binaan Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
              Satuan Pendidikan
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Sekolah Binaan
            </h2>
            <p className="text-base text-slate-600 mt-1">
              Satuan pendidikan formal jenjang TK dan SD dalam wilayah pendampingan kerja.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/sekolah')}
            className="inline-flex items-center space-x-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900 group cursor-pointer"
          >
            <span>Lihat Semua Sekolah ({schools.length})</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.slice(0, 6).map((sch) => (
            <div
              key={sch.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col group"
            >
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={
                    sch.foto ||
                    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=800'
                  }
                  alt={sch.nama}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 flex space-x-1.5">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-700 text-white shadow-xs">
                    {sch.jenjang}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-900/80 text-white backdrop-blur-xs">
                    {sch.status}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 block">
                    NPSN: {sch.npsn}
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-blue-700 transition-colors">
                    {sch.nama}
                  </h3>
                  <p className="text-sm text-slate-600 flex items-start gap-1 line-clamp-2">
                    <MapPin className="w-4 h-4 shrink-0 text-slate-500 mt-0.5" />
                    <span>{sch.alamat}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-700">
                  <div>
                    <span className="text-slate-500 block text-xs">Kepala Sekolah</span>
                    <span className="font-semibold text-slate-900 line-clamp-1">
                      {sch.kepalaSekolahNama || '-'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-xs">Guru / Siswa</span>
                    <span className="font-semibold text-slate-900">
                      {sch.jumlahGuru || 0} / {sch.jumlahSiswa || 0}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate(`/sekolah/${sch.id}`)}
                    className="w-full inline-flex items-center justify-center space-x-1.5 text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <span>Buka Profil Lengkap</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Berita & Informasi Mutu Terbaru */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">
              Publikasi & Literasi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Berita & Pengawasan Terbaru
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Catatan kegiatan supervisi, lokakarya, dan refleksi mutu pembelajaran terkini.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/berita')}
            className="inline-flex items-center space-x-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-900 group cursor-pointer"
          >
            <span>Semua Berita</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group cursor-pointer"
              onClick={() => onNavigate(`/berita/${item.slug}`)}
            >
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={
                    item.thumbnail ||
                    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800'
                  }
                  alt={item.judul}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-700 text-white shadow-xs">
                  {item.kategori}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>
                      {new Date(item.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {item.judul}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 line-clamp-2 leading-relaxed">
                    {item.ringkasan || item.konten}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-sm font-semibold text-emerald-700 group-hover:text-emerald-800">
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 7. Prestasi Sekolah Binaan */}
      <section className="bg-slate-100/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block">
                Apresiasi & Dedikasi
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Prestasi Satuan Pendidikan
              </h2>
              <p className="text-base text-slate-600 mt-1">
                Catatan kejuaraan akademik, literasi, seni, olahraga, dan kepemimpinan sekolah binaan.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/prestasi')}
              className="inline-flex items-center space-x-1.5 text-sm font-semibold text-amber-800 hover:text-amber-900 group cursor-pointer"
            >
              <span>Lihat Semua Prestasi</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Trophy className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Tingkat {item.tingkat}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-amber-700 block">
                      Tahun {item.tahun} • {item.bidang}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base mt-1 leading-snug line-clamp-2">
                      {item.namaPrestasi}
                    </h4>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    Peraih: <span className="font-semibold text-slate-900">{item.peraih}</span>
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
                  {item.sekolahNama || 'Satuan Pendidikan Binaan'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Galeri Dokumentasi Kegiatan */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 block">
              Dokumentasi Pendampingan
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Galeri Media & Kegiatan
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Rekam jejak visual pendampingan, supervisi, workshop, dan aktivitas belajar siswa.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/galeri')}
            className="inline-flex items-center space-x-1.5 text-sm font-semibold text-purple-700 hover:text-purple-900 group cursor-pointer"
          >
            <span>Semua Dokumentasi</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {gallery.map((g) => (
            <div
              key={g.id}
              onClick={() => onOpenLightbox(g)}
              className="group relative h-40 rounded-xl overflow-hidden cursor-pointer shadow-xs border border-slate-200"
            >
              <img
                src={g.url}
                alt={g.judul}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end">
                <span className="text-[10px] uppercase font-bold text-amber-300">{g.kategori}</span>
                <span className="text-white text-xs font-semibold line-clamp-1">{g.judul}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Hubungi Pengawas Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold">
              Memerlukan Informasi atau Konsultasi Pendampingan Sekolah?
            </h3>
            <p className="text-sm text-slate-400 max-w-xl">
              Hubungi pengawas sekolah pembina secara langsung via WhatsApp atau kirim pesan resmi melalui formulir kontak.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href={`https://wa.me/${settings?.whatsapp || '085761120929'}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Pengawas</span>
            </a>
            <button
              onClick={() => onNavigate('/kontak')}
              className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm px-5 py-3 rounded-xl transition-all cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Kirim Pesan Portal</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
