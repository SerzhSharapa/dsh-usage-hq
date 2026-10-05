---
phase: "01"
status: passed
verified: 2026-10-05
verifier: orchestrator-inline (fresh-agent verifier не смог запуститься — 5-й подряд сбой среды Kimi; все проверки детерминированные, команды закоммичены)
---

# Phase 1 Verification Report

## Must-haves → Evidence

| # | Проверка | Результат |
|---|----------|-----------|
| 1 | package.json = dsh-usage-hq 0.4.4-hq.1; cordis.patch.yml id hq-usage; NOTICE кредит | ✓ (node require + grep) |
| 2 | 6 конфигов сборки + tests/ (12 spec) + docs/logos (8 svg + SOURCES.md) | ✓ |
| 3 | locales.ts: инвертированный фолбэк `startsWith('zh') ? zh : en` | ✓ (count=1) |
| 4 | UsageFootCard.tsx: hq-zai-z, LIMITS, PAYG, month-code, flexWrap, formatBalance в paygRows, resetCountdown; footMeta/foot-card-usage/foot-card-balances отсутствуют | ✓ |
| 5 | adapters.ts: ветка root.usages (limit_month_code, reset_time) + старая root.usage weekly сохранена | ✓ |
| 6 | lib/client.js + lib/index.js собраны, node --check ok, маркеры LIMITS/foot-card-payg/limit_month_code на месте | ✓ |
| 7 | git-история: cbf1de0 → cf01db9 → 48383d8; рабочее дерево чистое по src/.planning | ✓ |

## Behavioral equivalence (BUILD-04)

- Размеры собранного lib/ vs эталон: client.js 418 633 / 418 409 (+224 — переименования пакета), index.js 75 748 / 75 644
- dictionary — diff пуст; planRows/paygRows/resetCountdown/KIMI-usages — семантически идентичны (расхождения — только форматирование бандлера и имя локальной переменной)
- Полный протокол: 01-03-SUMMARY.md

## Deviations (задокументированы в SUMMARY)

- shared/tsdown.client.ts + web-platform.ts вендорены в репо (upstream monorepo-зависимость), clientBundle id → 'dsh-usage-hq', +devDep lightningcss

## Limitations

- Fresh-agent (Kimi highspeed) верификация не выполнилась: сбой среды (5-е подряд падение субагента). Статус **passed (provisional, inline)** — все проверки воспроизводимы командами выше; рекомендована свежая проверка из нового чата при восстановлении Kimi.
- Живая проверка виджета в GUI DSH — фаза 3 (после перезапуска DSH владельцем).
