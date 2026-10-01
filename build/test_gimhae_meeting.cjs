const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const data=require('../data/gimhae-meeting.json');
const B=require('../data/gimhae-b171.json');
const script=fs.readFileSync(path.join(__dirname,'../data/gimhae-meeting.js'),'utf8');
new vm.Script(script);
assert.ok(!/<\/option\s/.test(script),'option closing tags cannot have attributes');
function inside(q,r){let b=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],c=r[j];if(((a[1]>q[1])!==(c[1]>q[1]))&&(q[0]<(c[0]-a[0])*(q[1]-a[1])/(c[1]-a[1])+a[0]))b=!b;}return b;}
assert.equal(data.vacancyTotal,null);
assert.equal(data.places.length,10);assert.equal(new Set(data.places.map(p=>p.id)).size,10);
assert.equal(data.places.filter(p=>p.source==='official').length,6);
assert.equal(data.places.filter(p=>p.source==='research').length,4);
assert.equal(data.places.filter(p=>p.coordinates).length,8);
assert.deepEqual(data.places.filter(p=>!p.coordinates).map(p=>p.id),['자2','자4']);
for(const p of data.places){assert.ok(p.evidence&&p.checked&&p.status&&p.detail);if(p.coordinates){assert.equal(inside(p.coordinates,B.boundary.geometry.coordinates[0]),p.insideB,p.id+' boundary membership');}else assert.equal(p.insideB,null);for(const key of ['sourceUrl','mapUrl'])if(p[key])assert.equal(new URL(p[key]).protocol,'https:');}
assert.deepEqual(data.places.filter(p=>p.insideB===true).map(p=>p.id),['자1']);
assert.ok(data.places.find(p=>p.id==='공6').status.startsWith('매매의향'));
assert.ok(data.places.find(p=>p.id==='자2').detail.includes('월세 100만원'));
assert.equal(data.ideas.length,3);assert.equal(data.schedule.length,5);
// Run the real filtering function independently of the map/DOM.
const code=script.slice(script.indexOf('  function filtered()'),script.indexOf('  function frame()'));
const values={'meeting-source':'all','meeting-zone':'all','meeting-query':''};
const context={data,$:id=>({value:values[id]})};
const run=()=>vm.runInNewContext(code+'filtered().map(p=>p.id)',context).join(',');
assert.equal(run(),'공1,공2,공3,공4,공5,공6,자1,자2,자3,자4');
values['meeting-source']='research';assert.equal(run(),'자1,자2,자3,자4');
values['meeting-zone']='unknown';assert.equal(run(),'자2,자4');
values['meeting-zone']='inside';assert.equal(run(),'자1');
values['meeting-source']='official';assert.equal(run(),'');
values['meeting-zone']='all';values['meeting-query']='270';assert.equal(run(),'공3,공4,공5');
values['meeting-query']='없는주소123';assert.equal(run(),'');
console.log('PASS: 10 source-separated records, 8 geocoded points, 2 unlocated, B membership, vacancy uncertainty, ideas/schedule and 7 real filter cases');
