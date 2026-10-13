# -*- coding: utf-8 -*-
"""확정 구역계(2026-10-11) 재계산 결과를 원래 화면(gimhae-wondosim.html)에 잇는다 — 여러 번 돌려도 같은 결과.

Usage: python3 build/zone261011_html.py
  1. 정비 시나리오: 확정 구역계 안 빈 점포 후보(용도지역 무관, data.emptyShop.shopIndices)를 먼저 고른다 — 상수 ZK_SHOP
  2. 공실률(부동산원) 설명·한계 9: 확정 구역계는 표본 상권과 일부만 겹친다는 문장(data.rone)
  3. 화면 질문 카드(FACTS): 확정 구역계 카드(z='261011')를 지우고 다시 넣는다 · 기존 공실률·빈 점포 카드의 한계 문장 보강
  4. 부동산원·실거래 문장 바로잡기(코덱스 4차 검수): 「직접 측정치」「대상지 고유 문제」「수요가 빠졌다」「민간 자율 회복 어렵다」 같은 단정과
     「상가 전월세 실거래는 존재하지 않는다」를 통계가 말하는 만큼으로 고치고, 상권 코드를 공식 통계표 6480062로 바꾼다
순서: zone261011_roadview.py 다음(모든 자료가 들어간 뒤).
"""
import re, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HP = ROOT / 'gimhae-wondosim.html'
h = HP.read_text(encoding='utf-8')
h = re.sub(r'gimhae-b171\.js\?v=zone261011-r\d+', 'gimhae-b171.js?v=zone261011-r8', h)
Z = json.loads((ROOT / 'data/gimhae-zone-261011.json').read_text())
es, bt, rv, ro, gl, ld, sb, L, lg = Z['emptyShop'], Z['bizTimeline'], Z['roadview'], Z['rone'], Z['gateLoad'], Z['vacancy']['localdata'], Z['vacancy']['sbiz'], Z['linkage'], Z['ledger']
n = lambda v: f'{v:,}'

def sub_once(pat, repl, flags=0):
    global h
    h2, k = re.subn(pat, repl, h, count=1, flags=flags)
    assert k == 1, pat[:60]
    h = h2

# 1. 정비 시나리오
zk = 'const ZK_SHOP=' + json.dumps(es['shopIndices'], separators=(',', ':')) + ';ZK_SHOP.forEach(i=>{if(BF[i])BF[i].properties.zs=1;});'
if 'const ZK_SHOP=' in h: sub_once(r'const ZK_SHOP=\[[\d,]*\];ZK_SHOP\.forEach\(i=>\{if\(BF\[i\]\)BF\[i\]\.properties\.zs=1;\}\);', zk)
else: sub_once(r'(const BF=D\.bld\.features;)', lambda m: m.group(1) + '\n/* 확정 구역계(2026-10-11) 안 빈 점포 후보 — 용도지역 무관(build/zone261011_html.py) */\n' + zk)
OLD_SORT = """ const cand=BF.map((f,i)=>({i,p:f.properties})).filter(o=>o.p.cl==='shop')
   .sort((a,b)=>{const az=a.p.dm<600?0:1,bz=b.p.dm<600?0:1;if(az!==bz)return az-bz;"""
NEW_SORT = """ const cand=BF.map((f,i)=>({i,p:f.properties})).filter(o=>o.p.cl==='shop'||o.p.zs===1)
   .sort((a,b)=>{const az=a.p.zs===1?0:a.p.dm<600?1:2,bz=b.p.zs===1?0:b.p.dm<600?1:2;if(az!==bz)return az-bz;"""
if OLD_SORT in h: h = h.replace(OLD_SORT, NEW_SORT)
assert NEW_SORT in h
OLD_OUT = """   빈 점포 후보 <b>${n(cand.length)}</b>곳 중 <b>${((buy+rent)/cand.length*100).toFixed(1)}%</b> 정비
   <br><span style="font-size:11px;color:#9aa5b1">주거용·관공서를 뺀 장사용 건물만</span>`;"""
