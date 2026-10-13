const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const data=require('../data/gimhae-meeting.json');
const Z=require('../data/gimhae-zone-261011.json');
const script=fs.readFileSync(path.join(__dirname,'../data/gimhae-meeting.js'),'utf8');
new vm.Script(script);
assert.ok(!/<\/option\s/.test(script),'option closing tags cannot have attributes');
function inside(q,r){let b=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],c=r[j];if(((a[1]>q[1])!==(c[1]>q[1]))&&(q[0]<(c[0]-a[0])*(q[1]-a[1])/(c[1]-a[1])+a[0]))b=!b;}return b;}
assert.equal(data.version,'2026-10-13-v3');assert.equal(data.vacancyTotal,null);
assert.equal(data.places.length,25);assert.equal(new Set(data.places.map(p=>p.id)).size,25);
assert.equal(data.places.filter(p=>p.source==='city').length,13);
assert.equal(data.places.filter(p=>p.source==='official').length,6);
assert.equal(data.places.filter(p=>p.source==='research').length,6);
assert.deepEqual(data.places.filter(p=>/지금 광고 중/.test(p.status)).map(p=>p.id),['자5','자6'],'10/13 live listings');
assert.ok(['자1','자3'].every(id=>data.places.find(p=>p.id===id).status.startsWith('광고 숨김'))&&['자2','자4'].every(id=>data.places.find(p=>p.id===id).status.startsWith('상세 페이지 없음')),'10/1 ads re-checked, not over-claimed');
assert.equal(data.places.filter(p=>p.coordinates).length,23);
assert.deepEqual(data.places.filter(p=>!p.coordinates).map(p=>p.id),['자2','자4']);
const ring=Z.boundary.geometry.coordinates[0];
for(const p of data.places){assert.ok(p.evidence&&p.checked&&p.status&&p.detail,p.id);assert.ok(!('insideB' in p),p.id+' old field removed');if(p.coordinates){assert.equal(inside(p.coordinates,ring),p.inside,p.id+' boundary membership');}else assert.equal(p.inside,null);for(const key of ['sourceUrl','mapUrl'])if(p[key])assert.equal(new URL(p[key]).protocol,'https:');}
assert.deepEqual(data.places.filter(p=>p.inside===false).map(p=>p.id),['자3','자6']);
// City sites mirror the zone file (rank order, same point) and carry no public-banned wording.
assert.deepEqual(data.places.filter(p=>p.source==='city').map(p=>[p.rank,p.address,p.coordinates]),Z.sites.map(t=>[t.rank,t.jibun,t.lnglat]));
assert.ok(!/의향|매매 의사|생각해 봄|수도|연체|체납|남실장|대표 제공|대표님|실장님|보증금|월세 \d|만원|억원|권리금/.test(JSON.stringify(data)),'public page: no prices, owner intent, utility arrears or internal names');
assert.ok(data.places.find(p=>p.id==='공6').detail.includes('시 우선순위 2번'));
assert.ok(data.places.find(p=>p.id==='시2').detail.includes('공6'));
assert.ok(!/B 검토선|B권역|B 포함/.test(JSON.stringify(data)),'no stale B wording');
assert.equal(data.ideas.length,3);assert.equal(data.schedule.length,5);
// Run the real filtering function independently of the map/DOM.
const code=script.slice(script.indexOf('  function filtered()'),script.indexOf('  function frame()'));
const values={'meeting-source':'all','meeting-zone':'all','meeting-query':''};
const context={data,$:id=>({value:values[id]})};
const run=()=>vm.runInNewContext(code+'filtered().map(p=>p.id)',context).join(',');
assert.equal(run(),'시1,시2,시3,시4,시5,시6,시7,시8,시9,시10,시11,시12,시13,공1,공2,공3,공4,공5,공6,자1,자2,자3,자4,자5,자6');
values['meeting-source']='research';assert.equal(run(),'자1,자2,자3,자4,자5,자6');
values['meeting-zone']='unknown';assert.equal(run(),'자2,자4');
values['meeting-zone']='inside';assert.equal(run(),'자1,자5');
values['meeting-zone']='outside';assert.equal(run(),'자3,자6');
values['meeting-source']='official';values['meeting-zone']='inside';assert.equal(run(),'공1,공2,공3,공4,공5,공6');
values['meeting-source']='city';values['meeting-zone']='outside';assert.equal(run(),'');
values['meeting-source']='all';values['meeting-zone']='all';values['meeting-query']='270';assert.equal(run(),'공3,공4,공5');
values['meeting-query']='182';assert.equal(run(),'시2,공6');
values['meeting-query']='없는주소123';assert.equal(run(),'');
// Pin de-overlap: deterministic, separates every pair, leaves isolated pins at their true point.
const lay=script.slice(script.indexOf('  function layout()'),script.indexOf('  const offsetOf='));
values['meeting-source']='all';values['meeting-query']='';
const proj=c=>({x:(c[0]-128.874)*90950,y:(35.233-c[1])*111320}); // ≈ zoom 17 (about 1 m per pixel)
const BOX={city:[17,17],official:[23,21],research:[23,21]};const ctx2={data,$:id=>({value:values[id]}),map:{project:proj},BOX,offsets:new Map(),Math};
vm.runInNewContext(code+lay+'layout();result=offsets;',ctx2);
// Real drawn sizes: round 32px, square 44×40px.
const SIZE={city:[16,16],official:[22,20],research:[22,20]};
const pts=data.places.filter(p=>p.coordinates).map(p=>{const q=proj(p.coordinates),o=ctx2.result.get(p.id);return {id:p.id,x:q.x+o[0],y:q.y+o[1],w:SIZE[p.source][0],h:SIZE[p.source][1]};});
let worst=Infinity,pair='';for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const a=pts[i],b=pts[j];const gap=Math.max(Math.abs(a.x-b.x)-(a.w+b.w),Math.abs(a.y-b.y)-(a.h+b.h));if(gap<worst){worst=gap;pair=a.id+'-'+b.id;}}
assert.ok(worst>=0,'pin boxes must not overlap at zoom 17 (worst '+pair+' '+worst.toFixed(1)+'px)');
assert.equal(JSON.stringify(ctx2.result.get('자3')),'[0,0]','an isolated pin stays on its point');
for(const k of [0.5,2]){ // zoom 16 and 18
  const pk=c=>({x:proj(c).x*k,y:proj(c).y*k});const c3={data,$:id=>({value:values[id]}),map:{project:pk},BOX,offsets:new Map(),Math};
  vm.runInNewContext(code+lay+'layout();result=offsets;',c3);
  const q=data.places.filter(p=>p.coordinates).map(p=>{const z=pk(p.coordinates),o=c3.result.get(p.id);return {x:z.x+o[0],y:z.y+o[1],w:SIZE[p.source][0],h:SIZE[p.source][1]};});
  for(let i=0;i<q.length;i++)for(let j=i+1;j<q.length;j++)assert.ok(Math.max(Math.abs(q[i].x-q[j].x)-(q[i].w+q[j].w),Math.abs(q[i].y-q[j].y)-(q[i].h+q[j].h))>=0,'overlap at scale '+k);
}
console.log('PASS: 25 source-separated records (city 13 / official 6 / research 6), confirmed-zone membership, 10/13 re-check, public wording, 10 filter cases, pin boxes apart (worst gap '+worst.toFixed(1)+'px '+pair+')');
