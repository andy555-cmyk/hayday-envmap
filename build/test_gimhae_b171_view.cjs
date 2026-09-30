// Camera padding must use map-local coordinates, never count the sidebar twice.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../data/gimhae-b171.js'), 'utf8');
const frameCode = source.slice(source.indexOf('  function frame('), source.indexOf('  function switchScope('));
function check(name, width, viewport, panel, expectedLeft, expectedBottom) {
  viewport.top = viewport.bottom - viewport.height;
  let actual;
  vm.runInNewContext(frameCode + '\nframe(0);', {
    data: { boundary: { geometry: { coordinates: [[[128.88,35.23],[128.89,35.24],[128.88,35.23]]] } } },
    innerWidth: width, is3d: true, ZP:{features:[]},
    $: () => ({ getBoundingClientRect: () => panel }),
    map: { getContainer: () => ({ getBoundingClientRect: () => viewport }), fitBounds: (_, options) => { actual = options; } }
  });
  assert.equal(actual.padding.left - actual.padding.right, expectedLeft, name + ' horizontal occlusion');
  assert.equal(actual.padding.bottom - actual.padding.top, expectedBottom, name + ' vertical occlusion');
  assert.equal(actual.pitch, 30, name + ' legacy viewing angle');
  assert.ok(actual.padding.left + actual.padding.right < viewport.width);
  assert.ok(actual.padding.top + actual.padding.bottom < viewport.height);
  console.log(name + ': PASS');
}
check('desktop sidebar already excluded',1280,{left:320,bottom:720,width:960,height:664},{right:320,top:56,width:320,height:664},0,0);
check('wide desktop sidebar already excluded',1920,{left:460,bottom:1080,width:1460,height:884},{right:460,top:196,width:460,height:884},0,0);
check('sidebar overlays map',1280,{left:0,bottom:720,width:1280,height:664},{right:320,top:56,width:320,height:664},320,0);
check('mobile bottom sheet',390,{left:0,bottom:844,width:390,height:796},{right:390,top:456,width:390,height:388},0,388);
check('print hidden panel',1280,{left:0,bottom:720,width:1280,height:676},{right:0,top:0,width:0,height:0},0,0);
assert.ok(source.includes('const colors=MODES.old.p;'), 'Use the existing age palette');
assert.ok(source.includes('!included.has(i)'), 'Context buildings exclude the B membership');
console.log('shared age palette and disjoint context: PASS');
let bounds;
const boundary={geometry:{coordinates:[[[2,2],[3,3],[2,2]]]}};
const combinedContext={data:{boundary},ZP:{features:[{properties:{k:'blue'},geometry:{coordinates:[[[0,0],[4,4],[0,0]]]}},{properties:{k:'black'},geometry:{coordinates:[[[-1,-1],[5,5],[-1,-1]]]}}]},innerWidth:1280,is3d:true,$:()=>({getBoundingClientRect:()=>({right:320,top:56,width:320,height:664})}),map:{getContainer:()=>({getBoundingClientRect:()=>({left:320,top:56,bottom:720,width:960,height:664})}),fitBounds:(b)=>{bounds=b;}}};
vm.runInNewContext(frameCode+'\nframe(0);',combinedContext);
assert.deepEqual(JSON.parse(JSON.stringify(bounds)),[[-1,-1],[5,5]],'Together view includes original boundaries and B');
vm.runInNewContext(frameCode+'\nframe(0,true);',combinedContext);
assert.deepEqual(JSON.parse(JSON.stringify(bounds)),[[2,2],[3,3]],'Explicit closeup fits B only');
assert.ok(source.includes("get('scope')==='b171'"),'B detail is opt-in; original map is default');
assert.ok(source.includes("contextIds.has(layer.id)"),'Keep original boundaries and landmarks in B detail');
console.log('combined extent, explicit closeup, default original view: PASS');
const emphasisIds=['bs-boundary-fill','bs-boundary-glow','bs-boundary-case','bs-boundary-line','bs-boundary-highlight'];
const shown=[];
const boundaryCode=source.slice(source.indexOf('  function showBoundary('),source.indexOf('  function renderLayers('));
vm.runInNewContext(boundaryCode+'\nshowBoundary();',{setVisibility:(id,on)=>{if(on)shown.push(id);}});
assert.deepEqual(shown,emphasisIds,'All five emphasis layers persist in original overview');
for(const id of emphasisIds)assert.ok(source.includes("addLayer({id:'"+id+"'"),'Emphasis layer registered: '+id);
assert.ok(source.includes("ownIds.forEach(id=>setVisibility(id,true));"),'Detail shows registered emphasis layers too');
console.log('shared B emphasis in overview and detail: PASS');
assert.ok(!/17\.1ha|4쪽|171,000/.test(source),'No stale page 4 copy in B UI or export');
assert.ok(source.includes('data.sourcePage')&&source.includes('data.printedArea/10000'),'Source and area labels derive from data');
assert.ok(source.includes('d.sourcePage!==5||d.printedArea!==156000'),'Fail closed for mixed old/new assets');
assert.ok(fs.readFileSync(path.join(__dirname,'../gimhae-wondosim.html'),'utf8').includes('gimhae-b171.js?v=readability-r3'),'Reload uses revised script');
console.log('page 5 provenance, area labels and cache version: PASS');
const css=fs.readFileSync(path.join(__dirname,'../data/gimhae-b171.css'),'utf8');
assert.ok(!/#b-panel\s*\{[^}]*zoom\s*:\s*1\s*!important/.test(css),'B panel must inherit shared width-based zoom');
assert.ok(css.includes('font:15px/1.65'),'B default text is readable without dragging');
assert.ok(source.includes("$('focusbx').append(focusButton)"),'B area is available in original focus controls');
assert.ok(source.includes("focusButton.onclick=()=>{popup?.remove();showBoundary();frame(450,true);}"),'B focus keeps current analysis scope');
console.log('B focus control, shared zoom and enlarged default typography: PASS');
assert.ok(source.includes("setVisibility('bs-mask',true)"),'Detail keeps its B-only outside mask visible');
assert.ok(source.includes("id:'bs-mask',type:'fill',source:'bs-mask',paint:{'fill-color':'#05070b','fill-opacity':.34}"),'Match original map dimming strength');
assert.ok(source.includes('hole.slice().reverse()'),'Mask cutout uses accepted boundary, without modifying it');
assert.ok(source.indexOf("id:'bs-context-3d'")<source.indexOf("id:'bs-mask'"),'Mask covers context buildings');
assert.ok(source.indexOf("id:'bs-mask'")<source.indexOf("id:'bs-3d'"),'B buildings stay above dimming');
assert.ok(source.includes("else {ownIds.forEach(id=>setVisibility(id,false));visibility.forEach"),'Returning to overview removes B mask and restores original visibility');
console.log('B detail outside dimming and overview restoration: PASS');
