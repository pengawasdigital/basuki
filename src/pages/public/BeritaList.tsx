import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Calendar, User, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { Berita } from '../../types';

interface BeritaListProps {
  onNavigate: (path: string) => void;
}

export const BeritaList: React.FC<BeritaListProps> = ({ onNavigate }) => {
  const [news, setNews] = useState<Berita[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [kategori, setKategori] = useState('SEMUA');

  const categories = [
    'SEMUA',
    'APK Digital',
    'Pengawasan',
    'Pendampingan',
    'Sekolah',
    'Pendidikan',
    'Pengumuman',
    'Kegiatan',
    'Prestasi'
  ];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await api.getNews({
          search: searchTerm,
          kategori: kategori,
          publishOnly: true
        });
        setNews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load news:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [searchTerm, kategori]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">
          Warta & Informasi Resmi
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Berita, Supervisi & Informasi Pendidikan
        </h1>
        <p className="text-sm text-slate-500 max-w-3xl">
          Dokumentasi pendampingan, kebijakan pengawas pembina, dan inovasi pembelajaran dari satuan pendidikan.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Cari judul berita, topik, atau kata kunci..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto w-full md:w-auto">
          {categories.map((kat) => (
            <button
              key={kat}
              onClick={() => setKategori(kat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                kategori === kat
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {kat}
            </button>
          ))}
        </div>
      </div>

      {/* News Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium">Memuat warta berita...</p>
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-lg">Tidak ada berita yang ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1">
            Silakan ubah kata kunci pencarian atau pilih kategori lain.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <article
              key={item.id}
              onClick={() => onNavigate(`/berita/${item.slug}`)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col group cursor-pointer"
            >
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={
                    item.thumbnail ||
                    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800'
                  }
                  alt={item.judul}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-700 text-white shadow-xs">
                  {item.kategori}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-xs sm:text-sm text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{new Date(item.tanggal).toLocaleDateString('id-ID')}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{item.penulis}</span>
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {item.judul}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 line-clamp-3 leading-relaxed">
                    {item.ringkasan || item.konten}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-emerald-700">
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
