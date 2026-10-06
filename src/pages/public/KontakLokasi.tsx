import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Send,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  Building
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { api } from '../../services/api';

interface KontakLokasiProps {
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const KontakLokasi: React.FC<KontakLokasiProps> = ({ onShowToast }) => {
  const { settings, pengawas } = useSettings();
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    telepon: '',
    subjek: '',
    pesan: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [successSent, setSuccessSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.email || !formData.subjek || !formData.pesan) {
      onShowToast('Harap lengkapi semua bidang isian wajib.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.sendContactMessage(formData);
      setSuccessSent(true);
      onShowToast('Pesan berhasil terkirim kepada Pengawas Sekolah!', 'success');
      setFormData({
        nama: '',
        email: '',
        telepon: '',
        subjek: '',
        pesan: ''
      });
    } catch (err: any) {
      onShowToast(err.message || 'Gagal mengirimkan pesan. Silakan coba kembali.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const latitude = settings?.latitude || 0.3541;
  const longitude = settings?.longitude || 101.3812;
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&hl=id&z=14&output=embed`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-12">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
          Layanan Komunikasi & Konsultasi
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Kontak & Lokasi Kantor Pengawas
        </h1>
        <p className="text-sm text-slate-500 max-w-3xl">
          Sarana komunikasi resmi untuk koordinasi supervisi satuan pendidikan, konsultasi kurikulum merdeka, dan pengaduan mutu.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">
              Informasi Kontak Resmi
            </h3>
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-xs uppercase text-slate-400">
                    Alamat Kantor Korwil / Pengawas
                  </span>
                  <span className="font-semibold text-slate-800 text-sm block mt-0.5">
                    {settings?.alamat || 'Korwil Perhentian Raja Jl. Pekanbaru - Taluk Kuantan'}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Kecamatan {settings?.kecamatan || 'Perhentian Raja'}, Kabupaten {settings?.kabupaten || 'Kampar'}, {settings?.provinsi || 'Riau'}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-xs uppercase text-slate-400">
                    Telepon & WhatsApp Pengawas
                  </span>
                  <span className="font-semibold text-slate-800 text-sm block mt-0.5">
                    {pengawas?.noHp || settings?.telepon || '085761120929'}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Senin - Jumat, Pukul 08.00 - 16.00 WIB
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-xs uppercase text-slate-400">
                    Surel Elektronik (Email)
                  </span>
                  <a
                    href={`mailto:${settings?.email || 'digitalpengawas@gmail.com'}`}
                    className="font-semibold text-blue-700 text-sm block mt-0.5 hover:underline"
                  >
                    {settings?.email || 'digitalpengawas@gmail.com'}
                  </a>
                </div>
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <a
                href={`https://wa.me/${settings?.whatsapp || '085761120929'}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Hubungi melalui WhatsApp</span>
              </a>
              <a
                href={`mailto:${settings?.email || 'digitalpengawas@gmail.com'}`}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Kirim Surat via Email</span>
              </a>
              {settings?.mapsUrl && (
                <a
                  href={settings.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-3 px-4 rounded-xl border border-slate-300 transition-colors cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-slate-600" />
                  <span>Buka di Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                Kirim Pesan atau Konsultasi Pengawas
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Pesan akan langsung masuk ke Dashboard Administrator Pengawas Sekolah.
              </p>
            </div>

            {successSent ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-base">Pesan Anda Berhasil Terkirim!</h4>
                <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                  Terima kasih telah menghubungi Portal Pengawas Sekolah. Pengawas pembina akan menindaklanjuti pesan Anda sesegera mungkin.
                </p>
                <button
                  onClick={() => setSuccessSent(false)}
                  className="mt-3 text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Kirim Pesan Lainnya
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Anda / Kepala Sekolah / Guru"
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Alamat Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="nama@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nomor HP / WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="Contoh: 081234567890"
                      value={formData.telepon}
                      onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subjek / Topik <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Jadwal Supervisi Pembelajaran"
                      value={formData.subjek}
                      onChange={(e) => setFormData({ ...formData, subjek: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Isi Pesan / Pertanyaan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tuliskan pesan, permohonan bimbingan, atau informasi yang ingin disampaikan..."
                    value={formData.pesan}
                    onChange={(e) => setFormData({ ...formData, pesan: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center space-x-2 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold text-sm py-3 px-5 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Sedang Mengirim Pesan...' : 'Kirim Pesan Sekarang'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Google Maps Section */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Peta Wilayah Kerja Pengawas</h3>
            <p className="text-xs text-slate-500">
              Koordinat: {latitude}, {longitude} • Wilayah Kerja: {settings?.kecamatan || 'Perhentian Raja'}, {settings?.kabupaten || 'Kampar'}
            </p>
          </div>
          {settings?.mapsUrl && (
            <a
              href={settings.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center space-x-1"
            >
              <span>Buka Tampilan Penuh</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
        <div className="w-full h-80 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
          <iframe
            src={mapsEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Peta Wilayah Kerja Pengawas"
          />
        </div>
      </section>
    </div>
  );
};
