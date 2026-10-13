"""이전 현장 조사(8/27 실사·8/29 인터뷰)와 9/19 공실 매물 조사를 확정 구역계(2026-10-11)로 다시 판정한 결과를 합친다.

Usage: python3 build/zone261011_extras.py GAP_DIR
  GAP_DIR = ~/dev/gimhae-zone-final/codex_gap_261013 (2026-10-13 코덱스 재판정, 클로드 검토)
    I_fieldvoice/result.json   8/29 인터뷰·8/27 실사 중 구역 안 대응분(좌표 없는 인터뷰는 거리 이름·이동 순서로 판정)
    H_vacancy0919/result.json  9/19 공실 매물 조사(네이버 서상동·보충 광고) 재판정·광고 재확인 — 있으면 합친다
순서: zone261011_linkage.py 다음, update_gimhae_meeting_261011.py 전. 공개 페이지라 이름·상호·연락처·가격은 싣지 않는다.
"""
import sys, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
G = Path(sys.argv[1]).expanduser()
ZP = ROOT / 'data/gimhae-zone-261011.json'
Z = json.loads(ZP.read_text())
banned = re.compile(r'보증금|월세 ?\d|만 ?원|억|연락처|010-|의향|남실장')

I = json.loads((G / 'I_fieldvoice/result.json').read_text())
themes = [{'theme': t['theme'], 'flows': t['count'], 'quotes': [q['text'] for q in t['quotes']]} for t in I['themes']]
obs = [{'item': o['observation'], 'where': o['place'], 'zone': o['inZone']} for o in I.get('fieldObservations', [])]
Z['fieldVoice'] = {'date': '2026-08-27 실사 · 2026-08-29 현장 인터뷰(약 50명 규모, 좌표 없음)', 'themes': themes, 'observations': obs,
                   'excludedFlows': len(I.get('excluded', [])),
                   'note': '8/29 인터뷰는 대부분 확정 구역 밖(수로왕릉 쪽·외국인거리)에서 이뤄져, 구역 안으로 볼 수 있는 것은 공구거리 초기 인터뷰 2건뿐 — 구역 안 상인 목소리는 현장에서 더 모아야 함'}
assert not banned.search(json.dumps(Z['fieldVoice'], ensure_ascii=False)), 'public wording'

S = Path('~/dev/gimhae-master/web/data/site.json').expanduser()
if S.exists():
    site = json.loads(S.read_text())
    lab = {'ok': '충족', 'chk': '확인 필요', 'ing': '진행 중', 'no': '아직'}
    Z['requirements'] = {'items': [{'id': r['id'], 'title': r['title'], 'status': r['status'], 'label': lab.get(r['status'], r['status']), 'now': r['now']} for r in site['requirements']],
                         'culture': [{'name': c['name'], 'why': c['why']} for c in site['plan']['culture']['picks']],
                         'url': 'https://andy555-cmyk.github.io/hayday-envmap/gimhae-recore/', 'source': '김해 원도심 RE:CORE 사업 안내 누리집 「요건 점검」(국토부 가이드라인 설명회본 2026.9.11 기준, 2026-10-13 판)'}
    # 누리집 자료는 읽기만 한다. 서로 다른 공간 범위의 통계를 합쳐 충족을 확정하지 않는다.
    for requirement in Z['requirements']['items']:
        if requirement['id'] == 'r2':
            requirement.update(status='chk', label='확인 필요', now=(
                '원도심 3개 행정동 사업체 수는 2021년 5,410개 → 2024년 5,120개(−5.4%, 3년 연속 감소), '
                '확정 구역계 안 건축물대장 583동 자료의 20년 이상 비율은 87.3%입니다. '
                '두 통계의 공간 범위·집계 대상이 달라 이것만으로 새 구역의 2개 요건 충족을 확정하지 않습니다. '
                '공모에서 인정하는 산정 범위와 기준에 맞춘 공식 자료 대조가 필요합니다.'))
    assert len(Z['requirements']['items']) == 17
