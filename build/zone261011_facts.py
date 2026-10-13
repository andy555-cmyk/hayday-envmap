# -*- coding: utf-8 -*-
"""확정 구역계(2026-10-11) 분석 결과를 「사실 카드」 묶음으로 내보낸다 — 김해 RE:CORE 사업 안내 누리집과 그 AI 도우미가 읽을 근거.

Usage: python3 build/zone261011_facts.py [OUT_MD]
  쓰는 파일: data/gimhae-zone-261011-facts.json (기계용) · OUT_MD(사람용, 기본 = 본부 대상지_김해 폴더)
카드 한 장 = 질문 하나에 답 하나 + 범위·출처·기준일·한계. 숫자는 전부 data/gimhae-zone-261011.json 에서 읽는다(손으로 쓴 숫자 없음).
공개용이다: 상호·전화번호·광고 가격·소유자 의향·수도 체납·실거래가·내부 호칭은 넣지 않는다(마지막에 검사).
순서: zone261011_html.py 다음(파이프라인 마지막).
"""
import sys, re, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
Z = json.loads((ROOT / 'data/gimhae-zone-261011.json').read_text())
OUT_JSON = ROOT / 'data/gimhae-zone-261011-facts.json'
OUT_MD = Path(sys.argv[1]).expanduser() if len(sys.argv) > 1 else Path.home() / 'Library/CloudStorage/GoogleDrive-ganpan0@gmail.com/내 드라이브/hayday-hq/03_시스템_도구/환경분석맵/대상지_김해/확정구역계_분석사실묶음_누리집AI용_261013.md'
n = lambda v: f'{v:,}'
s, es, bt, rv, ro, gl, tm = Z['stats'], Z['emptyShop'], Z['bizTimeline'], Z['roadview'], Z['rone'], Z['gateLoad'], Z['tms']
V, ld, sb, L, lg, ctx, tr, sv = Z['vacancy'], Z['vacancy']['localdata'], Z['vacancy']['sbiz'], Z['linkage'], Z['ledger'], Z['context'], Z['terrain'], Z['survey']
lu = Z['landUseSummary']
yi = lambda y: bt['years'].index(y)
op = lambda y: bt['open'][yi(y)]; cl = lambda y: bt['close'][yi(y)]
first_flip = next(y for y in range(2020, 2027) if cl(y) > op(y))
ZONE = '확정 구역계(2026-10-11 · 217,510㎡)'
F = []
def card(id_, topic, q, a, detail, scope, source, asof, limit):
    F.append({'id': id_, 'topic': topic, 'q': q, 'a': a, 'detail': detail, 'scope': scope, 'source': source, 'asOf': asof, 'limit': limit})

card('area', '구역', '확정 구역계 면적과 범위는?',
     f"{n(Z['area'])}㎡(약 {Z['areaHa']}ha) · 도로로 나뉜 블록 {Z['blocks']}개 · 둘레 약 {n(Z['perimeterM'])}m",
     f"2026-10-11 확정선을 도로 중심선 블록에 맞춘 도형. 시 우선순위 대상지 13곳이 모두 안에 있다. 공모 권장 15만㎡보다 {n(Z['relation']['over150k'])}㎡ 넓다(10/8 ①안보다 {n(Z['relation']['addedVsN1'])}㎡ 넓음).",
     ZONE, Z['sourceNote'], Z['confirmed'], '도형 계산값이며 지적(필지) 경계가 아니다. 지적선으로 다시 그리면 면적이 달라질 수 있다.')
card('buildings', '건물', '구역 안 건물 수와 노후도는?',
     f"건축물대장 기준 {n(lg['buildings'])}동 중 20년 이상 {lg['old20Pct']}%(공식 수치) · 건물 윤곽 기준으로는 {n(s['buildings'])}동 중 {s['oldPct']}%({n(s['old20'])}동 ÷ 연도 확인 {n(s['knownYear'])}동, 참고값)",
     f"연령대: 40년 이상 {n(s['bands']['40년 이상'])} · 30~39년 {n(s['bands']['30~39년'])} · 20~29년 {n(s['bands']['20~29년'])} · 10~19년 {n(s['bands']['10~19년'])} · 10년 미만 {n(s['bands']['10년 미만'])} · 연도 미확인 {n(s['bands']['미확인'])}동. 대장 기준 30년 이상 {lg['old30Pct']}%.",
     ZONE, f"건물 윤곽 = 환경분석맵 건물 자료(VWorld 건물·건축물대장 2026-08) · 대장 = {lg['source']}", '2026-08 / 2026-10-13',
     '공식 수치는 건축물대장 기준 87.3%로 쓰고, 윤곽 기준 91.7%는 참고값으로 병기한다(집계 단위가 다름 — 대장은 지번 점 기준·부속건물 포함). 둘 다 노후건축물 요건(50% 이상)을 넘는다. 건물 연도는 안전등급이 아니다.')
