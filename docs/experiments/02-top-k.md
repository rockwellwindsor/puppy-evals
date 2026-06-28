# Experiment 2 — Tune retrieval top_k (3 → 5)

**Date:** 2026-06-27
**Puppy:** Gus
**Variable changed:** `top_k` passed to the Windsor chatbot endpoint (chunks retrieved from Pinecone)
**Baseline run ID:** `f2cd55d6-5567-445b-94a3-27146595c632`
**Experiment run ID:** `73722463-8a61-4e89-8496-9278d7652a69`

---

## Results

| Dimension  | Baseline (top_k=3) | Experiment (top_k=5) | Delta |
|------------|--------------------|----------------------|-------|
| Retrieval  | 86.7%              | 100.0%               | +13.3% |
| Grounding  | 4.20 / 5           | 4.30 / 5             | +0.10 |
| Persona    | 3.53 / 5           | 3.47 / 5             | -0.06 |

---

## Analysis

**Retrieval jumped from 86.7% to 100%.** This is the clearest finding. The 13.3% gap in the baseline was caused by questions whose expected chunks weren't making it into the top 3 results — increasing to 5 caught them all. Every expected section appeared in the retrieved set.

**Grounding improved slightly (+0.10).** With more relevant context available, the model was marginally better at grounding its answers. The improvement is small — the model was already doing well at grounding with 3 chunks.

**Persona barely moved (-0.06).** Effectively unchanged. The number of retrieved chunks has no meaningful effect on whether Gus sounds like Gus. This is the expected result — persona is a function of the system prompt, not retrieval depth.

---

## Conclusion

Increasing `top_k` from 3 to 5 is a clear win on retrieval with no meaningful downside. The persona score dip of 0.06 is within noise. The grounding improvement is small but positive.

**Recommendation:** Keep `top_k=5` as the new default for future runs. The 13.3% retrieval improvement is significant and comes at negligible extra cost (~15% more input tokens to GPT-3.5).

---

## Mitch results (top_k=5)

**Experiment run ID:** `22800beb-9ef0-4928-be0b-e102ff43b9fd`
**Baseline run ID:** `c0c07af8-ee40-4164-8126-51286e949439`

| Dimension  | Baseline (top_k=3) | Experiment (top_k=5) | Delta |
|------------|--------------------|----------------------|-------|
| Retrieval  | 86.7%              | 100.0%               | +13.3% |
| Grounding  | 2.93 / 5           | 3.43 / 5             | +0.50 |
| Persona    | 3.80 / 5           | 3.90 / 5             | +0.10 |

Mitch's grounding improvement (+0.50) is five times larger than Gus's (+0.10). This explains part of the baseline grounding gap between them — Mitch's enthusiastic style is more prone to embellishment when context is thin. More chunks give the model more to work with and reduce hallucination. The retrieval result is identical to Gus: 100% at top_k=5.

**Final recommendation:** Change the default `top_k` to 5 across all runs. Both puppies benefit on retrieval, and Mitch benefits significantly on grounding.
