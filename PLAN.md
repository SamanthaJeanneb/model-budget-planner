# Build plan: Model Budget Planner

A 1-hour build. You describe a project and set a budget; a planning model splits it into tasks; each task gets the best model the budget can afford; you export the result to Claude Code, Cline or OpenCode.

## What the live APIs can and can't do

Checked against OpenRouter with the project key on 10 Nov 2026.

| Finding | Consequence |
|---|---|
| Session-cost data covers `claude-code`, `codex`, `hermes-agent`, `kilo-code` only. No Cline or OpenCode. | Cost uses Claude Code rows for every export target; the UI says so. |
| Session cost gives one number per cell: the median, per turn bucket (`1`, `2-9`, `10-49`, `50+` turns). No percentiles. | "Typical to worst case" = median of the task's bucket to median of the next bucket up. |
| Only 44 models have Claude Code cost rows; 433 models are listed. | Other models get a price-scaled estimate, labelled "estimated". |
| Intelligence score exists for 57 models, coding for 152, agentic for 108. | Planning dropdown lists the 57. A task falls back to intelligence score when its own score is missing. |
| The project key is not a management key (and has a $10 limit). | The app can't set the workspace budget itself; Export shows the one curl command and settings link. |

## Stack

- Next.js (App Router, TypeScript, Tailwind), one page with three tabs: **Plan**, **News**, **Benchmarks**. Deploy on Vercel.
- The OpenRouter key stays on the server. The browser only calls our own routes.
- All money and model selection logic is one pure function (`domain/allocate.ts`) with unit tests. The UI re-runs it on every slider move, swap, lock or requirement change.
- Animation with `motion` (`motion/react`). Primitives from Radix, styled with Tailwind. No component kit with a default look.

## Architecture rules

Three layers. Imports only point downward.

| Layer | Folder | May import | Must not contain |
|---|---|---|---|
| Domain | `domain/` | nothing but itself | React, `fetch`, `process.env`, dates from `Date.now()` (pass `now` in) |
| Server | `server/`, `app/api/` | `domain/` | React, UI strings |
| UI | `app/`, `components/` | `domain/` types and functions, our own API routes | OpenRouter URLs, the API key, allocation or cost math |

- **One shape per concept.** OpenRouter responses are parsed once, in `server/openrouter.ts`, into our own types (`Model`, `Task`, `Stack`, `CostRange`). Nothing outside that file sees a raw OpenRouter field name.
- **Routes are thin.** A route validates input, calls one server function, returns the result. No logic in the handler.
- **Domain functions are pure and total.** Same input, same output; missing data returns a typed "unknown", never `NaN` or a thrown error.
- **State lives in one place.** The plan (tasks, budget, requirements, locks) is one reducer in `PlanProvider`. The stack is derived from it by calling `allocate`; it is never stored or synced.
- **Every constant has a name and a home.** Task-to-score map, size-to-turn-bucket map, lab presets and the 14-day window live in `domain/rules.ts`, not inline.
- **Small files.** One component per file, about 150 lines at most. If a file needs section comments, split it.
- **No dead flexibility.** No options, generics or abstractions without a second caller.
- TypeScript `strict`, no `any`, no non-null `!`. ESLint and Prettier run before each commit.

## Files

| File | Job |
|---|---|
| `domain/types.ts`, `domain/rules.ts` | Shared types; every mapping and threshold |
| `domain/allocate.ts` + test | Budget allocation, swaps, locks, requirement cost |
| `domain/cost.ts` + test | Per-task cost range and the math behind it |
| `domain/export.ts` + test | Config files for Claude Code, Cline, OpenCode, as plain strings |
| `server/openrouter.ts` | The five endpoints, parsed into domain types, cached 1 hour |
| `server/catalog.ts` | Merges models, benchmarks, session cost and classifications |
| `app/api/catalog/route.ts`, `app/api/plan/route.ts` | Thin routes; `plan` streams the task list |
| `components/plan/` | `Plan.Provider`, `Plan.Brief`, `Plan.Budget`, `Plan.Tasks`, `Plan.TaskRow`, `Plan.Total` |
| `components/model/` | `Model.Name`, `Model.Score`, `Model.Price`, `Model.NewTag`, `Model.Picker` |
| `components/requirements/`, `components/news/`, `components/leaderboard/`, `components/export/` | One family per folder |
| `components/ui/` | Leaf primitives: `Button`, `Slider`, `Popover`, `Tabs`, `Money` |

## React rules

The full conventions are in `.claude/skills/react-composition/SKILL.md` (copied from `sjb-stack`). Restate them before writing any component. The ones that shape this app:

