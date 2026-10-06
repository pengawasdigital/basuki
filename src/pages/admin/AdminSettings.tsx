import React, { useState, useEffect } from 'react';
import { Save, Settings, Globe, Phone, MapPin, Share2, Image as ImageIcon, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { ImageUpload } from '../../components/common/ImageUpload';

interface AdminSettingsProps {
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ onShowToast }) => {
  const { settings, refreshSettings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'umum' | 'hero' | 'kontak' | 'sosial'>('umum');

  const [form, setForm] = useState({
    namaPortal: '',
    logo: '',
    heroTitle: '',
    heroSubtitle: '',
    deskripsiSingkat: '',
    heroBgImage: '',
    emailKontak: '',
    teleponKontak: '',
    alamatKantor: '',
    wilayahKerja: '',
    dinasPendidikan: '',
    jamLayanan: '',
    facebook: '',
    instagram: '',
    youtube: '',
    petaEmbedUrl: ''
  });

  useEffect(() => {
    if (settings) {
      setForm({
        namaPortal: settings.namaPortal || 'Portal Pengawas Sekolah TK/SD',
        logo: settings.logo || '/logo-kampar.png',
        heroTitle: settings.heroTitle || 'Pendampingan Berkelanjutan Menuju Transformasi Pendidikan Bermutu',
        heroSubtitle: settings.heroSubtitle || 'Mendorong tata kelola sekolah yang akuntabel, profesionalisme pendidik yang adaptif, dan ekosistem pembelajaran berpusat pada peserta didik.',
        deskripsiSingkat: settings.deskripsiSingkat || 'Portal resmi Pengawas Sekolah TK/SD untuk publikasi program kepengawasan, pemantauan sekolah binaan, dan peningkatan mutu.',
        heroBgImage: settings.heroBgImage || '',
        emailKontak: settings.emailKontak || 'pengawas@disdikpora.id',
        teleponKontak: settings.teleponKontak || '(0762) 123456',
        alamatKantor: settings.alamatKantor || 'Kompleks Kantor Dinas Pendidikan, Kepemudaan dan Olahraga',
        wilayahKerja: settings.wilayahKerja || 'Wilayah Binaan TK/SD',
        dinasPendidikan: settings.dinasPendidikan || 'Dinas Pendidikan Kepemudaan dan Olahraga',
        jamLayanan: settings.jamLayanan || 'Senin - Jumat: 08:00 - 16:00 WIB',
        facebook: settings.facebook || '',
        instagram: settings.instagram || '',
        youtube: settings.youtube || '',
        petaEmbedUrl: settings.petaEmbedUrl || ''
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings(form);
      await refreshSettings();
      onShowToast('Pengaturan website berhasil disimpan!', 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Gagal menyimpan pengaturan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Pengaturan Website & Identitas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Konfigurasi nama portal, logo daerah/dinas, konten banner utama, kontak resmi, dan tautan sosial media.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-6 rounded-t-2xl pt-3 gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('umum')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'umum'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Identitas Umum
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'hero'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Banner & Hero Beranda
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('kontak')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'kontak'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Kontak & Kantor
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sosial')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sosial'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Media Sosial
          </span>
        </button>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-b-2xl rounded-tr-2xl shadow-xs border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'umum' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Portal / Judul Situs
                </label>
                <input
                  type="text"
                  value={form.namaPortal}
                  onChange={(e) => setForm({ ...form, namaPortal: e.target.value })}
                  placeholder="Portal Pengawas Sekolah TK/SD"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Logo Resmi Satuan / Instansi
                </label>
                <ImageUpload
                  label="Unggah atau masukkan URL Logo"
                  value={form.logo}
                  onChange={(val) => setForm({ ...form, logo: val })}
                  folder="settings"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Instansi / Dinas Pendidikan Naungan
                </label>
                <input
                  type="text"
                  value={form.dinasPendidikan}
                  onChange={(e) => setForm({ ...form, dinasPendidikan: e.target.value })}
                  placeholder="Dinas Pendidikan, Kepemudaan dan Olahraga"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Deskripsi Singkat Portal
                </label>
                <textarea
                  rows={3}
                  value={form.deskripsiSingkat}
                  onChange={(e) => setForm({ ...form, deskripsiSingkat: e.target.value })}
                  placeholder="Deskripsi singkat untuk meta tag dan pengantar beranda..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
          )}

          {activeTab === 'hero' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tagline / Judul Utama Banner Hero
                </label>
                <input
                  type="text"
                  value={form.heroTitle}
                  onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sub-judul / Penjelasan Banner Hero
                </label>
                <textarea
                  rows={3}
                  value={form.heroSubtitle}
                  onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Gambar Latar Banner Hero (Opsional)
                </label>
                <ImageUpload
                  label="Unggah Foto Latar Belakang Hero"
                  value={form.heroBgImage}
                  onChange={(val) => setForm({ ...form, heroBgImage: val })}
                  folder="hero"
                />
              </div>
            </div>
          )}

          {activeTab === 'kontak' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Kontak Resmi
                </label>
                <input
                  type="email"
                  value={form.emailKontak}
                  onChange={(e) => setForm({ ...form, emailKontak: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  value={form.teleponKontak}
                  onChange={(e) => setForm({ ...form, teleponKontak: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Wilayah Kerja Binaan
                </label>
                <input
                  type="text"
                  value={form.wilayahKerja}
                  onChange={(e) => setForm({ ...form, wilayahKerja: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Jam Layanan / Konsultasi
                </label>
                <input
                  type="text"
                  value={form.jamLayanan}
                  onChange={(e) => setForm({ ...form, jamLayanan: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Alamat Kantor
                </label>
                <input
                  type="text"
                  value={form.alamatKantor}
                  onChange={(e) => setForm({ ...form, alamatKantor: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Embed URL Google Maps
                </label>
                <input
                  type="text"
                  value={form.petaEmbedUrl}
                  onChange={(e) => setForm({ ...form, petaEmbedUrl: e.target.value })}
                  placeholder="https://www.google.com/maps/embed?..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono text-xs"
                />
              </div>
            </div>
          )}

          {activeTab === 'sosial' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Akun Facebook
                </label>
                <input
                  type="text"
                  value={form.facebook}
                  onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Akun Instagram
                </label>
                <input
                  type="text"
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Saluran YouTube
                </label>
                <input
                  type="text"
                  value={form.youtube}
                  onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                  placeholder="https://youtube.com/@..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
