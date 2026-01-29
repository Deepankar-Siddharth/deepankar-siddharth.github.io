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
  const username = 'deepankar-siddharth';
  const profileUrl = 'https://github.com/' + username;

  // User profile information (based on real GitHub profile)
  const user = {
    login: username,
    name: 'Deepankar Siddharth',
    bio: 'BDS student by day, developer by night. Automation specialist building headless tools that solve real-world problems. Precision in the clinic, automation in the terminal.',
    avatar_url: 'https://github.com/' + username + '.png',
    html_url: profileUrl,
    public_repos: 46,
    followers: 8,
    following: 18,
    company: 'WeSoDev',
    location: 'India',
    blog: 'WeSoDev.tech',
    created_at: '2020-01-15T00:00:00Z',
    updated_at: new Date().toISOString().slice(0, 10) + 'T00:00:00Z'
  };

  // Sample repositories (based on real GitHub profile)
  const repos = [
    {
      name: 'terminal_package_collection',
      description: 'The ultimate server bootstrap toolkit — curated scripts, binaries, and configs for zero-touch deployment.',
      html_url: profileUrl + '/terminal_package_collection',
      stargazers_count: 1,
      forks_count: 1,
      language: 'Shell',
      updated_at: new Date().toISOString(),
      created_at: '2024-01-01T00:00:00Z',
      fork: false
    },
    {
      name: 'Temp-RDP',
      description: 'On-demand remote environments — production-grade automation for ephemeral Windows/Linux instances.',
      html_url: profileUrl + '/Temp-RDP',
      stargazers_count: 2,
      forks_count: 0,
      language: 'Shell',
      updated_at: '2025-12-15T10:00:00Z',
      created_at: '2024-06-01T00:00:00Z',
      fork: false
    },
    {
      name: 'DarkZino_SuperUser',
      description: 'Advanced automation utilities and system tools.',
      html_url: profileUrl + '/DarkZino_SuperUser',
      stargazers_count: 0,
      forks_count: 0,
      language: 'Python',
      updated_at: '2025-11-20T08:00:00Z',
      created_at: '2024-03-01T00:00:00Z',
      fork: false
    },
    {
      name: 'Darkzino-websites',
      description: 'Web projects and portfolio sites.',
      html_url: profileUrl + '/Darkzino-websites',
      stargazers_count: 0,
      forks_count: 0,
      language: 'HTML',
      updated_at: '2025-10-10T14:00:00Z',
      created_at: '2024-02-01T00:00:00Z',
      fork: false
    },
    {
      name: 'automation-toolkit',
      description: 'Python automation scripts for web scraping, API integration, and workflow automation.',
      html_url: profileUrl + '/automation-toolkit',
      stargazers_count: 1,
      forks_count: 0,
      language: 'Python',
      updated_at: '2025-09-05T09:00:00Z',
      created_at: '2023-06-01T00:00:00Z',
      fork: false
    },
    {
      name: 'devops-scripts',
      description: 'CI/CD pipelines and GitHub Actions workflows for automated testing and deployment.',
      html_url: profileUrl + '/devops-scripts',
      stargazers_count: 0,
      forks_count: 0,
      language: 'Shell',
      updated_at: '2025-08-20T16:00:00Z',
      created_at: '2024-01-15T00:00:00Z',
      fork: false
    }
  ];

  // Aggregated language statistics (based on real profile focus areas)
  const languages = [
    { name: 'Python', bytes: 65000, count: 12, color: '#3776ab' },
    { name: 'Shell', bytes: 45000, count: 8, color: '#89e051' },
    { name: 'HTML', bytes: 28000, count: 6, color: '#e34c26' },
    { name: 'JavaScript', bytes: 22000, count: 5, color: '#f7df1e' },
    { name: 'CSS', bytes: 15000, count: 4, color: '#563d7c' },
    { name: 'Dockerfile', bytes: 8000, count: 3, color: '#384d54' }
  ];

  return {
    user: user,
    repos: repos,
    languages: languages,
    source: 'fallback'
  };
})();
