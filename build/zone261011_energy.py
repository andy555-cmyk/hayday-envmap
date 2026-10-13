# -*- coding: utf-8 -*-
"""확정 구역계 비주거 지번 전기 사용량(건축HUB 건물에너지 API) — 공개판엔 구역 합계·분포만, 지번별 값은 내부 겹침표로.

Usage: python3 build/zone261011_energy.py ENERGY_ZONE_JSON [INTERNAL_OUT_DIR]
  ENERGY_ZONE_JSON = ~/dev/gimhae-tasks-261013/energy_zone.json (구역계 3안 방 조회 2026-10-13 — 비주거 지번 199곳 × 2025-06~2026-05 요청, 2026-05는 아직 미공개)
  INTERNAL_OUT_DIR = 내부 증빙 겹침표를 쓸 곳(전수조사 폴더) — 지번별 전기·로드뷰·1차 판정·폐업 신호를 한 줄로
가이드라인(설명회본 27쪽): 공실 증빙 ① 「수도 및 전기사용량이 기준 이하」 — 기준값은 가이드라인에 숫자가 없음(공고문 확인 필요).
지번 합계라 한 지번에 여러 호가 있으면 한 칸만 빈 경우는 드러나지 않는다(층·호 단위 아님).
순서: zone261011_roadview.py 다음, zone261011_html.py 전.
"""
import sys, json, csv, statistics as st
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
E = json.loads(Path(sys.argv[1]).expanduser().read_text())
ZP = ROOT / 'data/gimhae-zone-261011.json'
Z = json.loads(ZP.read_text())
rows = {}
for jb, v in E.items():
    m = v.get('elec', {})
    have = {ym: sum(float(i.get('useQty') or 0) for i in its) for ym, its in m.items() if isinstance(its, list) and its}
    rows[jb] = {'months': len(have), 'avg': (sum(have.values()) / len(have)) if have else None, 'min': min(have.values()) if have else None}
data = sorted(r['avg'] for r in rows.values() if r['avg'] is not None)
months = sorted({ym for v in E.values() for ym, its in v.get('elec', {}).items() if isinstance(its, list) and its})
q = st.quantiles(data, n=4)
Z['energy'] = {'queried': len(rows), 'withData': len(data), 'noData': len(rows) - len(data), 'period': f"{months[0][:4]}-{months[0][4:]}~{months[-1][:4]}-{months[-1][4:]}", 'months': len(months),
               'medianMonthlyKwh': round(st.median(data)), 'q1': round(q[0]), 'q3': round(q[2]),
               'le100': sum(1 for a in data if a <= 100), 'le300': sum(1 for a in data if a <= 300),
               'fullMonths': sum(1 for r in rows.values() if r['months'] == len(months)), 'partialMonths': sum(1 for r in rows.values() if 0 < r['months'] < len(months)),
               'partialRange': [min(r['months'] for r in rows.values() if 0 < r['months'] < len(months)), max(r['months'] for r in rows.values() if 0 < r['months'] < len(months))],
               'quartileMethod': '사분위 = 파이썬 statistics.quantiles 기본(배타) 방식',
               'source': '국토교통부 건축HUB 건물에너지정보(전기) — 확정 구역계 안 비주거 지번(대장상 API 대상) 199곳, 2026-10-13 조회',
               'caveat': '월 100·300kWh는 공실 판정값이 아님(가이드라인은 「기준 이하」만 정하고 숫자가 없음 — 공고문 기준 확인 필요) · 지번 합계(층·호 단위 아님) · 자료 없는 44곳은 API가 돌려준 자료가 없는 곳(이유 확인 필요) · 2026년 5월분은 아직 공개 전'}
assert Z['energy']['withData'] == 155 and Z['energy']['queried'] == 199
ZP.write_text(json.dumps(Z, ensure_ascii=False, separators=(',', ':')))

# 내부 증빙 겹침표 — 공개 화면에는 싣지 않는다
if len(sys.argv) > 2:
    out = Path(sys.argv[2]).expanduser(); out.mkdir(parents=True, exist_ok=True)
    rank = {jb: i for i, jb in enumerate(sorted((jb for jb, r in rows.items() if r['avg'] is not None), key=lambda j: rows[j]['avg']))}
    sv = {f['properties']['jibun']: f['properties'] for f in Z['survey']['points']['features']}
    rv = Z['roadview']['byJibun']
    closed = {}
    for s in Z['vacancy']['localdata']['signals']:
        closed.setdefault(s['address'].split(',')[0], s['closed'])
    site = {t['jibun']: t['rank'] for t in Z['sites']}
    keys = set(rows) | {j for j, p in sv.items() if p['c'] in 'ABC'} | set(rv) | set(site)
    lines = []
    for jb in keys:
        e = rows.get(jb, {}); p = sv.get(jb, {}); r = rv.get(jb)
        pl = r['panels'] if r else []
        ev, kinds = [], set()
        if e.get('avg') is not None and e['avg'] <= 300: ev.append('① 전기 낮음(월 300kWh 이하, 기준값은 공고 확인)'); kinds.add(1)
        if r and pl and pl[0]['state'] == '비어 보임' and pl[0]['date'] < '2026-01-01':
            two = len(pl) > 1 and pl[1]['state'] == '비어 보임'
            ev.append(f"③ 로드뷰 {pl[0]['date'][:7]} 비어 보임" + (f" · {pl[1]['date'][:7]}도" if two else '')); kinds.add(3)
        lines.append({'지번': jb, '시 순위': site.get(jb, ''), '1차 판정': p.get('judge', ''), '도로명': p.get('road', ''), '용도': p.get('use', ''),
                      '전기 월평균 kWh': round(e['avg']) if e.get('avg') is not None else ('자료 없음' if jb in rows else '조회 안 함'),
                      '전기 낮은 순위(155곳 중)': (rank[jb] + 1) if jb in rank else '', '전기 자료 개월': e.get('months', ''),
                      '로드뷰 최신': f"{pl[0]['date'][:7]} {pl[0]['state']}" if pl else '', '로드뷰 앞 시점': f"{pl[1]['date'][:7]} {pl[1]['state']}" if len(pl) > 1 else '',
                      '1차 신호': p.get('signals', ''), '겹친 증빙(책상)': ' · '.join(ev), '증빙 종류 수': len(kinds)})
    assert all(r['panels'][0]['date'] >= r['panels'][-1]['date'] for r in rv.values()), 'panels = 최신 먼저'
    lines.sort(key=lambda x: (-x['증빙 종류 수'], x['전기 낮은 순위(155곳 중)'] or 9999))
    with open(out / '증빙겹침표_전기_로드뷰_261013.csv', 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.DictWriter(f, fieldnames=list(lines[0].keys())); w.writeheader(); w.writerows(lines)
    print('internal rows', len(lines), '증빙 2종', [x['지번'] for x in lines if x['증빙 종류 수'] >= 2])
print(json.dumps({k: v for k, v in Z['energy'].items() if k not in ('source', 'caveat')}, ensure_ascii=False))
