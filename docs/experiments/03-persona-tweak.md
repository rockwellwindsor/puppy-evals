# Experiment 3 — Gus Persona Prompt Tweak

**Date:** 2026-06-28
**Puppy:** Gus
**Variable changed:** Gus's system prompt in `windsor_design_studio/lib/dogPersonas.ts`
**Control run ID (top_k=5, original prompt):** `73722463-8a61-4e89-8496-9278d7652a69`
**Experiment run ID:** `87bd0b04-c24d-44ad-83b4-d1655485dc1c`

---

## What changed

The original system prompt listed vocabulary words ("indeed," "certainly") but gave the model no example of how to actually use them. The revised prompt added:

- Two concrete example responses showing Gus's sentence structure, em-dash usage, and vocabulary in context
- An explicit constraint: never use exclamation points
- Specific rules for dog references (rare, understated, never obvious)
- A sentence length guide: 2-3 sentences, favour subordinate clauses

---

## Results

Compared against the top_k=5 run (same retrieval depth, persona prompt is the only variable):

| Dimension  | Control (top_k=5) | Experiment | Delta |
|------------|-------------------|------------|-------|
| Retrieval  | 100.0%            | 100.0%     | —     |
| Grounding  | 4.30 / 5          | 3.90 / 5   | -0.40 |
| Persona    | 3.47 / 5          | 4.13 / 5   | **+0.66** |

---

## Analysis

**Persona improved by +0.66** — the largest single-dimension gain across all three experiments. The concrete examples in the revised prompt gave the model a much clearer target. Showing what Gus sounds like is more effective than describing it.

**Grounding dropped by -0.40.** This is the tradeoff. A richer persona prompt gives the model stronger pull toward a specific voice, which appears to occasionally come at the expense of strict factual grounding. The model stays more precisely in character but sometimes adds a flourish that goes slightly beyond what the retrieved chunks strictly support. This is a real cost worth monitoring.

**Net verdict: the tweak is a win.** Persona was the weakest dimension at baseline (3.53). It's now the strongest improvement across all experiments (+0.66). The grounding dip is meaningful but Grounding is still above 3.5, and the purpose of this experiment was explicitly to improve persona. If grounding becomes a concern, the judge prompt can be recalibrated or the system prompt can be tightened further.

---

## Cumulative picture (Gus, all experiments)

| Run | top_k | Retrieval | Grounding | Persona |
|-----|-------|-----------|-----------|---------|
| Baseline | 3 | 86.7% | 4.20 | 3.53 |
| top_k=5 | 5 | 100.0% | 4.30 | 3.47 |
| Persona tweak | 5 | 100.0% | 3.90 | 4.13 |

The persona-tweak run with top_k=5 is the best overall configuration: perfect retrieval, grounding above 3.5, and persona substantially improved from baseline.
