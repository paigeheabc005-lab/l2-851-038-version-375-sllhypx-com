(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initializeVideo(block) {
    var video = block.querySelector("video");
    var sourceNode = video ? video.querySelector("source") : null;
    var layer = block.querySelector("[data-play-layer]");
    var button = block.querySelector("[data-play-button]");
    if (!video || !sourceNode) {
      return;
    }
    var src = sourceNode.getAttribute("src");
    var hls = null;
    var attached = false;

    function attachStream() {
      if (!src || attached) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        attached = true;
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
        video.src = src;
        attached = true;
      }
    }

    function attemptPlay() {
      attachStream();
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", function () {
        attemptPlay();
      });
    }
    if (layer) {
      layer.addEventListener("click", function () {
        attemptPlay();
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        attemptPlay();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      if (layer) {
        layer.classList.add("hidden");
      }
    });
    video.addEventListener("pause", function () {
      if (layer) {
        layer.classList.remove("hidden");
      }
    });
    video.addEventListener("ended", function () {
      if (layer) {
        layer.classList.remove("hidden");
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-video-block]")).forEach(initializeVideo);
  });
})();
