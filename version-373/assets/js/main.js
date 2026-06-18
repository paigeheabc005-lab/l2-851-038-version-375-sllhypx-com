(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupSearch() {
    var cards = selectAll("[data-movie-card]");
    var empty = document.querySelector("[data-empty-state]");
    var forms = selectAll("[data-search-form]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    function applyFilter(query) {
      var key = normalize(query);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" "));
        var matched = !key || haystack.indexOf(key) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("visible", cards.length > 0 && visible === 0);
      }
    }

    forms.forEach(function (form) {
      var input = form.querySelector("input");
      if (input && initial) {
        input.value = initial;
      }
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = input ? input.value.trim() : "";
        if (cards.length) {
          applyFilter(query);
          var target = document.querySelector("#catalog") || document.querySelector("main");
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        } else {
          window.location.href = "./index.html?q=" + encodeURIComponent(query) + "#catalog";
        }
      });
      if (input && cards.length) {
        input.addEventListener("input", function () {
          applyFilter(input.value);
        });
      }
    });

    if (cards.length && initial) {
      applyFilter(initial);
    }
  }

  function setupFilters() {
    var buttons = selectAll("[data-filter]");
    var cards = selectAll("[data-movie-card]");
    if (!buttons.length || !cards.length) {
      return;
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var filter = button.getAttribute("data-filter") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-genre") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-type"));
          card.style.display = filter === "all" || text.indexOf(normalize(filter)) !== -1 ? "" : "none";
        });
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
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
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupSearch();
    setupFilters();
    setupHero();
  });
})();
