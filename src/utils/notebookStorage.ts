/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NotebookFolder, NotebookWord, JLPTLevel } from '../types';

export type { NotebookFolder, NotebookWord };

const NOTEBOOKS_KEY = 'todaii_user_notebooks_v1';
const SAVED_WORDS_KEY = 'todaii_saved_words_v1';

export const DEFAULT_NOTEBOOKS: NotebookFolder[] = [
  {
    id: 'default_fav',
    name: 'Từ vựng yêu thích',
    color: '#ef4444', // red
    icon: 'heart',
    description: 'Các từ vựng cốt lõi thường dùng cần ghi nhớ',
    createdAt: new Date().toISOString()
  },
  {
    id: 'default_news',
    name: 'Từ mới đọc báo Todaii',
    color: '#3b82f6', // blue
    icon: 'newspaper',
    description: 'Từ vựng trích xuất từ các bài báo Nhật thực tế',
    createdAt: new Date().toISOString()
  },
  {
    id: 'default_grammar',
    name: 'Ngữ pháp trọng tâm',
    color: '#10b981', // green
    icon: 'bookmark',
    description: 'Các cấu trúc ngữ pháp và mẫu câu hay nhầm lẫn',
    createdAt: new Date().toISOString()
  },
  {
    id: 'default_kanji',
    name: 'Hán tự khó nhớ',
    color: '#8b5cf6', // purple
    icon: 'pen-tool',
    description: 'Các chữ Hán nhiều nét, âm On/Kun đặc biệt',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_PRESET_WORDS: NotebookWord[] = [
  {
    id: 'init_w1',
    kanji: '日本語',
    furigana: 'にほんご',
    romaji: 'nihongo',
    hanViet: 'NHẬT BẢN NGỮ',
    meaning: 'Tiếng Nhật',
    example: '私は日本語を毎日勉強しています。',
    exampleMeaning: 'Tôi học tiếng Nhật mỗi ngày.',
    level: 'N5',
    note: 'Từ vựng cơ bản',
    dateAdded: new Date().toISOString(),
    mastered: true,
    reviewCount: 3,
    notebookId: 'default_fav',
    source: 'lesson'
  },
  {
    id: 'init_w2',
    kanji: '約束',
    furigana: 'やくそく',
    romaji: 'yakusoku',
    hanViet: 'ƯỚC THÚC',
    meaning: 'Lời hứa, cuộc hẹn',
    example: '友達と約束があります。',
    exampleMeaning: 'Tôi có cuộc hẹn với bạn bè.',
    level: 'N4',
    note: 'Chú ý âm Hán Việt',
    dateAdded: new Date().toISOString(),
    mastered: false,
    reviewCount: 1,
    notebookId: 'default_fav',
    source: 'reading'
  },
  {
    id: 'init_w3',
    kanji: '大切',
    furigana: 'たいせつ',
    romaji: 'taisetsu',
    hanViet: 'ĐẠI THIẾT',
    meaning: 'Quan trọng, quý giá',
    example: '健康が一番大切です。',
    exampleMeaning: 'Sức khỏe là điều quan trọng nhất.',
    level: 'N5',
    note: 'Tính từ đuôi na',
    dateAdded: new Date().toISOString(),
    mastered: true,
    reviewCount: 2,
    notebookId: 'default_fav',
    source: 'dictionary'
  },
  {
    id: 'init_w4',
    kanji: '桜',
    furigana: 'さくら',
    romaji: 'sakura',
    hanViet: 'ANH',
    meaning: 'Hoa anh đào',
    example: '春に桜の花が咲きます。',
    exampleMeaning: 'Vào mùa xuân hoa anh đào nở.',
    level: 'N4',
    note: 'Biểu tượng của Nhật Bản',
    dateAdded: new Date().toISOString(),
    mastered: false,
    reviewCount: 0,
    notebookId: 'default_news',
    source: 'video'
  }
];

export function getStoredNotebooks(): NotebookFolder[] {
  try {
    const raw = localStorage.getItem(NOTEBOOKS_KEY);
    if (!raw) {
      localStorage.setItem(NOTEBOOKS_KEY, JSON.stringify(DEFAULT_NOTEBOOKS));
      return DEFAULT_NOTEBOOKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_NOTEBOOKS;
  } catch (e) {
    return DEFAULT_NOTEBOOKS;
  }
}

export function saveStoredNotebooks(notebooks: NotebookFolder[]): void {
  try {
    localStorage.setItem(NOTEBOOKS_KEY, JSON.stringify(notebooks));
    window.dispatchEvent(new CustomEvent('notebooks_updated'));
  } catch (e) {
    console.error('Error saving notebooks to localStorage:', e);
  }
}

export function getStoredWords(): NotebookWord[] {
  try {
    const raw = localStorage.getItem(SAVED_WORDS_KEY);
    if (!raw) {
      localStorage.setItem(SAVED_WORDS_KEY, JSON.stringify(INITIAL_PRESET_WORDS));
      return INITIAL_PRESET_WORDS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_PRESET_WORDS;
  } catch (e) {
    return INITIAL_PRESET_WORDS;
  }
}

export function saveStoredWords(words: NotebookWord[]): void {
  try {
    localStorage.setItem(SAVED_WORDS_KEY, JSON.stringify(words));
    window.dispatchEvent(new CustomEvent('saved_words_updated'));
  } catch (e) {
    console.error('Error saving words to localStorage:', e);
  }
}

export function addWordToNotebook(wordData: Partial<NotebookWord> & { kanji: string; meaning: string }): { success: boolean; word: NotebookWord; message: string } {
  const currentWords = getStoredWords();
  const currentNotebooks = getStoredNotebooks();
  
  const targetNotebookId = wordData.notebookId || currentNotebooks[0]?.id || 'default_fav';
  
  // Check if word already exists in this notebook
  const existingIndex = currentWords.findIndex(w => 
    w.notebookId === targetNotebookId && 
    (w.kanji === wordData.kanji || (w.furigana && w.furigana === wordData.furigana && w.meaning === wordData.meaning))
  );

  if (existingIndex >= 0) {
    // Already in notebook
    return {
      success: false,
      word: currentWords[existingIndex],
      message: `Từ "${wordData.kanji}" đã có trong sổ tay này rồi!`
    };
  }

  const newWord: NotebookWord = {
    id: `nb_w_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    kanji: wordData.kanji,
    furigana: wordData.furigana || '',
    romaji: wordData.romaji || '',
    meaning: wordData.meaning,
    hanViet: wordData.hanViet || '',
    example: wordData.example || '',
    exampleMeaning: wordData.exampleMeaning || '',
    level: wordData.level || 'N5',
    note: wordData.note || '',
    dateAdded: new Date().toISOString(),
    mastered: false,
    reviewCount: 0,
    notebookId: targetNotebookId,
    source: wordData.source || 'manual'
  };

  const updatedWords = [newWord, ...currentWords];
  saveStoredWords(updatedWords);

  return {
    success: true,
    word: newWord,
    message: `Đã lưu từ "${newWord.kanji}" vào sổ tay thành công!`
  };
}

export function toggleWordMastered(wordId: string): boolean {
  const words = getStoredWords();
  let newStatus = false;
  const updated = words.map(w => {
    if (w.id === wordId) {
      newStatus = !w.mastered;
      return {
        ...w,
        mastered: newStatus,
        reviewCount: (w.reviewCount || 0) + 1
      };
    }
    return w;
  });
  saveStoredWords(updated);
  return newStatus;
}

export function deleteWordFromNotebook(wordId: string): void {
  const words = getStoredWords();
  const updated = words.filter(w => w.id !== wordId);
  saveStoredWords(updated);
}

export function createNewNotebook(name: string, color: string, description?: string): NotebookFolder {
  const notebooks = getStoredNotebooks();
  const newNb: NotebookFolder = {
    id: `nb_folder_${Date.now()}`,
    name: name.trim() || 'Sổ tay mới',
    color: color || '#3b82f6',
    icon: 'book',
    description: description?.trim() || '',
    createdAt: new Date().toISOString()
  };
  const updated = [...notebooks, newNb];
  saveStoredNotebooks(updated);
  return newNb;
}

export function deleteNotebook(notebookId: string): void {
  const notebooks = getStoredNotebooks();
  if (notebooks.length <= 1) return; // keep at least 1 notebook
  
  const updatedNotebooks = notebooks.filter(n => n.id !== notebookId);
  saveStoredNotebooks(updatedNotebooks);

  // Move or remove words from deleted notebook
  const fallbackId = updatedNotebooks[0]?.id || 'default_fav';
  const words = getStoredWords();
  const updatedWords = words.map(w => w.notebookId === notebookId ? { ...w, notebookId: fallbackId } : w);
  saveStoredWords(updatedWords);
}
