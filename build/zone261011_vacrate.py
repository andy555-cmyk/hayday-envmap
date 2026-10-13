# -*- coding: utf-8 -*-
# 확정 구역계 「추정 공실률」 — 한국부동산원 임대동향조사의 대상·산식(공실 면적 ÷ 임대 가능 면적)을 구역 상가 건물 전체에 적용한 추정
# 사용: python3 build/zone261011_vacrate.py <vacrate_261013 폴더>   (estimate.py → fetch_floors.py → estimate_floor.py 뒤)
# 공개: 건물 수·면적·범위(%)만. 건물별 판정·전기 값은 내부(vacrate_261013/floors_judged.csv).
import sys, json, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
ZP = R / 'data/gimhae-zone-261011.json'
V = pathlib.Path(sys.argv[1]).expanduser()
B = json.load(open(V / 'estimate.json')); FL = json.load(open(V / 'estimate_floor.json'))
Z = json.loads(ZP.read_text())
SG = json.load(open(V / 'estimate_floor_ground.json')) if (V / 'estimate_floor_ground.json').exists() else None
pick = lambda d: {'areaM2': d['areaM2'], 'buildings': d['buildings'], 'lowPct': d['lowPct'], 'highPct': d['highPct'], 'highExOfficePct': d['highExOfficePct'],
                  'byClass': d['byClass']}
Z['vacRate'] = {
    'title': '확정 구역계 추정 공실률(부동산원 정의 적용 · 현장 조사 아님)',
    'definition': '한국부동산원 상업용부동산 임대동향조사와 같은 대상·산식 — 건축물대장 주용도가 제1·2종 근린생활시설·판매·운동·위락시설인 일반건축물(집합 제외), 소규모 = 2층 이하이면서 연면적 330㎡ 이하, 공실률 = 공실 면적 ÷ 임대 가능 면적',
    'population': {'buildings': B['all']['buildings'], 'small': B['small']['buildings'], 'large': B['large']['buildings'], 'areaM2': B['all']['areaM2'],
                   'commercialFloorM2': FL['allFloors']['areaM2'], 'floorParts': FL['allFloors']['parts']},
    'ground': pick(FL['ground']), 'small': pick(FL['small']), 'smallGround': pick(FL['smallGround']), 'large': pick(FL['large']),
    'upper': pick(FL['upper']), 'allFloors': pick(FL['allFloors']),
    'evidence': {'storesUsed': FL['storesUsed'], 'elecKnown': B['evidence']['elecKnown'], 'rvStage1': B['evidence']['rv2025Known'],
                 'rvStage2': FL['rv2Matched'], 'rvStage2Ground': FL['rv2Ground']},
    'sensitivity': ({'rule': '층 번호 없는 등록 점포(구역 294곳 중 151곳)를 비어 있는 상가 층에 아래부터 배정(기본) / 1층에만 배정(비교)',
                     'groundOnly': {k: [SG[k]['lowPct'], SG[k]['highPct']] for k in ('ground', 'small', 'large', 'allFloors')}} if SG else None),
    'method': '층별개요로 상가 층 면적을 나누고(주거 층 제외), 층마다 ① 상가정보 등록 점포(2026-06) ② 2025년 3월 로드뷰 1층·위층 모습(판정자 2단계 교차 확인) ③ 건물 월평균 전기(2025-06~2026-04)로 「영업 근거·사용 흔적·공실 근거·근거 없음」을 매김. 하한 = 공실 근거 면적 비율, 상한 = 공실 근거 + 근거 없음',
    'compare': '부동산원 「김해시청/동상시장」 소규모상가 13.7%(2026.2Q)는 표본 건물 현장 조사값이고 그 상권과 구역은 10.7%만 겹친다 — 조사 방법·범위가 달라 이 추정과 직접 비교하지 않는다',
    'caveat': '현장 공실 조사가 아니다 · 같은 층 여러 칸 중 일부만 빈 경우와 상가정보에 남아 있는 폐업 점포는 잡지 못해 하한은 낮게 나올 수 있다 · 사무실처럼 상가정보에 안 오르는 쓰임은 「근거 없음」으로 남아 위층 상한이 높게 나온다 · 「연면적 절반 이상 임대」 조건은 확인하지 못해 자가 영업 건물도 포함 · 사진은 2025년 3월, 점포는 2026년 6월, 전기는 2025-06~2026-04 기준',
    'source': '건축물대장 표제부·층별개요(국토교통부 건축HUB, 2026-10-13) · 소상공인시장진흥공단 상가(상권)정보 2026-06 · 건물에너지 전기 사용량 · 카카오 로드뷰 2025-03'}
ZP.write_text(json.dumps(Z, ensure_ascii=False, separators=(',', ':')))
v = Z['vacRate']
print({k: (v[k]['lowPct'], v[k]['highPct']) for k in ('ground', 'small', 'smallGround', 'large', 'upper', 'allFloors')}, v['population'])
