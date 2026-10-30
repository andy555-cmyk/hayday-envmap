"""GIS(gis.html) 김해 원도심 「보행·교통」 자료(data/gimhae-move.js)를 만든다.

Usage: ~/dev/envmap-engine/.venv/bin/python build/gis_gimhae_move.py ~/dev/gimhae-data-261030/work/move
- 경전철: 김해시 「경전철 역사별 시간대별 승하차 인원」(data.go.kr 15105181) 2025년 → 역마다 평일·주말 하루 평균(승차+하차, 시간대별 24칸)
  역 좌표는 OpenStreetMap(railway=station · light_rail)
- 버스: 김해시 「버스정류장별 이용객수」(15157450, 교통카드 기준) 2025년 → 정류장 번호마다 평일·주말 하루 평균
  정류장 좌표는 카카오맵 공개 검색의 정류장 번호(STOP_ID 「1193(김해)」)로 번호가 같은 것만 붙인다. 이름만 같은 것은 붙이지 않는다
- 유동인구: 김해시 「행정동별 성연령별 유동인구」(15109694) 2021-10~2022-09 → 행정동마다 하루 평균 서비스·주거·직장·방문 인구
  행정동 경계는 vuski/admdongkor 2026-10-01판(통계청 경계 기반)
- 자전거 주차장(15127677) · 음성안내 보조장치 횡단보도(15106347) · OSM 횡단보도·신호 위치 · 김해시 교통사고 통계(15167822)
- 쇠퇴 요건(인구·사업체): out/decline_criteria_by_dong_zone1an.json(회현동·부원동·합계, 통계청 인구총조사·주민등록·전국사업체조사) 판정값 그대로
- 공휴일은 주말 쪽에 넣는다. 여러 번 돌려도 결과가 같다
"""
import csv, datetime, io, json, sys
from collections import defaultdict
from pathlib import Path
from shapely.geometry import Point, box, shape

ROOT = Path(__file__).resolve().parents[1]
W = Path(sys.argv[1]).expanduser()
OUT = ROOT / 'data/gimhae-move.js'
BB = box(128.8610, 35.2165, 128.9050, 35.2535)   # 김해 원도심 GIS 범위 + 약 600m
HOL = {'2025-01-01', '2025-01-27', '2025-01-28', '2025-01-29', '2025-01-30', '2025-03-03', '2025-05-05', '2025-05-06',
       '2025-06-03', '2025-06-06', '2025-08-15', '2025-10-03', '2025-10-06', '2025-10-07', '2025-10-08', '2025-10-09', '2025-12-25'}
kind = lambda d: 'we' if datetime.date.fromisoformat(d).weekday() >= 5 or d in HOL else 'wd'
num = lambda s: int(float(s.replace(',', '') or 0))
rd = lambda f: list(csv.reader(io.StringIO((W / 'src' / f).read_bytes().decode('cp949'))))[1:]

# ── 경전철 ──
osm = json.loads((W / 'src/osm_move.json').read_text())
EL = [e for e in osm['elements'] if 'tags' in e]
STX = {e['tags']['name']: (round(e['lon'], 6), round(e['lat'], 6)) for e in EL
       if e['tags'].get('railway') == 'station' and e['tags'].get('station') == 'light_rail'}
R = [r for r in rd('15105181.csv') if r[1].startswith('2025')]
days = {'wd': set(), 'we': set()}
acc = defaultdict(lambda: {'wd': [0] * 24, 'we': [0] * 24})
for r in R:
    k = kind(r[1]); days[k].add(r[1])
    hrs = [num(x) for x in r[4:28]]
    assert sum(hrs) == num(r[3]), r[:4]
    for i, v in enumerate(hrs): acc[r[2]][k][i] += v
NWD, NWE = len(days['wd']), len(days['we'])
assert (NWD, NWE) == (244, 121), (NWD, NWE)
lrt = [{'n': n + '역', 'l': '김해경전철', 'x': STX[n][0], 'y': STX[n][1],
        'wd': [round(v / NWD) for v in acc[n]['wd']], 'we': [round(v / NWE) for v in acc[n]['we']]}
       for n in sorted(STX) if n in acc]
assert {s['n'] for s in lrt} >= {'봉황역', '부원역', '김해시청역', '수로왕릉역', '박물관역'}, [s['n'] for s in lrt]

# ── 버스 ──
B = rd('15157450.csv')
bd = {'wd': set(), 'we': set()}
ba = defaultdict(lambda: {'wd': 0, 'we': 0, 'n': ''})
for r in B:
    k = kind(r[0]); bd[k].add(r[0]); ba[r[1].strip()][k] += num(r[3]); ba[r[1].strip()]['n'] = r[2].strip()
BWD, BWE = len(bd['wd']), len(bd['we'])
assert (BWD, BWE) == (244, 121), (BWD, BWE)
KO = json.loads((W / 'kout.json').read_text())
pos = {}
for v in KO.values():
    for b in v.get('bus') or []:
        sid = str(b.get('id') or '')
        if not sid.endswith('(김해)'): continue
        c = sid[:-4].strip()
        if c.isdigit(): pos.setdefault(c, (round(float(b['lon']), 6), round(float(b['lat']), 6), b.get('dir') or ''))
