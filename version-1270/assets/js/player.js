(function () {
  function getMessageNode(frame) {
    var panel = frame.closest('.player-panel');
    return panel ? panel.querySelector('[data-player-message]') : null;
  }

  function updateMessage(frame, message) {
    var node = getMessageNode(frame);
    if (node) {
      node.textContent = message;
    }
  }

  function initializePlayer(frame) {
    var video = frame.querySelector('video');
    var overlay = frame.querySelector('[data-play-button]');
    var source = frame.getAttribute('data-hls-src');
    var hasStarted = false;

    if (!video || !overlay || !source) {
      return;
    }

    function startPlayback() {
      if (hasStarted) {
        video.play();
        frame.classList.add('is-playing');
        return;
      }

      hasStarted = true;
      frame.classList.add('is-playing');
      updateMessage(frame, '正在初始化高清播放源...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          video.play();
        }, { once: true });
        updateMessage(frame, '播放器已使用浏览器原生 HLS 能力加载。');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          updateMessage(frame, '播放源已就绪，正在开始播放。');
          video.play().catch(function () {
            updateMessage(frame, '播放源已就绪，请再次点击视频区域播放。');
          });
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            updateMessage(frame, '当前浏览器无法继续播放该 HLS 源，请更换浏览器或重新打开页面。');
            hls.destroy();
          }
        });
        frame._hls = hls;
        return;
      }

      video.src = source;
      video.play().catch(function () {
        updateMessage(frame, '当前浏览器未启用 HLS 支持。');
      });
    }

    overlay.addEventListener('click', startPlayback);
    video.addEventListener('play', function () {
      frame.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        updateMessage(frame, '播放已暂停，可点击播放器继续观看。');
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(initializePlayer);
})();
