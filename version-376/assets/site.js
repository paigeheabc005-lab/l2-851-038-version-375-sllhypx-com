(function() {
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.querySelector('.site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function() {
      siteNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var slideIndex = 0;
  var slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach(function(slide, pos) {
      slide.classList.toggle('is-active', pos === slideIndex);
    });
    dots.forEach(function(dot, pos) {
      dot.classList.toggle('is-active', pos === slideIndex);
    });
  }

  function restartSlides() {
    if (slideTimer) {
      window.clearInterval(slideTimer);
    }
    if (slides.length > 1) {
      slideTimer = window.setInterval(function() {
        showSlide(slideIndex + 1);
      }, 5200);
    }
  }

  if (slides.length) {
    showSlide(0);
    restartSlides();
    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
        restartSlides();
      });
    });
    if (prev) {
      prev.addEventListener('click', function() {
        showSlide(slideIndex - 1);
        restartSlides();
      });
    }
    if (next) {
      next.addEventListener('click', function() {
        showSlide(slideIndex + 1);
        restartSlides();
      });
    }
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.site-search-input'));
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
  var activeChip = '';

  function valueOf(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-tags') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-genre') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
  }

  function currentKeyword() {
    var value = '';
    searchInputs.forEach(function(input) {
      if (input.value.trim()) {
        value = input.value.trim().toLowerCase();
      }
    });
    return value;
  }

  function applyFilters() {
    var keyword = currentKeyword();
    var visibleCount = 0;
    filterCards.forEach(function(card) {
      var haystack = valueOf(card);
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchChip = !activeChip || haystack.indexOf(activeChip.toLowerCase()) !== -1;
      var visible = matchKeyword && matchChip;
      card.classList.toggle('is-filter-hidden', !visible);
      if (visible) {
        visibleCount += 1;
      }
    });
    Array.prototype.slice.call(document.querySelectorAll('.empty-state')).forEach(function(empty) {
      empty.classList.toggle('is-visible', filterCards.length > 0 && visibleCount === 0);
    });
  }

  searchInputs.forEach(function(input) {
    input.addEventListener('input', applyFilters);
  });

  chips.forEach(function(chip) {
    chip.addEventListener('click', function() {
      chips.forEach(function(item) {
        item.classList.remove('is-active');
      });
      chip.classList.add('is-active');
      activeChip = chip.getAttribute('data-filter') || '';
      applyFilters();
    });
  });
}());
