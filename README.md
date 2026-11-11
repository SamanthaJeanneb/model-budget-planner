# Model Budget Planner

Plan a project, set a budget, and get the best AI model for each part of it, so you don't spend Fable money on tasks a lighter model can do.

<!-- Demo: add deployed URL or screen recording -->

## How it works

1. Describe your project and set a budget
2. A planning model you choose breaks it into tasks: planning, coding, UI, tests, review, docs
3. Each task gets the best model your budget can afford, based on public benchmarks and real cost data
4. Lock or swap any model and the rest rebalance to the money that's left
5. Export the plan to Claude Code, Cline, or OpenCode so your agent uses the right model for each task

## The pain

The #1 complaint from me and other developers building with AI lately: it's just gotten too expensive. Online, it's videos of Claude limits running out after one prompt and jokes about taking out a loan just to make a 3D model with GPT Astra.

Only a small part of the AI-native crowd knows how to offset costs, or which open-weight models are just as good as closed models. Keeping up with AI is basically a full-time job. There are new model releases and new benchmarks every week. It's hard to keep up with what's performing well even in the mainstream, let alone open-weight models and models from labs outside the US.

A lot of builders also struggle to know which models aren't keeping their data, and what performs best for each task. So many people spend hundreds on Fable or Astra when they don't need that much reasoning power for every part of their project.

I faced this problem myself. I accidentally spent hundreds on coding agents because I thought I needed Fable to get a good outcome on my projects, when I could have used lighter models for the tasks that don't need heavy reasoning.

That's why I built this. Using public benchmarks and real cost data, it lets you plan a project, then budget the AI spend to build it using the top-performing models for each part.

## Why this approach

### What I built

- A planning model you choose breaks your project into phases and tasks. The dropdown is ranked by intelligence score, with prices
- Each task gets the best model your budget can afford, with the score it was picked on, the runner-up, and what it would cost
- The budget is a cap, not a target. Leftover money stays unspent, and if the budget is too low it tells you the minimum that works
- Cheaper picks show what you give up in points and what you save, and flag when the model is open-weight or from a Chinese lab
- Requirements: minimum score per task type, open-weights only, exclude labs, zero data retention, minimum context, fast only. Each one shows what it adds to the cost
- News and Benchmarks tabs, with "New" tags on models from the last 14 days and your stack highlighted
- Export to Claude Code, Cline, or OpenCode

### What I deliberately didn't build

- **A router that switches models while you work.** OpenRouter's Auto Code already does that. This is for seeing and controlling the plan before you spend anything
- **Running the tasks.** It plans and exports; your coding agent does the building
- **Setting the spending cap from the app.** That needs a management key, so the export gives you the command to set it yourself
- **Accounts and saved plans.** Not needed to show the idea
- **Cost data for Cline and OpenCode.** OpenRouter doesn't publish it, so estimates use Claude Code session data and the app says so

## Technical choices

### Model selection

Each task type is matched to an Artificial Analysis score: intelligence for planning, review and docs, coding for coding and UI, agentic for tests. If a model is missing that score, it falls back to its intelligence score.

Allocation is one pure, unit-tested function. It drops models that fail your requirements and keeps only the ones no cheaper model beats. Every task starts on the cheapest option, then it keeps taking the upgrade that adds the most points per extra dollar until nothing else fits. It re-runs on every slider move, swap, or lock.

Cost: each task is sized small, medium, or large and mapped to OpenRouter's real median Claude Code session cost for that model. The range goes from typical to worst case, and every task has a "show math" line.

### Routing

No routing at runtime. The export writes each task's model into your coding agent's config, and OpenRouter handles the requests from there. For Claude Code, that's one helper agent per task type plus the model settings.

### Fallbacks

The plan request sends your chosen planning model plus the next two in the ranking, so if one is down, the next one answers.

### Streaming

The plan streams back as structured JSON, and tasks show up one at a time as they finish instead of after a spinner.

### Data

Models, Benchmarks, Classifications, and session-cost data from the OpenRouter API, parsed in one server file and cached for an hour. The API key never reaches the browser.

## Learnings

- Session-cost data only covers a few coding agents (Claude Code, Codex, Hermes, Kilo Code), and only 44 models have Claude Code rows. Everything else gets a price-scaled estimate, labeled "estimated"
- There are no percentiles, just a median per session-length bucket, so "worst case" uses the median of the next bucket up
- Scores are patchy: 57 models have an intelligence score, 152 have coding, and 108 have agentic. Tasks fall back to intelligence when their own score is missing
- My API key isn't a management key, so the app can't set the workspace budget. The export shows the command instead
- Claude Code only has 4 model levels in its settings, so the export also writes a helper agent file per task type with its own model

## Run it locally

```bash
pnpm install
echo "OPEN_ROUTER_API_KEY=your-key" > .env.local
pnpm dev
```

Tests: `pnpm vitest run`
