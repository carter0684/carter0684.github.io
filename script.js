// Language toggle, typing effect, neural-network background, scroll effects.
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- language ---------- */
  var saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  var lang = saved || ((navigator.language || '').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en');

  function setGlitchText() {
    var h = document.querySelector('h1.glitch');
    if (!h) return;
    var visible = h.querySelector(lang === 'zh' ? '.zh' : '.en');
    h.setAttribute('data-text', visible ? visible.textContent : h.textContent);
    if (!reduce) { h.classList.remove('go'); void h.offsetWidth; h.classList.add('go'); }
  }

  function apply(next) {
    lang = next;
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang === 'zh' ? 'zh-Hant-HK' : 'en');
    var btn = document.getElementById('lang-btn');
    if (btn) btn.textContent = lang === 'zh' ? 'EN' : '中文';
    try { localStorage.setItem('lang', lang); } catch (e) {}
    setGlitchText();
    startTyping();
  }

  /* ---------- typing effect ---------- */
  var typeTimer = null;
  function startTyping() {
    var el = document.getElementById('typed');
    if (!el) return;
    clearTimeout(typeTimer);
    var phrases = (el.getAttribute(lang === 'zh' ? 'data-zh' : 'data-en') || '').split('|');
    if (reduce || !phrases[0]) { el.textContent = phrases[0] || ''; return; }
    var i = 0, j = 0, del = false;
    (function tick() {
      var full = phrases[i];
      el.textContent = full.slice(0, j);
      var wait = del ? 28 : 65;
      if (!del && j === full.length) { del = true; wait = 1600; }
      else if (del && j === 0) { del = false; i = (i + 1) % phrases.length; wait = 350; }
      else { j += del ? -1 : 1; }
      typeTimer = setTimeout(tick, wait);
    })();
  }

  apply(lang);
  var btn = document.getElementById('lang-btn');
  if (btn) btn.addEventListener('click', function () { apply(lang === 'zh' ? 'en' : 'zh'); });

  /* ---------- reveal on scroll + counters ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce || isNaN(target)) { el.textContent = (isNaN(target) ? '' : target.toLocaleString()) + suffix; return; }
    var start = null;
    (function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / 1200, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        en.target.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(en.target);
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); el.querySelectorAll('[data-count]').forEach(countUp); });
  }

  /* ---------- card glow follows cursor ---------- */
  document.addEventListener('pointermove', function (e) {
    var card = e.target.closest ? e.target.closest('.card') : null;
    if (!card) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });

  /* ---------- scroll progress ---------- */
  var bar = document.getElementById('progress');
  function onScroll() {
    if (!bar) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- copy button for terminal blocks ---------- */
  document.querySelectorAll('.term .copy').forEach(function (b) {
    b.addEventListener('click', function () {
      var pre = b.closest('.term').querySelector('pre');
      var text = pre.innerText.replace(/\u00a0/g, ' ');
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () {
        var old = b.textContent; b.textContent = 'copied'; setTimeout(function () { b.textContent = old; }, 1500);
      });
    });
  });

  /* ---------- neural-network canvas ---------- */
  var canvas = document.getElementById('bg');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
  var nodes = [], mouse = { x: -9999, y: -9999 };
  var colors = ['34,211,238', '167,139,250', '244,114,182'];

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var count = Math.max(24, Math.min(90, Math.floor((W * H) / 20000)));
    nodes = [];
    for (var n = 0; n < count; n++) {
      nodes.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.8, c: colors[n % 3]
      });
    }
  }

  var running = false;
  function start() { if (!running && !reduce) { running = true; requestAnimationFrame(frame); } }

  function frame() {
    if (document.hidden) { running = false; return; }
    ctx.clearRect(0, 0, W, H);
    var LINK = 140;
    for (var a = 0; a < nodes.length; a++) {
      var p = nodes[a];
      if (!reduce) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
      for (var b = a + 1; b < nodes.length; b++) {
        var q = nodes[b], dx = p.x - q.x, dy = p.y - q.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK) {
          ctx.strokeStyle = 'rgba(' + p.c + ',' + (0.22 * (1 - d / LINK)).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      var mx = p.x - mouse.x, my = p.y - mouse.y, md = Math.sqrt(mx * mx + my * my);
      if (md < 170) {
        ctx.strokeStyle = 'rgba(34,211,238,' + (0.5 * (1 - md / 170)).toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(' + p.c + ',0.9)';
      ctx.shadowColor = 'rgba(' + p.c + ',0.9)'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }
    if (reduce) { running = false; return; }
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });
  document.addEventListener('visibilitychange', start);
  resize();
  if (reduce) { running = true; frame(); } else { start(); }
})();
