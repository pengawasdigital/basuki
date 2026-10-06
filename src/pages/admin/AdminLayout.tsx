import React, { useState } from 'react';
import {
  LayoutDashboard,
  User,
  School,
  FileText,
  Network,
  Building,
  Award,
  Crown,
  Users,
  Trophy,
  BookOpen,
  BellRing,
  Image as ImageIcon,
  MessageSquare,
  Settings,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  Database,
  BookMarked
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { BackupModal } from '../../components/common/BackupModal';

interface AdminLayoutProps {
  currentSection: string;
  onSelectSection: (section: string) => void;
  onNavigatePublic: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentSection,
  onSelectSection,
  onNavigatePublic,
  children
}) => {
  const { admin, logout } = useAuth();
  const { settings } = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pengawas', label: 'Profil Pengawas', icon: User },
    { id: 'sekolah', label: 'Sekolah Binaan', icon: School },
    { id: 'visimisi', label: 'Visi & Misi Sekolah', icon: FileText },
    { id: 'struktur', label: 'Struktur Organisasi', icon: Network },
    { id: 'fasilitas', label: 'Fasilitas Sekolah', icon: Building },
    { id: 'keunggulan', label: 'Keunggulan Sekolah', icon: Award },
    { id: 'kepalaSekolah', label: 'Daftar Kepala Sekolah', icon: Crown },
    { id: 'guru', label: 'Data Guru', icon: Users },
    { id: 'prestasi', label: 'Prestasi Sekolah', icon: Trophy },
    { id: 'berita', label: 'Berita', icon: BookOpen },
    { id: 'pengumuman', label: 'Pengumuman', icon: BellRing },
    { id: 'galeri', label: 'Galeri Media', icon: ImageIcon },
    { id: 'kontak', label: 'Pesan Kontak', icon: MessageSquare },
    { id: 'bukuTamu', label: 'Buku Tamu', icon: BookMarked },
    { id: 'settings', label: 'Pengaturan Website', icon: Settings },
    { id: 'backup', label: 'Backup & Restore', icon: Database },
    { id: 'security', label: 'Manajemen Admin', icon: ShieldCheck }
  ];

  const handleSelect = (id: string) => {
    if (id === 'backup') {
      setIsBackupOpen(true);
      setSidebarOpen(false);
      return;
    }
    onSelectSection(id);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800">
        <div className="px-4 sm:px-6 flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <img
                  src={settings?.logo || '/logo-kampar.png'}
                  alt="Logo Kabupaten Kampar"
                  className="max-h-8 max-w-8 w-auto h-auto object-contain"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/logo-kampar.png';
                  }}
                />
              </div>
              <div>
                <span className="font-extrabold text-sm block tracking-tight">
                  PANEL ADMINISTRATOR
                </span>
                <span className="text-[10px] text-blue-300 block -mt-0.5">
                  {settings?.namaPortal || 'Portal Pengawas Sekolah'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setIsBackupOpen(true)}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-amber-300 hover:text-amber-100 bg-amber-950/70 hover:bg-amber-900/90 px-3 py-1.5 rounded-lg border border-amber-800/80 transition-colors cursor-pointer"
              title="Ambil dan unduh cadangan database website"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Backup Data</span>
            </button>
            <button
              onClick={() => onNavigatePublic('/')}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              <span>Lihat Website Publik</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <div className="hidden sm:flex items-center space-x-2 pl-3 border-l border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300 font-medium">{admin?.name || 'Administrator'}</span>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-950/60 hover:bg-rose-900/80 px-3 py-1.5 rounded-lg border border-rose-800/80 transition-colors cursor-pointer"
              title="Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 transform lg:static lg:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col pt-16 lg:pt-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-3 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Pengelolaan
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-none">
            {menuItems.map((item) => {
              const active = currentSection === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-amber-300' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
            <span className="block text-[11px] text-slate-400 font-semibold">Portal Pengawas Supabase</span>
            <span className="block text-[10px] text-slate-600 mt-0.5">PostgreSQL & Auth Terintegrasi</span>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onShowToast={(msg, type) => {
          console.log(`[Backup ${type}]: ${msg}`);
        }}
      />
    </div>
  );
};
