import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { db } from './db.js';
import {
  requireAuth,
  AuthenticatedRequest,
  generateToken,
  comparePassword,
  hashPassword
} from './auth.js';
import { uploadMiddleware } from './upload.js';
import { isServerSupabaseConfigured, supabaseServer } from './supabase.js';

export const apiRouter = Router();

// 1. Health check & Supabase connection info
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Portal Pengawas Sekolah API',
    database: isServerSupabaseConfigured() ? 'Supabase PostgreSQL' : 'Local Persistent Store (Supabase Ready)'
  });
});

// 2. Authentication
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email dan password harus diisi.' });
      return;
    }

    // Cek jika Supabase Auth configured di server
    if (isServerSupabaseConfigured() && supabaseServer) {
      try {
        const { data: authData, error: authError } = await supabaseServer.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (!authError && authData.session && authData.user) {
          const token = authData.session.access_token;
          res.json({
            token,
            admin: {
              id: authData.user.id,
              email: authData.user.email,
              name: authData.user.user_metadata?.nama || authData.user.user_metadata?.name || 'Administrator Portal',
              role: authData.user.user_metadata?.role || 'SUPERADMIN'
            }
          });
          return;
        }
      } catch (sbErr) {
        // Fallback to internal admin check
      }
    }

    const admin = db.findAdminByEmail(email.trim());
    if (!admin) {
      res.status(401).json({ error: 'Email atau password salah.' });
      return;
    }

    const isMatch = await comparePassword(password, admin.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Email atau password salah.' });
      return;
    }

    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      name: admin.name
    });

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan sistem saat proses login.' });
  }
});

apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Tidak terotentikasi' });
    return;
  }
  const admin = db.findAdminById(req.user.id);
  if (admin) {
    res.json({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    });
    return;
  }
  // If from Supabase Auth token
  res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role
  });
});

apiRouter.put('/auth/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Password lama dan password baru wajib diisi.' });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Password baru minimal 6 karakter.' });
      return;
    }
    const admin = db.findAdminById(req.user!.id);
    if (!admin) {
      res.status(404).json({ error: 'Admin tidak ditemukan.' });
      return;
    }
    const isMatch = await comparePassword(currentPassword, admin.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: 'Password lama tidak sesuai.' });
      return;
    }
    const newHash = await hashPassword(newPassword);
    db.updateAdmin(admin.id, { passwordHash: newHash });
    res.json({ message: 'Password berhasil diperbarui.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Gagal memperbarui password.' });
  }
});

// 3. Pengawas Profile
apiRouter.get('/pengawas', (_req: Request, res: Response) => {
  const pengawas = db.getPengawas();
  res.json(pengawas);
});

apiRouter.put('/pengawas', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updatePengawas(req.body);
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Gagal memperbarui profil pengawas.' });
  }
});

// 4. Website Settings
apiRouter.get('/settings', (_req: Request, res: Response) => {
  const settings = db.getSettings();
  res.json(settings);
});

apiRouter.put('/settings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateSettings(req.body);
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Gagal memperbarui pengaturan website.' });
  }
});

// 5. Sekolah Binaan
apiRouter.get('/schools', (req: Request, res: Response) => {
  const { search, jenjang, status } = req.query as { search?: string; jenjang?: string; status?: string };
  const list = db.getSchools({ search, jenjang, status });
  res.json(list);
});

apiRouter.get('/schools/:id', (req: Request, res: Response) => {
  const school = db.getSchoolById(req.params.id);
  if (!school) {
    res.status(404).json({ error: 'Data satuan pendidikan tidak ditemukan.' });
    return;
  }
  res.json(school);
});

apiRouter.post('/schools', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { nama, npsn, jenjang, status, alamat } = req.body;
    if (!nama || !npsn || !jenjang || !status || !alamat) {
      res.status(400).json({ error: 'Nama, NPSN, Jenjang, Status, dan Alamat wajib diisi.' });
      return;
    }
    const created = db.createSchool(req.body);
    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: 'Gagal menambahkan data sekolah.' });
  }
});

