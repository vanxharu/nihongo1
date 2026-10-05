import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getOrCreateUser } from '../db/users';
import { UserRole } from '../types';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  dbUser?: {
    id?: number;
    uid: string;
    email: string;
    name: string | null;
    avatar: string | null;
    targetLevel: string | null;
    xp: number | null;
    streak: number | null;
    coins: number | null;
    role: UserRole;
    isVip?: boolean | null;
    [key: string]: any;
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    // Only cryptographically verified Firebase ID tokens are accepted.
    // Unsigned/self-issued session tokens must never be trusted.
    if (!adminAuth) {
      console.error('Firebase Admin is not initialized; rejecting authenticated request.');
      return res.status(503).json({ error: 'Authentication service unavailable' });
    }

    let decodedToken: DecodedIdToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    req.user = decodedToken;

    // Upsert user into database to ensure relations work.
    // Bootstrap-admin promotion only applies when the email is verified,
    // so nobody can claim an admin email by registering it unverified.
    try {
      const userFromDb = await getOrCreateUser(
        decodedToken.uid,
        decodedToken.email || '',
        decodedToken.email_verified === true
      );
      req.dbUser = {
        ...userFromDb,
        role: (userFromDb.role === 'admin' ? 'admin' : 'user') as UserRole
      };
    } catch (dbErr) {
      console.warn('DB user retrieval failed, falling back to basic token user:', dbErr);
      req.dbUser = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        name: decodedToken.name || (decodedToken.email ? decodedToken.email.split('@')[0] : 'Học viên JLPT'),
        avatar: '🦊',
        targetLevel: 'N4',
        xp: 0,
        streak: 1,
        coins: 0,
        lastActiveDate: new Date().toISOString().split('T')[0] || '',
        studyDays: '[]',
        completedLessons: '[]',
        vocabStatus: '{}',
        grammarStatus: '{}',
        kanjiStatus: '{}',
        dailyTestResults: '[]',
        role: 'user' as UserRole
      };
    }

    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

/**
 * Middleware ensuring that only authenticated users with database role === 'admin'
 * are permitted to access administrative resources.
 */
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  if (!req.dbUser || req.dbUser.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access only' });
  }
  next();
};
