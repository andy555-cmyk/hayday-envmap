"""Rebuild the confirmed RE:CORE boundary — 구역계(1안), 2026-10-30 대표 확정 — against this page's embedded data.

Usage: <pyproj·shapely 있는 파이썬> build/rebuild_gimhae_zone261030.py ZONE1AN.geojson OLD_ZONEK.geojson OLD_ZONE_JSON
  ZONE1AN       = 본부 02_도시기획_로컬브랜딩/김해_초광역/구역계1안_확정_261030/김해_구역계1안_정본_261030.geojson (정본, 읽기만)
  OLD_ZONEK     = 같은 폴더 옛_확정구역계_zoneK_217510_261011.geojson (회색 점선 비교용)
  OLD_ZONE_JSON = data/gimhae-zone-261011.json (시 13곳의 지번 속성 — 공시지가·대장·사진 등 경계와 무관한 값만 옮김)
Writes data/gimhae-zone-261030.json. 옛 rebuild_gimhae_zone261011.py·data/gimhae-zone-261011.json 은 그대로 둔다.
경계는 여기서 고치지 않는다(읽고 세기만). 포함 규칙은 10/11판과 같다:
building = representative point inside, store = registered point inside, edge band = 20 m both sides.
구역 안 원자료(상권·공실·인허가·전기·토지이음·도로 등)는 방 ⑦ 재수집 결과로 다음 단계 스크립트가 채운다 — 이 파일은 `pending` 목록에 적어 둔다.
화면 숫자는 방 ① 숫자정본표(구역계1안_확정_261030/숫자정본표_구역계1안_261030.json)와 대조한다(build/zone261030_reconcile.py).
"""
import sys, re, json, math, hashlib
from pathlib import Path
from collections import Counter
import numpy as np
from shapely.geometry import Point, shape
from shapely.ops import transform
from pyproj import Transformer

ROOT = Path(__file__).resolve().parents[1]
zone_path, old_path, old_json_path = (Path(a).expanduser() for a in sys.argv[1:4])
Z = json.loads(zone_path.read_text()); OLDK = json.loads(old_path.read_text()); OJ = json.loads(old_json_path.read_text())
AREA = 208778              # 공식 표기(카카오맵 면적재기 실측, 대표 확정) — 화면에는 이 값만 쓴다
AREA_TOL = 0.005           # 도형 계산값 허용 오차 ±0.5% (정본 안내: EPSG:5181 평면 계산 208,622㎡ = −0.07%)
INSIDE_SITES = {1, 3, 4, 5, 6, 7, 9, 10, 12}   # 정본 안내 — 2·8·11·13 은 구역 밖(재배치 검토 중, 대표 결정 대기)
assert len(Z['features']) == 1
zf = Z['features'][0]; poly = shape(zf['geometry'])
assert poly.is_valid and poly.geom_type == 'Polygon' and not poly.interiors and len(zf['geometry']['coordinates'][0]) == 21
oldk = shape(OLDK['features'][0]['geometry']) if OLDK.get('type') == 'FeatureCollection' else shape(OLDK['geometry'])

scale = np.array([111320 * math.cos(math.radians(35.232)), 111320]); origin = np.array([128.88, 35.23])
def metric(g):
    return transform(lambda x, y, z=None: ((np.array(x) - origin[0]) * scale[0], (np.array(y) - origin[1]) * scale[1]), g)
pm = metric(poly); review = pm.boundary.buffer(20)
tm = Transformer.from_crs('EPSG:4326', 'EPSG:5187', always_xy=True); t81 = Transformer.from_crs('EPSG:4326', 'EPSG:5181', always_xy=True)
p5187 = transform(tm.transform, poly); area5187, perim5187 = round(p5187.area), round(p5187.length)
area5181 = round(transform(t81.transform, poly).area)
assert abs(area5181 - AREA) / AREA <= AREA_TOL and abs(area5187 - AREA) / AREA <= AREA_TOL, (area5181, area5187)
a5 = lambda g: round(transform(tm.transform, g).area)

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
wifi = [f for f in const('WIFIPT')['features'] if poly.covers(shape(f['geometry']))]

zg = {f['properties']['k']: shape(f['geometry']) for f in D['zonesGeo']['features'] if f['geometry']['type'] == 'Polygon'}
blueProps = {f['properties']['k']: f['properties'] for f in D['zonesGeo']['features']}
ov_old = a5(poly.intersection(oldk))
relation = {'blueOverlap': a5(zg['blue'].intersection(poly)), 'blueArea': blueProps['blue']['area'],
            'blackSharePct': round(100 * a5(zg['black'].intersection(poly)) / area5187, 1),
            'oldZoneOverlap': ov_old, 'oldZoneOnly': a5(oldk.difference(poly)), 'newOnly': a5(poly.difference(oldk)),
            'over150k': AREA - 150000, 'note': '겹침·빠짐·새로 = EPSG:5187 도형 계산값(정본 안내 98,496 · 119,013 · 110,126㎡와 같은 계산)'}

# 시 우선순위 13곳 — 위치·속성은 10/8 목록 그대로(경계와 무관한 지번 속성은 10/13 조회값 유지), 소속만 새 경계로 다시 판정.
KEEP = ['rank', 'jibun', 'type', 'role', 'use', 'areaNote', 'state', 'lnglat', 'isNew', 'prev', 'officialPrice', 'landUse', 'photo', 'ledger', 'floorsDetail', 'prevHub']
banned = re.compile(r'의향|매매 의사|생각해 봄|수도|연체|체납|보증금|\d+(\.\d+)?억|price', re.I)
sites = []
for s in sorted(OJ['sites'], key=lambda s: s['rank']):
    pt = Point(*s['lnglat']); isin = poly.covers(pt); dist = round(metric(poly.exterior).distance(metric(pt)), 1)
    row = {k: s[k] for k in KEEP if k in s}
    row.update({'inside': isin, 'edgeM': dist, 'zoneStatus': '구역 안' if isin else '구역 밖(재배치 검토 중)'})
    assert not banned.search(json.dumps({k: v for k, v in row.items() if k not in ('officialPrice',)}, ensure_ascii=False)), row['rank']
    sites.append(row)
