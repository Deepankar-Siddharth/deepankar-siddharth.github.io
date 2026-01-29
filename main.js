/**
 * Deepankar Siddharth — Personal Developer Site
 * Nav toggle, year, and GitHub API integration for live projects
 */

(function () {
  'use strict';

  var GITHUB_USER = 'deepankar-sidharth';
  var GITHUB_API = 'https://api.github.com';
  var GITHUB_PROFILE = 'https://github.com/' + GITHUB_USER;

  // ---------- Current year in footer ----------
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ---------- Mobile nav toggle ----------
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

  // ---------- GitHub: fetch profile and repos ----------
  var projectsGrid = document.getElementById('projects-grid');
  var projectsLoading = document.getElementById('projects-loading');

  function showProjectsError() {
    if (!projectsGrid) return;
    projectsGrid.innerHTML =
      '<div class="projects-error">' +
      '<p>Could not load projects from GitHub. Visit my profile to see what I\'m building.</p>' +
      '<a href="' + GITHUB_PROFILE + '?tab=repositories" class="btn btn-primary" target="_blank" rel="noopener noreferrer">View GitHub Repos</a>' +
      '</div>';
  }

  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function renderProjectCard(repo) {
    var name = escapeHtml(repo.name);
    var desc = escapeHtml(repo.description || 'No description.');
    var url = escapeHtml(repo.html_url);
    var lang = repo.language ? escapeHtml(repo.language) : '';
    var stars = typeof repo.stargazers_count === 'number' ? repo.stargazers_count : 0;
    var updated = repo.updated_at ? new Date(repo.updated_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '';

    var langHtml = lang ? '<span class="project-meta-item project-lang">' + lang + '</span>' : '';
    var starsHtml = stars > 0 ? '<span class="project-meta-item project-stars" aria-label="' + stars + ' stars">★ ' + stars + '</span>' : '';
    var metaHtml = (langHtml || starsHtml || updated) ? '<div class="project-meta">' + langHtml + starsHtml + (updated ? '<span class="project-meta-item">' + updated + '</span>' : '') + '</div>' : '';

    return (
      '<article class="project-card">' +
      '<h3>' + name + '</h3>' +
      metaHtml +
      '<p>' + desc + '</p>' +
      '<a href="' + url + '" class="project-link" target="_blank" rel="noopener noreferrer">View on GitHub →</a>' +
      '</article>'
    );
  }

  function showProjects(repos) {
    if (!projectsGrid) return;
    // Exclude this portfolio repo and optionally forks; show most recently updated
    var list = (repos || []).filter(function (r) {
      return r.name !== GITHUB_USER + '.github.io' && !r.name.toLowerCase().endsWith('.github.io');
    }).slice(0, 8);

    if (list.length === 0) {
      projectsGrid.innerHTML =
        '<div class="projects-error">' +
        '<p>No public repos yet. Check back soon or visit my GitHub.</p>' +
        '<a href="' + GITHUB_PROFILE + '?tab=repositories" class="btn btn-primary" target="_blank" rel="noopener noreferrer">View GitHub</a>' +
        '</div>';
      return;
    }

    projectsGrid.innerHTML = list.map(renderProjectCard).join('');
  }

  function updateAboutFromProfile(profile) {
    var bio = profile && profile.bio && profile.bio.trim();
    if (!bio) return;
    var about1 = document.getElementById('about-bio-1');
    if (about1) about1.textContent = bio;
  }

  // Fetch user profile (bio) and repos in parallel
  if (projectsGrid && projectsLoading) {
    Promise.all([
      fetch(GITHUB_API + '/users/' + GITHUB_USER).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch(GITHUB_API + '/users/' + GITHUB_USER + '/repos?sort=updated&per_page=15').then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; })
    ]).then(function (results) {
      var profile = results[0];
      var repos = results[1] || [];
      if (profile) updateAboutFromProfile(profile);
      var repoList = Array.isArray(repos) ? repos : [];
      if (!profile && repoList.length === 0) {
        showProjectsError();
      } else {
        showProjects(repoList);
      }
    }).catch(function () {
      showProjectsError();
    });
  }
})();
