# -*- coding: utf-8 -*-
"""확정 구역계(1안, 2026-10-30) 분석 결과를 「사실 카드」 묶음으로 내보낸다 — 김해 RE:CORE 사업 안내 누리집과 그 AI 도우미가 읽을 근거.

Usage: python3 build/zone261030_facts.py [OUT_MD]
  쓰는 파일: data/gimhae-zone-261030-facts.json (기계용) · OUT_MD(사람용, 기본 = 본부 대상지_김해 폴더)
숫자는 전부 data/gimhae-zone-261030.json(숫자정본표 반영본)에서 읽는다. 구역 안 원자료 재수집이 끝나기 전 항목은 「새 구역 재수집 중」 카드 한 장으로 둔다.
순서: rebuild_gimhae_zone261030.py → zone261030_canon.py → zone261030_html.py → 이 스크립트.
"""
import sys, re, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
Z = json.loads((ROOT / 'data/gimhae-zone-261030.json').read_text())
assert Z['statsSource'] == 'canon', '숫자정본표 반영(zone261030_canon.py) 먼저'
OUT_JSON = ROOT / 'data/gimhae-zone-261030-facts.json'
OUT_MD = Path(sys.argv[1]).expanduser() if len(sys.argv) > 1 else Path.home() / 'Library/CloudStorage/GoogleDrive-ganpan0@gmail.com/내 드라이브/hayday-hq/03_시스템_도구/환경분석맵/대상지_김해/확정구역계1안_분석사실묶음_누리집AI용_261030.md'
n = lambda v: f'{v:,}'
s, R, lg, cx = Z['stats'], Z['relation'], Z['ledger'], Z['canonExtra']
ZONE = f"확정 구역계(1안) · {Z['confirmed']} · {n(Z['area'])}㎡"
CANON = f"숫자정본표 {Z['canonCheck']['edition']}({Z['canonCheck']['made'][:10]})"
ins, out = Z['sitesSummary']['inside'], Z['sitesSummary']['outside']
F = []
def card(id_, topic, q, a, detail, scope, source, asof, limit):
    F.append({'id': id_, 'topic': topic, 'q': q, 'a': a, 'detail': detail, 'scope': scope, 'source': source, 'asOf': asof, 'limit': limit})

card('area', '구역', '확정 구역계 면적과 범위는?',
     f"{n(Z['area'])}㎡(약 {Z['areaHa']}ha) · 둘레 약 {n(Z['perimeterM'])}m",
     f"2026-10-30 확정 1안. 선은 북서 봉황대길·남 김해대로·동측 대로의 안쪽 가장자리를 따른다. 공모 권장 15만㎡보다 {n(R['over150k'])}㎡ 넓다(사유는 사전컨설팅·계획서에서 설명).",
     ZONE, '카카오맵 면적재기 실측 · ' + Z['sourceNote'], Z['confirmed'], '지적(필지) 경계가 아니다. 위치 오차 ±2~3m 추정.')
card('change', '구역', '옛 확정 구역계(10/11)와 무엇이 달라졌나?',
     f"겹치는 곳 {n(R['oldZoneOverlap'])}㎡ · 빠진 곳 {n(R['oldZoneOnly'])}㎡ · 새로 들어온 곳 {n(R['newOnly'])}㎡",
     '봉황대공원·북측 주거지·서남부가 빠지고 동측 상가 블록이 들어왔다. 옛 선은 도로 중심선 블록 기준이라 면적 기준이 다르다.',
     ZONE, CANON, Z['confirmed'], '옛 구역 숫자(건물·점포·공실)는 범위가 절반만 겹쳐 새 구역 값으로 쓰지 않는다.')
card('buildings', '건물', '구역 안 건물 수와 노후도는?',
     f"건축물대장 기준 {n(lg['buildings'])}동 · 사용승인일 확인 {n(lg['known'])}동 중 20년 이상 {lg['old20Pct']}%({n(lg['old20'])}동, 공모 판정용) · 건물 윤곽 기준으로는 {n(s['buildings'])}동 중 {s['oldPct']}%({n(s['old20'])}동 ÷ 연도 확인 {n(s['knownYear'])}동, 참고값)",
     f"연령대(윤곽): 40년 이상 {n(s['bands']['40년 이상'])} · 30~39년 {n(s['bands']['30~39년'])} · 20~29년 {n(s['bands']['20~29년'])} · 10~19년 {n(s['bands']['10~19년'])} · 10년 미만 {n(s['bands']['10년 미만'])} · 연도 미확인 {n(s['bands']['미확인'])}동.",
     ZONE, f"건물 윤곽 = 환경분석맵 건물 자료 · 대장 = {lg['source']}", '2026-08 / 2026-10-30',
     '두 기준은 집계 단위가 달라 수가 다르다(대장은 표제부 동, 윤곽은 지도상 건물). 둘 다 노후건축물 요건(50% 이상)을 넘는다.')
