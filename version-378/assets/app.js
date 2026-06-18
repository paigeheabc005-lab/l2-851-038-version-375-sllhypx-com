(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  if (slides.length) {
    let current = 0;
    const showSlide = function (next) {
      current = (next + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('active', index === current);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  const quickSearch = document.querySelector('[data-quick-search]');
  if (quickSearch) {
    quickSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = quickSearch.querySelector('input');
      const value = input ? input.value.trim() : '';
      const target = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
      window.location.href = target;
    });
  }

  const filterInput = document.querySelector('[data-filter-input]');
  const filterButton = document.querySelector('[data-filter-button]');
  const filterCards = Array.from(document.querySelectorAll('[data-filter-card]'));
  const emptyState = document.querySelector('[data-empty-state]');
  if (filterInput && filterCards.length) {
    const params = new URLSearchParams(window.location.search);
    const preset = params.get('q');
    if (preset) {
      filterInput.value = preset;
    }
    const applyFilter = function () {
      const query = filterInput.value.trim().toLowerCase();
      let shown = 0;
      filterCards.forEach(function (card) {
        const haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' ').toLowerCase();
        const matched = !query || haystack.indexOf(query) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          shown += 1;
        }
      });
      if (emptyState) {
        emptyState.style.display = shown ? 'none' : 'block';
      }
    };
    filterInput.addEventListener('input', applyFilter);
    if (filterButton) {
      filterButton.addEventListener('click', applyFilter);
    }
    applyFilter();
  }

  const video = document.querySelector('[data-player-video]');
  const trigger = document.querySelector('[data-player-trigger]');
  const cover = document.querySelector('[data-player-cover]');
  if (video && trigger) {
    const streamUrl = video.getAttribute('data-stream');
    let attached = false;
    const attachStream = function () {
      if (attached || !streamUrl) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        attached = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        attached = true;
        return;
      }
      video.src = streamUrl;
      attached = true;
    };
    const startPlayback = function () {
      attachStream();
      video.controls = true;
      if (cover) {
        cover.classList.add('hidden');
      }
      const promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    };
    trigger.addEventListener('click', startPlayback);
    if (cover) {
      cover.addEventListener('click', startPlayback);
    }
  }
})();
