import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, FileSpreadsheet, School, CheckCircle2, User } from 'lucide-react';
import { api } from '../../services/api';
import { School as SchoolType, KepalaSekolah } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ImageUpload } from '../../components/common/ImageUpload';
import { DocumentAutofillButton } from '../../components/common/DocumentAutofillButton';
import { DocumentImportModal } from '../../components/common/DocumentImportModal';

interface AdminKepalaSekolahProps {
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const AdminKepalaSekolah: React.FC<AdminKepalaSekolahProps> = ({ onShowToast }) => {
  const { pengawas } = useSettings();
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [items, setItems] = useState<KepalaSekolah[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    nama: '',
    nip: '',
    periode: '2022 - Sekarang',
    status: 'Aktif',
    foto: '',
    keterangan: '',
    sambutan: ''
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

  const fetchItems = () => {
    if (!selectedSchoolId) return;
    setLoading(true);
    api.getPrincipals(selectedSchoolId)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, [selectedSchoolId]);

  const currentSchool = schools.find((s) => s.id === selectedSchoolId);

  const handleOpenAdd = () => {
    setEditingId(null);
    const existingActive = items.find((ks) => ks.status === 'Aktif');
    const autoName = !existingActive && currentSchool?.kepalaSekolahNama ? currentSchool.kepalaSekolahNama : '';
    setForm({
      nama: autoName,
      nip: '',
      periode: '2022 - Sekarang',
      status: 'Aktif',
      foto: '',
      keterangan: 'Kepala Satuan Pendidikan',
      sambutan: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ks: KepalaSekolah) => {
    setEditingId(ks.id);
    setForm({
      nama: ks.nama,
      nip: ks.nip || '',
      periode: ks.periode,
      status: ks.status || 'Aktif',
      foto: ks.foto || '',
      keterangan: ks.keterangan || '',
      sambutan: ks.sambutan || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.periode) {
      onShowToast('Nama dan Periode Jabatan wajib diisi.', 'error');
      return;
    }
    try {
      if (editingId) {
        await api.updatePrincipal(editingId, { ...form, sekolahId: selectedSchoolId });
        onShowToast('Data kepala sekolah diperbarui.', 'success');
      } else {
        await api.createPrincipal({ ...form, sekolahId: selectedSchoolId });
        onShowToast('Kepala sekolah baru ditambahkan.', 'success');
      }
      if (form.status === 'Aktif') {
        setSchools((prev) =>
          prev.map((s) => (s.id === selectedSchoolId ? { ...s, kepalaSekolahNama: form.nama } : s))
        );
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
      await api.deletePrincipal(deleteConfirm.id);
      onShowToast('Data berhasil dihapus.', 'success');
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
          <h1 className="text-xl font-bold text-slate-900">Manajemen Kepala Sekolah</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola kepala sekolah aktif, riwayat purna bakti, dan sambutan resmi pimpinan satuan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            disabled={!selectedSchoolId}
            className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            <span>Unggah File Kepala Sekolah (Excel, Word, PDF)</span>
          </button>
          <button
            onClick={handleOpenAdd}
            disabled={!selectedSchoolId}
            className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Kepala Sekolah</span>
          </button>
        </div>
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
                <th className="p-3.5">Nama & NIP</th>
                <th className="p-3.5">Periode</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Keterangan</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    Memuat data kepala sekolah...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500">
                    Belum ada riwayat kepala sekolah untuk satuan ini.
                  </td>
                </tr>
              ) : (
                items.map((ks) => (
                  <tr key={ks.id} className="hover:bg-slate-50">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 text-sm">{ks.nama}</div>
                      <div className="text-slate-400 text-[11px]">NIP: {ks.nip || '-'}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">{ks.periode}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          ks.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {ks.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 text-xs">{ks.keterangan || '-'}</td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(ks)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, id: ks.id, name: ks.nama })}
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

      {/* Modal Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-slate-200/80 px-6 py-4 bg-white shrink-0">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  {editingId ? 'Edit Data Kepala Sekolah' : 'Tambah Kepala Sekolah'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {currentSchool?.nama ? `Untuk ${currentSchool.nama}` : 'Input dan kelola profil kepala satuan pendidikan'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                title="Tutup Form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
              <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-4 text-xs overscroll-contain">
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div>
                    <span className="text-xs font-bold text-indigo-900 block">Isi Otomatis dari Berkas?</span>
                    <p className="text-[11px] text-indigo-700">Unggah berkas profil / biodata kepala sekolah (Word / PDF / Excel).</p>
                  </div>
                  <DocumentAutofillButton
                    label="Pilih File (PDF/Word/Excel)"
                    onExtracted={(data) => {
                      const firstRow = data.rows && data.rows[0] ? data.rows[0] : null;
                      if (firstRow) {
                        setForm((prev) => ({
                          ...prev,
                          nama: firstRow.nama || firstRow['Nama'] || firstRow['Nama Kepala Sekolah'] || prev.nama,
                          nip: firstRow.nip || firstRow['NIP'] || prev.nip,
                          periode: firstRow.periode || firstRow['Periode'] || prev.periode,
                          sambutan: firstRow.sambutan || firstRow['Sambutan'] || prev.sambutan
                        }));
                      } else if (data.rawText) {
                        const lines = data.rawText.split('\n').map(l => l.trim()).filter(Boolean);
                        if (lines.length > 0) {
                          setForm(prev => ({
                            ...prev,
                            nama: lines[0] || prev.nama
                          }));
                        }
                      }
                    }}
                    onShowToast={onShowToast}
                  />
                </div>

                {currentSchool && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                        <School className="w-3.5 h-3.5 text-blue-600" />
                        <span>{currentSchool.nama}</span>
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                        NPSN: {currentSchool.npsn}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {currentSchool.jenjang} {currentSchool.status} • Pengawas Pembina:{' '}
                      <span className="font-semibold text-slate-700">
                        {pengawas?.nama ? (pengawas.gelar ? `${pengawas.nama}, ${pengawas.gelar}` : pengawas.nama) : 'Basuki, S.Kom.'}
                      </span>
                    </p>
                  </div>
                )}

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    required
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    placeholder="Nama kepala sekolah"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">NIP</label>
                    <input
                      type="text"
                      value={form.nip}
                      onChange={(e) => setForm({ ...form, nip: e.target.value })}
                      placeholder="19780512..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Periode Jabatan</label>
                    <input
                      type="text"
                      required
                      value={form.periode}
                      onChange={(e) => setForm({ ...form, periode: e.target.value })}
                      placeholder="2022 - Sekarang"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status Jabatan</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl cursor-pointer font-medium"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Purna Bakti">Purna Bakti</option>
                    <option value="Mutasi">Mutasi</option>
                  </select>
                </div>

                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
                  <ImageUpload
                    label="Foto Resmi Kepala Sekolah"
                    value={form.foto}
                    onChange={(url) => setForm({ ...form, foto: url })}
                    helperText="Unggah foto formal kepala sekolah (format JPG, JPEG, PNG, atau WEBP, maks 10MB)"
                    aspectRatio="square"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Keterangan Tambahan</label>
                  <input
                    type="text"
                    value={form.keterangan}
                    onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                    placeholder="Contoh: Kepala Satuan Pendidikan"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Naskah Sambutan Kepala Sekolah
                  </label>
                  <textarea
                    rows={4}
                    value={form.sambutan}
                    onChange={(e) => setForm({ ...form, sambutan: e.target.value })}
                    placeholder="Tuliskan kata sambutan untuk ditampilkan pada profil sekolah..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl resize-y"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2.5 px-6 py-3.5 bg-slate-50 border-t border-slate-200/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Konfirmasi Hapus"
        message={`Hapus data "${deleteConfirm.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
      />

      <DocumentImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        entityType="kepalaSekolah"
        schools={schools}
        preselectedSchoolId={selectedSchoolId}
        onSuccess={() => fetchItems()}
        onShowToast={onShowToast}
      />
    </div>
  );
};
