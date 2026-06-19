(function () {
  var shell = document.querySelector('[data-player-shell]');
  if (!shell) {
    return;
  }

  var video = shell.querySelector('video[data-m3u8]');
  var playButton = shell.querySelector('[data-play-button]');
  var message = shell.querySelector('[data-player-message]');
  var hlsInstance = null;
  var initialized = false;

  function setMessage(text) {
    if (message) {
      message.textContent = text;
    }
  }

  function initializeSource() {
    if (!video || initialized) {
      return;
    }

    var source = video.getAttribute('data-m3u8');
    if (!source) {
      setMessage('当前影片缺少播放源。');
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      initialized = true;
      setMessage('已使用浏览器原生 HLS 播放。');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setMessage('播放源已加载，可开始播放。');
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          setMessage('播放源加载失败，请稍后重试。');
        }
      });
      initialized = true;
      return;
    }

    setMessage('当前浏览器暂不支持 HLS 播放。');
  }

  function playVideo() {
    initializeSource();
    if (!video) {
      return;
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        setMessage('浏览器阻止自动播放，请再次点击播放按钮。');
      });
    }
  }

  if (playButton) {
    playButton.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (playButton && video.currentTime === 0) {
        playButton.classList.remove('is-hidden');
      }
    });
    video.addEventListener('click', function () {
      initializeSource();
    });
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}());
