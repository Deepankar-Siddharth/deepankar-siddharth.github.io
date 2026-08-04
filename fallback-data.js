/**
 * ============================================================================
 * FALLBACK DATA — Deepankar Siddharth Developer Portfolio
 * ============================================================================
 *
 * This file provides data when the GitHub API is unavailable or rate-limited
 * and no cached copy exists, so the site never breaks.
 *
 * DATA STRATEGY (in priority order):
 *   1. Live GitHub API (fetched and cached for 1 hour)
 *   2. localStorage cache
 *   3. This fallback snapshot
 *
 * Every value below is derived from the real public GitHub profile and
 * original (non-fork) repositories for `deepankar-siddharth`. No statistics
 * or repositories are invented.
 *
 * ============================================================================
 */

const FALLBACK_DATA = (function () {
  'use strict';

  const username = 'deepankar-siddharth';
  const profileUrl = 'https://github.com/' + username;

  const user = {
    login: username,
    name: 'Deepankar Siddharth',
    bio: 'Developer • Building web apps, tools & automation • Exploring open source and turning ideas into useful software.',
    avatar_url: 'https://github.com/' + username + '.png',
    html_url: profileUrl,
    public_repos: 49,
    followers: 11,
    following: 16,
    company: 'WeSoDev',
    location: 'India',
    blog: 'Deepankar.is-a.dev',
    twitter_username: 'DeepankarZino',
    created_at: '2020-05-26T07:53:54Z'
  };

  const repos = [
    {
      name: 'instant-ledger',
      description: 'Privacy-first, offline-only personal finance ledger for Android.',
      html_url: profileUrl + '/instant-ledger',
      stargazers_count: 0,
      forks_count: 0,
      language: 'Kotlin',
      updated_at: '2026-01-30T00:00:00Z',
      created_at: '2026-01-28T00:00:00Z',
      fork: false
    },
    {
      name: 'Temp-RDP',
      description: 'Ephemeral Windows RDP environments provisioned via GitHub Actions and ngrok.',
      html_url: profileUrl + '/Temp-RDP',
      stargazers_count: 0,
      forks_count: 5,
      language: 'Batchfile',
      updated_at: '2026-01-28T00:00:00Z',
      created_at: '2022-11-04T00:00:00Z',
      fork: false
    },
    {
      name: 'event-sphere',
      description: 'Full-stack event management system (React + Node/Express + MySQL).',
      html_url: profileUrl + '/event-sphere',
      stargazers_count: 0,
      forks_count: 0,
      language: 'JavaScript',
      updated_at: '2025-05-26T00:00:00Z',
      created_at: '2025-05-26T00:00:00Z',
      fork: false
    },
    {
      name: 'DarkZino_SuperUser',
      description: 'Python Telegram userbot built on the Telethon library.',
      html_url: profileUrl + '/DarkZino_SuperUser',
      stargazers_count: 0,
      forks_count: 0,
      language: 'Python',
      updated_at: '2021-01-15T00:00:00Z',
      created_at: '2021-01-15T00:00:00Z',
      fork: false
    },
    {
      name: 'terminal_package_collection',
      description: 'Curated server bootstrap toolkit for Termux — scripts and configs for zero-touch setup.',
      html_url: profileUrl + '/terminal_package_collection',
      stargazers_count: 1,
      forks_count: 1,
      language: 'Shell',
      updated_at: '2020-06-24T00:00:00Z',
      created_at: '2020-06-24T00:00:00Z',
      fork: false
    },
    {
      name: 'Img',
      description: 'PowerShell scripts and wallpaper tooling.',
      html_url: profileUrl + '/Img',
      stargazers_count: 0,
      forks_count: 0,
      language: 'PowerShell',
      updated_at: '2023-08-23T00:00:00Z',
      created_at: '2022-11-03T00:00:00Z',
      fork: false
    },
    {
      name: 'Darkzino-websites',
      description: 'Early web projects and site experiments.',
      html_url: profileUrl + '/Darkzino-websites',
      stargazers_count: 0,
      forks_count: 0,
      language: 'HTML',
      updated_at: '2021-05-08T00:00:00Z',
      created_at: '2021-05-08T00:00:00Z',
      fork: false
    },
    {
      name: 'Darkzino_onion',
      description: 'Dark-themed static web project.',
      html_url: profileUrl + '/Darkzino_onion',
      stargazers_count: 0,
      forks_count: 0,
      language: 'CSS',
      updated_at: '2023-08-16T00:00:00Z',
      created_at: '2023-08-16T00:00:00Z',
      fork: false
    }
  ];

  const languages = [
    { name: 'JavaScript', count: 2, bytes: 180000, color: '#f1e05a' },
    { name: 'Kotlin', count: 1, bytes: 512000, color: '#a97bff' },
    { name: 'Python', count: 1, bytes: 260000, color: '#3572A5' },
    { name: 'Shell', count: 1, bytes: 12000, color: '#89e051' },
    { name: 'Batchfile', count: 1, bytes: 10000, color: '#C1F12E' },
    { name: 'PowerShell', count: 1, bytes: 700, color: '#012456' },
    { name: 'HTML', count: 1, bytes: 3400, color: '#e34c26' },
    { name: 'CSS', count: 1, bytes: 2900, color: '#563d7c' }
  ];

  return {
    user: user,
    repos: repos,
    languages: languages,
    source: 'fallback'
  };
})();
