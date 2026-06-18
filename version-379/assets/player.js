(function () {
  function setMessage(root, text) {
    var message = root.querySelector('[data-player-message]');

    if (!message) {
      return;
    }

    message.textContent = text;
    message.classList.toggle('is-visible', Boolean(text));
  }

  function startPlayer(root) {
    var video = root.querySelector('video');
    var overlay = root.querySelector('.player-overlay');

    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream');

    if (!stream) {
      setMessage(root, '播放暂时不可用，请稍后再试');
      return;
    }

    if (root.getAttribute('data-ready') !== 'true') {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        root.hlsInstance = hls;
      } else {
        setMessage(root, '播放暂时不可用，请稍后再试');
        return;
      }

      root.setAttribute('data-ready', 'true');
    }

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    video.setAttribute('controls', 'controls');
    var request = video.play();

    if (request && typeof request.catch === 'function') {
      request.catch(function () {
        setMessage(root, '点击视频区域继续播放');
      });
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (root) {
    var overlay = root.querySelector('.player-overlay');
    var video = root.querySelector('video');

    if (overlay) {
      overlay.addEventListener('click', function () {
        startPlayer(root);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (root.getAttribute('data-ready') !== 'true') {
          startPlayer(root);
        }
      });
    }
  });
})();
