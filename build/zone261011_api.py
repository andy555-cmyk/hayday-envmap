# -*- coding: utf-8 -*-
"""「API 노하우로 최대한」(2026-10-13) — 열쇠 있는 공공데이터 API와 열쇠 없는 공개 경로로 더 받은 자료를 확정 구역계에 합친다.

Usage: <pyproj·shapely 있는 파이썬> build/zone261011_api.py API_DIR [CODEX_API_DIR]
  API_DIR       = ~/dev/gimhae-zone-final/api_261013     (sbiz_storeZoneInRadius.json · sbiz_storeZoneInAdmi.json — 소상공인 상권 영역 API, 공공데이터 키는 ~/dev/narajangteo/.env, 값은 안 씀)
  CODEX_API_DIR = ~/dev/gimhae-zone-final/codex_api_261013 (L1 인허가 전 업종 · L2 토지이음 537지번 · L3 변천 자료 · L4 카카오 장소 — 있으면 합친다)
순서: zone261011_energy.py 다음, zone261011_html.py 전. 공개 화면엔 상호·개인 정보 없이 집계·경계만.
"""
import sys, json, re
from pathlib import Path
from shapely import wkt
from shapely.geometry import shape, Point, mapping
from shapely.ops import transform
from pyproj import Transformer

ROOT = Path(__file__).resolve().parents[1]
A = Path(sys.argv[1]).expanduser()
CX = Path(sys.argv[2]).expanduser() if len(sys.argv) > 2 else None
ZP = ROOT / 'data/gimhae-zone-261011.json'
Z = json.loads(ZP.read_text())
t5 = Transformer.from_crs(4326, 5187, always_xy=True).transform
poly = shape(Z['boundary']['geometry']); z5 = transform(t5, poly)

# 1. 소상공인시장진흥공단 상권 영역(sdsc2 storeZoneInAdmi·storeZoneInRadius) — 구역과 겹치는 상권
zones = {}
for f in ('sbiz_storeZoneInAdmi.json', 'sbiz_storeZoneInRadius.json'):
    for x in json.loads((A / f).read_text())['body']['items']: zones[x['trarNo']] = x
hit = []
for no, x in zones.items():
    g = wkt.loads(x['coords']); g5 = transform(t5, g); ov = g5.intersection(z5).area
    if ov > 1: hit.append({'trarNo': no, 'name': x['mainTrarNm'], 'areaM2': int(x['trarArea']), 'overlapM2': round(ov), 'zonePct': round(100 * ov / z5.area, 1), 'marketPct': round(100 * ov / g5.area, 1),
                           'geometry': mapping(g.simplify(0.00002))})
hit.sort(key=lambda h: -h['overlapM2'])
assert hit and hit[0]['name'] == '김해부원동우체국', [h['name'] for h in hit]
Z['sbizZone'] = {'items': hit, 'checked': len(zones),
                 'source': '소상공인시장진흥공단 상가(상권)정보 API 「상권 영역」(storeZoneInAdmi 김해시 + storeZoneInRadius 1.5km, 2026-10-13 조회)',
                 'note': '소진공이 점포 밀집도로 그은 주요 상권 영역이다(상권 면적은 자료 제공값, 겹침률은 내려받은 도형을 EPSG:5187로 계산). 부동산원 공실률 표본 상권과는 다른 구획이다'}

# 2. 코덱스 열쇠 없는 수집 — 있는 것만
def load(p):
    p = CX / p
    return json.loads(p.read_text()) if p.exists() else None
if CX and CX.exists():
    Z.setdefault('apiMore', {})
    for lane in ('L1_localdata_all', 'L2_eum_537', 'L3_history', 'L4_kakao_place'):
        r = load(f'{lane}/result.json')
        Z['apiMore'][lane] = {'done': r is not None}

# 3. 인허가 전 업종(L1, 208종) — 가게형 업종만 골라 연도별 「그해 영업 중」
STORE = {'식품_일반음식점', '식품_휴게음식점', '식품_제과점영업', '식품_즉석판매제조가공업', '식품_축산판매업', '식품_건강기능식품일반판매업', '식품_식품소분업',
         '식품_식품판매업(기타)', '식품_유흥주점영업', '생활_미용업', '생활_이용업', '생활_세탁업', '생활_당구장업', '생활_목욕장업', '생활_무도학원업', '생활_체육도장업',
         '기타_담배소매업', '기타_인쇄사', '건강_의료기기판매(임대)업', '건강_안전상비의약품 판매업소', '건강_안경업', '동물_동물미용업', '동물_동물병원',
         '문화_인터넷컴퓨터게임시설제공업', '문화_일반게임제공업', '문화_청소년게임제공업', '문화_노래연습장업', '문화_외국인관광도시민박업', '문화_국내여행업', '숙박_숙박업'}
