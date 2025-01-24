import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'MonoPKG',
  description: 'A simple, yet useful package manager for monorepos',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guides', link: '/guides/overview', activeMatch: '/guides/' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        collapsed: false,
        items: [
          {
            text: 'Overview',
            link: '/guides/overview',
          },
          {
            text: 'Getting Started',
            link: '/guides/getting-started',
          },
          {
            text: 'Usage',
            link: '/guides/usage',
          },
        ],
      },
      {
        text: 'References',
        collapsed: false,
        items: [
          { text: 'Add Dependencies', link: '/references/add' },
          { text: 'Add Scripts', link: '/references/add-script' },
          { text: 'Create Package', link: '/references/create' },
          { text: 'Init Package', link: '/references/init' },
          { text: 'Link Dependencies', link: '/references/link' },
          { text: 'List Packages', link: '/references/list.md' },
          { text: 'Remove Dependencies', link: '/references/remove' },
          { text: 'Remove Script', link: '/references/remove-script' },
          { text: 'Run Scripts', link: '/references/run.md' },
          { text: 'Unlink Dependencies', link: '/references/unlink' },
          { text: 'Use Packages', link: '/references/use' },
          { text: 'Versioning', link: '/references/version' },
        ],
      },
    ],

    editLink: {
      pattern: 'https://github.com/beerush-id/monopkg/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/beerush-id/monopkg' }],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present Beerush',
    },
  },
});
