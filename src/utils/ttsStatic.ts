/** Xử lý văn bản trước khi đọc và tách hội thoại hai giọng (không phụ thuộc DOM). */

export function cleanJapaneseTextForSpeech(text: string): string {
  if (!text) return '';
  let cleaned = text;

  // 1. Strip HTML tags (like <ruby>漢字<rt>かんじ</rt></ruby>)
  if (cleaned.includes('<')) {
    cleaned = cleaned.replace(/<rt[^>]*>[\s\S]*?<\/rt>/gi, '');
    cleaned = cleaned.replace(/<rp[^>]*>[\s\S]*?<\/rp>/gi, '');
    cleaned = cleaned.replace(/<[^>]+>/g, '');
  }

  // 2. Remove speaker labels ("山田：", "A:", "A「…」"), numbering ①② and part-of-speech tags (名)(ナ形)
  cleaned = cleaned.replace(/^(男|女|男性|女性|山田|田中|佐藤|鈴木|Keita|Nanami|Nam|Nữ|A|B)[:：]\s*/i, '');
  cleaned = cleaned.replace(/(^|[\s。！？」])(?:[ABＡＢ]|男|女|医者|先生|店員|客)\s*(?=「)/g, '$1');
  cleaned = cleaned.replace(/[①-⑳]/g, ' ');
  cleaned = cleaned.replace(/[（(](?:名|名詞|ナ形|イ形|な形|い形|動|動詞|副|副詞|自|他|自動詞|他動詞)[）)]/g, ' ');

  // 2b. Headword decorations: ひっこし〈する〉 / (かぎを) かける / 入り口 (入口) -> read only the headword
  cleaned = cleaned.replace(/〈[^〉]*〉/g, '').replace(/^\s*[（(][^）)]*[）)]\s*(?=\S)/, '');

  // 3. Remove reading in brackets if paired with kanji: 食べる(たべる) -> 食べる
  cleaned = cleaned.replace(/([\u4e00-\u9faf]+)[（(][\u3040-\u309f\u30a0-\u30ff]+[）)]/g, '$1');
  cleaned = cleaned.replace(/([\u4e00-\u9faf]+)\[[\u3040-\u309f\u30a0-\u30ff]+\]/g, '$1');

  // 4. Remove leftover bracket characters, quotation marks, punctuation noise
  cleaned = cleaned.replace(/[【】\[\]()（）「」『』""''“”]/g, ' ');

  // 5. Remove slash or tildes which might be read weirdly (e.g. ～, 〜, ／)
  cleaned = cleaned.replace(/[／/]/g, ' ');
  cleaned = cleaned.replace(/[～〜~]/g, '');

  // 6. Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

export interface DialogueTurn { speaker: string; text: string }

const MALE_LABELS = new Set(['男', '男の人', '男性', 'A', 'Ａ', '山田', '佐藤', 'Keita', 'Nam']);
const FEMALE_LABELS = new Set(['女', '女の人', '女性', 'B', 'Ｂ', '田中', '鈴木', 'Nanami', 'Nữ']);
const NOT_SPEAKERS = new Set(['例', '問', '問題', '答え', '解答', '注', '注意', '意味', '訳', 'ポイント', '質問', 'Q', 'N', 'ヒント', '読み', '説明']);

/** Tách hội thoại "男：…\n女：…" (hoặc A：/B：/tên：) thành các lượt nói. Không phải hội thoại → null. */
export function parseDialogueTurns(raw: string): DialogueTurn[] | null {
  if (!raw || !/[:：「]/.test(raw)) return null;
  let t = raw;
  if (t.includes('<')) t = t.replace(/<rt[^>]*>[\s\S]*?<\/rt>/gi, '').replace(/<rp[^>]*>[\s\S]*?<\/rp>/gi, '').replace(/<[^>]+>/g, '');
  t = t.replace(/[①-⑳]\s*/g, '');
  // Nhiều lượt nằm cùng một dòng: "…です。女：…" / "A「…」 B「…」" → xuống dòng trước nhãn.
  t = t.replace(/([。！？!?」])\s*((?:男の人|女の人|男性|女性|男|女|[ABＡＢ])\s*[:：「])/g, '$1\n$2');
  const turns: DialogueTurn[] = [];
  let labeled = 0;
  for (const line of t.split(/\r?\n+/)) {
    // Nhãn dạng "A：…" (A/男/tên) hoặc "A「…」" (chỉ A/B/男/女, nguyên dòng trong ngoặc).
    const m = line.match(/^\s*(男の人|女の人|男性|女性|男|女|[ABＡＢ]|[^\s:：「」（）()\d]{1,6})\s*[:：]\s*(.*)$/)
      || line.match(/^\s*(男の人|女の人|男性|女性|男|女|[ABＡＢ])\s*「(.*)」\s*$/);
    if (m && !NOT_SPEAKERS.has(m[1])) {
      turns.push({ speaker: m[1], text: m[2].trim() });
      labeled++;
    } else if (turns.length && turns[turns.length - 1].speaker && line.trim()) {
      turns[turns.length - 1].text += ' ' + line.trim();
    } else if (line.trim()) {
      turns.push({ speaker: '', text: line.trim() }); // câu dẫn trước hội thoại: đọc bằng giọng riêng, không có nhãn
    }
  }
  const spoken = turns.filter(x => x.text);
  if (labeled < 2 || new Set(spoken.filter(x => x.speaker).map(x => x.speaker)).size < 2) return null;
  return spoken;
}

/** Gán giọng nam/nữ cho từng người nói; hai lượt liên tiếp của hai người khác nhau luôn khác giọng. */
export function assignDialogueVoices(turns: DialogueTurn[]): string[] {
  const NANAMI = 'ja-JP-NanamiNeural', KEITA = 'ja-JP-KeitaNeural';
  const bySpeaker = new Map<string, string>();
  const out: string[] = [];
  let prevSpeaker = '';
  for (const { speaker } of turns) {
    let voice = bySpeaker.get(speaker);
    if (!voice) {
      const pref = MALE_LABELS.has(speaker) ? KEITA : FEMALE_LABELS.has(speaker) ? NANAMI : null;
      const prevVoice = prevSpeaker ? bySpeaker.get(prevSpeaker) : undefined;
      voice = pref ?? (prevVoice === NANAMI ? KEITA : NANAMI);
      if (prevVoice && voice === prevVoice) voice = prevVoice === NANAMI ? KEITA : NANAMI;
      bySpeaker.set(speaker, voice);
    }
    out.push(voice);
    prevSpeaker = speaker;
  }
  return out;
}
