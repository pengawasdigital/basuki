import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Video, Play } from 'lucide-react';
import { api } from '../../services/api';
import { Galeri } from '../../types';

interface GaleriListProps {
  onOpenLightbox: (item: Galeri) => void;
}

export const GaleriList: React.FC<GaleriListProps> = ({ onOpenLightbox }) => {
  const [items, setItems] = useState<Galeri[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeJenis, setActiveJenis] = useState<'SEMUA' | 'FOTO' | 'VIDEO'>('SEMUA');
  const [activeKategori, setActiveKategori] = useState('SEMUA');

  const categories = [
    'SEMUA',
    'Pendampingan',
    'Supervisi',
    'Rapat',
    'Pelatihan',
    'Workshop',
    'Kegiatan Sekolah',
    'Prestasi',
    'Kegiatan Siswa',
    'Lainnya'
  ];

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const data = await api.getGallery({
          jenis: activeJenis,
          kategori: activeKategori
        });
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load gallery:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [activeJenis, activeKategori]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-600 block">
          Dokumentasi Visual
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Galeri Media & Kegiatan Pengawasan
        </h1>
        <p className="text-base text-slate-600 max-w-3xl leading-relaxed">
          Dokumentasi autentik pendampingan satuan pendidikan, supervisi pembelajaran, pelatihan guru, dan kegiatan siswa di wilayah binaan.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Media type buttons */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={() => setActiveJenis('SEMUA')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeJenis === 'SEMUA'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Media
          </button>
          <button
            onClick={() => setActiveJenis('FOTO')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeJenis === 'FOTO'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Foto</span>
          </button>
          <button
            onClick={() => setActiveJenis('VIDEO')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeJenis === 'VIDEO'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video</span>
          </button>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((kat) => (
            <button
              key={kat}
              onClick={() => setActiveKategori(kat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeKategori === kat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {kat}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium">Memuat dokumentasi galeri...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-lg">Belum ada dokumentasi media</h3>
          <p className="text-xs text-slate-500 mt-1">
            Silakan pilih filter lain atau tunggu pembaruan dari administrator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenLightbox(item)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-purple-300 transition-all flex flex-col group cursor-pointer"
            >
              <div className="relative h-48 bg-slate-900 overflow-hidden">
                <img
                  src={
                    item.url.includes('youtube.com') || item.url.includes('youtu.be')
                      ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'
                      : item.url
                  }
                  alt={item.judul}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {item.jenis === 'VIDEO' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 ml-0.5" />
                    </div>
                  </div>
                )}
                <div className="absolute top-3 left-3 flex space-x-1.5">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-700 text-white shadow-xs">
                    {item.kategori}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900/80 text-white backdrop-blur-xs">
                    {item.jenis}
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-base leading-snug group-hover:text-purple-700 transition-colors line-clamp-2">
                    {item.judul}
                  </h4>
                  {item.deskripsi && (
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2 leading-relaxed">{item.deskripsi}</p>
                  )}
                </div>
                <div className="pt-2 text-xs text-slate-500">
                  {new Date(item.tanggal).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
