/* B권역은 별도 계산 결과를 사용한다. 원본 D·D2·S 및 기존 분석은 변경하지 않는다. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = v => Number(v).toLocaleString('ko-KR');
  const areaLabel = () => (data.printedArea/10000).toFixed(1)+'ha';
  const fc = features => ({type:'FeatureCollection',features});
  const switcher = document.createElement('div'); switcher.id='scope-switch';
  switcher.innerHTML='<div class="scope-label">기존 지도에 B권역 함께 보기</div><div class="scope-buttons"><button id="scope-old" aria-pressed="true">전체 · B 함께 보기</button><button id="scope-b" disabled aria-pressed="false">B권역 불러오는 중</button></div><div id="scope-status" role="status"></div>';
  $('detail').prepend(switcher);
  const panel=document.createElement('section');panel.id='b-panel';$('detail').append(panel);
  const overview=document.createElement('section');overview.id='b-overview';switcher.after(overview);
  const caption=document.createElement('div');caption.id='b-map-caption';document.body.append(caption);
  let data, buildings, stores, active=false, ready=false, mode='old', is3d=true, savedView, popup;
  const insights=window.GimhaeBInsights;
  let analysis, buildingRows=[], storeRows=[], buildingLimit=30, storeLimit=20;
  let visibility=new Map(), previousTitle=document.title;
  const baseIds=new Set(['bg','sat','dark','light']);
  const ownIds=[];
  const contextIds=new Set(['zone-f','zone-glow','zone-cas','zone-l','zone-blue','zone-blue2','zone-lab','wall-3d','hub-c','hub-t','hub-3d']);
  // Same building source, height and age palette as the existing map.
  const colors=MODES.old.p;
  const ageLegend=[['#b32318','1975년 이전'],['#d9532b','1990년'],['#ef8f3c','2000년'],['#f3c37a','2010년'],['#efe7d9','2018년'],['#faf7f1','2024년 이후'],['#cfc9bf','연도 미확인']];
  const classColor=['match',['get','cl'],'shop','#ef6161','res','#ab8bed','non','#64a1cd','unk','#8a95a5','biz','#68ba93','#586776'];
  const labels={shop:'현장 확인 후보',res:'주거용 건물',non:'가게 대상 아님',unk:'용도 미확인',biz:'등록점포 연결',etc:'기타'};
  function addSource(id,features){map.addSource(id,{type:'geojson',data:features});}
  function addLayer(layer){ownIds.push(layer.id);map.addLayer(layer);}
  function setVisibility(id,on){if(map.getLayer(id))map.setLayoutProperty(id,'visibility',on?'visible':'none');}
  function isolate(){
    if(!active)return;
    for(const layer of map.getStyle().layers){
      if(baseIds.has(layer.id)||contextIds.has(layer.id)||layer.id.startsWith('bs-'))continue;
      if(!visibility.has(layer.id))visibility.set(layer.id,map.getLayoutProperty(layer.id,'visibility')||'visible');
      if(map.getLayoutProperty(layer.id,'visibility')!=='none')setVisibility(layer.id,false);
    }
  }
  function frame(duration=0,closeup=false){
    if(!data)return;
    const coords=[...data.boundary.geometry.coordinates[0]];
    // Start with the existing district AND B, never a detached B-only crop.
    if(!closeup)ZP.features.filter(f=>['black','blue'].includes(f.properties.k)).forEach(f=>coords.push(...f.geometry.coordinates[0]));
    const xs=coords.map(p=>p[0]),ys=coords.map(p=>p[1]);
    const viewport=map.getContainer().getBoundingClientRect(),rect=$('detail').getBoundingClientRect();
    const mobile=innerWidth<=820, panelVisible=rect.width>0&&rect.height>0;
    // Padding is relative to the MAP, not the browser. Desktop already excludes the sidebar.
    const coveredLeft=!mobile&&panelVisible?Math.max(0,rect.right-viewport.left):0;
    const coveredBottom=mobile&&panelVisible?Math.max(0,viewport.bottom-Math.max(rect.top,viewport.top)):0;
    const side=Math.max(28,(viewport.width-coveredLeft)*.12);
    const visibleHeight=Math.max(120,viewport.height-coveredBottom);
    const vertical=Math.max(28,visibleHeight*.12);
    map.fitBounds([[Math.min(...xs),Math.min(...ys)],[Math.max(...xs),Math.max(...ys)]],{
      padding:{left:coveredLeft+side,right:side,top:vertical,bottom:coveredBottom+vertical},
      pitch:is3d?30:0,bearing:0,duration,maxZoom:17.4
    });
  }
  function switchScope(on){
    if(on&&!ready)return;
    if(on===active)return;
    popup?.remove();
    if(on){savedView={center:map.getCenter(),zoom:map.getZoom(),pitch:map.getPitch(),bearing:map.getBearing(),padding:map.getPadding()};visibility=new Map();}
    active=on;document.body.classList.toggle('b-active',on);document.body.dataset.analysisScope=on?'b171':'legacy';
    $('scope-b').setAttribute('aria-pressed',String(on));$('scope-old').setAttribute('aria-pressed',String(!on));
    if(on){isolate();renderLayers();document.title=`김해 B권역 ${areaLabel()} · 환경분석맵`;frame(0);}
    else {ownIds.forEach(id=>setVisibility(id,false));visibility.forEach((v,id)=>{if(map.getLayer(id))map.setLayoutProperty(id,'visibility',v);});document.title=previousTitle;if(savedView)map.jumpTo(savedView);showBoundary();frame(0);}
  }
  function showBoundary(){['bs-boundary-fill','bs-boundary-glow','bs-boundary-case','bs-boundary-line','bs-boundary-highlight'].forEach(id=>setVisibility(id,true));}
  function renderLayers(){
    if(!active)return;
    ownIds.forEach(id=>setVisibility(id,true));
    setVisibility('bs-mask',true);
    setVisibility('bs-flat',!is3d);setVisibility('bs-3d',is3d);
    setVisibility('bs-context-flat',!is3d);setVisibility('bs-context-3d',is3d);
    setVisibility('bs-stores',$('b-stores').checked);setVisibility('bs-roads',$('b-roads').checked);
    setVisibility('bs-review',$('b-review').checked);setVisibility('bs-compare',$('b-compare').checked);
    setVisibility('bs-wifi',$('b-wifi').checked);
    renderSelection();
    renderStoreMap();
    const color=mode==='old'?colors:mode==='candidate'?classColor:['match',['get','pu'],'단독주택','#ab8bed','공동주택','#7487d8','제1종근린생활시설','#e8ab6d','제2종근린생활시설','#ee875e','숙박시설','#68bbc8','#8295a8'];
    map.setPaintProperty('bs-flat','fill-color',color);map.setPaintProperty('bs-3d','fill-extrusion-color',color);
    const legend=mode==='old'?ageLegend:mode==='candidate'?[['#ef6161','현장 확인 후보'],['#ab8bed','주거'],['#64a1cd','비점포'],['#8a95a5','용도 미확인'],['#68ba93','등록점포 연결']]:[['#ab8bed','단독주택'],['#7487d8','공동주택'],['#e8ab6d','제1종 근생'],['#ee875e','제2종 근생'],['#68bbc8','숙박'],['#8295a8','기타']];
    $('b-legend').innerHTML=legend.map(([c,t])=>`<span><i class="b-dot" style="background:${c}"></i>${t}</span>`).join('');
    caption.innerHTML=`<b>지금 보고 있는 것 — ${mode==='old'?'노후도 (기존 지도와 같은 색)':mode==='candidate'?'현장 확인 후보':'건물 용도'}</b><div class="b-map-legend">${$('b-legend').innerHTML}</div><span>B권역 ${areaLabel()} · 건물 ${num(data.stats.buildings)}동 · 등록점포 ${num(data.stats.stores)}개</span><div id="b-map-selection"></div><div class="b-caption-note">민트 점선: B 검토 경계 · 파란선: 기존 사업구역<br>기존 구역과 주변 건물은 위치 참고 · B 집계와 별도</div>`;
    renderSelectionNote();
  }
  const table=obj=>'<table>'+Object.entries(obj).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${num(v)}</td></tr>`).join('')+'</table>';
  function renderPanel(){
    const s=data.stats, classes={};buildings.forEach(f=>{const k=f.properties.cl;classes[k]=(classes[k]||0)+1;});
    analysis=insights.summarize(buildings,stores);
    overview.innerHTML=`<div class="b-overview-heading"><b><i></i>B권역 추가 검토</b><span>${areaLabel()}</span></div><p>기존 지도 위에 <b>민트 점선</b>으로 겹쳐 표시</p><div class="b-overview-stats"><span>건물 <b>${num(s.buildings)}동</b></span><span>등록점포 <b>${num(s.stores)}개</b></span><span>20년 이상 <b>${s.oldPct}%</b></span></div><p class="b-overview-note">도면 ${data.sourcePage}쪽 · ${num(data.printedArea)}㎡ 안 · 아래 기존 구역 통계와 별도</p><div class="b-overview-actions"><button id="b-together">전체 위치 보기</button><button id="b-closeup">B권역 확대·분석</button></div>`;
    $('b-together').onclick=()=>frame(350);
    $('b-closeup').onclick=()=>{switchScope(true);frame(350,true);};
    const overviewInsight=document.createElement('p');overviewInsight.className='b-overview-note';overviewInsight.textContent=`안쪽 분석: 40년 이상 ${analysis.counts.old40}동 · 등록 업종 중 소매·음식 ${analysis.foodRetailPct}%`;overview.querySelector('.b-overview-actions').before(overviewInsight);
    panel.innerHTML=`<div class="b-eyebrow">김해 원도심 · 분석 범위 B권역</div><h2>김해 원도심 — B권역</h2><p>기존 지도와 같은 건물·노후도 표현 · 집계는 B권역만</p>
      <div class="b-note">${esc(data.source)}의 빨간 경계를 옮긴 검토선입니다. 도면 이미지를 지도에 옮겼으며, 측량 경계가 아닙니다. 경계 주변 건물은 포함 여부를 다시 확인해야 합니다.</div>
      <div class="b-kpis"><div class="b-kpi"><strong>${num(s.buildings)}</strong><span>B권역 건물 · 동</span></div><div class="b-kpi"><strong>${num(s.stores)}</strong><span>등록점포 위치 · 개</span></div><div class="b-kpi"><strong>${s.oldPct}%</strong><span>연도 확인 건물 중 20년 이상</span></div><div class="b-kpi"><strong>${num(s.edgeInside)}</strong><span>포함 건물 중 경계 주변 · 동</span></div></div>
      <p>노후 비율: ${s.old20}동 ÷ 연도 확인 ${s.knownYear}동<br>연도 미확인 ${s.unknownYear}동은 비율 계산에서 제외 · 2026년 기준</p>
      <nav class="b-jump" aria-label="B권역 분석 바로가기"><a href="#b-reading">핵심 분석</a><a href="#b-building-section">건물 찾기</a><a href="#b-store-section">상권 찾기</a><a href="#b-export-section">자료 받기</a></nav>
      <section id="b-reading" class="b-reading"><h3>자료로 읽는 B권역</h3><article><span>01 · 건물 연도</span><strong>40년 이상 ${num(analysis.counts.old40)}동</strong><p>연도 확인 ${num(s.knownYear)}동 중 ${insights.pct(analysis.counts.old40,s.knownYear)}%. 오래된 정도를 보여주는 값이며, 안전등급은 아닙니다.</p></article><article><span>02 · 등록 업종</span><strong>소매·음식 ${num(analysis.foodRetail)}개 · ${analysis.foodRetailPct}%</strong><p>등록점포 ${s.stores}개 기준. 매출·손님 수나 현재 영업 비율을 뜻하지 않습니다.</p></article><article><span>03 · 건물 쓰임</span><strong>주택 ${analysis.residential}동 · 근린생활시설 ${analysis.neighborhood}동</strong><p>근린생활시설은 가게·의원 등 생활에 필요한 시설입니다. 건물 전체의 주용도 기준이므로 가구 수나 점포 수와 다릅니다.</p></article><div class="b-note">검토 제안: 오래된 건물 상태·공실 여부·보행 불편을 현장에서 함께 확인. 이 자료만으로 철거·정비 대상을 확정하지 않습니다.</div><button id="b-brief">분석 요약 내려받기</button></section>
      <details><summary>B권역 자료에 물어보기</summary><div class="b-controls" id="b-questions"><button>건물·점포</button><button>노후도</button><button>빈 점포</button><button>유동인구</button><button>인구·사업체</button><button>경계</button></div><p id="b-answer" role="status">항목을 누르면 B권역 자료만으로 답합니다. 기존 구역 수치와 섞지 않습니다.</p></details>
      <h3>건물 색 · 지도 보기</h3><select id="b-mode" aria-label="건물 색상 구분"><option value="old">노후도 (기존 지도와 동일)</option><option value="use">건물 용도별</option><option value="candidate">빈 점포 현장 확인 후보</option></select>
      <div id="b-legend" class="b-legend"></div><div class="b-controls"><button id="b-3d" aria-pressed="true">입체 건물</button><button id="b-fit">주변까지 넓게 보기</button><button id="b-focus">B권역만 확대</button></div>
      <label><input id="b-stores" type="checkbox">등록점포 위치 표시 · 업종·검색 조건 반영</label><label><input id="b-roads" type="checkbox">B권역 안 도로 표시</label><label><input id="b-review" type="checkbox">경계 주변 건물 ${data.edgeBuildingIndices.length}동 확인</label><label><input id="b-compare" type="checkbox">기존 파란 경계와 비교</label><label><input id="b-wifi" type="checkbox">주변 와이파이 측정지점 참고</label>
      <details><summary>건물 노후도 · 용도</summary>${table(s.bands)}<p>사용승인 연도 기준. 건물 상태·안전등급을 뜻하지 않습니다.</p>${table(s.uses)}</details>
      <details><summary>빈 점포 현장 확인 후보 ${num(classes.shop||0)}동</summary><div class="b-note">실제 공실로 확인한 수가 아닙니다. 기존 자료의 상업지역·연결 점포 0개 조건에 건물 용도 등을 대조한 현장 확인 후보입니다.</div>${table(Object.fromEntries(Object.entries(classes).map(([k,v])=>[labels[k],v])))}<p>상가 위치 ${s.stores}개와 건물별 연결 점포 수는 서로 다른 기준이므로 합계가 같지 않을 수 있습니다.</p></details>
      <details><summary>상권 · 도로 · 유동 자료</summary>${table(s.industries)}<h3>경계 안으로 잘라 계산한 도로 길이</h3>${table(Object.fromEntries(Object.entries(s.roadLengths).map(([k,v])=>[k+' (m)',v])))}<p>도로 중심선 길이이며 보행거리나 도로 면적이 아닙니다.</p><div class="b-note">B권역 내부 와이파이 측정지점 ${s.wifiInside}곳. 사람 수가 0명이라는 뜻이 아닙니다. 주변 지점은 참고용으로만 표시하며 B권역 유동인구로 합산하지 않습니다.</div><p>기존 구역의 출입구·생활권·점포별 큰길 거리는 이 범위의 새 분석값으로 사용하지 않습니다.</p></details>
      <details><summary>경계 근거 · 포함 기준</summary><p>자료: ${esc(data.source)} · 표기 ${num(data.printedArea)}㎡ / 지도에서 계산 ${num(data.computedArea)}㎡. 표기 면적에 맞춰 경계를 억지로 늘리거나 줄이지 않았습니다.</p><p>건물: 건물 내부 대표점이 경계 안에 있으면 포함.<br>점포: 등록된 위치가 경계 안에 있으면 포함.</p><p>경계선 양쪽 20m에 닿는 건물 ${data.edgeBuildingIndices.length}동(안 ${s.edgeInside}동 / 밖 ${data.edgeBuildingIndices.length-s.edgeInside}동)은 검토 목록으로 별도 관리. 20m는 확인용 폭이며 정확도 보증이 아닙니다.</p><p>기존 파란 범위·분석·주변 자료는 삭제하지 않았습니다. 위의 ‘전체 · B 함께 보기’ 버튼으로 돌아갑니다.</p><p>자료: 기존 환경분석맵 건물 자료 / 상가정보 2026년 6월 / 노후 계산 2026년. 위치·업종·영업 여부는 현장 확인 필요.</p></details>
      <section id="b-building-section"><h3>현장 확인 · 건물 찾기</h3><p>조건을 누르면 같은 대상이 지도에 노란색으로 표시됩니다. 아래 대상끼리는 겹칠 수 있어 더해서 계산하지 않습니다.</p><div class="b-group-grid" id="b-groups">${Object.entries(insights.groups).map(([k,v])=>`<button data-group="${k}" aria-pressed="${k==='all'}">${v}<strong>${num(analysis.counts[k])}동</strong></button>`).join('')}</div><p>공실 후보 ${analysis.counts.candidate}동 중 ${analysis.candidateEdge}동은 경계 안쪽 확인 대상에도 해당합니다. 후보 수는 공실 수가 아닙니다.</p><label for="b-building-group">찾을 대상</label><select id="b-building-group">${Object.entries(insights.groups).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select><input id="b-query" type="search" placeholder="건물명·도로명·건물번호·용도" aria-label="B권역 건물 검색"><label><input id="b-only-candidate" type="checkbox">공실 현장 확인 후보 조건 추가</label><label><input id="b-only-edge" type="checkbox">경계 주변으로 범위 변경 · 바깥 포함</label><div class="b-controls"><button id="b-clear">건물 조건 초기화</button><button id="b-filter-csv">현재 건물 목록 받기</button><button id="b-field-csv">현재 대상 현장 기록표</button></div><p id="b-results-status" role="status"></p><div id="b-results"></div><button id="b-more">건물 30동 더 보기</button></section>
      <section id="b-store-section"><h3>상권 구성 · 등록점포 찾기</h3><p>막대를 누르면 해당 업종의 위치와 목록을 함께 봅니다. 비율은 B권역 등록점포 ${s.stores}개 기준입니다.</p><div id="b-industry-bars">${analysis.industries.map(([k,n])=>`<button class="b-industry" data-industry="${esc(k)}" aria-pressed="false"><span>${esc(k)}<b>${n}개 · ${insights.pct(n,s.stores)}%</b></span><i style="--bar-width:${insights.pct(n,s.stores)}%"></i></button>`).join('')}</div><label for="b-industry">업종 선택</label><select id="b-industry"><option value="">전체 업종</option>${analysis.industries.map(([k])=>`<option>${esc(k)}</option>`).join('')}</select><input id="b-store-query" type="search" placeholder="상호·주소·세부 업종 검색" aria-label="B권역 등록점포 검색"><div class="b-controls"><button id="b-store-clear">점포 조건 초기화</button><button id="b-store-filter-csv">현재 점포 목록 받기</button></div><p id="b-store-status" role="status"></p><div id="b-store-results"></div><button id="b-store-more">점포 20개 더 보기</button><div class="b-note">상가정보 2026년 6월 등록 위치입니다. 폐업·이전·실제 영업 여부는 현장에서 확인해야 합니다. 현장 방문 주소는 도로명 주소를 우선 확인하세요.</div></section>
      <section id="b-export-section"><h3>검토 자료 내려받기</h3><div class="b-controls"><button id="b-csv">전체 건물 목록</button><button id="b-store-csv">전체 점포 목록</button><button id="b-edge-csv">경계 검토 목록</button><button id="b-geo">경계 파일</button><button id="b-shot">지도 그림</button></div><p id="b-export-status" role="status"></p><p>현장 기록표의 조사일·영업 상태·메모는 빈칸입니다. 내려받은 파일에 직접 기록하며, 사이트에는 저장되지 않습니다.</p><p>그림에는 B권역 표시·집계·주의 문구를 함께 넣습니다.</p></section>`;
    $('b-mode').onchange=e=>{mode=e.target.value;renderLayers();};
    $('b-3d').onclick=()=>{is3d=!is3d;$('b-3d').setAttribute('aria-pressed',String(is3d));renderLayers();frame(350);};
    $('b-fit').onclick=()=>frame(350);
    $('b-focus').onclick=()=>frame(350,true);
    const answers={
      '건물·점포':`B권역에 포함된 건물 ${s.buildings}동, 등록점포 위치 ${s.stores}개입니다. 등록점포는 현재 영업 여부를 현장에서 확인한 수가 아닙니다.`,
      '노후도':`2026년 기준 20년 이상 ${s.old20}동입니다. 연도가 확인된 ${s.knownYear}동 중 ${s.oldPct}%이며, 연도 미확인 ${s.unknownYear}동은 비율에서 제외했습니다.`,
      '빈 점포':`실제 공실 수와 공실률은 아직 확인되지 않았습니다. 상업지역·등록점포 미연결·용도 조건으로 좁힌 현장 확인 후보는 ${classes.shop||0}동입니다.`,
      '유동인구':`B권역 안의 와이파이 측정지점은 ${s.wifiInside}곳입니다. 유동인구가 0명이라는 뜻이 아닙니다. 주변 측정값으로 B권역 사람 수를 계산하지 않았습니다.`,
      '인구·사업체':'B권역 경계와 정확히 일치하는 인구·사업체 변화 자료는 확보되지 않았습니다. 기존 사업구역의 행정동·상권 수치는 주변 참고용이며, 면적 비율로 나눠 B권역 수치로 바꾸지 않습니다.',
      '경계':`${data.sourcePage}쪽 빨간 경계 표기는 ${num(data.printedArea)}㎡이고, 이미지에서 옮긴 선의 계산 면적은 ${num(data.computedArea)}㎡입니다. 공식 좌표 경계가 아니며 주변 ${data.edgeBuildingIndices.length}동은 포함 여부 재확인이 필요합니다.`
    };
    $('b-questions').onclick=e=>{const key=e.target.textContent;if(answers[key])$('b-answer').textContent=answers[key];};
    ['b-stores','b-roads','b-review','b-compare','b-wifi'].forEach(id=>$(id).onchange=renderLayers);
    ['b-query','b-only-candidate','b-only-edge','b-building-group'].forEach(id=>$(id).addEventListener('input',()=>{buildingLimit=30;renderResults();}));
    $('b-groups').onclick=e=>{const key=e.target.closest('[data-group]')?.dataset.group;if(!key)return;$('b-building-group').value=key;$('b-only-candidate').checked=false;$('b-only-edge').checked=false;$('b-query').value='';buildingLimit=30;renderResults();};
    $('b-clear').onclick=()=>{$('b-building-group').value='all';$('b-query').value='';$('b-only-candidate').checked=false;$('b-only-edge').checked=false;buildingLimit=30;renderResults();};
    $('b-more').onclick=()=>{buildingLimit+=30;renderResults();};
    $('b-filter-csv').onclick=()=>exportBuildings(buildingRows,'B권역_조건선택_건물');
    $('b-field-csv').onclick=()=>downloadCSV([['원본번호','건물명','주소','용도','사용승인연도','선정조건','B권역포함','경계확인','조사일','영업상태(현장확인)','공실층_호수(현장확인)','건물상태_보행불편','사진번호','메모'],...buildingRows.map(({properties:p})=>[p.bidx,p.nm,[p.d,p.rn,p.bn].filter(Boolean).join(' '),p.pu,p.yr||'',buildingCondition(),p.inside===false?'아니오':'예',p.edge?'필요':'','','','','','',''])],'B권역_현장기록표');
    ['b-industry','b-store-query'].forEach(id=>$(id).addEventListener('input',()=>{storeLimit=20;renderStores();}));
    $('b-industry-bars').onclick=e=>{const button=e.target.closest('[data-industry]');if(!button)return;$('b-industry').value=button.dataset.industry;storeLimit=20;renderStores();};
    $('b-store-clear').onclick=()=>{$('b-industry').value='';$('b-store-query').value='';storeLimit=20;renderStores();};
    $('b-store-more').onclick=()=>{storeLimit+=20;renderStores();};
    $('b-store-filter-csv').onclick=()=>exportStores(storeRows,'B권역_조건선택_등록점포');
    $('b-brief').onclick=exportBrief;
    $('b-csv').onclick=()=>exportBuildings(buildings,'B권역_건물');
    $('b-edge-csv').onclick=()=>exportBuildings(reviewBuildings(),'B권역_경계주변검토');
    $('b-store-csv').onclick=()=>exportStores(stores,'B권역_등록점포');
    $('b-geo').onclick=()=>download(JSON.stringify({...data.boundary,properties:{...data.boundary.properties,source:data.source,status:'이미지에서 옮긴 검토용 임시 경계',printedArea:data.printedArea,computedArea:data.computedArea}},null,2),'B권역_검토경계.geojson','application/geo+json');
    $('b-shot').onclick=shot;
    renderResults();
    renderStores();
  }
  function reviewBuildings(){return data.edgeBuildingIndices.map(i=>({...D.bld.features[i],properties:{...D.bld.features[i].properties,bidx:i,inside:data.buildingIndices.includes(i),edge:true}}));}
  function renderResults(){
    const group=$('b-building-group').value;
    buildingRows=insights.filterBuildings($('b-only-edge').checked?reviewBuildings():buildings,{group,candidate:$('b-only-candidate').checked,query:$('b-query').value});
    const outside=buildingRows.filter(f=>f.properties.inside===false).length;
    $('b-results-status').textContent=`${buildingCondition()} · ${num(buildingRows.length)}동 중 ${Math.min(buildingLimit,buildingRows.length)}동 표시${outside?` · B권역 밖 ${outside}동 포함`:''}${buildingRows.length?'':' · 조건을 바꾸거나 초기화해 주세요.'}`;
    $('b-results').replaceChildren(...buildingRows.slice(0,buildingLimit).map(f=>{const p=f.properties,b=document.createElement('button');b.className='b-result';b.innerHTML=`${esc(p.nm||[p.rn,p.bn].filter(Boolean).join(' ')||p.d||'이름 없는 건물')}<small>${esc([p.d,p.rn,p.bn].filter(Boolean).join(' '))}<br>${esc(p.pu||'용도 미확인')} · ${p.yr?esc(p.yr)+'년':'연도 미확인'}${p.edge?' · 경계 확인':''}${p.inside===false?' · 범위 밖':''}</small>`;b.onclick=()=>{const ring=f.geometry.type==='MultiPolygon'?f.geometry.coordinates[0][0]:f.geometry.coordinates[0];map.easeTo({center:ring[0],zoom:18.5,duration:400});showBuilding(ring[0],p);};return b;}));
    $('b-more').hidden=buildingLimit>=buildingRows.length;
    $('b-filter-csv').disabled=$('b-field-csv').disabled=!buildingRows.length;
    $('b-groups').querySelectorAll('[data-group]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.group===group)));
    renderSelection();renderSelectionNote();
  }
  function buildingCondition(){return [insights.groups[$('b-building-group').value],$('b-only-candidate').checked?'공실 후보 조건':'',$('b-only-edge').checked?'경계 양쪽 20m':'',$('b-query').value.trim()?`검색: ${$('b-query').value.trim()}`:''].filter(Boolean).join(' / ');}
  function buildingFiltered(){return $('b-building-group').value!=='all'||$('b-query').value.trim()||$('b-only-candidate').checked||$('b-only-edge').checked;}
  function renderSelection(){
    if(!map.getSource('bs-selected'))return;
    const show=active&&!!buildingFiltered();
    map.getSource('bs-selected').setData(fc(show?buildingRows:[]));
    setVisibility('bs-selected-flat',show&&!is3d);setVisibility('bs-selected-3d',show&&is3d);
  }
  function renderSelectionNote(){
    if(!$('b-map-selection'))return;
    const selected=buildingFiltered()?`노란 건물: 조건 선택 ${buildingRows.length}동${buildingRows.some(f=>f.properties.inside===false)?' (범위 밖 포함)':''}`:'';
    const points=$('b-stores').checked?`민트 점: 선택한 등록점포 ${storeRows.length}개`:'';
    $('b-map-selection').textContent=[selected,points].filter(Boolean).join(' · ');
  }
  function renderStores(){
    storeRows=insights.filterStores(stores,{industry:$('b-industry').value,query:$('b-store-query').value});
    if($('b-industry').value||$('b-store-query').value.trim())$('b-stores').checked=true;
    $('b-store-status').textContent=`${$('b-industry').value||'전체 업종'} · 등록 ${storeRows.length}개 중 ${Math.min(storeLimit,storeRows.length)}개 표시${storeRows.length?'':' · 검색 결과가 없습니다.'}`;
    $('b-store-results').replaceChildren(...storeRows.slice(0,storeLimit).map(p=>{const b=document.createElement('button');b.className='b-result';b.innerHTML=`${esc(p.nm||'상호 미확인')}<small>${esc(p.S||p.M||p.L)}<br>${esc(p.rd||p.ad||'주소 미확인')}</small>`;b.onclick=()=>{map.easeTo({center:[p.lon,p.lat],zoom:18.5,duration:400});showStore([p.lon,p.lat],p);};return b;}));
    $('b-store-more').hidden=storeLimit>=storeRows.length;$('b-store-filter-csv').disabled=!storeRows.length;
    $('b-industry-bars').querySelectorAll('[data-industry]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.industry===$('b-industry').value)));
    renderStoreMap();renderSelectionNote();
  }
  function renderStoreMap(){
    if(!map.getSource('bs-stores'))return;
    map.getSource('bs-stores').setData(fc(storeRows.map(p=>({type:'Feature',geometry:{type:'Point',coordinates:[p.lon,p.lat]},properties:p}))));
    setVisibility('bs-stores',active&&$('b-stores').checked);
  }
  function showStore(ll,p){popup?.remove();popup=new maplibregl.Popup({maxWidth:'300px'}).setLngLat(ll).setHTML(`<div class="b-popup"><strong>${esc(p.nm||'상호 미확인')}</strong><p>${esc(p.L)} · ${esc(p.S||p.M||'')}</p><p>${esc(p.rd||p.ad||'주소 미확인')}</p><p>등록 위치 · 2026년 6월<br>현재 영업·이전 여부는 현장 확인 필요</p></div>`).addTo(map);}
  function exportStores(rows,name){downloadCSV([['원본번호','상호','주소','대분류','중분류','세부업종','등록층','경도','위도','자료기준','현재영업여부'],...rows.map(p=>[p.sid,p.nm,p.rd||p.ad,p.L,p.M,p.S,p.fl,p.lon,p.lat,'2026-06','현장 확인 필요'])],name);}
  function exportBrief(){
    const a=analysis,s=data.stats;
    download([`김해 B권역 ${areaLabel()} 분석 요약`,`범위: ${data.source} / 도면 ${num(data.printedArea)}㎡ / 계산 ${num(data.computedArea)}㎡`,`건물 ${a.total}동, 등록점포 ${stores.length}개`,`20년 이상 ${a.old20}동 / 연도 확인 ${a.known}동 = ${a.oldPct}% (2026년 기준)`,`40년 이상 ${a.counts.old40}동 / 연도 확인 ${a.known}동 = ${insights.pct(a.counts.old40,a.known)}%`,`연도 미확인 ${a.counts.unknown}동은 노후 비율에서 제외`,`주택 ${a.residential}동, 근린생활시설 ${a.neighborhood}동 (건물 주용도 기준)`,`소매·음식 ${a.foodRetail}개 / 등록점포 ${stores.length}개 = ${a.foodRetailPct}%`,'',...a.industries.map(([k,n])=>`${k}: ${n}개 (${insights.pct(n,stores.length)}%)`),'',`현장 공실 확인 후보 ${a.counts.candidate}동 (공실 확정 아님)`,`후보 중 경계 안쪽 확인 대상 ${a.candidateEdge}동 (중복 집계 주의)`,`B경계 안쪽 확인 대상 ${s.edgeInside}동 / 양쪽 20m 확인 대상 ${data.edgeBuildingIndices.length}동`,'','검토 제안: 오래된 건물 상태·공실 여부·보행 불편을 현장에서 함께 확인.','확인되지 않은 것: 실제 공실 수·공실률, 영업 여부, B권역에 맞는 인구·사업체 변화·유동인구.','건물 연도는 안전등급이 아니며, 등록점포는 현재 영업점 수가 아님.','경계는 도면 이미지에서 옮긴 검토선이며 측량 경계가 아님.','자료: 기존 환경분석맵 건물자료 / 상가정보 2026-06 / 연도 계산 2026.','위 수치는 B권역 전체 기준이며 화면 검색 조건과 무관.'].join('\n'),'김해_B권역_분석요약.txt','text/plain;charset=utf-8');
  }
  function showBuilding(ll,p){popup?.remove();popup=new maplibregl.Popup({maxWidth:'300px'}).setLngLat(ll).setHTML(`<div class="b-popup"><strong>${esc(p.nm||p.rn||p.bn||'건물 상세')}</strong><p>${esc(p.rn||p.d||'')} ${esc(p.bn||'')}</p><p>${esc(p.pu||'용도 미확인')} · ${p.yr?esc(p.yr)+'년':'연도 미확인'} · ${esc(p.fl||'?')}층</p><p>${esc(labels[p.cl]||'미분류')} · 연결점포 ${esc(p.sc||0)}개</p><p>${p.inside===false?'B권역 밖 · 참고용':'B권역 집계 포함'}${p.edge?' / 경계 주변: 포함 여부 확인 필요':''}</p><p>등록정보만으로 실제 영업·공실을 확정할 수 없습니다.</p></div>`).addTo(map);}
  function download(content,name,type){const url=URL.createObjectURL(content instanceof Blob?content:new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);$('b-export-status').textContent=name+' 내려받기를 요청했습니다.';}
  function downloadCSV(rows,name){const cell=v=>{let s=String(v??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};download('\ufeff'+rows.map(r=>r.map(cell).join(',')).join('\r\n'),name+'.csv','text/csv;charset=utf-8');}
  function exportBuildings(rows,name){downloadCSV([['원본번호','건물명','도로명','건물번호','법정동','용도','사용승인연도','층수','연결점포수','확인분류','B권역포함','경계주변확인'],...rows.map(f=>{const p=f.properties;return [p.bidx,p.nm,p.rn,p.bn,p.d,p.pu,p.yr||'',p.fl,p.sc,labels[p.cl],p.inside===false?'아니오':'예',p.edge?'필요':''];})],name);}
  function shot(){
    if(!active)return;
    if(map.isMoving()){map.once('moveend',shot);return;}
    $('b-export-status').textContent='그림을 만들고 있습니다…';
    map.once('render',()=>{try{
      const src=map.getCanvas(),c=document.createElement('canvas'),width=Math.max(960,src.width),height=Math.round(src.height*width/src.width),footer=285;
      c.width=width;c.height=height+footer;const ctx=c.getContext('2d');ctx.drawImage(src,0,0,width,height);
      ctx.fillStyle='#101923';ctx.fillRect(0,height,width,footer);ctx.fillStyle='#fff';ctx.font='bold 24px sans-serif';
      ctx.fillText(`김해 B권역 ${areaLabel()} · 검토용`,24,height+34);ctx.font='18px sans-serif';
      ctx.fillText(`B권역 전체: 건물 ${data.stats.buildings}동 / 등록점포 ${data.stats.stores}개 / 20년 이상 ${data.stats.oldPct}% (연도 확인 기준)`,24,height+64);
      ctx.fillStyle='#ffb49f';ctx.fillText('이미지에서 옮긴 임시 경계 · 경계 주변 건물 포함 여부 확인 필요',24,height+93);
      ctx.font='15px sans-serif';let x=24,y=height+126;
      for(const item of $('b-legend').children){const label=item.textContent,w=ctx.measureText(label).width+38;if(x+w>width-24){x=24;y+=25;}ctx.fillStyle=item.querySelector('i').style.background;ctx.fillRect(x,y-12,12,12);ctx.fillStyle='#ecf2f9';ctx.fillText(label,x+18,y);x+=w;}
      ctx.fillStyle='#cad7e4';
      const overlays=['민트 점선: B권역','파란선: 기존 사업구역'];if(buildingFiltered())overlays.push(`노란 건물: 조건 ${buildingRows.length}동`);if($('b-review').checked)overlays.push('노란 테두리: 경계 주변');if($('b-stores').checked)overlays.push(`민트 점: 등록 ${storeRows.length}개`);if($('b-roads').checked)overlays.push('주황선: 도로');if($('b-wifi').checked)overlays.push('회색 점: 와이파이');
      let overlayLine='',overlayY=height+175;
      for(const label of overlays){const next=overlayLine?overlayLine+' · '+label:label;if(ctx.measureText(next).width>width-48){ctx.fillText(overlayLine,24,overlayY);overlayY+=20;overlayLine=label;}else overlayLine=next;}
      ctx.fillText(overlayLine,24,overlayY);
      ctx.font='13px sans-serif';ctx.fillText(`건물 조건: ${buildingCondition()} / 점포: ${$('b-industry').value||'전체 업종'}${$('b-store-query').value.trim()?' · 검색 '+$('b-store-query').value.trim():''}`,24,height+225,width-48);
      ctx.fillText(`자료: 기존 환경분석맵 / 상가정보 2026.06 / 구역계검토자료 ${data.sourcePage}쪽 · 2026년 기준`,24,height+247);
      const backgroundCredit=map.getLayoutProperty('sat','visibility')==='none'?'© OpenStreetMap contributors · openstreetmap.org/copyright':'Esri World Imagery';
      ctx.fillText('배경지도: '+backgroundCredit,24,height+270,width-48);
      c.toBlob(blob=>{if(blob)download(blob,'김해_B권역_검토지도.png','image/png');else $('b-export-status').textContent='그림 저장 실패. 다시 시도해 주세요.';},'image/png');
    }catch(e){$('b-export-status').textContent='그림 저장 실패: '+e.message;}});map.triggerRepaint();
  }
  function initialize(){
    const edge=new Set(data.edgeBuildingIndices);
    buildings=data.buildingIndices.map(i=>({...D.bld.features[i],properties:{...D.bld.features[i].properties,bidx:i,inside:true,edge:edge.has(i)}}));
    stores=data.storeIndices.map(i=>({...D.store[i],sid:i}));
    const verify=buildings.filter(f=>f.properties.yr>0),old=verify.filter(f=>f.properties.yr<=2006);
    if(buildings.length!==data.stats.buildings||stores.length!==data.stats.stores||verify.length!==data.stats.knownYear||old.length!==data.stats.old20)throw Error('원본 자료와 B권역 집계가 다릅니다. 표시 중단.');
    renderPanel();
    const included=new Set(data.buildingIndices);
    addSource('bs-context',fc(D.bld.features.filter((_,i)=>!included.has(i))));
    addLayer({id:'bs-context-flat',type:'fill',source:'bs-context',paint:{'fill-color':colors,'fill-opacity':.55}});
    addLayer({id:'bs-context-3d',type:'fill-extrusion',source:'bs-context',paint:{'fill-extrusion-color':colors,'fill-extrusion-opacity':1,'fill-extrusion-height':['*',['max',['coalesce',['get','fl'],1],1],3.3]}});
    addSource('bs-buildings',fc(buildings));addSource('bs-boundary',data.boundary);addSource('bs-review',fc(reviewBuildings()));addSource('bs-roads',data.roads);addSource('bs-wifi',WIFIPT);
    addSource('bs-stores',fc(stores.map(p=>({type:'Feature',geometry:{type:'Point',coordinates:[p.lon,p.lat]},properties:p}))));
    addSource('bs-compare',fc(ZP.features.filter(f=>f.properties.k==='blue')));
    const hole=data.boundary.geometry.coordinates[0];addSource('bs-mask',{type:'Feature',geometry:{type:'Polygon',coordinates:[[[128.7,35.1],[129.1,35.1],[129.1,35.4],[128.7,35.4],[128.7,35.1]],hole.slice().reverse()]},properties:{}});
    // Same outside dimming as the original map, with only the accepted B boundary cut out.
    addLayer({id:'bs-mask',type:'fill',source:'bs-mask',paint:{'fill-color':'#05070b','fill-opacity':.34}});
    addLayer({id:'bs-flat',type:'fill',source:'bs-buildings',paint:{'fill-color':colors,'fill-opacity':.88,'fill-outline-color':'#222d3b'}});
    addLayer({id:'bs-3d',type:'fill-extrusion',source:'bs-buildings',paint:{'fill-extrusion-color':colors,'fill-extrusion-opacity':.95,'fill-extrusion-height':['*',['max',['coalesce',['get','fl'],1],1],3.3]}});
    addLayer({id:'bs-compare',type:'line',source:'bs-compare',paint:{'line-color':'#64afff','line-width':2,'line-dasharray':[3,2]}});
    // Shared emphasis in overview and detail: tint + halo + dark separation + mint edge.
    // These are visual review boundaries, never survey lines or new building classifications.
    addLayer({id:'bs-boundary-fill',type:'fill',source:'bs-boundary',paint:{'fill-color':'#52ffcb','fill-opacity':.16}});
    addLayer({id:'bs-boundary-glow',type:'line',source:'bs-boundary',paint:{'line-color':'#50ffca','line-width':30,'line-blur':9,'line-opacity':.85}});
    addLayer({id:'bs-boundary-case',type:'line',source:'bs-boundary',paint:{'line-color':'#032820','line-width':15,'line-opacity':1}});
    addLayer({id:'bs-boundary-line',type:'line',source:'bs-boundary',paint:{'line-color':'#59ffd1','line-width':8,'line-opacity':1}});
    addLayer({id:'bs-boundary-highlight',type:'line',source:'bs-boundary',paint:{'line-color':'#f1fff9','line-width':2.5,'line-dasharray':[3,2],'line-opacity':1}});
    addLayer({id:'bs-roads',type:'line',source:'bs-roads',paint:{'line-color':'#ffcd74','line-width':3}});
    addLayer({id:'bs-review',type:'line',source:'bs-review',paint:{'line-color':'#ffde47','line-width':2}});
    addSource('bs-selected',fc([]));
    addLayer({id:'bs-selected-flat',type:'fill',source:'bs-selected',paint:{'fill-color':'#ffdc72','fill-opacity':.95,'fill-outline-color':'#fff5cf'}});
    addLayer({id:'bs-selected-3d',type:'fill-extrusion',source:'bs-selected',paint:{'fill-extrusion-color':'#ffdc72','fill-extrusion-opacity':.95,'fill-extrusion-height':['+',['*',['max',['coalesce',['get','fl'],1],1],3.3],.5]}});
    addLayer({id:'bs-stores',type:'circle',source:'bs-stores',paint:{'circle-color':'#7de5ca','circle-radius':4,'circle-stroke-width':1,'circle-stroke-color':'#082d2b'}});
    addLayer({id:'bs-wifi',type:'circle',source:'bs-wifi',paint:{'circle-color':'#bfcede','circle-radius':6,'circle-stroke-color':'#fff','circle-stroke-width':1}});
    ownIds.forEach(id=>setVisibility(id,false));
    // A focus action on the original map must not switch analysis scopes.
    const focusButton=document.createElement('button');focusButton.id='focus-b-area';focusButton.className='zf';
    focusButton.textContent=`B권역 ${areaLabel()}`;
    focusButton.onclick=()=>{popup?.remove();showBoundary();frame(450,true);};
    $('focusbx').append(focusButton);
    // The scope switch stays unscaled; offset the zoomed sticky navigation by its real height.
    new ResizeObserver(()=>panel.style.setProperty('--b-scope-height',switcher.getBoundingClientRect().height+'px')).observe(switcher);
    ready=true;$('scope-b').disabled=false;$('scope-b').textContent='B권역 상세 분석';$('scope-b').onclick=()=>switchScope(true);$('scope-old').onclick=()=>{switchScope(false);frame(350);};
    const label=document.createElement('div');label.className='b-location-label';label.innerHTML=`<b>B권역 <em>${areaLabel()}</em></b><span>도면 ${data.sourcePage}쪽 · 검토 경계</span>`;
    const ring=data.boundary.geometry.coordinates[0],anchor=ring.reduce((a,p)=>p[1]>a[1]?p:a,ring[0]);
    new maplibregl.Marker({element:label,anchor:'bottom',offset:[0,-10]}).setLngLat(anchor).addTo(map);
    // Newly added legacy layers are hidden and remembered, without changing their data.
    let queued=false;map.on('styledata',()=>{if(active&&!queued){queued=true;queueMicrotask(()=>{queued=false;isolate();});}});
    map.on('click',e=>{if(!active)return;const f=map.queryRenderedFeatures(e.point,{layers:['bs-stores','bs-selected-3d','bs-selected-flat','bs-review','bs-3d','bs-flat','bs-wifi']})[0];if(!f)return;const p=f.properties;if(f.layer.id==='bs-stores')showStore(e.lngLat,p);else if(f.layer.id==='bs-wifi'){popup?.remove();popup=new maplibregl.Popup().setLngLat(e.lngLat).setHTML(`<div class="b-popup"><strong>${esc(p.n)}</strong><p>주변 참고 지점 · B권역 집계 제외</p></div>`).addTo(map);}else showBuilding(e.lngLat,p);});
    document.body.dataset.bSourcePage=String(data.sourcePage);document.body.dataset.bArea=areaLabel();document.body.dataset.bBuildings=String(buildings.length);document.body.dataset.bStores=String(stores.length);document.body.dataset.bReady='true';
    const detailRequested=new URLSearchParams(location.search).get('scope')==='b171';
    if(detailRequested)switchScope(true);else{document.body.dataset.analysisScope='legacy';showBoundary();frame(0);}
  }
  window.GimhaeB={get active(){return active;},frame,shot};
  fetch('data/gimhae-b171.json?v=page5-r1').then(r=>{if(!r.ok)throw Error('경계 자료를 불러오지 못했습니다');return r.json();}).then(async d=>{
    data=d;
    if(d.sourcePage!==5||d.printedArea!==156000)throw Error('새 경계 자료와 화면 버전이 다릅니다. 새로고침해 주세요.');
    // Verify index data against the immutable embedded source before using it.
    const raw=new TextEncoder().encode($('dat').textContent);
    const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',raw)),v=>v.toString(16).padStart(2,'0')).join('');
    if(digest!==data.embeddedDataSHA256)throw Error('원본 자료가 변경되었습니다. B권역 재계산 필요.');
    if(!data.buildingIndices.length||D.bld.features.length!==10065)throw Error('원본 건물 자료가 변경되었습니다. B권역 재계산 필요.');
    const start=Date.now();await new Promise((resolve,reject)=>{const timer=setInterval(()=>{if(map.getLayer('bld-3d')&&window.__LATE){clearInterval(timer);resolve();}else if(Date.now()-start>45000){clearInterval(timer);reject(Error('지도 준비 시간을 초과했습니다. 새로고침해 주세요.'));}},150);});
    initialize();
  }).catch(e=>{$('scope-status').textContent='B권역 표시 실패: '+e.message;$('scope-b').textContent='B권역 확인 필요';document.body.dataset.bReady='error';console.error(e);});
})();
