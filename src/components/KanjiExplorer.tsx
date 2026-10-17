import React from 'react';
import KanjiMasterN4 from './KanjiMasterN4';
import type { UserProfile } from '../types';

/** The Kanji tab is PDF-only. Legacy dictionaries, AI fills, database kanji and
 * vocabulary indexes are deliberately not imported or rendered here. */
interface KanjiExplorerProps {
  userProfile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  onEarnXp: (amount: number) => void;
}
export default function KanjiExplorer(_props: KanjiExplorerProps) {
  return <KanjiMasterN4 />;
}
