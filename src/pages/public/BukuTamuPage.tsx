import React, { useState, useEffect } from 'react';
import {
  BookMarked,
  User,
  Briefcase,
  Building2,
  MessageSquare,
  Send,
  Trash2,
  Calendar,
  Clock,
  Search,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Users
} from 'lucide-react';
import { api } from '../../services/api';
import { BukuTamu } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

interface BukuTamuPageProps {
  onShowToast?: (msg: string, type: 'success' | 'error') => void;
}

export const BukuTamuPage: React.FC<BukuTamuPageProps> = ({ onShowToast }) => {
  const { isAuthenticated } = useAuth();
  const { settings } = useSettings();
  const [items, setItems] = useState<BukuTamu[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    nama: '',
    jabatan: '',
    instansi: '',
    masukan: ''
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    id: string;
    nama: string;
  }>({
    isOpen: false,
    id: '',
    nama: ''
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await api.getBukuTamu();
      setItems(data);
    } catch (err: any) {
      console.error('Error fetching guestbook:', err);
      if (onShowToast) onShowToast('Gagal memuat data buku tamu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim() || !form.jabatan.trim() || !form.instansi.trim() || !form.masukan.trim()) {
      if (onShowToast) {
        onShowToast('Mohon lengkapi seluruh kolom: Nama, Jabatan, Instansi, dan Masukan.', 'error');
      }
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createBukuTamu(form);
      setItems((prev) => [created, ...prev]);
      setForm({
        nama: '',
        jabatan: '',
        instansi: '',
        masukan: ''
      });
      if (onShowToast) {
        onShowToast('Terima kasih! Data buku tamu dan masukan Anda berhasil dikirim dan tercatat.', 'success');
      }
    } catch (err: any) {
      if (onShowToast) {
        onShowToast(err.message || 'Gagal mengirim buku tamu.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.id) return;
    try {
      await api.deleteBukuTamu(deleteDialog.id);
      setItems((prev) => prev.filter((item) => item.id !== deleteDialog.id));
      if (onShowToast) {
        onShowToast(`Data tamu atas nama "${deleteDialog.nama}" berhasil dihapus.`, 'success');
      }
    } catch (err: any) {
      if (onShowToast) {
        onShowToast(err.message || 'Gagal menghapus data tamu.', 'error');
      }
    } finally {
      setDeleteDialog({ isOpen: false, id: '', nama: '' });
    }
  };

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const dateFormatted = date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const timeFormatted = date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return { dateFormatted, timeFormatted };
    } catch {
      return { dateFormatted: '-', timeFormatted: '-' };
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      if (diffSec < 60) return 'Baru saja';
      if (diffMin < 60) return `${diffMin} menit yang lalu`;
      if (diffHour < 24) return `${diffHour} jam yang lalu`;
      if (diffDay < 7) return `${diffDay} hari yang lalu`;
      return null;
    } catch {
      return null;
    }
  };

  const jabatanSuggestions = [
    'Kepala Sekolah',
    'Guru / Pendidik',
    'Pengawas Sekolah',
    'Dinas Pendidikan',
    'Komite Sekolah',
    'Wali Murid',
    'Akademisi / Tamu Umum'
  ];

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.nama.toLowerCase().includes(q) ||
      item.jabatan.toLowerCase().includes(q) ||
      item.instansi.toLowerCase().includes(q) ||
      item.masukan.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white py-14 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-200 border border-blue-400/30 px-3.5 py-1 rounded-full text-xs font-semibold backdrop-blur-xs">
            <BookMarked className="w-3.5 h-3.5 text-amber-300" />
            <span>Buku Tamu Digital & Aspirasi Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Buku Tamu & Ruang Aspirasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Selamat datang di Portal Pengawas Sekolah {settings?.namaPortal || 'Wilayah Binaan'}. Silakan mengisi buku tamu untuk mencatat silaturahmi kunjungan, saran konstruktif, serta aspirasi demi peningkatan mutu pendidikan berkelanjutan.
          </p>
          <div className="pt-2 flex items-center justify-center flex-wrap gap-4 text-xs">
            <div className="bg-white/10 border border-white/15 px-3.5 py-1.5 rounded-xl flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-300" />
              <span>Total Tamu Tercatat: <strong className="text-white">{items.length}</strong></span>
            </div>
            {isAuthenticated && (
              <div className="bg-amber-500/20 border border-amber-400/40 text-amber-200 px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5 font-semibold">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Mode Administrator Aktif (Akses Hapus Tersedia)</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 space-y-8 relative z-20">
        {/* Card Form Input Buku Tamu */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-100 gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <BookMarked className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Isi Formulir Buku Tamu
                </h2>
                <p className="text-xs text-slate-500">
                  Data Anda akan ditampilkan secara transparan pada daftar tamu di bawah ini
                </p>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
              * Seluruh kolom wajib diisi
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Nama Lengkap & Gelar</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Contoh: Drs. H. Ahmad Dahlan, M.Pd."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  <span>Jabatan</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.jabatan}
                  onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                  placeholder="Contoh: Kepala Sekolah / Guru / Pengawas"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Instansi / Asal Lembaga</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.instansi}
                  onChange={(e) => setForm({ ...form, instansi: e.target.value })}
                  placeholder="Contoh: UPT SD Negeri 001 Pantairaja"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 font-medium mr-1">Pilihan Cepat Jabatan:</span>
              {jabatanSuggestions.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setForm((prev) => ({ ...prev, jabatan: item }))}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    form.jabatan === item
                      ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Masukan, Saran, atau Kesan Kunjungan</span>
              </label>
              <textarea
                required
                rows={3}
                value={form.masukan}
                onChange={(e) => setForm({ ...form, masukan: e.target.value })}
                placeholder="Tuliskan apresiasi, saran program kepengawasan, masukan layanan sekolah binaan, atau kesan silaturahmi Anda di sini..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-500 transition-colors resize-y"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Masukan Anda sangat berharga bagi peningkatan mutu pendidikan.</span>
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer hover:scale-[1.02]"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Buku Tamu</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Data Tamu List */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
                <span>Daftar Tamu & Aspirasi Masuk</span>
                <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
                  {filteredItems.length} Tamu
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar kunjungan dan masukan yang tercatat di portal secara kronologis (terbaru di atas)
              </p>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, instansi, masukan..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 shadow-2xs"
                />
              </div>
              <button
                type="button"
                onClick={fetchItems}
                disabled={loading}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                title="Segarkan data tamu"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-medium">Memuat data buku tamu...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <BookMarked className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-600">
                  {searchQuery ? 'Tidak ada data tamu yang cocok dengan pencarian.' : 'Belum ada data tamu tercatat.'}
                </p>
                <p className="text-xs text-slate-400">
                  {searchQuery ? 'Silakan gunakan kata kunci lain.' : 'Jadilah yang pertama mengisi buku tamu pada formulir di atas!'}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3.5 px-4 w-14 text-center">No</th>
                        <th className="py-3.5 px-4 w-44">Tanggal & Waktu</th>
                        <th className="py-3.5 px-4 w-48">Nama Tamu</th>
                        <th className="py-3.5 px-4 w-40">Jabatan</th>
                        <th className="py-3.5 px-4 w-48">Instansi</th>
                        <th className="py-3.5 px-4">Masukan / Pesan</th>
                        {isAuthenticated && (
                          <th className="py-3.5 px-4 w-24 text-center">Aksi (Admin)</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredItems.map((item, index) => {
                        const { dateFormatted, timeFormatted } = formatDateTime(item.createdAt);
                        const relTime = formatRelativeTime(item.createdAt);
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-4 text-center font-bold text-slate-400">
                              {index + 1}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-0.5">
                                <span className="font-semibold text-slate-900 flex items-center space-x-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  <span>{dateFormatted}</span>
                                </span>
                                <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{timeFormatted} WIB</span>
                                </span>
                                {relTime && (
                                  <span className="text-[10px] text-blue-600 font-medium">
                                    {relTime}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                  {item.nama.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-extrabold text-slate-900 leading-snug">
                                  {item.nama}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-block bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium text-[11px]">
                                {item.jabatan}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-medium text-slate-700">
                              <div className="flex items-center space-x-1.5">
                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="line-clamp-2">{item.instansi}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-slate-700 text-xs leading-relaxed italic">
                                &ldquo;{item.masukan}&rdquo;
                              </div>
                            </td>
                            {isAuthenticated && (
                              <td className="py-4 px-4 text-center whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteDialog({
                                      isOpen: true,
                                      id: item.id,
                                      nama: item.nama
                                    })
                                  }
                                  className="inline-flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg border border-rose-200 transition-colors cursor-pointer font-semibold"
                                  title="Hapus data tamu (Khusus Admin)"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Hapus</span>
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-slate-100">
                  {filteredItems.map((item, index) => {
                    const { dateFormatted, timeFormatted } = formatDateTime(item.createdAt);
                    const relTime = formatRelativeTime(item.createdAt);
                    return (
                      <div key={item.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2.5">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                              {index + 1}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                              {item.nama.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-xs">{item.nama}</h3>
                              <span className="text-[11px] text-blue-600 font-medium block">
                                {item.jabatan}
                              </span>
                            </div>
                          </div>
                          {isAuthenticated && (
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteDialog({
                                  isOpen: true,
                                  id: item.id,
                                  nama: item.nama
                                })
                              }
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 space-y-1">
                          <div className="flex items-center space-x-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium text-slate-700">{item.instansi}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-slate-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{dateFormatted}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{timeFormatted} WIB</span>
                            </span>
                            {relTime && <span className="text-blue-600">({relTime})</span>}
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 text-xs leading-relaxed italic">
                          &ldquo;{item.masukan}&rdquo;
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Hapus Data Buku Tamu"
        message={`Apakah Anda yakin ingin menghapus data buku tamu dari "${deleteDialog.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Tamu"
        cancelLabel="Batal"
        isDangerous={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog({ isOpen: false, id: '', nama: '' })}
      />
    </div>
  );
};
