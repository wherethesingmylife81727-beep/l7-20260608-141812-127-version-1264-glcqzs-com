(function () {
  function startPlayer(box) {
    const video = box.querySelector('video');
    const cover = box.querySelector('.player-cover');
    const stream = box.getAttribute('data-stream');

    if (!video || !stream) return;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }

    if (cover) {
      cover.classList.add('is-hidden');
    }

    video.setAttribute('controls', 'controls');
    video.play().catch(function () {});
  }

  document.querySelectorAll('.movie-player').forEach(function (box) {
    const cover = box.querySelector('.player-cover');
    if (cover) {
      cover.addEventListener('click', function () {
        startPlayer(box);
      });
    }
  });
}());
