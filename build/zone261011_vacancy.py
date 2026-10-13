"""확정 구역계(2026-10-11) 기준으로 다시 모은 공실 신호·땅값 자료를 data/gimhae-zone-261011.json 에 합친다.

Usage: python3 build/zone261011_vacancy.py RECOLLECT_DIR
  RECOLLECT_DIR = ~/dev/gimhae-zone-final/codex_recollect_261013 (2026-10-13 코덱스 수집, 클로드 검증)
    A_sbiz/result.json      상가(상권)정보 2026-03 ↔ 2026-06 비교(최신 공개분 2026-06, 다음 공개 2026-10-31)
    B_localdata/result.json 지방행정 인허가(LOCALDATA) 김해시 9개 업종 — 2022년 이후 폐업 + 같은 주소 현재 영업 없음 = 빈 점포 신호
    C_listings/result.json  2026-10-13 공개 매물 재확인·빈집 공개자료
    D_landprice/result.json 13곳 개별공시지가(2026, 토지이음)·법정동 실거래 중간값(국토부)
    E_landuse/result.json   13곳 토지이용 규제(용도지역·지구·도시계획도로·역사문화환경보존지역·경관)
순서: rebuild_gimhae_zone261011.py → zone261011_context.py → 이 스크립트 → update_gimhae_meeting_261011.py
공개 페이지라 광고 가격(보증금·월세·권리금)은 싣지 않는다(2026-10-13 검수 결정).
"""
import sys, json, re, math
from pathlib import Path
from shapely.geometry import shape, Point

ROOT = Path(__file__).resolve().parents[1]
R = Path(sys.argv[1]).expanduser()
ZP = ROOT / 'data/gimhae-zone-261011.json'
Z = json.loads(ZP.read_text()); poly = shape(Z['boundary']['geometry'])
A = json.loads((R / 'A_sbiz/result.json').read_text())
B = json.loads((R / 'B_localdata/result.json').read_text())
C = json.loads((R / 'C_listings/result.json').read_text())
D = json.loads((R / 'D_landprice/result.json').read_text())
inside = lambda lon, lat: poly.covers(Point(float(lon), float(lat)))
short = lambda a: re.sub(r'^경상남도 김해시 ', '', a or '')

assert A['base_month'] == '2026-06' and A['compare_month'] == '2026-03' and A['inside_now'] == Z['stats']['stores'] == 294
vanished = [{'name': v['name'], 'kind': v['industry_small'], 'address': short(v['road_address']), 'floor': v.get('floor') or '',
             'lnglat': [round(v['longitude'], 6), round(v['latitude'], 6)]} for v in A['vanished']]
assert all(inside(*v['lnglat']) for v in vanished), 'vanished store outside zone'
# 원자료(2026-03)에 같은 점포가 상가업소번호만 달리 두 줄로 들어간 경우(층 값만 다름, 예: 엄마손세탁소)는 상호+주소+10m 로 한 곳으로 센다.
dedup, dupes = [], 0
for v in vanished:
    same = next((d for d in dedup if d['name'] == v['name'] and d['address'] == v['address'] and math.hypot((d['lnglat'][0]-v['lnglat'][0])*90950, (d['lnglat'][1]-v['lnglat'][1])*111320) <= 10), None)
    if same: dupes += 1; same['floor'] = same['floor'] or v['floor']
    else: dedup.append(v)
vanished = dedup

signals = []
for s in B['vacancy_signal']:
    assert s['판정'] == '구역 안' and inside(s['경도'], s['위도'])
    names = sorted({h['사업장명'] for h in s['폐업_이력']})
    signals.append({'names': names, 'kinds': s['업종'], 'address': short(s['도로명주소']), 'closed': s['최근_폐업일자'],
                    'records': s['폐업_인허가_건수'], 'lnglat': [round(s['경도'], 6), round(s['위도'], 6)]})
signals.sort(key=lambda s: s['closed'], reverse=True)
by_year = {y: {'open': v['개업'], 'close': v['폐업']} for y, v in sorted(B['by_year'].items())}
summ = B['source'] if isinstance(B['source'], dict) else {}

def listing(l):
    pt = l.get('advertised_map_point') or {}
    return {'kind': l['property_type'], 'deal': l['transaction_type'], 'areaM2': (l.get('area_m2') or {}).get('exclusive'),
            'floor': (l.get('floor') or {}).get('public_text'), 'state': l.get('vacancy_as_advertised'), 'note': l.get('vacancy_interpretation', ''),
            'place': l.get('approximate_location'), 'platform': l['platform'], 'url': l['url'], 'checked': l['retrieved_at'],
            'zone': l['boundary_class'], 'outsideM': l.get('distance_outside_boundary_m'), 'lnglat': [pt.get('longitude'), pt.get('latitude')] if pt else None}
listings = [listing(l) for l in C['listings']]
for l in listings: assert 'price' not in l and not re.search(r'만 ?원|보증금|권리금', json.dumps(l, ensure_ascii=False))

