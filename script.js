// Language toggle (English / 繁體中文). The choice is remembered in localStorage.
(function () {
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  var initial = saved || ((navigator.language || '').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en');

  function apply(lang) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang === 'zh' ? 'zh-Hant-HK' : 'en');
    var btn = document.getElementById('lang-btn');
    if (btn) btn.textContent = lang === 'zh' ? 'EN' : '中文';
    try { localStorage.setItem('lang', lang); } catch (e) {}
  }

  apply(initial);
  var btn = document.getElementById('lang-btn');
  if (btn) {
    btn.addEventListener('click', function () {
      apply(root.getAttribute('data-lang') === 'zh' ? 'en' : 'zh');
    });
  }
})();
