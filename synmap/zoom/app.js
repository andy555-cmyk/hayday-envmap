/* 김해 원도심 줌인 발표 — 지구 → 부울경 → 김해 → 원도심 → 봉리단길 → 봉스퀘어 → 다시 지구 */
(() => {
const $ = s => document.querySelector(s);
const W = () => innerWidth, H = () => innerHeight;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fmt = n => n.toLocaleString('ko-KR');
const Q = new URLSearchParams(location.search);
const SLOW = +Q.get('slow') || 1;

/* ── 위성 타일: 파일 안 → 같은 폴더 tiles/ → 인터넷(Esri) 순서 ── */
window.__req = new Set(); window.__miss = new Set();
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/';
const b64 = Uint8Array.fromBase64 ? s => Uint8Array.fromBase64(s).buffer   // 브라우저 내장 해독(빠름)
  : s => { const b = atob(s), a = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a.buffer; };
let localOK = false;
const probe = location.protocol.startsWith('http') && !Q.has('online') ? fetch('tiles/ok.txt').then(r => localOK = r.ok).catch(() => {}) : Promise.resolve();
maplibregl.addProtocol('sat', async (p, ac) => {
  const key = p.url.slice(6); __req.add(key);
  const T = window.TILES;
  if (T && T[key]) return { data: b64(T[key]) };
  await probe;
  if (localOK) {
    try { const r = await fetch('tiles/' + key + '.jpg', { signal: ac.signal }); if (r.ok) return { data: await r.arrayBuffer() }; } catch (e) {}
  }
  __miss.add(key);
  const r = await fetch(ESRI + key, { signal: ac.signal });
  if (!r.ok) throw new Error('tile ' + r.status);
  return { data: await r.arrayBuffer() };
});

/* 밤 지구(NASA VIIRS Black Marble 2016) — 파일 안 → tiles_night/ → 인터넷(GIBS) */
const GIBS = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/2016-01-01/GoogleMapsCompatible_Level8/';
maplibregl.addProtocol('night', async (p, ac) => {
  const key = p.url.slice(8), T = window.TILES; __req.add('n/' + key);
  if (T && T['n/' + key]) return { data: b64(T['n/' + key]) };
  await probe;
  if (localOK) { try { const r = await fetch('tiles_night/' + key + '.jpg', { signal: ac.signal }); if (r.ok) return { data: await r.arrayBuffer() }; } catch (e) {} }
  __miss.add('n/' + key);
  const r = await fetch(GIBS + key + '.png', { signal: ac.signal });
  if (!r.ok) throw new Error('night ' + r.status);
  return { data: await r.arrayBuffer() };
});

/* 높이(AWS Terrain Tiles, terrarium) — 파일 안 → tiles_dem/ → 인터넷 */
const DEM = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/';
maplibregl.addProtocol('dem', async (p, ac) => {
  const key = p.url.slice(6), T = window.TILES; __req.add('d/' + key);
  if (T && T['d/' + key]) return { data: b64(T['d/' + key]) };
  await probe;
  if (localOK) { try { const r = await fetch('tiles_dem/' + key + '.png', { signal: ac.signal }); if (r.ok) return { data: await r.arrayBuffer() }; } catch (e) {} }
  __miss.add('d/' + key);
  const [z, y, x] = key.split('/');
  const r = await fetch(DEM + z + '/' + x + '/' + y + '.png', { signal: ac.signal });
  if (!r.ok) throw new Error('dem ' + r.status);
  return { data: await r.arrayBuffer() };
});

/* ── 기하 도우미 ── */
const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
function gc(a, b, n = 96) {           // 대권 경로
  const [l1, p1] = a.map(rad), [l2, p2] = b.map(rad);
  const d = 2 * Math.asin(Math.sqrt(Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin((l2 - l1) / 2) ** 2));
  const out = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n, A = Math.sin((1 - f) * d) / Math.sin(d), B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2);
    const y = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2);
    const z = A * Math.sin(p1) + B * Math.sin(p2);
    out.push([deg(Math.atan2(y, x)), deg(Math.atan2(z, Math.hypot(x, y)))]);
  }
  return out;
}
function spline(pts, seg = 14) {      // 캣멀롬 — 바닷길을 부드럽게
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    for (let t = 0; t < 1; t += 1 / seg) {
      const t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(k => .5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  out.push(pts[pts.length - 1]); return out;
}
function bow(a, b, k = .25, n = 60) { // 두 점 사이 휘어진 선
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
  const c = [mx - dy * k, my + dx * k], out = [];
  for (let i = 0; i <= n; i++) { const t = i / n; out.push([(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]]); }
  return out;
}
function ellipse(c, rx, ry, rot = 0, n = 72) {
  const k = 111320, out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n * 2 * Math.PI, x = rx * Math.cos(t), y = ry * Math.sin(t);
    const xr = x * Math.cos(rot) - y * Math.sin(rot), yr = x * Math.sin(rot) + y * Math.cos(rot);
    out.push([c[0] + xr / (k * Math.cos(rad(c[1]))), c[1] + yr / k]);
  }
  return out;
}
function nearestOnRing(p, ring) {
  const kx = Math.cos(rad(p[1])); let best = null, bd = 1e9;
  for (let i = 0; i < ring.length - 1; i++) {
    const a = ring[i], b = ring[i + 1], ax = (b[0] - a[0]) * kx, ay = b[1] - a[1];
    let t = (((p[0] - a[0]) * kx) * ax + (p[1] - a[1]) * ay) / (ax * ax + ay * ay); t = Math.max(0, Math.min(1, t));
    const q = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], d = Math.hypot((q[0] - p[0]) * kx, q[1] - p[1]);
    if (d < bd) { bd = d; best = q; }
  }
  return best;
}
const line = c => ({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: c } });
const fc = f => ({ type: 'FeatureCollection', features: f });

/* ── 자료 ── */
const GIMHAE = [128.8800, 35.2290];
const SEA = spline([[86, 16], [91, 11], [95.5, 7], [98.6, 4.6], [101.6, 2.6], [103.9, 1.25], [106, 4], [109.6, 10], [112.5, 15.5], [116.5, 20.6], [119.6, 24], [121.6, 27.2], [124.6, 31], [127.4, 33.8], [128.9, 34.85], [128.96, 35.06], [128.88, 35.225]]);
const ORIGINS = [
  ['우즈베키스탄', [69.24, 41.30]], ['카자흐스탄', [71.43, 51.13]], ['방글라데시', [90.41, 23.81]],
  ['태국', [100.50, 13.75]], ['베트남', [105.83, 21.03]], ['중국', [116.40, 39.90]]];
const ARCS = ORIGINS.map(([, ll]) => gc(ll, GIMHAE, 110));
const GRAT = [];   // 15° 간격 경위선
for (let lon = -180; lon < 180; lon += 15) GRAT.push(line(Array.from({ length: 61 }, (_, i) => [lon, -84 + i * 2.8])));
for (let lat = -75; lat <= 75; lat += 15) GRAT.push(line(Array.from({ length: 121 }, (_, i) => [-180 + i * 3, lat])));
const FOREIGN_C = [128.8829, 35.2350];
const FOREIGN = ellipse(FOREIGN_C, 290, 205, rad(25));
const ZONE = D.zone.coordinates[0];
const CENTER_WORKER = [128.88126045, 35.23383916];   // 김해외국인근로자지원센터
const NEAR = nearestOnRing(CENTER_WORKER, ZONE);
const JONGRO = [128.88259015, 35.23443849];
const FIX = {   // 독립 검수(10/22) 반영 — 대장 면적과 활용 가능 범위를 구분
  2: '거점상가 — 2층 124.14㎡ 임대 검토. 1·2층 통합(261.94㎡)은 1층 추가 확보 협의 후 확정',
  6: '협업공간 + 팝업 연계 프로그램② — 1층 114.32㎡ 활용 검토(3동 면적 합 약 234.6㎡는 대상 동·층·임대 조건 확인 필요)',
  7: '협업공간 + 팝업 연계 프로그램① — 1층 173.1㎡ 활용안(실제 대상 동·임대 범위 확인 필요)',
  13: '입주공간 + 청년 창작·창업 공간 — 공유오피스 30인 + 독립공간 계획' };
const STATE = { 5: '특화거점 후보 · 확보 조건 협의 중', 13: '입주공간 후보 · 사용 가능 여부와 대체안 검토 중' };
D.sites.forEach(s => { if (FIX[s.no]) s.desc = FIX[s.no]; if (s.no === 13) s.use = '입주공간 + 청년 창작·창업 공간'; s.state = STATE[s.no] || '활용 후보지 · 매입·임대 협의 후 확정'; });
D.rv.forEach(r => r.label = r.label.replace(/\s*\(\d+m\)/, ''));
const S = Object.fromEntries(D.sites.map(s => [s.no, s]));
D.recs.forEach(r => { if (r.c == null) r.c = 9999; });

