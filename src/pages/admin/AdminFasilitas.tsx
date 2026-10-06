import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { api } from '../../services/api';
import { School as SchoolType, Fasilitas } from '../../types';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ImageUpload } from '../../components/common/ImageUpload';
import { DocumentAutofillButton } from '../../components/common/DocumentAutofillButton';

interface AdminFasilitasProps {
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const AdminFasilitas: React.FC<AdminFasilitasProps> = ({ onShowToast }) => {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [facilities, setFacilities] = useState<Fasilitas[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nama: '',
    deskripsi: '',
    foto: '',
    kondisi: 'Baik',
    jumlah: 1,
    unit: 'Ruang'
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  useEffect(() => {
    api.getSchools().then((data) => {
      setSchools(data);
      if (data.length > 0) setSelectedSchoolId(data[0].id);
    });
  }, []);

  const fetchFacilities = () => {
    if (!selectedSchoolId) return;
    setLoading(true);
    api.getFacilities(selectedSchoolId)
      .then(setFacilities)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFacilities();
  }, [selectedSchoolId]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      nama: '',
      deskripsi: '',
      foto: '',
      kondisi: 'Baik',
      jumlah: 1,
      unit: 'Ruang'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f: Fasilitas) => {
    setEditingId(f.id);
    setForm({
      nama: f.nama,
      deskripsi: f.deskripsi || '',
      foto: f.foto || '',
      kondisi: f.kondisi || 'Baik',
      jumlah: f.jumlah || 1,
      unit: f.unit || 'Ruang'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama) {
      onShowToast('Nama fasilitas wajib diisi.', 'error');
      return;
    }
    try {
      if (editingId) {
        await api.updateFacility(editingId, { ...form, sekolahId: selectedSchoolId });
        onShowToast('Fasilitas diperbarui.', 'success');
      } else {
        await api.createFacility({ ...form, sekolahId: selectedSchoolId });
        onShowToast('Fasilitas baru ditambahkan.', 'success');
      }
      setIsModalOpen(false);
      fetchFacilities();
    } catch (err: any) {
      onShowToast(err.message || 'Gagal menyimpan fasilitas.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await api.deleteFacility(deleteConfirm.id);
      onShowToast('Fasilitas berhasil dihapus.', 'success');
      setDeleteConfirm({ isOpen: false, id: '', name: '' });
      fetchFacilities();
    } catch (err: any) {
      onShowToast(err.message || 'Gagal menghapus.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Fasilitas Satuan Pendidikan</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar sarana prasarana, ruang kelas, laboratorium, perpustakaan, dan kondisinya.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          disabled={!selectedSchoolId}
          className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Fasilitas</span>
        </button>
      </div>

      {/* Select School */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200">
        <label className="text-xs font-semibold text-slate-700 block mb-1">
          Pilih Satuan Pendidikan:
        </label>
        <select
          value={selectedSchoolId}
          onChange={(e) => setSelectedSchoolId(e.target.value)}
          className="max-w-md w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer"
        >
          {schools.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nama}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3.5">Nama Fasilitas</th>
                <th className="p-3.5">Kondisi</th>
                <th className="p-3.5">Jumlah</th>
                <th className="p-3.5">Deskripsi</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    Memuat data fasilitas...
                  </td>
                </tr>
              ) : facilities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500">
                    Belum ada data fasilitas untuk sekolah ini.
                  </td>
                </tr>
              ) : (
                facilities.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900">{f.nama}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                        {f.kondisi || 'Baik'}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">
                      {f.jumlah} {f.unit}
                    </td>
                    <td className="p-3.5 text-slate-500 text-xs max-w-xs truncate">
                      {f.deskripsi || '-'}
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(f)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, id: f.id, name: f.nama })}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 cursor-pointer"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingId ? 'Edit Fasilitas' : 'Tambah Fasilitas'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-800">Isi Otomatis dari Dokumen</p>
                  <p className="text-[10px] text-slate-500">Unggah berkas Word, Excel, atau PDF data sarpras</p>
                </div>
                <DocumentAutofillButton
                  entityType="umum"
                  label="Unggah File"
                  onExtracted={(data) => {
                    setForm((prev) => ({
                      ...prev,
                      nama: data.nama || data.judul || prev.nama,
                      deskripsi: data.keterangan || data.deskripsi || data.rawText?.slice(0, 300) || prev.deskripsi,
                    }));
                    onShowToast('Informasi fasilitas berhasil diekstrak dari dokumen', 'success');
                  }}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Fasilitas</label>
                <input
                  type="text"
                  required
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Perpustakaan / Ruang Kelas / UKS"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kondisi</label>
                  <select
                    value={form.kondisi}
                    onChange={(e) => setForm({ ...form, kondisi: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl cursor-pointer"
                  >
                    <option value="Baik">Baik</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jumlah</label>
                  <input
                    type="number"
                    value={form.jumlah}
                    onChange={(e) => setForm({ ...form, jumlah: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Satuan Unit</label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    placeholder="Ruang / Unit"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Deskripsi Tambahan</label>
                <textarea
                  rows={3}
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl resize-none"
                />
              </div>

              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
                <ImageUpload
                  label="Foto Fasilitas / Sarana Prasarana"
                  value={form.foto}
                  onChange={(url) => setForm({ ...form, foto: url })}
                  helperText="Unggah foto fasilitas (format JPG, JPEG, PNG, atau WEBP, maks 10MB)"
                  aspectRatio="video"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Konfirmasi Hapus"
        message={`Hapus fasilitas "${deleteConfirm.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
      />
    </div>
  );
};
