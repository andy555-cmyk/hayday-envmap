// Confirmed zone 1안 (2026-10-30, 208,778㎡): screen numbers = 숫자정본표 1판(704동·87.0%·440곳·9/13), old-zone numbers gone.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.join(__dirname,'..');
const I=require('../data/gimhae-b-insights.js');
const html=fs.readFileSync(path.join(root,'gimhae-wondosim.html'),'utf8');
const rawText=html.match(/<script id="dat" type="application\/json">(.*?)<\/script>/s)[1];
const D=JSON.parse(rawText);
const Z=JSON.parse(fs.readFileSync(path.join(root,'data/gimhae-zone-261030.json')));
assert.equal(crypto.createHash('sha256').update(rawText).digest('hex'),Z.embeddedDataSHA256,'zone counts were made from this page data');
assert.equal(Z.version,'2026-10-30-zone1an');assert.equal(Z.id,'zone1an');assert.equal(Z.area,208778);assert.equal(Z.areaHa,20.9);assert.equal(Z.confirmed,'2026-10-30');
assert.equal(Z.boundary.geometry.coordinates[0].length,21,'정본 꼭짓점 20개(닫힘 포함 21) 그대로');
assert.equal(Z.compare.zoneK.properties.n,'옛 확정 구역계(10/11)');
const classify=vm.runInNewContext(html.slice(html.indexOf('const RESPU='),html.indexOf('D.bld.features.forEach(f=>{f.properties.cl=classify'))+'\nclassify;');
const edges=new Set(Z.edgeBuildingIndices);
const buildings=Z.buildingIndices.map(i=>({...D.bld.features[i],properties:{...D.bld.features[i].properties,cl:classify(D.bld.features[i].properties),bidx:i,inside:true,edge:edges.has(i)}}));
const stores=Z.storeIndices.map(i=>({...D.store[i],sid:i}));
const a=I.summarize(buildings,stores);
// 숫자정본표 1판(방 ①) 값 — 엔진 재계산과 같아야 하고, 화면은 이 값만 쓴다
assert.equal(Z.statsSource,'canon');
assert.equal(a.total,704);assert.equal(a.total,Z.stats.buildings);assert.equal(a.known,Z.stats.knownYear);assert.equal(a.old20,Z.stats.old20);assert.equal(a.oldPct,87.0);assert.equal(Z.stats.oldPct,87);
assert.equal(stores.length,440);assert.equal(Z.stats.stores,440);assert.equal(new Set(Z.buildingIndices).size,704);assert.equal(a.counts.edge,Z.stats.edgeInside);
for(const [group,n] of Object.entries(a.counts))assert.equal(I.filterBuildings(buildings,{group}).length,n);
assert.equal(Object.values(Z.stats.uses).reduce((x,y)=>x+y,0),704);assert.equal(Z.stats.uses['제1종 근린생활'],88);assert.equal(Z.stats.uses['숙박·위락·관광'],27);
assert.deepEqual(JSON.parse(JSON.stringify(Z.relation)).over150k,58778);
assert.deepEqual([Z.relation.oldZoneOverlap,Z.relation.oldZoneOnly,Z.relation.newOnly,Z.relation.blueOverlap],[98497,119013,110125,68795],'정본표 면적');
assert.deepEqual([Z.ledger.buildings,Z.ledger.known,Z.ledger.old20,Z.ledger.old20Pct,Z.ledger.parcels],[516,513,431,84.0,481],'대장 기준 노후도 = 정본표');
assert.equal(Z.perimeterM,1996);
// 13곳 — 9곳 안 · 4곳 밖(지우지 않고 표시만)
assert.equal(Z.sites.length,13);assert.deepEqual(Z.sites.map(s=>s.rank),[1,2,3,4,5,6,7,8,9,10,11,12,13]);
assert.deepEqual(Z.sites.filter(s=>s.inside).map(s=>s.rank),[1,3,4,5,6,7,9,10,12]);
assert.deepEqual(Z.sites.filter(s=>!s.inside).map(s=>s.rank),[2,8,11,13]);
assert.ok(Z.sites.filter(s=>!s.inside).every(s=>s.zoneStatus==='구역 밖(새 대상지 선정 전 임시 유지)'));
assert.equal(Math.round(Math.min(...Z.sites.filter(s=>s.inside).map(s=>s.edgeM))),36,'12번 36m = 정본표');
function pip(q,r){let b=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const A=r[i],C=r[j];if(((A[1]>q[1])!==(C[1]>q[1]))&&(q[0]<(C[0]-A[0])*(q[1]-A[1])/(C[1]-A[1])+A[0]))b=!b;}return b;}
const ring=Z.boundary.geometry.coordinates[0];
for(const s of Z.sites)assert.equal(pip(s.lnglat||s.coordinates||s.ll,ring),s.inside,'site '+s.rank);
assert.ok(!/의향|매매 의사|생각해 봄|수도|연체|체납|보증금|억/.test(JSON.stringify(Z.sites)),'public-safe site wording');
// 재수집 전 자료는 비워 두고 「재수집 중」 — 옛 구역 숫자를 싣지 않는다
for(const k of ['vacancy','linkage','survey','emptyShop','roadview','rone','context'])assert.ok(k in Z||Z.pending[k],'absent data must be listed as pending: '+k);
assert.ok(!('vacancy' in Z)&&Z.pending.vacancy,'vacancy pending until re-collected');
const zk=JSON.parse(html.match(/const ZK_SHOP=(\[[\d,]*\]);/)[1]);assert.deepEqual(zk,Z.emptyShop?Z.emptyShop.shopIndices:[],'정비 시나리오 후보 = 구역 빈 점포 후보(재수집 전엔 없음)');
// 카드·질문 카드
const FA=JSON.parse(html.match(/^const FACTS=(.*?);\s*$/m)[1]);
assert.equal(FA.filter(f=>f.z==='1an').length,4);assert.equal(FA.filter(f=>f.z==='261011').length,0);
assert.ok(FA.find(f=>f.z==='1an'&&/208,778㎡\(20\.9ha\)/.test(f.a)));
assert.ok(FA.find(f=>f.z==='1an'&&/13곳 중 9곳 구역 안/.test(f.a)));
const AC=JSON.parse(fs.readFileSync(path.join(root,'build/ask_cards/gimhae-wondosim.json'),'utf8'));assert.equal(JSON.stringify(AC.cards),JSON.stringify(FA),'질문 카드 원본 = 화면 카드');
// 옛 구역 숫자·내부 흔적 없음
const pub=html.replace(/<script id="dat2?" type="application\/json">.*?<\/script>/gs,'')+JSON.stringify(Z)+fs.readFileSync(path.join(root,'data/gimhae-b171.js'),'utf8')+fs.readFileSync(path.join(root,'data/gimhae-meeting.js'),'utf8')+fs.readFileSync(path.join(root,'data/gimhae-meeting.json'),'utf8');
for(const bad of ['21.8ha','21.75','217,510','217510','217,511','217,995','67,510','71,890','26개 블록','블록 26개','13곳 모두 포함','208,622','208622'])assert.ok(!pub.includes(bad),'old/forbidden: '+bad);
assert.ok(!/남실장|대표 제공|대표 확정|대표 결정|방 ⑦|010-|코덱스|클로드|Claude|Codex/.test(JSON.stringify(Z)+JSON.stringify(FA)),'no internal provenance');
assert.ok(html.includes('gimhae-b171.js?v=zone261030-r2')&&html.includes('gimhae-meeting.js?v=1an-r2'),'cache versions');
// 13곳 임시 유지(10/30 대표) — 핀 13곳 같은 모양, 목록에 밖 표시·회색 없음, 「재배치」 문구 없음
const B=fs.readFileSync(path.join(root,'data/gimhae-b171.js'),'utf8'),M=fs.readFileSync(path.join(root,'data/gimhae-meeting.js'),'utf8');
assert.ok(B.includes("'circle-color':SITE_COLOR")&&!B.includes('b-site-out'),'13 pins same style, list unchanged');
assert.ok(!/재배치/.test(pub+JSON.stringify(FA)+fs.readFileSync(path.join(root,'data/gimhae-zone-261030-facts.json'),'utf8')),'no relocation wording');
assert.ok(B.includes("d.sites.length!==13"),'13 kept');
console.log('PASS: 1안 208,778㎡ · 704동 · 87.0% · 440곳 · 대장 516동 84.0% · 13곳 중 9곳 안(2·8·11·13 밖) · 정본표 1판 대조 · 카드 4 · 옛 숫자 없음');
