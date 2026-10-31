"""김해 원도심 ⑧-A 생활·안전 층 → data/gimhae-life.js (window.__GLIFE__)

읽는 것
  ~/dev/gimhae-data-261030/out2/zone/*_zone800.geojson  (확정 구역계 1안 · 800m 안 점, _in = zone | r800)
  숫자정본표_구역계1안_261030.json  (B 203·227~246행, C 관광 거리 행 — 숫자는 이 표에서만 쓴다)

내보내는 것
  점: 종류(k) · 경도 · 위도 · 구역 안(z: 1 안 / 0 밖 / 2 경계 도로변) · 갈래(s) · 크기(r) · 이름(n, 공공시설·정본표에 이름이 있는 것만)
  수치: 정본표 문구 그대로(t)와 그 문구에서 읽은 숫자(c) — 점 개수와 맞지 않으면 빌드를 멈춘다

공개하지 않는 것: 병·의원·충전소·놀이시설·대피시설·AED 설치 장소의 개별 이름, 관광공사 자료 중 상점·음식점·숙소 이름
쓰지 않는 것: 하천범람지도(236행)

  python3 build/gis_gimhae_life.py ~/dev/gimhae-data-261030 <정본표.json>
"""
import json, re, sys
from collections import Counter
from pathlib import Path

DATA = Path(sys.argv[1]).expanduser() / 'out2' / 'zone'
CANON = json.load(open(sys.argv[2]))
ROWS = CANON if isinstance(CANON, list) else CANON.get('rows', CANON)
OUT = Path(__file__).resolve().parent.parent / 'data' / 'gimhae-life.js'


def row(name):
    hit = [r for r in ROWS if r['항목'] == name]
    assert len(hit) == 1, name
    r = hit[0]
    if r.get('기준일') in (None, '', '같음'):
        i = ROWS.index(r)
        while ROWS[i].get('기준일') in (None, '', '같음'): i -= 1
        r = dict(r, 기준일=ROWS[i]['기준일'])
    return r


def zr(name):
    """「구역 안 N · 800m 안 M」 → (N, M)"""
    t = row(name)['새값']
    m = re.search(r'구역 안 (\d+)\D.*?800m 안\D*?(\d+)', t)
    assert m, (name, t)
    return int(m.group(1)), int(m.group(2))


def load(f):
    return json.load(open(DATA / f'{f}_zone800.geojson'))['features']


def xy(ft):
    x, y = ft['geometry']['coordinates'][:2]
    return round(x, 6), round(y, 6)


P = []          # 점
def add(k, ft, z=None, s=None, r=None, n=None):
    x, y = xy(ft)
    p = {'k': k, 'x': x, 'y': y, 'z': (1 if ft['properties']['_in'] == 'zone' else 0) if z is None else z}
    if s is not None: p['s'] = s
    if r is not None: p['r'] = r
    if n: p['n'] = n
    P.append(p)


def cnt(fs):
    c = Counter(f['properties']['_in'] for f in fs)
    return c['zone'], c['r800']


C, T = {}, {}   # 숫자 · 정본 문구

# ── CCTV (227행) — 설치 목적별 색
R = '⑧-A 안전 — CCTV 설치 지점'
fs = load('A10_cctv'); t = row(R)['새값']; T['cctv'] = row(R)
a, b = cnt(fs); assert (a, b) == (26, 466) and '구역 안 26' in t and '466' in t, (a, b)
purp = Counter(f['properties']['INSTL_PRPS_SE_NM'] for f in fs if f['properties']['_in'] == 'r800')
for k, v in re.findall(r'(다목적|교통단속|교통정보|어린이보호) (\d+)', t.split('800m')[1]):
    kk = '교통정보수집' if k == '교통정보' else k
    assert purp[kk] == int(v), (k, purp[kk], v)
