import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { api } from '../../services/api';
import { School as SchoolType, Galeri } from '../../types';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ImageUpload } from '../../components/common/ImageUpload';

interface AdminGaleriProps {
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const AdminGaleri: React.FC<AdminGaleriProps> = ({ onShowToast }) => {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [items, setItems] = useState<Galeri[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const categories = [
    'Pendampingan',
    'Supervisi',
    'Rapat',
    'Pelatihan',
    'Workshop',
    'Kegiatan Sekolah',
    'Prestasi',
    'Kegiatan Siswa',
    'Lainnya'
  ];

  const [form, setForm] = useState({
    sekolahId: '',
    judul: '',
    kategori: 'Pendampingan',
    jenis: 'FOTO' as 'FOTO' | 'VIDEO',
    url: '',
    deskripsi: ''
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  const fetchItems = () => {
    setLoading(true);
    api.getGallery()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.getSchools().then(setSchools).catch(console.error);
    fetchItems();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      sekolahId: '',
      judul: '',
      kategori: 'Pendampingan',
      jenis: 'FOTO',
      url: '',
      deskripsi: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (g: Galeri) => {
    setEditingId(g.id);
    setForm({
      sekolahId: g.sekolahId || '',
      judul: g.judul,
      kategori: g.kategori,
      jenis: g.jenis,
      url: g.url,
      deskripsi: g.deskripsi || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.judul || !form.url) {
      onShowToast('Judul dan URL media wajib diisi.', 'error');
      return;
    }
    const sch = schools.find((s) => s.id === form.sekolahId);
    const payload = {
      ...form,
      sekolahNama: sch ? sch.nama : ''
    };
    try {
      if (editingId) {
        await api.updateGallery(editingId, payload);
        onShowToast('Dokumentasi galeri diperbarui.', 'success');
      } else {
        await api.createGallery(payload);
        onShowToast('Dokumentasi baru berhasil ditambahkan.', 'success');
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
      await api.deleteGallery(deleteConfirm.id);
      onShowToast('Dokumentasi galeri dihapus.', 'success');
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
          <h1 className="text-xl font-bold text-slate-900">Manajemen Galeri Media</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Unggah dan dokumentasikan foto kegiatan, video supervisi, dan dokumentasi sekolah.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Dokumentasi</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3.5">Pratinjau</th>
                <th className="p-3.5">Judul Kegiatan</th>
                <th className="p-3.5">Kategori & Jenis</th>
                <th className="p-3.5">Satuan Pendidikan</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    Memuat galeri...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500">
                    Belum ada dokumentasi media.
                  </td>
                </tr>
              ) : (
                items.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50">
                    <td className="p-3.5">
                      <div className="w-16 h-12 rounded-lg bg-slate-200 overflow-hidden">
                        <img
                          src={
                            g.url.includes('youtube')
                              ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=200'
                              : g.url
                          }
                          alt={g.judul}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <div className="font-bold text-slate-900 text-sm line-clamp-1">{g.judul}</div>
                      <div className="text-slate-400 text-[10px] mt-0.5 line-clamp-1">
                        {g.deskripsi || '-'}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md mr-1.5">
                        {g.kategori}
                      </span>
                      <span className="text-slate-500 text-[10px] font-semibold">{g.jenis}</span>
                    </td>
                    <td className="p-3.5 text-slate-600">{g.sekolahNama || 'Umum'}</td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(g)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, id: g.id, name: g.judul })}
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
              <h3 className="font-bold text-slate-900 text-base">
                {editingId ? 'Edit Dokumentasi' : 'Tambah Dokumentasi Galeri'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Judul Dokumentasi</label>
                <input
                  type="text"
                  required
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  placeholder="Kunjungan Supervisi di SDN..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jenis Media</label>
                  <select
                    value={form.jenis}
                    onChange={(e) => setForm({ ...form, jenis: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl cursor-pointer"
                  >
                    <option value="FOTO">Foto Dokumentasi</option>
                    <option value="VIDEO">Video (YouTube / URL)</option>
                  </select>
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
              </div>

              {form.jenis === 'FOTO' ? (
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
                  <ImageUpload
                    label="Unggah Foto Dokumentasi"
                    value={form.url}
                    onChange={(url) => setForm({ ...form, url })}
                    helperText="Unggah file foto dokumentasi kegiatan (format JPG, JPEG, PNG, atau WEBP, maks 10MB)"
                    aspectRatio="video"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Tautan Video (YouTube / URL) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Terkait Satuan Pendidikan</label>
                <select
                  value={form.sekolahId}
                  onChange={(e) => setForm({ ...form, sekolahId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl cursor-pointer"
                >
                  <option value="">Umum / Kegiatan Pengawas</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Deskripsi Kegiatan</label>
                <textarea
                  rows={3}
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  placeholder="Keterangan ringkas dokumentasi..."
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
        message={`Hapus media "${deleteConfirm.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
      />
    </div>
  );
};
