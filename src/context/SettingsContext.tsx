import React, { createContext, useContext, useState, useEffect } from 'react';
import { WebsiteSettings, PengawasProfile } from '../types';
import { api } from '../services/api';

interface SettingsContextType {
  settings: WebsiteSettings | null;
  pengawas: PengawasProfile | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  refreshPengawas: () => Promise<void>;
}

const defaultSettings: WebsiteSettings = {
  id: 'default',
  namaPortal: 'PORTAL PENGAWAS SEKOLAH',
  subjudul: 'Informasi, Pendampingan, Dokumentasi dan Pengembangan Mutu Satuan Pendidikan',
  namaPengawas: 'Basuki, S.Kom.',
  fotoPengawas: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600',
  nipPengawas: '19790719 201406 1 003',
  jabatan: 'Pengawas Sekolah Ahli Muda',
  jenjang: 'TK / SD',
  kecamatan: 'Perhentian Raja',
  kabupaten: 'Kampar',
  provinsi: 'Riau',
  email: 'digitalpengawas@gmail.com',
  telepon: '085761120929',
  whatsapp: '085761120929',
  alamat: 'Korwil Perhentian Raja Jl. Pekanbaru - Taluk Kuantan',
  logo: '/logo-kampar.png',
  favicon: '/logo-kampar.png',
  deskripsi: 'Portal resmi pendampingan, informasi, dan pembinaan mutu pendidikan satuan TK/SD untuk mewujudkan pembelajaran yang berpusat pada murid.',
  footer: '© 2026 Pengawas Digital Informasi, Pendampingan, Dokumentasi dan Pengembangan Mutu Satuan Pendidikan. Pengawas Sekolah TK/SD. E-Mail : digitalpengawas@gmail.com',
  facebook: 'https://www.facebook.com/BasukiFaqod',
  instagram: 'https://www.instagram.com/faqodbasoeky/#',
  youtube: 'http://www.youtube.com/@pengawasdigital',
  tiktok: 'https://www.tiktok.com/@basoeky.faqod?lang=id-ID',
  mapsUrl: 'https://maps.google.com/?q=Perhentian+Raja+Kampar',
  latitude: 0.3541,
  longitude: 101.3812
};

const defaultPengawas: PengawasProfile = {
  id: 'pengawas-001',
  nama: 'Basuki',
  gelar: 'S.Kom.',
  nip: '19790719 201406 1 003',
  pangkatGolongan: 'Penata / III.C',
  jabatan: 'Pengawas Sekolah Ahli Muda',
  wilayahKerja: 'Kecamatan Perhentian Raja',
  kecamatan: 'Perhentian Raja',
  kabupaten: 'Kampar',
  provinsi: 'Riau',
  email: 'digitalpengawas@gmail.com',
  noHp: '085761120929',
  foto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600',
  riwayatPendidikan: 'S1 STMIK-AMIK Riau',
  pengalaman: '1. Guru Kelas SD Negeri (1998 - 2008)\n2. Kepala Sekolah Dasar Inti (2008 - 2017)\n3. Pengawas Sekolah TK/SD (2017 - Sekarang)',
  kompetensi: 'Supervisi Akademik Berdiferensiasi, Supervisi Manajerial Transformatif, Analisis Rapor Pendidikan, Kepemimpinan Pembelajaran',
  tugasFungsi: 'Melaksanakan tugas pengawasan akademik dan manajerial pada satuan pendidikan yang meliputi perencanaan program tahunan/semester, pendampingan bermakna, pemantauan 8 Standar Nasional Pendidikan, dan evaluasi mutu.',
  peranPengawas: '1. Pendampingan Satuan Pendidikan berfokus pada murid\n2. Supervisi Akademik dan Manajerial\n3. Pemantauan & Evaluasi Kurikulum Merdeka\n4. Pembinaan Kepemimpinan Kepala Sekolah'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(defaultSettings);
  const [pengawas, setPengawas] = useState<PengawasProfile | null>(defaultPengawas);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const data = await api.getSettings();
      if (data && data.namaPortal) {
        setSettings(data);
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
  };

  const refreshPengawas = async () => {
    try {
      const data = await api.getPengawas();
      if (data && data.nama) {
        setPengawas(data);
      }
    } catch (e) {
      console.warn('Failed to load pengawas:', e);
    }
  };

  useEffect(() => {
    Promise.all([refreshSettings(), refreshPengawas()]).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings: settings || defaultSettings,
        pengawas: pengawas || defaultPengawas,
        loading,
        refreshSettings,
        refreshPengawas
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