OPEN = {'영업', '정상영업', '영업중', '영업/정상', '정상', '사용중'}
r1 = load('L1_localdata_all/result.json') if CX and CX.exists() else None
if r1:
    import math
    lines_ = [f['geometry']['coordinates'] for f in Z['context']['roadLines']['features'] if f['properties'].get('name') == '봉황대길']   # 구역 안 봉황대길 세 조각 모두(코덱스 5차)
    assert len(lines_) == 3
    kx, ky = 111320 * math.cos(math.radians(35.232)), 111320
    def dline(pt):
        best = 1e9
        for a_, b_ in ((a, b) for ln in lines_ for a, b in zip(ln, ln[1:])):
            ax, ay, bx, by, px, py = a_[0] * kx, a_[1] * ky, b_[0] * kx, b_[1] * ky, pt[0] * kx, pt[1] * ky
            dx, dy = bx - ax, by - ay; tt = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
            best = min(best, math.hypot(px - ax - tt * dx, py - ay - tt * dy))
        return best
    ins = [x for x in r1['records'] if x.get('판정') == '구역 안' and poly.covers(Point(*x['lnglat']))]
    assert len(ins) == len([x for x in r1['records'] if x.get('판정') == '구역 안']), 'L1 inside mismatch'
    recs = []
    for x in ins:
        if not x.get('인허가일자'): continue
        op = x['영업상태'] in OPEN
        cy = int(x['폐업일자'][:4]) if x.get('폐업일자') else None
        if not op and cy is None: continue          # 문 닫은 때 모름(전출·취소 등 날짜 없음) — 연도 계산에서 뺌
        recs.append({'kind': x['업종'].split('_', 1)[1], 'group': x['업종'].split('_', 1)[0], 'store': x['업종'] in STORE, 'lnglat': x['lnglat'],
                     'open': int(x['인허가일자'][:4]), 'close': None if op else cy, 'band': dline(x['lnglat']) <= 40})
    years = list(range(2009, 2027))
    def series(rows):
        return {'active': [sum(1 for r in rows if r['open'] <= y and (r['close'] is None or r['close'] > y)) for y in years],
                'opened': [sum(r['open'] == y for r in rows) for y in years], 'closed': [sum(r['close'] == y for r in rows) for y in years]}
    st_ = [r for r in recs if r['store']]
    from collections import Counter
    Z['licenseAll'] = {'industriesFetched': len(r1['industries']), 'insideRecords': len(ins), 'insideOpen': sum(1 for x in ins if x['영업상태'] in OPEN),
                       'kindsInside': len({x['업종'] for x in ins}), 'years': years, 'store': series(st_), 'storeBand': series([r for r in st_ if r['band']]),
                       'storeRecords': len(st_), 'storeOpenNow': sum(1 for r in st_ if r['close'] is None),
                       'storeKindsNow': dict(Counter(r['kind'] for r in st_ if r['close'] is None).most_common(12)),
                       'excludedTop': dict(Counter(x['업종'].split('_', 1)[1] for x in ins if x['업종'] not in STORE).most_common(6)),
                       'source': '행정안전부 지방행정 인허가데이터(LOCALDATA) 김해시 전 업종 파일 ' + str(len(r1['industries'])) + '종(2026-10-13 받음) — 확정 구역계 안 좌표 있는 기록',
                       'rule': '가게형 = 음식점·카페·제과·반찬(즉석판매)·정육·건강식품·미용·이발·세탁·담배·안경·의료기기·편의점 상비약·게임·노래방·당구·목욕·민박·동물병원 등 손님이 찾아오는 업종. 통신판매·자판기·광고·소독·제조·직업소개 등은 뺌',
                       'caveat': '한 가게가 업종 인허가를 여러 개 가질 수 있어(예: 음식점+담배) 가게 수와 같지 않음 · 문 닫은 때를 모르는 기록(전출·취소 등)은 연도 계산에서 뺌 · 2026은 10월 13일까지'}
    # 누리집 변천사용 묶음(상호 없음)
    out = Path('~/dev/gimhae-vacancy-rv/history/license_yearly_all.json').expanduser()
    out.write_text(json.dumps({'made': '2026-10-13', 'source': Z['licenseAll']['source'], 'rule': Z['licenseAll']['rule'], 'caveat': Z['licenseAll']['caveat'],
                               'band': '봉황대길 본선(735m) 양쪽 40m', 'years': years, 'store': Z['licenseAll']['store'], 'storeBand': Z['licenseAll']['storeBand'],
                               'records': [{k: r[k] for k in ('kind', 'group', 'store', 'lnglat', 'open', 'close', 'band')} for r in recs]}, ensure_ascii=False, indent=0))
