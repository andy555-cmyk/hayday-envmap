# -*- coding: utf-8 -*-
"""확정 구역계(1안, 2026-10-30) 결과를 원래 화면(gimhae-wondosim.html)에 잇는다 — 여러 번 돌려도 같은 결과.

Usage: python3 build/zone261030_html.py
  옛 build/zone261011_html.py 가 넣은 10/11 문장·질문 카드(z='261011')를 1안 기준으로 바꾼다.
  - 숫자는 data/gimhae-zone-261030.json 에서만 읽는다(그 파일의 stats 는 zone261030_reconcile.py 가 숫자정본표 값으로 맞춘 것).
  - 방 ⑦ 재수집 전 항목(공실 신호·부동산원 겹침·빈 점포 후보 등)은 「새 구역 재수집 중」으로 쓰고 옛 구역 숫자를 남기지 않는다.
  - 자료가 들어오면(rone·emptyShop 등 키가 생기면) 같은 자리에 1안 숫자를 넣는다.
순서: rebuild_gimhae_zone261030.py → (방 ⑦ 결과 반영 스크립트들) → zone261030_reconcile.py → 이 스크립트 → zone261030_facts.py
"""
import re, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HP = ROOT / 'gimhae-wondosim.html'
h = HP.read_text(encoding='utf-8')
Z = json.loads((ROOT / 'data/gimhae-zone-261030.json').read_text())
S, R = Z['stats'], Z['relation']
n = lambda v: f'{v:,}'
AREA, HA, D = n(Z['area']), f"{Z['area'] / 10000:.1f}ha", Z['confirmed']
ins = [s['rank'] for s in Z['sites'] if s['inside']]; out = [s['rank'] for s in Z['sites'] if not s['inside']]
SITES = f"13곳 중 {len(ins)}곳 구역 안 · {len(out)}곳({'·'.join(f'{x}번' for x in out)}) 구역 밖(재배치 검토 중)"
PEND = '새 구역 재수집 중'

h = re.sub(r'gimhae-b171\.(js|css)\?v=zone2610\d\d-r\d+', r'gimhae-b171.\1?v=zone261030-r1', h)
assert h.count('gimhae-b171.js?v=zone261030-r1') == 1 and h.count('gimhae-b171.css?v=zone261030-r1') == 1
h = re.sub(r'gimhae-meeting\.(js|css)\?v=[\w-]+"', r'gimhae-meeting.\1?v=1an-r1"', h)
assert h.count('gimhae-meeting.js?v=1an-r1') == 1
h = re.sub(r'gimhae-b-insights\.js\?v=[\w-]+"', 'gimhae-b-insights.js?v=1an-r1"', h)  # 「근린생활시설」 단독 표기도 근생으로 셈(정본표 묶음과 같게)
assert h.count('gimhae-b-insights.js?v=1an-r1') == 1

def sub_once(pat, repl, flags=0):
    global h
    h2, k = re.subn(pat, repl, h, count=1, flags=flags)
    assert k == 1, pat[:70]
    h = h2

# 1. 부동산원 공실률 설명(<!--zk-rone-->) · 한계 9(<!--zk-l9-->)
ro = Z.get('rone')
if ro:
    ZN = (f"<br>\n      <b class=\"warn\">확정 구역계(1안 · {D} · {HA})는 이 상권과 {ro['overlapPct']}%만 겹친다</b>(등록점포 {ro['storesIn']}/{S['stores']}곳 · 시 13곳 중 "
          + ('·'.join(f'{x}번' for x in ro['sitesIn']) or '없음') + f") — 이전 사업구역 51.8ha는 상권 도형과 {ro['oldOverlapPct']}% 겹쳤다. 13.7%를 확정 구역계 공실률로 쓰지 않고 주변 상권 참고값으로만 쓴다(공식 통계표 상권 코드 {ro['code']}).<!--zk-rone-->")
    L9 = f" <b class=\"warn\">확정 구역계(1안 · {HA})는 이 상권과 {ro['overlapPct']}%만 겹쳐 구역 공실률로 쓰지 않는다(주변 상권 참고값).</b><!--zk-l9-->"
