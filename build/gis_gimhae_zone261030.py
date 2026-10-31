"""GIS(gis.html) 김해 원도심 자료(data/gimhae.js)에 확정 구역계(1안 · 2026-10-30)를 넣는다.

Usage: python3 build/gis_gimhae_zone261030.py <김해_구역계1안_정본_261030.geojson> <숫자정본표_구역계1안_261030.json>
- 구역 선(zone) 맨 앞 = 1안 정본 좌표 그대로(k=1an). 기존 3개 선은 지우지 않고 참고선(k=ref)으로 둔다
- 요약 숫자(zone1an.sum) = 숫자정본표 행 값 그대로. 화면에서 실시간으로 세는 값은 gis.html 이 「이 화면 자료 기준」으로 따로 보인다
- 면적 표기는 정본표 공식 표기(208,778㎡ · 20.9ha). 도형 계산 면적은 싣지 않는다
- 건물마다 대표점(p = shapely representative_point, 늘 건물 안의 한 점)을 싣는다. 「이 구역으로 세기」가 이 점으로 구역 안을 판정해야
  숫자정본표(ENVMAP 엔진 · 건물 대표점이 경계 안)와 같은 704동·584/671이 나온다 — 꼭짓점 평균으로는 706동·585/672였다(10/30 코덱스 D11)
- 여러 번 돌려도 결과가 같다
"""
import base64, gzip, json, re, sys
from shapely.geometry import MultiPolygon, Point, Polygon
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JS = ROOT / 'data/gimhae.js'
G = json.loads(Path(sys.argv[1]).read_text())
C = json.loads(Path(sys.argv[2]).read_text())
R = {r['항목']: r for r in C['rows']}
src = JS.read_text()
m = re.match(r'window\.__GIMHAE__="([^"]+)";?', src)
D = json.loads(gzip.decompress(base64.b64decode(m.group(1))))

feat = G['features'][0] if 'features' in G else G
ring = feat['geometry']['coordinates'][0]
assert feat['geometry']['type'] == 'Polygon' and ring[0] == ring[-1]
area, ha = R['구역 면적(공식 표기)']['새값'], R['구역 면적(ha 표기)']['새값']
assert (area, ha) == (208778, 20.9), (area, ha)
NAME = '확정 구역계(1안) · 2026-10-30'
refs = [f for f in D['zone']['features'] if f['properties'].get('k') != '1an']
for f in refs: f['properties']['k'] = 'ref'
D['zone']['features'] = [{'type': 'Feature', 'properties': {'n': NAME, 'area': area, 'k': '1an'}, 'geometry': {'type': 'Polygon', 'coordinates': [ring]}}] + refs

def v(key, fmt=None):
    r = R[key]; x = r['새값']
    s = fmt(x) if fmt else (f'{x:,}' if isinstance(x, int) else str(x))
    return s + (r['단위'] or '').strip() if isinstance(x, (int, float)) else s

def rep_point(g):
    shp = MultiPolygon([Polygon(p[0], p[1:]) for p in g]) if isinstance(g[0][0][0], list) else Polygon(g[0], g[1:])
    q = shp.representative_point()
    return [round(q.x, 7), round(q.y, 7)]

for b in D['bld']:
    b['p'] = rep_point(b['g'])
Z1 = Polygon(ring)
hit = [b for b in D['bld'] if Z1.contains(Point(b['p']))]
yr = [b for b in hit if (b.get('y') or 0) > 0]
old = sum(1 for b in yr if 2026 - b['y'] >= 20)
assert len(hit) == R['건물 동수(윤곽 기준)']['새값'] and f"{old}/{len(yr)}" == R['20년 이상 노후 동수(윤곽 기준)']['새값'], (len(hit), old, len(yr))