# 5. 봉리단길 변천·국가유산(L3)
r3 = load('L3_history/result.json') if CX and CX.exists() else None
if r3:
    H = r3['heritage']; lay = {}
    for nm, fn in [('designated', 'heritage_designated_area.geojson'), ('protection', 'heritage_protection_area.geojson'), ('criteria', 'heritage_change_criteria.geojson')]:
        lay[nm] = json.loads((CX / 'L3_history' / fn).read_text())['features']
    sub = []
    for f in lay['criteria']:
        g5 = transform(t5, shape(f['geometry'])); ov = g5.intersection(z5).area
        sub.append({'name': f['properties'].get('구역명'), 'zonePct': round(100 * ov / z5.area, 1), 'overlapM2': round(ov)})
    from shapely.ops import unary_union
    def simp(feats, tol=0.00003):
        return [{'type': 'Feature', 'properties': {'k': k}, 'geometry': mapping(shape(f['geometry']).buffer(0).simplify(tol).intersection(poly.buffer(0.004)))} for k, f in feats]
    union = unary_union([transform(t5, shape(f['geometry'])) for v in lay.values() for f in v]).intersection(z5).area
    Z['heritage'] = {'name': H['name'], 'designation': H['designation'], 'designatedDate': H['designatedDate'], 'officialAreaM2': H['officialAreaM2'],
                     'layers': [{'name': l['name'], 'overlapPct': round(l['overlapPct'], 1), 'overlapM2': round(l['overlapAreaM2'])} for l in H['layers']],
                     'unionPct': round(100 * union / z5.area, 2), 'subZones': [s_ for s_ in sub if s_['overlapM2'] > 0],
                     'geo': {'type': 'FeatureCollection', 'features': simp([('지정구역', f) for f in lay['designated']]) + simp([('보호구역', f) for f in lay['protection']])
                             + simp([('허용기준 ' + (f['properties'].get('구역명') or ''), f) for f in lay['criteria']])},
                     'source': H['source'] + ' 공개 내려받기(' + H['sourceUrl'] + ', 2026-10-13) — 도형 면적 재계산(EPSG:5187)',
                     'note': '「현상변경 허용기준」 구역 안 건축·개발은 구역별 높이·형태 기준을 따르고, 기준을 넘으면 국가유산 현상변경 허가가 필요하다(구역별 수치는 고시 원문 확인). 2024-01 김해시가 건축행위 허용기준 조정안 의견청취를 공고함(최종 고시 확인 필요)'}
    assert 99 <= Z['heritage']['unionPct'] <= 100.0, Z['heritage']['unionPct']
    r5 = load('L5_heritage_rules/result.json')   # 허용기준 고시 원문(문화재청고시 제2024-47호) — 구역별 높이
    if r5:
        rule = {z_['name']: z_ for z_ in r5['zones']}
        for s_ in Z['heritage']['subZones']:
            z_ = rule.get(s_['name'], {})
            s_['flatM'], s_['pitchedM'] = z_.get('heightFlatM'), z_.get('heightPitchedM')
            s_['rule'] = '평지붕 %sm·경사지붕 %sm 이하' % (z_['heightFlatM'], z_['heightPitchedM']) if z_.get('heightFlatM') else re.sub(r'^ㅇ\s*', '', (z_.get('rule') or '').split('\n')[0])
        n_ = r5['notice']
        Z['heritage']['notice'] = {'title': n_['title'], 'number': n_['number'], 'date': n_['date'], 'url': n_['url']}
        Z['heritage']['note'] = ('현상변경 허용기준 구역 안은 구역별 높이 기준 안에서 건축할 수 있고, 기준을 넘거나 「공통사항 개별 검토」 대상이면 국가유산 현상변경 허가 절차를 거친다(' +
                                 n_['number'] + ', ' + n_['date'] + ' — 2024-01 김해시 조정안 의견청취를 거친 최종 고시)')
    keep = lambda e: {k: e.get(k) for k in ('date', 'type', 'title', 'summary', 'source', 'url')}
    PICK = ['대상지 선정', '화려한 부활', '도로명', '협동조합 결성', '마중물사업 완료', '공영주차장', '지역관광개발', '빈 점포']
    ev = [keep(e) for e in r3['timeline']]
    for e in ev:   # 코덱스 5차 원문 대조: 단체명·성격 바로잡기, 공영주차장 지번은 공개판에서 일반화
        if str(e['date']).startswith('2019-10') and '협동조합' in e['title']:
            e['title'] = '봉황대협동조합 결성(2023년 회고 기사 기준)'
        if str(e['date']) == '2019-12-03': e['type'] = '기사'; e['title'] = e['title'] + ' (결성 보도)' if '결성 보도' not in e['title'] else e['title']
        if str(e['date']) == '2019-09-06': e['type'] = '기사·도로명 변경'
        if '공영주차장' in e['title']: e['summary'] = re.sub(r'봉황동 [\d\-, ]+에', '봉황동 3곳에', e['summary'])
    assert not any(re.search(r'\d+-\d+, \d+-\d+', e['summary'] or '') for e in ev), 'timeline jibun'
    keyIdx = []
    for w in PICK:
        i = next((i for i, e in enumerate(ev) if w in e['title'] and i not in keyIdx), None)
        if i is not None: keyIdx.append(i)
    keyIdx.sort(key=lambda i: str(ev[i]['date']))
    assert len(keyIdx) >= 7, keyIdx
    Z['timeline'] = {'events': ev, 'key': keyIdx, 'facilities': [keep(e) for e in r3.get('facilities', [])],
                     'trend': {k: r3['trend'].get(k) for k in ('platform', 'keyword', 'range', 'normalization', 'annual', 'sourceUrl')},
                     'source': '언론 기사·김해시 보도·토지이음 고시·국가유산청 고시·네이버 데이터랩(공개 화면, 2026-10-13 수집)'}

