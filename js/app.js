/* Racing Hub — общая логика: тема, каталог серий, анимации. */
(function () {
  'use strict';

  var data = window.RACING_DATA || { series: [], types: {} };
  var root = document.documentElement;
  var RH = (window.RH = window.RH || {});

  function $(sel, scope) {
    return (scope || document).querySelector(sel);
  }

  function $$(sel, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(sel));
  }

  RH.$ = $;
  RH.$$ = $$;
  RH.data = data;

  /* =====================================================================
     Тема
     ===================================================================== */

  var theme = root.dataset.theme || 'dark';

  function applyTheme(next) {
    theme = next;
    root.dataset.theme = next;

    var meta = $('#themeColor');
    if (meta) {
      meta.setAttribute('content', next === 'light' ? '#f1f4f9' : '#07080a');
    }

    $$('[data-theme-btn]').forEach(function (btn) {
      btn.setAttribute(
        'aria-label',
        next === 'dark' ? 'Тема: переключить на светлую' : 'Тема: переключить на тёмную'
      );
    });
  }

  function saveTheme(next) {
    try {
      localStorage.setItem('rh-theme', next);
    } catch (e) {
      /* приватный режим — просто не сохраняем */
    }
  }

  $$('[data-theme-btn]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      saveTheme(next);
    });
  });

  applyTheme(theme);

  /* =====================================================================
     Каталог серий на главной
     ===================================================================== */

  function seasonRange(series) {
    var years = [];
    (series.entries || []).forEach(function (entry) {
      if (years.indexOf(entry.season) === -1) years.push(entry.season);
    });
    Object.keys(series.races || {}).forEach(function (year) {
      if (years.indexOf(Number(year)) === -1) years.push(Number(year));
    });
    years.sort();
    if (!years.length) return '';
    return years.length > 1 ? years[0] + '–' + years[years.length - 1] : String(years[0]);
  }

  function trackSvg(curve, className) {
    return (
      '<svg class="' + className + '" viewBox="0 0 240 140" fill="none" aria-hidden="true">' +
      '<path class="track__shadow" d="' + curve + '"></path>' +
      '<path class="track__line" d="' + curve + '"></path>' +
      '<path class="track__dash" d="' + curve + '"></path>' +
      '</svg>'
    );
  }

  RH.trackSvg = trackSvg;
  RH.seasonRange = seasonRange;

  RH.plural = function (n, forms) {
    var abs = Math.abs(n) % 100;
    var last = abs % 10;
    if (abs > 10 && abs < 20) return forms[2];
    if (last === 1) return forms[0];
    if (last >= 2 && last <= 4) return forms[1];
    return forms[2];
  };


  function initSpotlight() {
    $$('.series-card').forEach(function (card) {
      if (card.dataset.spotlight) return;
      card.dataset.spotlight = '1';

      card.addEventListener('pointermove', function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', e.clientX - rect.left + 'px');
        card.style.setProperty('--my', e.clientY - rect.top + 'px');
      });
    });
  }

  var arrowSvg =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M4 12h14M11 5l7 7-7 7" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function renderSeries() {
    var grid = $('#seriesGrid');
    if (!grid) return;

    var fragment = document.createDocumentFragment();

    (data.series || []).forEach(function (series, index) {
      var card = document.createElement('a');
      card.className = 'series-card reveal' + (index === 0 ? ' series-card--wide' : '');
      card.href = 'series.html?s=' + encodeURIComponent(series.id);
      card.style.setProperty('--accent', series.accent);
      card.style.setProperty('--i', String(index));
      card.setAttribute(
        'aria-label',
        series.name +
          ' — открыть серию, ' +
          series.entries.length +
          ' ' +
          RH.plural(series.entries.length, ['запись', 'записи', 'записей'])
      );

      card.innerHTML =
        '<div class="series-card__visual">' +
        '<span class="series-card__code">' + series.code + '</span>' +
        (series.logo
          ? '<span class="series-card__logo"><img src="' + series.logo + '" alt="" decoding="async"></span>'
          : '') +
        '<span class="series-card__num">' + series.num + '</span>' +
        trackSvg(series.curve, 'series-card__track') +
        '</div>' +
        '<div class="series-card__body">' +
        '<h3 class="series-card__title">' + series.name + '</h3>' +
        '<p class="series-card__sub">' + series.category + ' · ' + seasonRange(series) + '</p>' +
        '<p class="series-card__desc">' + series.tagline + '</p>' +
        '<div class="series-card__meta">' +
        '<span>' +
        series.entries.length +
        ' ' +
        RH.plural(series.entries.length, ['запись', 'записи', 'записей']) +
        '</span>' +
        '<span class="series-card__go">Открыть ' + arrowSvg + '</span>' +
        '</div>' +
        '</div>';

      fragment.appendChild(card);
    });

    grid.appendChild(fragment);
    initSpotlight();
    RH.observeReveals(grid);
  }

  /* =====================================================================
     Появление блоков при скролле
     ===================================================================== */

  var observer = null;

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.08 }
    );
  }

  RH.observeReveals = function (scope) {
    var items = $$('.reveal:not(.is-in)', scope || document);
    if (!observer) {
      items.forEach(function (el) {
        el.classList.add('is-in');
      });
      return;
    }
    items.forEach(function (el) {
      observer.observe(el);
    });
  };

  /* =====================================================================
     Мобильное меню
     ===================================================================== */

  function initMenu() {
    var header = $('[data-header]');
    var button = $('[data-menu-btn]');
    if (!header || !button) return;

    function setOpen(open) {
      header.dataset.navOpen = String(open);
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    }

    button.addEventListener('click', function () {
      setOpen(header.dataset.navOpen !== 'true');
    });

    var nav = $('#siteNav');
    if (nav) {
      nav.addEventListener('click', function (e) {
        if (e.target.closest('a')) setOpen(false);
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });

    document.addEventListener('click', function (e) {
      if (header.dataset.navOpen !== 'true') return;
      if (!e.target.closest('[data-header]')) setOpen(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 880) setOpen(false);
    });
  }

  /* =====================================================================
     Тосты и демо-ссылки
     ===================================================================== */

  var toastEl = null;
  var toastTimer = 0;

  RH.toast = function (message, duration) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }

    toastEl.textContent = message;
    window.requestAnimationFrame(function () {
      toastEl.classList.add('is-on');
    });

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove('is-on');
    }, duration || 2800);
  };

  $$('[data-demo]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      RH.toast('Демо-ссылка: здесь будет ваш профиль');
    });
  });

  /* =====================================================================
     Запуск
     ===================================================================== */

  $$('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  initMenu();
  renderSeries();
  RH.observeReveals();
})();
