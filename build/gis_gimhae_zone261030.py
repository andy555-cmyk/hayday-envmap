"""GIS(gis.html) 김해 원도심 자료(data/gimhae.js)에 확정 구역계(1안 · 2026-10-30)를 넣는다.

Usage: python3 build/gis_gimhae_zone261030.py <김해_구역계1안_정본_261030.geojson> <숫자정본표_구역계1안_261030.json>
- 구역 선(zone) 맨 앞 = 1안 정본 좌표 그대로(k=1an). 기존 3개 선은 지우지 않고 참고선(k=ref)으로 둔다
- 요약 숫자(zone1an.sum) = 숫자정본표 행 값 그대로. 화면에서 실시간으로 세는 값은 gis.html 이 「이 화면 자료 기준」으로 따로 보인다
- 면적 표기는 정본표 공식 표기(208,778㎡ · 20.9ha). 도형 계산 면적은 싣지 않는다
- 여러 번 돌려도 결과가 같다
"""
import base64, gzip, json, re, sys
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

pct = lambda x: f'{x:.1f}'
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
]
D['zone1an'] = {'name': NAME, 'area': area, 'ha': ha, 'date': '2026-10-30', 'edition': C['edition'],
                'ring': ring[:-1], 'sum': [list(x) for x in SUM],
                'src': '숫자정본표(구역계 1안) 값 · 화면에서 세는 값은 9/2 건물·점포 자료 기준이라 다를 수 있음'}
blob = json.dumps(D['zone1an'], ensure_ascii=False) + json.dumps(D['zone'], ensure_ascii=False)
for bad in ['217,510', '217510', '21.8', '21.75', '67,510', '869m', '26개 블록', '208,622', '208622', '대표', '⑦', '남실장']:
    assert bad not in blob, bad
enc = base64.b64encode(gzip.compress(json.dumps(D, ensure_ascii=False, separators=(',', ':')).encode(), mtime=0)).decode()
JS.write_text(src[:m.start(1)] + enc + src[m.end(1):])
print(json.dumps({'zone': [f['properties'] for f in D['zone']['features']], 'verts': len(ring) - 1, 'sum': len(SUM)}, ensure_ascii=False))
