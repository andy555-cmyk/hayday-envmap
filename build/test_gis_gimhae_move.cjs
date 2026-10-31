// 김해 원도심 「보행·교통」 실측 자료(data/gimhae-move.js)와 GIS 연결 점검 — node build/test_gis_gimhae_move.cjs
const fs = require('fs'), path = require('path'), assert = require('assert');
const R = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(R, 'data/gimhae-move.js'), 'utf8');
const w = {}; new Function('window', src)(w);
const G = w.__GMOVE__;
assert(G, 'gimhae-move.js 가 __GMOVE__ 를 만들지 않음');
// 경전철 — 원도심 역이 다 있고 시간대 24칸, 2025 평일 244일·주말 121일
const names = G.lrt.st.map(s => s.n);
for (const n of ['봉황역', '부원역', '김해시청역', '수로왕릉역', '박물관역']) assert(names.includes(n), n + ' 없음');
assert.strictEqual(G.lrt.nwd, 244); assert.strictEqual(G.lrt.nwe, 121);
for (const s of G.lrt.st) { assert.strictEqual(s.wd.length, 24); assert.strictEqual(s.we.length, 24); assert(s.wd.reduce((a, b) => a + b) > 1000, s.n); }
// 버스 — 원도심 정류장이 번호로 붙었고, 좌표는 범위 안
assert(G.bus.st.length >= 200, '정류장 ' + G.bus.st.length);
for (const s of G.bus.st) { assert(/^\d+$/.test(s.c)); assert(s.x > 128.86 && s.x < 128.91 && s.y > 35.21 && s.y < 35.26, s.n); }
assert(G.bus.st.some(s => s.c === '1193' && s.n === '부원역'), '부원역(1193) 정류장 없음');
// 유동인구 — 회현동·부원동 포함, 행정동 경계와 이름이 같다
const geoN = G.flow.geo.features.map(f => f.properties.n);
for (const n of ['회현동', '부원동']) { assert(geoN.includes(n)); assert(G.flow.dong[n].svc > 0); }
// 쇠퇴 요건 — 숫자 정본(행정동별 판정표)과 같은 판정
const D = G.decl.rows;
assert.deepStrictEqual([D['합계'].I1.met, D['합계'].I2.met, D['합계'].II1.met, D['합계'].II2.met], [true, true, true, true]);
assert.deepStrictEqual([D['회현동'].II1.met, D['회현동'].II2.met, D['부원동'].II1.met], [false, false, true]);
assert.strictEqual(D['합계'].I1.change_pct, -22.9);
// 공개 화면 금지어
for (const bad of ['217,510', '208,622', '대표', '남실장', '클로드', '코덱스', '피그마']) assert(!src.includes(bad), bad);
// GIS 가 이 파일을 김해에서만 곁들여 받고, 보행·교통·쇠퇴 판정에 쓴다
const html = fs.readFileSync(path.join(R, 'gis.html'), 'utf8');
assert(html.includes("extra:[{has:() => window.__GMOVE__, file:'data/gimhae-move.js?v="));
assert(html.includes("const GM = () => (REGION === 'gimhae' && window.__GMOVE__) || null;"));
assert(html.includes('function declineGimhae(p20)'));
assert(!html.includes('김해 원도심에는 보행·도시철도 실측 자료가 아직 없습니다') || html.includes("if (MODE === 'move' && GM())"));
console.log('ok — 경전철', G.lrt.st.length, '역 · 버스', G.bus.st.length, '곳 · 행정동', geoN.length);