# 6. 토지이음 537지번(L2) — 지목·용도지역·다른 법령 지역·도로·공시지가 전수(집계와 규제 지번 점만 공개)
r2 = load('L2_eum_537/result.json') if CX and CX.exists() else None
partial2 = False
if r2 is None and CX and (CX / 'L2_eum_537/partial.json').exists():
    r2 = load('L2_eum_537/partial.json'); partial2 = True
if r2:
    import statistics as st_, math
    rows2 = [r for r in r2['rows'] if r.get('jimok') or r.get('priceWonPerM2')]
    rowsD = [r for r in rows2 if r.get('zoning') or r.get('jimok')]   # 토지이용계획 상세를 받은 지번(규제 비율의 분모) — 공시지가만 받은 3곳은 뺌
    sv = {f['properties']['jibun']: f['geometry']['coordinates'] for f in Z['survey']['points']['features']}
    has = lambda r, w: any(w in x for x in (r.get('other') or []) + (r.get('district') or []))
    lines_ = [f['geometry']['coordinates'] for f in Z['context']['roadLines']['features'] if f['properties'].get('name') == '봉황대길']
    kx, ky = 111320 * math.cos(math.radians(35.232)), 111320
    def dl(pt):
        best = 1e9
        for a_, b_ in ((a, b) for ln in lines_ for a, b in zip(ln, ln[1:])):
            ax, ay, bx, by, px, py = a_[0] * kx, a_[1] * ky, b_[0] * kx, b_[1] * ky, pt[0] * kx, pt[1] * ky
            dx, dy = bx - ax, by - ay; tt = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
            best = min(best, math.hypot(px - ax - tt * dx, py - ay - tt * dy))
        return best
    price = [r['priceWonPerM2'] for r in rows2 if r.get('priceWonPerM2')]
    band = [r['priceWonPerM2'] for r in rows2 if r.get('priceWonPerM2') and r['jibun'] in sv and dl(sv[r['jibun']]) <= 30]
    off = [r['priceWonPerM2'] for r in rows2 if r.get('priceWonPerM2') and r['jibun'] in sv and dl(sv[r['jibun']]) > 30]
    byDong = {}
    for r in rows2:
        if r.get('priceWonPerM2'): byDong.setdefault(r['jibun'].split()[0], []).append(r['priceWonPerM2'])
    from collections import Counter
    road = Counter('저촉' if any('저촉' in x for x in r.get('road') or []) else '접합만' if r.get('road') else '없음' for r in rowsD)
    hazard = [r['jibun'] for r in rowsD if has(r, '자연재해위험개선지구')]
    Z['landUse537'] = {'target': 537, 'done': len(rowsD), 'partial': partial2,
                       'jimok': dict(Counter(r.get('jimok') for r in rowsD).most_common()),
                       'zoning': dict(Counter(z for r in rowsD for z in (r.get('zoning') or []) if z != '도시지역').most_common()),
                       'heritagePct': round(100 * sum(1 for r in rowsD if has(r, '역사문화환경보존지역')) / len(rowsD), 1),
                       'landscapePct': round(100 * sum(1 for r in rowsD if has(r, '중점경관관리구역')) / len(rowsD), 1),
                       'hazard': {'count': len(hazard), 'pct': round(100 * len(hazard) / len(rowsD), 1), 'name': '자연재해위험개선지구(2018-03-23 지정, 자연재해대책법)',
                                  'points': {'type': 'FeatureCollection', 'features': [{'type': 'Feature', 'properties': {'jibun': j}, 'geometry': {'type': 'Point', 'coordinates': sv[j]}} for j in hazard if j in sv]}},
                       'road': dict(road),
                       'price': {'n': len(price), 'median': round(st_.median(price)), 'q1': round(st_.quantiles(price, n=4)[0]), 'q3': round(st_.quantiles(price, n=4)[2]),
                                 'min': min(price), 'max': max(price), 'band30': round(st_.median(band)) if band else None, 'bandN': len(band), 'off30': round(st_.median(off)) if off else None,
                                 'byDong': {d: {'n': len(v), 'median': round(st_.median(v))} for d, v in byDong.items()}, 'ym': '2026/01'},
                       'source': '국토교통부 토지이음 토지이용계획 열람(eum.go.kr, 공개 화면, 2026-10-13) — 확정 구역계 안 지번 전수',
                       'caveat': '지번 단위 열람 결과 집계(규제 비율 분모 = 상세를 받은 지번, 공시지가 = 값을 받은 지번) · 7지번은 토지이음에서 「검색되지 않는 지번」(현재 지적에 없는 번지 — 합병·분할 등 확인 필요) · 공시지가는 공적 기준 가격이며 매매 가격이 아님 · 「봉황대길 30m」는 구역 안 봉황대길 세 구간에서 지번 대표점까지 직선 · 규제 해석은 담당 부서 확인 필요'}