assert all(f['properties']['INSTL_PRPS_SE_NM'] == '다목적' for f in fs if f['properties']['_in'] == 'zone')
CC = ['다목적', '교통단속', '교통정보수집', '어린이보호']
for f in fs:
    p = f['properties']['INSTL_PRPS_SE_NM']
    add('cctv', f, s=CC.index(p) if p in CC else 4)
C['cctv'] = [a, b]

# ── 안전비상벨 (228행) — 구역 안 0
R = '⑧-A 안전 — 안전비상벨'
fs = load('A11_bell'); T['bell'] = row(R)
assert cnt(fs) == zr(R) == (0, 45)
for f in fs: add('bell', f, s=f['properties'].get('INSTL_PLC_TYPE') or '')
C['bell'] = list(zr(R))

# ── 버스정류소 — 구역 안·경계는 203행, 노선 수는 238행
R203 = '교통 — 구역 안 버스 정류장'
t203 = row(R203)['새값']; T['bus'] = row(R203); T['route'] = row('⑧-A 교통 — 경유 노선')
assert t203.startswith('1곳(김해중부경찰서') and '경계 도로변 10m 안 2곳(금강병원' in t203 and '중앙지구대' in t203, t203
fs = load('A21_busstop')
INSIDE = {'1058'}; EDGE = {'1056', '1057'}
seen = set()
for f in fs:
    q = f['properties']; no = str(q['nodeno'])
    if q['_in'] == 'zone': assert no in INSIDE | EDGE, (q['nodenm'], no)
    z = 1 if no in INSIDE else 2 if no in EDGE else 0
    if z: seen.add(no)
    add('bus', f, z=z, r=int(q['route_cnt']), n=q['nodenm'])
assert seen == INSIDE | EDGE
rt = re.findall(r'노선 (\d+)개', T['route']['새값'])
C['bus'] = [1, 2, len(fs), int(rt[0]), int(rt[1])]   # 안 · 경계 · 800m 안 전체 · 800m 노선 · 구역 안 정류소 노선
assert len(fs) == 58 and '58곳' in T['route']['새값']

# ── 관광 자원 (244행) · 거리는 C행 우선, 없으면 245행
R = '⑧-A 문화·관광 — 관광공사 등록 자원'
fs = load('A22b_tour_gimhae'); T['tour'] = row(R)
assert cnt(fs) == zr(R) == (2, 35)
DIST = {k: int(v) for k, v in re.findall(r'([가-힣() ]+?) (\d+)m', row('⑧-A 문화·관광 — 800m 안 주요 자원 → 경계 거리')['새값'])}
DIST = {k.strip(' ·'): v for k, v in DIST.items()}
c_bh = int(row('봉황동 유적(봉황대공원) → 구역 거리')['새값']); c_sr = int(row('수로왕릉 → 구역 거리')['새값'])
DIST.update({'봉황대공원': c_bh, '김해 봉황동 유적': c_bh, '김해수로왕릉': c_sr})
NAMED = set(DIST) | {'김해 봉황대길(봉리단길)', '모단아트(모단공예협동조합)'}
TT = {'12': '관광지', '14': '문화시설', '32': '숙박', '38': '쇼핑', '39': '음식'}
for f in fs:
    q = f['properties']; ct = str(q['contenttypeid']); nm = q['title']
    show = ct in ('12', '14') or nm in NAMED
    p = dict(s=TT.get(ct, '기타'), n=nm if show else None)
    add('tour', f, **p)
    if nm in DIST: P[-1]['d'] = DIST[nm]
assert sum(1 for p in P if p['k'] == 'tour' and 'd' in p) >= 9
C['tour'] = list(zr(R))

# ── 문화공간 (246행)
R = '⑧-A 문화·관광 — 문화공간(문화정보원) 800m 안'
fs = load('A25_culturespace'); t = row(R)['새값']; T['cul'] = row(R)
assert len(fs) == int(re.match(r'(\d+)곳', t).group(1)) == 8
CD = {k.strip(' ·'): int(v) for k, v in re.findall(r'([가-힣 ]+?) (\d+)m', t)}
KIND = {'museum': '박물관·전시관', 'hall': '문화의집·문화원', 'library': '도서관'}
for f in fs:
    q = f['properties']; add('cul', f, s=KIND.get(q['_kind'], '문화공간'), n=q['culName'])
    if q['culName'] in CD: P[-1]['d'] = CD[q['culName']]
