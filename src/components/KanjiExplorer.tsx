import React from 'react';
import VocabularyPractice from './VocabularyPractice';
import type { UserProfile } from '../types';

interface KanjiExplorerProps {
  userProfile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  onEarnXp: (amount: number) => void;
}
export default function KanjiExplorer({ userProfile, updateProfile, onEarnXp }: KanjiExplorerProps) {
  return <VocabularyPractice userProfile={userProfile} updateProfile={updateProfile} onEarnXp={onEarnXp} initialLevel="N4" kanjiMode />;
}
