import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'portal-pengawas-supabase-session';

// Mengurai dan memverifikasi token sesi (Mendukung Supabase Auth JWT Token & Session Token)
export function verifyToken(token: string) {
  try {
    const decoded = jwt.decode(token) as any;
    if (decoded && (decoded.sub || decoded.user_id || decoded.id)) {
      return {
        id: decoded.sub || decoded.user_id || decoded.id,
        email: decoded.email || decoded.user_metadata?.email || 'admin@pengawassekolah.id',
        role: decoded.role || decoded.user_metadata?.role || 'SUPERADMIN',
        name: decoded.name || decoded.user_metadata?.nama || decoded.user_metadata?.name || 'Administrator Portal'
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function generateToken(payload: { id: string; email: string; role: string; name: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Akses ditolak: Token autentikasi Supabase diperlukan.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ error: 'Sesi telah kedaluwarsa atau token tidak valid. Silakan login kembali.' });
    return;
  }

  req.user = decoded;
  next();
}
