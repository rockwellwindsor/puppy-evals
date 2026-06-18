CREATE TABLE "eval_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"puppy" text NOT NULL,
	"question" text NOT NULL,
	"expected_answer" text,
	"expected_chunks" jsonb,
	"actual_answer" text,
	"retrieved_chunks" jsonb,
	"retrieval_score" real,
	"grounding_score" integer,
	"grounding_reason" text,
	"persona_score" integer,
	"persona_reason" text,
	"latency_ms" integer,
	"cost_usd" real
);
--> statement-breakpoint
CREATE TABLE "eval_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"run_label" text NOT NULL,
	"prompt_version" text,
	"model" text,
	"top_k" integer,
	"golden_set_version" text,
	"aggregate_scores" jsonb
);
--> statement-breakpoint
ALTER TABLE "eval_results" ADD CONSTRAINT "eval_results_run_id_eval_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."eval_runs"("id") ON DELETE cascade ON UPDATE no action;