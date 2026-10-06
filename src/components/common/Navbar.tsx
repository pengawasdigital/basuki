import React, { useState } from 'react';
import {
  School,
  User,
  BookOpen,
  Image as ImageIcon,
  Trophy,
  PhoneCall,
  Search,
  Menu,
  X,
  Lock,
  LayoutDashboard,
  Users,
  UserCheck,
  BookMarked
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, onOpenSearch }) => {
  const { settings } = useSettings();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Beranda', path: '/' },
    { label: 'Profil Pengawas', path: '/profil-pengawas', icon: User },
    { label: 'Sekolah Binaan', path: '/sekolah', icon: School },
    { label: 'Berita & Info', path: '/berita', icon: BookOpen },
    { label: 'Galeri Media', path: '/galeri', icon: ImageIcon },
    { label: 'Prestasi', path: '/prestasi', icon: Trophy },
    { label: 'Data Kepala Sekolah', path: '/kepala-sekolah', icon: UserCheck },
    { label: 'Data Guru', path: '/guru', icon: Users },
    { label: 'Buku Tamu', path: '/buku-tamu', icon: BookMarked },
    { label: 'Kontak & Lokasi', path: '/kontak', icon: PhoneCall }
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      {/* Top Banner Bar for Official Identity */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-900 text-white text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center tracking-wide">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-200">
              Wilayah Pembinaan Pendidikan TK & SD • {settings?.kecamatan || 'Kecamatan'}, {settings?.kabupaten || 'Kabupaten'}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-slate-300">
            <span>Email: <a href={`mailto:${settings?.email || 'digitalpengawas@gmail.com'}`} className="hover:text-white underline">{settings?.email || 'digitalpengawas@gmail.com'}</a></span>
            <span>•</span>
            <span>WA: <a href={`https://wa.me/${settings?.whatsapp || '085761120929'}`} target="_blank" rel="noreferrer" className="hover:text-emerald-300 font-semibold">{settings?.telepon || '085761120929'}</a></span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand Logo & Name */}
          <button
            onClick={() => handleLinkClick('/')}
            className="flex items-center space-x-3 text-left group focus:outline-hidden cursor-pointer"
          >
            <div className="w-12 h-12 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img
                src={settings?.logo || '/logo-kampar.png'}
                alt="Logo Portal Pengawas"
                className="max-h-12 max-w-12 w-auto h-auto object-contain drop-shadow-xs"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/logo-kampar.png';
                }}
              />
            </div>
            <div>
              <span className="block font-extrabold text-lg sm:text-xl text-blue-950 tracking-tight leading-tight group-hover:text-blue-700 transition-colors">
                {settings?.namaPortal || 'PORTAL PENGAWAS SEKOLAH'}
              </span>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {settings?.jenjang || 'TK / SD'} • {settings?.namaPengawas || 'Pengawas Sekolah'}
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1 font-medium text-sm text-slate-700">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
              return (
                <button
                  key={link.path}
                  onClick={() => handleLinkClick(link.path)}
                  className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold border-b-2 border-blue-600'
                      : 'hover:text-blue-700 hover:bg-slate-100/70 text-slate-600'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons: Global Search & Admin Login */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={onOpenSearch}
              className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200/80 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer transition-colors"
              title="Pencarian Global (Sekolah, Guru, Berita, Prestasi)"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Cari data...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-300 rounded shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => handleLinkClick('/admin')}
                className="flex items-center space-x-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 px-4 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-300" />
                <span>Dashboard Admin</span>
              </button>
            ) : (
              <button
                onClick={() => handleLinkClick('/admin/login')}
                className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-blue-800 bg-white hover:bg-blue-50/80 border border-slate-300 px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Login Admin</span>
              </button>
            )}
          </div>

          {/* Mobile Menu & Search Button */}
          <div className="flex items-center space-x-2 xl:hidden">
            <button
              onClick={onOpenSearch}
              className="p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              aria-label="Pencarian"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-lg focus:outline-hidden cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="text-xs font-medium text-slate-500 py-1 border-b border-slate-100 mb-2">
            Menu Navigasi Portal
          </div>
          {navLinks.map((link) => {
            const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
            return (
              <button
                key={link.path}
                onClick={() => handleLinkClick(link.path)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-blue-700'
                }`}
              >
                <span>{link.label}</span>
                {link.icon && <link.icon className="w-4 h-4 text-slate-400" />}
              </button>
            );
          })}
          <div className="pt-3 border-t border-slate-100 mt-2 flex flex-col space-y-2">
            {isAuthenticated ? (
              <button
                onClick={() => handleLinkClick('/admin')}
                className="w-full flex items-center justify-center space-x-2 text-sm font-semibold text-white bg-blue-700 py-2.5 rounded-lg shadow-sm cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-300" />
                <span>Buka Dashboard Admin</span>
              </button>
            ) : (
              <button
                onClick={() => handleLinkClick('/admin/login')}
                className="w-full flex items-center justify-center space-x-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-blue-50 py-2.5 rounded-lg border border-slate-200 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Masuk Dashboard Administrator</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
