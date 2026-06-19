(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
      document.body.classList.toggle('has-open-menu', mobileMenu.classList.contains('is-open'));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-target]'));
  var activeSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  function startHeroTimer() {
    if (!slides.length) {
      return;
    }

    heroTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
      if (heroTimer) {
        window.clearInterval(heroTimer);
      }
      startHeroTimer();
    });
  });

  showSlide(0);
  startHeroTimer();

  var keywordInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-keyword]'));
  var yearSelect = document.querySelector('[data-filter-year]');
  var categorySelect = document.querySelector('[data-filter-category]');
  var resetButton = document.querySelector('[data-filter-reset]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function getKeyword() {
    var input = keywordInputs[0];
    return input ? input.value.trim().toLowerCase() : '';
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var keyword = getKeyword();
    var year = yearSelect ? yearSelect.value : '';
    var category = categorySelect ? categorySelect.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var cardCategory = card.getAttribute('data-category') || '';
      var matched = true;

      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      if (category && cardCategory !== category) {
        matched = false;
      }

      card.classList.toggle('is-hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  keywordInputs.forEach(function (input) {
    input.addEventListener('input', applyFilters);
  });

  if (yearSelect) {
    yearSelect.addEventListener('change', applyFilters);
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', applyFilters);
  }

  if (resetButton) {
    resetButton.addEventListener('click', function () {
      keywordInputs.forEach(function (input) {
        input.value = '';
      });

      if (yearSelect) {
        yearSelect.value = '';
      }

      if (categorySelect) {
        categorySelect.value = '';
      }

      applyFilters();
    });
  }

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');

  if (q && keywordInputs.length) {
    keywordInputs.forEach(function (input) {
      input.value = q;
    });
    applyFilters();
  } else {
    applyFilters();
  }
})();
