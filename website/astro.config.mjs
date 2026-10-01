import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Chonky2',
      sidebar: [
        {
          label: 'Getting started',
          items: [
            { slug: 'docs' },
            { slug: 'docs/installation' },
            { slug: 'docs/first-explorer' },
            { slug: 'docs/connect-backend' },
            { slug: 'docs/core-props' },
            { slug: 'docs/file-actions' },
            { slug: 'docs/customize' },
          ],
        },
      ],
    }),
    react(),
  ],
  vite: { plugins: [tailwindcss()] },
});
