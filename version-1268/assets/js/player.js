(function () {
  function initMoviePlayer(source, videoId, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hlsInstance = null;

    if (!video || !button || !source) {
      return;
    }

    function ready() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      video.setAttribute('data-ready', '1');
      video.setAttribute('controls', 'controls');
    }

    function play() {
      ready();
      button.classList.add('is-hidden');
      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', play);

    video.addEventListener('click', function () {
      if (video.getAttribute('data-ready') !== '1') {
        play();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