apiRouter.post('/schools/bulk', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Data sekolah yang diimpor tidak boleh kosong.' });
      return;
    }
    const created = db.createBulkSekolah(items);
    res.status(201).json({ success: true, count: created.length, data: created });
  } catch (error) {
    console.error('Bulk schools error:', error);
    res.status(500).json({ error: 'Gagal mengimpor data sekolah.' });
  }
});

apiRouter.put('/schools/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateSchool(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Sekolah tidak ditemukan.' });
      return;
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Gagal memperbarui data sekolah.' });
  }
});

apiRouter.delete('/schools/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const ok = db.deleteSchool(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'Sekolah tidak ditemukan.' });
      return;
    }
    res.json({ message: 'Sekolah beserta seluruh relasi data berhasil dihapus.' });
  } catch {
    res.status(500).json({ error: 'Gagal menghapus data sekolah.' });
  }
});

// 6. Visi & Misi
apiRouter.get('/vision-mission/:sekolahId', (req: Request, res: Response) => {
  const vm = db.getVisiMisi(req.params.sekolahId);
  res.json(vm || { sekolahId: req.params.sekolahId, visi: '', misi: '', tujuan: '', programUnggulan: '' });
});

apiRouter.put('/vision-mission/:sekolahId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const saved = db.upsertVisiMisi(req.params.sekolahId, req.body);
    res.json(saved);
  } catch {
    res.status(500).json({ error: 'Gagal menyimpan visi & misi sekolah.' });
  }
});

// 7. Struktur Organisasi
apiRouter.get('/organization', (req: Request, res: Response) => {
  const { sekolahId } = req.query as { sekolahId?: string };
  const list = db.getStruktur(sekolahId);
  res.json(list);
});

apiRouter.post('/organization', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const created = db.createStruktur(req.body);
    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: 'Gagal menambahkan anggota struktur organisasi.' });
  }
});

apiRouter.put('/organization/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateStruktur(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Data struktur tidak ditemukan.' });
      return;
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Gagal memperbarui data struktur organisasi.' });
  }
});

apiRouter.delete('/organization/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const ok = db.deleteStruktur(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'Data struktur tidak ditemukan.' });
      return;
    }
    res.json({ message: 'Data berhasil dihapus.' });
  } catch {
    res.status(500).json({ error: 'Gagal menghapus data struktur organisasi.' });
  }
});

// 8. Fasilitas Sekolah
apiRouter.get('/facilities', (req: Request, res: Response) => {
  const { sekolahId } = req.query as { sekolahId?: string };
  const list = db.getFasilitas(sekolahId);
  res.json(list);
});

apiRouter.post('/facilities', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const created = db.createFasilitas(req.body);
    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: 'Gagal menambahkan fasilitas.' });
  }
});

apiRouter.put('/facilities/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateFasilitas(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Fasilitas tidak ditemukan.' });
      return;
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Gagal memperbarui fasilitas.' });
  }
});

apiRouter.delete('/facilities/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const ok = db.deleteFasilitas(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'Fasilitas tidak ditemukan.' });
      return;
    }
    res.json({ message: 'Fasilitas berhasil dihapus.' });
  } catch {
    res.status(500).json({ error: 'Gagal menghapus fasilitas.' });
  }
});

// 9. Keunggulan Sekolah
apiRouter.get('/excellence', (req: Request, res: Response) => {
  const { sekolahId } = req.query as { sekolahId?: string };
  const list = db.getKeunggulan(sekolahId);
  res.json(list);
});

apiRouter.post('/excellence', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const created = db.createKeunggulan(req.body);
    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: 'Gagal menambahkan keunggulan.' });
  }
});

apiRouter.put('/excellence/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateKeunggulan(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Keunggulan tidak ditemukan.' });
      return;
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Gagal memperbarui keunggulan.' });
  }
});

apiRouter.delete('/excellence/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const ok = db.deleteKeunggulan(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'Keunggulan tidak ditemukan.' });
      return;
    }
    res.json({ message: 'Keunggulan berhasil dihapus.' });
  } catch {
    res.status(500).json({ error: 'Gagal menghapus keunggulan.' });
  }
});

