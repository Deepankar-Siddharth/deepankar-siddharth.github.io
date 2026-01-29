/**
 * GitHub Portfolio — Fetches live data from GitHub REST API
 * Uses Fetch API, localStorage cache, loading skeletons, error handling
 *
 * GitHub API docs: https://docs.github.com/en/rest
 * - GET /users/:username — profile (name, bio, avatar_url, followers, following, public_repos)
 * - GET /users/:username/repos — public repos (sort, per_page)
 */

(function () {
  'use strict';

  // ========== CONFIG — Change username here ==========
  var GITHUB_USER = 'deepankar-sidharth';
  var GITHUB_API = 'https://api.github.com';
  var GITHUB_PROFILE = 'https://github.com/' + GITHUB_USER;
  var CACHE_KEY = 'github_portfolio_' + GITHUB_USER;
  var CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour — avoid hitting API rate limits (60/hr unauthenticated)

  // ---------- DOM refs ----------
  var heroAvatar = document.getElementById('hero-avatar');
  var heroName = document.getElementById('hero-name');
  var heroBio = document.getElementById('hero-bio');
  var heroGithubLink = document.getElementById('hero-github-link');
  var statFollowers = document.getElementById('stat-followers');
  var statFollowing = document.getElementById('stat-following');
  var statRepos = document.getElementById('stat-repos');
  var projectsGrid = document.getElementById('projects-grid');
  var projectsLoading = document.getElementById('projects-loading');
  var skillsList = document.getElementById('skills-list');
  var skillsLoading = document.getElementById('skills-loading');

  // ---------- Cache ----------
  function getCached() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data && data.timestamp && (Date.now() - data.timestamp < CACHE_TTL_MS)) {
        return data;
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  function setCache(user, repos) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        user: user,
        repos: repos,
        timestamp: Date.now()
      }));
    } catch (e) { /* ignore */ }
  }

  // ---------- Fetch with timeout & headers ----------
  function fetchApi(url) {
    var controller = new AbortController();
    var timeoutId = setTimeout(function () { controller.abort(); }, 12000);
    return fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/vnd.github.v3+json' },
      signal: controller.signal,
      mode: 'cors'
    }).then(function (r) {
      clearTimeout(timeoutId);
      return r;
    }).catch(function (err) {
      clearTimeout(timeoutId);
      throw err;
    });
  }

  // ---------- Animated counter ----------
  function animateValue(el, end, duration) {
    if (!el || typeof end !== 'number') return;
    var start = 0;
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var easeOut = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(start + (end - start) * easeOut);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ---------- Escape HTML ----------
  function escapeHtml(text) {
    if (text == null || text === '') return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ---------- Render Hero (name, bio, avatar from API) ----------
  function renderHero(user) {
    if (!user) return;
    if (heroAvatar) {
      if (user.avatar_url) {
        heroAvatar.src = user.avatar_url;
        heroAvatar.alt = (user.name || user.login) + ' avatar';
        heroAvatar.style.display = '';
      } else {
        heroAvatar.style.display = 'none';
      }
      heroAvatar.classList.remove('skeleton');
    }
    if (heroName) {
      heroName.textContent = user.name || user.login || 'Developer';
      heroName.classList.remove('skeleton-text');
    }
    if (heroBio) {
      heroBio.textContent = user.bio || 'Building things with code.';
      heroBio.classList.remove('skeleton-text');
    }
    if (heroGithubLink) heroGithubLink.href = user.html_url || GITHUB_PROFILE;
  }

  // ---------- Render Stats (followers, following, public_repos) ----------
  function renderStats(user) {
    if (!user) return;
    var followers = typeof user.followers === 'number' ? user.followers : 0;
    var following = typeof user.following === 'number' ? user.following : 0;
    var repos = typeof user.public_repos === 'number' ? user.public_repos : 0;

    if (statFollowers) {
      statFollowers.textContent = '0';
      statFollowers.classList.remove('skeleton-text');
      animateValue(statFollowers, followers, 1000);
    }
    if (statFollowing) {
      statFollowing.textContent = '0';
      statFollowing.classList.remove('skeleton-text');
      animateValue(statFollowing, following, 1000);
    }
    if (statRepos) {
      statRepos.textContent = '0';
      statRepos.classList.remove('skeleton-text');
      animateValue(statRepos, repos, 1000);
    }
  }

  // ---------- Render Projects (top 6–8 repos, filter forks) ----------
  function getTopRepos(repos) {
    var list = (repos || []).filter(function (r) {
      return r && !r.fork && r.name !== (GITHUB_USER + '.github.io');
    });
    list.sort(function (a, b) {
      var starsA = a.stargazers_count || 0;
      var starsB = b.stargazers_count || 0;
      if (starsB !== starsA) return starsB - starsA;
      var dateA = new Date(a.updated_at || 0).getTime();
      var dateB = new Date(b.updated_at || 0).getTime();
      return dateB - dateA;
    });
    return list.slice(0, 8);
  }

  function renderProjectCard(repo, index) {
    var name = escapeHtml(repo.name);
    var desc = escapeHtml(repo.description || 'No description.');
    var url = escapeHtml(repo.html_url);
    var lang = repo.language ? escapeHtml(repo.language) : '';
    var stars = typeof repo.stargazers_count === 'number' ? repo.stargazers_count : 0;
    var forks = typeof repo.forks_count === 'number' ? repo.forks_count : 0;
    var updated = repo.updated_at
      ? new Date(repo.updated_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
      : '';
    var delay = (index != null ? index : 0) * 0.08;

    var langHtml = lang ? '<span class="project-meta-item project-lang">' + lang + '</span>' : '';
    var starsHtml = '<span class="project-meta-item project-stars" aria-label="' + stars + ' stars">★ ' + stars + '</span>';
    var forksHtml = '<span class="project-meta-item project-forks" aria-label="' + forks + ' forks">⎇ ' + forks + '</span>';
    var updatedHtml = updated ? '<span class="project-meta-item">' + updated + '</span>' : '';
    var metaHtml = '<div class="project-meta">' + langHtml + starsHtml + forksHtml + updatedHtml + '</div>';

    return (
      '<article class="project-card project-card-in" style="animation-delay:' + delay + 's">' +
      '<h3>' + name + '</h3>' +
      metaHtml +
      '<p>' + desc + '</p>' +
      '<a href="' + url + '" class="project-link" target="_blank" rel="noopener noreferrer">View on GitHub →</a>' +
      '</article>'
    );
  }

  function renderProjects(repos) {
    if (!projectsGrid) return;
    var list = getTopRepos(repos);
    if (list.length === 0) {
      projectsGrid.innerHTML =
        '<div class="projects-error">' +
        '<p>No public repositories to show. Visit my GitHub for more.</p>' +
        '<a href="' + GITHUB_PROFILE + '?tab=repositories" class="btn btn-primary" target="_blank" rel="noopener noreferrer">View GitHub Repos</a>' +
        '</div>';
      return;
    }
    projectsGrid.innerHTML = list.map(function (repo, i) { return renderProjectCard(repo, i); }).join('');
  }

  // ---------- Skills: derive languages from repos ----------
  function getLanguagesFromRepos(repos) {
    var counts = {};
    (repos || []).forEach(function (r) {
      if (r.language) {
        counts[r.language] = (counts[r.language] || 0) + 1;
      }
    });
    return Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
  }

  function renderSkills(repos) {
    if (!skillsList) return;
    var langs = getLanguagesFromRepos(repos);
    if (langs.length === 0) {
      skillsList.innerHTML = '<span class="skill-badge">—</span>';
      return;
    }
    skillsList.innerHTML = langs.map(function (lang) {
      return '<span class="skill-badge">' + escapeHtml(lang) + '</span>';
    }).join('');
  }

  // ---------- Fallback when API fails ----------
  function showError() {
    renderHero({
      name: 'Deepankar Siddharth',
      login: GITHUB_USER,
      bio: 'Developer · Automation · Web apps. Data could not be loaded from GitHub.',
      avatar_url: '',
      html_url: GITHUB_PROFILE
    });
    if (statFollowers) { statFollowers.textContent = '—'; statFollowers.classList.remove('skeleton-text'); }
    if (statFollowing) { statFollowing.textContent = '—'; statFollowing.classList.remove('skeleton-text'); }
    if (statRepos) { statRepos.textContent = '—'; statRepos.classList.remove('skeleton-text'); }
    if (projectsGrid) {
      projectsGrid.innerHTML =
        '<article class="project-card">' +
        '<h3>My repositories</h3>' +
        '<p>See my public projects on GitHub.</p>' +
        '<a href="' + GITHUB_PROFILE + '?tab=repositories" class="project-link" target="_blank" rel="noopener noreferrer">View on GitHub →</a>' +
        '</article>' +
        '<article class="project-card">' +
        '<h3>Profile</h3>' +
        '<p>Check out my GitHub profile.</p>' +
        '<a href="' + GITHUB_PROFILE + '" class="project-link" target="_blank" rel="noopener noreferrer">View on GitHub →</a>' +
        '</article>';
    }
    if (skillsList) skillsList.innerHTML = '<span class="skill-badge">—</span>';
  }

  // ---------- Load data (cache or API) ----------
  function loadData() {
    var cached = getCached();
    if (cached && cached.user && Array.isArray(cached.repos)) {
      renderHero(cached.user);
      renderStats(cached.user);
      renderProjects(cached.repos);
      renderSkills(cached.repos);
      return;
    }

    Promise.all([
      fetchApi(GITHUB_API + '/users/' + GITHUB_USER).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetchApi(GITHUB_API + '/users/' + GITHUB_USER + '/repos?sort=updated&per_page=100').then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; })
    ]).then(function (results) {
      var user = results[0];
      var repos = Array.isArray(results[1]) ? results[1] : [];
      if (user) {
        setCache(user, repos);
        renderHero(user);
        renderStats(user);
      } else {
        renderHero({
          name: 'Deepankar Siddharth',
          login: GITHUB_USER,
          bio: 'Developer · Automation · Web apps. Profile data could not be loaded.',
          avatar_url: '',
          html_url: GITHUB_PROFILE
        });
        if (statFollowers) { statFollowers.textContent = '—'; statFollowers.classList.remove('skeleton-text'); }
        if (statFollowing) { statFollowing.textContent = '—'; statFollowing.classList.remove('skeleton-text'); }
        if (statRepos) { statRepos.textContent = '—'; statRepos.classList.remove('skeleton-text'); }
      }
      renderProjects(repos);
      renderSkills(repos);
    }).catch(function () {
      showError();
    });
  }

  // ---------- Init ----------
  if (projectsGrid && projectsLoading) {
    loadData();
  }

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }
})();
