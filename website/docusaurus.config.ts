import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'n8n-nodes-ethereum',
  tagline: 'Comprehensive Ethereum blockchain integration for n8n',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://flyinglimao.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/n8n-ethereum/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'flyinglimao', // Usually your GitHub org/user name.
  projectName: 'n8n-ethereum', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-TW', 'ja'],
    localeConfigs: {
      en: {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en-US',
      },
      'zh-TW': {
        label: '正體中文',
        direction: 'ltr',
        htmlLang: 'zh-TW',
      },
      ja: {
        label: '日本語',
        direction: 'ltr',
        htmlLang: 'ja-JP',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/', // Make docs the homepage
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/flyinglimao/n8n-ethereum/tree/main/website/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'n8n-nodes-ethereum',
      logo: {
        alt: 'n8n-nodes-ethereum Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/flyinglimao/n8n-ethereum',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/intro',
            },
            {
              label: 'Installation',
              to: '/installation',
            },
            {
              label: 'Resources',
              to: '/resources/overview',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'n8n Community',
              href: 'https://community.n8n.io/',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/flyinglimao/n8n-ethereum',
            },
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/@0xlimao/n8n-nodes-ethereum',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} n8n-nodes-ethereum. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