assert sum(1 for p in P if p['k'] == 'cul' and 'd' in p) == 3, CD
C['cul'] = [0, len(fs)]

# ── 2순위
R = '⑧-A 생활 SOC — 병·의원(심평원)'
fs = load('A17_hospital'); t = row(R)['새값']; T['hosp'] = row(R)
assert cnt(fs) == zr(R) == (22, 63)
for f in fs: add('hosp', f, s=f['properties']['clCdNm'])
C['hosp'] = list(zr(R)) + [int(re.search(r'의사 (\d+)명', t).group(1)), int(re.search(r'의사 합계 (\d+)명', t).group(1))]

R = '⑧-A 안전 — 재난대피시설(경남)'
fs = load('A54_disaster'); T['shel'] = row(R)
assert cnt(fs) == zr(R) == (5, 32)
for f in fs: add('shel', f)
C['shel'] = list(zr(R))

R = '⑧-A 안전 — 미세먼지·더위 쉼터'
fs = load('A14_dustshelter'); T['dust'] = row(R)
assert cnt(fs) == zr(R) == (0, 9)
for f in fs: add('dust', f)
C['dust'] = list(zr(R))

R = '⑧-A 안전 — AED(자동심장충격기)'
fs = load('A15_aed'); T['aed'] = row(R)
assert cnt(fs) == zr(R) == (3, 40)
for f in fs: add('aed', f)
C['aed'] = list(zr(R))

R = '⑧-A 안전 — 응급의료기관'
fs = load('A16_emergency'); T['emer'] = row(R)
assert cnt(fs) == zr(R) == (1, 0)
for f in fs: add('emer', f, s=f['properties'].get('dutyEmclsName') or '')
C['emer'] = list(zr(R))

R = '⑧-A 생활 SOC — 어린이놀이시설'
fs = load('A24_pfc'); T['play'] = row(R)
assert cnt(fs) == zr(R) == (2, 35)
for f in fs: add('play', f, s=f['properties'].get('instlPlaceCdNm') or '')
C['play'] = list(zr(R))

# 전기차 — 충전소 단위로 묶고 충전기 대수를 크기로
R = '⑧-A 교통 — 전기차 충전기'
fs = load('A19_ev'); t = row(R)['새값']; T['ev'] = row(R)
m = re.match(r'구역 안 (\d+)곳 (\d+)기 · 800m 안 (\d+)곳 (\d+)기', t); assert m, t
st = {}
for f in fs:
    q = f['properties']; s = st.setdefault(q['statId'], {'f': f, 'n': 0, 'fast': 0})
    s['n'] += 1; s['fast'] += q['chgerType'] not in ('02',)   # 02 = 완속
zs = [s for s in st.values() if s['f']['properties']['_in'] == 'zone']
assert (len(zs), sum(s['n'] for s in zs), len(st) - len(zs), sum(s['n'] for s in st.values()) - sum(s['n'] for s in zs)) == tuple(map(int, m.groups())), m.groups()
for s in st.values(): add('ev', s['f'], r=s['n'], s=s['fast'])
C['ev'] = list(map(int, m.groups()))

R = '⑧-A 교통 — 공공 자전거보관소'
fs = load('A12_bike'); T['bike'] = row(R)
assert cnt(fs) == zr(R) == (2, 23)
for f in fs: add('bike', f)
C['bike'] = list(zr(R))

