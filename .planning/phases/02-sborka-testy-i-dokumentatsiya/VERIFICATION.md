---
phase: "02"
status: passed_with_deferred
verified: 2026-10-05
verifier: orchestrator-inline (детерминированные команды; fresh-agent недоступен — сбои среды Kimi)
---

# Phase 2 Verification Report

| Requirement | Результат | Evidence |
|---|-----------|----------|
| BUILD-01 | ✓ | `pnpm build` exit 0 (tsc + tsdown, lib/index.js 75.7 kB, lib/client.js 418.6 kB); `node --check` обоих артефактов — ok |
| BUILD-02 | ✓ | **vitest 150/150, 12 файлов** — upstream-наборы из тега v0.4.4 (совпадают с npm-базой) без правок логики; новые тесты: foot-card.spec.tsx переписан под эталон итерации 5 (18 тестов: LIMITS/иерархия/порядок/пороги/PAYG-пороги/чипы/visibility), kimi-usages.spec.ts (3 теста: usages-ветка, legacy-совместимость, дедуп), section-card + тест инвертированного фолбэка |
| BUILD-03 | ✓ | pnpm store в `/Users/serzhsharapa/hq/.pnpm-store`; EPERM не было |
| DOCS-01 | ✓ | README.md (EN) / README.ru-RU.md / README.zh-CN.md — центральная шапка, свитчер языков, бейджи, только проверенные факты, без эмодзи (readme-skill) |
| DOCS-02 | ✓ | Таблица отличий (патчи 1–8), архитектура ASCII, Quick Start (build/test/profile-install), кредиты, NOTICE, лицензия |
| DOCS-03 | ⏳ deferred | Скриншоты свёрнутого/развёрнутого виджета — нужны из живого GUI DSH (владелец); заголовки всех трёх README уже ссылаются на `docs/screenshot-*.png` — файлы добавить до публикации |

## Замечания

- Тесты берутся из upstream-тега **v0.4.4** (ветка dev ушла вперёд: holidays.ts и makeUsageDayRoute отсутствуют в npm-базе 0.4.4). Пресет сборки shared/tsdown.client.ts байт-в-байт совпадает между dev и v0.4.4.
- Тесты, падавшие из-за заменённого поведения (старый виджет, старый языковой дефолт), переписаны под эталон; upstream-логика покрыта без правок.
- `pnpm typecheck` (tsc --noEmit + tsconfig.test.json) — exit 0.
