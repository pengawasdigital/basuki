import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Galeri } from '../../types';

interface LightboxModalProps {
  item: Galeri | null;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const isVideo = item.jenis === 'VIDEO';
  let videoEmbedUrl = '';

  if (isVideo && item.url) {
    if (item.url.includes('youtube.com/watch?v=')) {
      const videoId = item.url.split('v=')[1]?.split('&')[0];
      videoEmbedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    } else if (item.url.includes('youtu.be/')) {
      const videoId = item.url.split('youtu.be/')[1]?.split('?')[0];
      videoEmbedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    } else {
      videoEmbedUrl = item.url;
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950/80">
          <div>
            <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">
              {item.kategori} • {item.jenis}
            </span>
            <h3 className="text-white font-semibold text-base line-clamp-1">{item.judul}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Media Content */}
        <div className="flex-1 flex items-center justify-center bg-black overflow-hidden relative min-h-[300px] max-h-[65vh]">
          {isVideo ? (
            <div className="w-full h-full aspect-video">
              <iframe
                src={videoEmbedUrl}
                title={item.judul}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <img
              src={item.url}
              alt={item.judul}
              className="max-h-full max-w-full object-contain mx-auto"
            />
          )}
        </div>

        {/* Footer with caption */}
        <div className="p-4 bg-slate-950 text-slate-300 text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-t border-slate-800">
          <div>
            <p className="text-slate-300">{item.deskripsi || 'Tidak ada deskripsi tambahan.'}</p>
            <span className="text-xs text-slate-500 mt-1 block">
              Diunggah pada: {new Date(item.tanggal).toLocaleDateString('id-ID', { dateStyle: 'long' })}
            </span>
          </div>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300 shrink-0"
            >
              <span>Buka Tautan Asli</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