assert len(sites) == 13 and {s['rank'] for s in sites if s['inside']} == INSIDE_SITES, [s['rank'] for s in sites if s['inside']]

stats = {'buildings': len(inside), 'stores': len(stores), 'knownYear': known, 'unknownYear': len(inside) - known, 'old20': old,
         'oldPct': round(100 * old / known, 1), 'bands': dict(bands), 'uses': dict(uses.most_common()), 'dongs': dict(dongs.most_common()),
         'industries': dict(Counter(D['store'][i]['L'] for i in stores).most_common()),
         'wifiInside': len(wifi), 'edgeInside': len(set(edges) & set(inside))}
PENDING = {
    'context': '도로·진출입구·정류장·생활안전·인구', 'vacancy': '공실 신호(인허가 폐업·상가정보 분기 비교·매물)', 'landPrice': '땅값(실거래·공시지가)',
    'linkage': '연결·이용(도보권·관광 동선·13곳 한 바퀴)', 'ledger': '건축물대장 기준 노후도', 'survey': '전수조사 1차 분류', 'emptyShop': '빈 점포 후보 건물',
    'roadview': '과거 로드뷰 판독', 'energy': '전기 사용량', 'landUse537': '토지이음 지번 전수', 'heritage': '국가유산 구역 겹침', 'archPms': '건축 인허가 이력',
    'rtms': '실거래 신고(법정동)', 'rone': '부동산원 표본 상권 겹침', 'sbizZone': '소진공 상권 영역 겹침', 'licenseAll': '인허가 전 업종 흐름',
    'kakaoPlace': '카카오맵 장소', 'terrain': '땅 모양·필지', 'gateLoad': '입구별 점포', 'tms': '교통량 조사지점', 'fieldVoice': '현장 인터뷰(구역 안 다시 고름)',
    'requirements': '공모 요건 점검', 'vacRate': '건물·층별 조사자료 연결', 'bizTimeline': '개업·폐업 흐름'}
digest = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
data = {'version': '2026-10-30-zone1an', 'id': 'zone1an', 'name': '확정 구역계(1안)', 'confirmed': '2026-10-30',
        'area': AREA, 'areaHa': 20.9, 'areaCalc5181': area5181, 'areaCalc5187': area5187, 'areaLocal': round(pm.area), 'perimeterM': perim5187,
        'source': '2026-10-30 확정 구역계(1안) — 카카오맵 면적재기 선(사업계획 검토자료 38쪽 「1안 구역계 208,778㎡」)을 항공사진 좌표로 옮긴 꼭짓점 20개 도형',
        'sourceNote': '선은 도로 안쪽 가장자리를 따름(북서 봉황대길 남동쪽 가장자리 · 남 김해대로 북측 가장자리 · 동 동측 대로 서측 가장자리) · 위치 오차 ±2~3m 추정 · 면적 208,778㎡는 카카오맵 면적재기 실측 · 지적 경계 아님',
        'edgeReviewM': 20,
        'boundary': {'type': 'Feature', 'properties': {'k': 'zone1an', 'n': '확정 구역계(1안) 20.9ha', 'c': '#59ffd1', 'w': 4}, 'geometry': zf['geometry']},
        'compare': {'zoneK': {'type': 'Feature', 'properties': {'k': 'zoneK', 'n': '옛 확정 구역계(10/11)'}, 'geometry': OLDK['features'][0]['geometry']}},
        'relation': relation,
        'buildingIndices': inside, 'edgeBuildingIndices': edges, 'intersectOutsideIndices': touch, 'storeIndices': stores, 'skippedGeometryIndices': skipped,
        'stats': stats, 'statsSource': 'engine', 'wifiInside': wifi, 'sites': sites,
        'sitesSummary': {'inside': sorted(INSIDE_SITES), 'outside': sorted({s['rank'] for s in sites} - INSIDE_SITES), 'rule': '결정 전까지 구역 밖 4곳은 지우지 않고 「구역 밖(재배치 검토 중)」 표시만'},
        'sitePhotoSource': OJ.get('sitePhotoSource', ''),
        'timeline': OJ.get('timeline'),
        'pending': PENDING, 'pendingNote': '새 구역계(1안)로 구역 안 자료를 다시 모으는 중 — 끝나는 대로 이어서 반영',
        'embeddedDataSHA256': hashlib.sha256(raw.encode()).hexdigest(),
        'provenance': {'zoneSHA256': digest(zone_path), 'oldZoneSHA256': digest(old_path), 'zoneFile': '구역계1안_확정_261030/김해_구역계1안_정본_261030.geojson',
                       'sitesFrom': 'data/gimhae-zone-261011.json sites(10/8 목록 · 지번 속성 10/13 조회) — 소속만 1안으로 재판정'}}
(ROOT / 'data/gimhae-zone-261030.json').write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')))
print(json.dumps({'area5181': area5181, 'area5187': area5187, 'perim': perim5187, 'stats': {k: stats[k] for k in ['buildings', 'stores', 'knownYear', 'unknownYear', 'old20', 'oldPct', 'edgeInside', 'wifiInside']},
                  'edges': len(edges), 'touch': len(touch), 'dongs': stats['dongs'], 'relation': relation,
                  'sites': [(s['rank'], s['inside'], s['edgeM']) for s in sites]}, ensure_ascii=False, indent=1))
