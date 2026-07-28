# The Muddy Root Recipe Book

A mobile-first recipe book recreated as an independent web app. Add recipes with a creator, base, ingredients, preparation, and notes; then search and filter the shared collection.

## Run locally

```bash
npm install
npm run dev
```

The app is built for Cloudflare Workers and uses a D1 database bound as `DB` for durable recipe storage.

## Deploy

Create a D1 database, bind it as `DB`, apply `drizzle/0000_muddy_recipes.sql`, and deploy the Worker build.
