# dsh-usage-hq

## What This Is

Собственный форк npm-плагина `@linxin666/dsh-usage@0.4.4` для DeepSeek Harness
(upstream: github.com/zhu1090093659/dsh-web, Apache-2.0). Плагин показывает в DSH расход
токенов и балансы API-ключей (Settings → Usage Statistics), квоты coding-подписок
(GLM Coding Plan, Kimi For Coding, Codex/ChatGPT, OpenCode Go, MiniMax) с процентами и
временем сброса по окнам 5ч/нед/мес (вкладка Plans) и карточку-виджет внизу сайдбара.
Форк переносит пять локальных патчей, сейчас живущих прямо в `node_modules` установленного
плагина (и слетающих при любом обновлении), в собственные исходники, собирает свой пакет
`dsh-usage-hq` и публикует его в открытый GitHub-репозиторий владельца.

## Core Value

Локальные доработки виджета лимитов и парсеров провайдеров должны жить в версионируемых
исходниках собственного плагина, а не в хрупких патчах `node_modules`: после форка
обновление/переустановка не уничтожает рабочий виджет.

## Requirements

### Validated

(Пока нет — текущий код upstream с патчами работает, но не версионируется; ship to validate)

### Active

- [ ] Скопировать пакет `@linxin666/dsh-usage@0.4.4` (lib, src, конфиги) как стартовую базу с сохранением Apache-2.0 и NOTICE/кредита автору
- [ ] Переименовать пакет в `dsh-usage-hq`, plugin/bundle id сменить на `hq-usage` (со сменой id в собственном cordis.patch.yml пакета и в профиле desktop)
- [ ] Перенести патч 1 (язык: фолбэк инвертирован, не-en → английский, не китайский) в `src/`
- [ ] Перенести патч 2 (данные виджета: `providerLogo` + `planRows` — короткие имена OpenAI / ZAI (GLM) / Kimi, порядок OpenAI → ZAI → Kimi → остальные по алфавиту, метки окон 5h/wk/mo/mo-code, официальные SVG-лого в currentColor) в `src/`
- [ ] Перенести патч 3 (рендер виджета: строка на провайдера — лого + колонка имени 64px ellipsis + шкалы bar/barFill/barWarn≥50%/barLow≥80% с меткой окна и %) в `src/`
- [ ] Перенести патч 4 (Kimi: новый формат API `body.usages` — окна month/month-code из limit_5h/limit_month_total/limit_month_code, percent=used_ratio*100, resetsAt из reset_time, дедуп по key) в `src/`
- [ ] Сборка `pnpm build` (tsc + tsdown) зелёная; тесты `vitest` upstream пройдены, наши доработки покрыты новыми тестами
- [ ] README на трёх языках (EN/RU/ZH, переключатель в шапке) по readme-skill: скриншот виджета, отличия от upstream, установка, кредиты — только подтверждённые факты
- [ ] Публикация в GitHub `SerzhSharapa/dsh-usage-hq` (публичный), лицензия Apache-2.0, без секретов/приватных путей
- [ ] Подмена в профиле `~/.dsh/profiles/desktop`: remove старого пакета, подключение tarball по file:, запись в dsh.profile.bundles, перезапуск DSH
- [ ] Верификация после перезапуска: виджет (лого, сетка шкал, порядок OpenAI → ZAI (GLM) → Kimi; OpenAI одна шкала wk на всю ширину; ZAI 5h+wk; Kimi 5h+mo(+mo-code)), Plans-вкладка совпадает с provider-snapshots.json, node --check артефактов, нет дубля id `usage` в конфиге профиля

### Out of Scope

- Русский словарь виджета — выбрана стратегия «английский для не-zh локалей», не добавлять без прямого запроса
- «Починка» Codex Lite: у тарифа `prolite` API отдаёт только `primary_window` (week), 5-часового окна нет — не рисовать фиктивные 0%
- Недельное окно Kimi — у Kimi его нет в API, это не баг
- Пуш в upstream-репозиторий автора — без отдельного решения владельца (опциональный PR с фиксом Kimi-парсера — отдельная задача позже)
- Изменение установок Codex/Claude и других профилей DSH

