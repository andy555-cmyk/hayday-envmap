/* 지구 발표(zoom/) 웹판 덧붙임 — 원도심·봉리단길·봉스퀘어 단계에 「근거 보기」: 지금 카메라 그대로 종합분석맵(../)을 연다 */
(() => {
  const BASE = 'vignette,rings,rail,roads,water,context,zone,places';
  const LINK = {
    old: { layers: BASE + ',flows', routes: 'place', tip: '역→관광지 걷는 길 · 구역계' },
    street: { layers: BASE + ',heat,gaps,flows', tip: '점포 밀도 · 점포 공백' },
    square: { layers: BASE + ',sites,flows', routes: 'site', tip: '대상부지 13곳 · 역→거점 걷는 길' },
  };
  const btn = document.createElement('button');
  btn.id = 'evidence';
  btn.type = 'button';
  document.body.appendChild(btn);
  const css = document.createElement('style');
  css.textContent = `#evidence{position:fixed;right:calc(var(--u,16px)*4.2);bottom:calc(var(--u,16px)*4.4);z-index:15;font:600 calc(var(--u,16px)*.95)/1 Pretendard,sans-serif;color:#fff;background:rgba(10,14,22,.72);border:1px solid rgba(255,255,255,.28);border-radius:999px;padding:.75em 1.2em;cursor:pointer;backdrop-filter:blur(6px);opacity:0;pointer-events:none;transition:opacity .6s,border-color .3s}
#evidence.on{opacity:1;pointer-events:auto}#evidence:hover,#evidence:focus-visible{border-color:#FF9A4A;outline:none}#evidence small{display:block;margin-top:.45em;font-weight:400;font-size:.78em;color:rgba(255,255,255,.62)}
body.clean #evidence{display:none}`;
  document.head.appendChild(css);
  const app = () => window.__app, map = () => window.__map;
  const cur = () => { const a = app(); return a && a.STEPS[a.si] ? LINK[a.STEPS[a.si].key] : null; };
  let shown = null;
  setInterval(() => {   // 단계가 바뀌면 단추를 켜고 끈다(화면이 뒤에 있어도 돌게 타이머로)
    const l = cur();
    if (l !== shown) { shown = l; btn.classList.toggle('on', !!l); if (l) btn.innerHTML = `근거 보기 →<small>${l.tip}</small>`; }
  }, 200);
  const r = v => Math.round(v * 1e5) / 1e5;
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const l = cur(), m = map(); if (!l || !m) return;
    // 판의 여백(설명판 자리)을 빼지 않은 화면 한가운데 땅 — 종합분석맵은 여백 없이 같은 화면을 그린다
    const c = m.unproject([innerWidth / 2, innerHeight / 2]);
    const cam = [r(c.lng), r(c.lat), r(m.getZoom()), r(m.getPitch()), r(m.getBearing())].join(',');
    const q = new URLSearchParams({ case: 'gimhae_261011', mode: 'explore', cam, layers: l.layers });
    if (l.routes) q.set('routes', l.routes);
    try { history.replaceState(null, '', '?step=' + app().si); } catch (err) { /* 뒤로 가면 같은 단계로 */ }
    location.href = '../?' + q.toString();
  });
  addEventListener('keydown', e => { if ((e.key === 'g' || e.key === 'G') && !e.metaKey && !e.ctrlKey && cur()) btn.click(); });
})();
