"""공실·거점 위치 탭 자료(data/gimhae-meeting.json)를 확정 구역계(1안, 2026-10-30) 기준으로 갱신한다.

Usage: python3 build/update_gimhae_meeting_261030.py   (먼저 rebuild_gimhae_zone261030.py 를 돌려 둘 것)
- 글·근거·상태는 10/13판(update_gimhae_meeting_261011.py 결과) 그대로 두고, 안팎 판정(inside)·경계 거리(edgeM)만 1안으로 다시 계산
- 시 우선순위 13곳: 구역 밖 4곳(2·8·11·13)은 지우지 않고 「구역 밖(재배치 검토 중)」 표시(대표 결정 대기)
- 공개 매물(자5·자6)은 10/13 확인분 — 방 ⑦ 재수집 결과(vacancy.listings)가 data/gimhae-zone-261030.json 에 들어오면 그걸로 바꾼다
여러 번 돌려도 결과가 같다.
"""
import json, math, re
from pathlib import Path
import numpy as np
from shapely.geometry import Point, shape
from shapely.ops import transform

ROOT = Path(__file__).resolve().parents[1]
M = json.loads((ROOT / 'data/gimhae-meeting.json').read_text())
Z = json.loads((ROOT / 'data/gimhae-zone-261030.json').read_text())
assert Z['version'] == '2026-10-30-zone1an' and M['version'] in ('2026-10-13-v3', '2026-10-30-1an') and len(M['places']) == 25
poly = shape(Z['boundary']['geometry'])
scale = np.array([111320 * math.cos(math.radians(35.232)), 111320]); origin = np.array([128.88, 35.23])
metric = lambda g: transform(lambda x, y, z=None: ((np.array(x) - origin[0]) * scale[0], (np.array(y) - origin[1]) * scale[1]), g)
edge = lambda c: round(metric(poly.exterior).distance(metric(Point(*c))), 1)
site = {t['rank']: t for t in Z['sites']}
places = []
for p in M['places']:
    p = dict(p)
    if p['source'] == 'city':
        t = site[p['rank']]; assert p['address'] == t['jibun']
        p['inside'], p['edgeM'] = t['inside'], t['edgeM']
        p['zoneStatus'] = t['zoneStatus']
        p['checked'] = '지번 위치·확정 구역계(1안) 판정 2026-10-30'
    elif p.get('coordinates'):
        p['inside'] = poly.covers(Point(*p['coordinates'])); p['edgeM'] = edge(p['coordinates'])
    p['detail'] = re.sub(r'확정 구역계(\(1안\))? (안|밖)', lambda m: f'확정 구역계(10/11) {m.group(2)}' if not m.group(1) else m.group(0), p['detail'])
    places.append(p)
assert {p['rank'] for p in places if p['source'] == 'city' and p['inside']} == set(Z['sitesSummary']['inside'])
banned = re.compile(r'의향|매매 의사|생각해 봄|수도|연체|체납|보증금|월세 \d|만원|권리금')
for p in places: assert not banned.search(json.dumps(p, ensure_ascii=False)), p['id']
M['version'] = '2026-10-30-1an'
M['scope'] = f"확정 구역계(1안) {Z['area'] / 10000:.1f}ha({Z['confirmed']}) · 시 우선순위 13곳(10/8) + 10/1 후보 10건"
M['places'] = places
(ROOT / 'data/gimhae-meeting.json').write_text(json.dumps(M, ensure_ascii=False, indent=1) + '\n')
inside = lambda src: [p['id'] for p in places if p['source'] == src and p['inside']]
print(json.dumps({'places': len(places), 'city_inside': inside('city'), 'official_inside': inside('official'), 'research_inside': inside('research'),
                  'no_coords': [p['id'] for p in places if not p.get('coordinates')],
                  'edge': {p['id']: p.get('edgeM') for p in places}}, ensure_ascii=False))
