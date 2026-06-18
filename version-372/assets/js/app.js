(function () {
  "use strict";

  var HLS_CDN = "https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js";
  var hlsLoading = null;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    if (!hlsLoading) {
      hlsLoading = new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = HLS_CDN;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    hlsLoading.then(callback).catch(function () {
      callback();
    });
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    if (!toggle) {
      return;
    }

    toggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
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
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
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

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    document.querySelectorAll(".js-filter-scope").forEach(function (scope) {
      var keyword = scope.querySelector(".js-filter-keyword");
      var year = scope.querySelector(".js-filter-year");
      var region = scope.querySelector(".js-filter-region");
      var type = scope.querySelector(".js-filter-type");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".js-card"));
      var count = scope.querySelector("[data-visible-count]");

      function applyFilter() {
        var q = normalize(keyword && keyword.value);
        var y = normalize(year && year.value);
        var r = normalize(region && region.value);
        var t = normalize(type && type.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-category"),
            card.textContent
          ].join(" "));
          var pass = true;

          if (q && haystack.indexOf(q) === -1) {
            pass = false;
          }
          if (y && normalize(card.getAttribute("data-year")) !== y) {
            pass = false;
          }
          if (r && normalize(card.getAttribute("data-region")) !== r) {
            pass = false;
          }
          if (t && normalize(card.getAttribute("data-type")) !== t) {
            pass = false;
          }

          card.hidden = !pass;
          if (pass) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible;
        }
      }

      [keyword, year, region, type].forEach(function (field) {
        if (field) {
          field.addEventListener("input", applyFilter);
          field.addEventListener("change", applyFilter);
        }
      });

      applyFilter();
    });
  }

  function movieResultCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<a class=\"movie-card\" href=\"" + escapeHtml(movie.url) + "\">",
      "  <div class=\"poster-wrap\" data-fallback=\"" + escapeHtml(movie.title) + "\">",
      "    <img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + " 封面\" loading=\"lazy\" onerror=\"this.style.opacity='0';\" />",
      "    <span class=\"play-mark\">▶</span>",
      "  </div>",
      "  <div class=\"movie-card-body\">",
      "    <div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
      "    <h3>" + escapeHtml(movie.title) + "</h3>",
      "    <p>" + escapeHtml(movie.oneLine || "") + "</p>",
      "    <div class=\"tag-row\">" + tags + "</div>",
      "  </div>",
      "</a>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var form = document.querySelector("[data-search-form]");
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");

    if (!form || !results || !summary || !window.MOVIE_INDEX) {
      return;
    }

    var input = form.querySelector("input[name='q']");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    if (initial && input) {
      input.value = initial;
    }

    function search() {
      var q = normalize(input && input.value);
      if (!q) {
        var defaults = window.MOVIE_INDEX.slice(0, 20);
        results.innerHTML = defaults.map(movieResultCard).join("");
        summary.innerHTML = "热门推荐 <strong>20</strong> 部，可输入关键词继续筛选。";
        return;
      }

      var terms = q.split(/\s+/).filter(Boolean);
      var matched = window.MOVIE_INDEX.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" "));

        return terms.every(function (term) {
          return haystack.indexOf(term) !== -1;
        });
      }).slice(0, 120);

      results.innerHTML = matched.map(movieResultCard).join("");
      summary.innerHTML = "搜索到 <strong>" + matched.length + "</strong> 条相关结果。";
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      search();
      var q = input ? input.value.trim() : "";
      var nextUrl = q ? ("search.html?q=" + encodeURIComponent(q)) : "search.html";
      history.replaceState(null, "", nextUrl);
    });

    if (input) {
      input.addEventListener("input", search);
    }

    search();
  }

  function setupVideo(video, source) {
    if (!video || !source) {
      return;
    }

    var previous = video._hlsInstance;
    if (previous) {
      previous.destroy();
      video._hlsInstance = null;
    }

    video.setAttribute("data-src", source);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    loadHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      } else {
        video.src = source;
      }
    });
  }

  function initPlayers() {
    document.querySelectorAll(".player-panel").forEach(function (panel) {
      var video = panel.querySelector(".js-hls-player");
      var overlay = panel.querySelector("[data-play-trigger]");
      var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-video-source]"));
      var initial = video ? video.getAttribute("data-src") : "";

      setupVideo(video, initial);

      function play() {
        setupVideo(video, video.getAttribute("data-src"));
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            panel.classList.remove("is-playing");
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }

      if (video) {
        video.addEventListener("play", function () {
          panel.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          panel.classList.remove("is-playing");
        });
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("is-active");
          });
          button.classList.add("is-active");
          setupVideo(video, button.getAttribute("data-video-source"));
          play();
        });
      });
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initSearchPage();
    initPlayers();
  });
})();