REG = {r[4].strip(): r for r in rd('15105200.csv') if r[4].strip()}
bus = []
for c, (x, y, d) in sorted(pos.items()):
    if not BB.contains(Point(x, y)): continue
    a = ba.get(c)
    nm = (a and a['n']) or (REG[c][3].strip() if c in REG else '')
    if not nm: continue
    bus.append({'n': nm, 'c': c, 'x': x, 'y': y, 'd': d,
                'wd': round(a['wd'] / BWD) if a else None, 'we': round(a['we'] / BWE) if a else None})
noride = sum(1 for s in bus if s['wd'] is None)

# ── 행정동 유동인구 ──
AD = json.loads((W / 'adong_gimhae.geojson').read_text())
F = rd('15109694.csv')
fa = defaultdict(lambda: {'svc': 0., 'res': 0., 'work': 0., 'visit': 0., 'n': 0, 'wd': 0., 'nwd': 0, 'we': 0., 'nwe': 0})
fdays = set()
for r in F:
    d = f'{r[1]}-{r[2]}-{r[3]}'; fdays.add(d)
    v = fa[r[6].strip()]
    v['svc'] += float(r[10]); v['res'] += float(r[11]); v['work'] += float(r[12]); v['visit'] += float(r[13]); v['n'] += 1
    k = 'we' if datetime.date.fromisoformat(d).weekday() >= 5 else 'wd'
    v[k] += float(r[10]); v['n' + k] += 1
flow = {}
for f in AD['features']:
    n = f['properties']['n']; v = fa[n]
    assert v['n'] == 365, (n, v['n'])
    flow[n] = {k: round(v[k] / v['n']) for k in ('svc', 'res', 'work', 'visit')} | {'wd': round(v['wd'] / v['nwd']), 'we': round(v['we'] / v['nwe'])}

# ── 그 밖의 위치 자료 ──
bike = []
for r in rd('15127677.csv'):
    try: x, y = float(r[14]), float(r[13])
    except ValueError: continue
    if BB.contains(Point(x, y)):
        bike.append({'n': r[2].strip().replace('　', ''), 'x': round(x, 6), 'y': round(y, 6),
                     'cap': sum(num(r[i]) for i in (6, 8, 10))})
voice = []
for r in rd('15106347.csv'):
    try: x, y = float(r[5]), float(r[4])
    except ValueError: continue
    if BB.contains(Point(x, y)): voice.append({'n': r[1].strip(), 'x': round(x, 6), 'y': round(y, 6)})
cross = [[round(e['lon'], 6), round(e['lat'], 6)] for e in EL if e['tags'].get('highway') == 'crossing' and 'lon' in e]
sig = [[round(e['lon'], 6), round(e['lat'], 6)] for e in EL if e['tags'].get('highway') == 'traffic_signals' and 'lon' in e]
acc_rows = [r for r in rd('15167822.csv') if r[2].strip() == '경상남도 김해시']
yrs = sorted({r[0] for r in acc_rows})
acc_city = {'years': yrs, 'kinds': {}}
for r in acc_rows:
    acc_city['kinds'].setdefault(r[1].strip(), {})[r[0]] = [num(r[3]), num(r[5]), num(r[8])]

DC = json.loads((W.parents[1] / 'out/decline_criteria_by_dong_zone1an.json').read_text())
decl = {'src': '통계청 인구총조사·행정안전부 주민등록(12월 말)·김해시 기본통계 전국사업체조사', 'rows': {}}
for n, r in DC['rows'].items():
    decl['rows'][n] = {'pop': {y: v['value'] for y, v in r['population_table'].items()}, 'popY': r['population_jumin_yearly'],
                       'biz': r['business_yearly'],
                       'I1': {k: r['I_1'][k] for k in ('met', 'max_year', 'max', 'y2025', 'change_pct')},
                       'I2': {'met': r['I_2']['met'], 'run': r['I_2']['longest_consecutive_decline_years']},
                       'II1': {k: r['II_1'][k] for k in ('met', 'window', 'max_year', 'max', 'y2024', 'change_pct')},
                       'II2': {'met': r['II_2']['met'], 'run': r['II_2']['longest_consecutive_decline_years']}}
assert decl['rows']['합계']['I1']['met'] and decl['rows']['합계']['II2']['met']

M = {
    'decl': decl,
    'lrt': {'src': '김해시 경전철 역사별 시간대별 승하차 2025', 'nwd': NWD, 'nwe': NWE, 'st': lrt},
    'bus': {'src': '김해시 버스정류장별 이용객수 2025(교통카드 기준)', 'nwd': BWD, 'nwe': BWE, 'st': bus},
    'flow': {'src': '김해시 행정동별 유동인구 2021-10~2022-09', 'dong': flow,
             'geo': {'type': 'FeatureCollection', 'features': AD['features']}},
    'bike': bike, 'voice': voice, 'cross': cross, 'sig': sig, 'osm': osm['osm3s']['timestamp_osm_base'][:10],
    'acc': acc_city,
}
blob = json.dumps(M, ensure_ascii=False)
for bad in ['217,510', '208,622', '대표', '⑦', '남실장', '클로드', '코덱스', '피그마']:
    assert bad not in blob, bad
OUT.write_text('window.__GMOVE__=' + json.dumps(M, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(json.dumps({'lrt': [(s['n'], sum(s['wd'])) for s in lrt], 'bus': len(bus), 'busNoRide': noride, 'regStops': len(REG),
                  'flow': {k: v['svc'] for k, v in flow.items()}, 'bike': len(bike), 'voice': len(voice), 'cross': len(cross),
                  'sig': len(sig), 'acc': yrs[-1:] if yrs else None, 'kb': round(OUT.stat().st_size / 1024)}, ensure_ascii=False))
