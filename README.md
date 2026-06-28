# puppy-evals

An evaluation harness for the RAG chatbot at [windsordevelopmentstudio.io](https://windsordevelopmentstudio.io). Measures retrieval quality, factual grounding, and persona consistency independently — and catches regressions when models, prompts, or retrieval parameters change.

![Dashboard list view](public/screenshots/index.png)
![Dashboard show view](public/screenshots/show.png)
![Detail view with regression expanded trace](public/screenshots/expanded_view_1.png)
![Detail view with passing expanded trace](public/screenshots/expanded_view_2.png)
![Comparison view](public/screenshots/compare.png)

---

## Why this exists

The portfolio site at windsordevelopmentstudio.io hosts two dog-persona chatbots — Gus and Mitch — powered by a RAG pipeline (Pinecone + GPT-3.5-turbo). When I change a prompt, swap a model, or adjust retrieval parameters, I need to know whether the change helped or hurt.

Most RAG systems ship without evaluation infrastructure. People build them, try a few queries by hand, decide it seems fine, and ship. When something breaks — a prompt change makes the model hallucinate more, a model swap regresses persona consistency, a chunking change breaks retrieval — they don't find out until a user complains, or never at all.

This project is the discipline applied to my own chatbot. It also demonstrates a skill that's genuinely rare in 2026: building evaluation infrastructure for LLM systems, not just the systems themselves.

---

## The three judges

For a RAG chatbot, three different qualities matter — and they need to be measured independently, because you can fix one while accidentally breaking another.

**Retrieval quality** — Did the right Pinecone chunks come back? Measured as recall@k: of the top K chunks retrieved, what fraction of the expected ones appeared? Pure math, no LLM needed.

**Factual grounding** — Did the answer actually use the retrieved context, or did it hallucinate? Scored 1–5 by Claude Haiku, given the question, the retrieved chunks, and the answer.

**Persona consistency** — Did Gus sound like Gus? Did Mitch sound like Mitch? Scored 1–5 by Claude Haiku, given the persona description, the question, and the answer.

Judges use Claude Haiku rather than GPT (the model being evaluated) to avoid same-model bias. Each judge is calibrated against human scores before being trusted at scale.

---

## Architecture

```
puppy-evals (this repo)
    ↓ calls
POST /api/chat/eval  (windsor_design_studio, API-key gated)
    ↓ returns
answer + retrieved_chunks + model + latency + tokens
    ↓ scored by
retrieval judge  (recall@k, pure math)
grounding judge  (Claude Haiku, 1-5 score)
persona judge    (Claude Haiku, 1-5 score)
    ↓ stored in
Postgres (Neon) → Next.js dashboard
```

The harness lives in a separate repo from the chatbot it evaluates. The chatbot is in `windsor_design_studio`. `puppy-evals` reaches it via a gated eval endpoint on the live site.

---

## Setup

```bash
# Clone and install
git clone https://github.com/rockwellrice/puppy-evals
cd puppy-evals
npm install

# Copy env vars and fill in values
cp .env.example .env.local
```

Required env vars (see `.env.example`):

```
CHATBOT_BASE_URL    # windsor_design_studio base URL
EVAL_API_KEY        # API key for the eval endpoint
DATABASE_URL        # Neon Postgres connection string
ANTHROPIC_API_KEY   # Claude Haiku judges
DASHBOARD_USERNAME  # Basic auth for dashboard
DASHBOARD_PASSWORD
```

**Local test database** (Postgres via Homebrew):
```bash
createdb puppy_evals_test
npm run db:migrate:test
```

**Production database** (Neon):
```bash
npm run db:migrate
```

---

## Running evals

```bash
# Run both puppies
npm run evals -- run --label "baseline"

# Run one puppy
npm run evals -- run --label "gus-only" --golden gus

# Vary retrieval depth
npm run evals -- run --label "top-k-5" --top-k 5
```

Results print to stdout and are stored in Postgres. View them in the dashboard:

```bash
npm run dev
# open http://localhost:3000/runs
```

---

## Experiments

Three experiments documented with before/after data. See `docs/experiments/` for full writeups.

### Experiment 2 — Retrieval depth (top_k: 3 → 5)

| Dimension | top_k=3 | top_k=5 | Delta |
|-----------|---------|---------|-------|
| Retrieval | 86.7% | **100.0%** | +13.3% |
| Grounding | 4.20 / 5 | 4.30 / 5 | +0.10 |
| Persona | 3.53 / 5 | 3.47 / 5 | -0.06 |

Increasing retrieval depth from 3 to 5 eliminated all retrieval misses. The 13.3% gap in the baseline meant expected chunks were in Pinecone but ranked below position 3. `top_k=5` is now the default.

### Experiment 3 — Gus persona prompt

| Dimension | Before | After | Delta |
|-----------|--------|-------|-------|
| Retrieval | 100.0% | 100.0% | — |
| Grounding | 4.30 / 5 | 3.90 / 5 | -0.40 |
| Persona | 3.47 / 5 | **4.13 / 5** | **+0.66** |

Adding concrete example responses to Gus's system prompt — showing his sentence structure, not just listing vocabulary words — improved persona consistency by +0.66. The largest single-dimension gain across all experiments. Grounding dropped -0.40 as a tradeoff: a stronger persona pull occasionally causes the model to add flourishes beyond what the retrieved chunks strictly support.

---

## What I learned

**Showing beats telling for persona prompts.** The original Gus prompt listed vocabulary words ("use words like 'indeed' and 'delightful'"). The revised prompt added two example sentences. Persona scores jumped +0.66. The model needs to see what the voice looks like, not a description of it.

**Retrieval is the foundation.** The harness confirmed that 13% of expected chunks weren't making it into the top 3 results. Without measuring retrieval independently, this failure would have been invisible — grounding and persona can mask it if the model happens to answer correctly anyway.

**Separate judges catch what a composite score hides.** Mitch's grounding (2.93 at baseline) was the weakest dimension across both puppies — but her persona (3.80) was the strongest. A single composite score would have averaged these into something that looked mediocre-but-fine. The separate scores made the actual problem obvious.

**The comparison view is the killer feature.** The list view is useful. The detail view is useful. But the moment you select two runs, hit compare, and see exactly which questions regressed — that's when evals stop feeling like overhead. Building this before running experiments was the right call.

---

## Roadmap

**v0.2**
- Automated regression alerts (notify when scores drop below threshold)
- Experiment 1: model swap (GPT-3.5 → Claude Haiku on the chatbot side)
- Mitch persona prompt experiment
- Synthetic data expansion for the golden sets
- Cost tracking per run

**v1.0**
- Support evaluating multiple chatbots (not just Gus and Mitch)
- Scheduled eval runs with drift detection

---

## License

MIT
