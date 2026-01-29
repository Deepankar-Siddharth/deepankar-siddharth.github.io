/**
 * Fallback data for GitHub portfolio — used when API fails, is rate-limited, or offline.
 * Same shape as GitHub API responses so the UI renders identically.
 * Update this file with your own profile and projects; it will be used only when live API is unavailable.
 *
 * Data source priority: 1) GitHub API  2) localStorage cache  3) This fallback
 */

(function (global) {
  'use strict';

  // Placeholder avatar (works offline) — replace with your image URL if preferred
  var PLACEHOLDER_AVATAR = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140">' +
    '<circle cx="70" cy="70" r="70" fill="#161b22"/>' +
    '<text x="70" y="88" text-anchor="middle" fill="#8b949e" font-size="48" font-family="sans-serif">DS</text>' +
    '</svg>'
  );

  /**
   * Profile — matches GitHub API user object shape
   * https://docs.github.com/en/rest/users/users#get-a-user
   */
  var fallbackUser = {
    login: 'deepankar-sidharth',
    name: 'Deepankar Siddharth',
    bio: 'Developer · Automation · Bots · Web apps. Building things with code.',
    avatar_url: PLACEHOLDER_AVATAR,
    html_url: 'https://github.com/deepankar-sidharth',
    followers: 0,
    following: 0,
    public_repos: 3
  };

  /**
   * Repositories — matches GitHub API repo object shape (subset we use)
   * https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user
   * Include name, description, language, stargazers_count, forks_count, html_url, updated_at, fork
   */
  var fallbackRepos = [
    {
      name: 'portfolio',
      description: 'Personal developer portfolio — built with GitHub API, fallback-safe.',
      language: 'HTML',
      stargazers_count: 0,
      forks_count: 0,
      html_url: 'https://github.com/deepankar-sidharth/deepankar-sidharth.github.io',
      updated_at: new Date().toISOString(),
      fork: false
    },
    {
      name: 'sample-project',
      description: 'Sample project. Replace with your real repos in fallback-data.js.',
      language: 'JavaScript',
      stargazers_count: 0,
      forks_count: 0,
      html_url: 'https://github.com/deepankar-sidharth',
      updated_at: new Date().toISOString(),
      fork: false
    },
    {
      name: 'automation-tools',
      description: 'Scripts and automation for workflows and integrations.',
      language: 'Python',
      stargazers_count: 0,
      forks_count: 0,
      html_url: 'https://github.com/deepankar-sidharth',
      updated_at: new Date().toISOString(),
      fork: false
    }
  ];

  global.GITHUB_FALLBACK_DATA = {
    user: fallbackUser,
    repos: fallbackRepos
  };
})(typeof window !== 'undefined' ? window : this);
