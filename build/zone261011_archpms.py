# -*- coding: utf-8 -*-
# 건축HUB 건축인허가정보(구역 지번 537곳 전수) → data/gimhae-zone-261011.json 의 archPms
# 사용: python3 build/zone261011_archpms.py <rtms_261013 폴더>   (archpms_summary.json — fetch_archpms.py·summarize_archpms.py 뒤)
# 공개: 건수·종류·주용도·연도·지번 대표점(2016년 이후 최근 허가). 건물 이름·허가 번호는 싣지 않는다.
import sys, json, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
ZP = R / 'data/gimhae-zone-261011.json'
S = json.load(open(pathlib.Path(sys.argv[1]) / 'archpms_summary.json'))
Z = json.loads(ZP.read_text())
yrs = [{'year': y['year'], 'n': y['n'], 'byType': y['byType']} for y in S['years']]
late = [y for y in yrs if y['year'] >= 2023]
Z['archPms'] = {
    'source': S['source'], 'lotsQueried': S['lotsQueried'], 'lotsWithPermit': S['lotsWithPermit'], 'permits': S['permits'], 'noYear': S['noYear'],
    'types': S['types'], 'uses': S['uses'], 'changeUse': S['changeUse'], 'change1722': S['change1722'],
    'since2023': sum(y['n'] for y in late), 'firstYear': yrs[0]['year'],
    'peak': {'n': max(y['n'] for y in yrs), 'years': [y['year'] for y in yrs if y['n'] == max(z['n'] for z in yrs)]},
    'years': yrs, 'notApproved': S['notApproved'],
    'demolition': {'n': S['demolition']['n'], 'byYear': S['demolition']['byYear'], 'types': S['demolition']['types']},
    'temporary': S['temporary']['n'],
    'recentPoints': S['recentPoints'],
    'caveat': '세움터 인허가 대장 기준(전산화 이전 허가는 빠질 수 있음) · 연도는 허가일 · 한 지번에 여러 건 포함 · 사용승인일이 없는 허가에는 취소·미착공·공사 중이 섞여 구분할 수 없음 · 용도는 허가 건물의 주용도 · 위치는 지번 대표점'}
ZP.write_text(json.dumps(Z, ensure_ascii=False, separators=(',', ':')))
A = Z['archPms']
print(json.dumps({k: A[k] for k in ('permits', 'lotsWithPermit', 'types', 'change1722', 'since2023', 'peak', 'firstYear', 'notApproved')}, ensure_ascii=False), len(A['recentPoints']['features']))
