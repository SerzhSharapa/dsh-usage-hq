# Plan 01-03 Summary — Kimi-парсер, сборка, эквивалентность

**Status:** Complete
**Date:** 2026-10-05

## Done

- Task 1 ✓ PATCH-04: src/core/adapters.ts KIMI_CODING.parse — добавлена ветка root.usages: пары [limit_month_total→month/"Monthly"], [limit_month_code→month-code/"Monthly (code)"]; percent = clamp(round(used_ratio*100), 0–100); resetsAt = toIso(reset_time); дедуп по key; старый формат (limits[] + usage/weekly) сохранён дословно
- Task 2 ✓ BUILD: pnpm 12.9.1 (corepack), install --store-dir ~/hq/.pnpm-store (кэш внутри ~/hq, EPERM нет); pnpm build = tsc -p tsconfig.build.json (чисто с первого раза) && tsdown. Отклонение от плана (задокументировано): upstream tsdown.config.ts тянет monorepo-пресет `../../shared/tsdown.client.ts` — пресет вендорен в репо (shared/tsdown.client.ts 354 строки + shared/web-platform.ts), импорт локализован, clientBundle id → 'dsh-usage-hq'; добавлена прямая devDependency lightningcss@1.33.0 (в pnpm-изоляции transitive-зависимость пресета не резолвится). node --check обоих артефактов — ok
- Task 3 ✓ BUILD-04: поведенческий diff собранного lib/ vs эталонного node_modules lib/:
  - Размеры: client.js 418 633 vs 418 409 (+224 — строки 'dsh-usage-hq'/'hq-usage' и переименованный bundler-идентификатор); index.js 75 748 vs 75 644
  - dictionary — diff пуст (SAME)
  - planRows/paygRows/resetCountdown/UsageFootCard-рендер — идентичны семантически; расхождения только форматирование бандлера (перенос строк, `h % 24` без скобок — приоритет операторов идентичен) и имя локальной переменной (rows vs usages)
  - KIMI usages-ветка в index.js — идентична семантически (то же форматирование)
  - Маркерный чеклист EQUIV_OK: hq-zai-z, LIMITS, PAYG, month-code, dc2626, d97706, foot-card-plans, foot-card-payg, resetCountdown, opencode-go, siliconflow, limit_month_code — все присутствуют
- Допустимые расхождения (протокол): имя пакета/id ('dsh-usage-hq'/'hq-usage' vs '@linxin666/dsh-usage'/'usage') в bundler-метаданных и data-plugin тегах; форматирование/минификация

## Verification

- KIMI_OK, BUILD_OK, EQUIV_OK — зелёные