else:
    ZN = (f"<br>\n      <b class=\"warn\">확정 구역계(1안 · {D} · {HA})와 이 상권의 겹침은 새 구역으로 다시 계산 중</b> — 이전 사업구역 51.8ha는 상권 도형과 98.8% 겹쳤다. "
          "13.7%는 상권 표본 건물 값이라 확정 구역계 공실률로 쓰지 않고 주변 상권 참고값으로만 쓴다(공식 통계표 상권 코드 6480062).<!--zk-rone-->")
    L9 = f" <b class=\"warn\">확정 구역계(1안 · {HA})는 이 상권과 겹침을 다시 계산 중이며, 13.7%를 구역 공실률로 쓰지 않는다(주변 상권 참고값).</b><!--zk-l9-->"
sub_once(r'<br>\n      <b class="warn">확정 구역계\([^)]*\)(는 이 상권과|와 이 상권의 겹침은).*?<!--zk-rone-->', lambda m: ZN, re.S)
sub_once(r' <b class="warn">확정 구역계\([^)]*\)는 이 상권과 [^<]*</b><!--zk-l9-->', lambda m: L9)

# 2. 정비 시나리오 — 빈 점포 후보(1안). 재수집 전에는 빈 목록 + 이전 방식 후보 안내
es = Z.get('emptyShop')
zk = 'const ZK_SHOP=' + json.dumps(es['shopIndices'] if es else [], separators=(',', ':')) + ';ZK_SHOP.forEach(i=>{if(BF[i])BF[i].properties.zs=1;});'
sub_once(r'/\* 확정 구역계\([^)]*\) 안 빈 점포 후보 — 용도지역 무관\(build/zone2610\d\d_html\.py\) \*/\nconst ZK_SHOP=\[[\d,]*\];ZK_SHOP\.forEach\(i=>\{if\(BF\[i\]\)BF\[i\]\.properties\.zs=1;\}\);',
         lambda m: f'/* 확정 구역계(1안, {D}) 안 빈 점포 후보 — 용도지역 무관(build/zone261030_html.py) */\n' + zk)
OUT_RE = r"   (확정 구역계(\(1안\))? 빈 점포 후보 <b>\$\{n\(ZK_SHOP\.length\)\}</b>동 중 .*?|\$\{ZK_SHOP\.length\?.*?)\n   <br><span style=\"font-size:11px;color:#9aa5b1\">주거용·관공서를 뺀 장사용 건물 중 등록 가게 0 · 현장 공실 확인 전</span>`;"
NEW_OUT = ("   ${ZK_SHOP.length?`확정 구역계(1안) 빈 점포 후보 <b>${n(ZK_SHOP.length)}</b>동 중 <b>${n(Math.min(buy+rent,ZK_SHOP.length))}</b>동 선택${buy+rent>ZK_SHOP.length?` · 넘는 ${n(buy+rent-ZK_SHOP.length)}곳은 구역 밖 후보로 채움(참고)`:''}`"
           ":`확정 구역계(1안) 빈 점포 후보는 " + PEND + " — 아래 선택은 이전 방식 후보(참고)`}\n"
           "   <br><span style=\"font-size:11px;color:#9aa5b1\">주거용·관공서를 뺀 장사용 건물 중 등록 가게 0 · 현장 공실 확인 전</span>`;")
sub_once(OUT_RE, lambda m: NEW_OUT, re.S)
sub_once(r'<b>우선순위</b> — ① 확정 구역계\([^)]*\) 안 빈 점포 후보', lambda m: '<b>우선순위</b> — ① 확정 구역계(1안) 안 빈 점포 후보')

# 3. 본문 문장
dong = '·'.join(f'{k} {n(v)}' for k, v in S['dongs'].items())
sub_once(r'<b>[^<]*확정 구역계\([^)]*\)</b> 안 건물의 법정동은 [^—]*동 —', lambda m: f'<b>{D} 확정 구역계(1안 · {HA})</b> 안 건물의 법정동은 {dong}동 —')
sub_once(r'<tr><td>확정 구역계(\(1안\))? \([^)]*\)</td><td>[^<]*</td><td>지적 경계 아님</td></tr>',
         lambda m: f'<tr><td>확정 구역계(1안) ({D})</td><td>1안 확정 — 카카오맵 면적재기 선(도로 안쪽 가장자리) · 종합분석맵·누리집과 같은 정본 경계 파일</td><td>지적 경계 아님</td></tr>')
