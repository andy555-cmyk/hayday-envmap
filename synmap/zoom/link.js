/* 지구 발표(zoom/) 웹판 덧붙임 — 원도심·봉리단길·봉스퀘어 단계에 「근거 보기」
   종합분석맵(../)을 숨은 겹판으로 미리 띄워 두고, 누르면 지금 카메라 그대로 맞춘 뒤 겹쳐 드러낸다(새로 불러오기 없음).
   돌아갈 때는 종합분석맵이 그 기울기로 다시 선 뒤 발표가 드러난다. 겹판이 준비 전이면 예전처럼 주소로 넘어간다. */
(() => {
  const BASE = 'vignette,rings,rail,roads,water,context,zone,places';
  const LINK = {
    old: { layers: BASE + ',flows', routes: 'place', tip: '역→관광지 걷는 길 · 구역계' },
    street: { layers: BASE + ',heat,gaps,flows', tip: '점포 밀도 · 점포 공백' },
    square: { layers: BASE + ',sites,flows', routes: 'site', tip: '대상부지 13곳 · 역→거점 걷는 길' },
  };
  const DECK_UI = '#panel,#bignum,#timeline,#rv,#sitecard,#crumbs,#scale,#attr,#chapter,#evidence,#stepnav,#help';
  const css = document.createElement('style');
  css.textContent = `#evidence{position:fixed;right:calc(var(--u,16px)*4.2);bottom:calc(var(--u,16px)*4.4);z-index:15;font:600 max(13px,calc(var(--u,16px)*.95))/1 Pretendard,sans-serif;color:#fff;background:rgba(10,14,22,.72);border:1px solid rgba(255,255,255,.28);border-radius:999px;padding:.75em 1.2em;cursor:pointer;backdrop-filter:blur(6px);opacity:0;pointer-events:none;transition:opacity .6s,border-color .3s}
#evidence.on{opacity:1;pointer-events:auto}#evidence:hover,#evidence:focus-visible{border-color:#FF9A4A;outline:none}#evidence small{display:block;margin-top:.45em;font-weight:400;font-size:max(13px,.78em);color:rgba(255,255,255,.62)}
body.clean #evidence{display:none}
body{word-break:keep-all;overflow-wrap:break-word}
#panel,#finale,#sitecard,#opening,#bignum,#timeline,#rv,#chapter{text-wrap:pretty}
#stepnav{position:fixed;left:calc(var(--u,16px)*4.2);bottom:calc(var(--u,16px)*4.4);z-index:15;display:flex;gap:8px;font:600 max(13px,calc(var(--u,16px)*.9))/1 Pretendard,sans-serif;transition:opacity .4s}
#stepnav button,#stepnav a{color:#fff;background:rgba(10,14,22,.72);border:1px solid rgba(255,255,255,.24);border-radius:999px;padding:.7em 1.1em;cursor:pointer;font:inherit;backdrop-filter:blur(6px);transition:border-color .3s,opacity .3s}
#stepnav button:hover,#stepnav button:focus-visible,#stepnav a:hover,#stepnav a:focus-visible{border-color:#FF9A4A;outline:none}
#stepnav button:disabled{opacity:.35;cursor:default}
#stepnav a{text-decoration:none;display:block}#stepnav .syn{margin-left:6px;border-color:rgba(255,154,74,.55)}
#help{opacity:1!important;left:calc(var(--u,16px)*4.2);right:auto;top:12px;transform:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:calc(100vw - var(--u,16px)*8.4);box-sizing:border-box}
#stepnav .home{display:none}#stepnav.moved .home{display:block}
body.flying #stepnav{opacity:.35}
#evframe{position:fixed;inset:0;width:100%;height:100%;border:0;z-index:60;background:transparent;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .8s ease .15s,visibility 0s linear 1s}
body.ev-open #evframe{opacity:1;visibility:visible;pointer-events:auto;transition:opacity .8s ease .15s,visibility 0s}
body.ev-open :is(${DECK_UI}){opacity:0!important;pointer-events:none!important;transition:opacity .35s ease!important}
@media (max-width:900px){
#help{left:12px;right:12px;max-width:none;font-size:13px;text-overflow:clip;overflow-x:auto;pointer-events:auto;scrollbar-width:none;padding:6px 12px}
#stepnav{left:12px;right:12px;bottom:46px;font-size:13px;gap:6px}#stepnav button,#stepnav a{padding:.65em .9em}
#evidence{right:12px;bottom:86px;font-size:13px;padding:.6em 1em}#evidence small{font-size:13px}
}`;
  document.head.appendChild(css);

  // 이전·다음·제자리 — 웹판은 화면 클릭으로 넘기지 않는다(지도를 끌고·확대해 둘러보게)
  const nav = document.createElement('nav');
  nav.id = 'stepnav'; nav.setAttribute('aria-label', '장면 넘기기');
  nav.innerHTML = '<button type="button" class="prev" title="이전 (←)">‹ 이전</button><button type="button" class="home" title="이 장면의 처음 화면으로">↺ 제자리</button><button type="button" class="next" title="다음 (→)">다음 ›</button><a class="syn" href="../" title="종합분석맵 첫 화면으로">종합분석맵 바로 가기 →</a>';
  document.body.appendChild(nav);

  const btn = document.createElement('button');
  btn.id = 'evidence'; btn.type = 'button';
  document.body.appendChild(btn);

  const app = () => window.__app, map = () => window.__map;
  const keyOf = () => { const a = app(); return a && a.STEPS[a.si] ? a.STEPS[a.si].key : null; };
  const cur = () => LINK[keyOf()] || null;
  const r = v => Math.round(v * 1e5) / 1e5;
  // 지금 카메라 + 판의 여백(설명판 자리) — 종합분석맵이 같은 여백으로 그려 원근까지 맞춘 뒤 여백을 풀며 눕는다
  const camNow = () => { const m = map(), c = m.getCenter(), p = m.getPadding(); return [r(c.lng), r(c.lat), r(m.getZoom()), r(m.getPitch()), r(m.getBearing()), ...[p.left, p.right, p.top, p.bottom].map(Math.round)].join(','); };
  const query = (l, cam, embed) => { const q = new URLSearchParams({ case: 'gimhae_261030', mode: 'explore', cam, layers: l.layers }); if (l.routes) q.set('routes', l.routes); if (embed) q.set('embed', '1'); return q.toString(); };

  // 겹판: 이어지는 단계에 처음 내려앉으면 만들고, 단계가 바뀌면 숨은 채로 다음 화면에 맞춰 둔다(타일·삽도 미리 준비)
  let frame = null, open = false, aimed = null;
  const syn = () => { try { const w = frame && frame.contentWindow, s = w && w.__synmap; return s && !w.document.getElementById('app').classList.contains('is-loading') ? s : null; } catch (e) { return null; } };
  function warm() {
    const l = cur(), m = map();
    if (!l || !m || open || m.isMoving()) return;
    const k = keyOf();
    if (!frame) {
      frame = document.createElement('iframe');
      frame.id = 'evframe'; frame.title = '종합분석맵'; frame.setAttribute('aria-hidden', 'true'); frame.tabIndex = -1;
      frame.src = '../?' + query(l, camNow(), true);
      // 숨은 동안 겹판이 초점·키를 가져가면 발표로 되돌린다(발표 리모컨 키가 사라지지 않게)
      frame.addEventListener('load', () => {
        try {
          frame.contentWindow.addEventListener('keydown', e => {
            if (open) return;
            e.preventDefault(); e.stopImmediatePropagation();
            giveBack();
            window.dispatchEvent(new KeyboardEvent('keydown', { key: e.key, code: e.code, shiftKey: e.shiftKey, bubbles: true, cancelable: true }));
          }, true);
        } catch (err) { /* 무시 */ }
      });
      document.body.appendChild(frame); aimed = k; return;
    }
    const s = syn();
    if (s && aimed !== k) { s.aim({ cam: camNow(), layers: l.layers, routes: l.routes }); aimed = k; }
  }

  const giveBack = () => { if (!open && frame && document.activeElement === frame) { frame.blur(); window.focus(); } };
  // 지도를 손으로 움직이면: 천천히 도는 카메라를 멈추고, 움직이기 전 화면을 기억해 「제자리」로 돌아갈 수 있게
  let home = null, beatKey = '';
  const beatNow = () => { const a = app(); return a ? a.si + ':' + a.bi : ''; };
  const userMove = e => {
    const a = app(), m = map(); if (!e.originalEvent || !a || !m || open) return;
    if (!home) { const c = m.getCenter(); home = { center: [c.lng, c.lat], zoom: m.getZoom(), pitch: m.getPitch(), bearing: m.getBearing(), padding: m.getPadding() }; nav.classList.add('moved'); }
    a.drift(false); a.spin(false);
  };
  const hookMap = () => { const m = map(); if (!m || hookMap.done) return; hookMap.done = true; ['dragstart', 'zoomstart', 'rotatestart', 'pitchstart'].forEach(ev => m.on(ev, userMove)); };
  nav.addEventListener('click', e => {
    e.stopPropagation();
    const a = app(), m = map(), b = e.target.closest('button'); if (!a || !b) return;   // 종합분석맵 바로 가기(a)는 그냥 이동
    if (b.classList.contains('prev')) a.prev();
    else if (b.classList.contains('next')) a.next();
    else if (home && m) { const h = home; home = null; nav.classList.remove('moved'); m.easeTo({ ...h, duration: 1400, essential: true }); m.once('moveend', () => { if (!home) a.drift(true); }); }
  });

  // 외톨이 글자 막기: 글 덩어리 끝 낱말들을 줄바꿈 없는 띄어쓰기로 묶어 마지막 줄이 너무 짧지 않게(장면마다 새로 그려지는 글도)
  const WIDOW = '#panel .p-lead,#panel .beat,#panel .src,#bignum .bn-k,#finale .f-s,#finale .f-ask div,#finale .f-ask li,#sitecard p,#sitecard h3,#opening .op-sub';
  const isBlock = el => !/^inline/.test(getComputedStyle(el).display) || /inline-(block|flex)/.test(getComputedStyle(el).display);
  function unwidow() {
    document.querySelectorAll(WIDOW).forEach(el => {
      if (el.__nb === el.textContent) return;   // 글이 새로 그려졌을 때만
      const nodes = [];
      const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: n => { for (let e = n.parentElement; e && e !== el; e = e.parentElement) if (isBlock(e)) return NodeFilter.FILTER_REJECT; return NodeFilter.FILTER_ACCEPT; } });
      for (let n; (n = tw.nextNode());) nodes.push(n);
      let got = 0, joins = 0;
      for (let i = nodes.length - 1; i >= 0 && got < 8 && joins < 3; i--) {
        const t = nodes[i].data.replace(/\s+$/, ''); let out = '';
        for (let k = t.length - 1; k >= 0; k--) {
          const c = t[k];
          if (c === ' ' && got > 0 && got < 8 && joins < 3) { out = '\u00a0' + out; joins++; continue; }
          if (c !== ' ' && c !== '\u00a0') got++;
          out = c + out;
        }
        nodes[i].data = out + nodes[i].data.slice(t.length);
      }
      el.__nb = el.textContent;
    });
  }

  setInterval(() => {   // 단계가 바뀌면 단추를 켜고 끄고 겹판을 데운다(화면이 뒤에 있어도 돌게 타이머로)
    const l = cur();
    if (l !== btn._l) { btn._l = l; btn.classList.toggle('on', !!l); if (l) btn.innerHTML = `근거 보기 →<small>${l.tip}</small>`; }
    hookMap();
    const bk = beatNow();
    if (bk !== beatKey) { beatKey = bk; home = null; nav.classList.remove('moved'); }
    const a = app();
    if (a) { nav.querySelector('.prev').disabled = a.si === 0 && a.bi === 0; nav.querySelector('.next').disabled = a.si === a.STEPS.length - 1 && a.STEPS[a.si].key === 'finale' && a.bi >= 3; }
    unwidow(); warm(); giveBack();
  }, 250);

  async function show() {
    const l = cur(), m = map(); if (!l || !m || open) return;
    let s = syn();
    if (frame && !s) { for (let i = 0; i < 12 && !s; i++) { await new Promise(res => setTimeout(res, 200)); s = syn(); } }
    if (!s) {   // 겹판이 없거나 늦음 → 예전처럼 주소로 넘어간다(뒤로 가면 같은 단계)
      try { history.replaceState(null, '', '?step=' + app().si); } catch (err) { /* 무시 */ }
      location.href = '../?' + query(l, camNow(), false); return;
    }
    open = true; aimed = keyOf();
    s.show({ cam: camNow(), layers: l.layers, routes: l.routes });
    frame.removeAttribute('aria-hidden'); frame.tabIndex = 0;
    document.body.classList.add('ev-open');
    setTimeout(() => { try { frame.contentWindow.focus(); } catch (e) { /* 무시 */ } }, 300);
  }
  async function hide(next) {
    if (!open) return;
    const s = syn();
    if (s) await Promise.race([s.hide(camNow()), new Promise(res => setTimeout(res, 1600))]);
    open = false;
    document.body.classList.remove('ev-open');
    frame.setAttribute('aria-hidden', 'true'); frame.tabIndex = -1;
    window.focus(); btn.blur();
    if (next) setTimeout(() => app().next(), 650);
  }

  btn.addEventListener('click', e => { e.stopPropagation(); show(); });
  addEventListener('message', e => { if (e.origin === location.origin && e.data && e.data.synmap === 'back') hide(e.data.next); });
  // 겹판이 열려 있으면 발표 단축키는 막고 돌아가기로만 쓴다(초점이 발표 쪽에 남아 있을 때)
  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (open) {
      e.preventDefault(); e.stopImmediatePropagation();
      if (k === 'Escape' || k === 'PageUp' || k === 'Backspace' || k === 'ArrowLeft') hide();
      else if (k === 'PageDown' || k === 'ArrowRight' || k === ' ' || k === 'Enter') hide(true);
      return;
    }
    if ((k === 'g' || k === 'G') && cur()) { e.preventDefault(); e.stopImmediatePropagation(); show(); }
  }, true);
})();
