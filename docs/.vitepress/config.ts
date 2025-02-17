import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/monopkg/',
  title: '▩ MonoPKG',
  description: 'A simple, yet useful package manager for monorepos',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guides', link: '/intro/overview', activeMatch: '/intro/' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          {
            text: 'Overview',
            link: '/intro/overview',
          },
          {
            text: 'Features',
            link: '/intro/features',
          },
          {
            text: 'Usage',
            link: '/intro/usage',
          },
        ],
      },
      {
        text: 'Guides',
        items: [
          {
            text: 'Getting Started',
            link: '/guides/getting-started',
          },
          {
            text: 'Dependencies',
            collapsed: true,
            items: [
              { text: 'Add Dependencies', link: '/guides/add' },
              { text: 'Remove Dependencies', link: '/guides/remove' },
              { text: 'Link Dependencies', link: '/guides/link' },
              { text: 'Unlink Dependencies', link: '/guides/unlink' },
            ],
          },
          {
            text: 'Packages',
            collapsed: true,
            items: [
              { text: 'Create Package', link: '/guides/create' },
              { text: 'Move Package', link: '/guides/move' },
              { text: 'List Packages', link: '/guides/list' },
              { text: 'Link Packages', link: '/guides/attach' },
              { text: 'Unlink Packages', link: '/guides/detach' },
              { text: 'Get Package Info', link: '/guides/info#get-information' },
              { text: 'Set Package Info', link: '/guides/info#set-information' },
              { text: 'Delete Package Info', link: '/guides/info#delete-information' },
            ],
          },
          {
            text: 'Scripts',
            collapsed: true,
            items: [
              { text: 'Add Script', link: '/guides/add-script' },
              { text: 'Inspect Scripts', link: '/guides/inspect-script' },
              { text: 'Remove Script', link: '/guides/remove-script' },
              { text: 'Run Script', link: '/guides/run' },
            ],
          },
          {
            text: 'Utilities',
            collapsed: true,
            items: [
              { text: 'Copy Files', link: '/guides/copy' },
              { text: 'Exports Generator', link: '/guides/exports' },
              { text: 'Execute Command', link: '/guides/exec' },
            ],
          },
          {
            text: 'Workspaces',
            collapsed: true,
            items: [
              { text: 'Add Workspace', link: '/guides/add-space' },
              { text: 'Initialize Project', link: '/guides/init' },
              { text: 'Remove Workspace', link: '/guides/remove-space' },
            ],
          },
          { text: 'Versioning', link: '/guides/version' },
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
