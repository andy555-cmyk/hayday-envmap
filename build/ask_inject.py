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
"""

HTML = """<div id="ask">
    <div class="ah"><b>질문하면 바로 답합니다</b><span>현장에서 물어보는 것 위주</span></div>
    <input id="askq" type="text" autocomplete="off" placeholder="%s">
    <div id="askc"></div>
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
  var tmr=null;
  q.addEventListener('input',function(){ clearTimeout(tmr); tmr=setTimeout(function(){run(q.value);},120); });
  q.addEventListener('keydown',function(e){ if(e.key==='Escape'){q.value='';r.innerHTML='';} });
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
    return cards, chips, d.get('placeholder', '예) 공실률이 얼마인가')


def inject(region, check=False):
    html = os.path.join(REPO, region + '.html')
    s = io.open(html, encoding='utf-8').read()
    if MARK in s:
        print('%s: 이미 주입돼 있다. 갱신하려면 먼저 제거해야 한다' % region)
        return 1 if check else 0
    if check:
        print('%s: 미주입' % region); return 1

    cards, chips, ph = load(region)

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
                    'chips': json.dumps(chips, ensure_ascii=False)}
    if s.count('</body>') != 1: raise SystemExit('%s: </body> 개수 이상' % region)
    s = s.replace('</body>', js + '</body>', 1)

    io.open(html, 'w', encoding='utf-8').write(s)
    print('%s: 카드 %d장 주입 (칩 %d개)' % (region, len(cards), len(chips)))
    return 0


if __name__ == '__main__':
    if len(sys.argv) < 2: raise SystemExit(__doc__)
    sys.exit(inject(sys.argv[1], '--check' in sys.argv))
