# Model Budget Planner

What can you build with $5? Describe a project, set a budget, and see which AI model should do each part of it before you spend anything.

**Try it:** https://model-budget-planner.vercel.app

![A habit tracker plan at a $20 budget](docs/plan.png)

## The pain

The #1 complaint from me and other developers building with AI lately: it's just gotten too expensive. Online it's videos of Claude limits running out after one prompt, and jokes about taking out a loan to make a 3D model with GPT Astra.

Only a small part of the AI-native crowd knows how to offset costs, or which open-weight models are just as good as closed ones. Keeping up is basically a full-time job. New models and new benchmarks drop every week, and it's hard to tell what's good even in the mainstream, let alone open-weight models and labs outside the US. Most people also don't know which models keep their data.

So people default to the most expensive model for everything. I did this myself. I accidentally spent hundreds on coding agents because I thought I needed Fable to get a good outcome, when lighter models could have handled most of the work. Writing a migration doesn't need the same reasoning as designing the architecture.

## What it does

You describe what you're building and pick a planning model. The dropdown is ranked by intelligence score with the price next to each. It writes an approach and breaks the project into phases and tasks, each labeled planning, coding, UI, tests, review, or docs, and sized small, medium, or large.

Then every task gets the best model your budget can afford. Click "Why this model" on any task to see the score it was picked on, what the top model would add and cost, the runner-up, and the math behind the cost.

![Why this model](docs/why-this-model.png)

Here's what that looks like on a habit tracker in Next.js and Postgres. The best possible stack costs $48. At a $20 budget it comes out to $18: Fable keeps planning, setup, tests, and review, and GPT-5.6 Sol and Gemini 3.7 Flash take the rest. Sol scores 78 on coding next to Fable 5.1's 81, for $0.81 a task instead of $3.65. Turn on "open weights only" and the whole thing is $3.76 with GLM 5.3 and Kimi K3.1 Pro.

Everything else you can do:

- **Budget:** drag the slider or pick a preset. It shows what the best stack would cost, and if your budget is higher than that, the extra stays unspent
- **Edit the plan:** rename phases, add, remove, or reorder tasks, change a task's type or size
- **Swap or lock a model** on any task, including planning, and every other task rebalances to what's left
- **Requirements:** open weights only, zero data retention, fastest models only, minimum context, exclude labs (there's a Chinese labs preset), and a minimum score per task type. Each one shows what it adds or saves
- **Benchmarks tab:** intelligence, coding, and agentic scores against price, with the best-value models traced and your stack highlighted
- **New models tab:** what came out recently, with "New" tags and an RSS feed. Add one to your stack in one click
- **Export** to Claude Code (a helper agent per task type, each set to its model), Cline (Plan and Act models), or OpenCode

![Benchmarks](docs/benchmarks.png)

## Why this approach

OpenRouter already tells you what's new and what's good, and Auto Code picks a model for each request while you work. What I couldn't find was a way to see the whole plan and what it'll cost before I start, and make the calls myself. That's the gap this fills.

What I didn't build, and why:

- **A router that switches models while you work.** Auto Code already does this well. I wanted the decisions out in the open before any money is spent
- **Running the tasks.** Your coding agent is better at that. This hands it a plan and the right models
- **Setting the spending cap from the app.** That needs an OpenRouter management key, so the export gives you the one command to do it yourself
- **Accounts and saved plans.** Not worth the time for something you use at the start of a project

## Technical choices

**Model selection.** Each task type is scored on the Artificial Analysis index that fits it: coding for coding and UI, agentic for tests, intelligence for planning, review, and docs. If a model doesn't have that score, it falls back to intelligence. To split the budget, every task starts on its cheapest option, then it keeps buying the upgrade that adds the most points per dollar until nothing else fits. That way the money goes where it actually makes a difference. It's one pure function with tests, and it reruns on every change.

**Cost.** Token guesses would be made up, since most of an agent's spend is re-reading context and retrying. So each task size maps to OpenRouter's real median cost for a Claude Code session of that length on that model, from typical to worst case.

**Routing.** Nothing at runtime. The export writes each task's model into your coding agent's config, and OpenRouter handles the requests from there.

**Fallbacks.** The plan is the first thing you see, so if the planning model is down the whole app feels broken. The request sends your pick plus the next two in the ranking, and OpenRouter falls back to them.

**Streaming.** Planning with a strong model takes a bit. The plan streams back as structured JSON and each task shows up the moment it's finished, so you're watching it build instead of a spinner.

**Data.** Models, benchmarks, task popularity, and session costs all come from the OpenRouter API, get parsed in one server file, and are cached for an hour. The API key never touches the browser.

## Learnings

- **I expected cost data for every coding agent.** OpenRouter only publishes it for a few (Claude Code, Codex, Hermes, Kilo Code), and only 44 models have Claude Code numbers. Everything else gets estimated from the closest-priced model that has data, and the app labels it "estimated"
- **I expected a range.** The data only gives a median per session length, so "worst case" uses the median of the next length up
- **Scores have holes.** Only 57 models have an intelligence score, 152 have coding, and 108 have agentic. A task falls back to intelligence when its own score is missing, and the planning dropdown only shows models that have one
- **I couldn't set the budget for you.** That needs a management key, which a normal API key isn't. The export shows the command instead
- **Claude Code only has 4 model levels** in its settings, so the export also writes a helper agent file for each task type with its own model

## Run it locally

```bash
pnpm install
echo "OPEN_ROUTER_API_KEY=your-key" > .env.local
pnpm dev
```

Tests: `pnpm vitest run`
