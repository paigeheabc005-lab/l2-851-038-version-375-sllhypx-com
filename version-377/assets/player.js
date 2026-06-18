import { H as Hls } from './hls-vendor-dru42stk.js';

(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var source = video ? video.dataset.src : '';
    var prepared = false;
    var hls = null;

    function prepare() {
      if (!video || !source || prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      prepare();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      if (video) {
        var request = video.play();
        if (request && typeof request.catch === 'function') {
          request.catch(function () {});
        }
      }
    }

    if (cover) {
      cover.addEventListener('click', function (event) {
        event.preventDefault();
        play();
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
}());
