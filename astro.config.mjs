import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// The homepages (/ and /zh/) are plain Astro pages in src/pages; Starlight serves the docs under /docs/ and /zh/docs/.
export default defineConfig({
  site: 'https://deskmind.dev',
  integrations: [
    starlight({
      title: { en: 'DeskMind Docs', 'zh-CN': 'DeskMind 文档' },
      logo: { light: './public/assets/bilingual-horizontal-light.svg', dark: './public/assets/bilingual-horizontal-dark.svg', replacesTitle: true },
      favicon: '/assets/favicon.ico',
      disable404Route: true, // public/404.html (Xiaofang, bilingual) serves every path
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        zh: { label: '简体中文', lang: 'zh-CN' },
      },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/deskmind-ai' }],
      editLink: { baseUrl: 'https://github.com/deskmind-ai/site/edit/main/' },
      customCss: ['./src/styles/docs.css'],
      sidebar: [
        { label: 'Start here', translations: { 'zh-CN': '入门' }, items: [{ autogenerate: { directory: 'docs/start' } }] },
        { label: 'How-to guides', translations: { 'zh-CN': '操作指南' }, items: [{ autogenerate: { directory: 'docs/how-to' } }] },
        { label: 'Reference', translations: { 'zh-CN': '参考' }, items: [{ autogenerate: { directory: 'docs/reference' } }] },
        { label: 'Explanation', translations: { 'zh-CN': '原理' }, items: [{ autogenerate: { directory: 'docs/explanation' } }] },
        { label: 'Project', translations: { 'zh-CN': '项目' }, items: [{ autogenerate: { directory: 'docs/project' } }] },
      ],
    }),
  ],
});
