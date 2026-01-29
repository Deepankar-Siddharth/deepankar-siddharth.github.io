/**
 * ============================================================================
 * FALLBACK DATA — GitHub Cinematic Portfolio
 * ============================================================================
 * 
 * This file provides fallback data when the GitHub API is unavailable or
 * rate-limited, and no cached data exists. This ensures the site never breaks.
 * 
 * DATA STRATEGY (in priority order):
 * 1. Live GitHub API data (fetched and cached)
 * 2. Cached data from localStorage (if API fails)
 * 3. This fallback data (if both API and cache unavailable)
 * 
 * The UI remains identical regardless of data source — only a subtle
 * "Snapshot" indicator appears when using non-live data.
 * 
 * TO CUSTOMIZE: Update the username, user info, repos, and languages below
 * to match your actual GitHub profile for a consistent offline experience.
 * 
 * ============================================================================
 */

const FALLBACK_DATA = (function () {
  'use strict';

  // ——— Change this to match GITHUB_USERNAME in script.js ———
  const username = 'Deepankar-Siddharth';
  const profileUrl = 'https://github.com/' + username;

  // User profile information
  const user = {
    login: username,
    name: 'Deepankar Siddharth',
    bio: 'Building things that matter. Developer exploring automation, bots, and web applications. Learning in public, shipping often.',
    avatar_url: 'https://github.com/' + username + '.png',
    html_url: profileUrl,
    public_repos: 10,
    followers: 5,
    following: 10,
    created_at: '2020-01-15T00:00:00Z',
    updated_at: new Date().toISOString().slice(0, 10) + 'T00:00:00Z'
  };

  // Sample repositories (customize with your actual repos)
  const repos = [
    {
      name: 'portfolio',
      description: 'Personal developer portfolio — cinematic GitHub-powered experience.',
      html_url: profileUrl + '/portfolio',
      stargazers_count: 3,
      forks_count: 1,
      language: 'JavaScript',
      updated_at: new Date().toISOString(),
      created_at: '2024-01-01T00:00:00Z',
      fork: false
    },
    {
      name: 'automation-scripts',
      description: 'Collection of automation scripts and bots for everyday tasks.',
      html_url: profileUrl + '/automation-scripts',
      stargazers_count: 5,
      forks_count: 2,
      language: 'Python',
      updated_at: '2025-12-15T10:00:00Z',
      created_at: '2024-06-01T00:00:00Z',
      fork: false
    },
    {
      name: 'web-components',
      description: 'Reusable web components library with modern CSS.',
      html_url: profileUrl + '/web-components',
      stargazers_count: 2,
      forks_count: 0,
      language: 'TypeScript',
      updated_at: '2025-11-20T08:00:00Z',
      created_at: '2024-03-01T00:00:00Z',
      fork: false
    },
    {
      name: 'cli-tools',
      description: 'Command-line utilities for developers.',
      html_url: profileUrl + '/cli-tools',
      stargazers_count: 1,
      forks_count: 0,
      language: 'Go',
      updated_at: '2025-10-10T14:00:00Z',
      created_at: '2024-02-01T00:00:00Z',
      fork: false
    },
    {
      name: 'learning-notes',
      description: 'Documentation and notes from learning various technologies.',
      html_url: profileUrl + '/learning-notes',
      stargazers_count: 0,
      forks_count: 0,
      language: 'Markdown',
      updated_at: '2025-09-05T09:00:00Z',
      created_at: '2023-06-01T00:00:00Z',
      fork: false
    },
    {
      name: 'api-starter',
      description: 'Minimal REST API starter template with best practices.',
      html_url: profileUrl + '/api-starter',
      stargazers_count: 4,
      forks_count: 1,
      language: 'JavaScript',
      updated_at: '2025-08-20T16:00:00Z',
      created_at: '2024-01-15T00:00:00Z',
      fork: false
    }
  ];

  // Aggregated language statistics (customize to match your actual usage)
  const languages = [
    { name: 'JavaScript', bytes: 55000, count: 4, color: '#f7df1e' },
    { name: 'Python', bytes: 35000, count: 2, color: '#3776ab' },
    { name: 'TypeScript', bytes: 28000, count: 2, color: '#3178c6' },
    { name: 'HTML', bytes: 22000, count: 3, color: '#e34c26' },
    { name: 'CSS', bytes: 18000, count: 3, color: '#563d7c' },
    { name: 'Go', bytes: 12000, count: 1, color: '#00add8' }
  ];

  return {
    user: user,
    repos: repos,
    languages: languages,
    source: 'fallback'
  };
})();
