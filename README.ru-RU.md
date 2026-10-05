<h1 align="center">dsh-usage-hq</h1>

<p align="center">Плагин для DeepSeek Harness: лимиты coding-подписок и PAYG-балансы в сайдбаре — поддерживаемый форк <code>@linxin666/dsh-usage</code> с виджетом лимитов HQ.</p>

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
  <img alt="Развёрнутый виджет лимитов" src="docs/screenshot-expanded.png" width="280" />
  &nbsp;&nbsp;
  <img alt="Свёрнутая полоска лимитов" src="docs/screenshot-collapsed.png" width="280" />
</p>

# Русский

## Что делает

Плагин добавляет в DeepSeek Harness:

- панель **Settings → Usage Statistics**: расход токенов, балансы провайдеров, вкладку Plans с окнами квот подписок (5ч / неделя / месяц) и временем сброса;
- **виджет лимитов в сайдбаре** (фокус этого форка): карточка `LIMITS` с блоком на каждого подписочного провайдера — лого, имя, доминирующий процент, строка на каждое окно с полосой 5px, процентом и живым таймером сброса — плюс приглушённый блок **PAYG** для pay-as-you-go провайдеров с живым балансом и свёрнутая полоска из чипов «лого + самый горячий процент».

## Отличия от upstream

`dsh-usage-hq` — форк [`@linxin666/dsh-usage`](https://github.com/zhu1090093659/dsh-web) (Apache-2.0). Всё перечисленное живёт в версионируемых `src/`, а не в хотфикс-патчах `node_modules`:

| # | Изменение |
|---|-----------|
| 1 | Языковой фолбэк инвертирован: не-китайские локали получают английский (upstream по умолчанию показывал китайский) |
| 2 | Лого провайдеров: официальные знаки в `currentColor` для OpenAI, Z.AI, Kimi, OpenCode Go, MiniMax, DeepSeek, Moonshot, OpenRouter, SiliconFlow; неизвестные — нейтральная точка |
| 3 | Финальная компоновка виджета лимитов: иерархические блоки провайдеров (утверждено владельцем) вместо однострочного макета |
| 4 | Парсер Kimi обновлён под новый API `body.usages` (`limit_5h`, `limit_month_total`, `limit_month_code`); недельного окна у Kimi нет — фиктивное не рисуется |
| 5 | Таймеры сброса рядом с процентом каждого окна (`4h12m`, `6d3h`, `reset`); окно `month-code` остаётся только на вкладке Plans |
| 6 | Codex Lite: API отдаёт только недельное окно — виджет не рисует фиктивные 5 часов |
| 7 | Виджет — только про подписки: счётчики токенов за день и балансы вынесены (остались в Settings) |
| 8 | PAYG-балансы: отдельный приглушённый блок под подписками с цветовыми порогами $1/$10 (CNY пересчитывается /7.2) |

## Архитектура

```text
┌──────────────────── DeepSeek Harness ────────────────────┐
│                                                          │
│  ┌─────────────── host (lib/index.js) ────────────────┐  │
│  │ usage ledger · пробы планов/балансов провайдеров   │  │
│  │ RPC-маршруты dsh-usage.*                           │  │
│  └──────────────────────┬─────────────────────────────┘  │
│                          │ снимок overview                │
│  ┌──────────────────────▼─────────────────────────────┐  │
│  │              client (lib/client.js)                │  │
│  │  UsageFootCard (виджет лимитов · PAYG · чипы)      │  │
│  │  UsageSectionCard (настройки: usage/plans/bank)    │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## Быстрый старт

Сборка из исходников (pnpm ≥ 9, Node ≥ 22):

```bash
pnpm install
pnpm build     # tsc -p tsconfig.build.json && tsdown → lib/
pnpm test      # vitest, 150 тестов
```

Установка в профиль DSH (так это делает автор репозитория): запаковать пакет, подключить тарбол в `package.json` профиля и добавить строку плагина в `dsh.profile.bundles` — собственный `cordis.patch.yml` (id `hq-usage`) вставляет plugin row сам. После подмены перезапустить DSH — host-половина загружается на старте.

## Кредиты и лицензия

- Форк [@linxin666/dsh-usage](https://github.com/zhu1090093659/dsh-web) — вся движковая работа (адаптеры провайдеров, host-пробы, ledger, i18n, UI настроек) принадлежит upstream; см. [NOTICE](NOTICE) и [LICENSE](LICENSE) (Apache-2.0).
- Файлы лого в [docs/logos](docs/logos) — товарные знаки их владельцев, используются только для идентификации провайдеров; источники — в [docs/logos/SOURCES.md](docs/logos/SOURCES.md).
