/**
 * Fallback data — used ONLY when GitHub API and localStorage cache are unavailable.
 * Keeps the UI identical so the site never breaks.
 * Change this to match your real profile if you want a consistent fallback.
 */
const FALLBACK_DATA = (function () {
  'use strict';

  const username = 'deepankar-sidharth';
  const profileUrl = 'https://github.com/' + username;

  const user = {
    login: username,
    name: 'Deepankar Siddharth',
    bio: 'Building things that matter. Developer · automation · bots · web apps. Learning in public, shipping often.',
    avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
    html_url: profileUrl,
    public_repos: 12,
    followers: 0,
    following: 0,
    created_at: '2020-01-15T00:00:00Z',
    updated_at: new Date().toISOString().slice(0, 10) + 'T00:00:00Z'
  };

  const repos = [
    {
      name: 'portfolio',
      description: 'Personal developer portfolio powered by GitHub.',
      html_url: profileUrl + '/portfolio',
      stargazers_count: 0,
      forks_count: 0,
      language: 'HTML',
      updated_at: '2024-06-01T12:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
      fork: false
    },
    {
      name: 'automation-toolkit',
      description: 'Scripts and bots for everyday automation.',
      html_url: profileUrl + '/automation-toolkit',
      stargazers_count: 2,
      forks_count: 0,
      language: 'JavaScript',
      updated_at: '2024-05-15T10:00:00Z',
      created_at: '2023-09-01T00:00:00Z',
      fork: false
    },
    {
      name: 'web-app-starter',
      description: 'Starter template for fast web app development.',
      html_url: profileUrl + '/web-app-starter',
      stargazers_count: 1,
      forks_count: 0,
      language: 'TypeScript',
      updated_at: '2024-05-01T08:00:00Z',
      created_at: '2023-06-01T00:00:00Z',
      fork: false
    },
    {
      name: 'cli-helper',
      description: 'CLI utilities for developers.',
      html_url: profileUrl + '/cli-helper',
      stargazers_count: 0,
      forks_count: 0,
      language: 'Python',
      updated_at: '2024-04-20T14:00:00Z',
      created_at: '2023-03-01T00:00:00Z',
      fork: false
    },
    {
      name: 'docs-site',
      description: 'Documentation and learning notes.',
      html_url: profileUrl + '/docs-site',
      stargazers_count: 0,
      forks_count: 0,
      language: 'CSS',
      updated_at: '2024-04-10T09:00:00Z',
      created_at: '2023-01-01T00:00:00Z',
      fork: false
    }
  ];

  const languages = [
    { name: 'JavaScript', bytes: 45000, color: '#f7df1e' },
    { name: 'TypeScript', bytes: 32000, color: '#3178c6' },
    { name: 'HTML', bytes: 28000, color: '#e34c26' },
    { name: 'CSS', bytes: 18000, color: '#563d7c' },
    { name: 'Python', bytes: 15000, color: '#3776ab' }
  ];

  return {
    user: user,
    repos: repos,
    languages: languages,
    source: 'fallback'
  };
})();
