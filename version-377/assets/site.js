(function () {
  var toggle = document.querySelector('.menu-toggle');
  var mobile = document.querySelector('.mobile-nav');

  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      var opened = mobile.classList.toggle('open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var active = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === active);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === active);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var regionSelect = document.querySelector('[data-filter-region]');
  var typeSelect = document.querySelector('[data-filter-type]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var empty = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(filterInput && filterInput.value);
    var region = normalize(regionSelect && regionSelect.value);
    var type = normalize(typeSelect && typeSelect.value);
    var year = normalize(yearSelect && yearSelect.value);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.tags,
        card.dataset.year
      ].join(' '));
      var matched = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }
      if (region && normalize(card.dataset.region) !== region) {
        matched = false;
      }
      if (type && normalize(card.dataset.type) !== type) {
        matched = false;
      }
      if (year && normalize(card.dataset.year) !== year) {
        matched = false;
      }

      card.classList.toggle('hidden-by-filter', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  [filterInput, regionSelect, typeSelect, yearSelect].forEach(function (item) {
    if (item) {
      item.addEventListener('input', applyFilter);
      item.addEventListener('change', applyFilter);
    }
  });

  var globalSearch = document.querySelector('[data-global-search]');
  if (globalSearch) {
    globalSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = globalSearch.querySelector('input');
      var value = input ? input.value.trim() : '';
      var url = 'search.html';
      if (value) {
        url += '?q=' + encodeURIComponent(value);
      }
      window.location.href = url;
    });
  }

  var searchRoot = document.querySelector('[data-search-root]');
  if (searchRoot && window.MOVIE_SEARCH_INDEX) {
    var input = searchRoot.querySelector('input');
    var results = searchRoot.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    function renderSearch() {
      var query = normalize(input.value);
      var items = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        return !query || normalize(movie.title + ' ' + movie.tags + ' ' + movie.region + ' ' + movie.type + ' ' + movie.year).indexOf(query) !== -1;
      }).slice(0, 120);

      results.innerHTML = items.map(function (movie) {
        return [
          '<article class="movie-card" data-title="' + movie.titleEsc + '">',
          '<a class="poster" href="movies/' + movie.file + '">',
          '<img src="' + movie.cover + '" alt="' + movie.titleEsc + '" loading="lazy">',
          '<span class="play-float">▶</span>',
          '</a>',
          '<div class="card-body">',
          '<div class="tag-row"><span>' + movie.regionEsc + '</span><span>' + movie.typeEsc + '</span></div>',
          '<h3><a href="movies/' + movie.file + '">' + movie.titleEsc + '</a></h3>',
          '<p>' + movie.oneEsc + '</p>',
          '<div class="meta-line"><span>' + movie.yearEsc + '</span><span>' + movie.genreEsc + '</span></div>',
          '</div>',
          '</article>'
        ].join('');
      }).join('');
    }

    input.value = initial;
    input.addEventListener('input', renderSearch);
    renderSearch();
  }
}());