prices = {p['rank']: p for p in D['officialPrice']}
assert len(prices) == 13 and all(p['zoneStatus'] == '구역 안' for p in prices.values())
for t in Z['sites']:
    p = prices[t['rank']]; assert p['jibun'] == t['jibun']
    t['officialPrice'] = {'wonPerM2': p['officialPriceWonPerM2'], 'ym': p['officialPriceYearMonth'], 'land': p['landCategory'], 'areaM2': p['parcelAreaM2'], 'url': p['sourceUrl']}

E = json.loads((R / 'E_landuse/result.json').read_text())   # 13곳 토지이용 규제(토지이음, 2026-10-13)
uses = {e['rank']: e for e in E['sites']}
assert len(uses) == 13
for t in Z['sites']:
    e = uses[t['rank']]; assert e['jibun'] == t['jibun'] and e['officialPrice'] == t['officialPrice']['wonPerM2']
    nat = [x for x in e['landUseNational'] if x != '도시지역']
    t['landUse'] = {'zoning': [x for x in nat if '지역' in x and '저촉' not in x and '접합' not in x], 'district': [x for x in nat if '지구' in x],
                    'road': [x for x in nat if '저촉' in x or '접합' in x], 'other': [re.sub(r'<[^>]*>', '', x) for x in e['landUseOther']], 'article9': e['article9']}
sm = E['summary']
Z['landUseSummary'] = {'heritage': sm['historicCulturalEnvironmentConservationSiteCount'], 'landscape': sm['landscapeRelatedDesignationSiteCount'],
                       'roadConflict': sorted(t['rank'] for t in Z['sites'] if any('저촉' in x for x in t['landUse']['road'])),
                       'fireDistrict': sorted(t['rank'] for t in Z['sites'] if any('방화지구' in x for x in t['landUse']['district'])),
                       'zoning': sm['landUseZoneCounts'], 'source': '국토교통부 토지이음 토지이용계획 열람(2026-10-13)'}
Z['vacancy'] = {
    'collected': '2026-10-13',
    'sbiz': {'latest': A['base_month'], 'next': A['latest_check']['next_scheduled_registration_date'], 'compare': A['compare_month'],
             'inside': A['inside_now'], 'insideCompare': A['inside_compare'] if isinstance(A['inside_compare'], int) else len(A['inside_compare']),
             'vanished': vanished, 'vanishedDupRemoved': dupes, 'newCount': len(A['new']), 'changedCount': len(A['changed']), 'idReissued': A['id_linkage']['reissued_id_pairs_by_name_address_10m'],
             'source': '소상공인시장진흥공단 상가(상권)정보 2026-03·2026-06 원본(공공데이터포털 15083033)', 'url': A['latest_check']['source_url']},
    'localdata': {'industries': [i['업종'] for i in summ.get('industries', [])], 'insideOpen': B['summary']['inside_open'],
                  'closedSince2022': B['summary']['inside_closed_since2022'], 'signals': signals, 'byYear': by_year,
                  'noCoords': B['summary']['unclassified_no_coordinates_target_dongs'],
                  'source': '행정안전부 지방행정 인허가데이터(LOCALDATA) 김해시 업종별 파일', 'url': 'https://www.localdata.go.kr'},
    'listings': {'items': listings, 'old': [{'id': o.get('candidate_id') or o.get('id'), 'state': o.get('current_status') or o.get('status')} for o in C['old_candidates']],
                 'source': '당근 부동산·네이버 부동산 공개 상세 화면(로그인 없이)', 'limit': '네이버 부동산의 구역 전체 매물 목록은 받지 못함'},
    'emptyHouse': {'publicList': False, 'binzibeGimhae': 0, 'note': '김해시 빈집 실태조사의 주소별 목록은 공개되지 않음(빈집애 김해 등록 매물 0건, 공공데이터는 시·군 통계만)'},
}
Z['landPrice'] = {'officialYm': '2026/01', 'officialSource': '국토교통부 토지이음 개별공시지가',
                  'medians': [{'dong': m['legalDong'], 'type': m['propertyType'], 'n': m['sampleCount'], 'basis': m['areaBasis'], 'wonPerM2': m['medianPriceWonPerM2']} for m in D['summary']['medianPriceWonPerM2']],
                  'trades': {'active': D['summary']['trades']['activeCount'], 'cancelled': D['summary']['trades']['cancelledExcludedCount'], 'period': '2023-10~2026-10'},
                  'tradeSource': '국토교통부 실거래가 공개시스템(법정동 단위 — 지번 일부가 가려져 구역 안팎 판정 불가)'}
ZP.write_text(json.dumps(Z, ensure_ascii=False, separators=(',', ':')))
print(json.dumps({'vanished': len(vanished), 'signals': len(signals), 'byYear': by_year, 'listings': [(l['zone'], l['kind']) for l in listings],
                  'old': Z['vacancy']['listings']['old'], 'prices': [(t['rank'], t['officialPrice']['wonPerM2']) for t in Z['sites']]}, ensure_ascii=False))
