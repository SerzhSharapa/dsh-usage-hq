# Phase 1: Форк и перенос патчей - Context

**Gathered:** 2026-10-04
**Status:** Ready for planning
**Mode:** Infrastructure/migration phase — smart discuss пропущен (все решения предрешены KICKOFF.md)

<domain>
## Phase Boundary

Существует собственный пакет `dsh-usage-hq` с plugin/bundle id `hq-usage`, функционально
идентичный текущему пропатченному `@linxin666/dsh-usage@0.4.4` из
`~/.dsh/profiles/desktop/node_modules/`, но с четырьмя доработками, живущими в
версионируемых исходниках `src/`, а не в `node_modules`. Граница фазы: копия базы,
переименование пакета и plugin id, перенос патчей 1–4 в `src/`, подтверждение
поведенческой эквивалентности собранного `lib/` текущему пропатченному. Сборка/тесты —
фаза 2; публикация и подмена профиля — фаза 3.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
Все реализационные решения — на усмотрение исполнителя в рамках точной спецификации
KICKOFF.md: фаза — миграция/переименование, свободных «серых зон» нет.

### Зафиксировано KICKOFF.md (не переобсуждать)
- Имя пакета: `dsh-usage-hq` (unscoped, по аналогии с dsh-stt-multi/dsh-tls-fallback)
- Plugin/bundle id: `hq-usage` (сменить в собственном `cordis.patch.yml` пакета; профиль — фаза 3)
- Патч 1 (язык): фолбэк `startsWith("zh") ? zh : en` — инвертирован; русского словаря нет
- Патч 2 (данные виджета): `providerLogo(id)` + `planRows(snapshot)`; короткие имена
  OpenAI / ZAI (GLM) / Kimi; порядок OpenAI → ZAI → Kimi → остальные по алфавиту; метки
  окон 5h/wk/mo/mo-code; официальные SVG в currentColor (OpenAI 13px, Kimi 11px,
  Z.AI с маской hq-zai-z, неизвестный — кружок)
- Патч 3 (рендер): `UsageFootCard`, маркер `data-dsh-part: foot-card-plans`; строка на
  провайдера: лого + колонка имени 64px (ellipsis) + flex:1 шкалы; классы
  bar/barFill/barWarn(≥50%)/barLow(≥80%) + метка окна и %
- Патч 4 (Kimi): `KIMI_CODING.parse` читает `body.usages` (limit_5h, limit_month_total,
  limit_month_code), percent = used_ratio*100, resetsAt из reset_time, дедуп по key;
  недельного окна нет и не рисуется
- Codex Lite (`prolite`): только `primary_window` (week) — не «чинить», фиктивные 0% не рисовать
- Перенос — побайтовый по смыслу: источник истины для точного содержимого патчей —
  текущие `lib/client.js` и `lib/index.js` в node_modules (патчи уже применены там);
  upstream `src/` в npm-пакете — база, в которую патчи вносятся
- Лицензия Apache-2.0 + NOTICE/кредит `@linxin666` (upstream zhu1090093659/dsh-web)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Источник базы: `~/.dsh/profiles/desktop/node_modules/@linxin666/dsh-usage/` (lib, src, конфиги — upstream кладёт всё в npm-пакет)
- Пропатченные участки: `lib/client.js` (`dictionary()` ~стр.182; `providerLogo`/`planRows` ~стр.1886–1940; рендер `UsageFootCard`, маркер `data-dsh-part: foot-card-plans`), `lib/index.js` (адаптер `KIMI_CODING.parse`)
- Образец именования/подключения: соседние плагины `~/hq/build/dsh-plugins/dsh-stt-multi`, `dsh-tls-fallback`

### Established Patterns
- Сборка upstream: `pnpm build` (tsc + tsdown), тесты `vitest`
- Рабочие стейты плагина: `~/.dsh/dsh-usage/provider-snapshots.json`, `usage-ledger.json`

### Integration Points
- Профиль DSH `~/.dsh/profiles/desktop` (зависимости + `dsh.profile.bundles`) — фаза 3, здесь только подготовка `cordis.patch.yml` пакета под id `hq-usage`

</code_context>

<specifics>
## Specific Ideas

Точное содержимое всех четырёх патчей — в KICKOFF.md (корень репозитория) и в живых
пропатченных файлах node_modules. Эталон эквивалентности — поведенческий diff по
функциям dictionary, providerLogo, planRows, UsageFootCard, KIMI_CODING.parse.

</specifics>

<deferred>
## Deferred Ideas

- PR с фиксом Kimi-парсера в upstream (zhu1090093659/dsh-web) — v2, по отдельному решению владельца
- Русский словарь виджета — только по прямому запросу

</deferred>
