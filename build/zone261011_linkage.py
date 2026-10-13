"""확정 구역계(2026-10-11)에 이전 방들이 쌓은 자료를 합친다 — 종합분석맵 분석값·시 제공 사진·건축물대장(구역 안 583동·13곳 층별).

Usage: python3 build/zone261011_linkage.py CASE_DIR PHOTO_DIR LEDGER_XLSX
  CASE_DIR    = ~/dev/synmap/web/cases/gimhae_261011  (case.json — 경로·등시선·지표, 종합분석맵 10/11판)
  PHOTO_DIR   = ~/dev/synmap/data/gimhae_261011/raw/photos  (김해시 「사업대상지 검토 사진」 2026-10-08 수령, site_01~13.webp)
  LEDGER_XLSX = 김해_초광역/구역내건물주소_전기사용량_261013/김해원도심_구역내_건물주소_대장상세_내부작업용_261013.xlsx
                (건축HUB 표제부·층별개요 2026-10-13 조회 — 다른 방 작업. 공개 가능한 대장 항목만 옮긴다: 소유자·가격 없음)
순서: zone261011_vacancy.py 다음, update_gimhae_meeting_261011.py 전.
"""
import sys, json, math, shutil, re
from pathlib import Path
from collections import Counter
import openpyxl
from shapely.geometry import shape, LineString, mapping
from shapely.ops import transform
from pyproj import Transformer

ROOT = Path(__file__).resolve().parents[1]
case_dir, photo_dir, ledger_xlsx = (Path(a).expanduser() for a in sys.argv[1:4])
ZP = ROOT / 'data/gimhae-zone-261011.json'
Z = json.loads(ZP.read_text()); poly = shape(Z['boundary']['geometry'])
C = json.loads((case_dir / 'case.json').read_text())
assert C['id'].startswith('gimhae_261011') or 'gimhae' in C['id']
to_metric = Transformer.from_crs(4326, 5187, always_xy=True).transform
ind = {i['id']: i for i in C['indicators']}
names = {p['id']: p['name'] for p in C['places']}

# 1. 종합분석맵 분석값 — 경로·등시선은 구역 경계로 다시 판정
routes = []
for r in C['routes']:
    L = LineString(r['coords']); inside = round(transform(to_metric, L.intersection(poly)).length)
    routes.append({'from': names.get(r['from'], r['from']), 'to': names.get(r['to'], r['to'].replace('site_', '거점 부지 ')), 'kind': r['kind'],
                   'lengthM': r['length_m'], 'minutes': r['minutes'], 'activeShare': r.get('active_share'), 'insideM': inside})
tour = [r for r in routes if r['kind'] == 'to_place']
iso10 = [x for x in C['isochrones'] if x['minutes'] == 10]
pick = lambda k: {'label': ind[k]['label'], 'display': ind[k]['display'], 'scope': ind[k].get('scope', '')}
Z['linkage'] = {
    'source': '종합분석맵 10/11판(OSM 보행망 2026-10-08·경전철 승하차 KRIC·관광 입장객·공공와이파이 정보공개) — 같은 확정 구역계',
    'tourRoutes': len(tour), 'tourRoutesThroughZone': sum(1 for r in tour if r['insideM'] > 30),
    'hubRoutes': [r for r in routes if r['kind'] == 'to_site'],
    'zoneIn10min': ind['zone_in_10min']['value'],
    'loop': {'lengthM': C['loop']['length_m'], 'minutes': round(C['loop']['minutes']), 'order': C['loop']['site_order']},
    'indicators': {k: pick(k) for k in ['ridership_3st_daily_2025', 'ridership_3st_vs2019', 'suro_visitors_vs2019', 'museum_visitors_vs2019',
                                         'wifi_total_yoy_aug', 'tour_routes_corridor', 'gaps_total', 'pop_wondosim3_15_25', 'biz_wondosim3_21_24', 'biz_hoehyeon_21_24']},
    'layers': {'iso10': {'type': 'FeatureCollection', 'features': [{'type': 'Feature', 'properties': {'station': names.get(x['place_id'], x['place_id'])}, 'geometry': x['geometry']} for x in iso10]},
               'loop': {'type': 'Feature', 'properties': {'lengthM': C['loop']['length_m']}, 'geometry': {'type': 'LineString', 'coordinates': C['loop']['coords']}},
               'tour': {'type': 'FeatureCollection', 'features': [{'type': 'Feature', 'properties': {'from': names.get(r['from'], r['from']), 'to': names.get(r['to'], r['to'])}, 'geometry': {'type': 'LineString', 'coordinates': r['coords']}} for r in C['routes'] if r['kind'] == 'to_place']}},
}
assert Z['linkage']['tourRoutes'] == 20 and Z['linkage']['tourRoutesThroughZone'] == 0, Z['linkage']['tourRoutesThroughZone']

