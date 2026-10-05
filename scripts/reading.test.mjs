import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function load(name, imports = {}) {
  const source = ts.transpileModule(readFileSync(new URL(`../src/server/${name}.ts`, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {}; vm.runInNewContext(source, { exports, URL, require: key => imports[key] || require(key) }); return exports;
}
const questions = load('readingQuestions');
const sources = load('readingSources', { './readingQuestions.js': questions });
test('source original questions preserve choices and source answer before AI', () => {
  const original = questions.originalQuestions([{ question:'何時ですか。', options:['7時','8時','9時','10時'], correctIndex:0 }]);
  const result = questions.mergeOriginalQuestions(original, [{ question:'AI rewrote the question', options:['x','y'], correctIndex:1 }]);
  assert.equal(result[0].question,'何時ですか。'); assert.equal(result[0].correctIndex,0); assert.equal(result[0].options.join(','),'7時,8時,9時,10時'); assert.equal(result[0].answerOrigin,'source');
});
test('a missing source answer is never guessed from an ambiguous number', () => {
  const original = questions.originalQuestions([{ question:'どれですか。', options:['A','B'], answer:1 }]);
  assert.equal(original[0].correctIndex,undefined);
  assert.throws(() => questions.mergeOriginalQuestions(original,[{ question:'changed',options:['A','B'],correctIndex:0 }]),/INCOMPLETE/);
  const result = questions.mergeOriginalQuestions(original,[{ question:'どれですか。',options:['A','B'],correctIndex:1,explanation:'本文の根拠' }]);
  assert.equal(result[0].correctIndex,1); assert.equal(result[0].answerOrigin,'ai-inferred');
});
test('URLs cannot fetch private servers or lookalike sources', () => {
  for(const url of ['https://127.0.0.1/post-test','https://watanoc.com.evil.test/post-test','https://watanoc.com:444/post-test','http://watanoc.com/post-test','https://watanoc.com/wp-admin','https://user:pass@watanoc.com/post-test']) assert.throws(()=>sources.sourceLocation('watanoc',undefined,url));
  assert.equal(sources.sourceLocation('watanoc',undefined,'https://watanoc.com/post-1610-nikutama').id,'post-1610-nikutama');
  assert.throws(()=>sources.sourceLocation('todai',undefined,'https://evil.test/news/eb90e270710b3e98f67c956f9437b6e1'));
});
test('ruby extraction retains numbers, base words and line breaks exactly once', () => {
  const html='<ruby><rb>駅</rb><rt>えき</rt></ruby>から10<ruby>分<rt>ふん</rt></ruby>です。<br>毎朝7時。';
  assert.equal(sources.plainHtml(html),'駅から10分です。\n\n毎朝7時。');
  assert.equal(sources.rubyHtml(html),'[駅](えき)から10[分](ふん)です。\n\n毎朝7時。');
});

test('source reading accepts a URL without duplicated article text; custom input still requires text', async () => {
  const source = ts.transpileModule(readFileSync(new URL('../api/reading/generate.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, require: key => key.includes('readingCatalog') ? { sourceReadingFromUrl: async url => ({ title: 'source', sourceUrl: url }) } : { analyzeReading: async () => { throw new Error('Should not analyze client text'); } } });
  const response = () => ({ statusCode: 200, setHeader() {}, status(code) { this.statusCode=code; return this; }, json(data) { this.data=data; return this; } });
  const res=response(); await exports.default({method:'POST',body:{sourceUrl:'https://example.test/source',level:'N5'}},res);
  assert.equal(res.statusCode,200); assert.equal(res.data.title,'source');
  const invalid=response(); await exports.default({method:'POST',body:{customPassage:'short'}},invalid);
  assert.equal(invalid.statusCode,400);
  const malformed=response(); await exports.default({method:'POST',body:{sourceUrl:{url:'unsafe'}}},malformed);
  assert.equal(malformed.statusCode,400);
});
