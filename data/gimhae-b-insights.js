/* Read-only derived analysis. Membership and source data are never modified. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.GimhaeBInsights=factory();
})(globalThis,()=>{
  'use strict';
  const YEAR=2026;
  const groups={all:'전체 건물',candidate:'공실 현장 확인 후보',old40:'40년 이상 건물',unknown:'연도 미확인',edge:'경계 안쪽 확인 대상'};
  const pct=(n,d)=>d?Math.round(n/d*1000)/10:0;
  const matches=(p,key)=>key==='candidate'?p.cl==='shop':key==='old40'?p.yr>0&&p.yr<=YEAR-40:key==='unknown'?!(p.yr>0):key==='edge'?p.edge&&p.inside!==false:true;
  function filterBuildings(rows,{group='all',candidate=false,query=''}={}){
    const words=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return rows.filter(f=>{
      const p=f.properties,text=[p.nm,p.rn,p.bn,p.d,p.pu].join(' ').toLocaleLowerCase();
      return matches(p,group)&&(!candidate||p.cl==='shop')&&words.every(w=>text.includes(w));
    });
  }
  function filterStores(rows,{industry='',query=''}={}){
    const words=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return rows.filter(p=>(!industry||p.L===industry)&&words.every(w=>[p.nm,p.rd,p.ad,p.L,p.M,p.S].join(' ').toLocaleLowerCase().includes(w)));
  }
  function summarize(buildings,stores){
    const count=key=>buildings.filter(f=>matches(f.properties,key)).length;
    const known=buildings.filter(f=>f.properties.yr>0).length;
    const old20=buildings.filter(f=>f.properties.yr>0&&f.properties.yr<=YEAR-20).length;
    const industries={};stores.forEach(p=>{const k=p.L||'업종 미확인';industries[k]=(industries[k]||0)+1;});
    const sorted=Object.entries(industries).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'ko'));
    const foodRetail=stores.filter(p=>p.L==='음식'||p.L==='소매').length;
    const residential=buildings.filter(f=>['단독주택','공동주택'].includes(f.properties.pu)).length;
    const neighborhood=buildings.filter(f=>['제1종근린생활시설','제2종근린생활시설'].includes(f.properties.pu)).length;
    return {year:YEAR,total:buildings.length,known,old20,oldPct:pct(old20,known),counts:Object.fromEntries(Object.keys(groups).map(k=>[k,count(k)])),industries:sorted,foodRetail,foodRetailPct:pct(foodRetail,stores.length),residential,neighborhood,candidateEdge:buildings.filter(f=>matches(f.properties,'candidate')&&matches(f.properties,'edge')).length};
  }
  return {YEAR,groups,pct,filterBuildings,filterStores,summarize};
});
