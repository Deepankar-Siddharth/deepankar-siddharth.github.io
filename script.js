/**
 * Cinematic GitHub Portfolio — Data layer & UI
 * Fetches GitHub data (no auth), caches in localStorage, falls back to local data.
 * Renders: Hero orb, Repository constellation, Skills aura, Timeline.
 * Change GITHUB_USERNAME in one place to use your profile.
 */
(function () {
  'use strict';

  // ——— Config (change username here) ———
  const GITHUB_USERNAME = 'deepankar-sidharth';
  const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
  const CACHE_KEYS = {
    user: 'github_user_' + GITHUB_USERNAME,
    repos: 'github_repos_' + GITHUB_USERNAME,
    ts: 'github_cache_ts'
  };

  // GitHub language colors (fallback for unknown)
  const LANGUAGE_COLORS = {
    JavaScript: '#f7df1e',
    TypeScript: '#3178c6',
    Python: '#3776ab',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Vue: '#41b883',
    Java: '#b07219',
    'C#': '#239120',
    Ruby: '#701516',
    Go: '#00add8',
    Rust: '#dea584',
    PHP: '#4f5d95',
    'C++': '#f34b7d',
    Kotlin: '#a97bff',
    Swift: '#f05138',
    Shell: '#89e051',
    SCSS: '#c6538c',
    Lua: '#000080'
  };
  const DEFAULT_LANG_COLOR = '#8b949e';

  // ——— Cache helpers ———
  function getCached(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function setCache(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem(CACHE_KEYS.ts, String(Date.now()));
    } catch (e) {}
  }

  function isCacheStale() {
    var ts = localStorage.getItem(CACHE_KEYS.ts);
    if (!ts) return true;
    return Date.now() - parseInt(ts, 10) > CACHE_TTL_MS;
  }

  // ——— GitHub API (public, no auth) ———
  function fetchUser() {
    return fetch('https://api.github.com/users/' + encodeURIComponent(GITHUB_USERNAME), {
      headers: { Accept: 'application/vnd.github.v3+json' }
    })
      .then(function (res) {
        if (!res.ok) throw new Error('User fetch failed');
        return res.json();
      })
      .catch(function () { return null; });
  }

  function fetchRepos() {
    return fetch('https://api.github.com/users/' + encodeURIComponent(GITHUB_USERNAME) + '/repos?per_page=100&sort=updated', {
      headers: { Accept: 'application/vnd.github.v3+json' }
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Repos fetch failed');
        return res.json();
      })
      .catch(function () { return null; });
  }

  function aggregateLanguagesFromRepos(repos) {
    if (!repos || !repos.length) return [];
    var countByLang = {};
    repos.forEach(function (r) {
      var lang = r.language || 'Other';
      countByLang[lang] = (countByLang[lang] || 0) + 1;
    });
    var total = repos.length;
    return Object.keys(countByLang)
      .map(function (name) {
        var count = countByLang[name];
        return {
          name: name,
          count: count,
          bytes: count * 10000,
          color: LANGUAGE_COLORS[name] || DEFAULT_LANG_COLOR
        };
      })
      .sort(function (a, b) { return b.count - a.count; });
  }

  // ——— Data strategy: API → cache → fallback ———
  function getData() {
    return Promise.all([fetchUser(), fetchRepos()]).then(function (results) {
      var user = results[0];
      var repos = results[1];
      if (user && repos && Array.isArray(repos)) {
        setCache(CACHE_KEYS.user, user);
        setCache(CACHE_KEYS.repos, repos);
        return {
          user: user,
          repos: repos,
          languages: aggregateLanguagesFromRepos(repos),
          source: 'api'
        };
      }
      user = getCached(CACHE_KEYS.user);
      repos = getCached(CACHE_KEYS.repos);
      if (user && repos && Array.isArray(repos)) {
        return {
          user: user,
          repos: repos,
          languages: aggregateLanguagesFromRepos(repos),
          source: 'cache'
        };
      }
      var fallback = typeof FALLBACK_DATA !== 'undefined' ? FALLBACK_DATA : { user: {}, repos: [], languages: [] };
      return {
        user: fallback.user || {},
        repos: fallback.repos || [],
        languages: fallback.languages && fallback.languages.length ? fallback.languages : aggregateLanguagesFromRepos(fallback.repos || []),
        source: fallback.source || 'fallback'
      };
    });
  }

  // ——— DOM refs (set after DOM ready) ———
  var heroOrb, heroName, heroBio, heroStats, heroSkeleton, heroContent;
  var constellationEl, projectsSkeleton;
  var skillsAuraEl, skillsSkeleton;
  var timelineEl, timelineSkeleton;
  var snapshotIndicator;

  function getEl(id) { return document.getElementById(id); }
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsAll(sel, ctx) { return (ctx || document).querySelectorAll(sel); }

  // ——— Hero: orb, name, bio, stats ———
  function renderHero(data) {
    var user = data.user;
    if (!heroContent || !heroSkeleton) return;
    heroSkeleton.classList.add('hidden');
    heroContent.classList.remove('hidden');

    var name = (user.name || user.login || 'Developer').trim();
    var bio = (user.bio || '').trim();
    var avatarUrl = user.avatar_url;
    var profileUrl = user.html_url || 'https://github.com/' + GITHUB_USERNAME;

    if (heroOrb) {
      heroOrb.classList.add('hero-orb--pulse');
      if (avatarUrl) {
        heroOrb.style.backgroundImage = 'url(' + avatarUrl + ')';
        heroOrb.style.backgroundSize = 'cover';
        heroOrb.style.backgroundPosition = 'center';
      } else {
        heroOrb.style.background = 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))';
      }
    }
    if (heroName) heroName.textContent = name;
    if (heroBio) heroBio.textContent = bio || 'Building, learning, shipping.';
    if (heroStats) {
      var repos = user.public_repos != null ? user.public_repos : 0;
      var followers = user.followers != null ? user.followers : 0;
      var stars = (data.repos || []).reduce(function (s, r) { return s + (r.stargazers_count || 0); }, 0);
      heroStats.innerHTML =
        '<span class="hero-stat"><strong>' + repos + '</strong> repos</span>' +
        '<span class="hero-stat"><strong>' + followers + '</strong> followers</span>' +
        '<span class="hero-stat"><strong>' + stars + '</strong> stars</span>';
    }
    var btnGitHub = qs('.hero-cta .btn-primary');
    if (btnGitHub) btnGitHub.href = profileUrl;
  }

  // ——— Projects: constellation of stars ———
  function filterRepos(repos) {
    return (repos || [])
      .filter(function (r) { return !r.fork && (r.description || (r.stargazers_count || 0) > 0); })
      .sort(function (a, b) {
        var da = new Date(a.updated_at || 0).getTime();
        var db = new Date(b.updated_at || 0).getTime();
        return db - da;
      })
      .slice(0, 12);
  }

  function starSize(stars) {
    if (stars >= 10) return 28;
    if (stars >= 5) return 22;
    if (stars >= 1) return 18;
    return 14;
  }

  function recentGlow(updatedAt) {
    var days = (Date.now() - new Date(updatedAt).getTime()) / (24 * 60 * 60 * 1000);
    if (days <= 7) return 1;
    if (days <= 30) return 0.8;
    if (days <= 90) return 0.6;
    return 0.4;
  }

  function renderProjects(data) {
    var repos = filterRepos(data.repos);
    if (!constellationEl || !projectsSkeleton) return;
    projectsSkeleton.classList.add('hidden');
    constellationEl.classList.remove('hidden');

    constellationEl.innerHTML = '';
    repos.forEach(function (r, i) {
      var color = (r.language && (LANGUAGE_COLORS[r.language] || DEFAULT_LANG_COLOR)) || DEFAULT_LANG_COLOR;
      var size = starSize(r.stargazers_count || 0);
      var opacity = recentGlow(r.updated_at || r.created_at);
      var star = document.createElement('a');
      star.href = r.html_url || ('https://github.com/' + GITHUB_USERNAME + '/' + r.name);
      star.target = '_blank';
      star.rel = 'noopener noreferrer';
      star.className = 'constellation-star';
      star.setAttribute('style',
        '--star-size: ' + size + 'px; --star-color: ' + color + '; --star-glow: ' + opacity + ';' +
        ' --star-x: ' + (15 + Math.random() * 70) + '%; --star-y: ' + (10 + Math.random() * 80) + '%;' +
        ' animation-delay: ' + (i * 0.08) + 's;');
      star.setAttribute('aria-label', r.name + ' – ' + (r.description || 'Repository'));
      star.innerHTML =
        '<span class="constellation-star-inner"></span>' +
        '<span class="constellation-star-tooltip">' +
        '<strong>' + (r.name || '').replace(/</g, '&lt;') + '</strong>' +
        (r.description ? '<em>' + (r.description || '').substring(0, 80).replace(/</g, '&lt;') + (r.description.length > 80 ? '…' : '') + '</em>' : '') +
        '<small>' + (r.stargazers_count || 0) + ' ★ · ' + (r.language || '') + '</small>' +
        '</span>';
      constellationEl.appendChild(star);
    });
  }

  // ——— Skills: bars from languages ———
  function langValue(l) {
    if (l.count != null) return l.count;
    if (l.bytes) return Math.round(l.bytes / 10000);
    return 0;
  }

  function renderSkills(data) {
    var languages = data.languages || [];
    if (!skillsAuraEl || !skillsSkeleton) return;
    skillsSkeleton.classList.add('hidden');
    skillsAuraEl.classList.remove('hidden');
    skillsAuraEl.innerHTML = '';

    var maxVal = Math.max.apply(null, languages.map(langValue)) || 1;
    languages.forEach(function (lang, i) {
      var val = langValue(lang);
      var pct = Math.max(8, (val / maxVal) * 100);
      var bar = document.createElement('div');
      bar.className = 'skill-bar-wrap';
      bar.setAttribute('style', 'animation-delay: ' + (i * 0.06) + 's;');
      bar.innerHTML =
        '<span class="skill-bar-label">' + (lang.name || '').replace(/</g, '&lt;') + '</span>' +
        '<div class="skill-bar"><span class="skill-bar-fill" style="width:' + pct + '%; background-color:' + (lang.color || DEFAULT_LANG_COLOR) + ';"></span></div>';
      skillsAuraEl.appendChild(bar);
    });
  }

  // ——— Timeline: recent activity (repo updates) ———
  function renderTimeline(data) {
    var repos = (data.repos || [])
      .filter(function (r) { return !r.fork; })
      .sort(function (a, b) { return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(); })
      .slice(0, 6);
    if (!timelineEl || !timelineSkeleton) return;
    timelineSkeleton.classList.add('hidden');
    timelineEl.classList.remove('hidden');
    timelineEl.innerHTML = '';

    repos.forEach(function (r, i) {
      var date = r.updated_at ? new Date(r.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric', day: 'numeric' }) : '';
      var item = document.createElement('a');
      item.href = r.html_url || ('https://github.com/' + GITHUB_USERNAME + '/' + r.name);
      item.target = '_blank';
      item.rel = 'noopener noreferrer';
      item.className = 'timeline-item';
      item.setAttribute('style', 'animation-delay: ' + (i * 0.08) + 's;');
      item.innerHTML =
        '<span class="timeline-dot"></span>' +
        '<span class="timeline-content">' +
        '<strong>' + (r.name || '').replace(/</g, '&lt;') + '</strong>' +
        '<em>' + (date || '').replace(/</g, '&lt;') + '</em>' +
        '</span>';
      timelineEl.appendChild(item);
    });
  }

  // ——— Snapshot indicator ———
  function showSnapshot(source) {
    if (source === 'api' || !snapshotIndicator) return;
    snapshotIndicator.classList.remove('hidden');
    snapshotIndicator.setAttribute('aria-label', 'Viewing cached or fallback data');
  }

  // ——— Mouse parallax on hero ———
  function initMouseParallax() {
    var hero = qs('.hero');
    if (!hero || !heroOrb) return;
    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      heroOrb.style.transform = 'translate(-50%,-50%) translate(' + (x * 12) + 'px,' + (y * 12) + 'px)';
    });
    hero.addEventListener('mouseleave', function () {
      heroOrb.style.transform = 'translate(-50%, -50%)';
    });
  }

  // ——— Init: resolve data then render all ———
  function init() {
    heroOrb = qs('.hero-orb');
    heroName = qs('.hero-name');
    heroBio = qs('.hero-bio');
    heroStats = qs('.hero-stats');
    heroSkeleton = qs('.hero-skeleton');
    heroContent = qs('.hero-content-inner');
    constellationEl = qs('.constellation');
    projectsSkeleton = qs('.projects-skeleton');
    skillsAuraEl = qs('.skills-aura');
    skillsSkeleton = qs('.skills-skeleton');
    timelineEl = qs('.timeline-list');
    timelineSkeleton = qs('.timeline-skeleton');
    snapshotIndicator = qs('.snapshot-indicator');

    var yearEl = getEl('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    var navToggle = qs('.nav-toggle');
    var navLinks = qs('.nav-links');
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', function () {
        var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isOpen);
        navLinks.classList.toggle('is-open');
        document.body.style.overflow = isOpen ? '' : 'hidden';
      });
      qsAll('.nav-links a').forEach(function (link) {
        link.addEventListener('click', function () {
          navToggle.setAttribute('aria-expanded', 'false');
          navLinks.classList.remove('is-open');
          document.body.style.overflow = '';
        });
      });
    }

    getData().then(function (data) {
      renderHero(data);
      renderProjects(data);
      renderSkills(data);
      renderTimeline(data);
      showSnapshot(data.source);
      initMouseParallax();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
