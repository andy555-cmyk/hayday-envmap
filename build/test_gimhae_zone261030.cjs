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
// 남은 「재수집 중」 칸 없음 — 다시 계산하지 않은 항목은 「자료 없음(이유)」로
assert.deepEqual(Z.pending,{},'pending emptied');assert.ok(!('vacancy' in Z),'old-shape vacancy not used');
assert.ok(Z.missing.length>=5&&Z.missing.every(m=>m.item&&m.reason),'missing items carry a reason');
// 새 구역 재수집 값(숫자정본표 2판 행 그대로)
const C=JSON.parse(fs.readFileSync(process.env.CANON||path.join(require('os').homedir(),'Library/CloudStorage/GoogleDrive-ganpan0@gmail.com/내 드라이브/hayday-hq/02_도시기획_로컬브랜딩/김해_초광역/구역계1안_확정_261030/숫자정본표_구역계1안_261030.json'),'utf8'));
const RC=Object.fromEntries(Z.recollect.groups.flatMap(g=>g.items).map(i=>[i.label,i.value]));
assert.equal(Z.recollect.groups.length,9);assert.equal(Object.keys(RC).length,38);
for(const [l,v] of [['등록점포 2026-06',440],['등록점포 2026-03',435],['가게형 9종 영업 중',233],['가게형 9종 2022년 이후 폐업',79],['208종 구역 안 기록',1554],['계량기',497],['건축인허가',243],['용도변경 허가',61],['철거·멸실',24],['구역 안 차량 도로',3674],['지번 월평균 중간값',2160.2],['개별공시지가 중간값',886500],['카카오맵 장소',269],['빈 점포 후보 건물',126],['장기공실 후보 지번(책상 판정 A+B)',61],['공실 신호 2개 이상 겹친 지번',8],['봉리단길(구역 북서 경계)',716],['경전철 3역 10분 도보권 겹침',51.7],['시 13곳 한 바퀴','1575m · 20분']])assert.deepEqual(RC[l],v,l);
const CV=new Set(C.rows.map(r=>JSON.stringify(r['새값'])));for(const [l,v] of Object.entries(RC))assert.ok(CV.has(JSON.stringify(v)),'canon value: '+l);
assert.equal(Z.recollect.edition,C.edition);
assert.ok(!/⑦|방 |남실장|대표|옛값|미발송/.test(JSON.stringify(Z.recollect)),'recollect public-safe');
// 공실 신호 레이어 — 켜고 끄기 7종, 겹침 8지번, 사용량·상호 없음
const SM=Z.signalMap,cnt=k=>SM.points.features.filter(f=>f.properties.k===k).length;
assert.deepEqual(SM.layers.map(l=>[l.k,l.n]),[['ab',61],['c',5],['closed',38],['vanished',30],['water',11],['elec',5],['overlap',8]]);
for(const l of SM.layers)assert.equal(cnt(l.k),l.n,l.k);
assert.equal(SM.hiddenWater,5);assert.equal(SM.layers[5].n,RC['월평균 100kWh 이하 지번']);assert.equal(SM.layers[2].n,RC['빈 점포 신호(폐업 자리에 새 영업 없음)']);
assert.equal(SM.layers.find(l=>l.k==='overlap').n,RC['공실 신호 2개 이상 겹친 지번']);
assert.ok(!/kWh\(|㎥|\d+\.\d+kWh|⑦|남실장|대표|010-/.test(JSON.stringify(SM)),'signal layer public-safe(no amounts)');
for(const f of SM.points.features)assert.ok(f.geometry.coordinates[0]>128.87&&f.geometry.coordinates[0]<128.89&&f.geometry.coordinates[1]>35.22&&f.geometry.coordinates[1]<35.24,'coords near zone');
// 인구 이동 — 정본표 합계·동별 값, 흐름선은 순유출만, 한계 문구
const CR=Object.fromEntries(C.rows.map(r=>[r['항목'],r['새값']])),PM=Z.popMove;
assert.ok(!Z.pending.popMove&&PM,'popMove filled');
assert.equal(PM.total.pop,CR['인구 — 회현동+부원동']);assert.equal(PM.total.forecast2031,CR['2031 인구 예측 — 회현동+부원동']);
assert.equal(PM.dongs['회현동'].summary.pop_latest,CR['인구 — 회현동']);assert.equal(PM.dongs['부원동'].summary.pop_latest,CR['인구 — 부원동']);
assert.equal(PM.dongs['회현동'].net,CR['순유출 — 회현동']);assert.equal(PM.dongs['부원동'].net,CR['순유출 — 부원동']);
assert.equal(PM.dongs['회현동'].yearly.at(-1).age20_39_pct,CR['20~39세 비중 — 회현동']);assert.equal(PM.dongs['부원동'].yearly.at(-1).age20_39_pct,CR['20~39세 비중 — 부원동']);
for(const d of ['회현동','부원동'])for(const c of PM.dongs[d].categories.filter(c=>c.category!=='울산'&&c.category!=='그 밖의 시도'))assert.ok(CR['전출 행선지 비율 — '+d].includes(c.category+' '+c.share_pct.toFixed(1)+'%'),d+' '+c.category);
assert.ok(PM.flows.features.length>=6&&PM.flows.features.every(f=>f.properties.net<0&&!['회현동','부원동'].includes(f.properties.name)),'flows = net outflow to other Gimhae dongs');
assert.ok(PM.limits.some(l=>l.includes('2023-01 이후 공개분')),'destination limit note');
const zk=JSON.parse(html.match(/const ZK_SHOP=(\[[\d,]*\]);/)[1]);assert.deepEqual(zk,Z.emptyShop?Z.emptyShop.shopIndices:[],'정비 시나리오 후보 = 구역 빈 점포 후보(재수집 전엔 없음)');
// 카드·질문 카드
const FA=JSON.parse(html.match(/^const FACTS=(.*?);\s*$/m)[1]);
assert.equal(FA.filter(f=>f.z==='1an').length,4);assert.equal(FA.filter(f=>f.z==='261011').length,0);
assert.ok(FA.find(f=>f.z==='1an'&&/208,778㎡\(20\.9ha\)/.test(f.a)));
assert.ok(FA.find(f=>f.z==='1an'&&/13곳 중 9곳 구역 안/.test(f.a)));
const AC=JSON.parse(fs.readFileSync(path.join(root,'build/ask_cards/gimhae-wondosim.json'),'utf8'));assert.equal(JSON.stringify(AC.cards),JSON.stringify(FA),'질문 카드 원본 = 화면 카드');
// 옛 구역 숫자·내부 흔적 없음
const pub=fs.readFileSync(path.join(root,'data/gimhae-b171.css'),'utf8')+html.replace(/<script id="dat2?" type="application\/json">.*?<\/script>/gs,'')+JSON.stringify(Z)+fs.readFileSync(path.join(root,'data/gimhae-b171.js'),'utf8')+fs.readFileSync(path.join(root,'data/gimhae-meeting.js'),'utf8')+fs.readFileSync(path.join(root,'data/gimhae-meeting.json'),'utf8');
for(const bad of ['21.8ha','21.75','217,510','217510','217,511','217,995','67,510','71,890','26개 블록','블록 26개','13곳 모두 포함','208,622','208622'])assert.ok(!pub.includes(bad),'old/forbidden: '+bad);
assert.ok(!/남실장|대표 제공|대표 확정|대표 결정|방 ⑦|010-|코덱스|클로드|Claude|Codex/.test(JSON.stringify(Z)+JSON.stringify(FA)),'no internal provenance');
assert.ok(fs.readFileSync(path.join(root,'data/gimhae-b171.css'),'utf8').includes("#lgd::after{content:'━ 확정 구역계(1안) 20.9ha · 2026-10-30'"),'legacy legend = 1안');
assert.ok(html.includes('gimhae-b171.js?v=zone261030-r22')&&html.includes('gimhae-meeting.js?v=1an-r22'),'cache versions');
// 13곳 임시 유지(10/30 대표) — 핀 13곳 같은 모양, 목록에 밖 표시·회색 없음, 「재배치」 문구 없음
const B=fs.readFileSync(path.join(root,'data/gimhae-b171.js'),'utf8'),M=fs.readFileSync(path.join(root,'data/gimhae-meeting.js'),'utf8');
assert.ok(B.includes("'circle-color':SITE_COLOR")&&!B.includes('b-site-out'),'13 pins same style, list unchanged');
assert.ok(!/재배치/.test(pub+JSON.stringify(FA)+fs.readFileSync(path.join(root,'data/gimhae-zone-261030-facts.json'),'utf8')),'no relocation wording');
assert.ok(B.includes("d.sites.length!==13"),'13 kept');
assert.ok(B.includes("addSource('bs-sig'")&&B.includes("b-sig-"),'signal layers wired');
// 전수조사·공실·도로·요건(B-01·B-02) — 정본표·재수집 결과 그대로
assert.deepEqual(Z.survey.counts,{A:8,B:53,C:5,D:219,E:198});assert.equal(Z.survey.points.features.length,483);assert.equal(Z.survey.counts.A+Z.survey.counts.B,CR['장기공실 후보(A+B) 지번']);
const V=Z.vac1an;assert.deepEqual(V.funnel.map(x=>x.count),[440,38,4,2,1],'공실 거르기 단계');assert.deepEqual([V.timeline.total,V.timeline.eligibleNow,V.timeline.watch],[77,26,20]);
assert.deepEqual([V.signals.emptyBld,V.signals.closed,V.signals.ab,V.signals.overlap,V.signals.water,V.signals.elecLow,V.listings.inside],[CR['빈 점포 후보 건물(용도·영업 규칙)'],CR['빈 점포 신호(폐업 뒤 새 영업 없음)'],61,CR['공실 신호 2개 이상 지번'],CR['수도 미사용·최근 중단 지번'],CR['전기 — 월평균 100kWh 이하 지번'],CR['공개 매물(상가·사무실·건물) 구역 안']]);
assert.equal(Z.context.roads.totalM,CR['구역 안 도로 길이(OSM 차량 도로)']);assert.deepEqual(Z.context.rail.map(t=>t.distM),[CR['부원역 → 구역 거리'],CR['봉황역 → 구역 거리']]);
assert.equal(Z.requirements.items.length,17);assert.ok(Z.requirements.items.find(r=>r.id==='r3').now.includes('208,778㎡'),'요건 r3 = 1안 면적');
assert.ok(!/재수집 중|다시 모으는 중/.test(html.replace(/<script id="dat2?" type="application\/json">.*?<\/script>/gs,'')+fs.readFileSync(path.join(root,'data/gimhae-b171.js'),'utf8')),'no 「재수집 중」 boxes left');
{const B=fs.readFileSync(path.join(root,'data/gimhae-b171.js'),'utf8');assert.ok(B.includes(`\${data.survey?'<a href="#b-survey">전수조사</a>':''}`),'survey link only when data.survey');assert.ok(B.includes('function vac1anSection')&&B.includes('function missingSection'),'1안 vacancy + missing sections');assert.ok(B.includes("map.on('moveend',fitLabel)"),'zone label kept on screen');}
assert.ok(!html.includes('다시 계산 중')&&html.includes('이 상권과 31.4%만 겹친다</b>(등록점포 206/440곳(부원동 동쪽 새 블록)'),'R-ONE 상권 겹침 = 끝난 값(31.4%)');
assert.ok(html.includes('<link rel="icon" href="favicon.svg"')&&fs.existsSync(path.join(root,'favicon.svg')),'favicon');
// 박스 12(부동산원 상권)가 읽는 키가 하나라도 빠지면 1안 패널 전체가 「준비 실패」로 죽는다(10/31 공개 화면 사고)
for(const k of ['market','code','overlapPct','overlapM2','oldOverlapPct','storesIn','bldIn','sitesIn','others','latest','geometry','source'])assert.ok(Z.rone[k]!==undefined,'rone.'+k);
assert.ok(Z.rone.latest.smallVacancyPct===13.7&&Z.rone.latest.quarter==='2026.2Q'&&Z.rone.bldIn<=704,'rone values');
assert.ok(!('pendingNote' in Z)&&Z.decline.rows.length===3&&Z.extra1an.length>=8,'pendingNote 없음 · 쇠퇴 동별 · 보강 칸');
// ⑧-A 생활·환경·안전 칸 — 정본표 B 221~251행 문구 그대로(하천범람 236행 제외) · 정류장은 203행 · 관광 거리는 C행
{const L8=Object.fromEntries(Z.extra1an.map(x=>[x.label,x.value]));
for(const k of ['안전 시설(구역 안 · 경계 800m 안)','교통 시설','생활 SOC','관광·문화 자원','기상(김해 관측소)','대기질','교통사고(김해시 전체)'])assert.ok(L8[k],'⑧-A 칸 없음: '+k);
assert.ok(L8['안전 시설(구역 안 · 경계 800m 안)'].includes('CCTV 구역 안 26(전부 다목적)')&&L8['안전 시설(구역 안 · 경계 800m 안)'].includes('안전비상벨 구역 안 0 · 800m 안 45'),'⑧-A 안전');
assert.ok(L8['교통 시설'].startsWith('버스 정류장 구역 안 1곳(김해중부경찰서')&&L8['교통 시설'].includes('경계 도로변 10m 안 2곳'),'정류장은 203행');
assert.ok(L8['관광·문화 자원'].includes('봉황동 유적(봉황대공원) 260m · 수로왕릉 552m')&&!L8['관광·문화 자원'].includes('555m'),'관광 거리는 C행');
assert.ok(!JSON.stringify(Z.extra1an).match(/범람|침수/),'하천범람(236행) 쓰지 않음');}
assert.ok(!/원도심 3동/.test(JSON.stringify(Z.requirements))&&!/지적선 정리 예정/.test(JSON.stringify(Z.requirements)),'요건 r1·r2 최신 문구');
console.log('PASS: 1안 208,778㎡ · 704동 · 87.0% · 440곳 · 대장 516동 84.0% · 13곳 중 9곳 안(2·8·11·13 밖) · 정본표 2판 대조 · 재수집 38항목 · 공실 신호 레이어 7종(겹침 8) · 인구 이동(정본표 합계 대조) · 카드 4 · 전수조사 A~E(483) · 공실 거르기 440→38→4→2→1 · 요건 17 · 자료 없음 칸 · 옛 숫자 없음');
