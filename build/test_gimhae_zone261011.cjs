// Confirmed zone (2026-10-11): derived analysis must match the counts the other rooms publish (923동·91.7%·294곳).
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
const Z=JSON.parse(fs.readFileSync(path.join(root,'data/gimhae-zone-261011.json')));
assert.equal(crypto.createHash('sha256').update(rawText).digest('hex'),Z.embeddedDataSHA256,'zone counts were made from this page data');
assert.equal(Z.version,'2026-10-11-confirmed');assert.equal(Z.area,217510);assert.equal(Z.blocks,26);
const classify=vm.runInNewContext(html.slice(html.indexOf('const RESPU='),html.indexOf('D.bld.features.forEach(f=>{f.properties.cl=classify'))+'\nclassify;');
const edges=new Set(Z.edgeBuildingIndices);
// 구역 안 분류는 용도지역 무관(zone261011_base.py) — 같은 규칙을 이 페이지 classify 로 다시 계산해 대조한다(ec 를 1로 두면 상업·준주거 조건만 빠진다)
const zoneCl=p=>p.sc>0?'biz':classify({...p,ec:1});
for(const i of Z.buildingIndices){const p=D.bld.features[i].properties;if(p.sc===0)assert.equal(Z.emptyShop.cls[i],zoneCl(p),'zone class '+i);else assert.ok(!(i in Z.emptyShop.cls));}
const buildings=Z.buildingIndices.map(i=>({...D.bld.features[i],properties:{...D.bld.features[i].properties,cl:zoneCl(D.bld.features[i].properties),bidx:i,inside:true,edge:edges.has(i)}}));
const stores=Z.storeIndices.map(i=>({...D.store[i],sid:i}));
const a=I.summarize(buildings,stores);
assert.equal(a.total,923);assert.equal(a.known,840);assert.equal(a.old20,770);assert.equal(a.oldPct,91.7);
assert.equal(stores.length,294);assert.equal(a.industries.reduce((n,[,v])=>n+v,0),294);
assert.equal(a.counts.all,923);assert.equal(a.counts.unknown,83);assert.equal(a.counts.edge,Z.stats.edgeInside);
assert.equal(new Set(Z.buildingIndices).size,923);
for(const [group,n] of Object.entries(a.counts))assert.equal(I.filterBuildings(buildings,{group}).length,n);
assert.equal(Z.sites.length,13);assert.ok(Z.sites.every(s=>s.inside),'all 13 city sites inside');
assert.deepEqual(Z.sites.map(s=>s.rank),[1,2,3,4,5,6,7,8,9,10,11,12,13]);
assert.ok(!/의향|매매 의사|생각해 봄|수도|연체|체납|보증금|억/.test(JSON.stringify(Z.sites)),'public-safe site wording');
assert.equal(Math.min(...Z.sites.map(s=>s.edgeM)),10.1,'nearest site to edge (12번 7-12) matches the other rooms');
// Re-collected vacancy signals (2026-10-13) — all inside, public-safe wording.
function pip(q,r){let b=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const A=r[i],C=r[j];if(((A[1]>q[1])!==(C[1]>q[1]))&&(q[0]<(C[0]-A[0])*(q[1]-A[1])/(C[1]-A[1])+A[0]))b=!b;}return b;}
const ring=Z.boundary.geometry.coordinates[0],V=Z.vacancy;
assert.equal(V.localdata.signals.length,32);assert.equal(V.sbiz.vanished.length,22);assert.equal(V.sbiz.vanishedDupRemoved,1);
assert.equal(new Set(V.sbiz.vanished.map(x=>x.kind+'|'+x.address+'|'+x.floor+'|'+x.lnglat)).size,V.sbiz.vanished.length,'no duplicate vanished store');assert.ok(V.sbiz.vanished.every(x=>!('name' in x))&&V.localdata.signals.every(x=>!('names' in x)),'공개 JSON 상호 없음');assert.equal(V.sbiz.latest,'2026-06');assert.equal(V.sbiz.inside,294);
assert.ok(V.localdata.signals.every(x=>pip(x.lnglat,ring))&&V.sbiz.vanished.every(x=>pip(x.lnglat,ring)),'signals inside the confirmed zone');
assert.ok(!/보증금|권리금|만 ?원|억/.test(JSON.stringify(V)),'no advertised prices on the public page');
assert.ok(Z.sites.every(t=>t.officialPrice&&t.officialPrice.ym==='2026/01'&&t.officialPrice.wonPerM2>0),'13 official land prices');
assert.equal(Z.sites.find(t=>t.rank===12).officialPrice.wonPerM2,1352000,'spot-checked on 토지이음 (봉황동 7-12)');
assert.ok(Z.context.roads.totalM>0&&Z.context.gates.total>0&&Z.context.rail.length>0,'context recomputed');
// Earlier rooms' material brought onto the confirmed zone (2026-10-13 2차).
assert.equal(Z.ledger.buildings,583);assert.equal(Z.ledger.old20Pct,87.3);assert.ok(Z.ledger.old20Pct>=50,'ledger-based ageing requirement');
assert.equal(Z.linkage.tourRoutes,20);assert.equal(Z.linkage.tourRoutesThroughZone,0);assert.equal(Z.linkage.zoneIn10min,56.5);
assert.ok(Z.sites.every(t=>t.photo&&fs.existsSync(path.join(root,t.photo))),'13 site photos shipped');
assert.ok(Z.sites.filter(t=>t.ledger).length===10&&Z.sites.filter(t=>!t.ledger).map(t=>t.rank).join()==='9,10,11','ledger for 10 sites, none for bare land 9·10·11');
assert.ok(Z.fieldVoice&&Z.fieldVoice.themes.length>=1,'field voice');
assert.ok(Z.sites.every(t=>(t.floorsDetail||[]).every(f=>f.floor||f.use||f.areaM2)),'no empty floor rows');assert.ok(Z.sites.filter(t=>!t.ledger).every(t=>!(t.floorsDetail||[]).length),'bare land has no floor rows');
assert.deepEqual(JSON.parse(JSON.stringify(Z.survey.counts)),{A:8,B:68,C:7,D:150,E:304},'전수조사 1차 판정 537지번');assert.equal(Z.survey.points.features.length,537);
assert.equal(Z.requirements.items.length,17);assert.ok(Z.terrain&&Z.terrain.parcels===763&&Z.terrain.flatPct===94);
assert.equal(Z.vacancy.survey0919.total,35);assert.equal(Z.vacancy.survey0919.liveInside,0);
assert.ok(!/소유|의향|보증금|만 ?원|억|kWh|남실장|010-/.test(JSON.stringify({s:Z.survey,v:Z.vacancy.survey0919})),'public-safe survey layers');
assert.ok(!/대장 미확보/.test(JSON.stringify(Z.sites.filter(t=>t.ledger))),'stale ledger note removed');
assert.ok(!/소유|의향|보증금|만 ?원|억|남실장|010-/.test(JSON.stringify({l:Z.ledger,f:Z.fieldVoice,s:Z.sites.map(t=>[t.ledger,t.floorsDetail,t.prevHub])})),'public-safe additions');
// 원래 환경분석맵 분석을 확정 구역계로 다시 계산(2026-10-13 3차)
assert.equal(a.counts.candidate,130);assert.equal(Z.emptyShop.any.shop,130);assert.equal(Z.emptyShop.orig.shop,Z.buildingIndices.filter(i=>classify(D.bld.features[i].properties)==='shop').length);assert.equal(Z.emptyShop.orig.shop,30);
const zk=JSON.parse(html.match(/const ZK_SHOP=(\[[\d,]*\]);/)[1]);assert.deepEqual(zk,Z.emptyShop.shopIndices,'정비 시나리오 후보 = 구역 빈 점포 후보');
const BT=Z.bizTimeline;assert.equal(BT.records,439);assert.equal(BT.open.reduce((x,y)=>x+y,0),439);assert.equal(BT.close.reduce((x,y)=>x+y,0),BT.closedAll);
const yi=y=>BT.years.indexOf(y);assert.deepEqual([2024,2025,2026].map(y=>[BT.open[yi(y)],BT.close[yi(y)]]),[[16,21],[15,17],[13,15]]);assert.equal(BT.lifespan.within3yPct,35.2);
for(const y of [2019,2020,2021,2022,2023,2024,2025,2026])assert.deepEqual([BT.open[yi(y)],BT.close[yi(y)]],[V.localdata.byYear[y].open,V.localdata.byYear[y].close],'same LOCALDATA year '+y);
assert.equal(Z.rone.overlapPct,10.7);assert.equal(Z.rone.oldOverlapPct,98.8);assert.equal(Z.rone.storesIn,44);assert.equal(Z.rone.latest.smallVacancyPct,13.7);
assert.equal(Z.gateLoad.list.reduce((x,g)=>x+g.stores,0),294);assert.equal(Z.tms.within1km,2);assert.deepEqual(Z.tms.nearest.slice(0,2).map(t=>t.distM),[401,955],'EPSG:5187 직선 최단거리');assert.equal(BT.records,BT.openNow+BT.closedAll+BT.otherStatus);
const RV=Z.roadview;assert.equal(RV.jibun,81);assert.equal(Object.keys(RV.byJibun).length,81);assert.equal(RV.empty2025.length,7);assert.deepEqual(RV.lowConf2025,['봉황동 222-2']);assert.ok(!RV.empty2025.includes('봉황동 214-1'),'B33 판단 불가');assert.deepEqual(RV.empty2022and2025,['봉황동 118-16','봉황동 16-35']);
assert.ok(Z.sites.every(t=>RV.byJibun[t.jibun]),'13 sites have roadview');assert.ok(!/evidence|010-|보증금/.test(JSON.stringify(RV)),'roadview public-safe');
const FA=JSON.parse(html.match(/^const FACTS=(.*?);\s*$/m)[1]);assert.equal(FA.filter(f=>f.z==='261011').length,13);assert.ok(!/남실장|대표 제공|보증금|010-/.test(JSON.stringify(FA)),'cards public-safe');
assert.ok(html.includes('<!--zk-rone-->')&&html.includes('<!--zk-l9-->'),'rone notes on original page');
assert.ok(!/직접 측정치|수요가 빠졌다|민간 자율 회복|상권코드 A1705|실거래는 대한민국에 존재하지|제도적으로 존재하지 않는다/.test(html),'부동산원·실거래 단정 문장 제거');
const AC=JSON.parse(fs.readFileSync(path.join(root,'build/ask_cards/gimhae-wondosim.json'),'utf8'));assert.equal(JSON.stringify(AC.cards),JSON.stringify(FA),'질문 카드 원본 = 화면 카드');
const LA=Z.licenseAll;assert.equal(LA.insideOpen,365);assert.equal(LA.storeRecords,688);const ly=y=>LA.years.indexOf(y);assert.deepEqual([2016,2018,2019,2023,2025,2026].map(y=>LA.storeBand.active[ly(y)]),[32,46,62,92,96,93]);assert.equal(Math.max(...LA.store.active),245);
assert.equal(Z.heritage.unionPct,99.99);assert.ok(Z.heritage.layers.find(l=>/허용기준/.test(l.name)).overlapPct===93.5);assert.equal(Z.sbizZone.items[0].zonePct,39.6);assert.equal(Z.kakaoPlace.total,183);
assert.equal(Z.energy.withData,155);assert.equal(Z.energy.fullMonths+Z.energy.partialMonths,155);assert.ok(Z.timeline.events.some(e=>e.title.startsWith('봉황대협동조합')));assert.ok(!/코덱스|클로드|Claude|Codex/.test(JSON.stringify(Z)),'내부 도구 이름 없음');
const LU=Z.landUse537;assert.equal(LU.done,530);assert.equal(LU.price.n,533);assert.equal(LU.price.median,725300);assert.equal(LU.road['저촉'],35);assert.equal(LU.hazard.count,43);assert.equal(LU.heritagePct,99.8);assert.equal(LU.partial,false);
const FX=JSON.parse(fs.readFileSync(path.join(root,'data/gimhae-zone-261011-facts.json'),'utf8')).facts;assert.equal(FX.length,29);assert.ok(!/남실장|대표 제공|보증금|권리금|010-|의향|체납|직접 측정|수요가 빠졌/.test(JSON.stringify(FX)),'누리집용 사실 묶음 공개 안전');
console.log(JSON.stringify({total:a.total,known:a.known,old20:a.old20,oldPct:a.oldPct,counts:a.counts,foodRetail:a.foodRetail,foodRetailPct:a.foodRetailPct,residential:a.residential,neighborhood:a.neighborhood,candidateEdge:a.candidateEdge,industries:a.industries}));
console.log('PASS: confirmed zone 923동 · 840 known · 770 old · 91.7% · 294 stores · 13 sites inside · source hash · 빈 점포 후보 130(원래 규칙 30) · 인허가 439건 · 상권 겹침 10.7% · 로드뷰 81지번 · 카드 9');
