import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Chonky2',
      sidebar: [{ label: 'Documentation', items: [{ slug: 'docs' }] }],
    }),
    react(),
  ],
  vite: { plugins: [tailwindcss()] },
});
