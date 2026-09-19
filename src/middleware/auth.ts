import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getOrCreateUser } from '../db/users';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  dbUser?: any; // To store our internal users row
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
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    
    // Upsert user into database to ensure relations work
    try {
      req.dbUser = await getOrCreateUser(decodedToken.uid, decodedToken.email || '');
    } catch (dbErr) {
      console.warn('DB user retrieval failed, falling back to basic token user:', dbErr);
      const isOwner = (decodedToken.email && decodedToken.email.toLowerCase() === 'vanvan20001220@gmail.com') || false;
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
        role: isOwner ? 'admin' : 'user'
      };
    }

    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
