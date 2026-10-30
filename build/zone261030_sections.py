"""전수조사·도로·공실 신호·공모 요건 칸을 확정 구역계(1안) 자료로 채워 data/gimhae-zone-261030.json 에 넣는다.

Usage: python3 build/zone261030_sections.py <구역 안 자료 재수집 폴더(ledger/·out/)> <숫자정본표.json> <사업 안내 누리집 site.json>
       (zone261030_population.py 다음, zone261030_html.py 앞)
- survey   = 전수조사 1차 책상 판정 A~E(out/survey_ae_zone1an.csv) + 지번 위치(ledger/지번.csv). A+B 는 정본표 「장기공실 후보(A+B) 지번」과 같아야 한다
- context  = 도로·진출입구·정류장 재계산(out/context_zone1an.json). 역까지 거리는 정본표 행 값으로 덮는다
- vac1an   = 공실 신호 숫자는 정본표 행 그대로, 단계별 거르기·연차 후보는 out/vacancy_timeline_zone1an.json 그대로
- requirements = 사업 안내 누리집의 요건 점검 17개(1안 기준 문장) 그대로
- 새 구역으로 다시 계산하지 않은 항목은 「자료 없음(이유)」로 missing 에 남기고 pending 은 비운다
- 여러 번 돌려도 결과가 같다
"""
import csv, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ZP = ROOT / 'data/gimhae-zone-261030.json'
SRC = Path(sys.argv[1]).expanduser()
C = json.loads(Path(sys.argv[2]).read_text())
SITE = json.loads(Path(sys.argv[3]).expanduser().read_text())
Z = json.loads(ZP.read_text())
R = {r['항목']: r['새값'] for r in C['rows']}
rd = lambda p: list(csv.DictReader(open(SRC / p, encoding='utf-8-sig')))
js = lambda p: json.load(open(SRC / 'out' / p))

# 전수조사 1차(책상 판정) — 지번 점
LOT = {r['dong'] + ' ' + r['jibun']: r for r in rd('ledger/지번.csv')}
SV = rd('out/survey_ae_zone1an.csv')
SJ = js('survey_ae_zone1an.json')
JUDGE = {'A': 'A 장기공실 검토 후보', 'B': 'B 확인 필요', 'C': 'C 2026년 폐업·사라짐 신호', 'D': 'D 등록점포·영업 근거', 'E': 'E 대장상 주거'}
pts = [{'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [round(float(LOT[r['jibun']]['lon']), 7), round(float(LOT[r['jibun']]['lat']), 7)]},
        'properties': {'c': r['cls'], 'jibun': r['jibun'], 'road': '', 'use': r['uses'], 'kind': r['why'], 'judge': JUDGE[r['cls']],
                       'signals': f"상가정보 2026-06 등록 {r['stores_202606']}곳" if r['stores_202606'] not in ('', '0') else ''}} for r in SV]
counts = {k: sum(p['properties']['c'] == k for p in pts) for k in 'ABCDE'}
assert counts == SJ['zone1an'], (counts, SJ['zone1an'])
assert counts['A'] + counts['B'] == R['장기공실 후보(A+B) 지번'] == SJ['AB_lots']
Z['survey'] = {
    'date': '2026-10-30', 'source': f"전수조사 1차 판정(2026-10-30) — 확정 구역계(1안) 안 지번 {len(pts)}곳을 건축물대장·인허가 폐업·상가정보·시 13곳으로 나눈 책상 분류",
    'rule': '장기 공실 = 2026.1.1 이전부터 공실, 객관 증빙 3종(수도·전기 저사용 / 영업자료 미발생 / 1년 단위 반복 미사용) 중 2종 이상 — 층·호 단위(국토부 RE:CORE 가이드라인 설명회본 2026.9.11)',
    'counts': counts, 'missing': [], 'labels': {'A': '장기공실 검토 후보', 'B': '확인 필요', 'C': '2026년 폐업 신호', 'D': '등록점포 등 사용 근거', 'E': '대장상 주거'},
    'oldVsNew': SJ['zone1an_by_old_vs_new'], 'limits': SJ['limits'], 'points': {'type': 'FeatureCollection', 'features': pts}}