# 2. 시 제공 현장 사진 — 공개판 종합분석맵에 이미 실린 사진(설명 문구는 싣지 않음)
out = ROOT / 'data/gimhae-sites'; out.mkdir(exist_ok=True)
for t in Z['sites']:
    src = photo_dir / f"site_{t['rank']:02d}.webp"; assert src.exists(), src
    shutil.copyfile(src, out / src.name); t['photo'] = f"data/gimhae-sites/{src.name}"
Z['sitePhotoSource'] = '김해시 「사업대상지 검토 사진」(2026-10-08 수령, 일부는 지도 거리 사진 캡처)'

# 3. 건축물대장(2026-10-13 조회) — 구역 안 583동 집계 + 13곳 대장 요약·층별 개요
wb = openpyxl.load_workbook(ledger_xlsx, read_only=True, data_only=True)
def table(name):
    rows = list(wb[name].iter_rows(values_only=True)); h = rows[3]
    return [dict(zip(h, r)) for r in rows[4:] if r and r[0] is not None and str(r[0]).isdigit()]
bl = table('건물별 대장 상세')
yrs = [int(str(d['사용승인일'])[:4]) for d in bl if d['사용승인일'] and str(d['사용승인일'])[:4].isdigit()]
old20 = sum(y <= 2006 for y in yrs); old30 = sum(y <= 1996 for y in yrs)
Z['ledger'] = {'source': '국토교통부 건축HUB 건축물대장 표제부(2026-10-13 조회) — 구역 안 지번 점 기준', 'buildings': len(bl),
               'main': sum(d['주/부속'] == '주건축물' for d in bl), 'parcels': len({d['지번'] for d in bl}), 'knownYear': len(yrs),
               'old20': old20, 'old20Pct': round(100 * old20 / len(yrs), 1), 'old30Pct': round(100 * old30 / len(yrs), 1),
               'uses': dict(Counter(d['주용도'] or '확인 불가' for d in bl).most_common(8)),
               'energyApi': dict(Counter(d['건물에너지 API'] for d in bl))}
assert Z['ledger']['buildings'] == 583 and Z['ledger']['old20Pct'] >= 50
s13 = {int(d['순위']): d for d in table('13개 거점')}
floors = {}
for d in table('13개 거점 층별'):
    if not (d['층'] or d['주용도'] or d['면적㎡']): continue   # 건물 없는 9·10·11번의 빈 줄
    floors.setdefault(int(d['순위']), []).append({'floor': d['층'], 'use': d['주용도'], 'useDetail': d['기타 용도'], 'areaM2': d['면적㎡'], 'bldg': d['동 명칭']})
for t in Z['sites']:
    d = s13[t['rank']]; assert str(d['지번(필지)']) in t['jibun']
    t['ledger'] = None if not d['주용도'] else {'use': d['주용도'], 'floors': d['지상/지하'], 'siteM2': d['대지면적㎡'], 'grossM2': d['연면적㎡'],
                                                'bcr': d['건폐율%'], 'far': d['용적률%'], 'approved': d['사용승인일'], 'bldgs': d['대장 동 수'], 'energyApi': d['건물에너지 API']}
    t['floorsDetail'] = floors.get(t['rank'], [])
    if t['ledger'] and '대장 미확보' in t.get('areaNote', ''): t['areaNote'] = t['areaNote'].replace('대장 미확보(10/8 신규)', '10/8 신규 · 대장 10/13 확보')
    if t['rank'] == 13: t['prevHub'] = '8월 검토 거점②(공구상가·안전볼트상사, 가락로49번길 10-3)와 같은 필지 — 대장 다동'
banned = re.compile(r'소유|의향|억|보증금|연체|수도')
assert not banned.search(json.dumps([t.get('ledger') for t in Z['sites']] + [t.get('floorsDetail') for t in Z['sites']], ensure_ascii=False))
ZP.write_text(json.dumps(Z, ensure_ascii=False, separators=(',', ':')))
print(json.dumps({'tourThroughZone': Z['linkage']['tourRoutesThroughZone'], 'hub': [(r['from'], r['minutes'], r['insideM']) for r in Z['linkage']['hubRoutes']],
                  'ledger': {k: Z['ledger'][k] for k in ['buildings', 'main', 'parcels', 'knownYear', 'old20Pct', 'old30Pct']}, 'photos': len(list(out.glob('*.webp')))}, ensure_ascii=False))