// 10. Kepala Sekolah
apiRouter.get('/principals', (req: Request, res: Response) => {
  const { sekolahId } = req.query as { sekolahId?: string };
  const list = db.getKepalaSekolah(sekolahId);
  res.json(list);
});

apiRouter.post('/principals', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const created = db.createKepalaSekolah(req.body);
    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: 'Gagal menambahkan data kepala sekolah.' });
  }
});

apiRouter.put('/principals/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateKepalaSekolah(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Kepala sekolah tidak ditemukan.' });
      return;
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Gagal memperbarui data kepala sekolah.' });
  }
});

apiRouter.delete('/principals/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const ok = db.deleteKepalaSekolah(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'Kepala sekolah tidak ditemukan.' });
      return;
    }
    res.json({ message: 'Data kepala sekolah berhasil dihapus.' });
  } catch {
    res.status(500).json({ error: 'Gagal menghapus data kepala sekolah.' });
  }
});

apiRouter.post('/principals/bulk', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items, defaultSekolahId } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Data items kepala sekolah wajib berupa array dan tidak boleh kosong.' });
      return;
    }
    const prepared = items
      .filter((it: any) => it.nama && it.nama.trim().length > 0)
      .map((it: any) => ({
        sekolahId: it.sekolahId || defaultSekolahId || '',
        nama: it.nama.trim(),
        nip: it.nip || '',
        periode: it.periode || '2022 - Sekarang',
        status: it.status || 'Aktif',
        foto: it.foto || '',
        keterangan: it.keterangan || '',
        sambutan: it.sambutan || ''
      }));
    if (prepared.length === 0) {
      res.status(400).json({ error: 'Tidak ada baris data kepala sekolah yang memiliki Nama valid.' });
      return;
    }
    const created = db.createBulkKepalaSekolah(prepared);
    res.status(201).json({ success: true, count: created.length, data: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal mengimpor data kepala sekolah secara massal.' });
  }
});

// 11. Data Guru
apiRouter.get('/teachers', (req: Request, res: Response) => {
  const {
    sekolahId,
    search,
    statusKepegawaian,
    page = '1',
    limit = '50',
    publicOnly = 'false'
  } = req.query as {
    sekolahId?: string;
    search?: string;
    statusKepegawaian?: string;
    page?: string;
    limit?: string;
    publicOnly?: string;
  };
  const result = db.getGuru({
    sekolahId,
    search,
    statusKepegawaian,
    tampilkanPublikOnly: publicOnly === 'true',
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  });
  res.json(result);
});

apiRouter.post('/teachers', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { nama, jabatan, sekolahId } = req.body;
    if (!nama || !jabatan || !sekolahId) {
      res.status(400).json({ error: 'Nama, Jabatan, dan Satuan Pendidikan wajib diisi.' });
      return;
    }
    const created = db.createGuru(req.body);
    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: 'Gagal menambahkan data guru.' });
  }
});

apiRouter.post('/teachers/bulk', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items, defaultSekolahId } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Data guru yang diimpor tidak boleh kosong.' });
      return;
    }
    const prepared = items.map((item: any) => ({
      sekolahId: item.sekolahId || defaultSekolahId || '',
      nama: item.nama || '',
      nip: item.nip || '',
      nuptk: item.nuptk || '',
      jabatan: item.jabatan || 'Guru Kelas',
      mapel: item.mapel || '',
      pendidikan: item.pendidikan || 'S1 PGSD',
      statusKepegawaian: item.statusKepegawaian || 'PNS',
      email: item.email || '',
      foto: item.foto || '',
      tampilkanPublik: item.tampilkanPublik !== false
    }));
    const created = db.createBulkGuru(prepared);
    res.status(201).json({ success: true, count: created.length, data: created });
  } catch (error) {
    console.error('Bulk teachers error:', error);
    res.status(500).json({ error: 'Gagal mengimpor data dewan guru.' });
  }
});

