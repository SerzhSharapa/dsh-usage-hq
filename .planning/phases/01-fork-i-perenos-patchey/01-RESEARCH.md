# Phase 1: Форк и перенос патчей - Technical Research

**Date:** 2026-10-04
**Researcher:** orchestrator (замена gsd-phase-researcher — см. примечание)
**Status:** Complete

> Примечание: исследование выполнено оркестратором напрямую (автономный режим,
> реальные проверки файловой системы и upstream GitHub API), а не субагентом
> gsd-phase-researcher — два предыдущих Kimi-диспатча показали склонность к ступору
> на длинных файлах. Все факты ниже проверены командами, не из памяти.

## Ключевой вопрос

Что нужно знать, чтобы спланировать фазу 1 (форк + перенос 4 патчей в src/)?

## Факты (проверены)

### База форка
- Источник: `~/.dsh/profiles/desktop/node_modules/@linxin666/dsh-usage@0.4.4`.
- В npm-пакете есть: `LICENSE` (Apache-2.0), `README.md`, `README.zh.md`,
  `README.i18n.yaml`, `cordis.patch.yml`, `icon.svg`, `package.json`, `src/`, `lib/`.
- `src/` — 25 файлов (~5047 строк TS/TSX/CSS): `client/` (UsageFootCard.tsx,
  UsageSectionCard.tsx, foot-card-mount.tsx, locales.ts, usage-store.ts,
  usage.module.css, …), `core/` (adapters.ts, ledger.ts, pricing.ts,
  provider-routes.ts, types.ts), `host/` (routes.ts, usage-service.ts, …),
  `index.ts`, `dsh-home.ts`, `mount-once.ts`.

### ⚠ В npm-пакете НЕТ (вопреки KICKOFF «upstream кладёт конфиги»)
- Нет `tsconfig.json`, `tsconfig.build.json`, `tsconfig.test.json`,
  `tsconfig.vitest.json`, `tsdown.config.ts`, `vitest.config.ts` — без них
  `pnpm build`/`vitest` из копии не работают.
- Нет каталога `tests/` — upstream-тесты в npm не публикуются.
- Всё перечисленное ЕСТЬ в upstream-репо, ветка `dev`, путь `packages/dsh-usage/`:
  raw-загрузка с `raw.githubusercontent.com/zhu1090093659/dsh-web/dev/packages/dsh-usage/...`
  (проверено GitHub Contents API 04.10.2026: присутствуют tsconfig.json 493B,
  tsconfig.build.json 236B, tsconfig.test.json 477B, tsconfig.vitest.json 923B,
  tsdown.config.ts 136B, vitest.config.ts 600B, tests/, assets/).
- Вывод для плана: база = npm-пакет (lib+src+кредиты) + конфиги и tests/ из GitHub upstream.

### Зависимости и сборка (из package.json npm-пакета)
- `scripts`: build = `tsc -p tsconfig.build.json && tsdown`; test = `vitest run`;
  typecheck = `tsc --noEmit && tsc -p tsconfig.test.json --pretty false`.
- Единственная runtime-зависимость: `@deepseek-ai/schemastery ^3.18.4`.
- peer: `@deepseek-ai/dsh >=0.2.0-rc.1`, `react ^18.2.0`.
- devDeps: cordis, dsh-* rc-пакеты, react 18, tsdown ^0.22.2, typescript ^6.0.3,
  vitest ^4.1.8, jsdom 29.1.1, testing-library.
- Ловушка песочницы: npm/pnpm-кэш обязан быть внутри ~/hq (`--cache`), иначе EPERM.

### Точки внесения патчей в src/
- Патч 1 (язык): `src/client/locales.ts` — функция `dictionary()`; фолбэк
  `(document.documentElement.lang || "zh").toLowerCase().startsWith("zh") ? zh : en`.
  Эталон: `lib/client.js` ~стр.181.
- Патчи 2–3 (виджет): `src/client/UsageFootCard.tsx` — HQ-функции `providerLogo(id)`
  и `planRows(snapshot)` + блок рендера `data-dsh-part: "foot-card-plans"`.
  Эталон: `lib/client.js` ~стр.1886–1940 (функции) и ~стр.2066+ (рендер).
  Классы шкал уже есть в `src/client/usage.module.css` (`bar`/`barFill`/`barWarn`/
  `barLow`, warn `#d97706`, low `#dc2626`) — CSS менять не нужно, только рендер.
  Пороги виджета: warn ≥50%, low ≥80% (в коде рендера foot-card).
- Патч 4 (Kimi): `src/core/adapters.ts` — адаптер `KIMI_CODING.parse`. Upstream ждёт
  `body.usage`; Kimi отдаёт `body.usages` с `limit_5h`, `limit_month_total`,
  `limit_month_code`. Эталон: `lib/index.js` ~стр.366 (url), ~стр.401+ (парсинг
  `usages`, ключи окон `month`/`month-code`, percent = used_ratio*100, resetsAt из
  reset_time, дедуп по key). Недельного окна у Kimi нет — не рисовать.

### Переименование
- `package.json`: name → `dsh-usage-hq` (unscoped).
- `cordis.patch.yml`: `id: usage` → `hq-usage`, `name: '@linxin666/dsh-usage'` →
  `dsh-usage-hq`. Комментарии про upstream в файле поправить под форк.
- grep по src на предмет жёстких ссылок на `usage`/`@linxin666` — проверить RPC-неймспейс
  `dsh-usage.*` и пути стейтов `~/.dsh/dsh-usage/`: они ДОЛЖНЫ остаться прежними
  (существующие provider-snapshots.json/usage-ledger.json продолжают читаться; смена
  неймспейса = потеря данных профиля). Plugin id меняется только в cordis.patch.yml
  и в профиле (фаза 3).

### Лицензия
- Apache-2.0 LICENSE остаётся; добавить NOTICE/кредит автору `@linxin666`
  (upstream zhu1090093659/dsh-web) + запись о форке в README (фаза 2 — тексты).

### Эквивалентность (критерий фазы)
- Поведенческий diff: собранный из форка `lib/` vs текущий пропатченный `lib/` по
  функциям `dictionary`, `providerLogo`, `planRows`, `UsageFootCard`,
  `KIMI_CODING.parse` — diff пуст или эквивалентен (допустимы только переименования
  id/имени пакета).

## Рекомендации планировщику
- План-структура: 1) копия базы + конфиги/tests из GitHub upstream; 2) переименование;
  3) перенос патчей 1–4 в src (с read_first на эталонные lib-файлы); 4) сборка +
  поведенческий diff как verify.
- Исполнителю читать эталонные участки `lib/client.js`/`lib/index.js` точечно
  (строки выше), НЕ целиком — файл большой, Kimi ступорится на полном чтении.
