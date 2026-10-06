import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Toast, ToastMessage } from './components/common/Toast';
import { LightboxModal } from './components/common/LightboxModal';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

// Public Pages
import { Home } from './pages/public/Home';
import { ProfilPengawas } from './pages/public/ProfilPengawas';
import { SekolahList } from './pages/public/SekolahList';
import { SekolahDetail } from './pages/public/SekolahDetail';
import { KepalaSekolahList } from './pages/public/KepalaSekolahList';
import { GuruList } from './pages/public/GuruList';
import { PrestasiList } from './pages/public/PrestasiList';
import { BeritaList } from './pages/public/BeritaList';
import { BeritaDetail } from './pages/public/BeritaDetail';
import { GaleriList } from './pages/public/GaleriList';
import { KontakLokasi } from './pages/public/KontakLokasi';
import { BukuTamuPage } from './pages/public/BukuTamuPage';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminPengawas } from './pages/admin/AdminPengawas';
import { AdminSekolah } from './pages/admin/AdminSekolah';
import { AdminVisiMisi } from './pages/admin/AdminVisiMisi';
import { AdminStruktur } from './pages/admin/AdminStruktur';
import { AdminFasilitas } from './pages/admin/AdminFasilitas';
import { AdminKeunggulan } from './pages/admin/AdminKeunggulan';
import { AdminKepalaSekolah } from './pages/admin/AdminKepalaSekolah';
import { AdminGuru } from './pages/admin/AdminGuru';
import { AdminPrestasi } from './pages/admin/AdminPrestasi';
import { AdminBerita } from './pages/admin/AdminBerita';
import { AdminPengumuman } from './pages/admin/AdminPengumuman';
import { AdminGaleri } from './pages/admin/AdminGaleri';
import { AdminKontak } from './pages/admin/AdminKontak';
import { AdminBukuTamu } from './pages/admin/AdminBukuTamu';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminSecurity } from './pages/admin/AdminSecurity';

import { Galeri } from './types';
import { api } from './services/api';

function AppContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { settings } = useSettings();

  // Navigation State
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) return hash;
    return window.location.pathname || '/';
  });

  const [adminSection, setAdminSection] = useState<string>('dashboard');
  const [lightboxItem, setLightboxItem] = useState<Galeri | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Track visit stats
  useEffect(() => {
    try {
      let visitorId = localStorage.getItem('portal_visitor_id');
      if (!visitorId) {
        visitorId = 'vis_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
        localStorage.setItem('portal_visitor_id', visitorId);
      }
      api.trackVisit({
        visitorId,
        path: currentPath,
        referrer: document.referrer || undefined
      }).catch(() => {});
    } catch {}
  }, [currentPath]);

  // Sync with browser back/forward and hashchange
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      const path = hash || window.location.pathname || '/';
      setCurrentPath(path);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.location.hash = path;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Keyboard shortcut for Global Search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Determine current route
  const isAdminRoute = currentPath.startsWith('/admin') || currentPath === '/login';
  const isLoginPage = currentPath === '/login' || currentPath === '/admin/login';

  // Render Admin Content
  const renderAdminContent = () => {
    switch (adminSection) {
      case 'dashboard':
        return <AdminDashboard onSelectSection={setAdminSection} onShowToast={showToast} />;
      case 'pengawas':
        return <AdminPengawas onShowToast={showToast} />;
      case 'sekolah':
        return <AdminSekolah onShowToast={showToast} />;
      case 'visimisi':
        return <AdminVisiMisi onShowToast={showToast} />;
      case 'struktur':
        return <AdminStruktur onShowToast={showToast} />;
      case 'fasilitas':
        return <AdminFasilitas onShowToast={showToast} />;
      case 'keunggulan':
        return <AdminKeunggulan onShowToast={showToast} />;
      case 'kepalaSekolah':
        return <AdminKepalaSekolah onShowToast={showToast} />;
      case 'guru':
        return <AdminGuru onShowToast={showToast} />;
      case 'prestasi':
        return <AdminPrestasi onShowToast={showToast} />;
      case 'berita':
        return <AdminBerita onShowToast={showToast} />;
      case 'pengumuman':
        return <AdminPengumuman onShowToast={showToast} />;
      case 'galeri':
        return <AdminGaleri onShowToast={showToast} />;
      case 'kontak':
        return <AdminKontak onShowToast={showToast} />;
      case 'bukuTamu':
        return <AdminBukuTamu onShowToast={showToast} />;
      case 'settings':
        return <AdminSettings onShowToast={showToast} />;
      case 'security':
        return <AdminSecurity onShowToast={showToast} />;
      default:
        return <AdminDashboard onSelectSection={setAdminSection} onShowToast={showToast} />;
    }
  };

  // Render Public Content
  const renderPublicPage = () => {
    if (currentPath === '/' || currentPath === '') {
      return <Home onNavigate={navigate} onOpenLightbox={setLightboxItem} />;
    }

    if (currentPath === '/profil-pengawas') {
      return <ProfilPengawas />;
    }

    if (currentPath === '/sekolah') {
      return <SekolahList onNavigate={navigate} />;
    }

    if (currentPath.startsWith('/sekolah/')) {
      const schoolId = currentPath.replace('/sekolah/', '');
      return (
        <SekolahDetail
          schoolId={schoolId}
          onNavigate={navigate}
          onOpenLightbox={setLightboxItem}
        />
      );
    }

    if (currentPath === '/kepala-sekolah') {
      return <KepalaSekolahList onNavigate={navigate} />;
    }

    if (currentPath === '/guru') {
      return <GuruList />;
    }

    if (currentPath === '/prestasi') {
      return <PrestasiList />;
    }

    if (currentPath === '/berita') {
      return <BeritaList onNavigate={navigate} />;
    }

    if (currentPath.startsWith('/berita/')) {
      const slug = currentPath.replace('/berita/', '');
      return <BeritaDetail slug={slug} onNavigate={navigate} />;
    }

    if (currentPath === '/galeri') {
      return <GaleriList onOpenLightbox={setLightboxItem} />;
    }

    if (currentPath === '/buku-tamu') {
      return <BukuTamuPage onShowToast={showToast} />;
    }

    if (currentPath === '/kontak') {
      return <KontakLokasi onShowToast={showToast} />;
    }

    // Default fallback
    return <Home onNavigate={navigate} onOpenLightbox={setLightboxItem} />;
  };

  // 1. Login Page View
  if (isLoginPage) {
    if (isAuthenticated) {
      // If already logged in, redirect to admin
      navigate('/admin');
    }
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
        <Toast toasts={toasts} onDismiss={removeToast} />
        <AdminLogin onNavigate={navigate} onShowToast={showToast} />
        <footer className="text-center py-4 text-xs text-slate-500">
          &copy; {new Date().getFullYear()} {settings?.namaPortal || 'Portal Pengawas Sekolah TK/SD'}. Hak Cipta Dilindungi.
        </footer>
      </div>
    );
  }

  // 2. Admin Workspace View
  if (isAdminRoute) {
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-400">Memuat sesi administrator...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
          <Toast toasts={toasts} onDismiss={removeToast} />
          <AdminLogin onNavigate={navigate} onShowToast={showToast} />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-100">
        <Toast toasts={toasts} onDismiss={removeToast} />
        <AdminLayout
          currentSection={adminSection}
          onSelectSection={setAdminSection}
          onNavigatePublic={navigate}
        >
          {renderAdminContent()}
        </AdminLayout>
      </div>
    );
  }

  // 3. Public Web Portal View
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Global Header & Navigation */}
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Public Content */}
      <main className="flex-1">
        {renderPublicPage()}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={navigate} />

      {/* Modals & Overlays */}
      <LightboxModal
        item={lightboxItem}
        onClose={() => setLightboxItem(null)}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={navigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </AuthProvider>
  );
}