apiRouter.put('/teachers/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateGuru(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Data guru tidak ditemukan.' });
      return;
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Gagal memperbarui data guru.' });
  }
});

apiRouter.delete('/teachers/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const ok = db.deleteGuru(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'Data guru tidak ditemukan.' });
      return;
    }
    res.json({ message: 'Data guru berhasil dihapus.' });
  } catch {
    res.status(500).json({ error: 'Gagal menghapus data guru.' });
  }
});

// 12. Prestasi
apiRouter.get('/achievements', (req: Request, res: Response) => {
  const { sekolahId, tingkat, search } = req.query as { sekolahId?: string; tingkat?: string; search?: string };
  const list = db.getPrestasi({ sekolahId, tingkat, search });
  res.json(list);
});

apiRouter.post('/achievements', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const created = db.createPrestasi(req.body);
    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: 'Gagal menambahkan prestasi.' });
  }
});

apiRouter.post('/achievements/bulk', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items, defaultSekolahId } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Data prestasi yang diimpor tidak boleh kosong.' });
      return;
    }
    const prepared = items.map((item: any) => ({
      sekolahId: item.sekolahId || defaultSekolahId || '',
      namaPrestasi: item.namaPrestasi || item.judul || '',
      tingkat: item.tingkat || 'KABUPATEN',
      tahun: Number(item.tahun) || new Date().getFullYear(),
      bidang: item.bidang || 'Akademik',
      peraih: item.peraih || item.penerima || '',
      keterangan: item.keterangan || item.deskripsi || (item.juara ? `${item.juara} - ${item.keterangan || ''}`.trim() : ''),
      foto: item.foto || ''
    }));
    const created = db.createBulkPrestasi(prepared);
    res.status(201).json({ success: true, count: created.length, data: created });
  } catch (error) {
    console.error('Bulk achievements error:', error);
    res.status(500).json({ error: 'Gagal mengimpor data prestasi.' });
  }
});

apiRouter.put('/achievements/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updatePrestasi(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Prestasi tidak ditemukan.' });
      return;
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Gagal memperbarui prestasi.' });
  }
});

apiRouter.delete('/achievements/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const ok = db.deletePrestasi(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'Prestasi tidak ditemukan.' });
      return;
    }
    res.json({ message: 'Prestasi berhasil dihapus.' });
  } catch {
    res.status(500).json({ error: 'Gagal menghapus prestasi.' });
  }
});

// 13. Berita & Pengumuman
apiRouter.get('/news', (req: Request, res: Response) => {
  const { sekolahId, kategori, search, publishOnly, featuredOnly } = req.query as {
    sekolahId?: string;
    kategori?: string;
    search?: string;
    publishOnly?: string;
    featuredOnly?: string;
  };
  const list = db.getBerita({
    sekolahId,
    kategori,
    search,
    publishOnly: publishOnly === 'true',
    featuredOnly: featuredOnly === 'true'
  });
  res.json(list);
});

apiRouter.get('/news/:slug', (req: Request, res: Response) => {
  const item = db.getBeritaBySlug(req.params.slug);
  if (!item) {
    res.status(404).json({ error: 'Berita tidak ditemukan.' });
    return;
  }
  res.json(item);
});

apiRouter.post('/news', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { judul, konten, kategori } = req.body;
    if (!judul || !konten || !kategori) {
      res.status(400).json({ error: 'Judul, konten, dan kategori wajib diisi.' });
      return;
    }
    const slug = (req.body.slug || judul.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')) + '-' + Date.now().toString().slice(-4);
    const created = db.createBerita({
      ...req.body,
      slug,
      tanggal: req.body.tanggal || new Date().toISOString()
    });
    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: 'Gagal menerbitkan berita.' });
  }
});

apiRouter.put('/news/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateBerita(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Berita tidak ditemukan.' });
      return;
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Gagal memperbarui berita.' });
  }
});

apiRouter.delete('/news/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const ok = db.deleteBerita(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'Berita tidak ditemukan.' });
      return;
    }
    res.json({ message: 'Berita berhasil dihapus.' });
  } catch {
    res.status(500).json({ error: 'Gagal menghapus berita.' });
  }
});

