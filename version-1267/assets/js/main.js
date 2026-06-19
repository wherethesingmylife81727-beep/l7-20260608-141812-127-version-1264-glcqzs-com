(function () {
  const body = document.body;
  const root = body ? body.getAttribute('data-root') || './' : './';

  function joinRoot(path) {
    return root + path.replace(/^\.\//, '');
  }

  const toggle = document.querySelector('[data-nav-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dots] button'));
    let index = 0;

    function show(next) {
      if (!slides.length) return;
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  const pageSearch = document.querySelector('[data-page-search]');
  const yearFilter = document.querySelector('[data-filter-year]');
  const typeFilter = document.querySelector('[data-filter-type]');
  const cards = Array.from(document.querySelectorAll('[data-card]'));
  const empty = document.querySelector('[data-empty-state]');

  function filterCards() {
    const query = pageSearch ? pageSearch.value.trim().toLowerCase() : '';
    const year = yearFilter ? yearFilter.value : '';
    const type = typeFilter ? typeFilter.value : '';
    let visible = 0;

    cards.forEach(function (card) {
      const text = (card.getAttribute('data-search') || '').toLowerCase();
      const cardYear = card.getAttribute('data-year') || '';
      const cardType = card.getAttribute('data-type') || '';
      const matched = (!query || text.includes(query)) && (!year || cardYear === year) && (!type || cardType === type);
      card.classList.toggle('is-hidden', !matched);
      if (matched) visible += 1;
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  [pageSearch, yearFilter, typeFilter].forEach(function (el) {
    if (el) {
      el.addEventListener('input', filterCards);
      el.addEventListener('change', filterCards);
    }
  });

  const siteSearch = document.querySelector('[data-site-search]');
  const siteResults = document.querySelector('[data-site-search-results]');

  function renderResults(items) {
    if (!siteResults) return;
    if (!items.length) {
      siteResults.innerHTML = '<div class="search-item"><strong>没有找到相关影片</strong><span>请尝试其他关键词</span></div>';
      siteResults.classList.add('is-open');
      return;
    }
    siteResults.innerHTML = items.slice(0, 10).map(function (item) {
      return '<a class="search-item" href="' + joinRoot(item.link) + '">' +
        '<img src="' + joinRoot(item.cover) + '" alt="' + escapeHtml(item.title) + '">' +
        '<div><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml([item.year, item.type, item.region, item.category].filter(Boolean).join(' · ')) + '</span></div>' +
        '</a>';
    }).join('');
    siteResults.classList.add('is-open');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  if (siteSearch && siteResults && Array.isArray(window.MOVIE_SEARCH_INDEX)) {
    siteSearch.addEventListener('input', function () {
      const query = siteSearch.value.trim().toLowerCase();
      if (!query) {
        siteResults.classList.remove('is-open');
        siteResults.innerHTML = '';
        return;
      }
      const results = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        return (item.terms || item.title || '').toLowerCase().includes(query);
      });
      renderResults(results);
    });

    document.addEventListener('click', function (event) {
      if (!siteResults.contains(event.target) && event.target !== siteSearch) {
        siteResults.classList.remove('is-open');
      }
    });
  }
}());
