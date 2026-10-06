import React from 'react';
import {
  GraduationCap,
  Briefcase,
  Mail,
  Phone,
  Printer,
  Award,
  BookOpen
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const ProfilPengawas: React.FC = () => {
  const { pengawas, settings } = useSettings();

  const handlePrint = () => {
    window.print();
  };

  const peranList = [
    {
      title: 'Pendampingan Satuan Pendidikan',
      desc: 'Melakukan pendampingan kontekstual dan berkelanjutan berbasis kebutuhan riil satuan pendidikan binaan.'
    },
    {
      title: 'Supervisi Akademik',
      desc: 'Membimbing dewan guru dalam perencanaan, proses pembelajaran berdiferensiasi, serta asesmen autentik berpusat pada murid.'
    },
    {
      title: 'Supervisi Manajerial',
      desc: 'Mendampingi kepala sekolah dalam tata kelola kelembagaan, pengelolaan dana BOS, dan pemenuhan 8 Standar Nasional Pendidikan.'
    },
    {
      title: 'Pemantauan Satuan Pendidikan',
      desc: 'Memantau keterlaksanaan kurikulum operasional, iklim keamanan sekolah, dan program inklusif ramah anak.'
    },
    {
      title: 'Evaluasi Mutu Pendidikan',
      desc: 'Menganalisis indikator Rapor Pendidikan bersama tim sekolah untuk merumuskan Perencanaan Berbasis Data (PBD).'
    },
    {
      title: 'Pembinaan Kepala Sekolah',
      desc: 'Menguatkan kapasitas kepemimpinan instruksional dan kewirausahaan kepala sekolah dalam menggerakkan ekosistem.'
    },
    {
      title: 'Pendampingan Guru',
      desc: 'Memfasilitasi peningkatan kompetensi pedagogik serta optimalisasi Komunitas Belajar (Kombel) dalam sekolah.'
    },
    {
      title: 'Pengembangan Mutu Sekolah',
      desc: 'Mendorong inovasi budaya literasi, numerasi, penguatan karakter Profil Pelajar Pancasila, dan program unggulan.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-12">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 no-print">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
            Identitas & Peran Resmi
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Profil Pengawas Sekolah
          </h1>
          <p className="text-base text-slate-600 mt-1">
            Informasi rekam jejak, kompetensi, dan tugas pengawasan satuan pendidikan TK/SD.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold text-sm border border-slate-300 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Profil</span>
          </button>
        </div>
      </div>

      {/* Main Biodata Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 h-32 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
        <div className="px-6 sm:px-10 pb-10 pt-0 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 sm:-mt-20 mb-6">
            <img
              src={
                pengawas?.foto ||
                settings?.fotoPengawas ||
                'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'
              }
              alt={pengawas?.nama}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover border-4 border-white shadow-xl bg-slate-200 shrink-0"
            />
            <div className="text-center md:text-left flex-1 space-y-1">
              <span className="inline-block text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300/80 px-3 py-1 rounded-full uppercase tracking-wider">
                Pengawas Pembina TK / SD
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {pengawas?.nama || 'Basuki, S.Kom.'}
              </h2>
              <p className="text-base font-bold text-blue-700">
                NIP. {pengawas?.nip || settings?.nipPengawas || '19790719 201406 1 003'}
              </p>
              <p className="text-sm text-slate-600">
                {pengawas?.pangkatGolongan || 'Penata / III.C'} • {pengawas?.jabatan || 'Pengawas Sekolah Ahli Muda'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0 no-print">
              <a
                href={`https://wa.me/${pengawas?.noHp?.replace(/[^0-9]/g, '') || settings?.whatsapp || '085761120929'}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
              <a
                href={`mailto:${pengawas?.email || settings?.email || 'digitalpengawas@gmail.com'}`}
                className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Kirim Email</span>
              </a>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Wilayah Pembinaan
              </span>
              <span className="font-bold text-slate-800 text-base block">
                {pengawas?.wilayahKerja || 'Kecamatan Perhentian Raja'}
              </span>
              <span className="text-sm text-slate-600 block mt-0.5">
                Kecamatan {pengawas?.kecamatan || settings?.kecamatan || 'Perhentian Raja'}
              </span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Kabupaten / Provinsi
              </span>
              <span className="font-bold text-slate-800 text-base block">
                {pengawas?.kabupaten || settings?.kabupaten || 'Kabupaten Kampar'}
              </span>
              <span className="text-sm text-slate-600 block mt-0.5">
                {pengawas?.provinsi || settings?.provinsi || 'Provinsi Riau'}
              </span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Kontak Resmi
              </span>
              <span className="font-bold text-slate-800 text-base block">
                {pengawas?.email || settings?.email || 'digitalpengawas@gmail.com'}
              </span>
              <span className="text-sm text-slate-600 block mt-0.5">
                {pengawas?.noHp || settings?.telepon || '085761120929'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Section: Peran Pengawas Sekolah */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
            Kerangka Kerja Transformatif
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Peran & Fokus Pengawas Sekolah
          </h2>
          <p className="text-base text-slate-600">
            Berdasarkan regulasi dan paradigma kepengawasan baru yang mengedepankan pendampingan bermakna.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {peranList.map((p, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                  0{idx + 1}
                </div>
                <h3 className="font-bold text-slate-900 text-lg leading-snug">{p.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Riwayat Pendidikan, Pengalaman & Kompetensi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl">Riwayat Pendidikan</h3>
              <p className="text-xs sm:text-sm text-slate-500">Latar belakang jenjang akademik formal</p>
            </div>
          </div>
          <div className="text-base text-slate-700 whitespace-pre-line leading-relaxed">
            {pengawas?.riwayatPendidikan || 'Data riwayat pendidikan dalam proses pembaruan.'}
          </div>

          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4 pt-4">
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl">Pengalaman Kepengawasan</h3>
              <p className="text-xs sm:text-sm text-slate-500">Jejak karier keguruan dan manajerial</p>
            </div>
          </div>
          <div className="text-base text-slate-700 whitespace-pre-line leading-relaxed">
            {pengawas?.pengalaman || 'Data pengalaman dalam proses pembaruan.'}
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl">Kompetensi Inti</h3>
              <p className="text-xs sm:text-sm text-slate-500">Keahlian profesional & pembinaan</p>
            </div>
          </div>
          <div className="text-base text-slate-700 whitespace-pre-line leading-relaxed">
            {pengawas?.kompetensi || 'Data kompetensi dalam proses pembaruan.'}
          </div>

          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4 pt-4">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl">Tugas Pokok & Fungsi</h3>
              <p className="text-xs sm:text-sm text-slate-500">Mandat regulasi pengawasan sekolah</p>
            </div>
          </div>
          <div className="text-base text-slate-700 whitespace-pre-line leading-relaxed">
            {pengawas?.tugasFungsi || 'Data tugas dan fungsi dalam proses pembaruan.'}
          </div>
        </div>
      </div>
    </div>
  );
};