// 14. Pengumuman
apiRouter.get('/announcements', (req: Request, res: Response) => {
  const { publishOnly } = req.query as { publishOnly?: string };
  const list = db.getPengumuman(publishOnly === 'true');
  res.json(list);
});

apiRouter.post('/announcements', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const created = db.createPengumuman(req.body);
    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: 'Gagal membuat pengumuman.' });
  }
});

apiRouter.put('/announcements/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updatePengumuman(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Pengumuman tidak ditemukan.' });
      return;
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Gagal memperbarui pengumuman.' });
  }
});

apiRouter.delete('/announcements/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const ok = db.deletePengumuman(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'Pengumuman tidak ditemukan.' });
      return;
    }
    res.json({ message: 'Pengumuman berhasil dihapus.' });
  } catch {
    res.status(500).json({ error: 'Gagal menghapus pengumuman.' });
  }
});

// 15. Galeri
apiRouter.get('/gallery', (req: Request, res: Response) => {
  const { sekolahId, kategori, jenis } = req.query as { sekolahId?: string; kategori?: string; jenis?: string };
  const list = db.getGaleri({ sekolahId, kategori, jenis });
  res.json(list);
});

apiRouter.post('/gallery', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const created = db.createGaleri(req.body);
    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: 'Gagal menambahkan dokumentasi galeri.' });
  }
});

apiRouter.put('/gallery/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateGaleri(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Galeri tidak ditemukan.' });
      return;
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Gagal memperbarui dokumentasi galeri.' });
  }
});

apiRouter.delete('/gallery/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const ok = db.deleteGaleri(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'Galeri tidak ditemukan.' });
      return;
    }
    res.json({ message: 'Dokumentasi galeri berhasil dihapus.' });
  } catch {
    res.status(500).json({ error: 'Gagal menghapus dokumentasi galeri.' });
  }
});

// 16. Kontak
apiRouter.get('/contacts', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const list = db.getKontak();
  res.json(list);
});

apiRouter.post('/contacts', (req: Request, res: Response) => {
  try {
    const { nama, email, pesan, subjek } = req.body;
    if (!nama || !email || !pesan || !subjek) {
      res.status(400).json({ error: 'Nama, email, subjek, dan pesan wajib diisi.' });
      return;
    }
    const created = db.createKontak(req.body);
    res.status(201).json({ message: 'Pesan Anda berhasil dikirimkan.', data: created });
  } catch {
    res.status(500).json({ error: 'Gagal mengirim pesan.' });
  }
});

apiRouter.put('/contacts/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateKontak(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Pesan kontak tidak ditemukan.' });
      return;
    }
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Gagal memperbarui status pesan.' });
  }
});

apiRouter.delete('/contacts/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const ok = db.deleteKontak(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'Pesan kontak tidak ditemukan.' });
      return;
    }
    res.json({ message: 'Pesan berhasil dihapus.' });
  } catch {
    res.status(500).json({ error: 'Gagal menghapus pesan.' });
  }
});

// 16b. Buku Tamu Digital Endpoints
apiRouter.get('/buku-tamu', (_req: Request, res: Response) => {
  try {
    const list = db.getBukuTamu();
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Gagal mengambil data buku tamu.' });
  }
});

apiRouter.post('/buku-tamu', (req: Request, res: Response) => {
  try {
    const { nama, jabatan, instansi, masukan } = req.body;
    if (!nama || !jabatan || !instansi || !masukan) {
      res.status(400).json({ error: 'Nama, Jabatan, Instansi, dan Masukan wajib diisi.' });
      return;
    }
    const created = db.createBukuTamu({ nama, jabatan, instansi, masukan });
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Gagal menyimpan data buku tamu.' });
  }
});

apiRouter.delete('/buku-tamu/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const ok = db.deleteBukuTamu(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'Data buku tamu tidak ditemukan.' });
      return;
    }
    res.json({ success: true, message: 'Data tamu berhasil dihapus.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Gagal menghapus data buku tamu.' });
  }
});

