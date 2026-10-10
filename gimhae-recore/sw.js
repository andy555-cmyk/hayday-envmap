// 김해 원도심 RE:CORE — 다시 올 때 빠르게(자동 생성, 판 553f3efee2)
// 첫 화면·자료: 늘 새로 받고(3초 넘게 걸리면 저장본), 화면 파일·글꼴·지도 도구: 저장본 우선, 그림: 저장본을 먼저 보이고 뒤에서 새로 받기
// 원문(PDF 등)은 저장하지 않는다. 문제가 생기면 이 파일을 '스스로 지우기' 판으로 바꿔 올리면 된다(README).
const V = '553f3efee2', CORE = 'gm-core-' + V, PAGE = 'gm-page', IMG = 'gm-img-v1';
const PRE = ["app.0b9915c66b.js","app.2ce94dad90.css","favicon.svg","fonts/Pretendard-Regular.b0d0d68fc5.woff2","fonts/Pretendard-Medium.dd514a8cea.woff2","fonts/Pretendard-SemiBold.d54c8bc4c9.woff2","fonts/Pretendard-Bold.7e148b19c7.woff2"];
self.addEventListener('install', (e) => { e.waitUntil((async () => {
  const c = await caches.open(CORE); await c.addAll(PRE);
  try { const p = await caches.open(PAGE); await p.add('./'); } catch {}
  await self.skipWaiting();
})()); });
self.addEventListener('activate', (e) => { e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k.startsWith('gm-core-') && k !== CORE) await caches.delete(k);
  await self.clients.claim();
})()); });
const scopePath = new URL(self.registration.scope).pathname;
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url); if (u.origin !== location.origin || !u.pathname.startsWith(scopePath)) return;
  const rel = u.pathname.slice(scopePath.length);
  if (r.mode === 'navigate' || rel === '' || rel === 'index.html') { e.respondWith(pageFirst(r)); return; }
  if (rel.startsWith('docs/') || rel === 'sw.js') return;
  if (rel.startsWith('data/')) { e.respondWith(netFirst(r, PAGE)); return; }
  if (/^(app\.[0-9a-f]+\.(js|css)|fonts\/|vendor\/|favicon\.svg)/.test(rel)) { e.respondWith(cacheFirst(r, CORE)); return; }
  if (rel.startsWith('img/') || rel === 'og.jpg') { e.respondWith(staleWhile(r, IMG)); }
});
async function pageFirst(r) {
  const c = await caches.open(PAGE), key = new Request(new URL('./', self.registration.scope));
  const net = fetch(r).then((res) => { if (res.ok) c.put(key, res.clone()); return res; });
  const hit = await c.match(key);
  if (!hit) return net;
  return Promise.race([net.catch(() => hit), new Promise((ok) => setTimeout(() => ok(hit), 3000))]);
}
async function netFirst(r, name) {
  const c = await caches.open(name);
  try { const res = await fetch(r); if (res.ok) c.put(r, res.clone()); return res; }
  catch (err) { const hit = await c.match(r, { ignoreSearch: true }); if (hit) return hit; throw err; }
}
async function cacheFirst(r, name) {
  const c = await caches.open(name), hit = await c.match(r);
  if (hit) return hit;
  const res = await fetch(r); if (res.ok) c.put(r, res.clone()); return res;
}
async function staleWhile(r, name) {
  const c = await caches.open(name), hit = await c.match(r);
  const net = fetch(r).then((res) => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => hit);
  return hit || net;
}
