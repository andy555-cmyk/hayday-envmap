"""원래 환경분석맵(사업구역 51.8ha) 화면에 있던 분석을 확정 구역계(2026-10-11)로 다시 계산한다.

Usage: python3 build/zone261011_base.py RECOLLECT_DIR [MARKETS_GEOJSON]
  RECOLLECT_DIR   = ~/dev/gimhae-zone-final/codex_recollect_261013 (B_localdata/result.json 의 구역 안 인허가 전체 기록)
  MARKETS_GEOJSON = ~/dev/gimhae-zone-final/codex_base_261013/rone_verify/gimhae_markets_2024q3.geojson
                    (한국부동산원 상권구획도 2024.3Q 재구획 첨부 zip 중 김해 4개 상권 — R-ONE 게시물 seq=3516, 클로드 재계산)
다시 세는 것
  1. 빈 점포 후보 4분류 — 원래 규칙(상업·준주거 × 등록 가게 0 → 주용도·건물 이름으로 나눔) 그대로 + 구역의 66.7%가 주거지역이라 「용도지역 무관」 확장판
  2. 창업·폐업 장기 추이 — 지방행정 인허가 9개 업종, 구역 안 좌표 있는 기록 전체(1982~2026) · 3년 안 폐업 비율
  3. 입구 하나가 몇 곳을 맡나 — 구역 점포를 가장 가까운 진출입구(20곳)에 배분(직선거리)
  4. 국도·지방도 교통량 조사지점(TMS 2025)까지 거리
  5. 부동산원 공실률 표본 상권(김해시청/동상시장)과 겹치는 정도 — 원래 화면은 사업구역이 이 상권 안이라 13.7%를 직접 측정치로 썼다
순서: zone261011_survey.py 다음. 공개 페이지라 건물 이름·상호는 싣지 않는다(건물 번호만).
"""
import sys, re, json, math
from pathlib import Path
from collections import Counter, defaultdict
from shapely.geometry import shape, Point

ROOT = Path(__file__).resolve().parents[1]
R = Path(sys.argv[1]).expanduser()
ZP = ROOT / 'data/gimhae-zone-261011.json'
Z = json.loads(ZP.read_text()); poly = shape(Z['boundary']['geometry'])
html = (ROOT / 'gimhae-wondosim.html').read_text()
D = json.loads(re.search(r'<script id="dat" type="application/json">(.*?)</script>', html, re.S).group(1))
F = D['bld']['features']
kx, ky = 111320 * math.cos(math.radians(35.232)), 111320
dist = lambda a, b: math.hypot((a[0] - b[0]) * kx, (a[1] - b[1]) * ky)

# 1. 빈 점포 후보 — 이 페이지 classify() 와 같은 규칙(RESPU·NONPU·NONKW 를 화면 코드에서 그대로 읽는다)
js = lambda n: re.search(r'^const ' + n + r'=(.*?);\s*$', html, re.M | re.S).group(1)
RESPU = set(re.findall(r"'([^']+)':1", js('RESPU'))); NONPU = set(re.findall(r"'([^']+)':1", re.search(r'const NONPU=\{(.*?)\};', html, re.S).group(1)))
NONKW = re.compile(re.search(r'const NONKW=/(.*?)/;', html).group(1))
assert '단독주택' in RESPU and '업무시설' in NONPU and len(NONPU) == 18
def classify(p, anyzone):
    if p['sc'] > 0: return 'biz'
    if not anyzone and p['ec'] != 1: return 'etc'
    pu, nm = p.get('pu') or '', p.get('nm') or ''
    if pu in RESPU: return 'res'
    if not pu: return 'unk'
    if pu in NONPU or NONKW.search(nm): return 'non'
    return 'shop'
idx = Z['buildingIndices']
def tally(anyzone):
    c, byd = Counter(), defaultdict(Counter)
    for i in idx:
        p = F[i]['properties']; k = classify(p, anyzone)
        if k in ('biz', 'etc'): continue
        c[k] += 1; byd[p['d']][k] += 1
    return c, byd
