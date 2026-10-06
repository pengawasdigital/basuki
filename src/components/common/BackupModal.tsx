import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  Upload,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  X,
  HardDrive,
  Info
} from 'lucide-react';
import { api } from '../../services/api';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
  onRestoreSuccess?: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onRestoreSuccess
}) => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [downloadingJson, setDownloadingJson] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const data = await api.getBackupSummary();
      setSummary(data);
    } catch (err: any) {
      console.error('Failed to load backup summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSummary();
      setSelectedFile(null);
      setPreviewData(null);
      setConfirmRestore(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadJson = async () => {
    setDownloadingJson(true);
    try {
      await api.downloadBackupJson();
      onShowToast('File cadangan database (.JSON) berhasil diunduh ke perangkat Anda!', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Gagal mengunduh cadangan JSON.', 'error');
    } finally {
      setDownloadingJson(false);
    }
  };

  const handleDownloadExcel = async () => {
    setDownloadingExcel(true);
    try {
      await api.downloadBackupExcel();
      onShowToast('Arsip data Excel (.XLSX) berhasil diekspor dan diunduh!', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Gagal mengekspor data Excel.', 'error');
    } finally {
      setDownloadingExcel(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      onShowToast('File cadangan harus berformat .JSON', 'error');
      return;
    }
    setSelectedFile(file);
    setConfirmRestore(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const db = parsed.database || parsed.data || parsed;
        setPreviewData({
          appName: parsed.app || 'Portal Pengawas',
          exportedAt: parsed.exportedAt || null,
          sekolahCount: db.sekolah ? db.sekolah.length : 0,
          kepalaSekolahCount: db.kepalaSekolah ? db.kepalaSekolah.length : 0,
          guruCount: db.guru ? db.guru.length : 0,
          prestasiCount: db.prestasi ? db.prestasi.length : 0,
          beritaCount: db.berita ? db.berita.length : 0
        });
      } catch {
        onShowToast('File tidak valid atau format JSON rusak.', 'error');
        setSelectedFile(null);
        setPreviewData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = async () => {
    if (!selectedFile) return;
    setRestoring(true);
    try {
      const result = await api.restoreBackup(selectedFile);
      onShowToast(
        result.message || 'Database berhasil dipulihkan dari cadangan! Data lama telah diperbarui.',
        'success'
      );
      if (onRestoreSuccess) {
        onRestoreSuccess();
      }
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      onShowToast(err.message || 'Gagal memulihkan database.', 'error');
      setRestoring(false);
    }
  };

  const counts = summary?.counts || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center border-b border-slate-200/80 px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <HardDrive className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                Cadangan & Pemulihan Basis Data (Backup & Restore)
              </h3>
              <p className="text-xs text-blue-200">
                Amankan seluruh data website agar aman dan tidak hilang saat pengembangan sistem
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6 text-xs overscroll-contain">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-amber-900">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-xs block">
                Fungsi Cadangan Data Sistem (Database Snapshot)
              </span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Fitur ini mengambil seluruh data yang telah di-input pada portal (Satuan Pendidikan Binaan, Kepala Sekolah, Dewan Guru, Prestasi, Berita, Pengumuman, Galeri, Profil Pengawas, Buku Tamu, dan Pengaturan).
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5 text-xs">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span>Status Data Saat Ini di Database</span>
              </span>
              <button
                type="button"
                onClick={fetchSummary}
                disabled={loading}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Segarkan Status</span>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center">
                <span className="block text-[10px] text-slate-500 font-medium">Sekolah Binaan</span>
                <span className="text-base font-extrabold text-blue-900">{counts.sekolah ?? 0}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center">
                <span className="block text-[10px] text-slate-500 font-medium">Kepala Sekolah</span>
                <span className="text-base font-extrabold text-indigo-900">{counts.kepalaSekolah ?? 0}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center">
                <span className="block text-[10px] text-slate-500 font-medium">Dewan Guru</span>
                <span className="text-base font-extrabold text-emerald-900">{counts.guru ?? 0}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center">
                <span className="block text-[10px] text-slate-500 font-medium">Prestasi Siswa</span>
                <span className="text-base font-extrabold text-amber-900">{counts.prestasi ?? 0}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center">
                <span className="block text-[10px] text-slate-500 font-medium">Warta & Berita</span>
                <span className="text-base font-extrabold text-slate-900">{counts.berita ?? 0}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center">
                <span className="block text-[10px] text-slate-500 font-medium">Galeri Media</span>
                <span className="text-base font-extrabold text-purple-900">{counts.galeri ?? 0}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center">
                <span className="block text-[10px] text-slate-500 font-medium">Pengumuman</span>
                <span className="text-base font-extrabold text-rose-900">{counts.pengumuman ?? 0}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center">
                <span className="block text-[10px] text-slate-500 font-medium">Buku Tamu</span>
                <span className="text-base font-extrabold text-blue-700">{counts.bukuTamu ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Download options */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
              <Download className="w-4 h-4 text-blue-600" />
              <span>1. Ambil & Unduh Cadangan Data (Backup)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs block">
                        Backup Penuh (.JSON)
                      </span>
                      <span className="text-[10px] text-blue-700 font-semibold">
                        Direkomendasikan untuk Pemulihan Sistem
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Menyimpan 100% struktur data asli persis seperti saat ini.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  disabled={downloadingJson}
                  className="w-full inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 px-3 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Download className={`w-4 h-4 ${downloadingJson ? 'animate-bounce' : ''}`} />
                  <span>{downloadingJson ? 'Mengunduh...' : 'Unduh Backup (.JSON)'}</span>
                </button>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs block">
                        Salinan Dokumen Excel (.XLSX)
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        Untuk Arsip Dinas & Cetak Laporan
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Mengekspor seluruh tabel (Sekolah, Kepala Sekolah, Guru, Prestasi, Berita, Buku Tamu) ke Excel.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadExcel}
                  disabled={downloadingExcel}
                  className="w-full inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-2.5 px-3 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Download className={`w-4 h-4 ${downloadingExcel ? 'animate-bounce' : ''}`} />
                  <span>{downloadingExcel ? 'Mengekspor...' : 'Unduh Salinan Excel (.XLSX)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Restore option */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>2. Pulihkan Data dari File Cadangan (Restore Database)</span>
            </h4>
            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-4 bg-slate-50/60 text-center transition-colors">
              <input
                type="file"
                id="restore-file-input"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="restore-file-input"
                className="cursor-pointer block space-y-2"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-indigo-600 hover:underline">
                    Klik untuk memilih file cadangan (.JSON)
                  </span>
                </div>
              </label>

              {selectedFile && (
                <div className="mt-3 p-3 bg-white border border-indigo-200 rounded-xl text-left space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center space-x-1.5 text-xs">
                      <FileCode className="w-4 h-4 text-blue-600" />
                      <span>{selectedFile.name}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  {previewData && (
                    <div className="bg-indigo-50/70 p-2.5 rounded-lg text-[11px] text-indigo-900 space-y-1">
                      <span className="font-bold block">Pratinjau Isi Cadangan Terdeteksi:</span>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-slate-700">
                        <span>• Satuan Pendidikan: <strong>{previewData.sekolahCount}</strong></span>
                        <span>• Kepala Sekolah: <strong>{previewData.kepalaSekolahCount}</strong></span>
                        <span>• Dewan Guru: <strong>{previewData.guruCount}</strong></span>
                        <span>• Prestasi: <strong>{previewData.prestasiCount}</strong></span>
                        <span>• Berita: <strong>{previewData.beritaCount}</strong></span>
                      </div>
                    </div>
                  )}

                  {!confirmRestore ? (
                    <button
                      type="button"
                      onClick={() => setConfirmRestore(true)}
                      className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Lanjutkan Pemulihan Database &rarr;
                    </button>
                  ) : (
                    <div className="pt-2 border-t border-indigo-100 space-y-2">
                      <div className="flex items-start space-x-2 bg-rose-50 border border-rose-200 p-2.5 rounded-lg text-rose-900 text-[11px]">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Perhatian:</strong> Memulihkan database akan menggantikan data yang ada saat ini.
                        </span>
                      </div>
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setConfirmRestore(false)}
                          disabled={restoring}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleExecuteRestore}
                          disabled={restoring}
                          className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5"
                        >
                          {restoring && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                          <span>{restoring ? 'Memulihkan Data...' : 'Ya, Pulihkan Sekarang'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-200/80 shrink-0">
          <span className="text-[11px] text-slate-500 flex items-center space-x-1">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>Cadangan data otomatis terlindungi enkripsi dan struktur JSON terstandar.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
