# Model Budget Planner

Plan a project, set a budget, and see which AI models to use for each part of it.

Try it: https://model-budget-planner.vercel.app

![Plan](docs/plan.png)

## The pain

The #1 complaint me and other developers who build with AI have had lately: it's just gotten too expensive. Keeping up with AI is practically a full time job, and it's hard to know which models are actually worth it, especially open-weight ones.

I faced this myself. I accidentally spent hundreds on coding agents because I thought I needed Fable to have a good outcome, when I could have been using lighter models for tasks that don't need heavy reasoning.

## How it works

- Describe your project and set a budget
- A planning model breaks it into tasks, and each task gets the best model your budget can afford
- Swap or lock any model and the rest rebalance
- Set requirements like open weights only or zero data retention
- Benchmarks tab to see the landscape of all model benchmarks
- News tab to see new model releases
- Hover over the New badge to see what's new about a model compared to that provider's last one
- Export to Claude Code, Cline, or OpenCode

![Why this model](docs/why-this-model.png)

## Why I built it this way

I wanted to see the whole plan and what it costs before spending anything. OpenRouter's Auto Code already picks models while you work, so I didn't build a router. The export just puts each task's model in your coding agent's config. I also didn't build accounts or have it run the tasks, your coding agent does that.

All the budget logic is pure functions with tests, and only the server talks to OpenRouter so the key stays private. I used my react-composition skill from [sjb-stack](https://github.com/SamanthaJeanneb/sjb-stack) so my coding agent kept the components clean.

Built with Next.js, React, TypeScript, Tailwind, and Vitest.

## APIs

- Models: prices, release dates, requirements, and the News tab
- Benchmarks: picks the model for each task, and the Benchmarks tab
- Datasets (session cost): the real cost of coding sessions per model, for the estimates
- Classifications: what each model is most used for
- Chat Completions: writes the plan, streamed, and falls back to the next two models if yours is down

## Learnings

- Real cost data only exists for 44 models, so the rest are estimated from the closest priced one
- A lot of models are missing benchmark scores, so tasks fall back to the intelligence score
- Claude Code only has 4 model levels, so the export makes a helper agent for each task type

## Run it locally

```bash
pnpm install
echo "OPEN_ROUTER_API_KEY=your-key" > .env.local
pnpm dev
```
