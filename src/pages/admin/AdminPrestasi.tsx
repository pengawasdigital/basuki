import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Search, FileSpreadsheet } from 'lucide-react';
import { api } from '../../services/api';
import { School as SchoolType, Prestasi } from '../../types';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ImageUpload } from '../../components/common/ImageUpload';
import { DocumentImportModal } from '../../components/common/DocumentImportModal';
import { DocumentAutofillButton } from '../../components/common/DocumentAutofillButton';

interface AdminPrestasiProps {
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const AdminPrestasi: React.FC<AdminPrestasiProps> = ({ onShowToast }) => {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [items, setItems] = useState<Prestasi[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    sekolahId: '',
    namaPrestasi: '',
    tingkat: 'Kabupaten',
    tahun: new Date().getFullYear(),
    bidang: 'Akademik',
    peraih: '',
    keterangan: '',
    foto: ''
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  const fetchItems = () => {
    setLoading(true);
    api.getAchievements({ search: searchTerm })
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.getSchools().then((data) => {
      setSchools(data);
      if (data.length > 0) setForm((prev) => ({ ...prev, sekolahId: data[0].id }));
    });
  }, []);

  useEffect(() => {
    fetchItems();
  }, [searchTerm]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      sekolahId: schools[0]?.id || '',
      namaPrestasi: '',
      tingkat: 'Kabupaten',
      tahun: new Date().getFullYear(),
      bidang: 'Akademik',
      peraih: '',
      keterangan: '',
      foto: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Prestasi) => {
    setEditingId(p.id);
    setForm({
      sekolahId: p.sekolahId || '',
      namaPrestasi: p.namaPrestasi,
      tingkat: p.tingkat,
      tahun: p.tahun,
      bidang: p.bidang,
      peraih: p.peraih,
      keterangan: p.keterangan || '',
      foto: p.foto || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.namaPrestasi || !form.peraih) {
      onShowToast('Nama prestasi dan Peraih wajib diisi.', 'error');
      return;
    }
    const sch = schools.find((s) => s.id === form.sekolahId);
    const payload = {
      ...form,
      sekolahNama: sch ? sch.nama : ''
    };
    try {
      if (editingId) {
        await api.updateAchievement(editingId, payload);
        onShowToast('Prestasi berhasil diperbarui.', 'success');
      } else {
        await api.createAchievement(payload);
        onShowToast('Prestasi baru berhasil ditambahkan.', 'success');
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
      await api.deleteAchievement(deleteConfirm.id);
      onShowToast('Prestasi berhasil dihapus.', 'success');
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
          <h1 className="text-xl font-bold text-slate-900">Prestasi Satuan Pendidikan</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Kelola pencapaian juara tingkat kecamatan, kabupaten, provinsi, nasional hingga internasional.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            <span>Unggah File Prestasi (Excel, Word, PDF)</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Prestasi</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari prestasi, nama siswa, atau bidang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3.5">Nama Prestasi</th>
                <th className="p-3.5">Tingkat & Tahun</th>
                <th className="p-3.5">Bidang</th>
                <th className="p-3.5">Peraih / Tim</th>
                <th className="p-3.5">Satuan Pendidikan</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Memuat data prestasi...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    Belum ada data prestasi.
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900 max-w-xs">{p.namaPrestasi}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-100 text-amber-900">
                        {p.tingkat}
                      </span>
                      <span className="text-slate-500 block text-[11px] mt-0.5">Tahun {p.tahun}</span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">{p.bidang}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{p.peraih}</td>
                    <td className="p-3.5 text-slate-600">{p.sekolahNama || '-'}</td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({ isOpen: true, id: p.id, name: p.namaPrestasi })
                        }
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
                {editingId ? 'Edit Prestasi' : 'Tambah Prestasi Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div>
                <span className="text-xs font-bold text-indigo-900 block">Isi Otomatis dari Berkas Prestasi?</span>
                <p className="text-[11px] text-indigo-700">Unggah berkas sertifikat / piagam / laporan untuk mengisi formulir.</p>
              </div>
              <DocumentAutofillButton
                label="Pilih File (PDF/Word/Excel)"
                onExtracted={(data) => {
                  const firstRow = data.rows && data.rows[0] ? data.rows[0] : null;
                  if (firstRow) {
                    setForm((prev) => ({
                      ...prev,
                      namaPrestasi: firstRow.judul || firstRow['Judul Prestasi'] || prev.namaPrestasi,
                      peraih: firstRow.penerima || firstRow['Penerima'] || prev.peraih,
                      tingkat: firstRow.tingkat || firstRow['Tingkat'] || prev.tingkat,
                      tahun: Number(firstRow.tahun || firstRow['Tahun']) || prev.tahun,
                      bidang: firstRow.bidang || firstRow['Bidang'] || prev.bidang,
                      keterangan: firstRow.deskripsi || firstRow['Deskripsi'] || prev.keterangan
                    }));
                  } else if (data.rawText) {
                    const lines = data.rawText.split('\n').map(l => l.trim()).filter(Boolean);
                    if (lines.length > 0) {
                      setForm(prev => ({
                        ...prev,
                        namaPrestasi: lines[0] || prev.namaPrestasi
                      }));
                    }
                  }
                }}
                onShowToast={onShowToast}
              />
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Satuan Pendidikan</label>
                <select
                  value={form.sekolahId}
                  onChange={(e) => setForm({ ...form, sekolahId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl cursor-pointer"
                >
                  <option value="">Umum / Lintas Satuan</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Prestasi / Juara</label>
                <input
                  type="text"
                  required
                  value={form.namaPrestasi}
                  onChange={(e) => setForm({ ...form, namaPrestasi: e.target.value })}
                  placeholder="Juara 1 OSN Matematika..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tingkat</label>
                  <select
                    value={form.tingkat}
                    onChange={(e) => setForm({ ...form, tingkat: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl cursor-pointer"
                  >
                    <option value="Sekolah">Sekolah</option>
                    <option value="Kecamatan">Kecamatan</option>
                    <option value="Kabupaten">Kabupaten</option>
                    <option value="Provinsi">Provinsi</option>
                    <option value="Nasional">Nasional</option>
                    <option value="Internasional">Internasional</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tahun Perolehan</label>
                  <input
                    type="number"
                    value={form.tahun}
                    onChange={(e) => setForm({ ...form, tahun: parseInt(e.target.value) || 2026 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bidang Prestasi</label>
                  <input
                    type="text"
                    value={form.bidang}
                    onChange={(e) => setForm({ ...form, bidang: e.target.value })}
                    placeholder="Sains / Literasi / Seni / Olahraga"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Peraih / Tim</label>
                  <input
                    type="text"
                    required
                    value={form.peraih}
                    onChange={(e) => setForm({ ...form, peraih: e.target.value })}
                    placeholder="Nama Murid / Guru / Tim"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Keterangan / Deskripsi</label>
                <textarea
                  rows={2}
                  value={form.keterangan}
                  onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl resize-none"
                />
              </div>

              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
                <ImageUpload
                  label="Foto Dokumentasi / Piagam Penghargaan"
                  value={form.foto}
                  onChange={(url) => setForm({ ...form, foto: url })}
                  helperText="Unggah foto piagam atau dokumentasi juara (format JPG, JPEG, PNG, atau WEBP, maks 10MB)"
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
        message={`Hapus prestasi "${deleteConfirm.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
      />

      <DocumentImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        entityType="prestasi"
        schools={schools}
        onSuccess={() => fetchItems()}
        onShowToast={onShowToast}
      />
    </div>
  );
};