# 4. 카카오맵 장소(L4) — 분류별 수와 상가정보 대조만(이름·주소는 싣지 않음)
r4 = load('L4_kakao_place/result.json') if CX and CX.exists() else None
if r4:
    pl = [x for x in r4['places'] if poly.covers(Point(x['coordinates']['longitude'], x['coordinates']['latitude']))]
    Z['kakaoPlace'] = {'total': len(pl), 'byCategory': dict(sorted(r4['byCategory'].items(), key=lambda kv: -kv[1])),
                       'match': {k: (len(r4['match'][k]) if isinstance(r4['match'][k], list) else r4['match'][k]) for k in ('both', 'kakaoOnly', 'sbizOnly')},
                       'source': '카카오맵 웹 장소 검색(공개, 열쇠 없음, 2026-10-13) — 확정 구역계 안',
                       'caveat': '대표 업종 검색어로 모은 것이라 빠진 장소가 있을 수 있음 · 가게 이름 표기가 다르면 같은 가게도 짝이 안 됨 · 폐업·개업 확정 자료가 아님'}
    assert Z['kakaoPlace']['total'] == 183, Z['kakaoPlace']['total']
# 7. 공개판 정리 — 폐업 신호·사라진 점포의 상호는 공개 JSON 에서 뺀다(내부 원자료는 codex_recollect_261013 에 있음)
for s_ in Z['vacancy']['localdata']['signals']: s_.pop('names', None)
for v_ in Z['vacancy']['sbiz']['vanished']: v_.pop('name', None)
ZP.write_text(json.dumps(Z, ensure_ascii=False, separators=(',', ':')))
print(json.dumps({'sbizZone': [(h['name'], h['zonePct'], h['marketPct']) for h in hit], 'apiMore': Z.get('apiMore'),
                  'licenseAll': {k: v for k, v in Z.get('licenseAll', {}).items() if k in ('industriesFetched', 'insideRecords', 'insideOpen', 'storeRecords', 'storeOpenNow', 'excludedTop')},
                  'storeActive': dict(zip(Z.get('licenseAll', {}).get('years', []), Z.get('licenseAll', {}).get('store', {}).get('active', []))),
                  'bandActive': dict(zip(Z.get('licenseAll', {}).get('years', []), Z.get('licenseAll', {}).get('storeBand', {}).get('active', [])))}, ensure_ascii=False))