NEW_OUT = """   확정 구역계 빈 점포 후보 <b>${n(ZK_SHOP.length)}</b>동 중 <b>${n(Math.min(buy+rent,ZK_SHOP.length))}</b>동 선택${buy+rent>ZK_SHOP.length?` · 넘는 ${n(buy+rent-ZK_SHOP.length)}곳은 구역 밖 후보로 채움(참고)`:''}
   <br><span style="font-size:11px;color:#9aa5b1">주거용·관공서를 뺀 장사용 건물 중 등록 가게 0 · 현장 공실 확인 전</span>`;"""
if OLD_OUT in h: h = h.replace(OLD_OUT, NEW_OUT)
assert NEW_OUT in h
h = h.replace("<b>우선순위</b> — ① 사업구역 내부 ② 준공 경과연수 ③ 지상층수<br>",
              "<b>우선순위</b> — ① 확정 구역계(2026-10-11) 안 빈 점포 후보 ② 그 밖 후보(이전 순서) ③ 준공 경과연수 ④ 지상층수<br>")
assert '① 확정 구역계(2026-10-11) 안 빈 점포 후보' in h
h = h.replace("p:['case',['==',['get','pk'],1],'#ff3d3d',['==',['get','ec'],1],'#7a3a3a','#39424e'],",
              "p:['case',['==',['get','pk'],1],'#ff3d3d',['any',['==',['get','ec'],1],['==',['get','zs'],1]],'#7a3a3a','#39424e'],")
assert "['==',['get','zs'],1]],'#7a3a3a'" in h

# 4. 부동산원·실거래 문장 바로잡기 — 옛 문장이 있으면 바꾸고, 새 문장이 있는지 확인(여러 번 돌려도 같음)
FIX = [
    ('<b style="color:#ff9f7a">지역 경기가 아니라 대상지 고유 문제</b>다.',
     '<b style="color:#ff9f7a">이 상권만 따로 올랐다</b>(원인은 이 통계만으로 가릴 수 없다).'),
    ('가격을 내려서라도 채우는 조정이 일어나지 않고 비어간다 — <b>가격 문제가 아니라 수요가 빠졌다.</b>',
     '임대료를 내려 채우는 조정은 통계에 보이지 않는다 — 원인(수요·건물 상태·임대 조건 등)은 현장·임대인 확인이 필요하다.'),
    ('하락폭이 확대(-0.13 → -0.31)돼 <b>민간 자율 회복을 기대하기 어렵다.</b>', '하락폭이 커졌다(-0.13 → -0.31).'),
    ('국가승인통계 제408001호) · 상권코드 A1705<br>', '국가승인통계 제408001호) · 공식 통계표 상권 코드 6480062(옛 기록의 A1705는 공식 자료에서 확인 안 됨)<br>'),
    ('<b>상가 전월세 실거래는 대한민국에 존재하지 않는다.</b>\n      국토부 실거래 공개 대상은 주택뿐이고 <b>상가는 임대차 신고의무가 없다.</b>\n      따라서 <b>상가 임대료의 공식 출처는 부동산원 표본조사가 유일</b>하다.',
     '<b>상가 임대차 계약은 국토부 실거래가 공개시스템의 신고·공개 대상이 아니다</b>(주택 전월세만 신고 대상).\n      그래서 <b>상가 임대료의 공식 통계는 부동산원 표본조사</b>다.'),
    ('에 대상지가 직접 등재돼 있어 대체지표가 아닌 <b>직접 측정치</b>다(8분기).',
     '과 이전 사업구역(51.8ha)이 98.8% 겹쳐 그 상권 표본값을 지표로 썼다(8분기 · 표본 건물 값).'),
    ('<b class="warn">상가 전월세 실거래는 제도적으로 존재하지 않는다</b> — 국토부 실거래 공개 대상은 주택뿐이고 상가는 임대차 신고의무가 없다. 상가 임대료의 공식 출처는 부동산원 표본조사가 유일하다',
     '<b class="warn">상가 임대차는 국토부 실거래가 공개시스템의 신고·공개 대상이 아니다</b>(주택 전월세만 신고). 상가 임대료 공식 통계는 부동산원 표본조사다'),
]
for a, b in FIX:
    if a in h: h = h.replace(a, b)
    assert b in h, b[:40]

