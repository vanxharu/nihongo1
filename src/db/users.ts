import { db, withDbRetry } from './index';
import { users } from './schema';
import { eq, sql } from 'drizzle-orm';

export function getBootstrapAdminEmails(): Set<string> {
  const envVar = process.env.ADMIN_EMAILS || '';
  const set = new Set<string>();
  if (envVar) {
    envVar.split(',').forEach(email => {
      const trimmed = email.trim().toLowerCase();
      if (trimmed) set.add(trimmed);
    });
  }
  return set;
}

export const ADMIN_EMAILS = getBootstrapAdminEmails();

export async function getOrCreateUser(uid: string, email: string) {
  return await withDbRetry(async () => {
    const normalizedEmail = (email || '').toLowerCase().trim();
    const bootstrapAdmins = getBootstrapAdminEmails();
    const isBootstrapAdmin = normalizedEmail ? bootstrapAdmins.has(normalizedEmail) : false;

    // 1. Check if user already exists by UID
    const existingByUid = await db.select().from(users).where(eq(users.uid, uid)).execute();
    if (existingByUid.length > 0) {
      const u = existingByUid[0];
      // Ensure bootstrap admin accounts receive admin role upon login
      if (isBootstrapAdmin && u.role !== 'admin') {
        const updated = await db.update(users)
          .set({ role: 'admin' })
          .where(eq(users.uid, uid))
          .returning();
        return updated[0];
      }
      return u;
    }

    // 2. If UID is not found, check if a user with this email already exists
    // (Preserves learning progress, XP, streak, achievements when linking accounts)
    if (normalizedEmail) {
      const existingByEmail = await db.select().from(users).where(eq(users.email, normalizedEmail)).execute();
      if (existingByEmail.length > 0) {
        const u = existingByEmail[0];
        // Preserve admin status if existing user was admin or is bootstrap admin
        const targetRole = u.role === 'admin' ? 'admin' : (isBootstrapAdmin ? 'admin' : (u.role || 'user'));
        const updated = await db.update(users)
          .set({ 
            uid: uid,
            role: targetRole
          })
          .where(eq(users.id, u.id))
          .returning();
        return updated[0];
      }
    }

    const todayStr = new Date().toISOString().split('T')[0] || '';
    const defaultName = normalizedEmail ? normalizedEmail.split('@')[0] : 'Học viên JLPT';
    const defaultUsername = normalizedEmail ? normalizedEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') : defaultName.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const initialRole = isBootstrapAdmin ? 'admin' : 'user';

    try {
      const result = await db.insert(users)
        .values({
          uid,
          email: normalizedEmail,
          username: defaultUsername,
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
          role: initialRole,
        })
        .returning();

      return result[0];
    } catch (insertErr: any) {
      // Race condition safety: if concurrent requests inserted the same UID
      const reCheck = await db.select().from(users).where(eq(users.uid, uid)).execute();
      if (reCheck.length > 0) {
        return reCheck[0];
      }
      throw insertErr;
    }
  });
}

export async function updateUserProfile(uid: string, fields: any, allowRoleChange: boolean = false) {
  return await withDbRetry(async () => {
    const updateData: any = {};
    
    if (fields.username !== undefined) {
      updateData.username = fields.username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
    }
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
    
    // SECURITY / RBAC: Role CANNOT be changed by regular profile updates.
    // Only privileged admin operations (allowRoleChange = true) are permitted to alter role.
    if (fields.role !== undefined && allowRoleChange) {
      if (fields.role === 'admin' || fields.role === 'user') {
        updateData.role = fields.role;
      }
    }

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

export async function findUserByIdentifier(identifier: string) {
  return await withDbRetry(async () => {
    const raw = (identifier || '').trim();
    if (!raw) return null;
    const lower = raw.toLowerCase();

    // 1. Direct match on username or email
    const byUsernameOrEmail = await db.select().from(users).where(
      sql`LOWER(${users.username}) = ${lower} OR LOWER(${users.email}) = ${lower}`
    ).execute();
    if (byUsernameOrEmail.length > 0) return byUsernameOrEmail[0];

    // 2. Match on name
    const byName = await db.select().from(users).where(
      sql`LOWER(${users.name}) = ${lower}`
    ).execute();
    if (byName.length > 0) return byName[0];

    // 3. Match on email prefix (e.g. "vanvan20001220" from "vanvan20001220@gmail.com")
    const byPrefix = await db.select().from(users).where(
      sql`LOWER(SPLIT_PART(${users.email}, '@', 1)) = ${lower}`
    ).execute();
    if (byPrefix.length > 0) return byPrefix[0];

    return null;
  });
}