card('uses', '건물', '구역 건물은 주로 무슨 용도인가?',
     ' · '.join(f"{k.replace('확인 불가', '용도 미확인')} {n(v)}" for k, v in list(s['uses'].items())[:5]) + '동(건물 윤곽 923동 기준)',
     f"법정동별 건물: {' · '.join(f'{k} {n(v)}' for k, v in s['dongs'].items())}동. 용도지역 면적: {' · '.join(f'{k} {v}%' for k, v in tr['zoningPct'].items())}.",
     ZONE, '건축물대장 주용도(환경분석맵 건물 자료) · 용도지역 = 사내 용도지역 자료', '2026-08', '건물 전체의 주용도 기준이라 층별 실제 쓰임과 다를 수 있다. 용도지역 비율은 공인 도면 대조 전.')
card('stores', '점포', '구역 안 등록 점포는 몇 곳인가?',
     f"{n(s['stores'])}곳(상가정보 {sb['latest']}) — " + ' · '.join(f"{k} {n(v)}" for k, v in s['industries'].items()),
     f"직전 분기({sb['compare']}) {n(sb['insideCompare'])}곳. 큰길(대로·중로)에서 100m 넘게 안쪽에 있는 점포 {n(ctx['storeDistance']['bands']['100m 밖'])}곳(중간값 {ctx['storeDistance']['medianM']}m, 직선).",
     ZONE, sb['source'], sb['latest'], '등록된 점포 위치이며 지금 영업 중인 가게 수가 아니다. 상가정보에 안 오르는 업종(도매·사무실 등)은 빠진다.')
card('emptyShop', '공실', '건물 기준 빈 점포 후보는 몇 동인가?',
     f"{es['any']['shop']}동 — 등록 가게 0 건물 중 주거·가게 대상 아님·대장 없음을 뺀 나머지(" + '·'.join(f"{k.replace('제1종근린생활시설', '1종 근생').replace('제2종근린생활시설', '2종 근생').replace('문화및집회시설', '문화집회')} {v}" for k, v in es['shopUse'].items()) + f", 용도지역 무관). 상업·준주거지역만 보면 {es['orig']['shop']}동",
     f"등록 가게 0인 건물 {n(es['any']['shop'] + es['any']['res'] + es['any']['non'] + es['any']['unk'])}동을 대장 주용도·건물 이름으로 나눔: 빈 점포 후보 {es['any']['shop']} · 주거용 {es['any']['res']} · 가게 대상 아님 {es['any']['non']} · 대장 없음 {es['any']['unk']}. 후보 중 20년 넘은 건물 {es['shopOld20']}동. 법정동: {' · '.join(d['dong'] + ' ' + str(d['shop']) for d in es['byDong'])}.",
     ZONE + ' · 건물 단위', es['source'], '건물 2026-08 · 상가 2026-06', es['caveat'] + '. 이전 사업구역(51.8ha) 기준 354동과 섞지 않는다.')
card('survey', '공실', '전수조사 1차 판정 결과는?',
     f"구역 안 지번 {sum(sv['counts'].values())}곳: A 장기공실 유력 {sv['counts']['A']} · B 확인 필요 {sv['counts']['B']} · C 최근 공실(2026년) {sv['counts']['C']} · D 영업 중 {sv['counts']['D']} · E 주거만 {sv['counts']['E']}",
     '건축물대장·인허가 폐업·상가정보·공개 매물·시 13곳을 겹쳐 지번별로 나눈 책상 분류.', ZONE + ' · 지번 단위', sv['source'], '2026-10-13',
     '공실 확정이 아니다. 장기 공실 인정은 ' + sv['rule'] + '. 현장·전기·수도 사용량으로 확인해야 한다.')