H = G / 'H_vacancy0919/result.json'
if H.exists():
    h = json.loads(H.read_text())
    items = [{'id': x['id'], 'platform': x['platform'], 'kind': x['propertyType'], 'area': x['area'], 'floor': x['floor'], 'ad': x['advertisementStatus'],
              'zone': x['boundaryJudgment'], 'url': x['sourceUrl']} for x in h['items']]
    cb = h['reviewLedger']['confirmedBoundary']
    Z['vacancy']['survey0919'] = {'items': items, 'total': len(items),
        'byZone': {z: sum(1 for i in items if i['zone'] == z) for z in ['구역 안', '경계 밖 50m', '구역 밖', '주소 미확정']},
        'liveInside': sum(1 for i in items if i['zone'] == '구역 안' and i['ad'].startswith('공개 중')),
        'live': sum(1 for i in items if i['ad'].startswith('공개 중')),
        'ledger': {'old': h['reviewLedger']['originalTemporaryBoundary'], 'rows': cb['inside']['rows'], 'buildings': cb['inside']['buildings'],
                   'rows20': cb['same20mBandForComparison']['reviewRows'], 'buildings20': cb['same20mBandForComparison']['reviewBuildings']},
        'source': '2026-09-19 공실 매물 조사(네이버 서상동 월세 상세 16·보충 공개 광고 19) — 2026-10-13 확정 구역계로 재판정·광고 재확인(로그인 없이)'}
    assert not banned.search(json.dumps(Z['vacancy']['survey0919'], ensure_ascii=False)), 'public wording (0919)'
# 지형·토지 형태 — ENVMAP 엔진(52d5d7f)으로 확정 구역계 도판을 만든 방의 통계 + 같은 방이 sitedia 로 잰 값
EV = Path('~/dev/gimhae-site261011/envmap_zoneK_c800/stats.json').expanduser()
if EV.exists():
    P = json.loads(EV.read_text())['panels']
    Z['terrain'] = {'elevMin': P['contour']['boundary_min_m'], 'elevMax': P['contour']['boundary_max_m'], 'elevMean': P['contour']['boundary_mean_m'],
                    'flatPct': P['slope']['boundary_slope_share_pct']['0~5° 평탄'], 'slopeMean': P['slope']['boundary_mean_deg'],
                    'zoningPct': {k: v['boundary_pct'] for k, v in P['zoning']['zones'].items() if v['boundary_pct']},
                    'floorsMean': P['height']['mean_floors_boundary'], 'floorsMax': P['height']['max_floors_boundary'], 'lowPct': P['lowrise']['boundary_low_pct_of_known'],
                    'winterSunMean': P['sunhours']['boundary']['mean_h'], 'winterSun2hPct': P['sunhours']['boundary']['share_run2h_pct'],
                    # sitedia(대표 크롬)로 잰 값 — ~/dev/gimhae-site261011/qa/entry.md 4행
                    'parcels': 763, 'parcelMedianM2': 159, 'parkHa': 0.42, 'bcrPct': 37.4,
                    'source': 'ENVMAP 엔진 확정 구역계 도판 통계(사내 건물·용도지역 DB, 지형 Copernicus GLO-30 DSM 30m) · 필지·공원·건폐율 = sitedia 확정 구역계 상세(2026-10-11)',
                    'sunlightMethod': '2026-12-22 지면 일조 모의계산 · 평지 가정 · 수목·담장·화면 밖 건물 그림자 제외 · 법정 일조권 검토 아님',
                    'caveat': '지형은 건물·수목이 섞인 30m 표면 모델이라 미세 고저는 정확하지 않음 · 용도지역은 사내 DB(공인 도면 대조 전) · 일조는 평지 가정의 지면 모의계산이며 수목·담장·화면 밖 건물 그림자 제외, 법정 일조권 검토 아님'}
ZP.write_text(json.dumps(Z, ensure_ascii=False, separators=(',', ':')))
print(json.dumps({'terrain': 'terrain' in Z, 'req': len(Z.get('requirements',{}).get('items',[])), 'themes': [(t['theme'], t['flows']) for t in themes], 'obs': len(obs), 'survey0919': len(Z['vacancy'].get('survey0919', {}).get('items', []))}, ensure_ascii=False))
