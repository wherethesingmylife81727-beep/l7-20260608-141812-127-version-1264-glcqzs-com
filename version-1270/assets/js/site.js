(function () {
  var body = document.body;
  var menuButton = document.querySelector('[data-mobile-menu]');

  if (menuButton) {
    menuButton.addEventListener('click', function () {
      body.classList.toggle('menu-open');
      var expanded = body.classList.contains('menu-open');
      menuButton.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  }

  var headerSearchForms = document.querySelectorAll('[data-header-search]');
  headerSearchForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      if (query) {
        window.location.href = form.getAttribute('data-search-target') + '?q=' + encodeURIComponent(query);
      }
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;
  var slideTimer = null;

  function setSlide(nextIndex) {
    if (!slides.length) {
      return;
    }
    activeSlide = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, index) {
      slide.classList.toggle('is-active', index === activeSlide);
    });
    dots.forEach(function (dot, index) {
      dot.classList.toggle('is-active', index === activeSlide);
      dot.setAttribute('aria-selected', index === activeSlide ? 'true' : 'false');
    });
  }

  function startHeroTimer() {
    if (slideTimer || slides.length < 2) {
      return;
    }
    slideTimer = window.setInterval(function () {
      setSlide(activeSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      setSlide(index);
      if (slideTimer) {
        window.clearInterval(slideTimer);
        slideTimer = null;
      }
      startHeroTimer();
    });
  });

  setSlide(0);
  startHeroTimer();

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function parseYear(value) {
    var parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function setupFilterPanel(panel) {
    var form = panel.querySelector('[data-filter-form]');
    var gridSelector = panel.getAttribute('data-filter-target');
    var grid = document.querySelector(gridSelector);
    if (!form || !grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
    var countNode = panel.querySelector('[data-result-count]');
    var emptyNode = document.querySelector(panel.getAttribute('data-empty-target'));
    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q');
    var queryInput = form.querySelector('[name="keyword"]');

    if (queryFromUrl && queryInput && !queryInput.value) {
      queryInput.value = queryFromUrl;
    }

    function applyFilters() {
      var formData = new FormData(form);
      var keyword = normalize(formData.get('keyword'));
      var genre = normalize(formData.get('genre'));
      var region = normalize(formData.get('region'));
      var sort = String(formData.get('sort') || 'year-desc');
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardGenre = normalize(card.getAttribute('data-genre'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesGenre = !genre || cardGenre.indexOf(genre) !== -1 || text.indexOf(genre) !== -1;
        var matchesRegion = !region || cardRegion.indexOf(region) !== -1;
        var isVisible = matchesKeyword && matchesGenre && matchesRegion;
        card.hidden = !isVisible;
        if (isVisible) {
          visibleCount += 1;
        }
      });

      var sorted = cards.slice().sort(function (left, right) {
        if (sort === 'year-asc') {
          return parseYear(left.getAttribute('data-year')) - parseYear(right.getAttribute('data-year'));
        }
        if (sort === 'hot-desc') {
          return parseFloat(right.getAttribute('data-hot')) - parseFloat(left.getAttribute('data-hot'));
        }
        return parseYear(right.getAttribute('data-year')) - parseYear(left.getAttribute('data-year'));
      });

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });

      if (countNode) {
        countNode.textContent = '当前显示 ' + visibleCount + ' 部影片';
      }
      if (emptyNode) {
        emptyNode.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    form.addEventListener('input', applyFilters);
    form.addEventListener('change', applyFilters);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilters();
    });
    applyFilters();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(setupFilterPanel);

  document.querySelectorAll('[data-fill-query]').forEach(function (button) {
    button.addEventListener('click', function () {
      var target = document.querySelector(button.getAttribute('data-fill-query'));
      var value = button.getAttribute('data-query') || '';
      if (target) {
        target.value = value;
        target.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  });
})();
