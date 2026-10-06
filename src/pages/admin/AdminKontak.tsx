import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Mail, Phone } from 'lucide-react';
import { api } from '../../services/api';
import { Kontak } from '../../types';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

interface AdminKontakProps {
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const AdminKontak: React.FC<AdminKontakProps> = ({ onShowToast }) => {
  const [messages, setMessages] = useState<Kontak[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<Kontak | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  const fetchMessages = () => {
    setLoading(true);
    api.getContacts()
      .then(setMessages)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.updateContactStatus(id, status);
      onShowToast(`Status pesan diperbarui menjadi "${status}".`, 'success');
      fetchMessages();
      if (selectedMsg && selectedMsg.id === id) {
        setSelectedMsg({ ...selectedMsg, status });
      }
    } catch {
      onShowToast('Gagal memperbarui status pesan.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await api.deleteContact(deleteConfirm.id);
      onShowToast('Pesan berhasil dihapus.', 'success');
      setDeleteConfirm({ isOpen: false, id: '', name: '' });
      setSelectedMsg(null);
      fetchMessages();
    } catch (err: any) {
      onShowToast(err.message || 'Gagal menghapus pesan.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pesan Masuk & Konsultasi</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pesan dan permohonan pendampingan dari kepala sekolah, guru, dan masyarakat.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
          Total: {messages.length} Pesan Masuk
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Daftar Pesan Masuk
          </div>
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Memuat pesan...</div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Tidak ada pesan masuk.
              </div>
            ) : (
              messages.map((m) => {
                const isSelected = selectedMsg?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMsg(m);
                      if (m.status === 'Baru') {
                        handleUpdateStatus(m.id, 'Dibaca');
                      }
                    }}
                    className={`p-4 cursor-pointer transition-colors text-xs space-y-1.5 ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-4 border-blue-600'
                        : m.status === 'Baru'
                        ? 'bg-amber-50/40 hover:bg-slate-50 font-semibold'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 line-clamp-1">{m.nama}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          m.status === 'Baru'
                            ? 'bg-amber-100 text-amber-900'
                            : m.status === 'Dibalas'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                    <div className="text-slate-700 font-medium line-clamp-1">{m.subjek}</div>
                    <div className="text-slate-400 line-clamp-1 text-[11px]">{m.pesan}</div>
                    <div className="text-[10px] text-slate-400 pt-1">
                      {new Date(m.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Message Preview */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between min-h-[400px]">
          {selectedMsg ? (
            <div className="space-y-6 text-xs">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedMsg.subjek}</h3>
                  <div className="text-slate-500 mt-1 space-x-2">
                    <span>
                      Dari: <strong>{selectedMsg.nama}</strong>
                    </span>
                    <span>•</span>
                    <a
                      href={`mailto:${selectedMsg.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedMsg.email}
                    </a>
                    {selectedMsg.telepon && (
                      <>
                        <span>•</span>
                        <span>{selectedMsg.telepon}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedMsg.status}
                    onChange={(e) => handleUpdateStatus(selectedMsg.id, e.target.value)}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <option value="Baru">Baru</option>
                    <option value="Dibaca">Dibaca</option>
                    <option value="Dibalas">Dibalas</option>
                    <option value="Arsip">Arsip</option>
                  </select>
                  <button
                    onClick={() =>
                      setDeleteConfirm({
                        isOpen: true,
                        id: selectedMsg.id,
                        name: selectedMsg.subjek
                      })
                    }
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl text-slate-800 text-sm whitespace-pre-line leading-relaxed min-h-[160px]">
                {selectedMsg.pesan}
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                <a
                  href={`mailto:${selectedMsg.email}?subject=Balasan: ${encodeURIComponent(
                    selectedMsg.subjek
                  )}`}
                  className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Balas via Email</span>
                </a>
                {selectedMsg.telepon && (
                  <a
                    href={`https://wa.me/${selectedMsg.telepon.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Balas via WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-2 stroke-1" />
              <p className="text-sm font-medium">Pilih pesan di samping untuk membaca detail</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Konfirmasi Hapus Pesan"
        message={`Hapus pesan "${deleteConfirm.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
      />
    </div>
  );
};
