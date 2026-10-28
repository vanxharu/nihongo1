import { createHash } from 'node:crypto';
import { firebaseDb } from './firebaseStore';
import { generateGemini } from './llm';

// Phân tích AI dùng chung: mỗi nội dung (từ, câu ví dụ, bài đọc, câu trong video, mẫu ngữ pháp) chỉ gọi AI một lần,
// kết quả lưu Firestore ai_analysis/{hash}. Ai cũng đọc được; chỉ người đã đăng nhập mới tạo mới (server kiểm tra token).
export const AI_KINDS = ['vocab', 'sentence', 'reading', 'video', 'grammar', 'question'] as const;
export type AiKind = typeof AI_KINDS[number];
export type AiAnalysis = { translation: string; summary: string; points: { title: string; body: string }[]; model?: string; createdAt?: string };

const LIMITS: Record<AiKind, number> = { vocab: 200, sentence: 600, reading: 6000, video: 1000, grammar: 600, question: 3000 };

export function analysisKey(kind: string, text: string) {
  return createHash('sha256').update(`${kind}\n${text.trim()}`).digest('hex').slice(0, 40);
}

export function validInput(kind: unknown, text: unknown, context: unknown): { kind: AiKind; text: string; context: string } | null {
  if (typeof kind !== 'string' || !(AI_KINDS as readonly string[]).includes(kind)) return null;
  if (typeof text !== 'string' || !text.trim() || text.length > LIMITS[kind as AiKind]) return null;
  if (context !== undefined && (typeof context !== 'string' || context.length > 2000)) return null;
  return { kind: kind as AiKind, text: text.trim(), context: (context as string | undefined)?.trim() || '' };
}

const TASK: Record<AiKind, string> = {
  vocab: 'Phân tích TỪ VỰNG tiếng Nhật. translation = nghĩa chính. Các point đầu: chia từ thành từng chữ Hán/phần (kana ghép thì giữ cả cụm); title = phần đó chép nguyên văn từ từ đã cho, body = nghĩa trong ngoặc kép · âm Hán Việt · cách đọc trong từ. Sau đó các point không phải tiếng Nhật: Cách dùng (kèm ví dụ có dịch), Phân biệt với từ dễ nhầm, Lưu ý lỗi người Việt hay mắc.',
  sentence: 'Phân tích CÂU VÍ DỤ tiếng Nhật. translation = bản dịch tự nhiên, summary để rỗng. Chia câu thành các cụm theo thứ tự xuất hiện; mỗi point: title = cụm nguyên văn chép đúng từ câu (không sửa, không thêm), body = nghĩa của cụm trong ngoặc kép + giải thích từ vựng (cách đọc) và ngữ pháp trong cụm: thể chia, trợ từ, vì sao dùng như vậy, so sánh với cách dùng dễ nhầm.',
  reading: 'Phân tích BÀI ĐỌC HIỂU tiếng Nhật: tóm tắt ý chính, dịch, từ vựng khó (đọc + nghĩa), mẫu ngữ pháp xuất hiện, các câu then chốt và cách tìm thông tin để trả lời câu hỏi.',
  video: 'Phân tích CÂU THOẠI trong video tiếng Nhật. translation = bản dịch tự nhiên, summary để rỗng. Chia câu thành các cụm theo thứ tự xuất hiện; mỗi point: title = cụm nguyên văn chép đúng từ câu (không sửa, không thêm), body = nghĩa của cụm trong ngoặc kép + giải thích từ vựng (cách đọc) và ngữ pháp trong cụm: thể chia, trợ từ, vì sao dùng như vậy, so sánh với cách dùng dễ nhầm. Nêu cả cách nói khẩu ngữ/rút gọn nếu có.',
  grammar: 'Phân tích MẪU NGỮ PHÁP tiếng Nhật. Các point đầu: mỗi phần tiếng Nhật trong mẫu đã cho (chép nguyên văn từ mẫu, các phần không chồng nhau) giải thích vai trò và cách nối. Sau đó các point: Ví dụ (3 câu có dịch), Phân biệt với mẫu dễ nhầm, Lưu ý lỗi thường gặp.',
  question: 'Phân tích CÂU HỎI THI JLPT: dịch đề, phân tích từng phương án vì sao đúng/sai, kiến thức cần nắm, mẹo làm dạng câu này.',
};