card('roadview', '공실', '과거 로드뷰에서 1층 앞이 비어 보인 곳은?',
     f"2025년 3월 사진에서 1층 앞이 비어 보인 지번 {len(rv['empty2025'])}곳({' · '.join(j + ('(확신 낮음)' if j in rv.get('lowConf2025', []) else '') for j in rv['empty2025'])}) · 그중 2022년 3월에도 비어 보인 곳 {len(rv['empty2022and2025'])}곳({' · '.join(rv['empty2022and2025'])})",
     f"시 13곳 + 전수조사 1차 A·B, 지번 {rv['jibun']}곳. 최신 사진 기준 영업 중 {rv['latest'].get('영업 중', 0)} · 비어 보임 {rv['latest'].get('비어 보임', 0)} · 주거·창고 {rv['latest'].get('주거·창고', 0)} · 판단 불가 {rv['latest'].get('판단 불가', 0)}. 1차 판정 A 중 {len(rv['aOpen2025'])}곳({' · '.join(rv['aOpen2025'])})은 2025년 3월 영업 중이었다." + (f" {'·'.join(rv['partial'])}은 2019·2022년엔 가운데 칸만 닫히고 옆 칸은 영업했다." if rv.get('partial') else ''),
     '지번 단위 · 길에서 본 1층', rv['source'], '최신 대부분 2025-03', rv['caveat'] + '. 2026.1.1 이전 공실 증빙의 보조 자료로만 쓴다.')
if Z.get('energy'):
    en = Z['energy']
    card('energy', '공실', '구역 비주거 건물의 전기 사용량은?',
         f"조회 {en['queried']}지번 중 자료 {en['withData']}곳 · 월평균 중간값 {n(en['medianMonthlyKwh'])}kWh(가운데 절반 {n(en['q1'])}~{n(en['q3'])}) · 월 100kWh 이하 {en['le100']}곳, 300 이하 {en['le300']}곳",
         f"월 100·300kWh는 공실 판정값이 아니다. 조회 기간 {en['period']}({en['months']}개월) — {en['fullMonths']}곳은 모두, {en['partialMonths']}곳은 {en['partialRange'][0]}~{en['partialRange'][1]}개월 자료로 평균. 가이드라인 공실 증빙 ①「수도·전기 사용량이 기준 이하」에 쓰는 자료다. {en['quartileMethod']}.", ZONE + ' · 비주거 지번 합계', en['source'], en['period'],
         en['caveat'] + '. 지번별 값은 공개하지 않는다.')
card('license', '공실', '인허가로 본 개업·폐업 흐름은?',
     f"{first_flip}년부터 폐업이 개업보다 많다(2024 개업 {op(2024)}·폐업 {cl(2024)} / 2025 {op(2025)}·{cl(2025)} / 2026.10.13까지 {op(2026)}·{cl(2026)}) · 2022년 이후 폐업했고 같은 주소에 지금 영업 신고가 없는 곳 {len(ld['signals'])}곳",
     f"구역 안 인허가 기록 {n(bt['records'])}건({bt['years'][0]}~2026) = 지금 영업 {n(bt['openNow'])} · 폐업 {n(bt['closedAll'])} · 취소·말소 등 {bt['otherStatus']}. {bt['definition']}. 2010년 뒤 개업이 가장 많았던 해 {bt['peakOpenSince2010']['year']}년({bt['peakOpenSince2010']['n']}건).",
     ZONE + ' · 좌표 있는 인허가 기록', bt['source'], '2026-10-13 받음', bt['caveat'] + '. 원도심 4개 동 시계열(2025년 첫 역전)과 공간범위가 다르다.')
if Z.get('licenseAll'):
    LA = Z['licenseAll']; ix = LA['years'].index; pk = LA['years'][LA['store']['active'].index(max(LA['store']['active']))]
    card('licenseAll', '공실', '인허가 전 업종으로 보면 가게형 인허가 건수는 어떻게 변했나?',
         f"그해 유효한 가게형 인허가 {LA['store']['active'][ix(2016)]}건(2016) → {max(LA['store']['active'])}건({pk}, 정점) → {LA['store']['active'][ix(2026)]}건(2026-10-13 현재) · 봉황대길 40m 띠는 {LA['storeBand']['active'][ix(2016)]}건 → {LA['storeBand']['active'][ix(2025)]}건(2025)",
         f"구역 안 인허가 기록 {n(LA['insideRecords'])}건(지금 영업 {n(LA['insideOpen'])}) 중 가게형 {n(LA['storeRecords'])}건. " + LA['rule'] + '.', ZONE + ' · 좌표 있는 인허가 기록', LA['source'], '2026-10-13 받음', LA['caveat'] + '.')
