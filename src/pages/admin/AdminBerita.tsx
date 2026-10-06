import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Star, Search } from 'lucide-react';
import { api } from '../../services/api';
import { School as SchoolType, Berita } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ImageUpload } from '../../components/common/ImageUpload';
import { DocumentAutofillButton } from '../../components/common/DocumentAutofillButton';

interface AdminBeritaProps {
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const AdminBerita: React.FC<AdminBeritaProps> = ({ onShowToast }) => {
  const { settings, pengawas } = useSettings();
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [news, setNews] = useState<Berita[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const getActivePengawasName = () => {
    if (pengawas?.nama) {
      return pengawas.gelar ? `${pengawas.nama}, ${pengawas.gelar}` : pengawas.nama;
    }
    return settings?.namaPengawas || 'Basuki, S.Kom.';
  };

  const categories = [
    'APK Digital',
    'Pengawasan',
    'Pendampingan',
    'Sekolah',
    'Pendidikan',
    'Pengumuman',
    'Kegiatan',
    'Prestasi'
  ];

  const [selectedKategori, setSelectedKategori] = useState('SEMUA');
  const [form, setForm] = useState({
    sekolahId: '',
    judul: '',
    slug: '',
    thumbnail: '',
    ringkasan: '',
    konten: '',
    penulis: getActivePengawasName(),
    kategori: 'APK Digital',
    statusPublish: true,
    featured: false
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  const fetchNews = () => {
    setLoading(true);
    api.getNews({
      search: searchTerm,
      kategori: selectedKategori === 'SEMUA' ? undefined : selectedKategori
    })
      .then(setNews)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.getSchools().then(setSchools).catch(console.error);
  }, []);

  useEffect(() => {
    fetchNews();
  }, [searchTerm, selectedKategori]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      sekolahId: '',
      judul: '',
      slug: '',
      thumbnail: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800',
      ringkasan: '',
      konten: '',
      penulis: getActivePengawasName(),
      kategori: 'Pendampingan',
      statusPublish: true,
      featured: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Berita) => {
    setEditingId(b.id);
    setForm({
      sekolahId: b.sekolahId || '',
      judul: b.judul,
      slug: b.slug,
      thumbnail: b.thumbnail || '',
      ringkasan: b.ringkasan || '',
      konten: b.konten,
      penulis: b.penulis,
      kategori: b.kategori,
      statusPublish: b.statusPublish,
      featured: b.featured
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.judul || !form.konten) {
      onShowToast('Judul dan Isi berita wajib diisi.', 'error');
      return;
    }
    const sch = schools.find((s) => s.id === form.sekolahId);
    const payload = {
      ...form,
      sekolahNama: sch ? sch.nama : ''
    };
    try {
      if (editingId) {
        await api.updateNews(editingId, payload);
        onShowToast('Berita berhasil diperbarui.', 'success');
      } else {
        await api.createNews(payload);
        onShowToast('Berita baru berhasil diterbitkan.', 'success');
      }
      setIsModalOpen(false);
      fetchNews();
    } catch (err: any) {
      onShowToast(err.message || 'Gagal menyimpan berita.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await api.deleteNews(deleteConfirm.id);
      onShowToast('Berita berhasil dihapus.', 'success');
      setDeleteConfirm({ isOpen: false, id: '', name: '' });
      fetchNews();
    } catch (err: any) {
      onShowToast(err.message || 'Gagal menghapus.', 'error');
    }
  };

  const handleTogglePublish = async (b: Berita) => {
    try {
      await api.updateNews(b.id, { statusPublish: !b.statusPublish });
      onShowToast(`Status berita diubah menjadi ${!b.statusPublish ? 'Publik' : 'Draf'}.`, 'success');
      fetchNews();
    } catch {
      onShowToast('Gagal mengubah status publikasi.', 'error');
    }
  };

  const handleToggleFeatured = async (b: Berita) => {
    try {
      await api.updateNews(b.id, { featured: !b.featured });
      onShowToast(`Status featured berita berhasil diubah.`, 'success');
      fetchNews();
    } catch {
      onShowToast('Gagal mengubah status featured.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Berita & Publikasi</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tulis, sunting, dan publikasikan warta kepengawasan dan transformasi satuan pendidikan.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis Berita Baru</span>
        </button>
      </div>

      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari berita berdasarkan judul..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
          />
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Filter Kategori:</span>
          <select
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
          >
            <option value="SEMUA">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3.5">Judul Berita</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Penulis & Tanggal</th>
                <th className="p-3.5 text-center">Featured</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Memuat daftar berita...
                  </td>
                </tr>
              ) : news.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    Belum ada artikel berita.
                  </td>
                </tr>
              ) : (
                news.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 text-sm max-w-sm line-clamp-1">
                        {b.judul}
                      </div>
                      <div className="text-slate-400 text-[10px]">Slug: {b.slug}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-md font-bold text-[10px] bg-emerald-100 text-emerald-900">
                        {b.kategori}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      <div className="font-medium text-slate-800">{b.penulis}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(b.tanggal).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleToggleFeatured(b)}
                        className={`p-1.5 rounded-lg cursor-pointer ${
                          b.featured
                            ? 'text-amber-500 bg-amber-50'
                            : 'text-slate-300 hover:text-slate-400'
                        }`}
                        title="Tandai berita sorotan utama di beranda"
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleTogglePublish(b)}
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] cursor-pointer ${
                          b.statusPublish
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {b.statusPublish ? 'Terbit' : 'Draf'}
                      </button>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, id: b.id, name: b.judul })}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                {editingId ? 'Edit Naskah Berita' : 'Tulis Berita Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div>
                <span className="text-xs font-bold text-indigo-900 block">Punya Naskah Rilis Berita?</span>
                <p className="text-[11px] text-indigo-700">Unggah file dokumen naskah (Word atau PDF) untuk mengisi judul, ringkasan, dan isi berita secara otomatis.</p>
              </div>
              <DocumentAutofillButton
                label="Unggah Naskah (Word / PDF)"
                onExtracted={(data) => {
                  setForm((prev) => ({
                    ...prev,
                    judul: data.judul || prev.judul,
                    ringkasan: data.ringkasan || prev.ringkasan,
                    konten: data.isi || prev.konten
                  }));
                }}
                onShowToast={onShowToast}
              />
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Judul Berita / Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  placeholder="Masukkan judul artikel..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 block">Penulis Warta</label>
                  </div>
                  <input
                    type="text"
                    value={form.penulis}
                    onChange={(e) => setForm({ ...form, penulis: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Terkait Sekolah (Opsional)</label>
                  <select
                    value={form.sekolahId}
                    onChange={(e) => setForm({ ...form, sekolahId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl cursor-pointer"
                  >
                    <option value="">Pengawas / Lintas Sekolah</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
                <ImageUpload
                  label="Foto Sampul / Gambar Berita"
                  value={form.thumbnail}
                  onChange={(url) => setForm({ ...form, thumbnail: url })}
                  helperText="Unggah foto dokumentasi kegiatan untuk sampul berita (format JPG, JPEG, PNG, atau WEBP, maks 10MB)"
                  aspectRatio="video"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ringkasan Singkat (Lead)</label>
                <textarea
                  rows={2}
                  value={form.ringkasan}
                  onChange={(e) => setForm({ ...form, ringkasan: e.target.value })}
                  placeholder="Satu atau dua kalimat pembuka..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl resize-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Isi Lengkap Berita <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={7}
                  required
                  value={form.konten}
                  onChange={(e) => setForm({ ...form, konten: e.target.value })}
                  placeholder="Tuliskan naskah berita, kutipan arahan pengawas, dan dokumentasi jalannya kegiatan..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl resize-none"
                />
              </div>

              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.statusPublish}
                    onChange={(e) => setForm({ ...form, statusPublish: e.target.checked })}
                    className="rounded text-emerald-600 cursor-pointer"
                  />
                  <span>Publikasikan Langsung</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="rounded text-amber-500 cursor-pointer"
                  />
                  <span>Jadikan Berita Utama / Featured</span>
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                >
                  Simpan Berita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Konfirmasi Hapus Berita"
        message={`Hapus artikel "${deleteConfirm.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
      />
    </div>
  );
};
