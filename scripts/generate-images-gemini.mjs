import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

/**
 * Generate N4 vocabulary illustrations with the Gemini image API.
 *
 *   node scripts/generate-images-gemini.mjs --probe        # list image-capable models for your key
 *   node scripts/generate-images-gemini.mjs --limit 3      # test a small batch first
 *   node scripts/generate-images-gemini.mjs                # run / resume the whole set
 *
 * Free-tier keys work too: the script is sequential, throttled, and resumable.
 * Re-run it the next day and it continues where it stopped.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const hasFlag = name => args.includes(name);
const optionValue = name => {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
};

const promptFile = path.join(root, 'imports/vocab-n4/prompts.jsonl');
const outputDirectory = path.resolve(root, optionValue('--out') || 'imports/vocab-n4');
const failureLog = path.resolve(root, optionValue('--log') || 'imports/vocab-n4/gemini-failures.json');

const requestedModel = optionValue('--model');
const modelCandidates = [
  requestedModel,
  'gemini-3.1-flash-image',
  'gemini-3-pro-image',
  'gemini-2.5-flash-image',
].filter(Boolean);

const delayMs = Number(optionValue('--delay') || 6000);
const maxRetries = Number(optionValue('--max-retries') || 4);
const limit = Number(optionValue('--limit') || 0) || Infinity;
const fromNumber = Number(optionValue('--from') || 0);
const toNumber = Number(optionValue('--to') || 0);
const requestedIds = optionValue('--ids')?.split(',').map(value => value.trim()).filter(Boolean) || null;
const referenceArg = optionValue('--reference');
const force = hasFlag('--force');
const dryRun = hasFlag('--dry-run');
const probe = hasFlag('--probe');

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
if (!apiKey && !dryRun) {
  console.error('Missing API key.');
  console.error('Add it to .env in the project root:');
  console.error('  GEMINI_API_KEY=your_key_here');
  console.error('Get a free key at https://aistudio.google.com/apikey');
  process.exit(1);
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

if (probe) {
  if (!ai) {
    console.error('--probe needs GEMINI_API_KEY in .env');
    process.exit(1);
  }
  const pager = await ai.models.list();
  const names = [];
  for await (const model of pager) {
    const name = String(model.name || '').replace(/^models\//, '');
    if (/image/i.test(name)) names.push(`${name} | ${model.displayName || ''} | ${(model.supportedActions || []).join(',')}`);
  }
  console.log(names.length ? names.join('\n') : 'No image models returned for this key.');
  process.exit(0);
}

const readPrompts = async () => {
  const raw = await fs.readFile(promptFile, 'utf8');
  return raw.trim().split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
};

let prompts;
try {
  prompts = await readPrompts();
} catch {
  console.error(`Cannot read prompts: ${path.relative(root, promptFile)}`);
  console.error('Run "npm run vocab:prompts" first.');
  process.exit(1);
}

let queue = prompts;
if (requestedIds) {
  const wanted = new Set(requestedIds);
  queue = queue.filter(item => wanted.has(item.id));
}
if (fromNumber) queue = queue.filter(item => Number(item.id.split('_').pop()) >= fromNumber);
if (toNumber) queue = queue.filter(item => Number(item.id.split('_').pop()) <= toNumber);

await fs.mkdir(outputDirectory, { recursive: true });

const targetFor = id => path.join(outputDirectory, `${id}.png`);
const exists = async file => fs.stat(file).then(stats => stats.size > 1024, () => false);

if (!force) {
  const pending = [];
  for (const item of queue) {
    if (!(await exists(targetFor(item.id)))) pending.push(item);
  }
  queue = pending;
}
queue = queue.slice(0, limit);

if (!queue.length) {
  console.log('Nothing to do: every requested word already has an image.');
  console.log('Use --force to regenerate, or run "npm run import:vocab".');
  process.exit(0);
}

let reference = null;
const referencePath = referenceArg ? path.resolve(root, referenceArg) : null;
if (referencePath) {
  try {
    const buffer = await fs.readFile(referencePath);
    reference = {
      mimeType: referencePath.toLowerCase().endsWith('.webp') ? 'image/webp' : 'image/png',
      data: buffer.toString('base64'),
    };
    console.log(`Style reference: ${path.relative(root, referencePath)}`);
  } catch {
    console.warn(`Reference image not found: ${referenceArg} (continuing without it)`);
  }
}

const styleNote = reference
  ? '\n\nThe attached image is a style reference from the same illustration series. '
    + 'Match its line weight, shading, background, and level of detail exactly. Do not copy its subject.'
  : '';

const isQuotaError = error => {
  const text = `${error?.status || ''} ${error?.message || error}`;
  return /429|RESOURCE_EXHAUSTED|quota|rate limit/i.test(text);
};
// `limit: 0` means the model is simply not available on this plan: retrying is pointless.
const isUnavailableOnPlan = error => /limit:\s*0\b/.test(String(error?.message || ''));

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let resolvedModel = requestedModel || null;
const callModel = async (model, prompt) => ai.models.generateContent({
  model,
  contents: [{
    role: 'user',
    parts: [
      ...(reference ? [{ inlineData: reference }] : []),
      { text: prompt + styleNote },
    ],
  }],
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
    imageConfig: { aspectRatio: '1:1' },
  },
});

const generate = async prompt => {
  const models = resolvedModel ? [resolvedModel, ...modelCandidates] : modelCandidates;
  let lastError = null;
  for (const model of [...new Set(models)]) {
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        const response = await callModel(model, prompt);
        const parts = response?.candidates?.[0]?.content?.parts || [];
        const imagePart = parts.find(part => part.inlineData?.data);
        if (imagePart) {
          resolvedModel = model;
          return { buffer: Buffer.from(imagePart.inlineData.data, 'base64'), model };
        }
        const refusal = parts.map(part => part.text).filter(Boolean).join(' ').trim();
        if (refusal) return { refused: refusal.slice(0, 300) || 'Model returned text instead of an image.' };
        return { refused: 'No image returned.' };
      } catch (error) {
        lastError = error;
        if (/404|NOT_FOUND|not found|not supported/i.test(`${error?.status} ${error?.message}`)) break; // try next model
        if (!isQuotaError(error)) throw error;
        if (isUnavailableOnPlan(error)) {
          return { quota: true, fatal: true, message: String(error?.message || error) };
        }
        if (attempt === maxRetries) {
          return { quota: true, message: String(error?.message || error).slice(0, 300) };
        }
        const wait = Math.min(120_000, 15_000 * 2 ** attempt);
        console.log(`    quota/rate limit, waiting ${Math.round(wait / 1000)}s (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(wait);
      }
    }
  }
  throw lastError || new Error('No model produced an image.');
};

console.log(`Generating ${queue.length} image(s) with Gemini${dryRun ? ' (dry run)' : ''}...`);
console.log(`Output: ${path.relative(root, outputDirectory)} | delay ${delayMs}ms | retries ${maxRetries}`);

let done = 0;
let refused = 0;
let failed = 0;
let stoppedByQuota = false;
let planBlocked = false;
const problems = [];
const startedAt = Date.now();

for (const item of queue) {
  const target = targetFor(item.id);
  if (dryRun) {
    console.log(`  ${item.id} | ${item.meaning_en} -> ${path.basename(target)}`);
    continue;
  }
  try {
    const result = await generate(item.prompt);
    if (result.quota) {
      stoppedByQuota = true;
      problems.push({ id: item.id, reason: result.fatal ? 'plan' : 'quota', detail: result.message });
      if (result.fatal) {
        planBlocked = true;
        console.log('  ! This model is not available on the current plan (free tier quota = 0).');
        console.log('    Enable billing in Google AI Studio, then re-run the same command.');
      } else {
        console.log(`  ! quota exhausted at ${item.id}. Stopping; re-run later to continue.`);
      }
      break;
    }
    if (result.refused) {
      refused += 1;
      problems.push({ id: item.id, reason: 'refused', detail: result.refused });
      console.log(`  x ${item.id} refused: ${result.refused}`);
      continue;
    }
    await fs.writeFile(target, result.buffer);
    done += 1;
    if (done % 10 === 0 || done === queue.length) {
      const elapsed = Math.round((Date.now() - startedAt) / 1000);
      const perItem = elapsed / done;
      const remaining = Math.round(perItem * (queue.length - done));
      console.log(`  ${done}/${queue.length} (${elapsed}s elapsed, ~${remaining}s left)`);
    }
  } catch (error) {
    failed += 1;
    problems.push({ id: item.id, reason: 'error', detail: String(error?.message || error).slice(0, 300) });
    console.log(`  x ${item.id}: ${String(error?.message || error).slice(0, 200)}`);
  }
  await sleep(delayMs);
}

if (!dryRun) {
  const summary = {
    generated: done,
    refused,
    failed,
    stoppedByQuota: stoppedByQuota,
    planBlocked,
    model: resolvedModel,
    remaining: queue.length - done,
    finishedAt: new Date().toISOString(),
    problems,
  };
  await fs.writeFile(failureLog, JSON.stringify(summary, null, 2) + '\n');
  console.log(`\nGenerated: ${done} | refused: ${refused} | failed: ${failed}${stoppedByQuota ? ' | stopped by quota' : ''}`);
  if (problems.length) console.log(`Log: ${path.relative(root, failureLog)}`);
  console.log('\nNext steps:');
  console.log('  node scripts/import-vocab-illustrations.mjs --dry-run');
  console.log('  npm run import:vocab');
  if (planBlocked) console.log('  (billing is required for image models — free-tier quota is 0)');
  else if (stoppedByQuota) console.log('  (quota resets daily — just run this script again tomorrow)');
}
