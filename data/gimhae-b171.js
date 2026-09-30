/* B권역은 별도 계산 결과를 사용한다. 원본 D·D2·S 및 기존 분석은 변경하지 않는다. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = v => Number(v).toLocaleString('ko-KR');
  const fc = features => ({type:'FeatureCollection',features});
  const switcher = document.createElement('div'); switcher.id='scope-switch';
  switcher.innerHTML='<div class="scope-label">분석 범위 선택</div><div class="scope-buttons"><button id="scope-b" disabled aria-pressed="false">B권역 불러오는 중</button><button id="scope-old" aria-pressed="true">기존 사업구역</button></div><div id="scope-status" role="status"></div>';
  $('detail').prepend(switcher);
  const panel=document.createElement('section');panel.id='b-panel';$('detail').append(panel);
  const caption=document.createElement('div');caption.id='b-map-caption';document.body.append(caption);
  let data, buildings, stores, active=false, ready=false, mode='old', is3d=true, savedView, popup;
  let visibility=new Map(), previousTitle=document.title;
  const baseIds=new Set(['bg','sat','dark','light']);
  const ownIds=[];
  const colors=['case',['<=',['get','yr'],0],'#8a95a5',['<=',['get','yr'],1986],'#e74f52',['<=',['get','yr'],1996],'#ef9251',['<=',['get','yr'],2006],'#e2c669',['<=',['get','yr'],2016],'#65b8a5','#70aade'];
  const classColor=['match',['get','cl'],'shop','#ef6161','res','#ab8bed','non','#64a1cd','unk','#8a95a5','biz','#68ba93','#586776'];
  const labels={shop:'현장 확인 후보',res:'주거용 건물',non:'가게 대상 아님',unk:'용도 미확인',biz:'등록점포 연결',etc:'기타'};
  function addSource(id,features){map.addSource(id,{type:'geojson',data:features});}
  function addLayer(layer){ownIds.push(layer.id);map.addLayer(layer);}
  function setVisibility(id,on){if(map.getLayer(id))map.setLayoutProperty(id,'visibility',on?'visible':'none');}
  function isolate(){
    if(!active)return;
    for(const layer of map.getStyle().layers){
      if(baseIds.has(layer.id)||layer.id.startsWith('bs-'))continue;
      if(!visibility.has(layer.id))visibility.set(layer.id,map.getLayoutProperty(layer.id,'visibility')||'visible');
      if(map.getLayoutProperty(layer.id,'visibility')!=='none')setVisibility(layer.id,false);
    }
  }
  function frame(duration=0){
    if(!data)return;
    const coords=data.boundary.geometry.coordinates[0];
    const xs=coords.map(p=>p[0]),ys=coords.map(p=>p[1]);
    const mobile=innerWidth<=820, rect=$('detail').getBoundingClientRect();
    const left=!mobile&&rect.right>0&&!document.body.classList.contains('pmode')?rect.right+35:35;
    map.fitBounds([[Math.min(...xs),Math.min(...ys)],[Math.max(...xs),Math.max(...ys)]],{
      padding:{left, right:55, top:mobile?145:90, bottom:mobile?Math.min(innerHeight*.47,340):100},
      pitch:is3d?38:0,bearing:0,duration,maxZoom:17.7
    });
  }
  function switchScope(on){
    if(on&&!ready)return;
    if(on===active)return;
    popup?.remove();
    if(on){savedView={center:map.getCenter(),zoom:map.getZoom(),pitch:map.getPitch(),bearing:map.getBearing(),padding:map.getPadding()};visibility=new Map();}
    active=on;document.body.classList.toggle('b-active',on);document.body.dataset.analysisScope=on?'b171':'legacy';
    $('scope-b').setAttribute('aria-pressed',String(on));$('scope-old').setAttribute('aria-pressed',String(!on));
    if(on){isolate();renderLayers();document.title='김해 B권역 17.1ha · 환경분석맵';frame(0);}
    else {ownIds.forEach(id=>setVisibility(id,false));visibility.forEach((v,id)=>{if(map.getLayer(id))map.setLayoutProperty(id,'visibility',v);});document.title=previousTitle;if(savedView)map.jumpTo(savedView);}
  }
  function renderLayers(){
    if(!active)return;
    ownIds.forEach(id=>setVisibility(id,true));
    setVisibility('bs-flat',!is3d);setVisibility('bs-3d',is3d);
    setVisibility('bs-stores',$('b-stores').checked);setVisibility('bs-roads',$('b-roads').checked);
    setVisibility('bs-review',$('b-review').checked);setVisibility('bs-compare',$('b-compare').checked);
    setVisibility('bs-wifi',$('b-wifi').checked);
    const color=mode==='old'?colors:mode==='candidate'?classColor:['match',['get','pu'],'단독주택','#ab8bed','공동주택','#7487d8','제1종근린생활시설','#e8ab6d','제2종근린생활시설','#ee875e','숙박시설','#68bbc8','#8295a8'];
    map.setPaintProperty('bs-flat','fill-color',color);map.setPaintProperty('bs-3d','fill-extrusion-color',color);
    const legend=mode==='old'?[['#e74f52','40년 이상'],['#ef9251','30~39년'],['#e2c669','20~29년'],['#65b8a5','10~19년'],['#70aade','10년 미만'],['#8a95a5','연도 미확인']]:mode==='candidate'?[['#ef6161','현장 확인 후보'],['#ab8bed','주거'],['#64a1cd','비점포'],['#8a95a5','용도 미확인'],['#68ba93','등록점포 연결']]:[['#ab8bed','단독주택'],['#7487d8','공동주택'],['#e8ab6d','제1종 근생'],['#ee875e','제2종 근생'],['#68bbc8','숙박'],['#8295a8','기타']];
    $('b-legend').innerHTML=legend.map(([c,t])=>`<span><i class="b-dot" style="background:${c}"></i>${t}</span>`).join('');
    caption.innerHTML=`<b>B권역 · 17.1ha 검토안</b>건물 ${num(data.stats.buildings)}동 · 등록점포 ${num(data.stats.stores)}개<br>빨간선: 검토 경계 · 이미지에서 옮긴 임시선`;
  }
  const table=obj=>'<table>'+Object.entries(obj).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${num(v)}</td></tr>`).join('')+'</table>';
  function renderPanel(){
    const s=data.stats, classes={};buildings.forEach(f=>{const k=f.properties.cl;classes[k]=(classes[k]||0)+1;});
    panel.innerHTML=`<div class="b-eyebrow">김해 원도심 · 별도 분석</div><h2>B권역 환경분석</h2><p>구역계검토자료 4쪽 · 빨간 경계 171,000㎡</p>
      <div class="b-note">검토용 임시 경계입니다. 도면 이미지를 지도에 옮겼으며, 측량 경계가 아닙니다. 경계 주변 건물은 포함 여부를 다시 확인해야 합니다.</div>
      <div class="b-kpis"><div class="b-kpi"><strong>${num(s.buildings)}</strong><span>B권역 건물 · 동</span></div><div class="b-kpi"><strong>${num(s.stores)}</strong><span>등록점포 위치 · 개</span></div><div class="b-kpi"><strong>${s.oldPct}%</strong><span>연도 확인 건물 중 20년 이상</span></div><div class="b-kpi"><strong>${num(s.edgeInside)}</strong><span>포함 건물 중 경계 주변 · 동</span></div></div>
      <p>노후 비율: ${s.old20}동 ÷ 연도 확인 ${s.knownYear}동<br>연도 미확인 ${s.unknownYear}동은 비율 계산에서 제외 · 2026년 기준</p>
      <h3>지도에서 보기</h3><select id="b-mode" aria-label="건물 색상 구분"><option value="old">건축 연도별</option><option value="use">건물 용도별</option><option value="candidate">빈 점포 현장 확인 후보</option></select>
      <div id="b-legend" class="b-legend"></div><div class="b-controls"><button id="b-3d" aria-pressed="true">입체 건물</button><button id="b-fit">B권역 전체 보기</button></div>
      <label><input id="b-stores" type="checkbox">등록점포 ${s.stores}개 표시</label><label><input id="b-roads" type="checkbox">B권역 안 도로 표시</label><label><input id="b-review" type="checkbox">경계 주변 건물 ${data.edgeBuildingIndices.length}동 확인</label><label><input id="b-compare" type="checkbox">기존 파란 경계와 비교</label><label><input id="b-wifi" type="checkbox">주변 와이파이 측정지점 참고</label>
      <details open><summary>건물 노후도 · 용도</summary>${table(s.bands)}<p>사용승인 연도 기준. 건물 상태·안전등급을 뜻하지 않습니다.</p>${table(s.uses)}</details>
      <details><summary>빈 점포 현장 확인 후보 ${num(classes.shop||0)}동</summary><div class="b-note">실제 공실로 확인한 수가 아닙니다. 기존 자료의 상업지역·연결 점포 0개 조건에 건물 용도 등을 대조한 현장 확인 후보입니다.</div>${table(Object.fromEntries(Object.entries(classes).map(([k,v])=>[labels[k],v])))}<p>상가 위치 ${s.stores}개와 건물별 연결 점포 수는 서로 다른 기준이므로 합계가 같지 않을 수 있습니다.</p></details>
      <details><summary>상권 · 도로 · 유동 자료</summary>${table(s.industries)}<h3>경계 안으로 잘라 계산한 도로 길이</h3>${table(Object.fromEntries(Object.entries(s.roadLengths).map(([k,v])=>[k+' (m)',v])))}<p>도로 중심선 길이이며 보행거리나 도로 면적이 아닙니다.</p><div class="b-note">B권역 내부 와이파이 측정지점 ${s.wifiInside}곳. 사람 수가 0명이라는 뜻이 아닙니다. 주변 지점은 참고용으로만 표시하며 B권역 유동인구로 합산하지 않습니다.</div><p>기존 구역의 출입구·생활권·점포별 큰길 거리는 이 범위의 새 분석값으로 사용하지 않습니다.</p></details>
      <details><summary>경계 근거 · 포함 기준</summary><p>자료 표기 ${num(data.printedArea)}㎡ / 지도에서 계산 ${num(data.computedArea)}㎡. 표기 면적에 맞춰 경계를 억지로 늘리거나 줄이지 않았습니다.</p><p>건물: 건물 내부 대표점이 경계 안에 있으면 포함.<br>점포: 등록된 위치가 경계 안에 있으면 포함.</p><p>경계선 양쪽 20m에 닿는 건물 ${data.edgeBuildingIndices.length}동(안 ${s.edgeInside}동 / 밖 ${data.edgeBuildingIndices.length-s.edgeInside}동)은 검토 목록으로 별도 관리. 20m는 확인용 폭이며 정확도 보증이 아닙니다.</p><p>기존 파란 범위·분석·주변 자료는 삭제하지 않았습니다. 위의 ‘기존 사업구역’ 버튼으로 돌아갑니다.</p><p>자료: 기존 환경분석맵 건물 자료 / 상가정보 2026년 6월 / 노후 계산 2026년. 위치·업종·영업 여부는 현장 확인 필요.</p></details>
      <h3>대상 건물 찾기</h3><input id="b-query" type="search" placeholder="건물명·주소·용도 검색" aria-label="B권역 건물 검색"><label><input id="b-only-candidate" type="checkbox">빈 점포 현장 확인 후보만</label><label><input id="b-only-edge" type="checkbox">경계 주변 건물만 · 바깥 포함</label><p id="b-results-status" role="status"></p><div id="b-results"></div>
      <h3>검토 자료 내려받기</h3><div class="b-controls"><button id="b-csv">건물 목록</button><button id="b-store-csv">점포 목록</button><button id="b-edge-csv">경계 검토 목록</button><button id="b-geo">경계 파일</button><button id="b-shot">지도 그림</button></div><p id="b-export-status" role="status"></p><p>그림에는 B권역 표시·집계·주의 문구를 함께 넣습니다.</p>`;
    $('b-mode').onchange=e=>{mode=e.target.value;renderLayers();};
    $('b-3d').onclick=()=>{is3d=!is3d;$('b-3d').setAttribute('aria-pressed',String(is3d));renderLayers();map.easeTo({pitch:is3d?38:0,duration:350});};
    $('b-fit').onclick=()=>frame(350);
    ['b-stores','b-roads','b-review','b-compare','b-wifi'].forEach(id=>$(id).onchange=renderLayers);
    ['b-query','b-only-candidate','b-only-edge'].forEach(id=>$(id).addEventListener('input',renderResults));
    $('b-csv').onclick=()=>exportBuildings(buildings,'B권역_건물');
    $('b-edge-csv').onclick=()=>exportBuildings(reviewBuildings(),'B권역_경계주변검토');
    $('b-store-csv').onclick=()=>downloadCSV([['번호','상호','주소','업종','경도','위도'],...stores.map((p,i)=>[i+1,p.nm,p.rd||p.ad,p.L,p.lon,p.lat])],'B권역_등록점포');
    $('b-geo').onclick=()=>download(JSON.stringify({...data.boundary,properties:{...data.boundary.properties,source:data.source,status:'이미지에서 옮긴 검토용 임시 경계',printedArea:data.printedArea,computedArea:data.computedArea}},null,2),'B권역_검토경계.geojson','application/geo+json');
    $('b-shot').onclick=shot;
    renderResults();
  }
  function reviewBuildings(){return data.edgeBuildingIndices.map(i=>({...D.bld.features[i],properties:{...D.bld.features[i].properties,bidx:i,inside:data.buildingIndices.includes(i),edge:true}}));}
  function renderResults(){
    const q=$('b-query').value.trim().toLowerCase();
    let rows=$('b-only-edge').checked?reviewBuildings():buildings;
    if($('b-only-candidate').checked)rows=rows.filter(f=>f.properties.cl==='shop');
    rows=rows.filter(f=>[f.properties.nm,f.properties.rn,f.properties.bn,f.properties.d,f.properties.pu].join(' ').toLowerCase().includes(q));
    $('b-results-status').textContent=`${num(rows.length)}동 · 화면에는 앞 30동 표시 / 전체 목록은 내려받기`;
    $('b-results').replaceChildren(...rows.slice(0,30).map(f=>{const p=f.properties,b=document.createElement('button');b.className='b-result';b.innerHTML=`${esc(p.nm||p.rn||p.bn||p.d||'이름 없는 건물')}<small>${esc(p.pu||'용도 미확인')} · ${p.yr?esc(p.yr)+'년':'연도 미확인'}${p.edge?' · 경계 확인':''}${p.inside===false?' · 범위 밖':''}</small>`;b.onclick=()=>{const ring=f.geometry.type==='MultiPolygon'?f.geometry.coordinates[0][0]:f.geometry.coordinates[0];map.easeTo({center:ring[0],zoom:18.5,duration:400});showBuilding(ring[0],p);};return b;}));
  }
  function showBuilding(ll,p){popup?.remove();popup=new maplibregl.Popup({maxWidth:'300px'}).setLngLat(ll).setHTML(`<div class="b-popup"><strong>${esc(p.nm||p.rn||p.bn||'건물 상세')}</strong><p>${esc(p.rn||p.d||'')} ${esc(p.bn||'')}</p><p>${esc(p.pu||'용도 미확인')} · ${p.yr?esc(p.yr)+'년':'연도 미확인'} · ${esc(p.fl||'?')}층</p><p>${esc(labels[p.cl]||'미분류')} · 연결점포 ${esc(p.sc||0)}개</p><p>${p.inside===false?'B권역 밖 · 참고용':'B권역 집계 포함'}${p.edge?' / 경계 주변: 포함 여부 확인 필요':''}</p><p>등록정보만으로 실제 영업·공실을 확정할 수 없습니다.</p></div>`).addTo(map);}
  function download(content,name,type){const url=URL.createObjectURL(content instanceof Blob?content:new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);$('b-export-status').textContent=name+' 내려받기를 요청했습니다.';}
  function downloadCSV(rows,name){const cell=v=>{let s=String(v??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};download('\ufeff'+rows.map(r=>r.map(cell).join(',')).join('\r\n'),name+'.csv','text/csv;charset=utf-8');}
  function exportBuildings(rows,name){downloadCSV([['원본번호','건물명','도로명','지번','법정동','용도','사용승인연도','층수','연결점포수','확인분류','B권역포함','경계주변확인'],...rows.map(f=>{const p=f.properties;return [p.bidx,p.nm,p.rn,p.bn,p.d,p.pu,p.yr||'',p.fl,p.sc,labels[p.cl],p.inside===false?'아니오':'예',p.edge?'필요':''];})],name);}
  function shot(){
    if(!active)return;
    if(map.isMoving()){map.once('moveend',shot);return;}
    $('b-export-status').textContent='그림을 만들고 있습니다…';
    map.once('render',()=>{try{
      const src=map.getCanvas(),c=document.createElement('canvas'),width=Math.max(960,src.width),height=Math.round(src.height*width/src.width),footer=230;
      c.width=width;c.height=height+footer;const ctx=c.getContext('2d');ctx.drawImage(src,0,0,width,height);
      ctx.fillStyle='#101923';ctx.fillRect(0,height,width,footer);ctx.fillStyle='#fff';ctx.font='bold 24px sans-serif';
      ctx.fillText('김해 B권역 17.1ha · 검토용',24,height+34);ctx.font='18px sans-serif';
      ctx.fillText(`건물 ${data.stats.buildings}동 / 등록점포 ${data.stats.stores}개 / 20년 이상 ${data.stats.oldPct}% (연도 확인 건물 기준)`,24,height+64);
      ctx.fillStyle='#ffb49f';ctx.fillText('이미지에서 옮긴 임시 경계 · 경계 주변 건물 포함 여부 확인 필요',24,height+93);
      ctx.font='15px sans-serif';let x=24,y=height+126;
      for(const item of $('b-legend').children){const label=item.textContent,w=ctx.measureText(label).width+38;if(x+w>width-24){x=24;y+=25;}ctx.fillStyle=item.querySelector('i').style.background;ctx.fillRect(x,y-12,12,12);ctx.fillStyle='#ecf2f9';ctx.fillText(label,x+18,y);x+=w;}
      ctx.fillStyle='#cad7e4';
      const overlays=['빨간선: B권역'];if($('b-review').checked)overlays.push('노란 테두리: 경계 주변');if($('b-stores').checked)overlays.push('민트 점: 등록점포');if($('b-compare').checked)overlays.push('파란선: 기존 범위');if($('b-roads').checked)overlays.push('주황선: 도로');if($('b-wifi').checked)overlays.push('회색 점: 주변 와이파이');
      ctx.fillText(overlays.join(' · '),24,height+175);
      ctx.font='13px sans-serif';ctx.fillText('자료: 기존 환경분석맵 / 상가정보 2026.06 / 구역계검토자료 4쪽 · 2026년 기준',24,height+198);
      ctx.fillText('배경지도: Esri World Imagery / © OpenStreetMap contributors © CARTO (선택 배경에 따름)',24,height+219);
      c.toBlob(blob=>{if(blob)download(blob,'김해_B권역_검토지도.png','image/png');else $('b-export-status').textContent='그림 저장 실패. 다시 시도해 주세요.';},'image/png');
    }catch(e){$('b-export-status').textContent='그림 저장 실패: '+e.message;}});map.triggerRepaint();
  }
  function initialize(){
    const edge=new Set(data.edgeBuildingIndices);
    buildings=data.buildingIndices.map(i=>({...D.bld.features[i],properties:{...D.bld.features[i].properties,bidx:i,inside:true,edge:edge.has(i)}}));
    stores=data.storeIndices.map(i=>D.store[i]);
    const verify=buildings.filter(f=>f.properties.yr>0),old=verify.filter(f=>f.properties.yr<=2006);
    if(buildings.length!==data.stats.buildings||stores.length!==data.stats.stores||verify.length!==data.stats.knownYear||old.length!==data.stats.old20)throw Error('원본 자료와 B권역 집계가 다릅니다. 표시 중단.');
    renderPanel();
    addSource('bs-buildings',fc(buildings));addSource('bs-boundary',data.boundary);addSource('bs-review',fc(reviewBuildings()));addSource('bs-roads',data.roads);addSource('bs-wifi',WIFIPT);
    addSource('bs-stores',fc(stores.map(p=>({type:'Feature',geometry:{type:'Point',coordinates:[p.lon,p.lat]},properties:p}))));
    addSource('bs-compare',fc(ZP.features.filter(f=>f.properties.k==='blue')));
    const hole=data.boundary.geometry.coordinates[0];addSource('bs-mask',{type:'Feature',geometry:{type:'Polygon',coordinates:[[[128.7,35.1],[129.1,35.1],[129.1,35.4],[128.7,35.4],[128.7,35.1]],hole.slice().reverse()]},properties:{}});
    addLayer({id:'bs-mask',type:'fill',source:'bs-mask',paint:{'fill-color':'#091524','fill-opacity':.48}});
    addLayer({id:'bs-flat',type:'fill',source:'bs-buildings',paint:{'fill-color':colors,'fill-opacity':.88,'fill-outline-color':'#222d3b'}});
    addLayer({id:'bs-3d',type:'fill-extrusion',source:'bs-buildings',paint:{'fill-extrusion-color':colors,'fill-extrusion-opacity':.95,'fill-extrusion-height':['*',['max',['coalesce',['get','fl'],1],1],3.3]}});
    addLayer({id:'bs-compare',type:'line',source:'bs-compare',paint:{'line-color':'#64afff','line-width':2,'line-dasharray':[3,2]}});
    addLayer({id:'bs-boundary-case',type:'line',source:'bs-boundary',paint:{'line-color':'#fff2e8','line-width':6,'line-opacity':.8}});
    addLayer({id:'bs-boundary-line',type:'line',source:'bs-boundary',paint:{'line-color':'#ff454d','line-width':3}});
    addLayer({id:'bs-roads',type:'line',source:'bs-roads',paint:{'line-color':'#ffcd74','line-width':3}});
    addLayer({id:'bs-review',type:'line',source:'bs-review',paint:{'line-color':'#ffde47','line-width':2}});
    addLayer({id:'bs-stores',type:'circle',source:'bs-stores',paint:{'circle-color':'#7de5ca','circle-radius':4,'circle-stroke-width':1,'circle-stroke-color':'#082d2b'}});
    addLayer({id:'bs-wifi',type:'circle',source:'bs-wifi',paint:{'circle-color':'#bfcede','circle-radius':6,'circle-stroke-color':'#fff','circle-stroke-width':1}});
    ownIds.forEach(id=>setVisibility(id,false));
    ready=true;$('scope-b').disabled=false;$('scope-b').textContent='B권역 17.1ha';$('scope-b').onclick=()=>switchScope(true);$('scope-old').onclick=()=>switchScope(false);
    // Newly added legacy layers are hidden and remembered, without changing their data.
    let queued=false;map.on('styledata',()=>{if(active&&!queued){queued=true;queueMicrotask(()=>{queued=false;isolate();});}});
    map.on('click',e=>{if(!active)return;const f=map.queryRenderedFeatures(e.point,{layers:['bs-stores','bs-review','bs-3d','bs-flat','bs-wifi']})[0];if(!f)return;const p=f.properties;if(f.layer.id==='bs-stores'||f.layer.id==='bs-wifi'){popup?.remove();popup=new maplibregl.Popup().setLngLat(e.lngLat).setHTML(`<div class="b-popup"><strong>${esc(p.nm||p.n)}</strong><p>${esc(p.L||'주변 참고 지점 · B권역 집계 제외')}</p><p>${esc(p.rd||p.ad||'')}</p></div>`).addTo(map);}else showBuilding(e.lngLat,p);});
    document.body.dataset.bBuildings=String(buildings.length);document.body.dataset.bStores=String(stores.length);document.body.dataset.bReady='true';
    switchScope(new URLSearchParams(location.search).get('scope')!=='legacy');
  }
  window.GimhaeB={get active(){return active;},frame,shot};
  fetch('data/gimhae-b171.json').then(r=>{if(!r.ok)throw Error('경계 자료를 불러오지 못했습니다');return r.json();}).then(async d=>{
    data=d;
    // Verify index data against the immutable embedded source before using it.
    const raw=new TextEncoder().encode($('dat').textContent);
    const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',raw)),v=>v.toString(16).padStart(2,'0')).join('');
    if(digest!==data.embeddedDataSHA256)throw Error('원본 자료가 변경되었습니다. B권역 재계산 필요.');
    if(!data.buildingIndices.length||D.bld.features.length!==10065)throw Error('원본 건물 자료가 변경되었습니다. B권역 재계산 필요.');
    const start=Date.now();await new Promise((resolve,reject)=>{const timer=setInterval(()=>{if(map.getLayer('bld-3d')&&window.__LATE){clearInterval(timer);resolve();}else if(Date.now()-start>45000){clearInterval(timer);reject(Error('지도 준비 시간을 초과했습니다. 새로고침해 주세요.'));}},150);});
    initialize();
  }).catch(e=>{$('scope-status').textContent='B권역 표시 실패: '+e.message;$('scope-b').textContent='B권역 확인 필요';document.body.dataset.bReady='error';console.error(e);});
})();