// 17. Dashboard Stats
apiRouter.get('/dashboard', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const stats = db.getDashboardStats();
  res.json(stats);
});

// 17b. Visitors Tracking & Summary
apiRouter.post('/visitors/track', (req: Request, res: Response) => {
  try {
    const { visitorId, path: pagePath, referrer } = req.body;
    const userAgent = req.headers['user-agent'] as string | undefined;
    const result = db.recordVisit({
      visitorId: visitorId || '',
      path: pagePath || '/',
      referrer,
      userAgent
    });
    res.json(result);
  } catch (error) {
    console.error('Visitor track error:', error);
    res.status(500).json({ error: 'Gagal mencatat kunjungan.' });
  }
});

apiRouter.get('/visitors/summary', (_req: Request, res: Response) => {
  try {
    const summary = db.getVisitorStats();
    res.json(summary);
  } catch (error) {
    console.error('Visitor summary error:', error);
    res.status(500).json({ error: 'Gagal mengambil data statistik pengunjung.' });
  }
});

// 18. Global Search
apiRouter.get('/search', (req: Request, res: Response) => {
  const { q } = req.query as { q?: string };
  const results = db.searchGlobal(q || '');
  res.json(results);
});

// 19. Upload Endpoint
apiRouter.post('/upload', requireAuth, uploadMiddleware.single('file'), (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Tidak ada file yang diunggah.' });
      return;
    }
    const relativeUrl = `/uploads/${req.file.filename}`;
    res.json({
      url: relativeUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Gagal memproses file unggahan.' });
  }
});

// 19b. Document Parser Endpoint (PDF, Word, Excel, CSV)
apiRouter.post('/documents/parse', requireAuth, uploadMiddleware.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Silakan pilih file dokumen (PDF, Word, Excel) yang akan diproses.' });
      return;
    }
    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const ext = path.extname(originalName).toLowerCase();
    const fileBuffer = fs.readFileSync(filePath);

    let fileType: 'excel' | 'word' | 'pdf' | 'text' = 'text';
    let headers: string[] = [];
    let rows: Record<string, any>[] = [];
    let rawText = '';

    if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') {
      fileType = 'excel';
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const jsonRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      if (jsonRows.length > 0) {
        headers = Object.keys(jsonRows[0]);
        rows = jsonRows;
      }
      rawText = XLSX.utils.sheet_to_csv(sheet);
    } else if (ext === '.docx' || ext === '.doc') {
      fileType = 'word';
      try {
        const mammothObj = (mammoth as any).default || mammoth;
        const result = await mammothObj.extractRawText({ buffer: fileBuffer });
        rawText = result.value || '';
      } catch {
        rawText = fileBuffer.toString('utf-8');
      }

      const lines = rawText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
      const detectedRows: Record<string, any>[] = [];
      for (const line of lines) {
        if (line.includes('\t') || line.includes(';') || (line.includes(',') && line.split(',').length >= 3)) {
          const delimiter = line.includes('\t') ? '\t' : (line.includes(';') ? ';' : ',');
          const cols = line.split(delimiter).map(c => c.trim());
          if (cols.length >= 2) {
            detectedRows.push({
              col1: cols[0],
              col2: cols[1],
              col3: cols[2] || '',
              col4: cols[3] || '',
              col5: cols[4] || ''
            });
          }
        }
      }
      if (detectedRows.length > 0) {
        headers = Object.keys(detectedRows[0]);
        rows = detectedRows;
      }
    } else if (ext === '.pdf') {
      fileType = 'pdf';
      try {
        const parser = new PDFParse({ data: new Uint8Array(fileBuffer) });
        const pdfData = await parser.getText();
        rawText = pdfData.text || '';
        await parser.destroy();
      } catch (pdfErr) {
        console.error('PDF parsing error:', pdfErr);
      }

      const lines = rawText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
      const detectedRows: Record<string, any>[] = [];
      for (const line of lines) {
        if (line.includes('\t') || line.includes(';') || (line.includes('|') && line.split('|').length >= 3)) {
          const delimiter = line.includes('|') ? '|' : (line.includes('\t') ? '\t' : ';');
          const cols = line.split(delimiter).map(c => c.trim()).filter(c => c.length > 0);
          if (cols.length >= 2) {
            detectedRows.push({
              col1: cols[0],
              col2: cols[1],
              col3: cols[2] || '',
              col4: cols[3] || '',
              col5: cols[4] || ''
            });
          }
        }
      }
      if (detectedRows.length > 0) {
        headers = Object.keys(detectedRows[0]);
        rows = detectedRows;
      }
    } else {
      rawText = fileBuffer.toString('utf-8');
    }

    res.json({
      success: true,
      filename: originalName,
      fileType,
      headers,
      rows,
      totalRows: rows.length,
      rawText: rawText.substring(0, 10000)
    });
  } catch (error: any) {
    console.error('Document parse error:', error);
    res.status(500).json({ error: error.message || 'Gagal memproses file dokumen.' });
  }
});