SRC = {  # 범례에 작게 — 기관명 · 정본표 기준일
    'cctv': '행정안전부 CCTV 정보', 'bell': '행정안전부 안전비상벨', 'bus': '국토교통부 TAGO 정류소·경유 노선',
    'tour': '한국관광공사 국문관광정보', 'cul': '한국문화정보원 문화공간', 'hosp': '건강보험심사평가원 병·의원',
    'shel': '경상남도 재난대피시설', 'dust': '에어코리아 미세먼지 쉼터', 'aed': '국립중앙의료원 AED',
    'emer': '국립중앙의료원 응급의료기관', 'play': '행정안전부 어린이놀이시설', 'ev': '한국환경공단 전기차 충전기',
    'bike': '행정안전부 자전거보관소'}
# ── ⑧-B 인구(행정동 단계구분) · R-ONE 표본 상권 — 정본표 B 252~281행만. 통·반은 경계 도형이 없어 지도에 올리지 않는다
DONG = {'회현동': '⑧-B 인구 — 회현동 2022.12→2026.09', '부원동': '⑧-B 인구 — 부원동 2022.12→2026.09'}
for d in ('동상동', '칠산서부동', '활천동', '내외동', '북부동'): DONG[d] = f'⑧-B 인구 — {d} 2022.12→2026.09(비교)'
POP = {}
for d, nm in DONG.items():
    t = row(nm)['새값']
    m = re.search(r'인구 ([\d,]+) → ([\d,]+)\((-?[\d.]+)%\).*?세대당 ([\d.]+) → ([\d.]+).*?70세\+ ([\d.]+) → ([\d.]+)%', t)
    assert m, (d, t)
    a0, a1 = (int(x.replace(',', '')) for x in m.group(1, 2))
    assert abs((a1 - a0) / a0 * 100 - float(m.group(3))) < 0.06, d
    POP[d] = {'chg': float(m.group(3)), 'o70': float(m.group(7)), 'hh': float(m.group(5)), 'pop': a1, 't': t, 'cmp': d not in ('회현동', '부원동')}
T_POP = row('⑧-B 인구 — 회현동 2022.12→2026.09')
RV = {k: row(v)['새값'] for k, v in {
    'big': '⑧-B 상권 — 원도심 중대형 공실률(연평균)', 'small': '⑧-B 상권 — 원도심 소규모 공실률(연평균)',
    'set': '⑧-B 상권 — 원도심 집합상가 공실률(연평균)', 'rent': '⑧-B 상권 — 원도심 임대료(연평균)'}.items()}
RG = json.load(open(Path(__file__).resolve().parent / 'data' / 'rone_gimhae_markets_2024q3.geojson'))
rg = [f for f in RG['features'] if f['properties'].get('sec_nm') == '김해시청/동상시장']
assert len(rg) == 1
geo = rg[0]['geometry']
def rnd(c): return [rnd(x) for x in c] if isinstance(c[0], list) else [round(c[0], 6), round(c[1], 6)]
RONE = {'name': '김해시청/동상시장', 'geo': {'type': geo['type'], 'coordinates': rnd(geo['coordinates'])}, 't': RV,
        'asof': row('⑧-B 상권 — 원도심 중대형 공실률(연평균)')['기준일']}
OUTD = {'v': 'life2', 'cc': CC + ['기타'], 'c': C, 'pop': POP, 'popAsof': '2022-12 → 2026-09', 'rone': RONE,
        't': {k: v['새값'] for k, v in T.items()},
        'src': {k: [SRC[k], (T[k]['기준일'] if k != 'bus' else T['route']['기준일'])] for k in SRC},
        'p': P}
txt = json.dumps(OUTD, ensure_ascii=False, separators=(',', ':'))
for bad in ('2026.2Q', '208,622', '21.75', '217,510', '67,510', '869m', '재배치', '대표점'):
    assert bad not in txt, bad
OUT.write_text('/* 김해 원도심 생활·안전 층(⑧-A) — build/gis_gimhae_life.py 가 만든다. 손으로 고치지 않는다 */\n'
               'window.__GLIFE__=' + txt + ';\n', encoding='utf-8')
print(OUT, len(P), '점', round(OUT.stat().st_size / 1024), 'KB', Counter(p['k'] for p in P))
