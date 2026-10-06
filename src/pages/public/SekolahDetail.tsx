import React, { useState, useEffect } from 'react';
import {
  School,
  MapPin,
  Phone,
  Mail,
  Globe,
  Printer,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Award,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { Galeri } from '../../types';
import { useSettings } from '../../context/SettingsContext';

interface SekolahDetailProps {
  schoolId: string;
  onNavigate: (path: string) => void;
  onOpenLightbox: (item: Galeri) => void;
}

export const SekolahDetail: React.FC<SekolahDetailProps> = ({
  schoolId,
  onNavigate,
  onOpenLightbox
}) => {
  const { settings, pengawas } = useSettings();
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    | 'profil'
    | 'visimisi'
    | 'sambutan'
    | 'struktur'
    | 'fasilitas'
    | 'keunggulan'
    | 'kepalaSekolah'
    | 'guru'
    | 'prestasi'
    | 'galeri'
    | 'berita'
    | 'lokasi'
  >('profil');

  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherStatus, setTeacherStatus] = useState('SEMUA');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await api.getSchoolById(schoolId);
        setSchool(data);
      } catch (err) {
        console.error('Failed to load school detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [schoolId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium">Memuat profil lengkap satuan pendidikan...</p>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Sekolah Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500 mt-1">
          Data sekolah yang Anda cari tidak ada atau telah dihapus.
        </p>
        <button
          onClick={() => onNavigate('/sekolah')}
          className="mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Kembali ke Daftar Sekolah
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const visiMisi = school.visiMisi;
  const kepalaSekolahAktif = school.kepalaSekolah?.find((ks: any) => ks.status === 'Aktif') || school.kepalaSekolah?.[0];

  const publicTeachers = (school.guru || []).filter((g: any) => g.tampilkanPublik !== false);
  const filteredTeachers = publicTeachers.filter((g: any) => {
    const matchesSearch =
      g.nama.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      g.jabatan.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      (g.mapel && g.mapel.toLowerCase().includes(teacherSearch.toLowerCase())) ||
      (g.nip && g.nip.includes(teacherSearch));
    const matchesStatus =
      teacherStatus === 'SEMUA' || g.statusKepegawaian?.toUpperCase() === teacherStatus.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const tabs = [
    { id: 'profil', label: 'Profil Sekolah' },
    { id: 'visimisi', label: 'Visi & Misi' },
    { id: 'sambutan', label: 'Sambutan Kepala Sekolah' },
    { id: 'struktur', label: 'Struktur Organisasi' },
    { id: 'fasilitas', label: 'Fasilitas' },
    { id: 'keunggulan', label: 'Keunggulan' },
    { id: 'kepalaSekolah', label: 'Daftar Kepala Sekolah' },
    { id: 'guru', label: `Data Guru (${publicTeachers.length})` },
    { id: 'prestasi', label: `Prestasi (${school.prestasi?.length || 0})` },
    { id: 'galeri', label: `Galeri (${school.galeri?.length || 0})` },
    { id: 'berita', label: `Berita (${school.berita?.length || 0})` },
    { id: 'lokasi', label: 'Lokasi & Maps' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Breadcrumb & Print */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 no-print">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <button onClick={() => onNavigate('/')} className="hover:text-blue-600 cursor-pointer">
            Beranda
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button onClick={() => onNavigate('/sekolah')} className="hover:text-blue-600 cursor-pointer">
            Sekolah Binaan
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800 line-clamp-1">{school.nama}</span>
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center space-x-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Dokumen Profil</span>
        </button>
      </div>

      {/* School Header Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        <div className="relative h-48 sm:h-64 bg-slate-900">
          <img
            src={
              school.foto ||
              'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1200'
            }
            alt={school.nama}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          <div className="absolute bottom-5 left-5 right-5 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 text-white">
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-600 text-white">
                  {school.jenjang}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-white">
                  Status: {school.status}
                </span>
                <span className="text-xs text-slate-300">NPSN: {school.npsn}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {school.nama}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  {school.alamat}, Kec. {school.kecamatan}, Kab. {school.kabupaten}, {school.provinsi}
                </span>
              </p>
            </div>
            {school.mapsUrl && (
              <a
                href={school.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="no-print inline-flex items-center space-x-1.5 bg-white/20 hover:bg-white/30 text-white backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-300" />
                <span>Buka Google Maps</span>
              </a>
            )}
          </div>
        </div>

        {/* Quick info row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/70 p-4 text-xs">
          <div className="p-2 sm:px-4">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Kepala Sekolah
            </span>
            <span className="font-bold text-slate-800 text-sm line-clamp-1">
              {school.kepalaSekolahNama || '-'}
            </span>
          </div>
          <div className="p-2 sm:px-4">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Total Dewan Guru
            </span>
            <span className="font-bold text-slate-800 text-sm">
              {school.jumlahGuru || 0} Pendidik & Tenaga Kependidikan
            </span>
          </div>
          <div className="p-2 sm:px-4">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Jumlah Murid
            </span>
            <span className="font-bold text-slate-800 text-sm">
              {school.jumlahSiswa || 0} Peserta Didik
            </span>
          </div>
          <div className="p-2 sm:px-4">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Pengawas Pembina
            </span>
            <span className="font-bold text-blue-700 text-sm">
              {pengawas?.nama
                ? (pengawas.gelar ? `${pengawas.nama}, ${pengawas.gelar}` : pengawas.nama)
                : (settings?.namaPengawas || 'Pengawas Pembina')}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="no-print flex overflow-x-auto gap-1 border-b border-slate-200 pb-2 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT SECTIONS */}
      {activeTab === 'profil' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                <School className="w-5 h-5 text-blue-600" />
                <span>Identitas Lengkap Satuan Pendidikan</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-xs">Nama Resmi Satuan</span>
                  <span className="font-bold text-slate-900 text-base">{school.nama}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-xs">Nomor Pokok Sekolah Nasional (NPSN)</span>
                  <span className="font-bold text-slate-900 text-base">{school.npsn}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-xs">Bentuk Pendidikan / Jenjang</span>
                  <span className="font-bold text-slate-900 text-base">{school.jenjang}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-xs">Status Kelembagaan</span>
                  <span className="font-bold text-slate-900 text-base">{school.status}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl sm:col-span-2">
                  <span className="text-slate-400 block text-xs">Alamat Lengkap</span>
                  <span className="font-medium text-slate-800 text-sm sm:text-base">{school.alamat}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-xs">Desa / Kelurahan</span>
                  <span className="font-medium text-slate-800 text-sm sm:text-base">{school.desaKelurahan || '-'}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-xs">Kecamatan / Kabupaten</span>
                  <span className="font-medium text-slate-800 text-sm sm:text-base">
                    Kec. {school.kecamatan}, Kab. {school.kabupaten}
                  </span>
                </div>
              </div>
            </div>

            {visiMisi?.visi && (
              <div className="bg-blue-50/70 p-6 sm:p-8 rounded-3xl border border-blue-100 space-y-3">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                  Visi Satuan Pendidikan
                </span>
                <p className="text-slate-800 font-semibold text-base italic leading-relaxed">
                  &ldquo;{visiMisi.visi}&rdquo;
                </p>
                <button
                  onClick={() => setActiveTab('visimisi')}
                  className="text-xs font-bold text-blue-600 hover:underline pt-2 inline-flex items-center space-x-1 cursor-pointer"
                >
                  <span>Lihat Misi & Program Unggulan</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                Kontak Satuan Pendidikan
              </h4>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-center space-x-2.5">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{school.telepon || 'Belum tersedia'}</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{school.email || 'Belum tersedia'}</span>
                </li>
                {school.website && (
                  <li className="flex items-center space-x-2.5">
                    <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                    <a
                      href={school.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline line-clamp-1"
                    >
                      {school.website}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                Pengawasan & Penjaminan Mutu
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Satuan pendidikan ini mendapatkan pendampingan terstruktur dari Pengawas Pembina TK/SD Dinas Pendidikan secara berkala.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <span className="text-slate-400 block font-medium">Pengawas Pembina:</span>
                <span className="font-bold text-slate-800 block">
                  {pengawas?.nama
                    ? (pengawas.gelar ? `${pengawas.nama}, ${pengawas.gelar}` : pengawas.nama)
                    : (settings?.namaPengawas || 'Pengawas Pembina')}
                </span>
                <span className="text-[11px] text-blue-600 block">
                  NIP. {pengawas?.nip || settings?.nipPengawas || '-'}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {pengawas?.jabatan || settings?.jabatan || 'Pengawas Sekolah'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Visi & Misi Tab */}
      {activeTab === 'visimisi' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
              Arah & Tujuan Satuan
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Visi, Misi, Tujuan & Program Unggulan
            </h2>
          </div>
          {!visiMisi || (!visiMisi.visi && !visiMisi.misi) ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl p-6">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-medium text-slate-700">Data sedang dalam proses pembaruan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                <div className="flex items-center space-x-2 text-blue-800 font-bold text-base sm:text-lg">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  <span>Visi Sekolah</span>
                </div>
                <p className="text-base sm:text-lg text-slate-800 leading-relaxed italic font-medium">
                  &ldquo;{visiMisi.visi}&rdquo;
                </p>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-slate-800 font-bold text-base sm:text-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Misi Sekolah</span>
                </div>
                <div className="text-sm sm:text-base text-slate-700 whitespace-pre-line leading-relaxed">
                  {visiMisi.misi || 'Data sedang dalam proses pembaruan.'}
                </div>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-slate-800 font-bold text-base sm:text-lg">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                  <span>Tujuan Satuan Pendidikan</span>
                </div>
                <div className="text-sm sm:text-base text-slate-700 whitespace-pre-line leading-relaxed">
                  {visiMisi.tujuan || 'Data sedang dalam proses pembaruan.'}
                </div>
              </div>
              <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-3">
                <div className="flex items-center space-x-2 text-amber-900 font-bold text-base">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span>Program Unggulan Sekolah</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                  {visiMisi.programUnggulan || 'Data sedang dalam proses pembaruan.'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Sambutan Kepala Sekolah Tab */}
      {activeTab === 'sambutan' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
              Pesan Pimpinan
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Sambutan Kepala Satuan Pendidikan
            </h2>
          </div>
          {!kepalaSekolahAktif ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl p-6">
              <p className="font-medium text-slate-700">Data sedang dalam proses pembaruan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-4 flex flex-col items-center p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <img
                  src={
                    kepalaSekolahAktif.foto ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
                  }
                  alt={kepalaSekolahAktif.nama}
                  className="w-36 h-36 rounded-2xl object-cover border-4 border-white shadow-md mb-4 bg-slate-200"
                />
                <h3 className="font-bold text-slate-900 text-base">{kepalaSekolahAktif.nama}</h3>
                <span className="text-xs text-blue-700 font-medium mt-0.5">
                  NIP. {kepalaSekolahAktif.nip || '-'}
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  Periode: {kepalaSekolahAktif.periode}
                </span>
              </div>
              <div className="md:col-span-8 space-y-4">
                <div className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Assalamu alaikum Warahmatullahi Wabarakatuh
                </div>
                <div className="text-base sm:text-lg text-slate-700 whitespace-pre-line leading-relaxed">
                  {kepalaSekolahAktif.sambutan ||
                    'Selamat datang di portal informasi resmi satuan pendidikan kami. Kami berkomitmen memberikan layanan pendidikan bermutu dan menumbuhkan karakter profil pelajar pancasila.'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Struktur Organisasi Tab */}
      {activeTab === 'struktur' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
              Tata Kelola Kelembagaan
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Struktur Organisasi Satuan Pendidikan
            </h2>
          </div>
          {!school.strukturOrganisasi || school.strukturOrganisasi.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl p-6">
              <p className="font-medium text-slate-700">Data sedang dalam proses pembaruan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {school.strukturOrganisasi.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-center flex flex-col items-center justify-between space-y-3"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg border-2 border-white shadow-xs">
                    {item.foto ? (
                      <img
                        src={item.foto}
                        alt={item.nama}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      item.nama.charAt(0)
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest block">
                      {item.jabatan}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{item.nama}</h4>
                    {item.bagian && (
                      <span className="text-xs text-slate-500 block mt-0.5">{item.bagian}</span>
                    )}
                  </div>
                  {item.keterangan && (
                    <p className="text-[11px] text-slate-400 italic">{item.keterangan}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Fasilitas Tab */}
      {activeTab === 'fasilitas' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
              Sarana & Prasarana
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Fasilitas Penunjang Pembelajaran
            </h2>
          </div>
          {!school.fasilitas || school.fasilitas.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl p-6">
              <p className="font-medium text-slate-700">Data sedang dalam proses pembaruan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {school.fasilitas.map((f: any) => (
                <div
                  key={f.id}
                  className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between"
                >
                  {f.foto && (
                    <div className="h-40 bg-slate-200 overflow-hidden">
                      <img src={f.foto} alt={f.nama} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-700">{f.kondisi || 'Baik'}</span>
                      <span className="text-slate-500 font-medium">
                        {f.jumlah} {f.unit}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base sm:text-lg">{f.nama}</h4>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {f.deskripsi || 'Tidak ada deskripsi tambahan.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. Keunggulan Tab */}
      {activeTab === 'keunggulan' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
              Diferensiasi & Kekhasan
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Keunggulan Satuan Pendidikan
            </h2>
          </div>
          {!school.keunggulan || school.keunggulan.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl p-6">
              <p className="font-medium text-slate-700">Data sedang dalam proses pembaruan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {school.keunggulan.map((k: any) => (
                <div
                  key={k.id}
                  className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-3"
                >
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {k.kategori}
                  </span>
                  <h4 className="font-bold text-slate-900 text-base sm:text-lg">{k.judul}</h4>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{k.deskripsi}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. Riwayat Kepala Sekolah Tab */}
      {activeTab === 'kepalaSekolah' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
              Periodesasi Kepemimpinan
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Daftar Riwayat Kepala Sekolah
            </h2>
          </div>
          {!school.kepalaSekolah || school.kepalaSekolah.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl p-6">
              <p className="font-medium text-slate-700">Data sedang dalam proses pembaruan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="p-3 font-bold">No</th>
                    <th className="p-3 font-bold">Nama Kepala Sekolah</th>
                    <th className="p-3 font-bold">NIP</th>
                    <th className="p-3 font-bold">Periode Jabatan</th>
                    <th className="p-3 font-bold">Status</th>
                    <th className="p-3 font-bold">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {school.kepalaSekolah.map((ks: any, idx: number) => (
                    <tr key={ks.id} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-400 font-semibold">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{ks.nama}</td>
                      <td className="p-3 text-slate-600">{ks.nip || '-'}</td>
                      <td className="p-3 font-semibold text-slate-800">{ks.periode}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            ks.status === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {ks.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{ks.keterangan || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 8. Data Guru Tab */}
      {activeTab === 'guru' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
                Pendidik & Tenaga Kependidikan
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Data Guru & Tenaga Kependidikan
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Cari guru / mapel..."
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
              <select
                value={teacherStatus}
                onChange={(e) => setTeacherStatus(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="SEMUA">Semua Status</option>
                <option value="PNS">PNS</option>
                <option value="PPPK">PPPK</option>
                <option value="HONORER">Honorer</option>
              </select>
            </div>
          </div>
          {filteredTeachers.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl p-6">
              <p className="font-medium text-slate-700">Data sedang dalam proses pembaruan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTeachers.map((g: any) => (
                <div
                  key={g.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-start space-x-3.5"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                    {g.foto ? (
                      <img src={g.foto} alt={g.nama} className="w-full h-full object-cover" />
                    ) : (
                      g.nama.charAt(0)
                    )}
                  </div>
                  <div className="space-y-1 flex-1">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                      {g.jabatan}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{g.nama}</h4>
                    <p className="text-[11px] text-slate-500">
                      Mapel: <span className="font-medium text-slate-700">{g.mapel || '-'}</span>
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 pt-1">
                      <span>{g.statusKepegawaian || 'Pendidik'}</span>
                      <span>•</span>
                      <span>{g.pendidikan || 'S1'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 9. Prestasi Tab */}
      {activeTab === 'prestasi' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
              Catatan Keberhasilan
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Prestasi Satuan Pendidikan
            </h2>
          </div>
          {!school.prestasi || school.prestasi.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl p-6">
              <p className="font-medium text-slate-700">Data sedang dalam proses pembaruan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {school.prestasi.map((p: any) => (
                <div
                  key={p.id}
                  className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                      Tingkat {p.tingkat}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">{p.tahun}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base sm:text-lg">{p.namaPrestasi}</h4>
                  <p className="text-sm text-slate-700">
                    Bidang: <span className="font-semibold text-slate-900">{p.bidang}</span>
                  </p>
                  <p className="text-sm text-slate-700">
                    Peraih: <span className="font-semibold text-slate-900">{p.peraih}</span>
                  </p>
                  {p.keterangan && (
                    <p className="text-sm text-slate-600 italic bg-white/70 p-2 rounded-lg border border-slate-200/60 mt-1">{p.keterangan}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 10. Galeri Tab */}
      {activeTab === 'galeri' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
              Dokumentasi Visual
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Galeri Kegiatan Sekolah
            </h2>
          </div>
          {!school.galeri || school.galeri.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl p-6">
              <p className="font-medium text-slate-700">Data sedang dalam proses pembaruan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {school.galeri.map((g: any) => (
                <div
                  key={g.id}
                  onClick={() => onOpenLightbox(g)}
                  className="group relative h-48 rounded-xl overflow-hidden cursor-pointer shadow-xs border border-slate-200"
                >
                  <img
                    src={g.url}
                    alt={g.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                    <span className="text-[10px] text-amber-300 font-bold uppercase">
                      {g.kategori}
                    </span>
                    <span className="text-white text-xs font-semibold line-clamp-1">{g.judul}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 11. Berita Sekolah Tab */}
      {activeTab === 'berita' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
              Publikasi
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Berita & Informasi Sekolah
            </h2>
          </div>
          {!school.berita || school.berita.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl p-6">
              <p className="font-medium text-slate-700">Data sedang dalam proses pembaruan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {school.berita.map((b: any) => (
                <div
                  key={b.id}
                  onClick={() => onNavigate(`/berita/${b.slug}`)}
                  className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:border-blue-300 transition-all flex flex-col justify-between"
                >
                  {b.thumbnail && (
                    <div className="h-40 bg-slate-200 overflow-hidden">
                      <img src={b.thumbnail} alt={b.judul} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">
                      {b.kategori}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-2">{b.judul}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{b.ringkasan || b.konten}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 12. Lokasi Tab */}
      {activeTab === 'lokasi' && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
              Peta Lokasi Satuan
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Lokasi & Alamat Satuan Pendidikan
            </h2>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-start space-x-2.5">
              <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 text-sm block">{school.nama}</span>
                <span className="text-xs text-slate-600 block mt-1">{school.alamat}</span>
                <span className="text-xs text-slate-500 block">
                  Kecamatan {school.kecamatan}, Kabupaten {school.kabupaten}, Provinsi {school.provinsi}
                </span>
              </div>
            </div>
            {school.mapsUrl && (
              <div className="pt-2">
                <a
                  href={school.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Buka Petunjuk Arah di Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
