(function () {
  function attachSource(video, videoUrl) {
    if (video.dataset.ready === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      video._hls = hls;
    } else {
      video.src = videoUrl;
    }

    video.dataset.ready = '1';
  }

  window.prepareMoviePlayer = function (videoUrl) {
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-player-cover]');
    var trigger = document.querySelector('[data-play-trigger]');

    if (!video || !videoUrl) {
      return;
    }

    function start() {
      attachSource(video, videoUrl);
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener('click', start);
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  };
})();