## Context

- Исходная точка: установленный `~/.dsh/profiles/desktop/node_modules/@linxin666/dsh-usage@0.4.4`, upstream кладёт в npm-пакет и `lib`, и `src`, и конфиги.
- Рабочие стейты плагина: `~/.dsh/dsh-usage/provider-snapshots.json` (квоты, опрос 60 с) и `usage-ledger.json` (расход); креды из `~/.dsh/.credentials.yaml` (refs/env + OAuth-гранты). Виджет обновляется 30 с.
- Патчи точно локализованы в upstream-файлах: `lib/client.js` (`dictionary()` ~стр.182; HQ-функции `providerLogo`/`planRows` ~стр.1886–1940; рендер `UsageFootCard`, маркер `data-dsh-part: foot-card-plans`) и `lib/index.js` (адаптер `KIMI_CODING.parse`).
- Детали патчей (SVG-лого, CSS-классы шкал, форматы окон) зафиксированы в `KICKOFF.md` этого репозитория — он входной документ проекта.
- Соседние плагины `dsh-stt-multi` и `dsh-tls-fallback` — образец именования (unscoped), сборки tarball и подключения по `file:` в профиль desktop.
- Известная ловушка песочницы DSH: npm-кэш вне ~/hq падает с EPERM → `--cache ~/hq/...` (см. toolkit/DSH-WORKFLOWS.md).
- Методология: GSD Core (DSH-комплект `toolkit/dsh/gsd/`), dispatch субагентов по ADAPTER.md.

## Constraints

- **Лицензия**: Apache-2.0 с сохранением кредита автору `@linxin666` — обязательное наследие upstream, MIT нельзя
- **Публикация**: открытый GitHub `SerzhSharapa/dsh-usage-hq` — решение владельца от 04.10.2026; перед выкладкой проверить отсутствие секретов, ключей, приватных путей, тяжёлых артефактов
- **Модели**: исполнители и координатор — Kimi (`kimi-coding`: `kimi-for-coding`, `kimi-for-coding-highspeed`); `openai-codex` НЕ использовать (недельный лимит Codex Lite выжат, сброс ~10.10.2026 14:07 МСК); GLM (`zai-coding-cn`, max) разрешён как fallback. Override toolkit/dsh/model-routing.md для этого проекта; выбор явно через `subagent` с provider/model
- **Сборка**: pnpm + tsc + tsdown, тесты vitest; npm-кэш только внутри ~/hq (EPERM-ловушка)
- **Профиль**: трогается только `~/.dsh/profiles/desktop`; подмена пакета требует перезапуска DSH (host-половина)
- **Песочница**: `.planning/` только в этой папке; GSD-комплект не переустанавливать

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Форк вместо PR в upstream | 5 локальных патчей в node_modules слетают при обновлении; нужен версионируемый свой пакет | — Pending |
| Имя пакета `dsh-usage-hq` (unscoped) | По аналогии с `dsh-stt-multi` и `dsh-tls-fallback` (решение владельца 04.10.2026) | — Pending |
| Plugin id `hq-usage` (не `usage`) | Явный id форка; требует правок собственного cordis.patch.yml и dsh.profile.bundles (решение владельца 04.10.2026) | — Pending |
| Английский для не-zh локалей | Русского словаря у upstream нет; инвертированный фолбэк `startsWith("zh") ? zh : en` | ✓ Good (работает в патче) |
| Codex Lite: только week-окно | API фактически отдаёт только `primary_window`; фиктивный 5h-0% вводил бы в заблуждение | ✓ Good (подтверждено API) |
| Kimi: окна month/month-code из `body.usages` | Kimi сменил формат API; недельного окна нет и не будет рисоваться | ✓ Good (работает в патче) |
| GitHub публичный, Apache-2.0 | Полезно сообществу; лицензия наследуется от upstream | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-10-04 after initialization*