card('uses', '건물', '구역 건물은 주로 무슨 용도인가?',
     ' · '.join(f"{k} {n(v)}" for k, v in list(s['uses'].items())[:5]) + f"동(건물 윤곽 {n(s['buildings'])}동 기준)",
     f"법정동별 건물: {' · '.join(f'{k} {n(v)}' for k, v in s['dongs'].items())}동. 용도지역 면적: {' · '.join(f'{k} {v}%' for k, v in cx['zoning'].items() if v)}.",
     ZONE, CANON, '2026-10-30', '용도는 건축물대장 주용도이며 실제 쓰임과 다를 수 있다.')
card('stores', '상권', '구역 안 점포는 몇 곳인가?',
     f"등록점포 {n(s['stores'])}곳(1ha당 {cx['storeDensity']}곳)",
     '업종 상위: ' + ' · '.join(f'{k} {n(v)}' for k, v in list(s['industries'].items())[:5]) + '곳.',
     ZONE, '소상공인시장진흥공단 상가(상권)정보 2026-06', '2026-06', '등록 위치 기준이며 현재 영업 수가 아니다.')
card('sites', '대상지', '시 우선순위 대상지 13곳은 구역 안인가?',
     f"13곳 중 {len(ins)}곳 구역 안 · {len(out)}곳({'·'.join(f'{x}번' for x in out)}) 임시 유지(새 대상지 선정 전)",
     f"구역 안: {'·'.join(f'{x}번' for x in ins)}번 대상지. 구역 밖 4곳은 봉황대길 북측이며 새 대상지 선정 전까지 임시 유지한다(구역 통계에는 넣지 않음).",
     '지번 위치점', '김해시 사업대상지 목록(2026-10-08) · ' + CANON, Z['confirmed'], '지번 기준점 판정이며 필지 전체 판정이 아니다.')
card('access', '연계', '역에서 걸어서 닿나?',
     f"경전철 3역 10분 도보권이 구역 면적의 {cx['station10min']}%(봉황역)",
     '수로왕릉역·박물관역 10분 도보권은 구역에 닿지 않는다.', ZONE, CANON, '2026-10-30', '보행망 거리 계산이며 실제 이동 기록이 아니다.')
RC = {i['label']: i for g in Z['recollect']['groups'] for i in g['items']}
v = lambda l: (n(RC[l]['value']) if isinstance(RC[l]['value'], (int, float)) else RC[l]['value'])
RCSRC = f"새 구역 재수집 · {CANON}"
card('shopFlow', '상권', '점포는 늘었나 줄었나, 인허가로 보면?',
     f"등록점포 2026-03 {v('등록점포 2026-03')}곳 → 2026-06 {v('등록점포 2026-06')}곳 · 분기 사이 사라진/새로 생긴 후보 {v('분기 사이 사라진/새로 생긴 점포 후보')}곳",
     f"가게형 인허가 9종: 영업 중 {v('가게형 9종 영업 중')}곳 · 2022년 이후 폐업 {v('가게형 9종 2022년 이후 폐업')}곳 · 폐업 자리에 새 영업 없는 빈 점포 신호 {v('빈 점포 신호(폐업 자리에 새 영업 없음)')}곳. 인허가 208종 구역 안 기록 {v('208종 구역 안 기록')}건. 카카오맵 장소 {v('카카오맵 장소')}곳.",
     ZONE, '소상공인시장진흥공단 상가(상권)정보 · 지방행정 인허가(LOCALDATA) · 카카오맵 · ' + CANON, '2026-06 분기 / 2026-10-30', '같은 점포 번호로 이은 후보이며 폐업·이전 확정이 아니다.')
card('vacancySignals', '공실', '빈 가게는 몇 곳인가?',
     f"공실률은 아직 내지 않는다 — 후보 신호만: 빈 점포 후보 건물 {v('빈 점포 후보 건물')}동 · 장기공실 후보 {v('장기공실 후보 지번(책상 판정 A+B)')}지번 · 신호 2개 이상 겹친 지번 {v('공실 신호 2개 이상 겹친 지번')}곳",
     f"수도 미사용·최근 중단 {v('수도 미사용·최근 중단 지번')}지번(봉황동만) · 전기 월평균 100kWh 이하 {v('월평균 100kWh 이하 지번')}지번(값 있는 {v('값 있는 지번')}지번 중).",
     ZONE, RCSRC, '2026-10-30', '모두 현장 확인 전 후보이며 신호끼리 더하지 않는다. 수도 자료는 봉황동만 있다.')
