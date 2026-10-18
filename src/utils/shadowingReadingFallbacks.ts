// Exact-caption fallbacks supplement older saved readings without changing source text.
// These are readings of the written captions; transcription errors need audio review.
const fallbacks: Record<string, { word: string; reading: string }[]> = {
  'お車の方にお願いいたします': [{ word: 'お願い', reading: 'おねがい' }],
  '町会N4': [{ word: '町会', reading: 'ちょうかい' }],
  'これからN4の朝会試験を始めます': [{ word: '朝会', reading: 'ちょうかい' }],
  '風ですね': [{ word: '風', reading: 'かぜ' }],
  'こんにちは紙伸びましたね': [{ word: '紙', reading: 'かみ' }],
  'じゃあ先に紙を切ってからパーマをかけます': [{ word: '紙', reading: 'かみ' }],
  '女の人の話に会うのはどれですか': [{ word: '会う', reading: 'あう' }],
  '男の人50人と女の人50人に好きな本を聴きました': [{ word: '聴き', reading: 'きき' }],
  '図書館が空いていない時は外に本を返すためのポストがあるのでそのポストに本を入れてください': [{ word: '空いて', reading: 'あいて' }],
  'これで朝会試験を終わり[音楽]ますで[音楽]': [{ word: '朝会', reading: 'ちょうかい' }],
  'うん昨日南町のバス停の近くで高橋さんに': [{ word: '昨日', reading: 'きのう' }, { word: '南', reading: 'みなみ' }],
  '聴会N': [{ word: '聴', reading: 'ちょう' }],
  'ゴミ捨テに置いたままにしないでくださいね。猫やカラスが来て汚んです。': [{ word: '捨', reading: 'す' }],
  '?青木先生は海外のことに詳ですね。': [{ word: '詳', reading: 'くわ' }],
};

export function shadowingReadingFallbacks(text: string) {
  return fallbacks[text] || [];
}
