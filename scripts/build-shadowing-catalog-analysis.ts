import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';
import { VOCABULARY_DATA } from '../src/data';
import { KANJI_DICTIONARY } from '../src/data/kanjiDictionary';
import { SHADOWING_VIDEOS } from '../src/data/shadowingVideos';
import { parsePreparedShadowingCaptions, type ShadowingAnalysis, type ShadowingCue } from '../src/utils/shadowing';
import { claudeShadowingPrompt, parseShadowingAnalysisFile } from '../src/utils/shadowingAnalysisFile';
import { staticGrammar } from './shadowing/grammarRules';

const kana = (s: string) => s.replace(/[ァ-ヶ]/g, c=>String.fromCharCode(c.charCodeAt(0)-0x60));
const dictionary = new Map<string, { word: string; reading: string; meaning: string }[]>();
for(const v of VOCABULARY_DATA) {
  for(const word of new Set([v.kanji,v.hiragana].filter(Boolean))) {
    dictionary.set(word, [...(dictionary.get(word) || []), {word, reading:v.hiragana,meaning:v.meaning}]);
  }
}
const supplements = (await readFile('scripts/shadowing/vocabulary.tsv','utf8')).trim().split('\n').map(line=>{
  const [word,reading,meaning]=line.split('|');return {word,reading,meaning};
});
for(const v of supplements) dictionary.set(v.word,[v]);
const Analyzer = (KuromojiAnalyzer as any).default || KuromojiAnalyzer;
const require = createRequire(import.meta.url);
const analyzer = new Analyzer({dictPath:path.resolve(path.dirname(require.resolve('kuromoji')), '../dict')});
await analyzer.init();

