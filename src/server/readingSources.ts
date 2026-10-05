import axios from 'axios';
import * as cheerio from 'cheerio';
import type { AudioMark, JLPTLevel, ReadingToken } from '../types.js';
import { originalQuestions, type OriginalQuestion } from './readingQuestions.js';

export type ReadingSource = 'todai' | 'watanoc';
export interface SourceArticle {
  id: string; source: ReadingSource; titleJp: string; titleVi: string; date: string;
  url: string; image: string; audio: string; level: JLPTLevel; snippet: string;
  text?: string; furiganaText?: string; rawTokens?: ReadingToken[]; audioMarks?: AudioMark[];
  originalQuestions?: OriginalQuestion[]; originalQuestionText?: string;
}
const http = axios.create({ timeout: 12000, maxRedirects: 0, maxContentLength: 3_000_000, headers: { 'User-Agent': 'NihonGo-Reading/1.0' } });
const normalize = (text: string) => text.replace(/\r/g, '').split('\n').map(line => line.trim()).filter(Boolean).join('\n\n');
export function plainHtml(html: string) {
  const $ = cheerio.load(html || ''); $('rt,rp,script,style').remove(); $('br').replaceWith('\n');
  return normalize($.text());
}
export function rubyHtml(html: string) {
  const $ = cheerio.load(html || ''); $('script,style,rp').remove();
  $('ruby').each((_, el) => { const r = $(el); const reading = r.find('rt').text(); r.find('rt').remove(); const base = r.text(); r.replaceWith(reading ? `[${base}](${reading})` : base); });
  $('br').replaceWith('\n'); return normalize($.text());
}
export function sourceLocation(source: ReadingSource, id?: unknown, value?: unknown) {
  if (source === 'todai') {
  let candidate = typeof id === 'string' && id ? id : '';
  if (!candidate && typeof value === 'string') {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'japanese.todaiinews.com' || url.port || url.username || url.password || !/^\/(?:vi\/)?news\/[a-f0-9]{32}\/?$/i.test(url.pathname)) throw new Error('INVALID_SOURCE');
    candidate = url.pathname.replace(/\/$/, '').split('/').pop() || '';
  }
    if (!/^[a-f0-9]{32}$/i.test(candidate || '')) throw new Error('INVALID_SOURCE');
    return { id: candidate!, url: `https://japanese.todaiinews.com/vi/news/${candidate}` };
  }
  const url = new URL(typeof value === 'string' && value ? value : `https://watanoc.com/${String(id || '')}`);
  if (url.protocol !== 'https:' || url.hostname !== 'watanoc.com' || url.port || url.username || url.password || !/^\/post-[\w-]+\/?$/.test(url.pathname)) throw new Error('INVALID_SOURCE');
  return { id: url.pathname.replace(/^\//, '').replace(/\/$/, ''), url: `https://watanoc.com${url.pathname.replace(/\/$/, '')}` };
}
function sourceLevel(value: unknown, fallback: JLPTLevel = 'N4'): JLPTLevel {
  const match = String(value).match(/N([1-5])/i); return match ? `N${match[1]}` as JLPTLevel : fallback;
}
export async function fetchSourceList(source: ReadingSource, page = 1, tag = 'all', category = 'all'): Promise<SourceArticle[]> {
  if (source === 'todai') {
    const response = await http.get('https://api2.easyjapanese.net/api/news/list', { params: { page, limit: 30, lang: 'vi' } });
    if (!Array.isArray(response.data?.results)) throw new Error('SOURCE_UNAVAILABLE');
    return response.data.results.map((item: any) => {
      const v = item.value || {}; const location = sourceLocation(source, item.id); const body = v.body || v.textbody || '';
      return { ...location, source, titleJp: plainHtml(v.title), titleVi: v.title_translate?.vi || '', date: item.date || item.time || '', image: v.image || '', audio: v.audio || '',
        level: sourceLevel(`N${v.level}`), snippet: plainHtml(v.desc || body).slice(0, 160), text: plainHtml(body), furiganaText: rubyHtml(body), audioMarks: v.marks || [],
        originalQuestions: originalQuestions(v.question), originalQuestionText: v.question ? typeof v.question === 'string' ? plainHtml(v.question) : JSON.stringify(v.question) : '' };
    });
  }
  const categories: Record<string,string> = { meal:'japan-fun/meal', sightseeing:'japan-fun/sightseeing', event:'japan-fun/event', culture:'japan-fun/culture', 'japan-news':'japan-news', simplejapanese:'simplejapanese', specialtopic:'specialtopic' };
  const path = categories[category] ? `category/${categories[category]}/` : /^(n[1-5]|listening)$/.test(tag) ? `tag/${tag}/` : '';
  const response = await http.get(`https://watanoc.com/${path}feed`, { params: page > 1 ? { paged: page } : {} });
  const $ = cheerio.load(response.data, { xmlMode: true }); const items: SourceArticle[] = [];
  $('item').each((_, el) => {
    const item = $(el); const title = item.find('title').text().trim();
    try { const location = sourceLocation(source, undefined, item.find('link').text().trim());
      const published = new Date(item.find('pubDate').text());
      items.push({ ...location, source, titleJp: title.split('...')[0].replace(/\(n[1-5]\)/ig, '').trim(), titleVi: '', date: Number.isNaN(published.getTime()) ? '' : published.toISOString().slice(0,10),
        image: '', audio: '', level: sourceLevel(title), snippet: plainHtml(item.find('description').text()).slice(0,160) });
    } catch { /* Ignore non-article links. */ }
  });
  if (!items.length) throw new Error('SOURCE_UNAVAILABLE'); return items;
}
export async function fetchSourceArticle(source: ReadingSource, id?: unknown, value?: unknown): Promise<SourceArticle> {
  const location = sourceLocation(source, id, value);
  if (source === 'todai') {
    const response = await http.get('https://api2.easyjapanese.net/api/news/detail', { params: { news_id: location.id, lang: 'vi' } });
    const v = response.data?.result; const content = v?.content; if (!content?.textbody) throw new Error('SOURCE_UNAVAILABLE');
    const $ = cheerio.load(content.textbody); const rawTokens: ReadingToken[] = [];
    $('body').contents().each((_, el: any) => {
      const node = $(el); if (el.type === 'text') { rawTokens.push({ text: node.text() }); return; }
      if (el.name === 'br') { rawTokens.push({ text: '\n' }); return; }
      const reading = node.find('rt').text(); node.find('rt,rp').remove();
      const span = node.is('span') ? node : node.find('span').first(); const match = (span.attr('class') || '').match(/jlpt-n([1-5])/);
      rawTokens.push({ text: node.text(), furigana: reading || null, word: span.attr('word') || node.text(), jlpt: match ? `N${match[1]}` as JLPTLevel : null });
    });
    return { ...location, source, titleJp: plainHtml(v.title), titleVi: v.title_translate?.vi || '', date: String(v.pubDate || '').slice(0,10),
      image: content.image || '', audio: content.audio || '', level: sourceLevel(`N${v.level}`), snippet: plainHtml(v.description).slice(0,160),
      text: plainHtml(content.textbody), furiganaText: rubyHtml(content.textbody), rawTokens, audioMarks: Array.isArray(content.marks) ? content.marks : [],
      originalQuestions: originalQuestions(v.question), originalQuestionText: v.question ? typeof v.question === 'string' ? plainHtml(v.question) : JSON.stringify(v.question) : '' };
  }
  const response = await http.get(location.url); const $ = cheerio.load(response.data); const article = $('.entry-content').first();
  if (!article.length) throw new Error('SOURCE_UNAVAILABLE');
  article.find('script,style,iframe,.sharedaddy,form,nav').remove(); article.find('br').replaceWith('\n');
  article.find('p,div').append('\n'); const text = normalize(article.text());
  if (text.length < 20) throw new Error('SOURCE_UNAVAILABLE');
  const title = $('h1').first().text().trim();
  return { ...location, source, titleJp: title.split('...')[0].replace(/\(n[1-5]\)/ig, '').trim(), titleVi: '', date: ($('time').attr('datetime') || '').slice(0,10),
    image: ($('meta[property="og:image"]').attr('content') || '').replace(/^http:/,'https:'), audio: article.find('audio source').attr('src') || article.find('audio').attr('src') || '',
    level: sourceLevel(title), snippet: text.slice(0,160), text,
    originalQuestionText: article.find('.quiz,.question,.questions').text().trim() || (/(?:問[1-9１-９]|質問|クイズ)/.test(text) && /[1-4１-４][.．、)]/.test(text) ? text : '') };
}
