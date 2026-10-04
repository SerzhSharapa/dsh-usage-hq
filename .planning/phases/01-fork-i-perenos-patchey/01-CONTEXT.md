# Phase 1: Форк и перенос патчей - Context

**Gathered:** 2026-10-04
**Status:** Ready for planning
**Mode:** Infrastructure/migration phase — smart discuss пропущен (все решения предрешены KICKOFF.md)

<domain>
## Phase Boundary

Существует собственный пакет `dsh-usage-hq` с plugin/bundle id `hq-usage`, функционально
идентичный текущему пропатченному `@linxin666/dsh-usage@0.4.4` из
`~/.dsh/profiles/desktop/node_modules/`, но с семью доработками, живущими в
версионируемых исходниках `src/`, а не в `node_modules`. Граница фазы: копия базы,
переименование пакета и plugin id, перенос патчей 1–5 и 7–8 (нумерация KICKOFF) в `src/`,
подтверждение поведенческой эквивалентности собранного `lib/` текущему пропатченному
(эталон UI — итерация 5). Сборка/тесты — фаза 2; публикация и подмена профиля — фаза 3.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
Все реализационные решения — на усмотрение исполнителя в рамках точной спецификации
KICKOFF.md: фаза — миграция/переименование, свободных «серых зон» нет.

### Зафиксировано KICKOFF.md (обновлён 04.10.2026 — 7 патчей + факт Codex; не переобсуждать)
- Имя пакета: `dsh-usage-hq` (unscoped, по аналогии с dsh-stt-multi/dsh-tls-fallback)
- Plugin/bundle id: `hq-usage` (сменить в собственном `cordis.patch.yml` пакета; профиль — фаза 3)
- Патч 1 (язык): фолбэк `startsWith("zh") ? zh : en` — инвертирован; русского словаря нет
- Патч 2 (данные виджета): `providerLogo(id)` + `planRows(snapshot)`; короткие имена
  OpenAI / ZAI (GLM) / Kimi / OpenCode / MiniMax; порядок OpenAI → ZAI → Kimi →
  OpenCode → MiniMax → прочие по алфавиту; метки окон 5h/wk/mo (month-code
  отфильтрован из виджета); 8 официальных SVG в currentColor (OpenAI 13px, Kimi 11px,
  Z.AI маска hq-zai-z, MiniMax 13px, OpenCode viewBox 512, DeepSeek 11px,
  Moonshot=знак Kimi, OpenRouter 11px, SiliconFlow viewBox 1024, неизвестный — кружок);
  исходники path-данных взять заново с официальных CDN и закоммитить в docs/
- Патч 3 (рендер, финальный UI итерации 5 — ЭТАЛОН): иерархический макет; заголовок
  провайдера (лого + имя 11px/600 ellipsis flex:1 + доминирующий % справа с порогами
  #dc2626 ≥80 / #d97706 ≥50 / inherit .75); строки окон на всю ширину (метка
  10px/.55/16px + полоса 5px bar/barFill/barWarn/barLow + % 10px minWidth 24px +
  таймер 9.5px/.45 minWidth 28px, оба вправо, tabular-nums); marginTop 6px между
  провайдерами, gap 2px между окнами; отвергнутые компоновки не возвращать
- Патч 4 (Kimi): `KIMI_CODING.parse` читает `body.usages` (limit_5h, limit_month_total,
  limit_month_code), percent = used_ratio*100, resetsAt из reset_time, дедуп по key;
  недельного окна нет и не рисуется
- Патч 5 (таймеры): `planRows` сохраняет resetsAt; `resetCountdown(iso)` → `4h12m` /
  `6d3h` / `reset` / пусто; month-code отфильтрован из виджета (остаётся в Plans)
- Патч 7 (только подписки): удалены usageLine, balances, footMeta; заголовок «LIMITS»
  (10px/600 uppercase ls .09em opacity .6) слева + время обновления справа
- Патч 8 (PAYG): `paygRows` — строки после подписок (credential≠none &&
  balance≠undefined), порядок по алфавиту, hairline-разделитель + «PAYG» 9px/.4,
  строки opacity .72, пороги баланса <$1 #dc2626 / <$10 #d97706 / CNY÷7.2; свёрнутая
  полоска — чипы лого+горячий % (без «LIMITS», flexWrap wrap, влево, marginRight 18px,
  тултип «имя %», загрузка «—»); PAYG в свёрнутом виде не показывать
- Codex Lite (`prolite`): только `primary_window` (week) — не «чинить», фиктивные 0% не рисовать
- Перенос — побайтовый по смыслу: источник истины — текущие `lib/client.js` и
  `lib/index.js` в node_modules (все 7 патчей уже применены там); upstream `src/` в
  npm-пакете — база, в которую патчи вносятся
- Лицензия Apache-2.0 + NOTICE/кредит `@linxin666` (upstream zhu1090093659/dsh-web);
  README объявляет «fork of…»

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Источник базы: `~/.dsh/profiles/desktop/node_modules/@linxin666/dsh-usage/` (lib, src, LICENSE, cordis.patch.yml, icon.svg; конфигов сборки и tests/ в npm НЕТ — берутся из upstream GitHub dev/packages/dsh-usage)
- Пропатченные участки (финальный UI, проверено 04.10.2026 вечером): `lib/client.js` (`dictionary()` ~стр.181; `providerLogo` ~стр.1886; `planRows` ~стр.1910; `paygRows` ~стр.1922; `resetCountdown` ~стр.1934; чипы footStrip ~стр.2052; «LIMITS» ~стр.2084; рендер `foot-card-plans` ~стр.2092; PAYG-блок ~стр.2116), `lib/index.js` (адаптер `KIMI_CODING.parse` ~стр.366/401)
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
