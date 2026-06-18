(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    setupNavigation();
    setupSearchAndFilters();
    setupPlayer();
  });

  function setupNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.getElementById('navMenu');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var opened = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function setupSearchAndFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    inputs.forEach(function (input) {
      var scope = input.closest('section') || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var empty = scope.querySelector('[data-empty-state]');
      var filterGroup = scope.querySelector('[data-filter-group]');
      var activeFilter = 'all';

      function apply() {
        var query = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesFilter = activeFilter === 'all' || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
          var show = matchesQuery && matchesFilter;
          card.classList.toggle('is-hidden', !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      input.addEventListener('input', apply);

      if (filterGroup) {
        filterGroup.addEventListener('click', function (event) {
          var button = event.target.closest('[data-filter-value]');
          if (!button) {
            return;
          }
          activeFilter = button.getAttribute('data-filter-value') || 'all';
          Array.prototype.slice.call(filterGroup.querySelectorAll('[data-filter-value]')).forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          apply();
        });
      }
    });
  }

  function setupPlayer() {
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-player-cover]');
    var configElement = document.getElementById('player-config');
    if (!video || !configElement) {
      return;
    }

    var streamUrl = '';
    try {
      streamUrl = JSON.parse(configElement.textContent).videoUrl || '';
    } catch (error) {
      streamUrl = '';
    }
    if (!streamUrl) {
      return;
    }

    var initialized = false;
    var hlsInstance = null;

    function playVideo() {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    function start() {
      if (!initialized) {
        initialized = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          video.addEventListener('loadedmetadata', playVideo, { once: true });
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        } else {
          video.src = streamUrl;
          video.addEventListener('loadedmetadata', playVideo, { once: true });
        }
      } else {
        playVideo();
      }
      video.controls = true;
      if (cover) {
        cover.classList.add('is-hidden');
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (!initialized) {
        start();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
