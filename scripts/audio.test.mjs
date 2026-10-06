import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

// Run the actual utility in isolated browser mocks, including delayed play rejections.
const source = ts.transpileModule(readFileSync(new URL('../src/utils/audio.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

const japanese = (name, voiceURI = name) => ({ name, voiceURI, lang: 'ja-JP' });
function setup({ voices = [japanese('Kyoko')], speechSupported = true, constructorFails = false } = {}) {
  const audios = [], utterances = [], timers = new Map(), listeners = new Map(), voiceListeners = new Set();
  const storage = new Map();
  let cancelCount = 0, timerId = 0;
  class Audio {
    constructor(url) {
      if (constructorFails) throw new Error('Audio unavailable');
      this.src = url;
      this.paused = false;
      audios.push(this);
    }
    play() { return { catch: (callback) => { this.reject = callback; } }; }
    pause() { this.paused = true; }
    removeAttribute() { this.src = ''; }
    load() {}
  }
  const synthesis = {
    getVoices: () => voices,
    cancel: () => { cancelCount++; },
    speak: (utterance) => { utterances.push(utterance); utterance.onstart?.(); },
    addEventListener: (_, callback) => voiceListeners.add(callback),
    removeEventListener: (_, callback) => voiceListeners.delete(callback),
  };
  const window = {
    addEventListener: (name, callback) => {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(callback);
    },
    dispatchEvent: (event) => { for (const callback of listeners.get(event.type) || []) callback(event); },
    ...(speechSupported ? { speechSynthesis: synthesis } : {}),
  };
  const context = vm.createContext({
    exports: {}, window, Audio, console,
    SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    setTimeout: (callback) => { const id = ++timerId; timers.set(id, callback); return id; },
    clearTimeout: (id) => timers.delete(id),
  });
  // Each module gets its own `exports` (transpiled code reads exports.X lazily).
  const load = (code) => {
    const exports = {};
    vm.runInContext(`(function (exports, require) {${code}\n})`, context)(exports, (name) => deps[name]);
    return exports;
  };
  const deps = {};
  for (const name of ['learningMotion', 'ttsStatic']) {
    deps[`./${name}`] = load(ts.transpileModule(readFileSync(new URL(`../src/utils/${name}.ts`, import.meta.url), 'utf8'), { compilerOptions:{module:ts.ModuleKind.CommonJS} }).outputText);
  }
  context.exports = load(source);
  return {
    api: context.exports, audios, utterances, storage, window, timers, voiceListeners,
    get cancelCount() { return cancelCount; },
    setVoices: (value) => { voices = value; for (const listener of [...voiceListeners]) listener(); },
    timeout: () => { for (const callback of [...timers.values()]) callback(); },
  };
}

test('preview stop releases HTML audio and ignores late errors/rejections', () => {
  const env = setup(), statuses = [];
  let ended = 0;
  const handle = env.api.speakJapanese('こんにちは', 1, () => ended++, { onStatus: s => statuses.push(s) });
  const audio = env.audios[0], oldError = audio.onerror, oldEnd = audio.onended;
  handle.stop();
  handle.stop();
  oldError(); audio.reject(); oldEnd();
  assert.equal(audio.paused, true);
  assert.equal(audio.src, '');
  assert.equal(env.audios.length, 1);
  assert.equal(env.utterances.length, 0);
  assert.equal(statuses.length, 1);
  assert.equal(statuses[0].state, 'cancelled');
  assert.equal(ended, 0);
});

test('switch A to B: stale callbacks and old handles cannot stop B', () => {
  const env = setup(), states = [];
  const a = env.api.speakJapanese('音声A');
  const old = env.audios[0], oldError = old.onerror;
  const b = env.api.speakJapanese('音声B', 1, undefined, { onStatus: s => states.push(s) });
  oldError(); old.reject(); a.stop();
  assert.equal(env.audios.length, 2);
  assert.equal(env.audios[1].paused, false);
  b.stop();
  assert.equal(env.audios[1].paused, true);
  assert.equal(states[0].state, 'cancelled');
});

test('fallback advances once per provider even when error and promise both fire', () => {
  const env = setup(), statuses = [];
  let ended = 0;
  env.api.speakJapanese('こんにちは', 1, () => ended++, { onStatus: s => statuses.push(s) });
  const azure = env.audios[0], azureError = azure.onerror;
  azureError(); azure.reject(); azureError();
  assert.equal(env.audios.length, 2);
  const google = env.audios[1], googleError = google.onerror;
  googleError(); google.reject(); googleError();
  assert.equal(env.utterances.length, 1);
  assert.equal(statuses[0].provider, 'device');
  assert.match(statuses[0].message, /Kyoko/);
  const utterance = env.utterances[0], end = utterance.onend, error = utterance.onerror;
  end(); error({ error: 'synthesis-failed' });
  assert.equal(ended, 1);
  assert.equal(statuses.length, 2);
});

test('Audio constructor failure still reaches Web Speech fallback', () => {
  const env = setup({ constructorFails: true });
  env.api.speakJapanese('こんにちは');
  assert.equal(env.utterances.length, 1);
});

test('Google fallback reports the actual provider and stops via its handle', () => {
  const env = setup(), statuses = [];
  const handle = env.api.speakJapanese('こんにちは', 1, undefined, { onStatus: s => statuses.push(s) });
  env.audios[0].onerror();
  env.audios[1].onplaying();
  assert.equal(statuses[0].provider, 'google');
  assert.match(statuses[0].message, /Google/);
  handle.stop();
  assert.equal(env.audios[1].paused, true);
});

test('device voice uses URI before name, bypasses server and preserves speaker preference', () => {
  const first = japanese('Same name', 'uri:first'), second = japanese('Same name', 'uri:second');
  const env = setup({ voices: [first, second] });
  env.api.setPreferredVoice('device:uri:second');
  env.api.preloadJapaneseAudio('こんにちは');
  const handle = env.api.speakJapanese('男：こんにちは');
  assert.equal(env.audios.length, 0);
  assert.equal(env.utterances[0].voice, second);
  assert.equal(env.api.getVoiceDisplayName('device:uri:second'), 'Same name (Thiết bị)');
  handle.stop();
  assert.equal(env.cancelCount, 1);
});

test('legacy device:name preferences still resolve', () => {
  const voice = japanese('Kyoko', 'uri:kyoko'), env = setup({ voices: [voice] });
  env.api.speakJapanese('こんにちは', 1, undefined, { voice: 'device:Kyoko' });
  assert.equal(env.utterances[0].voice, voice);
  assert.equal(env.api.isDeviceVoiceSelected('device:Kyoko', voice), true);
});

test('device list arriving later selects the requested voice and removes listeners', () => {
  const env = setup({ voices: [] }), voice = japanese('Kyoko', 'uri:kyoko');
  env.api.speakJapanese('こんにちは', 1, undefined, { voice: 'device:uri:kyoko' });
  assert.equal(env.utterances.length, 0);
  env.setVoices([voice]);
  assert.equal(env.utterances[0].voice, voice);
  assert.equal(env.timers.size, 0);
  assert.equal(env.voiceListeners.size, 0);
});

test('cancelling while waiting for voices never starts speech later', () => {
  const env = setup({ voices: [] });
  env.api.speakJapanese('こんにちは', 1, undefined, { voice: 'device:Kyoko' }).stop();
  env.setVoices([japanese('Kyoko')]); env.timeout();
  assert.equal(env.utterances.length, 0);
  assert.equal(env.voiceListeners.size, 0);
  assert.equal(env.timers.size, 0);
});

test('missing device voice reports substitute; no Japanese voice reports failure', () => {
  const env = setup(), statuses = [];
  env.api.speakJapanese('こんにちは', 1, undefined, { voice: 'device:removed', onStatus: s => statuses.push(s) });
  env.timeout();
  assert.match(statuses[0].message, /Kyoko/);
  const empty = setup({ voices: [] }), errors = [];
  empty.api.speakJapanese('こんにちは', 1, undefined, { voice: 'device:removed', onStatus: s => errors.push(s) });
  empty.timeout();
  assert.equal(errors[0].state, 'failed');
  assert.equal(empty.utterances.length, 0);
});

test('waits for Japanese voices even if another language is already loaded', () => {
  const env = setup({ voices: [{ name: 'English Siri', voiceURI: 'en:siri', lang: 'en-US' }] });
  env.api.speakJapanese('こんにちは', 1, undefined, { voice: 'device:uri:kyoko' });
  assert.equal(env.utterances.length, 0);
  const voice = japanese('Kyoko', 'uri:kyoko');
  env.setVoices([voice]);
  assert.equal(env.utterances[0].voice, voice);
});

test('external Web Speech cancellation is not treated as playback failure', () => {
  const env = setup(), states = [];
  let ended = 0;
  env.api.speakJapanese('こんにちは', 1, () => ended++, { voice: 'device:Kyoko', onStatus: s => states.push(s) });
  env.utterances[0].onerror({ error: 'interrupted' });
  assert.equal(states.at(-1).state, 'cancelled');
  assert.equal(ended, 0);
});

test('unsupported Web Speech reports failure exactly once', () => {
  const env = setup({ speechSupported: false }), statuses = [];
  let ended = 0;
  env.api.speakJapanese('こんにちは', 1, () => ended++, { voice: 'device:Kyoko', onStatus: s => statuses.push(s) });
  assert.equal(statuses[0].state, 'failed');
  assert.equal(ended, 1);
});

test('saving preferences normalizes aliases, cancels playback and notifies consumers', () => {
  const env = setup(), events = [];
  env.window.addEventListener('jlpt_voice_changed', e => events.push(e.detail.voice));
  env.api.speakJapanese('こんにちは');
  env.api.setPreferredVoice('keita');
  assert.equal(env.api.getPreferredVoice(), 'ja-JP-KeitaNeural');
  assert.equal(env.audios[0].paused, true);
  assert.deepEqual(events, ['ja-JP-KeitaNeural']);
  env.api.setPreferredVoice('invalid');
  assert.equal(env.api.getPreferredVoice(), 'ja-JP-NanamiNeural');
});

test('storage events sync another tab and ignore unrelated keys', () => {
  const env = setup(), events = [];
  env.window.addEventListener('jlpt_voice_changed', e => events.push(e.detail.voice));
  env.api.speakJapanese('こんにちは');
  env.storage.set('jlpt_preferred_voice', 'ja-JP-AoiNeural');
  env.window.dispatchEvent({ type: 'storage', key: 'unrelated', newValue: 'x' });
  assert.equal(env.audios[0].paused, false);
  env.window.dispatchEvent({ type: 'storage', key: 'jlpt_preferred_voice', newValue: 'ja-JP-AoiNeural' });
  assert.equal(env.audios[0].paused, true);
  assert.deepEqual(events, ['ja-JP-AoiNeural']);
  env.storage.clear();
  env.window.dispatchEvent({ type: 'storage', key: null, newValue: null });
  assert.equal(events[1], 'ja-JP-NanamiNeural');
});

test('Azure speed is applied once and fallback prefers the exact preset', () => {
  const nanami = japanese('Microsoft Nanami'), aoi = japanese('Microsoft Aoi');
  const env = setup({ voices: [nanami, aoi] });
  env.api.speakJapanese('こんにちは', 0.8, undefined, { voice: 'ja-JP-AoiNeural' });
  assert.equal(new URL(env.audios[0].src, 'https://example.test').searchParams.get('rate'), '-20%');
  assert.equal(env.audios[0].playbackRate, 1);
  env.audios[0].onerror(); env.audios[1].onerror();
  assert.equal(env.utterances[0].voice, aoi);
  assert.equal(env.utterances[0].rate, 0.8);
});

test('preview voice override does not save or broadcast a preference', () => {
  const env = setup(), events = [];
  env.api.setPreferredVoice('nanami');
  env.window.addEventListener('jlpt_voice_changed', e => events.push(e));
  env.api.speakJapanese('こんにちは', 1, undefined, { voice: 'ja-JP-KeitaNeural' });
  assert.equal(env.api.getPreferredVoice(), 'ja-JP-NanamiNeural');
  assert.equal(events.length, 0);
  assert.equal(new URL(env.audios[0].src, 'https://example.test').searchParams.get('voice'), 'ja-JP-KeitaNeural');
});

test('changing preference settles the preview status without invoking legacy completion', () => {
  const env = setup(), states = [];
  let ended = 0;
  env.api.speakJapanese('こんにちは', 1, () => ended++, { onStatus: s => states.push(s) });
  env.audios[0].onplaying();
  env.api.setPreferredVoice('aoi');
  assert.deepEqual(states.map(s => s.state), ['playing', 'cancelled']);
  assert.equal(ended, 0);
});

test('successful Azure audio completes once even with late error callbacks', () => {
  const env = setup(), states = [];
  let ended = 0;
  env.api.speakJapanese('こんにちは', 1, () => ended++, { onStatus: s => states.push(s) });
  const audio = env.audios[0], error = audio.onerror, end = audio.onended;
  audio.onplaying(); end(); end(); error(); audio.reject();
  assert.deepEqual(states.map(s => s.state), ['playing', 'completed']);
  assert.equal(ended, 1);
  assert.equal(env.audios.length, 1);
});

test('dialogue alternates Keita/Nanami through the API, one request per turn', () => {
  const env = setup();
  env.api.speakJapanese('男：こんにちは。\n女：はい、どうも。');
  const voiceOf = (a) => new URL(a.src, 'https://example.test').searchParams.get('voice');
  assert.equal(env.audios.length, 1);
  assert.equal(voiceOf(env.audios[0]), 'ja-JP-KeitaNeural');
  env.audios[0].onplaying?.(); env.audios[0].onended();
  env.timeout();
  assert.equal(env.audios.length, 2);
  assert.equal(voiceOf(env.audios[1]), 'ja-JP-NanamiNeural');
});
