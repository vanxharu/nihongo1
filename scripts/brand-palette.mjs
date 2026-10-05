// Migrate legacy CSS neutrals and bridge existing Tailwind color utilities.
// Run after adding legacy arbitrary colors; new components should use --ui-* tokens.
import fs from 'node:fs';
import path from 'node:path';
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry => entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);
const files=walk('src');
function classify(hex,role){
 let raw=hex.slice(1);if(raw.length===3||raw.length===4)raw=[...raw].map(c=>c+c).join('');
 if(raw.length!==6&&raw.length!==8)return null;
 const [r,g,b]=[0,2,4].map(i=>parseInt(raw.slice(i,i+2),16)/255),max=Math.max(r,g,b),min=Math.min(r,g,b),lum=.2126*r+.7152*g+.0722*b;
 const neutral=(max-min<.22)||(b>=r&&b>=g&&lum<.62);
 if(!neutral){
  if(role==='text')return `var(--ui-${g>r&&g>b?'success':b>r&&b>g?'primary':r>g&&g>b?'accent':r>g&&b>g?'error':'info'})`;
  return null;
 }
 let token=role==='text'?(lum>.78||lum<.23?'ink':'muted'):role==='border'?'line':lum<.085?'canvas':lum<.20?'surface':'soft';
 if(role==='background'&&lum>.8)token='surface';
 const alpha=raw.length===8?parseInt(raw.slice(6),16)/255:1;
 return alpha<1?`color-mix(in srgb,var(--ui-${token}) ${Math.round(alpha*100)}%,transparent)`:`var(--ui-${token})`;
}
for(const file of files.filter(f=>f.endsWith('.css')&&!/brand(Theme|Utilities)\.css$/.test(f))){
 let css=fs.readFileSync(file,'utf8');
 // Preserve the documented mascot/source palette; migrate declaration values only.
 css=css.replace(/([\w-]+)\s*:\s*([^;{}]+)(?=[;}])/g,(all,property,value)=>{
  if(property.startsWith('--shiba-')||property.startsWith('--')&&!/(ink|muted|border|line)/.test(property))return all;
  const role=/color$/.test(property)&&!/(background|border)/.test(property)||/(ink|muted)/.test(property)?'text':/(border|outline|line)/.test(property)?'border':/(background|shadow)/.test(property)?'background':null;
  if(!role)return all;
  return all.replace(value,value.replace(/#[\da-fA-F]{3,8}\b/g,hex=>classify(hex,role)||hex));
 });
 fs.writeFileSync(file,css);
}
const classes=new Set();
for(const file of files.filter(f=>/\.(tsx|ts)$/.test(f))){
 const source=fs.readFileSync(file,'utf8');
 for(const match of source.matchAll(/(?:hover:|group-hover:)?(?:bg|text|border|from|via|to|ring)-\[#[\da-fA-F]{3,8}\](?:\/\d+)?/g))classes.add(match[0]);
 for(const match of source.matchAll(/(?:hover:|group-hover:)?(?:bg|text|border)-(?:slate|gray|zinc|neutral|amber|yellow|orange|blue|cyan|sky|indigo|purple|violet|rose|pink|red|emerald|green|teal)-(?:50|[1-9]00|950)(?:\/\d+)?/g))classes.add(match[0]);
 for(const match of source.matchAll(/(?:hover:)?(?:bg|text|border)-(?:white|black)(?:\/\d+)?/g))classes.add(match[0]);
}
const escape=value=>value.replace(/[^a-zA-Z0-9_-]/g,c=>'\\'+c);
const rules=[];
for(const cls of [...classes].sort()){
 const base=cls.replace(/^(hover:|group-hover:)/,''),role=base.startsWith('text-')?'text':base.startsWith('border-')||base.startsWith('ring-')?'border':'background';
 const hex=base.match(/\[(#[\da-fA-F]+)\]/)?.[1];
 let color=hex?classify(hex,role):`var(--ui-${role==='text'?/-(400|500|600)(?:\/|$)/.test(base)?'muted':'ink':role==='border'?'line':/-(700|800|900|950|black)(?:\/|$)/.test(base)?'soft':'surface'})`;
 const family=base.match(/-(amber|yellow|orange|blue|cyan|sky|indigo|purple|violet|rose|pink|red|emerald|green|teal)-/ )?.[1];
 if(family){
  const token=/emerald|green|teal/.test(family)?'success':/red|rose|pink/.test(family)?'error':/amber|yellow|orange/.test(family)?'accent':/blue|cyan|sky/.test(family)?'info':'primary';
  color=role==='text'?`var(--ui-${token})`:role==='border'?`color-mix(in srgb,var(--ui-${token}) 45%,var(--ui-line))`:`color-mix(in srgb,var(--ui-${token}) 12%,var(--ui-surface))`;
 }
 if(!color)continue;
 const alpha=base.match(/\/(\d+)$/)?.[1];if(alpha)color=`color-mix(in srgb,${color} ${alpha}%,transparent)`;
 const prop=base.startsWith('from-')?'--tw-gradient-from':base.startsWith('via-')?'--tw-gradient-via':base.startsWith('to-')?'--tw-gradient-to':role==='text'?'color':role==='border'?'border-color':'background-color';
 const selector=cls.startsWith('group-hover:')?`.group:hover .${escape(cls)}`:`.${escape(cls)}${cls.startsWith('hover:')?':hover':''}`;
 // Do not recolor modal/video scrims: translucent dark backgrounds are overlays.
 if(role==='background'&&/^(bg-black|bg-slate-950|bg-slate-900)\/(40|50|60|70|80)$/.test(base))continue;
 rules.push(`html[data-theme] #app-root-container ${selector}{${prop}:${color}!important}`);
}
rules.push(`html[data-theme] #app-root-container :is(.bg-blue-500,.bg-blue-600,.bg-indigo-500,.bg-indigo-600,.bg-purple-600,.bg-violet-600,.bg-amber-400,.bg-amber-500,.bg-yellow-400,.bg-\\[\\#E89A3C\\]){background:var(--ui-primary)!important;color:var(--ui-on-primary)!important}`);
rules.push(`html[data-theme] #app-root-container :is(.bg-blue-500,.bg-blue-600,.bg-indigo-600,.bg-amber-400,.bg-amber-500,.bg-yellow-400,.bg-\\[\\#E89A3C\\]) :is(span,svg){color:inherit!important}`);
fs.writeFileSync('src/brandUtilities.css','/* Generated by scripts/brand-palette.mjs; semantic bridge for legacy utilities. */\n'+rules.join('\n')+'\n');
console.log(`Updated legacy palette; ${rules.length} utility bridges.`);
