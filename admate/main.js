// AD Mate 홈페이지 샘플 — 화면 동작
(function () {
  var root = document.documentElement;
  var isStatic = /[?&]static\b/.test(location.search);
  if (isStatic) root.classList.add('static');
  else root.classList.add('js');

  // 머리글: 스크롤하면 흰 바탕
  var header = document.querySelector('.site-header');
  var floatCta = document.querySelector('.float-cta');
  var contact = document.getElementById('contact');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);
    if (floatCta && contact) {
      var r = contact.getBoundingClientRect();
      floatCta.classList.toggle('is-hidden', y < 400 || r.top < window.innerHeight * 0.8);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 모바일 메뉴
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('mobile-menu');
  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '메뉴 열기');
    menu.hidden = true;
    header.classList.remove('menu-open');
  }
  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') !== 'true';
    if (!open) { closeMenu(); toggle.focus(); return; }
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', '메뉴 닫기');
    menu.hidden = false;
    header.classList.add('menu-open');
    var first = menu.querySelector('a'); if (first) first.focus();
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) { closeMenu(); toggle.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (!menu.hidden && !header.contains(e.target)) closeMenu();
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 1024) closeMenu(); });

  // 현재 구역 메뉴 표시
  var links = Array.prototype.slice.call(document.querySelectorAll('.gnb a'));
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + en.target.id;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) spy.observe(s); });
  }

  // 숫자 올라가기
  function countUp(el) {
    var to = parseFloat(el.getAttribute('data-to'));
    var comma = el.getAttribute('data-format') === 'comma';
    var fmt = function (v) { v = Math.round(v); return comma ? v.toLocaleString('ko-KR') : String(v); };
    if (isStatic || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = fmt(to); return; }
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = fmt(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  }

  // 등장 효과
  var reveals = document.querySelectorAll('.reveal');
  // 같은 줄에 놓인 카드는 조금씩 늦게
  ['.pillars', '.media-grid', '.cases', '.sol-cards'].forEach(function (sel) {
    var g = document.querySelector(sel);
    if (!g) return;
    Array.prototype.forEach.call(g.querySelectorAll('.reveal'), function (el, i) { el.style.setProperty('--d', (i % 3) * 0.08 + 's'); });
  });
  if (isStatic || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('in'); });
    Array.prototype.forEach.call(document.querySelectorAll('.count'), countUp);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        Array.prototype.forEach.call(en.target.querySelectorAll('.count'), countUp);
        io.unobserve(en.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
  }

  // 매체 분류
  var chips = document.querySelectorAll('.chip');
  var cards = document.querySelectorAll('.media-card');
  Array.prototype.forEach.call(chips, function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      Array.prototype.forEach.call(chips, function (c) { c.classList.toggle('is-on', c === chip); c.setAttribute('aria-pressed', String(c === chip)); });
      Array.prototype.forEach.call(cards, function (card) {
        var show = f === 'all' || card.getAttribute('data-cat').split(' ').indexOf(f) > -1;
        card.classList.toggle('is-hidden', !show);
        if (show) card.classList.add('in');
      });
    });
  });

  // 문의 양식 (샘플: 실제 전송 없음)
  var form = document.getElementById('contact-form');
  var msg = form.querySelector('.form-msg');
  var ERR = { company: '회사·브랜드명을 입력해 주세요.', name: '담당자명을 입력해 주세요.', phone: '연락처를 숫자로 입력해 주세요. (예: 010-1234-5678)', email: '이메일 형식을 확인해 주세요.', agree: '개인정보 수집·이용에 동의해 주세요.' };
  function setError(el, text) {
    var box = el.type === 'checkbox' ? el.closest('.f-agree') : el;
    var id = 'err-' + el.name;
    var old = document.getElementById(id);
    if (old) old.remove();
    box.classList.toggle('invalid', !!text);
    if (text) {
      var s = document.createElement('span'); s.className = 'f-err'; s.id = id; s.textContent = text;
      box.insertAdjacentElement('afterend', s);
      el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', id);
    } else { el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); }
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = [];
    Array.prototype.forEach.call(form.querySelectorAll('input[name=company],input[name=name],input[name=phone],input[name=email],input[name=agree]'), function (el) {
      if (el.type !== 'checkbox') el.value = el.value.trim();
      var ok = el.checkValidity();
      setError(el, ok ? '' : ERR[el.name]);
      if (!ok) bad.push(el);
    });
    if (bad.length) { msg.textContent = '표시된 항목을 확인해 주세요.'; bad[0].focus(); return; }
    msg.textContent = '샘플 화면입니다. 실제 접수는 연결 후 동작합니다.';
  });
  form.addEventListener('input', function (e) { if (e.target.name && ERR[e.target.name] && e.target.checkValidity()) setError(e.target, ''); });
  form.addEventListener('change', function (e) { if (e.target.name === 'agree' && e.target.checked) setError(e.target, ''); });
})();
