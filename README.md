# Model Budget Planner

Plan a project, set a budget, and see which AI models to use for each part of it.

Try it: https://model-budget-planner.vercel.app

![Plan for a habit tracker at a $20 budget](docs/plan.png)

## The pain

The #1 complaint me and other developers who build with AI have had lately: it's just gotten too expensive. You see videos of Claude limits being used up after one prompt, and jokes about taking out a loan just to make a 3D model with GPT Astra.

Only a small part of the AI native crowd knows how to offset costs, or which open-weight models are just as good as closed source ones. Keeping up with AI is practically a full time job. New models, new benchmarks, it's hard to keep up with what's performing well even in the mainstream, let alone open-weight models and labs outside the US. A lot of builders also don't know which models keep their data, or what performs best for each task.

I faced this problem myself. I accidentally spent hundreds on coding agents because I thought I needed Fable to have a good outcome on my projects, when I could have been using lighter models for tasks that don't need heavy reasoning.

So I built this. Based on public benchmarks and real cost data, you plan a project, then budget the AI spend to build it with the top performing models for each part.

## How it works

- Describe what you're building and pick which model plans it (ranked by intelligence score, with prices)
- It breaks the project into phases and tasks (planning, coding, UI, tests, review, docs) and sizes each one
- Each task gets the best model your budget can afford. "Why this model" shows the score, the runner up, and how the cost was estimated
- Set your budget with the slider. If the best stack costs less than your budget, it doesn't spend the rest
- Swap or lock a model on any task and everything else rebalances to the money that's left
- Requirements: open weights only, zero data retention, fastest models, min context, exclude labs, and a minimum score per task type
- Benchmarks tab to see the landscape of all model benchmarks, with your stack highlighted
- News tab to see new model releases and add them to your stack
- Hover over the New badge to see what's new about a model compared to that provider's last one
- Export to Claude Code, Cline, or OpenCode so your agent uses the right model for each task

For example, a habit tracker in Next.js and Postgres: the best stack is $48, at a $20 budget it's $18, and with open weights only it's $3.76.

![Why this model](docs/why-this-model.png)

![Benchmarks](docs/benchmarks.png)

## Why I built it this way

I wanted to see the whole plan and what it costs before spending anything, and make the calls myself. OpenRouter already has Auto Code, which picks models for you while you work, so I didn't build a router.

What I didn't build:

- A router, Auto Code already does that
- Running the tasks, your coding agent does that
- Setting the spending cap in the app. It needs a management key, so the export gives you the command instead
- Accounts and saved plans. You use this at the start of a project and then you're done with it

How I structured it:

- Three layers: domain, server, UI. All the money and model picking logic lives in `domain/` as pure functions with tests, so I could trust the numbers and change the UI without breaking them
- Only the server talks to OpenRouter. The API key never gets to the browser, and every response gets turned into my own types in one file (`server/openrouter.ts`)
- The plan is one piece of state. The stack isn't stored anywhere, it's recalculated from the plan every time you move the slider or swap a model, so it can't get out of sync
- The UI is based on Ramp's dashboard, just type, tables, and numbers. I didn't want it to look like a template

## Skills I used

- My react-composition skill from my [sjb-stack](https://github.com/SamanthaJeanneb/sjb-stack) repo, based on Fernando Rojo's "Composition Is All You Need" talk. It's in `.claude/skills` so my coding agent follows it while building. It's why the three exports are separate components instead of one component with an `agent="cline"` prop
- Next.js 16, React 19, TypeScript, Tailwind, Radix, Motion, Zod to check API responses, and Vitest

## APIs I used and why

All from OpenRouter:

- **Models API:** prices, release dates, context length, open weights, zero data retention. This is the planning dropdown, the New tags, the requirements, and the New models tab
- **Benchmarks API:** Artificial Analysis intelligence, coding, and agentic scores. This is how each task picks its model, and the Benchmarks tab
- **Datasets API (session cost):** the real median cost of Claude Code sessions per model. I used this for the cost estimate instead of guessing tokens, since most of what an agent costs is re-reading context and retrying
- **Classifications API:** what each model is most used for, shown when you hover the New badge
- **Chat Completions:** makes the plan, with structured JSON output and streaming

## Technical choices

- **Model selection:** each task type uses the score that fits it. Coding for coding and UI, agentic for tests, intelligence for planning, review, and docs. If a model doesn't have that score it falls back to intelligence. Every task starts on the cheapest option, then it keeps upgrading wherever it gets the most points per dollar until the budget runs out
- **Routing:** nothing routes while it runs. The export puts each task's model in your coding agent's config
- **Fallbacks:** the plan request sends the model you picked plus the next two, so if one is down the plan still comes back
- **Streaming:** tasks show up one at a time as the plan is written, instead of waiting on a spinner

## Learnings

- Session cost data only exists for a few coding agents and 44 models, so everything else is estimated off the closest priced model and labeled "estimated"
- There are no percentiles, just medians, so worst case uses the median of the next session length up
- A lot of models are missing scores, so tasks fall back to intelligence, and the planning dropdown only shows models that have one
- My key isn't a management key, so the app can't set your budget. The export gives you the command
- Claude Code only has 4 model levels, so the export makes a helper agent for each task type with its own model

## Run it locally

```bash
pnpm install
echo "OPEN_ROUTER_API_KEY=your-key" > .env.local
pnpm dev
```

Tests: `pnpm vitest run`
