import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, User } from 'lucide-react';
import { api } from '../../services/api';
import { School as SchoolType } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { DocumentAutofillButton } from '../../components/common/DocumentAutofillButton';

interface AdminVisiMisiProps {
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const AdminVisiMisi: React.FC<AdminVisiMisiProps> = ({ onShowToast }) => {
  const { pengawas } = useSettings();
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [form, setForm] = useState({
    visi: '',
    misi: '',
    tujuan: '',
    programUnggulan: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getSchools().then((data) => {
      setSchools(data);
      if (data.length > 0) {
        setSelectedSchoolId(data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedSchoolId) return;
    setLoading(true);
    api.getVisionMission(selectedSchoolId)
      .then((vm) => {
        setForm({
          visi: vm.visi || '',
          misi: vm.misi || '',
          tujuan: vm.tujuan || '',
          programUnggulan: vm.programUnggulan || ''
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedSchoolId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchoolId) return;
    setSaving(true);
    try {
      await api.updateVisionMission(selectedSchoolId, form);
      onShowToast('Visi, Misi & Program Unggulan sekolah berhasil disimpan.', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Gagal menyimpan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Visi, Misi & Program Unggulan</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola arah filosofis dan program prioritas masing-masing satuan pendidikan binaan.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !selectedSchoolId}
          className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
        </button>
      </div>

      {/* Select School */}
      <div className="max-w-md">
        <label className="text-xs font-semibold text-slate-700 block mb-1">
          Pilih Satuan Pendidikan Binaan:
        </label>
        <select
          value={selectedSchoolId}
          onChange={(e) => setSelectedSchoolId(e.target.value)}
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer"
        >
          {schools.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nama} ({s.jenjang} {s.status})
            </option>
          ))}
        </select>
      </div>

      {/* Connected School Info Summary Banner */}
      {selectedSchoolId && schools.find((s) => s.id === selectedSchoolId) && (
        (() => {
          const sel = schools.find((s) => s.id === selectedSchoolId)!;
          return (
            <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-slate-50 border border-blue-200 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs shadow-xs">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{sel.nama}</span>
                  <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded text-[11px]">
                    {sel.jenjang} {sel.status}
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[11px] flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 inline mr-1" />
                    <span>Terlink Otomatis</span>
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  NPSN: <span className="font-mono font-bold text-slate-800">{sel.npsn}</span> • {sel.alamat}
                </p>
                <p className="text-slate-500 text-[11px] flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-blue-600 inline mr-1" />
                  <span>
                    Pengawas Pembina: <strong className="text-slate-800">{pengawas?.nama ? (pengawas.gelar ? `${pengawas.nama}, ${pengawas.gelar}` : pengawas.nama) : 'Basuki, S.Kom.'}</strong> (NIP. {pengawas?.nip || '-'})
                  </span>
                </p>
              </div>
              <div className="bg-white/95 px-4 py-2 rounded-xl border border-blue-200 text-[11px] text-slate-700 shadow-2xs shrink-0">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Kepala Sekolah:</span>
                <span className="font-bold text-blue-900">{sel.kepalaSekolahNama || 'Belum diisi'}</span>
              </div>
            </div>
          );
        })()
      )}

      {loading ? (
        <div className="text-center py-10 text-slate-400 text-xs">Memuat visi & misi...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-900">Impor Dokumen Visi & Misi</p>
              <p className="text-[11px] text-slate-500">Unggah berkas Word (.docx/.doc) atau PDF KOSP/Kurikulum sekolah untuk mengisi visi & misi secara otomatis</p>
            </div>
            <DocumentAutofillButton
              entityType="umum"
              label="Unggah File (Word / PDF / Excel)"
              onExtracted={(data) => {
                if (data.rawText) {
                  const text = data.rawText;
                  const visiMatch = text.match(/visi[:\s\n]+([\s\S]*?)(?=misi|tujuan|program|$)/i);
                  const misiMatch = text.match(/misi[:\s\n]+([\s\S]*?)(?=tujuan|program|sasaran|$)/i);
                  const tujuanMatch = text.match(/tujuan[:\s\n]+([\s\S]*?)(?=program|strategi|$)/i);
                  
                  setForm((prev) => ({
                    ...prev,
                    visi: visiMatch ? visiMatch[1].trim() : prev.visi || text.slice(0, 400),
                    misi: misiMatch ? misiMatch[1].trim() : prev.misi,
                    tujuan: tujuanMatch ? tujuanMatch[1].trim() : prev.tujuan,
                  }));
                  onShowToast('Naskah berhasil dibaca dari dokumen!', 'success');
                }
              }}
            />
          </div>

          <div>
            <label className="font-semibold text-slate-800 block mb-1">Visi Sekolah</label>
            <textarea
              rows={3}
              value={form.visi}
              onChange={(e) => setForm({ ...form, visi: e.target.value })}
              placeholder="Contoh: Terwujudnya peserta didik yang beriman, cerdas, berkarakter..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl resize-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-800 block mb-1">Misi Sekolah</label>
            <textarea
              rows={5}
              value={form.misi}
              onChange={(e) => setForm({ ...form, misi: e.target.value })}
              placeholder="1. Mengembangkan budaya religius...&#10;2. Menyelenggarakan pembelajaran berdiferensiasi..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">Tujuan Satuan Pendidikan</label>
              <textarea
                rows={5}
                value={form.tujuan}
                onChange={(e) => setForm({ ...form, tujuan: e.target.value })}
                placeholder="Tujuan jangka menengah sekolah..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl resize-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-800 block mb-1">Program Unggulan Sekolah</label>
              <textarea
                rows={5}
                value={form.programUnggulan}
                onChange={(e) => setForm({ ...form, programUnggulan: e.target.value })}
                placeholder="1. Pembiasaan Literasi Pagi&#10;2. Sekolah Adiwiyata..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl resize-none"
              />
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