card('lifespan', '공실', '구역 안 가게는 얼마나 버티나?',
     f"폐업한 {n(bt['lifespan']['closed'])}건 중 {bt['lifespan']['within3yPct']}%가 3년 안에 닫았다 · 영업 기간 평균 {bt['lifespan']['meanYears']}년(중간값 {bt['lifespan']['medianYears']}년)",
     f"원도심 4개 동은 같은 계산으로 37.9%·평균 7.6년. 2010~2022년에 연 가게 {bt['within3y']['2010-2022']['opened']}곳 중 3년 안에 닫은 곳은 {bt['within3y']['2010-2022']['pct']}%.",
     ZONE + ' · 인허가 9개 업종', bt['source'], '2026-10-13 받음', '9개 인허가 업종(음식점·제과·이용·미용·세탁·숙박·노래방·PC방)만이다. 명의·업종 변경도 폐업으로 잡히고 2011-07-06 일괄 정리 19건이 들어 있다.')
card('vanished', '공실', '상가정보에서 사라진 점포는?',
     f"{len(sb['vanished'])}곳({sb['compare']} → {sb['latest']}) · 새로 생김 {sb['newCount']}곳",
     f"업소번호만 바뀐 {sb['idReissued']}쌍과 원자료 중복 {sb['vanishedDupRemoved']}건은 뺐다. 다음 공개 {sb['next']}.", ZONE, sb['source'], f"{sb['compare']}·{sb['latest']}",
     '사라짐 = 폐업·이전 후보이며 확정이 아니다.')
card('listings', '공실', '지금 공개된 매물은?',
     f"2026-10-13 확인: 구역 안 {sum(1 for l in V['listings']['items'] if l['zone'] == '구역 안')}건 · 9/19 온라인 매물 조사 {V['survey0919']['total']}건 중 주소 확인된 구역 안 {V['survey0919']['byZone']['구역 안']}건(지금 살아 있는 광고 {V['survey0919']['liveInside']}건)",
     f"상세 주소 비공개 {V['survey0919']['byZone']['주소 미확정']}건은 구역 판정을 못 했다. {V['listings']['limit']}.", ZONE, V['survey0919']['source'], '2026-10-13',
     '광고는 수시로 바뀐다. 가격은 싣지 않는다.')
if Z.get('kakaoPlace'):
    kp = Z['kakaoPlace']
    card('kakaoPlace', '점포', '카카오맵에 올라 있는 구역 안 장소는?',
         f"{kp['total']}곳 — " + ' · '.join(f"{k} {v}" for k, v in kp['byCategory'].items()),
         f"상가정보(2026-06) 294곳과 이름·20m로 짝이 맞는 곳 {kp['match']['both']}곳 · 카카오에만 {kp['match']['kakaoOnly']} · 상가정보에만 {kp['match']['sbizOnly']}.", ZONE, kp['source'], '2026-10-13', kp['caveat'] + '.')
if Z.get('vacRate'):
    VR = Z['vacRate']
    card('vacRate', '공실', '부동산원 정의를 적용하면 확정 구역계 공실률은 얼마로 추정되나?',
         f"추정(현장 조사 아님): 1층 {VR['ground']['lowPct']}~{VR['ground']['highPct']}% · 소규모상가 {VR['small']['lowPct']}~{VR['small']['highPct']}% · 중대형 {VR['large']['lowPct']}~{VR['large']['highPct']}%(위층 근거가 적어 범위가 넓음)",
         f"대상 = {VR['definition']} — 구역 안 {VR['population']['buildings']}동(소규모 {VR['population']['small']} · 중대형 {VR['population']['large']}), 상가 층 면적 {n(VR['population']['commercialFloorM2'])}㎡. 방법: {VR['method']}. 하한 = 공실 근거만, 상한 = 공실 근거 + 근거 없음."
         + (f" 민감도: {VR['sensitivity']['rule']} — 1층에만 배정하면 1층 {VR['sensitivity']['groundOnly']['ground'][0]}~{VR['sensitivity']['groundOnly']['ground'][1]}% · 소규모 {VR['sensitivity']['groundOnly']['small'][0]}~{VR['sensitivity']['groundOnly']['small'][1]}%." if VR.get('sensitivity') else ''),
         ZONE + ' · 상가 계열 일반건축물', VR['source'], '2026-10-13', VR['caveat'] + '. ' + VR['compare'] + '.')
