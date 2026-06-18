(function () {
  var players = document.querySelectorAll(".video-shell");

  players.forEach(function (shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector(".play-overlay");
    var stream = shell.getAttribute("data-stream");
    var hls = null;

    if (!video || !stream) {
      return;
    }

    function attachStream() {
      if (video.getAttribute("data-ready") === "1") {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(stream);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      }

      video.setAttribute("data-ready", "1");
    }

    function startPlayback() {
      attachStream();
      shell.classList.add("is-playing");

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          shell.classList.remove("is-playing");
        });
      }
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });

    video.addEventListener("ended", function () {
      shell.classList.remove("is-playing");
    });

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
        hls = null;
      }
    });
  });
})();
