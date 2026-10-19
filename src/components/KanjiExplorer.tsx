import React from 'react';
import KanjiStudy from './KanjiStudy';
import type { UserProfile } from '../types';

interface KanjiExplorerProps {
  userProfile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  onEarnXp: (amount: number) => void;
}
export default function KanjiExplorer(_props: KanjiExplorerProps) {
  return <KanjiStudy />;
}
