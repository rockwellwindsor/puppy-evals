# Changelog

## v0.1.0 — 2026-06-28

Initial release.

### What's included

- Golden set: 60 questions across Gus and Mitch (factual, personality, boundary, adversarial)
- Three independent judges: retrieval (recall@k), grounding (Claude Haiku), persona (Claude Haiku)
- CLI runner: `npm run evals -- run --label <name> [--golden gus|mitch] [--top-k N]`
- Postgres storage via Neon + Drizzle ORM
- Next.js dashboard: list view, detail view with expandable traces, comparison view with delta highlighting
- Basic auth on all dashboard routes
- Three documented experiments (see `docs/experiments/`)
- Baseline scores documented in `docs/baseline-2026-06-27.md`

### Key findings from v0.1.0 experiments

- `top_k=5` eliminates retrieval misses that existed at `top_k=3` (86.7% → 100%)
- Concrete persona examples in system prompts outperform vocabulary lists (+0.66 persona score for Gus)
- Mitch's grounding benefits more from increased retrieval depth than Gus's (+0.50 vs +0.10)
