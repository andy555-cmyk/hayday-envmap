// 김해 원도심 「생활·안전」(⑧-A) 층 자료(data/gimhae-life.js)와 GIS 연결 점검 — node build/test_gis_gimhae_life.cjs
// 숫자는 숫자정본표 B 203·227~246행 · C 관광 거리 행과 같아야 한다(빌드 스크립트가 표에서 읽어 넣는다)
const fs = require('fs'), path = require('path'), assert = require('assert');
const R = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(R, 'data/gimhae-life.js'), 'utf8');
const w = {}; new Function('window', src)(w);
const L = w.__GLIFE__;
assert(L, 'gimhae-life.js 가 __GLIFE__ 를 만들지 않음');
const n = (k, z) => L.p.filter(p => p.k === k && (z === undefined || p.z === z)).length;
// 정본 숫자 = 점 개수
assert.deepStrictEqual(L.c.cctv, [26, 466]); assert.strictEqual(n('cctv', 1), 26); assert.strictEqual(n('cctv', 0), 466);
assert(L.p.filter(p => p.k === 'cctv' && p.z === 1).every(p => p.s === 0), '구역 안 CCTV 는 전부 다목적');
assert.deepStrictEqual(L.c.bell, [0, 45]); assert.strictEqual(n('bell', 1), 0); assert.strictEqual(n('bell'), 45);
// 정류장 — 203행: 구역 안 1(김해중부경찰서) · 경계 도로변 2(금강병원 · 중앙지구대)
assert.deepStrictEqual(L.c.bus, [1, 2, 58, 62, 37]);
assert.deepStrictEqual(L.p.filter(p => p.k === 'bus' && p.z === 1).map(p => p.n), ['김해중부경찰서']);
assert.deepStrictEqual(L.p.filter(p => p.k === 'bus' && p.z === 2).map(p => p.n).sort(), ['금강병원', '중앙지구대']);
assert(L.p.filter(p => p.k === 'bus').every(p => p.r >= 1), '정류장마다 노선 수');
assert.deepStrictEqual(L.c.tour, [2, 35]); assert.strictEqual(n('tour', 1), 2); assert.strictEqual(n('cul'), 8);
// 관광 거리 — C행(봉황동 유적 260 · 수로왕릉 552)이 B 245행보다 먼저
const d = nm => (L.p.find(p => p.n === nm) || {}).d;
assert.strictEqual(d('김해 봉황동 유적'), 260); assert.strictEqual(d('봉황대공원'), 260); assert.strictEqual(d('김해수로왕릉'), 552);
assert.deepStrictEqual(L.c.hosp, [22, 63, 52, 185]); assert.strictEqual(n('hosp', 1), 22);
assert.deepStrictEqual(L.c.shel, [5, 32]); assert.deepStrictEqual(L.c.aed, [3, 40]); assert.deepStrictEqual(L.c.emer, [1, 0]);
assert.deepStrictEqual(L.c.play, [2, 35]); assert.deepStrictEqual(L.c.ev, [2, 4, 60, 317]); assert.deepStrictEqual(L.c.bike, [2, 23]);
assert.strictEqual(n('ev'), 62);
// 출처·기준일이 층마다 있다
for (const k of ['cctv', 'bell', 'bus', 'tour', 'cul', 'hosp', 'shel', 'dust', 'aed', 'emer', 'play', 'ev', 'bike'])
  assert(L.src[k] && /^\d{4}-\d{2}-\d{2}$/.test(L.src[k][1]), k + ' 출처·기준일');
// 개별 이름은 공공시설·정본표에 이름이 있는 것만 — 병·의원·충전소·놀이시설·대피시설·AED 이름 없음
for (const k of ['hosp', 'ev', 'play', 'shel', 'dust', 'aed', 'emer', 'bike', 'cctv', 'bell']) assert(L.p.filter(p => p.k === k).every(p => !p.n), k + ' 이름 노출');
assert(!L.p.some(p => p.k === 'tour' && /백화점|이마트|롯데마트|커피|국밥|호텔|안경/.test(p.n || '')), '관광공사 상점 이름 노출');
// 하천범람지도(236행)는 쓰지 않는다 · 공개 화면 금지어
for (const bad of ['범람', '침수', '208,622', '21.75', '217,510', '67,510', '869m', '재배치', '대표', '남실장', '클로드', '코덱스', '피그마']) assert(!src.includes(bad), bad);
// GIS 가 김해에서만 곁들여 받고 「생활·안전」 모드로 띄운다
const html = fs.readFileSync(path.join(R, 'gis.html'), 'utf8');
assert(html.includes("{has:() => window.__GLIFE__, file:'data/gimhae-life.js?v="));
assert(html.includes("const GL = () => (REGION === 'gimhae' && window.__GLIFE__) || null;"));
assert(html.includes('data-mode="life"') && html.includes("life: '생활·안전'"));
assert(html.includes('body:not([data-region="gimhae"]) #modes [data-mode="life"]{display:none}'));
assert(html.includes("map.addLayer({id: 'ov_life_c'") && html.includes("vis('ov_life_c', MODE === 'life'"));
assert(html.includes('function lifeKpi()'));
console.log('ok — 생활·안전 점', L.p.length, '· CCTV', n('cctv'), '· 정류장', n('bus'), '· 관광', n('tour'));
