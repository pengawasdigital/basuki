import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { api } from '../../services/api';
import { School as SchoolType, Keunggulan } from '../../types';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DocumentAutofillButton } from '../../components/common/DocumentAutofillButton';

interface AdminKeunggulanProps {
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const AdminKeunggulan: React.FC<AdminKeunggulanProps> = ({ onShowToast }) => {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [items, setItems] = useState<Keunggulan[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    judul: '',
    kategori: 'Akademik',
    deskripsi: '',
    icon: 'Award'
  });

  const categories = [
    'Akademik',
    'Literasi',
    'Numerasi',
    'Karakter',
    'Seni',
    'Olahraga',
    'Keagamaan',
    'Lingkungan',
    'Teknologi',
    'Ekstrakurikuler',
    'Program Unggulan'
  ];

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

  const fetchItems = () => {
    if (!selectedSchoolId) return;
    setLoading(true);
    api.getExcellence(selectedSchoolId)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, [selectedSchoolId]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      judul: '',
      kategori: 'Akademik',
      deskripsi: '',
      icon: 'Award'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Keunggulan) => {
    setEditingId(item.id);
    setForm({
      judul: item.judul,
      kategori: item.kategori,
      deskripsi: item.deskripsi,
      icon: item.icon || 'Award'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.judul || !form.deskripsi) {
      onShowToast('Judul dan Deskripsi keunggulan wajib diisi.', 'error');
      return;
    }
    try {
      if (editingId) {
        await api.updateExcellence(editingId, { ...form, sekolahId: selectedSchoolId });
        onShowToast('Keunggulan sekolah diperbarui.', 'success');
      } else {
        await api.createExcellence({ ...form, sekolahId: selectedSchoolId });
        onShowToast('Keunggulan baru ditambahkan.', 'success');
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      onShowToast(err.message || 'Gagal menyimpan.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await api.deleteExcellence(deleteConfirm.id);
      onShowToast('Keunggulan berhasil dihapus.', 'success');
      setDeleteConfirm({ isOpen: false, id: '', name: '' });
      fetchItems();
    } catch (err: any) {
      onShowToast(err.message || 'Gagal menghapus.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Keunggulan Satuan Pendidikan</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola kekhasan, distingsi mutu, program literasi, karakter, atau lingkungan tiap sekolah.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          disabled={!selectedSchoolId}
          className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Keunggulan</span>
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
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Judul Keunggulan</th>
                <th className="p-3.5">Deskripsi</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-400">
                    Memuat data keunggulan...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-500">
                    Belum ada data keunggulan untuk sekolah ini.
                  </td>
                </tr>
              ) : (
                items.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50">
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-amber-100 text-amber-900 border border-amber-200">
                        {k.kategori}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{k.judul}</td>
                    <td className="p-3.5 text-slate-600 text-xs max-w-md">{k.deskripsi}</td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(k)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, id: k.id, name: k.judul })}
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
                {editingId ? 'Edit Keunggulan' : 'Tambah Keunggulan'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-800">Isi Otomatis dari Dokumen</p>
                  <p className="text-[10px] text-slate-500">Unggah berkas Word, Excel, atau PDF data program unggulan</p>
                </div>
                <DocumentAutofillButton
                  entityType="umum"
                  label="Unggah File"
                  onExtracted={(data) => {
                    setForm((prev) => ({
                      ...prev,
                      judul: data.judul || data.nama || prev.judul,
                      deskripsi: data.deskripsi || data.keterangan || data.rawText?.slice(0, 300) || prev.deskripsi,
                    }));
                    onShowToast('Informasi keunggulan berhasil diekstrak dari dokumen', 'success');
                  }}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kategori</label>
                <select
                  value={form.kategori}
                  onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Judul Keunggulan</label>
                <input
                  type="text"
                  required
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  placeholder="Contoh: Sekolah Penggerak & Pelopor Literasi"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Deskripsi Lengkap</label>
                <textarea
                  rows={4}
                  required
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  placeholder="Jelaskan program, pelaksanaan, dan dampak positifnya..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl resize-none"
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
        message={`Hapus keunggulan "${deleteConfirm.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
      />
    </div>
  );
};