sub_once(r'<b>확정 구역계\([^)]*\)</b>는 별도 — [^<]*</span></div>',
         lambda m: f'<b>확정 구역계(1안 · {D})</b>는 별도 — 1안 확정, 카카오맵 면적재기 선({AREA}㎡ · {HA}, 지적 경계 아님)</span></div>')
sub_once(r'\(확정 구역계[^<]*?는 <b>[\d.]+%</b> — [\d,]+동 ÷ 연도 확인 [\d,]+동\)',
         lambda m: f"(확정 구역계(1안) {HA}는 <b>{S['oldPct']}%</b> — {n(S['old20'])}동 ÷ 연도 확인 {n(S['knownYear'])}동)")
sub_once(r'※ <b style="color:#8af2d1">민트 선 = 확정 구역계[^<]*</b> — 노후 [^<]*?등은 「확정 구역계 상세 분석」',
         lambda m: f"※ <b style=\"color:#8af2d1\">민트 선 = 확정 구역계(1안) {HA}({D})</b> — 노후 {S['oldPct']}% · 시 우선순위 {SITES} 등은 「확정 구역계 상세 분석」")
sub_once(r'\(확정 구역계(\(1안\))? [\d.]+ha는 위쪽 「확정 구역계 상세 분석」에서 따로\)', lambda m: f'(확정 구역계(1안) {HA}는 위쪽 「확정 구역계 상세 분석」에서 따로)')

# 4. 질문 카드
m = re.search(r'^const FACTS=(.*?);\s*$', h, re.M); F = json.loads(m.group(1))
OLDQ = {'확정 구역계(대상지 범위)는 몇 ㎡인가', '확정 구역계 안 건물·노후도·점포는', '시 우선순위 대상지 13곳은 구역 안인가'}
F = [f for f in F if f.get('z') not in ('261011', '1an') and f['q'] not in OLDQ]
for f in F:
    f['l'] = re.sub(r' · 확정 구역계\([^)]*\)는 [^·]*?(\(참고값\)|\)$|동\))$', '', f['l'])
    f['l'] = re.sub(r' · 확정 구역계\(21\.8ha\)는 .*$', '', f['l'])
    if f['q'] == '이전 사업구역(초광역 원도심)은 얼마였나':
        f['a'] = f'51.8ha — 8월 도판의 이전 검토 범위. 확정 구역계(1안 · {D})는 {AREA}㎡({HA})'
    if f['q'] == '공실률이 얼마인가' and ro:
        f['l'] += f" · 확정 구역계(1안)는 이 상권과 {ro['overlapPct']}%만 겹쳐 구역 공실률로 쓰지 않는다(참고값)"
    if f['q'] == '빈 점포가 몇 동인가' and es:
        f['l'] += f" · 확정 구역계(1안)는 같은 규칙을 용도지역 무관으로 적용해 {es['any']['shop']}동(상업·준주거만 {es['orig']['shop']}동)"
