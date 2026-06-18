(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initNavigation() {
    var toggle = $('.nav-toggle');
    var panel = $('.mobile-nav');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHeroCarousel() {
    var root = $('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = $all('[data-hero-slide]', root);
    var dots = $all('[data-hero-dot]', root);
    var next = $('[data-hero-next]', root);
    var prev = $('[data-hero-prev]', root);
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function matchCard(card, query, region, type, year) {
    var text = normalize([
      card.dataset.title,
      card.dataset.region,
      card.dataset.type,
      card.dataset.year,
      card.dataset.genre,
      card.dataset.tags
    ].join(' '));
    var okQuery = !query || text.indexOf(query) !== -1;
    var okRegion = !region || card.dataset.region === region;
    var okType = !type || card.dataset.type === type;
    var okYear = !year || card.dataset.year === year;
    return okQuery && okRegion && okType && okYear;
  }

  function initFilters() {
    var scope = $('[data-search-scope]');
    var cards = $all('[data-card]');
    if (!scope || !cards.length) {
      return;
    }
    var input = $('[data-filter-input]', scope);
    var region = $('[data-filter-region]', scope);
    var type = $('[data-filter-type]', scope);
    var year = $('[data-filter-year]', scope);
    var reset = $('[data-filter-reset]', scope);
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && input) {
      input.value = q;
    }

    function apply() {
      var query = normalize(input && input.value);
      var selectedRegion = region ? region.value : '';
      var selectedType = type ? type.value : '';
      var selectedYear = year ? year.value : '';
      cards.forEach(function (card) {
        card.classList.toggle('hidden-card', !matchCard(card, query, selectedRegion, selectedType, selectedYear));
      });
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
  }

  window.setupPlayer = function (videoId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !sourceUrl) {
      return;
    }
    var stage = video.closest('.player-stage');
    var loaded = false;
    var hlsInstance = null;

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function loadVideo() {
      if (loaded) {
        playVideo();
        return;
      }
      loaded = true;
      if (stage) {
        stage.classList.add('is-playing');
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        return;
      }
      video.src = sourceUrl;
      playVideo();
    }

    button.addEventListener('click', loadVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        loadVideo();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHeroCarousel();
    initFilters();
  });
})();
