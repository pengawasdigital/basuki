import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { api } from '../../services/api';
import { Pengumuman } from '../../types';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DocumentAutofillButton } from '../../components/common/DocumentAutofillButton';

interface AdminPengumumanProps {
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const AdminPengumuman: React.FC<AdminPengumumanProps> = ({ onShowToast }) => {
  const [items, setItems] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    judul: '',
    isi: '',
    prioritas: 'Normal' as 'Normal' | 'Penting' | 'Mendesak',
    statusPublish: true
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  const fetchItems = () => {
    setLoading(true);
    api.getAnnouncements(false)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      judul: '',
      isi: '',
      prioritas: 'Normal',
      statusPublish: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Pengumuman) => {
    setEditingId(p.id);
    setForm({
      judul: p.judul,
      isi: p.isi,
      prioritas: p.prioritas,
      statusPublish: p.statusPublish
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.judul || !form.isi) {
      onShowToast('Judul dan Isi pengumuman wajib diisi.', 'error');
      return;
    }
    try {
      if (editingId) {
        await api.updateAnnouncement(editingId, form);
        onShowToast('Pengumuman diperbarui.', 'success');
      } else {
        await api.createAnnouncement(form);
        onShowToast('Pengumuman baru dibuat.', 'success');
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
      await api.deleteAnnouncement(deleteConfirm.id);
      onShowToast('Pengumuman dihapus.', 'success');
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
          <h1 className="text-xl font-bold text-slate-900">Manajemen Pengumuman</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sebarkan maklumat mendesak, jadwal supervisi, dan instruksi resmi pengawas ke sekolah.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pengumuman Baru</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3.5">Judul Pengumuman</th>
                <th className="p-3.5">Prioritas</th>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    Memuat data pengumuman...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500">
                    Belum ada pengumuman.
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3.5 max-w-md">
                      <div className="font-bold text-slate-900 text-sm">{p.judul}</div>
                      <div className="text-slate-500 text-xs mt-0.5 line-clamp-1">{p.isi}</div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          p.prioritas === 'Mendesak'
                            ? 'bg-red-100 text-red-800'
                            : p.prioritas === 'Penting'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {p.prioritas}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(p.tanggal).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          p.statusPublish
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.statusPublish ? 'Terbit' : 'Draf'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, id: p.id, name: p.judul })}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                {editingId ? 'Edit Pengumuman' : 'Buat Pengumuman'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div>
                <span className="text-xs font-bold text-indigo-900 block">Punya Naskah Surat Edaran?</span>
                <p className="text-[11px] text-indigo-700">Unggah berkas PDF atau Word untuk mengisi judul dan isi pengumuman.</p>
              </div>
              <DocumentAutofillButton
                label="Unggah Surat (PDF / Word)"
                onExtracted={(data) => {
                  setForm((prev) => ({
                    ...prev,
                    judul: data.judul || prev.judul,
                    isi: data.isi || prev.isi
                  }));
                }}
                onShowToast={onShowToast}
              />
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Judul Pengumuman</label>
                <input
                  type="text"
                  required
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  placeholder="Contoh: Jadwal Telaah KOSP Semester Genap"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tingkat Prioritas</label>
                <select
                  value={form.prioritas}
                  onChange={(e) => setForm({ ...form, prioritas: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl cursor-pointer"
                >
                  <option value="Normal">Normal</option>
                  <option value="Penting">Penting</option>
                  <option value="Mendesak">Mendesak</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Isi Pengumuman Lengkap</label>
                <textarea
                  rows={5}
                  required
                  value={form.isi}
                  onChange={(e) => setForm({ ...form, isi: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl resize-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="chkAnnPublish"
                  checked={form.statusPublish}
                  onChange={(e) => setForm({ ...form, statusPublish: e.target.checked })}
                  className="rounded text-blue-600 cursor-pointer"
                />
                <label htmlFor="chkAnnPublish" className="font-semibold text-slate-700 cursor-pointer">
                  Tampilkan pada beranda publik
                </label>
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
        message={`Hapus pengumuman "${deleteConfirm.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
      />
    </div>
  );
};
