/**
 * ============================================================================
 * CINEMATIC GITHUB PORTFOLIO — Main Application Script
 * ============================================================================
 * 
 * A visually stunning, GitHub-powered personal portfolio that creates an
 * immersive, cinematic experience. All data is fetched from the public
 * GitHub API (no authentication required) with intelligent caching and
 * graceful fallback handling.
 * 
 * ARCHITECTURE OVERVIEW:
 * ──────────────────────
 * 1. DATA LAYER:
 *    - Fetches from GitHub API (public endpoints, no auth)
 *    - Caches responses in localStorage (1-hour TTL)
 *    - Falls back to local data if API and cache unavailable
 *    - UI remains identical regardless of data source
 * 
 * 2. RENDER FUNCTIONS:
 *    - renderHero()      → Avatar orb, name, bio, stats with staggered animations
 *    - renderProjects()  → Repository constellation with star layout
 *    - renderSkills()    → Orbital rings + progress bars from languages
 *    - renderTimeline()  → Scroll-triggered activity feed
 * 
 * 3. VISUAL EFFECTS:
 *    - Particle system with floating elements
 *    - Mouse-reactive lighting on hero background
 *    - Orb parallax following cursor movement
 *    - Scroll-based reveal animations
 * 
 * TO CUSTOMIZE:
 * ─────────────
 * Change GITHUB_USERNAME below to your GitHub username. All API calls,
 * links, and cache keys are derived from this single variable. Also update
 * fallback-data.js to match for consistent offline experience.
 * 
 * GITHUB API ENDPOINTS USED:
 * - GET /users/{username}
 * - GET /users/{username}/repos
 * 
 * Rate limit: 60 requests/hour for unauthenticated requests.
 * The caching strategy ensures minimal API calls.
 * 
 * ============================================================================
 */

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION — Change username here to customize for your profile
  // ═══════════════════════════════════════════════════════════════════════════
  
  const GITHUB_USERNAME = 'Deepankar-Siddharth';
  const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache TTL
  const CACHE_KEYS = {
    user: 'github_user_' + GITHUB_USERNAME,
    repos: 'github_repos_' + GITHUB_USERNAME,
    ts: 'github_cache_ts'
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // LANGUAGE COLORS — Visual mapping for programming languages
  // ═══════════════════════════════════════════════════════════════════════════
  
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

  // ═══════════════════════════════════════════════════════════════════════════
  // CACHE LAYER — localStorage persistence for API responses
  // ═══════════════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════════════
  // GITHUB API — Public endpoints (no authentication required)
  // ═══════════════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA STRATEGY — API → Cache → Fallback (never fails)
  // ═══════════════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════════════
  // DOM REFERENCES — Populated on DOMContentLoaded
  // ═══════════════════════════════════════════════════════════════════════════
  var heroOrb, heroName, heroBio, heroStats, heroSkeleton, heroContent;
  var constellationEl, projectsSkeleton;
  var skillsAuraEl, skillsSkeleton;
  var timelineEl, timelineSkeleton;
  var snapshotIndicator;

  function getEl(id) { return document.getElementById(id); }
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsAll(sel, ctx) { return (ctx || document).querySelectorAll(sel); }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER FUNCTIONS — Transform data into visual UI
  // ═══════════════════════════════════════════════════════════════════════════

  // ——— Hero: orb, name, bio, stats with staggered entrance ———
  function renderHero(data) {
    var user = data.user;
    if (!heroContent || !heroSkeleton) return;
    heroSkeleton.classList.add('hidden');
    heroContent.classList.remove('hidden');
    
    // Trigger staggered entrance animations
    requestAnimationFrame(function() {
      heroContent.classList.add('hero-content--visible');
    });

    var name = (user.name || user.login || 'Developer').trim();
    var bio = (user.bio || '').trim();
    var avatarUrl = user.avatar_url;
    var profileUrl = user.html_url || 'https://github.com/' + GITHUB_USERNAME;

    if (heroOrb) {
      // Pulse animation is now handled by CSS when hero-content--visible is added
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
    // Update all GitHub links from single source of truth
    var profileUrlBase = 'https://github.com/' + GITHUB_USERNAME;
    var btnGitHub = qs('.hero-cta .btn-primary');
    if (btnGitHub) btnGitHub.href = profileUrl || profileUrlBase;
    var footerGitHub = getEl('footer-github-link');
    if (footerGitHub) footerGitHub.href = profileUrl || profileUrlBase;
    var footerGitHubText = getEl('footer-github-text');
    if (footerGitHubText) footerGitHubText.textContent = 'github.com/' + GITHUB_USERNAME;
  }

  // ——— Projects: constellation of stars ———
  function filterRepos(repos) {
    // Filter out forks, empty repos (no description AND no stars AND no recent activity)
    var sixMonthsAgo = Date.now() - (180 * 24 * 60 * 60 * 1000);
    return (repos || [])
      .filter(function (r) {
        if (r.fork) return false;
        var hasDescription = r.description && r.description.trim().length > 0;
        var hasStars = (r.stargazers_count || 0) > 0;
        var hasRecentActivity = new Date(r.updated_at || 0).getTime() > sixMonthsAgo;
        // Keep if has description OR stars OR recent activity
        return hasDescription || hasStars || hasRecentActivity;
      })
      .sort(function (a, b) {
        // Sort by a score: stars weight + recency
        var scoreA = (a.stargazers_count || 0) * 2 + (a.forks_count || 0);
        var scoreB = (b.stargazers_count || 0) * 2 + (b.forks_count || 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
        // Tiebreak by updated_at
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
      })
      .slice(0, 12);
  }

  function starSize(stars) {
    if (stars >= 50) return 32;
    if (stars >= 20) return 28;
    if (stars >= 10) return 24;
    if (stars >= 5) return 20;
    if (stars >= 1) return 16;
    return 12;
  }

  function recentGlow(updatedAt) {
    var days = (Date.now() - new Date(updatedAt).getTime()) / (24 * 60 * 60 * 1000);
    if (days <= 7) return 1;
    if (days <= 30) return 0.85;
    if (days <= 90) return 0.7;
    if (days <= 180) return 0.55;
    return 0.4;
  }

  // Generate intentional grid-like positions with organic random offset
  function generateStarPositions(count) {
    var positions = [];
    // Use a grid layout with 4 columns, adjusted for count
    var cols = Math.min(4, count);
    var rows = Math.ceil(count / cols);
    
    for (var i = 0; i < count; i++) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      
      // Base grid position with padding
      var baseX = 15 + (col / Math.max(cols - 1, 1)) * 70;
      var baseY = 12 + (row / Math.max(rows - 1, 1)) * 72;
      
      // Add organic randomness (±8%)
      var offsetX = (Math.random() - 0.5) * 16;
      var offsetY = (Math.random() - 0.5) * 14;
      
      positions.push({
        x: Math.max(8, Math.min(92, baseX + offsetX)),
        y: Math.max(8, Math.min(88, baseY + offsetY))
      });
    }
    
    return positions;
  }

  function renderProjects(data) {
    var repos = filterRepos(data.repos);
    if (!constellationEl || !projectsSkeleton) return;
    projectsSkeleton.classList.add('hidden');
    constellationEl.classList.remove('hidden');

    constellationEl.innerHTML = '';
    
    var positions = generateStarPositions(repos.length);
    
    // Create subtle connector lines (SVG)
    if (repos.length > 1) {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'constellation-lines');
      svg.setAttribute('aria-hidden', 'true');
      
      // Connect some nearby stars for constellation effect
      for (var i = 0; i < positions.length - 1; i++) {
        // Only connect to next 1-2 stars to avoid clutter
        var connections = Math.min(2, positions.length - i - 1);
        for (var j = 1; j <= connections; j++) {
          if (i + j < positions.length && Math.random() > 0.3) {
            var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', positions[i].x + '%');
            line.setAttribute('y1', positions[i].y + '%');
            line.setAttribute('x2', positions[i + j].x + '%');
            line.setAttribute('y2', positions[i + j].y + '%');
            line.setAttribute('class', 'constellation-line');
            line.style.animationDelay = (i * 0.1) + 's';
            svg.appendChild(line);
          }
        }
      }
      constellationEl.appendChild(svg);
    }
    
    repos.forEach(function (r, i) {
      var color = (r.language && (LANGUAGE_COLORS[r.language] || DEFAULT_LANG_COLOR)) || DEFAULT_LANG_COLOR;
      var size = starSize(r.stargazers_count || 0);
      var opacity = recentGlow(r.updated_at || r.created_at);
      var pos = positions[i];
      
      var star = document.createElement('a');
      star.href = r.html_url || ('https://github.com/' + GITHUB_USERNAME + '/' + r.name);
      star.target = '_blank';
      star.rel = 'noopener noreferrer';
      star.className = 'constellation-star';
      star.setAttribute('style',
        '--star-size: ' + size + 'px; --star-color: ' + color + '; --star-glow: ' + opacity + ';' +
        ' --star-x: ' + pos.x + '%; --star-y: ' + pos.y + '%;' +
        ' animation-delay: ' + (i * 0.1) + 's;');
      star.setAttribute('aria-label', r.name + ' – ' + (r.description || 'Repository'));
      
      var langBadge = r.language ? '<span class="star-lang" style="background:' + color + '20; color:' + color + ';">' + r.language + '</span>' : '';
      
      star.innerHTML =
        '<span class="constellation-star-inner"></span>' +
        '<span class="constellation-star-tooltip">' +
        '<strong>' + (r.name || '').replace(/</g, '&lt;') + '</strong>' +
        (r.description ? '<em>' + (r.description || '').substring(0, 80).replace(/</g, '&lt;') + (r.description.length > 80 ? '…' : '') + '</em>' : '') +
        '<small>' + (r.stargazers_count || 0) + ' ★' + (r.language ? ' · ' + r.language : '') + '</small>' +
        '</span>';
      constellationEl.appendChild(star);
    });
  }

  // ——— Skills: orbits + bars from languages ———
  var skillsWrapper, skillsOrbitsEl;
  
  function langValue(l) {
    if (l.count != null) return l.count;
    if (l.bytes) return Math.round(l.bytes / 10000);
    return 0;
  }

  function renderSkillsOrbits(languages) {
    if (!skillsOrbitsEl) return;
    skillsOrbitsEl.innerHTML = '';
    
    // Limit to top 6 languages for orbits
    var topLangs = languages.slice(0, 6);
    var maxVal = Math.max.apply(null, topLangs.map(langValue)) || 1;
    
    // Create center orb
    var center = document.createElement('div');
    center.className = 'orbit-center';
    center.innerHTML = '<span>Tech</span>';
    skillsOrbitsEl.appendChild(center);
    
    // Create orbital rings and planets
    topLangs.forEach(function (lang, i) {
      var val = langValue(lang);
      var radius = 50 + i * 40; // Ring radius: 50, 90, 130, 170, 210, 250
      var planetSize = Math.max(12, Math.min(24, 10 + (val / maxVal) * 14));
      var duration = 15 + i * 5; // Slower outer orbits
      
      // Create ring
      var ring = document.createElement('div');
      ring.className = 'orbit-ring';
      ring.style.width = (radius * 2) + 'px';
      ring.style.height = (radius * 2) + 'px';
      ring.style.animationDelay = (i * 0.3) + 's';
      skillsOrbitsEl.appendChild(ring);
      
      // Create orbit path (rotating container)
      var path = document.createElement('div');
      path.className = 'orbit-path';
      path.style.width = (radius * 2) + 'px';
      path.style.height = (radius * 2) + 'px';
      path.style.setProperty('--orbit-duration', duration + 's');
      // Start at different positions
      path.style.transform = 'translate(-50%, -50%) rotate(' + (i * 60) + 'deg)';
      
      // Create planet
      var planet = document.createElement('div');
      planet.className = 'orbit-planet';
      planet.setAttribute('data-lang', lang.name || '');
      planet.style.width = planetSize + 'px';
      planet.style.height = planetSize + 'px';
      planet.style.background = lang.color || DEFAULT_LANG_COLOR;
      planet.style.boxShadow = '0 0 ' + (planetSize / 2) + 'px ' + (lang.color || DEFAULT_LANG_COLOR) + '60';
      planet.style.top = '0';
      planet.style.left = '50%';
      
      path.appendChild(planet);
      skillsOrbitsEl.appendChild(path);
    });
  }

  function renderSkillsBars(languages) {
    if (!skillsAuraEl) return;
    skillsAuraEl.innerHTML = '';
    
    var maxVal = Math.max.apply(null, languages.map(langValue)) || 1;
    var total = languages.reduce(function(sum, l) { return sum + langValue(l); }, 0);
    
    languages.forEach(function (lang, i) {
      var val = langValue(lang);
      var pct = Math.max(8, (val / maxVal) * 100);
      var percentage = total > 0 ? Math.round((val / total) * 100) : 0;
      var bar = document.createElement('div');
      bar.className = 'skill-bar-wrap';
      bar.setAttribute('style', 'animation-delay: ' + (i * 0.08) + 's;');
      bar.innerHTML =
        '<div class="skill-bar-label"><span>' + (lang.name || '').replace(/</g, '&lt;') + '</span><span>' + percentage + '%</span></div>' +
        '<div class="skill-bar"><span class="skill-bar-fill" style="width:' + pct + '%; background-color:' + (lang.color || DEFAULT_LANG_COLOR) + '; --bar-color: ' + (lang.color || DEFAULT_LANG_COLOR) + ';"></span></div>';
      skillsAuraEl.appendChild(bar);
    });
  }

  function renderSkills(data) {
    var languages = data.languages || [];
    if (!skillsSkeleton) return;
    skillsSkeleton.classList.add('hidden');
    
    if (skillsWrapper) {
      skillsWrapper.classList.remove('hidden');
    }
    
    // Render both views
    renderSkillsOrbits(languages);
    renderSkillsBars(languages);
  }

  // ——— Timeline: recent activity (repo updates) with scroll reveal ———
  var timelineObserver = null;
  
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
      item.setAttribute('data-index', i);
      item.innerHTML =
        '<span class="timeline-dot"></span>' +
        '<span class="timeline-content">' +
        '<strong>' + (r.name || '').replace(/</g, '&lt;') + '</strong>' +
        '<em>' + (date || '').replace(/</g, '&lt;') + '</em>' +
        '</span>';
      timelineEl.appendChild(item);
    });
    
    // Set up scroll-based reveal
    initTimelineObserver();
  }
  
  function initTimelineObserver() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Just show all items immediately
      qsAll('.timeline-item').forEach(function(item) {
        item.classList.add('timeline-item--visible');
      });
      return;
    }
    
    if (!('IntersectionObserver' in window)) {
      // Fallback: show all items
      qsAll('.timeline-item').forEach(function(item) {
        item.classList.add('timeline-item--visible');
      });
      return;
    }
    
    var items = qsAll('.timeline-item');
    var revealed = false;
    
    timelineObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !revealed) {
          revealed = true;
          // Stagger reveal of all items
          items.forEach(function(item, i) {
            setTimeout(function() {
              item.classList.add('timeline-item--visible');
            }, i * 100);
          });
          timelineObserver.disconnect();
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe the timeline container
    if (timelineEl) {
      timelineObserver.observe(timelineEl);
    }
  }

  // ——— Snapshot indicator ———
  function showSnapshot(source) {
    if (source === 'api' || !snapshotIndicator) return;
    snapshotIndicator.classList.remove('hidden');
    snapshotIndicator.setAttribute('aria-label', 'Viewing cached or fallback data');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VISUAL EFFECTS — Particle system and interactive lighting
  // ═══════════════════════════════════════════════════════════════════════════

  // ——— Mouse parallax on hero with lighting effect ———
  function initMouseParallax() {
    var hero = qs('.hero');
    var heroBg = qs('.hero-bg');
    if (!hero) return;
    
    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;
      var offsetX = x - 0.5;
      var offsetY = y - 0.5;
      
      // Orb parallax
      if (heroOrb) {
        heroOrb.style.transform = 'translate(-50%,-50%) translate(' + (offsetX * 16) + 'px,' + (offsetY * 16) + 'px)';
      }
      
      // Mouse-reactive light spot
      if (heroBg) {
        heroBg.style.setProperty('--mouse-x', (x * 100) + '%');
        heroBg.style.setProperty('--mouse-y', (y * 100) + '%');
      }
    });
    
    hero.addEventListener('mouseleave', function () {
      if (heroOrb) {
        heroOrb.style.transform = 'translate(-50%, -50%)';
      }
    });
  }

  // ——— Particle system ———
  function createParticles() {
    var hero = qs('.hero');
    if (!hero) return;
    
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    var container = document.createElement('div');
    container.className = 'hero-particles';
    container.setAttribute('aria-hidden', 'true');
    
    var particleCount = window.innerWidth < 768 ? 20 : 35;
    var colors = [
      'rgba(88, 166, 255, 0.5)',
      'rgba(163, 113, 247, 0.4)',
      'rgba(88, 166, 255, 0.3)',
      'rgba(139, 148, 158, 0.3)'
    ];
    
    for (var i = 0; i < particleCount; i++) {
      var p = document.createElement('div');
      p.className = 'particle';
      var size = 2 + Math.random() * 4;
      var x = Math.random() * 100;
      var y = Math.random() * 100;
      var duration = 6 + Math.random() * 8;
      var delay = Math.random() * 6;
      var tx = (Math.random() - 0.5) * 60;
      var ty = -20 - Math.random() * 60;
      var opacity = 0.3 + Math.random() * 0.4;
      var color = colors[Math.floor(Math.random() * colors.length)];
      
      p.style.cssText = 
        'left:' + x + '%;' +
        'top:' + y + '%;' +
        '--size:' + size + 'px;' +
        '--duration:' + duration + 's;' +
        '--delay:' + delay + 's;' +
        '--tx:' + tx + 'px;' +
        '--ty:' + ty + 'px;' +
        '--opacity:' + opacity + ';' +
        '--color:' + color + ';';
      
      container.appendChild(p);
    }
    
    hero.insertBefore(container, hero.firstChild);
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
    skillsWrapper = qs('.skills-wrapper');
    skillsOrbitsEl = qs('.skills-orbits');
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

    // Create particles before data loads for immediate visual impact
    createParticles();
    
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
