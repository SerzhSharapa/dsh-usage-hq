<h1 align="center">dsh-usage-hq</h1>

<p align="center">A DeepSeek Harness plugin that shows coding-subscription limits and PAYG balances in the sidebar — a maintained fork of <code>@linxin666/dsh-usage</code> with an HQ-limits widget.</p>

<p align="center">
  <a href="#english">English</a> ·
  <a href="#русский">Русский</a> ·
  <a href="#中文">中文</a>
</p>

<p align="center">
  <img alt="license" src="https://img.shields.io/badge/license-Apache--2.0-blue" />
  <img alt="fork" src="https://img.shields.io/badge/fork%20of-&#64;linxin666%2Fdsh--usage-8A2BE2" />
  <img alt="base" src="https://img.shields.io/badge/upstream%20base-0.4.4-green" />
</p>

<p align="center">
  <img alt="Expanded limits widget" src="docs/screenshot-expanded.png" width="280" />
  &nbsp;&nbsp;
  <img alt="Collapsed limits strip" src="docs/screenshot-collapsed.png" width="280" />
</p>

# English

## What it does

The plugin adds to DeepSeek Harness:

- a **Settings → Usage Statistics** panel: token spend, per-provider balances, the Plans tab with subscription quota windows (5h / week / month) and reset times;
- a **sidebar limits widget** (this fork's focus): a `LIMITS` card with one block per subscription provider — logo, name, dominant percent, one row per window with a 5px bar, percent and a live reset countdown — plus a dimmed **PAYG** block for pay-as-you-go providers with a live balance, and a collapsed strip of logo + hottest-percent chips.

## Differences from upstream

`dsh-usage-hq` is a fork of [`@linxin666/dsh-usage`](https://github.com/zhu1090093659/dsh-web) (Apache-2.0). Everything below lives in versioned `src/` instead of hot-patched `node_modules`:

| # | Change |
|---|--------|
| 1 | Locale fallback inverted: non-Chinese UI languages get English (upstream fell back to Chinese) |
| 2 | Provider logos: official marks rendered in `currentColor` for OpenAI, Z.AI, Kimi, OpenCode Go, MiniMax, DeepSeek, Moonshot, OpenRouter, SiliconFlow; unknown providers get a neutral dot |
| 3 | Final limits widget layout: hierarchical provider blocks (approved by the maintainer), replacing the single-line layout |
| 4 | Kimi parser updated to the new `body.usages` API (`limit_5h`, `limit_month_total`, `limit_month_code`); Kimi has no weekly window — none is invented |
| 5 | Reset countdowns next to each window percent (`4h12m`, `6d3h`, `reset`); the `month-code` window stays on the Plans tab only |
| 6 | Codex Lite: the API reports a weekly window only — the widget does not fake a 5h window |
| 7 | The widget is subscriptions-only: today's token counters and balances moved out (they remain in Settings) |
| 8 | PAYG balances: a separate dimmed block below subscriptions with $1/$10 color thresholds (CNY converted at /7.2) |

## Architecture

```text
┌──────────────────── DeepSeek Harness ────────────────────┐
│                                                          │
│  ┌─────────────── host (lib/index.js) ────────────────┐  │
│  │ usage ledger · provider plan/balance probes        │  │
│  │ dsh-usage.* RPC routes                             │  │
│  └──────────────────────┬─────────────────────────────┘  │
│                          │ overview snapshot              │
│  ┌──────────────────────▼─────────────────────────────┐  │
│  │              client (lib/client.js)                │  │
│  │  UsageFootCard (limits widget · PAYG · chips)      │  │
│  │  UsageSectionCard (settings: usage/plans/bank)     │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## Quick Start

Build from source (pnpm ≥ 9, Node ≥ 22):

```bash
pnpm install
pnpm build     # tsc -p tsconfig.build.json && tsdown → lib/
pnpm test      # vitest, 150 tests
```

Install into a DSH profile (the way this repository's author runs it): pack the package, then reference the tarball from the profile's `package.json` and add the plugin row to `dsh.profile.bundles` — the bundled `cordis.patch.yml` (id `hq-usage`) inserts the plugin row itself. Restart DSH afterwards; the host half loads on startup.

## Credits & license

- Fork of [@linxin666/dsh-usage](https://github.com/zhu1090093659/dsh-web) — all engine work (provider adapters, host probes, ledger, i18n, settings UI) is upstream's; see [NOTICE](NOTICE) and [LICENSE](LICENSE) (Apache-2.0).
- Logo files in [docs/logos](docs/logos) are trademarks of their respective owners, used for provider identification only; sources are listed in [docs/logos/SOURCES.md](docs/logos/SOURCES.md).