c_orig, d_orig = tally(False); c_any, d_any = tally(True)
comm = sum(1 for i in idx if F[i]['properties']['z'] in ('일반상업지역', '준주거지역'))
shop_any = [i for i in idx if classify(F[i]['properties'], True) == 'shop']
shop_orig = [i for i in idx if classify(F[i]['properties'], False) == 'shop']
assert set(shop_orig) <= set(shop_any)
yr = lambda i: F[i]['properties'].get('yr') or 0
Z['emptyShop'] = {
    'rule': '등록 가게 0인 건물을 건축물대장 주용도·건물 이름으로 나눔 — 주거(단독·공동 등) / 가게 대상 아님(업무·교육·의료·종교·창고 등, 이름에 관공서·은행·학교·교회 등) / 대장 없음 / 셋 다 아닌 나머지 = 빈 점포 후보(대부분 근린생활시설)',
    'orig': {'scope': '상업·준주거 용도지역 건물만(원래 화면과 같은 규칙)', 'commBld': comm, **{k: c_orig.get(k, 0) for k in ('shop', 'res', 'non', 'unk')}},
    'any': {'scope': '용도지역 무관 — 구역 건물 923동 전체', **{k: c_any.get(k, 0) for k in ('shop', 'res', 'non', 'unk')}, 'biz': sum(1 for i in idx if F[i]['properties']['sc'] > 0)},
    'byDong': [{'dong': d, **{k: v.get(k, 0) for k in ('shop', 'res', 'non', 'unk')}} for d, v in sorted(d_any.items(), key=lambda kv: -sum(kv[1].values()))],
    'shopUse': dict(Counter(F[i]['properties']['pu'] for i in shop_any)),
    'shopZoning': dict(Counter(F[i]['properties']['z'] for i in shop_any)),
    'shopOld20': sum(1 for i in shop_any if 0 < yr(i) <= 2006), 'shopKnownYear': sum(1 for i in shop_any if yr(i) > 0),
    'shopIndices': shop_any, 'shopOrigIndices': shop_orig,
    'cls': {str(i): classify(F[i]['properties'], True) for i in idx if F[i]['properties']['sc'] == 0},   # 구역 화면의 「현장 확인 후보」 색·목록이 이 분류를 쓴다
    'source': '건물 = 이 페이지 건물 자료(VWorld 도로명주소건물 · 건축물대장 2026-08) × 상가(상권)정보 2026-06 등록 점포(건물관리번호 결합, 미매칭은 좌표 포함관계)',
    'caveat': '현장 공실 조사가 아님 · 도매·사무실 등 상가정보에 안 오르는 업종이 있어 많게 잡히는 쪽 · 2층 이상만 빈 건물도 「영업 중」으로 셈 · 전수조사 1차 판정(지번 537곳 A~E)과 모집단·단위가 달라 합하지 않는다'}

# 2. 창업·폐업 장기 추이 — 구역 안 인허가 기록 전체
B = json.loads((R / 'B_localdata/result.json').read_text())
recs = [r for r in B['inside_all'] if r['판정'] == '구역 안' and poly.covers(Point(float(r['경도']), float(r['위도'])))]
assert len(recs) == len(B['inside_all']) == B['summary']['inside_all'] == 439, len(recs)
op, cl = Counter(), Counter()
for r in recs:
    a, c = str(r.get('인허가일자') or '')[:4], str(r.get('폐업일자') or '')[:4]
    if a.isdigit(): op[int(a)] += 1
    if c.isdigit() and r['영업상태명'] == '폐업': cl[int(c)] += 1
years = list(range(min(op), 2027))
from datetime import date
def ymd(s): y, m, d = (int(x) for x in s[:10].split('-')); return date(y, m, d)
surv = {}
for lo, hi in [(2010, 2022), (2017, 2022)]:
    cohort = [r for r in recs if r.get('인허가일자') and lo <= int(r['인허가일자'][:4]) <= hi]
    early = [r for r in cohort if r['영업상태명'] == '폐업' and r.get('폐업일자') and (ymd(r['폐업일자']) - ymd(r['인허가일자'])).days <= 365 * 3]
    surv[f'{lo}-{hi}'] = {'opened': len(cohort), 'closed3y': len(early), 'pct': round(100 * len(early) / len(cohort), 1)}
