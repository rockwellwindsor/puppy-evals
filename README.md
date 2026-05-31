# puppy-evals

> **Status: actively building — v0.1.0 in progress**

An evaluation harness for the RAG chatbot at windsordevelopmentstudio.io. Measures three things independently: did the right Pinecone chunks get retrieved (retrieval quality), did the answer use them or hallucinate (grounding), and did Gus or Mitch stay in character (persona consistency). Catches regressions when models, prompts, or retrieval parameters change.

---

## What this is

The portfolio site at windsordevelopmentstudio.io hosts two dog-persona chatbots — Gus and Mitch — powered by a RAG pipeline (Pinecone + GPT-3.5-turbo). This repo is the evaluation harness that measures how well they perform, and whether changes make them better or worse.

Most RAG systems ship without evaluation infrastructure. This one doesn't.

## Architecture

```
puppy-evals (this repo)
    ↓ calls
POST /api/chat/eval  (windsor_design_studio, API-key gated)
    ↓ returns
answer + retrieved_chunks + model + latency + tokens
    ↓ scored by
retrieval judge (pure math, recall@k)
grounding judge  (Claude Haiku, 1-5 score)
persona judge    (Claude Haiku, 1-5 score)
    ↓ stored in
Postgres (Neon) → Next.js dashboard
```

## Coming soon

- [ ] Golden set (60 Q/A pairs across Gus and Mitch)
- [ ] Three independent judges (retrieval, grounding, persona)
- [ ] CLI runner (`npm run evals -- run --label "baseline"`)
- [ ] Dashboard: list, detail, and comparison views
- [ ] Three documented experiments with before/after data

## License

MIT