// 20. System Status & Diagnostics (Khusus Administrator)
apiRouter.get('/admin/system-status', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const status = db.getSystemStatus();
  res.json({
    ...status,
    authProvider: isServerSupabaseConfigured() ? 'Supabase Authentication' : 'Internal / Supabase Ready Auth',
    apiUrl: process.env.API_URL || '/api'
  });
});

// 21. Database Backup & Restore Endpoints
apiRouter.get('/backup/summary', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const summary = db.getBackupSummary();
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Gagal membaca ringkasan database.' });
  }
});

apiRouter.get('/backup', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const download = req.query.download === 'true';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `portal_pengawas_backup_${timestamp}.json`;
    const rawData = db.getRaw();
    const backupPayload = {
      app: 'Portal Pengawas Sekolah',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      backupType: 'FULL_DATABASE_SNAPSHOT',
      database: rawData
    };
    if (download) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(JSON.stringify(backupPayload, null, 2));
      return;
    }
    res.json(backupPayload);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Gagal membuat cadangan database.' });
  }
});

apiRouter.get('/backup/excel', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const raw = db.getRaw();
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `portal_pengawas_data_export_${timestamp}.xlsx`;
    const wb = XLSX.utils.book_new();

    const sekolahRows = (raw.sekolah || []).map((s) => ({
      'ID Sekolah': s.id,
      'NPSN': s.npsn,
      'Nama Sekolah': s.nama,
      'Jenjang': s.jenjang,
      'Status': s.status,
      'Kepala Sekolah': s.kepalaSekolahNama || '',
      'Jumlah Guru': s.jumlahGuru || 0,
      'Jumlah Siswa': s.jumlahSiswa || 0,
      'Alamat': s.alamat || '',
      'Desa/Kelurahan': s.desaKelurahan || '',
      'Kecamatan': s.kecamatan || '',
      'Kabupaten': s.kabupaten || '',
      'Telepon': s.telepon || '',
      'Email': s.email || ''
    }));
    const wsSekolah = XLSX.utils.json_to_sheet(sekolahRows);
    XLSX.utils.book_append_sheet(wb, wsSekolah, 'Sekolah Binaan');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Gagal mengekspor data ke Excel.' });
  }
});

apiRouter.post('/backup/restore', requireAuth, uploadMiddleware.single('file'), (req: AuthenticatedRequest, res: Response) => {
  try {
    let payload: any = null;
    if (req.file) {
      const fileContent = fs.readFileSync(req.file.path, 'utf-8');
      payload = JSON.parse(fileContent);
    } else if (req.body) {
      payload = req.body;
    }
    if (!payload) {
      res.status(400).json({ error: 'Tidak ada file atau data backup yang dikirimkan.' });
      return;
    }
    const result = db.restoreRaw(payload);
    res.json(result);
  } catch (error: any) {
    console.error('Restore error:', error);
    res.status(500).json({ error: error.message || 'Gagal memulihkan database dari file cadangan.' });
  }
});
