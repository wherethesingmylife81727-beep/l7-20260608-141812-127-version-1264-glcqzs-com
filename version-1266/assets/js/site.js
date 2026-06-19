(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var button = qs('[data-menu-toggle]');
        var menu = qs('[data-mobile-nav]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('.hero-slide', hero);
        var dots = qsa('[data-hero-dot]', hero);
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function uniqueValues(cards, name) {
        var values = [];
        cards.forEach(function (card) {
            var value = card.getAttribute(name) || '';
            if (value && values.indexOf(value) === -1) {
                values.push(value);
            }
        });
        values.sort();
        return values;
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function initCardFilters() {
        var scope = qs('[data-filter-scope]');
        if (!scope) {
            return;
        }
        var cards = qsa('.movie-card, .rank-row', scope);
        var keywordInput = qs('[data-card-filter]');
        var typeSelect = qs('[data-type-filter]');
        var regionSelect = qs('[data-region-filter]');
        var countNode = qs('[data-filter-count]');

        fillSelect(typeSelect, uniqueValues(cards, 'data-type'));
        fillSelect(regionSelect, uniqueValues(cards, 'data-region'));

        function textOf(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' ').toLowerCase();
        }

        function apply() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
            var typeValue = typeSelect ? typeSelect.value : '';
            var regionValue = regionSelect ? regionSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var matchKeyword = !keyword || textOf(card).indexOf(keyword) !== -1;
                var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
                var matchRegion = !regionValue || card.getAttribute('data-region') === regionValue;
                var matched = matchKeyword && matchType && matchRegion;
                card.classList.toggle('hidden-by-filter', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (countNode) {
                countNode.textContent = '当前显示 ' + visible + ' 条，共 ' + cards.length + ' 条';
            }
        }

        [keywordInput, typeSelect, regionSelect].forEach(function (node) {
            if (node) {
                node.addEventListener('input', apply);
                node.addEventListener('change', apply);
            }
        });

        apply();
    }

    function renderSearchCard(movie) {
        return [
            '<article class="movie-card movie-card-small">',
            '    <a class="poster-frame" href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">',
            '        <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="poster-play">▶</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <div class="movie-meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
            '        <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p>' + escapeHtml(movie.oneLine) + '</p>',
            '        <div class="tag-list"><span>' + escapeHtml(movie.genre) + '</span></div>',
            '    </div>',
            '</article>'
        ].join('
');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initSearchPage() {
        var results = qs('[data-search-results]');
        var input = qs('[data-search-input]');
        var form = qs('[data-search-form]');
        var status = qs('[data-search-status]');
        var index = window.MovieSearchIndex || [];
        if (!results || !input || !form || !index.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        input.value = initialQuery;

        function matches(movie, keyword) {
            var haystack = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
            return haystack.indexOf(keyword) !== -1;
        }

        function search(query) {
            var keyword = query.trim().toLowerCase();
            if (!keyword) {
                status.textContent = '默认展示最新更新影片，可输入关键词查找更多内容。';
                return;
            }
            var found = index.filter(function (movie) {
                return matches(movie, keyword);
            }).slice(0, 240);
            results.innerHTML = found.map(renderSearchCard).join('
');
            status.textContent = '关键词“' + query + '”找到 ' + found.length + ' 条结果，最多展示前 240 条。';
            initImageFallbacks();
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = input.value.trim();
            var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
            window.history.replaceState(null, '', url);
            search(query);
        });

        input.addEventListener('input', function () {
            search(input.value);
        });

        search(initialQuery);
    }

    function initPlayers() {
        qsa('.js-player').forEach(function (player) {
            var button = qs('.player-overlay', player);
            var video = qs('video', player);
            var url = player.getAttribute('data-video-url');
            var loaded = false;
            var hlsInstance = null;

            if (!button || !video || !url) {
                return;
            }

            function loadVideo() {
                if (loaded) {
                    return Promise.resolve();
                }
                loaded = true;

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else {
                    button.innerHTML = '<span class="play-circle">!</span><strong>当前浏览器不支持此播放源</strong><em>请更换支持 HLS 的浏览器</em>';
                    return Promise.reject(new Error('HLS not supported'));
                }
                return Promise.resolve();
            }

            button.addEventListener('click', function () {
                loadVideo().then(function () {
                    button.classList.add('hidden');
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === 'function') {
                        playPromise.catch(function () {
                            button.classList.remove('hidden');
                        });
                    }
                }).catch(function () {});
            });

            video.addEventListener('play', function () {
                button.classList.add('hidden');
            });

            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    button.classList.remove('hidden');
                }
            });

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    function initImageFallbacks() {
        qsa('img').forEach(function (img) {
            if (img.getAttribute('data-fallback-bound') === '1') {
                return;
            }
            img.setAttribute('data-fallback-bound', '1');
            img.addEventListener('error', function () {
                img.classList.add('image-missing');
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initCardFilters();
        initSearchPage();
        initPlayers();
        initImageFallbacks();
    });
})();
