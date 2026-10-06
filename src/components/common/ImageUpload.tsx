import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
  helperText?: string;
  className?: string;
  folder?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  value,
  onChange,
  required = false,
  aspectRatio = 'auto',
  helperText,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploadError(null);

    // Validate type (JPG, JPEG, PNG, WEBP)
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const validMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/pjpeg', 'image/webp'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!validExtensions.includes(ext) && !validMimes.includes(file.type)) {
      setUploadError('Hanya format file JPG, JPEG, PNG, atau WEBP yang diperbolehkan.');
      return;
    }

    // Validate size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('Ukuran file gambar maksimal 10MB.');
      return;
    }

    setIsUploading(true);
    try {
      const res = await api.uploadFile(file);
      onChange(res.url);
      setUploadError(null);
    } catch (err: any) {
      // Fallback: If network / server error, read as data URL (Base64) to ensure image is always preserved
      try {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            onChange(reader.result);
            setUploadError(null);
          }
        };
        reader.readAsDataURL(file);
      } catch {
        setUploadError(err?.message || 'Gagal mengunggah gambar. Silakan coba lagi.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setUploadError(null);
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square max-h-48';
      case 'video':
        return 'aspect-video max-h-48';
      case 'wide':
        return 'aspect-16/9 max-h-44';
      default:
        return 'h-40';
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="font-semibold text-slate-700 block text-xs">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {value && (
          <span className="text-[11px] text-emerald-600 font-medium flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Foto terpasang</span>
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleInputChange}
      />

      {value ? (
        <div className="relative group rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden transition-all shadow-xs">
          <div className={`w-full flex items-center justify-center p-2 ${getAspectClass()}`}>
            <img
              src={value}
              alt={label}
              className="max-h-full max-w-full object-contain rounded-xl shadow-xs"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.onerror = null;
                target.src =
                  'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80';
              }}
            />
          </div>

          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3 py-1.5 bg-white text-slate-800 hover:bg-slate-100 rounded-xl text-xs font-semibold shadow-md flex items-center space-x-1.5 transition cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-blue-600" />
              <span>Ganti Foto</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition cursor-pointer"
              title="Hapus Foto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isUploading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-2 z-10">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="text-xs font-semibold text-slate-700">Mengunggah file...</span>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[120px] ${
            isDragging
              ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
              : 'border-slate-200 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/20'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2 py-2">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="text-xs font-medium text-slate-600">Mengunggah foto...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-1.5 py-1">
              <div className="w-10 h-10 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center shadow-xs">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-700">
                Pilih atau Seret Foto ke Sini
              </div>
              <p className="text-[11px] text-slate-500">
                Format: <strong>JPG, JPEG, PNG, WEBP</strong> (Maksimal 10MB)
              </p>
            </div>
          )}
        </div>
      )}

      {uploadError ? (
        <p className="text-[11px] text-red-600 font-medium">{uploadError}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};
