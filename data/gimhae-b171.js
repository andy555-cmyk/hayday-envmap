/* 확정 구역계(1안, 2026-10-30)는 별도 계산 결과(data/gimhae-zone-261030.json)를 사용한다. 옛 확정 구역계(10/11) 자료 data/gimhae-zone-261011.json 은 회색 점선 비교로만 남긴다. 원본 D·D2·S 및 기존 분석은 변경하지 않는다.
   파일 이름·id(b171, b-*, bs-*)는 9/30 B권역 때의 호환 이름이며 면적과 무관하다. 9/30 B권역 검토선은 비교선으로만 남긴다. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = v => Number(v).toLocaleString('ko-KR');
  const areaLabel = () => (data.area/10000).toFixed(1)+'ha';
  const haLabel = m2 => (m2/10000).toFixed(1)+'ha';
  const fc = features => ({type:'FeatureCollection',features});
  const NAME='확정 구역계(1안)';
  const chk=id=>!!$(id)?.checked;
  const DATE=()=>data.confirmed;
  const sitesIn=()=>data.sites.filter(t=>t.inside),sitesOut=()=>data.sites.filter(t=>!t.inside);
  const sitesLine=()=>`13곳 중 ${sitesIn().length}곳 구역 안 · ${sitesOut().length}곳(${sitesOut().map(t=>t.rank+'번').join('·')}) 구역 밖(재배치 검토 중)`;
  // 방 ⑦ 재수집이 끝나기 전 자료 칸 — 옛 구역 숫자를 보여 주지 않는다.
  const pendingBox=(id,title,keys)=>`<section id="${id}" class="b-reading b-pending"><h3>${title}</h3><article><span>새 구역계(1안)로 다시 모으는 중</span><strong>새 구역 재수집 중</strong><p>${keys.map(k=>esc(data.pending?.[k]||k)).join(' · ')} — ${esc(data.pendingNote||'구역 안 자료를 새 경계로 다시 모은 뒤 반영합니다')}. 옛 확정 구역계(10/11) 숫자는 범위가 달라 쓰지 않습니다.</p></article></section>`;
  const switcher = document.createElement('div'); switcher.id='scope-switch';
  switcher.innerHTML='<div class="scope-label">기존 지도에 확정 구역계(1안 · 10/30) 함께 보기</div><div class="scope-buttons"><button id="scope-old" aria-pressed="true">전체 · 구역계 함께 보기</button><button id="scope-b" disabled aria-pressed="false">확정 구역계 불러오는 중</button></div><div id="scope-status" role="status"></div>';
  $('detail').prepend(switcher);
  const panel=document.createElement('section');panel.id='b-panel';$('detail').append(panel);
  const overview=document.createElement('section');overview.id='b-overview';switcher.after(overview);
  const caption=document.createElement('div');caption.id='b-map-caption';document.body.append(caption);
  let surveyOn=new Set(), ctx, data, buildings, stores, active=false, ready=false, mode='old', is3d=true, savedView, popup;
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
  const SITE_COLOR='#ff4d4d', PREV_B='#ffa36b', PREV_N1='#c9a7ff';
  const roleLabel={거점:'거점',방문객:'방문객용 공간',창작:'개인 창작 공간 후보'};
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
    // Start with the existing business district (blue) AND the confirmed boundary, never a detached crop.
    // The 221ha black district made the confirmed zone a corner detail (2026-10-13), so it is no longer part of the first view.
    if(!closeup)ZP.features.filter(f=>f.properties.k==='blue').forEach(f=>coords.push(...f.geometry.coordinates[0]));
    const xs=coords.map(p=>p[0]),ys=coords.map(p=>p[1]);
    const viewport=map.getContainer().getBoundingClientRect(),rect=$('detail').getBoundingClientRect();
    const mobile=innerWidth<=820, panelVisible=rect.width>0&&rect.height>0;
    // Padding is relative to the MAP, not the browser. Desktop already excludes the sidebar.
    const coveredLeft=!mobile&&panelVisible?Math.max(0,rect.right-viewport.left):0;
    const coveredBottom=mobile&&panelVisible?Math.max(0,viewport.bottom-Math.max(rect.top,viewport.top)):0;
    // The overview legend sits on the map's lower left; keep the boundary clear of it on desktop.
    const legend=$('lgd')?.getBoundingClientRect(),legendOn=!!(legend&&legend.width>0&&legend.height>0);
    const legendLeft=!mobile&&legendOn?Math.max(0,legend.right-viewport.left-coveredLeft):0;
    // On phones the legend sits at the top of the map: start the fit below it.
    const legendTop=mobile&&legendOn?Math.max(0,Math.min(legend.bottom,viewport.bottom)-viewport.top):0;
    const side=Math.max(28,(viewport.width-coveredLeft-legendLeft)*.12);
    const visibleHeight=Math.max(120,viewport.height-coveredBottom-legendTop);
    const vertical=Math.max(28,visibleHeight*.12);
    map.fitBounds([[Math.min(...xs),Math.min(...ys)],[Math.max(...xs),Math.max(...ys)]],{
      padding:{left:coveredLeft+legendLeft+side,right:side,top:legendTop+vertical,bottom:coveredBottom+vertical},
      pitch:is3d?30:0,bearing:0,duration,maxZoom:17.4
    });
  }
  function switchScope(on){
    if(on&&!ready)return;
    if(on===active)return;
    popup?.remove();
    if(on){savedView={center:map.getCenter(),zoom:map.getZoom(),pitch:map.getPitch(),bearing:map.getBearing(),padding:map.getPadding()};visibility=new Map();}
    active=on;document.body.classList.toggle('b-active',on);document.body.dataset.analysisScope=on?'zone1an':'legacy';
    $('scope-b').setAttribute('aria-pressed',String(on));$('scope-old').setAttribute('aria-pressed',String(!on));
    if(on){isolate();renderLayers();document.title=`김해 ${NAME} ${areaLabel()} · 환경분석맵`;frame(0);}
    else {ownIds.forEach(id=>setVisibility(id,false));visibility.forEach((v,id)=>{if(map.getLayer(id))map.setLayoutProperty(id,'visibility',v);});document.title=previousTitle;if(savedView)map.jumpTo(savedView);showBoundary();frame(0);}
  }
  function showBoundary(){['bs-boundary-fill','bs-boundary-glow','bs-boundary-case','bs-boundary-line','bs-boundary-highlight'].forEach(id=>setVisibility(id,true));}
  function renderLayers(){
    if(!active)return;
    ownIds.forEach(id=>setVisibility(id,true));
    setVisibility('bs-mask',true);
    setVisibility('bs-flat',!is3d);setVisibility('bs-3d',is3d);
    setVisibility('bs-context-flat',!is3d);setVisibility('bs-context-3d',is3d);
    setVisibility('bs-stores',chk('b-stores'));setVisibility('bs-roads',chk('b-roads'));
    setVisibility('bs-review',chk('b-review'));setVisibility('bs-compare',chk('b-compare'));
    setVisibility('bs-prev-zonek',chk('b-prev'));
    setVisibility('bs-wifi',chk('b-wifi'));setVisibility('bs-gates',chk('b-gates'));setVisibility('bs-closed',chk('b-closed'));setVisibility('bs-vanished',chk('b-vanished'));setVisibility('bs-iso',chk('b-iso'));setVisibility('bs-iso-line',chk('b-iso'));setVisibility('bs-loop',chk('b-loop'));setVisibility('bs-tour',chk('b-tour'));if(data.rone)setVisibility('bs-rone',$('b-rone').checked);if(data.sbizZone?.items?.length)setVisibility('bs-sbizzone',$('b-sbizzone').checked);if(data.heritage){setVisibility('bs-heritage',$('b-heritage').checked);setVisibility('bs-heritage-line',$('b-heritage').checked);}if(data.landUse537)setVisibility('bs-hazard',$('b-hazard').checked);if(data.archPms)setVisibility('bs-archpms',$('b-archpms').checked);
    setVisibility('bs-sites',$('b-sites-on').checked);setVisibility('bs-sites-ring',$('b-sites-on').checked);
    renderSelection();
    renderStoreMap();
    const color=mode==='old'?colors:mode==='candidate'?classColor:['match',['get','pu'],'단독주택','#ab8bed','공동주택','#7487d8','제1종근린생활시설','#e8ab6d','제2종근린생활시설','#ee875e','숙박시설','#68bbc8','#8295a8'];
    map.setPaintProperty('bs-flat','fill-color',color);map.setPaintProperty('bs-3d','fill-extrusion-color',color);
    const legend=mode==='old'?ageLegend:mode==='candidate'?[['#ef6161','현장 확인 후보'],['#ab8bed','주거'],['#64a1cd','비점포'],['#8a95a5','용도 미확인'],['#68ba93','등록점포 연결']]:[['#ab8bed','단독주택'],['#7487d8','공동주택'],['#e8ab6d','제1종 근생'],['#ee875e','제2종 근생'],['#68bbc8','숙박'],['#8295a8','기타']];
    $('b-legend').innerHTML=legend.map(([c,t])=>`<span><i class="b-dot" style="background:${c}"></i>${t}</span>`).join('');
    const lines=['민트 선: 확정 구역계(1안 · 10/30)'];
    if($('b-sites-on').checked)lines.push('빨간 점: 시 우선순위 13곳 중 구역 안 · 회색 점: 구역 밖(재배치 검토 중)');
    if($('b-compare').checked)lines.push('파란 점선: 기존 사업구역 51.8ha');
    if(chk('b-prev'))lines.push('회색 점선: 옛 확정 구역계(10/11) 참고');
    if(surveyOn.size)lines.push('지번 점(전수조사 1차): '+[...surveyOn].sort().map(k=>k+' '+data.survey.labels[k]).join(' · ')+' — 빨강 A·주황 B·보라 C·파랑 D·회색 E');
    if(chk('b-iso'))lines.push('하늘색 면: 3역 10분 도보권');if(chk('b-loop'))lines.push('흰 점선: 13곳 한 바퀴');if(chk('b-tour'))lines.push('보라 선: 역→관광지 최단 길');
    if(data.rone&&$('b-rone').checked)lines.push('노란 점선: 부동산원 표본 상권');
    if(data.sbizZone?.items?.length&&$('b-sbizzone').checked)lines.push('주황 점선: 소진공 주요 상권');
    if(data.heritage&&$('b-heritage').checked)lines.push('갈색: 국가유산 구역(진할수록 지정구역)');
    if(data.landUse537&&$('b-hazard').checked)lines.push('하늘색 점: 자연재해위험개선지구 지번');
    if(data.archPms&&$('b-archpms').checked)lines.push('인허가 지번(2016~): 분홍 신축 · 보라 용도변경 · 청록 증축 · 노랑 대수선 · 회색 구분 미기재');
    if(chk('b-closed'))lines.push('분홍 테두리: 인허가 폐업 신호');if(chk('b-vanished'))lines.push('회색 점: 상가정보에서 사라진 점포');
    caption.innerHTML=`<b>지금 보고 있는 것 — ${mode==='old'?'노후도 (기존 지도와 같은 색)':mode==='candidate'?'현장 확인 후보':'건물 용도'}</b><div class="b-map-legend">${$('b-legend').innerHTML}</div><span>${NAME} ${areaLabel()} · 건물 ${num(data.stats.buildings)}동 · 등록점포 ${num(data.stats.stores)}개</span><div id="b-map-selection"></div><div class="b-caption-note">${lines.join(' · ')}<br>주변 건물은 위치 참고 · 구역 집계와 별도</div>`;
    renderSelectionNote();
  }
  const table=obj=>'<table>'+Object.entries(obj).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${num(v)}</td></tr>`).join('')+'</table>';
  const siteLine=s=>[s.type,roleLabel[s.role]||s.role,s.state].filter(Boolean).join(' · ');
  function contextSection(){
    if(!ctx)return pendingBox('b-context','도로·교통·생활 기반 — 확정 구역계(1안)',['context','terrain','gateLoad','tms','rone','sbizZone','heritage','landUse537','rtms','archPms']);
    const r=ctx.roads,g=ctx.gates,sd=ctx.storeDistance,bus300=ctx.bus.within300,busSum=bus300.reduce((n,b)=>n+b.daily,0);
    const pop=Object.entries(ctx.population).map(([k,v])=>`${esc(k)} ${num(v.total)}명(65세 이상 ${v.agingPct}%)`).join(' · ');
    return `<section id="b-context" class="b-reading"><h3>도로·교통·생활 기반 — 확정 구역계(1안)로 다시 계산</h3>
      <article><span>01 · 구역 안 도로</span><strong>차량 도로 ${num(r.totalM)}m 중 소로(골목) ${r.sharePct['소로']}%</strong><p>대로 ${num(r.byTier['대로'])}m · 중로 ${num(r.byTier['중로'])}m · 소로 ${num(r.byTier['소로'])}m. 대로는 남서쪽 끝에서 김해대로가 경계에 닿을 뿐 구역 안을 지나지 않습니다.</p></article>
      <article><span>02 · 진출입구</span><strong>${num(g.total)}곳 — 대로 ${g.byTier['대로']} · 중로 ${g.byTier['중로']} · 골목 ${g.byTier['소로']}</strong><p>경계선과 차량 도로가 만나는 점을 30m 안에서 하나로 묶은 수입니다.</p></article>
      <article><span>03 · 점포에서 큰길까지</span><strong>등록점포 ${num(sd.n)}곳 중 ${num(sd.bands['100m 밖'])}곳이 대로·중로에서 100m 넘게 안쪽</strong><p>50m 안 ${num(sd.bands['50m 안'])} · 50~100m ${num(sd.bands['50~100m'])} · 100m 밖 ${num(sd.bands['100m 밖'])} · 중간값 ${num(sd.medianM)}m (직선거리)</p></article>
      <article><span>04 · 경전철·버스</span><strong>${ctx.rail.map(t=>`${esc(t.name)}역 ${num(t.distM)}m`).join(' · ')}</strong><p>경계에서 역까지 직선거리 · 하루 승하차 ${ctx.rail.map(t=>`${esc(t.name)} ${num(t.daily)}명`).join(' · ')}. 버스 정류장은 구역 안 ${ctx.bus.inside.length}곳, 경계 300m 안 ${bus300.length}곳(일평균 이용 합 ${num(busSum)}명).</p></article>
      <article><span>05 · 생활·안전 시설</span><strong>${Object.entries(ctx.safe).slice(0,3).map(([k,v])=>`${esc(k)} ${num(v)}`).join(' · ')}</strong><p>${Object.entries(ctx.safe).slice(3).map(([k,v])=>`${esc(k)} ${num(v)}`).join(' · ')||'그 밖 없음'} — 이 지도의 생활·안전 시설 자료 기준이며 실제보다 적게 잡혔을 수 있습니다.</p></article>
      <article><span>06 · 인구 (법정동 전체 · 구역만의 값 아님)</span><strong>${pop}</strong><p>구역 안 건물은 대부분 봉황동(${num(data.stats.dongs['봉황동']||0)}동)입니다. 등록점포 주소의 행정동은 ${Object.entries(ctx.storeAdong).map(([k,v])=>`${esc(k)} ${num(v)}`).join(' · ')}곳입니다.</p></article>
      <article><span>07 · 땅값 (참고)</span><strong>시 13곳 공시지가 ${num(Math.min(...data.sites.map(t=>t.officialPrice.wonPerM2)))}~${num(Math.max(...data.sites.map(t=>t.officialPrice.wonPerM2)))}원/㎡ (2026년 1월)</strong><p>실거래 ㎡당 중간값(${esc(data.landPrice.trades.period)}, 법정동 전체): ${data.landPrice.medians.map(m=>`${esc(m.dong)} ${esc(m.type)} ${num(Math.round(m.wonPerM2/10000))}만 원(${m.n}건)`).join(' · ')}. 지번 일부가 가려져 구역 안 거래만 따로 셀 수 없습니다.</p></article>
      ${data.terrain?`<article><span>08 · 땅 모양</span><strong>해발 ${data.terrain.elevMin}~${data.terrain.elevMax}m(평균 ${data.terrain.elevMean}m) · 경사 5° 이하 ${data.terrain.flatPct}%</strong><p>거의 평지라 걷기에는 부담이 적습니다. 8월 현장에서 「비 오면 물 찹니다」라는 의견이 있어 배수시설·침수 이력은 따로 확인이 필요합니다(이 자료로는 원인을 알 수 없음). ${esc(data.terrain.caveat.split(' · ')[0])}.</p></article><article><span>09 · 땅과 건물의 짜임</span><strong>필지 ${num(data.terrain.parcels)}개 · 중간값 ${num(data.terrain.parcelMedianM2)}㎡ · 3층 이하 건물 ${data.terrain.lowPct}%</strong><p>평균 ${data.terrain.floorsMean}층(최고 ${data.terrain.floorsMax}층) · 건폐율 ${data.terrain.bcrPct}% · 지정 공원·녹지 ${data.terrain.parkHa}ha · 용도지역 ${Object.entries(data.terrain.zoningPct).map(([k,v])=>`${esc(k.replace('일반',''))} ${v}%`).join(' · ')} · 2026-12-22 지면 일조 모의계산 평균 ${data.terrain.winterSunMean}시간(평지 가정·수목·담장·화면 밖 건물 그림자 제외, 법정 일조권 검토 아님). 작은 필지에 낮은 건물이 빽빽한 골목형 구역입니다.</p></article>`:''}
      ${data.gateLoad?`<article><span>10 · 입구 하나가 맡는 점포</span><strong>가장 많은 입구 ${esc(data.gateLoad.list[0].name)} ${num(data.gateLoad.list[0].stores)}곳 · 상위 3곳이 ${data.gateLoad.top3Share}%</strong><p>${data.gateLoad.list.slice(0,6).map(g=>`${esc(g.name)}(${esc(g.tier)}) ${num(g.stores)}`).join(' · ')} — 등록점포가 배정된 입구 ${data.gateLoad.used}곳/${data.gateLoad.gates}곳. ${esc(data.gateLoad.method)}. ${esc(data.gateLoad.note)}.</p></article>`:''}
      ${data.tms?`<article><span>11 · 차량 교통량 조사지점</span><strong>구역 안 0곳 · 경계 1km 안 ${data.tms.within1km}곳</strong><p>${data.tms.nearest.slice(0,2).map(t=>`${esc(t.road)} ${esc(t.route)}호선 ${esc(t.section)} — 구역 경계까지 직선 ${num(t.distM)}m, 하루 ${num(t.aadt)}대`).join(' · ')} (${esc(data.tms.source)}). ${esc(data.tms.note)}.</p></article>`:''}
      ${data.rone?`<article><span>12 · 부동산원 공실률 표본 상권과 겹침</span><strong>「${esc(data.rone.market)}」 상권과 겹치는 면적 ${data.rone.overlapPct}% (약 ${(data.rone.overlapM2/10000).toFixed(1)}ha)</strong><p>이전 사업구역(51.8ha)은 상권 도형과 ${data.rone.oldOverlapPct}% 겹쳐 그 상권의 소규모상가 공실률 ${data.rone.latest.smallVacancyPct}%(${esc(data.rone.latest.quarter)})를 지표로 썼습니다(상권 표본 건물의 값). 확정 구역계는 북동쪽 일부만 겹쳐(등록점포 ${num(data.rone.storesIn)}/${num(data.stats.stores)}곳 · 건물 ${num(data.rone.bldIn)}/${num(data.stats.buildings)}동 · 시 13곳 중 ${data.rone.sitesIn.map(n=>n+'번').join('·')||'없음'}) <b>구역 공실률로 쓰면 안 되고 주변 상권 참고값</b>입니다. 김해의 다른 표본 상권(${data.rone.others.map(o=>esc(o.name)).join(' · ')})은 집합상가만 조사합니다. 공식 통계표의 상권 코드 ${esc(data.rone.code)}.</p><button id="b-rone-toggle">상권 경계 지도에 표시</button></article>`:''}
      ${data.sbizZone?.items?.length?`<article><span>13 · 소상공인시장진흥공단 「주요 상권」 영역과 겹침</span><strong>「${esc(data.sbizZone.items[0].name)}」 상권과 구역의 ${data.sbizZone.items[0].zonePct}%(약 ${(data.sbizZone.items[0].overlapM2/10000).toFixed(1)}ha)가 겹침</strong><p>소진공이 점포가 모인 곳으로 그은 상권 영역(${num(data.sbizZone.items[0].areaM2)}㎡, 자료 제공값)의 ${data.sbizZone.items[0].marketPct}%가 확정 구역계 안입니다. 김해시 상권 영역 ${data.sbizZone.checked}곳 중 구역과 겹치는 곳은 ${data.sbizZone.items.length}곳. ${esc(data.sbizZone.note)}. 출처: ${esc(data.sbizZone.source)}.</p><button id="b-sbizzone-toggle">상권 영역 지도에 표시</button></article>`:''}
      ${data.heritage?`<article><span>14 · 국가유산 「${esc(data.heritage.name)}」(${esc(data.heritage.designation)}, ${esc(data.heritage.designatedDate.slice(0,4))} 지정)</span><strong>모든 개발 금지가 아님 — 구역의 ${data.heritage.unionPct}%가 세 공개 도형 중 하나와 겹치고, 그중 대부분(구역의 ${data.heritage.layers.find(l=>/허용기준/.test(l.name))?.overlapPct}%)은 기준 안에서 건축이 되는 현상변경 허용기준 구역</strong><p>${data.heritage.layers.map(l=>`${esc(l.name)} ${l.overlapPct}%`).join(' · ')} — 허용기준 구역별: ${data.heritage.subZones.map(z=>`${esc(z.name)} ${z.zonePct}%${z.rule?`(${esc(z.rule)})`:''}`).join(' · ')}. ${esc(data.heritage.note)}. 출처: ${esc(data.heritage.source)}.</p><button id="b-heritage-toggle">국가유산 구역 지도에 표시</button></article>`:''}
      ${data.timeline?`<article><span>15 · 봉리단길·원도심 연표 (기사·사업·고시 ${data.timeline.events.length}건)</span><strong>${(data.timeline.key||[]).map(i=>data.timeline.events[i]).map(e=>`${esc(String(e.date).slice(0,7))} ${esc(e.title)}`).join(' → ')}</strong><p>검색 관심(네이버 데이터랩 「${esc(data.timeline.trend.keyword)}」, 2018년 5월 = 100): ${data.timeline.trend.annual.filter(a=>a.value!=null).map(a=>`${a.year} ${Math.round(a.value)}`).join(' · ')}. 연표 전체는 「연표 받기」로 내려받습니다. 출처: ${esc(data.timeline.source)}.</p><button id="b-timeline-csv">연표 받기</button></article>`:''}
      ${data.landUse537?(()=>{const L=data.landUse537,P=L.price;return `<article><span>16 · 토지 규제·공시지가 — 구역 지번 ${num(L.target)}곳 중 ${num(L.done)}곳 열람${L.partial?' (수집 중 일부)':''}</span><strong>역사문화환경보존지역 ${L.heritagePct}% · 중점경관관리구역 ${L.landscapePct}% · 자연재해위험개선지구 ${num(L.hazard.count)}곳(${L.hazard.pct}%)</strong><p>지목: ${Object.entries(L.jimok).slice(0,4).map(([k,v])=>esc(k)+' '+num(v)).join(' · ')} · 용도지역: ${Object.entries(L.zoning).slice(0,4).map(([k,v])=>esc(k.replace(/\(.*\)/,''))+' '+num(v)).join(' · ')} · 도시계획도로: 저촉 ${num(L.road['저촉']||0)} · 접합만 ${num(L.road['접합만']||0)} · 없음 ${num(L.road['없음']||0)}.<br>개별공시지가(${esc(P.ym)}) ㎡당 중간값 ${num(P.median)}원(가운데 절반 ${num(P.q1)}~${num(P.q3)}원) · 봉황대길 30m 안 ${num(P.band30)}원(${num(P.bandN)}지번) / 밖 ${num(P.off30)}원 · 법정동별 ${Object.entries(P.byDong).map(([d,v])=>esc(d)+' '+num(v.median)+'원').join(' · ')}.<br>${esc(L.hazard.name)}는 8월 현장의 「비 오면 물 찹니다」 의견과 함께 배수·침수 이력 확인이 필요한 근거입니다. ${esc(L.caveat)}. 출처: ${esc(L.source)}.</p><button id="b-hazard-toggle">자연재해위험개선지구 지번 지도에 표시</button></article>`;})():''}
      ${data.rtms?(()=>{const T=data.rtms,K=T.kinds,s=K.shrent,h=s&&s.headline;return `<article><span>17 · 실거래 신고 — ${T.dongs.map(esc).join('·')} 법정동 단위 (${Object.values(K).map(k=>esc(k.name)+' '+num(k.n)+'건').join(' · ')})</span><strong>${h?`단독·다가구 전월세 중 월세 비중 ${h.wolseFrom[0]}년 ${h.wolseFrom[1]}% → ${h.wolseTo[0]}년 ${h.wolseTo[1]}% · 봉황동 전월세 가장 많던 ${h.bonghwangPeak[0]}년 ${num(h.bonghwangPeak[1])}건 → 2011~2025년 중 가장 적던 ${h.bonghwangLow[0]}년 ${num(h.bonghwangLow[1])}건`:''}${(()=>{const d=['nrg','land','shtrade'].filter(k=>K[k]).map(k=>K[k].headline.dropPct);return d.length?` · 매매 신고(${['nrg','land','shtrade'].filter(k=>K[k]).map(k=>esc(K[k].name.replace(' 매매',''))).join('·')})는 가장 많던 해보다 2025년 ${Math.min(...d)}~${Math.max(...d)}% 적음`:'';})()}</strong><p>${['nrg','land','shtrade'].filter(k=>K[k]).map(k=>{const H=K[k].headline;return `${esc(K[k].name)}: 3개 동 가장 많던 ${H.peak[0]}년 ${num(H.peak[1])}건 → ${H.last[0]}년 ${num(H.last[1])}건(${H.dropPct}% 감소) · 봉황동 ${H.bhPeak[0]}년 ${num(H.bhPeak[1])}건 → ${H.bhLast[0]}년 ${num(H.bhLast[1])}건`;}).join('<br>')}${['nrg','land','shtrade'].some(k=>K[k])?'<br>':''}${Object.values(K).map(v=>`${esc(v.name)} 연도별 건수: ${v.years.map(y=>y.year+' '+num(y.n)).join(' · ')}`).join('<br>')}.<br>${esc(T.caveat)}. 출처: ${esc(T.source)}.</p><button id="b-rtms-csv">실거래 연도별 받기</button></article>`;})():''}
      ${data.archPms?(()=>{const P=data.archPms,D=P.demolition;return `<article><span>18 · 건축 인허가 이력 — 구역 지번 ${num(P.lotsQueried)}곳 전수 (허가 ${num(P.permits)}건 · 지번 ${num(P.lotsWithPermit)}곳)</span><strong>용도변경 ${num(P.types['용도변경']||0)}건 중 ${num(P.change1722)}건(${Math.round(100*P.change1722/(P.types['용도변경']||1))}%)이 2017~2022년 · 2023년 이후 허가는 ${num(P.since2023)}건</strong><p>종류: ${Object.entries(P.types).map(([k,v])=>esc(k)+' '+num(v)).join(' · ')} · 용도변경 허가 건물의 주용도: ${Object.entries(P.changeUse).map(([k,v])=>esc(k)+' '+num(v)).join(' · ')}.<br>연도별 허가(${P.firstYear}~): ${P.years.filter(y=>y.year>=2005).map(y=>y.year+' '+num(y.n)).join(' · ')} — 가장 많던 해 ${P.peak.years.join('·')}년 ${num(P.peak.n)}건.<br>철거·멸실 신고 ${num(D.n)}건(${Object.entries(D.byYear).map(([y,v])=>y+' '+v).join(' · ')}) · 가설건축물 ${num(P.temporary)}건 · 사용승인일이 없는 허가 ${num(P.notApproved)}건.<br>${esc(P.caveat)}. 출처: ${esc(P.source)}.</p><button id="b-archpms-toggle">2016년 이후 인허가 지번 지도에 표시</button> <button id="b-archpms-csv">인허가 연도별 받기</button></article>`;})():''}
      <div class="b-note">${data.terrain?esc(data.terrain.source)+'. ':''}${data.rone?esc(data.rone.source)+'. ':''}도로 = OpenStreetMap(${esc(ctx.osmFetched)} 받음, 등급은 도로 종류·차로 수로 환산 — 도시계획도로 지정 아님). 역·버스·생활시설·와이파이 = 이 지도의 기존 시 전체 자료를 확정 구역계 경계로 다시 셈. 인구 = 구역 건물이 있는 법정동 전체의 참고값(경계 안 인구 아님).</div></section>`;
  }
  function vacancySection(shopCount){
    if(!data.vacancy)return pendingBox('b-vacancy','공실 신호 — 확정 구역계(1안)',['vacancy','emptyShop','bizTimeline','licenseAll','roadview','energy','vacRate']);
    const v=data.vacancy,sb=v.sbiz,ld=v.localdata,es=data.emptyShop,bt=data.bizTimeline,rv=data.roadview;
    const yrs=bt?bt.years.map((y,i)=>[String(y),{open:bt.open[i],close:bt.close[i]}]).filter(([y])=>+y>=2010):Object.entries(ld.byYear).filter(([y])=>+y>=2019),mx=Math.max(...yrs.map(([,r])=>Math.max(r.open,r.close)),1);
    const flip=yrs.filter(([y,r])=>+y>=2020&&r.close>r.open).map(([y])=>y);
    const inside=v.listings.items.filter(l=>l.zone==='구역 안'),near=v.listings.items.filter(l=>l.zone!=='구역 안');
    const bars=yrs.map(([y,r])=>`<div class="b-yr"><span>${y}${y==='2026'?'*':''}</span><i class="o" style="width:${Math.round(r.open/mx*100)}%"></i><b>${r.open}</b><i class="c" style="width:${Math.round(r.close/mx*100)}%"></i><b>${r.close}</b></div>`).join('');
    return `<section id="b-vacancy" class="b-reading"><h3>공실 신호 — 확정 구역계(1안)로 다시 모은 자료 (${esc(v.collected)})</h3>
      ${es?`<article><span>01 · 건물 기준 빈 점포 후보 (등록 가게 0 · 주거·비점포·대장 없음 제외)</span><strong>${num(es.any.shop)}동 — 용도지역 무관 · 상업·준주거지역만 보면 ${num(es.orig.shop)}동</strong><p>등록 가게가 0인 건물 ${num(es.any.shop+es.any.res+es.any.non+es.any.unk)}동을 건축물대장 주용도·건물 이름으로 나눔: 빈 점포 후보 ${num(es.any.shop)} · 주거용 ${num(es.any.res)} · 가게 대상 아님 ${num(es.any.non)} · 대장 없음 ${num(es.any.unk)}. 후보 용도는 ${Object.entries(es.shopUse).map(([k,v])=>`${esc(k.replace('근린생활시설','근생'))} ${num(v)}`).join(' · ')}, 20년 넘은 건물 ${num(es.shopOld20)}동(연도 확인 ${num(es.shopKnownYear)}동 중). 법정동: ${es.byDong.map(d=>`${esc(d.dong)} ${num(d.shop)}`).join(' · ')}.<br>원래 화면(51.8ha)은 상업·준주거지역 건물만 셌는데, 확정 구역계는 면적의 66.7%가 제2종일반주거지역이라 그 방식이면 ${num(es.orig.shop)}동만 잡혀 주거지역 골목의 후보 건물이 빠집니다. 그래서 같은 분류 규칙을 용도지역과 관계없이 적용했습니다. 후보는 공실 확인 전 건물입니다. ${esc(es.caveat)}.</p><button id="b-cand-toggle">빈 점포 후보 ${num(es.any.shop)}동 지도에 색으로 표시</button></article>`:`<article><span>01 · 건물 기준 빈 점포 후보</span><strong>${num(shopCount)}동</strong></article>`}
      <article><span>02 · 인허가 폐업 신호</span><strong>${num(ld.signals.length)}곳 — 2022년 이후 폐업, 같은 주소에 지금 영업 신고 없음</strong><p>${esc(ld.industries.length)}개 업종(음식점·카페·미용·세탁 등) 인허가 기준. 구역 안 영업 중 신고 ${num(ld.insideOpen)}건 · 2022년 이후 폐업 ${num(ld.closedSince2022)}건. 조사 업종 밖 영업·미신고 영업은 빠집니다.</p><button id="b-closed-toggle">폐업 신호 ${num(ld.signals.length)}곳 지도에 표시</button></article>
      <article><span>03 · 개업·폐업 흐름 (인허가, 구역 안${bt?' 기록 '+num(bt.records)+'건':''})</span><strong>${flip.length?`${flip[0]}년부터 폐업이 개업보다 많음`:'개업이 폐업보다 많음'}${bt?` · 폐업한 가게 중 ${bt.lifespan.within3yPct}%가 3년 안에 닫음`:''}</strong><div class="b-yrs"><div class="b-yr b-yr-head"><span></span><em>개업</em><em>폐업</em></div>${bars}</div>${bt?`<p>2010년 뒤 개업이 가장 많았던 해 ${bt.peakOpenSince2010.year}년(${bt.peakOpenSince2010.n}건). 구역 안 인허가 기록 ${num(bt.records)}건(${bt.years[0]}~2026) = 지금 영업 ${num(bt.openNow)} · 폐업 ${num(bt.closedAll)}${bt.otherStatus?` · 취소·말소 등 ${num(bt.otherStatus)}`:''}. ${esc(bt.definition||'')}. 폐업한 ${num(bt.lifespan.closed)}건의 영업 기간 평균 ${bt.lifespan.meanYears}년 · 중간값 ${bt.lifespan.medianYears}년, 3년 안에 닫은 비율 ${bt.lifespan.within3yPct}%(원도심 4개 동은 같은 계산으로 37.9%). 2010~2022년에 연 가게 ${num(bt.within3y['2010-2022'].opened)}곳 중 3년 안에 닫은 곳은 ${bt.within3y['2010-2022'].pct}%.</p><p>* 2026년은 10월 13일까지. ${esc(bt.caveat)}.</p>`:'<p>* 2026년은 10월 13일까지.</p>'}</article>
      ${data.licenseAll?(()=>{const A=data.licenseAll,ys=A.years,ix=y=>ys.indexOf(y),pk=ys[A.store.active.indexOf(Math.max(...A.store.active))],mxA=Math.max(...A.store.active,1);
        const rows=ys.filter(y=>y>=2012&&y%2===0||y===2026||y===2023).map(y=>`<div class="b-yr"><span>${y}${y===2026?'*':''}</span><i class="o" style="width:${Math.round(A.store.active[ix(y)]/mxA*100)}%"></i><b>${A.store.active[ix(y)]}</b><i class="c" style="width:${Math.round(A.storeBand.active[ix(y)]/mxA*100)}%"></i><b>${A.storeBand.active[ix(y)]}</b></div>`).join('');
        return `<article><span>03-2 · 인허가 전 업종(${A.industriesFetched}종)으로 본 가게형 인허가 건수 흐름</span><strong>그해 유효한 가게형 인허가 ${A.store.active[ix(2016)]}건(2016) → ${Math.max(...A.store.active)}건(${pk}) → ${A.store.active[ix(2026)]}건(2026-10-13 현재) · 봉황대길 40m 띠 ${A.storeBand.active[ix(2016)]} → ${A.storeBand.active[ix(2025)]}건(2025)</strong><div class="b-yrs"><div class="b-yr b-yr-head"><span></span><em>구역 전체</em><em>봉황대길 40m 띠</em></div>${rows}</div><p>구역 안 인허가 기록 ${num(A.insideRecords)}건(지금 영업 ${num(A.insideOpen)}) 중 가게형 ${num(A.storeRecords)}건. ${esc(A.rule)}(뺀 업종 많은 순: ${Object.entries(A.excludedTop).map(([k,v])=>esc(k)+' '+v).join(' · ')}). ${esc(A.caveat)}.</p></article>`;})():''}
      <article><span>04 · 상가정보 분기 비교</span><strong>${esc(sb.compare)} ${num(sb.insideCompare)}곳 → ${esc(sb.latest)} ${num(sb.inside)}곳 · 사라짐 ${num(sb.vanished.length)} · 새로 생김 ${num(sb.newCount)}</strong><p>최신 공개분이 ${esc(sb.latest)}이며 다음 공개 예정은 ${esc(sb.next)}입니다. 사라진 점포는 폐업·이전 후보이고 확정이 아닙니다. 번호만 바뀐 ${num(sb.idReissued)}쌍은 뺐습니다${sb.vanishedDupRemoved?`(원자료에 두 줄로 들어간 같은 점포 ${sb.vanishedDupRemoved}건도 한 곳으로 셈)`:''}.${data.kakaoPlace?`<br>카카오맵에 올라 있는 구역 안 장소는 ${num(data.kakaoPlace.total)}곳(${Object.entries(data.kakaoPlace.byCategory).slice(0,5).map(([k,v])=>esc(k)+' '+v).join(' · ')} 등) — 상가정보와 이름·20m로 짝이 맞는 곳 ${data.kakaoPlace.match.both}곳(카카오에만 ${data.kakaoPlace.match.kakaoOnly} · 상가정보에만 ${data.kakaoPlace.match.sbizOnly}). ${esc(data.kakaoPlace.caveat)}.`:''}</p><button id="b-vanished-toggle">사라진 점포 ${num(sb.vanished.length)}곳 지도에 표시</button></article>
      <article><span>05 · 지금 나와 있는 매물 (${esc(v.collected)} 확인)</span><strong>구역 안 ${inside.length}건 · 경계 바로 밖 ${near.length}건</strong><p>${[...inside,...near].map(l=>`${esc(l.place)} — ${esc(l.kind)} ${esc(l.deal)}${l.areaM2?` 전용 ${num(l.areaM2)}㎡`:''} · ${esc(l.floor||'')} · 광고: ${esc(l.state)} (${esc(l.platform)})`).join('<br>')}<br>10/1에 본 자체 후보 광고 ${v.listings.old.length}건: ${v.listings.old.map(o=>`${esc(o.id)} ${/숨김/.test(o.state)?'숨김':'상세 페이지 없음'}`).join(' · ')}. ${esc(v.listings.limit)}.</p></article>
      ${v.survey0919?`<article><span>05-2 · 9/19 온라인 매물 조사 다시 판정</span><strong>${num(v.survey0919.total)}건 중 구역 안 ${v.survey0919.byZone['구역 안']}건 — 지금 살아 있는 구역 안 광고 ${v.survey0919.liveInside}건</strong><p>주소 확인 ${num(v.survey0919.total-v.survey0919.byZone['주소 미확정'])}건: 구역 안 ${v.survey0919.byZone['구역 안']} · 경계 밖 50m ${v.survey0919.byZone['경계 밖 50m']} · 밖 ${v.survey0919.byZone['구역 밖']} / 상세 주소 비공개 ${v.survey0919.byZone['주소 미확정']}건(네이버 16건은 10/13 상세 페이지 확인 불가 — 현재 광고 여부 확인 필요). 지금도 공개 중인 광고 ${v.survey0919.live}건은 모두 구역 밖이거나 주소 미확정입니다. 같은 방법(등록 사업체를 건물로 묶은 검토대장)을 확정 구역계에 다시 적용하면 ${num(v.survey0919.ledger.rows)}행·${num(v.survey0919.ledger.buildings)}건물(경계 밖 20m 포함 ${num(v.survey0919.ledger.rows20)}행·${num(v.survey0919.ledger.buildings20)}건물) — 9/19 임시 경계(${num(v.survey0919.ledger.old.boundaryAreaM2)}㎡)의 ${num(v.survey0919.ledger.old.insideRows)}행·${num(v.survey0919.ledger.old.insideBuildings)}건물과 범위가 다릅니다.</p></article>`:''}
      <article><span>06 · 빈집(주거)</span><strong>주소별 공개 목록 없음</strong><p>${esc(v.emptyHouse.note)}. 구역 안 빈집 수는 현장 조사로만 확인할 수 있습니다.</p></article>
      ${rv?`<article><span>07 · 과거 로드뷰 — 1층 앞이 비어 보였던 때 (${num(rv.jibun)}개 지번)</span><strong>2025년 3월 사진에서 1층 앞이 비어 보인 지번 ${rv.empty2025.length}곳 · 그중 2022년 3월에도 비어 보인 곳 ${rv.empty2022and2025.length}곳${rv.partial?.length?`(${rv.partial.map(esc).join('·')}은 일부 칸만)`:''}</strong><p>시 13곳과 전수조사 1차 A·B 지번을 카카오 로드뷰 최신(대부분 2025-03)·과거(2022-03·2019-11 등) 사진으로 같은 방향에서 비교했습니다. 최신 사진 기준: 영업 중 ${num(rv.latest['영업 중']||0)} · 비어 보임 ${num(rv.latest['비어 보임']||0)} · 주거·창고 ${num(rv.latest['주거·창고']||0)} · 판단 불가 ${num(rv.latest['판단 불가']||0)}.<br>비어 보인 곳: ${rv.empty2025.map(j=>esc(j)+((rv.lowConf2025||[]).includes(j)?'(확신 낮음)':'')).join(' · ')}. 1차 판정 A(장기공실 유력) 중 ${rv.aOpen2025.length}곳(${rv.aOpen2025.map(esc).join(' · ')})은 2025년 3월에 영업 중이었습니다 — 지금 비었다면 그 뒤에 빈 것이라 「2026.1.1 이전 공실」 증빙을 따로 갖춰야 합니다.<br>${esc(rv.caveat)}. 지번 점을 누르면 시점별 판정이 나옵니다.</p></article>`:''}
      ${data.energy?`<article><span>08 · 전기 사용량 (비주거 지번 · 지번 합계)</span><strong>조회 ${num(data.energy.queried)}곳 중 자료 ${num(data.energy.withData)}곳 · 월평균 중간값 ${num(data.energy.medianMonthlyKwh)}kWh · 월 100kWh 이하 ${data.energy.le100}곳(300 이하 ${data.energy.le300}곳)</strong><p>월 100·300kWh는 공실 판정값이 아닙니다. 조회 기간 ${esc(data.energy.period)}(${data.energy.months}개월) — ${num(data.energy.fullMonths)}곳은 ${data.energy.months}개월 모두, ${num(data.energy.partialMonths)}곳은 ${data.energy.partialRange[0]}~${data.energy.partialRange[1]}개월 자료로 평균. 가운데 절반은 월 ${num(data.energy.q1)}~${num(data.energy.q3)}kWh(${esc(data.energy.quartileMethod)}). 가이드라인 공실 증빙 ①「수도·전기 사용량이 기준 이하」에 쓰는 자료이지만 기준값은 가이드라인에 숫자가 없어 공고문 확인이 필요합니다. ${esc(data.energy.caveat)}. 지번별 사용량은 공개하지 않습니다(전수조사 내부 자료).</p></article>`:''}
      ${data.vacRate?(()=>{const R=data.vacRate,S=R.stores,C=S.byStatus,P=R.population;return `<article><span>09 · 건물·층별 조사자료 연결 — ${num(P.buildings)}동 (현장 조사 아님)</span><strong>구역 공실률은 아직 확인되지 않음</strong><p>등록 점포 ${num(S.total)}곳 중 <b>건물·층까지 연결 ${num(C.floor_linked||0)}곳 · 건물까지만 연결 ${num(C.building_only||0)}곳</b>.<br>대상 건물이 여럿이라 보류 ${num(C.shared_address||0)}곳 · 주소 대조 미해결 ${num(C.ledger_unmatched||0)}곳 · 대상 밖 건물 ${num(C.outside_population||0)}곳.</p><p>대상 ${num(P.buildings)}동(소규모 ${num(P.small)} · 중대형 ${num(P.large)})의 비주거 층 ${num(P.floorGroups)}개 중 등록점포가 연결된 층은 ${num(S.linkedFloors)}개입니다. 나머지 층이 비었다는 뜻은 아닙니다.<br>비주거 층 대장 면적 ${num(P.commercialFloorM2)}㎡는 공용공간을 포함하며 임대 가능한 면적과 다릅니다.</p><p>${esc(R.interpretation)}. ${esc(R.changes)}.</p><details><summary>연결 방법과 남은 확인 사항</summary><p>${esc(R.definition)}.<br>${esc(R.method)}.<br>${esc(R.caveat)}.<br>${esc(R.compare)}.<br>출처: ${esc(R.source)}.</p></details></article>`;})():''}
      <div class="b-note">모두 「현장에서 확인할 대상」이며 공실 확정 수가 아닙니다. 서로 다른 자료라 더하지 않습니다. 출처: ${esc(ld.source)} · ${esc(sb.source)} · 당근 부동산·네이버 부동산 공개 화면.</div><button id="b-vacancy-csv">공실 신호 목록 받기</button></section>`;
  }
  function linkSection(){
    if(!data.linkage)return pendingBox('b-link','연결·이용 — 확정 구역계(1안)',['linkage']);
    const L=data.linkage,I=L.indicators,h=L.hubRoutes;
    return `<section id="b-link" class="b-reading"><h3>연결·이용 — 종합분석맵 분석을 확정 구역계(1안)로</h3>
      <article><span>01 · 관광객이 걷는 길</span><strong>역→유적·관광지 최단 보행 길 ${L.tourRoutes}개 중 구역을 지나는 길 ${L.tourRoutesThroughZone}개</strong><p>봉황·수로왕릉·박물관역에서 유적·박물관·공원으로 가는 길은 구역 바깥(경전철 선로·해반천 쪽)으로만 지나갑니다 — ${esc(I.tour_routes_corridor.label)} ${esc(I.tour_routes_corridor.display)}. 구역 안 골목으로 사람을 끌어들일 거점과 안내가 필요하다는 근거입니다.</p><button id="b-tour-toggle">역→관광지 길 ${L.tourRoutes}개 지도에 표시</button></article>
      <article><span>02 · 역에서 거점까지</span><strong>3역 10분 도보권이 구역의 ${L.zoneIn10min}%</strong><p>${h.map(r=>`${esc(r.from)}→거점 5 도보 ${Math.round(r.minutes)}분(${num(r.lengthM)}m, 구역 안 ${num(r.insideM)}m)`).join(' · ')}</p><button id="b-iso-toggle">3역 10분 도보권 지도에 표시</button></article>
      <article><span>03 · 13곳 한 바퀴</span><strong>가장 짧은 순서로 ${num(L.loop.lengthM)}m · 약 ${L.loop.minutes}분</strong><p>${L.loop.order.join('→')} (종합분석맵: 모든 순서를 비교한 보행망 최단 순환 — 기획 동선 아님)</p><button id="b-loop-toggle">한 바퀴 길 지도에 표시</button></article>
      <article><span>04 · 찾아오는 사람</span><strong>경전철 3역 하차 ${esc(I.ridership_3st_daily_2025.display)} (2019 대비 ${esc(I.ridership_3st_vs2019.display)})</strong><p>수로왕릉 입장객 2019 대비 ${esc(I.suro_visitors_vs2019.display)} · 국립김해박물관 ${esc(I.museum_visitors_vs2019.display)} · 공공와이파이 전체 8월 전년 대비 ${esc(I.wifi_total_yoy_aug.display)}</p></article>
      <article><span>05 · 쇠퇴 지표(행정동 — 구역만의 값 아님)</span><strong>원도심 3동 인구 ${esc(I.pop_wondosim3_15_25.display)} (2015→2025) · 사업체 ${esc(I.biz_wondosim3_21_24.display)} (2021→2024)</strong><p>구역 점포 주소 대부분이 속한 회현동 사업체 ${esc(I.biz_hoehyeon_21_24.display)} (2021→2024).</p></article>
      <div class="b-note">${esc(L.source)}. 거리·시간은 OSM 보행망 최단경로(시속 4.8km).</div></section>`;
  }
  function voiceSection(){
    const v=data.fieldVoice;if(!v)return '';
    return `<section id="b-voice" class="b-reading"><h3>현장에서 들은 것 — 이전 조사를 확정 구역계(1안)로 다시 고름</h3>
      ${v.themes.map(t=>`<article><span>${esc(t.theme)} · 인터뷰 ${t.flows}건</span><strong>${t.quotes.map(q=>`「${esc(q)}」`).join(' ')}</strong></article>`).join('')}
      ${v.observations.map(o=>`<article><span>8/27 실사 · ${esc(o.where)}</span><strong>${esc(o.item)}</strong><p>${esc(o.zone)}</p></article>`).join('')}
      <div class="b-note">${esc(v.date)}. ${esc(v.note)}. 구역 밖이라 뺀 인터뷰 흐름 ${v.excludedFlows}건(수로왕릉 쪽 버스 진동·야간 유동 급감, 외국인거리 주차·보행 등).</div></section>`;
  }
  const SURVEY_COLOR={A:'#ff3b6b',B:'#ffb020',C:'#c084fc',D:'#4fb3ff',E:'#5b6573'};
  function surveySection(){
    const sv=data.survey;if(!sv)return '';
    return `<section id="b-survey" class="b-reading"><h3>책상 자료 1차 분류(2026-10-13) — 구역 안 지번 ${num(sv.points.features.length)}곳</h3>
      <div class="b-survey-grid">${'ABCDE'.split('').map(k=>`<button data-survey="${k}"><i style="background:${SURVEY_COLOR[k]}"></i>${k} ${esc(sv.labels[k])}<b>${num(sv.counts[k])}</b></button>`).join('')}</div>
      <p>책상 자료(건축물대장·인허가 폐업·상가정보·공개 매물·시 13곳)로 먼저 나눈 1차 분류입니다. 장기 공실 후보는 A ${sv.counts.A} + B ${sv.counts.B} = <b>${num(sv.counts.A+sv.counts.B)}지번</b>이며 현재 영업·공실 상태와 공실 기간을 확정한 수치는 아닙니다. 칸을 누르면 그 분류만 지도에 표시됩니다.</p>
      <div class="b-note">${esc(sv.rule)}. 이 분류는 공실 확정이 아니며, 수도·전기 사용량(시 회신)과 현장 반복 조사로 층·호 단위 증빙을 채운 뒤 최종 판정합니다.</div>
      <div class="b-controls"><button id="b-survey-all">5개 분류 모두 지도에 표시</button><button id="b-field13-csv">현장 확인표 받기(시 13곳 + A·B ${num(sv.counts.A+sv.counts.B)}지번)</button></div></section>`;
  }
  function reqSection(){
    const R=data.requirements;if(!R)return '';
    const c={};R.items.forEach(r=>c[r.label]=(c[r.label]||0)+1);
    const mine={r3:`${num(data.area)}㎡ — 권장 15만㎡보다 ${num(data.relation.over150k)}㎡ 넓음. 허용 여부와 넓힌 사유는 사전컨설팅에서 확인 필요`,r4:`책상 자료 분류: 장기공실 검토 후보 ${data.survey?.counts.A??'-'} · 확인 필요 ${data.survey?.counts.B??'-'}지번 · 시 13곳 중 「1년 이상 공실」 표기 5곳`,r6:`전기 공개자료 ${data.energy?.queried??'-'}지번 조회·${data.energy?.withData??'-'}지번 자료 확보(${data.energy?.period??''}). 지번 합계이므로 층·호 공실 증빙은 별도 확인 필요`,r10:`등록점포 ${data.stats.stores}곳을 임시 분모로 하면 15%는 ${Math.ceil(data.stats.stores*.15)}곳. 공모에서 인정하는 전체 상가 수·조사 대상 확정 필요`,r13:`문화 콘텐츠 추천: ${R.culture.map(x=>x.name).join(' · ')}`};
    return `<section id="b-req" class="b-reading"><h3>공모 요건 점검 17개 — 확정 구역계(1안) 기준</h3><p>${Object.entries(c).map(([k,v])=>`${esc(k)} ${v}`).join(' · ')}</p><div class="b-req-list">${R.items.map(r=>`<div class="b-req b-req-${esc(r.status)}"><span>${esc(r.label)}</span><b>${esc(r.title)}</b><small>${esc(mine[r.id]||r.now)}</small></div>`).join('')}</div><div class="b-note">${esc(R.source)}. 항목별 자세한 근거는 <a href="${esc(R.url)}" target="_blank" rel="noopener noreferrer">사업 안내 누리집</a>의 「요건 점검」.</div></section>`;
  }
  function renderPanel(){
    const s=data.stats, r=data.relation, classes={};buildings.forEach(f=>{const k=f.properties.cl;classes[k]=(classes[k]||0)+1;});
    analysis=insights.summarize(buildings,stores);
    const nearest=sitesIn().reduce((a,b)=>b.edgeM<a.edgeM?b:a);
    overview.innerHTML=`<div class="b-overview-heading"><b><i></i>${NAME}</b><span>${areaLabel()}</span></div><p>${DATE()} 확정 · 기존 지도 위에 <b>민트 선</b>으로 겹쳐 표시</p><div class="b-overview-stats"><span>건물 <b>${num(s.buildings)}동</b></span><span>등록점포 <b>${num(s.stores)}개</b></span><span>20년 이상 <b>${s.oldPct}%</b></span></div><p class="b-overview-note">${num(data.area)}㎡ · 시 우선순위 ${sitesLine()} · 아래 기존 구역(51.8ha) 통계와 별도</p><div class="b-overview-actions"><button id="b-together">전체 위치 보기</button><button id="b-closeup">구역계 확대·분석</button></div>`;
    $('b-together').onclick=()=>frame(350);
    $('b-closeup').onclick=()=>{switchScope(true);frame(350,true);};
    const overviewInsight=document.createElement('p');overviewInsight.className='b-overview-note';overviewInsight.textContent=`안쪽 분석: 40년 이상 ${analysis.counts.old40}동 · 등록 업종 중 소매·음식 ${analysis.foodRetailPct}%`;overview.querySelector('.b-overview-actions').before(overviewInsight);
    panel.innerHTML=`<div class="b-eyebrow">김해 원도심 · RE:CORE 대상지</div><h2>${NAME} ${areaLabel()}</h2><p>${DATE()} 확정 · 기존 지도와 같은 건물·노후도 표현 · 집계는 확정 구역계(1안) 안만</p>
      <div class="b-note">${esc(data.source)}입니다. 면적 ${num(data.area)}㎡는 카카오맵 면적재기 실측값이며 지적(필지) 경계가 아닙니다. 지적 경계 자료를 받으면 다시 맞춥니다. 경계 주변 건물은 포함 여부를 다시 확인해야 합니다.</div>
      <div class="b-kpis"><div class="b-kpi"><strong>${num(s.buildings)}</strong><span>구역 안 건물 · 동</span></div><div class="b-kpi"><strong>${num(s.stores)}</strong><span>등록점포 위치 · 개</span></div><div class="b-kpi"><strong>${s.oldPct}%</strong><span>연도 확인 건물 중 20년 이상</span></div><div class="b-kpi"><strong>${num(s.edgeInside)}</strong><span>포함 건물 중 경계 주변 · 동</span></div></div>
      <p>노후 비율: ${s.old20}동 ÷ 연도 확인 ${s.knownYear}동(이 지도 건물 윤곽 기준)<br>연도 미확인 ${s.unknownYear}동은 비율 계산에서 제외 · 2026년 기준</p>${data.ledger?`<div class="b-relation"><b>건축물대장 기준(동 단위, ${esc(data.ledger.source.match(/\d{4}-\d{2}-\d{2}/)?.[0]||'')} 조회)</b><span>구역 안 대장 ${num(data.ledger.buildings)}동(지번 ${num(data.ledger.parcels)}곳)${data.ledger.known?` · 사용승인일 확인 ${num(data.ledger.known)}동`:''} 중 20년 이상 <b>${num(data.ledger.old20)}동 · ${data.ledger.old20Pct}%</b>${data.ledger.old30Pct!=null?` · 30년 이상 ${data.ledger.old30Pct}%`:''}</span><span>지도 윤곽(${num(s.buildings)}동)은 한 필지의 여러 동·부속 건물·대장 없는 건물까지 세어 수가 다릅니다. 쇠퇴 요건(노후건축물 50% 이상)은 두 기준 모두 충족하며, 공식 판정에는 대장 기준을 씁니다.</span></div>`:''}
      <div class="b-relation"><b>이전 범위와 달라진 점</b><span>옛 확정 구역계(10/11)와 겹치는 곳 <b>${num(r.oldZoneOverlap)}㎡</b> · 빠진 곳 ${num(r.oldZoneOnly)}㎡(봉황대공원·봉황대길 북측 주거지·서남부) · 새로 들어온 곳 ${num(r.newOnly)}㎡(동측 상가 블록) — 옛 선은 도로 중심선, 1안은 도로 안쪽 가장자리 기준이라 면적 비교 때 기준이 다릅니다. 봉황예술극장은 구역 밖입니다.</span><span>공모 권장 15만㎡보다 <b>${num(r.over150k)}㎡</b> 넓음 — 넓힌 사유는 계획서에서 설명</span><span>이 지도 기본 수치의 범위(기존 사업구역 51.8ha)와 겹치는 곳은 <b>약 ${haLabel(r.blueOverlap)}</b> — 아래 탭의 1,009동·영업 점포 등은 다른 범위의 값</span></div>
      <nav class="b-jump" aria-label="확정 구역계 분석 바로가기"><a href="#b-reading">핵심 분석</a><a href="#b-sites">시 13곳</a><a href="#b-survey">전수조사</a><a href="#b-vacancy">공실 신호</a><a href="#b-link">연결·이용</a><a href="#b-context">도로·교통</a><a href="#b-req">공모 요건</a><a href="#b-building-section">건물 찾기</a><a href="#b-store-section">상권 찾기</a><a href="#b-export-section">자료 받기</a></nav>
      <section id="b-reading" class="b-reading"><h3>자료로 읽는 확정 구역계</h3><article><span>01 · 건물 연도</span><strong>40년 이상 ${num(analysis.counts.old40)}동</strong><p>연도 확인 ${num(s.knownYear)}동 중 ${insights.pct(analysis.counts.old40,s.knownYear)}%. 오래된 정도를 보여주는 값이며, 안전등급은 아닙니다.</p></article><article><span>02 · 등록 업종</span><strong>소매·음식 ${num(analysis.foodRetail)}개 · ${analysis.foodRetailPct}%</strong><p>등록점포 ${s.stores}개 기준. 매출·손님 수나 현재 영업 비율을 뜻하지 않습니다.</p></article><article><span>03 · 건물 쓰임</span><strong>주택 ${analysis.residential}동 · 근린생활시설 ${analysis.neighborhood}동</strong><p>근린생활시설은 가게·의원 등 생활에 필요한 시설입니다. 건물 전체의 주용도 기준이므로 가구 수나 점포 수와 다릅니다.</p></article><div class="b-note">검토 제안: 오래된 건물 상태·공실 여부·보행 불편을 현장에서 함께 확인. 이 자료만으로 철거·정비 대상을 확정하지 않습니다.</div><button id="b-brief">분석 요약 내려받기</button></section>
      <section id="b-sites"><h3>시 우선순위 대상지 13곳 — ${sitesLine()}</h3>${data.landUseSummary?`<div class="b-note">토지이용 규제(토지이음 2026-10-13): 13곳 모두 <b>역사문화환경보존지역</b>(문화유산법)·<b>중점경관관리구역</b>에 들어 있어 리모델링·신축 때 허용기준·협의 필요 여부를 먼저 확인해야 합니다. 도시계획도로 저촉 ${data.landUseSummary.roadConflict.length}곳(${data.landUseSummary.roadConflict.join('·')}번), 방화지구 ${data.landUseSummary.fireDistrict.length}곳(${data.landUseSummary.fireDistrict.join('·')}번).</div>`:''}<p>번호 = 김해시 우선순위(2026-10-08 목록). 역할은 10/8 현장 미팅 — 거점 5·10, 개인 창작 13, 나머지는 방문객용 공간 방향만 정해짐. 구역 안 9곳 중 경계까지 가장 가까운 곳은 ${nearest.rank}번(${num(nearest.edgeM)}m 안쪽). 구역 밖 ${sitesOut().map(t=>`${t.rank}번(경계 밖 ${num(t.edgeM)}m)`).join(' · ')}은 봉황대길 북측이라 지우지 않고 「구역 밖(재배치 검토 중)」으로만 표시합니다 — 사업 배치는 결정 대기.</p><div id="b-site-list">${data.sites.map(t=>`<button class="b-result b-site${t.inside?'':' b-site-out'}" data-rank="${t.rank}"><span class="b-site-no">${t.rank}</span>${esc(t.jibun)}${t.inside?'':' <b class="b-site-out-tag">구역 밖(재배치 검토 중)</b>'}<small>${esc(siteLine(t))}${t.areaNote?'<br>'+esc(t.areaNote):''}${t.officialPrice?`<br>공시지가 ${esc(t.officialPrice.ym.slice(0,4))} ${num(t.officialPrice.wonPerM2)}원/㎡ · ${esc(t.officialPrice.land)} ${num(t.officialPrice.areaM2)}㎡(토지)`:''}${t.landUse?`<br>규제: ${esc([...t.landUse.zoning,...t.landUse.district,...t.landUse.road.filter(x=>x.includes('저촉')).map(x=>'도로 '+x)].join(' · '))}`:''}${t.prevHub?`<br>${esc(t.prevHub)}`:''}${t.ledger?`<br>대장: ${esc(t.ledger.use)} · 지상 ${esc(String(t.ledger.floors).split('/')[0])}층 · ${t.ledger.bldgs>1?`대장 ${t.ledger.bldgs}동 · 대표 동 연면적`:'연면적'} ${num(t.ledger.grossM2)}㎡${t.ledger.bcr!=null?` · 건폐율 ${t.ledger.bcr}% · 용적률 ${t.ledger.far}%`:''} · 사용승인 ${esc(String(t.ledger.approved).slice(0,4))}`:'<br>대장: 건물 없음'}</small>${t.photo?`<img class="b-site-photo" src="${esc(t.photo)}" alt="시 우선순위 ${t.rank} ${esc(t.jibun)} 현장 사진" loading="lazy">`:''}</button>`).join('')}</div><div class="b-note">사진: ${esc(data.sitePhotoSource||'')}. 대장: 건축물대장 표제부·층별개요(2026-10-13 조회). 공시지가·대장·규제는 지번 속성이라 구역계와 무관하게 그대로 둡니다. 지번 위치 점이며 필지 외곽선이 아닙니다. 공시지가는 국토교통부 토지이음 2026년 1월 개별공시지가(거래 가격 아님)입니다. 현재 공실·사용 가능 여부와 매입·임대 조건은 시와 현장에서 확인합니다.</div></section>
      ${surveySection()}
      ${vacancySection(classes.shop||0)}
      ${data.fieldVoice?voiceSection():''}
      ${linkSection()}
      ${contextSection()}
      ${data.requirements?reqSection():pendingBox('b-req','공모 요건 점검 — 확정 구역계(1안) 기준',['requirements'])}
      <details><summary>확정 구역계 자료에 물어보기</summary><div class="b-controls" id="b-questions"><button>건물·점포</button><button>노후도</button><button>빈 점포</button><button>시 13곳</button><button>도로·교통</button><button>유동인구</button><button>인구·사업체</button><button>경계</button></div><p id="b-answer" role="status">항목을 누르면 확정 구역계 자료만으로 답합니다. 기존 구역 수치와 섞지 않습니다.</p></details>
      <h3>건물 색 · 지도 보기</h3><select id="b-mode" aria-label="건물 색상 구분"><option value="old">노후도 (기존 지도와 동일)</option><option value="use">건물 용도별</option><option value="candidate">빈 점포 현장 확인 후보</option></select>
      <div id="b-legend" class="b-legend"></div><div class="b-controls"><button id="b-3d" aria-pressed="true">입체 건물</button><button id="b-fit">주변까지 넓게 보기</button><button id="b-focus">구역계만 확대</button></div>
      <label><input id="b-sites-on" type="checkbox" checked>시 우선순위 13곳 위치 (빨간 점 · 구역 밖은 회색)</label>${data.linkage?`<label><input id="b-iso" type="checkbox">3역(봉황·수로왕릉·박물관) 10분 도보권</label><label><input id="b-loop" type="checkbox">13곳 한 바퀴 길 (${num(data.linkage.loop.lengthM)}m)</label><label><input id="b-tour" type="checkbox">역→유적·관광지 최단 길 ${data.linkage.tourRoutes}개</label>`:''}${data.vacancy?`<label><input id="b-closed" type="checkbox">인허가 폐업 신호 ${num(data.vacancy.localdata.signals.length)}곳 (분홍 테두리)</label><label><input id="b-vanished" type="checkbox">상가정보에서 사라진 점포 ${num(data.vacancy.sbiz.vanished.length)}곳 (회색)</label>`:''}<label><input id="b-stores" type="checkbox">등록점포 위치 표시 · 업종·검색 조건 반영</label>${ctx?`<label><input id="b-roads" type="checkbox">구역 안 차량 도로 (OSM 등급 환산)</label><label><input id="b-gates" type="checkbox">구역 진출입구 ${num(ctx.gates.total)}곳</label>`:''}<label><input id="b-review" type="checkbox">경계 주변 건물 ${data.edgeBuildingIndices.length}동 확인</label><label><input id="b-compare" type="checkbox">기존 사업구역(51.8ha) 파란 경계와 비교</label><label><input id="b-prev" type="checkbox">옛 확정 구역계(10/11)와 비교 (회색 점선 · 참고)</label><label><input id="b-wifi" type="checkbox">주변 와이파이 측정지점 참고</label>${data.rone?`<label><input id="b-rone" type="checkbox">부동산원 공실률 표본 상권 「${esc(data.rone.market)}」 경계</label>`:''}${data.sbizZone?.items?.length?`<label><input id="b-sbizzone" type="checkbox">소진공 주요 상권 「${esc(data.sbizZone.items[0].name)}」 영역</label>`:''}${data.archPms?`<label><input id="b-archpms" type="checkbox">2016년 이후 건축 인허가 지번 ${num(data.archPms.recentPoints.features.length)}곳 (색 = 종류)</label>`:''}${data.landUse537?`<label><input id="b-hazard" type="checkbox">자연재해위험개선지구 지번 ${num(data.landUse537.hazard.count)}곳 (하늘색 점)</label>`:''}${data.heritage?`<label><input id="b-heritage" type="checkbox">국가유산 「${esc(data.heritage.name)}」 지정·보호·허용기준 구역</label>`:''}
      <details><summary>건물 노후도 · 용도</summary>${table(s.bands)}<p>사용승인 연도 기준. 건물 상태·안전등급을 뜻하지 않습니다.</p>${table(s.uses)}<p>법정동: ${Object.entries(s.dongs).map(([k,v])=>`${esc(k)} ${num(v)}동`).join(' · ')}</p></details>
      <details><summary>빈 점포 현장 확인 후보 ${num(classes.shop||0)}동</summary><div class="b-note">실제 공실로 확인한 수가 아닙니다. 기존 자료의 상업지역·연결 점포 0개 조건에 건물 용도 등을 대조한 현장 확인 후보입니다.</div>${table(Object.fromEntries(Object.entries(classes).map(([k,v])=>[labels[k],v])))}<p>상가 위치 ${s.stores}개와 건물별 연결 점포 수는 서로 다른 기준이므로 합계가 같지 않을 수 있습니다.</p></details>
      <details><summary>상권 · 도로 · 유동 자료</summary>${table(s.industries)}${ctx?`<h3>경계 안으로 잘라 계산한 도로 길이</h3>${table(Object.fromEntries(Object.entries(ctx.roads.byTier).map(([k,v])=>[k+' (m)',v])))}<p>OpenStreetMap 차량 도로(${esc(ctx.osmFetched)} 받음)를 구역 경계로 잘라 잰 중심선 길이입니다. 보행거리·도로 면적이 아니며, 등급은 도로 종류·차로 수로 환산한 값이라 도시계획도로 지정과 다를 수 있습니다.</p>`:'<p>구역 안 도로 길이: 새 구역 재수집 중</p>'}<div class="b-note">구역 안 와이파이 측정지점 ${s.wifiInside}곳${data.wifiInside.length?`(${data.wifiInside.map(f=>esc(f.properties.n)).join('·')} — 경계 바로 안쪽, 역 이용객이 섞인 값)`:''}. 주변 지점은 참고용으로만 표시하며 구역 유동인구로 합산하지 않습니다.</div><p>기존 구역의 출입구·생활권·점포별 큰길 거리는 이 범위의 새 분석값으로 사용하지 않습니다.</p></details>
      <details><summary>경계 근거 · 포함 기준</summary><p>경계: ${esc(data.source)} · ${esc(data.sourceNote)} · 둘레 약 ${num(data.perimeterM)}m. 종합분석맵·사업 안내 누리집과 같은 정본 경계 파일을 씁니다.</p><p>건물: 건물 내부 대표점이 경계 안에 있으면 포함.<br>점포: 등록된 위치가 경계 안에 있으면 포함.</p><p>경계선 양쪽 20m에 닿는 건물 ${data.edgeBuildingIndices.length}동(안 ${s.edgeInside}동 / 밖 ${data.edgeBuildingIndices.length-s.edgeInside}동)은 검토 목록으로 별도 관리. 경계가 도로 안쪽 가장자리를 따라가므로 길 건너 건물도 이 목록에 들어갑니다.</p><p>기존 파란 범위·옛 확정 구역계(10/11)·분석·주변 자료는 삭제하지 않았습니다. 위의 ‘전체 · 구역계 함께 보기’ 버튼으로 돌아갑니다.</p><p>자료: 기존 환경분석맵 건물 자료(건축물대장 기반 10,065동) / 상가정보 2026년 6월 / 노후 계산 2026년. ${data.statsSource==='canon'?'숫자는 구역계(1안) 숫자정본표 값과 같습니다':'숫자는 구역계(1안) 숫자정본표와 대조 중입니다'}. 위치·업종·영업 여부는 현장 확인 필요.</p></details>
      <section id="b-building-section"><h3>현장 확인 · 건물 찾기</h3><p>조건을 누르면 같은 대상이 지도에 노란색으로 표시됩니다. 아래 대상끼리는 겹칠 수 있어 더해서 계산하지 않습니다.</p><div class="b-group-grid" id="b-groups">${Object.entries(insights.groups).map(([k,v])=>`<button data-group="${k}" aria-pressed="${k==='all'}">${v}<strong>${num(analysis.counts[k])}동</strong></button>`).join('')}</div><p>공실 후보 ${analysis.counts.candidate}동 중 ${analysis.candidateEdge}동은 경계 안쪽 확인 대상에도 해당합니다. 후보 수는 공실 수가 아닙니다.</p><label for="b-building-group">찾을 대상</label><select id="b-building-group">${Object.entries(insights.groups).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select><input id="b-query" type="search" placeholder="건물명·도로명·건물번호·용도" aria-label="확정 구역계 건물 검색"><label><input id="b-only-candidate" type="checkbox">공실 현장 확인 후보 조건 추가</label><label><input id="b-only-edge" type="checkbox">경계 주변으로 범위 변경 · 바깥 포함</label><div class="b-controls"><button id="b-clear">건물 조건 초기화</button><button id="b-filter-csv">현재 건물 목록 받기</button><button id="b-field-csv">현재 대상 현장 기록표</button></div><p id="b-results-status" role="status"></p><div id="b-results"></div><button id="b-more">건물 30동 더 보기</button></section>
      <section id="b-store-section"><h3>상권 구성 · 등록점포 찾기</h3><p>막대를 누르면 해당 업종의 위치와 목록을 함께 봅니다. 비율은 구역 안 등록점포 ${s.stores}개 기준입니다.</p><div id="b-industry-bars">${analysis.industries.map(([k,n])=>`<button class="b-industry" data-industry="${esc(k)}" aria-pressed="false"><span>${esc(k)}<b>${n}개 · ${insights.pct(n,s.stores)}%</b></span><i style="--bar-width:${insights.pct(n,s.stores)}%"></i></button>`).join('')}</div><label for="b-industry">업종 선택</label><select id="b-industry"><option value="">전체 업종</option>${analysis.industries.map(([k])=>`<option>${esc(k)}</option>`).join('')}</select><input id="b-store-query" type="search" placeholder="상호·주소·세부 업종 검색" aria-label="확정 구역계 등록점포 검색"><div class="b-controls"><button id="b-store-clear">점포 조건 초기화</button><button id="b-store-filter-csv">현재 점포 목록 받기</button></div><p id="b-store-status" role="status"></p><div id="b-store-results"></div><button id="b-store-more">점포 20개 더 보기</button><div class="b-note">상가정보 2026년 6월 등록 위치입니다. 폐업·이전·실제 영업 여부는 현장에서 확인해야 합니다. 현장 방문 주소는 도로명 주소를 우선 확인하세요.</div></section>
      <section id="b-export-section"><h3>검토 자료 내려받기</h3><div class="b-controls"><button id="b-csv">전체 건물 목록</button><button id="b-store-csv">전체 점포 목록</button><button id="b-edge-csv">경계 검토 목록</button><button id="b-site-csv">시 13곳 목록</button><button id="b-geo">경계 파일</button><button id="b-shot">지도 그림</button></div><p id="b-export-status" role="status"></p><p>현장 기록표의 조사일·영업 상태·메모는 빈칸입니다. 내려받은 파일에 직접 기록하며, 사이트에는 저장되지 않습니다.</p><p>그림에는 확정 구역계 표시·집계·주의 문구를 함께 넣습니다.</p></section>`;
    $('b-mode').onchange=e=>{mode=e.target.value;renderLayers();};
    $('b-3d').onclick=()=>{is3d=!is3d;$('b-3d').setAttribute('aria-pressed',String(is3d));renderLayers();frame(350);};
    $('b-fit').onclick=()=>frame(350);
    $('b-focus').onclick=()=>frame(350,true);
    const answers={
      '건물·점포':`확정 구역계에 포함된 건물 ${s.buildings}동, 등록점포 위치 ${s.stores}개입니다. 등록점포는 현재 영업 여부를 현장에서 확인한 수가 아닙니다.`,
      '노후도':`2026년 기준 20년 이상 ${s.old20}동입니다. 연도가 확인된 ${s.knownYear}동 중 ${s.oldPct}%로 노후건축물 요건(50% 이상)을 넘습니다. 연도 미확인 ${s.unknownYear}동은 비율에서 제외했습니다.`,
      '빈 점포':!data.vacancy?'실제 공실 수와 공실률은 아직 확인되지 않았습니다. 확정 구역계(1안)로 공실 신호(인허가 폐업·상가정보 분기 비교·매물)를 다시 모으는 중입니다.':`실제 공실 수와 공실률은 아직 확인되지 않았습니다. 확정 구역계(1안)로 다시 모은 신호는 ① 건물 기준 빈 점포 후보 ${classes.shop||0}동 ② 인허가 폐업 신호 ${data.vacancy.localdata.signals.length}곳(2022년 이후 폐업, 같은 주소 영업 신고 없음) ③ 상가정보 ${data.vacancy.sbiz.compare}→${data.vacancy.sbiz.latest} 사이 사라진 점포 ${data.vacancy.sbiz.vanished.length}곳 ④ 지금 공개 매물 구역 안 ${data.vacancy.listings.items.filter(l=>l.zone==='구역 안').length}건입니다. 서로 다른 자료라 더하지 않으며 모두 현장 확인 대상입니다.`,
      '시 13곳':`김해시 우선순위 대상지 13곳(2026-10-08 목록) 중 ${sitesIn().length}곳(${sitesIn().map(t=>t.rank).join('·')}번)이 확정 구역계(1안) 안, ${sitesOut().length}곳(${sitesOut().map(t=>t.rank).join('·')}번)은 봉황대길 북측이라 구역 밖입니다(재배치 검토 중 — 사업 배치는 결정 대기). 13곳 모두 역사문화환경보존지역·중점경관관리구역입니다. 거점 후보는 5번(봉황동 15-2)과 10번(봉황동 23-3)으로 구역 안이고, 개인 창작 공간 후보 13번은 구역 밖입니다. 구역 안에서 경계에 가장 가까운 곳은 ${nearest.rank}번으로 약 ${num(nearest.edgeM)}m 안쪽입니다.`,
      '유동인구':`구역 안 와이파이 측정지점은 ${s.wifiInside}곳${data.wifiInside.length?`(${data.wifiInside.map(f=>f.properties.n).join('·')})`:''}입니다.${ctx?` 경계 300m 안 측정지점은 ${ctx.wifiNear.length}곳(${ctx.wifiNear.map(w=>`${w.name} 하루 ${num(w.daily)}`).join(' · ')})입니다.`:' 주변 측정지점은 새 구역 재수집 중입니다.'} 이 값으로 구역 전체의 사람 수를 계산하지 않았습니다.`,
      '도로·교통':!ctx?'도로·진출입구·정류장은 확정 구역계(1안)로 다시 계산하는 중입니다.':`구역 안 차량 도로 ${num(ctx.roads.totalM)}m 중 대로 ${num(ctx.roads.byTier['대로'])}m · 중로 ${num(ctx.roads.byTier['중로'])}m · 소로 ${num(ctx.roads.byTier['소로'])}m입니다. 진출입구 ${ctx.gates.total}곳 중 대로 ${ctx.gates.byTier['대로']}곳. 가장 가까운 경전철역은 ${ctx.rail[0].name}역(경계에서 ${num(ctx.rail[0].distM)}m, 하루 승하차 ${num(ctx.rail[0].daily)}명)입니다.`,
      '인구·사업체':`확정 구역계와 정확히 일치하는 인구·사업체 변화 자료는 확보되지 않았습니다. 구역 안 건물의 법정동은 ${Object.entries(s.dongs).map(([k,v])=>`${k} ${v}동`).join('·')}입니다. 쇠퇴 요건의 인구·사업체는 행정동 통계라 구역만의 값이 아니며, 면적 비율로 나눠 구역 수치로 바꾸지 않습니다.`,
      '경계':`${DATE()} 확정 구역계(1안)이며 면적은 ${num(data.area)}㎡(${areaLabel()}, 카카오맵 면적재기 실측)입니다. 선은 도로 안쪽 가장자리를 따르며 지적 경계가 아닙니다. 주변 ${data.edgeBuildingIndices.length}동은 포함 여부 재확인이 필요합니다. 옛 확정 구역계(10/11)는 회색 점선 참고로만 남깁니다.`
    };
    $('b-questions').onclick=e=>{const key=e.target.textContent;if(answers[key])$('b-answer').textContent=answers[key];};
    ['b-stores','b-roads','b-gates','b-review','b-compare','b-prev','b-wifi','b-sites-on','b-closed','b-vanished','b-iso','b-loop','b-tour',...(data.rone?['b-rone']:[]),...(data.sbizZone?.items?.length?['b-sbizzone']:[]),...(data.heritage?['b-heritage']:[]),...(data.landUse537?['b-hazard']:[]),...(data.archPms?['b-archpms']:[])].forEach(id=>{if($(id))$(id).onchange=renderLayers;});
    const surveyApply=()=>{if(!map.getLayer('bs-survey'))return;map.setFilter('bs-survey',['in',['get','c'],['literal',[...surveyOn]]]);document.querySelectorAll('#b-survey [data-survey]').forEach(x=>x.setAttribute('aria-pressed',String(surveyOn.has(x.dataset.survey))));if(!active)switchScope(true);renderLayers();setVisibility('bs-survey',surveyOn.size>0);};
    if($('b-survey')){$('b-survey').querySelector('.b-survey-grid').onclick=e=>{const k=e.target.closest('[data-survey]')?.dataset.survey;if(!k)return;surveyOn.has(k)?surveyOn.delete(k):surveyOn.add(k);surveyApply();};
      $('b-survey-all').onclick=()=>{surveyOn=new Set('ABCDE'.split(''));surveyApply();frame(350,true);};
      $('b-field13-csv').onclick=()=>{const sv=data.survey.points.features.filter(f=>'AB'.includes(f.properties.c)).map(f=>f.properties);downloadCSV([['구분','순위·지번','도로명','판정·용도','근거 신호','사진 방향(직접)','출입 상태(직접)','층별 사용·빈 층(직접)','실측 가로×세로·층고(직접)','수도·전기 계량기 번호(직접)','상인·부동산 의견(직접)','조사자·시각(직접)'],...data.sites.map(t=>['시 우선순위',t.rank+'. '+t.jibun,'',(t.ledger?t.ledger.use+' '+t.ledger.floors:'건물 없음')+' · '+t.type,t.state,'','','','','','','']),...sv.map(p=>['전수조사 '+p.c,p.jibun,p.road,p.judge+' · '+p.use,p.signals,'','','','','','',''])],'확정구역계1안_목요일현장확인표');};}
    setVisibility('bs-survey',false);
    for(const [btn,box] of [['b-tour-toggle','b-tour'],['b-iso-toggle','b-iso'],['b-loop-toggle','b-loop']])if($(btn))$(btn).onclick=()=>{$(box).checked=true;if(!active)switchScope(true);is3d=false;$('b-3d').setAttribute('aria-pressed','false');renderLayers();frame(350,box==='b-loop');};  // 길·도보권은 입체 건물에 가려지므로 평면으로
    ['b-query','b-only-candidate','b-only-edge','b-building-group'].forEach(id=>$(id).addEventListener('input',()=>{buildingLimit=30;renderResults();}));
    $('b-groups').onclick=e=>{const key=e.target.closest('[data-group]')?.dataset.group;if(!key)return;$('b-building-group').value=key;$('b-only-candidate').checked=false;$('b-only-edge').checked=false;$('b-query').value='';buildingLimit=30;renderResults();};
    $('b-clear').onclick=()=>{$('b-building-group').value='all';$('b-query').value='';$('b-only-candidate').checked=false;$('b-only-edge').checked=false;buildingLimit=30;renderResults();};
    $('b-more').onclick=()=>{buildingLimit+=30;renderResults();};
    $('b-filter-csv').onclick=()=>exportBuildings(buildingRows,'확정구역계1안_조건선택_건물');
    $('b-field-csv').onclick=()=>downloadCSV([['원본번호','건물명','주소','용도','사용승인연도','선정조건','구역포함','경계확인','조사일','영업상태(현장확인)','공실층_호수(현장확인)','건물상태_보행불편','사진번호','메모'],...buildingRows.map(({properties:p})=>[p.bidx,p.nm,[p.d,p.rn,p.bn].filter(Boolean).join(' '),p.pu,p.yr||'',buildingCondition(),p.inside===false?'아니오':'예',p.edge?'필요':'','','','','','',''])],'확정구역계1안_현장기록표');
    ['b-industry','b-store-query'].forEach(id=>$(id).addEventListener('input',()=>{storeLimit=20;renderStores();}));
    $('b-industry-bars').onclick=e=>{const button=e.target.closest('[data-industry]');if(!button)return;$('b-industry').value=button.dataset.industry;storeLimit=20;renderStores();};
    $('b-store-clear').onclick=()=>{$('b-industry').value='';$('b-store-query').value='';storeLimit=20;renderStores();};
    $('b-store-more').onclick=()=>{storeLimit+=20;renderStores();};
    $('b-store-filter-csv').onclick=()=>exportStores(storeRows,'확정구역계1안_조건선택_등록점포');
    $('b-site-list').onclick=e=>{const b=e.target.closest('[data-rank]');if(!b)return;const t=data.sites.find(x=>String(x.rank)===b.dataset.rank);if(!t)return;if(!active)switchScope(true);$('b-sites-on').checked=true;renderLayers();map.easeTo({center:t.lnglat,zoom:18.3,duration:400});showSite(t.lnglat,t);};
    $('b-brief').onclick=exportBrief;
    $('b-csv').onclick=()=>exportBuildings(buildings,'확정구역계1안_건물');
    $('b-edge-csv').onclick=()=>exportBuildings(reviewBuildings(),'확정구역계1안_경계주변검토');
    $('b-store-csv').onclick=()=>exportStores(stores,'확정구역계1안_등록점포');
    $('b-site-csv').onclick=()=>downloadCSV([['시순위','지번','구입유형','역할(10/8 미팅)','시 자료 상태','면적·층(대장)','개별공시지가_원/㎡(2026.01)','지목','토지면적_㎡','대장_주용도','대장_지상/지하','대장_연면적㎡','건폐율%','용적률%','사용승인일','용도지역·지구','도시계획도로','다른 법령 지역·지구','경관 등(시행령 9조)','경도','위도','경계까지(m)','조사일','현장상태(직접기입)','메모'],...data.sites.map(t=>[t.rank,t.jibun,t.type,roleLabel[t.role]||t.role,t.state,t.areaNote,t.officialPrice?.wonPerM2??'',t.officialPrice?.land??'',t.officialPrice?.areaM2??'',t.ledger?.use??'건물 없음',t.ledger?.floors??'',t.ledger?.grossM2??'',t.ledger?.bcr??'',t.ledger?.far??'',t.ledger?.approved??'',[...(t.landUse?.zoning||[]),...(t.landUse?.district||[])].join(' / '),(t.landUse?.road||[]).join(' / '),(t.landUse?.other||[]).join(' / '),(t.landUse?.article9||[]).join(' / '),t.lnglat[0],t.lnglat[1],t.edgeM,'','',''])],'확정구역계1안_시우선순위13곳');
    if($('b-vacancy-csv'))$('b-vacancy-csv').onclick=()=>{const v=data.vacancy;downloadCSV([['구분','업종','주소','기준일','경도','위도','출처','현장상태(직접기입)','메모'],...v.localdata.signals.map(x=>['인허가 폐업 신호',x.kinds.join(' / '),x.address,'폐업 '+x.closed,x.lnglat[0],x.lnglat[1],v.localdata.source,'','']),...v.sbiz.vanished.map(x=>['상가정보 사라짐('+v.sbiz.compare+'→'+v.sbiz.latest+')',x.kind,x.address+(x.floor?' '+x.floor+'층':''),v.sbiz.latest,x.lnglat[0],x.lnglat[1],v.sbiz.source,'','']),...v.listings.items.map(x=>['현재 매물('+x.zone+')',x.kind+' '+x.deal,x.place,'확인 '+x.checked,x.lnglat?.[0]??'',x.lnglat?.[1]??'',x.platform+' '+x.url,'',''])],'확정구역계1안_공실신호');};
    if($('b-closed-toggle'))$('b-closed-toggle').onclick=()=>{$('b-closed').checked=true;if(!active)switchScope(true);renderLayers();frame(350,true);};
    if($('b-vanished-toggle'))$('b-vanished-toggle').onclick=()=>{$('b-vanished').checked=true;if(!active)switchScope(true);renderLayers();frame(350,true);};
    if($('b-cand-toggle'))$('b-cand-toggle').onclick=()=>{mode='candidate';$('b-mode').value='candidate';if(!active)switchScope(true);renderLayers();frame(350,true);};
    if($('b-rone-toggle'))$('b-rone-toggle').onclick=()=>{$('b-rone').checked=true;if(!active)switchScope(true);renderLayers();frame(350,false);};
    if($('b-archpms-toggle'))$('b-archpms-toggle').onclick=()=>{$('b-archpms').checked=true;if(!active)switchScope(true);renderLayers();frame(350,true);};
    if($('b-archpms-csv'))$('b-archpms-csv').onclick=()=>downloadCSV([['연도','허가 건수',...Object.keys(data.archPms.types)],...data.archPms.years.map(y=>[y.year,y.n,...Object.keys(data.archPms.types).map(t=>y.byType[t]||0)])],'건축인허가_연도별_확정구역계');
    if($('b-hazard-toggle'))$('b-hazard-toggle').onclick=()=>{$('b-hazard').checked=true;if(!active)switchScope(true);renderLayers();frame(350,true);};
    if($('b-heritage-toggle'))$('b-heritage-toggle').onclick=()=>{$('b-heritage').checked=true;if(!active)switchScope(true);renderLayers();frame(350,true);};
    if($('b-rtms-csv'))$('b-rtms-csv').onclick=()=>downloadCSV([['종류','연도','건수','봉황동','부원동','서상동','월세 비중(%)','신규','갱신'],...Object.values(data.rtms.kinds).flatMap(k=>k.years.map(y=>[k.name,y.year,y.n,y.byDong['봉황동']||0,y.byDong['부원동']||0,y.byDong['서상동']||0,y.wolsePct??'',y.new??'',y.renew??'']))],'실거래_연도별_봉황부원서상');
    if($('b-timeline-csv'))$('b-timeline-csv').onclick=()=>downloadCSV([['날짜','구분','제목','요지','출처','주소'],...[...data.timeline.events,...data.timeline.facilities].sort((a,b)=>String(a.date).localeCompare(String(b.date))).map(e=>[e.date,e.type,e.title,e.summary,e.source,e.url])],'봉리단길_원도심_연표');
    if($('b-sbizzone-toggle'))$('b-sbizzone-toggle').onclick=()=>{$('b-sbizzone').checked=true;if(!active)switchScope(true);renderLayers();frame(350,false);};
    $('b-geo').onclick=()=>download(JSON.stringify({...data.boundary,properties:{...data.boundary.properties,source:data.source,note:data.sourceNote,status:'확정 구역계(1안) · 카카오맵 면적재기 선 · 지적 경계 아님',confirmed:data.confirmed,area_m2:data.area}},null,2),'김해_확정구역계1안_261030.geojson','application/geo+json');
    $('b-shot').onclick=shot;
    renderResults();
    renderStores();
  }
  // 구역 안 건물은 용도지역과 관계없이 분류한다(원래 화면 규칙은 상업·준주거만 — 확정 구역계는 66.7%가 주거지역) — build/zone261011_base.py
  const zoneCl=i=>{const p=D.bld.features[i].properties;return p.sc>0?'biz':(data.emptyShop?.cls?.[i]||p.cl);};
  function reviewBuildings(){return data.edgeBuildingIndices.map(i=>{const inside=data.buildingIndices.includes(i);return {...D.bld.features[i],properties:{...D.bld.features[i].properties,bidx:i,inside,edge:true,...(inside?{cl:zoneCl(i)}:{})}};});}
  function renderResults(){
    const group=$('b-building-group').value;
    buildingRows=insights.filterBuildings($('b-only-edge').checked?reviewBuildings():buildings,{group,candidate:$('b-only-candidate').checked,query:$('b-query').value});
    const outside=buildingRows.filter(f=>f.properties.inside===false).length;
    $('b-results-status').textContent=`${buildingCondition()} · ${num(buildingRows.length)}동 중 ${Math.min(buildingLimit,buildingRows.length)}동 표시${outside?` · 구역 밖 ${outside}동 포함`:''}${buildingRows.length?'':' · 조건을 바꾸거나 초기화해 주세요.'}`;
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
  const rvLine=jb=>{const r=data.roadview?.byJibun?.[jb];return r?`<p>과거 로드뷰: ${r.panels.map(x=>`${esc(x.date.slice(0,7))} ${esc(x.state)}${x.conf==='낮음'?'(확신 낮음)':''}`).join(' · ')}${r.note?`<br>${esc(r.note)}`:''}<br><span style="opacity:.75">길에서 본 1층 앞모습 · 공실 확정 아님</span></p>`:'';};
  function showSite(ll,t){popup?.remove();popup=new maplibregl.Popup({maxWidth:'340px',offset:10}).setLngLat(ll).setHTML(`<div class="b-popup"><strong>시 우선순위 ${esc(t.rank)} · ${esc(t.jibun)}</strong><p>${esc(t.type)} · ${esc(roleLabel[t.role]||t.role)}</p>${t.state?`<p>${esc(t.state)}</p>`:''}${t.areaNote?`<p>${esc(t.areaNote)}</p>`:''}${t.officialPrice?`<p>공시지가 2026 ${num(t.officialPrice.wonPerM2)}원/㎡ · ${esc(t.officialPrice.land)} ${num(t.officialPrice.areaM2)}㎡</p>`:''}${t.landUse?`<p>${esc([...t.landUse.zoning,...t.landUse.district,...t.landUse.road,...t.landUse.other.filter(x=>!x.startsWith('가축')),...t.landUse.article9].join(' · '))}</p>`:''}${t.ledger?`<p>대장: ${esc(t.ledger.use)} · 지상/지하 ${esc(t.ledger.floors)} · ${t.ledger.bldgs>1?`대장 ${t.ledger.bldgs}동 · 대표 동 연면적`:'연면적'} ${num(t.ledger.grossM2)}㎡${t.ledger.bcr!=null?` · 건폐율 ${t.ledger.bcr}% · 용적률 ${t.ledger.far}%`:''} · 사용승인 ${esc(t.ledger.approved)}</p>`:'<p>대장: 건물 없음(나대지·고물상 등)</p>'}${t.floorsDetail?.length?`<details><summary>층별 개요 ${t.floorsDetail.length}줄${t.ledger?.bldgs>1?` · 대장 ${t.ledger.bldgs}동 전체 합 ${num(Math.round(t.floorsDetail.reduce((n,f)=>n+(+f.areaM2||0),0)*100)/100)}㎡`:''}</summary><p>${t.floorsDetail.map(f=>`${esc(f.bldg?f.bldg+' ':'')}${esc(f.floor)} ${esc(f.useDetail||f.use)} ${num(f.areaM2)}㎡`).join('<br>')}</p></details>`:''}${rvLine(t.jibun)}${t.photo?`<img class="b-popup-photo" src="${esc(t.photo)}" alt="">`:''}<p>김해시 목록 2026-10-08 · 지번 위치 점 · ${t.inside?`경계에서 약 ${esc(t.edgeM)}m 안쪽`:`<b>구역 밖(재배치 검토 중)</b> — 경계 밖 약 ${esc(t.edgeM)}m`}<br>현재 공실·사용 가능 여부는 현장 확인 필요</p></div>`).addTo(map);}
  function exportStores(rows,name){downloadCSV([['원본번호','상호','주소','대분류','중분류','세부업종','등록층','경도','위도','자료기준','현재영업여부'],...rows.map(p=>[p.sid,p.nm,p.rd||p.ad,p.L,p.M,p.S,p.fl,p.lon,p.lat,'2026-06','현장 확인 필요'])],name);}
  function exportBrief(){
    const a=analysis,s=data.stats,r=data.relation;
    download([`김해 ${NAME} ${areaLabel()} 분석 요약 (${DATE()} 확정)`,`범위: ${data.source} / ${num(data.area)}㎡ / 지적 경계 아님`,`권장 15만㎡보다 ${num(r.over150k)}㎡ 넓음 · 옛 확정 구역계(10/11)와 겹침 ${num(r.oldZoneOverlap)}㎡`,`건물 ${a.total}동, 등록점포 ${stores.length}개`,`20년 이상 ${a.old20}동 / 연도 확인 ${a.known}동 = ${a.oldPct}% (2026년 기준, 노후건축물 요건 50% 이상 충족)`,`40년 이상 ${a.counts.old40}동 / 연도 확인 ${a.known}동 = ${insights.pct(a.counts.old40,a.known)}%`,`연도 미확인 ${a.counts.unknown}동은 노후 비율에서 제외`,`주택 ${a.residential}동, 근린생활시설 ${a.neighborhood}동 (건물 주용도 기준)`,`소매·음식 ${a.foodRetail}개 / 등록점포 ${stores.length}개 = ${a.foodRetailPct}%`,'',...a.industries.map(([k,n])=>`${k}: ${n}개 (${insights.pct(n,stores.length)}%)`),'',`시 우선순위 대상지 13곳 (2026-10-08 목록) — ${sitesLine()}`,...data.sites.map(t=>`${t.rank}. ${t.jibun} — ${t.inside?'':'[구역 밖·재배치 검토 중] '}${siteLine(t)}`),'',`현장 공실 확인 후보 ${a.counts.candidate}동 (등록 가게 0 + 근생·숙박·위락·판매 건물, 용도지역 무관 · 공실 확정 아님)`,`후보 중 경계 안쪽 확인 대상 ${a.candidateEdge}동 (중복 집계 주의)`,`경계 안쪽 확인 대상 ${s.edgeInside}동 / 양쪽 20m 확인 대상 ${data.edgeBuildingIndices.length}동`,'','검토 제안: 오래된 건물 상태·공실 여부·보행 불편을 현장에서 함께 확인.','확인되지 않은 것: 실제 공실 수·공실률, 영업 여부, 구역에 맞는 인구·사업체 변화·유동인구.','건물 연도는 안전등급이 아니며, 등록점포는 현재 영업점 수가 아님.','경계는 카카오맵 면적재기 선을 옮긴 도형이며 지적 경계가 아님. 지적 경계 자료를 받으면 다시 맞춤.','자료: 기존 환경분석맵 건물자료 / 상가정보 2026-06 / 연도 계산 2026 / 시 대상지 목록 2026-10-08. 공실·도로·연결 등 구역 안 자료는 새 구역 재수집 중.','위 수치는 확정 구역계 전체 기준이며 화면 검색 조건과 무관.'].join('\n'),'김해_확정구역계1안_분석요약.txt','text/plain;charset=utf-8');
  }
  function showBuilding(ll,p){popup?.remove();popup=new maplibregl.Popup({maxWidth:'300px'}).setLngLat(ll).setHTML(`<div class="b-popup"><strong>${esc(p.nm||p.rn||p.bn||'건물 상세')}</strong><p>${esc(p.rn||p.d||'')} ${esc(p.bn||'')}</p><p>${esc(p.pu||'용도 미확인')} · ${p.yr?esc(p.yr)+'년':'연도 미확인'} · ${esc(p.fl||'?')}층</p><p>${esc(labels[p.cl]||'미분류')} · 연결점포 ${esc(p.sc||0)}개</p><p>${p.inside===false?'구역 밖 · 참고용':'확정 구역계 집계 포함'}${p.edge?' / 경계 주변: 포함 여부 확인 필요':''}</p><p>등록정보만으로 실제 영업·공실을 확정할 수 없습니다.</p></div>`).addTo(map);}
  function download(content,name,type){const url=URL.createObjectURL(content instanceof Blob?content:new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);$('b-export-status').textContent=name+' 내려받기를 요청했습니다.';}
  function downloadCSV(rows,name){const cell=v=>{let s=String(v??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};download('﻿'+rows.map(r=>r.map(cell).join(',')).join('\r\n'),name+'.csv','text/csv;charset=utf-8');}
  function exportBuildings(rows,name){downloadCSV([['원본번호','건물명','도로명','건물번호','법정동','용도','사용승인연도','층수','연결점포수','확인분류','구역포함','경계주변확인'],...rows.map(f=>{const p=f.properties;return [p.bidx,p.nm,p.rn,p.bn,p.d,p.pu,p.yr||'',p.fl,p.sc,labels[p.cl],p.inside===false?'아니오':'예',p.edge?'필요':''];})],name);}
  function shot(){
    if(!active)return;
    if(map.isMoving()){map.once('moveend',shot);return;}
    $('b-export-status').textContent='그림을 만들고 있습니다…';
    map.once('render',()=>{try{
      const src=map.getCanvas(),c=document.createElement('canvas'),width=Math.max(960,src.width),height=Math.round(src.height*width/src.width),footer=285;
      c.width=width;c.height=height+footer;const ctx=c.getContext('2d');ctx.drawImage(src,0,0,width,height);
      ctx.fillStyle='#101923';ctx.fillRect(0,height,width,footer);ctx.fillStyle='#fff';ctx.font='bold 24px sans-serif';
      ctx.fillText(`김해 ${NAME} ${areaLabel()} · ${DATE()} 확정`,24,height+34);ctx.font='18px sans-serif';
      ctx.fillText(`구역 전체: 건물 ${data.stats.buildings}동 / 등록점포 ${data.stats.stores}개 / 20년 이상 ${data.stats.oldPct}% (연도 확인 기준) / 시 우선순위 ${sitesLine()}`,24,height+64,width-48);
      ctx.fillStyle='#ffb49f';ctx.fillText(`카카오맵 면적재기 선(${num(data.area)}㎡) · 지적 경계 아님 · 경계 주변 건물 포함 여부 확인 필요`,24,height+93,width-48);
      ctx.font='15px sans-serif';let x=24,y=height+126;
      for(const item of $('b-legend').children){const label=item.textContent,w=ctx.measureText(label).width+38;if(x+w>width-24){x=24;y+=25;}ctx.fillStyle=item.querySelector('i').style.background;ctx.fillRect(x,y-12,12,12);ctx.fillStyle='#ecf2f9';ctx.fillText(label,x+18,y);x+=w;}
      ctx.fillStyle='#cad7e4';
      const overlays=['민트 선: 확정 구역계(1안)'];if($('b-sites-on').checked)overlays.push('빨간 점: 시 우선순위 구역 안 · 회색 점: 구역 밖');if(chk('b-compare'))overlays.push('파란 점선: 기존 사업구역');if(chk('b-prev'))overlays.push('회색 점선: 옛 확정 구역계(10/11)');if(buildingFiltered())overlays.push(`노란 건물: 조건 ${buildingRows.length}동`);if($('b-review').checked)overlays.push('노란 테두리: 경계 주변');if($('b-stores').checked)overlays.push(`민트 점: 등록 ${storeRows.length}개`);if(chk('b-roads'))overlays.push('노란선: 구역 안 도로');if(chk('b-gates'))overlays.push('흰 점: 진출입구');if(chk('b-wifi'))overlays.push('회색 점: 와이파이');if(chk('b-closed'))overlays.push('분홍 테두리: 인허가 폐업 신호');if(chk('b-vanished'))overlays.push('회색 점: 상가정보 사라짐');if(data.rone&&$('b-rone').checked)overlays.push('노란 점선: 부동산원 표본 상권');if(data.sbizZone?.items?.length&&$('b-sbizzone').checked)overlays.push('주황 점선: 소진공 주요 상권');if(data.heritage&&$('b-heritage').checked)overlays.push('갈색: 국가유산 구역');if(data.landUse537&&$('b-hazard').checked)overlays.push('하늘색 점: 자연재해위험개선지구');if(data.archPms&&$('b-archpms').checked)overlays.push('색 점: 2016년 이후 건축 인허가 지번');
      let overlayLine='',overlayY=height+175;
      for(const label of overlays){const next=overlayLine?overlayLine+' · '+label:label;if(ctx.measureText(next).width>width-48){ctx.fillText(overlayLine,24,overlayY);overlayY+=20;overlayLine=label;}else overlayLine=next;}
      ctx.fillText(overlayLine,24,overlayY);
      ctx.font='13px sans-serif';ctx.fillText(`건물 조건: ${buildingCondition()} / 점포: ${$('b-industry').value||'전체 업종'}${$('b-store-query').value.trim()?' · 검색 '+$('b-store-query').value.trim():''}`,24,height+225,width-48);
      ctx.fillText(`자료: 기존 환경분석맵 / 상가정보 2026.06 / 확정 구역계(1안) ${DATE()} / 시 대상지 목록 2026-10-08 · 2026년 기준`,24,height+247,width-48);
      const backgroundCredit=map.getLayoutProperty('sat','visibility')==='none'?'© OpenStreetMap contributors · openstreetmap.org/copyright':'Esri World Imagery';
      ctx.fillText('배경지도: '+backgroundCredit,24,height+270,width-48);
      c.toBlob(blob=>{if(blob)download(blob,'김해_확정구역계1안_검토지도.png','image/png');else $('b-export-status').textContent='그림 저장 실패. 다시 시도해 주세요.';},'image/png');
    }catch(e){$('b-export-status').textContent='그림 저장 실패: '+e.message;}});map.triggerRepaint();
  }
  // The base page's tables (노후 판정표·대상지 구역계 탭) are drawn once by ui(); add the confirmed zone on top without touching their data.
  function annotateBase(){
    const s=data.stats;
    const rtab=$('rtab');
    if(rtab&&!rtab.querySelector('.zone-row')){const row=document.createElement('tr');row.className='zone-row';row.innerHTML=`<td>${NAME} ${areaLabel()} (10/30)</td><td>${num(s.old20)}</td><td><b>${s.oldPct}%</b></td><td>${s.oldPct>=50?'충족':'미달'}</td>`;(rtab.tBodies[0]||rtab).firstElementChild.after(row);}
    const zbox=$('zbox');
    if(zbox&&!zbox.querySelector('.zone-confirmed')){
      const comm=buildings.filter(f=>/상업|준주거/.test(f.properties.z||'')).length;
      const es=data.emptyShop,shop=es?es.any.shop:buildings.filter(f=>f.properties.cl==='shop').length,res=es?es.any.res:buildings.filter(f=>f.properties.cl==='res').length;
      const box=document.createElement('div');box.className='zbox zone-confirmed';
      box.innerHTML=`<div class="t">${NAME} (${DATE()})</div><div class="s">${areaLabel()} · ${num(data.area)}㎡ · RE:CORE 대상지</div><table><tr><td>건물</td><td><b>${num(s.buildings)}</b>동</td></tr><tr><td>등록점포 위치</td><td>${num(s.stores)}개소</td></tr>${es?`<tr><td>상업·준주거</td><td>${num(comm)}동</td></tr><tr><td>빈 점포 후보(용도지역 무관)</td><td><b>${num(shop)}</b>동</td></tr><tr><td>상업·준주거만 보면</td><td>${num(es.orig.shop)}동</td></tr><tr><td>주거용(빈집 조사)</td><td>${num(res)}동</td></tr>`:'<tr><td>빈 점포 후보</td><td>새 구역 재수집 중</td></tr>'}<tr><td>20년 이상 노후</td><td><b>${s.oldPct}%</b></td></tr><tr><td>시 우선순위</td><td>13곳 중 ${sitesIn().length}곳 안</td></tr></table>`;
      box.onclick=e=>{e.stopPropagation();showBoundary();frame(450,true);};
      zbox.prepend(box);
    }
    if(rtab&&data.ledger&&!rtab.querySelector('.zone-row-ledger')){const row=document.createElement('tr');row.className='zone-row zone-row-ledger';row.innerHTML=`<td>${NAME} · 건축물대장 기준(동)</td><td>${num(data.ledger.old20)}</td><td><b>${data.ledger.old20Pct}%</b></td><td>${data.ledger.old20Pct>=50?'충족':'미달'}</td>`;rtab.querySelector('.zone-row').after(row);
      const note=document.createElement('div');note.className='note zone-tab-note';note.innerHTML=`위 두 줄은 ${DATE()} 확정 구역계(1안 · ${areaLabel()}). 「기준지 반경」 줄은 8월 기준지(부원동 706-16) 중심이라 확정 구역계와 범위가 다릅니다.`;rtab.after(note);}
    const vzone=$('vzone');
    if(vzone&&data.vacancy&&!vzone.querySelector('.zone-vrow')){const c=data.emptyShop?{...data.emptyShop.any}:{shop:0,res:0,non:0,unk:0};if(!data.emptyShop)buildings.forEach(f=>{const p=f.properties;if(p.sc===0&&c[p.cl]!=null)c[p.cl]++;});const row=document.createElement('div');row.className='zone-vrow';row.style.cssText='padding:6px 0;border-top:1px solid rgba(255,255,255,.07)';row.innerHTML=`<div style="font-weight:700;color:#8af2d1">${NAME} 안 (${DATE()})</div><div style="font-size:11px;color:#8b949e;margin-top:2px">등록 가게 0 건물(용도지역 무관): 빈 점포 후보 <b style="color:#ff7a5c">${num(c.shop)}</b> · 주거 ${num(c.res)} · 비대상 ${num(c.non)} · 불명 ${num(c.unk)}${data.emptyShop?` (상업·준주거만 ${num(data.emptyShop.orig.shop)})`:''} — 인허가 폐업 신호 ${num(data.vacancy.localdata.signals.length)}곳 등은 「확정 구역계 상세 분석 → 공실 신호」</div>`;vzone.prepend(row);}
    const p11=$('p11');
    if(p11&&data.context&&!p11.querySelector('.zone-tab-note')){const h=[...p11.querySelectorAll('h3')].find(x=>x.textContent.includes('도로 위계'));if(h){const note=document.createElement('div');note.className='note zone-tab-note';note.innerHTML=`<b>${NAME}(${areaLabel()}) 기준</b> — 차량 도로 ${num(data.context.roads.totalM)}m 전부 소로 · 진출입구 ${num(data.context.gates.total)}곳(대로 ${data.context.gates.byTier['대로']}) · 점포 ${num(data.context.storeDistance.bands['100m 밖'])}곳이 대로·중로에서 100m 밖. 아래 값은 이전 사업구역(51.8ha) 기준입니다.`;h.before(note);}}
    const p5=$('p5');
    if(p5&&!p5.querySelector('.zone-p5')){const rows=data.sites.filter(t=>t.officialPrice).map(t=>({t,v:t.officialPrice.wonPerM2*t.officialPrice.areaM2}));
      const box=document.createElement('div');box.className='zone-p5';box.innerHTML=`<h3 style="margin-top:22px">시 우선순위 13곳 개별공시지가 — ${sitesLine()}</h3><div class="scope">공간단위 <b style="color:#e6edf3">필지</b> · 기준 2026/01 · 토지이음 · 단순 계산액 = 공시지가 × 토지면적(감정가·매입비 아님)</div><table><tr><th>순위·지번</th><th style="text-align:right">토지㎡</th><th style="text-align:right">원/㎡</th><th style="text-align:right">단순 계산액</th></tr>${rows.map(({t,v})=>`<tr><td>${t.rank}. ${esc(t.jibun)}${[5,10].includes(t.rank)?' <b style="color:#8af2d1">거점</b>':''}${t.inside?'':' <span style="color:#9aa5b1">구역 밖(재배치 검토 중)</span>'}</td><td style="text-align:right">${num(t.officialPrice.areaM2)}</td><td style="text-align:right">${num(t.officialPrice.wonPerM2)}</td><td style="text-align:right">${(v/1e8).toFixed(1)}억</td></tr>`).join('')}</table><div class="note">위 「거점 3개소」는 8월 검토 거점입니다. 그중 <b>거점②(3,563㎡)는 지금 13번(서상동 258-1)과 같은 필지</b>이고, 10/8부터 핵심 거점 후보는 5번(봉황동 15-2)·10번(23-3)입니다. 실거래/공시 배율·매입 협상은 기존 방법대로 필지별로 다시 확인합니다.</div>`;p5.append(box);}
    const p2=$('p2');
    if(p2&&!p2.querySelector('.zone-p2-note')){const note=document.createElement('div');note.className='note zone-p2-note';note.innerHTML=`<b>${DATE()} RE:CORE 대상지 구역계(1안) 확정 — ${areaLabel()}(${num(data.area)}㎡)</b><br>지도의 <b>민트 선</b>. 북서 봉황대길·남 김해대로·동측 대로 안쪽 범위로, 시 우선순위 ${sitesLine()}입니다. 옛 확정 구역계(10/11)는 「확정 구역계 상세 분석」에서 회색 점선으로만 비교합니다. 아래 상자 중 맨 위가 확정 구역계(1안)이고, 나머지 3종(도판 추출 구역계)은 이전 검토 범위입니다. 기존 사업구역(51.8ha)과 겹치는 곳은 약 ${haLabel(data.relation.blueOverlap)}입니다.`;p2.querySelector('h2').after(note);}
  }
  function initialize(){
    const edge=new Set(data.edgeBuildingIndices);
    buildings=data.buildingIndices.map(i=>({...D.bld.features[i],properties:{...D.bld.features[i].properties,bidx:i,inside:true,edge:edge.has(i),cl:zoneCl(i)}}));
    stores=data.storeIndices.map(i=>({...D.store[i],sid:i}));
    const verify=buildings.filter(f=>f.properties.yr>0),old=verify.filter(f=>f.properties.yr<=2006);
    if(buildings.length!==data.stats.buildings||stores.length!==data.stats.stores||verify.length!==data.stats.knownYear||old.length!==data.stats.old20)throw Error('원본 자료와 확정 구역계 집계가 다릅니다. 표시 중단.');
    renderPanel();
    const included=new Set(data.buildingIndices);
    addSource('bs-context',fc(D.bld.features.filter((_,i)=>!included.has(i))));
    addLayer({id:'bs-context-flat',type:'fill',source:'bs-context',paint:{'fill-color':colors,'fill-opacity':.55}});
    addLayer({id:'bs-context-3d',type:'fill-extrusion',source:'bs-context',paint:{'fill-extrusion-color':colors,'fill-extrusion-opacity':1,'fill-extrusion-height':['*',['max',['coalesce',['get','fl'],1],1],3.3]}});
    addSource('bs-buildings',fc(buildings));addSource('bs-boundary',data.boundary);addSource('bs-review',fc(reviewBuildings()));addSource('bs-roads',ctx?ctx.roadLines:fc([]));addSource('bs-gates',ctx?ctx.gates.points:fc([]));addSource('bs-wifi',WIFIPT);
    addSource('bs-stores',fc(stores.map(p=>({type:'Feature',geometry:{type:'Point',coordinates:[p.lon,p.lat]},properties:p}))));
    addSource('bs-compare',fc(ZP.features.filter(f=>f.properties.k==='blue')));
    addSource('bs-prev-zonek',data.compare.zoneK);
    if(data.rone)addSource('bs-rone',{type:'Feature',properties:{n:'부동산원 표본 상권 '+data.rone.market},geometry:data.rone.geometry});
    if(data.heritage)addSource('bs-heritage',data.heritage.geo);
    if(data.landUse537)addSource('bs-hazard',data.landUse537.hazard.points);
    if(data.archPms)addSource('bs-archpms',data.archPms.recentPoints);
    if(data.sbizZone?.items?.length)addSource('bs-sbizzone',fc(data.sbizZone.items.map(h=>({type:'Feature',properties:{n:h.name},geometry:h.geometry}))));
    addSource('bs-closed',fc((data.vacancy?.localdata.signals||[]).map((x,i)=>({type:'Feature',geometry:{type:'Point',coordinates:x.lnglat},properties:{i}}))));addSource('bs-vanished',fc((data.vacancy?.sbiz.vanished||[]).map((x,i)=>({type:'Feature',geometry:{type:'Point',coordinates:x.lnglat},properties:{i}}))));
    if(data.survey)addSource('bs-survey',data.survey.points);
    addSource('bs-iso',data.linkage?.layers.iso10||fc([]));addSource('bs-loop',data.linkage?.layers.loop||fc([]));addSource('bs-tour',data.linkage?.layers.tour||fc([]));
    addSource('bs-sites',fc(data.sites.map(t=>({type:'Feature',geometry:{type:'Point',coordinates:t.lnglat},properties:{rank:t.rank,out:t.inside?0:1}}))));
    const hole=data.boundary.geometry.coordinates[0];addSource('bs-mask',{type:'Feature',geometry:{type:'Polygon',coordinates:[[[128.7,35.1],[129.1,35.1],[129.1,35.4],[128.7,35.4],[128.7,35.1]],hole.slice().reverse()]},properties:{}});
    // Same outside dimming as the original map, with only the confirmed boundary cut out.
    addLayer({id:'bs-mask',type:'fill',source:'bs-mask',paint:{'fill-color':'#05070b','fill-opacity':.34}});
    addLayer({id:'bs-flat',type:'fill',source:'bs-buildings',paint:{'fill-color':colors,'fill-opacity':.88,'fill-outline-color':'#222d3b'}});
    addLayer({id:'bs-3d',type:'fill-extrusion',source:'bs-buildings',paint:{'fill-extrusion-color':colors,'fill-extrusion-opacity':.95,'fill-extrusion-height':['*',['max',['coalesce',['get','fl'],1],1],3.3]}});
    addLayer({id:'bs-compare',type:'line',source:'bs-compare',paint:{'line-color':'#64afff','line-width':2,'line-dasharray':[3,2]}});
    addLayer({id:'bs-prev-zonek',type:'line',source:'bs-prev-zonek',paint:{'line-color':'#9aa5b1','line-width':2.5,'line-dasharray':[2,2]}});
    if(data.rone)addLayer({id:'bs-rone',type:'line',source:'bs-rone',paint:{'line-color':'#ffd84d','line-width':3,'line-dasharray':[2,1.5],'line-opacity':.95}});
    if(data.heritage){addLayer({id:'bs-heritage',type:'fill',source:'bs-heritage',paint:{'fill-color':['match',['get','k'],'지정구역','#8a3b12','보호구역','#b8622a','#c9a27a'],'fill-opacity':['match',['get','k'],'지정구역',.45,'보호구역',.35,.12]}});addLayer({id:'bs-heritage-line',type:'line',source:'bs-heritage',paint:{'line-color':'#e0a060','line-width':1.2,'line-opacity':.8}});}
    if(data.archPms)addLayer({id:'bs-archpms',type:'circle',source:'bs-archpms',paint:{'circle-color':['match',['get','type'],'신축','#ff4fa3','용도변경','#9b6bff','증축','#22c7b8','대수선','#f2d14c','#9aa5b1'],'circle-radius':7,'circle-stroke-color':'#ffffff','circle-stroke-width':2}});
    if(data.landUse537)addLayer({id:'bs-hazard',type:'circle',source:'bs-hazard',paint:{'circle-color':'#48c6ff','circle-radius':5.5,'circle-stroke-color':'#0b1118','circle-stroke-width':1.5}});
    if(data.sbizZone?.items?.length)addLayer({id:'bs-sbizzone',type:'line',source:'bs-sbizzone',paint:{'line-color':'#ff9a3d','line-width':3,'line-dasharray':[1,1.4],'line-opacity':.95}});
    // Shared emphasis in overview and detail: tint + halo + dark separation + mint edge.
    // These are visual boundaries drawn from road-centreline blocks, never survey lines or new building classifications.
    addLayer({id:'bs-boundary-fill',type:'fill',source:'bs-boundary',paint:{'fill-color':'#52ffcb','fill-opacity':.16}});
    addLayer({id:'bs-boundary-glow',type:'line',source:'bs-boundary',paint:{'line-color':'#50ffca','line-width':30,'line-blur':9,'line-opacity':.85}});
    addLayer({id:'bs-boundary-case',type:'line',source:'bs-boundary',paint:{'line-color':'#032820','line-width':15,'line-opacity':1}});
    addLayer({id:'bs-boundary-line',type:'line',source:'bs-boundary',paint:{'line-color':'#59ffd1','line-width':8,'line-opacity':1}});
    addLayer({id:'bs-boundary-highlight',type:'line',source:'bs-boundary',paint:{'line-color':'#f1fff9','line-width':2.5,'line-dasharray':[3,2],'line-opacity':1}});
    addLayer({id:'bs-roads',type:'line',source:'bs-roads',paint:{'line-color':['match',['get','tier'],'대로','#ff5a3d','중로','#ffb84d','#ffcd74'],'line-width':['match',['get','tier'],'대로',5,'중로',4,2.5]}});
    addLayer({id:'bs-gates',type:'circle',source:'bs-gates',paint:{'circle-color':['match',['get','tier'],'대로','#ff5a3d','중로','#ffb84d','#e8eef5'],'circle-radius':['match',['get','tier'],'대로',8,'중로',7,5],'circle-stroke-color':'#0b1118','circle-stroke-width':2}});
    addLayer({id:'bs-review',type:'line',source:'bs-review',paint:{'line-color':'#ffde47','line-width':2}});
    addSource('bs-selected',fc([]));
    addLayer({id:'bs-selected-flat',type:'fill',source:'bs-selected',paint:{'fill-color':'#ffdc72','fill-opacity':.95,'fill-outline-color':'#fff5cf'}});
    addLayer({id:'bs-selected-3d',type:'fill-extrusion',source:'bs-selected',paint:{'fill-extrusion-color':'#ffdc72','fill-extrusion-opacity':.95,'fill-extrusion-height':['+',['*',['max',['coalesce',['get','fl'],1],1],3.3],.5]}});
    addLayer({id:'bs-stores',type:'circle',source:'bs-stores',paint:{'circle-color':'#7de5ca','circle-radius':4,'circle-stroke-width':1,'circle-stroke-color':'#082d2b'}});
    addLayer({id:'bs-wifi',type:'circle',source:'bs-wifi',paint:{'circle-color':'#bfcede','circle-radius':6,'circle-stroke-color':'#fff','circle-stroke-width':1}});
    addLayer({id:'bs-iso',type:'fill',source:'bs-iso',paint:{'fill-color':'#5ec8ff','fill-opacity':.14}});addLayer({id:'bs-iso-line',type:'line',source:'bs-iso',paint:{'line-color':'#5ec8ff','line-width':1.5,'line-dasharray':[2,2]}});
    addLayer({id:'bs-tour',type:'line',source:'bs-tour',paint:{'line-color':'#b18cff','line-width':3,'line-opacity':.85}});
    addLayer({id:'bs-loop',type:'line',source:'bs-loop',paint:{'line-color':'#ffffff','line-width':3,'line-dasharray':[1.5,1.2]}});
    if(data.survey)addLayer({id:'bs-survey',type:'circle',source:'bs-survey',filter:['in',['get','c'],['literal',[]]],paint:{'circle-color':['match',['get','c'],'A',SURVEY_COLOR.A,'B',SURVEY_COLOR.B,'C',SURVEY_COLOR.C,'D',SURVEY_COLOR.D,SURVEY_COLOR.E],'circle-radius':['interpolate',['linear'],['zoom'],15,3.5,18,7],'circle-stroke-color':'#0b1118','circle-stroke-width':1}});
    addLayer({id:'bs-vanished',type:'circle',source:'bs-vanished',paint:{'circle-color':'#9aa6b4','circle-radius':6,'circle-stroke-color':'#1b232d','circle-stroke-width':1.5}});
    addLayer({id:'bs-closed',type:'circle',source:'bs-closed',paint:{'circle-color':'rgba(255,90,209,.3)','circle-radius':8,'circle-stroke-color':'#ff5ad1','circle-stroke-width':3}});
    addLayer({id:'bs-sites-ring',type:'circle',source:'bs-sites',paint:{'circle-color':'rgba(0,0,0,0)','circle-radius':['interpolate',['linear'],['zoom'],15,7,18,12],'circle-stroke-color':'#fff','circle-stroke-width':2}});
    addLayer({id:'bs-sites',type:'circle',source:'bs-sites',paint:{'circle-color':['case',['==',['get','out'],1],'#8a929c',SITE_COLOR],'circle-radius':['interpolate',['linear'],['zoom'],15,5,18,9],'circle-stroke-color':'#3a0505','circle-stroke-width':1}});
    ownIds.forEach(id=>setVisibility(id,false));
    // A focus action on the original map must not switch analysis scopes.
    const focusButton=document.createElement('button');focusButton.id='focus-b-area';focusButton.className='zf';
    focusButton.textContent=`${NAME} ${areaLabel()}`;
    focusButton.onclick=()=>{popup?.remove();showBoundary();frame(450,true);};
    $('focusbx').prepend(focusButton);
    // The scope switch stays unscaled; offset the zoomed sticky navigation by its real height.
    new ResizeObserver(()=>panel.style.setProperty('--b-scope-height',switcher.getBoundingClientRect().height+'px')).observe(switcher);
    ready=true;$('scope-b').disabled=false;$('scope-b').textContent='확정 구역계 상세 분석';$('scope-b').onclick=()=>switchScope(true);$('scope-old').onclick=()=>{switchScope(false);frame(350);};
    const label=document.createElement('div');label.className='b-location-label';label.innerHTML=`<b>${NAME} <em>${areaLabel()}</em></b><span>${DATE()} 확정 · 시 13곳 중 ${sitesIn().length}곳 안</span>`;
    const ring=data.boundary.geometry.coordinates[0],anchor=ring.reduce((a,p)=>p[1]>a[1]?p:a,ring[0]);
    new maplibregl.Marker({element:label,anchor:'bottom',offset:[0,-10]}).setLngLat(anchor).addTo(map);
    annotateBase();
    // Newly added legacy layers are hidden and remembered, without changing their data.
    let queued=false;map.on('styledata',()=>{if(active&&!queued){queued=true;queueMicrotask(()=>{queued=false;isolate();});}});
    map.on('click',e=>{if(!active)return;const f=map.queryRenderedFeatures(e.point,{layers:['bs-sites','bs-archpms','bs-survey','bs-closed','bs-vanished','bs-stores','bs-selected-3d','bs-selected-flat','bs-review','bs-3d','bs-flat','bs-wifi']})[0];if(!f)return;const p=f.properties;if(f.layer.id==='bs-sites'){const t=data.sites.find(x=>x.rank===p.rank);if(t)showSite(t.lnglat,t);}else if(f.layer.id==='bs-archpms'){popup?.remove();popup=new maplibregl.Popup({maxWidth:'300px'}).setLngLat(e.lngLat).setHTML(`<div class="b-popup"><strong>${esc(p.jibun)}</strong><p>${esc(p.year)}년 ${esc(p.type)} 허가 · ${esc(p.use)}</p><p>${String(p.approved)==='true'?'사용승인 기록 있음':'사용승인 기록 없음(취소·미착공·공사 중 구분 불가)'}</p><p>2016년 이후 그 지번의 가장 최근 허가 1건 · 건축HUB 건축인허가정보</p></div>`).addTo(map);}else if(f.layer.id==='bs-survey'){popup?.remove();popup=new maplibregl.Popup({maxWidth:'300px'}).setLngLat(e.lngLat).setHTML(`<div class="b-popup"><strong>${esc(p.jibun)}</strong><p>${esc(p.road)}${p.use?' · '+esc(p.use):''}</p><p><b>${esc(p.judge)}</b></p>${p.signals?`<p>${esc(p.signals)}</p>`:''}${rvLine(p.jibun)}<p>전수조사 1차(책상 자료) — 공실 확정 아님</p></div>`).addTo(map);}else if(f.layer.id==='bs-closed'){const x=data.vacancy.localdata.signals[p.i];popup?.remove();popup=new maplibregl.Popup({maxWidth:'300px'}).setLngLat(x.lnglat).setHTML(`<div class="b-popup"><strong>인허가 폐업 신호</strong><p>${esc(x.address)}</p><p>${esc(x.kinds.join(' / '))}<br>최근 폐업 ${esc(x.closed)}${x.records>1?` · 폐업 신고 ${x.records}건`:''}</p><p>같은 주소에 지금 영업 신고가 없음(조사 9개 업종) — 공실 확정 아님, 현장 확인 필요</p></div>`).addTo(map);}else if(f.layer.id==='bs-vanished'){const x=data.vacancy.sbiz.vanished[p.i];popup?.remove();popup=new maplibregl.Popup({maxWidth:'300px'}).setLngLat(x.lnglat).setHTML(`<div class="b-popup"><strong>상가정보에서 사라진 점포</strong><p>${esc(x.kind)} · ${esc(x.address)}${x.floor?' '+esc(x.floor)+'층':''}</p><p>상가정보 ${esc(data.vacancy.sbiz.compare)}에 있었고 ${esc(data.vacancy.sbiz.latest)}에 없음 — 폐업·이전 후보, 현장 확인 필요</p></div>`).addTo(map);}else if(f.layer.id==='bs-stores')showStore(e.lngLat,p);else if(f.layer.id==='bs-wifi'){popup?.remove();popup=new maplibregl.Popup().setLngLat(e.lngLat).setHTML(`<div class="b-popup"><strong>${esc(p.n)}</strong><p>측정지점 · 구역 유동인구로 합산하지 않음</p></div>`).addTo(map);}else showBuilding(e.lngLat,p);});
    document.body.dataset.bSource='zone1an';document.body.dataset.bArea=areaLabel();document.body.dataset.bBuildings=String(buildings.length);document.body.dataset.bStores=String(stores.length);document.body.dataset.bReady='true';
    const scope=new URLSearchParams(location.search).get('scope');
    if(scope==='b171'||scope==='zone'||scope==='zone1an'){switchScope(true);frame(0,true);}else{document.body.dataset.analysisScope='legacy';showBoundary();frame(0);}
  }
  window.GimhaeB={get active(){return active;},get data(){return data;},frame,shot,open:()=>{switchScope(true);frame(350,true);}};
  fetch('data/gimhae-zone-261030.json?v=1an-r1').then(r=>{if(!r.ok)throw Error('경계 자료를 불러오지 못했습니다');return r.json();}).then(async d=>{
    data=d;ctx=d.context;
    if(d.version!=='2026-10-30-zone1an'||d.area!==208778||d.sites.length!==13||d.sites.filter(t=>t.inside).length!==9)throw Error('새 경계 자료와 화면 버전이 다릅니다. 새로고침해 주세요.');
    // Verify index data against the immutable embedded source before using it.
    const raw=new TextEncoder().encode($('dat').textContent);
    const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',raw)),v=>v.toString(16).padStart(2,'0')).join('');
    if(digest!==data.embeddedDataSHA256)throw Error('원본 자료가 변경되었습니다. 확정 구역계 재계산 필요.');
    if(!data.buildingIndices.length||D.bld.features.length!==10065)throw Error('원본 건물 자료가 변경되었습니다. 확정 구역계 재계산 필요.');
    const start=Date.now();await new Promise((resolve,reject)=>{const timer=setInterval(()=>{if(map.getLayer('bld-3d')&&window.__LATE){clearInterval(timer);resolve();}else if(Date.now()-start>45000){clearInterval(timer);reject(Error('지도 준비 시간을 초과했습니다. 새로고침해 주세요.'));}},150);});
    initialize();
  }).catch(e=>{$('scope-status').textContent='확정 구역계 표시 실패: '+e.message;$('scope-b').textContent='확정 구역계 확인 필요';document.body.dataset.bReady='error';console.error(e);});
})();