pct = lambda x: f'{x:.1f}'
CTX = json.loads((ROOT / 'data/gimhae-zone-261030.json').read_text())['context']   # CCTV 는 정본표 행이 없어 S3 도로·교통 칸과 같은 자료
SUM = [
    ('면적', f"{area:,}㎡ · {ha}ha", '카카오맵 면적재기 실측 · 지적 경계 아님'),
    ('둘레', v('구역 둘레'), ''),
    ('건물', f"{v('건물 동수(윤곽 기준)')} · 20년 이상 {v('20년 이상 노후 비율(윤곽 기준)', pct)}", '건물 윤곽 기준'),
    ('건축물대장', f"{v('건물 동수(건축물대장 표제부 기준)')} · 20년 이상 {v('20년 이상 노후 비율(대장 기준)', pct)}", '표제부 기준'),
    ('점포', f"{v('점포 수(전 층)')} · {v('점포 밀도')}", '상가(상권)정보 2026-06'),
    ('용도지역', f"2종일반주거 {v('용도지역 구성 — 제2종일반주거지역', pct)} · 일반상업 {v('용도지역 구성 — 일반상업지역', pct)} · 준주거 {v('용도지역 구성 — 준주거지역', pct)}", ''),
    ('빈 점포 후보 건물', v('빈 점포 후보 건물(용도·영업 규칙)'), '후보 · 공실 확정 아님'),
    ('장기공실 후보', v('장기공실 후보(A+B) 지번'), '책상 판정 · 현장 확인 전'),
    ('공실 신호 2개 이상', v('공실 신호 2개 이상 지번'), '신호끼리 더하지 않음'),
    ('인구(회현동+부원동)', v('인구 — 회현동+부원동'), '2026-09 · 행정동 전체'),
    ('시 13곳 중 구역 안', v('시 13곳 중 구역 안'), '구역 밖 4곳은 새 대상지 선정 전 임시 유지'),
    # 구역 안 자료 보강(정본표 행 그대로 · 지번별 전기·수도·매물·상호는 싣지 않음 — 집계만)
    ('인허가(208종)', f"구역 안 {v('인허가 208종 구역 안 기록')} · 가게형 영업 중 {v('가게형 인허가 9종 — 영업 중')} · 2022년 이후 폐업 {v('가게형 인허가 9종 — 2022년 이후 폐업')}", '지방행정 인허가 · 2026-10-30'),
    ('건축인허가', f"{v('건축인허가 건수')} · {v('건축인허가 있는 지번')} · 용도변경 {v('용도변경 허가')} · 철거·멸실 {v('철거·멸실')}", '건축HUB · 2026-10-30'),
    ('수도', f"계량기 {v('수도 계량기(구역 안)')} · 자료 있는 {v('수도 자료 있는 지번')} · 미사용·최근 중단 {v('수도 미사용·최근 중단 지번')}", '봉황동만(부원동 자료 없음) · 2026.01~10'),
    ('전기', f"조회 {v('전기 — 조회 지번')} · 값 확보 {v('전기 — 값 확보 지번')} · 월평균 중간값 {R['전기 — 월평균 중간값']['새값']:,}kWh · 100kWh 이하 {v('전기 — 월평균 100kWh 이하 지번')}", '지번 합계 · 2025-06~2026-06 13개월'),
    ('토지이음', f"열람 {v('토지이음 열람 지번')} · 공시지가 중간값 {v('개별공시지가 중간값')} · 역사문화환경보존지역 {v('역사문화환경보존지역 지번 비율', pct)}", '개별공시지가 2026/01 공시'),
    ('국가유산', f"지정·보호구역 겹침 {v('국가유산 지정·보호구역 겹침')} · 현상변경 허용기준 구역 {v('역사문화환경 현상변경 허용기준 구역 안 비율', pct)}", '국가유산 공간정보 · 2026-10-30'),
    ('인구 이동', f"순유출 회현동 {R['순유출 — 회현동']['새값']:,}명 · 부원동 {R['순유출 — 부원동']['새값']:,}명 · 2031 예측 {v('2031 인구 예측 — 회현동+부원동')}명", '순유출 2023-01~2026-09 · 예측은 추세 연장(관측 아님)'),
    ('방범 CCTV', f"{CTX['safe']['방범 CCTV']}대", '구역 안 · 생활·안전 시설 자료'),
]
D['zone1an'] = {'name': NAME, 'area': area, 'ha': ha, 'date': '2026-10-30', 'edition': C['edition'],
                'ring': ring[:-1], 'sum': [list(x) for x in SUM],
                'src': '숫자정본표(구역계 1안) 값 · Ver.261031 · 화면에서 세는 값은 9/2 건물·점포 자료 기준이라 다를 수 있음'}
blob = json.dumps(D['zone1an'], ensure_ascii=False) + json.dumps(D['zone'], ensure_ascii=False)
for bad in ['217,510', '217510', '21.8', '21.75', '67,510', '869m', '26개 블록', '208,622', '208622', '대표', '⑦', '남실장']:
    assert bad not in blob, bad
enc = base64.b64encode(gzip.compress(json.dumps(D, ensure_ascii=False, separators=(',', ':')).encode(), mtime=0)).decode()
JS.write_text(src[:m.start(1)] + enc + src[m.end(1):])
print(json.dumps({'zone': [f['properties'] for f in D['zone']['features']], 'verts': len(ring) - 1, 'sum': len(SUM), 'inside': [len(hit), f'{old}/{len(yr)}']}, ensure_ascii=False))