card('emptyHouse', '공실', '빈집(주거) 목록은 있나?', '주소별 공개 목록이 없다', V['emptyHouse']['note'] + '.', '김해시', '빈집애·공공데이터포털', '2026-10-13', '구역 안 빈집 수는 현장 조사로만 확인할 수 있다.')
card('rone', '공실', '확정 구역계의 공실률은?',
     f"구역만의 공식 공실률은 없다. 부동산원 「{ro['market']}」 소규모상가 공실률 {ro['latest']['smallVacancyPct']}%({ro['latest']['quarter']})는 이 상권과 구역이 {ro['overlapPct']}%만 겹쳐 참고값이다" + (f". 부동산원 정의를 구역 상가 건물 {Z['vacRate']['population']['buildings']}동에 적용한 추정(현장 조사 아님)은 1층 {Z['vacRate']['ground']['lowPct']}~{Z['vacRate']['ground']['highPct']}%, 소규모상가 {Z['vacRate']['small']['lowPct']}~{Z['vacRate']['small']['highPct']}%" if Z.get('vacRate') else ''),
     f"이전 사업구역 51.8ha는 상권 도형과 {ro['oldOverlapPct']}% 겹쳐 그 상권 값을 지표로 썼다(그때도 상권 표본 건물 값). 확정 구역계 중 상권 안: 면적 약 {ro['overlapM2'] / 10000:.1f}ha · 등록점포 {ro['storesIn']}/{s['stores']}곳 · 건물 {ro['bldIn']}/{s['buildings']}동 · 시 13곳 중 {'·'.join(str(x) + '번' for x in ro['sitesIn'])}. 같은 상권 소규모상가 임대료 {n(ro['latest']['smallRentWonPerM2'])}원/㎡. 김해의 다른 표본 상권({' · '.join(o['name'] for o in ro['others'])})은 집합상가만 조사한다.",
     '부동산원 표본 상권 vs ' + ZONE, ro['source'], ro['latest']['quarter'], '공실률은 표본 건물 조사값이라 빈 점포 후보·전수조사 판정과 모집단이 달라 합하거나 환산하지 않는다. 상권 코드는 공식 통계표 기준 ' + ro['code'] + '.')
if Z.get('sbizZone', {}).get('items'):
    sz = Z['sbizZone']['items'][0]
    card('sbizZone', '공실', '소상공인시장진흥공단 주요 상권과 구역은 겹치나?',
         f"「{sz['name']}」 상권 영역과 구역의 {sz['zonePct']}%(약 {sz['overlapM2'] / 10000:.1f}ha)가 겹친다 — 그 상권 영역의 {sz['marketPct']}%가 구역 안",
         Z['sbizZone']['note'] + '.', ZONE, Z['sbizZone']['source'], '2026-10-13', '상권 영역 경계는 소진공이 점포 밀집도로 그은 것이며 행정 구역이 아니다.')
if Z.get('heritage'):
    hg = Z['heritage']
    card('heritage', '대상지', '확정 구역계는 국가유산(문화재) 규제를 받나?',
         f"모든 개발 금지가 아니다 — 구역의 {hg['unionPct']}%가 「{hg['name']}」({hg['designation']}, {hg['designatedDate'][:4]} 지정)의 세 공개 도형(지정구역·보호구역·현상변경 허용기준 구역) 중 하나와 겹치고, 그중 대부분은 기준 안에서 건축이 되는 허용기준 구역이다",
         ' · '.join(f"{l['name']} {l['overlapPct']}%" for l in hg['layers']) + ' — 허용기준 구역별 ' + ' · '.join(f"{z_['name']} {z_['zonePct']}%" + (f"({z_['rule']})" if z_.get('rule') else '') for z_ in hg['subZones']) + '.',
         ZONE, hg['source'] + (f" · 허용기준 {hg['notice']['number']}({hg['notice']['date']})" if hg.get('notice') else ''), '2026-10-13', hg['note'] + '.')
