import React, { useState, useEffect } from 'react';
import {
  BookMarked,
  Search,
  Trash2,
  Calendar,
  Clock,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';
import { BukuTamu } from '../../types';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

interface AdminBukuTamuProps {
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const AdminBukuTamu: React.FC<AdminBukuTamuProps> = ({ onShowToast }) => {
  const [items, setItems] = useState<BukuTamu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    id: string;
    nama: string;
  }>({
    isOpen: false,
    id: '',
    nama: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.getBukuTamu();
      setItems(data);
    } catch (err: any) {
      onShowToast('Gagal memuat data buku tamu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await api.deleteBukuTamu(deleteConfirm.id);
      setItems((prev) => prev.filter((i) => i.id !== deleteConfirm.id));
      onShowToast(`Data tamu "${deleteConfirm.nama}" berhasil dihapus.`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Gagal menghapus data tamu.', 'error');
    } finally {
      setDeleteConfirm({ isOpen: false, id: '', nama: '' });
    }
  };

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    return (
      i.nama.toLowerCase().includes(q) ||
      i.jabatan.toLowerCase().includes(q) ||
      i.instansi.toLowerCase().includes(q) ||
      i.masukan.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2.5">
            <BookMarked className="w-7 h-7 text-blue-600" />
            <span>Manajemen Buku Tamu & Aspirasi</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data kunjungan tamu, silaturahmi dinas, dan aspirasi masyarakat yang masuk ke portal.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title="Segarkan data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
          <a
            href="/buku-tamu"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span>Halaman Publik Buku Tamu</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Total Catatan Tamu:</span>
            <span className="text-sm font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              {items.length}
            </span>
          </div>
        </div>
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, instansi, masukan..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs font-medium">Memuat data buku tamu...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <BookMarked className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">
              {search ? 'Tidak ada data tamu yang sesuai filter pencarian.' : 'Belum ada data buku tamu tercatat.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4 w-44">Waktu & Tanggal</th>
                  <th className="py-3.5 px-4 w-48">Nama Tamu</th>
                  <th className="py-3.5 px-4 w-36">Jabatan</th>
                  <th className="py-3.5 px-4 w-48">Instansi</th>
                  <th className="py-3.5 px-4">Masukan / Pesan</th>
                  <th className="py-3.5 px-4 w-20 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item, index) => {
                  const date = new Date(item.createdAt);
                  const dateStr = date.toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });
                  const timeStr = date.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{dateStr}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{timeStr} WIB</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{item.nama}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                          {item.jabatan}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {item.instansi}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 italic text-[11px] leading-relaxed">
                          &ldquo;{item.masukan}&rdquo;
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirm({
                              isOpen: true,
                              id: item.id,
                              nama: item.nama
                            })
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus data buku tamu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Hapus Data Buku Tamu"
        message={`Hapus data buku tamu atas nama "${deleteConfirm.nama}"?`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: '', nama: '' })}
      />
    </div>
  );
};
