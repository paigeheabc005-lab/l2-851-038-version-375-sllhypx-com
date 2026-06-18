(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-missing');
    }, { once: true });
  });

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var nextButton = hero.querySelector('.hero-next');
    var prevButton = hero.querySelector('.hero-prev');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
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
        showSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        start();
      });
    });

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(index + 1);
        start();
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(index - 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  var filterForm = document.querySelector('[data-filter-form]');
  var filterInput = document.querySelector('[data-filter-input]');
  var filterCategory = document.querySelector('[data-filter-category]');
  var filterScope = document.querySelector('[data-filter-scope]');
  var emptyState = document.querySelector('[data-empty-state]');

  function applyFilter() {
    if (!filterScope) {
      return;
    }

    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var category = filterCategory ? filterCategory.value : '';
    var cards = Array.prototype.slice.call(filterScope.querySelectorAll('[data-card]'));
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = card.getAttribute('data-search') || '';
      var cardCategory = card.getAttribute('data-category') || '';
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchCategory = !category || cardCategory === category;
      var matched = matchKeyword && matchCategory;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query) {
      filterInput.value = query;
    }

    filterInput.addEventListener('input', applyFilter);
  }

  if (filterCategory) {
    filterCategory.addEventListener('change', applyFilter);
  }

  if (filterForm) {
    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });
  }

  applyFilter();
})();
