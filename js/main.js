/* ==========================================================================
   Papeer — landing · vanilla JS
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------------- toast ---------------- */
  var toastEl = $('#toast');
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 1600);
  }

  /* ---------------- header on scroll ---------------- */
  var header = $('#header');
  function onScrollHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------------- mobile menu ---------------- */
  var burger = $('#burger');
  var nav = $('#nav');
  function closeNav(returnFocus) {
    if (!nav.classList.contains('is-open')) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    if (returnFocus) burger.focus();
  }
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('.nav__link')) closeNav(false);
  });
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('is-open') && !e.target.closest('.nav') && !e.target.closest('.burger')) {
      closeNav(false);
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) closeNav(true);
  });

  /* ---------------- animation throttling ---------------- */
  // Respect Save-Data: drop the decorative blur blobs entirely.
  var conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
  if (conn && conn.saveData) {
    document.documentElement.classList.add('save-data');
  }
  // Pause all CSS animations while the tab is backgrounded.
  document.addEventListener('visibilitychange', function () {
    document.documentElement.classList.toggle('anim-paused', document.hidden);
  });
  // Idle the hero blobs once the hero is scrolled out of view.
  var heroForIdle = document.querySelector('.hero');
  if (heroForIdle && 'IntersectionObserver' in window) {
    var heroIdleIO = new IntersectionObserver(function (entries) {
      document.documentElement.classList.toggle('blobs-idle', !entries[0].isIntersecting);
    }, { threshold: 0 });
    heroIdleIO.observe(heroForIdle);
  }

  /* ---------------- reveal on scroll ---------------- */
  $$('.reveal-group').forEach(function (group) {
    $$('.reveal-group > *', group.parentNode).length; // noop, keep structure clear
    Array.prototype.slice.call(group.children).forEach(function (child, i) {
      child.style.setProperty('--rd', (i * 0.09) + 's');
    });
  });

  var revealTargets = $$('.reveal, .reveal-group > *');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(function (el) { revealIO.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------- hero mouse glow ---------------- */
  var hero = $('.hero');
  var heroGlow = $('#heroGlow');
  if (hero && heroGlow && !reduceMotion) {
    heroGlow.style.opacity = '1';
    var glowX = -400, glowY = -400, glowTX = -400, glowTY = -400, glowRAF = null;
    function glowTick() {
      glowX += (glowTX - glowX) * 0.12;
      glowY += (glowTY - glowY) * 0.12;
      heroGlow.style.left = glowX + 'px';
      heroGlow.style.top = glowY + 'px';
      if (Math.abs(glowTX - glowX) > 0.5 || Math.abs(glowTY - glowY) > 0.5) {
        glowRAF = requestAnimationFrame(glowTick);
      } else { glowRAF = null; }
    }
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      glowTX = e.clientX - r.left;
      glowTY = e.clientY - r.top;
      if (!glowRAF) glowRAF = requestAnimationFrame(glowTick);
    });
  }

  /* ---------------- app window 3D tilt ---------------- */
  var appwin = $('#appwin');
  if (appwin && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    var tiltRAF = null;
    appwin.addEventListener('pointermove', function (e) {
      var r = appwin.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      if (tiltRAF) cancelAnimationFrame(tiltRAF);
      tiltRAF = requestAnimationFrame(function () {
        appwin.style.transform = 'rotateY(' + (px * 7).toFixed(2) + 'deg) rotateX(' + (-py * 7).toFixed(2) + 'deg)';
      });
    });
    appwin.addEventListener('pointerleave', function () {
      if (tiltRAF) cancelAnimationFrame(tiltRAF);
      appwin.style.transform = '';
    });
  }

  /* ---------------- magnetic buttons + ripple ---------------- */
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    $$('[data-magnetic]').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = 'translate(' + (dx * 0.18).toFixed(1) + 'px,' + (dy * 0.22).toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', function () {
        btn.style.transform = '';
      });
    });
  }
  $$('.btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (reduceMotion) return;
      var r = btn.getBoundingClientRect();
      var size = Math.max(r.width, r.height);
      var span = document.createElement('span');
      span.className = 'ripple';
      span.style.width = span.style.height = size + 'px';
      span.style.left = (e.clientX - r.left - size / 2) + 'px';
      span.style.top = (e.clientY - r.top - size / 2) + 'px';
      btn.appendChild(span);
      setTimeout(function () { span.remove(); }, 700);
    });
  });

  /* ---------------- animated counters ---------------- */
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    if (isNaN(target)) return;
    if (reduceMotion) { el.textContent = String(target); return; }
    var dur = 1400;
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var counters = $$('[data-counter]');
  if ('IntersectionObserver' in window) {
    var counterIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { counterIO.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------------- terminal typing loop ---------------- */
  var termBody = $('#termBody');
  var termFill = $('#termFill');
  var termRestart = $('#termRestart');

  var TERM_SCRIPT = [
    { t: '[нейросети в диагностике] запрос "neural networks diagnosis"', cls: 't-topic', p: 8 },
    { t: '  OpenAlex: 62 papers (840ms)', cls: 't-green', p: 20 },
    { t: '  Crossref: 31 papers (1210ms)', cls: 't-green', p: 32 },
    { t: '  Semantic Scholar: 47 papers (930ms)', cls: 't-green', p: 44 },
    { t: '  arXiv: 28 papers (1520ms)', cls: 't-green', p: 56 },
    { t: '  итого по запросу: 168 papers', cls: 't-dim', p: 64 },
    { t: '[AI]: сгенерирован запрос "deep learning radiology"', cls: 't-violet t-strong', p: 74 },
    { t: '  Semantic Scholar: ошибка timeout', cls: 't-red', p: 82 },
    { t: '[нейросети в диагностике] готово: 112 сохранено (168 → 112)', cls: 't-violet t-strong', p: 92 },
    { t: '  скоринг релевантности (0–10) · готово', cls: 't-green', p: 100 }
  ];

  var termToken = 0;
  function nowTime(offsetMs) {
    var d = new Date(Date.now() + offsetMs);
    function p2(n) { return (n < 10 ? '0' : '') + n; }
    return p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds());
  }
  function runTerminal() {
    if (!termBody) return;
    var myToken = ++termToken;
    termBody.innerHTML = '';
    if (termFill) termFill.style.width = '0%';

    if (reduceMotion) {
      TERM_SCRIPT.forEach(function (line) {
        var el = document.createElement('div');
        el.className = 'term__line';
        el.innerHTML = '<span class="term__time">' + nowTime(0) + '</span><span class="' + line.cls + '">' + line.t + '</span>';
        termBody.appendChild(el);
      });
      termBody.scrollTop = termBody.scrollHeight;
      if (termFill) termFill.style.width = '100%';
      return;
    }

    var idx = 0;
    function typeLine() {
      if (myToken !== termToken) return;
      // Pause the log while the tab is hidden — resume when it returns.
      if (document.hidden) { setTimeout(typeLine, 500); return; }
      if (idx >= TERM_SCRIPT.length) {
        // pause, then loop
        setTimeout(function () { if (myToken === termToken) runTerminal(); }, 5000);
        return;
      }
      var line = TERM_SCRIPT[idx];
      var el = document.createElement('div');
      el.className = 'term__line';
      var timeSpan = document.createElement('span');
      timeSpan.className = 'term__time';
      timeSpan.textContent = nowTime(0);
      var textSpan = document.createElement('span');
      textSpan.className = line.cls;
      el.appendChild(timeSpan);
      el.appendChild(textSpan);
      termBody.appendChild(el);

      var ch = 0, text = line.t;
      var stepMs = Math.max(9, Math.round(620 / text.length));
      function typeChar() {
        if (myToken !== termToken) return;
        ch += 2;
        textSpan.textContent = text.slice(0, ch);
        termBody.scrollTop = termBody.scrollHeight;
        if (ch < text.length) {
          setTimeout(typeChar, stepMs);
        } else {
          if (termFill) termFill.style.width = line.p + '%';
          idx++;
          setTimeout(typeLine, 260);
        }
      }
      typeChar();
    }
    typeLine();
  }
  if (termRestart) {
    termRestart.addEventListener('click', function () {
      runTerminal();
      toast('Журнал запущен заново');
    });
  }
  // start when hero terminal is visible (or immediately)
  if (termBody) {
    if ('IntersectionObserver' in window) {
      var termIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runTerminal();
            termIO.disconnect();
          }
        });
      }, { threshold: 0.3 });
      termIO.observe(termBody);
    } else {
      runTerminal();
    }
  }

  /* ---------------- OS detection ---------------- */
  function detectOS() {
    var ua = (navigator.userAgent || '').toLowerCase();
    var plat = (navigator.platform || '').toLowerCase();
    // Mobile/tablet: papeer is desktop-only, so highlight nothing.
    if (/android|iphone|ipad|ipod/.test(ua) ||
        (plat === 'macintel' && navigator.maxTouchPoints > 1)) {
      return null;
    }
    if (ua.indexOf('win') !== -1 || plat.indexOf('win') !== -1) return 'windows';
    if (ua.indexOf('mac') !== -1 || plat.indexOf('mac') !== -1) return 'macos';
    if (ua.indexOf('linux') !== -1 || plat.indexOf('linux') !== -1 || ua.indexOf('x11') !== -1) return 'linux';
    return null;
  }
  var os = detectOS();
  if (os) {
    var card = $('[data-os-card="' + os + '"]');
    if (card) card.classList.add('is-detected');
    var noteWraps = { macos: '[data-note="macos"]', linux: '[data-note="linux"]' };
    if (noteWraps[os]) {
      var note = $(noteWraps[os]);
      if (note) note.style.order = '-1';
    }
  }

  /* ---------------- install notes toggle ---------------- */
  var installToggle = $('#installToggle');
  var installBody = $('#installBody');
  if (installToggle && installBody) {
    installToggle.addEventListener('click', function () {
      var open = installToggle.getAttribute('aria-expanded') === 'true';
      installToggle.setAttribute('aria-expanded', String(!open));
      installBody.style.maxHeight = open ? '0px' : installBody.scrollHeight + 'px';
    });
  }

  /* ---------------- copy buttons ---------------- */
  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { legacyCopy(text, done); });
    } else {
      legacyCopy(text, done);
    }
  }
  function legacyCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* silent */ }
    ta.remove();
  }
  $$('.copybtn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy') || '';
      copyText(text, function () {
        var old = btn.textContent;
        btn.textContent = 'Скопировано!';
        btn.classList.add('is-copied');
        toast('Скопировано в буфер обмена');
        setTimeout(function () {
          btn.textContent = old;
          btn.classList.remove('is-copied');
        }, 1800);
      });
    });
  });

  /* ---------------- FAQ accordion ---------------- */
  $$('.acc').forEach(function (acc, i) {
    var head = $('.acc__head', acc);
    var body = $('.acc__body', acc);
    // a11y wiring: associate the toggle button with its region.
    var headId = 'acc-head-' + i;
    var bodyId = 'acc-body-' + i;
    head.id = headId;
    body.id = bodyId;
    head.setAttribute('aria-controls', bodyId);
    body.setAttribute('role', 'region');
    body.setAttribute('aria-labelledby', headId);
    head.addEventListener('click', function () {
      var isOpen = acc.classList.contains('is-open');
      // close others
      $$('.acc.is-open').forEach(function (other) {
        if (other !== acc) {
          other.classList.remove('is-open');
          $('.acc__head', other).setAttribute('aria-expanded', 'false');
          $('.acc__body', other).style.maxHeight = '0px';
        }
      });
      acc.classList.toggle('is-open', !isOpen);
      head.setAttribute('aria-expanded', String(!isOpen));
      body.style.maxHeight = isOpen ? '0px' : body.scrollHeight + 'px';
    });
  });

  /* ---------------- scoring widget ---------------- */
  var mustInput = $('#mustInput');
  var boostInput = $('#boostInput');
  var scoreFill = $('#scoreFill');
  var scoreValue = $('#scoreValue');
  var scoreVerdict = $('#scoreVerdict');

  // sample paper "haystack" contains these concept tokens
  var PAPER_TOKENS = [
    'нейросеть', 'нейронн', 'deep', 'learning', 'cnn',
    'диагност', 'медицин', 'клинич',
    'мрт', 'mri', 'снимк', 'магнитн', 'резонанс',
    'опухол', 'tumor', 'tumour', 'онколог',
    'сегментац', 'segmentation', 'изображен', 'биомед'
  ];

  function norm(s) { return (s || '').toLowerCase().replace(/ё/g, 'е').trim(); }

  function calcScore() {
    var musts = norm(mustInput.value).split(/[,;]+/).map(norm).filter(Boolean);
    var boosts = norm(boostInput.value).split(/[,;]+/).map(norm).filter(Boolean);
    var tokens = PAPER_TOKENS.join(' ');

    function hit(word) {
      if (!word) return false;
      // substring match both ways handles simple morphology (e.g. "мрт", "нейро")
      return tokens.indexOf(word) !== -1 ||
             PAPER_TOKENS.some(function (tk) { return word.length >= 3 && tk.indexOf(word) !== -1; });
    }

    var score;
    var mustHits = musts.filter(hit).length;
    var boostHits = boosts.filter(hit).length;

    if (musts.length === 0) {
      score = 5 + Math.min(boostHits, 5) * 0.9; // no constraints → mediocre, boost nudges
    } else if (mustHits === 0) {
      score = 1.2 + Math.min(boostHits, 3) * 0.5; // must missing → declared irrelevant
    } else {
      score = 5.2 + (mustHits / musts.length) * 2.6 + Math.min(boostHits, 4) * 0.55;
    }
    score = Math.max(0, Math.min(10, score));
    return { score: score, mustHits: mustHits, mustTotal: musts.length, boostHits: boostHits };
  }

  function renderScore(animate) {
    var r = calcScore();
    var v = Math.round(r.score * 10) / 10;
    scoreFill.style.width = (v * 10) + '%';
    scoreValue.textContent = v.toFixed(1);
    if (animate && !reduceMotion) {
      scoreValue.classList.remove('bump');
      void scoreValue.offsetWidth; // restart animation
      scoreValue.classList.add('bump');
    }
    var color, verdict;
    if (v < 3) { color = '#ff8a8a'; verdict = 'в отвал ✕'; }
    else if (v < 6.5) { color = '#ffc766'; verdict = 'сомнительно ~'; }
    else { color = '#4fe3a4'; verdict = 'берём ✓'; }
    scoreValue.style.color = color;
    scoreVerdict.style.color = color;
    scoreVerdict.textContent = verdict;
  }

  if (mustInput && boostInput) {
    var debounce = null;
    function onKwInput() {
      clearTimeout(debounce);
      debounce = setTimeout(function () { renderScore(true); }, 140);
    }
    mustInput.addEventListener('input', onKwInput);
    boostInput.addEventListener('input', onKwInput);
    renderScore(false);
    // animate once visible
    if ('IntersectionObserver' in window) {
      var scorer = $('#scorer');
      var scoreIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            renderScore(true);
            scoreIO.disconnect();
          }
        });
      }, { threshold: 0.5 });
      if (scorer) scoreIO.observe(scorer);
    }
  }

  /* ---------------- keyboard demo ---------------- */
  var kbdDemo = $('#kbdDemo');
  var kbdList = $('#kbdList');
  var kbdStatus = $('#kbdStatus');
  var kbdReset = $('#kbdReset');

  var KBD_PAPERS = [
    { title: 'Attention-based U-Net for brain tumor segmentation', meta: '2023 · цит. 214', score: '9.1', cls: 'score--hi' },
    { title: 'Self-supervised pretraining for chest X-ray', meta: '2024 · цит. 87', score: '8.4', cls: 'score--hi' },
    { title: 'Graph neural networks for drug repurposing', meta: '2022 · цит. 150', score: '6.2', cls: 'score--mid' },
    { title: 'Hospital queue optimization with RL', meta: '2021 · цит. 41', score: '4.8', cls: 'score--mid' },
    { title: 'Sentiment analysis of hotel reviews', meta: '2020 · цит. 23', score: '1.9', cls: 'score--low' }
  ];

  var kbdSel = 0;
  var kbdStates = []; // '' | 'acc' | 'rej'

  function kbdRender() {
    kbdList.innerHTML = '';
    KBD_PAPERS.forEach(function (p, i) {
      var li = document.createElement('li');
      li.className = 'kbd-demo__row' + (i === kbdSel ? ' is-sel' : '') +
                     (kbdStates[i] === 'acc' ? ' is-acc' : '') +
                     (kbdStates[i] === 'rej' ? ' is-rej' : '');
      li.innerHTML =
        '<span class="score ' + p.cls + '">' + p.score + '</span>' +
        '<span class="kbd-demo__title">' + p.title + ' <span class="appwin__row-meta">· ' + p.meta + '</span></span>' +
        (kbdStates[i] ? '<span class="st ' + (kbdStates[i] === 'acc' ? 'st--acc' : 'st--rej') + '">' +
          (kbdStates[i] === 'acc' ? 'принято' : 'отклонено') + '</span>' : '');
      kbdList.appendChild(li);
    });
    var acc = kbdStates.filter(function (s) { return s === 'acc'; }).length;
    var rej = kbdStates.filter(function (s) { return s === 'rej'; }).length;
    kbdStatus.textContent = 'готово · ' + acc + ' принято · ' + rej + ' отклонено · позиция ' + (kbdSel + 1) + '/' + KBD_PAPERS.length;
  }

  function kbdInit() {
    kbdSel = 0;
    kbdStates = KBD_PAPERS.map(function () { return ''; });
    kbdRender();
  }

  function kbdFlash(cls) {
    var row = kbdList.children[kbdSel];
    if (!row) return;
    row.classList.remove('flash-acc', 'flash-rej');
    void row.offsetWidth;
    row.classList.add(cls);
  }

  var kbdKeys = { j: 1, k: 1, a: 1, r: 1, 'о': 1, 'л': 1, 'ф': 1, 'к': 1 }; // + ru layout
  function kbdHandle(key) {
    var k = key.toLowerCase();
    var mapped = { 'о': 'j', 'л': 'k', 'ф': 'a', 'к': 'r' };
    if (mapped[k]) k = mapped[k];
    if (k === 'j') {
      if (kbdSel < KBD_PAPERS.length - 1) { kbdSel++; kbdRender(); toast('j — вниз'); }
    } else if (k === 'k') {
      if (kbdSel > 0) { kbdSel--; kbdRender(); toast('k — вверх'); }
    } else if (k === 'a') {
      kbdStates[kbdSel] = 'acc';
      kbdRender();
      kbdFlash('flash-acc');
      toast('a — принято ✓');
    } else if (k === 'r') {
      kbdStates[kbdSel] = 'rej';
      kbdRender();
      kbdFlash('flash-rej');
      toast('r — отклонено ✕');
    } else {
      return false;
    }
    return true;
  }

  if (kbdDemo && kbdList) {
    kbdInit();

    // Touch/click alternative to hotkeys: tapping a row cycles its status.
    kbdList.addEventListener('click', function (e) {
      var li = e.target.closest('.kbd-demo__row');
      if (!li) return;
      var i = Array.prototype.indexOf.call(kbdList.children, li);
      if (i < 0) return;
      kbdSel = i;
      kbdStates[i] = kbdStates[i] === '' ? 'acc' : kbdStates[i] === 'acc' ? 'rej' : '';
      kbdRender();
      kbdFlash(kbdStates[i] === 'acc' ? 'flash-acc' : kbdStates[i] === 'rej' ? 'flash-rej' : 'flash-acc');
      kbdDemo.classList.add('is-active');
    });

    kbdReset.addEventListener('click', function () {
      kbdInit();
      toast('Демо сброшено');
      kbdDemo.classList.add('is-active');
    });

    // activation model: keys work when hovered, focused, or explicitly clicked into
    var kbdActive = false;
    kbdDemo.addEventListener('pointerenter', function () {
      kbdActive = true;
      kbdDemo.classList.add('is-active');
    });
    kbdDemo.addEventListener('pointerleave', function () {
      kbdActive = false;
      if (document.activeElement !== kbdDemo) kbdDemo.classList.remove('is-active');
    });
    kbdDemo.addEventListener('focus', function () {
      kbdActive = true;
      kbdDemo.classList.add('is-active');
    });
    kbdDemo.addEventListener('blur', function () {
      kbdActive = false;
      kbdDemo.classList.remove('is-active');
    });
    // local handler when demo itself is focused
    kbdDemo.addEventListener('keydown', function (e) {
      if (kbdHandle(e.key)) e.preventDefault();
    });
    // global handler only when hovered (so page scroll stays intact)
    document.addEventListener('keydown', function (e) {
      if (!kbdActive) return;
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (kbdHandle(e.key)) e.preventDefault();
    });
  }

})();
