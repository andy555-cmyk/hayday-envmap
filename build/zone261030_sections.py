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
# 정류장 — 원자료(⑦ context bus, GIS 보행·교통 자료와 같은 소수 6자리 원좌표). 화면 칸 모양(name·daily)으로 옮긴다. daily = 평일 하루 평균
B = X['bus']; sh = lambda L: [{'name': b['name'], 'code': b['code'], 'daily': b['weekday'], 'weekend': b['weekend'], 'edgeM': b['edgeM']} for b in L]
X['bus'] = {'inside': sh(B['inside']), 'edge': sh(B['edgeRoadside10m']), 'within300': sh(B['inside'] + B['within300']), 'source': B['source'].split(' · 좌표')[0]}
assert (len(X['bus']['inside']), len(X['bus']['edge']), len(X['bus']['within300']), sum(b['daily'] for b in X['bus']['within300'])) == (1, 2, 23, 6777), B['counts']
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
# r1·r2 는 이 화면이 정본으로 바로잡는다 — r1 「지적선 정리 예정」은 지난 문구, r2 는 원도심 3동(동상동 포함)이 아닌 1안 행정동(회현·부원) 합계
DC = js('decline_criteria_by_dong_zone1an.json')['rows']
I1, I2, II1, II2 = (DC['합계'][k] for k in ('I_1', 'I_2', 'II_1', 'II_2'))
assert (I1['max'], I1['y2025'], I1['change_pct'], II1['max'], II1['y2024'], II1['change_pct']) == (21789, 16792, -22.9, 4256, 4037, -5.1), (I1, II1)
NOW = {'r1': lambda t: t.replace('도로 안쪽 가장자리 기준 · 지적선 정리 예정', '카카오맵 면적재기 선 · 도로 안쪽 가장자리 기준 · 지적 경계 아님'),
       'r2': lambda t: (f"1안이 걸친 행정동 회현동·부원동 합계로 인구가 {I1['max_year']}년 {I1['max']:,}명에서 2025년 {I1['y2025']:,}명으로 줄었고({I1['change_pct']}%, {I2['longest_consecutive_decline_years']}년 연속 감소), "
                        f"사업체 수가 {II1['max_year']}년 {II1['max']:,}개에서 2024년 {II1['y2024']:,}개로 줄었습니다({II1['change_pct']}%, {II2['longest_consecutive_decline_years']}년 연속 감소). "
                        f"구역 안 건축물대장 516동 중 연도 확인 513동, 20년 이상 431동(84.0%)이라 두 동 합계로 3개 요건을 모두 충족합니다. "
                        f"동별로는 회현동 2/3(사업체 요건 미충족, {DC['회현동']['II_1']['change_pct']}%) · 부원동 3/3입니다. 신청 때 법정 범위·양식으로 다시 확인합니다.")}
for r in REQ:
    if r['id'] in NOW: r['now'] = NOW[r['id']](r['now'])
assert '지적선 정리 예정' not in REQ[0]['now'] and '원도심 3동' not in REQ[1]['now']
OLDP = js('decline_criteria_by_dong_zone1an.json')['III_old_buildings']['rows']
mk = lambda ok: '충족' if ok else '미충족'
Z['decline'] = {'rows': [{'dong': n, 'I1': DC[n]['I_1']['change_pct'], 'I1met': DC[n]['I_1']['met'], 'I2': DC[n]['I_2']['longest_consecutive_decline_years'], 'I2met': DC[n]['I_2']['met'],
                          'II1': DC[n]['II_1']['change_pct'], 'II1met': DC[n]['II_1']['met'], 'II2': DC[n]['II_2']['longest_consecutive_decline_years'], 'II2met': DC[n]['II_2']['met'],
                          'III': OLDP[n]['old_bld_pct_20y_plus'] if n != '합계' else 84.0, 'IIImet': True,
                          'judge': R[f'쇠퇴 요건 — {n}(행정동 전체)' if n != '합계' else '쇠퇴 요건 — 두 동 합계']} for n in ('회현동', '부원동', '합계')],
                'note': 'Ⅰ 인구(Ⅰ-1 30년 최다 대비 20% 이상 감소 · Ⅰ-2 최근 5년 중 3년 연속 감소) · Ⅱ 사업체(Ⅱ-1 10년 최다 대비 5% 이상 감소 · Ⅱ-2 최근 5년 중 3년 연속 감소) · Ⅲ 20년 이상 건축물 50% 이상. 행정동 전체 값(구역 안 값 아님)',
                'source': '통계청 인구총조사·행정안전부 주민등록(12월 말)·김해시 기본통계 전국사업체조사(2015~2024) · Ⅲ 회현·부원은 2035 김해시 도시재생전략계획(안) 표(2022.12), 합계는 구역 안 건축물대장 516동 중 연도 확인 513동 직접 집계(2026-10-30)'}
