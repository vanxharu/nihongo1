// Vẽ thumbnail 640x360 (gradient + chữ Hán chủ đề) cho từng bài đọc. Chạy: node scripts/makeReadingThumbs.mjs
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire('/opt/npm-tools/node_modules/')('playwright');
const lib = JSON.parse(fs.readFileSync('src/data/readingLibraryN4.json', 'utf8'));
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
const pg = await b.newPage({ viewport: { width: 640, height: 360 } });
for (const a of lib) {
  const { kanji, from, to } = a.thumb;
  await pg.setContent(`<body style="margin:0;width:640px;height:360px;background:linear-gradient(135deg,${from},${to});display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;font-family:'Noto Sans CJK JP','Noto Sans CJK SC','Noto Sans JP',sans-serif">
  <div style="position:absolute;width:360px;height:360px;border-radius:50%;background:rgba(255,255,255,.18);right:-80px;top:-90px"></div>
  <div style="position:absolute;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.12);left:-60px;bottom:-70px"></div>
  <div style="font-size:230px;font-weight:900;color:#fff;text-shadow:0 8px 30px rgba(0,0,0,.25)">${kanji}</div></body>`);
  await pg.screenshot({ path: `public/reading-thumbs/${a.id}.png` });
}
await b.close(); console.log('xong', lib.length);
