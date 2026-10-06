import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, setAuthToken, removeAuthToken } from '../services/api';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;

    const initAuth = async () => {
      // 1. Cek Supabase Auth jika configured
      if (isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setAuthToken(session.access_token);
            setAdmin({
              id: session.user.id,
              email: session.user.email || 'admin@pengawassekolah.id',
              name: session.user.user_metadata?.nama || session.user.user_metadata?.name || 'Administrator Portal',
              role: session.user.user_metadata?.role || 'SUPERADMIN'
            });
            setIsLoading(false);
          }

          const { data } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            if (newSession?.user) {
              setAuthToken(newSession.access_token);
              setAdmin({
                id: newSession.user.id,
                email: newSession.user.email || 'admin@pengawassekolah.id',
                name: newSession.user.user_metadata?.nama || newSession.user.user_metadata?.name || 'Administrator Portal',
                role: newSession.user.user_metadata?.role || 'SUPERADMIN'
              });
            } else if (!newSession && !getAuthToken()) {
              setAdmin(null);
            }
          });
          authListener = data;
        } catch (e) {
          console.warn('Supabase Auth init error:', e);
        }
      }

      // 2. Cek token lokal / internal
      const localToken = getAuthToken();
      if (localToken && !admin) {
        try {
          const data = await api.getMe();
          setAdmin(data);
        } catch {
          removeAuthToken();
          setAdmin(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const refreshMe = async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setAuthToken(session.access_token);
          setAdmin({
            id: session.user.id,
            email: session.user.email || 'admin@pengawassekolah.id',
            name: session.user.user_metadata?.nama || session.user.user_metadata?.name || 'Administrator Portal',
            role: session.user.user_metadata?.role || 'SUPERADMIN'
          });
          return;
        }
      } catch {}
    }

    const token = getAuthToken();
    if (!token) {
      setAdmin(null);
      return;
    }
    try {
      const data = await api.getMe();
      setAdmin(data);
    } catch {
      removeAuthToken();
      setAdmin(null);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    // 1. Coba Supabase Auth jika konfigurasi aktif
    if (isSupabaseConfigured()) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: credentials.email.trim(),
          password: credentials.password
        });

        if (!authError && authData.session && authData.user) {
          const token = authData.session.access_token;
          setAuthToken(token);
          setAdmin({
            id: authData.user.id,
            email: authData.user.email || credentials.email,
            name: authData.user.user_metadata?.nama || authData.user.user_metadata?.name || 'Administrator Portal',
            role: authData.user.user_metadata?.role || 'SUPERADMIN'
          });
          return;
        }
      } catch (sbErr) {
        console.warn('Supabase login error, mencoba backend login:', sbErr);
      }
    }

    // 2. Backend API login
    const res = await api.login(credentials);
    setAuthToken(res.token);
    setAdmin(res.admin);
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    removeAuthToken();
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout,
        refreshMe
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
