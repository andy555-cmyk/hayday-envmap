// 김해 원도심 RE:CORE 누리집 AI 도우미용 — 환경분석맵 김해 화면 본문 글 전체(접힌 패널 포함)를 제목 단위로 뽑아 JSON 으로
// GitHub Actions(.github/workflows/gimhae-ai-text.yml)가 환경분석맵이 갱신될 때마다 돌림. 화면은 바꾸지 않음(읽기만).
// 사용: CHROME=<크롬 경로> node .github/scripts/gimhae-ai-text.mjs <주소> <출력 파일>
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const [URL_, OUT] = process.argv.slice(2);
const CH = process.env.CHROME || 'google-chrome';
const port = 9550 + Math.floor(Math.random() * 300);
const prof = fs.mkdtempSync('/tmp/gm-env-');
const p = spawn(CH, ['--headless=new', '--no-sandbox', '--disable-gpu', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
for (let i = 0; i < 60; i++) { try { const t = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((x) => x.type === 'page'); if (t) { ws = new WebSocket(t.webSocketDebuggerUrl); break; } } catch {} await sleep(250); }
if (!ws) { console.error('크롬 연결 실패'); process.exit(1); }
await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pend = new Map();
ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: URL_ }); await sleep(12000);
const EXPR = `(() => {
  document.querySelectorAll('.pane').forEach((e) => { e.style.display = 'block'; });
  document.querySelectorAll('details').forEach((d) => { d.open = true; });
  document.querySelectorAll('[hidden]').forEach((e) => { if (e.closest('#zonePanel, .pane, section')) e.hidden = false; });
  const roots = [...document.querySelectorAll('section, .pane')].filter((r) => r.querySelector('h2') && !r.parentElement.closest('section, .pane'));
  const out = [];
  for (const r of roots) {
    const h2 = r.querySelector('h2')?.innerText.trim() || '';
    const heads = [...r.querySelectorAll('h3')];
    const range = document.createRange();
    const textBetween = (a, b) => { range.setStartAfter(a); if (b) range.setEndBefore(b); else range.setEndAfter(r.lastChild || r); const div = document.createElement('div'); div.appendChild(range.cloneContents()); div.querySelectorAll('script,style,svg,canvas,button,input,select').forEach((x) => x.remove()); document.body.appendChild(div); div.style.cssText = 'position:absolute;left:-99999px;width:900px;white-space:normal'; const t = div.innerText; div.remove(); return t; };
    out.push({ h2, h3: '', text: textBetween(r.querySelector('h2'), heads[0] || null) });
    heads.forEach((h, k) => out.push({ h2, h3: h.innerText.trim(), text: textBetween(h, heads[k + 1] || null) }));
  }
  return JSON.stringify(out);
})()`;
const v = await send('Runtime.evaluate', { expression: EXPR, returnByValue: true });
const clean = (t) => t.replace(/ /g, ' ').replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
const secs = JSON.parse(v.result.result.value || '[]').map((s) => ({ h2: clean(s.h2).replace(/\n/g, ' '), h3: clean(s.h3).replace(/\n/g, ' '), text: clean(s.text) })).filter((s) => s.text.length >= 30);
ws.close(); p.kill();
if (secs.length < 30) { console.error('본문이 너무 적음(' + secs.length + ') — 쓰지 않음'); process.exit(1); }
// 내용이 같으면 파일을 건드리지 않음(시각만 바뀌는 커밋 방지)
let prev = null; try { prev = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch {}
if (prev && JSON.stringify(prev.sections) === JSON.stringify(secs)) { console.log('바뀐 것 없음 ·', secs.length, '구역'); process.exit(0); }
fs.writeFileSync(OUT, JSON.stringify({ url: URL_.replace(/^http:\/\/127\.0\.0\.1:\d+\//, 'https://andy555-cmyk.github.io/hayday-envmap/'), fetched: new Date().toISOString(), sections: secs }, null, 1));
console.log('갱신 ·', secs.length, '구역 · 글자', secs.reduce((a, s) => a + s.text.length, 0));
process.exit(0);
