import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  X,
  Loader2,
  Check,
  School,
  FileUp,
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import {
  SupportedEntityType,
  ParsedDocumentResult,
  parseDocumentFile,
  downloadTeacherExcelTemplate,
  downloadSchoolExcelTemplate,
  downloadAchievementExcelTemplate,
  downloadPrincipalExcelTemplate
} from '../../services/documentParser';
import { api } from '../../services/api';
import { School as SchoolType } from '../../types';

interface DocumentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: SupportedEntityType;
  schools?: SchoolType[];
  preselectedSchoolId?: string;
  onSuccess: (count: number) => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const DocumentImportModal: React.FC<DocumentImportModalProps> = ({
  isOpen,
  onClose,
  entityType,
  schools = [],
  preselectedSchoolId = '',
  onSuccess,
  onShowToast
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(
    preselectedSchoolId || (schools[0]?.id ?? '')
  );
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [parseResult, setParseResult] = useState<ParsedDocumentResult | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const getEntityTitle = () => {
    switch (entityType) {
      case 'guru':
        return 'Data Dewan Guru & Tenaga Kependidikan';
      case 'sekolah':
        return 'Data Satuan Pendidikan (Sekolah Binaan)';
      case 'prestasi':
        return 'Data Prestasi Siswa & Guru';
      case 'kepalaSekolah':
        return 'Data Kepala Sekolah & Riwayat Kepemimpinan';
      default:
        return 'Dokumen Data';
    }
  };

  const handleDownloadTemplate = () => {
    if (entityType === 'guru') {
      downloadTeacherExcelTemplate();
    } else if (entityType === 'sekolah') {
      downloadSchoolExcelTemplate();
    } else if (entityType === 'prestasi') {
      downloadAchievementExcelTemplate();
    } else if (entityType === 'kepalaSekolah') {
      downloadPrincipalExcelTemplate();
    }
    onShowToast('File template berhasil diunduh. Silakan isi datanya.', 'success');
  };

  const processSelectedFile = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setParsing(true);
    try {
      const res = await parseDocumentFile(uploadedFile, entityType, selectedSchoolId);
      setParseResult(res);
      setSelectedIndices(res.mappedItems.map((_, i) => i));
      if (res.mappedItems.length === 0) {
        onShowToast(
          'File berhasil dibaca, namun format baris tidak terdeteksi otomatis. Silakan gunakan template resmi.',
          'error'
        );
      } else {
        onShowToast(
          `Berhasil mengekstrak ${res.mappedItems.length} baris data dari file ${uploadedFile.name}.`,
          'success'
        );
      }
    } catch (err: any) {
      console.error(err);
      onShowToast(err.message || 'Gagal memproses file dokumen.', 'error');
    } finally {
      setParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const toggleSelectAll = () => {
    if (!parseResult) return;
    if (selectedIndices.length === parseResult.mappedItems.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(parseResult.mappedItems.map((_, i) => i));
    }
  };

  const toggleSelectRow = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleConfirmImport = async () => {
    if (!parseResult || selectedIndices.length === 0) {
      onShowToast('Pilih minimal satu baris data untuk diimpor.', 'error');
      return;
    }
    const itemsToImport = selectedIndices.map((i) => parseResult.mappedItems[i]);
    setSubmitting(true);
    try {
      if (entityType === 'guru') {
        const res = await api.importTeachersBulk(itemsToImport, selectedSchoolId);
        onShowToast(`Sukses mengimpor ${res.count} data dewan guru!`, 'success');
        onSuccess(res.count);
        onClose();
      } else if (entityType === 'sekolah') {
        const res = await api.importSchoolsBulk(itemsToImport);
        onShowToast(`Sukses mengimpor ${res.count} data sekolah binaan!`, 'success');
        onSuccess(res.count);
        onClose();
      } else if (entityType === 'prestasi') {
        const res = await api.importAchievementsBulk(itemsToImport, selectedSchoolId);
        onShowToast(`Sukses mengimpor ${res.count} data prestasi sekolah!`, 'success');
        onSuccess(res.count);
        onClose();
      } else if (entityType === 'kepalaSekolah') {
        const res = await api.importPrincipalsBulk(itemsToImport, selectedSchoolId);
        onShowToast(`Sukses mengimpor ${res.count} data kepala sekolah!`, 'success');
        onSuccess(res.count);
        onClose();
      }
    } catch (err: any) {
      console.error('Import error:', err);
      onShowToast(err.message || 'Gagal menyimpan data impor ke database.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileSpreadsheet className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                Unggah File & Impor {getEntityTitle()}
              </h2>
              <p className="text-xs sm:text-sm text-blue-200">
                Mendukung file Excel (.xlsx, .xls, .csv), Word (.docx, .doc), dan PDF (.pdf)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Target School Selector */}
          {(entityType === 'guru' || entityType === 'prestasi') && schools.length > 0 && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <School className="w-5 h-5 text-blue-700 shrink-0" />
                <div>
                  <label className="text-xs sm:text-sm font-bold text-slate-800 block">
                    Satuan Pendidikan Tujuan Impor:
                  </label>
                  <p className="text-xs text-slate-600">
                    Data yang diunggah akan otomatis dihubungkan ke sekolah ini
                  </p>
                </div>
              </div>
              <select
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                className="bg-white border border-blue-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs cursor-pointer max-w-xs"
              >
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.npsn})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="text-xs sm:text-sm text-slate-600">
              <strong className="text-slate-800 block">Belum punya format tabel?</strong>
              Unduh template Excel resmi untuk mempermudah penyusunan data banyak baris.
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Template Excel</span>
            </button>
          </div>

          {/* Drag & Drop File Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-blue-600 bg-blue-50/80 scale-[1.01]'
                : file
                ? 'border-emerald-500 bg-emerald-50/40'
                : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.docx,.doc,.pdf,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            {parsing ? (
              <div className="flex flex-col items-center justify-center space-y-3 py-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-sm sm:text-base font-semibold text-slate-800">
                  Menganalisis & membaca isi file {file?.name}...
                </p>
                <p className="text-xs text-slate-500">Mengekstrak baris dan kolom data otomatis</p>
              </div>
            ) : file && parseResult ? (
              <div className="flex flex-col items-center justify-center space-y-2 py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">{file.name}</h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  Ukuran: {(file.size / 1024).toFixed(1)} KB • Tipe: {parseResult.fileType.toUpperCase()}
                </p>
                <span className="inline-flex items-center text-xs font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full mt-2">
                  Klik untuk mengganti file lain
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3 py-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                  <FileUp className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    Tarik & lepaskan file di sini, atau klik untuk memilih
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Format didukung: <strong>Excel (.xlsx, .xls, .csv)</strong>,{' '}
                    <strong>Word (.docx, .doc)</strong>, atau <strong>PDF (.pdf)</strong>
                  </p>
                </div>
                <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
                  Pilih Berkas Dari Komputer
                </span>
              </div>
            )}
          </div>

          {/* Extracted Preview Table */}
          {parseResult && parseResult.mappedItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Pratinjau Data Terdeteksi ({parseResult.mappedItems.length} Baris)</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Beri centang pada data yang ingin diimpor ke database portal
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleSelectAll}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200 cursor-pointer"
                  >
                    {selectedIndices.length === parseResult.mappedItems.length
                      ? 'Batalkan Semua'
                      : 'Pilih Semua'}
                  </button>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg">
                    {selectedIndices.length} Dipilih
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-60 bg-white">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[11px] sticky top-0 z-10 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedIndices.length === parseResult.mappedItems.length &&
                            parseResult.mappedItems.length > 0
                          }
                          onChange={toggleSelectAll}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </th>
                      {entityType === 'guru' && (
                        <>
                          <th className="py-2.5 px-3">Nama Lengkap</th>
                          <th className="py-2.5 px-3">NIP / NUPTK</th>
                          <th className="py-2.5 px-3">Jabatan & Mapel</th>
                          <th className="py-2.5 px-3">Pendidikan</th>
                          <th className="py-2.5 px-3">Status</th>
                        </>
                      )}
                      {entityType === 'sekolah' && (
                        <>
                          <th className="py-2.5 px-3">NPSN</th>
                          <th className="py-2.5 px-3">Nama Sekolah</th>
                          <th className="py-2.5 px-3">Jenjang & Status</th>
                          <th className="py-2.5 px-3">Kepala Sekolah</th>
                          <th className="py-2.5 px-3">Akreditasi</th>
                        </>
                      )}
                      {entityType === 'prestasi' && (
                        <>
                          <th className="py-2.5 px-3">Judul Prestasi</th>
                          <th className="py-2.5 px-3">Penerima</th>
                          <th className="py-2.5 px-3">Juara</th>
                          <th className="py-2.5 px-3">Tingkat</th>
                          <th className="py-2.5 px-3">Tahun</th>
                        </>
                      )}
                      {entityType === 'kepalaSekolah' && (
                        <>
                          <th className="py-2.5 px-3">Nama Kepala Sekolah</th>
                          <th className="py-2.5 px-3">NIP</th>
                          <th className="py-2.5 px-3">Periode Jabatan</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Keterangan</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {parseResult.mappedItems.map((item, idx) => {
                      const isSelected = selectedIndices.includes(idx);
                      return (
                        <tr
                          key={idx}
                          onClick={() => toggleSelectRow(idx)}
                          className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50/30 font-medium' : 'opacity-60'
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectRow(idx)}
                              className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          {entityType === 'guru' && (
                            <>
                              <td className="py-2.5 px-3 font-semibold text-slate-900">{item.nama}</td>
                              <td className="py-2.5 px-3 text-slate-600">
                                {item.nip ? `NIP. ${item.nip}` : item.nuptk ? `NUPTK. ${item.nuptk}` : '-'}
                              </td>
                              <td className="py-2.5 px-3">
                                {item.jabatan} {item.mapel ? `• ${item.mapel}` : ''}
                              </td>
                              <td className="py-2.5 px-3">{item.pendidikan}</td>
                              <td className="py-2.5 px-3">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold">
                                  {item.statusKepegawaian}
                                </span>
                              </td>
                            </>
                          )}
                          {entityType === 'sekolah' && (
                            <>
                              <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{item.npsn}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-900">{item.nama}</td>
                              <td className="py-2.5 px-3">
                                {item.jenjang} • {item.status}
                              </td>
                              <td className="py-2.5 px-3">{item.kepalaSekolahNama || '-'}</td>
                              <td className="py-2.5 px-3">
                                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold text-xs">
                                  {item.akreditasi || 'A'}
                                </span>
                              </td>
                            </>
                          )}
                          {entityType === 'prestasi' && (
                            <>
                              <td className="py-2.5 px-3 font-semibold text-slate-900">{item.judul}</td>
                              <td className="py-2.5 px-3 text-slate-600">{item.penerima || '-'}</td>
                              <td className="py-2.5 px-3 font-bold text-amber-700">{item.juara}</td>
                              <td className="py-2.5 px-3">
                                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold">
                                  {item.tingkat}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">{item.tahun}</td>
                            </>
                          )}
                          {entityType === 'kepalaSekolah' && (
                            <>
                              <td className="py-2.5 px-3 font-semibold text-slate-900">{item.nama}</td>
                              <td className="py-2.5 px-3 text-slate-600">{item.nip ? `NIP. ${item.nip}` : '-'}</td>
                              <td className="py-2.5 px-3 font-medium text-slate-800">{item.periode}</td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                    item.status === 'Aktif'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {item.status || 'Aktif'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-xs text-slate-500 max-w-xs truncate">
                                {item.keterangan || item.sambutan || '-'}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs sm:text-sm text-slate-500">
            {parseResult && parseResult.mappedItems.length > 0 ? (
              <span>
                Siap mengimpor <strong>{selectedIndices.length}</strong> data terpilih.
              </span>
            ) : (
              <span>Unggah file Excel, Word, atau PDF untuk mulai impor.</span>
            )}
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={submitting || !parseResult || selectedIndices.length === 0}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke Database...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>
                    Impor {selectedIndices.length > 0 ? `(${selectedIndices.length}) Data` : 'Sekarang'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
