"""확정 구역계(2026-10-11) 기준으로 도로·진출입구·생활 기반을 다시 계산해 data/gimhae-zone-261011.json 의 context 에 넣는다.

Usage: python3 build/zone261011_context.py [--refresh-osm]
- 도로: OpenStreetMap(Overpass) 차량 도로를 받아 build/data/gimhae/osm_roads_zone261011.json 에 보관(--refresh-osm 일 때만 새로 받음).
  위계 환산은 기존 사업구역 분석(HIER)과 같은 규칙: primary·secondary(+link)·trunk = 대로 / tertiary(+link) 또는 4차로 이상 = 중로 / 나머지 = 소로.
- 진출입구: 경계선과 차량 도로가 만나는 점을 30m 안에서 하나로 묶음(기존 GATE 와 같은 방법).
- 점포: 구역 안 등록점포(2026-06)에서 대로·중로까지 직선 최단거리, 가장 가까운 대로·중로 진출입구에 배분.
- 생활 기반: 이 페이지의 시 전체 자료(버스 정류장 일평균·경전철 역·생활안전시설·와이파이 측정점·법정동 인구)를 구역 기준으로 다시 셈.
"""
import sys, re, json, math, time
from pathlib import Path
from collections import Counter, defaultdict
import numpy as np
import requests
from shapely.geometry import shape, Point, LineString, MultiLineString, mapping
from shapely.ops import transform, unary_union

ROOT = Path(__file__).resolve().parents[1]
ZP = ROOT / 'data/gimhae-zone-261011.json'
Z = json.loads(ZP.read_text())
poly = shape(Z['boundary']['geometry'])
scale = np.array([111320 * math.cos(math.radians(35.232)), 111320]); origin = np.array([128.88, 35.23])
metric = lambda g: transform(lambda x, y, z=None: ((np.array(x) - origin[0]) * scale[0], (np.array(y) - origin[1]) * scale[1]), g)
pm = metric(poly)

cache = ROOT / 'build/data/gimhae/osm_roads_zone261011.json'
if '--refresh-osm' in sys.argv or not cache.exists():
    w, s, e, n = poly.bounds; pad = .006
    q = f'[out:json][timeout:60];way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|service)(_link)?$"]({s-pad},{w-pad},{n+pad},{e+pad});out tags geom;'
    for url in ['https://overpass-api.de/api/interpreter', 'https://z.overpass-api.de/api/interpreter', 'https://lz4.overpass-api.de/api/interpreter', 'https://overpass-api.de/api/interpreter', 'https://z.overpass-api.de/api/interpreter']:
        try:
            r = requests.post(url, data={'data': q}, timeout=90, headers={'User-Agent': 'hayday-envmap/1.0'}); r.raise_for_status(); osm = r.json(); break
        except Exception as ex:
            print('overpass fail', url, ex); time.sleep(3)
    else:
        raise SystemExit('OSM 도로를 받지 못했습니다')
    cache.parent.mkdir(parents=True, exist_ok=True)
    cache.write_text(json.dumps({'fetched': time.strftime('%Y-%m-%d'), 'source': 'OpenStreetMap Overpass API (ODbL)', 'elements': osm['elements']}, ensure_ascii=False, separators=(',', ':')))
OSM = json.loads(cache.read_text())

def tier(t):
    hw = t.get('highway', ''); base = hw.replace('_link', '')
    try: lanes = int(str(t.get('lanes', '0')).split(';')[0])
    except ValueError: lanes = 0
    if base in ('motorway', 'trunk', 'primary', 'secondary'): return '대로'
    if base == 'tertiary' or lanes >= 4: return '중로'
    return '소로'
roads = []
for el in OSM['elements']:
    if el.get('type') != 'way' or len(el.get('geometry', [])) < 2: continue
    t = el.get('tags', {})
    if t.get('service') in ('parking_aisle', 'driveway') or t.get('access') in ('private', 'no'): continue
    line = LineString([(p['lon'], p['lat']) for p in el['geometry']])
    roads.append({'id': el['id'], 'tier': tier(t), 'name': t.get('name', ''), 'highway': t.get('highway'), 'lanes': t.get('lanes'), 'geom': line})

# 1. 도로 위계 — 구역 안으로 잘라 길이
lengths = Counter(); named = defaultdict(float); clipped_features = []
for r in roads:
    c = r['geom'].intersection(poly)
    if c.is_empty or c.geom_type not in ('LineString', 'MultiLineString'): continue
    L = metric(c).length; lengths[r['tier']] += L
    if r['tier'] != '소로' and r['name']: named[(r['tier'], r['name'])] += L
    clipped_features.append({'type': 'Feature', 'properties': {'tier': r['tier'], 'name': r['name'], 'highway': r['highway']}, 'geometry': mapping(c)})
total = sum(lengths.values())

# 2. 진출입구 — 경계선 × 도로 교차점, 30m 묶음, 등급은 가장 높은 도로
rank = {'대로': 0, '중로': 1, '소로': 2}
hits = []
for r in roads:
    x = r['geom'].intersection(poly.exterior)
    pts = [x] if x.geom_type == 'Point' else list(getattr(x, 'geoms', [])) if not x.is_empty else []
    for p in pts:
        if p.geom_type == 'Point': hits.append((p, r))