if Z.get('timeline'):
    tl = Z['timeline']; key = [tl['events'][i] for i in tl['key']]
    card('timeline', '연계', '봉리단길·원도심은 어떻게 변해 왔나?',
         ' → '.join(f"{str(e['date'])[:7]} {e['title']}" for e in key[:8]),
         f"연표 {len(tl['events'])}건(기사·사업·고시). 검색 관심(네이버 데이터랩 「{tl['trend']['keyword']}」, 2018년 5월=100): " + ' · '.join(f"{a['year']} {round(a['value'])}" for a in tl['trend']['annual'] if a['value'] is not None) + '.',
         '김해 원도심(동상·회현·부원동)·봉황대길', tl['source'], '2026-10-13', '기사·보도 기준이며 명명자·최초 사용일은 확인 못함. 검색 관심은 상대값(사람 수 아님).')
if Z.get('landUse537'):
    L5 = Z['landUse537']; P5 = L5['price']
    card('landUse537', '대상지', '구역 지번 전체의 토지 규제와 공시지가는?',
         f"지번 {L5['done']}곳 열람: 역사문화환경보존지역 {L5['heritagePct']}% · 중점경관관리구역 {L5['landscapePct']}% · 자연재해위험개선지구 {L5['hazard']['count']}곳({L5['hazard']['pct']}%) · 공시지가 ㎡당 중간값 {n(P5['median'])}원",
         f"도시계획도로 저촉 {L5['road'].get('저촉', 0)} · 접합만 {L5['road'].get('접합만', 0)} · 없음 {L5['road'].get('없음', 0)}. 공시지가({P5['ym']}) 가운데 절반 {n(P5['q1'])}~{n(P5['q3'])}원, 봉황대길 30m 안 {n(P5['band30'])}원 / 밖 {n(P5['off30'])}원. 자연재해위험개선지구는 배수·침수 이력 확인 근거.",
         ZONE + f" · 지번 {L5['target']}곳 중 {L5['done']}곳 열람" + (' (일부 — 수집 중)' if L5['partial'] else ''), L5['source'], '2026-10-13', L5['caveat'] + '.')
if Z.get('rtms'):
    T = Z['rtms']; K = T['kinds']; sr = K.get('shrent')
    head = []
    if sr:
        h = sr['headline']
        head.append(f"단독·다가구 전월세 신고 {n(sr['n'])}건 중 월세 비중 {h['wolseFrom'][0]}년 {h['wolseFrom'][1]}% → {h['wolseTo'][0]}년 {h['wolseTo'][1]}%")
        head.append(f"봉황동 전월세는 가장 많던 {h['bonghwangPeak'][0]}년 {h['bonghwangPeak'][1]}건 → 2011~2025년 중 가장 적던 {h['bonghwangLow'][0]}년 {h['bonghwangLow'][1]}건")
    for k in ('nrg', 'land', 'shtrade'):
        if k in K:
            H = K[k]['headline']
            head.append(f"{K[k]['name']} 가장 많던 {H['peak'][0]}년 {H['peak'][1]}건 → {H['last'][0]}년 {H['last'][1]}건({H['dropPct']}% 감소, 봉황동 {H['bhPeak'][0]}년 {H['bhPeak'][1]}건 → {H['bhLast'][0]}년 {H['bhLast'][1]}건)")
    card('rtms', '시장', '구역 법정동의 부동산 거래 신고는 어떻게 변했나?', ' · '.join(head),
         ' / '.join(f"{v['name']} 연도별: " + ' · '.join(f"{y['year']} {y['n']}" for y in v['years']) for v in K.values()) + '.',
         '법정동 전체(' + '·'.join(T['dongs']) + ' — 구역 밖 같은 동 포함)', T['source'], '2026-10-13', T['caveat'] + '. 거래 금액은 공개 사실 묶음에 싣지 않는다.')
if Z.get('archPms'):
    AP = Z['archPms']
    card('archPms', '건물', '구역 안 건축 인허가(신축·용도변경)는 어떻게 변했나?',
         f"구역 지번 {AP['lotsQueried']}곳 전수: 허가 {n(AP['permits'])}건(지번 {AP['lotsWithPermit']}곳) — 용도변경 {AP['types'].get('용도변경', 0)}건 중 {AP['change1722']}건({round(100 * AP['change1722'] / AP['types'].get('용도변경', 1))}%)이 2017~2022년 · 2023년 이후 허가는 {AP['since2023']}건",
         '종류: ' + ' · '.join(f"{k} {v}" for k, v in AP['types'].items()) + '. 용도변경 허가 건물의 주용도: ' + ' · '.join(f"{k} {v}" for k, v in AP['changeUse'].items()) +
         '. 연도별(2005~): ' + ' · '.join(f"{y['year']} {y['n']}" for y in AP['years'] if y['year'] >= 2005) +
         f". 가장 많던 해 {'·'.join(map(str, AP['peak']['years']))}년 {AP['peak']['n']}건. 철거·멸실 신고 {AP['demolition']['n']}건(" + ' · '.join(f"{y} {v}" for y, v in AP['demolition']['byYear'].items()) + f"), 가설건축물 {AP['temporary']}건, 사용승인일 없는 허가 {AP['notApproved']}건.",
         ZONE + f" · 지번 {AP['lotsQueried']}곳", AP['source'], '2026-10-13', AP['caveat'] + '. 구역 안 영업 변화(인허가 업종 통계)와는 다른 자료다.')
