const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../gimhae-wondosim.html'),'utf8');
const code=html.slice(html.indexOf('const OSM_TILES='),html.indexOf('map.addControl(new maplibregl.NavigationControl'));
let config;
vm.runInNewContext(code,{maplibregl:{Map:function(options){config=options;}}});
assert.equal(config.attributionControl.compact,false,'Attribution must stay visible');
assert.equal(config.style.sources.osm.tiles[0],'https://tile.openstreetmap.org/{z}/{x}/{y}.png');
assert.equal(config.style.sources.osm.maxzoom,19);
assert.match(config.style.sources.osm.attribution,/openstreetmap.org\/copyright/);
for(const id of ['dark','light']){
 const layer=config.style.layers.find(l=>l.id===id);
 assert.equal(layer.source,'osm');
 assert.equal(layer.paint['raster-saturation'],-1);
 assert.equal(layer.layout.visibility,'none');
}
assert.equal(config.style.layers.find(l=>l.id==='sat').source,'sat');
assert.ok(!html.includes('basemaps.cartocdn.com'),'No keyless CARTO tile requests');
assert.ok(!html.includes('no-referrer'),'Do not suppress OSM Referer');
const b=fs.readFileSync(path.join(__dirname,'../data/gimhae-b171.js'),'utf8');
assert.ok(!b.includes('© CARTO'),'Export credit matches replacement source');
assert.match(b,/openstreetmap.org\/copyright/);
console.log('shared OSM tiles, grayscale styles, attribution and export: PASS');
