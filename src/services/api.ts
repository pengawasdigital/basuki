import { BukuTamu } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('pengawas_admin_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('pengawas_admin_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('pengawas_admin_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = `Permintaan gagal (${response.status})`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.error) {
        errorMsg = errJson.error;
      }
    } catch {
      // Keep default
    }
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ token: string; admin: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
  getMe: () => request<any>('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Pengawas & Settings
  getPengawas: () => request<any>('/pengawas'),
  updatePengawas: (data: any) =>
    request<any>('/pengawas', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  getSettings: () => request<any>('/settings'),
  updateSettings: (data: any) =>
    request<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Schools
  getSchools: (params?: { search?: string; jenjang?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.jenjang) query.append('jenjang', params.jenjang);
    if (params?.status) query.append('status', params.status);
    return request<any[]>(`/schools?${query.toString()}`);
  },
  getSchoolById: (id: string) => request<any>(`/schools/${id}`),
  createSchool: (data: any) =>
    request<any>('/schools', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateSchool: (id: string, data: any) =>
    request<any>(`/schools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteSchool: (id: string) =>
    request<{ message: string }>(`/schools/${id}`, {
      method: 'DELETE'
    }),

  // Vision & Mission
  getVisionMission: (sekolahId: string) => request<any>(`/vision-mission/${sekolahId}`),
  updateVisionMission: (sekolahId: string, data: any) =>
    request<any>(`/vision-mission/${sekolahId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Organization
  getOrganization: (sekolahId?: string) =>
    request<any[]>(`/organization${sekolahId ? `?sekolahId=${sekolahId}` : ''}`),
  createOrganization: (data: any) =>
    request<any>('/organization', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateOrganization: (id: string, data: any) =>
    request<any>(`/organization/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteOrganization: (id: string) =>
    request<any>(`/organization/${id}`, {
      method: 'DELETE'
    }),

  // Facilities
  getFacilities: (sekolahId?: string) =>
    request<any[]>(`/facilities${sekolahId ? `?sekolahId=${sekolahId}` : ''}`),
  createFacility: (data: any) =>
    request<any>('/facilities', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateFacility: (id: string, data: any) =>
    request<any>(`/facilities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteFacility: (id: string) =>
    request<any>(`/facilities/${id}`, {
      method: 'DELETE'
    }),

  // Excellence
  getExcellence: (sekolahId?: string) =>
    request<any[]>(`/excellence${sekolahId ? `?sekolahId=${sekolahId}` : ''}`),
  createExcellence: (data: any) =>
    request<any>('/excellence', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateExcellence: (id: string, data: any) =>
    request<any>(`/excellence/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteExcellence: (id: string) =>
    request<any>(`/excellence/${id}`, {
      method: 'DELETE'
    }),

  // Principals
  getPrincipals: (sekolahId?: string) =>
    request<any[]>(`/principals${sekolahId ? `?sekolahId=${sekolahId}` : ''}`),
  createPrincipal: (data: any) =>
    request<any>('/principals', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updatePrincipal: (id: string, data: any) =>
    request<any>(`/principals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deletePrincipal: (id: string) =>
    request<any>(`/principals/${id}`, {
      method: 'DELETE'
    }),

  // Teachers
  getTeachers: (params?: {
    sekolahId?: string;
    search?: string;
    statusKepegawaian?: string;
    page?: number;
    limit?: number;
    publicOnly?: boolean;
  }) => {
    const query = new URLSearchParams();
    if (params?.sekolahId) query.append('sekolahId', params.sekolahId);
    if (params?.search) query.append('search', params.search);
    if (params?.statusKepegawaian) query.append('statusKepegawaian', params.statusKepegawaian);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.publicOnly !== undefined) query.append('publicOnly', params.publicOnly.toString());
    return request<{ data: any[]; total: number; page: number; limit: number; totalPages: number }>(
      `/teachers?${query.toString()}`
    );
  },
  createTeacher: (data: any) =>
    request<any>('/teachers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateTeacher: (id: string, data: any) =>
    request<any>(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteTeacher: (id: string) =>
    request<any>(`/teachers/${id}`, {
      method: 'DELETE'
    }),

  // Achievements
  getAchievements: (params?: { sekolahId?: string; tingkat?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.sekolahId) query.append('sekolahId', params.sekolahId);
    if (params?.tingkat) query.append('tingkat', params.tingkat);
    if (params?.search) query.append('search', params.search);
    return request<any[]>(`/achievements?${query.toString()}`);
  },
  createAchievement: (data: any) =>
    request<any>('/achievements', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateAchievement: (id: string, data: any) =>
    request<any>(`/achievements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteAchievement: (id: string) =>
    request<any>(`/achievements/${id}`, {
      method: 'DELETE'
    }),

  // News
  getNews: (params?: {
    sekolahId?: string;
    kategori?: string;
    search?: string;
    publishOnly?: boolean;
    featuredOnly?: boolean;
  }) => {
    const query = new URLSearchParams();
    if (params?.sekolahId) query.append('sekolahId', params.sekolahId);
    if (params?.kategori) query.append('kategori', params.kategori);
    if (params?.search) query.append('search', params.search);
    if (params?.publishOnly !== undefined) query.append('publishOnly', params.publishOnly.toString());
    if (params?.featuredOnly !== undefined) query.append('featuredOnly', params.featuredOnly.toString());
    return request<any[]>(`/news?${query.toString()}`);
  },
  getNewsBySlug: (slug: string) => request<any>(`/news/${slug}`),
  createNews: (data: any) =>
    request<any>('/news', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateNews: (id: string, data: any) =>
    request<any>(`/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteNews: (id: string) =>
    request<any>(`/news/${id}`, {
      method: 'DELETE'
    }),

  // Announcements
  getAnnouncements: (publishOnly = false) =>
    request<any[]>(`/announcements?publishOnly=${publishOnly}`),
  createAnnouncement: (data: any) =>
    request<any>('/announcements', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateAnnouncement: (id: string, data: any) =>
    request<any>(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteAnnouncement: (id: string) =>
    request<any>(`/announcements/${id}`, {
      method: 'DELETE'
    }),

  // Gallery
  getGallery: (params?: { sekolahId?: string; kategori?: string; jenis?: string }) => {
    const query = new URLSearchParams();
    if (params?.sekolahId) query.append('sekolahId', params.sekolahId);
    if (params?.kategori) query.append('kategori', params.kategori);
    if (params?.jenis) query.append('jenis', params.jenis);
    return request<any[]>(`/gallery?${query.toString()}`);
  },
  createGallery: (data: any) =>
    request<any>('/gallery', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateGallery: (id: string, data: any) =>
    request<any>(`/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteGallery: (id: string) =>
    request<any>(`/gallery/${id}`, {
      method: 'DELETE'
    }),

  // Contacts
  getContacts: () => request<any[]>('/contacts'),
  sendContactMessage: (data: any) =>
    request<{ message: string; data: any }>('/contacts', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateContactStatus: (id: string, status: string) =>
    request<any>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
  deleteContact: (id: string) =>
    request<any>(`/contacts/${id}`, {
      method: 'DELETE'
    }),

  // Dashboard Stats
  getDashboardStats: () => request<any>('/dashboard'),

  // Visitors Tracking & Stats
  trackVisit: (data: { visitorId: string; path: string; referrer?: string }) =>
    request<{ success: boolean; totalVisitors: number; todayVisitors: number }>('/visitors/track', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getVisitorSummary: () => request<any>('/visitors/summary'),

  // System Diagnostics (Admin only)
  getSystemStatus: () => request<any>('/admin/system-status'),

  // Global Search
  searchGlobal: (q: string) => request<any>(`/search?q=${encodeURIComponent(q)}`),

  // Bulk Imports
  importSchoolsBulk: (items: any[]) =>
    request<{ success: boolean; count: number; data: any[] }>('/schools/bulk', {
      method: 'POST',
      body: JSON.stringify({ items })
    }),
  importTeachersBulk: (items: any[], defaultSekolahId?: string) =>
    request<{ success: boolean; count: number; data: any[] }>('/teachers/bulk', {
      method: 'POST',
      body: JSON.stringify({ items, defaultSekolahId })
    }),
  importAchievementsBulk: (items: any[], defaultSekolahId?: string) =>
    request<{ success: boolean; count: number; data: any[] }>('/achievements/bulk', {
      method: 'POST',
      body: JSON.stringify({ items, defaultSekolahId })
    }),
  importPrincipalsBulk: (items: any[], defaultSekolahId?: string) =>
    request<{ success: boolean; count: number; data: any[] }>('/principals/bulk', {
      method: 'POST',
      body: JSON.stringify({ items, defaultSekolahId })
    }),

  // File Upload
  uploadFile: async (file: File): Promise<{ url: string; filename: string }> => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal mengunggah file.');
    }
    return response.json();
  },

  // Document Parser (PDF, Word, Excel)
  parseDocument: async (
    file: File
  ): Promise<{
    success: boolean;
    filename: string;
    fileType: 'excel' | 'word' | 'pdf' | 'text';
    headers: string[];
    rows: Record<string, any>[];
    totalRows: number;
    rawText: string;
  }> => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}/documents/parse`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal memproses dokumen.');
    }
    return response.json();
  },

  // Database Backup & Restore
  getBackupSummary: () => request<any>('/backup/summary'),
  getBackupData: () => request<any>('/backup'),
  downloadBackupJson: async () => {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/backup?download=true`, {
      method: 'GET',
      headers
    });
    if (!res.ok) throw new Error('Gagal mengunduh file cadangan database.');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_portal_pengawas_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
  downloadBackupExcel: async () => {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/backup/excel`, {
      method: 'GET',
      headers
    });
    if (!res.ok) throw new Error('Gagal mengekspor data ke Excel.');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portal_pengawas_data_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
  restoreBackup: async (fileOrData: File | any) => {
    const token = getAuthToken();
    if (fileOrData instanceof File) {
      const formData = new FormData();
      formData.append('file', fileOrData);
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/backup/restore`, {
        method: 'POST',
        headers,
        body: formData
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Gagal memulihkan database.');
      }
      return res.json();
    } else {
      return request<any>('/backup/restore', {
        method: 'POST',
        body: JSON.stringify(fileOrData)
      });
    }
  },

  // Buku Tamu Digital
  getBukuTamu: () => request<BukuTamu[]>('/buku-tamu'),
  createBukuTamu: (data: { nama: string; jabatan: string; instansi: string; masukan: string }) =>
    request<BukuTamu>('/buku-tamu', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  deleteBukuTamu: (id: string) =>
    request<{ success: boolean; message: string }>(`/buku-tamu/${id}`, {
      method: 'DELETE'
    })
};
