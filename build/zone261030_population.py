"""회현동·부원동 인구 이동(추세·행선지·예측)을 data/gimhae-zone-261030.json 의 popMove 칸에 넣는다 — 「인구 이동」 칸과 지도 흐름선용.

Usage: python3 build/zone261030_population.py <재수집 out 폴더> [숫자정본표.json]   (zone261030_signals.py 다음)
- 원자료: population_outflow_trend/destinations/forecast.json(행정안전부 주민등록 인구통계, 2026-10-30 받음). 값은 그대로 옮기고 다시 계산하지 않는다
- 흐름선 = 김해시 안 행선지 행정동별 순이동(두 동 합). 두 동끼리 오간 것은 구역 안 이동이라 뺀다
- 행정동 위치 = 행정복지센터(OpenStreetMap 검색, build/cache/gimhae_dong_points_nominatim.txt). 칠산서부동은 센터가 봉황동에 있어 동 안쪽 점을 쓴다
- 정본표에 인구 행이 있으면 화면 값과 대조하고, 다르면 멈춘다
"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ZP = ROOT / 'data/gimhae-zone-261030.json'
SRC = Path(sys.argv[1]).expanduser()
Z = json.loads(ZP.read_text())
T = json.load(open(SRC / 'population_outflow_trend.json'))
D = json.load(open(SRC / 'population_outflow_destinations.json'))
P = json.load(open(SRC / 'population_outflow_forecast.json'))
DONGS = ['회현동', '부원동']
PT = {'북부동': [128.86767, 35.26242], '내외동': [128.86466, 35.23516], '장유1동': [128.81281, 35.20124], '주촌면': [128.84155, 35.2324],
      '삼안동': [128.90749, 35.24386], '장유3동': [128.80605, 35.17766], '칠산서부동': [128.84599, 35.19839], '장유2동': [128.79768, 35.19714],
      '동상동': [128.88345, 35.23686], '활천동': None}
ring = Z['boundary']['geometry']['coordinates'][0]
ORIGIN = [round(sum(p[0] for p in ring[:-1]) / (len(ring) - 1), 5), round(sum(p[1] for p in ring[:-1]) / (len(ring) - 1), 5)]

dong = {}
for d in DONGS:
    tr, pool, fc = T['data'][d], D['data'][d]['pooled'], P['data'][d]
    age = {a['age']: a['share_pct'] for a in pool['out_age_profile']}
    last = fc['population'][-1]
    dong[d] = {
        'summary': {k: tr['summary'][k] for k in ['base', 'latest', 'pop_base', 'pop_latest', 'change_pct', 'peak_month', 'peak_pop', 'change_from_peak_pct', 'hh_change_pct']},
        'yearly': [{k: y[k] for k in ['period', 'population', 'households', 'age20_39_pct', 'age65plus_pct']} for y in tr['yearly']],
        'out': pool['out_total'], 'in': pool['in_total'], 'net': pool['net'],
        'categories': [{k: c[k] for k in ['category', 'persons', 'share_pct', 'in_persons', 'net']} for c in pool['out_by_category']],
        'topDong': [{k: x[k] for k in ['name', 'persons', 'share_pct']} for x in pool['out_top_dong_in_gimhae'][:5]],
        'topOutside': [{k: x[k] for k in ['name', 'persons', 'share_pct']} for x in pool['out_top_sigungu'] if x['name'] != '경상남도 김해시'][:5],
        'outAge20_39': round(age['20~29세'] + age['30~39세'], 1),
        'forecast2031': {'linear': last['linear'], 'linearPI': last['linear_pi95'], 'exp': last['exponential'], 'expPI': last['exponential_pi95'], 'ref': last['reference_recent3yr_pace']},
        'slope': fc['linear']['slope_per_year'], 'rate': fc['exponential']['annual_rate_pct']}
net = {}
for d in DONGS:
    for x in D['data'][d]['pooled']['net_by_dong_in_gimhae']:
        if x['name'] in DONGS: continue
        net.setdefault(x['name'], {'name': x['name'], '회현동': 0, '부원동': 0, 'out': 0})
        net[x['name']][d] = x['net']; net[x['name']]['out'] += x['out']
loss = sorted((v | {'net': v['회현동'] + v['부원동']} for v in net.values()), key=lambda v: v['net'])
flows = [v | {'lnglat': PT[v['name']]} for v in loss if v['net'] < 0 and PT.get(v['name'])][:8]
assert len(flows) >= 6 and all(v['net'] < 0 for v in flows)
Z['popMove'] = {
    'basis': '주민등록 인구 2026-09 말 · 전출·전입 2023-01~2026-09(45개월) · 행정동 단위 · 외국인 제외',
    'source': '행정안전부 주민등록 인구통계(인구·세대·연령, 지역별 인구이동) · 2026-10-30 받음',
    'dongs': dong, 'origin': ORIGIN,
    'flows': {'type': 'FeatureCollection', 'features': [{'type': 'Feature', 'geometry': {'type': 'LineString', 'coordinates': [ORIGIN, v['lnglat']]},
              'properties': {'name': v['name'], 'net': v['net'], 'h': v['회현동'], 'b': v['부원동'], 'out': v['out']}} for v in flows]},
    'limits': ['행선지는 2023-01 이후 공개분만 씀(그 전 행정동 행선지는 공개되지 않음)', '주민등록 전입신고 기준 · 외국인 제외',
               '예측은 2019-12~2026-09 추세를 이은 값(재개발·입주·재생사업 효과 반영 안 함)', '선 끝은 행정복지센터 등 그 동 안의 한 지점(동 경계 아님)']}
Z['pending'].pop('popMove', None)
if len(sys.argv) > 2:  # 두 동 합계·2031 합계 예측은 정본표 값을 그대로 쓴다(합계 예측은 합친 인구로 따로 맞춘 값이라 동별 합과 조금 다르다)
    CR = {r['항목']: r for r in json.loads(Path(sys.argv[2]).read_text())['rows']}
    tot, f31 = CR['인구 — 회현동+부원동'], CR['2031 인구 예측 — 회현동+부원동']
    assert tot['새값'] == sum(dong[d]['summary']['pop_latest'] for d in DONGS)
    Z['popMove']['total'] = {'pop': tot['새값'], 'asOf': tot['기준일'], 'changePct': float(tot['비고'].split('%')[0]), 'base': '2015-12', 'forecast2031': tot and f31['새값'], 'forecastNote': '예측(관측 아님) · 재개발·입주·사업 효과 미반영'}
blob = json.dumps(Z['popMove'], ensure_ascii=False)
assert not any(w in blob for w in ['⑦', '방 ', '남실장', '대표', 'MDIS', '010-']), '공개 금지 문구'
if len(sys.argv) > 2:  # 정본표 대조 — 인구 행이 있으면 그 숫자가 화면 자료에 있어야 한다
    C = json.loads(Path(sys.argv[2]).read_text())
    rows = [r for r in C['rows'] if any(w in r['항목'] for w in ['회현동', '부원동', '인구', '전출', '순유출'])]
    nums = set(json.dumps(Z['popMove']).replace('[', ',').replace(']', ',').replace(':', ',').replace('}', ',').split(','))
    miss = [r['항목'] for r in rows if isinstance(r['새값'], (int, float)) and str(r['새값']) not in nums and f"{r['새값']}" not in blob]
    assert not miss, ('정본표와 다름', miss)
    print('canon population rows checked:', len(rows))
ZP.write_text(json.dumps(Z, ensure_ascii=False, separators=(',', ':')) + '\n')
print(json.dumps({'flows': [(v['name'], v['net']) for v in flows], 'origin': ORIGIN, **{d: [dong[d]['summary']['pop_latest'], dong[d]['net'], dong[d]['outAge20_39'], dong[d]['forecast2031']['linear']] for d in DONGS}}, ensure_ascii=False))
