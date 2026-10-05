# Plan 01-01 Summary — База форка

**Status:** Complete
**Date:** 2026-10-05

## Done

- Task 1 ✓: база скопирована из node_modules (LICENSE, README.md, README.zh.md, README.i18n.yaml, cordis.patch.yml, icon.svg, package.json, src/ целиком; lib/ не копировался — build output, эталон читается по месту). Конфиги сборки (6 файлов) и tests/ (12 spec) скачаны из upstream GitHub dev/packages/dsh-usage. .gitignore: node_modules/, lib/, dist/, *.tgz, .dsh/
- Task 2 ✓: package.json → name dsh-usage-hq, version 0.4.4-hq.1, description обновлён, scripts/deps не тронуты; cordis.patch.yml → id hq-usage, name dsh-usage-hq, комментарий переписан под форк; NOTICE создан (кредит @linxin666 + upstream, Apache-2.0). RPC-неймспейс dsh-usage.* и src/ не тронуты
- Task 3 ✓: docs/logos/ — 8 официальных SVG + SOURCES.md (openai через unpkg simple-icons@13 — cdn.simpleicons 404 в этот день; zai через Wikimedia Special:FilePath)

## Verification

- ALL_PRESENT, RENAME_OK, PKG_OK, LOGOS_OK — все зелёные
- Отклонение от плана: tsdown.config.ts из upstream импортирует `../../shared/tsdown.client.ts` (monorepo-путь) — пресет вендорен в репо (shared/tsdown.client.ts + shared/web-platform.ts), импорт исправлен на локальный; см. 01-03-SUMMARY

## Notes for next plans

- Плагин-identity в рендере (data-dsh-plugin="usage") оставлена как в эталоне
