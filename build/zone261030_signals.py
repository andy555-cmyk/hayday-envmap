"""구역계 1안 공실 신호를 지도 레이어용으로 묶어 data/gimhae-zone-261030.json 의 signalMap 칸에 넣는다.

Usage: python3 build/zone261030_signals.py <구역 안 자료 재수집 폴더(ledger/·out/ 있는 곳)>   (zone261030_recollect.py 다음)
- 레이어: 장기공실 후보(A·B) · 최근 공실 후보(C) · 인허가 폐업 신호 · 상가정보 사라짐 · 수도 미사용·최근 중단 · 전기 월평균 100kWh 이하 · 신호 2개 이상 겹침
- 겹침 규칙은 재수집 쪽 공실 후보 종합과 같다(A·B / 상가정보 사라짐 / 수도 / 전기). 그 목록과 다르면 멈춘다
- 공개용: 지번·위치·신호 이름만. 사용량·상호·주소 층호는 싣지 않는다. 주거 전용(E) 지번의 수도 신호는 생활 정보라 지도에서 뺀다
"""
import csv, json, sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ZP = ROOT / 'data/gimhae-zone-261030.json'
SRC = Path(sys.argv[1]).expanduser()
Z = json.loads(ZP.read_text())
rd = lambda p: list(csv.DictReader(open(SRC / p, encoding='utf-8-sig')))
LOT = {r['dong'] + ' ' + r['jibun']: r for r in rd('ledger/지번.csv')}
INZ = {k for k, r in LOT.items() if r['count_in'] == 'True'}
SV = {r['jibun']: r for r in rd('out/survey_ae_zone1an.csv')}
assert set(SV) == INZ, '전수조사 지번 = 구역 안 지번'
ll = lambda j: [round(float(LOT[j]['lon']), 7), round(float(LOT[j]['lat']), 7)]
F, sig = [], defaultdict(list)
def pt(k, lnglat, jibun, t):
    F.append({'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': lnglat}, 'properties': {'k': k, 'jibun': jibun, 't': t}})

for j, r in SV.items():
    if r['cls'] in 'AB':
        pt('ab', ll(j), j, f"전수조사 {r['cls']} — {r['why']}"); sig[j].append(f"A~E {r['cls']}")
    elif r['cls'] == 'C':
        pt('c', ll(j), j, f"전수조사 C — {r['why']}")
L = json.load(open(SRC / 'out/localdata_zone1an.json'))['vacancy_signal_list_new_zone']
for x in L:
    assert x['in_new']
    pt('closed', [round(v, 7) for v in x['lnglat']], '', f"{'·'.join(x['kinds'])} · 최근 폐업 {x['최근폐업일'][:7]} · 그 자리 새 영업 없음")
van = defaultdict(list)
for v in json.load(open(SRC / 'out/sbiz_zone1an.json'))['vanished']:
    van[v['jibun'].replace('경상남도 김해시 ', '')].append(v)
for j, vs in van.items():
    pt('vanished', [round(vs[0]['lon'], 7), round(vs[0]['lat'], 7)], j, f"2026-03→06 상가정보에서 사라진 점포 {len(vs)}곳({'·'.join(sorted({v['large'] for v in vs}))})")
    if j in INZ: sig[j].append('상가정보 사라짐')
hiddenWater = 0
for r in rd('out/water_zone1an_lots.csv'):
    j = r['dong'] + ' ' + r['jibun']
    if r['class'] not in ('미사용', '최근 중단') or j not in INZ: continue
    sig[j].append('수도 ' + r['class'])
    if SV[j]['cls'] == 'E': hiddenWater += 1; continue
    pt('water', ll(j), j, f"수도 {r['class']}(2026.01~10)")
for r in rd('out/energy_zone1an.csv'):
    j, m = r['지번'], r['월평균_kWh(값 있는 달 기준)']
    if r['구역안여부'] == '안' and m and float(m) <= 100:
        pt('elec', ll(j), j, '전기 월평균 100kWh 이하(2025-06~2026-06)'); sig[j].append('전기 월평균 100kWh 이하')
over = {j: s for j, s in sig.items() if len(s) >= 2}
ref = json.load(open(SRC / 'out/vacancy_zone1an.json'))
norm = lambda s: s.replace('수도 미사용', '수도').replace('수도 최근 중단', '수도')
assert {j: sorted(map(norm, s)) for j, s in over.items()} == {j: sorted(map(norm, s)) for j, s in ref['lots_with_2plus_signals_list'].items()}, '겹침 목록이 재수집 종합과 다름'
for j, s in sorted(over.items()):
    if 'A~E' not in ' '.join(s) and SV[j]['cls'] == 'E': continue
    pt('overlap', ll(j), j, f"신호 {len(s)}개 겹침: {' · '.join(s)}")
cnt = lambda k: sum(f['properties']['k'] == k for f in F)
Z['signalMap'] = {
    'made': '2026-10-30', 'points': {'type': 'FeatureCollection', 'features': F},
    'layers': [
        {'k': 'ab', 'label': '장기공실 후보(전수조사 A·B)', 'unit': '지번', 'n': cnt('ab'), 'color': '#ff5a5a'},
        {'k': 'c', 'label': '최근 공실 후보(전수조사 C)', 'unit': '지번', 'n': cnt('c'), 'color': '#b77dff'},
        {'k': 'closed', 'label': '인허가 폐업 뒤 새 영업 없음', 'unit': '곳', 'n': cnt('closed'), 'color': '#ff5ad1'},
        {'k': 'vanished', 'label': f"상가정보에서 사라진 점포 {sum(map(len, van.values()))}곳(2026-03→06)", 'unit': '지번', 'n': cnt('vanished'), 'color': '#9aa6b4'},
        {'k': 'water', 'label': '수도 미사용·최근 중단(봉황동만)', 'unit': '지번', 'n': cnt('water'), 'color': '#3fa9ff'},
        {'k': 'elec', 'label': '전기 월평균 100kWh 이하', 'unit': '지번', 'n': cnt('elec'), 'color': '#ffd23f'},
        {'k': 'overlap', 'label': '신호 2개 이상 겹친 지번', 'unit': '지번', 'n': cnt('overlap'), 'color': '#ffffff'}],
    'hiddenWater': hiddenWater,
    'rule': '겹침 = 전수조사 A·B · 상가정보 사라짐 · 수도 미사용·최근 중단 · 전기 월평균 100kWh 이하 중 2개 이상(같은 지번)',
    'source': '전수조사 1차(책상 판정) · 지방행정 인허가 · 소상공인시장진흥공단 상가정보 2026-06 · 김해시 수도 회신 2026.01~10 · 건물에너지 2025-06~2026-06',
    'caveat': '모두 현장 확인 전 후보이며 공실 확정이 아니다. 신호마다 단위가 달라 더하지 않는다. 수도는 봉황동만 있다'}
blob = json.dumps(Z['signalMap'], ensure_ascii=False)
assert not any(w in blob for w in ['⑦', '방 ', '남실장', '대표', 'kWh(', '㎥', '010-']), '공개 금지 문구'
ZP.write_text(json.dumps(Z, ensure_ascii=False, separators=(',', ':')) + '\n')
print(json.dumps({l['k']: l['n'] for l in Z['signalMap']['layers']} | {'hiddenWater': hiddenWater, 'overlapAll': len(over)}, ensure_ascii=False))