card('landRules', '규제', '땅값과 규제는?',
     f"개별공시지가 중간값 {v('개별공시지가 중간값')}원/㎡ · 역사문화환경보존지역 {v('역사문화환경보존지역 지번')}% 지번",
     f"현상변경 허용기준 구역 안 비율 {v('현상변경 허용기준 구역 안 비율')}% · 국가유산 지정·보호구역 겹침 {v('지정·보호구역과 겹침')} · 도시계획도로 저촉 {v('도시계획도로 저촉 지번')}지번 · 자연재해 개선 관련 {v('자연재해 개선 관련 지번')}지번(열람 {v('열람 지번')}지번).",
     ZONE, '토지이음 토지이용계획·개별공시지가(2026/01) · 국가유산 공간정보 · ' + CANON, '2026-10-30', '공시지가는 거래 가격이 아니다. 리모델링·신축 때 허용기준을 먼저 확인한다.')
card('arch', '건물', '최근 건축 허가·용도변경은?',
     f"건축인허가 {v('건축인허가')}건({v('건축인허가 있는 지번')}지번) · 용도변경 {v('용도변경 허가')}건 · 철거·멸실 {v('철거·멸실')}건",
     f"구역 안 차량 도로 {v('구역 안 차량 도로')}m(모두 소로) · 봉리단길은 구역 북서 경계 {v('봉리단길(구역 북서 경계)')}m.",
     ZONE, '건축행정(건축HUB) 건축인허가 · OSM · ' + CANON, '2026-10-30', '허가 기록이며 실제 공사 여부는 현장 확인이 필요하다.')
card('pending', '자료', '아직 안 모인 자료는?',
     '공개 매물·과거 로드뷰 판독·개업·폐업 흐름·건물·층별 조사자료 연결은 새 구역으로 다시 모으는 중',
     '다 모이면 이 묶음과 환경분석맵 화면을 같이 바꾼다.', ZONE, '구역 안 자료 재수집(2026-10-30 시작)', '2026-10-30', '옛 구역 값을 대신 쓰지 않는다.')
card('dontMix', '주의', '다른 범위 수치와 섞으면 안 되는 것은?',
     '옛 확정 구역계(10/11) 수치와 이전 사업구역(초광역 원도심 51.8ha) 수치 — 건물 1,009동·노후 91.4% 등 — 는 1안 값이 아니다',
     '행정동·법정동 통계(인구·사업체)도 구역보다 넓은 범위다.', '전체', '환경분석맵 김해 화면', '2026-10-30', '수치를 인용할 때 범위를 밝힌다.')

banned = re.compile(r'옛값|미발송|⑦|남실장|대표 제공|대표님|대표 확정|대표 결정|방 ⑦|보증금|권리금|월세 ?\d|만 ?원|억|010-|의향|체납|연체|실거래가|클로드|코덱스|Claude|Codex|217,510|21\.8|208,622')
blob = json.dumps(F, ensure_ascii=False)
hit = banned.search(blob); assert not hit, hit.group(0)
OUT_JSON.write_text(json.dumps({'zone': ZONE, 'made': Z['confirmed'], 'from': 'data/gimhae-zone-261030.json (환경분석맵 김해 · build/zone261030_*.py)', 'facts': F}, ensure_ascii=False, indent=1))
md = [f'# 확정 구역계(1안) 분석 사실 묶음 — 누리집·AI 도우미용 ({Z["confirmed"]})', '',
      f'> 환경분석맵 김해 화면(확정 구역계 상세 분석)의 계산 결과를 카드로 옮긴 것. 숫자는 `~/dev/gijang-map/data/gimhae-zone-261030.json`({CANON} 반영)에서 자동으로 뽑았다(`build/zone261030_facts.py`). 매물·로드뷰는 재수집 중.', '',
      f'- 기계용: `~/dev/gijang-map/data/gimhae-zone-261030-facts.json` ({len(F)}장)', '- 공개 화면: https://andy555-cmyk.github.io/hayday-envmap/gimhae-wondosim.html?scope=zone', '']
for f in F:
    md += [f"## {f['topic']} · {f['q']}", '', f"**{f['a']}**", '']
    if f['detail']: md += [f['detail'], '']
    md += [f"- 범위: {f['scope']}", f"- 출처: {f['source']}", f"- 기준: {f['asOf']}", f"- 한계: {f['limit']}", '']
OUT_MD.write_text('\n'.join(md), encoding='utf-8')
print(len(F), 'facts →', OUT_JSON.name, '·', OUT_MD)
