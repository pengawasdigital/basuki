import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  School,
  BookOpen,
  Trophy,
  UserCheck,
  Image as ImageIcon,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { api } from '../../services/api';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    schools: any[];
    news: any[];
    achievements: any[];
    teachers: any[];
    gallery: any[];
  }>({
    schools: [],
    news: [],
    achievements: [],
    teachers: [],
    gallery: []
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ schools: [], news: [], achievements: [], teachers: [], gallery: [] });
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ schools: [], news: [], achievements: [], teachers: [], gallery: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const data = await api.searchGlobal(query.trim());
        setResults({
          schools: Array.isArray(data?.schools) ? data.schools : [],
          news: Array.isArray(data?.news) ? data.news : [],
          achievements: Array.isArray(data?.achievements) ? data.achievements : [],
          teachers: Array.isArray(data?.teachers) ? data.teachers : [],
          gallery: Array.isArray(data?.gallery) ? data.gallery : []
        });
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalResults =
    results.schools.length +
    results.news.length +
    results.achievements.length +
    results.teachers.length +
    results.gallery.length;

  const handleSelect = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-200 px-4 py-3.5 flex items-center bg-slate-50/70">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Cari sekolah, berita, guru, prestasi, kegiatan..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none text-slate-800 placeholder-slate-400 focus:outline-hidden text-base"
          />
          {loading && <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0 mx-2" />}
          {query && !loading && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 text-xs font-semibold text-slate-500 bg-white border border-slate-300 hover:bg-slate-100 px-2 py-1 rounded-md"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-4 space-y-5 flex-1">
          {!query.trim() && (
            <div className="text-center py-10 text-slate-400 text-sm">
              <Search className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
              <p className="font-medium text-slate-600">Pencarian Terpadu Portal Pengawas</p>
              <p className="text-xs text-slate-400 mt-1">
                Ketik nama sekolah, nama guru, judul berita, atau kata kunci lainnya.
              </p>
            </div>
          )}

          {query.trim() && totalResults === 0 && !loading && (
            <div className="text-center py-10 text-slate-500 text-sm">
              <p className="font-semibold text-slate-700">Data tidak ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">
                Tidak ada hasil yang sesuai dengan kata kunci &ldquo;{query}&rdquo;. Silakan coba istilah lain.
              </p>
            </div>
          )}

          {/* 1. Schools */}
          {results.schools.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                <School className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                <span>Sekolah Binaan ({results.schools.length})</span>
              </div>
              <div className="space-y-1">
                {results.schools.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(`/sekolah/${item.id}`)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50/70 border border-transparent hover:border-blue-100 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 text-sm group-hover:text-blue-700">
                        {item.nama}
                      </div>
                      <div className="text-xs text-slate-500">
                        NPSN: {item.npsn} • {item.jenjang} {item.status} • {item.kecamatan}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. News */}
          {results.news.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                <BookOpen className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                <span>Berita & Pengawasan ({results.news.length})</span>
              </div>
              <div className="space-y-1">
                {results.news.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(`/berita/${item.slug}`)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-100 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 text-sm group-hover:text-emerald-700 line-clamp-1">
                        {item.judul}
                      </div>
                      <div className="text-xs text-slate-500">
                        Kategori: {item.kategori} • {new Date(item.tanggal).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Achievements */}
          {results.achievements.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                <Trophy className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                <span>Prestasi Satuan Pendidikan ({results.achievements.length})</span>
              </div>
              <div className="space-y-1">
                {results.achievements.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect('/prestasi')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-amber-50/70 border border-transparent hover:border-amber-100 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 text-sm group-hover:text-amber-800">
                        {item.namaPrestasi}
                      </div>
                      <div className="text-xs text-slate-500">
                        Tingkat {item.tingkat} ({item.tahun}) • Peraih: {item.peraih}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Teachers */}
          {results.teachers.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                <UserCheck className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                <span>Data Guru ({results.teachers.length})</span>
              </div>
              <div className="space-y-1">
                {results.teachers.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(`/sekolah/${item.sekolahId}`)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-indigo-50/70 border border-transparent hover:border-indigo-100 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 text-sm group-hover:text-indigo-700">
                        {item.nama}
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.jabatan} • Mapel: {item.mapel || '-'}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. Gallery */}
          {results.gallery.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                <ImageIcon className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
                <span>Dokumentasi Galeri ({results.gallery.length})</span>
              </div>
              <div className="space-y-1">
                {results.gallery.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect('/galeri')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-purple-50/70 border border-transparent hover:border-purple-100 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 text-sm group-hover:text-purple-700">
                        {item.judul}
                      </div>
                      <div className="text-xs text-slate-500">
                        Kategori: {item.kategori} • Format: {item.jenis}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <span>Gunakan kata kunci spesifik untuk hasil lebih akurat</span>
          <span className="hidden sm:inline">Tekan ESC untuk menutup</span>
        </div>
      </div>
    </div>
  );
};
