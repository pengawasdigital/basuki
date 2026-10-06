import React, { useState, useEffect, useMemo } from 'react';
import {
  UserCheck,
  Search,
  School as SchoolIcon,
  MapPin,
  Calendar,
  ExternalLink,
  ChevronRight,
  GraduationCap,
  Award,
  Sparkles,
  Quote,
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { KepalaSekolah, School as SchoolType } from '../../types';
import { useSettings } from '../../context/SettingsContext';

interface KepalaSekolahListProps {
  onNavigate: (path: string) => void;
}

export const KepalaSekolahList: React.FC<KepalaSekolahListProps> = ({ onNavigate }) => {
  const { settings } = useSettings();
  const [principals, setPrincipals] = useState<KepalaSekolah[]>([]);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJenjang, setSelectedJenjang] = useState('SEMUA');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('SEMUA');
  const [activeSambutanModal, setActiveSambutanModal] = useState<{
    ks: KepalaSekolah;
    school?: SchoolType;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [principalsRes, schoolsRes] = await Promise.all([
          api.getPrincipals(),
          api.getSchools()
        ]);
        const validSchools = Array.isArray(schoolsRes) ? schoolsRes : [];
        setSchools(validSchools);

        let validPrincipals = Array.isArray(principalsRes) ? principalsRes : [];
        if (validPrincipals.length === 0 && validSchools.length > 0) {
          validPrincipals = validSchools
            .filter((s) => s.kepalaSekolahNama && s.kepalaSekolahNama.trim())
            .map((s) => ({
              id: 'ks-sch-' + s.id,
              sekolahId: s.id,
              nama: s.kepalaSekolahNama.trim(),
              nip: '',
              periode: '2022 - Sekarang',
              status: 'Aktif',
              foto: '',
              keterangan: 'Kepala Satuan Pendidikan ' + s.nama,
              sambutan: ''
            }));
        }
        setPrincipals(validPrincipals);
      } catch (err) {
        console.error('Failed to load kepala sekolah data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const schoolMap = useMemo(() => {
    const map = new Map<string, SchoolType>();
    schools.forEach((s) => map.set(s.id, s));
    return map;
  }, [schools]);

  const combinedList = useMemo(() => {
    return principals.map((ks) => {
      const sch = schoolMap.get(ks.sekolahId);
      return {
        ...ks,
        school: sch
      };
    });
  }, [principals, schoolMap]);

  const filteredList = useMemo(() => {
    return combinedList.filter((item) => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        item.nama.toLowerCase().includes(term) ||
        (item.nip && item.nip.toLowerCase().includes(term)) ||
        (item.school?.nama && item.school.nama.toLowerCase().includes(term)) ||
        (item.school?.npsn && item.school.npsn.includes(term)) ||
        (item.school?.desaKelurahan && item.school.desaKelurahan.toLowerCase().includes(term));

      const matchJenjang =
        selectedJenjang === 'SEMUA' ||
        (item.school?.jenjang && item.school.jenjang.toUpperCase() === selectedJenjang.toUpperCase());

      const matchSchool = !selectedSchool || item.sekolahId === selectedSchool;

      const matchStatus =
        selectedStatus === 'SEMUA' ||
        (item.status && item.status.toLowerCase() === selectedStatus.toLowerCase()) ||
        (!item.status && selectedStatus.toLowerCase() === 'aktif');

      return matchSearch && matchJenjang && matchSchool && matchStatus;
    });
  }, [combinedList, searchTerm, selectedJenjang, selectedSchool, selectedStatus]);

  const totalKS = principals.length;
  const countSD = combinedList.filter((item) => item.school?.jenjang?.toUpperCase() === 'SD').length;
  const countTK = combinedList.filter((item) => item.school?.jenjang?.toUpperCase() === 'TK').length;
  const countAktif = combinedList.filter((item) => item.status === 'Aktif' || !item.status).length;

  return (
    <div className="bg-slate-50 min-h-screen py-10 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb & Header */}
        <div className="space-y-3 border-b border-slate-200 pb-6">
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
            <button
              onClick={() => onNavigate('/')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Beranda
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600 font-semibold">Data Kepala Sekolah</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 mb-2">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Pimpinan Satuan Pendidikan</span>
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                Direktori Kepala Sekolah Binaan
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-3xl mt-1 leading-relaxed">
                Daftar profil pimpinan dan kepala satuan pendidikan jenjang TK dan SD binaan wilayah{' '}
                {settings?.kecamatan || 'Kecamatan'}, {settings?.kabupaten || 'Kabupaten'}.
              </p>
            </div>

            <div className="bg-white border border-slate-200 shadow-xs px-4 py-3 rounded-2xl flex items-center space-x-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg">
                {totalKS}
              </div>
              <div className="text-xs">
                <span className="block font-bold text-slate-800">Total Kepala Sekolah</span>
                <span className="text-slate-500">{schools.length} Satuan Pendidikan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Seluruh Pimpinan</div>
              <div className="text-xl font-extrabold text-slate-900">{totalKS} Orang</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <SchoolIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Kepala Sekolah SD</div>
              <div className="text-xl font-extrabold text-slate-900">{countSD} Orang</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Kepala Sekolah TK</div>
              <div className="text-xl font-extrabold text-slate-900">{countTK} Orang</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Status Aktif</div>
              <div className="text-xl font-extrabold text-emerald-600">{countAktif} Aktif</div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Cari nama kepala sekolah, NIP, atau nama sekolah..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <select
                value={selectedJenjang}
                onChange={(e) => setSelectedJenjang(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
              >
                <option value="SEMUA">Semua Jenjang</option>
                <option value="SD">Jenjang SD</option>
                <option value="TK">Jenjang TK</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
              >
                <option value="">Semua Satuan Pendidikan</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
              >
                <option value="SEMUA">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Purna Tugas">Purna Tugas</option>
                <option value="Mutasi">Mutasi</option>
              </select>
            </div>
          </div>

          {(searchTerm || selectedJenjang !== 'SEMUA' || selectedSchool || selectedStatus !== 'SEMUA') && (
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs gap-2">
              <div className="text-slate-500 font-medium">
                Menampilkan <strong className="text-slate-800">{filteredList.length}</strong> dari{' '}
                {totalKS} kepala sekolah
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedJenjang('SEMUA');
                  setSelectedSchool('');
                  setSelectedStatus('SEMUA');
                }}
                className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="text-center py-24 space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-medium text-slate-500">Memuat direktori data kepala sekolah...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <UserCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Kepala Sekolah Tidak Ditemukan</h3>
              <p className="text-xs text-slate-500 mt-1">
                Tidak ada data kepala sekolah yang sesuai dengan kata kunci pencarian atau filter yang dipilih.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedJenjang('SEMUA');
                setSelectedSchool('');
                setSelectedStatus('SEMUA');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((item) => {
              const sch = item.school;
              const hasPhoto = Boolean(item.foto && item.foto.trim());
              const initials = item.nama
                .split(' ')
                .map((n) => n[0])
                .filter(Boolean)
                .slice(0, 2)
                .join('');

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          sch?.jenjang?.toUpperCase() === 'TK'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {sch?.jenjang || 'TK/SD'}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center space-x-1 ${
                          item.status === 'Aktif' || !item.status
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{item.status || 'Aktif'}</span>
                      </span>
                    </div>

                    <div className="flex items-start space-x-4">
                      {hasPhoto ? (
                        <img
                          src={item.foto}
                          alt={item.nama}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-xs shrink-0 group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-center font-extrabold text-lg shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                          {initials || <UserCheck className="w-7 h-7" />}
                        </div>
                      )}
                      <div className="space-y-1 min-w-0 flex-1">
                        <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                          {item.nama}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono">
                          {item.nip && item.nip.trim() ? `NIP. ${item.nip}` : 'NIP. -'}
                        </p>
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.periode || '2022 - Sekarang'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 space-y-1.5 text-xs">
                      <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                        <SchoolIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{sch?.nama || item.keterangan || 'Satuan Pendidikan'}</span>
                      </div>
                      {sch?.npsn && (
                        <div className="text-[11px] text-slate-500">
                          NPSN: <span className="font-mono text-slate-700 font-medium">{sch.npsn}</span>
                        </div>
                      )}
                      {(sch?.desaKelurahan || sch?.kecamatan) && (
                        <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {sch.desaKelurahan ? `${sch.desaKelurahan}, ` : ''}
                            {sch.kecamatan || settings?.kecamatan || 'Kampar'}
                          </span>
                        </div>
                      )}
                    </div>

                    {(item.sambutan || item.keterangan) && (
                      <div className="text-xs text-slate-600 bg-amber-50/60 border border-amber-200/60 rounded-xl p-2.5">
                        <div className="flex items-start space-x-1.5">
                          <Quote className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <p className="line-clamp-2 italic text-[11px] text-slate-700">
                            {item.sambutan || item.keterangan}
                          </p>
                        </div>
                        {item.sambutan && item.sambutan.length > 90 && (
                          <button
                            type="button"
                            onClick={() => setActiveSambutanModal({ ks: item, school: sch })}
                            className="mt-1.5 text-[10px] font-bold text-amber-800 hover:underline block cursor-pointer"
                          >
                            Baca Sambutan Lengkap &rarr;
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigate(`/sekolah/${item.sekolahId}`)}
                      className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer py-1 px-2"
                    >
                      <SchoolIcon className="w-3.5 h-3.5" />
                      <span>Lihat Profil Sekolah</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    {item.sambutan && (
                      <button
                        type="button"
                        onClick={() => setActiveSambutanModal({ ks: item, school: sch })}
                        className="text-[11px] font-medium text-slate-500 hover:text-slate-800 py-1 px-2 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                      >
                        Kutipan Sambutan
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Sambutan Modal */}
        {activeSambutanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base shrink-0">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 leading-tight">
                      {activeSambutanModal.ks.nama}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Kepala {activeSambutanModal.school?.nama || 'Satuan Pendidikan'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSambutanModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-line">
                <p className="font-bold text-slate-900 mb-2 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Sambutan & Komitmen Kepemimpinan:</span>
                </p>
                {activeSambutanModal.ks.sambutan || activeSambutanModal.ks.keterangan}
              </div>
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const sid = activeSambutanModal.ks.sekolahId;
                    setActiveSambutanModal(null);
                    onNavigate(`/sekolah/${sid}`);
                  }}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  <span>Kunjungi Profil {activeSambutanModal.school?.nama || 'Sekolah'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSambutanModal(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
