(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');
    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var showSlide = function (index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide((current + 1) % slides.length);
            }, 5600);
        }
    }

    var normalize = function (value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    };

    var filterInput = document.querySelector('[data-filter-input]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var resetButton = document.querySelector('[data-filter-reset]');
    var filterList = document.querySelector('[data-filter-list]');
    var emptyState = document.querySelector('[data-empty-state]');

    var queryValue = '';
    try {
        queryValue = new URLSearchParams(window.location.search).get('q') || '';
    } catch (error) {
        queryValue = '';
    }

    if (filterInput && queryValue) {
        filterInput.value = queryValue;
    }

    var applyFilter = function () {
        if (!filterList) {
            return;
        }
        var keyword = normalize(filterInput ? filterInput.value : '');
        var year = normalize(yearFilter ? yearFilter.value : '');
        var type = normalize(typeFilter ? typeFilter.value : '');
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-movie-card]'));
        var visible = 0;
        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-year')
            ].join(' '));
            var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
            var matchType = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1 || normalize(card.getAttribute('data-tags')).indexOf(type) !== -1;
            var show = matchKeyword && matchYear && matchType;
            card.hidden = !show;
            if (show) {
                visible += 1;
            }
        });
        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    };

    [filterInput, yearFilter, typeFilter].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilter);
            control.addEventListener('change', applyFilter);
        }
    });

    if (resetButton) {
        resetButton.addEventListener('click', function () {
            if (filterInput) {
                filterInput.value = '';
            }
            if (yearFilter) {
                yearFilter.value = '';
            }
            if (typeFilter) {
                typeFilter.value = '';
            }
            applyFilter();
        });
    }

    applyFilter();

    var startPlayer = function (shell) {
        if (!shell || shell.getAttribute('data-ready') === '1') {
            var activeVideo = shell ? shell.querySelector('video') : null;
            if (activeVideo) {
                activeVideo.play().catch(function () {});
            }
            return;
        }
        var video = shell.querySelector('video');
        var stream = shell.getAttribute('data-stream');
        if (!video || !stream) {
            return;
        }
        shell.setAttribute('data-ready', '1');
        shell.classList.add('is-playing');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            video.play().catch(function () {});
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                maxBufferLength: 32,
                enableWorker: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }
        video.src = stream;
        video.play().catch(function () {});
    };

    Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
        var button = shell.querySelector('.play-overlay');
        var video = shell.querySelector('video');
        if (button) {
            button.addEventListener('click', function () {
                startPlayer(shell);
            });
        }
        if (video) {
            video.addEventListener('click', function () {
                if (shell.getAttribute('data-ready') !== '1') {
                    startPlayer(shell);
                }
            });
        }
    });
})();
