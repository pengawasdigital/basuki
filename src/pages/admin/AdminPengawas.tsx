import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { api } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { ImageUpload } from '../../components/common/ImageUpload';

interface AdminPengawasProps {
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const AdminPengawas: React.FC<AdminPengawasProps> = ({ onShowToast }) => {
  const { pengawas, refreshPengawas } = useSettings();
  const [form, setForm] = useState({
    nama: '',
    gelar: '',
    nip: '',
    pangkatGolongan: '',
    jabatan: '',
    wilayahKerja: '',
    kecamatan: '',
    kabupaten: '',
    provinsi: '',
    email: '',
    noHp: '',
    foto: '',
    riwayatPendidikan: '',
    pengalaman: '',
    kompetensi: '',
    tugasFungsi: '',
    peranPengawas: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pengawas) {
      setForm({
        nama: pengawas.nama || '',
        gelar: pengawas.gelar || '',
        nip: pengawas.nip || '',
        pangkatGolongan: pengawas.pangkatGolongan || '',
        jabatan: pengawas.jabatan || '',
        wilayahKerja: pengawas.wilayahKerja || '',
        kecamatan: pengawas.kecamatan || '',
        kabupaten: pengawas.kabupaten || '',
        provinsi: pengawas.provinsi || '',
        email: pengawas.email || '',
        noHp: pengawas.noHp || '',
        foto: pengawas.foto || '',
        riwayatPendidikan: pengawas.riwayatPendidikan || '',
        pengalaman: pengawas.pengalaman || '',
        kompetensi: pengawas.kompetensi || '',
        tugasFungsi: pengawas.tugasFungsi || '',
        peranPengawas: pengawas.peranPengawas || ''
      });
    }
  }, [pengawas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updatePengawas(form);
      await refreshPengawas();
      onShowToast('Profil Pengawas Sekolah berhasil diperbarui.', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Gagal menyimpan profil.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kelola Profil Pengawas Sekolah</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Perbarui data biodata, jabatan, riwayat pendidikan, dan mandat tugas pengawasan.
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Identitas Pokok */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap & Gelar</label>
            <input
              type="text"
              required
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Gelar Singkat</label>
            <input
              type="text"
              value={form.gelar}
              onChange={(e) => setForm({ ...form, gelar: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">NIP (18 Digit)</label>
            <input
              type="text"
              value={form.nip}
              onChange={(e) => setForm({ ...form, nip: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Pangkat / Golongan</label>
            <input
              type="text"
              value={form.pangkatGolongan}
              onChange={(e) => setForm({ ...form, pangkatGolongan: e.target.value })}
              placeholder="Penata / III.C"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Jabatan Fungsional</label>
            <input
              type="text"
              value={form.jabatan}
              onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
              placeholder="Pengawas Sekolah Ahli Muda"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        {/* Wilayah & Kontak */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Wilayah Kerja</label>
            <input
              type="text"
              value={form.wilayahKerja}
              onChange={(e) => setForm({ ...form, wilayahKerja: e.target.value })}
              placeholder="Kecamatan Perhentian Raja"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Kecamatan</label>
            <input
              type="text"
              value={form.kecamatan}
              onChange={(e) => setForm({ ...form, kecamatan: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Kabupaten</label>
            <input
              type="text"
              value={form.kabupaten}
              onChange={(e) => setForm({ ...form, kabupaten: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Email Resmi</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">No. HP / WhatsApp</label>
            <input
              type="text"
              value={form.noHp}
              onChange={(e) => setForm({ ...form, noHp: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        {/* Upload Foto Pengawas */}
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
          <ImageUpload
            label="Foto Profil Resmi Pengawas"
            value={form.foto}
            onChange={(url) => setForm({ ...form, foto: url })}
            helperText="Unggah file foto formal pengawas (format JPG, JPEG, PNG, atau WEBP, maks 10MB)"
            aspectRatio="square"
          />
        </div>

        {/* Rich qualification textareas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Riwayat Pendidikan</label>
            <textarea
              rows={4}
              value={form.riwayatPendidikan}
              onChange={(e) => setForm({ ...form, riwayatPendidikan: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl resize-none"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Pengalaman Karier</label>
            <textarea
              rows={4}
              value={form.pengalaman}
              onChange={(e) => setForm({ ...form, pengalaman: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Kompetensi Keahlian</label>
            <textarea
              rows={4}
              value={form.kompetensi}
              onChange={(e) => setForm({ ...form, kompetensi: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl resize-none"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Tugas & Fungsi Pengawas</label>
            <textarea
              rows={4}
              value={form.tugasFungsi}
              onChange={(e) => setForm({ ...form, tugasFungsi: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl resize-none"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
