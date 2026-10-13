"""공실·거점 위치 탭 자료(data/gimhae-meeting.json)를 확정 구역계(2026-10-11) 기준으로 갱신한다.

Usage: python3 build/update_gimhae_meeting_261011.py   (먼저 rebuild_gimhae_zone261011.py 를 돌려 둘 것)
- 10/1 후보 10건(공1~6·자1~4): 글·근거는 그대로, 안팎 판정(inside)만 확정 구역계로 다시 계산
- 시 우선순위 13곳(10/8 목록): data/gimhae-zone-261011.json 의 공개 가능한 항목만 옮김
- 공개 페이지라 소유자 매매 의향·가격·수도 사용/요금 연체 문구는 싣지 않는다(2026-10-12 공개판 규칙)
여러 번 돌려도 결과가 같다(시 13곳은 매번 새로 만든다).
"""
import json, math, re
from pathlib import Path
import numpy as np
from shapely.geometry import Point, shape
from shapely.ops import transform

ROOT = Path(__file__).resolve().parents[1]
M = json.loads((ROOT / 'data/gimhae-meeting.json').read_text())
Z = json.loads((ROOT / 'data/gimhae-zone-261011.json').read_text())
assert Z['version'] == '2026-10-11-confirmed'
poly = shape(Z['boundary']['geometry'])
scale = np.array([111320 * math.cos(math.radians(35.232)), 111320]); origin = np.array([128.88, 35.23])
metric = lambda g: transform(lambda x, y, z=None: ((np.array(x) - origin[0]) * scale[0], (np.array(y) - origin[1]) * scale[1]), g)
edge = lambda c: round(metric(poly.exterior).distance(metric(Point(*c))), 1)

old_ads = {o['id']: o['state'] for o in Z['vacancy']['listings']['old']}
base = [p for p in M['places'] if p['source'] in ('official', 'research') and p['id'] not in ('자5', '자6')]
assert len(base) == 10
role = {'거점': '거점', '방문객': '방문객용 공간', '창작': '개인 창작 공간 후보'}
places = []
for t in Z['sites']:
    detail = ' · '.join(x for x in [t['state'], t['areaNote'], t['use'] if t['role'] != '방문객' else ''] if x)
    if t['jibun'] == '봉황동 182': detail += ' · 10/1 목록 공6과 같은 필지'
    places.append({'id': f"시{t['rank']}", 'pin': str(t['rank']), 'source': 'city', 'rank': t['rank'], 'address': t['jibun'], 'coordinates': t['lnglat'],
                   'inside': t['inside'], 'edgeM': t['edgeM'], 'status': f"{t['type']} · {role.get(t['role'], t['role'])}", 'detail': detail,
                   'evidence': '김해시 사업대상지 목록 2026-10-08 · 역할은 10/8 현장 미팅', 'checked': '지번 위치·확정 구역계 판정 2026-10-11'})
for p in base:
    p = dict(p); p.pop('insideB', None)
    p['inside'] = None if not p.get('coordinates') else poly.covers(Point(*p['coordinates']))
    if p.get('coordinates'): p['edgeM'] = edge(p['coordinates'])
    p['detail'] = p['detail'].replace('B 검토선 안', '확정 구역계 안').replace('B 검토선 밖', '확정 구역계 밖')
    p['evidence'] = p['evidence'].replace('대표 제공 시유지 목록', '10/1 전달받은 시유지 목록').replace('대표 제공 목록', '10/1 전달받은 목록')
    if p.get('addressClue'): p['addressClue'] = p['addressClue'].replace('B 포함 판정', '구역 포함 판정')
    # 공개 페이지: 광고 가격(보증금·월세)은 싣지 않는다(2026-10-13 검수). 10/13 재확인한 광고 상태를 덧붙인다.
    p['detail'] = re.sub(r',?\s*(10월1일 원문 재확인: |당시 )?보증금 [\d,]+만원 / 월세 [\d,]+만원(\([^)]*\))?\.?', '', p['detail']).replace('  ', ' ').replace('1/2층 10월1일', '1/2층. 10월1일').strip()
    if p['id'] in old_ads:
        p['status'] = '광고 내려감 · 10/13 재확인'
        if '10/13 재확인' not in p['detail']: p['detail'] += f" 10/13 재확인: {old_ads[p['id']]} — 지금 광고 중인 매물로 세지 않음."
    if p['id'] == '공6':
        p['status'] = '매매 검토지 · 전달자료 기준'
        p['detail'] = '시 우선순위 2번(10/8 목록)과 같은 필지. 시유지로 분류하지 않음. 현재 매매·공실 여부는 재확인 필요. 도로명 봉황대안길 43.'
    places.append(p)
for i, l in enumerate(Z['vacancy']['listings']['items'], start=5):
    pt = l['lnglat']
    places.append({'id': f'자{i}', 'source': 'research', 'address': l['place'], 'coordinates': pt, 'inside': poly.covers(Point(*pt)), 'edgeM': edge(pt),
                   'status': f"지금 광고 중 · {l['kind']} {l['deal']}", 'detail': ' · '.join(x for x in [f"전용 {l['areaM2']}㎡" if l['areaM2'] else '', l['floor'] or '', f"광고: {l['state']}", l['note']] if x),
                   'evidence': f"{l['platform']} 공개 상세 화면", 'checked': f"광고 확인 {l['checked']}", 'sourceUrl': l['url']})
banned = re.compile(r'의향|매매 의사|생각해 봄|수도|연체|체납|보증금|월세 \d|만원|권리금')
for p in places: assert not banned.search(json.dumps(p, ensure_ascii=False)), p['id']

M['version'] = '2026-10-13-v3'  # 시 13곳 + 10/1 후보 10건 + 10/13 공개 매물 2건
M['scope'] = '확정 구역계 21.8ha(2026-10-11) · 시 우선순위 13곳(10/8) + 10/1 후보 10건'
M['places'] = places
M['ideas'] = [dict(i, detail=i['detail'].replace('봉리단길과 새 B권역 사이', '봉리단길과 확정 구역계 안 대상지 사이')) for i in M['ideas']]
M['schedule'] = [dict(s, work=s['work'].replace('후보 10건과 B권역 현장 확인 대상 130동을 대조', '시 13곳·후보 10건과 확정 구역계 현장 확인 대상을 대조'),
                      done=s['done'].replace('남실장님과', '담당과')) for s in M['schedule']]
M['schedule'] = [dict(s, work=s['work'].replace('남실장님과 후보·미결 사항·담당·후속 일정을 검토', '후보·미결 사항·담당·후속 일정을 함께 검토').replace('담당과 후보·미결 사항·담당·후속 일정을 검토', '후보·미결 사항·담당·후속 일정을 함께 검토')) for s in M['schedule']]
(ROOT / 'data/gimhae-meeting.json').write_text(json.dumps(M, ensure_ascii=False, indent=1) + '\n')
inside = lambda src: sum(1 for p in places if p['source'] == src and p['inside'])
print(json.dumps({'places': len(places), 'city_inside': inside('city'), 'official_inside': inside('official'), 'research_inside': inside('research'),
                  'no_coords': [p['id'] for p in places if not p.get('coordinates')]}, ensure_ascii=False))
