import React, { useState, useEffect } from 'react';
import { Trophy, Search, School } from 'lucide-react';
import { api } from '../../services/api';
import { Prestasi } from '../../types';

export const PrestasiList: React.FC = () => {
  const [achievements, setAchievements] = useState<Prestasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tingkat, setTingkat] = useState('SEMUA');

  const tingkatList = [
    'SEMUA',
    'Sekolah',
    'Kecamatan',
    'Kabupaten',
    'Provinsi',
    'Nasional',
    'Internasional'
  ];

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const data = await api.getAchievements({
          search: searchTerm,
          tingkat
        });
        setAchievements(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load achievements:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, [searchTerm, tingkat]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block">
          Apresiasi & Capaian
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Prestasi Satuan Pendidikan Binaan
        </h1>
        <p className="text-base text-slate-600 max-w-3xl leading-relaxed">
          Kumpulan torehan kejuaraan dan capaian mutu akademik, literasi, seni, olahraga, dan kepemimpinan sekolah oleh siswa maupun guru.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Cari prestasi, nama murid/guru, atau bidang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-amber-500 focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          {tingkatList.map((t) => (
            <button
              key={t}
              onClick={() => setTingkat(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                tingkat === t
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'SEMUA' ? 'Semua Tingkat' : `Tingkat ${t}`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Achievements */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium">Memuat data prestasi...</p>
        </div>
      ) : achievements.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-lg">Belum ada data prestasi</h3>
          <p className="text-xs text-slate-500 mt-1">
            Data prestasi belum ditambahkan atau tidak sesuai filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between"
            >
              {item.foto && (
                <div className="h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={item.foto}
                    alt={item.namaPrestasi}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                      Tingkat {item.tingkat}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-500">Tahun {item.tahun}</span>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-blue-700 block mb-1">
                      Bidang: {item.bidang}
                    </span>
                    <h3 className="font-bold text-slate-900 text-lg leading-snug">
                      {item.namaPrestasi}
                    </h3>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl space-y-1 text-sm">
                    <div>
                      <span className="text-slate-500 block text-xs">Peraih / Peserta:</span>
                      <span className="font-bold text-slate-900">{item.peraih}</span>
                    </div>
                    {item.keterangan && (
                      <p className="text-slate-700 text-sm italic pt-1">{item.keterangan}</p>
                    )}
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center space-x-2 text-sm text-slate-600">
                  <School className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-800 line-clamp-1">
                    {item.sekolahNama || 'Satuan Pendidikan Binaan'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
