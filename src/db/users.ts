import { db, withDbRetry } from './index';
import { users } from './schema';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string) {
  return await withDbRetry(async () => {
    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.uid, uid)).execute();
    if (existing.length > 0) {
      // Check if we need to promote the user to admin based on their email
      const u = existing[0];
      const isOwnerEmail = email.toLowerCase() === 'vanvan20001220@gmail.com';
      if (isOwnerEmail && u.role !== 'admin') {
        const updated = await db.update(users)
          .set({ role: 'admin' })
          .where(eq(users.uid, uid))
          .returning();
        return updated[0];
      }
      return u;
    }

    const todayStr = new Date().toISOString().split('T')[0] || '';
    const defaultName = email ? email.split('@')[0] : 'Học viên JLPT';
    const role = (email && email.toLowerCase() === 'vanvan20001220@gmail.com') ? 'admin' : 'user';

    const result = await db.insert(users)
      .values({
        uid,
        email,
        name: defaultName,
        avatar: '🦊',
        targetLevel: 'N4',
        xp: 0,
        streak: 0,
        coins: 0,
        lastActiveDate: todayStr,
        studyDays: JSON.stringify([todayStr]),
        completedLessons: JSON.stringify([]),
        vocabStatus: JSON.stringify({}),
        grammarStatus: JSON.stringify({}),
        kanjiStatus: JSON.stringify({}),
        dailyTestResults: JSON.stringify([]),
        role: role,
      })
      .returning();

    return result[0];
  });
}

export async function updateUserProfile(uid: string, fields: any) {
  return await withDbRetry(async () => {
    const updateData: any = {};
    
    if (fields.name !== undefined) updateData.name = fields.name;
    if (fields.avatar !== undefined) updateData.avatar = fields.avatar;
    if (fields.targetLevel !== undefined) updateData.targetLevel = fields.targetLevel;
    if (fields.xp !== undefined) updateData.xp = fields.xp;
    if (fields.streak !== undefined) updateData.streak = fields.streak;
    if (fields.coins !== undefined) updateData.coins = fields.coins;
    if (fields.lastActiveDate !== undefined) updateData.lastActiveDate = fields.lastActiveDate;
    if (fields.isVip !== undefined) updateData.isVip = fields.isVip;
    if (fields.studyDays !== undefined) updateData.studyDays = typeof fields.studyDays === 'string' ? fields.studyDays : JSON.stringify(fields.studyDays);
    if (fields.completedLessons !== undefined) updateData.completedLessons = typeof fields.completedLessons === 'string' ? fields.completedLessons : JSON.stringify(fields.completedLessons);
    if (fields.vocabStatus !== undefined) updateData.vocabStatus = typeof fields.vocabStatus === 'string' ? fields.vocabStatus : JSON.stringify(fields.vocabStatus);
    if (fields.grammarStatus !== undefined) updateData.grammarStatus = typeof fields.grammarStatus === 'string' ? fields.grammarStatus : JSON.stringify(fields.grammarStatus);
    if (fields.kanjiStatus !== undefined) updateData.kanjiStatus = typeof fields.kanjiStatus === 'string' ? fields.kanjiStatus : JSON.stringify(fields.kanjiStatus);
    if (fields.dailyTestResults !== undefined) updateData.dailyTestResults = typeof fields.dailyTestResults === 'string' ? fields.dailyTestResults : JSON.stringify(fields.dailyTestResults);
    if (fields.lastPosition !== undefined) updateData.lastPosition = typeof fields.lastPosition === 'string' ? fields.lastPosition : JSON.stringify(fields.lastPosition);
    if (fields.notificationSettings !== undefined) updateData.notificationSettings = typeof fields.notificationSettings === 'string' ? fields.notificationSettings : JSON.stringify(fields.notificationSettings);
    if (fields.role !== undefined) updateData.role = fields.role;

    if (Object.keys(updateData).length === 0) {
      const existing = await db.select().from(users).where(eq(users.uid, uid)).execute();
      return existing[0] || null;
    }

    const result = await db.update(users)
      .set(updateData)
      .where(eq(users.uid, uid))
      .returning();

    return result[0];
  });
}

export async function getAllUsers() {
  return await withDbRetry(async () => {
    return await db.select().from(users).execute();
  });
}

export async function deleteUserByUid(uid: string) {
  return await withDbRetry(async () => {
    return await db.delete(users).where(eq(users.uid, uid)).returning();
  });
}

