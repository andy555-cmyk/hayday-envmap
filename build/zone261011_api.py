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
                 'note': '소진공이 점포 밀집도로 그은 주요 상권 영역이다. 부동산원 공실률 표본 상권과는 다른 구획이다'}

# 2. 코덱스 열쇠 없는 수집 — 있는 것만
if CX and CX.exists():
    def load(p):
        p = CX / p
        return json.loads(p.read_text()) if p.exists() else None
    Z.setdefault('apiMore', {})
    for lane in ('L1_localdata_all', 'L2_eum_537', 'L3_history', 'L4_kakao_place'):
        r = load(f'{lane}/result.json')
        Z['apiMore'][lane] = {'done': r is not None}

ZP.write_text(json.dumps(Z, ensure_ascii=False, separators=(',', ':')))
print(json.dumps({'sbizZone': [(h['name'], h['zonePct'], h['marketPct']) for h in hit], 'apiMore': Z.get('apiMore')}, ensure_ascii=False))
