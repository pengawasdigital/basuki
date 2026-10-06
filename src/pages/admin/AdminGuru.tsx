import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Eye, EyeOff, Search, FileSpreadsheet, School } from 'lucide-react';
import { api } from '../../services/api';
import { School as SchoolType, Guru } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ImageUpload } from '../../components/common/ImageUpload';
import { DocumentImportModal } from '../../components/common/DocumentImportModal';
import { DocumentAutofillButton } from '../../components/common/DocumentAutofillButton';

interface AdminGuruProps {
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const AdminGuru: React.FC<AdminGuruProps> = ({ onShowToast }) => {
  const { pengawas } = useSettings();
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [teachers, setTeachers] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    sekolahId: '',
    nama: '',
    nip: '',
    nuptk: '',
    jabatan: '',
    mapel: '',
    pendidikan: 'S1 PGSD',
    statusKepegawaian: 'PNS',
    email: '',
    foto: '',
    tampilkanPublik: true
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  useEffect(() => {
    api.getSchools().then((data) => {
      setSchools(data);
      if (data.length > 0) setForm((prev) => ({ ...prev, sekolahId: data[0].id }));
    });
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.getTeachers({
        sekolahId: selectedSchoolId,
        search: searchTerm,
        page,
        limit: 15
      });
      setTeachers(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [selectedSchoolId, searchTerm, page]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      sekolahId: selectedSchoolId || (schools[0]?.id ?? ''),
      nama: '',
      nip: '',
      nuptk: '',
      jabatan: '',
      mapel: '',
      pendidikan: 'S1 PGSD',
      statusKepegawaian: 'PNS',
      email: '',
      foto: '',
      tampilkanPublik: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (g: Guru) => {
    setEditingId(g.id);
    setForm({
      sekolahId: g.sekolahId,
      nama: g.nama,
      nip: g.nip || '',
      nuptk: g.nuptk || '',
      jabatan: g.jabatan,
      mapel: g.mapel || '',
      pendidikan: g.pendidikan || 'S1',
      statusKepegawaian: g.statusKepegawaian || 'PNS',
      email: g.email || '',
      foto: g.foto || '',
      tampilkanPublik: g.tampilkanPublik !== false
    });
    setIsModalOpen(true);
  };

  const handleTogglePublish = async (g: Guru) => {
    try {
      await api.updateTeacher(g.id, { tampilkanPublik: !g.tampilkanPublik });
      onShowToast(
        `Visibilitas data guru ${g.nama} diubah menjadi ${!g.tampilkanPublik ? 'Publik' : 'Sembunyi'}.`,
        'success'
      );
      fetchTeachers();
    } catch {
      onShowToast('Gagal mengubah visibilitas.', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.jabatan || !form.sekolahId) {
      onShowToast('Nama, Jabatan, dan Satuan Pendidikan wajib diisi.', 'error');
      return;
    }
    try {
      if (editingId) {
        await api.updateTeacher(editingId, form);
        onShowToast('Data guru berhasil diperbarui.', 'success');
      } else {
        await api.createTeacher(form);
        onShowToast('Data guru baru berhasil ditambahkan.', 'success');
      }
      setIsModalOpen(false);
      fetchTeachers();
    } catch (err: any) {
      onShowToast(err.message || 'Gagal menyimpan.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await api.deleteTeacher(deleteConfirm.id);
      onShowToast('Data guru berhasil dihapus.', 'success');
      setDeleteConfirm({ isOpen: false, id: '', name: '' });
      fetchTeachers();
    } catch (err: any) {
      onShowToast(err.message || 'Gagal menghapus.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Data Guru</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Daftar seluruh pendidik dan tenaga kependidikan. Anda dapat mengimpor data sekaligus atau mengatur visibilitas publik tiap guru.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            <span>Unggah File Guru (Excel, Word, PDF)</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Guru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nama guru, NIP, atau jabatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
          />
        </div>
        <select
          value={selectedSchoolId}
          onChange={(e) => setSelectedSchoolId(e.target.value)}
          className="w-full sm:w-72 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer"
        >
          <option value="">Semua Satuan Pendidikan</option>
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
                <th className="p-3.5">Nama & Identitas</th>
                <th className="p-3.5">Jabatan / Mapel</th>
                <th className="p-3.5">Satuan Pendidikan</th>
                <th className="p-3.5">Status & Pendidikan</th>
                <th className="p-3.5 text-center">Publik</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Memuat data guru...
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    Tidak ada data guru yang sesuai.
                  </td>
                </tr>
              ) : (
                teachers.map((g) => {
                  const s = schools.find((sch) => sch.id === g.sekolahId);
                  return (
                    <tr key={g.id} className="hover:bg-slate-50">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 text-sm">{g.nama}</div>
                        <div className="text-slate-400 text-[10px]">
                          NIP: {g.nip || '-'} • NUPTK: {g.nuptk || '-'}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-blue-700">{g.jabatan}</div>
                        <div className="text-slate-500 text-[11px]">{g.mapel || '-'}</div>
                      </td>
                      <td className="p-3.5 text-slate-800 font-medium">
                        {s?.nama || 'Satuan Binaan'}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-emerald-700 block">
                          {g.statusKepegawaian || 'PNS'}
                        </span>
                        <span className="text-slate-500 text-[11px]">{g.pendidikan || 'S1'}</span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleTogglePublish(g)}
                          className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                            g.tampilkanPublik !== false
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                          title={
                            g.tampilkanPublik !== false
                              ? 'Tampil di publik. Klik untuk sembunyikan.'
                              : 'Disembunyikan dari publik. Klik untuk tampilkan.'
                          }
                        >
                          {g.tampilkanPublik !== false ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(g)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, id: g.id, name: g.nama })}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
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
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                {editingId ? 'Edit Data Guru' : 'Tambah Guru / Tendik'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div>
                <span className="text-xs font-bold text-indigo-900 block">Isi Otomatis dari Berkas?</span>
                <p className="text-[11px] text-indigo-700">Unggah berkas biodata (PDF, Word, Excel) untuk mengisi isian formulir.</p>
              </div>
              <DocumentAutofillButton
                label="Pilih File (PDF/Word/Excel)"
                onExtracted={(data) => {
                  const firstRow = data.rows && data.rows[0] ? data.rows[0] : null;
                  if (firstRow) {
                    setForm((prev) => ({
                      ...prev,
                      nama: firstRow.nama || firstRow['Nama Lengkap'] || firstRow['Nama Guru'] || prev.nama,
                      nip: firstRow.nip || firstRow['NIP'] || prev.nip,
                      nuptk: firstRow.nuptk || firstRow['NUPTK'] || prev.nuptk,
                      jabatan: firstRow.jabatan || firstRow['Jabatan'] || prev.jabatan,
                      mapel: firstRow.mapel || firstRow['Mata Pelajaran'] || prev.mapel,
                      pendidikan: firstRow.pendidikan || firstRow['Pendidikan'] || prev.pendidikan,
                      statusKepegawaian: firstRow.statusKepegawaian || firstRow['Status Kepegawaian'] || prev.statusKepegawaian,
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

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Satuan Pendidikan</label>
                <select
                  value={form.sekolahId}
                  onChange={(e) => setForm({ ...form, sekolahId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl cursor-pointer"
                >
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">NUPTK</label>
                  <input
                    type="text"
                    value={form.nuptk}
                    onChange={(e) => setForm({ ...form, nuptk: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jabatan Guru</label>
                  <input
                    type="text"
                    required
                    value={form.jabatan}
                    onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                    placeholder="Guru Kelas / Guru Mapel"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mata Pelajaran</label>
                  <input
                    type="text"
                    value={form.mapel}
                    onChange={(e) => setForm({ ...form, mapel: e.target.value })}
                    placeholder="Matematika / PJOK"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status Kepegawaian</label>
                  <select
                    value={form.statusKepegawaian}
                    onChange={(e) => setForm({ ...form, statusKepegawaian: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl cursor-pointer"
                  >
                    <option value="PNS">PNS</option>
                    <option value="PPPK">PPPK</option>
                    <option value="Guru Honorer">Guru Honorer</option>
                    <option value="GTY / PTY">GTY / PTY</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pendidikan Terakhir</label>
                  <input
                    type="text"
                    value={form.pendidikan}
                    onChange={(e) => setForm({ ...form, pendidikan: e.target.value })}
                    placeholder="S1 PGSD"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@sekolah.sch.id"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
                <ImageUpload
                  label="Foto Guru / Pendidik"
                  value={form.foto}
                  onChange={(url) => setForm({ ...form, foto: url })}
                  helperText="Unggah foto guru (format JPG, JPEG, PNG, atau WEBP, maks 10MB)"
                  aspectRatio="square"
                />
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="chkPublish"
                  checked={form.tampilkanPublik}
                  onChange={(e) => setForm({ ...form, tampilkanPublik: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="chkPublish" className="text-slate-700 font-semibold cursor-pointer">
                  Tampilkan pada halaman publik website
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
        message={`Hapus data guru "${deleteConfirm.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
      />

      <DocumentImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        entityType="guru"
        schools={schools}
        preselectedSchoolId={selectedSchoolId}
        onSuccess={() => fetchTeachers()}
        onShowToast={onShowToast}
      />
    </div>
  );
};
