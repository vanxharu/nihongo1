import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';

test('compiled Vercel entries load in native Node ESM and return timed captions', () => {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const output = mkdtempSync(resolve(root, '.shadowing-runtime-'));
  const compiled = new Set();
  function compile(file) {
    if (compiled.has(file)) return;
    compiled.add(file);
    const emitted = ts.transpileModule(readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const dest = resolve(output, relative(root, file).replace(/\.ts$/, '.js'));
    mkdirSync(dirname(dest), { recursive: true }); writeFileSync(dest, emitted);
    for (const dependency of ts.preProcessFile(emitted).importedFiles) {
      if (!dependency.fileName.startsWith('.')) continue;
      assert.ok(dependency.fileName.endsWith('.js'), `Native ESM requires an extension: ${dependency.fileName}`);
      compile(resolve(dirname(file), dependency.fileName.replace(/\.js$/, '.ts')));
    }
  }
  try {
    writeFileSync(resolve(output, 'package.json'), '{"type":"module"}');
    compile(resolve(root, 'api/shadowing/transcript.ts'));
    compile(resolve(root, 'api/shadowing/analyze.ts'));
    compile(resolve(root, 'api/shadowing/video.ts'));
    compile(resolve(root, 'api/shadowing/prepare.ts'));
    writeFileSync(resolve(output, 'run.mjs'), `
      import transcript from './api/shadowing/transcript.js';
      import analyze from './api/shadowing/analyze.js';
      import video from './api/shadowing/video.js';
      import prepare from './api/shadowing/prepare.js';
      import {validateStoredCues} from './src/server/shadowingStore.js';
      import {parseManagedCaptions} from './src/server/shadowing.js';
      globalThis.fetch = async url => String(url).includes('/youtubei/')
        ? Response.json({captions:{playerCaptionsTracklistRenderer:{captionTracks:[{languageCode:'ja',baseUrl:'https://www.youtube.com/api/timedtext'}]}}})
        : new Response('<timedtext><body><p t="4520" d="8840"><s>日本語能力試験。</s></p></body></timedtext>');
      const replies=[];
      const res=()=>({statusCode:200,setHeader(){},status(n){this.statusCode=n;return this},json(data){replies.push({status:this.statusCode,data});return this}});
      await transcript({method:'GET',query:{videoId:'I3kvL128MIQ'}},res());
      await transcript({method:'GET',query:{videoId:'bad'}},res());
      await analyze({method:'POST',body:{sentence:'日本語を勉強しています。'}},res());
      process.env.SUPADATA_API_KEY='test-only-key';
      globalThis.fetch = async (url, init) => {
        if (new URL(url).hostname === 'api.supadata.ai') {
          if (new URL(url).searchParams.get('mode') !== 'native' || init.headers['x-api-key'] !== 'test-only-key') throw new Error('Invalid provider request');
          return Response.json({lang:'ja',content:[{text:'日本語',offset:1500,duration:2000}]});
        }
        return String(url).includes('/youtubei/') ? Response.json({}) : new Response('<html></html>');
      };
      await transcript({method:'GET',query:{videoId:'I3kvL128MIQ'}},res());
      let rejectedEnglish=false;
      try {parseManagedCaptions({lang:'en',content:[{text:'English',offset:0,duration:2000}]})} catch {rejectedEnglish=true}
      replies.push({rejectedEnglish});
      await video({method:'POST',headers:{authorization:'Bearer forged-session'},body:{}},res());
      await prepare({method:'POST',headers:{},body:{cues:[]}},res());
      const enriched=validateStoredCues([{id:'test',text:'日本語',start:1,end:3,translation:'Tiếng Nhật',readings:[{word:'日本語',reading:'にほんご'}]}]);
      let rejectedDuplicates=false;try {validateStoredCues([...enriched,...enriched])} catch {rejectedDuplicates=true}
      let rejectedTime=false;try {validateStoredCues([{id:'bad',text:'日本語',start:3,end:1}])} catch {rejectedTime=true}
      replies.push({enriched,rejectedDuplicates,rejectedTime});
      console.log(JSON.stringify(replies));
    `);
    const replies = JSON.parse(execFileSync(process.execPath, [resolve(output, 'run.mjs')], {
      encoding: 'utf8', env: { ...process.env, OPENAI_API_KEY: '', GEMINI_API_KEY: '', SUPADATA_API_KEY: '' },
    }));
    assert.equal(replies[0].status, 200);
    assert.ok(Math.abs(replies[0].data.cues[0].start - 4.52) < 0.00001);
    assert.ok(Math.abs(replies[0].data.cues[0].end - 13.36) < 0.00001);
    assert.equal(replies[1].status, 400);
    assert.equal(replies[2].data.source, 'dictionary');
    assert.ok(replies[2].data.vocabulary.length > 0);
    assert.ok(replies[2].data.readings.some(r => r.word === '日本語' && r.reading === 'にほんご'));
    assert.ok(replies[2].data.readings.some(r => r.word === '勉強' && r.reading === 'べんきょう'));
    assert.equal(replies[3].data.source, 'native-provider');
    assert.equal(replies[3].data.cues[0].start, 1.5);
    assert.equal(replies[3].data.cues[0].end, 3.5);
    assert.equal(replies[4].rejectedEnglish, true);
    assert.equal(replies[5].status, 401);
    assert.equal(replies[6].status, 401);
    assert.equal(replies[7].enriched[0].translation, 'Tiếng Nhật');
    assert.equal(replies[7].enriched[0].readings[0].reading, 'にほんご');
    assert.equal(replies[7].rejectedDuplicates, true);
    assert.equal(replies[7].rejectedTime, true);
  } finally { rmSync(output, { recursive: true, force: true }); }
});
