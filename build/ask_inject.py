#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""현장 질문 답변 UI를 지역 페이지에 주입한다.

목적 — 담당 공무원 앞에서 질문받았을 때 탭을 뒤지지 않고 즉답한다.
원칙 — 생성하지 않는다. 카드에 있는 것만 답하고 없으면 "없다"고 말한다.
       현장에서 틀린 숫자를 말하는 것이 못 찾는 것보다 나쁘다.

사용:
  python3 build/ask_inject.py <region>          # 주입
  python3 build/ask_inject.py <region> --check  # 이미 있는지만 확인

카드는 build/ask_cards/<region>.json 에 둔다. 필드:
  k  검색 키워드(공백 구분)   q 질문 제목      a 답
  s  출처                     d 기준일         u 공간단위
  l  한계(없으면 "")          p 이동 대상(pane id 또는 CSS 선택자)
"""
import io, json, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(ROOT, os.pardir))
MARK = '<!--ASKUI-->'          # 중복 주입 방지 표식

# 페이지 세대마다 좌측 패널 컨테이너가 다르다. 앞에서부터 먼저 맞는 것을 쓴다.
CONTAINERS = [
    ('<div id="detail">\n  <div id="tabs">', '<div id="detail">\n  '),   # 김해·사하·포항
    ('<div id="panel">', '<div id="panel">'),                             # 서구·기장
    ('<div id="detail">\n    <div id="vhead">', '<div id="detail">\n    '),  # 사하
]

CSS = """
/* 현장 질문 답변 */
#ask{background:#0e131b;border:1px solid #232c39;border-radius:10px;padding:9px 10px 8px;margin:0 0 8px}
#ask .ah{font-size:11px;color:#8b949e;margin-bottom:5px;display:flex;align-items:center;gap:6px}
#ask .ah b{color:#ffb84d;font-size:11.5px}
#askq{width:100%;box-sizing:border-box;background:#070a0e;border:1px solid #2c3644;border-radius:7px;
  color:#e6edf3;font-size:13.5px;padding:8px 10px;outline:none;font-family:inherit}
#askq:focus{border-color:#ff7a5c}
#askc{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}
#askc button{background:#151c26;border:1px solid #2c3644;color:#a9b4c0;font-size:10.5px;
  padding:3px 8px;border-radius:12px;cursor:pointer;font-family:inherit}
