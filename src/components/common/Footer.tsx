import React, { useState, useEffect } from 'react';
import {
  School,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Send,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { api } from '../../services/api';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings, pengawas } = useSettings();
  const [visitorSummary, setVisitorSummary] = useState<{
    todayVisitors: number;
    totalVisitors: number;
    totalPageViews: number;
  } | null>(null);

  useEffect(() => {
    api.getVisitorSummary()
      .then((data) => {
        if (data) {
          setVisitorSummary({
            todayVisitors: data.todayVisitors || 0,
            totalVisitors: data.totalVisitors || 0,
            totalPageViews: data.totalPageViews || 0
          });
        }
      })
      .catch(() => {
        // Silently keep fallback
      });
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Identity & Description */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center shrink-0">
                <img
                  src={settings?.logo || '/logo-kampar.png'}
                  alt="Logo Kabupaten Kampar"
                  className="max-h-10 max-w-10 w-auto h-auto object-contain drop-shadow-xs"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/logo-kampar.png';
                  }}
                />
              </div>
              <div>
                <span className="font-bold text-white text-base tracking-tight block">
                  {settings?.namaPortal || 'PORTAL PENGAWAS SEKOLAH'}
                </span>
                <span className="text-xs text-blue-400 font-medium">
                  {settings?.jenjang || 'Pengawas Sekolah TK/SD'}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {settings?.subjudul || 'Informasi, Pendampingan, Dokumentasi dan Pengembangan Mutu Satuan Pendidikan'}
            </p>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs space-y-1">
              <span className="text-slate-400 block font-medium">Pengawas Pembina:</span>
              <span className="text-white font-semibold text-sm block">
                {pengawas?.nama
                  ? (pengawas.gelar ? `${pengawas.nama}, ${pengawas.gelar}` : pengawas.nama)
                  : (settings?.namaPengawas || 'Pengawas Pembina')}
              </span>
              <span className="text-blue-300 block text-xs">
                NIP. {pengawas?.nip || settings?.nipPengawas || '-'}
              </span>
            </div>
          </div>

          {/* Column 2: Navigasi Cepat */}
          <div className="space-y-4">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider border-b border-slate-800 pb-2">
              Navigasi Utama
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Beranda Portal', path: '/' },
                { label: 'Profil Pengawas', path: '/profil-pengawas' },
                { label: 'Sekolah Binaan', path: '/sekolah' },
                { label: 'Berita & Artikel', path: '/berita' },
                { label: 'Galeri Kegiatan', path: '/galeri' },
                { label: 'Prestasi Sekolah', path: '/prestasi' },
                { label: 'Data Kepala Sekolah', path: '/kepala-sekolah' },
                { label: 'Data Guru', path: '/guru' },
                { label: 'Buku Tamu', path: '/buku-tamu' },
                { label: 'Kontak & Lokasi', path: '/kontak' }
              ].map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => onNavigate(item.path)}
                    className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer group text-left"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Link Layanan & Mutu */}
          <div className="space-y-4">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider border-b border-slate-800 pb-2">
              Layanan Pendidikan
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Supervisi Akademik & Manajerial</span>
              </li>
              <li className="flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Pendampingan Kurikulum Merdeka</span>
              </li>
              <li className="flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Evaluasi & Analisis Rapor Pendidikan</span>
              </li>
              <li className="flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Pembinaan Berkelanjutan Kepala Sekolah & Guru</span>
              </li>
            </ul>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('/admin/login')}
                className="inline-flex items-center space-x-2 text-xs font-semibold text-blue-400 hover:text-blue-300 underline cursor-pointer"
              >
                <span>Akses Dashboard Administrator</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Column 4: Kontak & Media Sosial */}
          <div className="space-y-4">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider border-b border-slate-800 pb-2">
              Hubungi Kami
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                <span>
                  {settings?.alamat || 'Korwil Perhentian Raja Jl. Pekanbaru - Taluk Kuantan'}
                  <br />
                  <span className="text-slate-400 font-medium">
                    Kec. {settings?.kecamatan || 'Perhentian Raja'}, Kab. {settings?.kabupaten || 'Kampar'}, {settings?.provinsi || 'Riau'}
                  </span>
                </span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a
                  href={`mailto:${settings?.email || 'digitalpengawas@gmail.com'}`}
                  className="hover:text-white transition-colors underline"
                >
                  {settings?.email || 'digitalpengawas@gmail.com'}
                </a>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${settings?.whatsapp || '085761120929'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-300 transition-colors font-medium"
                >
                  {settings?.telepon || '085761120929'}
                </a>
              </li>
            </ul>

            {/* Social Media Icons */}
            <div className="pt-2">
              <span className="text-xs text-slate-400 block mb-2 font-medium">Saluran Media Resmi:</span>
              <div className="flex items-center space-x-2.5">
                {settings?.facebook && (
                  <a
                    href={settings.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {settings?.instagram && (
                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {settings?.youtube && (
                  <a
                    href={settings.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
                {settings?.whatsapp && (
                  <a
                    href={`https://wa.me/${settings.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                    aria-label="WhatsApp"
                  >
                    <Send className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <div>
            <span className="font-semibold text-slate-300">© 2026 Portal Pengawas Sekolah</span>
            <span className="hidden sm:inline mx-2">•</span>
            <span>Informasi, Pendampingan, Dokumentasi dan Pengembangan Mutu Satuan Pendidikan</span>
          </div>

          {/* Visitor Counter Widget */}
          {visitorSummary && (
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 bg-slate-900/90 px-3.5 py-1.5 rounded-full border border-slate-800 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Hari Ini: <strong className="text-white font-bold">{visitorSummary.todayVisitors.toLocaleString('id-ID')}</strong></span>
              <span className="text-slate-700">|</span>
              <span>Total Pengunjung: <strong className="text-blue-400 font-bold">{visitorSummary.totalVisitors.toLocaleString('id-ID')}</strong></span>
              <span className="text-slate-700">|</span>
              <span>Hits: <strong className="text-slate-300 font-semibold">{visitorSummary.totalPageViews.toLocaleString('id-ID')}</strong></span>
            </div>
          )}

          <div className="text-slate-400">
            <span>Pengawas Sekolah TK/SD • </span>
            <a href="mailto:digitalpengawas@gmail.com" className="text-blue-400 hover:underline">
              digitalpengawas@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