gates = []
for p, r in sorted(hits, key=lambda h: rank[h[1]['tier']]):
    mp = metric(p)
    g = next((g for g in gates if g['m'].distance(mp) <= 30), None)
    if g: g['roads'].add(r['name'] or r['highway']); continue
    gates.append({'m': mp, 'p': p, 'tier': r['tier'], 'name': r['name'], 'roads': {r['name'] or r['highway']}})
gate_counts = Counter(g['tier'] for g in gates)

# 3. 점포 — 대로·중로까지 거리, 가장 가까운 대로·중로 진출입구에 배분
html = (ROOT / 'gimhae-wondosim.html').read_text()
D = json.loads(re.search(r'<script id="dat" type="application/json">(.*?)</script>', html, re.S).group(1))
D2 = json.loads(re.search(r'<script id="dat2" type="application/json">(.*?)</script>', html, re.S).group(1))
major = unary_union([metric(r['geom']) for r in roads if r['tier'] in ('대로', '중로')])
key_gates = [g for g in gates if g['tier'] in ('대로', '중로')]
bands = Counter(); dists = []; share = Counter()
for i in Z['storeIndices']:
    p = D['store'][i]; mp = metric(Point(p['lon'], p['lat']))
    d = mp.distance(major); dists.append(d)
    bands['50m 안' if d <= 50 else '50~100m' if d <= 100 else '100m 밖'] += 1
    if key_gates:
        g = min(key_gates, key=lambda g: g['m'].distance(mp)); share[id(g)] += 1
def side(pt):
    c = poly.centroid; dx, dy = pt.x - c.x, pt.y - c.y
    return ('동' if dx > 0 else '서') if abs(dx * scale[0]) > abs(dy * scale[1]) else ('북' if dy > 0 else '남')
gate_rows = sorted([{'name': g['name'] or '이름 없는 도로', 'tier': g['tier'], 'side': side(g['p']), 'stores': share[id(g)], 'lnglat': [round(g['p'].x, 6), round(g['p'].y, 6)]} for g in key_gates], key=lambda r: -r['stores'])

# 4. 생활 기반 — 시 전체 자료를 구역 기준으로
near = lambda x, y, m: pm.distance(metric(Point(x, y))) <= m
bus_in = [b for b in D2['bus'] if poly.covers(Point(b[1], b[2]))]
bus_300 = [b for b in D2['bus'] if not poly.covers(Point(b[1], b[2])) and near(b[1], b[2], 300)]
rail = sorted([{'name': r['n'], 'daily': r['tot'], 'distM': round(pm.distance(metric(Point(r['x'], r['y']))))} for r in D2['rail'] if near(r['x'], r['y'], 800)], key=lambda r: r['distM'])
safe = Counter(k for k, n, x, y in D2['safe'] if poly.covers(Point(x, y)))
wifi = sorted([{'name': f['properties']['n'], 'daily': f['properties']['v'], 'yoy': f['properties']['y'], 'distM': round(pm.distance(metric(shape(f['geometry']))))}
               for f in json.loads(re.search(r'^const WIFIPT=(.*?);\s*$', html, re.M).group(1))['features'] if near(*f['geometry']['coordinates'], 300)], key=lambda r: r['distM'])
pop = {k: D2['popB'][k] for k in Z['stats']['dongs'] if k in D2['popB']}
store_adong = Counter(D['store'][i].get('ad') or '확인 불가' for i in Z['storeIndices'])

Z['context'] = {
    'made': time.strftime('%Y-%m-%d'), 'osmFetched': OSM['fetched'], 'osmSource': OSM['source'],
    'roads': {'totalM': round(total), 'byTier': {k: round(lengths.get(k, 0)) for k in ['대로', '중로', '소로']},
              'sharePct': {k: round(100 * lengths.get(k, 0) / total, 1) if total else 0 for k in ['대로', '중로', '소로']},
              'named': [{'tier': t, 'name': n, 'm': round(v)} for (t, n), v in sorted(named.items(), key=lambda kv: -kv[1]) if v >= 20]},
    'roadLines': {'type': 'FeatureCollection', 'features': clipped_features},
    'gates': {'total': len(gates), 'byTier': {k: gate_counts.get(k, 0) for k in ['대로', '중로', '소로']}, 'key': gate_rows,
              'points': {'type': 'FeatureCollection', 'features': [{'type': 'Feature', 'properties': {'tier': g['tier'], 'name': g['name']}, 'geometry': mapping(g['p'])} for g in gates]}},
    'storeDistance': {'bands': {k: bands.get(k, 0) for k in ['50m 안', '50~100m', '100m 밖']}, 'medianM': round(float(np.median(dists))) if dists else None, 'n': len(dists)},
    'bus': {'inside': [{'name': b[0], 'daily': b[3], 'adong': b[4]} for b in sorted(bus_in, key=lambda b: -b[3])],
            'within300': [{'name': b[0], 'daily': b[3], 'adong': b[4]} for b in sorted(bus_300, key=lambda b: -b[3])]},
    'rail': rail, 'safe': dict(safe.most_common()), 'wifiNear': wifi,
    'population': {k: {'total': v['t'], 'age65': v['o'], 'agingPct': round(100 * v['o'] / v['t'], 1)} for k, v in pop.items()},
    'storeAdong': dict(store_adong.most_common()),
}
ZP.write_text(json.dumps(Z, ensure_ascii=False, separators=(',', ':')))
out = {k: v for k, v in Z['context'].items() if k not in ('roadLines',)}
out['gates'] = {k: v for k, v in out['gates'].items() if k != 'points'}
print(json.dumps(out, ensure_ascii=False, indent=1)[:4000])
