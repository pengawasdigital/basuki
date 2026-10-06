import React, { useState, useEffect } from 'react';
import {
  Calendar,
  User,
  ArrowLeft,
  Printer,
  ChevronRight,
  BookOpen,
  School
} from 'lucide-react';
import { api } from '../../services/api';
import { Berita } from '../../types';

interface BeritaDetailProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const BeritaDetail: React.FC<BeritaDetailProps> = ({ slug, onNavigate }) => {
  const [news, setNews] = useState<Berita | null>(null);
  const [related, setRelated] = useState<Berita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const item = await api.getNewsBySlug(slug);
        setNews(item);
        const all = await api.getNews({ publishOnly: true });
        setRelated(Array.isArray(all) ? all.filter((b: Berita) => b.slug !== slug).slice(0, 4) : []);
      } catch (err) {
        console.error('Failed to load article:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium">Memuat naskah berita...</p>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Berita Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500 mt-1">
          Naskah berita yang Anda cari tidak tersedia atau telah diarsipkan.
        </p>
        <button
          onClick={() => onNavigate('/berita')}
          className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Kembali ke Daftar Berita
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4 mb-8 no-print">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <button onClick={() => onNavigate('/')} className="hover:text-blue-600 cursor-pointer">
            Beranda
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button onClick={() => onNavigate('/berita')} className="hover:text-blue-600 cursor-pointer">
            Berita & Pengawasan
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800 line-clamp-1">{news.judul}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('/berita')}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Artikel</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Article Body */}
        <article className="lg:col-span-8 space-y-6">
          <div className="space-y-3">
            <span className="inline-block text-xs font-bold px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              {news.kategori}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
              {news.judul}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 border-b border-slate-100 pb-4">
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>
                  {new Date(news.tanggal).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1.5">
                <User className="w-4 h-4 text-slate-400" />
                <span>Penulis: <strong>{news.penulis}</strong></span>
              </span>
              {news.sekolahNama && (
                <>
                  <span>•</span>
                  <span className="flex items-center space-x-1.5">
                    <School className="w-4 h-4 text-slate-400" />
                    <span>{news.sekolahNama}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Featured Image */}
          {news.thumbnail && (
            <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100">
              <img
                src={news.thumbnail}
                alt={news.judul}
                className="w-full max-h-[480px] object-cover"
              />
            </div>
          )}

          {/* Ringkasan Box */}
          {news.ringkasan && (
            <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50/60 border-l-4 border-emerald-600 text-slate-800 italic text-base sm:text-lg leading-relaxed font-medium">
              &ldquo;{news.ringkasan}&rdquo;
            </div>
          )}

          {/* Full Content */}
          <div className="text-slate-800 text-base sm:text-lg leading-relaxed space-y-5 whitespace-pre-line pt-2 font-normal">
            {news.konten}
          </div>

          {/* Official Sign-off Box */}
          <div className="mt-10 p-6 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-slate-600 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block text-sm">
                Portal Pengawas Sekolah TK / SD
              </span>
              <span className="block mt-0.5 text-slate-500">
                Pusat dokumentasi pendampingan dan pembinaan mutu satuan pendidikan.
              </span>
            </div>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-700 text-white rounded-lg font-semibold text-xs no-print cursor-pointer"
            >
              Cetak
            </button>
          </div>
        </article>

        {/* Sidebar: Related News */}
        <aside className="lg:col-span-4 space-y-6 no-print">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">
              Berita & Artikel Terkait
            </h3>
            <div className="space-y-4">
              {related.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigate(`/berita/${item.slug}`)}
                  className="group cursor-pointer flex space-x-3 items-start"
                >
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.judul}
                      className="w-20 h-16 rounded-xl object-cover shrink-0 bg-slate-100 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-20 h-16 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">
                      {item.kategori}
                    </span>
                    <h4 className="font-bold text-slate-800 text-xs leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {item.judul}
                    </h4>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(item.tanggal).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