# 도로·교통 — 정본표 거리로 맞춘다
X = js('context_zone1an.json')
assert X['roads']['totalM'] == R['구역 안 도로 길이(OSM 차량 도로)'] and X['storeDistance']['n'] == R['점포 수(전 층)']
RAIL = {'부원': R['부원역 → 구역 거리'], '봉황': R['봉황역 → 구역 거리']}
X['rail'] = [t | {'distM': RAIL[t['name']]} for t in X['rail'] if t['name'] in RAIL]
X.pop('limits', None)
X['boundaryNote'] = '경계가 도로 안쪽 가장자리를 따라 그어져 경계를 이루는 도로(김해대로·가락로·봉황대길 등)는 구역 밖이다. 그래서 구역 안 차량 도로는 블록 안 골목뿐이고 진출입구도 모두 골목이다'
Z['context'] = X

# 공실 신호 — 숫자는 정본표, 단계·연차는 재수집 결과 그대로
T = js('vacancy_timeline_zone1an.json')
RV = js('roadview_zone1an.json')
LS = js('listings_zone1an.json')['summary']
van, new = map(int, str(R['분기 사이 사라진/새로 생긴 점포 후보']).split('/'))
op25, cl25 = map(int, str(R['가게형 개업/폐업(2025)']).split('/'))
assert T['funnel_license_based'][0]['count'] == R['점포 수(전 층)'] and T['funnel_license_based'][1]['count'] == R['빈 점포 신호(폐업 뒤 새 영업 없음)']
Z['vac1an'] = {
    'collected': '2026-10-30',
    'signals': {'emptyBld': R['빈 점포 후보 건물(용도·영업 규칙)'], 'closed': R['빈 점포 신호(폐업 뒤 새 영업 없음)'], 'vanished': van, 'newStores': new,
                'stores': R['상가(상권)정보 점포 2026-06'], 'storesPrev': R['상가(상권)정보 점포 2026-03'], 'ab': R['장기공실 후보(A+B) 지번'], 'c': counts['C'],
                'water': R['수도 미사용·최근 중단 지번'], 'waterLots': R['수도 자료 있는 지번'], 'elecLow': R['전기 — 월평균 100kWh 이하 지번'],
                'elecWith': R['전기 — 값 확보 지번'], 'elecQueried': R['전기 — 조회 지번'], 'elecMedian': R['전기 — 월평균 중간값'], 'overlap': R['공실 신호 2개 이상 지번']},
    'license': {'open': R['가게형 인허가 9종 — 영업 중'], 'closed22': R['가게형 인허가 9종 — 2022년 이후 폐업'], 'records': R['인허가 208종 구역 안 기록'],
                'active': [[2016, R['가게형 인허가 영업 중(2016)']], [2023, R['가게형 인허가 영업 중(2023)']], [2025, R['가게형 인허가 영업 중(2025)']]],
                'open2025': op25, 'close2025': cl25, 'closedByYear': T['tier_projection']['annual_inflow_basis']['빈 점포 신호 폐업 연도별']},
    'funnel': [{k: x[k] for k in ('layer', 'count', 'unit', 'note') if k in x} for x in T['funnel_license_based']],
    'timeline': {'total': T['candidates_total_lots'], 'eligibleNow': T['eligible_now'], 'watch': T['watch_for_tier2plus'], 'rule': T['rule'], 'startRule': T['start_rule'],
                 'inflowAvg': T['tier_projection']['annual_inflow_basis']['평균(2022~2025)'], 'note': T['tier_note']},
    'listings': {'inside': R['공개 매물(상가·사무실·건물) 구역 안'], 'near50': LS['outside_within_50m'], 'vacancyAd': LS['main_explicit_vacancy_ad_count'], 'occupiedAd': LS['main_explicit_occupied_ad_count'],
                 'note': '당근 부동산 공개 화면 기준 · 네이버 부동산·다방·직방 목록은 공개 화면에서 받지 못함 · 현장 확인 전이라 0건으로 읽지 않음'},
    'roadview': {'lots': R['로드뷰 판독 — 새 블록 가게형 지번'], 'date': '2025-03', 'empty': RV['counts_after_recheck']['비어 보임'],
                 'hold': RV['counts_after_recheck']['일부 비어 보임→판단 보류'], 'open': RV['counts_codex']['영업 중'], 'unknown': RV['counts_codex']['판단 불가']},
    'rate': '공실률은 내지 않음 — 현장·시 확인 전. 부원동 우체국 상권 등 표본 상권의 공실률은 구역 값이 아님',
    'limits': ['모든 수는 후보이며 공실 확정이 아님', '신호마다 단위가 달라(점포·주소·건물·지번) 서로 더하지 않음', '수도 자료는 봉황동만 있어 부원동 후보가 적게 잡힘',
               '로드뷰는 2025-03 촬영 상태, 매물은 광고 문구 기준'],
    'source': '소상공인시장진흥공단 상가(상권)정보 2026-06 · 지방행정 인허가 · 건축물대장 · 김해시 수도 회신 2026.01~10 · 건물에너지 2025-06~2026-06 · 카카오 로드뷰 · 당근 부동산 공개 화면'}
