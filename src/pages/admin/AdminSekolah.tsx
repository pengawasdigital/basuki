import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  User
} from 'lucide-react';
import { api } from '../../services/api';
import { School as SchoolType } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ImageUpload } from '../../components/common/ImageUpload';
import { DocumentImportModal } from '../../components/common/DocumentImportModal';
import { DocumentAutofillButton } from '../../components/common/DocumentAutofillButton';

interface AdminSekolahProps {
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const AdminSekolah: React.FC<AdminSekolahProps> = ({ onShowToast }) => {
  const { pengawas } = useSettings();
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    nama: '',
    npsn: '',
    jenjang: 'SD',
    status: 'Negeri',
    alamat: '',
    desaKelurahan: '',
    kecamatan: pengawas?.kecamatan || 'Perhentian Raja',
    kabupaten: pengawas?.kabupaten || 'Kampar',
    provinsi: pengawas?.provinsi || 'Riau',
    foto: '',
    latitude: 0.3541,
    longitude: 101.3812,
    mapsUrl: '',
    kepalaSekolahNama: '',
    jumlahGuru: 12,
    jumlahSiswa: 200,
    telepon: '',
    email: '',
    website: ''
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const data = await api.getSchools({ search: searchTerm });
      setSchools(data);
    } catch {
      onShowToast('Gagal memuat daftar sekolah.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [searchTerm]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      nama: '',
      npsn: '',
      jenjang: 'SD',
      status: 'Negeri',
      alamat: '',
      desaKelurahan: '',
      kecamatan: pengawas?.kecamatan || 'Perhentian Raja',
      kabupaten: pengawas?.kabupaten || 'Kampar',
      provinsi: pengawas?.provinsi || 'Riau',
      foto: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=800',
      latitude: 0.3541,
      longitude: 101.3812,
      mapsUrl: '',
      kepalaSekolahNama: '',
      jumlahGuru: 12,
      jumlahSiswa: 200,
      telepon: '',
      email: '',
      website: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sch: SchoolType) => {
    setEditingId(sch.id);
    setForm({
      nama: sch.nama,
      npsn: sch.npsn,
      jenjang: sch.jenjang,
      status: sch.status,
      alamat: sch.alamat,
      desaKelurahan: sch.desaKelurahan || '',
      kecamatan: sch.kecamatan || 'Perhentian Raja',
      kabupaten: sch.kabupaten || 'Kampar',
      provinsi: sch.provinsi || 'Riau',
      foto: sch.foto || '',
      latitude: sch.latitude || 0.3541,
      longitude: 101.3812,
      mapsUrl: sch.mapsUrl || '',
      kepalaSekolahNama: sch.kepalaSekolahNama || '',
      jumlahGuru: sch.jumlahGuru || 0,
      jumlahSiswa: sch.jumlahSiswa || 0,
      telepon: sch.telepon || '',
      email: sch.email || '',
      website: sch.website || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.npsn || !form.alamat) {
      onShowToast('Nama Sekolah, NPSN, dan Alamat wajib diisi.', 'error');
      return;
    }
    try {
      if (editingId) {
        await api.updateSchool(editingId, form);
        onShowToast('Perubahan data sekolah berhasil disimpan.', 'success');
      } else {
        await api.createSchool(form);
        onShowToast('Sekolah binaan baru berhasil ditambahkan.', 'success');
      }
      setIsModalOpen(false);
      fetchSchools();
    } catch (err: any) {
      onShowToast(err.message || 'Gagal menyimpan data sekolah.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await api.deleteSchool(deleteConfirm.id);
      onShowToast(`Sekolah ${deleteConfirm.name} berhasil dihapus.`, 'success');
      setDeleteConfirm({ isOpen: false, id: '', name: '' });
      fetchSchools();
    } catch (err: any) {
      onShowToast(err.message || 'Gagal menghapus sekolah.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Sekolah Binaan</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Tambah, edit, unggah berkas impor, dan kelola seluruh informasi satuan pendidikan binaan di wilayah kerja.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            <span>Unggah File Sekolah (Excel, Word, PDF)</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Sekolah</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nama sekolah atau NPSN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-600"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Total: <strong>{schools.length}</strong> Sekolah
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3.5">Sekolah / NPSN</th>
                <th className="p-3.5">Jenjang & Status</th>
                <th className="p-3.5">Kepala Sekolah</th>
                <th className="p-3.5">Guru / Siswa</th>
                <th className="p-3.5">Kecamatan</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Memuat data sekolah...
                  </td>
                </tr>
              ) : schools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    Belum ada sekolah binaan yang terdaftar.
                  </td>
                </tr>
              ) : (
                schools.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 text-sm">{s.nama}</div>
                      <div className="text-slate-400 text-[11px]">NPSN: {s.npsn}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md mr-1.5">
                        {s.jenjang}
                      </span>
                      <span className="text-slate-600">{s.status}</span>
                    </td>
                    <td className="p-3.5 text-slate-800 font-medium">
                      {s.kepalaSekolahNama || '-'}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {s.jumlahGuru || 0} Guru • {s.jumlahSiswa || 0} Siswa
                    </td>
                    <td className="p-3.5 text-slate-600">{s.kecamatan}</td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                        title="Edit Data"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({ isOpen: true, id: s.id, name: s.nama })
                        }
                        className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-5">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingId ? 'Edit Satuan Pendidikan' : 'Tambah Satuan Pendidikan Binaan'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div>
                <span className="text-xs font-bold text-indigo-900 block">Isi Otomatis dari Berkas Sekolah?</span>
                <p className="text-[11px] text-indigo-700">Unggah berkas profil / SK izin operasional sekolah untuk mengisi formulir.</p>
              </div>
              <DocumentAutofillButton
                label="Pilih File (PDF/Word/Excel)"
                onExtracted={(data) => {
                  const firstRow = data.rows && data.rows[0] ? data.rows[0] : null;
                  if (firstRow) {
                    setForm((prev) => ({
                      ...prev,
                      nama: firstRow.nama || firstRow['Nama Sekolah'] || prev.nama,
                      npsn: firstRow.npsn || firstRow['NPSN'] || prev.npsn,
                      jenjang: firstRow.jenjang || firstRow['Jenjang'] || prev.jenjang,
                      status: firstRow.status || firstRow['Status'] || prev.status,
                      alamat: firstRow.alamat || firstRow['Alamat'] || prev.alamat,
                      desaKelurahan: firstRow.desaKelurahan || firstRow['Desa / Kelurahan'] || prev.desaKelurahan,
                      kecamatan: firstRow.kecamatan || firstRow['Kecamatan'] || prev.kecamatan,
                      kepalaSekolahNama: firstRow.kepalaSekolahNama || firstRow['Nama Kepala Sekolah'] || prev.kepalaSekolahNama,
                      jumlahGuru: Number(firstRow.jumlahGuru || firstRow['Jumlah Guru']) || prev.jumlahGuru,
                      jumlahSiswa: Number(firstRow.jumlahSiswa || firstRow['Jumlah Siswa']) || prev.jumlahSiswa,
                      telepon: firstRow.telepon || firstRow['No Telepon'] || prev.telepon,
                      email: firstRow.email || firstRow['Email'] || prev.email
                    }));
                  } else if (data.rawText) {
                    const lines = data.rawText.split('\n').map(l => l.trim()).filter(Boolean);
                    if (lines.length > 0) {
                      setForm(prev => ({
                        ...prev,
                        nama: lines[0].replace(/^nama\s*:\s*/i, '') || prev.nama
                      }));
                    }
                  }
                }}
                onShowToast={onShowToast}
              />
            </div>

            <div className="mb-4 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                    Pengawas Pembina Satuan Pendidikan
                  </span>
                  <span className="font-bold text-slate-900 text-xs">
                    {pengawas?.nama ? (pengawas.gelar ? `${pengawas.nama}, ${pengawas.gelar}` : pengawas.nama) : 'Basuki, S.Kom.'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    NIP. {pengawas?.nip || '-'} • Wilayah Binaan: {pengawas?.kecamatan || form.kecamatan}, {pengawas?.kabupaten || form.kabupaten}
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2.5 py-1 rounded-full shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Otomatis Terlink</span>
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nama Satuan Pendidikan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    placeholder="Contoh: UPT SD Negeri 009 Sialang Kubang"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    NPSN (8 Digit) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.npsn}
                    onChange={(e) => setForm({ ...form, npsn: e.target.value })}
                    placeholder="Contoh: 10400213"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jenjang</label>
                  <select
                    value={form.jenjang}
                    onChange={(e) => setForm({ ...form, jenjang: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs cursor-pointer"
                  >
                    <option value="SD">Sekolah Dasar (SD)</option>
                    <option value="TK">Taman Kanak-Kanak (TK)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status Kelembagaan</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs cursor-pointer"
                  >
                    <option value="Negeri">Negeri</option>
                    <option value="Swasta">Swasta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  placeholder="Jl. Garuda Sialang Kubang..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Desa / Kelurahan</label>
                  <input
                    type="text"
                    value={form.desaKelurahan}
                    onChange={(e) => setForm({ ...form, desaKelurahan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kecamatan</label>
                  <input
                    type="text"
                    value={form.kecamatan}
                    onChange={(e) => setForm({ ...form, kecamatan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kabupaten</label>
                  <input
                    type="text"
                    value={form.kabupaten}
                    onChange={(e) => setForm({ ...form, kabupaten: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Kepala Sekolah</label>
                  <input
                    type="text"
                    value={form.kepalaSekolahNama}
                    onChange={(e) => setForm({ ...form, kepalaSekolahNama: e.target.value })}
                    placeholder="Nama beserta gelar"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jumlah Guru</label>
                  <input
                    type="number"
                    value={form.jumlahGuru}
                    onChange={(e) => setForm({ ...form, jumlahGuru: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jumlah Murid</label>
                  <input
                    type="number"
                    value={form.jumlahSiswa}
                    onChange={(e) => setForm({ ...form, jumlahSiswa: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tautan Google Maps</label>
                <input
                  type="url"
                  value={form.mapsUrl}
                  onChange={(e) => setForm({ ...form, mapsUrl: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <ImageUpload
                  label="Foto Gedung / Gerbang Satuan Pendidikan"
                  value={form.foto}
                  onChange={(url) => setForm({ ...form, foto: url })}
                  helperText="Unggah foto gedung sekolah (format JPG, JPEG, PNG, atau WEBP, maks 10MB)"
                  aspectRatio="video"
                />
              </div>

              <div className="mt-6 flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  {editingId ? 'Simpan Perubahan' : 'Simpan Sekolah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Konfirmasi Hapus Sekolah"
        message={`Apakah Anda yakin ingin menghapus data "${deleteConfirm.name}"? Semua data visi-misi, struktur, guru, fasilitas, dan prestasi terkait sekolah ini juga akan terhapus.`}
        confirmLabel="Ya, Hapus Sekolah"
        cancelLabel="Batal"
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
      />

      <DocumentImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        entityType="sekolah"
        onSuccess={() => fetchSchools()}
        onShowToast={onShowToast}
      />
    </div>
  );
};
