"""Rebuild the confirmed RE:CORE boundary (2026-10-11) against this page's embedded data.

Usage: python3 build/rebuild_gimhae_zone261011.py ZONES.geojson CASE.json
  ZONES = ~/dev/synmap/data/gimhae_261011/raw/zones_261011.geojson  (zoneK = 정본, 다른 방과 공유)
  CASE  = ~/dev/synmap/web/cases/gimhae_261011/case.json            (시 우선순위 13곳)
Writes data/gimhae-zone-261011.json. 다음 순서로 이어서 돌린다: build/zone261011_context.py → zone261011_vacancy.py → zone261011_linkage.py → zone261011_extras.py → update_gimhae_meeting_261011.py. The boundary is never edited here — only read and counted.
Membership rules are the same as the 9/30 B area (data/gimhae-b171.json, kept for comparison):
building = representative point inside, store = registered point inside, edge band = 20 m both sides.
"""
import sys, re, json, math, hashlib
from pathlib import Path
from collections import Counter
import numpy as np
from shapely.geometry import Point, shape, mapping
from shapely.ops import transform

ROOT = Path(__file__).resolve().parents[1]
zones_path, case_path = Path(sys.argv[1]), Path(sys.argv[2])
Z = json.loads(zones_path.read_text())
C = json.loads(case_path.read_text())
byid = {f['properties']['id']: f for f in Z['features']}
zk = byid['zoneK']
assert zk['properties']['area_m2'] == 217510 and len(zk['properties']['blocks']) == 26
poly = shape(zk['geometry']); assert poly.is_valid and poly.geom_type == 'Polygon' and not poly.interiors

scale = np.array([111320 * math.cos(math.radians(35.232)), 111320]); origin = np.array([128.88, 35.23])
def metric(g):
    return transform(lambda x, y, z=None: ((np.array(x) - origin[0]) * scale[0], (np.array(y) - origin[1]) * scale[1]), g)
pm = metric(poly); review = pm.boundary.buffer(20)

# Area cross-check in the Korean TM projection used by the other rooms (optional dependency).
try:
    from pyproj import Transformer
    tm = Transformer.from_crs('EPSG:4326', 'EPSG:5187', always_xy=True)
    p5187 = transform(tm.transform, poly); area5187, perim5187 = round(p5187.area), round(p5187.length)
except ImportError:
    area5187 = perim5187 = None
assert area5187 is None or abs(area5187 - 217510) <= 5

html = (ROOT / 'gimhae-wondosim.html').read_text()
raw = re.search(r'<script id="dat" type="application/json">(.*?)</script>', html, re.S).group(1); D = json.loads(raw)
assert len(D['bld']['features']) == 10065 and len(D['store']) == 5414
inside, edges, touch, skipped = [], [], [], []
bands, uses, dongs = Counter(), Counter(), Counter(); known = old = 0
for i, f in enumerate(D['bld']['features']):
    geom = shape(f['geometry'])
    if geom.is_empty or not geom.is_valid: skipped.append(i); continue
    gm = metric(geom); included = pm.covers(gm.representative_point())
    if review.intersects(gm): edges.append(i)
    if gm.intersects(pm) and not included: touch.append(i)
    if not included: continue
    inside.append(i); p = f['properties']; yr = p.get('yr') or 0
    known += int(yr > 0); old += int(0 < yr <= 2006)
    bands['미확인' if not yr else '40년 이상' if yr <= 1986 else '30~39년' if yr <= 1996 else '20~29년' if yr <= 2006 else '10~19년' if yr <= 2016 else '10년 미만'] += 1
    uses[p.get('pu') or '확인 불가'] += 1; dongs[p.get('d') or '확인 불가'] += 1
stores = [i for i, p in enumerate(D['store']) if poly.covers(Point(p['lon'], p['lat']))]
def const(n): return json.loads(re.search(r'^const ' + n + r'=(.*?);\s*$', html, re.M).group(1))
# 도로는 이 페이지의 HIER(기존 사업구역 주변만 있음) 대신 build/zone261011_context.py 가 OSM 으로 구역 전체를 다시 계산한다.
wifi = [f for f in const('WIFIPT')['features'] if poly.covers(shape(f['geometry']))]

# Relation to the page's existing ranges (all area values = this map's local metric, rounded).
zg = {f['properties']['k']: shape(f['geometry']) for f in D['zonesGeo']['features'] if f['geometry']['type'] == 'Polygon'}
oldB = json.loads((ROOT / 'data/gimhae-b171.json').read_text())
b156 = shape(oldB['boundary']['geometry']); n1 = shape(byid['zoneN1']['geometry'])
def ov(g):  # EPSG:5187 when pyproj is present (same CRS as the other rooms), else this map's local metric
    x = g.intersection(poly)
    return round(transform(tm.transform, x).area) if area5187 is not None else round(metric(x).area)
