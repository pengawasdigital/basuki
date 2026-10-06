import React, { useState, useEffect } from 'react';
import {
  School,
  User,
  Users,
  Trophy,
  BookOpen,
  Image as ImageIcon,
  BellRing,
  MessageSquare,
  Plus,
  ShieldCheck,
  Database,
  Server,
  Key,
  Info,
  ChevronDown,
  ChevronUp,
  Globe,
  MousePointerClick,
  Calendar,
  Activity,
  BarChart3,
  RefreshCw,
  Eye,
  Download,
  HardDrive
} from 'lucide-react';
import { api } from '../../services/api';
import { DashboardStats } from '../../types';
import { BackupModal } from '../../components/common/BackupModal';

interface AdminDashboardProps {
  onSelectSection: (section: string) => void;
  onShowToast?: (msg: string, type: 'success' | 'error') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectSection, onShowToast }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [showConfigDetails, setShowConfigDetails] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsData, statusData] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getSystemStatus().catch(() => null)
      ]);
      setStats(statsData);
      setSystemStatus(statusData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-400">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium">Memuat statistik sistem...</p>
      </div>
    );
  }

  const isSupabase = systemStatus?.isSupabaseConnected;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Ringkasan Statistik & Operasional
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ikhtisar data satuan pendidikan binaan, kepengawasan, dan publikasi portal terintegrasi Supabase.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
            title="Segarkan data statistik"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{refreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
          </button>
          <button
            onClick={() => setIsBackupModalOpen(true)}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Ambil dan unduh cadangan database website"
          >
            <Database className="w-3.5 h-3.5 text-amber-300" />
            <span>Backup Data</span>
          </button>
          <button
            onClick={() => onSelectSection('sekolah')}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Sekolah</span>
          </button>
          <button
            onClick={() => onSelectSection('berita')}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tulis Berita</span>
          </button>
        </div>
      </div>

      {/* Supabase Status Banner */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isSupabase
          ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
          : 'bg-blue-50/70 border-blue-200/80 text-blue-900'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isSupabase ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm">
                  {isSupabase ? 'Database Supabase PostgreSQL Terhubung' : 'Integrasi Supabase Siap & Tersedia'}
                </span>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  isSupabase ? 'bg-emerald-200 text-emerald-800' : 'bg-blue-200 text-blue-800'
                }`}>
                  {isSupabase ? 'Supabase Live' : 'Supabase Ready'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {isSupabase
                  ? 'Data dan autentikasi terhubung ke Supabase PostgreSQL dengan Row Level Security (RLS).'
                  : 'Aplikasi siap dikoneksikan ke project Supabase. Seluruh skema database PostgreSQL dan RLS policy telah tersedia.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowConfigDetails(!showConfigDetails)}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            <span>{showConfigDetails ? 'Tutup Panduan' : 'Detail Konfigurasi'}</span>
            {showConfigDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showConfigDetails && (
          <div className="mt-4 pt-4 border-t border-slate-200/60 text-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white/80 p-3 rounded-xl border border-slate-200/60">
                <div className="flex items-center space-x-1.5 font-bold text-slate-700 mb-1">
                  <Database className="w-3.5 h-3.5 text-blue-600" />
                  <span>Basis Data</span>
                </div>
                <p className="text-slate-600 text-[11px] mb-1">PostgreSQL via Supabase</p>
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                  {isSupabase ? 'Cloud Connected' : 'Tabel & Relasi Siap'}
                </span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-slate-200/60">
                <div className="flex items-center space-x-1.5 font-bold text-slate-700 mb-1">
                  <Key className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Autentikasi</span>
                </div>
                <p className="text-slate-600 text-[11px] mb-1">Supabase Auth & Session</p>
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                  JWT & RLS Terlindungi
                </span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-slate-200/60">
                <div className="flex items-center space-x-1.5 font-bold text-slate-700 mb-1">
                  <Server className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Penyimpanan Berkas</span>
                </div>
                <p className="text-slate-600 text-[11px] mb-1">Supabase Storage / Uploads</p>
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                  Bucket Terintegrasi
                </span>
              </div>
            </div>

            <div className="bg-white/90 p-3.5 rounded-xl border border-slate-200 text-slate-700 space-y-1.5">
              <p className="font-bold text-slate-800">Variabel Lingkungan Supabase:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                <li><code>VITE_SUPABASE_URL</code>: URL Project Supabase Anda.</li>
                <li><code>VITE_SUPABASE_ANON_KEY</code>: Public Anon Key Supabase untuk klien.</li>
                <li>Script SQL migration lengkap siap dijalankan di <strong>Supabase SQL Editor</strong>.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Backup & Data Protection Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden border border-indigo-800/60">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-start space-x-4 max-w-2xl">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-xs">
              <Database className="w-6 h-6 text-amber-300" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                  Pusat Cadangan & Pemulihan Basis Data (Backup & Restore)
                </h3>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Data Terproteksi
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Amankan dan ambil salinan seluruh database data yang telah di-input pada website (Sekolah, Kepala Sekolah, Dewan Guru, Prestasi, Berita, Pengumuman, dan Pengaturan).
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" />
              <span>Ambil Backup Data</span>
            </button>
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-colors cursor-pointer"
            >
              <HardDrive className="w-4 h-4 text-blue-300" />
              <span>Kelola & Restore</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => onSelectSection('sekolah')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Sekolah Binaan</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <School className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {stats?.totalSekolah || 0}
          </div>
          <span className="text-[11px] text-blue-600 font-medium">Satuan Pendidikan</span>
        </div>

        <div
          onClick={() => onSelectSection('guru')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Dewan Guru</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {stats?.totalGuru || 0}
          </div>
          <span className="text-[11px] text-indigo-600 font-medium">Pendidik & Tendik</span>
        </div>

        <div
          onClick={() => onSelectSection('berita')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Berita Publikasi</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {stats?.totalBerita || 0}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Artikel & Warta</span>
        </div>

        <div
          onClick={() => onSelectSection('prestasi')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Prestasi Sekolah</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {stats?.totalPrestasi || 0}
          </div>
          <span className="text-[11px] text-amber-700 font-medium">Catatan Juara</span>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => onSelectSection('kepalaSekolah')}
          className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-3 cursor-pointer hover:bg-slate-50"
        >
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{stats?.totalKepalaSekolah || 0}</div>
            <div className="text-[11px] text-slate-500">Kepala Sekolah</div>
          </div>
        </div>

        <div
          onClick={() => onSelectSection('galeri')}
          className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-3 cursor-pointer hover:bg-slate-50"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{stats?.totalGaleri || 0}</div>
            <div className="text-[11px] text-slate-500">Galeri Media</div>
          </div>
        </div>

        <div
          onClick={() => onSelectSection('pengumuman')}
          className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-3 cursor-pointer hover:bg-slate-50"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{stats?.totalPengumuman || 0}</div>
            <div className="text-[11px] text-slate-500">Pengumuman</div>
          </div>
        </div>

        <div
          onClick={() => onSelectSection('kontak')}
          className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-3 cursor-pointer hover:bg-slate-50"
        >
          <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{stats?.totalKontakBaru || 0}</div>
            <div className="text-[11px] text-slate-500">Pesan Masuk Baru</div>
          </div>
        </div>
      </div>

      {/* Visitors Analytics Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Statistik Pengunjung Website (Visitors)
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Pelacak Real-Time Aktif
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pemantauan lalu lintas pengunjung portal secara langsung, tren kunjungan 7 hari terakhir, dan popularitas halaman.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs font-semibold text-slate-600 bg-white/90 px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              Mingguan: <strong className="text-blue-700 font-extrabold">{(stats?.visitors?.weekVisitors || 0).toLocaleString('id-ID')}</strong> Unik
            </span>
          </div>
        </div>

        <div className="p-6 border-b border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/50">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Total Pengunjung Unik</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              {(stats?.visitors?.totalVisitors || 0).toLocaleString('id-ID')}
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-blue-600 font-medium mt-1">
              <span>Pengunjung Individu Terdata</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Total Tayangan Halaman</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <MousePointerClick className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              {(stats?.visitors?.totalPageViews || 0).toLocaleString('id-ID')}
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-indigo-600 font-medium mt-1">
              <span>Akumulasi Klik & Pageviews</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Pengunjung Hari Ini</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              {(stats?.visitors?.todayVisitors || 0).toLocaleString('id-ID')}
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-emerald-600 font-medium mt-1">
              <span>{(stats?.visitors?.todayPageViews || 0).toLocaleString('id-ID')} tayangan hari ini</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Sesi Aktif Terkini</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              {(stats?.visitors?.activeNow || 1).toLocaleString('id-ID')}
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-amber-700 font-medium mt-1">
              <span>15 menit terakhir</span>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/70 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tren Pengunjung 7 Hari Terakhir</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Perbandingan volume pengunjung unik dan total tayangan harian
                </p>
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                Bulan Ini: {(stats?.visitors?.monthVisitors || 0).toLocaleString('id-ID')} Unik
              </span>
            </div>

            <div className="pt-6 pb-2">
              <div className="grid grid-cols-7 gap-2 items-end h-48">
                {stats?.visitors?.recentDays && stats.visitors.recentDays.length > 0 ? (
                  stats.visitors.recentDays.map((day, idx) => {
                    const maxDayVisitors = Math.max(1, ...(stats?.visitors?.recentDays?.map((d) => d.visitors) || [1]));
                    const heightPercent = Math.max(12, Math.round((day.visitors / maxDayVisitors) * 100));
                    const isToday = idx === (stats.visitors?.recentDays?.length || 0) - 1;
                    return (
                      <div key={day.date} className="flex flex-col items-center h-full justify-end group">
                        <div className="text-[11px] font-bold text-slate-700 mb-1 group-hover:text-blue-600 transition-colors">
                          {day.visitors}
                        </div>
                        <div className="w-full max-w-[38px] bg-slate-200/90 rounded-t-xl overflow-hidden flex flex-col justify-end transition-all h-full">
                          <div
                            className={`w-full rounded-t-xl transition-all duration-500 ${
                              isToday
                                ? 'bg-gradient-to-t from-blue-700 to-indigo-500 shadow-md shadow-blue-500/30'
                                : 'bg-gradient-to-t from-blue-600/85 to-blue-400 group-hover:from-blue-600 group-hover:to-blue-500'
                            }`}
                            style={{ height: `${heightPercent}%` }}
                          ></div>
                        </div>
                        <div className="text-center mt-2 w-full">
                          <span className={`block text-[10px] font-semibold truncate ${isToday ? 'text-blue-700 font-extrabold' : 'text-slate-600'}`}>
                            {isToday ? 'Hari Ini' : day.label.split(',')[0]}
                          </span>
                          <span className="block text-[9px] text-slate-400">
                            {day.pageViews} hits
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-7 flex items-center justify-center h-full text-xs text-slate-400">
                    Belum ada riwayat kunjungan.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/70 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Halaman Paling Sering Dikunjungi</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Distribusi lalu lintas berdasarkan rute publik
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {stats?.visitors?.topPages && stats.visitors.topPages.length > 0 ? (
                stats.visitors.topPages.map((page) => {
                  const maxPageViews = Math.max(1, ...(stats?.visitors?.topPages?.map((p) => p.views) || [1]));
                  const widthPercent = Math.max(8, Math.round((page.views / maxPageViews) * 100));
                  return (
                    <div key={page.path} className="bg-white p-3 rounded-xl border border-slate-200/70 space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between text-xs">
                        <div className="truncate mr-2">
                          <span className="font-bold text-slate-800 block truncate">{page.label}</span>
                          <span className="text-[10px] text-slate-400 font-mono block truncate">{page.path}</span>
                        </div>
                        <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md text-[11px] shrink-0">
                          {page.views.toLocaleString('id-ID')} views
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${widthPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  Belum ada log halaman tercatat.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Distribusi Jenjang Sekolah Binaan</h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Sekolah Dasar (SD)</span>
                <span>{stats?.sekolahJenjang.SD || 0} Sekolah</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{
                    width: `${
                      stats?.totalSekolah ? ((stats.sekolahJenjang.SD || 0) / stats.totalSekolah) * 100 : 0
                    }%`
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Taman Kanak-Kanak (TK)</span>
                <span>{stats?.sekolahJenjang.TK || 0} Satuan</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full"
                  style={{
                    width: `${
                      stats?.totalSekolah ? ((stats.sekolahJenjang.TK || 0) / stats.totalSekolah) * 100 : 0
                    }%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Status Kepegawaian Guru Terdata</h3>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 bg-blue-50 rounded-xl">
              <span className="font-extrabold text-blue-700 text-lg block">
                {stats?.guruStatus.PNS || 0}
              </span>
              <span className="text-slate-600 text-[10px]">PNS</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <span className="font-extrabold text-emerald-700 text-lg block">
                {stats?.guruStatus.PPPK || 0}
              </span>
              <span className="text-slate-600 text-[10px]">PPPK</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <span className="font-extrabold text-amber-700 text-lg block">
                {stats?.guruStatus.Honorer || 0}
              </span>
              <span className="text-slate-600 text-[10px]">Honorer/Lainnya</span>
            </div>
          </div>
        </div>
      </div>

      {/* Backup & Restore Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onShowToast={onShowToast || ((msg) => console.log(msg))}
        onRestoreSuccess={handleRefresh}
      />
    </div>
  );
};
