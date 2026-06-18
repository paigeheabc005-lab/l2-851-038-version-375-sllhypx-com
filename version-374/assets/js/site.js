(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMenu() {
    var toggle = $('[data-menu-toggle]');
    var panel = $('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHeaderSearch() {
    $all('.search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          return;
        }
        event.preventDefault();
        var action = form.getAttribute('action') || 'search.html';
        window.location.href = action + '?q=' + encodeURIComponent(input.value.trim());
      });
    });
  }

  function initHero() {
    var root = $('[data-hero]');
    if (!root) {
      return;
    }
    var slides = $all('[data-hero-slide]', root);
    var dots = $all('[data-hero-dot]', root);
    var prev = $('[data-hero-prev]', root);
    var next = $('[data-hero-next]', root);
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    $all('[data-filter-root]').forEach(function (root) {
      var input = $('[data-search-input]', root);
      var region = $('[data-region-filter]', root);
      var type = $('[data-type-filter]', root);
      var year = $('[data-year-filter]', root);
      var reset = $('[data-reset-filter]', root);
      var note = $('[data-result-text]', root);
      var cards = $all('[data-card]', root);
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');

      if (input && q) {
        input.value = q;
      }

      function apply() {
        var term = normalize(input && input.value);
        var selectedRegion = normalize(region && region.value);
        var selectedType = normalize(type && type.value);
        var selectedYear = normalize(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var matchTerm = !term || haystack.indexOf(term) !== -1;
          var matchRegion = !selectedRegion || normalize(card.getAttribute('data-region')) === selectedRegion;
          var matchType = !selectedType || normalize(card.getAttribute('data-type')) === selectedType;
          var matchYear = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
          var showCard = matchTerm && matchRegion && matchType && matchYear;
          card.classList.toggle('is-filtered-out', !showCard);
          if (showCard) {
            visible += 1;
          }
        });

        if (note) {
          note.textContent = visible ? '筛选结果已更新' : '暂无匹配内容';
        }
      }

      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          if (region) {
            region.value = '';
          }
          if (type) {
            type.value = '';
          }
          if (year) {
            year.value = '';
          }
          apply();
        });
      }

      apply();
    });
  }

  function prepareVideo(video) {
    var stream = video.getAttribute('data-stream');
    if (!stream || video.getAttribute('data-ready') === '1') {
      return Promise.resolve();
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.setAttribute('data-ready', '1');
      return Promise.resolve();
    }
    if (window.Hls && window.Hls.isSupported()) {
      return new Promise(function (resolve) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video.hls = hls;
        video.setAttribute('data-ready', '1');
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        window.setTimeout(resolve, 1200);
      });
    }
    video.src = stream;
    video.setAttribute('data-ready', '1');
    return Promise.resolve();
  }

  function initPlayers() {
    $all('[data-player]').forEach(function (player) {
      var video = $('.video-el', player);
      var button = $('[data-play-button]', player);
      if (!video || !button) {
        return;
      }

      function hideCover() {
        button.classList.add('is-hidden');
      }

      function play() {
        prepareVideo(video).then(function () {
          var attempt = video.play();
          if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {});
          }
          hideCover();
        });
      }

      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', hideCover);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHeaderSearch();
    initHero();
    initFilters();
    initPlayers();
  });
})();
