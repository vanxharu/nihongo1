import React from 'react';
import VocabularyPractice from './VocabularyPractice';
import type { UserProfile } from '../types';

interface Props {
  userProfile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  onEarnXp: (amount: number) => void;
}
/** Tab "Từ vựng của tôi": cùng giao diện Từ vựng, dữ liệu là các từ đã lưu trong Sổ tay (từ Đọc hiểu, từ điển...). */
export default function MyVocabulary({ userProfile, updateProfile, onEarnXp }: Props) {
  return <VocabularyPractice userProfile={userProfile} updateProfile={updateProfile} onEarnXp={onEarnXp} myMode />;
}