- **A component's API is its children, not its flags.** No boolean or enum prop that picks a subtree. The Claude Code, Cline and OpenCode exports are three separate trees over shared `Export.*` parts, not `<Export agent="cline" />`.
- **Omission, not negation.** A locked row doesn't render `Model.Picker`; there is no `hidePicker`.
- **JSX over config arrays.** Tabs, requirement controls and table columns are written as children. Mapping the task list or model list to one row component is fine.
- **Providers own state; parts stay agnostic.** `Plan.Provider` exposes `{ state, actions, meta }`. Parts read it through `usePlan()`, which is only called inside `components/plan/`.
- **No reaching across families.** News needs "add to stack", so the plan family exports a `Plan.AddModelButton` part; News does not call `usePlan()`.
- **No hand memoization** and no `useEffect` that copies state. The stack is computed during render.
- Server components fetch the catalog; only interactive parts are client components.

## UI rules

The reference is Ramp's dashboard: calm, mostly white, built from type and tables. If a screen looks like a template, it's wrong.

**Do**

- Lay the page out with whitespace and hairline dividers. The task list is a table with rows, not a grid of cards.
- One typeface (Inter or Geist), two weights. Size and weight make the hierarchy, not colour or boxes.
- One accent colour, used only for the primary action and the selected state. Everything else is neutral greys.
- Tabular numerals, right-aligned, for every figure. Money rounds to the dollar above $10 and to cents below.
- One figure per cell. A task row shows task, model, cost. Score, runner-up and the cost math open on demand in a popover or expanded row.
- Plain sentence-case labels: "Budget", "Tasks", "Requirements".
- Empty, loading and error states for every data region, in the same quiet style.

**Don't**

- No eyebrow text: no small uppercase label sitting above a heading.
- No card around everything. A surface gets a border only when it floats (popover, dialog).
- No gradients, glows, glass, drop shadows on flat content, or emoji as icons.
- No hero banner, tagline, or marketing sentence under the title.
- No row of stat tiles. The total sits once, next to the budget.
- No pills on every row. A row gets at most one tag ("New" or "Popular"), in grey.
- No vague quantifiers or filler ("up to", "approximately", "powerful", "smart"). State the figure or leave it out.
- No tooltip or helper text restating what the label already says.

## Motion rules

Motion explains what changed. It never decorates.

- **Stack re-adjusts:** rows use `layout` so they slide to their new position; a model name that changes cross-fades in place.
- **Figures:** costs and the total tween to their new value over 300 ms when the slider or a swap changes them.
- **Tabs:** the underline is a shared `layoutId` element; tab content fades with a 4 px rise.
- **Popovers, dialog, row expansion:** opacity plus a small scale or height change, with `AnimatePresence` for exit.
- **Plan arriving:** task rows stream in one at a time with a 30 ms stagger.
- Durations 150–250 ms, one ease-out curve, defined once in `components/ui/motion.ts`. Springs only for layout moves.
- Animate `transform` and `opacity` only. Nothing loops, bounces or animates on page load beyond the first fade.
- `MotionConfig reducedMotion="user"` at the root.

## Data sources

| Feature | Endpoint | Fields used |
|---|---|---|
| Model list, prices, New tag, requirements | `GET /api/v1/models` | `created`, `pricing.prompt/completion`, `context_length`, `hugging_face_id` (open weights), `benchmarks.artificial_analysis.{intelligence,coding,agentic}_index`, `supported_parameters`; filters `zdr=true`, `sort=throughput-high-to-low` |
| News tab | `GET /api/v1/models?sort=newest` (RSS link: `?use_rss=true`) | same |
| Leaderboards, "why we picked it" | `GET /api/v1/benchmarks?source=artificial-analysis` | three index scores, `meta.citation` |
| "Popular for this task" badge | `GET /api/v1/classifications/task` | `classifications[].models[]` per tag |
| Cost estimate | `GET /api/v1/datasets/session-cost?app_slug=claude-code` | `median_session_cost_usd` by `model_permaslug` × `turn_range` |
| Planning | `POST /api/v1/chat/completions` | `response_format: json_schema`, `models: [pick, next two]` as fallbacks, `stream: true` |
| Spending cap | `PUT /api/v1/workspaces/{id}/budgets/lifetime` | needs a management key, so shown as a copyable command |

Models join on `canonical_slug` = `model_permaslug`. Benchmark and dataset responses are CC BY 4.0; each tab footer shows the required "Source: OpenRouter … as of {date}" line.

## Rules

**Task type → score and popularity tag**

| Task | Picked on | Popular badge tag |
|---|---|---|
| planning | intelligence | `agent:multi_step_planning` |
| coding | coding | `code:general_impl` |
| UI | coding | `code:frontend_ui` |
| tests | agentic | `code:debugging` |
| review | intelligence | `code:review_security` |
| docs | intelligence | `content_writing` |

