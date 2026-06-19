(function () {
  const mobileButton = document.querySelector("[data-mobile-menu-button]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (mobileButton && mobileMenu) {
    mobileButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("img[data-fallback]").forEach(function (image) {
    image.addEventListener("error", function () {
      const frame = image.parentElement;
      if (frame) {
        frame.classList.add("has-image-error");
      }
      image.style.display = "none";
    }, { once: true });
  });

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let current = 0;

    function showHero(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    if (slides.length > 1) {
      if (prev) {
        prev.addEventListener("click", function () {
          showHero(current - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          showHero(current + 1);
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showHero(index);
        });
      });
      window.setInterval(function () {
        showHero(current + 1);
      }, 5200);
    }
  }

  const params = new URLSearchParams(window.location.search);
  const queryFromUrl = params.get("q") || "";
  const filterInput = document.querySelector("[data-filter-input]");
  const cards = Array.from(document.querySelectorAll(".searchable-card"));

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function applyFilter(value) {
    const needle = normalize(value);
    cards.forEach(function (card) {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags,
        card.textContent
      ].join(" "));
      card.classList.toggle("is-hidden", needle && haystack.indexOf(needle) === -1);
    });
  }

  if (filterInput) {
    if (queryFromUrl) {
      filterInput.value = queryFromUrl;
      applyFilter(queryFromUrl);
    }
    filterInput.addEventListener("input", function () {
      applyFilter(filterInput.value);
    });
  }

  document.querySelectorAll("[data-filter-value]").forEach(function (button) {
    button.addEventListener("click", function () {
      const value = button.getAttribute("data-filter-value") || "";
      if (filterInput) {
        filterInput.value = value;
      }
      applyFilter(value);
    });
  });

  function beginPlayback(shell) {
    const video = shell.querySelector("video");
    const stream = shell.getAttribute("data-stream");

    if (!video || !stream) {
      return;
    }

    shell.classList.add("is-playing");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (!video.src) {
        video.src = stream;
      }
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!shell._hlsReady) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        shell._hlsReady = true;
        shell._hls = hls;
      }
      video.play().catch(function () {});
      return;
    }

    video.src = stream;
    video.play().catch(function () {});
  }

  document.querySelectorAll(".js-player").forEach(function (shell) {
    const cover = shell.querySelector(".video-cover");
    if (cover) {
      cover.addEventListener("click", function () {
        beginPlayback(shell);
      });
    }
    shell.addEventListener("dblclick", function () {
      beginPlayback(shell);
    });
  });
})();
