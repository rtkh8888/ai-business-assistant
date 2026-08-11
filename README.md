# AI Business Research & Outreach Assistant

An MVP for researching business websites, extracting signals, running rules and LLM analysis, and saving leads for human review.

## Stack

- Next.js
- TypeScript
- Supabase Postgres
- Zod

## Local setup

1. Install dependencies.
2. Copy `.env.example` to `.env.local`.
3. Fill in Supabase credentials.
4. Run `npm run dev`.

## Phase 0 / Phase 1 scope

- App scaffold
- Environment config
- Supabase config
- Lead and analysis schema
- Repository layer
- Seed data


## Supabase connection note

This repository now includes local Supabase migration files in `supabase/migrations` and seed data in `supabase/seed.sql`.
Linking the GitHub repo in Supabase does not automatically create the tables in the hosted database by itself.
To make the tables appear in the project, the migration must be applied to the Supabase project through the SQL editor, CLI, or the GitHub migration workflow configured for that project.
