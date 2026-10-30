"""방 ① 숫자정본표(구역계 1안)를 data/gimhae-zone-261030.json 에 맞춰 넣는다 — 화면 숫자는 정본표 값만.

Usage: python3 build/zone261030_canon.py <숫자정본표_구역계1안_261030.json>   (rebuild_gimhae_zone261030.py 다음, zone261030_html.py 앞)
- 엔진이 다시 센 값과 정본표가 같은지 먼저 대조하고(다르면 멈춤), 계산 방식 차이로 1㎡씩 다른 면적은 정본표 값으로 바꾼다
- 주용도 묶음·건축물대장 기준 노후도(⑦ 1단계 장부)는 정본표에만 있는 값이라 그대로 옮긴다
- 대조 결과는 canonCheck 에 남긴다. 여러 번 돌려도 결과가 같다.
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ZP = ROOT / 'data/gimhae-zone-261030.json'
Z = json.loads(ZP.read_text())
C = json.loads(Path(sys.argv[1]).read_text())
assert Z['version'] == '2026-10-30-zone1an' and 'zone1an' in C['boundary']
row = {r['항목']: r['새값'] for r in C['rows']}
v = lambda k: row[k]
S, R = Z['stats'], Z['relation']
if 'usesDetail' in S: S['uses'] = S['usesDetail']  # 다시 돌릴 때 엔진 세부값으로 대조

# 1) 엔진값 = 정본표 (다르면 멈춤 — 다른 방법으로 다시 세어 다른 숫자를 만들지 않는다)
same = {
    '구역 면적(공식 표기)': Z['area'], '구역 면적(ha 표기)': Z['areaHa'], '구역 둘레': Z['perimeterM'],
    '권장 15만㎡ 대비 초과': R['over150k'], '옛 구역과 겹치는 면적': R['oldZoneOverlap'], '초광역 구역계 겹침': R['blueOverlap'],
    '원도심 구역계 안 비율': R['blackSharePct'], '건물 동수(윤곽 기준)': S['buildings'], '20년 이상 노후 비율(윤곽 기준)': S['oldPct'],
    '점포 수(전 층)': S['stores'], '시 13곳 중 구역 안': len(Z['sitesSummary']['inside']),
    '안쪽 대상지 중 경계에 가장 가까운 거리': round(min(t['edgeM'] for t in Z['sites'] if t['inside'])),
}
for k, mine in same.items():
    assert float(v(k)) == float(mine), (k, v(k), mine)
diff = {}
eng = Z.setdefault('relationEngine', {key: R[key] for key in ('oldZoneOnly', 'newOnly')})  # 엔진 원래 값(다시 돌려도 유지)
for k, key in (('옛 구역에서 빠지는 면적', 'oldZoneOnly'), ('새로 들어오는 면적', 'newOnly')):
    if eng[key] != v(k):
        assert abs(eng[key] - v(k)) <= 1, (k, eng[key], v(k))
        diff[key] = {'engine': eng[key], 'canon': v(k)}
    R[key] = v(k)
R['note'] = '겹침·빠짐·새로 = 숫자정본표(방 ①) 값 · 1안 ∩ 옛 확정 구역계(10/11) 평면 계산'
R['b156Overlap'] = v('기존 사업구역(B권역 검토선 9/30) 겹침')

# 2) 주용도 — 정본표 묶음(합계가 윤곽 동수와 같아야 함). 엔진 세부값은 usesDetail 로 남김
G = {'단독주택': ['단독주택'], '공동주택': ['공동주택'], '제1종 근린생활': ['제1종근린생활시설', '근린생활시설'], '제2종 근린생활': ['제2종근린생활시설'],
     '숙박·위락·관광': ['숙박시설', '위락시설', '관광휴게시설'], '업무·판매·운수': ['업무시설', '판매시설', '운수시설'],
     '교육·의료·종교·문화·운동·노유자': ['교육연구시설', '의료시설', '종교시설', '문화및집회시설', '운동시설', '노유자시설'],
     '공장·창고·위험물·자동차·기타': None, '미상': ['확인 불가']}
detail = dict(S['uses']); known = {u for us in G.values() if us for u in us}
uses = {}
for g, us in G.items():
    canon = v('주용도별 건물 — ' + g)
    mine = sum(n for u, n in detail.items() if (u in us if us else u not in known))
    assert mine == canon, (g, mine, canon)
    uses[g] = canon
assert sum(uses.values()) == S['buildings']
S['usesDetail'], S['uses'] = detail, dict(sorted(uses.items(), key=lambda x: -x[1]))

# 3) 정본표에만 있는 값 — 건축물대장 기준(⑦ 1단계 장부 · 방 ① 셈)
old_new = re.search(r'새 (\d+)/(\d+)', next(r['계산방법'] for r in C['rows'] if r['항목'] == '20년 이상 노후 비율(대장 기준)'))
old20, known_n = int(old_new[1]), int(old_new[2])
assert round(old20 / known_n * 100, 1) == v('20년 이상 노후 비율(대장 기준)')
Z['ledger'] = {'buildings': v('건물 동수(건축물대장 표제부 기준)'), 'parcels': v('구역 안 지번(대장 있는 지번)'), 'known': known_n, 'old20': old20,
               'old20Pct': v('20년 이상 노후 비율(대장 기준)'), 'old30Pct': None,
               'source': f"건축물대장 표제부(구역 안으로 센 동) · 숫자정본표 {C['edition']} {C['made'][:10]}"}
Z['canonExtra'] = {'storeDensity': v('점포 밀도'), 'zoning': {k.split(' — ')[1]: row[k] for k in row if k.startswith('용도지역 구성 — ')},
                   'floorsAvg': v('평균 층수(윤곽 기준)'), 'floorsMax': v('최고 층수(윤곽 기준)'), 'station10min': v('핵심 3역 10분 도보권 겹침')}
Z['pending'].pop('ledger', None)
Z['statsSource'] = 'canon'
Z['canonCheck'] = {'edition': C['edition'], 'made': C['made'], 'matched': sorted(same), 'replaced': diff,
                   'note': '엔진 재계산과 정본표가 같은 항목은 matched, 계산 방식 차이(±1㎡)로 정본표 값으로 바꾼 항목은 replaced'}
ZP.write_text(json.dumps(Z, ensure_ascii=False, separators=(',', ':')) + '\n')
print(json.dumps({'matched': len(same), 'replaced': diff, 'uses': S['uses'], 'ledger': Z['ledger']}, ensure_ascii=False))