Z.pop('vacancy', None)  # 옛 모양(10/11) 칸은 쓰지 않는다

# 공모 요건 — 사업 안내 누리집 1안 문장 그대로
LAB = {'ok': '충족', 'chk': '확인 필요', 'ing': '진행 중', 'no': '아직'}
REQ = SITE['requirements']
assert len(REQ) == 17 and all(r['status'] in LAB for r in REQ)
Z['requirements'] = {'items': [{'id': r['id'], 'title': r['title'], 'status': r['status'], 'label': LAB[r['status']], 'now': r['now']} for r in REQ],
                     'culture': [], 'url': 'https://andy555-cmyk.github.io/hayday-envmap/gimhae-recore/',
                     'source': '김해 원도심 RE:CORE 사업 안내 누리집 「요건 점검」(국토부 가이드라인 설명회본 2026.9.11 기준, 확정 구역계(1안) 2026-10-30 판)'}

# 새 구역으로 다시 계산하지 않은 항목 — 「자료 없음(이유)」
Z['missing'] = [
    {'item': '공실률', 'reason': '현장·시 확인 전이라 내지 않음. 부동산원 공실률은 표본 상권 건물의 값이라 구역 공실률로 쓰지 않음'},
    {'item': '입구별로 맡는 점포 수', 'reason': '확정 구역계(1안)는 진출입구 20곳이 모두 골목이라 큰길 입구 기준 배정을 다시 계산하지 않음'},
    {'item': '차량 교통량 조사지점', 'reason': '구역 안에 국가 교통량 조사지점이 없음. 경계까지 거리는 새 구역으로 다시 재지 않음'},
    {'item': '실거래 신고 흐름', 'reason': '법정동 단위로만 공개돼 구역만의 값을 낼 수 없음(지번 일부 비공개)'},
    {'item': '현장 인터뷰(2026-08)', 'reason': '조사 권역이 새 구역과 달라 다시 고르지 않음 — 새 구역 현장 조사 때 다시 받음'},
    {'item': '부원동 수도 사용량', 'reason': '시 회신이 봉황동만 있음(부원동 자료 없음)'}]
Z['pending'] = {}

blob = json.dumps({k: Z[k] for k in ('survey', 'context', 'vac1an', 'requirements', 'missing')}, ensure_ascii=False).replace('대표콘텐츠', '')  # 사업 용어 「대표콘텐츠」는 사람 호칭이 아니다
for bad in ['⑦', '코덱스', '클로드', '대표', '남실장', '010-', '208,622', '208622', '21.8ha', '217,510', '869m', '26개 블록', '옛 확정안', '보증금']:
    assert bad not in blob, bad
ZP.write_text(json.dumps(Z, ensure_ascii=False, separators=(',', ':')) + '\n')
print(json.dumps({'survey': counts, 'rail': [(t['name'], t['distM']) for t in X['rail']], 'funnel': [x['count'] for x in Z['vac1an']['funnel']],
                  'req': {v: sum(r['label'] == v for r in Z['requirements']['items']) for v in LAB.values()}, 'missing': len(Z['missing'])}, ensure_ascii=False))