/* ── 지도 ── */
const globeZoom = () => Math.log2(H() * .40 / 81.5);
const map = window.map = new maplibregl.Map({
  container: 'map', interactive: true, maxTileCacheSize: 1500,   // 원본이 넷(위성·밤·높이·산그림자)이라 원본마다 따로 쌓인다 — 크게 두면 메모리가 넘친다
  attributionControl: false, fadeDuration: 0,
  pixelRatio: Q.has('hidpi') ? devicePixelRatio : 1,   // 미리 받은 위성사진과 같은 해상도로 고정
  center: [104, 18], zoom: globeZoom() - .2, maxPitch: 75, renderWorldCopies: false,
  canvasContextAttributes: { preserveDrawingBuffer: Q.has('qa') },
  style: {
    version: 8, projection: { type: 'globe' },
    sky: { 'sky-color': '#071433', 'horizon-color': '#2f7dff', 'fog-color': '#8cc0ff', 'fog-ground-blend': .55, 'horizon-fog-blend': .65, 'sky-horizon-blend': .6, 'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 6, .9, 9, 0] },
    sources: { sat: { type: 'raster', tiles: ['sat://{z}/{y}/{x}'], tileSize: 256, maxzoom: 19 },
      night: { type: 'raster', tiles: ['night://{z}/{y}/{x}'], tileSize: 256, maxzoom: 6 },
      dem: { type: 'raster-dem', tiles: ['dem://{z}/{y}/{x}'], tileSize: 256, encoding: 'terrarium', minzoom: 5, maxzoom: 11, bounds: [124.5, 32.5, 132, 38.8] },
      shade: { type: 'raster-dem', tiles: ['dem://{z}/{y}/{x}'], tileSize: 256, encoding: 'terrarium', minzoom: 5, maxzoom: 11, bounds: [124.5, 32.5, 132, 38.8] } },
    layers: [{ id: 'sat', type: 'raster', source: 'sat', paint: { 'raster-fade-duration': 520, 'raster-saturation': -.08, 'raster-contrast': .06 } },
      // 산 그림자 — 부울경·김해 높이에서 산줄기가 도드라진다
      { id: 'shade', type: 'hillshade', source: 'shade', minzoom: 5.5, maxzoom: 13.5, paint:   // 큰 줌에선 확대 타일마다 그림자를 다시 그려 무거움 — 원도심 아래선 끔
        { 'hillshade-exaggeration': ['interpolate', ['linear'], ['zoom'], 6, 0, 7.5, .45, 11.5, .4, 14, 0], 'hillshade-shadow-color': '#06101f', 'hillshade-highlight-color': 'rgba(255,236,210,.6)', 'hillshade-accent-color': '#0b1830', 'hillshade-illumination-direction': 300 } },
      // 지구 높이에서는 밤 지구(도시 불빛), 한반도로 내려오며 낮 위성사진으로 넘어간다
      { id: 'night', type: 'raster', source: 'night', paint: { 'raster-fade-duration': 520, 'raster-opacity': ['interpolate', ['linear'], ['zoom'], 4.4, 1, 6.2, 0], 'raster-contrast': .18, 'raster-brightness-max': 1, 'raster-saturation': .15 } }]
  }
});

const src = (id, data, metrics) => map.addSource(id, { type: 'geojson', data: data || fc([]), lineMetrics: !!metrics });
const setData = (id, d) => map.getSource(id).setData(d);
const op = (id, prop, v) => map.setPaintProperty(id, prop, v);

function addLayers() {
  map.setLight({ anchor: 'viewport', color: '#ffe0bd', intensity: .42, position: [1.3, 210, 38] });
  src('prov', fc(D.prov)); src('gimhae', fc([D.gimhae])); src('zone', fc([{ type: 'Feature', properties: {}, geometry: D.zone }]));
  src('zoneDraw'); src('foreign', fc([{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [FOREIGN] } }]));
  src('grat', fc(GRAT)); src('sea'); src('arcs'); src('near', fc([line([CENTER_WORKER, NEAR])])); src('loop'); src('thread');
  src('recs', fc(D.recs.map(r => ({ type: 'Feature', properties: { o: r.o, c: r.c }, geometry: { type: 'Point', coordinates: r.ll } }))));
  src('blds', fc(D.blds));
  src('sitepts', fc(D.sites.map(s => ({ type: 'Feature', properties: { col: s.col }, geometry: { type: 'Point', coordinates: s.ll } }))));
  const L = (o) => map.addLayer(o);
  // 지구 높이의 옅은 경위선
  L({ id: 'grat', type: 'line', source: 'grat', paint: { 'line-color': '#7fb6ff', 'line-width': .6, 'line-opacity': ['interpolate', ['linear'], ['zoom'], 2, .16, 4.2, 0] } });
  // 부울경
  L({ id: 'prov-fill', type: 'fill', source: 'prov', paint: { 'fill-color': '#5AA9FF', 'fill-opacity': 0, 'fill-opacity-transition': { duration: 1200 } } });
  L({ id: 'prov-line', type: 'line', source: 'prov', paint: { 'line-color': '#cfe4ff', 'line-width': 1.4, 'line-opacity': 0, 'line-opacity-transition': { duration: 1200 } } });
  // 김해시
  L({ id: 'gimhae-fill', type: 'fill', source: 'gimhae', paint: { 'fill-color': '#FF9A4A', 'fill-opacity': 0, 'fill-opacity-transition': { duration: 1400 } } });
  L({ id: 'gimhae-glow', type: 'line', source: 'gimhae', paint: { 'line-color': '#FF9A4A', 'line-width': 10, 'line-blur': 8, 'line-opacity': 0, 'line-opacity-transition': { duration: 1400 } } });
  L({ id: 'gimhae-line', type: 'line', source: 'gimhae', paint: { 'line-color': '#ffd2ad', 'line-width': 2.2, 'line-opacity': 0, 'line-opacity-transition': { duration: 1400 } } });
  // 외국인 생활권
  L({ id: 'foreign-fill', type: 'fill', source: 'foreign', paint: { 'fill-color': '#FF9A4A', 'fill-opacity': 0, 'fill-opacity-transition': { duration: 1200 } } });
  L({ id: 'foreign-line', type: 'line', source: 'foreign', paint: { 'line-color': '#FF9A4A', 'line-width': 2, 'line-dasharray': [2, 1.5], 'line-opacity': 0, 'line-opacity-transition': { duration: 1200 } } });
  // 구역
  L({ id: 'zone-fill', type: 'fill', source: 'zone', paint: { 'fill-color': '#5AA9FF', 'fill-opacity': 0, 'fill-opacity-transition': { duration: 1200 } } });
  L({ id: 'zone-glow', type: 'line', source: 'zoneDraw', paint: { 'line-color': '#5AA9FF', 'line-width': 12, 'line-blur': 9, 'line-opacity': .0, 'line-opacity-transition': { duration: 800 } } });
  L({ id: 'zone-line', type: 'line', source: 'zoneDraw', layout: { 'line-join': 'round' }, paint: { 'line-color': '#bfe0ff', 'line-width': 3, 'line-opacity': 0, 'line-opacity-transition': { duration: 800 } } });
  // 가게 점
  L({ id: 'recs-a', type: 'circle', source: 'recs', filter: ['==', ['get', 'o'], -1], paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 15, 3.4, 18, 8.5], 'circle-color': '#ffd76a', 'circle-opacity': .9, 'circle-blur': .2, 'circle-stroke-color': 'rgba(0,0,0,.5)', 'circle-stroke-width': .6 } });
  L({ id: 'recs-o', type: 'circle', source: 'recs', filter: ['==', ['get', 'o'], -1], paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 15, 6, 18, 12], 'circle-color': '#53d8a0', 'circle-opacity': .55, 'circle-blur': .5 } });
  L({ id: 'recs-c', type: 'circle', source: 'recs', filter: ['==', ['get', 'o'], -1], paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 15, 6, 18, 12], 'circle-color': '#ff6b6b', 'circle-opacity': .6, 'circle-blur': .5 } });
  // 건물 입체 — 거점 바닥에 빛 번짐
  L({ id: 'site-halo', type: 'circle', source: 'sitepts', paint: { 'circle-radius': ['interpolate', ['exponential', 2], ['zoom'], 16, 14, 19, 110], 'circle-color': ['get', 'col'], 'circle-blur': .9, 'circle-opacity': 0, 'circle-pitch-alignment': 'map' } });
  const colorBy = ['match', ['get', 's']]; D.sites.forEach(s => colorBy.push(s.no, s.col)); colorBy.push('#dfe5ef');
  L({ id: 'blds', type: 'fill-extrusion', source: 'blds', filter: ['==', ['get', 's'], 0], paint: { 'fill-extrusion-color': '#cfd5e0', 'fill-extrusion-height': 0, 'fill-extrusion-opacity': 0, 'fill-extrusion-vertical-gradient': true } });
  L({ id: 'blds-site', type: 'fill-extrusion', source: 'blds', filter: ['>', ['get', 's'], 0], paint: { 'fill-extrusion-color': colorBy, 'fill-extrusion-height': 0, 'fill-extrusion-opacity': 0, 'fill-extrusion-vertical-gradient': false } });
  // 선들
  L({ id: 'loop-glow', type: 'line', source: 'loop', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#fff', 'line-width': 12, 'line-blur': 8, 'line-opacity': .35 } });
  L({ id: 'loop-line', type: 'line', source: 'loop', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': 3.5, 'line-dasharray': [1, 1.6] } });
  L({ id: 'near-line', type: 'line', source: 'near', paint: { 'line-color': '#FF9A4A', 'line-width': 2.5, 'line-dasharray': [1.5, 1.2], 'line-opacity': 0, 'line-opacity-transition': { duration: 900 } } });
  L({ id: 'arcs-line', type: 'line', source: 'arcs', layout: { 'line-cap': 'round' }, paint: { 'line-color': '#ff9a4a', 'line-width': 1, 'line-opacity': .28, 'line-dasharray': [2, 2] } });   // 떠오른 호의 지면 그림자
  L({ id: 'sea-glow', type: 'line', source: 'sea', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#FF9A4A', 'line-width': 14, 'line-blur': 10, 'line-opacity': .5 } });
  L({ id: 'sea-line', type: 'line', source: 'sea', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#ffd9b8', 'line-width': 3, 'line-dasharray': [2, 1.4] } });
  L({ id: 'thread-glow', type: 'line', source: 'thread', layout: { 'line-cap': 'round' }, paint: { 'line-color': '#FF9A4A', 'line-width': 14, 'line-blur': 9, 'line-opacity': .55 } });
  L({ id: 'thread-line', type: 'line', source: 'thread', layout: { 'line-cap': 'round' }, paint: { 'line-color': '#ffd9b8', 'line-width': 3.5 } });
}

/* ── 지도 위 글자·점 ── */
const MK = {};
function mk(group, ll, html, cls = '', anchor = 'left', offset = [0, 0]) {
  // 지도가 바깥 요소의 opacity를 직접 만지므로 보이기·숨기기는 안쪽 요소에 건다
  const box = document.createElement('div'), el = document.createElement('div');
  el.className = 'mk ' + cls; el.innerHTML = html; box.appendChild(el);
  if (anchor === 'right') el.querySelector('.lbl')?.classList.add('left');   // 점이 좌표 쪽에 오게
  new maplibregl.Marker({ element: box, anchor, offset }).setLngLat(ll).addTo(map);
  (MK[group] = MK[group] || []).push(el); return el;
}
const lbl = (t, sub, cls = '') => `<div class="lbl ${cls}"><span class="d"></span><span class="t">${t}${sub ? `<small>${sub}</small>` : ''}</span></div>`;
function show(group, on, stagger = 0) {
  (MK[group] || []).forEach((el, i) => { if (on && stagger) setTimeout(() => el.classList.add('on'), i * stagger); else el.classList.toggle('on', on); });
}
function buildMarkers() {
  // 지구
  mk('sea0', [87, 17.5], lbl('인도 방향', '전승 속 바닷길', 'sea plain'), '', 'right');
  mk('sea0', [128.88, 35.23], lbl('가락국 · 김해', '서기 48년', 'sea big pulse'), '', 'left', [6, 0]);
  ORIGINS.forEach(([n, ll]) => mk('arc0', ll, lbl(n, '', 'small'), '', 'right', [-6, 0]));
  // 부울경
  mk('k1', [129.0752, 35.1799], lbl('부산', '', ''), '', 'left', [4, 0]);
  mk('k1', [129.3113, 35.5395], lbl('울산', '', ''), '', 'left', [4, 0]);
  mk('k1', [128.6818, 35.2279], lbl('창원', '경남도청', ''), '', 'right', [-4, 0]);
  mk('k1', [128.9364, 35.1801], lbl('김해국제공항', '', 'small'), '', 'right', [-4, 14]);
  mk('k1', [128.8810, 35.2470], lbl('김해', '부울경의 한가운데', 'sea big pulse up'), '', 'bottom', [0, 6]);
  mk('k1', [128.30, 35.36], `<div class="lbl plain"><span class="t" style="color:#cfe4ff;font-size:1.6em;letter-spacing:.3em;font-weight:300">경상남도</span></div>`, '', 'center');
  // 김해시
  mk('k2', [128.8779, 35.2384], lbl('가야 유적 축', '구지봉 · 수로왕릉 · 대성동고분군 · 봉황동 유적', 'her'), '', 'left', [-5, 0]);
  mk('k2', [128.8795, 35.2285], lbl('원도심', '봉황동 · 동상동 · 부원동 · 회현동', 'sea big pulse down'), '', 'top', [0, -6]);   // 글자는 점 아래로(위쪽 가야 유적 축과 겹치지 않게)
  mk('k2', [128.8646, 35.2352], lbl('내외동', '신도시', 'small'), '', 'right', [-8, 0]);
  mk('k2', [128.8329, 35.1661], lbl('장유', '신도시', 'small'), '', 'right', [-6, 0]);
  mk('k2', [128.9364, 35.1801], lbl('김해국제공항', '', 'small'), '', 'left', [6, 0]);
  // 원도심
  mk('k3', [128.8762, 35.2252], lbl('확정 구역계', '20.9ha · 봉황동·부원동 일대', 'zone'), '', 'right', [-8, 0]);
  mk('k3h', [128.87597, 35.23060], lbl('봉황동 유적', '', 'her small'), '', 'right', [-6, 0]);
  mk('k3h', [128.87849, 35.23531], lbl('수로왕릉', '', 'her small'), '', 'right', [-6, 0]);
  mk('k3h', [128.87381, 35.23716], lbl('대성동고분군', '', 'her small'), '', 'right', [-6, 0]);
  mk('k3f', [128.8853, 35.2382], lbl('동상동 외국인 생활권', '동상시장 · 종로길 일대(개략 범위)', 'sea'), '', 'left', [10, 0]);
  mk('k3f', [128.88337, 35.23622], lbl('동상시장', '', 'small'), '', 'left', [6, 0]);
  mk('k3f', JONGRO, lbl('종로길', '', 'small'), '', 'right', [-6, -10]);
  mk('k3f', CENTER_WORKER, lbl('외국인근로자지원센터', '', 'small sea'), '', 'left', [6, 12]);
  mk('k3f', [128.88405, 35.23540], lbl('가야글로벌센터', '', 'small sea'), '', 'left', [6, 0]);
  mk('k3f', [128.872243, 35.22934], lbl('김해시가족센터', '', 'small sea'), '', 'left', [6, 0]);
  mk('k3d', NEAR, `<div class="dist">327m</div>`, '', 'right', [-10, 6]);
  // 봉리단길
  mk('k4', [128.8768, 35.2282], lbl('봉황대길', '「봉리단길」 735m', 'zone'), '', 'right', [-8, 0]);
  // 봉스퀘어 거점
  D.sites.forEach(s => {
    const box = document.createElement('div'), el = document.createElement('div'); box.appendChild(el);
    el.className = 'site'; el.style.setProperty('--c', s.col);
    el.innerHTML = `<div class="pin"><b>${s.no}</b></div><div class="nm">${s.use.replace(/\(.*?\)/g, '').split(' — ')[0]}</div>`;
    el.addEventListener('click', e => { e.stopPropagation(); openSite(s.no); });
    new maplibregl.Marker({ element: box, anchor: 'bottom' }).setLngLat(s.ll).addTo(map);
    (MK.sites = MK.sites || []).push(el);
  });
  mk('k5f', JONGRO, lbl('종로길 외국인 생활권', '', 'sea pulse'), '', 'left', [10, 0]);
}

/* ── 움직이는 선 ── */
const anims = {};
function drawLine(id, coords, ms, fast, multi) {
  cancelAnimationFrame(anims[id]);
  const sets = multi ? coords : [coords];
  const put = f => setData(id, fc(sets.map(c => { const n = Math.max(2, Math.ceil(c.length * f)); return line(c.slice(0, n)); })));
  if (fast || ms <= 0) { put(1); return Promise.resolve(); }
  return new Promise(res => {
    const t0 = performance.now();
    const tick = t => { let f = Math.min(1, (t - t0) / (ms * SLOW)); f = 1 - Math.pow(1 - f, 2.2); put(f); if (f < 1) anims[id] = requestAnimationFrame(tick); else res(); };
    anims[id] = requestAnimationFrame(tick);
  });
}
let ARCP = ARCS.map(() => 0);
const ARCLEN = ARCS.map(c => Math.hypot(c[0][0] - GIMHAE[0], c[0][1] - GIMHAE[1]));
function angDist(a, b) { const [l1, p1] = a.map(rad), [l2, p2] = b.map(rad); return Math.acos(Math.min(1, Math.sin(p1) * Math.sin(p2) + Math.cos(p1) * Math.cos(p2) * Math.cos(l2 - l1))); }
function comets(on) {   // 지구에서 떠오른 호 — 지구 중심에서 바깥으로 들어 올려 그린다(정사영 근사)
  cancelAnimationFrame(anims.comets);
  const cv = $('#arc3d'), g = cv.getContext('2d');
  if (!on) { cv.classList.remove('on'); return; }
  cv.classList.add('on');
  const t0 = performance.now(), maxL = Math.max(...ARCLEN);
  const tick = t => {
    if (cv.width !== W()) { cv.width = W(); cv.height = H(); }
    g.clearRect(0, 0, cv.width, cv.height);
    const z = map.getZoom(), ctr = map.getCenter(), C = [ctr.lng, ctr.lat], c = map.project(ctr);
    const k = z > 5.4 ? 0 : z < 4 ? 1 : (5.4 - z) / 1.4;   // 한반도로 내려가면 사라짐
    if (k > 0) {
      const sec = (t - t0) / 1000;
      g.globalAlpha = k; g.lineCap = 'round';
      ARCS.forEach((arc, i) => {
        const n = Math.max(2, Math.ceil(arc.length * ARCP[i])), H0 = .07 + .2 * ARCLEN[i] / maxL;
        const P = [];
        for (let j = 0; j < n; j++) {
          const ll = arc[j]; if (angDist(ll, C) > 1.5) { P.push(null); continue; }
          const sp = map.project(ll), f = j / (arc.length - 1), h = 1 + H0 * Math.sin(Math.PI * f);
          P.push([c.x + (sp.x - c.x) * h, c.y + (sp.y - c.y) * h]);
        }
        const path = (a, b) => { g.beginPath(); let st = false; for (let j = a; j < b; j++) { const q = P[j]; if (!q) { st = false; continue; } st ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); st = true; } };
        // 호 본체: 넓은 빛 + 가는 선
        path(0, n); g.strokeStyle = 'rgba(255,140,60,.22)'; g.lineWidth = 7; g.shadowBlur = 0; g.stroke();
        g.strokeStyle = 'rgba(255,150,70,.30)'; g.lineWidth = 3.2; g.stroke();
        g.strokeStyle = 'rgba(255,220,186,.9)'; g.lineWidth = 1.3; g.stroke();   // 그림자 흐림(shadowBlur)은 무거워서 겹선으로 빛을 낸다
        // 빛 알갱이
        if (ARCP[i] >= 1) {
          const f = (sec / 3.2 + i * .37) % 1, hd = Math.floor(f * (n - 1)), tl = Math.max(0, hd - 16);
          for (let j = tl; j < hd; j++) { const a = P[j], b = P[j + 1]; if (!a || !b) continue; const e = (j - tl) / 16;
            g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]);
            g.strokeStyle = `rgba(255,170,90,${.35 * e})`; g.lineWidth = 3 + 6 * e; g.stroke();
            g.strokeStyle = `rgba(255,${200 + 55 * e},${150 + 100 * e},${e})`; g.lineWidth = 1.2 + 2 * e; g.stroke(); }
          const q = P[hd]; if (q) { const rg = g.createRadialGradient(q[0], q[1], 0, q[0], q[1], 9); rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(1, 'rgba(255,170,90,0)'); g.fillStyle = rg; g.beginPath(); g.arc(q[0], q[1], 9, 0, 7); g.fill(); }
        }
        const o = P[0]; if (o) { g.fillStyle = 'rgba(255,200,150,.9)'; g.beginPath(); g.arc(o[0], o[1], 2.4, 0, 7); g.fill(); }
      });
      // 김해 빛기둥
      const gp = map.project(GIMHAE), top = [c.x + (gp.x - c.x) * 1.07, c.y + (gp.y - c.y) * 1.07];
      const lg = g.createLinearGradient(gp.x, gp.y, top[0], top[1]); lg.addColorStop(0, 'rgba(255,230,200,.95)'); lg.addColorStop(1, 'rgba(255,160,80,0)');
      g.beginPath(); g.moveTo(gp.x, gp.y); g.lineTo(top[0], top[1]); g.strokeStyle = lg; g.lineWidth = 3; g.stroke();
      g.globalAlpha = 1;
    }
    anims.comets = requestAnimationFrame(tick);
  };
  anims.comets = requestAnimationFrame(tick);
}
function drawArcs(fast) {   // 나라별로 차례로
  cancelAnimationFrame(anims.arcs);
  if (fast) { ARCP = ARCS.map(() => 1); setData('arcs', fc(ARCS.map(line))); return; }
  const t0 = performance.now();
  const tick = t => {
    const el = (t - t0) / SLOW;
    ARCP = ARCS.map((c, i) => { const f = Math.max(0, Math.min(1, (el - i * 280) / 1600)); return 1 - Math.pow(1 - f, 2); });
    setData('arcs', fc(ARCS.map((c, i) => line(c.slice(0, Math.max(2, Math.ceil(c.length * ARCP[i])))))));
    if (el < ARCS.length * 280 + 1700) anims.arcs = requestAnimationFrame(tick);
  };
  anims.arcs = requestAnimationFrame(tick);
}
function riseBuildings(on, fast) {
  cancelAnimationFrame(anims.blds);
  const to = on ? 1 : 0;
  const put = e => {
    e = Math.max(0, e);   // 첫 프레임 시각이 t0보다 앞서면 음수가 나온다
    op('blds', 'fill-extrusion-height', ['*', ['get', 'h'], e]); op('blds', 'fill-extrusion-opacity', Math.min(.72, e * 1.2)); op('site-halo', 'circle-opacity', e * .75);
    op('blds-site', 'fill-extrusion-height', ['*', ['+', ['get', 'h'], 1.5], e]); op('blds-site', 'fill-extrusion-opacity', Math.min(.98, e * 1.4));
  };
  if (fast) { put(to); return; }
  const t0 = performance.now();
  const tick = t => { const f = Math.min(1, (t - t0) / (1800 * SLOW)), e = on ? 1 - Math.pow(1 - f, 3) : 1 - f;
    put(e);
    if (f < 1) anims.blds = requestAnimationFrame(tick); };
  anims.blds = requestAnimationFrame(tick);
}

/* ── 봉리단길 10년 ── */
const Y = D.yearly, YMAX = 260;
function chart(upTo) {
  const svg = $('.tl-chart'), x = y => (y - 2009) / 16 * 600 + 20, ya = v => 150 - v / YMAX * 140, yb = v => 150 - v / 60 * 46;
  const fy = Math.min(2025, Math.floor(upTo)), fr = fy >= 2025 ? 1 : Math.min(1, (upTo - fy) * 1.6);
  const pts = Y.filter(r => r.y <= fy);
  let h = `<line x1="20" y1="150" x2="620" y2="150" stroke="rgba(255,255,255,.25)"/>`;
  pts.forEach(r => { const g = r.y === fy ? fr : 1, ho = (150 - yb(r.o)) * g, hc = (150 - yb(r.c)) * g;
    h += `<rect x="${x(r.y) - 9}" y="${150 - ho}" width="8" height="${ho}" fill="#53d8a0" opacity=".85"/><rect x="${x(r.y) + 1}" y="${150 - hc}" width="8" height="${hc}" fill="#ff6b6b" opacity=".85"/>`; });
  const nx = Y.find(q => q.y === fy + 1), lp = pts.map(r => x(r.y) + ',' + ya(r.a));
  if (nx && fy < 2025) { const u = upTo - fy, cur = pts[pts.length - 1]; lp.push((x(fy) + (x(fy + 1) - x(fy)) * u) + ',' + (ya(cur.a) + (ya(nx.a) - ya(cur.a)) * u)); }
  if (lp.length > 1) h += `<polyline points="${lp.join(' ')}" fill="none" stroke="#ffd76a" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  const mark = (yr, txt, dy = -12, anchor = 'middle') => { const r = Y.find(q => q.y === yr); if (r && yr <= upTo) h += `<circle cx="${x(yr)}" cy="${ya(r.a)}" r="5.5" fill="#ffd76a"/><text x="${x(yr)}" y="${ya(r.a) + dy}" text-anchor="${anchor}" font-weight="700">${txt}</text>`; };
  mark(2016, '2016 · 123', -12); mark(2023, '2023 · 245', -12, 'end');
  if (upTo >= 2024) h += `<text x="${x(2024.5)}" y="${yb(29) - 8}" text-anchor="middle" fill="#ff8f8f" font-weight="700">폐업 > 개업</text>`;
  [2009, 2016, 2025].forEach(yr => h += `<text x="${x(yr)}" y="168" text-anchor="middle" opacity=".7">${yr}</text>`);
  svg.innerHTML = h;
}
/* 시간 t(소수 연도)를 끊김 없이 흘린다 — 점은 개업 때 서서히 켜지고 폐업 때 서서히 꺼진다 */
const clamp01 = e => ['min', 1, ['max', 0, e]];
let bnYear = 0;
function setTime(t) {
  const y = Math.min(2025, Math.floor(t)), o = ['get', 'o'], c = ['get', 'c'];
  const live = ['*', clamp01(['/', ['-', t, o], .3]), clamp01(['/', ['-', c, t], .3])];
  op('recs-a', 'circle-opacity', ['*', .92, live]); op('recs-a', 'circle-stroke-opacity', live);
  const bump = k => clamp01(['-', 1, ['abs', ['*', 2.2, ['-', t, ['+', k, .45]]]]]);
  op('recs-o', 'circle-opacity', ['*', .7, bump(o)]); op('recs-c', 'circle-opacity', ['*', .75, bump(c)]);
  $('.tl-year').textContent = y;
  const r0 = Y.find(q => q.y === y), r1 = Y.find(q => q.y === y + 1) || r0, u = y >= 2025 ? 0 : Math.max(0, (t - y - .6) / .4), f = u * u * (3 - 2 * u);   // 숫자는 그해 값으로 머물다 해 끝에 넘어간다
  const a = Math.round(r0.a + (r1.a - r0.a) * f);
  if (bnYear !== y) { bnYear = y; bignum(`${a}<small>건</small>`, `영업 중인 가게형 인허가 · ${y}년<em>행정안전부 지방행정 인허가데이터 · 확정 구역계 안</em>`, 'zone', true); }
  else $('#bignum .bn-v').innerHTML = `${a}<small>건</small>`;
  chart(t);
}
// 연도 → 화면 시간: 2016·2023·2024 앞에서 천천히 멈췄다 간다
const TL = (() => { const k = [[0, 2009]]; let ms = 0;
  for (let y = 2009; y < 2026; y++) { const slow = y === 2016 || y === 2023 || y === 2024; ms += slow ? 1250 : 560; k.push([ms, y + 1 - .001]); }
  return k; })();
const tlAt = ms => { for (let i = 1; i < TL.length; i++) if (ms <= TL[i][0]) { const [m0, y0] = TL[i - 1], [m1, y1] = TL[i], u = (ms - m0) / (m1 - m0); return y0 + (y1 - y0) * (u * u * (3 - 2 * u)); } return 2025.999; };
let tlRun = 0;
function timelapse(fast) {
  const id = ++tlRun; bnYear = 0;
  ['recs-a', 'recs-o', 'recs-c'].forEach(l => map.setFilter(l, null));
  $('#timeline').classList.add('on');
  if (fast) { setTime(2025.999); return; }
  const t0 = performance.now(), end = TL[TL.length - 1][0];
  const tick = n => { if (id !== tlRun) return; const ms = (n - t0) / SLOW; setTime(tlAt(Math.max(0, ms))); if (ms < end) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}
function stopTimeline() { tlRun++; op('recs-a', 'circle-stroke-opacity', 1); $('#timeline').classList.remove('on'); ['recs-a', 'recs-o', 'recs-c'].forEach(l => map.setFilter(l, ['==', ['get', 'o'], -1])); }

/* 로드뷰 비교 — 같은 자리 2016 → 2025 */
let rvTimer;
function roadview(on, ids = ['R05', 'R07']) {
  clearInterval(rvTimer); const box = $('#rv');
  if (!on) { box.classList.remove('on'); return; }
  const P = ids.map(id => D.rv.find(r => r.id === id)).filter(Boolean);
  let pi = 0, k = 0;
  const render = () => {
    const p = P[pi], a = p.shots[0], b = p.shots[2];
    box.innerHTML = `<div class="rv-box"><img src="${a.img}"><img class="b" src="${b.img}" style="opacity:${k}"><div class="rv-tag">${(k ? b : a).d.slice(0, 4)}</div></div><div class="rv-cap">같은 자리 로드뷰 · ${p.label}</div>`;
  };
  render(); box.classList.add('on');
  rvTimer = setInterval(() => { k ^= 1; if (!k) pi = (pi + 1) % P.length; render(); if (k) { const im = box.querySelector('img.b'); im.style.opacity = 0; requestAnimationFrame(() => requestAnimationFrame(() => im.style.opacity = 1)); } }, 2600);
}

/* ── 설명판·숫자 ── */
function bignum(v, k, cls = '', instant) {
  const el = $('#bignum');
  if (!v) { el.classList.remove('on'); return; }
  const put = () => { el.querySelector('.bn-v').className = 'bn-v ' + cls; el.querySelector('.bn-v').innerHTML = v; el.querySelector('.bn-k').innerHTML = k; el.classList.add('on'); };
  if (instant || !el.classList.contains('on')) put(); else { el.classList.remove('on'); setTimeout(put, 350); }
}
function countUp(to, unit, k, cls, ms = 1600, dec = 0) {
  const t0 = performance.now(); const el = $('#bignum');
  el.querySelector('.bn-k').innerHTML = k; el.querySelector('.bn-v').className = 'bn-v ' + cls; el.classList.add('on');
  const tick = t => { const f = Math.min(1, (t - t0) / (ms * SLOW)), e = 1 - Math.pow(1 - f, 3), v = to * e;
    el.querySelector('.bn-v').innerHTML = (dec ? v.toFixed(dec) : fmt(Math.round(v))) + `<small>${unit}</small>`; if (f < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}
function panel(step) {
  const p = $('#panel'), inn = $('#panel-in');
  if (!step || !step.title) { p.classList.remove('on'); return; }
  p.classList.remove('on');
  inn.innerHTML = `${step.logo ? `<img class="logo" src="img/logo_960.webp" alt="">` : ''}<div class="p-step"><i>${step.no}</i>${step.label}</div>
    <div class="p-title">${step.title.split('<br>').map((l, i) => `<span class="ln" style="--i:${i}"><span>${l}</span></span>`).join('')}</div><div class="p-lead">${step.lead}</div>
    <div class="p-beats">${(step.items || []).map(it => `<div class="beat ${it.cls || ''}" data-b="${it.b}">${it.html}</div>`).join('')}</div>`;
  void p.offsetWidth; p.classList.add('on');
}
function beatItems(b) {
  const only = STEPS[si] && STEPS[si].only;
  document.querySelectorAll('#panel .beat').forEach(el => { const k = +el.dataset.b; el.classList.toggle('on', only ? k === b : k <= b); el.style.display = only && k !== b ? 'none' : ''; });
}

/* ── 단계 정의 ── */
const LEGEND2 = `<div class="legend"><span style="--c:#5AA9FF">본 사업 — 구역 안(약 20.9ha)</span><span style="--c:#FF9A4A">연계 — 종로길·외국인 생활권</span></div>`;
const LEG_A = `<div class="legend dots"><span style="--c:#FF8A3D">특화거점</span><span style="--c:#3D6BFF">거점상가</span><span style="--c:#2FB8FF">협업공간</span><span style="--c:#A66BFF">입주공간</span><span style="--c:#3BD18B">마당·주차</span></div>`;
const STEPS = [
  { key: 'earth', no: '0', label: '지구', crumb: '지구',
    title: '2천 년 전,<br>바다 건너온 사람을<br>맞은 도시',
    lead: '『삼국유사』에는 김해가 <b>바다 건너온 허황옥을 왕비로 맞았다</b>는 이야기가 전한다.',
    items: [
      { b: 1, cls: 'sea', html: '서기 48년, 아유타국 공주 <b>허황옥</b>이 배로 건너와 김수로왕의 왕비가 되었다.<span class="src">『삼국유사』 「가락국기」 전승 · 출발지는 학설이 갈려 「인도 방향」으로만 표시</span>' },
      { b: 2, cls: 'sea', html: '그때 바닷길 하나, <b>지금은 이웃 3만 8천 명.</b><span class="src">선 = 동상동 종로길 가게·간판에서 확인된 나라 예시(전수 아님)</span>' }],
    cam: () => ({ center: [104, 18], zoom: globeZoom() - .2, pitch: 0, bearing: 0 }), notes: '' },
  { key: 'korea', no: '1', label: '부울경', crumb: '부울경',
    title: '부울경의 한가운데,<br>경남의 관문',
    lead: '부산·창원 사이, <b>김해국제공항</b>과 경전철로 이어진 도시.',
    items: [{ b: 0, cls: '', html: '경남 원도심 가운데 <b>가야 이야기</b>와 <b>다문화 생활권</b>을 함께 가진 곳.' }],
    cam: () => ({ center: [128.93, 35.33], zoom: 8.25, pitch: 46, bearing: -10 }), dur: 9000,
    notes: '' },
  { key: 'city', no: '2', label: '김해', crumb: '김해',
    title: '가야의 왕도,<br>오늘의 다문화 도시',
    lead: '사람과 상권이 신도시(내외동·장유)로 옮겨 가는 동안, <b>가야 유적이 모인 원도심</b> 곁에 동상동 외국인 생활권이 자라났다.',
    items: [{ b: 0, cls: 'sea', html: '외국인근로자 <b>12,309</b> · 외국국적동포 <b>4,459</b> · 결혼이민자 <b>2,210</b> · 유학생 <b>2,001</b> · 자녀 <b>3,789</b><span class="src">행정안전부 「2024 지방자치단체 외국인주민 현황」(2024.11.1 기준) · 유형별 일부 항목, 자녀는 별도 집계라 단순 합산 불가</span>' }],
    cam: () => ({ center: [128.835, 35.218], zoom: 10.75, pitch: 48, bearing: -8 }), dur: 6500,
    notes: '' },
  { key: 'old', no: '3', label: '원도심', crumb: '원도심',
    title: '구역은 지키고,<br>이웃은 잇는다',
    lead: '확정 구역계 <b>20.9ha</b>(208,778㎡) 안은 본 사업으로, 바로 옆 <b>동상동 외국인 생활권</b>은 프로그램과 연계사업으로 잇는다.',
    items: [
      { b: 0, cls: 'zone', html: '구역 안 건물 <b>10채 중 8채 넘게</b> 지은 지 20년 넘었다.<span class="src">건축물대장 516동 기준 20년 이상 84.0%</span>' },
      { b: 1, cls: 'sea', html: '외국인 지원기관까지 <b>가장 가까운 곳 327m</b>. 구역을 넓히지 않아도 걸어서 이어진다.<span class="src">김해외국인근로자지원센터 → 구역계 가장 가까운 변, 직선거리 326.6m</span>' },
      { b: 1, cls: '', html: LEGEND2 }],
    cam: () => ({ center: [128.8812, 35.2312], zoom: 15.3, pitch: 52, bearing: -12 }), dur: 6500,
    notes: '' },
  { key: 'street', no: '4', label: '봉리단길', crumb: '봉리단길',
    title: '7년 만에 두 배,<br>그리고 멈춤',
    lead: '봉리단길을 품은 <b>사업구역 전체</b>의 가게형 인허가는 <b>2016년 123건 → 2023년 245건</b>으로 늘었다가, 2024년부터 <b>폐업이 개업보다 많아졌다.</b>',
    items: [
      { b: 0, cls: 'zone', html: '<span style="color:#ffd76a">●</span> 영업 중 &nbsp;<span style="color:#53d8a0">●</span> 그해 개업 &nbsp;<span style="color:#ff6b6b">●</span> 그해 폐업<span class="src">행정안전부 지방행정 인허가데이터(가게형 업종) · 확정 구역계 안 · 한 가게가 여러 인허가를 가질 수 있음</span>' },
      { b: 1, cls: '', html: '골목은 바뀌었지만, <b>스스로 이어 갈 힘</b>이 떨어지고 있다. 지금이 손을 쓸 때다.' }],
    cam: () => ({ center: [128.8786, 35.2292], zoom: 16.45, pitch: 54, bearing: 22 }), dur: 5500,
    notes: '' },
  { key: 'square', no: '5', label: '봉스퀘어', crumb: '봉스퀘어', logo: true, only: true,
    beatCam: { 2: { center: [128.8797, 35.2309], zoom: 16.3, pitch: 54, bearing: -14 } },
    title: '13곳을 한 바퀴로 잇는<br>생활광장',
    lead: '봉황대의 「봉」 + 스퀘어. 빈 가게·빈집·빈 땅 등 <b>활용 후보 13곳</b>을 거점·상가·협업·입주·마당으로 잇는다.',
    items: [
      { b: 0, cls: '', html: LEG_A + '<span class="src">거점 번호를 누르면 그 건물로 들어간다</span>' },
      { b: 1, cls: 'zone', html: '<b>13곳을 잇는 계획 동선 약 1.58km · 이동만 약 20분.</b> 5번 특화거점과 주차장이 함께 움직이고, 운영 주체는 <b>봉크크</b>로 꾸린다. 청년 창작·창업 입주 첫해 목표 <b>66명</b>.<span class="src">13곳은 활용 후보지 — 매입·임대 협의 후 확정 · 걷는 시간은 시속 약 4.7km, 체험·대기 제외</span>' },
      { b: 2, cls: 'sea', html: '<b>외국인 이웃은 프로그램으로 들어온다</b> — 거점 팝업, 청년 입주, 작가 협업. 이야기는 봉패밀리(토더기)와 거북이 <b>해동이</b>가 잇는다.<div class="pic"><img src="img/story_1280.webp" alt=""></div>' }],
    cam: () => ({ center: [128.8791, 35.2292], zoom: 17.25, pitch: 60, bearing: -18 }), dur: 6000,
    notes: '' },
  { key: 'finale', no: '6', label: '다시, 세계로', crumb: '다시 세계로',
    cam: () => ({ center: [110, 24], zoom: globeZoom() - .05, pitch: 0, bearing: 0 }), dur: 11000,
    notes: '' }
];

/* ── 장면: 상태(단계·박자)에 따라 보이는 것 정하기 ── */
let si = 0, bi = 0, busy = false, siteOpen = null;
function scene(fast) {
  const k = STEPS[si].key;
  const at = (key, b = 0) => k === key && bi >= b;
  // 바닷길·나라 선
  const seaOn = at('earth', 1) || k === 'finale', arcOn = at('earth', 2) || k === 'finale';
  if (seaOn && !scene.sea) drawLine('sea', SEA, 4200, fast || k === 'finale');
  if (!seaOn) { cancelAnimationFrame(anims.sea); setData('sea', fc([])); }
  scene.sea = seaOn; show('sea0', seaOn);
  if (arcOn && !scene.arc) { drawArcs(fast || k === 'finale'); comets(true); }
  if (!arcOn) { cancelAnimationFrame(anims.arcs); setData('arcs', fc([])); if (scene.arc) comets(false); }
  scene.arc = arcOn; show('arc0', at('earth', 2));
  // 부울경
  op('prov-line', 'line-opacity', k === 'korea' ? .85 : 0); op('prov-fill', 'fill-opacity', k === 'korea' ? .12 : 0);
  show('k1', k === 'korea', fast ? 0 : 220);
  // 김해시
  op('gimhae-line', 'line-opacity', k === 'korea' || k === 'city' ? 1 : 0);
  op('gimhae-glow', 'line-opacity', k === 'korea' || k === 'city' ? .7 : 0);
  op('gimhae-fill', 'fill-opacity', k === 'korea' ? .28 : k === 'city' ? .12 : 0);
  show('k2', k === 'city', fast ? 0 : 260);
  // 원도심
  const zoneOn = ['old', 'street', 'square'].includes(k);
  if (zoneOn && !scene.zone) drawLine('zoneDraw', ZONE, k === 'old' && !fast ? 2600 : 0, fast);
  if (!zoneOn) setData('zoneDraw', fc([]));
  scene.zone = zoneOn;
  op('zone-line', 'line-opacity', k === 'old' ? 1 : zoneOn ? .55 : 0); op('zone-glow', 'line-opacity', k === 'old' ? .8 : zoneOn ? .25 : 0);
  op('zone-fill', 'fill-opacity', k === 'old' ? .14 : k === 'street' ? .05 : 0);
  show('k3', k === 'old'); show('k3h', k === 'old', fast ? 0 : 200);
  const fOn = at('old', 1);
  op('foreign-fill', 'fill-opacity', fOn ? .22 : at('square', 2) ? .16 : 0); op('foreign-line', 'line-opacity', fOn || at('square', 2) ? .95 : 0);
  show('k3f', fOn, fast ? 0 : 160); op('near-line', 'line-opacity', fOn ? 1 : 0); show('k3d', fOn);
  // 봉리단길
  if (k === 'street') { show('k4', true); if (!scene.tl && (!busy || fast) && !scene.hold) { timelapse(fast); scene.tl = true; } roadview(bi >= 1); }
  else { show('k4', false); if (scene.tl) stopTimeline(); scene.tl = false; roadview(false); }
  // 봉스퀘어
  const sq = k === 'square';
  if (sq !== !!scene.sq) riseBuildings(sq, fast);
  scene.sq = sq;
  show('sites', sq, fast ? 0 : 140); 
  const loopOn = at('square', 1);
  if (loopOn && !scene.loop) drawLine('loop', D.loop, 3800, fast); if (!loopOn) { cancelAnimationFrame(anims.loop); setData('loop', fc([])); }
  scene.loop = loopOn;
  const thOn = at('square', 2);
  if (thOn && !scene.th) drawLine('thread', [bow(JONGRO, S[1].ll, .28), bow(JONGRO, S[3].ll, -.22)], 2200, fast, true);
  if (!thOn) { cancelAnimationFrame(anims.thread); setData('thread', fc([])); }
  scene.th = thOn; show('k5f', thOn);
  // 숫자
  const bn = {
    'earth1': ['서기 48<small>년</small>', '허황옥 도래 · 『삼국유사』 전승', 'sea'],
    'korea0': [549861, '명', '김해시 총인구<em>외국인주민 포함 · 행정안전부 2024.11.1 기준</em>', ''],
    'city0': [7.0, '%', '김해시 인구 가운데 외국인주민<em>38,465명 / 549,861명 · 행정안전부 2024.11.1 기준</em>', 'sea'],
    'old0': [84.0, '%', '구역 안 20년 넘은 건물<em>건축물대장 516동 기준</em>', 'zone'],
    'square0': [13, '곳', '활용 후보 대상지<em>매입·임대 협의 후 확정</em>', ''],
    'square1': [66, '명', '청년 창작·창업 입주 첫해 목표<em>공유오피스·독립공간·레지던시 연계 · 공간별 인원은 확보 후 확정</em>', 'zone']
  }[k + bi];
  if (scene.hold) bignum(null);
  else if (k === 'earth' && bi === 2) countUp(38465, '명', '오늘 김해에 사는 외국인주민<em>행정안전부 「2024 지방자치단체 외국인주민 현황」 · 2024.11.1 기준</em>', 'sea', fast ? 1 : 1800);
  else if (bn && typeof bn[0] === 'number') countUp(bn[0], bn[1], bn[2], bn[3], fast ? 1 : 1500, bn[1] === '%' ? 1 : 0);
  else if (bn) bignum(bn[0], bn[1], bn[2]);
  else if (k !== 'street') bignum(null);
  // 화면 장식
  $('#opening').classList.toggle('on', k === 'earth' && bi === 0); $('#opening').classList.toggle('off', !(k === 'earth' && bi === 0));
  $('#crumbs').classList.toggle('on', !(k === 'earth' && bi === 0)); $('#scale').classList.toggle('on', !(k === 'earth' && bi === 0));
  document.body.classList.toggle('clean', k === 'finale');
  document.body.classList.toggle('bnleft', k === 'earth');
  finale(k === 'finale' && !scene.hold, fast);
  if (k === 'earth' && bi === 0) $('#panel').classList.remove('on');
  else if (k === 'earth' && !scene.hold && !$('#panel').classList.contains('on')) { panel(STEPS[0]); beatItems(bi); }
  crumbs(); notes();
}
function crumbs() {
  const nav = $('#crumbs');
  if (!nav.childElementCount) {
    STEPS.forEach((s, i) => {
      if (i) { const bar = document.createElement('span'); bar.className = 'bar'; bar.innerHTML = '<b></b>'; nav.appendChild(bar); }
      const b = document.createElement('button'); b.innerHTML = `<i></i>${s.crumb}`; b.onclick = e => { e.stopPropagation(); go(i); }; nav.appendChild(b);
    });
  }
  nav.querySelectorAll('button').forEach((b, i) => { b.classList.toggle('cur', i === si); b.classList.toggle('done', i < si); });
  nav.querySelectorAll('.bar').forEach((b, i) => b.classList.toggle('done', i < si));
}
function notes() { const s = STEPS[si]; $('#notes').innerHTML = `<b>${s.no}. ${s.label}</b> · 박자 ${bi + 1}/${Math.max(1, beatsOf(si))}<br>${s.notes || ''}`; }
const beatsOf = i => i === 0 ? 3 : STEPS[i].key === 'finale' ? 4 : Math.max(1, ...((STEPS[i].items || []).map(it => it.b + 1)));

/* 마지막 화면 */
function finale(on, fast) {
  const el = $('#finale');
  if (!on) { el.classList.remove('on'); return; }
  if (!el.innerHTML) el.innerHTML = `<div class="f-t">골목 하나가,<br><em>다시 세계와</em> 잇는다</div>
    <div class="f-s">2천 년 전 바다 건너온 사람을 맞았다는 이야기를 품은 김해가, 봉스퀘어에서 이웃과 방문객을 다시 골목으로 부른다.</div>
    <div class="f-ask">
      <div><b><i>01</i>구역 밖 연계사업</b>종로길·외국인 생활권을 연계사업으로 담는 방향에 대한 의견</div>
      <div><b><i>02</i>외국인 프로그램</b>외국인 주민 팝업·입주·협업 프로그램과 도 사업의 연결</div>
      <div><b><i>03</i>행정 협의체</b>시·도·운영 주체가 함께하는 협의체 참여</div>
    </div>`;
  el.classList.add('on');
  el.querySelectorAll('.f-ask div').forEach((d, i) => d.classList.toggle('on', bi >= i + 1));
}

/* 거점 상세 */
function openSite(no) {
  const s = S[no], rv = D.rv.find(r => r.id === 'S' + String(no).padStart(2, '0'));
  siteOpen = no;
  const card = $('#sitecard'); card.style.setProperty('--c', s.col);
  const a = rv ? rv.shots[0] : null, b = rv ? rv.shots[2] : null;
  card.innerHTML = `<button class="sc-x" aria-label="닫기">×</button>
    <div class="sc-img">${a ? `<figure><img src="${a.img}"><figcaption>${a.d.slice(0, 4)}</figcaption></figure><figure><img src="${b.img}"><figcaption>${b.d.slice(0, 4)}</figcaption></figure>` : `<figure style="grid-column:span 2;aspect-ratio:16/9"><img src="${s.img}"></figure>`}</div>
    <div class="sc-body"><span class="sc-no">${s.no} · ${s.code}</span><h3>${s.use}</h3><p>${s.desc && s.desc !== s.use ? s.desc + '<br>' : ''}${s.jibun}</p><p class="sc-state">${s.state}</p></div>`;
  card.querySelector('.sc-x').onclick = e => { e.stopPropagation(); closeSite(); };
  card.onclick = e => e.stopPropagation();
  card.classList.add('on'); $('#panel').classList.remove('on'); bignum(null);
  map.flyTo({ center: s.ll, zoom: 18.7, pitch: 64, bearing: map.getBearing() + 25, duration: 2600 * SLOW, padding: { left: 0, right: W() * .34, top: 0, bottom: 0 }, essential: true });
}
function closeSite(noFly) {
  if (!siteOpen) return; siteOpen = null;
  $('#sitecard').classList.remove('on'); $('#panel').classList.add('on');
  if (!noFly) fly(STEPS[si], 2200).then(() => scene(true));
}

/* ── 카메라 ── */
function pad(step) {
  const k = step.key;
  if (k === 'earth' && bi === 0) return { left: W() * .48, right: 0, top: 0, bottom: 0 };
  if (k === 'finale') return { left: W() * .52, right: 0, top: 0, bottom: 0 };
  if (k === 'earth') return { left: W() * .30, right: 0, top: 0, bottom: 0 };
  if (k === 'street') return { left: W() * .26, right: W() * .30, top: 0, bottom: 0 };
  return { left: W() * .30, right: 0, top: H() * .05, bottom: 0 };
}
let flyDone = null;
const SINE = t => -(Math.cos(Math.PI * t) - 1) / 2;   // 출발·도착 모두 부드럽게
function fly(step, dur) {
  busy = true;
  return new Promise(res => {
    flyDone = () => { busy = false; flyDone = null; res(); };
    map.stop();   // 움직이던 카메라를 먼저 세운다 — 안 그러면 그 멈춤 신호(moveend)를 새 비행의 도착으로 잘못 받는다
    const cam = step.cam(), P = pad(step);
    if (cam.zoom < 5) {   // 지구본까지는 여백 없이 날아간 뒤, 글 자리를 비우며 옆으로 민다
      // flyTo는 지구본 높이에서 경도가 30°가량 어긋나 끝에 되돌아간다 — 먼저 그 자리에서 수직으로 물러나고, 이어서 지구를 돌린다
      const here = map.getCenter();
      map.once('moveend', () => { map.once('moveend', () => flyDone && flyDone()); map.easeTo({ ...cam, padding: P, duration: dur * .55 * SLOW, easing: t => 1 - Math.pow(1 - t, 2.2) }); });
      map.easeTo({ center: [here.lng, here.lat], zoom: 5.2, pitch: 0, bearing: 0, padding: { left: 0, right: 0, top: 0, bottom: 0 }, duration: dur * .45 * SLOW, easing: t => t * t * (2 - t), essential: true });
    } else {
      map.once('moveend', () => flyDone && flyDone());
      const far = Math.abs(cam.zoom - map.getZoom()) > 3.2;
      if (far) map.flyTo({ ...cam, padding: P, duration: dur * SLOW, curve: 1.32, easing: SINE, essential: true });
      else map.easeTo({ ...cam, padding: P, duration: dur * .82 * SLOW, easing: SINE, essential: true });
    }
  });
}
function skipFly() { if (!busy) return; const s = STEPS[si]; map.stop(); map.jumpTo({ ...s.cam(), padding: pad(s) }); reveal && reveal(); cine(false); flyDone && flyDone(); }

/* 지구가 천천히 돈다(여는 화면·마지막) */
let spinOn = false;
function spin(on) {
  spinOn = on; if (!on) return;
  let last = performance.now(), run = 0;
  const tick = t => { if (!spinOn || si !== 0) { spinOn = false; return; } const dt = t - last; last = t; if (!busy && !map.isMoving()) { run += dt; const k = Math.min(1, run / 2600), e = k * k * (3 - 2 * k); const c = map.getCenter(); map.jumpTo({ center: [c.lng + dt * .0022 * e, c.lat] }); } else run = 0; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}

/* 도착한 뒤 카메라가 아주 천천히 돌며 다가간다(정지 화면처럼 보이지 않게) */
let driftOn = false, dBase = null, dT0 = 0;
function drift(on) { driftOn = on; dBase = null; if (on) requestAnimationFrame(dTick); }
function dTick(t) {
  if (!driftOn) return;
  if (busy || siteOpen || map.isEasing()) dBase = null;
  else {
    if (!dBase) { dBase = { b: map.getBearing(), z: map.getZoom() }; dT0 = t; }
    const sec = (t - dT0) / 1000, k = Math.min(1, sec / 3.2), e = k * k * (3 - 2 * k);
    map.jumpTo({ bearing: dBase.b + e * 6 * Math.sin(sec / 14), zoom: dBase.z + .16 * (1 - Math.exp(-sec / 24)) });
  }
  requestAnimationFrame(dTick);
}
/* 날아가는 동안: 위아래 검은 띠 + 장 번호·제목 */
const EN = { korea: 'BUSAN · ULSAN · GYEONGNAM', city: 'GIMHAE CITY', old: 'OLD TOWN CORE', street: 'BONGHWANGDAE-GIL', square: 'BONG SQUARE', finale: 'BACK TO THE WORLD' };
let cineT = [];
function cine(on, s, d) {
  cineT.forEach(clearTimeout); cineT = [];
  if (!on) { document.body.classList.remove('flying', 'chap'); return; }
  const c = s.cam().center, ll = `${Math.abs(c[1]).toFixed(4)}°${c[1] >= 0 ? 'N' : 'S'}  ${Math.abs(c[0]).toFixed(4)}°E`;
  $('#chapter').innerHTML = `<div class="ch-no">0${s.no}</div><div class="ch-t">${s.crumb}</div><div class="ch-s">${EN[s.key] || ''}</div><div class="ch-ll">${ll}</div>`;
  document.body.classList.add('flying');
  cineT.push(setTimeout(() => document.body.classList.add('chap'), d * SLOW * .1));
  cineT.push(setTimeout(() => document.body.classList.remove('chap'), d * SLOW * .56));
}

/* ── 진행 ── */
let goId = 0, reveal = null;
async function go(i, toEnd) {
  if (i < 0 || i >= STEPS.length) return;
  closeSite(true); spin(false); drift(false);
  const prevKey = STEPS[si].key; si = i; bi = 0;
  const s = STEPS[si], long = prevKey !== s.key, d = long ? (s.dur || 6000) : 1800, my = ++goId;
  scene.hold = long; panel(null); bignum(null); scene(false);
  if (long && reliefE > 0) reliefTo(0, 900);
  reveal = () => { reveal = null; if (my !== goId) return; scene.hold = false; panel(s.title ? s : null); beatItems(bi); scene(false); };
  if (long && s.key !== 'earth') cine(true, s, d); else reveal();
  if (reveal) setTimeout(() => reveal && my === goId && reveal(), d * SLOW * (s.key === 'finale' ? .9 : .66));
  await fly(s, d);
  if (my !== goId) return;
  reveal && reveal(); cine(false);
  if (['old', 'street', 'square'].includes(s.key)) drift(true);   // 부울경·김해는 카메라를 멈추고 산이 솟게(지형+움직임은 무거움)
  if (['korea', 'city'].includes(s.key)) reliefTo(1.6, 2600);
  if (s.key === 'street' && !scene.tl) { timelapse(false); scene.tl = true; }
  if (toEnd) { bi = beatsOf(si) - 1; beatItems(bi); scene(true); }
  if (s.key === 'earth' && bi === 0) spin(true);
}
async function next() {
  if (siteOpen) { closeSite(); return; }
  if (busy) { skipFly(); return; }
  if (bi < beatsOf(si) - 1) {
    bi++; beatItems(bi);
    if (STEPS[si].key === 'earth' && bi === 1) { spin(false); map.stop(); scene(false); panel(STEPS[0]); beatItems(1); await new Promise(r => { map.once('moveend', r);   // 여는 제목은 누르는 즉시 내림(지구가 다 돈 뒤가 아니라)
      map.easeTo({ center: [106, 24], zoom: globeZoom() + .3, padding: pad(STEPS[0]), duration: 3000 * SLOW, easing: t => 1 - Math.pow(1 - t, 2.4) }); }); }
    const bc = STEPS[si].beatCam && STEPS[si].beatCam[bi];
    if (bc) map.easeTo({ ...bc, padding: pad(STEPS[si]), duration: 2800 * SLOW, easing: SINE });
    scene(false); return;
  }
  if (si < STEPS.length - 1) go(si + 1);
}
function prev() {
  if (siteOpen) { closeSite(); return; }
  if (bi > 0) { bi--; beatItems(bi); scene(true); const st = STEPS[si];
    if (st.key === 'earth' && bi === 0) { map.easeTo({ ...st.cam(), padding: pad(st), duration: 2200 * SLOW, easing: SINE }); map.once('moveend', () => { if (si === 0 && bi === 0) spin(true); }); return; } if (st.beatCam) map.easeTo({ ...(st.beatCam[bi] || st.cam()), padding: pad(st), duration: 2200 * SLOW, easing: SINE }); return; }
  if (si > 0) go(si - 1, true);
}
function restart() { location.hash = ''; location.reload(); }

/* 지구본 둘레 대기 빛 — 지구 높이에서만 */
function halo() {
  const z = map.getZoom(), o = z < 3.4 ? 1 : z > 5 ? 0 : (5 - z) / 1.6;
  ['#halo', '#rim'].forEach(q => $(q).style.opacity = o);
  if (!o) return;
  const p = map.project(map.getCenter()), r = 81.5 * 2 ** z * (.868 - Math.max(0, z - globeZoom()) * .06);
  ['#halo', '#rim'].forEach(q => { const e = $(q); e.style.width = e.style.height = 2 * r + 'px'; e.style.transform = `translate(${p.x - r}px,${p.y - r}px)`; });
}

/* 산 입체 — 날아가는 동안은 평평하게(지형 계산이 무거워 60fps를 지키려고), 도착하면 산이 솟아오른다 */
let reliefE = 0;
function reliefTo(to, ms) {
  cancelAnimationFrame(anims.relief);
  const from = reliefE, t0 = performance.now();
  const tick = t => {
    const f = Math.min(1, (t - t0) / ms), e = from + (to - from) * SINE(f);
    reliefE = e;
    if (e > .005) { if (!map.terrain) map.setTerrain({ source: 'dem', exaggeration: e }); else { map.terrain.exaggeration = e; map.triggerRepaint(); } }
    else if (map.terrain) map.setTerrain(null);
    if (f < 1) anims.relief = requestAnimationFrame(tick);
  };
  anims.relief = requestAnimationFrame(tick);
}

/* 화면 폭 표시 */
function updScale() {
  const z = map.getZoom(), lat = map.getCenter().lat;
  let m = 40075016.686 * Math.cos(rad(lat)) / (512 * 2 ** z) * W();
  m = Math.min(m, 12742000);
  $('#scale .sc-v').textContent = m >= 10000 ? fmt(Math.round(m / 1000 / (m > 1e6 ? 100 : m > 1e5 ? 10 : 1)) * (m > 1e6 ? 100 : m > 1e5 ? 10 : 1)) + ' km' : fmt(Math.round(m / 10) * 10) + ' m';
}

/* ── 시작 ── */
function stars() {
  const c = document.createElement('canvas'); c.width = W(); c.height = H(); const g = c.getContext('2d');
  for (let i = 0; i < 900; i++) { const r = Math.random() ** 3 * 1.6 + .2; g.fillStyle = `rgba(255,255,255,${Math.random() * .7 + .15})`; g.beginPath(); g.arc(Math.random() * c.width, Math.random() * c.height, r, 0, 7); g.fill(); }
  $('#stars').style.background = `#02040a url(${c.toDataURL()})`;
}
let booted = false;
function boot() {
  if (booted) return;
  if (!map.isStyleLoaded() || !map.getStyle()) { setTimeout(boot, 400); return; }   // 바탕이 다 오기 전엔 기다린다
  booted = true;
  addLayers(); buildMarkers(); crumbs(); scene(true); updScale();
  const c0 = STEPS[0].cam(); map.jumpTo({ ...c0, zoom: c0.zoom - 1.1, center: [c0.center[0] - 40, c0.center[1]], padding: pad(STEPS[0]) });
  requestAnimationFrame(() => document.body.classList.remove('intro'));
  map.easeTo({ ...c0, padding: pad(STEPS[0]), duration: 5200 * SLOW, easing: t => 1 - Math.pow(1 - t, 3) }); map.once('moveend', () => { if (si === 0 && bi === 0) spin(true); });
  map.on('move', updScale); map.on('move', halo); halo();
  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (k === 'ArrowRight' || k === ' ' || k === 'PageDown' || k === 'Enter') { e.preventDefault(); next(); }
    else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace') { e.preventDefault(); prev(); }
    else if (/^[0-6]$/.test(k)) go(+k);
    else if (k === 'h' || k === 'H' || k === '?') document.body.classList.toggle('showhelp');
    else if (k === 'f' || k === 'F') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); }
    else if (k === 'r' || k === 'R') restart();
    else if (k === 'Escape') closeSite();
  });
  map.keyboard.disable();   // ← → 는 장면 넘기기로 둔다
  map.on('click', () => { if (si === 0 && bi === 0) next(); });
  document.body.classList.add('showhelp'); setTimeout(() => document.body.classList.remove('showhelp'), 6000);
  const j = Q.get('step'); if (j != null) go(+j, Q.has('end'));
}
stars();
map.on('load', boot);
map.once('styledata', () => setTimeout(boot, 1500));
setTimeout(boot, 6000);
window.__map = map; window.__app = { go, next, prev, drift, spin, get busy() { return busy; }, get si() { return si; }, get bi() { return bi; }, STEPS };
})();
