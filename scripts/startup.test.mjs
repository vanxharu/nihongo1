import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function boot({offline=false,blocked=false,store=new Map()}={}) {
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const source=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
  const handlers={}, elements={};
  const replaced=[];
  const window={addEventListener:(name,fn)=>handlers[name]=fn};
  const location={href:'https://example.org/shadowing?v=abc',replace:url=>replaced.push(url)};
  const document={getElementById:id=>elements[id] ||= {style:{},textContent:''}};
  vm.runInNewContext(source,{window,document,location,navigator:{onLine:!offline},URL,Date,
    sessionStorage:{getItem:key=>{if(blocked)throw Error('blocked');return store.get(key)},setItem:(key,value)=>store.set(key,value)},setTimeout:()=>{}});
  return {window,handlers,replaced,elements,store};
}
test('entry module failure shows recovery and refreshes at most once while retaining video URL',()=>{
  const b=boot();
  b.handlers.error({target:{tagName:'SCRIPT',type:'module'}});
  b.handlers['vite:preloadError']();
  assert.equal(b.elements['boot-status'].style.display,'grid');
  assert.equal(b.replaced.length,1);
  assert.equal(new URL(b.replaced[0]).searchParams.get('v'),'abc');
  assert.ok(new URL(b.replaced[0]).searchParams.get('__refresh'));
  const nextPage=boot({store:b.store});nextPage.handlers['vite:preloadError']();
  assert.equal(nextPage.replaced.length,0);
});
test('offline and blocked storage still show retry UI without automatic reload loops',()=>{
  for(const options of [{offline:true},{blocked:true}]) {
    const b=boot(options);b.handlers.error({target:{tagName:'SCRIPT',type:'module'}});
    assert.equal(b.replaced.length,0);assert.equal(b.elements['boot-status'].style.display,'grid');
  }
});
test('successful React startup hides boot UI and later non-module errors do not cover the app',()=>{
  const b=boot();b.window.nihongoAppStarted();b.handlers.error({message:'unrelated widget'});
  assert.equal(b.elements['boot-status'].style.display,'none');
});

async function sw(request, cached, network, blocked=false) {
  const source=readFileSync(new URL('../public/sw.js',import.meta.url),'utf8');
  const begin=source.indexOf('// Keep HTML fresh');
  const end=source.indexOf('// Periodic Background Sync',begin);
  let handler,result;const puts=[];let deleted=false;
  const cache={match:async()=>cached,put:async(key,value)=>puts.push({key,value}),delete:async()=>{deleted=true}};
  vm.runInNewContext(source.slice(begin,end),{self:{location:{origin:'https://example.org'},addEventListener:(_,fn)=>handler=fn},URL,Response,CACHE_NAME:'test',caches:{open:async()=>{if(blocked)throw Error('storage blocked');return cache}},fetch:network});
  handler({request,respondWith:p=>result=p});
  return {response:await result,puts,deleted};
}
test('online navigation uses fresh HTML instead of a cached previous deployment',async()=>{
  const result=await sw({method:'GET',url:'https://example.org/',mode:'navigate'},new Response('old'),async()=>new Response('new',{headers:{'Content-Type':'text/html'}}));
  assert.equal(await result.response.text(),'new');assert.equal(result.puts[0].key,'/index.html');
});
test('offline navigation retains cached HTML',async()=>{
  const result=await sw({method:'GET',url:'https://example.org/',mode:'navigate'},new Response('offline'),async()=>{throw Error('offline')});
  assert.equal(await result.response.text(),'offline');
});
test('HTML masquerading as a cached JavaScript module is discarded and never recached',async()=>{
  const result=await sw({method:'GET',url:'https://example.org/assets/missing.js',mode:'cors'},new Response('<html>',{headers:{'Content-Type':'text/html'}}),async()=>new Response('<html>',{headers:{'Content-Type':'text/html'}}));
  assert.equal(result.deleted,true);assert.equal(result.puts.length,0);
});
test('cache storage failure does not prevent fresh pages or modules from loading',async()=>{
  for(const [mode,path,type] of [['navigate','/','text/html'],['cors','/assets/app.js','text/javascript']]) {
    const result=await sw({method:'GET',url:'https://example.org'+path,mode},undefined,async()=>new Response('fresh',{headers:{'Content-Type':type}}),true);
    assert.equal(await result.response.text(),'fresh');
  }
});
