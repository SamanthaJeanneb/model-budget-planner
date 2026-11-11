# Model Budget Planner

Plan a project, set a budget, and get the best AI model for each part of it.

**Demo:** https://model-budget-planner.vercel.app

## How it works

1. Describe your project and set a budget
2. A planning model breaks it into tasks
3. Each task gets the best model your budget can afford, based on benchmarks and real cost data
4. Swap or lock a model and the rest rebalance
5. Export to Claude Code, Cline, or OpenCode

## The pain

Building with AI has gotten too expensive, and keeping up with which models are actually good is basically a full-time job. Most people don't know which open-weight models are as good as closed ones, or which models keep their data.

I faced this myself. I accidentally spent hundreds on coding agents because I thought I needed Fable to get a good outcome, when lighter models could have handled most of the tasks.

## What I didn't build

- **A router that switches models while you work.** OpenRouter's Auto Code already does that. This is for planning before you spend
- **Running the tasks.** Your coding agent does that
- **Setting the spending cap in the app.** It needs a management key, so the export gives you the command

## Technical choices

- **Model selection:** each task type uses an Artificial Analysis score (coding, agentic, or intelligence). Every task starts on the cheapest option, then takes the upgrade with the most points per dollar until the budget runs out
- **Routing:** none at runtime. The export writes each task's model into your agent's config
- **Fallbacks:** the plan request sends your planning model plus the next two in the ranking
- **Streaming:** tasks show up one at a time as the plan generates

## Learnings

- OpenRouter's session-cost data only covers a few coding agents and 44 models, so everything else gets a price-scaled estimate
- A lot of models are missing benchmark scores, so tasks fall back to the intelligence score

## Run it locally

```bash
pnpm install
echo "OPEN_ROUTER_API_KEY=your-key" > .env.local
pnpm dev
```
