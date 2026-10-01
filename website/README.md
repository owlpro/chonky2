# Chonky2 website

The website lives in this workspace and uses the local chonky2 package. It is separate from the npm package build. Astro and Starlight render the pages; Tailwind and shadcn/ui provide the UI foundation.

From the repository root, run yarn install, then:

- yarn site:dev — build the library and start the website
- yarn site:check — check the website
- yarn site:build — build the library and static website

The generated static site is in website/dist/. Re-run the library build after changing library source during a website dev session.

The production URL is https://chonky2.mdpro-smm.workers.dev/. Astro uses it for canonical URLs and the sitemap.

## Cloudflare Workers Builds

Keep the Root directory field empty so Cloudflare runs commands from the repository root. Use project name `chonky2`, build command `yarn site:build`, deploy command `npx wrangler deploy`, and preview command `npx wrangler preview`. The root `wrangler.jsonc` serves `website/dist/` as static assets with a 404 page.

If a build says `Couldn't find a script named "site:build"`, check Root directory first. The script is in the repository root `package.json`, not `website/package.json`. After changing build settings, retry the build in Cloudflare. Commit and push site changes to trigger a new Git-connected build.