#askc button:hover{background:#ff7a5c;color:#1a0f0a;border-color:#ff7a5c}
#askr{margin-top:7px}
.acard{background:#121a24;border-left:3px solid #ff7a5c;border-radius:0 8px 8px 0;padding:8px 10px;margin-bottom:6px}
.acard .q{font-size:11px;color:#8b949e;margin-bottom:2px}
.acard .a{font-size:18px;font-weight:800;color:#ffd8cf;line-height:1.25;word-break:keep-all}
.acard .m{font-size:10.5px;color:#a9b4c0;line-height:1.55;margin-top:5px}
.acard .m b{color:#cfd8e3}
.acard .l{font-size:10.5px;color:#ffb84d;line-height:1.5;margin-top:4px}
.acard .go{display:inline-block;margin-top:6px;font-size:10.5px;color:#7cc4ff;cursor:pointer;text-decoration:underline}
.anone{font-size:11.5px;color:#ffb84d;line-height:1.6;padding:7px 2px}
#askai{margin-top:6px;display:flex;gap:6px;align-items:center;flex-wrap:wrap}
#askai button{background:#1b2a3a;border:1px solid #2f4a63;color:#7cc4ff;font-size:11px;
  padding:5px 10px;border-radius:7px;cursor:pointer;font-family:inherit}
#askai button:hover{background:#7cc4ff;color:#08131c;border-color:#7cc4ff}
#askai button:disabled{opacity:.5;cursor:default}
#askai .cfg{font-size:10px;color:#8b949e;cursor:pointer;text-decoration:underline}
.aiout{background:#101a26;border-left:3px solid #7cc4ff;border-radius:0 8px 8px 0;
  padding:9px 11px;margin-top:6px;font-size:12.5px;color:#dbe7f3;line-height:1.65;word-break:keep-all;white-space:pre-wrap}
.aiout .h{font-size:10px;color:#7cc4ff;margin-bottom:4px;letter-spacing:.03em}
"""

HTML = """<div id="ask">
    <div class="ah"><b>질문하면 바로 답합니다</b><span>현장에서 물어보는 것 위주</span></div>
    <input id="askq" type="text" autocomplete="off" placeholder="%s">
    <div id="askc"></div>
    <div id="askai"></div>
    <div id="askr"></div>
  </div>
  """

JS_TMPL = """
<script>
/* 현장 질문 답변 — build/ask_inject.py 로 주입. 손으로 고치지 말고 카드 JSON 을 고친 뒤 다시 주입한다. */
const FACTS=%(cards)s;
const ASKCHIPS=%(chips)s;
(function(){
  var q=document.getElementById('askq'), r=document.getElementById('askr'), c=document.getElementById('askc');
  if(!q) return;
  function norm(t){return (t||'').toLowerCase().replace(/[\\s,\\u00b7.()%%]/g,'');}
  function score(f,nq){
    var sc=0, ks=f.k.split(' ');
    for(var i=0;i<ks.length;i++){ var k=norm(ks[i]); if(k && nq.indexOf(k)>=0) sc+=k.length>=3?3:2; }
    if(nq.indexOf(norm(f.q))>=0) sc+=6;
    var a=norm(f.a); if(a.length>2 && nq.indexOf(a)>=0) sc+=2;
    return sc;
  }
  function go(p){
    if(!p) return;
    var b=document.querySelector('button[data-p='+p+']');
    if(b){ b.click(); b.scrollIntoView({block:'nearest'}); return; }
    var el=null; try{ el=document.querySelector(p); }catch(e){}
    if(!el) return;
    /* 서구·기장 세대는 탭이 button 이 아니라 div 다. 눌러야 화면이 바뀐다 */
    try{ el.click(); }catch(e){}
    el.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function card(f){
    var d=document.createElement('div'); d.className='acard';
    d.innerHTML='<div class="q">'+f.q+'</div><div class="a">'+f.a+'</div>'+
      '<div class="m"><b>출처</b> '+f.s+' &nbsp;\\u00b7&nbsp; <b>기준</b> '+f.d+' &nbsp;\\u00b7&nbsp; <b>공간단위</b> '+f.u+'</div>'+
      (f.l?'<div class="l">\\u26a0 '+f.l+'</div>':'')+
      (f.p?'<span class="go">근거 화면으로 이동 \\u2192</span>':'');
    var g=d.querySelector('.go'); if(g) g.onclick=function(){go(f.p);};
    return d;
  }
  function run(t){
    r.innerHTML=''; var nq=norm(t); if(nq.length<2) return;
    var hit=FACTS.map(function(f){return {f:f,s:score(f,nq)};})
                 .filter(function(x){return x.s>0;})
                 .sort(function(a,b){return b.s-a.s;}).slice(0,3);
    if(!hit.length){
      r.innerHTML='<div class="anone">그 자료는 이 지도에 없습니다. 아래 칩의 항목이거나, 왼쪽에서 직접 찾아야 합니다.<br>'+
        '<span style="color:#8b949e">없는 것을 지어내지 않습니다 \\u2014 현장에서 틀린 숫자를 말하는 것보다 낫습니다.</span></div>';
      return;
    }
    hit.forEach(function(x){ r.appendChild(card(x.f)); });
  }
  ASKCHIPS.forEach(function(t){
    var b=document.createElement('button'); b.textContent=t;
    b.onclick=function(){ q.value=t; run(t); q.focus(); };
    c.appendChild(b);
  });
  /* ── AI 답변 (선택) ─────────────────────────────────────────
     카드 검색은 AI 없이도 항상 된다. AI 는 그 위에 얹는 보조다.
     엔드포인트·암호는 이 브라우저에만 저장하고 페이지에는 넣지 않는다. */
  var ai=document.getElementById('askai'), REGION=%(region)s;
  function cfg(k){ try{ return localStorage.getItem('askcfg_'+k)||''; }catch(e){ return ''; } }
  function setCfg(k,v){ try{ localStorage.setItem('askcfg_'+k,v); }catch(e){} }
  function pickCards(t){
    var nq=norm(t);
    return FACTS.map(function(f){return {f:f,s:score(f,nq)};})
                .filter(function(x){return x.s>0;})
                .sort(function(a,b){return b.s-a.s;}).slice(0,8).map(function(x){return x.f;});
  }
  function drawAI(){
    ai.innerHTML='';
    var ep=cfg('ep');
    var b=document.createElement('button');
    b.textContent = ep ? 'AI 답변 만들기' : 'AI 연결하기';
    b.onclick=function(){ ep ? callAI() : setup(); };
    ai.appendChild(b);
    if(ep){
      var c=document.createElement('span'); c.className='cfg'; c.textContent='연결 설정';
      c.onclick=setup; ai.appendChild(c);
    }
  }
  function setup(){
    var ep=prompt('AI 서버 주소 (클라우드타입 프록시)\\n예) https://port-0-envmap-ask-xxxx.sel3.cloudtype.app', cfg('ep'));
    if(ep===null) return;
    var pw=prompt('접속 암호 (ASK_PASS)', cfg('pw'));
    if(pw===null) return;
    setCfg('ep',ep.trim().replace(/\/$/,'')); setCfg('pw',pw.trim());
    drawAI();
  }
  function callAI(){
    var t=q.value.trim(); if(t.length<2) return;
    var b=ai.querySelector('button'); b.disabled=true; b.textContent='물어보는 중…';
    var box=document.createElement('div'); box.className='aiout';
    box.innerHTML='<div class="h">AI 답변</div>…';
    r.insertBefore(box,r.firstChild);
    fetch(cfg('ep')+'/ask',{method:'POST',
      headers:{'Content-Type':'application/json','x-ask-pass':cfg('pw')},
      body:JSON.stringify({q:t,region:REGION,cards:pickCards(t)})})
      .then(function(x){return x.json().then(function(j){return {ok:x.ok,j:j};});})
      .then(function(o){
        box.innerHTML='<div class="h">AI 답변'+(o.j.used?' \u00b7 이번 달 '+o.j.used+'/'+o.j.cap+'회':'')+'</div>'+
          (o.ok ? (o.j.answer||'(빈 응답)') : ('오류 \u2014 '+(o.j.error||'알 수 없음')));
      })
      .catch(function(e){ box.innerHTML='<div class="h">AI 답변</div>연결 실패 \u2014 '+e.message; })
      .finally(function(){ b.disabled=false; b.textContent='AI 답변 만들기'; });
  }
  drawAI();

  var tmr=null;
  q.addEventListener('input',function(){ clearTimeout(tmr); tmr=setTimeout(function(){run(q.value);},120); });
  q.addEventListener('keydown',function(e){
    if(e.key==='Escape'){q.value='';r.innerHTML='';}
    if(e.key==='Enter'&&cfg('ep')) callAI();
  });
})();
</script>
"""


def load(region):
    p = os.path.join(ROOT, 'ask_cards', region + '.json')
    d = json.load(io.open(p, encoding='utf-8'))
    cards, chips = d['cards'], d.get('chips', [])
    need = ('k', 'q', 'a', 's', 'd', 'u')
    for i, c in enumerate(cards):
        miss = [f for f in need if not c.get(f)]
        if miss:
            raise SystemExit('카드 %d(%s) 필수 항목 누락: %s' % (i, c.get('q', '?'), miss))
        c.setdefault('l', ''); c.setdefault('p', '')
    return cards, chips, d.get('placeholder', '예) 공실률이 얼마인가'), d.get('region', region)



def remove(s):
    """이전에 주입한 CSS·HTML·JS 를 걷어낸다. --force 재주입에 쓴다."""
    n = 0
    # CSS — 시작 주석부터 마지막 규칙까지 (v1 은 .anone, v2 는 .aiout .h 로 끝난다)
    i = s.find('\n/* 현장 질문 답변 */')
    if i >= 0:
        for tail in ('.aiout .h{', '.anone{'):
            j = s.find(tail, i)
            if j >= 0:
                k = s.find('}\n', j)
                if k >= 0:
                    s = s[:i] + s[k + 2:]; n += 1; break
    # HTML — 표식부터 #ask 블록 끝까지
    i = s.find(MARK)
    if i >= 0:
        j = s.find('<div id="askr"></div>\n  </div>\n  ', i)
        if j >= 0:
            s = s[:i] + s[j + len('<div id="askr"></div>\n  </div>\n  '):]; n += 1
    # JS — 주입 스크립트 전체
    i = s.find('\n<script>\n/* 현장 질문 답변 \u2014 build/ask_inject.py')
    if i >= 0:
        j = s.find('</script>\n', i)
        if j >= 0:
            s = s[:i] + s[j + len('</script>\n'):]; n += 1
    if n != 3:
        raise SystemExit('제거 실패 — %d/3 조각만 찾았다. 손으로 확인하라' % n)
    return s


def inject(region, check=False, force=False):
    html = os.path.join(REPO, region + '.html')
    s = io.open(html, encoding='utf-8').read()
    if MARK in s:
        if check:
            print('%s: 주입됨' % region); return 0
        if not force:
            print('%s: 이미 주입돼 있다. 갱신하려면 --force' % region); return 0
        s = remove(s)
        print('%s: 기존 주입분 제거' % region)
    elif check:
        print('%s: 미주입' % region); return 1

    cards, chips, ph, region_name = load(region)

    anchor = None
    for a, rep in CONTAINERS:
        if s.count(a) == 1:
            anchor, replace_with = a, rep; break
    if not anchor:
        raise SystemExit('%s: 좌측 패널 컨테이너를 못 찾았다. CONTAINERS 에 추가하라' % region)

    i = s.rfind('</style>')
    if i < 0: raise SystemExit('%s: </style> 없음' % region)
    s = s[:i] + CSS + s[i:]

    body = MARK + '\n  ' + (HTML % ph)
    s = s.replace(anchor, replace_with + body + anchor[len(replace_with):], 1)

    js = JS_TMPL % {'cards': json.dumps(cards, ensure_ascii=False, separators=(',', ':')),
                    'chips': json.dumps(chips, ensure_ascii=False),
                    'region': json.dumps(region_name, ensure_ascii=False)}
    if s.count('</body>') != 1: raise SystemExit('%s: </body> 개수 이상' % region)
    s = s.replace('</body>', js + '</body>', 1)

    io.open(html, 'w', encoding='utf-8').write(s)
    print('%s: 카드 %d장 주입 (칩 %d개)' % (region, len(cards), len(chips)))
    return 0


if __name__ == '__main__':
    if len(sys.argv) < 2: raise SystemExit(__doc__)
    sys.exit(inject(sys.argv[1], '--check' in sys.argv, '--force' in sys.argv))
