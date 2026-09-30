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
    innerWidth: width, is3d: true,
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