# 2. 부동산원 공실률 — 확정 구역계는 일부만 겹침
ZN = (f"<br>\n      <b class=\"warn\">확정 구역계(2026-10-11 · 21.8ha)는 이 상권과 {ro['overlapPct']}%만 겹친다</b>(등록점포 {ro['storesIn']}/{Z['stats']['stores']}곳 · 시 13곳 중 "
      + ('·'.join(f'{x}번' for x in ro['sitesIn']) or '없음') + f") — 이전 사업구역 51.8ha는 상권 도형과 {ro['oldOverlapPct']}% 겹쳤다. 13.7%를 확정 구역계 공실률로 쓰지 않고 주변 상권 참고값으로만 쓴다(상권구획도 2024.3Q · 2026.2Q 공식 통계표 상권 코드 {ro['code']}).<!--zk-rone-->")
if '<!--zk-rone-->' in h: sub_once(r'<br>\n      <b class="warn">확정 구역계\(2026-10-11 · 21\.8ha\)는 이 상권과.*?<!--zk-rone-->', lambda m: ZN, re.S)
else: sub_once(r'(중대형상가는 25\.3Q에 16\.6→11\.5%로 급락\(표본 교체 의심\)해 <b>소규모를 주지표</b>로 쓴다\.)', lambda m: m.group(1) + ZN)
L9 = f" <b class=\"warn\">확정 구역계(21.8ha)는 이 상권과 {ro['overlapPct']}%만 겹쳐 구역 공실률로 쓰지 않는다(주변 상권 참고값).</b><!--zk-l9-->"
if '<!--zk-l9-->' in h: sub_once(r' <b class="warn">확정 구역계\(21\.8ha\)는 이 상권과 [^<]*</b><!--zk-l9-->', lambda m: L9)
else: sub_once(r'(그 상권 표본값을 지표로 썼다\(8분기 · 표본 건물 값\)\.)', lambda m: m.group(1) + L9)

# 3. 질문 카드
m = re.search(r'^const FACTS=(.*?);\s*$', h, re.M); F = json.loads(m.group(1))
F = [f for f in F if f.get('z') != '261011']
for f in F:
    if f['q'] == '공실률이 얼마인가' and '확정 구역계' not in f['l']:
        f['l'] += f" · 확정 구역계(21.8ha)는 이 상권과 {ro['overlapPct']}%만 겹쳐 구역 공실률로 쓰지 않는다(참고값)"
    if f['q'] == '빈 점포가 몇 동인가' and '확정 구역계' not in f['l']:
        f['l'] += f" · 확정 구역계(21.8ha)는 같은 규칙을 용도지역 무관으로 적용해 {es['any']['shop']}동(상업·준주거만 {es['orig']['shop']}동)"
OLDFIX = {
    '투자·자본수익률은 어떤가': {'l': '하락폭이 커지고 있다(-0.13→-0.31). 상권 표본 건물의 값이며 원인·전망은 이 자료로 판단하지 않는다'},
    '왜 비어가는가 (핵심 판독)': {'q': '공실률과 임대료는 어떻게 움직였나', 'a': '임대료는 제자리인데 공실률만 올랐다 — 원인(수요·건물 상태·임대 조건 등)은 이 통계만으로 가릴 수 없다',
                           'l': '임대료 8분기 -0.8%, 공실률 1.9배(상권 표본 건물 값). 현장·임대인 확인 필요'},
    '공실률과 임대료는 어떻게 움직였나': {'a': '임대료는 제자리인데 공실률만 올랐다 — 원인(수요·건물 상태·임대 조건 등)은 이 통계만으로 가릴 수 없다',
                           'l': '임대료 8분기 -0.8%, 공실률 1.9배(상권 표본 건물 값). 현장·임대인 확인 필요'},
    '상가 전월세 실거래는 없나': {'a': '상가 임대차는 국토부 실거래가 공개시스템의 신고·공개 대상이 아니다(주택 전월세만 신고)',
                         'l': '그래서 상가 임대료 공식 통계는 부동산원 표본조사다. 상가 임대차 계약 자체가 없다는 뜻은 아니다'},
}
for f in F:
    fx = OLDFIX.get(f['q'])
    if fx: f.update(fx)
