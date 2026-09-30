# Chonky2 website

The website lives in this workspace and uses the local chonky2 package. It is separate from the npm package build. Astro and Starlight render the pages; Tailwind and shadcn/ui provide the UI foundation.

From the repository root, run yarn install, then:

- yarn site:dev — build the library and start the website
- yarn site:check — check the website
- yarn site:build — build the library and static website

The generated static site is in website/dist/. Re-run the library build after changing library source during a website dev session.

A production URL is intentionally not configured until hosting is chosen.

## Cloudflare Workers Builds

Keep the root directory at the repository root. Use project name chonky2, build command yarn site:build, deploy command npx wrangler deploy, and preview command npx wrangler preview. The root wrangler.jsonc serves website/dist/ as static assets with a 404 page. Commit and push the website and Wrangler configuration before connecting the Git repository for deployment.
