/* Racing Hub — страница серии: энциклопедия, техника, формат этапа и трассы. */
(function () {
  'use strict';

  var data = window.RACING_DATA || { series: [], circuits: {} };
  var RH = window.RH;
  if (!RH || !data.series || !data.series.length) return;

  var $ = RH.$;
  var params = new URLSearchParams(window.location.search);
  var requested = params.get('s');

  var series =
    data.series.filter(function (item) {
      return item.id === requested;
    })[0] || data.series[0];

  var profile = series.profile || {};
  var fallbackToast = requested && requested !== series.id;

  /* ---------- утилиты ---------- */

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function readableInk(hex) {
    var h = String(hex || '#e10600').replace('#', '');
    if (h.length === 3) {
      h = h
        .split('')
        .map(function (c) {
          return c + c;
        })
        .join('');
    }
    var r = parseInt(h.slice(0, 2), 16);
    var g = parseInt(h.slice(2, 4), 16);
    var b = parseInt(h.slice(4, 6), 16);
    var lum = 0.299 * r + 0.587 * g + 0.114 * b;
    return lum > 130 ? '#0b0d11' : '#ffffff';
  }

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function pathStart(d) {
    var match = String(d || '').match(/M\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/);
    if (!match) return null;
    return { x: Number(match[1]), y: Number(match[2]) };
  }

  function trackSvg(path, label) {
    var start = pathStart(path);
    var html =
      '<svg class="enc-track__svg" viewBox="-14 -12 268 164" fill="none" role="img" aria-label="' +
      esc(label) +
      '">';
    html += '<path class="enc-track__halo" d="' + path + '"></path>';
    html += '<path class="enc-track__line" d="' + path + '"></path>';
    if (start) {
      html +=
        '<circle class="enc-track__start-ring" cx="' +
        start.x +
        '" cy="' +
        start.y +
        '" r="5.4"></circle>';
      html +=
        '<circle class="enc-track__start" cx="' +
        start.x +
        '" cy="' +
        start.y +
        '" r="2.3"></circle>';
    }
    html += '</svg>';
    return html;
  }

  var arrowSvg =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h14M11 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------- шапка страницы ---------- */

  document.documentElement.style.setProperty('--accent', series.accent);
  document.documentElement.style.setProperty(
    '--accent-contrast',
    readableInk(series.accent)
  );
  document.body.dataset.series = series.id;
  document.title = series.name + ' — Racing Hub';

  var metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute(
      'content',
      (profile.essence && profile.essence.lead) || series.tagline
    );
  }

  var crumb = $('#crumbName');
  if (crumb) crumb.textContent = series.name;

  var category = $('#seriesCategory');
  if (category) {
    var categoryParts = [series.category];
    if (
      series.nameRu &&
      String(series.nameRu).toLowerCase() !== String(series.category).toLowerCase()
    ) {
      categoryParts.push(series.nameRu);
    }
    category.textContent = categoryParts.join(' · ');
  }

  var titleEl = $('#seriesTitle');
  if (titleEl) titleEl.textContent = series.name;

  var leadEl = $('#seriesLead');
  if (leadEl) {
    leadEl.textContent =
      (profile.essence && profile.essence.lead) || series.tagline || '';
  }

  var metrics = [
    { label: 'Год основания', value: profile.founded || '—' },
    { label: 'Мощность', value: profile.power || '—' },
    { label: 'Макс. скорость', value: profile.topSpeed || '—' },
    { label: 'Формат гонок', value: profile.raceFormat || '—' }
  ];

  var metricsEl = $('#seriesMetrics');
  if (metricsEl) {
    metricsEl.innerHTML = metrics
      .map(function (item) {
        return (
          '<div><dt>' +
          esc(item.label) +
          '</dt><dd>' +
          esc(item.value) +
          '</dd></div>'
        );
      })
      .join('');
  }

  var actionsEl = $('#seriesActions');
  if (actionsEl) {
    actionsEl.innerHTML =
      '<a class="enc-link" href="#tech">Технический регламент ' +
      arrowSvg +
      '</a>' +
      '<a class="enc-link" href="#tracks">Трассы и команды ' +
      arrowSvg +
      '</a>';
  }

  /* ---------- 3D-модель ---------- */

  function modelHtml() {
    var model = profile.model || {};
    var src = model.src || '';
    var label = model.label || '3D-модель болида';

    return (
      '<div class="enc-model__stage">' +
      '<model-viewer class="enc-model__viewer" src="' +
      esc(src) +
      '" alt="' +
      esc(label) +
      '" camera-controls auto-rotate auto-rotate-delay="1600" rotation-per-second="14deg" shadow-intensity="0.7" environment-image="neutral" exposure="1" interaction-prompt="none"></model-viewer>' +
      '<div class="enc-model__spinner" aria-hidden="true"></div>' +
      '</div>'
    );
  }

  var modelSlot = $('#modelSlot');
  if (modelSlot) {
    modelSlot.innerHTML = modelHtml();

    var viewer = modelSlot.querySelector('model-viewer');
    if (viewer) {
      viewer.addEventListener('load', function () {
        modelSlot.classList.remove('is-error');
        modelSlot.classList.add('is-ready');
      });
      viewer.addEventListener('error', function () {
        modelSlot.classList.add('is-error');
      });
    }

    if (
      !window.customElements ||
      !window.customElements.get('model-viewer')
    ) {
      modelSlot.classList.add('is-error');
    }
  }

  /* ---------- переключатель серий ---------- */

  var seriesNav = $('#seriesNav');
  if (seriesNav) {
    seriesNav.innerHTML = data.series
      .map(function (item) {
        var active = item.id === series.id;
        return (
          '<a class="enc-series-link' +
          (active ? ' is-active' : '') +
          '" href="series.html?s=' +
          encodeURIComponent(item.id) +
          '"' +
          (active ? ' aria-current="page"' : '') +
          ' style="--chip-accent:' +
          item.accent +
          '">' +
          '<span class="enc-series-link__code">' +
          esc(item.code) +
          '</span>' +
          '<span class="enc-series-link__name">' +
          esc(item.nameRu || item.name) +
          '</span>' +
          '</a>'
        );
      })
      .join('');
  }

  /* ---------- блоки энциклопедии ---------- */

  function sectionHead(num, title, id, note) {
    return (
      '<header class="enc-section__head">' +
      '<span class="enc-section__num">' +
      num +
      '</span>' +
      '<div class="enc-section__titles">' +
      '<p class="eyebrow">Раздел ' +
      num +
      '</p>' +
      '<h2 class="enc-section__title" id="' +
      id +
      '">' +
      esc(title) +
      '</h2>' +
      '</div>' +
      '<p class="enc-section__note">' +
      esc(note) +
      '</p>' +
      '</header>'
    );
  }

  function historySection() {
    var essence = profile.essence || {};
    var paragraphs = (essence.paragraphs || [])
      .map(function (text) {
        return '<p>' + esc(text) + '</p>';
      })
      .join('');

    var milestones = (essence.milestones || [])
      .map(function (item) {
        return (
          '<li>' +
          '<span class="enc-milestones__year">' +
          esc(item.year) +
          '</span>' +
          '<div><h3>' +
          esc(item.title) +
          '</h3><p>' +
          esc(item.text) +
          '</p></div>' +
          '</li>'
        );
      })
      .join('');

    var legends = (essence.legends || [])
      .map(function (item) {
        return (
          '<div class="enc-legend"><strong>' +
          esc(item.name) +
          '</strong><span>' +
          esc(item.record) +
          '</span></div>'
        );
      })
      .join('');

    return (
      '<section class="enc-section reveal" id="history" aria-labelledby="historyTitle">' +
      sectionHead(
        '02',
        'Суть и история',
        'historyTitle',
        'От первых сезонов до современного регламента.'
      ) +
      '<div class="enc-history">' +
      '<div class="enc-prose">' +
      (series.tagline
        ? '<p class="enc-pull">' + esc(series.tagline) + '</p>'
        : '') +
      paragraphs +
      '</div>' +
      '<ol class="enc-milestones">' +
      milestones +
      '</ol>' +
      '</div>' +
      '<div class="enc-legends">' +
      '<p class="enc-kicker">Легенды и рекорды</p>' +
      '<div class="enc-legends__grid">' +
      legends +
      '</div>' +
      '</div>' +
      '</section>'
    );
  }

  function techSection() {
    var tech = profile.tech || {};
    var rows = (tech.rows || [])
      .map(function (row) {
        return (
          '<div class="enc-spec__row"><dt>' +
          esc(row.label) +
          '</dt><dd>' +
          esc(row.value) +
          '</dd></div>'
        );
      })
      .join('');

    return (
      '<section class="enc-section reveal" id="tech" aria-labelledby="techTitle">' +
      sectionHead(
        '03',
        'Технический регламент',
        'techTitle',
        tech.note || 'Актуальные машины серии и ключевые ограничения регламента.'
      ) +
      '<dl class="enc-spec">' +
      rows +
      '</dl>' +
      '</section>'
    );
  }

  function formatSection() {
    var format = profile.format || {};
    var points = format.points || {};
    var columns = points.columns || [];

    var steps = (format.weekend || [])
      .map(function (step) {
        return (
          '<li>' +
          '<span class="enc-steps__label">' +
          esc(step.label) +
          '</span>' +
          '<div><h3>' +
          esc(step.title) +
          '</h3><p>' +
          esc(step.text) +
          '</p></div>' +
          '</li>'
        );
      })
      .join('');

    var pointRows = (points.rows || [])
      .map(function (row) {
        var values = columns
          .map(function (_, index) {
            var value =
              row.values && row.values[index] != null ? row.values[index] : '—';
            return '<td>' + esc(value) + '</td>';
          })
          .join('');
        return '<tr><th scope="row">' + esc(row.label) + '</th>' + values + '</tr>';
      })
      .join('');

    var pointHead =
      '<thead><tr><th scope="col">Зачёт</th>' +
      columns
        .map(function (column) {
          return '<th scope="col">' + esc(column) + '</th>';
        })
        .join('') +
      '</tr></thead>';

    var extras = (points.extras || [])
      .map(function (text) {
        return '<li>' + esc(text) + '</li>';
      })
      .join('');

    return (
      '<section class="enc-section reveal" id="format" aria-labelledby="formatTitle">' +
      sectionHead(
        '04',
        'Формат этапа и очки',
        'formatTitle',
        'Структура уик-энда, правила пит-стопов и начисление очков.'
      ) +
      '<div class="enc-format">' +
      '<div class="enc-weekend">' +
      '<p class="enc-kicker">Структура уик-энда</p>' +
      '<ol class="enc-steps">' +
      steps +
      '</ol>' +
      '<div class="enc-note">' +
      '<h3>Пит-стопы и сервис</h3>' +
      '<p>' +
      esc(format.pit || '') +
      '</p>' +
      '</div>' +
      '</div>' +
      '<div class="enc-points">' +
      '<p class="enc-kicker">Система очков</p>' +
      '<p class="enc-points__note">' +
      esc(points.note || '') +
      '</p>' +
      '<div class="enc-table-wrap">' +
      '<table class="enc-table enc-table--points">' +
      '<caption class="sr-only">Система начисления очков</caption>' +
      pointHead +
      '<tbody>' +
      pointRows +
      '</tbody></table>' +
      '</div>' +
      (extras ? '<ul class="enc-points__extras">' + extras + '</ul>' : '') +
      '</div>' +
      '</div>' +
      '</section>'
    );
  }

  function tracksSection() {
    var tracks = (profile.tracks || [])
      .map(function (track, index) {
        var circuit = (data.circuits && data.circuits[track.circuit]) || {};
        var path = circuit.path || series.curve;
        var meta = [track.country || circuit.country, circuit.length]
          .filter(Boolean)
          .join(' · ');

        return (
          '<article class="enc-track">' +
          '<div class="enc-track__art">' +
          trackSvg(path, 'Трасса ' + track.name) +
          '<span class="enc-track__index">' +
          pad2(index + 1) +
          '</span>' +
          '</div>' +
          '<div class="enc-track__body">' +
          '<h3>' +
          esc(track.name) +
          '</h3>' +
          '<p class="enc-track__meta">' +
          esc(meta) +
          '</p>' +
          '<p>' +
          esc(track.note) +
          '</p>' +
          '</div>' +
          '</article>'
        );
      })
      .join('');

    var teams = (profile.teams || [])
      .map(function (team) {
        return (
          '<li><span class="enc-teams__name">' +
          esc(team.name) +
          '</span><span class="enc-teams__note">' +
          esc(team.note) +
          '</span></li>'
        );
      })
      .join('');

    return (
      '<section class="enc-section reveal" id="tracks" aria-labelledby="tracksTitle">' +
      sectionHead(
        '05',
        'Культовые трассы и команды',
        'tracksTitle',
        'Автодромы, которые определяют характер серии, и заводские программы.'
      ) +
      '<div class="enc-tracks">' +
      tracks +
      '</div>' +
      '<div class="enc-teams">' +
      '<p class="enc-kicker">Заводские команды и производители</p>' +
      '<ul class="enc-teams__list">' +
      teams +
      '</ul>' +
      '</div>' +
      '</section>'
    );
  }

  var content = $('#seriesContent');
  if (content) {
    content.innerHTML =
      historySection() +
      techSection() +
      formatSection() +
      tracksSection() +
      '<p class="enc-footnote">Технические параметры приведены ориентировочно для демонстрации. 3D-модель подключается из assets/models; во время загрузки показывается кольцевой спиннер.</p>';
    RH.observeReveals(content);
  }

  /* ---------- URL ---------- */

  try {
    var base = window.location.href.split('#')[0].split('?')[0];
    window.history.replaceState(
      null,
      '',
      base + '?s=' + encodeURIComponent(series.id)
    );
  } catch (e) {
    /* file:// в некоторых браузерах не разрешает replaceState */
  }

  if (fallbackToast) {
    RH.toast('Серия не найдена — открыта ' + series.name);
  }
})();
