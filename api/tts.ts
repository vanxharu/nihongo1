import type { Request, Response } from 'express';
import { synthesizeAzureSpeech, ttsParams } from '../src/server/azureTts.js';

// Dedicated lightweight function: /api/tts no longer cold-starts the whole Express bundle.
export default async function tts(req: Request, res: Response) {
  const src: any = req.method === 'POST' ? req.body || {} : req.query || {};
  const q = ttsParams(src.text, src.voice, src.rate, src.pitch);
  if (!q) return res.status(400).json({ error: "Parameter 'text' is too long (max 600 characters)" });
  if (!q.text) return res.status(400).json({ error: "Parameter 'text' is required" });
  try {
    const audio = await synthesizeAzureSpeech(q.text, q.voice, q.rate, q.pitch);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audio.length);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    return res.end(audio);
  } catch (e: any) {
    console.error('[api/tts]', e?.message || e);
    return res.status(502).json({ error: 'Failed to generate audio', details: e?.message });
  }
}