L = Z.get('ledger')
C = lambda k, q, a, s, d, u, l, p='p2': {'k': k, 'q': q, 'a': a, 's': s, 'd': d, 'u': u, 'l': l, 'p': p, 'z': '1an'}
new = [
    C(f"구역계 확정 확정구역계 1안 대상지 범위 경계 면적 몇 헥타르 ha {HA[:-2]} {Z['area']} 리코어 RE:CORE", '확정 구역계(대상지 범위)는 몇 ㎡인가',
      f'{AREA}㎡({HA}) · {D} 확정 구역계(1안)', '카카오맵 면적재기 실측 · 종합분석맵·사업 안내 누리집과 같은 정본 경계 파일', D, '확정 구역계(1안)',
      f"선은 북서 봉황대길·남 김해대로·동측 대로의 안쪽 가장자리를 따른다. 지적 경계가 아니다. 공모 권장 15만㎡보다 {n(R['over150k'])}㎡ 넓다(사유는 계획서에서 설명). "
      f"옛 확정 구역계(10/11)와 겹치는 곳 {n(R['oldZoneOverlap'])}㎡ · 빠진 곳 {n(R['oldZoneOnly'])}㎡ · 새로 들어온 곳 {n(R['newOnly'])}㎡(옛 선은 도로 중심선 기준이라 면적 기준이 다름)"),
    C(f"확정 구역계 확정구역계 1안 안 건물 몇 동 노후 점포 몇 개 {S['buildings']} {S['stores']} {S['oldPct']} 대상지", '확정 구역계 안 건물·노후도·점포는',
      f"건물 {n(S['buildings'])}동 · 20년 이상 {S['oldPct']}%({n(S['old20'])}동 ÷ 연도 확인 {n(S['knownYear'])}동) · 등록점포 {n(S['stores'])}개",
      '환경분석맵 건물 10,065동(건축물대장 기반) · 소상공인시장진흥공단 상가정보', '건물 2026-08 · 상가 2026-06', f'확정 구역계(1안) {HA}',
      '건물은 대표점이 경계 안이면 포함. 등록점포는 현재 영업 수가 아니다. 이 지도의 다른 수치(1,009동·91.4%)는 사업구역 51.8ha 기준이라 섞지 않는다'
      + (f" · 공모 노후도 판정은 건축물대장 기준 {n(L['buildings'])}동 중 사용승인일 확인 {n(L['known'])}동의 {L['old20Pct']}%({n(L['old20'])}동)" if L else '')),
    C('시 우선순위 대상지 13곳 거점 부지 후보 매입 임대 대상부지 안에 밖 재배치 1안', '시 우선순위 대상지 13곳은 구역 안인가',
      f"{SITES} · 거점 후보 5번(봉황동 15-2)·10번(봉황동 23-3)은 구역 안", '김해시 사업대상지 목록 · 10/8 현장 미팅(역할)', '2026-10-08', '지번 위치점',
      f"구역 밖 {'·'.join(f'{x}번' for x in out)}은 봉황대길 북측이며 지우지 않고 「구역 밖(재배치 검토 중)」으로만 표시한다 — 사업 배치는 결정 대기. 지번 기준점 판정이며 필지 전체 판정이 아니다. 지도는 「공실·거점 위치」 탭"),
    C('확정 구역계 1안 공실 빈 점포 공실률 인허가 폐업 상가정보 로드뷰 전기 재수집', '확정 구역계(1안) 안 공실·상권 자료는',
      PEND + ' — 상권정보·인허가·공실 신호·전기·토지이음·로드뷰를 새 구역으로 다시 모으고 있다', '구역 안 자료 재수집(2026-10-30 시작)', D, '확정 구역계(1안)',
      '옛 확정 구역계(10/11)의 공실 신호·빈 점포 후보 숫자는 범위가 절반만 겹쳐 쓰지 않는다. 다 모이면 이 카드를 바꾼다'),
]
F = new + F
h = h[:m.start(1)] + json.dumps(F, ensure_ascii=False) + h[m.end(1):]
for bad in ['21.8ha', '21.75', '217,510', '217510', '217,511', '217,995', '67,510', '71,890', '블록 26개', '26개 블록', '2026-10-11 · 21.8', '확정 구역계 21.8']:
    assert bad not in h, bad
assert not re.search(r'남실장|대표 제공|보증금|010-', json.dumps(new, ensure_ascii=False))
HP.write_text(h, encoding='utf-8')
AC = ROOT / 'build/ask_cards/gimhae-wondosim.json'
if AC.exists():
    ac = json.loads(AC.read_text(encoding='utf-8')); ac['cards'] = F
    AC.write_text(json.dumps(ac, ensure_ascii=False, indent=1), encoding='utf-8')
print('cards', len(F), 'new', len(new), 'ZK_SHOP', len(es['shopIndices']) if es else 0)
