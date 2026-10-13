"""과거 로드뷰 비교(2026-10-13, 카카오 로드뷰 공개 파노라마 · 코덱스 3갈래 판정 + 클로드 재검토) 결과를 지번별로 합친다.

Usage: python3 build/zone261011_roadview.py JUDGED_JSON
  JUDGED_JSON = ~/dev/gimhae-vacancy-rv/judged.json  (merge.py 결과 · 내부 납품본: 김해_초광역/시청보고준비_261015/01_전수조사/과거로드뷰_비교_261013/)
공개 페이지라 사진·근거 문장(상호가 들어 있음)은 싣지 않고 시점별 상태·확신만 싣는다. 순서: zone261011_base.py 다음.
"""
import sys, json, re
from pathlib import Path
from collections import Counter
from shapely.geometry import shape, Point

ROOT = Path(__file__).resolve().parents[1]
J = json.loads(Path(sys.argv[1]).expanduser().read_text())
ZP = ROOT / 'data/gimhae-zone-261011.json'
Z = json.loads(ZP.read_text()); poly = shape(Z['boundary']['geometry'])
assert len(J) == 89
by = {}
for r in J:
    m = re.search(r'(봉황동|서상동|부원동) ([\d-]+)', r['label']); jb = f'{m.group(1)} {m.group(2)}'
    rec = {'panels': [{'date': p['date'], 'state': p['state'], 'conf': p['confidence']} for p in r['panels']], 'hint': r['hint'], **({'note': r['note']} if r.get('note') else {})}
    if jb in by:   # 시 13곳이 1차 A·B 목록에도 있는 지번(8쌍) — 같은 사진이므로 판정이 다르면 그 시점은 「판단 불가」로 낮춘다
        old = by[jb]; assert [p['date'] for p in old['panels']] == [p['date'] for p in rec['panels']], jb
        for po, pn in zip(old['panels'], rec['panels']):
            if po['state'] != pn['state']: po['state'], po['conf'] = '판단 불가', '낮음'
        old['ids'].append(r['id']); old['cls'] = old['cls'] if old['cls'] != 'city' else r['cls']
        if rec.get('note'): old['note'] = rec['note']
        continue
    by[jb] = {**rec, 'ids': [r['id']], 'cls': r['cls'], 'lnglat': r['lnglat']}
assert len(by) == 81, len(by)   # 89건 − 같은 지번 8쌍
assert all(poly.buffer(0.0003).covers(Point(*v['lnglat'])) for v in by.values())
banned = re.compile(r'evidence|전화|010-|상호')
latest = Counter(v['panels'][0]['state'] for v in by.values())
empty25 = sorted(j for j, v in by.items() if v['panels'][0]['state'] == '비어 보임' and v['panels'][0]['date'].startswith('2025'))
empty22 = sorted(j for j in empty25 if len(by[j]['panels']) > 1 and by[j]['panels'][1]['state'] == '비어 보임')
a_open = sorted(j for j, v in by.items() if v['cls'] == 'A' and v['panels'][0]['state'] == '영업 중')
partial = sorted(j for j in empty22 if by[j].get('note'))
low25 = sorted(j for j in empty25 if by[j]['panels'][0]['conf'] == '낮음')
Z['roadview'] = {'byJibun': by, 'partial': partial, 'lowConf2025': low25, 'targets': len(J), 'jibun': len(by), 'latest': dict(latest), 'empty2025': empty25, 'empty2022and2025': empty22, 'aOpen2025': a_open,
                 'source': '카카오 로드뷰 공개 파노라마(최신 대부분 2025-03, 과거 2022-03·2019-11 등) — 대상 지번 방향으로 같은 화각을 잘라 시점별 1층 가게 앞을 판정(판정자 2단계 교차 확인, 2026-10-13)',
                 'caveat': '길에서 본 1층 앞모습만 — 층·호 단위 판정 아님 · 촬영점이 달라 가리면 판단 불가 · 공실 확정이 아니라 「그 시점에 비어 보였다」는 보조 증거'}
assert not banned.search(json.dumps(Z['roadview'], ensure_ascii=False))
ZP.write_text(json.dumps(Z, ensure_ascii=False, separators=(',', ':')))
print(json.dumps({k: Z['roadview'][k] for k in ('targets', 'jibun', 'latest', 'empty2025', 'empty2022and2025', 'aOpen2025')}, ensure_ascii=False))
