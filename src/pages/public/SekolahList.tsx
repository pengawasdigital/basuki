import React, { useState, useEffect } from 'react';
import {
  School,
  Search,
  Filter,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { School as SchoolType } from '../../types';

interface SekolahListProps {
  onNavigate: (path: string) => void;
}

export const SekolahList: React.FC<SekolahListProps> = ({ onNavigate }) => {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenjang, setFilterJenjang] = useState('SEMUA');
  const [filterStatus, setFilterStatus] = useState('SEMUA');

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const data = await api.getSchools({
          search: searchTerm,
          jenjang: filterJenjang,
          status: filterStatus
        });
        setSchools(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load schools:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchools();
  }, [searchTerm, filterJenjang, filterStatus]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
          Wilayah Binaan
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Daftar Satuan Pendidikan Binaan
        </h1>
        <p className="text-base text-slate-600 max-w-3xl leading-relaxed">
          Seluruh sekolah tingkat TK dan SD yang berada di bawah pendampingan, supervisi mutu, dan pembinaan berkala Pengawas Sekolah.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Cari nama sekolah, NPSN, atau kecamatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>
          <select
            value={filterJenjang}
            onChange={(e) => setFilterJenjang(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
          >
            <option value="SEMUA">Semua Jenjang</option>
            <option value="SD">Sekolah Dasar (SD)</option>
            <option value="TK">Taman Kanak-Kanak (TK)</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
          >
            <option value="SEMUA">Semua Status</option>
            <option value="Negeri">Negeri</option>
            <option value="Swasta">Swasta</option>
          </select>

          {(searchTerm || filterJenjang !== 'SEMUA' || filterStatus !== 'SEMUA') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterJenjang('SEMUA');
                setFilterStatus('SEMUA');
              }}
              className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Grid of Schools */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium">Memuat data sekolah binaan...</p>
        </div>
      ) : schools.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8">
          <School className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-lg">Tidak ada sekolah yang sesuai kriteria</h3>
          <p className="text-xs text-slate-500 mt-1">
            Silakan ubah kata kunci pencarian atau reset filter untuk menampilkan kembali data.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((sch) => (
            <div
              key={sch.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col group"
            >
              {/* Image banner */}
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

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>NPSN: {sch.npsn}</span>
                    <span>{sch.kecamatan}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-blue-700 transition-colors">
                    {sch.nama}
                  </h3>
                  <p className="text-sm text-slate-600 flex items-start gap-1.5 line-clamp-2">
                    <MapPin className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
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
                    <span className="text-slate-500 block text-xs">Guru / Murid</span>
                    <span className="font-semibold text-slate-900">
                      {sch.jumlahGuru || 0} / {sch.jumlahSiswa || 0}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={() => onNavigate(`/sekolah/${sch.id}`)}
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <span>Profil & Informasi Lengkap</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {sch.mapsUrl && (
                    <a
                      href={sch.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-blue-700 transition-colors"
                      title="Buka Lokasi di Google Maps"
                    >
                      <MapPin className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
