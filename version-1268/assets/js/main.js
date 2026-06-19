(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-target]'));
  var heroIndex = 0;

  function setHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      setHero(Number(dot.getAttribute('data-hero-target')) || 0);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      setHero(heroIndex + 1);
    }, 5200);
  }

  var input = document.querySelector('.js-filter-input');
  var region = document.querySelector('.js-region-filter');
  var type = document.querySelector('.js-type-filter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.js-filter-list .movie-card'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter() {
    var keyword = normalize(input && input.value);
    var regionValue = normalize(region && region.value);
    var typeValue = normalize(type && type.value);

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var cardType = normalize(card.getAttribute('data-type'));
      var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchedRegion = !regionValue || cardRegion === regionValue;
      var matchedType = !typeValue || cardType === typeValue;
      card.classList.toggle('is-hidden', !(matchedKeyword && matchedRegion && matchedType));
    });
  }

  [input, region, type].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    }
  });
})();
