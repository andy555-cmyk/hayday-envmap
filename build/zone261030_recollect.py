"""구역 안 자료 재수집 결과(구역계 1안)를 data/gimhae-zone-261030.json 의 recollect 칸으로 넣는다 — 숫자는 숫자정본표(B·C·A 일부) 값만.

Usage: python3 build/zone261030_recollect.py <숫자정본표_구역계1안_261030.json>   (zone261030_canon.py 다음, zone261030_html.py 앞)
- 정본표에 값이 있는 항목만 싣는다. 정본표가 「진행 중·대기」로 둔 항목(매물·로드뷰 등)은 pending 에 남긴다
- 원자료 파일(상호·전화가 든 내부 표)은 읽지 않는다. 화면에 낼 숫자 = 정본표 행 그대로
- 여러 번 돌려도 결과가 같다.
"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ZP = ROOT / 'data/gimhae-zone-261030.json'
Z = json.loads(ZP.read_text())
C = json.loads(Path(sys.argv[1]).read_text())
assert Z['statsSource'] == 'canon', 'zone261030_canon.py 먼저'
R = {r['항목']: r for r in C['rows']}

def num(v):
    return isinstance(v, (int, float))

def item(key, label, note=''):
    r = R[key]; v = r['새값']
    assert num(v) or not str(v).startswith('⑦'), (key, v)  # 진행 중 항목은 싣지 않음
    return {'label': label, 'value': v, 'unit': r['단위'], 'asOf': r.get('기준일', ''), 'note': note}  # 정본표 비고는 내부 메모라 싣지 않음

G = [
    ('sbiz', '상권 · 등록점포', '소상공인시장진흥공단 상가(상권)정보 · 카카오맵', [
        item('상가(상권)정보 점포 2026-06', '등록점포 2026-06'), item('상가(상권)정보 점포 2026-03', '등록점포 2026-03'),
        item('분기 사이 사라진/새로 생긴 점포 후보', '분기 사이 사라진/새로 생긴 점포 후보', '같은 점포 번호로 이은 결과 — 폐업·이전 확정 아님'),
        item('소진공 상권 겹침', '소진공 상권 영역과 겹침', '상권 영역 ∩ 구역 ÷ 구역'), item('카카오 장소', '카카오맵 장소', '카카오맵 공개 검색 21개 검색어')]),
    ('license', '인허가 · 개업·폐업', '지방행정 인허가(LOCALDATA) 208종', [
        item('가게형 인허가 9종 — 영업 중', '가게형 9종 영업 중'), item('가게형 인허가 9종 — 2022년 이후 폐업', '가게형 9종 2022년 이후 폐업'),
        item('빈 점포 신호(폐업 뒤 새 영업 없음)', '빈 점포 신호(폐업 자리에 새 영업 없음)', '공실 확정 아님'), item('인허가 208종 구역 안 기록', '208종 구역 안 기록')]),
    ('vacancy', '공실 후보 신호', '인허가·상가정보·건물 용도·수도·전기를 겹쳐 본 후보', [
        item('빈 점포 후보 건물(용도·영업 규칙)', '빈 점포 후보 건물', '등록 가게 0 · 주거·비점포 제외 — 후보'),
        item('장기공실 후보(A+B) 지번', '장기공실 후보 지번(책상 판정 A+B)', '현장 확인 전'),
        item('수도 미사용·최근 중단 지번', '수도 미사용·최근 중단 지번', '봉황동만'),
        item('공실 신호 2개 이상 지번', '공실 신호 2개 이상 겹친 지번', '신호끼리 더하지 않음 · 공실률은 내지 않음')]),
    ('energy', '전기 사용', '건물에너지 공개 자료', [
        item('전기 — 조회 지번', '조회 지번'), item('전기 — 값 확보 지번', '값 있는 지번', '기록 없음은 공실 아님'),
        item('전기 — 월평균 중간값', '지번 월평균 중간값'), item('전기 — 월평균 100kWh 이하 지번', '월평균 100kWh 이하 지번', '공실 후보 신호')]),
    ('water', '수도 사용', '김해시 회신(2026.01~10)', [
        item('수도 계량기(구역 안)', '계량기', '봉황동만 — 부원동 지번은 자료 없음'), item('수도 자료 있는 지번', '자료 있는 지번', '봉황동만')]),
    ('land', '땅 · 규제', '토지이음 토지이용계획 · 개별공시지가', [
        item('토지이음 열람 지번', '열람 지번'), item('열람 지번 대장 면적 합', '열람 지번 대장 면적 합', '도로 제외·경계 걸친 지번 포함이라 구역 면적과 다름'), item('개별공시지가 중간값', '개별공시지가 중간값', '범위 487,000~3,844,000원/㎡'),
        item('역사문화환경보존지역 지번 비율', '역사문화환경보존지역 지번'), item('도로 저촉 지번', '도시계획도로 저촉 지번'),
        item('재해 개선 관련 지번', '자연재해 개선 관련 지번')]),
    ('heritage', '국가유산', '국가유산 공간정보', [
        item('국가유산 지정·보호구역 겹침', '지정·보호구역과 겹침', '봉황동 유적 지정구역과 약 9.7m 떨어짐'), item('역사문화환경 현상변경 허용기준 구역 안 비율', '현상변경 허용기준 구역 안 비율', '리모델링·신축 때 허용기준 확인 필요')]),
    ('arch', '건축 인허가 이력', '건축행정(건축HUB) 건축인허가', [
        item('건축인허가 건수', '건축인허가'), item('건축인허가 있는 지번', '건축인허가 있는 지번'), item('용도변경 허가', '용도변경 허가'), item('철거·멸실', '철거·멸실')]),
    ('access', '도로 · 걷기 · 땅 모양', 'OSM 도로망 · 보행망 · 수치표고', [
        item('구역 안 도로 길이(OSM 차량 도로)', '구역 안 차량 도로', '모두 소로 — 경계 대로는 선이 도로 안쪽 가장자리라 안에 안 듦'),
        item('봉황대길 구역 경계에 접한 길이', '봉리단길(구역 북서 경계)'),
        item('핵심 3역 10분 도보권 겹침', '경전철 3역 10분 도보권 겹침', '봉황역'), item('역→관광·문화 거점 가장 짧은 길 중 구역 통과', '역→관광·문화 거점 길 중 구역을 지나는 길'),
        item('13곳 한 바퀴 길이', '시 13곳 한 바퀴'), item('평균 층수(윤곽 기준)', '평균 층수'), item('평탄지(0~5°) 비율', '경사 5° 이하 땅')]),
]
Z['recollect'] = {'edition': C['edition'], 'made': C['made'], 'groups': [{'id': i, 'title': t, 'source': s, 'items': it} for i, t, s, it in G],
                  'note': '구역 안 자료를 확정 구역계(1안)로 다시 모은 값 — 항목마다 기준일이 다르고, 공실 신호는 후보이며 서로 더하지 않는다'}
covered = ['vacancy', 'emptyShop', 'energy', 'landUse537', 'heritage', 'archPms', 'sbizZone', 'licenseAll', 'kakaoPlace', 'survey', 'context', 'linkage', 'terrain', 'landPrice']
for k in covered: Z['pending'].pop(k, None)
Z['pending'].update({'listings': '공개 매물(새 구역)', 'roadview': '과거 로드뷰 판독(새 블록)', 'popMove': '인구 이동(회현동 등에서 빠져나간 인구의 행선지·앞으로의 예측)'})
blob = json.dumps(Z['recollect'], ensure_ascii=False)
assert not any(w in blob for w in ['⑦', '방 ', '남실장', '대표', '010-', '보증금', '만원', '869']), '공개 금지 문구'
ZP.write_text(json.dumps(Z, ensure_ascii=False, separators=(',', ':')) + '\n')
print(json.dumps({'groups': len(G), 'items': sum(len(g[3]) for g in G), 'pending': sorted(Z['pending'])}, ensure_ascii=False))