peak = max(range(2010, 2027), key=lambda y: op[y])
# 하루에 10건 넘게 폐업 처리된 날 = 행정 일괄 정리로 보임(2011-07-06 19건) — 그해 막대가 튀는 이유를 같이 적는다
bulk = [(d, k) for d, k in Counter(r['폐업일자'] for r in recs if r['영업상태명'] == '폐업' and r.get('폐업일자')).most_common() if k >= 10]
# 원래 화면의 「3년 이내 폐업 37.9%」와 같은 정의 — 폐업한 기록 중 인허가일→폐업일이 3년(1,095일) 이하인 비율 · 존속 평균·중앙값
life = sorted((ymd(r['폐업일자']) - ymd(r['인허가일자'])).days / 365.25 for r in recs if r['영업상태명'] == '폐업' and r.get('폐업일자') and r.get('인허가일자'))
lifespan = {'closed': len(life), 'within3yPct': round(100 * sum(1 for x in life if x <= 3) / len(life), 1),
            'meanYears': round(sum(life) / len(life), 1), 'medianYears': round(life[len(life) // 2] if len(life) % 2 else (life[len(life) // 2 - 1] + life[len(life) // 2]) / 2, 1)}
Z['bizTimeline'] = {'years': years, 'open': [op[y] for y in years], 'close': [cl[y] for y in years], 'records': len(recs),
                    'openNow': sum(1 for r in recs if r['영업상태명'] == '영업/정상'), 'closedAll': sum(1 for r in recs if r['영업상태명'] == '폐업'),
                    'otherStatus': sum(1 for r in recs if r['영업상태명'] not in ('영업/정상', '폐업')),
                    'definition': '개업 = 인허가일 연도 · 폐업 = 영업상태 「폐업」 기록의 폐업일 연도(취소·말소 등은 폐업 막대에 넣지 않음)',
                    'peakOpenSince2010': {'year': peak, 'n': op[peak]}, 'within3y': surv, 'lifespan': lifespan,
                    'net': {y: op[y] - cl[y] for y in range(2016, 2027)},
                    'industries': B['source']['industries'] if isinstance(B['source'], dict) and 'industries' in B['source'] else Z['vacancy']['localdata']['industries'],
                    'source': '행정안전부 지방행정 인허가데이터(LOCALDATA) 김해시 9개 업종 파일(2026-10-13 받음) — 확정 구역계 안 좌표가 있는 기록',
                    'bulkClose': [{'date': d, 'n': k} for d, k in bulk],
                    'caveat': '9개 업종(음식점·제과·이용·미용·세탁·숙박·노래방·PC방)만 — 소매·사무실 등은 인허가 대상이 아니라 빠짐 · 좌표 없는 기록 171건(같은 법정동)은 구역 판정이 안 돼 제외 · 같은 가게의 업종 변경·명의 변경도 폐업+개업으로 잡힘' + ''.join(f' · {d[:4]}년 막대는 {d} 하루에 {k}건이 폐업 처리된 것(행정 일괄 정리로 보임 — 실제 문 닫은 때와 다를 수 있음)' for d, k in bulk)}

# 3. 진출입구별 담당 점포 — 직선 최근접
gates = Z['context']['gates']['points']['features']
stores = [D['store'][i] for i in Z['storeIndices']]; assert len(stores) == 294
cnt = Counter()
for s in stores:
    j = min(range(len(gates)), key=lambda k: dist((s['lon'], s['lat']), gates[k]['geometry']['coordinates']))
    cnt[j] += 1
gl = [{'name': gates[j]['properties'].get('name') or '이름 없는 골목', 'tier': gates[j]['properties']['tier'], 'stores': n,
       'lnglat': [round(x, 6) for x in gates[j]['geometry']['coordinates']]} for j, n in cnt.most_common()]
Z['gateLoad'] = {'gates': len(gates), 'used': len(cnt), 'list': gl, 'top3Share': round(100 * sum(g['stores'] for g in gl[:3]) / 294, 1),
                 'method': '구역 점포 294곳을 가장 가까운 진출입구(구역 경계와 차량 도로가 만나는 곳 20곳)에 직선거리로 배분 — 실제 통행 경로 아님',
                 'note': '원래 화면(51.8ha)은 대로·중로 입구 6곳에만 배분했다. 확정 구역계는 대로 입구가 김해대로 1곳뿐이라 그 방식이면 294곳 전부가 한 입구 몫이 되므로, 골목 입구까지 넣어 다시 셈'}

# 4. 국도·지방도 교통량 조사지점(TMS 2025)
tm = json.loads(js('TMSPT'))['features']
# 거리는 다른 방과 같은 EPSG:5187 로 잰 구역 경계까지 직선 최단거리(코덱스 4차: 간이 환산 402m → 401m)
from pyproj import Transformer
from shapely.ops import transform as _tf
_t5 = Transformer.from_crs(4326, 5187, always_xy=True).transform
_poly5 = _tf(_t5, poly)
def bdist(c): return round(_poly5.exterior.distance(Point(*_t5(*c))))
near = sorted(({'id': f['properties']['id'].strip(), 'road': f['properties']['road'], 'route': f['properties']['route'], 'section': f['properties']['section'],
                'aadt': f['properties']['aadt'], 'distM': bdist(f['geometry']['coordinates'])} for f in tm), key=lambda x: x['distM'])
Z['tms'] = {'points': len(tm), 'within1km': sum(1 for x in near if x['distM'] <= 1000), 'nearest': near[:4],
            'source': '국토교통부·한국건설기술연구원 교통량정보제공시스템(TMS) 2025 도로종류별 교통량 — 김해시 43지점',
            'method': '구역 경계까지 직선 최단거리(EPSG:5187)',
            'note': '구역 안 조사지점 없음. 원도심 시내도로 교통량(김해시 자체조사 2024, 21지점)은 좌표가 없어 구역과의 거리를 계산하지 못함'}

# 5. 부동산원 상권 겹침
if len(sys.argv) > 2:
    from pyproj import Transformer
    from shapely.ops import transform as tf
    t5 = Transformer.from_crs(4326, 5187, always_xy=True).transform
    MK = json.loads(Path(sys.argv[2]).expanduser().read_text())['features']
    mk = next(f for f in MK if f['properties']['sec_nm'] == '김해시청/동상시장'); mg = shape(mk['geometry'])
    z5, m5 = tf(t5, poly), tf(t5, mg)
    old = next(f for f in D['zonesGeo']['features'] if f['properties']['k'] == 'blue'); o5 = tf(t5, shape(old['geometry']))
    Z['rone'] = {'market': '김해시청/동상시장', 'code': '6480062', 'types': mk['properties']['buld_nm'],
                 'overlapM2': round(z5.intersection(m5).area), 'overlapPct': round(100 * z5.intersection(m5).area / z5.area, 1),
                 'oldOverlapPct': round(100 * o5.intersection(m5).area / o5.area, 1),
                 'storesIn': sum(1 for st in stores if mg.covers(Point(st['lon'], st['lat']))), 'bldIn': sum(1 for i in idx if mg.covers(shape(F[i]['geometry']).representative_point())),
                 'sitesIn': [t['rank'] for t in Z['sites'] if mg.covers(Point(*t['lnglat']))],
                 'others': [{'name': f['properties']['sec_nm'], 'types': f['properties']['buld_nm']} for f in MK if f is not mk],
                 'latest': {'quarter': '2026.2Q', 'smallVacancyPct': 13.7, 'smallRentWonPerM2': 12200},
                 'geometry': mk['geometry'],
                 'source': '한국부동산원 상업용부동산 임대동향조사(국가승인통계 408001) — 상권구획도 2024.3Q 재구획(R-ONE 게시 seq 3516) · 2026.2Q 통계표(seq 3950)',
                 'note': '확정 구역계는 이 상권과 일부만 겹친다. 공실률 13.7%는 상권 표본 건물(소규모상가)의 값이라 구역 공실률로 쓰지 않는다 — 참고값으로만, 「상권과 구역의 일부만 겹침」을 함께 적는다'}
    assert 10 <= Z['rone']['overlapPct'] <= 11.5 and Z['rone']['oldOverlapPct'] > 95, Z['rone']['overlapPct']
ZP.write_text(json.dumps(Z, ensure_ascii=False, separators=(',', ':')))
print(json.dumps({'emptyShop': {k: Z['emptyShop'][k] for k in ('orig', 'any', 'byDong', 'shopUse', 'shopOld20', 'shopKnownYear')},
                  'biz': {k: Z['bizTimeline'][k] for k in ('records', 'openNow', 'closedAll', 'peakOpenSince2010', 'within3y', 'lifespan', 'net')},
                  'gates': Z['gateLoad']['list'][:6], 'top3': Z['gateLoad']['top3Share'], 'tms': Z['tms']['nearest'][:3], 'tms1km': Z['tms']['within1km'], 'rone': {k: v for k, v in Z.get('rone', {}).items() if k != 'geometry'}}, ensure_ascii=False, indent=0))