assert not re.search(r'직접 측정|수요가 빠졌|민간 자율 회복|제도적으로 존재하지', json.dumps(F, ensure_ascii=False))
y = lambda k: bt['open'][bt['years'].index(k)], lambda k: bt['close'][bt['years'].index(k)]
op, cl = y
first_flip = next(yy for yy in range(2020, 2027) if cl(yy) > op(yy))
C = lambda k, q, a, s, d, u, l: {'k': k, 'q': q, 'a': a, 's': s, 'd': d, 'u': u, 'l': l, 'p': 'p2', 'z': '261011'}
new = [
    C('확정 구역계 확정구역계 빈 점포 빈점포 공실 후보 몇 동 건물 대상지', '확정 구역계 안 빈 점포 후보는 몇 동인가',
      f"{es['any']['shop']}동(등록 가게 0 건물 중 주거·가게 대상 아님·대장 없음을 뺀 나머지 — " + '·'.join(f"{k.replace('제1종근린생활시설', '1종 근생').replace('제2종근린생활시설', '2종 근생').replace('문화및집회시설', '문화집회')} {v}" for k, v in es['shopUse'].items()) + f", 용도지역 무관) · 상업·준주거지역만 보면 {es['orig']['shop']}동",
      '환경분석맵 건물 자료(건축물대장 주용도·건물 이름) × 소상공인시장진흥공단 상가정보 등록점포', '건물 2026-08 · 상가 2026-06', '확정 구역계 21.8ha · 건물 단위',
      f"현장 공실 조사가 아니다. 상가정보에 안 오르는 업종(도매·사무실 등) 때문에 많게 잡히고, 2층 이상만 빈 건물은 빠진다. 구역 면적 66.7%가 제2종일반주거지역이라 원래 규칙(상업·준주거만)은 주거지역 골목의 후보 건물을 놓친다. 전수조사 1차 판정(지번 537곳 A~E)·51.8ha 기준 354동과 단위가 달라 더하지 않는다"),
    C('확정 구역계 공실률 부동산원 상권 겹침 13.7 대상지 구역 공실', '확정 구역계의 공실률은 얼마인가',
      f"구역만의 공식 공실률은 없다 · 부동산원 「{ro['market']}」 소규모상가 13.7%(2026.2Q)는 이 상권과 구역이 {ro['overlapPct']}%만 겹쳐 참고값" + (" · 건물·층 자료 중복 연결을 정리했으나 실제 빈 칸 면적을 확인하지 않아 구역 공실률은 산출하지 않는다" if Z.get('vacRate') else ''),
      '한국부동산원 상업용부동산 임대동향조사(국가승인통계 408001) 상권구획도 2024.3Q · 2026.2Q 통계표', '2026년 2분기', '상권 vs 확정 구역계',
      f"이전 사업구역 51.8ha는 상권 도형과 {ro['oldOverlapPct']}% 겹쳤다(그래도 상권 표본 건물 값). 확정 구역계 등록점포 {ro['storesIn']}/{Z['stats']['stores']}곳만 상권 안. 빈 점포 후보·전수조사 판정과 모집단이 달라 합산·환산 금지"),
    C('확정 구역계 인허가 폐업 신호 개업 폐업 역전 창업 몇 곳 대상지', '확정 구역계 안 개업·폐업 흐름은',
      f"폐업 신호 {len(ld['signals'])}곳(2022년 이후 폐업, 같은 주소에 지금 영업 신고 없음) · {first_flip}년부터 폐업이 개업보다 많음(2024 개업 {op(2024)}·폐업 {cl(2024)} / 2025 {op(2025)}·{cl(2025)} / 2026.10.13까지 {op(2026)}·{cl(2026)})",
      '행정안전부 지방행정 인허가데이터(LOCALDATA) 김해시 9개 업종', '2026-10-13 받음', '확정 구역계 · 좌표 있는 인허가 기록',
      f"구역 안 기록 {bt['records']}건 = 영업 {bt['openNow']}·폐업 {bt['closedAll']}·취소·말소 등 {bt['otherStatus']}. 9개 업종(음식점·제과·이용·미용·세탁·숙박·노래방·PC방)만 — 소매·사무실은 빠진다. 좌표 없는 기록 171건 제외. 업종·명의 변경도 폐업+개업으로 잡힌다. 원도심 4개 동 시계열(2025년 첫 역전)과 공간범위가 다르다"),
    C('확정 구역계 가게 얼마나 버티나 존속 3년 폐업 비율 평균 대상지', '확정 구역계 안 가게는 얼마나 버티나',
      f"폐업한 {bt['lifespan']['closed']}건 중 {bt['lifespan']['within3yPct']}%가 3년 안에 닫음 · 영업 기간 평균 {bt['lifespan']['meanYears']}년(중간값 {bt['lifespan']['medianYears']}년)",
      '행정안전부 LOCALDATA 인허가 이력', '2026-10-13 받음', f"확정 구역계 · 인허가 기록 {bt['records']}건",
      f"원도심 4개 동은 같은 계산으로 37.9%·평균 7.6년. 2010~2022년에 연 가게 {bt['within3y']['2010-2022']['opened']}곳 중 3년 안에 닫은 곳은 {bt['within3y']['2010-2022']['pct']}%. 9개 인허가 업종만"),
    C('확정 구역계 상가정보 사라진 점포 새로 생긴 분기 비교 대상지', '확정 구역계 안 상가정보에서 사라진 점포는',
      f"{len(sb['vanished'])}곳({sb['compare']} → {sb['latest']}) · 새로 생김 {sb['newCount']}곳 · 등록점포 {sb['insideCompare']} → {sb['inside']}곳",
      '소상공인시장진흥공단 상가(상권)정보 분기 원본(공공데이터포털 15083033)', f"{sb['compare']}·{sb['latest']}", '확정 구역계',
      f"사라짐 = 폐업·이전 후보이며 확정이 아니다. 업소번호만 바뀐 {sb['idReissued']}쌍은 뺐다. 다음 공개 {sb['next']}"),
    C('확정 구역계 과거 로드뷰 언제부터 비었나 2025 2022 장기 공실 증빙 대상지', '과거 로드뷰에서 1층 앞이 비어 보인 곳은',
      f"2025년 3월 사진에서 1층 앞이 비어 보인 지번 {len(rv['empty2025'])}곳({' · '.join(j + ('(확신 낮음)' if j in rv.get('lowConf2025', []) else '') for j in rv['empty2025'])}) · 그중 2022년 3월에도 비어 보인 곳 {len(rv['empty2022and2025'])}곳({' · '.join(rv['empty2022and2025'])}{' — ' + '·'.join(rv['partial']) + '은 2022년엔 가운데 칸만 닫히고 옆 칸은 영업' if rv.get('partial') else ''})",
      '카카오 로드뷰 공개 파노라마 시점 비교(판정자 2단계 교차 확인)', '최신 대부분 2025-03 · 과거 2022-03·2019-11', f"시 13곳 + 전수조사 1차 A·B {rv['jibun']}개 지번",
      f"길에서 본 1층 앞모습 판정이라 층·호 단위가 아니다. 공실 확정이 아니라 그 시점에 비어 보였다는 보조 증거. 1차 판정 A 중 {len(rv['aOpen2025'])}곳({' · '.join(rv['aOpen2025'])})은 2025년 3월 영업 중이었다"),
    *([C('확정 구역계 전기 사용량 전력 공실 증빙 저사용 kWh 대상지', '확정 구역계 비주거 건물 전기 사용량은',
      f"조회 {Z['energy']['queried']}지번 중 자료 {Z['energy']['withData']}곳 · 월평균 중간값 {n(Z['energy']['medianMonthlyKwh'])}kWh · 월 100kWh 이하 {Z['energy']['le100']}곳(300 이하 {Z['energy']['le300']}곳)",
      Z['energy']['source'], Z['energy']['period'], '확정 구역계 비주거 지번 · 지번 합계',
      Z['energy']['caveat'] + '. 지번별 값은 공개하지 않는다')] if Z.get('energy') else []),
    *([C('확정 구역계 국가유산 문화재 사적 봉황동 유적 현상변경 허용기준 보호구역 규제 대상지', '확정 구역계는 국가유산(문화재) 규제를 받나',
      f"구역의 {Z['heritage']['unionPct']}%가 「{Z['heritage']['name']}」({Z['heritage']['designation']}) 지정구역·보호구역·현상변경 허용기준 구역 안",
      Z['heritage']['source'], '2026-10-13', '확정 구역계',
      ' · '.join(f"{l['name']} {l['overlapPct']}%" for l in Z['heritage']['layers']) + '. ' + Z['heritage']['note'])] if Z.get('heritage') else []),
    *([C('확정 구역계 인허가 전 업종 가게 흐름 연도별 영업 중 봉황대길 봉리단길 대상지', '인허가 전 업종으로 보면 구역 가게는 어떻게 변했나',
      f"그해 영업 중인 가게형 인허가 {Z['licenseAll']['store']['active'][Z['licenseAll']['years'].index(2016)]}건(2016) → {max(Z['licenseAll']['store']['active'])}건(정점) → {Z['licenseAll']['store']['active'][-1]}건(2026.10) · 봉황대길 40m 띠 {Z['licenseAll']['storeBand']['active'][Z['licenseAll']['years'].index(2016)]} → {Z['licenseAll']['storeBand']['active'][Z['licenseAll']['years'].index(2025)]}건(2025)",
      Z['licenseAll']['source'], '2026-10-13', '확정 구역계 · 인허가 기록', Z['licenseAll']['caveat'])] if Z.get('licenseAll') else []),
    *([C('확정 구역계 소상공인 소진공 주요 상권 영역 겹침 김해부원동우체국 대상지', '소진공 주요 상권과 확정 구역계는 겹치나',
      f"「{Z['sbizZone']['items'][0]['name']}」 상권과 구역의 {Z['sbizZone']['items'][0]['zonePct']}%가 겹침",
      Z['sbizZone']['source'], '2026-10-13', '확정 구역계', Z['sbizZone']['note'])] if Z.get('sbizZone', {}).get('items') else []),
    *([C('확정 구역계 실거래 거래 신고 전월세 월세 전세 매매 상가 토지 법정동 봉황동 부원동 서상동 대상지', '구역 법정동의 부동산 거래 신고는 어떻게 변했나',
      ' · '.join(([f"단독·다가구 전월세 신고 {n(Z['rtms']['kinds']['shrent']['n'])}건 중 월세 비중 {Z['rtms']['kinds']['shrent']['headline']['wolseFrom'][0]}년 {Z['rtms']['kinds']['shrent']['headline']['wolseFrom'][1]}% → {Z['rtms']['kinds']['shrent']['headline']['wolseTo'][0]}년 {Z['rtms']['kinds']['shrent']['headline']['wolseTo'][1]}%"] if 'shrent' in Z['rtms']['kinds'] else []) +
                 [f"{v['name']} 가장 많던 {v['headline']['peak'][0]}년 {v['headline']['peak'][1]}건 → {v['headline']['last'][0]}년 {v['headline']['last'][1]}건" for k_, v in Z['rtms']['kinds'].items() if k_ != 'shrent']),
      Z['rtms']['source'], '2026-10-13', '법정동 전체(' + '·'.join(Z['rtms']['dongs']) + ')',
      Z['rtms']['caveat'] + '. 거래 금액은 싣지 않는다')] if Z.get('rtms') else []),
    *([C('확정 구역계 건축 인허가 신축 증축 용도변경 대수선 철거 허가 연도 세움터 대상지', '구역 안 건축 인허가(신축·용도변경)는 어떻게 변했나',
      f"지번 {Z['archPms']['lotsQueried']}곳 전수: 허가 {n(Z['archPms']['permits'])}건(지번 {Z['archPms']['lotsWithPermit']}곳) · 용도변경 {Z['archPms']['types'].get('용도변경', 0)}건 중 {Z['archPms']['change1722']}건({round(100 * Z['archPms']['change1722'] / Z['archPms']['types'].get('용도변경', 1))}%)이 2017~2022년 · 2023년 이후 {Z['archPms']['since2023']}건",
      Z['archPms']['source'], '2026-10-13', '확정 구역계 · 지번 단위', Z['archPms']['caveat'])] if Z.get('archPms') else []),
    C('확정 구역계 대장 노후 건축물대장 87.3 사용승인 583 대상지', '건축물대장으로 본 확정 구역계 노후도는',
      f"대장 {n(lg['buildings'])}동 중 20년 이상 {lg['old20Pct']}% · 30년 이상 {lg['old30Pct']}%",
      lg['source'], '2026-10-13', f"확정 구역계 · 지번 {n(lg['parcels'])}곳",
      f"이 지도 건물 윤곽(923동) 기준 91.7%와 집계 단위가 다르다(대장은 지번 점 기준·부속건물 포함). 둘 다 노후건축물 요건(50% 이상)을 넘는다"),
    C('확정 구역계 관광 유적 역 길 지나 동선 비켜 대상지 수로왕릉 박물관', '관광객 동선이 확정 구역계를 지나나',
      f"역→유적·관광지 최단 길 {L['tourRoutes']}개 중 구역 안을 지나는 길 {L['tourRoutesThroughZone']}개 · 경전철 3역 10분 도보권이 구역 면적의 {L['zoneIn10min']}%",
      '종합분석맵 10/11판(OSM 보행망 2026-10-08)', '2026-10-11', '확정 구역계',
      '가장 짧은 길 기준이며 실제 관광객 이동 기록이 아니다. 13곳 한 바퀴 최단 순환 ' + n(L['loop']['lengthM']) + 'm(약 ' + str(L['loop']['minutes']) + '분)'),
    C('확정 구역계 진출입구 입구 몇 곳 골목 대로 차량 대상지', '확정 구역계 진출입구는',
      f"{Z['context']['gates']['total']}곳 — 대로 {Z['context']['gates']['byTier']['대로']}(김해대로) · 골목 {Z['context']['gates']['byTier']['소로']} · 점포를 가장 많이 맡는 입구 {gl['list'][0]['name']} {gl['list'][0]['stores']}곳",
      'OpenStreetMap 도로(2026-10-08) × 상가정보 2026-06', '2026-10-13 계산', '확정 구역계',
      f"구역 안 차량 도로는 전부 소로(골목). 점포 배분은 직선거리 기준이며 실제 통행 경로가 아니다. 구역 안 국도·지방도 교통량 조사지점 없음(경계 1km 안 {Z['tms']['within1km']}곳)"),
]
F = F[:3] + new + F[3:]
h = h[:m.start(1)] + json.dumps(F, ensure_ascii=False) + h[m.end(1):]
assert not re.search(r'남실장|대표 제공|보증금|월세 ?\d|010-', json.dumps(new, ensure_ascii=False))
for bad in ['직접 측정치', '대상지 고유 문제', '수요가 빠졌다', '민간 자율 회복', '실거래는 대한민국에 존재하지', '제도적으로 존재하지 않는다', '상권코드 A1705', '코덱스', '클로드']:
    assert bad not in h, bad
HP.write_text(h, encoding='utf-8')
# 질문 카드 원본(build/ask_inject.py 가 읽는 파일)도 같은 카드로 맞춘다 — ask_inject 를 다시 돌려도 옛 문장이 돌아오지 않게
AC = ROOT / 'build/ask_cards/gimhae-wondosim.json'
if AC.exists():
    ac = json.loads(AC.read_text(encoding='utf-8')); ac['cards'] = F
    AC.write_text(json.dumps(ac, ensure_ascii=False, indent=1), encoding='utf-8')
print('cards', len(F), 'new', len(new), 'ZK_SHOP', len(es['shopIndices']))
