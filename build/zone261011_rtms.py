# -*- coding: utf-8 -*-
# 실거래 공개 자료(국토부, 법정동 단위) → data/gimhae-zone-261011.json 의 rtms
# 사용: python3 build/zone261011_rtms.py <rtms_261013 폴더>   (summary.json 을 읽음 — fetch_rtms.py·summarize.py 뒤)
# 공개 원칙: 건수·비중·면적만. 거래 금액(㎡당 중간값 포함)·내부용(_) 칸은 공개 JSON 에 싣지 않는다(금액은 rtms_261013/summary.json 내부).
import sys, json, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
ZP = R / 'data/gimhae-zone-261011.json'
S = json.load(open(pathlib.Path(sys.argv[1]) / 'summary.json'))
Z = json.loads(ZP.read_text())
out = {'source': '국토교통부 부동산 거래 신고 공개 자료(공공데이터포털 OpenAPI, 2026-10-13 받음)', 'dongs': S['dongs'],
       'caveat': S['caveat'] + ' · 단독·다가구는 주택 거래(가게 임대·매매 아님) · 2026년은 1~9월(신고 기한 30일이라 최근 달은 덜 잡힘)',
       'kinds': {}}
for k in ('shrent', 'shtrade', 'nrg', 'land'):
    if k not in S: continue
    K = S[k]
    yrs = []
    for y in K['years']:
        e = {kk: v for kk, v in y.items() if not kk.startswith('_') and kk not in ('medWonPerM2', 'nPrice')}
        yrs.append(e)
    out['kinds'][k] = {'name': K['name'], 'months': K['months'], 'n': K['n'], 'years': yrs}
    if k == 'shrent':
        full = [y for y in yrs if y['year'] <= 2025]
        a, b = full[0], full[-1]
        bh = {y['year']: y['byDong'].get('봉황동', 0) for y in yrs}
        peak = max((y for y in full), key=lambda y: y['byDong'].get('봉황동', 0))
        out['kinds'][k]['headline'] = {'wolseFrom': [a['year'], a['wolsePct']], 'wolseTo': [b['year'], b['wolsePct']],
                                       'bonghwangPeak': [peak['year'], bh[peak['year']]], 'bonghwangLow': min(((y['year'], bh[y['year']]) for y in full), key=lambda t: t[1])}
    else:
        full = [y for y in yrs if y['year'] <= 2025]
        out['kinds'][k]['headline'] = {'peak': max(((y['year'], y['n']) for y in full), key=lambda t: t[1]), 'last': [full[-1]['year'], full[-1]['n']]}
Z['rtms'] = out
ZP.write_text(json.dumps(Z, ensure_ascii=False, separators=(',', ':')))
print(json.dumps({k: (v['n'], v.get('headline')) for k, v in out['kinds'].items()}, ensure_ascii=False))
