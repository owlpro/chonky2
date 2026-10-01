import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://chonky2.mdpro-smm.workers.dev',
  integrations: [
    starlight({
      title: 'Chonky2',
      customCss: ['./src/styles/docs.css'],
      sidebar: [
        {
          label: 'Getting started',
          items: [
            { slug: 'docs' },
            { slug: 'docs/installation' },
            { slug: 'docs/first-explorer' },
            { slug: 'docs/connect-backend' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { slug: 'docs/file-actions' },
            { slug: 'docs/search' },
            { slug: 'docs/sidebar-state' },
            { slug: 'docs/customize' },
            { slug: 'docs/custom-layout' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { slug: 'docs/core-props' },
            { slug: 'docs/api-reference' },
          ],
        },
      ],
    }),
    react(),
  ],
  vite: { plugins: [tailwindcss()] },
});