Z['requirements'] = {'items': [{'id': r['id'], 'title': r['title'], 'status': r['status'], 'label': LAB[r['status']], 'now': r['now']} for r in REQ],
                     'culture': [], 'url': 'https://andy555-cmyk.github.io/hayday-envmap/gimhae-recore/',
                     'source': '김해 원도심 RE:CORE 사업 안내 누리집 「요건 점검」(국토부 가이드라인 설명회본 2026.9.11 기준, 확정 구역계(1안) 2026-10-30 판)'}

# 한국부동산원 표본 상권 「김해시청/동상시장」(R-ONE 상권구획도 2024.3Q)과 겹침 — 13.7% 공실률을 구역 값으로 쓰지 않는 근거.
# 소진공 상권(정본표 「소진공 상권 겹침」 김해부원동우체국 66.4%)과는 출처가 다른 별개 값이다
import base64, gzip, math, re
from shapely.affinity import scale
from shapely.geometry import Point, Polygon, shape
RG = json.loads((ROOT / 'build/data/rone_gimhae_markets_2024q3.geojson').read_text())
MK = shape(next(f for f in RG['features'] if f['properties']['sec_nm'] == '김해시청/동상시장')['geometry'])
ZR = Polygon(Z['boundary']['geometry']['coordinates'][0])
kx = math.cos(math.radians(ZR.centroid.y))                       # 경위도 → 동서 길이 보정(비율만 쓰므로 이 정도로 충분)
overlap = round(100 * scale(ZR.intersection(MK), kx, 1, origin=(0, 0)).area / scale(ZR, kx, 1, origin=(0, 0)).area, 1)
GJ = json.loads(gzip.decompress(base64.b64decode(re.match(r'window\.__GIMHAE__="([^"]+)"', (ROOT / 'data/gimhae.js').read_text()).group(1))))
inz = [q for q in GJ['store'] if ZR.contains(Point(q[0], q[1]))]
assert len(inz) == R['점포 수(전 층)'], len(inz)
# 건물 = 구역 안 704동(윤곽 기준점) 중 상권 도형 안. 면적 = 겹침 비율 × 공식 표기 면적(화면 비율과 같은 값)
H = (ROOT / 'gimhae-wondosim.html').read_text()
BLD = json.loads(re.search(r'<script id="dat" type="application/json">(.*?)</script>', H, re.S).group(1))['bld']['features']
bin_ = sum(MK.contains(shape(BLD[i]['geometry']).representative_point()) for i in Z['buildingIndices'])
OLDR = json.loads((ROOT / 'data/gimhae-zone-261011.json').read_text())['rone']   # 상권 자체 값(다른 표본 상권·최신 공실률) — 구역과 무관
Z['rone'] = {'market': '김해시청/동상시장', 'code': '6480062', 'types': OLDR['types'], 'overlapPct': overlap, 'overlapM2': round(Z['area'] * overlap / 100), 'oldOverlapPct': 98.8,
             'storesIn': sum(MK.contains(Point(q[0], q[1])) for q in inz), 'bldIn': bin_, 'others': OLDR['others'],
             'latest': {'quarter': '2026.2Q', 'smallVacancyPct': 13.7, 'smallRentWonPerM2': 12200},
             'geometry': next(f for f in RG['features'] if f['properties']['sec_nm'] == '김해시청/동상시장')['geometry'],
             'sitesIn': [x['rank'] for x in Z['sites'] if MK.contains(Point(x['lnglat']))],
             'source': '한국부동산원 R-ONE 상권구획도(2024.3Q 재구획) ∩ 확정 구역계(1안) · 면적 비율, 점포는 상가(상권)정보 2026-06'}

# 정본표 행 그대로 보강 칸(값마다 기준·기준일). 출처 문구는 공개용으로 짧게 — 내부 파일 경로·방 이름은 싣지 않는다
DT = {r['항목']: r['기준일'] for r in C['rows']}
def ex(label, keys, fmt, src):
    for k in keys: assert k in R, k
    return {'label': label, 'value': fmt(*(R[k] for k in keys)), 'source': src, 'asof': DT[keys[0]]}
