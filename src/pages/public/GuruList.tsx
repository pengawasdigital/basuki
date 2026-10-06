import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, School, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';
import { Guru, School as SchoolType } from '../../types';

export const GuruList: React.FC = () => {
  const [teachers, setTeachers] = useState<Guru[]>([]);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [statusKepegawaian, setStatusKepegawaian] = useState('SEMUA');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.getSchools().then((s) => setSchools(Array.isArray(s) ? s : [])).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const res = await api.getTeachers({
          search: searchTerm,
          sekolahId: selectedSchool,
          statusKepegawaian,
          page,
          limit: 12,
          publicOnly: true
        });
        setTeachers(Array.isArray(res?.data) ? res.data : []);
        setTotal(res?.total || 0);
        setTotalPages(res?.totalPages || 1);
      } catch (err) {
        console.error('Failed to load teachers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, [searchTerm, selectedSchool, statusKepegawaian, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
          Ketenagaan Pendidikan
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Direktori Pendidik & Tenaga Kependidikan
        </h1>
        <p className="text-base text-slate-600 max-w-3xl leading-relaxed">
          Data guru dan tenaga kependidikan pada seluruh satuan pendidikan binaan jenjang TK dan SD.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Cari nama guru, NIP, atau mapel..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedSchool}
            onChange={(e) => {
              setSelectedSchool(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <option value="">Semua Satuan Pendidikan</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nama}
              </option>
            ))}
          </select>
          <select
            value={statusKepegawaian}
            onChange={(e) => {
              setStatusKepegawaian(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <option value="SEMUA">Semua Status</option>
            <option value="PNS">PNS</option>
            <option value="PPPK">PPPK</option>
            <option value="HONORER">Honorer</option>
          </select>
          {(searchTerm || selectedSchool || statusKepegawaian !== 'SEMUA') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSchool('');
                setStatusKepegawaian('SEMUA');
                setPage(1);
              }}
              className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Teachers Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium">Memuat data guru...</p>
        </div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-lg">Tidak ada data guru yang sesuai</h3>
          <p className="text-xs text-slate-500 mt-1">
            Silakan ubah filter atau kata kunci pencarian.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((g) => {
              const schoolItem = schools.find((s) => s.id === g.sekolahId);
              return (
                <div
                  key={g.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base shrink-0 overflow-hidden border border-slate-100">
                      {g.foto ? (
                        <img src={g.foto} alt={g.nama} className="w-full h-full object-cover" />
                      ) : (
                        g.nama.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                        {g.jabatan}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
                        {g.nama}
                      </h4>
                      <p className="text-sm text-slate-600 line-clamp-1 mt-0.5">
                        Mapel: <span className="font-medium text-slate-800">{g.mapel || '-'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-xs">NIP</span>
                      <span className="font-medium text-slate-800">{g.nip || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-xs">Status</span>
                      <span className="font-bold text-emerald-700">{g.statusKepegawaian || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-xs">Pendidikan</span>
                      <span className="font-medium text-slate-800">{g.pendidikan || 'S1'}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600">
                    <span className="flex items-center space-x-1.5 line-clamp-1">
                      <School className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800 line-clamp-1">
                        {schoolItem?.nama || 'Satuan Binaan'}
                      </span>
                    </span>
                    {g.email && (
                      <a
                        href={`mailto:${g.email}`}
                        className="text-blue-600 hover:text-blue-800"
                        title={g.email}
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-5 text-xs text-slate-600">
              <div>
                Menampilkan halaman <strong>{page}</strong> dari <strong>{totalPages}</strong> (Total {total} guru)
              </div>
              <div className="flex items-center space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 flex items-center space-x-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 flex items-center space-x-1 cursor-pointer"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