card('sites13', '대상지', '시 우선순위 13곳의 토지 규제는?',
     f"13곳 모두 역사문화환경보존지역·중점경관관리구역 · 도시계획도로 저촉 {', '.join(str(x) + '번' for x in lu['roadConflict'])} · 방화지구 {', '.join(str(x) + '번' for x in lu['fireDistrict'])}",
     '용도지역: ' + ' · '.join(f"{k} {v}곳" for k, v in lu['zoning'].items()) + f". 공시지가(2026.1) {n(min(t['officialPrice']['wonPerM2'] for t in Z['sites']))}~{n(max(t['officialPrice']['wonPerM2'] for t in Z['sites']))}원/㎡.",
     '시 13곳 · 필지', lu['source'] + ' · 개별공시지가(토지이음)', '2026-10-13', '공시지가는 공적 기준 가격이며 매매 가격이 아니다. 규제 해석은 담당 부서 확인 필요.')
card('roads', '교통', '구역 안 도로와 진출입구는?',
     f"차량 도로 {n(ctx['roads']['totalM'])}m 전부 소로(골목) · 진출입구 {ctx['gates']['total']}곳(대로 {ctx['gates']['byTier']['대로']}·골목 {ctx['gates']['byTier']['소로']})",
     f"점포를 가장 많이 맡는 입구: {' · '.join(g['name'] + ' ' + str(g['stores']) for g in gl['list'][:3])}곳(상위 3곳이 {gl['top3Share']}%).",
     ZONE, ctx['osmSource'], ctx['osmFetched'], gl['method'] + '. 도로 등급은 OSM 도로 종류로 환산한 값이며 도시계획도로 지정이 아니다.')
card('transit', '교통', '역·버스·교통량은?',
     ' · '.join(f"{t['name']}역 구역 경계에서 {n(t['distM'])}m(하루 승하차 {n(t['daily'])}명)" for t in ctx['rail']) + f" · 구역 안 버스 정류장 {len(ctx['bus']['inside'])}곳(경계 300m 안 {len(ctx['bus']['within300'])}곳)",
     f"국도·지방도 교통량 조사지점은 구역 안 0곳, 경계 1km 안 {tm['within1km']}곳(" + ' · '.join(f"{t['road']} {t['route']}호선 {n(t['distM'])}m 하루 {n(t['aadt'])}대" for t in tm['nearest'][:2]) + f') — {tm["method"]}.',
     ZONE, '부산김해경전철 역별 승하차(2025) · 김해시 정류장별 이용객(2025) · ' + tm['source'], '2025', '거리는 직선이다. 원도심 시내도로 교통량(김해시 자체조사 2024)은 좌표가 없어 구역과 잇지 못했다.')
card('tour', '연계', '관광객 동선이 구역을 지나나?',
     f"역→유적·관광지 가장 짧은 길 {L['tourRoutes']}개 중 구역 안을 지나는 길 {L['tourRoutesThroughZone']}개 · 경전철 3역 10분 도보권이 구역 면적의 {L['zoneIn10min']}%",
     f"13곳을 한 바퀴 잇는 가장 짧은 길 {n(L['loop']['lengthM'])}m(약 {L['loop']['minutes']}분). 경전철 3역 하차 {L['indicators']['ridership_3st_daily_2025']['display']}(2019 대비 {L['indicators']['ridership_3st_vs2019']['display']}).",
     ZONE, L['source'], '2026-10-11', '가장 짧은 길 계산이며 실제 관광객 이동 기록이 아니다.')
