import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, AlertTriangle, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

interface AdminLoginProps {
  onNavigate: (path: string) => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onNavigate, onShowToast }) => {
  const { login } = useAuth();
  const { settings } = useSettings();
  const [email, setEmail] = useState('admin@pengawassekolah.id');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await login({ email, password });
      onShowToast('Login berhasil! Selamat datang di Dashboard Administrator.', 'success');
      onNavigate('/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login gagal. Periksa kembali email dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-white p-1 mx-auto shadow-lg shadow-blue-900/10 border-2 border-blue-100 flex items-center justify-center overflow-hidden">
            <img
              src={settings?.logo || '/logo-kampar.png'}
              alt="Logo Portal Pengawas"
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.currentTarget;
                target.src = '/logo-kampar.png';
              }}
            />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Masuk Administrator
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {settings?.namaPortal || 'Portal Pengawas Sekolah'}
            </p>
          </div>
        </div>

        {/* Development default reminder box */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1.5 shadow-2xs">
          <div className="flex items-center space-x-1.5 font-bold text-amber-800">
            <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Akun Administrator Standar (Awal / Supabase):</span>
          </div>
          <p className="text-slate-700">
            Email: <code className="bg-amber-100/80 px-1.5 py-0.5 rounded font-mono font-bold text-slate-900">admin@pengawassekolah.id</code>
          </p>
          <p className="text-slate-700">
            Password: <code className="bg-amber-100/80 px-1.5 py-0.5 rounded font-mono font-bold text-slate-900">Admin123!</code>
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@pengawassekolah.id');
                setPassword('Admin123!');
              }}
              className="text-xs font-bold text-amber-800 bg-amber-200/80 hover:bg-amber-300/80 px-3 py-1.5 rounded-xl transition cursor-pointer inline-flex items-center space-x-1.5"
            >
              <span>Gunakan Akun Ini (Isi Otomatis)</span>
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email Admin
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pengawassekolah.id"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold text-sm py-3 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <span>{loading ? 'Memeriksa Kredensial...' : 'Masuk ke Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => onNavigate('/')}
              className="text-xs text-slate-500 hover:text-blue-700 font-semibold cursor-pointer"
            >
              ← Kembali ke Beranda Publik
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