const SYSTEM = 'Bạn là giáo viên tiếng Nhật cho người Việt. Trả lời bằng tiếng Việt, chính xác, ngắn gọn, không bịa. ' +
  'Chỉ trả về JSON: {"translation": string (bản dịch tiếng Việt, rỗng nếu không cần), "summary": string (2-3 câu tổng quan), ' +
  '"points": [{"title": string, "body": string}] (1-8 mục)}. Không markdown.';

export function parseAnalysis(raw: string): AiAnalysis {
  const v = JSON.parse(String(raw).replace(/^```(?:json)?\s*|\s*```$/g, ''));
  const s = (x: unknown, n: number) => (typeof x === 'string' ? x.slice(0, n) : '');
  if (!v || !Array.isArray(v.points)) throw new Error('INVALID_AI_OUTPUT');
  const points = v.points.filter((p: any) => p && typeof p.title === 'string' && typeof p.body === 'string').slice(0, 10)
    .map((p: any) => ({ title: s(p.title, 200), body: s(p.body, 3000) }));
  if (!points.length && !s(v.summary, 10)) throw new Error('INVALID_AI_OUTPUT');
  return { translation: s(v.translation, 6000), summary: s(v.summary, 2000), points };
}

const doc = (id: string) => firebaseDb().collection('ai_analysis').doc(id);

export async function readAnalysis(kind: string, text: string): Promise<AiAnalysis | null> {
  const snap = await doc(analysisKey(kind, text)).get();
  return snap.exists ? (snap.data()!.analysis as AiAnalysis) : null;
}

export async function createAnalysis(input: { kind: AiKind; text: string; context: string }, uid: string): Promise<AiAnalysis> {
  const existing = await readAnalysis(input.kind, input.text);
  if (existing) return existing;
  const prompt = `${TASK[input.kind]}\n\nNỘI DUNG:\n${input.text}${input.context ? `\n\nNGỮ CẢNH (tham khảo):\n${input.context}` : ''}`;
  const result: any = await generateGemini({ contents: prompt, config: { systemInstruction: SYSTEM, responseMimeType: 'application/json', maxOutputTokens: 3500 } });
  const analysis = { ...parseAnalysis(result.text), model: String(result.modelUsed || ''), createdAt: new Date().toISOString() };
  await doc(analysisKey(input.kind, input.text)).set({ kind: input.kind, text: input.text, analysis, createdBy: uid, createdAt: analysis.createdAt });
  return analysis;
}

// Đọc bằng POST (bài đọc dài không vừa URL); không cần đăng nhập.
export async function aiAnalysisLookup(req: any, res: any) {
  const input = validInput(req.body?.kind, req.body?.text, undefined);
  if (!input) return res.status(400).json({ error: 'Nội dung phân tích không hợp lệ.' });
  try {
    const analysis = await readAnalysis(input.kind, input.text);
    return analysis ? res.json({ analysis }) : res.status(404).json({ error: 'Chưa có phân tích.' });
  } catch { return res.status(503).json({ error: 'Chưa đọc được dữ liệu phân tích.' }); }
}

export async function aiAnalysisCreate(req: any, res: any) {
  const input = validInput(req.body?.kind, req.body?.text, req.body?.context);
  if (!input) return res.status(400).json({ error: 'Nội dung phân tích không hợp lệ.' });
  try { return res.json({ analysis: await createAnalysis(input, req.dbUser.uid) }); }
  catch (e: any) {
    console.error('[ai-analysis]', e?.message);
    return res.status(502).json({ error: 'AI chưa phân tích được. Hãy thử lại sau.' });
  }
}