blueProps = {f['properties']['k']: f['properties'] for f in D['zonesGeo']['features']}
relation = {'blueOverlap': ov(zg['blue']), 'blueArea': blueProps['blue']['area'], 'blackSharePct': round(100 * ov(zg['black']) / (area5187 or pm.area), 1),
            'b156Overlap': ov(b156), 'n1Overlap': ov(n1), 'addedVsN1': 217510 - 145620, 'over150k': 217510 - 150000}

# 시 우선순위 13곳 — public-safe fields only (가격·소유자 의향·수도 사용/요금 연체 문구는 싣지 않는다, 2026-10-12 공개판 규칙).
banned = re.compile(r'의향|매매 의사|생각해 봄|수도|연체|체납|보증금|\d+(\.\d+)?억|price', re.I)
def clean(text):
    parts = [x for x in (text or '').split(' · ') if x and not banned.search(x)]
    return ' · '.join(parts)
sites = []
for s in sorted(C['sites'], key=lambda s: s['rank']):
    pt = Point(*s['lnglat']); dist = round(metric(poly.exterior).distance(metric(pt)), 1)
    row = {'rank': s['rank'], 'jibun': s['jibun'], 'type': s['type'], 'role': s['role'], 'use': s['use'],
           'areaNote': s.get('area_note', ''), 'state': clean(s.get('vacancy_note', '')), 'lnglat': s['lnglat'],
           'inside': poly.covers(pt), 'edgeM': dist, 'isNew': bool(s.get('is_new')), 'prev': s.get('prev')}
    assert not banned.search(json.dumps(row, ensure_ascii=False)), row
    sites.append(row)
assert len(sites) == 13 and all(s['inside'] for s in sites)

stats = {'buildings': len(inside), 'stores': len(stores), 'knownYear': known, 'unknownYear': len(inside) - known, 'old20': old,
         'oldPct': round(100 * old / known, 1), 'bands': dict(bands), 'uses': dict(uses.most_common()), 'dongs': dict(dongs.most_common()),
         'industries': dict(Counter(D['store'][i]['L'] for i in stores).most_common()),
         'wifiInside': len(wifi), 'edgeInside': len(set(edges) & set(inside))}
# The other rooms (종합분석맵·누리집, ENVMAP 엔진 52d5d7f) counted the same 10,065-building source: 923동·91.7%·294곳.
assert (stats['buildings'], stats['oldPct'], stats['stores']) == (923, 91.7, 294), stats
digest = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
data = {'version': '2026-10-11-confirmed', 'id': 'zoneK', 'name': '확정 구역계', 'confirmed': '2026-10-11',
        'area': 217510, 'areaHa': 21.75, 'area5187': area5187, 'areaLocal': round(pm.area), 'blocks': 26, 'perimeterM': perim5187 or round(pm.length),
        'source': '2026-10-11 확정선(종합분석맵 화면 위에 그린 선)을 도로 중심선으로 나뉜 블록 26개로 맞춘 도형',
        'sourceNote': '도로 중심선 = OpenStreetMap(2026-10-07 받음) · 북서 경계 일부 = 봉황대공원(OSM) · 면적 = 경계 도형 계산값(지적 아님)',
        'edgeReviewM': 20,
        'boundary': {'type': 'Feature', 'properties': {'k': 'zoneK', 'n': '확정 구역계 21.8ha', 'c': '#59ffd1', 'w': 4}, 'geometry': zk['geometry']},
        'compare': {
            'b156': {'type': 'Feature', 'properties': {'k': 'b156', 'n': '9/30 B권역 검토선 15.6ha', 'area': oldB['computedArea']}, 'geometry': oldB['boundary']['geometry']},
            'n1': {'type': 'Feature', 'properties': {'k': 'n1', 'n': '10/8 ①안 14.6ha', 'area': 145620}, 'geometry': byid['zoneN1']['geometry']}},
        'relation': relation,
        'buildingIndices': inside, 'edgeBuildingIndices': edges, 'intersectOutsideIndices': touch, 'storeIndices': stores, 'skippedGeometryIndices': skipped,
        'stats': stats, 'wifiInside': wifi, 'sites': sites,
        'embeddedDataSHA256': hashlib.sha256(raw.encode()).hexdigest(),
        'provenance': {'zonesSHA256': digest(zones_path), 'caseSHA256': digest(case_path), 'zonesFile': 'synmap/data/gimhae_261011/raw/zones_261011.geojson (zoneK)',
                       'caseFile': 'synmap/web/cases/gimhae_261011/case.json (sites)', 'crossCheck': 'ENVMAP 엔진·종합분석맵·누리집과 같은 원자료로 923동·91.7%·294곳 일치'}}
(ROOT / 'data/gimhae-zone-261011.json').write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')))
print(json.dumps({'area5187': area5187, 'areaLocal': data['areaLocal'], 'stats': {k: stats[k] for k in ['buildings', 'stores', 'knownYear', 'unknownYear', 'old20', 'oldPct', 'edgeInside', 'wifiInside']},
                  'edges': len(edges), 'touch': len(touch), 'dongs': stats['dongs'], 'relation': relation}, ensure_ascii=False, indent=1))
