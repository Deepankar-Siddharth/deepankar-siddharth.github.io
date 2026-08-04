/**
 * ============================================================================
 * Deepankar Siddharth — Developer Portfolio
 * ============================================================================
 * Vanilla JS, GitHub-powered. No frameworks, no build step.
 *
 * Architecture:
 *  1. DATA LAYER — GitHub REST API (public, no auth) with 1-hour localStorage
 *     cache and a verified fallback snapshot. UI never breaks if the API fails.
 *  2. CURATED CONTENT — Stack, featured projects and the Journey sections are
 *     authored directly from verified GitHub evidence so the portfolio is
 *     always meaningful even offline.
 *  3. LIVE ENRICHMENT — Metrics, language distribution and recent activity are
 *     computed from live repo data and refresh the featured project cards.
 *
 * Data source order: API -> cache -> fallback. The GitHub shell's status
 * indicator reflects which source is in use (LIVE / CACHED / SNAPSHOT).
 * ============================================================================
 */

(function () {
  'use strict';

  var GITHUB_USERNAME = 'deepankar-siddharth';
  var CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
  var CACHE_KEYS = {
    user: 'github_user_' + GITHUB_USERNAME,
    repos: 'github_repos_' + GITHUB_USERNAME,
    ts: 'github_cache_ts'
  };
  var REDUCED_MOTION = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // GitHub primary-language colors (verified palette)
  var LANG_COLOR = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Kotlin: '#a97bff',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    Shell: '#89e051',
    Batchfile: '#C1F12E',
    PowerShell: '#012456',
    Java: '#b07219',
    'C++': '#f34b7d',
    Go: '#00add8',
    Ruby: '#701516',
    PHP: '#4f5d95',
    Jupyter: '#DA5B0B'
  };
  var DEFAULT_COLOR = '#8b949e';

  // ————————————————————————————————————————————————————————————————
  // CURATED CONTENT (verified from GitHub evidence)
  // ————————————————————————————————————————————————————————————————

  var STACK = [
    { group: 'Languages', items: ['Python', 'JavaScript', 'Kotlin', 'Shell / Bash', 'HTML', 'CSS', 'PowerShell', 'Batchfile'] },
    { group: 'Frontend', items: ['React.js', 'HTML5', 'CSS3', 'JavaScript (ES6+)'] },
    { group: 'Backend', items: ['Node.js', 'Express', 'Python'] },
    { group: 'Databases', items: ['MySQL', 'SQLite (Room)', 'SQLCipher'] },
    { group: 'Android', items: ['Kotlin', 'Jetpack Compose', 'Room', 'Hilt', 'WorkManager', 'Material 3'] },
    { group: 'DevOps & Automation', items: ['GitHub Actions', 'ngrok', 'Shell scripting', 'VPS provisioning'] },
    { group: 'Tools & Platforms', items: ['Git', 'GitHub', 'Android Studio', 'Gradle', 'Termux'] }
  ];

  // Where each capability is evidenced in public repositories.
  var STACK_USED = {
    'Python': 'darkzino_superuser',
    'JavaScript': 'event-sphere',
    'Kotlin': 'instant-ledger',
    'Shell / Bash': 'terminal_package_collection',
    'HTML': 'darkzino-websites',
    'CSS': 'darkzino_onion',
    'PowerShell': 'Img',
    'Batchfile': 'Temp-RDP',
    'React.js': 'event-sphere',
    'HTML5': 'darkzino-websites',
    'CSS3': 'darkzino_onion',
    'JavaScript (ES6+)': 'event-sphere',
    'Node.js': 'event-sphere',
    'Express': 'event-sphere',
    'MySQL': 'event-sphere',
    'SQLite (Room)': 'instant-ledger',
    'SQLCipher': 'instant-ledger',
    'Jetpack Compose': 'instant-ledger',
    'Room': 'instant-ledger',
    'Hilt': 'instant-ledger',
    'WorkManager': 'instant-ledger',
    'Material 3': 'instant-ledger',
    'GitHub Actions': 'Temp-RDP',
    'ngrok': 'Temp-RDP',
    'Shell scripting': 'terminal_package_collection',
    'VPS provisioning': 'Temp-RDP',
    'Git': 'all repos',
    'GitHub': 'all repos',
    'Android Studio': 'instant-ledger',
    'Gradle': 'instant-ledger',
    'Termux': 'terminal_package_collection'
  };

  var FEATURED_PROJECTS = [
    {
      repo: 'instant-ledger',
      title: 'Instant Ledger',
      category: 'Android',
      description: 'Privacy-first, offline-only finance ledger for Android that captures transactions automatically from bank SMS and protects them on-device with SQLCipher encryption and biometric lock.',
      stack: ['Kotlin', 'Jetpack Compose', 'Room', 'SQLCipher', 'Hilt', 'WorkManager'],
      status: 'Active',
      statusType: 'active'
    },
    {
      repo: 'Temp-RDP',
      title: 'Temp-RDP',
      category: 'Automation',
      description: 'On-demand ephemeral Windows RDP environments provisioned through GitHub Actions with ngrok tunneling — infrastructure automation for testing and development.',
      stack: ['GitHub Actions', 'Shell / Batch', 'ngrok'],
      status: 'Active',
      statusType: 'active'
    },
    {
      repo: 'event-sphere',
      title: 'Event Sphere',
      category: 'Web',
      description: 'Full-stack event management system handling booking, employee and package management, with JWT-authenticated React and Node.js/Express backed by MySQL.',
      stack: ['React', 'Node.js', 'Express', 'MySQL', 'JWT'],
      status: 'Experimental',
      statusType: 'active'
    },
    {
      repo: 'terminal_package_collection',
      title: 'Terminal Package Collection',
      category: 'Automation',
      description: 'A curated Termux server-bootstrap toolkit — scripts and configuration templates for zero-touch provisioning of new environments.',
      stack: ['Shell', 'Termux', 'Bash'],
      status: 'Maintained',
      statusType: 'active'
    },
    {
      repo: 'DarkZino_SuperUser',
      title: 'DarkZino SuperUser',
      category: 'Python',
      description: 'A Python Telegram userbot built on the Telethon library with a pluggable plugin structure — an early exercise in Python automation and bot development.',
      stack: ['Python', 'Telethon', 'Pyrogram'],
      status: 'Inactive',
      statusType: 'archived'
    }
  ];

  var JOURNEY = [
    { year: '2020', title: 'First steps in the terminal', text: 'Created the Terminal Package Collection, a Termux server-bootstrap toolkit that set the recurring automation theme.' },
    { year: '2021', title: 'Python and bots', text: 'Built DarkZino SuperUser, a Python Telegram userbot on Telethon, alongside early web experiments.' },
    { year: '2022', title: 'Automating infrastructure', text: 'Shipped Temp-RDP: ephemeral Windows RDP provisioning driven by GitHub Actions and ngrok tunneling.' },
    { year: '2023', title: 'System tooling', text: 'Explored PowerShell scripts and dark-themed static web projects.' },
    { year: '2025', title: 'Full-stack and Android', text: 'Built Event Sphere (React/Node/MySQL) and started Instant Ledger (Kotlin/Compose/Room), a shift toward complete products.' },
    { year: '2026', title: 'Shipping and focus', text: 'Continuing active development on Instant Ledger and Temp-RDP.' }
  ];

  var TERMINAL_WHOAMI = 'whoami';
  var TERMINAL_ROLES = ['developer', 'automation', 'android', 'open-source'];

  // Keywords shown in the decorative scrolling ticker band.
  var TICKER = ['Kotlin', 'React', 'JavaScript', 'Python', 'Node.js', 'Express', 'MySQL', 'Room', 'SQLCipher', 'Compose', 'GitHub Actions', 'Termux', 'ngrok', 'PowerShell', 'Batchfile', 'Shell'];

  // ————————————————————————————————————————————————————————————————
  // CACHE LAYER
  // ————————————————————————————————————————————————————————————————

  function getCache(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function setCache(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem(CACHE_KEYS.ts, String(Date.now()));
    } catch (e) {}
  }
  function isStale() {
    var ts = localStorage.getItem(CACHE_KEYS.ts);
    return !ts || Date.now() - parseInt(ts, 10) > CACHE_TTL_MS;
  }

  // ————————————————————————————————————————————————————————————————
  // GITHUB API
  // ————————————————————————————————————————————————————————————————

  function fetchUser() {
    return fetch('https://api.github.com/users/' + encodeURIComponent(GITHUB_USERNAME))
      .then(function (res) { return res.ok ? res.json() : null; })
      .catch(function () { return null; });
  }
  function fetchRepos() {
    return fetch('https://api.github.com/users/' + encodeURIComponent(GITHUB_USERNAME) + '/repos?per_page=100&sort=updated')
      .then(function (res) { return res.ok ? res.json() : null; })
      .catch(function () { return null; });
  }

  function aggregateLanguages(repos) {
    if (!Array.isArray(repos) || !repos.length) return [];
    var count = {};
    repos.forEach(function (r) {
      var lang = r.language || 'Other';
      count[lang] = (count[lang] || 0) + 1;
    });
    var total = repos.length;
    return Object.keys(count)
      .map(function (name) {
        return {
          name: name,
          count: count[name],
          bytes: count[name] * 10000,
          color: LANG_COLOR[name] || DEFAULT_COLOR
        };
      })
      .sort(function (a, b) { return b.count - a.count; });
  }

  function getData() {
    return Promise.all([fetchUser(), fetchRepos()]).then(function (results) {
      var user = results[0];
      var repos = results[1];
      if (user && Array.isArray(repos) && repos.length) {
        setCache(CACHE_KEYS.user, user);
        setCache(CACHE_KEYS.repos, repos);
        return { user: user, repos: repos, languages: aggregateLanguages(repos), source: 'live' };
      }
      user = getCache(CACHE_KEYS.user);
      var cachedRepos = getCache(CACHE_KEYS.repos);
      if (user && Array.isArray(cachedRepos)) {
        return { user: user, repos: cachedRepos, languages: aggregateLanguages(cachedRepos), source: 'cache' };
      }
      var fb = typeof FALLBACK_DATA !== 'undefined' ? FALLBACK_DATA : { user: {}, repos: [] };
      return {
        user: fb.user || {},
        repos: fb.repos || [],
        languages: (fb.languages && fb.languages.length) ? fb.languages : aggregateLanguages(fb.repos),
        source: 'fallback'
      };
    });
  }

  // ————————————————————————————————————————————————————————————————
  // DOM HELPERS
  // ————————————————————————————————————————————————————————————————

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', day: 'numeric' });
  }

  // Deterministic pseudo-hash so the git log looks real without inventing data.
  function pseudoHash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h.toString(16).slice(0, 7).padStart(7, '0');
  }

  // ————————————————————————————————————————————————————————————————
  // REVEAL OBSERVER
  // ————————————————————————————————————————————————————————————————

  var revealObserver = null;
  function getRevealObserver() {
    if (revealObserver) return revealObserver;
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.classList.contains('lang-row')) {
          el.classList.add('is-in');
        } else {
          el.classList.add('is-revealed');
        }
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    return revealObserver;
  }
  function observeReveal(el) {
    getRevealObserver().observe(el);
  }

  // Attach reveal to static blocks (added once).
  function armStaticReveals() {
    var selectors = [
      '.hero-grid',
      '.section-header',
      '.about-grid',
      '.contact-links',
      '.project-filters'
    ];
    selectors.forEach(function (sel) {
      $$(sel).forEach(function (el) {
        if (!el.hasAttribute('data-reveal')) {
          el.setAttribute('data-reveal', '');
          observeReveal(el);
        }
      });
    });
    // Elements that already carry data-reveal in the markup.
    $$('[data-reveal]').forEach(observeReveal);
  }

  // ————————————————————————————————————————————————————————————————
  // COUNT-UP
  // ————————————————————————————————————————————————————————————————

  function animateValue(el, target, opts) {
    opts = opts || {};
    var duration = opts.duration || 900;
    var start = opts.start || 0;
    if (REDUCED_MOTION) {
      el.textContent = String(target);
      return;
    }
    var startTime = null;
    function frame(ts) {
      if (startTime === null) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(start + (target - start) * eased);
      el.textContent = current.toLocaleString('en-US');
      if (progress < 1) {
        window.requestAnimationFrame(frame);
      } else {
        el.textContent = target.toLocaleString('en-US');
      }
    }
    window.requestAnimationFrame(frame);
  }

  // ————————————————————————————————————————————————————————————————
  // RENDERERS — HERO
  // ————————————————————————————————————————————————————————————————

  function renderHeroMetrics(data) {
    var user = data.user || {};
    var repos = data.repos || [];
    var stars = repos.reduce(function (s, r) { return s + (r.stargazers_count || 0); }, 0);
    var forks = repos.reduce(function (s, r) { return s + (r.forks_count || 0); }, 0);
    var followers = user.followers != null ? user.followers : 0;
    var repoCount = user.public_repos != null ? user.public_repos : repos.length;

    var cells = [
      { id: 'hm-repos', value: repoCount },
      { id: 'hm-stars', value: stars },
      { id: 'hm-forks', value: forks },
      { id: 'hm-followers', value: followers }
    ];
    cells.forEach(function (cell) {
      var el = document.getElementById(cell.id);
      if (el) animateValue(el, cell.value);
    });
  }

  function renderTerminal() {
    var cmd = document.getElementById('term-cmd');
    var output = document.getElementById('term-output');
    var status = document.getElementById('term-status');
    var windowEl = document.getElementById('term-window');
    if (!cmd || !output) return;

    function setStatus(text) { if (status) status.textContent = text; }

    if (REDUCED_MOTION) {
      cmd.textContent = TERMINAL_WHOAMI;
      output.innerHTML = TERMINAL_ROLES.map(function (r) {
        return '<div class="terminal-output-line terminal-output-line--accent">' + esc(r) + '</div>';
      }).join('');
      if (windowEl) windowEl.classList.add('terminal--done');
      setStatus('idle');
      return;
    }

    var typed = 0;
    var typeTimer = setInterval(function () {
      typed += 1;
      cmd.textContent = TERMINAL_WHOAMI.slice(0, typed);
      if (typed >= TERMINAL_WHOAMI.length) {
        clearInterval(typeTimer);
        setStatus('executing');
        var roleIndex = 0;
        var lineTimer = setInterval(function () {
          var line = document.createElement('div');
          line.className = 'terminal-output-line terminal-output-line--accent';
          line.textContent = TERMINAL_ROLES[roleIndex];
          output.appendChild(line);
          roleIndex += 1;
          if (roleIndex >= TERMINAL_ROLES.length) {
            clearInterval(lineTimer);
            if (windowEl) windowEl.classList.add('terminal--done');
            setStatus('idle');
          }
        }, 240);
      }
    }, 45);
  }

  // Cursor-follow glow (lightweight, desktop only).
  function initHeroGlow() {
    if (REDUCED_MOTION) return;
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
    var hero = $('.hero');
    if (!hero) return;
    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
      hero.style.setProperty('--my', (e.clientY - rect.top) + 'px');
    });
  }

  // Decorative ticker — repeated twice so the scroll loop is seamless.
  function renderTicker() {
    var track = document.getElementById('ticker-track');
    if (!track || !TICKER.length) return;
    var sep = '<span class="ticker-sep" aria-hidden="true">&#10022;</span>';
    var base = TICKER.map(function (t) {
      return '<span class="ticker-item">' + esc(t) + '</span>';
    }).join(sep) + sep;
    track.innerHTML = base + base;
  }

  // ————————————————————————————————————————————————————————————————
  // RENDERERS — STACK
  // ————————————————————————————————————————————————————————————————

  function renderStackMatrix() {
    var wrap = document.getElementById('stack-matrix');
    if (!wrap) return;
    wrap.innerHTML = STACK.map(function (g, gi) {
      return (
        '<div class="stack-group" data-reveal style="--d:' + (gi * 60) + 'ms">' +
          '<h3 class="stack-group-title"><span class="stack-group-num">0' + (gi + 1) + '.</span> ' + esc(g.group) + '</h3>' +
          '<div class="stack-items">' +
            g.items.map(function (item) {
              var used = STACK_USED[item] ? 'used in ' + STACK_USED[item] : '';
              return '<span class="stack-item" tabindex="0" data-used="' + esc(used) + '">' + esc(item) + '</span>';
            }).join('') +
          '</div>' +
        '</div>'
      );
    });
    $$('.stack-group', wrap).forEach(observeReveal);
  }

  // ————————————————————————————————————————————————————————————————
  // RENDERERS — PROJECTS
  // ————————————————————————————————————————————————————————————————

  function repoMap(repos) {
    var map = {};
    (repos || []).forEach(function (r) { map[r.name.toLowerCase()] = r; });
    return map;
  }

  function enrichedProjects(data) {
    var map = repoMap(data.repos);
    return FEATURED_PROJECTS.map(function (p) {
      var r = map[p.repo.toLowerCase()];
      return {
        repo: p.repo,
        title: p.title,
        category: p.category,
        description: p.description,
        stack: p.stack,
        status: p.status,
        statusType: p.statusType,
        stars: r && r.stargazers_count != null ? r.stargazers_count : 0,
        forks: r && r.forks_count != null ? r.forks_count : 0,
        language: (r && r.language) || '',
        url: (r && r.html_url) || 'https://github.com/' + GITHUB_USERNAME + '/' + p.repo,
        updated: (r && r.updated_at) || ''
      };
    });
  }

  function renderFlagship(flagship) {
    var stackWrap = document.getElementById('flagship-stack');
    if (stackWrap) {
      stackWrap.innerHTML = flagship.stack.map(function (s) {
        return '<span class="tag">' + esc(s) + '</span>';
      }).join('');
    }
    var set = function (id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
    set('fl-stars', flagship.stars.toLocaleString('en-US'));
    set('fl-forks', flagship.forks.toLocaleString('en-US'));
    set('fl-updated', flagship.updated ? fmtDate(flagship.updated) : '—');
  }

  function workCard(p, num) {
    return (
      '<article class="work-card" data-reveal data-category="' + esc(p.category) + '" style="--d:' + ((num - 2) * 70) + 'ms">' +
        '<div class="work-card-top">' +
          '<span class="work-card-num">0' + num + '</span>' +
          '<span class="work-card-status' + (p.statusType === 'archived' ? ' archived' : '') + '">' + esc(p.status) + '</span>' +
        '</div>' +
        '<h3 class="work-card-title"><a href="' + p.url + '" target="_blank" rel="noopener noreferrer">' + esc(p.title) + '</a></h3>' +
        '<p class="work-card-desc">' + esc(p.description) + '</p>' +
        '<div class="work-card-tags">' + p.stack.map(function (s) { return '<span class="tag">' + esc(s) + '</span>'; }).join('') + '</div>' +
        '<div class="work-card-foot">' +
          '<span class="work-card-stats">' +
            p.stars + ' &#9733; &middot; ' + p.forks + ' &#2442;' +
            (p.language ? ' &middot; ' + esc(p.language) : '') +
          '</span>' +
          '<a class="work-card-link" href="' + p.url + '" target="_blank" rel="noopener noreferrer">GitHub ' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17L17 7M7 7h10v10"/></svg>' +
          '</a>' +
        '</div>' +
      '</article>'
    );
  }

  function renderProjects(data) {
    var projects = enrichedProjects(data);
    var grid = document.getElementById('projects-grid');
    var filters = document.getElementById('project-filters');
    if (!grid) return;

    var flagship = projects.filter(function (p) { return p.repo === 'instant-ledger'; })[0];
    var secondary = projects.filter(function (p) { return p.repo !== 'instant-ledger'; });

    if (flagship) renderFlagship(flagship);

    var categories = ['All'];
    secondary.forEach(function (p) {
      if (categories.indexOf(p.category) === -1) categories.push(p.category);
    });

    function renderGrid(filter) {
      var list = filter === 'All' ? secondary : secondary.filter(function (p) { return p.category === filter; });
      grid.innerHTML = list.map(function (p, i) { return workCard(p, i + 2); }).join('');
      $$('.work-card', grid).forEach(observeReveal);
    }

    if (filters) {
      filters.innerHTML = categories.map(function (c) {
        return '<button class="filter-btn" data-filter="' + esc(c) + '" aria-pressed="' + (c === 'All' ? 'true' : 'false') + '">' + esc(c) + '</button>';
      }).join('');
      filters.addEventListener('click', function (e) {
        var btn = e.target.closest('.filter-btn');
        if (!btn) return;
        var filter = btn.getAttribute('data-filter');
        $$('.filter-btn', filters).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');
        renderGrid(filter);
        // Flagship stays visible regardless of the active filter.
        var fl = document.getElementById('project-flagship');
        if (fl) fl.hidden = false;
      });
    }

    renderGrid('All');
  }

  // ————————————————————————————————————————————————————————————————
  // RENDERERS — GITHUB COMMAND CENTER
  // ————————————————————————————————————————————————————————————————

  function setGithubStatus(source) {
    var statusEl = document.getElementById('github-status');
    var textEl = document.getElementById('gh-status-text');
    if (!statusEl) return;
    statusEl.classList.remove('is-live', 'is-snapshot');
    if (source === 'live') {
      statusEl.classList.add('is-live');
      if (textEl) textEl.textContent = 'LIVE';
    } else {
      statusEl.classList.add('is-snapshot');
      if (textEl) textEl.textContent = source === 'cache' ? 'CACHED' : 'SNAPSHOT';
    }
  }

  function renderGithubMetrics(data) {
    var user = data.user || {};
    var repos = data.repos || [];
    var stars = repos.reduce(function (s, r) { return s + (r.stargazers_count || 0); }, 0);
    var forks = repos.reduce(function (s, r) { return s + (r.forks_count || 0); }, 0);
    var set = function (id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };

    set('gh-repos', (user.public_repos != null ? user.public_repos : repos.length).toLocaleString('en-US'));
    set('gh-stars', stars.toLocaleString('en-US'));
    set('gh-forks', forks.toLocaleString('en-US'));
    set('gh-followers', (user.followers != null ? user.followers : '—'));
    set('gh-following', (user.following != null ? user.following : '—'));
    var since = user.created_at ? new Date(user.created_at).getUTCFullYear() : '—';
    set('gh-since', since);
  }

  function renderLangDistribution(data) {
    var wrap = document.getElementById('lang-distribution');
    if (!wrap) return;
    var langs = (data.languages || []).slice(0, 7);
    if (!langs.length) return;
    var max = Math.max.apply(null, langs.map(function (l) { return l.count; })) || 1;

    wrap.innerHTML = langs.map(function (l) {
      var pct = Math.round((l.count / max) * 100);
      return (
        '<div class="lang-row">' +
          '<span class="lang-name">' + esc(l.name) + '</span>' +
          '<div class="lang-track"><span class="lang-fill" style="width:' + pct + '%;background:' + (l.color || DEFAULT_COLOR) + '"></span></div>' +
          '<span class="lang-count">' + l.count + '</span>' +
        '</div>'
      );
    }).join('');
    $$('.lang-row', wrap).forEach(observeReveal);
  }

  function renderActivity(data) {
    var wrap = document.getElementById('github-activity');
    if (!wrap) return;
    var items = (data.repos || [])
      .filter(function (r) { return !r.fork; })
      .sort(function (a, b) { return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(); })
      .slice(0, 7);
    if (!items.length) return;
    wrap.innerHTML = items.map(function (r) {
      var langColor = LANG_COLOR[r.language] || DEFAULT_COLOR;
      return (
        '<li>' +
          '<a href="' + (r.html_url || 'https://github.com/' + GITHUB_USERNAME + '/' + r.name) + '" target="_blank" rel="noopener noreferrer">' +
            '<span class="activity-dot" style="background:' + langColor + '" aria-hidden="true"></span>' +
            '<span class="activity-name">' + esc(r.name) + '</span>' +
            '<span class="activity-date">' + esc(fmtDate(r.updated_at)) + '</span>' +
          '</a>' +
        '</li>'
      );
    }).join('');
  }

  // ————————————————————————————————————————————————————————————————
  // RENDERERS — JOURNEY (git log)
  // ————————————————————————————————————————————————————————————————

  function renderJourneyLog() {
    var log = document.getElementById('journey-log');
    if (!log) return;

    var items = JOURNEY.map(function (j, i) {
      return (
        '<li class="git-item" data-reveal style="--d:' + (i * 90) + 'ms">' +
          '<span class="git-hash">' + pseudoHash(j.year + j.title) + '</span>' +
          '<span class="git-msg"><strong>' + esc(j.title) + '</strong>' +
            '<span class="git-text">' + esc(j.text) + '</span>' +
          '</span>' +
          '<span class="git-year">' + esc(j.year) + '</span>' +
        '</li>'
      );
    }).join('');

    log.outerHTML =
      '<div class="journey-shell">' +
        '<p class="journey-cmd"><span class="terminal-prompt">$</span> git log --oneline --reverse</p>' +
        '<ol class="git-log" aria-label="Development timeline">' + items + '</ol>' +
      '</div>';

    $$('.git-item').forEach(observeReveal);
  }

  // ————————————————————————————————————————————————————————————————
  // NAV + MISC
  // ————————————————————————————————————————————————————————————————

  function initNav() {
    var toggle = $('.nav-toggle');
    var links = document.getElementById('nav-menu');
    if (toggle && links) {
      var close = function () {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('is-open');
        document.body.style.overflow = '';
      };
      toggle.addEventListener('click', function () {
        var open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!open));
        links.classList.toggle('is-open');
        document.body.style.overflow = open ? '' : 'hidden';
      });
      $$('a', links).forEach(function (a) { a.addEventListener('click', close); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
      });
    }
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  function initNavSpy() {
    var navLinks = $$('.nav-link[data-section]');
    if (!navLinks.length || !('IntersectionObserver' in window)) return;

    var sections = navLinks
      .map(function (a) { return document.getElementById(a.getAttribute('data-section')); })
      .filter(Boolean);

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('data-section') === entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { spy.observe(s); });
  }

  // ————————————————————————————————————————————————————————————————
  // INIT
  // ————————————————————————————————————————————————————————————————

  function init() {
    initNav();
    initNavSpy();
    initHeroGlow();
    armStaticReveals();

    renderStackMatrix();
    renderJourneyLog();
    renderTerminal();
    renderTicker();

    // Static content renders immediately; analytics enrich once data resolves.
    getData().then(function (data) {
      renderHeroMetrics(data);
      renderProjects(data);
      renderGithubMetrics(data);
      renderLangDistribution(data);
      renderActivity(data);
      setGithubStatus(data.source);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
