(()=>{var Oe=Object.defineProperty;var H=(t,s)=>{for(var a in s)Oe(t,a,{get:s[a],enumerable:!0})};var u=(t,s=document)=>s.querySelector(t),x=(t,s=document)=>[...s.querySelectorAll(t)],n=t=>String(t??"").replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[s]),ie=()=>document.documentElement.classList.contains("nomo"),Be={arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',print:'<path d="M7 9V3h10v6M7 18H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="7" y="14" width="10" height="7" rx="1"/>',copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',check:'<path d="m5 12 5 5L20 7"/>',chev:'<path d="m6 9 6 6 6-6"/>',file:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',ext:'<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',warn:'<path d="M12 3 2 21h20z"/><path d="M12 10v5M12 18v.5"/>',map:'<path d="m9 4-6 3v13l6-3 6 3 6-3V4l-6 3z"/><path d="M9 4v13M15 7v13"/>',cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',down:'<path d="M12 4v12M6 11l6 6 6-6M5 20h14"/>',close:'<path d="M6 6l12 12M18 6 6 18"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',home:'<path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/>',book:'<path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z"/>',list:'<path d="M9 6h11M9 12h11M9 18h11"/><path d="m4 6 .5.5L6 5M4 12l.5.5L6 11M4 18l.5.5L6 17"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',bulb:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',chat:'<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',pin:'<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',layers:'<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',up:'<path d="M12 20V6M6 11l6-6 6 6"/>'},m=(t,s="")=>`<svg class="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${Be[t]||""}</svg>`,$t=new Map;async function D(t){return t?window.__ASSET?($t.has(t)||$t.set(t,Promise.resolve(window.__ASSET(t)).catch(s=>{throw $t.delete(t),s})),$t.get(t)):t:""}var J=null;function ot(t=document){let s=x("img[data-src]",t);if(s.length){J||(J=new IntersectionObserver(a=>{for(let e of a){if(!e.isIntersecting)continue;let o=e.target;J.unobserve(o);let l=o.dataset.src;o.removeAttribute("data-src"),D(l).then(i=>{o.src=i}).catch(()=>{o.alt="\uADF8\uB9BC\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4"})}},{rootMargin:"600px 0px"}));for(let a of s)J.observe(a)}}function ne(t){t&&(x("img[data-src]",t).forEach(s=>J?.unobserve(s)),x(".rv, [data-count], [data-w], .steps, .art",t).forEach(s=>tt?.unobserve(s)))}var oe={},le=t=>{oe=t||{}},He=/^img\/(hero|sec_[a-z]+)\.webp$/,Fe="auto, (max-width: 640px) 100vw, (max-width: 1100px) 50vw, 560px",E=(t,s="",a="",e="")=>{let o=/zoomable/.test(a),l=o?`tabindex="0" role="button" aria-label="${n(s||"\uADF8\uB9BC")} \uD06C\uAC8C \uBCF4\uAE30"`:"";if(window.__ASSET)return`<img data-src="${n(t)}" alt="${n(s)}" class="${a}" ${l} ${e} loading="lazy" decoding="async">`;let i=oe[t],d=He.test(t),r=i?.v||[],v=r.length?(r.find(k=>k[0]>=800)||r.at(-1))[1]:t,b=d?/hero/.test(t)?"100vw":"(max-width: 720px) 100vw, 680px":Fe,L=r.length?`srcset="${r.map(([k,y])=>`${n(y)} ${k}w`).join(", ")}" sizes="${b}"`:"",M=i?`width="${i.w}" height="${i.h}"`:"",j=o?`data-full="${n(r.length?r.at(-1)[1]:t)}"`:"";return`<img src="${n(v)}" ${L} ${M} ${j} alt="${n(s)}" class="${a}" ${l} ${e} ${d?'loading="eager" fetchpriority="high"':'loading="lazy"'} decoding="async">`},tt=null;function At(t=document){let s=x(".rv:not(.in), [data-count]:not(.counted), [data-w]:not(.filled), .steps:not(.filled), .art:not(.in)",t);if(ie()){for(let a of s)qt(a);return}tt||(tt=new IntersectionObserver(a=>{for(let e of a)e.isIntersecting&&(qt(e.target),tt.unobserve(e.target))},{rootMargin:"0px 0px 12% 0px",threshold:0}));for(let a of s)tt.observe(a)}function qt(t){if(t.classList.add("in"),t.dataset.count!==void 0&&!t.classList.contains("counted")&&Ue(t),t.dataset.w!==void 0&&!t.classList.contains("filled")&&(t.classList.add("filled"),requestAnimationFrame(()=>{t.style.width=t.dataset.w})),t.classList.contains("steps")&&!t.classList.contains("filled")){t.classList.add("filled");let s=t.querySelector(".bar");s&&requestAnimationFrame(()=>{s.style.width=s.dataset.to})}}var Rt=!1;function It(t=document){Rt=!0;try{x(".rv:not(.in), [data-count]:not(.counted), [data-w]:not(.filled), .steps:not(.filled), .art:not(.in)",t).forEach(s=>{tt?.unobserve(s),qt(s)}),x("[data-count]",t).forEach(s=>{let a=parseFloat(s.dataset.count),e=+(s.dataset.dec||0);isFinite(a)&&(s.textContent=a.toLocaleString("ko-KR",{minimumFractionDigits:e,maximumFractionDigits:e}))}),x("[data-w].filled",t).forEach(s=>{s.style.width=s.dataset.w}),x(".steps.filled .bar",t).forEach(s=>{s.style.width=s.dataset.to})}finally{Rt=!1}}async function ce(t=document){It(t);let s=x("img[data-src]",t),a=x('img[loading="lazy"]',t);a.forEach(e=>{e.loading="eager"}),await Promise.race([Promise.all([...s.map(async e=>{J?.unobserve(e);let o=e.dataset.src;e.removeAttribute("data-src"),e.loading="eager";try{e.src=await D(o),await e.decode()}catch{}}),...a.map(e=>e.decode().catch(()=>{}))]),new Promise(e=>setTimeout(e,5e3))])}function Ue(t){t.classList.add("counted");let s=parseFloat(t.dataset.count),a=+(t.dataset.dec||0),e=d=>d.toLocaleString("ko-KR",{minimumFractionDigits:a,maximumFractionDigits:a});if(ie()||Rt||!isFinite(s)){t.textContent=e(s);return}let o=performance.now(),l=1200,i=d=>{let r=Math.min(1,(d-o)/l),v=1-Math.pow(1-r,3);t.textContent=e(s*v),r<1?requestAnimationFrame(i):t.textContent=e(s)};requestAnimationFrame(i)}function q(t){let s=document.createElement("div");s.className="toast",s.setAttribute("role","status"),s.textContent=t,document.body.appendChild(s),setTimeout(()=>s.remove(),2200)}async function xt(t,s,a){var e;try{await navigator.clipboard.writeText(t)}catch{let o=document.createElement("textarea");o.value=t,o.style.position="fixed",o.style.opacity="0",document.body.appendChild(o),o.select();try{document.execCommand("copy")}catch{}o.remove()}s&&((e=s.dataset).orig??(e.orig=s.innerHTML),s.classList.add("done"),s.innerHTML=`${m("check")}\uBCF5\uC0AC\uB428`,clearTimeout(s._t),s._t=setTimeout(()=>{s.classList.remove("done"),s.innerHTML=s.dataset.orig},1600)),q(a||"\uBCF5\uC0AC\uD588\uC2B5\uB2C8\uB2E4. \uBCF4\uACE0\uC11C\xB7\uBA54\uC2E0\uC800\uC5D0 \uBD99\uC5EC \uB123\uC73C\uC138\uC694")}var et=(t,s="\uBCF5\uC0AC")=>`<button class="copy" data-copy="${n(t)}">${m("copy")}${s}</button>`,Pe={ok:"\uCDA9\uC871",ing:"\uC9C4\uD589 \uC911",no:"\uBBF8\uCDA9\uC871",na:"\uD574\uB2F9 \uC5C6\uC74C",chk:"\uD655\uC778 \uD544\uC694"},Ne=t=>({ok:"ok",ing:"ing",no:"no",na:"na",chk:"ing"})[t]||"na",P=(t,s)=>`<span class="st ${Ne(t)}"><i></i>${n(s||Pe[t]||t)}</span>`,O=()=>new Date(Date.now()+324e5).toISOString().slice(0,10);function Z(t){let s=new Date(O()+"T00:00:00Z"),a=new Date(t+"T00:00:00Z");return Math.round((a-s)/864e5)}var Ot=t=>t===0?"D-DAY":t>0?`D-${t}`:`D+${-t}`,N=(t,s=O())=>t.month_only?t.date.slice(0,7)>=s.slice(0,7):t.date>=s,Y=t=>/^#[0-9a-f]{3,8}$/i.test(String(t))?String(t):"#22406A",lt=t=>/^[a-z0-9/_-]*$/i.test(String(t))?String(t):"",ct=t=>/^(https?:\/\/|#\/)/i.test(String(t))?String(t):"#/",wt=t=>t.month_only?{big:`${+t.date.slice(5,7)}\uC6D4`,small:"\uC911 \xB7 \uC7A0\uC815"}:{big:Ot(Z(t.date)),small:F(t.date,!1)};function F(t,s=!0){if(!t)return"";let a=/^(\d{4})-(\d{2})-(\d{2})/.exec(t);if(!a)return t;let o="\uC77C\uC6D4\uD654\uC218\uBAA9\uAE08\uD1A0"[new Date(`${a[1]}-${a[2]}-${a[3]}T00:00:00Z`).getUTCDay()];return`${+a[2]}\uC6D4 ${+a[3]}\uC77C${s?`(${o})`:""}`}function st(t,s=[],a=4){let e=n(t),o=[],l=[...s].filter(i=>i.term&&i.term.length>=2).sort((i,d)=>d.term.length-i.term.length);for(let i of l){if(o.length>=a)break;let d=n(i.term),r=e.indexOf(d);r<0||(o.push(`<span class="term" tabindex="0" data-term="${n(i.term)}">${d}</span>`),e=e.slice(0,r)+`\0${o.length-1}\0`+e.slice(r+d.length))}return e.replace(/\u0000(\d+)\u0000/g,(i,d)=>o[+d])}var Q=(t,s,a)=>Array.isArray(s)?s.map(e=>Q(t,e)).join(" "):`<button class="copy" data-doc="${n(t)}" data-page="${s||""}">${m("file")}${n(a||(s?`\uC6D0\uBB38 ${s}\uCABD`:"\uC6D0\uBB38 \uBCF4\uAE30"))}</button>`,dt=t=>Array.isArray(t)?t.join("\xB7"):t;var Bt={};H(Bt,{render:()=>Ge});function kt(){let t=[{c:"navy",who:"\uAD6D\uD1A0\uAD50\uD1B5\uBD80",what:"\uC6D0\uB3C4\uC2EC \uBCF5\uD569\uC7AC\uC0DD \xB7 \uACF5\uAC04",money:"\uAD6D\uBE44 \uCD5C\uB300 210\uC5B5 \xB7 \uCD1D 300\uC5B5(70:30)"},{c:"clay",who:"\uBB38\uD654\uCCB4\uC721\uAD00\uAD11\uBD80",what:"\uC6D0\uB3C4\uC2EC \uBB38\uD654\uCF58\uD150\uCE20 \xB7 \uCF58\uD150\uCE20",money:"\uAD6D\uBE44 \uCD5C\uB300 32.4\uC5B5 \xB7 \uCD1D 64.8\uC5B5(50:50)"},{c:"sage",who:"\uC911\uC18C\uBCA4\uCC98\uAE30\uC5C5\uBD80",what:"\uCC3D\uC5C5\xB7\uC9C0\uC5ED\uC0C1\uAD8C \xB7 \uC5F0\uACC4",money:"\uC5F0\uACC4 \uC0AC\uC5C5(\uBCC4\uB3C4 \uC608\uC0B0)"}],s=[{c:"navy",t:"\uACF5\uAC04",d:"\uD575\uC2EC \uAC70\uC810 1\uACF3 + \uBC29\uBB38\uAC1D \uACF5\uAC04 10\uACF3 \uC815\uBE44, \uBD09\uB9AC\uB2E8\uAE38 \uBCF4\uD589\xB7\uC870\uBA85\xB7\uC8FC\uCC28"},{c:"clay",t:"\uCF58\uD150\uCE20",d:"\uD31D\uC5C5\uC2A4\uD1A0\uC5B4\xB7\uB300\uD45C\uCF58\uD150\uCE20\xB7\uC5F0\uACC4 \uD504\uB85C\uADF8\uB7A8, \uC9C0\uC5ED \uC608\uC220\uC778\uACFC \uACF5\uAC04 \uC5F0\uACB0"},{c:"sage",t:"\uC0AC\uB78C",d:"\uCCAD\uB144 \uCC3D\uC5C5\xB7\uCC3D\uC791\uC790 \uC785\uC8FC(\uC6D4 30\uB9CC\uC6D0 \uD65C\uB3D9\uBE44), \uD310\uB9E4\uB294 \uC785\uC8FC\uC790 \uBAAB"}];return`<div class="org rv">
    <div class="org-row">${t.map(a=>`<div class="org-card c-${a.c}"><b>${n(a.who)}</b><span>${n(a.what)}</span><small>${n(a.money)}</small></div>`).join("")}</div>
    <div class="org-arrow" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="org-mid">
      <div class="org-side"><span>${m("chat")} HUG \uC0AC\uC804\uCEE8\uC124\uD305 3\uD68C</span><span>${m("chat")} \uBB38\uCCB4\uBD80 \uC0AC\uC804\uCEE8\uC124\uD305 1\uD68C</span></div>
      <div class="org-center"><small>\uACC4\uD68D \uC218\uB9BD\xB7\uC2E0\uCCAD \uC8FC\uCCB4</small><b>\uAE40\uD574\uC2DC</b><span>\uD589\uC815\uD611\uC758\uD68C \xB7 \uACF5\uC2E4 \uAD8C\uC6D0 \uD655\uBCF4 \xB7 \uC9C0\uBC29\uBE44</span></div>
      <div class="org-side"><span>${m("check")} \uACBD\uB0A8\uB3C4 \uD3C9\uAC00\xB7\uC2E0\uCCAD</span><span>${m("list")} \uAD6D\uD1A0\uBD80 \uD3C9\uAC00\xB7\uC120\uC815</span></div>
    </div>
    <div class="org-arrow" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="org-row">${s.map(a=>`<div class="org-card out c-${a.c}"><b>${n(a.t)}</b><span>${n(a.d)}</span></div>`).join("")}</div>
    <div class="org-goal">${m("home")}<b>\uBD09\uB9AC\uB2E8\uAE38 \uC911\uC2EC \uC6D0\uB3C4\uC2EC \uD65C\uC131\uD654</b><span>4\uB144 \uC9C0\uC6D0 \xB7 \uC870\uC131 \uD6C4 10\uB144 \uC774\uC0C1 \uC6B4\uC601</span></div>
  </div>`}function Lt(t=0){return`<ol class="flow rv">${[{t:"\uC0AC\uC804\uCEE8\uC124\uD305",d:"2026.9~12",n:"HUG 3\uD68C \xB7 \uBB38\uCCB4\uBD80 1\uD68C"},{t:"\uC2DC\uBC94\uC0AC\uC5C5 \uACF5\uACE0",d:"2026.12(\uC7A0\uC815)",n:"\uC608\uC0B0 \uD655\uC815 \uD6C4 \uC7AC\uACF5\uC9C0"},{t:"\uC2E0\uCCAD\uC11C \uC811\uC218",d:"2027.1(\uC7A0\uC815)",n:"\uAE40\uD574\uC2DC \u2192 \uACBD\uB0A8\uB3C4 \u2192 \uAD6D\uD1A0\uBD80"},{t:"\uAC80\uC99D\xB7\uD3C9\uAC00",d:"2027.1~2",n:"\uC801\uACA9\uC131 \u2192 \uC11C\uBA74\xB7\uD604\uC7A5\xB7\uBC1C\uD45C"},{t:"\uC120\uC815 \uBC1C\uD45C",d:"2027.2(\uC7A0\uC815)",n:"\uC804\uAD6D 7\uACF3(\uAD8C\uC5ED\uBCC4 1\uACF3)"},{t:"\uD2B9\uC704 \uC2EC\uC758\xB7\uCC29\uC218",d:"2027 \uC0C1\uBC18\uAE30",n:"\uACF5\uC2E4 1~2\uACF3 \uBA3C\uC800 \uC815\uBE44"},{t:"\uC0AC\uC5C5\xB7\uC6B4\uC601",d:"4\uB144 + 10\uB144",n:"\uAD6D\uBE44 \uC9C0\uC6D0 \uD6C4\uC5D0\uB3C4 \uC6B4\uC601"}].map((a,e)=>`<li class="${e<t?"done":e===t?"now":""}">
      <span class="fl-n">${e===t?"\uC9C0\uAE08":e+1}</span><b>${n(a.t)}</b><em>${n(a.d)}</em><small>${n(a.n)}</small></li>`).join("")}</ol>`}var De=[["\uC0AC\uC5C5 \uC18C\uAC1C","guide","img/kpi_money.webp","\uC9C0\uC6D0 \uADDC\uBAA8\xB7\uC694\uAC74"],["\uC694\uAC74 \uC810\uAC80","check","img/qm_check.webp","\uCC44\uC6B4 \uAC83\xB7\uB0A8\uC740 \uAC83"],["\uB300\uC0C1\uC9C0 \uC9C0\uB3C4","sites","img/kpi_area.webp","13\uACF3\xB7\uAD6C\uC5ED\uACC4"],["\uACC4\uD68D \uAD6C\uC0C1","plan","img/req_org.webp","\uAC70\uC810\xB7\uCF58\uD150\uCE20"],["\uCD94\uC9C4 \uC77C\uC815","todo","img/kpi_period.webp","\uB2EC\uB825\xB7\uD560 \uC77C"],["\uC9C4\uD589 \uAE30\uB85D","log","img/req_operate.webp","\uD68C\uC758\xB7\uACB0\uC815"],["\uC790\uC8FC \uBB3B\uB294 \uC9C8\uBB38","guide/faq","img/kpi_voice.webp","\uC9C8\uBB38 \uBAA8\uC74C"],["\uC790\uB8CC\uC2E4","library","img/qm_library.webp","\uC6D0\uBB38\xB7\uBCF4\uACE0\uC11C"]];function Ge(t){let s=O(),a=(t.schedule||[]).filter(c=>N(c,s)).sort((c,p)=>c.date.localeCompare(p.date)).slice(0,5),e=t.requirements||[],o=c=>e.filter(p=>p.status===c).length,l=o("ok"),i=o("ing")+o("chk"),d=o("no"),r=e.length||1,v=t.stages||[],b=Math.max(0,v.findIndex(c=>c.state==="now")),L=v.length>1?`${b/(v.length-1)*84}%`:"0%",M=[...t.timeline||[]].filter(c=>c.date<=s&&c.type!=="\uC608\uC815").sort((c,p)=>p.date.localeCompare(c.date)).slice(0,6),j={no:0,chk:1,ing:2},k=e.filter(c=>c.status!=="ok").sort((c,p)=>(j[c.status]??3)-(j[p.status]??3)).slice(0,4),y=(t.geo?.compare?.zones||{}).zoneN1||{},_=c=>({\uACB0\uC815:"navy",\uD68C\uC758:"sage",\uC0B0\uCD9C\uBB3C:"gold",\uD604\uC7A5:"clay"})[c]||"";return`
  <section class="hero">
    <div class="wrap">
      <span class="badge rv"><i></i>2027 \uAC70\uC810\uD2B9\uD654 \uC6D0\uB3C4\uC2EC RE:CORE \uD504\uB85C\uC81D\uD2B8 \xB7 \uAE40\uD574\uC2DC \uCD94\uC9C4</span>
      <h1 class="rv d1">\uB2E4\uC2DC \uCC44\uC6B0\uACE0, \uB2E4\uC2DC \uC0B4\uC544\uB098\uB294<br><em>\uAE40\uD574 \uC6D0\uB3C4\uC2EC</em></h1>
      <p class="lead rv d2">\uAC00\uC57C\uC758 \uC5ED\uC0AC \uC704 \uBD09\uB9AC\uB2E8\uAE38\uC758 \uBE48 \uC810\uD3EC\uB97C \uC0AC\uB78C\uACFC \uCF58\uD150\uCE20\uB85C \uB2E4\uC2DC \uCC44\uC6C1\uB2C8\uB2E4. <br>\uC0AC\uC5C5 \uB0B4\uC6A9\uACFC \uAE40\uD574\uC758 \uC900\uBE44 \uD604\uD669\uC744 \uC774 \uB204\uB9AC\uC9D1 \uD55C\uACF3\uC5D0\uC11C \uC548\uB0B4\uD569\uB2C8\uB2E4.</p>
      <div class="cta rv d3">
        <a class="btn pri" href="#/guide">${m("book")}\uC0AC\uC5C5 \uC18C\uAC1C</a>
        <a class="btn line" href="#/sites">${m("map")}\uB300\uC0C1\uC9C0 \uC9C0\uB3C4</a>
        <button class="btn line" data-tour>${m("bulb")}3\uBD84 \uB458\uB7EC\uBCF4\uAE30</button>
      </div>
    </div>
    <div class="art">${E(t.images.hero,"\uAE40\uD574 \uC6D0\uB3C4\uC2EC \uACE8\uBAA9\uACFC \uAC00\uC57C \uACE0\uBD84, \uACBD\uC804\uCCA0\uC774 \uBCF4\uC774\uB294 \uC5F0\uCD9C \uADF8\uB9BC")}<span class="artcap">\uC5F0\uCD9C \uADF8\uB9BC</span></div>
  </section>

  <section class="quick"><div class="wrap"><div class="quick-in">
    ${De.map(([c,p,h,g],w)=>`<a class="qm rv d${w%4+1}" href="#/${lt(p)}"><span class="qm-i">${E(h,"")}</span><b>${n(c)}</b><small>${n(g)}</small></a>`).join("")}
  </div></div></section>

  <section class="sec" style="padding-top:56px"><div class="wrap"><div class="board2">
    <div class="board rv">
      <div class="board-h"><h2>\uC54C\uB9BC\xB7\uC18C\uC2DD</h2><a href="#/log/tl">\uC804\uCCB4 \uBCF4\uAE30 ${m("arrow")}</a></div>
      <ul>${M.map(c=>`<li><a href="#/log/tl"><span class="tag min ${_(c.type)}">${n(c.type)}</span><b>${n(c.title)}</b><time>${n(c.date.slice(5).replace("-","."))}</time></a></li>`).join("")}</ul>
    </div>
    <div class="board rv d1">
      <div class="board-h"><h2>\uC8FC\uC694 \uC77C\uC815</h2><a href="#/todo">\uB2EC\uB825 \uBCF4\uAE30 ${m("arrow")}</a></div>
      <ul class="sched">${a.map(c=>{let p=Z(c.date),h=wt(c);return`<li><a href="#/todo"><span class="dd ${p<=7&&!c.month_only?"soon":""} ${c.month_only?"mo":""}"><b>${n(h.big)}</b><small>${n(h.small)}</small></span><span class="sc-t"><b>${n(c.title)}</b><small>${n(c.detail||"")}</small></span></a></li>`}).join("")}</ul>
    </div>
  </div></div></section>

  <section class="kband"><div class="wrap">
    <div class="kband-h rv"><span class="eyebrow" style="color:#F4D58D">\uC22B\uC790\uB85C \uBCF4\uB294 RE:CORE</span><h2>\uC9C0\uC5ED \uD55C \uACF3\uC5D0 \uC774\uB9CC\uD07C \uC9C0\uC6D0\uD569\uB2C8\uB2E4</h2></div>
    <div class="kband-g">
      ${(t.kpis||[]).map((c,p)=>`<div class="kb rv d${p%4+1}"><div class="kb-i">${E(c.icon,"")}</div><div class="kb-v"><span data-count="${c.v}" data-dec="${c.dec||0}">0</span><small>${n(c.unit)}</small></div><div class="kb-k">${n(c.k)}</div><div class="kb-s">${n(c.s)}</div></div>`).join("")}
    </div>
    <p class="kband-src">${n(t.guideline.kpi_note||"")}</p>
  </div></section>

  <section class="sec"><div class="wrap">
    <div class="sec-h rv"><span class="eyebrow">\uCD94\uC9C4 \uD604\uD669</span><h2>\uAE40\uD574\uB294 \uC9C0\uAE08 \uC5B4\uB514\uAE4C\uC9C0 \uC654\uB098\uC694?</h2><p>${n(t.meta.stage_lead||"")}</p></div>
    <div class="steps rv"><div class="bar" data-to="${L}"></div>
      ${v.map((c,p)=>`
      <a class="step ${c.state}" href="#/log" style="text-decoration:none;color:inherit">
        <div class="dot">${c.state==="done"?m("check"):p+1}</div>
        <div><h4>${n(c.title)}</h4><p>${n(c.desc)}</p><span class="when">${n(c.when)}</span></div>
      </a>`).join("")}
    </div>
    <div class="card rv" style="max-width:980px;margin:40px auto 0">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px">
        <h3 style="font-size:19px">\uC2E0\uCCAD \uC694\uAC74 ${e.length}\uAC1C \uC810\uAC80</h3>
        <div style="display:flex;gap:16px;flex-wrap:wrap">${P("ok",`\uCDA9\uC871 ${l}`)} ${P("ing",`\uC9C4\uD589\xB7\uD655\uC778 \uC911 ${i}`)} ${P("no",`\uBBF8\uCDA9\uC871 ${d}`)}</div>
      </div>
      <div class="meter"><span class="ok" data-w="${l/r*100}%"></span><span class="ing" data-w="${i/r*100}%"></span><span class="no" data-w="${d/r*100}%"></span></div>
      <div style="display:grid;gap:10px;margin-top:18px">
        ${k.map(c=>`<a href="#/check" class="gap-row">${P(c.status)}<b style="font-weight:600">${n(c.title)}</b><span class="cap">${n(c.next||"")}</span></a>`).join("")}
      </div>
      <div style="text-align:center;margin-top:18px"><a class="btn line" href="#/check">\uC694\uAC74 \uC810\uAC80\uD45C \uC804\uCCB4 ${m("arrow")}</a></div>
    </div>
  </div></section>

  <section class="sec alt"><div class="wrap">
    <div class="sec-h rv"><span class="eyebrow">\uC0AC\uC5C5 \uAD6C\uC870</span><h2>\uC138 \uBD80\uCC98 \uC0AC\uC5C5\uC774 \uAE40\uD574 \uC6D0\uB3C4\uC2EC \uD55C \uACF3\uC5D0 \uBAA8\uC785\uB2C8\uB2E4</h2><p>\uAD6D\uD1A0\uBD80(\uACF5\uAC04)\xB7\uBB38\uCCB4\uBD80(\uCF58\uD150\uCE20)\xB7\uC911\uAE30\uBD80(\uCC3D\uC5C5)\uB97C \uAE40\uD574\uC2DC\uAC00 \uD55C \uACC4\uD68D\uC73C\uB85C \uBB36\uC5B4 \uC2E0\uCCAD\uD569\uB2C8\uB2E4.</p></div>
    ${kt()}
    <div class="sec-h rv" style="margin-top:64px"><span class="eyebrow">\uCD94\uC9C4 \uC808\uCC28</span><h2>\uACF5\uBAA8\uAE4C\uC9C0 \uC774\uB807\uAC8C \uC9C4\uD589\uB429\uB2C8\uB2E4</h2><p>\uB0A0\uC9DC\uB294 \uAC00\uC774\uB4DC\uB77C\uC778(\uC548) \uAE30\uC900 \uC7A0\uC815\uC774\uBA70, 12\uC6D4 \uD655\uC815 \uACF5\uACE0\uC5D0\uC11C \uB2E4\uC2DC \uD655\uC778\uD569\uB2C8\uB2E4.</p></div>
    ${Lt(0)}
  </div></section>

  <section class="sec"><div class="wrap">
    <div class="spot rv">
      <div class="spot-im">${E("img/site_map_city.webp","\uAE40\uD574\uC2DC\uAC00 \uC815\uD55C \uC6B0\uC120\uC21C\uC704 13\uACF3 \uC704\uCE58(\uC2DC \uC81C\uACF5)","zoomable")}</div>
      <div class="spot-tx">
        <span class="eyebrow">\uAE40\uD574 \uC6D0\uB3C4\uC2EC \uB300\uC0C1\uC9C0</span>
        <h2>\uBD09\uB9AC\uB2E8\uAE38\uC744 \uB530\uB77C<br>13\uACF3\uC774 \uBAA8\uC5EC \uC788\uC2B5\uB2C8\uB2E4</h2>
        <ul>
          <li><b>13\uACF3</b>\uAE40\uD574\uC2DC \uC6B0\uC120\uC21C\uC704 \uB300\uC0C1\uC9C0(\uB9E4\uB9E4 8 \xB7 \uC784\uB300 5)</li>
          <li><b>${(y.area||145620).toLocaleString("ko-KR")}\u33A1</b>\uAD6C\uC5ED\uACC4 \u2460\uC548 \u2014 \uAD8C\uC7A5 15\uB9CC\u33A1 \uC774\uB0B4, 13\uACF3 \uBAA8\uB450 \uD3EC\uD568</li>
          <li><b>\uD575\uC2EC \uAC70\uC810</b>5\uBC88 3\uCE35 \uAC74\uBB3C + 10\uBC88 \uC8FC\uCC28 \uD6C4\uBCF4 \uBD80\uC9C0</li>
          <li><b>${(y.shops||213).toLocaleString("ko-KR")}\uACF3</b>\u2460\uC548 \uAD6C\uC5ED \uC548 \uC810\uD3EC \xB7 20\uB144 \uC774\uC0C1 \uB178\uD6C4\uAC74\uCD95\uBB3C ${y.old20||93.3}%</li>
        </ul>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px"><a class="btn pri" href="#/sites">${m("map")}\uC9C0\uB3C4\uC5D0\uC11C \uBCF4\uAE30</a><a class="btn line" href="#/sites/zones">\uAD6C\uC5ED\uACC4 \uBE44\uAD50</a></div>
        <p class="cap" style="margin-top:12px">\uADF8\uB9BC: \uAE40\uD574\uC2DC \uC81C\uACF5 \uC704\uCE58\uB3C4(10\uC6D4 8\uC77C)</p>
      </div>
    </div>
  </div></section>

  <section class="sec alt" style="padding:56px 0"><div class="wrap">
    <div class="board-h" style="margin-bottom:16px"><h2 style="font-size:22px">\uAD00\uB828 \uB204\uB9AC\uC9D1\xB7\uC790\uB8CC</h2></div>
    <div class="banners">
      <a class="bn rv" href="#/library">${m("file")}<b>\uAC00\uC774\uB4DC\uB77C\uC778(\uC548) \uC6D0\uBB38</b><span>\uAD6D\uD1A0\uBD80 \uC124\uBA85\uD68C\uBCF8 91\uCABD</span></a>
      <a class="bn rv d1" href="${ct("https://andy555-cmyk.github.io/hayday-envmap/gimhae-wondosim.html")}" target="_blank" rel="noopener">${m("layers")}<b>\uD658\uACBD\uBD84\uC11D\uB9F5 \u2014 \uAE40\uD574</b><span>\uAC74\uBB3C\xB7\uC810\uD3EC\xB7\uB178\uD6C4\uB3C4 \uC9C0\uB3C4</span></a>
      <a class="bn rv d2" href="${ct("https://andy555-cmyk.github.io/hayday-envmap/synmap/")}" target="_blank" rel="noopener">${m("map")}<b>\uC885\uD569\uBD84\uC11D\uB9F5</b><span>\uC5ED\xB7\uAE38\xB7\uAD00\uAD11\uC9C0 \uBD84\uC11D(\uBCC4\uB3C4 \uBE44\uBC00\uBC88\uD638)</span></a>
      <a class="bn rv d3" href="#/brief">${m("print")}<b>\uBCF4\uACE0\uC6A9 1\uC7A5</b><span>A4 \uC778\uC1C4\xB7\uBA54\uC2E0\uC800 \uAE00 \uBCF5\uC0AC</span></a>
    </div>
  </div></section>`}var Ht={};H(Ht,{mount:()=>We,render:()=>Ve});var de="guide91",X=t=>t?Q(de,t,`\uC6D0\uBB38 ${t}\uCABD`):"";function Ve(t){let s=t.guideline,a=s.money,e=s.brief_lines||{},o=Object.values(e).join(" "),l=Math.max(...(s.eval||[]).map(i=>+i.score||0),1);return`
  <section class="page-hero"><div class="wrap">
    <div class="crumb">\uC0AC\uC5C5 \uC774\uD574</div>
    <h1 class="rv">RE:CORE \uC0AC\uC5C5, \uC27D\uAC8C \uC774\uD574\uD558\uAE30</h1>
    <p class="lead rv d1">${n(s.title)} \uB0B4\uC6A9\uC744 \uBCF4\uACE0\uC11C\uC5D0 \uBC14\uB85C \uC62E\uAE38 \uC218 \uC788\uAC8C \uC815\uB9AC\uD588\uC2B5\uB2C8\uB2E4. \uBB38\uC7A5\uB9C8\uB2E4 <b>\uC6D0\uBB38 \uCABD</b> \uB2E8\uCD94\uB97C \uB204\uB974\uBA74 \uD574\uB2F9 \uCABD\uC774 \uC5F4\uB9BD\uB2C8\uB2E4.</p>
    <div class="rv d2" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:18px">
      ${Q(de,null,"\uAC00\uC774\uB4DC\uB77C\uC778(\uC548) \uC6D0\uBB38 91\uCABD \uC5F4\uAE30")} ${Q("guide92",null,"9/9 \uC218\uB839\uBCF8 92\uCABD")}
    </div>
    <div class="art rv d2">${E(t.images.sec_guide,"\uBE48 \uC810\uD3EC\uAC00 \uC0C8 \uAC00\uAC8C\uB85C \uBC14\uB00C\uB294 \uBAA8\uC2B5 \uC5F0\uCD9C \uADF8\uB9BC")}</div>
  </div></section>

  <section id="s-sum" class="sec"><div class="wrap" style="max-width:960px">
    <div class="sec-h rv"><span class="eyebrow">\uBCF4\uACE0\uC6A9 \uC694\uC57D</span><h2>\uC0C1\uAE09\uC790\uAED8 \uC774\uB807\uAC8C \uB9D0\uC500\uD558\uC2DC\uBA74 \uB429\uB2C8\uB2E4</h2><p>\uBCF5\uC0AC \uB2E8\uCD94\uB97C \uB204\uB974\uBA74 \uBB38\uC7A5\uC774 \uADF8\uB300\uB85C \uBCF5\uC0AC\uB429\uB2C8\uB2E4.</p></div>
    ${Object.entries(e).map(([i,d],r)=>`
      <div class="quote-box rv d${r%4+1}" style="margin-bottom:12px"><span class="tag navy" style="margin-bottom:8px">${n(i)}</span><p style="margin-top:8px">${n(d)}</p>${et(d)}</div>`).join("")}
    <div style="text-align:center;margin-top:16px">${et(o,"\uB2E4\uC12F \uBB38\uC7A5 \uD55C \uBC88\uC5D0 \uBCF5\uC0AC")}</div>
    <div class="note navy" style="margin-top:20px">${m("info")}<div>${n(s.status_note)}</div></div>
  </div></section>

  <section id="s-money" class="sec alt"><div class="wrap">
    <div class="sec-h rv"><span class="eyebrow">\uC9C0\uC6D0 \uADDC\uBAA8</span><h2>\uC9C0\uC6D0 \uADDC\uBAA8\uC640 \uC9C0\uC6D0 \uBC29\uC2DD</h2><p>\uC9C0\uC5ED \uD55C \uACF3\uB2F9 <b>\uAD6D\uBE44 ${n(a.gov_total)}</b>, \uC9C0\uBC29\uBE44\uB97C \uB354\uD558\uBA74 <b>\uCD1D ${n(a.total)}</b>, \uAE30\uAC04\uC740 \uCD5C\uB300 4\uB144\uC785\uB2C8\uB2E4. ${X(a.page)}</p></div>
    <div class="card rv" style="max-width:980px;margin:0 auto">
      <h3 style="font-size:18px;margin-bottom:12px">\uC0AC\uC5C5\uBCC4 \uAD6D\uBE44\xB7\uC9C0\uBC29\uBE44 (\uB2E8\uC704 \uC5B5\uC6D0)</h3>
      ${(a.parts||[]).map(i=>`
        <div style="margin-bottom:18px">
          <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:6px"><b>${n(i.name)}</b><span class="cap">${n(i.ratio)} \xB7 \uCD1D ${n(i.total)}\uC5B5</span></div>
          <div class="money">
            <div style="background:var(--navy)" data-w="${i.gov/i.total*100}%">\uAD6D\uBE44 ${n(i.gov)}\uC5B5</div>
            <div style="background:var(--celadon);color:var(--ink)" data-w="${(i.total-i.gov)/i.total*100}%">\uC9C0\uBC29\uBE44 ${n(+(i.total-i.gov).toFixed(1))}\uC5B5</div>
          </div>
          <div class="scale" title="\uCD1D\uC0AC\uC5C5\uBE44 \uADDC\uBAA8 \uBE44\uAD50(\uAC00\uC7A5 \uD070 \uC0AC\uC5C5 = 300\uC5B5)">
            <span class="cap" style="flex:none;width:64px">\uADDC\uBAA8 \uBE44\uAD50</span>
            <div class="tr"><div class="fl" data-w="${i.total/a.max*100}%"></div></div><b>\uCD1D ${n(i.total)}\uC5B5</b>
          </div>
          <p class="cap" style="margin-top:6px">${n(i.note||"")}</p>
        </div>`).join("")}
      <p class="cap">${n(a.check||"")}</p>
    </div>
    <div class="grid g3" style="margin-top:22px">
      ${(s.rules||[]).map((i,d)=>`<div class="card rv d${d%3+1}"><span class="tag clay">${n(i.tag||"\uC9D1\uD589 \uAE30\uC900")}</span><h3 style="margin-top:10px">${n(i.k)}</h3><p class="small">${n(i.v)}</p><div style="margin-top:12px">${X(i.page)}</div></div>`).join("")}
    </div>
  </div></section>

  <section id="s-req" class="sec"><div class="wrap">
    <div class="sec-h rv"><span class="eyebrow">\uB300\uC0C1\uC9C0 \uC694\uAC74</span><h2>\uC5B4\uB5A4 \uACF3\uC774 \uC2E0\uCCAD\uD560 \uC218 \uC788\uB098\uC694?</h2><p>\uD544\uC218 \uC694\uAC74\uC744 \uD558\uB098\uB77C\uB3C4 \uBABB \uCC44\uC6B0\uBA74 \uC2E0\uCCAD\uC774 \uC5B4\uB835\uC2B5\uB2C8\uB2E4. \uAE40\uD574 \uD604\uC7AC \uC0C1\uD0DC\uB294 <a href="#/check">\uC694\uAC74 \uC810\uAC80</a>\uC5D0\uC11C \uBD05\uB2C8\uB2E4.</p></div>
    <div class="grid g3">
      ${(s.requirements||[]).map((i,d)=>`
      <div class="card rv d${d%3+1}">
        <div style="display:flex;gap:8px;align-items:center"><span class="tag ${i.kind==="\uD544\uC218"?"red":i.kind==="\uAD8C\uC7A5"?"gold":"navy"}">${n(i.kind)}</span><b style="font-size:18px">${n(i.k)}</b></div>
        <p class="small" style="margin-top:10px">${st(i.v,t.terms,3)}</p>
        ${i.memo?`<p class="cap" style="margin-top:8px">\u{1F4A1} ${n(i.memo)}</p>`:""}
        <div style="margin-top:12px">${X(i.page)}</div>
      </div>`).join("")}
    </div>
  </div></section>

  <section id="s-eval" class="sec alt"><div class="wrap">
    <div class="sec-h rv"><span class="eyebrow">\uC120\uC815 \uBC29\uC2DD</span><h2>\uC5B4\uB5BB\uAC8C \uBF51\uB098\uC694?</h2><p>${n(s.eval_lead||"")}</p></div>
    <div class="card rv" style="max-width:1040px;margin:0 auto 20px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h3 style="font-size:19px">\u2460 \uC0AC\uC804 \uC801\uACA9\uC131 \uAC80\uC99D(\uAD6D\uD1A0\uBD80 \uB3C4\uC2DC\uC7AC\uC0DD\uD65C\uC131\uD654\uACC4\uD68D) \u2014 \uD558\uB098\uB77C\uB3C4 \uBABB \uB118\uC73C\uBA74 \uD0C8\uB77D</h3>${X(30)}</div>
      <div class="grid g2" style="gap:8px;margin-top:12px">${(s.eval_pf||[]).map(i=>`<div style="display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:10px;background:var(--paper);font-size:15px"><span class="tag red" style="flex:none">P/F</span>${n(i.item)}</div>`).join("")}</div>
    </div>
    <div class="grid g2" style="max-width:1040px;margin:0 auto">
      ${[["\u2461 \uAD6D\uD1A0\uBD80 \uACC4\uD68D (100\uC810)",s.eval_molit,"var(--navy)",31],["\u2462 \uBB38\uCCB4\uBD80 \uACC4\uD68D (100\uC810)",s.eval_mcst,"var(--clay)",33]].map(([i,d,r,v],b)=>`
      <div class="card rv d${b+1}">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px"><h3 style="font-size:19px">${i}</h3>${X(v)}</div>
        <div class="bars">${(d||[]).map(L=>`<div class="bar-row ev"><div><b style="font-weight:600;font-size:15px">${n(L.item)}</b><div class="cap">${n(L.group||"")}</div></div><div class="tr"><div class="fl" style="background:${r}" data-w="${(+L.score||0)/15*100}%"></div></div><div class="v">${n(L.score_label)}</div></div>`).join("")}</div>
      </div>`).join("")}
    </div>
    <div class="card rv" style="max-width:1040px;margin:20px auto 0">
      <h3 style="font-size:19px">\u2463 \uAC00\uC810</h3>
      <div class="grid g2" style="gap:8px;margin-top:12px">${(s.eval_bonus||[]).map(i=>`<div style="display:flex;gap:10px;align-items:center;padding:10px 12px;border-radius:10px;background:var(--gold-l);font-size:15px"><b style="flex:none;color:#8B6614">${n(i.score_label)}</b>${n(i.item)}</div>`).join("")}</div>
      <p class="cap" style="margin-top:14px">${n(s.eval_note||"")}</p>
    </div>
  </div></section>

  <section id="s-actors" class="sec"><div class="wrap">
    <div class="sec-h rv"><span class="eyebrow">\uCD94\uC9C4 \uCCB4\uACC4</span><h2>\uB204\uAC00 \uBB34\uC5C7\uC744 \uB9E1\uB098\uC694?</h2><p>\uC138 \uBD80\uCC98 \uC0AC\uC5C5\uC744 \uAE40\uD574\uC2DC\uAC00 \uD55C \uACC4\uD68D\uC73C\uB85C \uBB36\uC5B4 \uC2E0\uCCAD\uD558\uACE0, \uACBD\uC0C1\uB0A8\uB3C4\xB7HUG\xB7\uC804\uBB38\uAE30\uAD00\uC774 \uD568\uAED8\uD569\uB2C8\uB2E4.</p></div>
    ${kt()}
    <div style="height:36px"></div>
    <div class="grid g4">
      ${(s.actors||[]).map((i,d)=>`<div class="card rv d${d%4+1}" style="padding:20px;border-top:4px solid var(--${i.tone})"><b style="font-size:17px">${n(i.who)}</b><p class="small" style="margin-top:6px">${n(i.role)}</p></div>`).join("")}
    </div>
  </div></section>

  <section id="s-sched" class="sec"><div class="wrap">
    <div class="sec-h rv"><span class="eyebrow">\uCD94\uC9C4 \uC808\uCC28</span><h2>\uACF5\uBAA8\uAE4C\uC9C0 \uC774\uB807\uAC8C \uC9C4\uD589\uB429\uB2C8\uB2E4</h2><p>\uB0A0\uC9DC\uB294 \uAC00\uC774\uB4DC\uB77C\uC778(\uC548) \uAE30\uC900 \uC7A0\uC815\uC785\uB2C8\uB2E4. \uC544\uB798\uC5D0 \uC6D0\uBB38 \uC77C\uC815\uACFC \uC81C\uCD9C \uC11C\uB958\uB97C \uC790\uC138\uD788 \uC801\uC5C8\uC2B5\uB2C8\uB2E4.</p></div>
    ${Lt(0)}
    <div style="height:44px"></div>
    <div class="grid g2">
      <div class="rv">
        <div class="sec-h" style="margin:0 0 20px"><span class="eyebrow">\uACF5\uBAA8 \uC77C\uC815</span><h2>\uC5B8\uC81C \uBB34\uC5C7\uC744 \uD558\uB098\uC694?</h2></div>
        <div class="tl" style="margin:0">
          ${(s.schedule||[]).map(i=>`<div class="tl-it k-\uACB0\uC815"><div class="dt">${n(i.when)}</div><h4>${n(i.what)}</h4>${i.page?`<p class="cap">\uC6D0\uBB38 ${dt(i.page)}\uCABD</p>`:""}</div>`).join("")}
        </div>
      </div>
      <div class="rv d1">
        <div class="sec-h" style="margin:0 0 20px"><span class="eyebrow">\uC81C\uCD9C \uC11C\uB958</span><h2>\uBB34\uC5C7\uC744 \uB0B4\uC57C \uD558\uB098\uC694?</h2></div>
        ${(s.documents||[]).map((i,d)=>`<div class="todo"><span class="tag navy" style="flex:none">${d+1}</span><div><b>${n(i.name)}</b><span>${n(i.note||"")}${i.page?` \xB7 \uC6D0\uBB38 ${dt(i.page)}\uCABD`:""}</span></div></div>`).join("")}
      </div>
    </div>
  </div></section>

  <section class="sec" style="padding-top:0"><div class="wrap" style="max-width:960px">
    <div class="card rv" style="background:var(--gold-l);border-color:transparent">
      <h3 style="font-size:19px;display:flex;gap:8px;align-items:center">${m("warn")} 12\uC6D4 \uD655\uC815 \uACF5\uACE0 \uB54C \uAF2D \uB2E4\uC2DC \uBCFC \uACF3</h3>
      <p class="small" style="margin-top:6px">\uAC00\uC774\uB4DC\uB77C\uC778(\uC548) \uC548\uC5D0\uC11C \uC11C\uB85C \uB2E4\uB974\uAC8C \uC801\uD78C \uBD80\uBD84\uC785\uB2C8\uB2E4. \uCEE8\uC124\uD305 \uB54C \uC9C8\uC758\uD558\uAC70\uB098 \uD655\uC815 \uACF5\uACE0\uC5D0\uC11C \uD655\uC778\uD558\uC138\uC694.</p>
      <ul style="margin:12px 0 0;padding-left:20px;font-size:15px">${(s.conflicts||[]).map(i=>`<li style="margin-bottom:6px">${n(i.what)} <span class="cap">(\uC6D0\uBB38 ${i.pages.join("\xB7")}\uCABD)</span></li>`).join("")}</ul>
    </div>
  </div></section>

  <section class="sec alt" id="s-faq"><div class="wrap" style="max-width:960px">
    <div class="sec-h rv"><span class="eyebrow">\uC790\uC8FC \uBB3B\uB294 \uC9C8\uBB38</span><h2>\uB2F4\uB2F9\uC790\uAC00 \uC790\uC8FC \uBB3B\uB294 \uC9C8\uBB38</h2><p>\uB2F5\uB9C8\uB2E4 \uADFC\uAC70 \uCABD\uC744 \uB2EC\uC558\uC2B5\uB2C8\uB2E4. \uC544\uB798 \uCE78\uC5D0 \uB0B1\uB9D0\uC744 \uB123\uC73C\uBA74 \uBC14\uB85C \uAC78\uB7EC\uC9D1\uB2C8\uB2E4.</p></div>
    <input id="faqQ" type="search" placeholder="\uC608: \uACF5\uC2E4, \uB9E4\uC785, \uC9C0\uBC29\uBE44, \uD3C9\uAC00" style="width:100%;height:50px;border:1px solid var(--line2);border-radius:12px;padding:0 16px;font-size:16px;margin-bottom:16px;font-family:inherit">
    <div id="faqList">
    ${(t.faq||[]).map((i,d)=>`
      <div class="acc" id="s-faq-${d}" data-hay="${n((i.q+" "+i.a).toLowerCase())}">
        <button aria-expanded="false"><span class="q">Q</span>${n(i.q)}<span class="chev">${m("chev")}</span></button>
        <div class="body"><div><div class="in"><p>${st(i.a,t.terms,3)}</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">${X(i.page)}${et(i.q+" \u2014 "+i.a,"\uB2F5 \uBCF5\uC0AC")}</div></div></div></div>
      </div>`).join("")}
    </div>
  </div></section>

  <section class="sec" id="s-terms"><div class="wrap" style="max-width:960px">
    <div class="sec-h rv"><span class="eyebrow">\uC6A9\uC5B4 \uD480\uC774</span><h2>\uCC98\uC74C \uBCF4\uB294 \uB9D0, \uC5EC\uAE30\uC11C \uD655\uC778\uD558\uC138\uC694</h2><p>\uBCF8\uBB38 \uACF3\uACF3\uC758 <span class="term" tabindex="0" data-term="${n((t.terms||[])[0]?.term||"")}">\uC810\uC120 \uBC11\uC904</span> \uB0B1\uB9D0\uC5D0 \uB9C8\uC6B0\uC2A4\uB97C \uC62C\uB824\uB3C4 \uD480\uC774\uAC00 \uB098\uC635\uB2C8\uB2E4.</p></div>
    <input id="termQ" type="search" placeholder="\uC608: \uAD8C\uC6D0, \uC0C1\uC0DD\uD615, \uD31D\uC5C5" style="width:100%;height:50px;border:1px solid var(--line2);border-radius:12px;padding:0 16px;font-size:16px;margin-bottom:16px;font-family:inherit">
    <div id="termList" class="grid g2" style="gap:10px">
      ${(t.terms||[]).map((i,d)=>`
      <div class="acc" id="s-term-${d}" data-hay="${n((i.term+" "+i.def).toLowerCase())}" style="margin:0">
        <button aria-expanded="false"><span class="q" style="font-size:13px">\uD480\uC774</span>${n(i.term)}<span class="chev">${m("chev")}</span></button>
        <div class="body"><div><div class="in"><p>${n(i.def)}</p>${i.page?`<div style="margin-top:10px">${X(i.page)}</div>`:""}</div></div></div>
      </div>`).join("")}
    </div>
  </div></section>`}function We(t){let s=u("#termQ",t);s?.addEventListener("input",()=>{let e=s.value.trim().toLowerCase();x("#termList .acc",t).forEach(o=>{o.style.display=!e||o.dataset.hay.includes(e)?"":"none"})});let a=u("#faqQ",t);a?.addEventListener("input",()=>{let e=a.value.trim().toLowerCase();x("#faqList .acc",t).forEach(o=>{o.style.display=!e||o.dataset.hay.includes(e)?"":"none"})})}var Ft={};H(Ft,{mount:()=>Ze,render:()=>Ke});var pe={ok:"\uCDA9\uC871",ing:"\uC9C4\uD589 \uC911",chk:"\uD655\uC778 \uD544\uC694",no:"\uBBF8\uCDA9\uC871"};function Ke(t){let s=t.requirements||[],a=e=>s.filter(o=>e==="ing"?o.status==="ing"||o.status==="chk":o.status===e).length;return`
  <section class="page-hero"><div class="wrap">
    <div class="crumb">\uC694\uAC74 \uC810\uAC80</div>
    <h1 class="rv">\uAE40\uD574\uB294 \uC2E0\uCCAD \uC694\uAC74\uC744 \uC5BC\uB9C8\uB098 \uCC44\uC6E0\uB098\uC694?</h1>
    <p class="lead rv d1">\uAC00\uC774\uB4DC\uB77C\uC778(\uC548)\uC758 \uC694\uAC74\uC744 \uD55C \uC904\uC529 \uB193\uACE0, \uAE40\uD574\uC758 \uD604\uC7AC \uC0C1\uD0DC\uC640 \uADFC\uAC70, \uB2E4\uC74C\uC5D0 \uD560 \uC77C\uACFC \uB2F4\uB2F9\uC744 \uC801\uC5C8\uC2B5\uB2C8\uB2E4. \uC904\uC744 \uB204\uB974\uBA74 \uC790\uC138\uD55C \uB0B4\uC6A9\uC774 \uD3BC\uCCD0\uC9D1\uB2C8\uB2E4.</p>
    <div class="art rv d2">${E(t.images.sec_check,"\uC810\uAC80\uD45C\uC640 \uAD6C\uC5ED \uACBD\uACC4\uB97C \uC0B4\uD53C\uB294 \uB2F4\uB2F9\uC790 \uC5F0\uCD9C \uADF8\uB9BC")}</div>
  </div></section>

  <section id="s-list" class="sec" style="padding-top:40px"><div class="wrap" style="max-width:1040px">
    <div class="grid g4" style="margin-bottom:26px">
      <div class="card kpi"><div class="v" style="color:var(--ink)"><span data-count="${s.length}">0</span><small>\uAC1C</small></div><div class="k">\uC810\uAC80 \uC694\uAC74</div></div>
      <div class="card kpi"><div class="v" style="color:var(--sage)"><span data-count="${a("ok")}">0</span><small>\uAC1C</small></div><div class="k">\uCDA9\uC871</div></div>
      <div class="card kpi"><div class="v" style="color:#9A6E0E"><span data-count="${a("ing")}">0</span><small>\uAC1C</small></div><div class="k">\uC9C4\uD589\xB7\uD655\uC778 \uC911</div></div>
      <div class="card kpi"><div class="v" style="color:var(--red)"><span data-count="${a("no")}">0</span><small>\uAC1C</small></div><div class="k">\uBBF8\uCDA9\uC871</div></div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin-bottom:18px">
      <div class="filters" style="margin:0;justify-content:flex-start" id="reqF">
        <button class="chip on" data-f="all">\uC804\uCCB4</button><button class="chip" data-f="no">\uBBF8\uCDA9\uC871</button><button class="chip" data-f="ing">\uC9C4\uD589\xB7\uD655\uC778 \uC911</button><button class="chip" data-f="ok">\uCDA9\uC871</button>
      </div>
      <div style="display:flex;gap:8px"><button class="copy" id="reqCsv">${m("down")}\uC5D1\uC140\uB85C \uB0B4\uB824\uBC1B\uAE30</button><button class="copy" id="reqOpen">${m("chev")}\uBAA8\uB450 \uD3BC\uCE58\uAE30</button></div>
    </div>
    <div id="reqList">
      ${s.map((e,o)=>`
      <div class="req rv" data-s="${e.status==="chk"?"ing":e.status}">
        <div class="ic">${E(e.icon,"")}</div>
        <div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="tag ${e.kind==="\uD544\uC218"?"red":e.kind==="\uAD8C\uC7A5"?"gold":"navy"}">${n(e.kind)}</span><h3>${n(e.title)}</h3></div>
          <p class="sum"><b style="color:var(--ink2)">\uAE40\uD574 \uD604\uC7AC</b> \xB7 ${st(e.now,t.terms,2)}</p>
        </div>
        <div class="stw">${P(e.status,pe[e.status])}<button type="button" class="rchev" aria-expanded="false" aria-label="${n(e.title)} \uC790\uC138\uD788">${m("chev")}</button></div>
        <div class="more"><div><dl class="kv">
          <dt>\uAC00\uC774\uB4DC\uB77C\uC778 \uAE30\uC900</dt><dd>${st(e.rule,t.terms)} ${e.page?Q("guide91",e.page):""}</dd>
          <dt>\uAE40\uD574 \uADFC\uAC70</dt><dd>${n(e.evidence||"\u2014")}</dd>
          <dt>\uB2E4\uC74C \uD560 \uC77C</dt><dd><b>${n(e.next||"\u2014")}</b></dd>
          <dt>\uB2F4\uB2F9</dt><dd>${n(e.who||"\u2014")}</dd>
          ${e.risk?`<dt>\uC8FC\uC758</dt><dd style="color:var(--red)">${n(e.risk)}</dd>`:""}
        </dl></div></div>
      </div>`).join("")}
    </div>
    <p class="cap" style="margin-top:20px">${n(t.meta.check_note||"")}</p>
  </div></section>`}var re=(t,s)=>{t.classList.toggle("open",s),t.querySelector(".rchev")?.setAttribute("aria-expanded",String(s))};function Ze(t,s){let a=u("#reqList",t);a.addEventListener("click",o=>{if(o.target.closest("[data-doc]")||o.target.closest(".more"))return;let l=o.target.closest(".req");l&&re(l,!l.classList.contains("open"))}),u("#reqF",t).addEventListener("click",o=>{let l=o.target.closest(".chip");if(!l)return;x("#reqF .chip",t).forEach(d=>{d.classList.toggle("on",d===l),d.setAttribute("aria-pressed",String(d===l))});let i=l.dataset.f;x(".req",a).forEach(d=>{d.style.display=i==="all"||d.dataset.s===i?"":"none"})});let e=!1;u("#reqOpen",t).addEventListener("click",o=>{e=!e,x(".req",a).forEach(l=>re(l,e)),o.currentTarget.lastChild.textContent=e?"\uBAA8\uB450 \uC811\uAE30":"\uBAA8\uB450 \uD3BC\uCE58\uAE30"}),u("#reqCsv",t).addEventListener("click",()=>{let o=[["\uBC88\uD638","\uAD6C\uBD84","\uC694\uAC74","\uAC00\uC774\uB4DC\uB77C\uC778 \uAE30\uC900","\uC6D0\uBB38 \uCABD","\uAE40\uD574 \uD604\uC7AC","\uC0C1\uD0DC","\uADFC\uAC70","\uB2E4\uC74C \uD560 \uC77C","\uB2F4\uB2F9"]];(s.requirements||[]).forEach((r,v)=>o.push([v+1,r.kind,r.title,r.rule,dt(r.page)||"",r.now,pe[r.status]||r.status,r.evidence||"",r.next||"",r.who||""]));let l="\uFEFF"+o.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join(`\r
`),i=document.createElement("a"),d=URL.createObjectURL(new Blob([l],{type:"text/csv;charset=utf-8"}));i.href=d,setTimeout(()=>URL.revokeObjectURL(d),1e3),i.download=`\uAE40\uD574_RECORE_\uC694\uAC74\uC810\uAC80\uD45C_${s.meta.asof.replace(/[^0-9]/g,"")}.csv`,document.body.appendChild(i),i.click(),i.remove(),q("\uC5D1\uC140\uC5D0\uC11C \uC5F4 \uC218 \uC788\uB294 \uD30C\uC77C\uB85C \uB0B4\uB824\uBC1B\uC558\uC2B5\uB2C8\uB2E4")})}var Pt={};H(Pt,{mount:()=>es,render:()=>Je,unmount:()=>ss});var $=null,pt=[],vt=null,me=null,mt=0,St=new Set;function at(t,s){let a=mt,e=setTimeout(()=>{St.delete(e),a===mt&&$&&t()},s);St.add(e)}var Et=null;function Ye(){return window.maplibregl?Promise.resolve():(Et||(Et=new Promise((t,s)=>{let a=document.createElement("link");a.rel="stylesheet",a.href="vendor/maplibre-gl-4.7.1/maplibre-gl.css",document.head.appendChild(a);let e=document.createElement("script");e.src="vendor/maplibre-gl-4.7.1/maplibre-gl.js",e.onload=()=>t(),e.onerror=()=>{Et=null,s(new Error("\uC9C0\uB3C4 \uB3C4\uAD6C\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4"))},document.head.appendChild(e)})),Et)}var Qe="https://server.arcgisonline.com/ArcGIS/rest/services",Xe=`${Qe}/World_Imagery/MapServer/tile/{z}/{y}/{x}`;function Ut(t){return t.role==="\uAC70\uC810"?"hub":t.role==="\uCC3D\uC791"?"make":""}function Je(t){let s=t.geo,a=t.sites||[],e=s.compare,o=e.rows.filter(i=>i[0]!=="over150"),l=s.boundaries.filter(i=>e.zones[i.id]);return`
  <section class="page-hero" style="padding-bottom:28px"><div class="wrap">
    <div class="crumb">\uB300\uC0C1\uC9C0</div>
    <h1 class="rv">\uB300\uC0C1\uC9C0\xB7\uAD6C\uC5ED\uACC4\uB97C \uC9C0\uB3C4\uC5D0\uC11C \uD655\uC778\uD558\uC138\uC694</h1>
    <p class="lead rv d1">\uAE40\uD574\uC2DC\uAC00 10\uC6D4 8\uC77C \uC815\uD55C <b>\uC6B0\uC120\uC21C\uC704 13\uACF3</b>\uACFC \uAD6C\uC5ED\uACC4 \uD6C4\uBCF4\uB97C \uD55C \uC9C0\uB3C4\uC5D0 \uC62C\uB838\uC2B5\uB2C8\uB2E4. \uBC88\uD638\uB97C \uB204\uB974\uBA74 \uD604\uC7A5 \uC0AC\uC9C4\uACFC \uC870\uAC74\uC774 \uB098\uC635\uB2C8\uB2E4.</p>
  </div></section>

  <section id="s-map" class="mapwrap" aria-label="\uB300\uC0C1\uC9C0 \uC9C0\uB3C4">
    <aside class="mapside">
      <div class="top">
        <h2>\uAD6C\uC5ED\uACC4 \uD6C4\uBCF4</h2>
        <div class="seg" id="zoneSeg">
          ${s.boundaries.filter(i=>i.toggle).map(i=>`<button data-z="${i.id}" class="${i.default?"on":""}" title="${n(i.name)}"><i style="border-color:${Y(i.color)}"></i>${n(i.short)}</button>`).join("")}
        </div>
        <p class="cap" id="zoneInfo" style="margin-top:10px"></p>
        <h2 style="font-size:18px;margin-top:16px">\uAC78\uC5B4\uC11C \uC787\uB294 \uAE38</h2>
        <div class="seg" id="walkSeg">
          ${(s.walks||[]).map(i=>`<button data-wk="${n(i.id)}" title="${n(i.note)}"><i style="border-color:${Y(i.color)};border-radius:50%"></i>${n(i.name)}</button>`).join("")}
        </div>
        <p class="cap" id="walkInfo" style="margin-top:8px">\uB204\uB974\uBA74 \uC9C0\uB3C4\uC5D0 \uAE38\uC774 \uADF8\uB824\uC9D1\uB2C8\uB2E4. \uBCF4\uD589 \uAE38 \uACC4\uC0B0\uAC12\uC774\uBA70 \uC2E4\uC81C \uC774\uB3D9 \uAE30\uB85D\uC774 \uC544\uB2D9\uB2C8\uB2E4.</p>
      </div>
      <div class="sitelist" id="siteList">
        ${a.map(i=>`<div class="site-it ${Ut(i)}" data-id="${n(i.id)}" tabindex="0" role="button"><span class="n">${i.no}</span><div><b>${n(i.jibun)}</b><span>${n(i.type)} \xB7 ${n(i.short_use)}</span></div><span class="cap">${i.is_new?'<span class="tag gold">\uC0C8\uB85C \uCD94\uAC00</span>':""}</span></div>`).join("")}
      </div>
    </aside>
    <div id="map" role="region" aria-label="\uC9C0\uB3C4">
      <div class="mapwait" id="mapWait">${E("img/site_map_city.webp","")}<div class="mapwait-in"><span class="spin" aria-hidden="true"></span>\uC9C0\uB3C4\uB97C \uC900\uBE44\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4\u2026</div></div>
      <div class="mapbase" id="mapBase"><button data-b="road" class="on">\uC77C\uBC18 \uC9C0\uB3C4</button><button data-b="sat">\uC704\uC131</button></div>
      <div class="maplegend">
        <div><i style="background:var(--navy)"></i>\uB300\uC0C1\uC9C0(\uBC88\uD638 = \uC2DC \uC6B0\uC120\uC21C\uC704)</div>
        <div><i style="background:var(--clay)"></i>\uD575\uC2EC \uAC70\uC810(5\uBC88 \uAC74\uBB3C \xB7 10\uBC88 \uC8FC\uCC28 \uD6C4\uBCF4)</div>
        <div><i style="background:#7A5BA6"></i>\uAC1C\uC778 \uCC3D\uC791 \uACF5\uAC04 \uD6C4\uBCF4(13)</div>
        <div><i style="background:#fff;border:2px solid #555;border-radius:3px"></i>\uACBD\uC804\uCCA0\uC5ED \xB7 \uC8FC\uC694 \uC2DC\uC124</div>
      </div>
    </div>
  </section>

  <section id="s-zones" class="sec alt"><div class="wrap">
    <div class="sec-h rv"><span class="eyebrow">\uAD6C\uC5ED\uACC4 \uBE44\uAD50</span><h2>\uAD6C\uC5ED\uACC4 \uD6C4\uBCF4, \uBB34\uC5C7\uC774 \uB2E4\uB978\uAC00\uC694?</h2><p>${n(s.compare_lead)}</p></div>
    <p class="scroll-hint">\u2190 \uD45C\uB97C \uC606\uC73C\uB85C \uBC00\uC5B4 \u2461\xB7\u2462\uC548\uC744 \uBE44\uAD50\uD558\uC138\uC694</p>
    <div class="tbl-wrap rv"><table class="tbl cmp">
      <thead><tr><th>\uD56D\uBAA9</th>${l.map(i=>`<th style="color:${Y(i.color)}">${n(i.short)}<div class="cap" style="font-weight:500">${n(i.status)}</div></th>`).join("")}</tr></thead>
      <tbody>
        ${o.map(([i,d,r])=>`<tr><td><b style="font-weight:600">${n(d)}</b></td>${l.map(v=>{let b=e.zones[v.id][i],L=i==="area"&&b>15e4;return`<td class="r num" style="${L?"color:var(--red);font-weight:700":""}">${typeof b=="number"?b.toLocaleString("ko-KR"):n(b)} <span class="cap">${n(r)}</span>${L?'<div class="cap" style="color:var(--red)">\uAD8C\uC7A5 15\uB9CC\u33A1 \uCD08\uACFC</div>':""}</td>`}).join("")}</tr>`).join("")}
        <tr><td><b style="font-weight:600">\uC124\uBA85</b></td>${l.map(i=>`<td class="small" style="min-width:200px">${n(i.desc)}</td>`).join("")}</tr>
      </tbody></table></div>
    <p class="cap" style="margin-top:12px">${n(e.source)}</p>
  </div></section>

  <section id="s-cards" class="sec"><div class="wrap">
    <div class="sec-h rv"><span class="eyebrow">\uC2DC \uC6B0\uC120\uC21C\uC704 13\uACF3</span><h2>\uB300\uC0C1\uC9C0 \uD55C \uACF3\uC529 \uBCF4\uAE30</h2><p>${n(s.sites_note)}</p></div>
    <div class="filters" id="siteF">
      <button class="chip on" data-f="all">\uC804\uCCB4 ${a.length}</button>
      ${[...new Set(a.map(i=>i.type_group))].map(i=>`<button class="chip" data-f="${n(i)}">${n(i)} ${a.filter(d=>d.type_group===i).length}</button>`).join("")}
    </div>
    <div class="grid g3" id="siteCards">
      ${a.map((i,d)=>`
      <article class="card hov site-card ${Ut(i)} rv d${d%3+1}" id="site-${n(i.id)}" data-id="${n(i.id)}" data-t="${n(i.type_group)}">
        <div class="im">${E(i.photo,`${i.jibun} \uD604\uC7A5 \uC0AC\uC9C4`,"zoomable")}<span class="no">${i.no}</span></div>
        <div class="tx">
          <h3>${n(i.jibun)}</h3>
          <div class="meta"><span class="tag ${i.role==="\uAC70\uC810"?"clay":"navy"}">${n(i.role==="\uAC70\uC810"?"\uD575\uC2EC \uAC70\uC810":i.role==="\uCC3D\uC791"?"\uCC3D\uC791 \uACF5\uAC04 \uD6C4\uBCF4":"\uBC29\uBB38\uAC1D \uACF5\uAC04")}</span><span class="tag">${n(i.type)}</span>${i.is_new?'<span class="tag gold">10/8 \uC0C8\uB85C \uCD94\uAC00</span>':""}</div>
          <dl class="kv" style="display:grid;grid-template-columns:72px 1fr;gap:6px 10px;margin-top:12px;font-size:15px">
            <dt class="muted">\uC2DC \uC790\uB8CC</dt><dd style="margin:0">${n(i.vacancy_note)}</dd>
            <dt class="muted">\uB300\uC7A5</dt><dd style="margin:0">${n(i.area_note)}</dd>
            <dt class="muted">\uC4F0\uC784</dt><dd style="margin:0">${n(i.use)}</dd>
          </dl>
          <button class="copy" style="margin-top:12px" data-fly="${n(i.id)}">${m("pin")}\uC9C0\uB3C4\uC5D0\uC11C \uBCF4\uAE30</button>
        </div>
      </article>`).join("")}
    </div>
    ${(t.sites_dropped||[]).length?`
    <div class="card rv" style="margin-top:28px">
      <h3>${m("info","ico")} 10/7 \uBAA9\uB85D\uC5D0 \uC788\uC5C8\uC9C0\uB9CC 10/8 \uC2DC \uBAA9\uB85D\uC5D0\uC11C \uBE60\uC9C4 \uACF3</h3>
      <div class="tbl-wrap" style="margin-top:12px;box-shadow:none"><table class="tbl"><thead><tr><th>\uC9C0\uBC88</th><th>10/7 \uBC88\uD638</th><th>\uC0AC\uC720</th></tr></thead><tbody>
      ${t.sites_dropped.map(i=>`<tr><td>${n(i.jibun)}</td><td>${n(i.prev)}</td><td>${n(i.why)}</td></tr>`).join("")}
      </tbody></table></div>
    </div>`:""}
    <div class="note" style="margin-top:20px">${m("warn")}<div>${n(s.privacy_note)}</div></div>
  </div></section>`}function ve(t,s){for(let a of t.boundaries){let e=a.always||s.has(a.id)?"visible":"none";for(let o of["-f","-l"])$.getLayer(a.id+o)&&$.setLayoutProperty(a.id+o,"visibility",e)}}function ts(t){return`<div class="pop"><div class="im">${E(t.photo,t.jibun)}</div><div class="tx">
    <h4>${t.no}. ${n(t.jibun)}</h4>
    <p>${n(t.type)}<br>${n(t.vacancy_note)}</p>
    <p style="margin-top:6px;color:var(--ink)"><b>${n(t.use)}</b></p>
     <a href="#site-${n(t.id)}" data-card="${n(t.id)}" style="display:inline-block;margin-top:8px;font-size:14px;font-weight:600">\uCE74\uB4DC\uC5D0\uC11C \uC790\uC138\uD788 \u2192</a>
  </div></div>`}function rt(t,s=!0){let a=(me.sites||[]).find(e=>String(e.id)===String(t));!a||!$||(x(".site-it").forEach(e=>e.classList.toggle("on",e.dataset.id===String(t))),pt.forEach(e=>e.getElement().classList.toggle("on",e._sid===String(t))),s&&$.flyTo({center:a.lnglat,zoom:Math.max($.getZoom(),17),speed:.9}),vt?.remove(),vt=new maplibregl.Popup({offset:20,maxWidth:"300px",closeButton:!0}).setLngLat(a.lnglat).setHTML(ts(a)).addTo($),ot(vt.getElement()))}async function es(t,s,a){me=s;let e=s.geo,o=++mt;try{await Ye()}catch{let c=u("#mapWait .mapwait-in",t);c&&(c.textContent="\uC9C0\uB3C4 \uB3C4\uAD6C\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC704 \uADF8\uB9BC(\uC2DC \uC81C\uACF5 \uC704\uCE58\uB3C4)\uC744 \uCC38\uACE0\uD558\uC2DC\uACE0, \uC0C8\uB85C\uACE0\uCE68\uD574 \uC8FC\uC138\uC694.");return}if(o!==mt||!t.isConnected)return;let l=new Set(e.boundaries.filter(c=>c.default).map(c=>c.id)),i="https://tiles.openfreemap.org/styles/positron",d={version:8,sources:{osm:{type:"raster",tiles:["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],tileSize:256,maxzoom:19,attribution:"\xA9 OpenStreetMap contributors"}},layers:[{id:"osm",type:"raster",source:"osm",paint:{"raster-saturation":-.6,"raster-brightness-min":.06}}]};$=new maplibregl.Map({container:u("#map",t),style:i,center:e.center,zoom:16,minZoom:12,maxZoom:19,attributionControl:{compact:!0},pixelRatio:Math.min(window.devicePixelRatio||1,2),cooperativeGestures:matchMedia("(max-width: 900px)").matches});let r=!1,v=!1;$.once("style.load",()=>{v=!0});let b=()=>{r||v||(r=!0,$.setStyle(d,{diff:!1}))};$.on("error",c=>{!v&&/style|openfreemap|Failed to fetch|Load failed|NetworkError/i.test(String(c?.error?.message||""))&&b()}),at(b,7e3),$.addControl(new maplibregl.NavigationControl({showCompass:!1}),"bottom-right");let L=new Set,M=(c,p)=>{let h=$.getSource("wk-"+c.id);if(!h)return;if(!p){h.setData({type:"Feature",geometry:{type:"LineString",coordinates:[]},properties:{}});return}let g=c.coords,w=[0];for(let R=1;R<g.length;R++)w.push(w[R-1]+Math.hypot((g[R][0]-g[R-1][0])*Math.cos(g[R][1]*Math.PI/180),g[R][1]-g[R-1][1]));let f=w.at(-1)||1,z=performance.now(),C=document.documentElement.classList.contains("nomo")?0:1600,B=R=>{if(!L.has(c.id))return;let ee=C?Math.min(1,(R-z)/C):1,Ie=1-Math.pow(1-ee,3),se=Ie*f,A=1;for(;A<g.length&&w[A]<se;)A++;let zt=g.slice(0,A);if(A<g.length){let ae=(se-w[A-1])/(w[A]-w[A-1]||1);zt.push([g[A-1][0]+(g[A][0]-g[A-1][0])*ae,g[A-1][1]+(g[A][1]-g[A-1][1])*ae])}h.setData({type:"Feature",geometry:{type:"LineString",coordinates:zt.length>1?zt:[g[0],g[0]]},properties:{}}),ee<1&&requestAnimationFrame(B)};requestAnimationFrame(B);let nt=g.map(R=>R[0]),K=g.map(R=>R[1]);$.fitBounds([[Math.min(...nt),Math.min(...K)],[Math.max(...nt),Math.max(...K)]],{padding:70,duration:C?900:0,maxZoom:17})},j=x("#mapBase button, #walkSeg button",t);j.forEach(c=>{c.disabled=!0});let k=()=>{if($.getSource("zones"))return;let c=$.getStyle().layers||[],p=c.find(f=>f.type==="symbol")?.id;for(let f of c)if(f.type==="symbol"&&f.layout?.["text-field"])try{$.setLayoutProperty(f.id,"text-field",["coalesce",["get","name:ko"],["get","name"]])}catch{}$.addSource("sat",{type:"raster",tiles:[Xe],tileSize:256,maxzoom:19,attribution:"\uC704\uC131 Esri World Imagery"}),$.addLayer({id:"sat",type:"raster",source:"sat",layout:{visibility:"none"}},p);for(let f of e.boundaries)$.addSource(f.id,{type:"geojson",data:{type:"Feature",geometry:f.geometry,properties:{}}}),$.addLayer({id:f.id+"-f",type:"fill",source:f.id,paint:{"fill-color":f.color,"fill-opacity":f.fill??.08}},p),$.addLayer({id:f.id+"-l",type:"line",source:f.id,paint:{"line-color":f.color,"line-width":f.width||3,...f.dash?{"line-dasharray":f.dash}:{}}});for(let f of e.walks||[])$.addSource("wk-"+f.id,{type:"geojson",data:{type:"Feature",geometry:{type:"LineString",coordinates:[]},properties:{}}}),$.addLayer({id:"wk-"+f.id+"-c",type:"line",source:"wk-"+f.id,layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":"#fff","line-width":8,"line-opacity":.9}}),$.addLayer({id:"wk-"+f.id,type:"line",source:"wk-"+f.id,layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":f.color,"line-width":4.5}});$.addSource("zones",{type:"geojson",data:{type:"FeatureCollection",features:[]}}),ve(e,l),j.forEach(f=>{f.disabled=!1});let h=t.querySelector("#mapWait");h&&(h.classList.add("done"),at(()=>h.remove(),450));let g=u("#mapBase button.on",t)?.dataset.b;$.getLayer("sat")&&$.setLayoutProperty("sat","visibility",g==="sat"?"visible":"none");for(let f of e.walks||[])L.has(f.id)&&M(f,!0);let w=e.boundaries.find(f=>f.id===e.fit_to)||e.boundaries.find(f=>f.default);if(w){let f=w.geometry.coordinates.flat(2),z=[],C=[];for(let B=0;B<f.length;B+=2)z.push(f[B]),C.push(f[B+1]);$.fitBounds([[Math.min(...z),Math.min(...C)],[Math.max(...z),Math.max(...C)]],{padding:50,duration:0})}_()};$.on("load",k),$.on("style.load",()=>{if(r)try{k(),y()}catch(c){console.error("\uC9C0\uB3C4 \uCE35 \uB2E4\uC2DC \uC62C\uB9AC\uAE30 \uC2E4\uD328",c)}}),at(()=>{try{$.isStyleLoaded()&&k()}catch{}},1500);for(let c of e.places){let p=document.createElement("div");p.style.cssText="display:flex;align-items:center;gap:5px;font:600 13px Pretendard,sans-serif;color:#2b3440;text-shadow:0 0 3px #fff,0 0 3px #fff,0 0 3px #fff;white-space:nowrap;pointer-events:none",p.innerHTML=`<i style="width:${c.kind==="station"?10:8}px;height:${c.kind==="station"?10:8}px;border-radius:${c.kind==="station"?"2px":"50%"};background:${c.kind==="station"?"#fff":"#6E9C84"};border:2px solid ${c.kind==="station"?"#3b4654":"#fff"};display:inline-block"></i>${n(c.name)}`,new maplibregl.Marker({element:p,anchor:"left"}).setLngLat(c.lnglat).addTo($)}pt=(s.sites||[]).map((c,p)=>{let h=document.createElement("button");h.className=`pin ${Ut(c)}`,h.setAttribute("aria-label",`${c.no}\uBC88 ${c.jibun}`),h.style.animationDelay=`${.15+p*.05}s`,h.innerHTML=`<span>${c.no}</span>`,h.addEventListener("click",w=>{w.stopPropagation(),rt(c.id,!1)});let g=new maplibregl.Marker({element:h}).setLngLat(c.lnglat).addTo($);return g._sid=String(c.id),g});let y=()=>{let c=pt.map(g=>$.project(g.getLngLat())),p=c.map(()=>({x:0,y:0})),h=30;for(let g=0;g<c.length;g++)for(let w=g+1;w<c.length;w++){let f=c[w].x-c[g].x,z=c[w].y-c[g].y,C=Math.hypot(f,z);if(C>=h)continue;let B=C>.5?f/C:1,nt=C>.5?z/C:0,K=(h-C)/2;p[g].x-=B*K,p[g].y-=nt*K,p[w].x+=B*K,p[w].y+=nt*K}pt.forEach((g,w)=>g.setOffset([p[w].x,p[w].y]))};$.on("moveend",y),$.on("load",y),at(y,1600);function _(){let c=e.boundaries.filter(p=>l.has(p.id)&&e.compare.zones[p.id]);u("#zoneInfo",t).innerHTML=c.map(p=>{let h=e.compare.zones[p.id];return`<b style="color:${p.color}">${n(p.short)}</b> ${h.area.toLocaleString("ko-KR")}\u33A1 \xB7 13\uACF3 \uC911 ${h.sites_in}\uACF3 \uD3EC\uD568${h.area>15e4?' \xB7 <span style="color:var(--red)">\uAD8C\uC7A5 15\uB9CC\u33A1 \uCD08\uACFC</span>':""}`}).join("<br>")||"\uCF1C\uC9C4 \uAD6C\uC5ED\uACC4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4"}u("#zoneSeg",t).addEventListener("click",c=>{let p=c.target.closest("button");if(!p)return;let h=p.dataset.z,g=e.boundaries.find(w=>w.id===h);l.has(h)?l.delete(h):l.add(h),p.classList.toggle("on",l.has(h)),ve(e,l),_()}),u("#walkSeg",t)?.addEventListener("click",c=>{let p=c.target.closest("button");if(!p)return;let h=(e.walks||[]).find(f=>f.id===p.dataset.wk);if(!h)return;let g=!L.has(h.id);g?L.add(h.id):L.delete(h.id),p.classList.toggle("on",g),M(h,g);let w=(e.walks||[]).filter(f=>L.has(f.id));u("#walkInfo",t).innerHTML=w.length?w.map(f=>`<b style="color:${f.color}">${n(f.name)}</b> ${n(f.meta)}<br><span>${n(f.note)}</span>`).join("<br>"):"\uB204\uB974\uBA74 \uC9C0\uB3C4\uC5D0 \uAE38\uC774 \uADF8\uB824\uC9D1\uB2C8\uB2E4. \uBCF4\uD589 \uAE38 \uACC4\uC0B0\uAC12\uC774\uBA70 \uC2E4\uC81C \uC774\uB3D9 \uAE30\uB85D\uC774 \uC544\uB2D9\uB2C8\uB2E4."}),u("#mapBase",t).addEventListener("click",c=>{let p=c.target.closest("button");p&&(x("#mapBase button",t).forEach(h=>h.classList.toggle("on",h===p)),$.getLayer("sat")&&$.setLayoutProperty("sat","visibility",p.dataset.b==="sat"?"visible":"none"))}),u("#siteList",t).addEventListener("click",c=>{let p=c.target.closest(".site-it");p&&rt(p.dataset.id)}),u("#siteList",t).addEventListener("keydown",c=>{if(c.key==="Enter"){let p=c.target.closest(".site-it");p&&rt(p.dataset.id)}}),t.addEventListener("click",c=>{let p=c.target.closest("[data-fly]");if(p){c.preventDefault(),u("#map",t).scrollIntoView({behavior:"smooth",block:"center"}),at(()=>rt(p.dataset.fly),350);return}let h=c.target.closest("[data-card]");if(h){c.preventDefault();let g=document.getElementById("site-"+h.dataset.card);g?.scrollIntoView({behavior:"smooth",block:"center"}),g?.animate([{boxShadow:"0 0 0 4px rgba(201,154,46,.7)"},{boxShadow:"0 0 0 0 rgba(201,154,46,0)"}],{duration:1600})}}),u("#siteF",t).addEventListener("click",c=>{let p=c.target.closest(".chip");p&&(x("#siteF .chip",t).forEach(h=>h.classList.toggle("on",h===p)),x("#siteCards .site-card",t).forEach(h=>{h.style.display=p.dataset.f==="all"||h.dataset.t===p.dataset.f?"":"none"}))}),/^\d+$/.test(a||"")&&at(()=>{u("#map",t).scrollIntoView({block:"center"}),rt(a)},900)}function ss(){mt++;for(let t of St)clearTimeout(t);St.clear();try{vt?.remove(),$?.remove()}catch{}$=null,pt=[],vt=null}var Nt={};H(Nt,{mount:()=>is,render:()=>as});var jt=t=>`<span class="tag ${t==="\uD655\uC815"?"sage":t==="\uAC80\uD1A0 \uC911"?"gold":t==="\uC544\uC774\uB514\uC5B4"?"navy":""}">${n(t)}</span>`;function as(t){let s=t.plan,a=Object.fromEntries((t.sites||[]).map(e=>[String(e.id),e]));return`
  <section class="page-hero"><div class="wrap">
    <div class="crumb">\uAD6C\uC0C1</div>
    <h1 class="rv">\uBD09\uB9AC\uB2E8\uAE38\uC5D0 \uBB34\uC5C7\uC744, \uC5B4\uB5BB\uAC8C \uCC44\uC6B0\uB098\uC694?</h1>
    <p class="lead rv d1">${n(s.lead)}</p>
    <div class="art rv d2">${E(t.images.sec_plan,"\uB2EB\uD78C \uCE74\uD398\uC640 \uBE48\uD130\uAC00 \uBB38\uD654 \uAC70\uC810\uC73C\uB85C \uBC14\uB00C\uB294 \uBAA8\uC2B5 \uC5F0\uCD9C \uADF8\uB9BC")}</div>
  </div></section>

  <section id="s-dir" class="sec"><div class="wrap">
    <div class="sec-h rv"><span class="eyebrow">\uC815\uD574\uC9C4 \uBC29\uD5A5</span><h2>10\uC6D4 8\uC77C \uD604\uC7A5 \uC2E4\uBB34\uD68C\uC758\uC5D0\uC11C \uC815\uD55C \uAC83</h2><p>\uAE40\uD574\uC2DC \uB2F4\uB2F9\uACFC \uD604\uC7A5\uC744 \uD568\uAED8 \uAC77\uACE0 \uC815\uD55C \uC6D0\uCE59\uC785\uB2C8\uB2E4. \uD45C\uC2DC: ${jt("\uD655\uC815")} \uD569\uC758\uB428 \xB7 ${jt("\uAC80\uD1A0 \uC911")} \uB354 \uD655\uC778 \xB7 ${jt("\uC544\uC774\uB514\uC5B4")} \uC81C\uC548 \uB2E8\uACC4</p></div>
    <div class="grid g3">
      ${(s.principles||[]).map((e,o)=>`
      <div class="card hov rv d${o%3+1}">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span style="font-size:30px;font-weight:700;color:var(--celadon);line-height:1">${String(o+1).padStart(2,"0")}</span>${jt(e.state)}</div>
        <h3 style="margin-top:10px">${n(e.title)}</h3><p class="small">${n(e.desc)}</p>
      </div>`).join("")}
    </div>
  </div></section>

  <section id="s-struct" class="sec alt"><div class="wrap">
    <div class="sec-h rv"><span class="eyebrow">\uC0AC\uC5C5 \uAD6C\uC870</span><h2>\uC138 \uBD80\uCC98 \uC0AC\uC5C5\uC744 \uD55C \uADF8\uB987\uC5D0</h2><p>${n(s.structure_lead)}</p></div>
    <div class="grid g3">
      ${(s.structure||[]).map((e,o)=>`
      <div class="card rv d${o+1}" style="border-top:5px solid ${Y(e.color)}">
        <div class="cap" style="font-weight:700;color:${Y(e.color)}">${n(e.dept)}</div>
        <h3 style="margin-top:4px">${n(e.name)}</h3>
        <p class="small muted">${n(e.money)}</p>
        <hr class="soft" style="margin:14px 0">
        <div class="cap" style="font-weight:700">\uAC00\uC774\uB4DC\uB77C\uC778\uC774 \uC9C0\uC6D0\uD558\uB294 \uAC83</div>
        <ul style="margin:6px 0 0;padding-left:18px;font-size:15px">${e.what.map(l=>`<li>${n(l)}</li>`).join("")}</ul>
        <div class="cap" style="font-weight:700;margin-top:12px">\uAE40\uD574\uC5D0 \uB2F4\uC744 \uAC83(\uC548)</div>
        <ul style="margin:6px 0 0;padding-left:18px;font-size:15px">${e.ours.map(l=>`<li>${n(l)}</li>`).join("")}</ul>
      </div>`).join("")}
    </div>
  </div></section>

  <section id="s-hub" class="sec"><div class="wrap">
    <div class="sec-h rv"><span class="eyebrow">\uD575\uC2EC \uAC70\uC810</span><h2>${n(s.hub.title)}</h2><p>${n(s.hub.desc)}</p></div>
    <div class="grid g2">
      ${s.hub.sites.map((e,o)=>{let l=a[String(e)];return l?`
      <article class="card hov site-card hub wide rv d${o+1}">
        <div class="im">${E(l.photo,l.jibun+" \uD604\uC7A5 \uC0AC\uC9C4","zoomable")}<span class="no">${l.no}</span></div>
        <div class="tx"><h3>${n(l.jibun)} \u2014 ${n(l.short_use)}</h3><p class="small" style="margin-top:6px">${n(l.use2||l.use)}</p>
          <div class="meta"><span class="tag">${n(l.type)}</span><span class="tag">${n(l.area_note)}</span></div>
          <a class="copy" style="margin-top:12px" href="#/sites/${n(l.id)}">${m("pin")}\uC9C0\uB3C4\uC5D0\uC11C \uBCF4\uAE30</a></div>
      </article>`:""}).join("")}
    </div>
    <div class="grid g3" style="margin-top:20px">
      ${(s.hub.facts||[]).map((e,o)=>`<div class="card rv d${o+1}" style="padding:20px"><b>${n(e.k)}</b><p class="small">${n(e.v)}</p></div>`).join("")}
    </div>
  </div></section>

  <section id="s-culture" class="sec sand"><div class="wrap">
    <div class="sec-h rv"><span class="eyebrow">\uBB38\uD654 \uCF58\uD150\uCE20</span><h2>\uBE48 \uC810\uD3EC\uC5D0 \uCC44\uC6B8 \uCF58\uD150\uCE20 \uD6C4\uBCF4 30</h2><p>${n(s.culture.lead)}</p></div>
    <div class="grid g4" style="margin-bottom:28px">
      ${s.culture.picks.map((e,o)=>`
      <div class="card hov rv d${o+1}" style="border:2px solid var(--clay-l)">
        <span class="tag clay">\uCD94\uCC9C ${n(e.no)}</span>
        <h3 style="margin-top:10px">${n(e.name)}</h3><p class="small">${n(e.what)}</p>
        <p class="cap" style="margin-top:10px"><b>\uC65C</b> ${n(e.why)}</p>
        <p class="cap" style="margin-top:6px"><b>\uD655\uC778\uD560 \uAC83</b> ${n(e.check)}</p>
      </div>`).join("")}
    </div>
    <div class="filters" id="cuF"><button class="chip on" data-f="all">\uC804\uCCB4 30</button>${s.culture.groups.map(e=>`<button class="chip" data-f="${n(e)}">${n(e)}</button>`).join("")}</div>
    <div class="grid g3" id="cuList">
      ${s.culture.items.map(e=>`<div class="card" data-g="${n(e.group)}" style="padding:16px 18px;display:flex;gap:12px;align-items:flex-start;${e.pick?"border-color:var(--clay)":""}">
        <span style="flex:none;width:34px;height:34px;border-radius:10px;display:grid;place-items:center;font-weight:700;font-size:14px;background:${e.pick?"var(--clay)":"var(--paper)"};color:${e.pick?"#fff":"var(--ink2)"}">${n(e.no)}</span>
        <div><b style="font-size:16px">${n(e.name)}</b>${e.hold?' <span class="tag">\uBCF4\uB958</span>':""}<p class="cap" style="margin-top:2px">${n(e.what)}</p></div></div>`).join("")}
    </div>
    <p class="cap" style="margin-top:16px">${n(s.culture.note)}</p>
  </div></section>

  <section id="s-mp" class="sec"><div class="wrap">
    <div class="sec-h rv"><span class="eyebrow">\uB9C8\uC2A4\uD130\uD50C\uB79C \uC5F0\uCD9C\uC548</span><h2>\uADF8\uB9BC\uC73C\uB85C \uBCF8 \uB450 \uAC00\uC9C0 \uBC29\uD5A5</h2><p>${n(s.mp_lead)}</p></div>
    <div class="grid g2">
      ${(s.masterplans||[]).map((e,o)=>`
      <figure class="card rv d${o+1}" style="padding:0;overflow:hidden;margin:0">
        <div style="aspect-ratio:16/10;background:var(--sand);overflow:hidden">${E(e.img,e.title,"zoomable",'style="width:100%;height:100%;object-fit:cover"')}</div>
        <figcaption style="padding:18px 20px"><span class="tag navy">${n(e.tag)}</span><h3 style="margin-top:8px">${n(e.title)}</h3><p class="small">${n(e.desc)}</p><p class="cap" style="margin-top:6px">AI\uB85C \uADF8\uB9B0 \uC5F0\uCD9C \uADF8\uB9BC \u2014 \uC2E4\uC81C \uC124\uACC4\uC548\uC774 \uC544\uB2D9\uB2C8\uB2E4</p></figcaption>
      </figure>`).join("")}
    </div>
  </div></section>

  <section id="s-open" class="sec alt"><div class="wrap" style="max-width:960px">
    <div class="sec-h rv"><span class="eyebrow">\uC544\uC9C1 \uC815\uD560 \uAC83</span><h2>10\uC6D4 15\uC77C \uC2E4\uBB34\uD68C\uC758\uC5D0\uC11C \uD568\uAED8 \uC815\uD560 \uAC83</h2><p>\uC544\uB798 \uD56D\uBAA9\uC774 \uC815\uD574\uC9C0\uBA74 \uACC4\uD68D\uC11C \uCD08\uC548\uC774 \uBE60\uB974\uAC8C \uC644\uC131\uB429\uB2C8\uB2E4.</p></div>
    ${(s.open||[]).map((e,o)=>`
      <div class="acc rv">
        <button aria-expanded="false"><span class="q">${o+1}</span>${n(e.q)}<span class="chev">${m("chev")}</span></button>
        <div class="body"><div><div class="in"><p>${n(e.a)}</p></div></div></div>
      </div>`).join("")}
  </div></section>`}function is(t){u("#cuF",t)?.addEventListener("click",s=>{let a=s.target.closest(".chip");a&&(x("#cuF .chip",t).forEach(e=>e.classList.toggle("on",e===a)),x("#cuList>.card",t).forEach(e=>{e.style.display=a.dataset.f==="all"||e.dataset.g===a.dataset.f?"":"none"}))})}var Dt={};H(Dt,{mount:()=>os,render:()=>ns});function ns(t){let s=t.field;return`
  <section class="page-hero"><div class="wrap">
    <div class="crumb">\uD604\uC7A5\xB7\uB370\uC774\uD130</div>
    <h1 class="rv">\uD604\uC7A5\uC758 \uBAA9\uC18C\uB9AC\uC640 \uC22B\uC790\uB85C \uBCF8 \uC6D0\uB3C4\uC2EC</h1>
    <p class="lead rv d1">\uC9C1\uC811 \uAC77\uACE0 \uBB3C\uC5B4\uBCF8 \uB0B4\uC6A9\uACFC \uACF5\uACF5\uB370\uC774\uD130 \uBD84\uC11D \uACB0\uACFC\uC785\uB2C8\uB2E4. \uC22B\uC790\uB9C8\uB2E4 \uACC4\uC0B0 \uBC29\uBC95\uACFC \uCD9C\uCC98\uB97C \uB2EC\uC544 \uBCF4\uACE0\uC11C\uC5D0 \uADF8\uB300\uB85C \uC778\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.</p>
    <div class="art rv d2">${E(t.images.sec_voice,"\uAC00\uAC8C \uC55E\uC5D0\uC11C \uC8FC\uBBFC \uC758\uACAC\uC744 \uB4E3\uB294 \uBAA8\uC2B5 \uC5F0\uCD9C \uADF8\uB9BC")}</div>
  </div></section>

  <section id="s-voice" class="sec"><div class="wrap">
    <div class="sec-h rv"><span class="eyebrow">\uD604\uC7A5 \uBAA9\uC18C\uB9AC</span><h2>\uC8FC\uBBFC\xB7\uC0C1\uC778 \uC57D 50\uBA85\uC774 \uB9D0\uD55C \uAC83</h2><p>${n(s.voice.lead)}</p></div>
    <div class="grid g3">
      ${s.voice.themes.map((a,e)=>`
      <div class="card hov rv d${e%3+1}">
        <span class="vicon" aria-hidden="true">${m(["pin","bulb","clock","warn","map","user"][e%6])}</span>
        <h3 style="margin-top:8px">${n(a.title)}</h3>
        <ul style="margin:10px 0 0;padding-left:18px;font-size:15px;color:var(--ink2)">${a.points.map(o=>`<li style="margin-bottom:4px">${n(o)}</li>`).join("")}</ul>
      </div>`).join("")}
    </div>
    <div class="note navy" style="margin-top:22px">${m("info")}<div>${n(s.voice.note)}</div></div>
  </div></section>

  <section id="s-decline" class="sec alt"><div class="wrap">
    <div class="sec-h rv"><span class="eyebrow">\uC1E0\uD1F4 \uC694\uAC74</span><h2>\uC6D0\uB3C4\uC2EC\uC774 \uC1E0\uD1F4 \uC694\uAC74\uC744 \uCC44\uC6B0\uB098\uC694?</h2><p>${n(s.decline.lead)}</p></div>
    <div class="grid g3">
      ${s.decline.items.map((a,e)=>`
      <div class="card rv d${e+1}" style="text-align:center">
        <span class="tag ${a.ok?"sage":"gold"}">${a.ok?"\uC694\uAC74 \uCDA9\uC871":"\uCD94\uAC00 \uD655\uC778"}</span>
        <div class="kpi" style="padding:14px 0 4px"><div class="v" style="color:var(--navy)">${n(a.value)}</div><div class="k">${n(a.label)}</div></div>
        <p class="cap">${n(a.basis)}</p>
      </div>`).join("")}
    </div>
  </div></section>

  <section id="s-ind" class="sec"><div class="wrap">
    <div class="sec-h rv"><span class="eyebrow">\uC6D0\uB3C4\uC2EC \uC9C0\uD45C</span><h2>\uC22B\uC790\uB85C \uBCF8 \uC6D0\uB3C4\uC2EC</h2><p>\uCE74\uB4DC\uB97C \uB204\uB974\uBA74 \uACC4\uC0B0 \uBC29\uBC95\uC774 \uD3BC\uCCD0\uC9D1\uB2C8\uB2E4.</p></div>
    <div class="grid g4" id="indGrid">
      ${s.indicators.map((a,e)=>`
      <div class="card hov rv d${e%4+1}" style="cursor:pointer;padding:20px" data-ind role="button" tabindex="0" aria-expanded="false">
        <div class="cap" style="font-weight:700;color:var(--clay)">${n(a.group)}</div>
        <div style="font-size:30px;font-weight:700;color:var(--navy);margin-top:6px;letter-spacing:-.02em">${a.tone==="down"?'<span style="font-size:18px;color:var(--muted)" aria-label="\uAC10\uC18C">\u25BC </span>':a.tone==="up"?'<span style="font-size:18px;color:var(--muted)" aria-label="\uC99D\uAC00">\u25B2 </span>':""}${n(a.display)}</div>
        <b style="display:block;font-size:16px;margin-top:4px">${n(a.label)}</b>
        <p class="cap" style="margin-top:2px">${n(a.scope)}</p>
        <div class="more" hidden style="margin-top:10px;padding-top:10px;border-top:1px dashed var(--line2);font-size:14px;color:var(--ink2)">${n(a.method)}<div class="cap" style="margin-top:6px">\uCD9C\uCC98: ${n(a.source)}</div></div>
      </div>`).join("")}
    </div>
  </div></section>

  <section id="s-tools" class="sec alt"><div class="wrap">
    <div class="sec-h rv"><span class="eyebrow">\uBD84\uC11D \uB3C4\uAD6C</span><h2>\uB354 \uAE4A\uAC8C \uBCF4\uACE0 \uC2F6\uC73C\uC2DC\uBA74</h2><p>\uC6A9\uC5ED \uACFC\uC815\uC5D0\uC11C \uB9CC\uB4E0 \uBD84\uC11D \uC9C0\uB3C4\uC785\uB2C8\uB2E4. \uC0C8 \uCC3D\uC73C\uB85C \uC5F4\uB9BD\uB2C8\uB2E4.</p></div>
    <div class="grid g3">
      ${s.tools.map((a,e)=>`
      <a class="card hov guide-card rv d${e+1}" href="${n(ct(a.url))}" ${a.url.startsWith("#")?"":'target="_blank" rel="noopener"'}>
        <div class="im">${E(a.img,a.name)}</div>
        <div class="tx"><h3>${n(a.name)}<span class="arr">${m("ext")}</span></h3><p>${n(a.desc)}</p>${a.note?`<p class="cap" style="margin-top:6px">${n(a.note)}</p>`:""}</div>
      </a>`).join("")}
    </div>
  </div></section>`}function os(t){let s=a=>{let e=a.getAttribute("aria-expanded")!=="true";a.setAttribute("aria-expanded",String(e)),a.querySelector(".more").hidden=!e};u("#indGrid",t)?.addEventListener("click",a=>{let e=a.target.closest("[data-ind]");e&&s(e)}),u("#indGrid",t)?.addEventListener("keydown",a=>{(a.key==="Enter"||a.key===" ")&&a.target.matches("[data-ind]")&&(a.preventDefault(),s(a.target))})}var Gt={};H(Gt,{mount:()=>rs,render:()=>ds});var ls=["\uD68C\uC758","\uACB0\uC815","\uD604\uC7A5","\uD611\uC758","\uC0B0\uCD9C\uBB3C","\uC608\uC815"],cs=t=>({\uACB0\uC815:"navy",\uD68C\uC758:"sage",\uC0B0\uCD9C\uBB3C:"gold",\uD604\uC7A5:"clay",\uC608\uC815:""})[t]||"";function ds(t){let s=O(),a=[...t.timeline||[]].sort((i,d)=>d.date.localeCompare(i.date)),e=[];for(let i of a){let d=i.date.slice(0,7),r=e.find(v=>v.m===d);r||(r={m:d,items:[]},e.push(r)),r.items.push(i)}let o=i=>`${i.slice(0,4)}\uB144 ${+i.slice(5,7)}\uC6D4`,l=t.decisions||[];return`
  <section class="page-hero"><div class="wrap">
    <div class="crumb">\uC9C4\uD589 \uAE30\uB85D</div>
    <h1 class="rv">\uC5B8\uC81C, \uBB34\uC5C7\uC744 \uD588\uACE0 \uBB34\uC5C7\uC744 \uC815\uD588\uB098\uC694?</h1>
    <p class="lead rv d1">8\uC6D4 \uCC29\uC218\uBD80\uD130 \uC9C0\uAE08\uAE4C\uC9C0\uC758 \uD68C\uC758\xB7\uD604\uC7A5\uC870\uC0AC\xB7\uACB0\uC815\xB7\uC0B0\uCD9C\uBB3C\uC744 \uB0A0\uC9DC\uC21C\uC73C\uB85C \uC815\uB9AC\uD588\uC2B5\uB2C8\uB2E4. \uB2F4\uB2F9\uC774 \uBC14\uB00C\uC5B4\uB3C4 \uC774 \uAE30\uB85D\uB9CC \uBCF4\uBA74 \uD750\uB984\uC744 \uC774\uC5B4\uBC1B\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.</p>
    <div class="art rv d2">${E(t.images.sec_log,"\uC774\uC815\uD45C\uB97C \uB530\uB77C \uAC77\uB294 \uC0AC\uB78C\uB4E4 \uC5F0\uCD9C \uADF8\uB9BC")}</div>
  </div></section>

  ${(t.meetings||[]).length?`
  <section id="s-meet" class="sec" style="padding-top:36px"><div class="wrap" style="max-width:1000px">
    <div class="sec-h rv"><span class="eyebrow">\uC8FC\uC694 \uD68C\uC758</span><h2>\uD68C\uC758\uC5D0\uC11C \uBB34\uC5C7\uC744 \uB4E4\uC5C8\uACE0 \uC815\uD588\uB098\uC694?</h2><p>\uC8FC\uC694 \uD68C\uC758 ${t.meetings.length}\uBC88\uC744 \uC9E7\uAC8C \uC694\uC57D\uD588\uC2B5\uB2C8\uB2E4. \uC904\uC744 \uB204\uB974\uBA74 \uD3BC\uCCD0\uC9D1\uB2C8\uB2E4.</p></div>
    ${t.meetings.map((i,d)=>`
      <div class="acc rv ${d===t.meetings.length-1?"open":""}">
        <button aria-expanded="${d===t.meetings.length-1}"><span class="q" style="width:auto;padding:0 8px;white-space:nowrap">${n(F(i.date,!1))}</span>${n(i.title)}<span class="chev">${m("chev")}</span></button>
        <div class="body"><div><div class="in">
          <p class="cap">${[i.place,i.who].filter(Boolean).map(n).join(" \xB7 ")}</p>
          <ul style="margin:10px 0 0;padding-left:18px">${(i.points||[]).map(r=>`<li style="margin-bottom:4px">${n(r)}</li>`).join("")}</ul>
          ${(i.decided||[]).length?`<div class="note navy" style="margin-top:12px">${m("check")}<div><b>\uC815\uD574\uC9C4 \uAC83</b><br>${i.decided.map(r=>n(r)).join("<br>")}</div></div>`:""}
          ${i.later?`<p class="cap" style="margin-top:10px;color:var(--clay)">\uC774\uD6C4 \u2192 ${n(i.later)}</p>`:""}
        </div></div></div>
      </div>`).join("")}
  </div></section>`:""}

  <section id="s-dec" class="sec ${(t.meetings||[]).length?"alt":""}" style="padding-top:36px"><div class="wrap">
    <div class="sec-h rv"><span class="eyebrow">\uC8FC\uC694 \uACB0\uC815</span><h2>\uC9C0\uAE08 \uC720\uD6A8\uD55C \uACB0\uC815</h2><p>\uBC14\uB010 \uACB0\uC815\uC740 \u2018\uBC14\uB01C\u2019\uC73C\uB85C \uB0A8\uACA8 \uB450\uC5B4, \uC65C \uC9C0\uAE08 \uBC29\uD5A5\uC774 \uB418\uC5C8\uB294\uC9C0 \uB530\uB77C\uAC08 \uC218 \uC788\uC2B5\uB2C8\uB2E4.</p></div>
    <div class="tbl-wrap rv" style="max-width:1100px;margin:0 auto"><table class="tbl stack">
      <thead><tr><th style="width:110px">\uB0A0\uC9DC</th><th>\uACB0\uC815</th><th style="width:120px">\uC0C1\uD0DC</th><th>\uB204\uAC00\xB7\uC5B4\uB514\uC11C</th></tr></thead>
      <tbody>${l.map((i,d)=>`${d===0||l[d-1].state!==i.state?`<tr class="dec-g"><td colspan="4">${n(i.state==="\uC720\uD6A8"?"\uC9C0\uAE08 \uC720\uD6A8\uD55C \uACB0\uC815":i.state==="\uBC14\uB01C"?"\uBC14\uB010 \uACB0\uC815(\uC774\uB825)":"\uAC80\uD1A0 \uC911")}</td></tr>`:""}<tr><td class="num" data-l="\uB0A0\uC9DC">${F(i.date,!1)}</td><td><b style="font-weight:600">${n(i.title)}</b>${i.why?`<div class="cap">${n(i.why)}</div>`:""}${i.after?`<div class="cap" style="color:var(--clay)">\u2192 ${n(i.after)}</div>`:""}</td><td><span class="tag ${i.state==="\uC720\uD6A8"?"sage":i.state==="\uBC14\uB01C"?"":"gold"}">${n(i.state)}</span></td><td class="small" data-l="\uB204\uAC00\xB7\uC5B4\uB514\uC11C">${n(i.who)}</td></tr>`).join("")}</tbody>
    </table></div>
  </div></section>

  <section id="s-tl" class="sec ${(t.meetings||[]).length?"":"alt"}"><div class="wrap">
    <div class="sec-h rv"><span class="eyebrow">\uD0C0\uC784\uB77C\uC778</span><h2>\uB0A0\uC9DC\uC21C \uAE30\uB85D</h2></div>
    <div class="filters" id="logF"><button class="chip on" data-f="all">\uC804\uCCB4 ${a.length}</button>${ls.map(i=>{let d=a.filter(r=>r.type===i).length;return d?`<button class="chip" data-f="${i}">${i} ${d}</button>`:""}).join("")}</div>
    <div class="tl" id="logList">
      ${e.map(i=>`<div class="tl-m" data-m>${o(i.m)}</div>${i.items.map(d=>`
        <div class="tl-it k-${n(d.type)} rv" data-t="${n(d.type)}" style="${d.date>s?"border-style:dashed;background:#fff":""}">
          <div class="dt">${F(d.date)}${d.date>s?" \xB7 \uC608\uC815":""}</div>
          <h4><span class="tag ${cs(d.type)}">${n(d.type)}</span>${n(d.title)}</h4>
          <p>${n(d.summary)}</p>
        </div>`).join("")}`).join("")}
    </div>
  </div></section>`}function rs(t){u("#logF",t)?.addEventListener("click",s=>{let a=s.target.closest(".chip");if(!a)return;x("#logF .chip",t).forEach(i=>i.classList.toggle("on",i===a));let e=a.dataset.f;x("#logList .tl-it",t).forEach(i=>{i.style.display=e==="all"||i.dataset.t===e?"":"none"});let o=null,l=!1;for(let i of x("#logList > *",t))i.hasAttribute("data-m")?(o&&(o.style.display=l?"":"none"),o=i,l=!1):i.style.display!=="none"&&(l=!0);o&&(o.style.display=l?"":"none")})}var Vt={};H(Vt,{mount:()=>bs,render:()=>ms,unmount:()=>ys});var ue="gm-todo-done",he=()=>{try{return new Set(JSON.parse(localStorage.getItem(ue)||"[]"))}catch{return new Set}},ps=t=>{try{localStorage.setItem(ue,JSON.stringify([...t]))}catch{}};function vs(t,s){let[a,e]=t.split("-").map(Number),o=new Date(Date.UTC(a,e-1,1)),l=new Date(Date.UTC(a,e,0)).getUTCDate(),i=o.getUTCDay(),d=O(),r="";for(let b=0;b<i;b++)r+='<div class="cd e"></div>';for(let b=1;b<=l;b++){let L=`${t}-${String(b).padStart(2,"0")}`,M=s.filter(k=>k.date===L&&!k.month_only),j=(i+b-1)%7;r+=`<div class="cd ${L===d?"today":""} ${M.length?"has":""}" ${M.length?`title="${n(M.map(k=>k.title).join(" / "))}"`:""}>
      <span class="dn" style="${j===0?"color:var(--red)":j===6?"color:var(--navy)":""}">${b}</span>
      ${M.map(k=>`<span class="ev ${k.kind==="\uB9C8\uAC10"?"dead":k.tentative?"tent":""}">${n(k.short||k.title)}</span>`).join("")}
    </div>`}let v=s.filter(b=>b.month_only&&b.date.slice(0,7)===t);return`<div class="cal-h"><b>${a}\uB144 ${e}\uC6D4</b></div>${v.length?`<div class="note" style="margin-bottom:10px">${m("cal")}<div><b>\uC774\uB2EC \uC911(\uB0A0\uC9DC \uBBF8\uC815)</b> \xB7 ${v.map(b=>n(b.title)).join(" / ")}</div></div>`:""}<div class="cal">${"\uC77C\uC6D4\uD654\uC218\uBAA9\uAE08\uD1A0".split("").map(b=>`<div class="cw">${b}</div>`).join("")}${r}</div>`}function ms(t){let s=O(),e=[...t.schedule||[]].sort((i,d)=>i.date.localeCompare(d.date)).filter(i=>N(i,s)),o=[["\uAE40\uD574\uC2DC","clay"],["\uC6A9\uC5ED\uC0AC","navy"],["\uACF5\uB3D9","sage"]],l=he();return`
  <style>
    .cal-h{display:flex;justify-content:center;margin-bottom:10px;font-size:19px}
    .cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
    .cw{text-align:center;font-size:14px;color:var(--muted);font-weight:600;padding:4px 0}
    .cd{min-height:86px;border:1px solid var(--line);border-radius:10px;padding:6px;background:#fff;display:flex;flex-direction:column;gap:3px;overflow:hidden}
    .cd.e{border:0;background:none}
    .cd.today{border:2px solid var(--navy)}
    .cd.has{background:var(--paper)}
    .cd .dn{font-size:14px;font-weight:600}
    .cd .ev{display:block;font-size:13px;line-height:1.35;padding:2px 6px;border-radius:6px;background:var(--navy);color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .cd .ev.tent{background:#fff;color:var(--navy);border:1px dashed var(--navy)}
    .cd .ev.dead{background:var(--clay)}
    .calnav{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
    @media (max-width:640px){.cd{min-height:58px;padding:4px}}
  </style>
  <section class="page-hero"><div class="wrap">
    <div class="crumb">\uD560 \uC77C</div>
    <h1 class="rv">\uB2E4\uC74C\uC5D0 \uBB34\uC5C7\uC744, \uB204\uAC00 \uD558\uB098\uC694?</h1>
    <p class="lead rv d1">\uB2E4\uAC00\uC624\uB294 \uC77C\uC815\uACFC \uD560 \uC77C\uC744 <b>\uAE40\uD574\uC2DC \xB7 \uC6A9\uC5ED\uC0AC \xB7 \uACF5\uB3D9</b>\uC73C\uB85C \uB098\uB234\uC2B5\uB2C8\uB2E4. \uC77C\uC815\uC740 \uD734\uB300\uC804\uD654\xB7\uC5C5\uBB34\uC6A9 \uB2EC\uB825\uC5D0 \uBC14\uB85C \uB123\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.</p>
    <div class="rv d2" style="margin-top:18px"><button class="btn pri" id="icsBtn">${m("cal")}\uC77C\uC815\uC744 \uB0B4 \uB2EC\uB825\uC5D0 \uB123\uAE30(.ics)</button></div>
    <div class="art rv d2">${E(t.images.sec_todo,"\uB2EC\uB825\uACFC \uC810\uAC80\uD45C\uAC00 \uB193\uC778 \uCC45\uC0C1 \uC5F0\uCD9C \uADF8\uB9BC")}</div>
  </div></section>

  <section id="s-cal" class="sec" style="padding-top:36px"><div class="wrap">
    <div class="grid" style="grid-template-columns:1.35fr 1fr;gap:28px;align-items:start" id="calWrap">
      <div class="card rv">
        <div class="calnav"><button class="copy" id="calPrev">\u2039 \uC774\uC804 \uB2EC</button><span class="cap">\uC810\uC120 = \uB0A0\uC9DC \uD655\uC778 \uD544\uC694</span><button class="copy" id="calNext">\uB2E4\uC74C \uB2EC \u203A</button></div>
        <div id="calBox"></div>
      </div>
      <div class="rv d1">
        <h3 style="font-size:20px;margin-bottom:12px">\uB2E4\uAC00\uC624\uB294 \uC77C\uC815</h3>
        ${e.map(i=>{let d=Z(i.date),r=wt(i);return`
          <div class="dcard ${d<=7&&!i.month_only?"soon":""}" style="box-shadow:var(--shadow);margin-bottom:10px;cursor:default">
            <div class="d" style="width:68px;height:68px;${i.month_only?"background:var(--ink2)":""}"><b style="font-size:20px">${r.big}</b><small>${r.small}</small></div>
            <div><h4>${n(i.title)}${i.tentative?' <span class="tag gold">\uD655\uC778 \uD544\uC694</span>':""}</h4><p>${n(i.detail||"")}</p></div>
          </div>`}).join("")}
      </div>
    </div>
  </div></section>

  <section id="s-roles" class="sec alt"><div class="wrap">
    <div class="sec-h rv"><span class="eyebrow">\uB204\uAC00 \uBB34\uC5C7\uC744</span><h2>\uC5ED\uD560\uBCC4 \uD560 \uC77C</h2><p>10\uC6D4 8\uC77C \uC2E4\uBB34\uD68C\uC758\uC5D0\uC11C \uB098\uB208 \uC5ED\uD560\uC744 \uC815\uB9AC\uD588\uC2B5\uB2C8\uB2E4. \uCCB4\uD06C \uD45C\uC2DC\uB294 \uBCF4\uB294 \uBD84 \uAE30\uAE30\uC5D0\uB9CC \uC800\uC7A5\uB429\uB2C8\uB2E4.</p></div>
    <div class="kan">
      ${o.map(([i,d])=>{let r=(t.todos||[]).filter(v=>v.who===i);return`
      <div class="col rv"><h3><span class="tag ${d}">${i}</span><span class="cnt">${r.length}\uAC74</span></h3>
        ${r.map(v=>`<label class="todo ${l.has(v.id)?"chk":""}"><input type="checkbox" data-id="${n(v.id)}" ${l.has(v.id)?"checked":""}><div><b>${n(v.title)}</b><span>${v.due?`${m("clock","sicon")} ${n(v.due)} \xB7 `:""}${n(v.detail||"")}</span></div></label>`).join("")}
      </div>`}).join("")}
    </div>
  </div></section>

  <section id="s-req" class="sec"><div class="wrap" style="max-width:1000px">
    <div class="sec-h rv"><span class="eyebrow">\uC790\uB8CC \uC694\uCCAD</span><h2>\uC2DC\uC5D0\uC11C \uC900\uBE44\uD574 \uC8FC\uC2E4 \uC790\uB8CC</h2><p>\uACC4\uD68D\uC11C \uCD08\uC548\uC5D0 \uAF2D \uD544\uC694\uD55C \uC790\uB8CC\uC785\uB2C8\uB2E4. \uBC1B\uB294 \uB300\uB85C \uC774 \uD45C\uB97C \uAC31\uC2E0\uD569\uB2C8\uB2E4.</p></div>
    <div class="tbl-wrap rv"><table class="tbl stack"><thead><tr><th>\uC790\uB8CC</th><th>\uC4F0\uC784</th><th style="width:130px">\uC0C1\uD0DC</th></tr></thead><tbody>
      ${(t.requests||[]).map(i=>`<tr><td><b style="font-weight:600">${n(i.what)}</b></td><td class="small">${n(i.why)}</td><td><span class="tag ${i.state.startsWith("\uBC1B\uC74C")?"sage":i.state.startsWith("\uB300\uAE30")?"gold":i.state.includes("\uD655\uC778")?"red":"navy"}">${n(i.state)}</span></td></tr>`).join("")}
    </tbody></table></div>
  </div></section>`}var us=new TextEncoder;function hs(t){let s=[],a="";for(let e of t){let o=s.length?74:75;us.encode(a+e).length>o?(s.push(a),a=e):a+=e}return s.push(a),s.join(`\r
 `)}var gs=(t,s)=>new Date(`${t}T${s}:00+09:00`).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");function fs(t){let s=l=>l.replace(/-/g,""),a=l=>String(l||"").replace(/\\/g,"\\\\").replace(/[,;]/g,i=>"\\"+i).replace(/\n/g,"\\n"),e=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z"),o=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//gimhae-recore//ko","CALSCALE:GREGORIAN","METHOD:PUBLISH","X-WR-CALNAME:\uAE40\uD574 \uC6D0\uB3C4\uC2EC RE:CORE","X-WR-TIMEZONE:Asia/Seoul"];for(let l of t.schedule||[])if(!(l.date<O()||l.month_only)){if(o.push("BEGIN:VEVENT",`UID:${s(l.date)}-${encodeURIComponent(l.title).replace(/%/g,"").slice(0,40)}@gimhae-recore`,`DTSTAMP:${e}`),l.time)o.push(`DTSTART:${gs(l.date,l.time)}`,"DURATION:PT2H");else{let i=new Date(l.date+"T00:00:00Z");i.setUTCDate(i.getUTCDate()+1),o.push(`DTSTART;VALUE=DATE:${s(l.date)}`,`DTEND;VALUE=DATE:${i.toISOString().slice(0,10).replace(/-/g,"")}`)}o.push(`SUMMARY:${a((l.tentative?"(\uD655\uC778 \uD544\uC694) ":"")+l.title)}`,`DESCRIPTION:${a(l.detail)}`,"END:VEVENT")}return o.push("END:VCALENDAR"),o.map(hs).join(`\r
`)+`\r
`}function bs(t,s){let a=[...new Set((s.schedule||[]).map(r=>r.date.slice(0,7)))].sort(),e=O().slice(0,7),o=Math.max(0,a.indexOf(e));a.indexOf(e)<0&&(o=a.findIndex(r=>r>e)>=0?a.findIndex(r=>r>e):0);let l=[];{let[r,v]=(a[0]||e).split("-").map(Number),[b,L]=(a.at(-1)||e).split("-").map(Number);for(let M=r,j=v;(M<b||M===b&&j<=L)&&(j>12&&(j=1,M++),l.push(`${M}-${String(j).padStart(2,"0")}`),!(l.length>24));j++);}let i=Math.max(0,l.indexOf(e)),d=()=>{u("#calBox",t).innerHTML=vs(l[i],s.schedule||[]),u("#calPrev",t).disabled=i<=0,u("#calNext",t).disabled=i>=l.length-1};d(),u("#calPrev",t).addEventListener("click",()=>{i>0&&(i--,d())}),u("#calNext",t).addEventListener("click",()=>{i<l.length-1&&(i++,d())}),t.addEventListener("change",r=>{let v=r.target.closest(".todo input");if(!v)return;let b=he();v.checked?b.add(v.dataset.id):b.delete(v.dataset.id),ps(b),v.closest(".todo").classList.toggle("chk",v.checked)}),u("#icsBtn",t).addEventListener("click",()=>{let r=document.createElement("a"),v=URL.createObjectURL(new Blob([fs(s)],{type:"text/calendar;charset=utf-8"}));r.href=v,r.download="\uAE40\uD574_RECORE_\uC77C\uC815.ics",document.body.appendChild(r),r.click(),r.remove(),setTimeout(()=>URL.revokeObjectURL(v),1e3),q("\uB2EC\uB825 \uD30C\uC77C\uC744 \uB0B4\uB824\uBC1B\uC558\uC2B5\uB2C8\uB2E4. \uC5F4\uBA74 \uC77C\uC815\uC774 \uCD94\uAC00\uB429\uB2C8\uB2E4")}),ut=matchMedia("(max-width: 900px)"),ht=()=>{let r=u("#calWrap",t);r&&(r.style.gridTemplateColumns=ut.matches?"1fr":"1.35fr 1fr")},ht(),ut.addEventListener?.("change",ht)}var ut=null,ht=null;function ys(){ut?.removeEventListener?.("change",ht),ut=ht=null}var Wt={};H(Wt,{mount:()=>xs,render:()=>$s});function $s(t){let s=t.library||[],a=[...new Set(s.map(e=>e.group))];return`
  <section class="page-hero"><div class="wrap">
    <div class="crumb">\uC790\uB8CC\uC2E4</div>
    <h1 class="rv">\uD544\uC694\uD55C \uC790\uB8CC\uB97C \uBC14\uB85C \uAEBC\uB0B4 \uC4F0\uC138\uC694</h1>
    <p class="lead rv d1">\uC6A9\uC5ED \uACFC\uC815\uC5D0\uC11C \uB9CC\uB4E0 \uBCF4\uACE0\uC11C\xB7\uC9C0\uB3C4\xB7\uBD84\uC11D \uC790\uB8CC\uC640 \uAC00\uC774\uB4DC\uB77C\uC778 \uC6D0\uBB38\uC744 \uBAA8\uC558\uC2B5\uB2C8\uB2E4. \uBBF8\uB9AC\uBCF4\uAE30\uB97C \uB204\uB974\uBA74 \uD06C\uAC8C \uBCF4\uC774\uACE0, \uB2E8\uCD94\uB85C \uC5F4\uAC70\uB098 \uB0B4\uB824\uBC1B\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.</p>
    <div class="art rv d2">${E(t.images.sec_library,"\uBCF4\uACE0\uC11C\uC640 \uC9C0\uB3C4\uAC00 \uC815\uB9AC\uB41C \uC5F0\uCD9C \uADF8\uB9BC")}</div>
  </div></section>

  <section id="s-list" class="sec" style="padding-top:36px"><div class="wrap">
    <div class="grid g4" style="margin-bottom:28px">
      ${(t.stats||[]).map((e,o)=>`<div class="card kpi rv d${o+1}"><div class="v"><span data-count="${e.v}">0</span><small>${n(e.unit)}</small></div><div class="k">${n(e.k)}</div><div class="s">${n(e.s||"")}</div></div>`).join("")}
    </div>
    <div class="filters" id="libF"><button class="chip on" data-f="all">\uC804\uCCB4 ${s.length}</button>${a.map(e=>`<button class="chip" data-f="${n(e)}">${n(e)} ${s.filter(o=>o.group===e).length}</button>`).join("")}</div>
    <div class="grid g3" id="libList">
      ${s.map((e,o)=>`
      <div class="card hov lib-card rv d${o%3+1}" data-g="${n(e.group)}">
        <div class="im">${e.thumb?E(e.thumb,e.title,"zoomable"):""}<span class="tag ${e.kind==="PDF"?"clay":e.kind==="\uC6F9"?"navy":"sage"}" style="position:absolute;left:12px;top:12px">${n(e.kind)}</span></div>
        <div class="tx">
          <div class="cap">${n(e.date)} \xB7 ${n(e.group)}</div>
          <h3 style="margin-top:2px">${n(e.title)}</h3>
          <p>${n(e.desc)}</p>
          <div class="act">
            ${e.file?`<button class="copy" data-open="${n(e.file)}">${m("file")}\uC5F4\uAE30</button><button class="copy" data-dl="${n(e.file)}" data-name="${n(e.dlname||e.title)}">${m("down")}\uB0B4\uB824\uBC1B\uAE30</button>`:""}
            ${e.url?`<a class="copy" href="${n(e.url)}" target="_blank" rel="noopener">${m("ext")}\uC0C8 \uCC3D\uC73C\uB85C \uC5F4\uAE30</a>`:""}
            ${e.route?`<a class="copy" href="#/${n(e.route)}">${m("arrow")}\uC774 \uC548\uB0B4\uD310\uC5D0\uC11C \uBCF4\uAE30</a>`:""}
          </div>
          ${e.note?`<p class="cap" style="margin-top:8px">${n(e.note)}</p>`:""}
        </div>
      </div>`).join("")}
    </div>
  </div></section>`}function xs(t){u("#libF",t)?.addEventListener("click",s=>{let a=s.target.closest(".chip");a&&(x("#libF .chip",t).forEach(e=>e.classList.toggle("on",e===a)),x("#libList .lib-card",t).forEach(e=>{e.style.display=a.dataset.f==="all"||e.dataset.g===a.dataset.f?"":"none"}))}),t.addEventListener("click",async s=>{let a=s.target.closest("[data-open]"),e=s.target.closest("[data-dl]");if(!a&&!e)return;s.preventDefault();let o=a?a.dataset.open:e.dataset.dl,l=o.split(".").pop(),i=(e||a.closest(".lib-card")?.querySelector("[data-dl]"))?.dataset.name||o.split("/").pop().replace(/\.[^.]+$/,""),d=a&&/^pdf$/i.test(l)?window.open("","_blank"):null;q("\uD30C\uC77C\uC744 \uC900\uBE44\uD558\uB294 \uC911\uC785\uB2C8\uB2E4\u2026");try{let r=await D(o);if(window.__ASSET||(r=new URL(r,location.href).href),d&&!d.closed){d.location.replace(r);return}let v=document.createElement("a");v.href=r,v.download=`${i}.${l}`,document.body.appendChild(v),v.click(),v.remove()}catch{try{d?.close()}catch{}q("\uD30C\uC77C\uC744 \uC5F4\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4")}})}var Kt={};H(Kt,{render:()=>ks});function ws(t){let s=t.brief,a=t.requirements||[],e=l=>a.filter(i=>i.status===l||l==="ing"&&i.status==="chk").length,o=(t.schedule||[]).filter(l=>N(l)).slice(0,4);return[`[\uAE40\uD574 \uC6D0\uB3C4\uC2EC RE:CORE \uC900\uBE44 \uD604\uD669] ${t.meta.asof} \uAE30\uC900`,"","\u25A0 \uC0AC\uC5C5 \uAC1C\uC694",...s.overview.map(l=>`- ${l}`),"","\u25A0 \uAE40\uD574 \uC900\uBE44 \uD604\uD669",...s.status.map(l=>`- ${l}`),`- \uC2E0\uCCAD \uC694\uAC74 ${a.length}\uAC1C \uC911 \uCDA9\uC871 ${e("ok")} \xB7 \uC9C4\uD589\xB7\uD655\uC778 \uC911 ${e("ing")} \xB7 \uBBF8\uCDA9\uC871 ${e("no")}`,"","\u25A0 \uC8FC\uC694 \uC77C\uC815",...o.map(l=>`- ${l.month_only?`${+l.date.slice(5,7)}\uC6D4 \uC911`:F(l.date)} ${l.title}${l.tentative&&!l.month_only?"(\uD655\uC778 \uD544\uC694)":""}`),"","\u25A0 \uB2E4\uC74C \uD560 \uC77C",...s.next.map(l=>`- ${l}`)].join(`
`)}function ks(t){let s=t.brief,a=t.requirements||[],e=l=>a.filter(i=>i.status===l||l==="ing"&&i.status==="chk").length,o=(t.schedule||[]).filter(l=>N(l)).slice(0,5);return`
  <style>
    .a4{width:min(210mm,100%);margin:0 auto;background:#fff;border:1px solid var(--line);box-shadow:var(--shadow-h);padding:16mm 15mm;border-radius:6px;font-size:14.5px;line-height:1.6}
    .a4 h1{font-size:23px;text-align:left}
    .a4 .top{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid var(--navy);padding-bottom:8px;margin-bottom:12px;gap:12px}
    .a4 .top .cap{font-size:13px}
    .a4 h2{font-size:15.5px;color:var(--navy);margin:12px 0 6px;display:flex;align-items:center;gap:6px}
    .a4 h2::before{content:"";width:5px;height:15px;background:var(--clay);border-radius:2px}
    .a4 ul{margin:0;padding-left:18px}
    .a4 li{margin-bottom:2px}
    .a4 .two{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .a4 .box{border:1px solid var(--line);border-radius:8px;padding:8px 12px;background:var(--paper)}
    .a4 table{width:100%;border-collapse:collapse;font-size:13.5px}
    .a4 td,.a4 th{border-bottom:1px solid var(--line);padding:4px 6px;text-align:left}
    .a4 .meter{height:10px}
    .a4 .foot{margin-top:12px;font-size:13px;color:var(--muted);border-top:1px solid var(--line);padding-top:6px}
    .a4 tr,.a4 li{break-inside:avoid;page-break-inside:avoid}
    @media (max-width:700px){.a4{padding:20px 16px}.a4 .two{grid-template-columns:1fr}
      .a4 .gaps thead{display:none}.a4 .gaps,.a4 .gaps tbody,.a4 .gaps tr,.a4 .gaps td{display:block;width:100%!important}
      .a4 .gaps tr{padding:8px 0;border-bottom:1px solid var(--line)}.a4 .gaps td{border:0;padding:1px 0}}
    @media print{body{background:#fff}.a4{box-shadow:none;border:0;padding:0;width:auto;font-size:9.5pt;line-height:1.45}.a4 h1{font-size:17pt}.a4 h2{margin:8px 0 4px;font-size:11pt}.a4 table{font-size:9pt}.page-hero,.bar-actions,.pinfo,.keysum,.subnav,.util,.totop{display:none!important}main{min-height:0}}
  </style>
  <section class="page-hero no-print" style="padding:36px 0 20px"><div class="wrap">
    <div class="crumb">\uBCF4\uACE0\uC6A9 1\uC7A5</div>
    <h1 class="rv" style="font-size:36px">\uC0C1\uAE09\uC790 \uBCF4\uACE0\uC6A9 \uD55C \uC7A5 \uC694\uC57D</h1>
    <p class="lead rv d1">\uC778\uC1C4\uD558\uAC70\uB098 PDF\uB85C \uC800\uC7A5\uD574 \uACB0\uC7AC\xB7\uBCF4\uACE0\uC5D0 \uC4F0\uC138\uC694. \uBA54\uC2E0\uC800 \uBCF4\uACE0\uC6A9 \uAE00\uB3C4 \uD55C \uBC88\uC5D0 \uBCF5\uC0AC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.</p>
    <div class="bar-actions rv d2" style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px">
      <button class="btn pri" onclick="window.print()">${m("print")}\uC778\uC1C4 \xB7 PDF\uB85C \uC800\uC7A5</button>
      ${et(ws(t),"\uBA54\uC2E0\uC800\uC6A9 \uAE00 \uBCF5\uC0AC")}
    </div>
  </div></section>
  <section style="padding:10px 16px 60px">
    <article class="a4">
      <div class="top"><div><div class="cap">${n(t.meta.program)}</div><h1>\uAE40\uD574 \uC6D0\uB3C4\uC2EC RE:CORE \uC0AC\uC5C5 \uC900\uBE44 \uD604\uD669</h1></div><div class="cap" style="text-align:right">${n(t.meta.asof)} \uAE30\uC900</div></div>
      <h2>\uC0AC\uC5C5 \uAC1C\uC694</h2>
      <ul>${s.overview.map(l=>`<li>${n(l)}</li>`).join("")}</ul>
      <div class="two">
        <div>
          <h2>\uAE40\uD574 \uC900\uBE44 \uD604\uD669</h2>
          <ul>${s.status.map(l=>`<li>${n(l)}</li>`).join("")}</ul>
          <div class="box" style="margin-top:8px">
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><b>\uC2E0\uCCAD \uC694\uAC74 ${a.length}\uAC1C</b><span>\uCDA9\uC871 ${e("ok")} \xB7 \uC9C4\uD589\xB7\uD655\uC778 \uC911 ${e("ing")} \xB7 \uBBF8\uCDA9\uC871 ${e("no")}</span></div>
            <div class="meter"><span class="ok" style="width:${e("ok")/a.length*100}%"></span><span class="ing" style="width:${e("ing")/a.length*100}%"></span><span class="no" style="width:${e("no")/a.length*100}%"></span></div>
          </div>
        </div>
        <div>
          <h2>\uC8FC\uC694 \uC77C\uC815</h2>
          <table><tbody>${o.map(l=>`<tr><td style="white-space:nowrap;width:104px"><b>${l.month_only?`${+l.date.slice(5,7)}\uC6D4 \uC911`:F(l.date)}</b></td><td>${n(l.title)}${l.tentative&&!l.month_only?' <span style="color:#9A6E0E">(\uD655\uC778 \uD544\uC694)</span>':""}</td><td style="white-space:nowrap;color:var(--muted)">${l.month_only?"\uC7A0\uC815":Ot(Z(l.date))}</td></tr>`).join("")}</tbody></table>
        </div>
      </div>
      <h2>\uBA3C\uC800 \uCC59\uAE38 \uC694\uAC74 <span style="font-weight:400;color:var(--muted);font-size:13px">(\uBBF8\uCDA9\uC871\xB7\uD655\uC778 \uD544\uC694 \uC6B0\uC120 ${Math.min(6,a.filter(l=>l.status!=="ok").length)}\uAC1C \xB7 \uC804\uCCB4\uB294 \uC694\uAC74 \uC810\uAC80 \uD654\uBA74)</span></h2>
      <table class="gaps"><thead><tr><th style="width:30%">\uC694\uAC74</th><th style="width:12%">\uC0C1\uD0DC</th><th>\uB2E4\uC74C \uD560 \uC77C</th></tr></thead><tbody>
        ${a.filter(l=>l.status!=="ok").sort((l,i)=>({no:0,chk:1,ing:2}[l.status]??3)-({no:0,chk:1,ing:2}[i.status]??3)).slice(0,6).map(l=>`<tr><td><b>${n(l.title)}</b></td><td style="white-space:nowrap">${P(l.status,{no:"\uBBF8\uCDA9\uC871",chk:"\uD655\uC778 \uD544\uC694",ing:"\uC9C4\uD589 \uC911"}[l.status]||"")}</td><td>${n(l.next||"")}</td></tr>`).join("")}
      </tbody></table>
      <h2>\uB2E4\uC74C \uD560 \uC77C</h2>
      <ul>${s.next.map(l=>`<li>${n(l)}</li>`).join("")}</ul>
      <div class="foot">\uADFC\uAC70: \uAD6D\uD1A0\uAD50\uD1B5\uBD80 \u300C2027\uB144 \uAC70\uC810\uD2B9\uD654 \uC6D0\uB3C4\uC2EC RE:CORE \uD504\uB85C\uC81D\uD2B8 \uC2DC\uBC94\uC0AC\uC5C5 \uAC00\uC774\uB4DC\uB77C\uC778(\uC548)\u300D(2026.9.11 \uC124\uBA85\uD68C\uBCF8), \uAE40\uD574\uC2DC \uB300\uC0C1\uC9C0 \uBAA9\uB85D(10.8), \uD604\uC7A5 \uC2E4\uBB34\uD68C\uC758(10.8) \xB7 \uAC00\uC774\uB4DC\uB77C\uC778\uC740 \uD655\uC815 \uACF5\uACE0 \uC804 \uC548(\u6848)\uC73C\uB85C \uBC14\uB014 \uC218 \uC788\uC74C</div>
    </article>
  </section>`}var S=null,T=0,V=[],ge=null,Mt=0;function Ls(t){return{title:"\uB2E4\uC74C \uC77C\uC815",text:(t.schedule||[]).filter(a=>N(a)).slice(0,4).map(a=>`${a.month_only?`${+a.date.slice(5,7)}\uC6D4 \uC911`:F(a.date)} \u2014 ${a.title}`).join(`
`)}}async function G(){let t=++Mt,s=V[T],a=S.querySelector(".tour-box");a.classList.remove("in"),a.offsetWidth,a.classList.add("in"),S.querySelector(".tour-k").textContent=s.k,S.querySelector(".tour-t").textContent=s.title,S.querySelector(".tour-x").innerHTML=n(s.text).replace(/\n/g,"<br>");let e=S.querySelector(".tour-go");e.href=`#/${s.route}`,e.lastChild.textContent=s.cta,S.querySelector(".tour-dots").innerHTML=V.map((i,d)=>`<button class="${d===T?"on":""}" data-i="${d}" aria-label="${d+1}\uBC88\uC9F8 \uC7A5"></button>`).join(""),S.querySelector(".tour-prev").disabled=T===0,S.querySelector(".tour-next").textContent=T===V.length-1?"\uCC98\uC74C\uC73C\uB85C":"\uB2E4\uC74C";let o=S.querySelector(".tour-im img");o.style.opacity="0";let l=await D(s.img);t!==Mt||!S.classList.contains("open")||(o.onload=()=>{t===Mt&&(o.style.opacity="1")},o.src=l)}function Zt(){if(!S)return;Mt++,S.classList.remove("open");let t=document.getElementById("main"),s=document.getElementById("hd");t&&(t.inert=!1),s&&(s.inert=!1);try{localStorage.setItem("gm-tour-seen","1")}catch{}document.querySelector(".tour-chip")?.remove(),ge?.focus?.()}function fe(t){if(V=(t.tour||[]).map(e=>e.dynamic==="schedule"?{...e,...Ls(t)}:e),!V.length)return;if(ge=document.activeElement,!S){S=document.createElement("div"),S.className="tour",S.setAttribute("role","dialog"),S.setAttribute("aria-modal","true"),S.setAttribute("aria-label","3\uBD84 \uB458\uB7EC\uBCF4\uAE30"),S.innerHTML=`<div class="tour-dim"></div>
      <div class="tour-box">
        <button class="tour-close" aria-label="\uB2EB\uAE30">${m("close")}</button>
        <div class="tour-im"><img alt=""></div>
        <div class="tour-tx">
          <div class="tour-k"></div><h2 class="tour-t"></h2><p class="tour-x"></p>
          <div class="tour-act"><a class="btn line tour-go" href="#/">${m("arrow")}<span></span></a></div>
          <div class="tour-nav"><button class="btn line tour-prev">\uC774\uC804</button><div class="tour-dots"></div><button class="btn pri tour-next">\uB2E4\uC74C</button></div>
        </div>
      </div>`,document.body.appendChild(S),S.addEventListener("click",o=>{if(o.target.closest(".tour-close")||o.target.classList.contains("tour-dim")||o.target.closest(".tour-go"))return Zt();o.target.closest(".tour-prev")&&T>0&&(T--,G()),o.target.closest(".tour-next")&&(T=T<V.length-1?T+1:0,G());let l=o.target.closest(".tour-dots button");l&&(T=+l.dataset.i,G())}),document.addEventListener("keydown",o=>{if(S.classList.contains("open")&&(o.key==="Escape"&&Zt(),o.key==="ArrowRight"&&T<V.length-1&&(T++,G()),o.key==="ArrowLeft"&&T>0&&(T--,G()),o.key==="Tab")){let l=[...S.querySelectorAll("a[href],button")].filter(i=>!i.disabled&&i.offsetParent!==null);if(l.length){let i=l[0],d=l[l.length-1];o.shiftKey&&document.activeElement===i?(o.preventDefault(),d.focus()):!o.shiftKey&&document.activeElement===d&&(o.preventDefault(),i.focus())}}});let e=null;S.addEventListener("touchstart",o=>{e=o.touches[0].clientX},{passive:!0}),S.addEventListener("touchend",o=>{if(e===null)return;let l=o.changedTouches[0].clientX-e;e=null,l<-50&&T<V.length-1?(T++,G()):l>50&&T>0&&(T--,G())})}document.querySelector(".tour-chip")?.remove();try{localStorage.setItem("gm-tour-seen","1")}catch{}T=0,S.classList.add("open");let s=document.getElementById("main"),a=document.getElementById("hd");s&&(s.inert=!0),a&&(a.inert=!0),G(),setTimeout(()=>S.querySelector(".tour-next")?.focus(),50)}function be(t){let s=!1;try{s=localStorage.getItem("gm-tour-seen")==="1"}catch{}if(s||document.querySelector(".tour-chip"))return;let a=document.createElement("div");a.className="tour-chip",a.innerHTML=`<span>\uCC98\uC74C \uC624\uC168\uB098\uC694? \uC0AC\uC5C5 \uC804\uCCB4\uB97C <b>3\uBD84</b>\uC5D0 \uB458\uB7EC\uBCF4\uC138\uC694</span><button class="btn pri" data-tour>\uB458\uB7EC\uBCF4\uAE30</button><button class="tour-chip-x" aria-label="\uC548\uB0B4 \uB2EB\uAE30">${m("close")}</button>`,document.body.appendChild(a),a.addEventListener("click",e=>{if(e.target.closest(".tour-chip-x")){try{localStorage.setItem("gm-tour-seen","1")}catch{}a.remove()}})}var ft=[{label:"\uC0AC\uC5C5 \uC18C\uAC1C",route:"guide",icon:"book",items:[["\uD55C\uB208\uC5D0 \uC694\uC57D","guide","sum"],["\uC9C0\uC6D0 \uADDC\uBAA8","guide","money"],["\uC2E0\uCCAD \uC694\uAC74","guide","req"],["\uC120\uC815 \uBC29\uC2DD","guide","eval"],["\uCD94\uC9C4 \uCCB4\uACC4","guide","actors"],["\uC77C\uC815\xB7\uC11C\uB958","guide","sched"],["\uC790\uC8FC \uBB3B\uB294 \uC9C8\uBB38","guide","faq"],["\uC6A9\uC5B4 \uD480\uC774","guide","terms"]]},{label:"\uAE40\uD574 \uC6D0\uB3C4\uC2EC",route:"sites",icon:"map",items:[["\uB300\uC0C1\uC9C0 \uC9C0\uB3C4","sites","map"],["\uAD6C\uC5ED\uACC4 \uBE44\uAD50","sites","zones"],["\uB300\uC0C1\uC9C0 13\uACF3","sites","cards"],["\uD604\uC7A5 \uBAA9\uC18C\uB9AC","field","voice"],["\uC1E0\uD1F4 \uC694\uAC74","field","decline"],["\uC6D0\uB3C4\uC2EC \uC9C0\uD45C","field","ind"]]},{label:"\uCD94\uC9C4 \uD604\uD669",route:"check",icon:"list",items:[["\uC694\uAC74 \uC810\uAC80\uD45C","check",""],["\uC8FC\uC694 \uD68C\uC758","log","meet"],["\uC8FC\uC694 \uACB0\uC815","log","dec"],["\uC9C4\uD589 \uAE30\uB85D","log","tl"]]},{label:"\uACC4\uD68D \uAD6C\uC0C1",route:"plan",icon:"bulb",items:[["\uC815\uD574\uC9C4 \uBC29\uD5A5","plan","dir"],["\uC0AC\uC5C5 \uAD6C\uC870","plan","struct"],["\uD575\uC2EC \uAC70\uC810","plan","hub"],["\uBB38\uD654 \uCF58\uD150\uCE20","plan","culture"],["\uAD6C\uC0C1\uB3C4","plan","mp"],["\uD568\uAED8 \uC815\uD560 \uAC83","plan","open"]]},{label:"\uC77C\uC815\xB7\uD560 \uC77C",route:"todo",icon:"cal",items:[["\uC77C\uC815 \uB2EC\uB825","todo","cal"],["\uC5ED\uD560\uBCC4 \uD560 \uC77C","todo","roles"],["\uC694\uCCAD \uC790\uB8CC","todo","req"]]},{label:"\uC790\uB8CC\uC2E4",route:"library",icon:"folder",items:[["\uC790\uB8CC \uBAA9\uB85D","library",""],["\uBD84\uC11D \uC9C0\uB3C4","field","tools"],["\uBCF4\uACE0\uC6A9 1\uC7A5","brief",""]]}],ye={guide:{group:0,label:"\uC0AC\uC5C5 \uC18C\uAC1C"},sites:{group:1,label:"\uB300\uC0C1\uC9C0"},field:{group:1,label:"\uD604\uC7A5\xB7\uB370\uC774\uD130"},check:{group:2,label:"\uC694\uAC74 \uC810\uAC80\uD45C"},log:{group:2,label:"\uD68C\uC758\xB7\uACB0\uC815\xB7\uAE30\uB85D"},plan:{group:3,label:"\uACC4\uD68D \uAD6C\uC0C1"},todo:{group:4,label:"\uC77C\uC815\xB7\uD560 \uC77C"},library:{group:5,label:"\uC790\uB8CC \uBAA9\uB85D"},brief:{group:5,label:"\uBCF4\uACE0\uC6A9 1\uC7A5"}},W=(t,s)=>`#/${t}${s?"/"+s:""}`,$e='<svg viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="13" fill="#22406A"/><circle cx="24" cy="24" r="17.5" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="1.2"/><path d="M8 32c3.9-9.6 9.2-14.4 16-14.4S36.1 22.4 40 32" fill="#4F8468"/><path d="M6 32.6h36" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><rect x="19.6" y="24.4" width="8.8" height="8.2" rx="1.2" fill="#B85C35"/><rect x="22.6" y="27.4" width="2.8" height="5.2" fill="#F6E7DE"/><circle cx="35" cy="13" r="3.2" fill="#F4D58D"/></svg>';function xe(){return`
  <div class="util" role="navigation" aria-label="\uBC14\uB85C\uAC00\uAE30">
    <div class="wrap">
      <span class="util-l">2027 \uAC70\uC810\uD2B9\uD654 \uC6D0\uB3C4\uC2EC <b>RE:CORE</b> \uD504\uB85C\uC81D\uD2B8 \xB7 \uAE40\uD574 \uC6D0\uB3C4\uC2EC \uC0AC\uC5C5 \uC548\uB0B4</span>
      <span class="util-r">
        <a href="#/guide/faq">\uC790\uC8FC \uBB3B\uB294 \uC9C8\uBB38</a><a href="#/library">\uC790\uB8CC\uC2E4</a><a href="#/brief">\uBCF4\uACE0\uC6A9 1\uC7A5</a><button type="button" data-tour>3\uBD84 \uB458\uB7EC\uBCF4\uAE30</button>
      </span>
    </div>
  </div>
  <header class="hd" id="hd"><div class="wrap">
    <a class="brand" href="#/" aria-label="\uAE40\uD574 \uC6D0\uB3C4\uC2EC RE:CORE \uCC98\uC74C\uC73C\uB85C">${$e}<span><b>\uAE40\uD574 \uC6D0\uB3C4\uC2EC <em>RE:CORE</em></b><small>\uB2E4\uC2DC \uCC44\uC6B0\uACE0, \uB2E4\uC2DC \uC0B4\uC544\uB098\uB294 \uC6D0\uB3C4\uC2EC</small></span></a>
    <nav class="gnb" aria-label="\uC8FC\uC694 \uBA54\uB274">
      ${ft.map((t,s)=>`<a href="${W(t.route)}" data-g="${s}">${n(t.label)}</a>`).join("")}
      <div class="mega" aria-hidden="true"><div class="mega-in">
        ${ft.map(t=>`<ul>${t.items.map(([s,a,e])=>`<li><a href="${W(a,e)}" tabindex="-1">${n(s)}</a></li>`).join("")}</ul>`).join("")}
      </div></div>
    </nav>
    <div class="hd-act">
      <button class="ibtn" id="openSearch" aria-label="\uCC3E\uAE30">${m("search")}<span class="lbl">\uCC3E\uAE30</span><kbd>/</kbd></button>
      <button class="ibtn allmenu" id="openMenu" aria-label="\uC804\uCCB4\uBA54\uB274 \uC5F4\uAE30">${m("menu")}<span class="lbl">\uC804\uCCB4\uBA54\uB274</span></button>
    </div>
  </div></header>`}function we(){return`<div class="drawer" id="drawer" aria-hidden="true"><div class="dim" data-close></div>
    <div class="pane sitemap" role="dialog" aria-label="\uC804\uCCB4\uBA54\uB274">
      <div class="sm-top"><b>\uC804\uCCB4\uBA54\uB274</b><button class="ibtn" data-close aria-label="\uB2EB\uAE30">${m("close")}</button></div>
      <a class="sm-home" href="#/">${m("home")} \uCC98\uC74C \uD654\uBA74</a>
      <div class="sm-grid">
        ${ft.map(t=>`<section><h3><a href="${W(t.route)}">${m(t.icon)}${n(t.label)}</a></h3><ul>${t.items.map(([s,a,e])=>`<li><a href="${W(a,e)}">${n(s)}</a></li>`).join("")}</ul></section>`).join("")}
      </div>
      <button class="btn line sm-tour" data-tour>${m("bulb")}3\uBD84 \uB458\uB7EC\uBCF4\uAE30</button>
    </div></div>`}function ke(t){let s=[["\uAD6D\uD1A0\uAD50\uD1B5\uBD80","https://www.molit.go.kr"],["\uBB38\uD654\uCCB4\uC721\uAD00\uAD11\uBD80","https://www.mcst.go.kr"],["\uC911\uC18C\uBCA4\uCC98\uAE30\uC5C5\uBD80","https://www.mss.go.kr"],["\uC8FC\uD0DD\uB3C4\uC2DC\uBCF4\uC99D\uACF5\uC0AC","https://www.khug.or.kr"],["\uACBD\uC0C1\uB0A8\uB3C4","https://www.gyeongnam.go.kr"],["\uAE40\uD574\uC2DC","https://www.gimhae.go.kr"]];return`<footer class="ft">
    <div class="ft-links"><div class="wrap">
      ${ft.map(a=>`<a href="${W(a.route)}">${n(a.label)}</a>`).join("")}
      <span class="sep"></span><span class="cap" style="color:#C9D3E2">\uAD00\uB828 \uAE30\uAD00</span>
      ${s.map(([a,e])=>`<a href="${e}" target="_blank" rel="noopener">${a}</a>`).join("")}
    </div></div>
    <div class="wrap ft-main">
      <div class="ft-brand">${$e}<div><b>\uAE40\uD574 \uC6D0\uB3C4\uC2EC RE:CORE</b><span>2027 \uAC70\uC810\uD2B9\uD654 \uC6D0\uB3C4\uC2EC \uC2DC\uBC94\uC0AC\uC5C5 \xB7 \uAE40\uD574\uC2DC \uCD94\uC9C4</span></div></div>
      <div class="ft-text">
        <p>\uC774 \uB204\uB9AC\uC9D1\uC740 \uAE40\uD574 \uC6D0\uB3C4\uC2EC RE:CORE \uC0AC\uC5C5 \uCD94\uC9C4\uC744 \uC9C0\uC6D0\uD558\uAE30 \uC704\uD574 \uC815\uB9AC\xB7\uC6B4\uC601\uD558\uB294 \uC0AC\uC5C5 \uC548\uB0B4 \uB204\uB9AC\uC9D1\uC785\uB2C8\uB2E4(\uAE40\uD574\uC2DC \uACF5\uC2DD \uB204\uB9AC\uC9D1 \uC544\uB2D8). \uC218\uCE58\uB9C8\uB2E4 \uCD9C\uCC98\uB97C \uB2EC\uC558\uACE0 \uD655\uC778\uB418\uC9C0 \uC54A\uC740 \uB0B4\uC6A9\uC740 \u2018\uD655\uC778 \uD544\uC694\u2019\uB85C \uD45C\uC2DC\uD588\uC2B5\uB2C8\uB2E4.</p>
        <p class="ft-meta">${[t.meta?.asof&&`\uC790\uB8CC \uAE30\uC900 ${t.meta.asof}`,(window.__BUILT||t.meta?.built)&&`\uD654\uBA74 \uAC31\uC2E0 ${window.__BUILT||t.meta.built}`,t.meta?.maker].filter(Boolean).map(n).join(" \xB7 ")}</p>
      </div>
    </div>
  </footer>`}var gt=null;function Le(t,s,a){let e=ye[s];if(!e)return;let o=ft[e.group],l=o.items,i=l.filter(([,p,h])=>p===s&&h).map(([,,p])=>p),d=i.map(p=>t.querySelector("#s-"+p)).filter(Boolean),r=t.querySelector(".page-hero .crumb");if(r){let p=d.length&&e.label!==o.label?`<i>\u203A</i><a href="${W(s)}">${n(e.label)}</a>`:"";r.innerHTML=`<a href="#/">${m("home")}<span class="sr">\uCC98\uC74C</span></a><i>\u203A</i><a href="${W(o.route)}">${n(o.label)}</a>${p}<i>\u203A</i><b class="crumb-now">${n(e.label)}</b>`}let v=t.querySelector(".page-hero");if(!v)return;let b=`<button type="button" data-pt="print">${m("print")}<span>\uC778\uC1C4</span></button><button type="button" data-pt="link">${m("link")}<span>\uC8FC\uC18C \uBCF5\uC0AC</span></button>`,L=p=>{let h=p.target.closest("[data-pt]");h&&(h.dataset.pt==="print"?(q("\uC778\uC1C4\uD560 \uD654\uBA74\uC744 \uC900\uBE44\uD558\uB294 \uC911\uC785\uB2C8\uB2E4\u2026"),ce().then(()=>window.print())):xt(location.href,null,"\uC774 \uD654\uBA74 \uC8FC\uC18C\uB97C \uBCF5\uC0AC\uD588\uC2B5\uB2C8\uB2E4. \uBA54\uC2E0\uC800\xB7\uBA54\uC77C\uC5D0 \uBD99\uC5EC \uB123\uC73C\uC138\uC694"))};if(r&&s!=="brief"){let p=document.createElement("div");p.className="ptools no-print",p.innerHTML=b,p.addEventListener("click",L),v.querySelector(".wrap")?.appendChild(p)}let M=document.createElement("section");M.className="pinfo";let j=window.__BUILT||a.meta?.built;M.innerHTML=`<div class="wrap"><div class="pinfo-in">
    <ul>
      <li><b>\uC790\uB8CC \uAE30\uC900\uC77C</b><span>${n(a.meta?.asof||"")}${j?` \xB7 \uD654\uBA74 \uAC31\uC2E0 ${n(j)}`:""}</span></li>
      <li><b>\uC815\uB9AC</b><span>${n(String(a.meta?.maker||"").replace(/^정리·제작:\s*/,""))}</span></li>
      <li><b>\uD45C\uAE30 \uC6D0\uCE59</b><span>\uC218\uCE58\uB9C8\uB2E4 \uCD9C\uCC98 \xB7 \uBBF8\uD655\uC778\uC740 \u2018\uD655\uC778 \uD544\uC694\u2019</span></li>
    </ul>
    <div class="pinfo-act no-print">${b}<button type="button" data-pt="top">${m("up")}<span>\uB9E8 \uC704\uB85C</span></button></div>
  </div></div>`,M.addEventListener("click",p=>{if(p.target.closest('[data-pt="top"]')){window.scrollTo({top:0,behavior:"smooth"});return}L(p)}),s!=="brief"&&t.appendChild(M);let k=document.createElement("nav");k.className="subnav",k.setAttribute("aria-label",`${o.label} \uD558\uC704 \uBA54\uB274`),k.innerHTML=`<div class="wrap"><div class="subnav-in">${l.map(([p,h,g])=>`<a href="${W(h,g)}" data-r="${h}" data-s="${g}" class="${h===s&&!g?"on":""}">${n(p)}</a>`).join("")}</div></div>`,v.after(k);let y=a.page_summary?.[s];if(y?.length){let p=document.createElement("section");p.className="keysum",p.innerHTML=`<div class="wrap"><div class="keysum-in rv"><div class="keysum-h">${m("bulb")}<b>\uC774 \uD654\uBA74 \uD575\uC2EC</b></div><ol>${y.map(h=>`<li>${n(h)}</li>`).join("")}</ol></div></div>`,k.after(p)}gt?.disconnect();let _=r?.querySelector(".crumb-now"),c=p=>{x(".subnav a",k).forEach(g=>g.classList.toggle("on",g.dataset.r===s&&(g.dataset.s===p||!p&&!g.dataset.s)));let h=l.find(([,g,w])=>g===s&&w===p);_&&h&&(_.textContent=h[0])};d.length&&(c(i[0]),gt=new IntersectionObserver(p=>{let h=p.filter(z=>z.isIntersecting).sort((z,C)=>z.boundingClientRect.top-C.boundingClientRect.top);if(!h[0])return;let g=h[0].target.id.slice(2);c(g);let w=k.querySelector(`a[data-s="${g}"][data-r="${s}"]`),f=k.querySelector(".subnav-in");if(w&&f&&f.scrollWidth>f.clientWidth){let z=w.getBoundingClientRect(),C=f.getBoundingClientRect();f.scrollTo({left:f.scrollLeft+z.left-C.left-(f.clientWidth-z.width)/2,behavior:"smooth"})}},{rootMargin:"-140px 0px -55% 0px"}),d.forEach(p=>gt.observe(p)))}function Ee(){gt?.disconnect(),gt=null}function Se(t){let s=ye[t];x(".gnb > a").forEach(a=>a.classList.toggle("on",!!(s&&+a.dataset.g===s.group)))}var je=[{id:"",label:"\uCC98\uC74C",page:Bt,icon:"home",desc:"\uD55C\uB208\uC5D0 \uBCF4\uAE30"},{id:"guide",label:"\uC0AC\uC5C5 \uC18C\uAC1C",page:Ht,icon:"book",desc:"\uAD6D\uD1A0\uBD80 \uAC00\uC774\uB4DC\uB77C\uC778(\uC548) \uC27D\uAC8C \uBCF4\uAE30"},{id:"check",label:"\uC2E0\uCCAD \uC694\uAC74 \uC810\uAC80",page:Ft,icon:"list",desc:"\uAE40\uD574\uAC00 \uCC44\uC6B4 \uAC83\xB7\uB0A8\uC740 \uAC83"},{id:"sites",label:"\uB300\uC0C1\uC9C0",page:Pt,icon:"map",desc:"\uC9C0\uB3C4\xB713\uACF3\xB7\uAD6C\uC5ED\uACC4"},{id:"plan",label:"\uACC4\uD68D \uAD6C\uC0C1",page:Nt,icon:"bulb",desc:"\uAC70\uC810\xB7\uC6A9\uB3C4\xB7\uCF58\uD150\uCE20"},{id:"field",label:"\uD604\uC7A5\xB7\uB370\uC774\uD130",page:Dt,icon:"chart",desc:"\uC8FC\uBBFC \uBAA9\uC18C\uB9AC\xB7\uC218\uCE58"},{id:"log",label:"\uD68C\uC758\xB7\uACB0\uC815\xB7\uAE30\uB85D",page:Gt,icon:"clock",desc:"\uC5B8\uC81C \uBB34\uC5C7\uC744 \uC815\uD588\uB098"},{id:"todo",label:"\uC77C\uC815\xB7\uD560 \uC77C",page:Vt,icon:"cal",desc:"\uC77C\uC815\xB7\uB204\uAC00 \uBB34\uC5C7\uC744"},{id:"library",label:"\uC790\uB8CC\uC2E4",page:Wt,icon:"folder",desc:"\uC0B0\uCD9C\uBB3C\xB7\uC6D0\uBB38 \uB0B4\uB824\uBC1B\uAE30"}],Es=[{id:"brief",page:Kt,label:"\uBCF4\uACE0\uC6A9 1\uC7A5"}];try{history.scrollRestoration="manual"}catch{}var Ss=new URLSearchParams(location.search);(Ss.get("motion")==="off"||matchMedia("(prefers-reduced-motion: reduce)").matches)&&document.documentElement.classList.add("nomo");var I=null;function js(){document.body.innerHTML=`
  <a class="sr skip" id="skip" href="#main">\uBCF8\uBB38 \uBC14\uB85C\uAC00\uAE30</a>
  ${xe()}
  <main id="main" tabindex="-1"></main>
  <div id="ftSlot"></div>
  ${we()}
  <div class="sch" id="sch" role="dialog" aria-label="\uCC3E\uAE30"><div class="box">
    <input id="schIn" type="search" placeholder="\uBB34\uC5C7\uC774\uB4E0 \uCC3E\uC544\uBCF4\uC138\uC694 \u2014 \uC608: \uACF5\uC2E4 10\uD638\uB294 \uC5B4\uB5BB\uAC8C \uC138\uB098\uC694, \uAD8C\uC6D0, 10/15" autocomplete="off">
    <div class="res" id="schRes"></div>
  </div></div>
  <div class="lb" id="lb" role="dialog" aria-label="\uADF8\uB9BC \uD06C\uAC8C \uBCF4\uAE30"><img alt=""><div class="cap"></div><button aria-label="\uB2EB\uAE30">\xD7</button></div>
  <button class="totop no-print" id="totop" type="button" aria-label="\uB9E8 \uC704\uB85C">${m("up")}<span>TOP</span></button>`}var bt=null,Me=0,Te=t=>{t.style.display==="none"&&(t.style.display=""),t.matches(".acc:not(.open)")&&(t.classList.add("open"),t.querySelector(":scope>button")?.setAttribute("aria-expanded","true"))};async function _t(){let t=++Me,s=location.hash.replace(/^#\/?/,"").split(/[/?]/)[0]||"",a=je.find(v=>v.id===s)||Es.find(v=>v.id===s)||je[0],e=location.hash.split("/")[2]||"",o=u("#main"),l=o.querySelector(".page");if(bt&&a===bt&&l&&e&&!/^\d+$/.test(e)){let v=l.querySelector("#s-"+CSS.escape(e));if(v){Te(v),Ct(),window.scrollTo({top:Math.max(0,v.getBoundingClientRect().top+scrollY-128),behavior:document.documentElement.classList.contains("nomo")?"instant":"smooth"});return}}if(bt?.page?.unmount)try{bt.page.unmount()}catch{}Ee(),bt=a;let i=document.createElement("div");i.className="page";let d;try{d=a.page.render(I,e)}catch(v){console.error("\uD654\uBA74 \uADF8\uB9AC\uAE30 \uC624\uB958",v),d='<section class="sec"><div class="wrap" style="text-align:center">\uC774 \uD654\uBA74 \uC790\uB8CC\uB97C \uADF8\uB9AC\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC0C8\uB85C\uACE0\uCE68\uD558\uAC70\uB098 \uB2E4\uB978 \uBA54\uB274\uB97C \uB20C\uB7EC \uC8FC\uC138\uC694.</div></section>'}if(i.innerHTML=d,ne(o.firstElementChild),o.replaceChildren(i),document.title=`${a.id?a.label+" | ":""}\uAE40\uD574 \uC6D0\uB3C4\uC2EC RE:CORE`,Se(a.id),Ct(),a.id&&Le(i,a.id,I),window.scrollTo({top:0,behavior:"instant"}),ot(i),At(i),a.page.mount)try{await a.page.mount(i,I,e)}catch(v){console.error("\uD654\uBA74 \uC900\uBE44 \uC624\uB958",v)}if(t!==Me)return;ot(i),At(i);let r=e&&!/^\d+$/.test(e)?i.querySelector("#s-"+CSS.escape(e)):null;r&&Te(r),r&&requestAnimationFrame(()=>{let v=r.getBoundingClientRect().top+scrollY-128;window.scrollTo({top:Math.max(0,v),behavior:"instant"})});try{sessionStorage.setItem("gm-last",a.id)}catch{}}var Qt=null;function Jt(t,s){Qt=document.activeElement,t.setAttribute("aria-modal","true"),u("#main").inert=!0,u("#hd").inert=!0,s?.focus()}function te(){u("#main").inert=!1,u("#hd").inert=!1;let t=Qt;Qt=null,t?.focus?.()}function Ms(){let t=u("#drawer");t.classList.add("open"),t.setAttribute("aria-hidden","false"),Jt(t,t.querySelector("a"))}function Ct(){let t=u("#drawer");t?.classList.contains("open")&&(t.classList.remove("open"),t.setAttribute("aria-hidden","true"),te())}var Xt=[];function Ts(){Xt=[];let t=(e,o,l,i)=>Xt.push({route:e,title:o,text:String(l||""),kind:i,hay:(o+" "+l).toLowerCase()}),s=I;for(let e of s.requirements||[])t("check",e.title,`${e.rule} ${e.now} ${e.next||""}`,"\uC694\uAC74 \uC810\uAC80");(s.faq||[]).forEach((e,o)=>t(`guide/faq-${o}`,e.q,e.a,"\uC790\uC8FC \uBB3B\uB294 \uC9C8\uBB38")),(s.terms||[]).forEach((e,o)=>t(`guide/term-${o}`,e.term,e.def,"\uC6A9\uC5B4 \uD480\uC774"));for(let e of s.sites||[])t(`sites/${e.id}`,`${e.no}\uBC88 ${e.jibun}`,`${e.type||""} ${e.use||""} ${e.note||""}`,"\uB300\uC0C1\uC9C0");for(let e of s.timeline||[])t("log",`${e.date} ${e.title}`,e.summary,"\uC9C4\uD589 \uAE30\uB85D");for(let e of s.decisions||[])t("log",e.title,`${e.why||""} ${e.state||""}`,"\uACB0\uC815 \uC0AC\uD56D");for(let e of s.meetings||[])t("log",`${e.date} ${e.title}`,[...e.points||[],...e.decided||[]].join(" "),"\uC8FC\uC694 \uD68C\uC758");for(let e of s.todos||[])t("todo",e.title,`${e.who||""} ${e.due||""} ${e.detail||""}`,"\uD560 \uC77C");for(let e of s.schedule||[])t("todo",`${e.date} ${e.title}`,e.detail,"\uC77C\uC815");for(let e of s.library||[])t("library",e.title,`${e.desc||""} ${e.kind||""}`,"\uC790\uB8CC\uC2E4");let a=s.guideline||{};for(let e of a.requirements||[])t("guide/req",e.k,`${e.kind||""} ${e.v||""} ${e.memo||""}`,"\uAC00\uC774\uB4DC\uB77C\uC778");for(let e of a.rules||[])t("guide/money",e.k,`${e.tag||""} ${e.v||""}`,"\uAC00\uC774\uB4DC\uB77C\uC778");for(let e of[...a.eval_pf||[],...a.eval_molit||[],...a.eval_mcst||[],...a.eval_bonus||[]])t("guide/eval",e.item,`${e.group||""} ${e.score_label||""}`,"\uD3C9\uAC00 \uD56D\uBAA9");for(let e of a.documents||[])t("guide/sched",e.name,e.note,"\uC81C\uCD9C \uC11C\uB958")}function _e(){let t=u("#sch");t.classList.add("open");let s=u("#schIn");s.value="",Ae(""),Jt(t,null),setTimeout(()=>s.focus(),20)}function Tt(){let t=u("#sch");t.classList.contains("open")&&(t.classList.remove("open"),te())}var it=0,_s=/(으로써|으로|에서|까지|부터|에게|하고|이나|이랑|처럼|보다|인가요|하나요|되나요|있나요|없나요|할까요|일까요|인지|는지|은지|나요|까요|해요|이에요|예요|입니다|은|는|이|가|을|를|에|의|로|와|과|도|만|요)$/,Ce=new Set(["\uC5B4\uB5BB\uAC8C","\uBB34\uC5C7","\uBB50","\uBB54\uAC00","\uC5B8\uC81C","\uC5B4\uB514","\uC5BC\uB9C8","\uC5BC\uB9C8\uB098","\uBA87","\uC65C","\uB204\uAC00","\uB204\uAD6C","\uC788","\uD558","\uB418","\uC218","\uAC83","\uC880","\uADF8","\uC774","\uC800","\uC54C\uB824","\uC54C\uB824\uC918","\uAD81\uAE08","\uD574","\uD574\uC918","\uBCF4\uC5EC\uC918","\uC815\uB9AC"]);function Cs(t){let s=[];for(let a of t.toLowerCase().split(/[^0-9a-z가-힣㎡%.\-]+/)){if(!a||Ce.has(a))continue;let e=a.match(_s),o=e&&a.length-e[0].length>=2?a.slice(0,-e[0].length):a;Ce.has(o)||s.push(o)}return s}var Re=t=>{let s=t.replace(/\s+/g,""),a=new Set;for(let e=0;e<s.length-1;e++)a.add(s.slice(e,e+2));return a};function zs(t,s,a){let e=0,o=t.title.toLowerCase(),l=t.hay;for(let i of s)o.includes(i)?e+=3+Math.min(i.length,4)*.5:l.includes(i)&&(e+=1+Math.min(i.length,4)*.2);if(a.size){let i=Re(o),d=0;for(let r of a)i.has(r)&&d++;e+=d/a.size*4}return(t.kind==="\uC790\uC8FC \uBB3B\uB294 \uC9C8\uBB38"||t.kind==="\uC6A9\uC5B4 \uD480\uC774")&&(e*=1.15),e}function Ae(t){let s=u("#schRes");if(t=t.trim(),!t){s.innerHTML='<div class="empty">\uB0B1\uB9D0\uC774\uB098 \uC9C8\uBB38\uC744 \uADF8\uB300\uB85C \uC801\uC5B4 \uBCF4\uC138\uC694.<br>\uC608: <b>\uACF5\uC2E4 10\uD638\uB294 \uC5B4\uB5BB\uAC8C \uC138\uB098\uC694</b> \xB7 <b>\uB9E4\uC785\uBE44 \uC0C1\uD55C</b> \xB7 <b>10/15</b> \xB7 <b>15-2</b></div>';return}let a=Cs(t),e=Re(t.toLowerCase()),o=a.filter(y=>!/(나요|까요|가요|세요|해요)$/.test(y));if(!a.length&&e.size<1){s.innerHTML='<div class="empty">\uC870\uAE08 \uB354 \uAD6C\uCCB4\uC801\uC73C\uB85C \uC801\uC5B4 \uC8FC\uC138\uC694.</div>';return}let l=Xt.map(y=>({x:y,s:zs(y,a,e),hit:o.some(_=>y.hay.includes(_))})).filter(y=>y.s>=1.2);o.length&&l.some(y=>y.hit)&&(l=l.filter(y=>y.hit)),l.sort((y,_)=>_.s-y.s);let i=l.slice(0,30);if(!i.length){s.innerHTML=`<div class="empty">\u2018${n(t)}\u2019\uC5D0 \uB9DE\uB294 \uB0B4\uC6A9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uB2E4\uB978 \uB0B1\uB9D0\uB85C \uCC3E\uC544\uBCF4\uC138\uC694.</div>`;return}let d=a.filter(y=>y.length>=2||/\d/.test(y)).sort((y,_)=>_.length-y.length).map(y=>y.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")),r=d.length?new RegExp(`(${d.join("|")})`,"gi"):null,v=y=>(y=y.length>150?y.slice(0,150)+"\u2026":y,r?y.split(r).map((_,c)=>c%2?`<mark>${n(_)}</mark>`:n(_)).join(""):n(y)),b=i[0],L=/[?？]|(나요|까요|인가|어떻게|무엇|얼마|언제|누가|몇)/.test(t),M=o.length>0&&o.every(y=>b.x.hay.includes(y))&&(b.x.kind!=="\uC6A9\uC5B4 \uD480\uC774"||o.some(y=>b.x.title.toLowerCase().includes(y))),j=b&&M&&(b.x.kind==="\uC790\uC8FC \uBB3B\uB294 \uC9C8\uBB38"||b.x.kind==="\uC6A9\uC5B4 \uD480\uC774")&&(L||b.s>=6)?`<div class="ans"><small>${b.x.kind==="\uC790\uC8FC \uBB3B\uB294 \uC9C8\uBB38"?"\uAC00\uC7A5 \uAC00\uAE4C\uC6B4 \uB2F5":"\uC6A9\uC5B4 \uD480\uC774"}</small><b>${n(b.x.title)}</b><p>${n(b.x.text)}</p><a href="#/${lt(b.x.route)}" data-close-sch>${b.x.kind==="\uC790\uC8FC \uBB3B\uB294 \uC9C8\uBB38"?"\uC9C8\uBB38 \uBAA8\uC74C\uC5D0\uC11C \uBCF4\uAE30":"\uC6A9\uC5B4 \uD480\uC774\uC5D0\uC11C \uBCF4\uAE30"} \u2192</a></div>`:"",k=j?i.slice(1):i;it=j?1:0,s.innerHTML=j+`<div class="hint">${j?"\uADF8 \uBC16\uC5D0 ":""}\uCC3E\uC740 \uACF3 ${l.length-(j?1:0)}\uAC1C${l.length>30?"(\uC704 30\uAC1C\uB9CC \uD45C\uC2DC)":""} \xB7 \uC704\uC544\uB798 \uD654\uC0B4\uD45C\uB85C \uACE0\uB974\uACE0 Enter</div>`+k.map((y,_)=>`<a href="#/${lt(y.x.route)}" class="${_===0?"on":""}"><small>${n(y.x.kind)}</small><b>${v(y.x.title)}</b><span>${v(y.x.text)}</span></a>`).join("")}var U=null;function Yt(t){let s=(I.terms||[]).find(d=>d.term===t.dataset.term);if(!s)return;yt(),U=document.createElement("div"),U.className="tip",U.innerHTML=`<b>${n(s.term)}</b>${n(s.def)}`,document.body.appendChild(U);let a=t.getBoundingClientRect(),e=U.offsetWidth,o=U.offsetHeight,l=Math.min(Math.max(8,a.left+a.width/2-e/2),innerWidth-e-8),i=a.top-o-10;i<70&&(i=a.bottom+10),U.style.left=l+"px",U.style.top=i+"px"}function yt(){U?.remove(),U=null}async function qs(t,s){let a=(I.docs||[]).find(o=>o.id===t);if(!a){q("\uC6D0\uBB38 \uD30C\uC77C\uC744 \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4");return}let e=window.open("","_blank");if(e)try{e.document.title="\uC6D0\uBB38 \uC5EC\uB294 \uC911\u2026",e.document.body.innerHTML='<p style="font:16px sans-serif;padding:24px">\uC6D0\uBB38\uC744 \uC5EC\uB294 \uC911\uC785\uB2C8\uB2E4\u2026</p>'}catch{}q(s?`\uC6D0\uBB38 ${s}\uCABD\uC744 \uC5EC\uB294 \uC911\uC785\uB2C8\uB2E4\u2026`:"\uC6D0\uBB38\uC744 \uC5EC\uB294 \uC911\uC785\uB2C8\uB2E4\u2026");try{let o=await D(a.path);if(window.__ASSET||(o=new URL(o,location.href).href),e&&!e.closed){e.location.replace(o+(s?`#page=${s}`:""));return}let l=document.createElement("a");l.href=o,l.download=`${a.title||"document"}.pdf`,document.body.appendChild(l),l.click(),l.remove(),q(s?`\uB0B4\uB824\uBC1B\uC558\uC2B5\uB2C8\uB2E4 \u2014 ${s}\uCABD\uC744 \uBCF4\uC138\uC694`:"\uB0B4\uB824\uBC1B\uC558\uC2B5\uB2C8\uB2E4")}catch{try{e?.close()}catch{}q("\uC6D0\uBB38\uC744 \uC5F4\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4")}}function ze(t,s){let a=u("#lb");a.querySelector("img").src=t,a.querySelector("img").alt=s||"",a.querySelector(".cap").textContent=s||"",a.classList.add("open"),Jt(a,a.querySelector("button"))}function qe(){let t=u("#lb");t.classList.contains("open")&&(t.classList.remove("open"),te())}function Rs(){window.addEventListener("hashchange",_t),window.addEventListener("beforeprint",()=>It()),window.addEventListener("scroll",()=>{u("#hd").classList.toggle("scrolled",scrollY>40),u("#totop")?.classList.toggle("show",scrollY>700)},{passive:!0}),u("#totop")?.addEventListener("click",()=>{window.scrollTo({top:0,behavior:document.documentElement.classList.contains("nomo")?"instant":"smooth"}),u("#main")?.focus({preventScroll:!0})}),u("#openMenu").addEventListener("click",Ms),u("#drawer").addEventListener("click",t=>{(t.target.closest("[data-close]")||t.target.closest("a,[data-tour]"))&&Ct()}),u("#openSearch").addEventListener("click",_e),u("#sch").addEventListener("click",t=>{t.target.id==="sch"&&Tt(),t.target.closest(".res a")&&Tt()}),u("#schIn").addEventListener("input",t=>Ae(t.target.value)),u("#schIn").addEventListener("keydown",t=>{let s=x("#schRes a");s.length&&((t.key==="ArrowDown"||t.key==="ArrowUp")&&(t.preventDefault(),it=(it+(t.key==="ArrowDown"?1:-1)+s.length)%s.length,s.forEach((a,e)=>a.classList.toggle("on",e===it)),s[it].scrollIntoView({block:"nearest"})),t.key==="Enter"&&(t.preventDefault(),s[it]?.click()))}),document.addEventListener("keydown",t=>{if(t.key==="Escape"&&(Tt(),Ct(),qe(),yt()),(t.key==="Enter"||t.key===" ")&&t.target.matches?.("img.zoomable")&&(t.preventDefault(),ze(t.target.dataset.full||t.target.currentSrc||t.target.src,t.target.alt)),t.key==="Tab"){let s=[u("#sch"),u("#drawer"),u("#lb")].find(a=>a.classList.contains("open"));if(s){let a=[...s.querySelectorAll("a[href],button,input")].filter(e=>e.offsetParent!==null);if(a.length){let e=a[0],o=a[a.length-1];t.shiftKey&&document.activeElement===e?(t.preventDefault(),o.focus()):!t.shiftKey&&document.activeElement===o&&(t.preventDefault(),e.focus())}}}(t.key==="/"||t.key==="k"&&(t.metaKey||t.ctrlKey))&&!/INPUT|TEXTAREA/.test(document.activeElement?.tagName)&&(t.preventDefault(),_e())}),u("#lb").addEventListener("click",qe),u("#skip").addEventListener("click",t=>{t.preventDefault(),u("#main").focus()}),document.addEventListener("click",t=>{let s=t.target.closest("[data-copy]");if(s){t.preventDefault(),t.stopPropagation(),xt(s.dataset.copy,s);return}let a=t.target.closest("[data-doc]");if(a){t.preventDefault(),t.stopPropagation(),qs(a.dataset.doc,a.dataset.page);return}let e=t.target.closest("img.zoomable");if(e){ze(e.dataset.full||e.currentSrc||e.src,e.alt);return}if(t.target.closest("[data-tour]")){t.preventDefault(),fe(I);return}t.target.closest("[data-close-sch]")&&Tt();let o=t.target.closest(".acc>button");if(o){let l=o.parentElement;l.classList.toggle("open"),o.setAttribute("aria-expanded",l.classList.contains("open"));return}}),document.addEventListener("click",t=>{if(t.defaultPrevented||t.button!==0||t.metaKey||t.ctrlKey||t.shiftKey||t.altKey)return;let s=t.target.closest('a[href^="#/"]');s&&s.getAttribute("href")===location.hash&&(t.preventDefault(),_t())}),document.addEventListener("mouseover",t=>{let s=t.target.closest(".term");s&&Yt(s)}),document.addEventListener("mouseout",t=>{t.target.closest(".term")&&yt()}),document.addEventListener("focusin",t=>{let s=t.target.closest(".term");s&&Yt(s)}),document.addEventListener("focusout",yt),document.addEventListener("touchstart",t=>{let s=t.target.closest(".term");s&&(Yt(s),setTimeout(yt,3500))},{passive:!0})}async function As(){let t=document.getElementById("site-data")?.textContent;js();try{t?I=JSON.parse(t):I=await(await fetch("data/site.json",{cache:"no-cache"})).json()}catch{u("#main").innerHTML='<div class="wrap" style="padding:80px 0;text-align:center">\uC790\uB8CC\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC0C8\uB85C\uACE0\uCE68\uD574 \uC8FC\uC138\uC694.</div>';return}u("#ftSlot").outerHTML=ke(I),le(I.imgmeta),Ts(),Rs(),await _t(),setTimeout(()=>be(I),600)}window.__GM={get data(){return I},route:_t};As();function Is(){let t=navigator.connection;if(!(t&&(t.saveData||/2g/.test(t.effectiveType||""))))for(let[s,a]of[["vendor/maplibre-gl-4.7.1/maplibre-gl.js","script"],["vendor/maplibre-gl-4.7.1/maplibre-gl.css","style"]]){let e=document.createElement("link");e.rel="prefetch",e.href=s,e.as=a,document.head.appendChild(e)}}(window.requestIdleCallback||(t=>setTimeout(t,3e3)))(()=>setTimeout(Is,2500),{timeout:8e3});if(document.querySelector('meta[name="gm-sw"]')&&"serviceWorker"in navigator){let t=()=>navigator.serviceWorker.register("sw.js").catch(()=>{});document.readyState==="complete"?setTimeout(t,1500):addEventListener("load",()=>setTimeout(t,1500))}})();