**Task size → cost.** The planning model labels each task small, medium or large.

| Size | Typical | Worst case |
|---|---|---|
| small | median of 2–9 turn sessions | median of 10–49 |
| medium | median of 10–49 | median of 50+ |
| large | median of 50+ | 2 × median of 50+ (labelled as a rule of thumb) |

If a model has no Claude Code row: use its row from another agent, else scale a reference model's row by the price ratio. Each task has a "show math" line, e.g. `medium → 10–49 turns → Claude Code median for Opus 5.5 = $1.32 (30 days to 1 Nov)`.

**Allocation** (`allocate(tasks, models, budget, requirements, locks)`):

1. Drop models that fail the requirements. Keep, per score type, only models that no cheaper model beats.
2. Locked tasks keep their model; their typical cost comes off the budget.
3. Start every other task on the cheapest allowed model. If that already exceeds the budget, show the minimum workable budget.
4. Repeatedly take the upgrade with the most score points per extra dollar that still fits. Stop when nothing fits or every task has its top model. Leftover money stays unspent.
5. Return per task: model, score, runner-up and its cost, and the gap to the no-budget-limit stack (points given up, dollars saved, whether the swap is open-weights or from a Chinese lab).

Budget fit uses typical cost. A warning shows if the worst-case total exceeds the budget.

**Requirements.** Minimum score per task type; open-weights only; exclude labs (with a "Chinese labs" preset: qwen, deepseek, z-ai, moonshotai, baidu, tencent, bytedance-seed, minimax, xiaomi, stepfun, inclusionai); zero data retention; minimum context length; fast only (top third by throughput rank). Each active requirement shows its price: stack cost with it minus stack cost without it.

**New tag.** `created` within 14 days. Hover shows the release date and the model's strongest of the three scores.

## Export

| Agent | Output |
|---|---|
| Claude Code | `.claude/agents/{planning,coding,tests,ui,review,docs}.md` with `model:` set to one of four tiers; `.claude/settings.local.json` mapping `ANTHROPIC_DEFAULT_{FABLE,OPUS,SONNET,HAIKU}_MODEL` to OpenRouter slugs plus `ANTHROPIC_BASE_URL=https://openrouter.ai/api`; a `CLAUDE.md` block with the task list and "hand each task to the matching helper". If the stack has more than 4 models, the cheapest task types merge into the nearest tier and the dialog says which. |
| Cline | Plan-mode model = planning model, Act-mode model = coding model, plus a `.clinerules` file with the task list |
| OpenCode | `opencode.json` with one agent per task type, `model: "openrouter/<slug>"` |

All three end with the spending-cap step. OpenRouter's docs warn that Claude Code is only guaranteed with Anthropic models; the dialog repeats that.

## Build order (60 minutes)

| Minutes | Work | Done when |
|---|---|---|
| 0–10 | Scaffold; `server/openrouter.ts`; `/api/catalog` | `curl localhost:3000/api/catalog` returns merged models with scores and costs |
| 10–25 | `domain/cost.ts`, `domain/allocate.ts`, tests | `vitest` passes: budget respected, locks held, $10k budget returns the same stack as the no-limit stack |
| 25–40 | Plan tab: project box, budget slider, planning dropdown, `/api/plan`, task table with swap/lock, why-picked popover, cost math | A real project description yields a priced stack that changes as the slider moves |
| 40–48 | Requirements panel, cheaper-swap notes, New tag, Popular badge | Toggling "open-weights only" changes the stack and shows its cost |
| 48–54 | Benchmarks tab, News tab with "add to stack" | Stack models highlighted; adding a new model re-runs allocation |
| 54–60 | Export dialog; fill in `README.md`; deploy | Exported Claude Code files load in a scratch folder |

**If time runs short, cut in this order:** fast-only requirement, Cline export, RSS link, streaming of the plan (fall back to a spinner), News "add to stack".

## Not building

Accounts, saved plans, running the tasks, setting the budget from the app, cost data specific to Cline or OpenCode (not published).

## Verification

1. `pnpm vitest run` for the allocator and cost rules.
2. `pnpm dev`, then `curl` both API routes; check `/api/plan` returns schema-valid JSON from a non-Anthropic model too.
3. In the browser: enter a project, drag the budget from $1 to $10k, lock one task, swap another, toggle each requirement, add a model from News, open each export.
4. Paste the Claude Code export into a scratch folder and confirm the helper agents appear in `/agents`.

## To confirm at build time

- OpenCode's per-agent config shape (OpenRouter's page only shows the global `model` key; check opencode.ai docs).
- Whether Claude Code agent files accept a full OpenRouter slug in `model:`; if so the 4-model limit can be dropped.
