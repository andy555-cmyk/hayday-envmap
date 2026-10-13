"""Publish aggregate evidence coverage, never an unmeasured vacancy-rate estimate.
Usage: python3 build/zone261011_vacrate.py <new evidence output folder>
Private building, shop, meter and photo joins remain outside this repository.
"""
import sys,json,pathlib
R=pathlib.Path(__file__).resolve().parent.parent
ZP=R/'data/gimhae-zone-261011.json'
S=json.loads((pathlib.Path(sys.argv[1]).expanduser()/'summary.json').read_text())
assert S['schemaVersion']==2
Z=json.loads(ZP.read_text());st=S['stores'];q=S['quality']
Z['vacRate']={
 'schemaVersion':2,'status':'not_measured','title':'확정 구역계 건물·층별 조사자료 연결 현황',
 'vacancyRate':None,'verifiedVacantAreaM2':None,'rentableAreaM2':None,
 'population':S['population'],'stores':st,'quality':q,'energy':S['energy'],'roadview':S['roadview'],
 'definition':'건축물대장 주용도가 제1·2종 근린생활시설·판매·운동·위락시설인 일반건축물의 주건축물 173동. 소규모는 지상 2층 이하이면서 연면적 330㎡ 이하. 주용도가 주택인 복합건물과 집합건축물은 이 목록에 포함하지 않음. 비주거 층 면적은 주건축물 대장의 주거 용도 행·부속건물 행을 뺀 합계이며 공용공간을 포함하므로 임대 가능한 면적과 다름',
 'interpretation':'구역의 실제 공실률은 확인되지 않았다. 이전 가정별 비율은 층 배정 방식에 영향을 받고 실제 빈 칸 면적이 없어 더 이상 제공하지 않는다. 이 표는 자료의 연결 여부이며 영업·공실 확정 결과가 아니다',
 'method':'전체 확보 대장을 대조해 도로명과 주지번·공식 부속지번이 함께 맞는 건물이 하나일 때만 점포를 연결. 층 번호도 대장과 맞을 때만 해당 층에 한 번 연결. 같은 건물·같은 층의 여러 면적 행은 한 층으로 묶고 주건축물과 부속건물을 구분. 층 번호가 없는 점포는 건물까지만 기록. 여러 건물이 남거나 주소가 안 맞으면 연결을 보류. 전기 자료는 지번·월 단위, 사진은 촬영 대상·날짜 단위로 따로 보존하며 각 건물·층에 복제하지 않음',
 'compare':'부동산원 「김해시청/동상시장」 소규모상가 13.7%(2026.2Q)는 그 상권의 표본 조사값. 확정 구역계 면적의 10.7%만 그 상권과 겹치며, 겹치는 면적 비율로 구역 공실률을 계산할 수 없음',
 'caveat':'점포 연결은 등록자료와 대장의 주소 대조 결과로 현재 영업이나 층 전체 사용을 뜻하지 않음 · 연결되지 않은 점포와 자료 없는 층도 공실이 아님 · 확보한 대장 밖 건물·주소 변경·자료 시점 차이는 남아 있음 · 층 면적 합계와 표제부 면적이 다른 2동은 공식 재조회에도 차이가 남아 있어 확인 필요 · 동일 내용의 2㎡ 화장실 행 2개는 공식 재조회에도 각각 남아 있고 합계가 표제부와 맞아 임의 삭제하지 않음 · 사진·전기 저사용만으로 공실 또는 공실 기간을 확정하지 않음',
 'source':'건축물대장 표제부·층별개요(국토교통부 건축HUB, 2026-10-13) · 소상공인시장진흥공단 상가(상권)정보 2026-06 원본 · 건물에너지 전기 2025-06~2026-04 · 카카오 로드뷰 각 촬영일',
 'changes':'층 미상 점포의 임의 배정 중단 · 같은 주소의 다른 건물로 복제 중단 · 부속 비주거 면적 15.76㎡ 제외 · 점포·사진 한 건으로 층 전체를 사용 또는 공실로 처리하던 계산 중단'
}
ZP.write_text(json.dumps(Z,ensure_ascii=False,separators=(',',':')))
print(json.dumps({'population':S['population'],'stores':st},ensure_ascii=False))
