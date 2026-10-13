# -*- coding: utf-8 -*-
# 확정 구역계 「추정 공실률」 — 상가 규모 구분을 참고한 가정별 면적 비율. 부동산원 공식 공실률과 대상·분모·판정 방법이 다름
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
    'title': '확정 구역계 공실 조사 참고 계산(가정별 면적 비율 · 현장 조사 아님)',
    'definition': '상가 규모 구분만 한국부동산원을 참고 — 건축물대장 주용도가 제1·2종 근린생활시설·판매·운동·위락시설인 일반건축물(집합 제외), 소규모 = 2층 이하이면서 연면적 330㎡ 이하. 이 계산은 의심 층 면적 ÷ 대장상 상가 층 면적. 부동산원은 표본 건물의 실제 빈 공간과 면적을 현장에서 조사. 여기서는 실제 임대 가능 면적·임대 비율·빈 칸 면적을 확인하지 못해 같은 조사 아님',
    'population': {'buildings': B['all']['buildings'], 'small': B['small']['buildings'], 'large': B['large']['buildings'], 'areaM2': B['all']['areaM2'],
                   'commercialFloorM2': FL['allFloors']['areaM2'], 'floorParts': FL['allFloors']['parts']},
    'ground': pick(FL['ground']), 'small': pick(FL['small']), 'smallGround': pick(FL['smallGround']), 'large': pick(FL['large']),
    'upper': pick(FL['upper']), 'allFloors': pick(FL['allFloors']),
    'evidence': {'storesUsed': FL['storesUsed'], 'elecKnown': B['evidence']['elecKnown'], 'rvStage1': B['evidence']['rv2025Known'],
                 'rvStage2': FL['rv2Matched'], 'rvUnique': FL['rvUnique'], 'rvBoth': FL['rvBoth'], 'rvStage2Ground': FL['rv2Ground']},
    'sensitivity': ({'rule': '층 번호 없는 등록 점포(구역 294곳 중 151곳)를 비어 있는 상가 층에 아래부터 배정(기본) / 1층에만 배정(비교)',
                     'groundOnly': {k: [SG[k]['lowPct'], SG[k]['highPct']] for k in ('ground', 'small', 'large', 'allFloors')}} if SG else None),
    'interpretation': '현장 확인 전 가정별 참고 계산이며 실제 공실률의 하한·상한이나 통계적 신뢰구간이 아니다. 사진상 비어 보임·전기 저사용은 공실 확정 근거가 아니다',
    'method': '대장상 상가 층 면적(주거 층 제외)에 등록 점포(2026-06), 로드뷰, 지번별 전기 자료를 연결. 첫 값 = 기존 분류에서 공실 의심으로 넣은 층을 전부 비었다고 가정한 면적 비율, 둘째 값 = 근거 없는 층도 전부 비었다고 가정한 비율. 점포 1곳·영업 모습이 있으면 그 층 전체를 사용 중으로 가정하므로 일부 칸 공실은 계산하지 못함. 사진·전기만으로 층 전체 공실을 확정하지 않음',
    'compare': '부동산원 「김해시청/동상시장」 소규모상가 13.7%(2026.2Q)는 표본 건물 현장 조사값이고 그 상권과 구역은 10.7%만 겹친다 — 조사 대상·분모·방법·시점이 달라 이 참고 계산과 직접 비교하거나 환산하지 않는다',
    'caveat': '현장 조사 아님 · 실제 빈 칸의 면적과 임대 여부를 확인하기 전에는 구역 공실률을 확정할 수 없음 · 부분 공실·폐업 점포 잔존·자가 영업을 구분하지 못함 · 같은 층을 나눈 면적 행에 점포를 배정하는 순서에 따라서도 계산값이 달라짐 · 같은 주소의 여러 동에 점포·전기 근거가 겹쳐 붙을 수 있음 · 전기는 지번 합계여서 층별 사용 여부를 알 수 없음 · 사진과 점포·전기 자료의 시점이 달라 현재 상태를 뜻하지 않음 · 사무실 등 등록되지 않는 쓰임은 근거 없음으로 잡힘',
    'source': '건축물대장 표제부·층별개요(국토교통부 건축HUB, 2026-10-13) · 소상공인시장진흥공단 상가(상권)정보 2026-06 · 건물에너지 전기 사용량 · 카카오 로드뷰 2025-03'}
ZP.write_text(json.dumps(Z, ensure_ascii=False, separators=(',', ':')))
v = Z['vacRate']
print({k: (v[k]['lowPct'], v[k]['highPct']) for k in ('ground', 'small', 'smallGround', 'large', 'upper', 'allFloors')}, v['population'])
