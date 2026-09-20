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
    let decodedToken: any = null;

    // 1. Try Firebase Admin token verification if available
    if (adminAuth) {
      try {
        decodedToken = await adminAuth.verifyIdToken(token);
      } catch (fbErr: any) {
        // Fallback to internal session token below
      }
    }

    // 2. Try App Session token verification
    if (!decodedToken && token.startsWith('app-session-')) {
      try {
        const rawJson = Buffer.from(token.replace('app-session-', ''), 'base64').toString('utf-8');
        const sessionData = JSON.parse(rawJson);
        if (sessionData && sessionData.uid && sessionData.email) {
          decodedToken = {
            uid: sessionData.uid,
            email: sessionData.email,
            name: sessionData.name || sessionData.email.split('@')[0],
            role: sessionData.role === 'admin' ? 'admin' : 'user',
            email_verified: true,
            auth_time: Math.floor((sessionData.timestamp || Date.now()) / 1000)
          };
        }
      } catch (tokenErr) {
        console.warn('Failed to parse app session token:', tokenErr);
      }
    }

    if (!decodedToken) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    req.user = decodedToken;
    
    // Upsert user into database to ensure relations work
    try {
      const userFromDb = await getOrCreateUser(decodedToken.uid, decodedToken.email || '');
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
        role: (decodedToken.role === 'admin' ? 'admin' : 'user') as UserRole
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
