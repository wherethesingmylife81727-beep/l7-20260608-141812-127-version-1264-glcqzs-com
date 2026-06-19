(function () {
  var mobileButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var searchPanel = document.querySelector('[data-global-search]');
  var searchToggle = document.querySelector('[data-search-toggle]');
  var searchClose = document.querySelector('[data-search-close]');
  var searchInput = document.querySelector('[data-global-search-input]');
  var searchResults = document.querySelector('[data-global-search-results]');
  var searchPageLink = document.querySelector('[data-search-page-link]');
  var cloneInput = document.querySelector('[data-global-search-input-clone]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function getPrefix() {
    var path = window.location.pathname;
    if (path.indexOf('/movie/') !== -1 || path.indexOf('/category/') !== -1) {
      return '../';
    }
    return '';
  }

  function renderSearchResults(query) {
    if (!searchResults || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var keyword = normalize(query);
    if (!keyword) {
      searchResults.innerHTML = '';
      return;
    }

    var prefix = getPrefix();
    var results = window.MOVIE_SEARCH_INDEX
      .filter(function (movie) {
        return normalize(movie.search).indexOf(keyword) !== -1;
      })
      .slice(0, 12);

    if (searchPageLink) {
      searchPageLink.href = prefix + 'search.html?q=' + encodeURIComponent(query);
    }

    if (!results.length) {
      searchResults.innerHTML = '<p class="empty-state">没有找到相关影片。</p>';
      return;
    }

    searchResults.innerHTML = results.map(function (movie) {
      return [
        '<a class="global-search-result" href="' + prefix + movie.url + '">',
        '  <img src="' + prefix + movie.cover + '" alt="' + escapeHtml(movie.title) + '" onerror="this.style.opacity=\'0\';">',
        '  <span><strong>' + escapeHtml(movie.title) + '</strong><span>' + escapeHtml(movie.meta) + '</span></span>',
        '  <em>观看</em>',
        '</a>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function openSearchPanel() {
    if (searchPanel) {
      searchPanel.classList.add('is-open');
    }
    if (searchInput) {
      searchInput.focus();
    }
  }

  if (searchToggle) {
    searchToggle.addEventListener('click', openSearchPanel);
  }

  if (searchClose && searchPanel) {
    searchClose.addEventListener('click', function () {
      searchPanel.classList.remove('is-open');
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      renderSearchResults(searchInput.value);
    });

    searchInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        var prefix = getPrefix();
        window.location.href = prefix + 'search.html?q=' + encodeURIComponent(searchInput.value);
      }
    });
  }

  if (cloneInput) {
    cloneInput.addEventListener('focus', openSearchPanel);
    cloneInput.addEventListener('input', function () {
      openSearchPanel();
      if (searchInput) {
        searchInput.value = cloneInput.value;
      }
      renderSearchResults(cloneInput.value);
    });
  }

  var hero = document.querySelector('[data-hero-slider]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prevButton = hero.querySelector('[data-hero-prev]');
    var nextButton = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    startTimer();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var filterInput = filterPanel.querySelector('[data-page-filter-input]');
    var filterSelects = Array.prototype.slice.call(filterPanel.querySelectorAll('[data-page-filter-select]'));
    var filterCount = filterPanel.querySelector('[data-filter-count]');
    var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var filterEmpty = document.querySelector('[data-filter-empty]');

    function applyPageFilter() {
      var keyword = normalize(filterInput ? filterInput.value : '');
      var selected = {};
      filterSelects.forEach(function (select) {
        selected[select.getAttribute('data-page-filter-select')] = normalize(select.value);
      });

      var visible = 0;
      filterCards.forEach(function (card) {
        var textMatches = !keyword || normalize(card.getAttribute('data-search')).indexOf(keyword) !== -1;
        var yearMatches = !selected.year || normalize(card.getAttribute('data-year')) === selected.year;
        var regionMatches = !selected.region || normalize(card.getAttribute('data-region')) === selected.region;
        var typeMatches = !selected.type || normalize(card.getAttribute('data-type')) === selected.type;
        var isVisible = textMatches && yearMatches && regionMatches && typeMatches;
        card.classList.toggle('is-hidden', !isVisible);
        if (isVisible) {
          visible += 1;
        }
      });

      if (filterCount) {
        filterCount.textContent = '筛选结果 ' + visible + ' 部影片';
      }
      if (filterEmpty) {
        filterEmpty.hidden = visible !== 0;
      }
    }

    if (filterInput) {
      filterInput.addEventListener('input', applyPageFilter);
    }
    filterSelects.forEach(function (select) {
      select.addEventListener('change', applyPageFilter);
    });
  }

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage) {
    var pageInput = searchPage.querySelector('[data-search-page-input]');
    var pageButton = searchPage.querySelector('[data-search-page-button]');
    var pageResults = searchPage.querySelector('[data-search-page-results]');
    var pageSummary = searchPage.querySelector('[data-search-page-summary]');
    var params = new URLSearchParams(window.location.search);

    function runSearchPage() {
      if (!pageInput || !pageResults || !window.MOVIE_SEARCH_INDEX) {
        return;
      }
      var query = pageInput.value.trim();
      var keyword = normalize(query);
      if (!keyword) {
        pageResults.innerHTML = '';
        if (pageSummary) {
          pageSummary.textContent = '请输入关键词开始搜索。';
        }
        return;
      }

      var results = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        return normalize(movie.search).indexOf(keyword) !== -1;
      });

      if (pageSummary) {
        pageSummary.textContent = '找到 ' + results.length + ' 部相关影片。';
      }

      pageResults.innerHTML = results.slice(0, 200).map(function (movie) {
        return [
          '<article class="movie-card movie-card--compact">',
          '  <a class="movie-card__cover" href="' + movie.url + '">',
          '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.opacity=\'0\';">',
          '    <span class="movie-card__badge">' + escapeHtml(movie.category) + '</span>',
          '    <span class="movie-card__play">▶</span>',
          '  </a>',
          '  <div class="movie-card__body">',
          '    <h3 class="movie-card__title"><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
          '    <p class="movie-card__meta">' + escapeHtml(movie.meta) + '</p>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');
    }

    if (pageInput) {
      pageInput.value = params.get('q') || '';
      pageInput.addEventListener('input', runSearchPage);
      pageInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          runSearchPage();
        }
      });
    }
    if (pageButton) {
      pageButton.addEventListener('click', runSearchPage);
    }
    runSearchPage();
  }
}());