type Token = {surface_form:string;basic_form:string;reading?:string;pos?:string;pos_detail_1?:string;};
async function tokenize(text:string): Promise<Token[]> { return analyzer.parse(text); }
function vocabulary(text:string, tokens:Token[]): ShadowingAnalysis['vocabulary'] {
  const out = new Map<string, ShadowingAnalysis['vocabulary'][number]>();
  for(const token of tokens) {
    if(!['名詞','動詞','形容詞','副詞','連体詞','接続詞','感動詞'].includes(token.pos || '') || token.pos_detail_1==='数' || /^[\d０-９]+$/.test(token.surface_form))continue;
    const choices = dictionary.get(token.surface_form) || dictionary.get(token.basic_form);
    if(!choices?.length)continue;
    const entry = choices.find(v=>kana(v.reading)===kana(token.reading||'')) || choices[0];
    if(!entry.meaning?.trim())continue;
    const reading = token.reading && token.reading!=='*' ? kana(token.reading) : entry.reading;
    out.set(token.surface_form, {word:token.surface_form,reading,meaning:entry.meaning,type:token.basic_form && token.basic_form!==token.surface_form && token.basic_form!=='*' ? `Dạng gốc: ${token.basic_form}` : undefined});
  }
  // Keep useful multi-token expressions intact when they occur verbatim.
  for(const v of supplements)if(text.includes(v.word))out.set(v.word,v);
  return [...out.values()].slice(0,80);
}
function kanji(text:string): ShadowingAnalysis['kanji'] {
  return [...new Set(text.match(/[\u3400-\u9fff]/g)||[])].map(character=>{
    const k = KANJI_DICTIONARY[character];
    return {character,meaning:k?.meaning||'Chưa có nghĩa trong từ điển app',onyomi:k?.onyomi||'',kunyomi:k?.kunyomi||'',...(k?.radical?{radical:k.radical}:{}),...(k?.components?{components:k.components}:{}),...(k?.mnemonic?{mnemonic:k.mnemonic}:{})};
  });
}
function warning(text:string):string[] {
  const notes:string[]=[];
  if(/\[(?:音楽|拍手|笑い|Music|music)\]/.test(text))notes.push('Có nhãn âm thanh chen trong lời thoại; cần đối chiếu video.');
  if(/(?:朝会|町会|会試験)/.test(text))notes.push('Tên phần thi có dấu hiệu nhận dạng sai (có thể là 聴解); chưa tự sửa chữ.');
  if(/紙.*(?:伸び|切|パーマ)/.test(text))notes.push('紙 có thể nhầm 髪 trong ngữ cảnh làm tóc; cần nghe lại.');
  if(text.length>3 && /(?:[てでがをにはとも]|から|けど|ので|まし|でし|なければ|ならなければ)$/.test(text))notes.push('Dòng kết thúc ở mệnh đề hoặc đuôi chưa hoàn chỉnh; xem cả dòng tiếp theo.');
  if(/^[、。？！!?]|^(?:ます|ません|ました|です|でした|ください|なりません|ければ|なければ|てください)/.test(text))notes.push('Dòng có thể tiếp nối câu trước; không suy diễn thành câu độc lập.');
  return notes;
}
await mkdir('public/shadowing-analysis',{recursive:true});
const manifest:any[]=[];
const snapshots:any[]=[];
for(const video of SHADOWING_VIDEOS) {
  const id=video.youtube_video_id;
  const source=JSON.parse(await readFile(`public/shadowing-captions/${id}.json`,'utf8'));
  const cues=parsePreparedShadowingCaptions(source,id);
  // Store unmodified sentence text, IDs and source timings in the hash, not annotations.
  const hash=createHash('sha256').update(JSON.stringify(source.cues.map((c:ShadowingCue)=>[c.id,c.text,c.start,c.end]))).digest('hex');
  const sourceRevision=source.sourceRevision || (id==='R1Oy-PqXhz4' ? 'df4262b1-01fd-408f-bd21-b1a9ae54c6e0' : null);
  let packet;
  let curated=false;
  if(id==='R1Oy-PqXhz4') {
    packet=parseShadowingAnalysisFile(JSON.parse(await readFile(`public/shadowing-analysis/${id}.json`,'utf8')),id,cues);
    curated=true;
  } else {
    const memo=new Map<string,ShadowingAnalysis>();
    const sentences: {id:string;text:string;analysis:ShadowingAnalysis}[]=[];
    for(const cue of cues) {
      let analysis=memo.get(cue.text);
      if(!analysis) {
        const marker=/^[\s\d０-９一二三四五六七八九十番問題。、.]+$/.test(cue.text);
        const notes=warning(cue.text);
        const tokens=marker?[]:await tokenize(cue.text);
        const grammar=marker?[]:staticGrammar(cue.text,tokens);
        analysis={source:'dictionary',translation:cue.translation||'Chưa có bản dịch đã lưu.',readings:cue.readings||[],vocabulary:marker?[]:vocabulary(cue.text,tokens),kanji:marker?[]:kanji(cue.text),grammar,
          note: `${notes.length?notes.join(' ')+' ':''}${marker?'Nhãn số câu/phương án, không phải câu thoại. ':''}Từ vựng/kanji tra từ điển; ngữ pháp nhận diện theo quy tắc và ví dụ học tập do ChatGPT biên soạn, chưa phải kết quả Claude. Bản dịch/furigana kế thừa app; chưa đối chiếu âm thanh.${!marker&&!grammar.length?' Chưa nhận diện được cấu trúc đủ rõ trong dòng này.':''}`};
        memo.set(cue.text,analysis);
      }
      sentences.push({id:cue.id,text:cue.text,analysis});
    }
    packet=parseShadowingAnalysisFile({version:1,videoId:id,sentences},id,cues);
    await writeFile(`public/shadowing-analysis/${id}.json`,JSON.stringify(packet));
  }
  await writeFile(`public/shadowing-analysis/${id}-claude.txt`,claudeShadowingPrompt(id,cues));
  const item={order:video.order,videoId:id,title:video.title,cueCount:cues.length,analysisCount:packet.sentences.length,withVocabulary:packet.sentences.filter(s=>s.analysis.vocabulary.length).length,withKanji:packet.sentences.filter(s=>s.analysis.kanji.length).length,withGrammar:packet.sentences.filter(s=>s.analysis.grammar.length).length,flagged:cues.filter(c=>warning(c.text).length).length,method:curated?'contextual-notes-and-app-dictionaries':'tokenizer-dictionaries-and-grammar-rules',sourceRevision,sourceHash:hash};
  manifest.push(item);snapshots.push({videoId:id,sourceRevision,sha256:hash});
  console.log(JSON.stringify(item));
}
await writeFile('public/shadowing-analysis/manifest.json',JSON.stringify({version:1,totalVideos:manifest.length,totalCues:manifest.reduce((n,v)=>n+v.cueCount,0),videos:manifest},null,2));
console.log('All catalog analyses and Claude prompts validated.');
