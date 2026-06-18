(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var sliders = document.querySelectorAll(".hero-slider");

  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    restart();
  });

  var toolbars = document.querySelectorAll("[data-filter-toolbar]");

  toolbars.forEach(function (toolbar) {
    var scopeSelector = toolbar.getAttribute("data-filter-toolbar");
    var scope = document.querySelector(scopeSelector);
    var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-row")) : [];
    var empty = document.querySelector(toolbar.getAttribute("data-empty") || "");
    var search = toolbar.querySelector("[data-filter-search]");
    var year = toolbar.querySelector("[data-filter-year]");
    var genre = toolbar.querySelector("[data-filter-genre]");

    function normalize(value) {
      return (value || "").toString().toLowerCase().trim();
    }

    function apply() {
      var keyword = normalize(search ? search.value : "");
      var yearValue = normalize(year ? year.value : "");
      var genreValue = normalize(genre ? genre.value : "");
      var visibleCount = 0;

      cards.forEach(function (card) {
        var title = normalize(card.getAttribute("data-title"));
        var region = normalize(card.getAttribute("data-region"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardGenre = normalize(card.getAttribute("data-genre"));
        var cardCategory = normalize(card.getAttribute("data-category"));
        var haystack = [title, region, cardYear, cardGenre, cardCategory].join(" ");
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !yearValue || cardYear.indexOf(yearValue) !== -1;
        var matchedGenre = !genreValue || cardGenre.indexOf(genreValue) !== -1 || cardCategory.indexOf(genreValue) !== -1;
        var matched = matchedKeyword && matchedYear && matchedGenre;

        card.style.display = matched ? "" : "none";

        if (matched) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visibleCount === 0);
      }
    }

    [search, year, genre].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  });
})();