Z['extra1an'] = [
    ex('용도지역 구성', ['용도지역 구성 — 제2종일반주거지역', '용도지역 구성 — 일반상업지역', '용도지역 구성 — 준주거지역'],
       lambda a, b, c: f'제2종일반주거 {a}% · 일반상업 {b}% · 준주거 {c}%', '용도지역 도형 ∩ 구역 ÷ 구역 면적'),
    ex('땅 높이·경사', ['평균 해발', '해발 범위', '평균 경사'], lambda a, b, c: f'평균 해발 {a}m(범위 {b}m) · 평균 경사 {c}°',
       'Copernicus GLO-30 수치표면모델(30m, 건물 높이 섞임 — 참고값)'),
    ex('최고 층수', ['최고 층수(윤곽 기준)'], lambda a: f'{a}층', '건물 윤곽 자료 층수 · 구역 안 704동'),
    ex('봉황예술극장', ['봉황예술극장'], lambda a: f'구역 {a}', '장소 좌표 → 구역 경계 직선거리'),
    ex('주변 거점까지 거리(경계 최단 직선)', ['봉황동 유적(봉황대공원) → 구역 거리', '수로왕릉 → 구역 거리', '수로왕릉역 → 구역 거리', '김해시청역 → 구역 거리',
        '외국인근로자지원센터 → 구역 경계 직선거리', '김해시가족센터 → 구역 경계 직선거리', '가야글로벌센터 → 구역 경계 직선거리'],
       lambda a, b, c, d, e, f, g: f'봉황동 유적(봉황대공원) {a}m · 수로왕릉 {b}m · 수로왕릉역 {c}m · 김해시청역 {d}m · 외국인근로자지원센터 {round(e)}m · 김해시가족센터 {round(f)}m · 가야글로벌센터 {round(g)}m',
       '장소·역 좌표 → 구역 경계 최단 직선거리(구역 밖)'),
    ex('다른 경계와 겹침', ['기존 사업구역(B권역 검토선 9/30) 겹침', '초광역 구역계 겹침'], lambda a, b: f'기존 사업구역(9/30 검토선) {a:,}㎡ · 초광역 구역계 {b:,}㎡',
       '도형 겹침 평면 계산'),
    ex('현장 촬영 길', ['구역 안 길(현장 촬영 길)'], lambda a: f'구역 안 {a}길 · 5,792m (촬영 길 전체 130 = 이전 92 + 새 38, 구역 밖 42)', '현장 촬영 길을 확정 구역계(1안)로 다시 셈'),
    ex('연도 입면 1층 상업 비율', ['연도 입면 1층 상업 비율(1안 36노선·69면)'], lambda a: f"{a.split('(')[0]} — 길가 앞줄 건물 643동 중 약 383동이 1층 상업 (36노선·69면)", '현장 360° 영상·로드뷰(2025.03) 건물 정면 판독, 동 수 가중'),
    ex('쇠퇴 요건(행정동)', ['쇠퇴 요건 — 회현동(행정동 전체)', '쇠퇴 요건 — 부원동(행정동 전체)', '쇠퇴 요건 — 두 동 합계'],
       lambda a, b, c: f'회현동 {a} · 부원동 {b} · 두 동 합계 {c}(Ⅲ 노후 합계는 구역 건축물대장 84.0%)', '인구총조사·주민등록·전국사업체조사(행정동 전체 — 구역 안 값 아님)')]
assert '88길' not in R['구역 안 길(현장 촬영 길)'] if isinstance(R['구역 안 길(현장 촬영 길)'], str) else R['구역 안 길(현장 촬영 길)'] == 88

# 새 구역으로 다시 계산하지 않은 항목 — 「자료 없음(이유)」
Z['missing'] = [
    {'item': '공실률', 'reason': '현장·시 확인 전이라 내지 않음. 부동산원 공실률은 표본 상권 건물의 값이라 구역 공실률로 쓰지 않음'},
    {'item': '입구별로 맡는 점포 수', 'reason': '확정 구역계(1안)는 진출입구 20곳이 모두 골목이라 큰길 입구 기준 배정을 다시 계산하지 않음'},
    {'item': '차량 교통량 조사지점', 'reason': '구역 안에 국가 교통량 조사지점이 없음. 경계까지 거리는 새 구역으로 다시 재지 않음'},
    {'item': '실거래 신고 흐름', 'reason': '법정동 단위로만 공개돼 구역만의 값을 낼 수 없음(지번 일부 비공개)'},
    {'item': '현장 인터뷰(2026-08)', 'reason': '조사 권역이 새 구역과 달라 다시 고르지 않음 — 새 구역 현장 조사 때 다시 받음'},
    {'item': '부원동 수도 사용량', 'reason': '시 회신이 봉황동만 있음(부원동 자료 없음)'}]
Z['pending'] = {}
Z.pop('pendingNote', None)  # 다시 모으기 끝 — 「다시 모으는 중」 문구를 남기지 않는다

blob = json.dumps({k: Z[k] for k in ('survey', 'context', 'vac1an', 'requirements', 'missing', 'rone', 'decline', 'extra1an')}, ensure_ascii=False).replace('대표콘텐츠', '')  # 사업 용어 「대표콘텐츠」는 사람 호칭이 아니다
for bad in ['⑦', '코덱스', '클로드', '대표', '남실장', '010-', '208,622', '208622', '21.8ha', '217,510', '869m', '26개 블록', '옛 확정안', '보증금']:
    assert bad not in blob, bad
ZP.write_text(json.dumps(Z, ensure_ascii=False, separators=(',', ':')) + '\n')
print(json.dumps({'survey': counts, 'rail': [(t['name'], t['distM']) for t in X['rail']], 'funnel': [x['count'] for x in Z['vac1an']['funnel']],
                  'req': {v: sum(r['label'] == v for r in Z['requirements']['items']) for v in LAB.values()}, 'missing': len(Z['missing']), 'rone': Z['rone']}, ensure_ascii=False))