card('safety', '생활', '구역 안 생활·안전 시설은?', ' · '.join(f"{k} {v}" for k, v in ctx['safe'].items()), '', ZONE, '지방행정 인허가·공공데이터포털 표준데이터·김해시 공개자료(2026-03~06)', '2026', '좌표가 있는 시설만이라 실제보다 적을 수 있다.')
card('population', '생활', '구역 인구는?',
     '구역만의 인구 통계는 없다 — 법정동 전체 참고: ' + ' · '.join(f"{k} {n(v['total'])}명(65세 이상 {v['agingPct']}%)" for k, v in ctx['population'].items()),
     f"구역 건물은 대부분 봉황동({n(s['dongs']['봉황동'])}동)이다.", '법정동 전체(구역보다 넓음)', '행정안전부 주민등록 인구', '2026-06-30', '경계 안 인구가 아니다.')
card('terrain', '땅', '땅 모양과 짜임은?',
     f"해발 {tr['elevMin']}~{tr['elevMax']}m · 경사 5° 이하 {tr['flatPct']}% · 필지 {n(tr['parcels'])}개(중간값 {tr['parcelMedianM2']}㎡) · 3층 이하 건물 {tr['lowPct']}%",
     f"평균 {tr['floorsMean']}층(최고 {tr['floorsMax']}층) · 건폐율 {tr['bcrPct']}% · 공원·녹지 {tr['parkHa']}ha · 동지 일조 평균 {tr['winterSunMean']}시간.", ZONE, tr['source'], '2026-10-11', tr['caveat'] + '.')
card('voice', '현장', '구역 안 상인·주민 목소리는?', '8월 현장 인터뷰 대부분이 구역 밖에서 이뤄져 구역 안 목소리는 거의 없다',
     Z['fieldVoice']['note'] + '.', ZONE, '2026-08-27 실사 · 08-29 인터뷰', '2026-08', '구역 안 상인 인터뷰를 새로 해야 한다.')
card('dontMix', '주의', '다른 범위 수치와 섞으면 안 되는 것은?',
     '이전 사업구역(초광역 원도심 51.8ha) 수치 — 건물 1,009동·노후 91.4%·빈 점포 후보 354동(상업·준주거만)·부동산원 공실률 13.7%(상권 98.8% 겹침) — 는 확정 구역계 값이 아니다',
     '행정동·법정동 통계(인구·사업체·쇠퇴진단 노후율 64~74%)도 구역보다 넓은 범위다.', '전체', '환경분석맵 김해 화면', '2026-10-13', '수치를 인용할 때 범위(확정 구역계 / 51.8ha / 동)를 반드시 같이 적는다.')

banned = re.compile(r'남실장|대표 제공|대표님|보증금|권리금|월세 ?\d|만 ?원|억|010-|의향|체납|연체|실거래가|직접 측정|수요가 빠졌|존재하지 않는다|클로드|코덱스|Claude|Codex')
blob = json.dumps(F, ensure_ascii=False)
hit = banned.search(blob); assert not hit, hit.group(0)
OUT_JSON.write_text(json.dumps({'zone': ZONE, 'made': '2026-10-13', 'from': 'data/gimhae-zone-261011.json (환경분석맵 김해 · build/zone261011_*.py)', 'facts': F}, ensure_ascii=False, indent=1))
md = ['# 확정 구역계 분석 사실 묶음 — 누리집·AI 도우미용 (2026-10-13)', '',
      '> 환경분석맵 김해 화면(확정 구역계 상세 분석)의 계산 결과를 카드로 옮긴 것. 숫자는 `~/dev/gijang-map/data/gimhae-zone-261011.json` 에서 자동으로 뽑았다(`build/zone261011_facts.py`). 카드마다 범위·출처·기준일·한계를 같이 인용한다.', '',
      f'- 기계용: `~/dev/gijang-map/data/gimhae-zone-261011-facts.json` ({len(F)}장)', '- 공개 화면: https://web-gijang-map-mrksc1tcf2e7efab.sel3.cloudtype.app/gimhae-wondosim.html?scope=zone', '']
for f in F:
    md += [f"## {f['topic']} · {f['q']}", '', f"**{f['a']}**", '']
    if f['detail']: md += [f['detail'], '']
    md += [f"- 범위: {f['scope']}", f"- 출처: {f['source']}", f"- 기준: {f['asOf']}", f"- 한계: {f['limit']}", '']
OUT_MD.write_text('\n'.join(md), encoding='utf-8')
print(len(F), 'facts →', OUT_JSON.name, '·', OUT_MD)
