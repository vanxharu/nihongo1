import type { JLPTLevel, UserProfile } from '../types';

/** Lựa chọn mục tiêu: 5 cấp JLPT + "Công sở" (BIZ). Công sở chỉ đổi bộ từ vựng, giữ nguyên cấp JLPT cho phần còn lại. */
export type TargetChoice = JLPTLevel | 'BIZ';
export const TARGET_CHOICES: TargetChoice[] = ['N5', 'N4', 'N3', 'N2', 'N1', 'BIZ'];
export const targetLabel = (c: TargetChoice) => (c === 'BIZ' ? 'Công sở' : c);
export const targetChoice = (p: Pick<UserProfile, 'targetLevel' | 'studyTrack'>): TargetChoice =>
  p.studyTrack === 'business' ? 'BIZ' : p.targetLevel;
// 'jlpt' is sent (not omitted) so the server clears a previously saved business track.
export const targetPatch = (c: TargetChoice): Partial<UserProfile> =>
  c === 'BIZ' ? { studyTrack: 'business' } : { targetLevel: c, studyTrack: 'jlpt' as any };
