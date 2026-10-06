import React, { useRef, useState } from 'react';
import { FileUp, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import * as XLSX from 'xlsx';

export interface ExtractedDocumentData {
  rawText: string;
  judul?: string;
  ringkasan?: string;
  isi?: string;
  rows?: any[];
  [key: string]: any;
}

export interface DocumentAutofillButtonProps {
  onExtracted: (data: ExtractedDocumentData) => void;
  onShowToast?: (msg: string, type: 'success' | 'error') => void;
  label?: string;
  entityType?: string;
}

export const DocumentAutofillButton: React.FC<DocumentAutofillButtonProps> = ({
  onExtracted,
  onShowToast,
  label = 'Unggah File Naskah (PDF, Word, Excel)'
}) => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    setLoading(true);
    try {
      let rawText = '';
      let rows: any[] = [];

      if (['xlsx', 'xls', 'csv'].includes(ext)) {
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        rawText = XLSX.utils.sheet_to_csv(sheet);
      } else {
        const serverRes = await api.parseDocument(file);
        rawText = serverRes.rawText;
        rows = serverRes.rows;
      }

      const lines = rawText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const judul = lines.length > 0 ? lines[0].replace(/^#+\s*/, '') : '';
      const ringkasan = lines.length > 1 ? lines[1] : '';
      const isi = lines.slice(1).join('\n\n');

      onExtracted({
        rawText,
        judul,
        ringkasan,
        isi: isi || rawText,
        rows
      });

      if (onShowToast) {
        onShowToast(`Isi dokumen dari ${file.name} berhasil diekstrak ke formulir!`, 'success');
      }
    } catch (err: any) {
      console.error(err);
      if (onShowToast) {
        onShowToast(err.message || 'Gagal membaca isi dokumen.', 'error');
      }
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        disabled={loading}
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center space-x-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs hover:scale-[1.01]"
        title="Otomatis mengisi bidang form dari file PDF, Word, atau Excel"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Mengekstrak Isi File...</span>
          </>
        ) : (
          <>
            <FileUp className="w-4 h-4 text-indigo-600" />
            <span>{label}</span>
          </>
        )}
      </button>
    </div>
  );
};
