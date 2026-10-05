# Plan 01-02 Summary — Клиентские патчи

**Status:** Complete
**Date:** 2026-10-05

## Done

- Task 1 ✓ PATCH-01: src/client/locales.ts dictionary() — фолбэк инвертирован (`startsWith('zh') ? zh : en`), комментарий HQ patch
- Task 2 ✓ PATCH-02/05: в src/client/UsageFootCard.tsx добавлены HQ-функции providerLogo (8 провайдеров + moonshotai→kimi alias + fallback-кружок; SVG-пути дословно из эталона), planRows (names/order OpenAI→ZAI→Kimi→OpenCode→MiniMax→alphabetical; month-code отфильтрован; resetsAt сохранён; clamp 0–100), paygRows (credential≠none && balance≠undefined; usd=CNY÷7.2; <$1 #dc2626, <$10 #d97706; text=formatBalance), resetCountdown (""/"reset"/NdNh/NhNm/Nm)
- Task 3 ✓ PATCH-03/06/07: рендер заменён на эталон итерации 5 — свёрнутый: чипы (logo+max%, пороги цвета, opacity .75 <50%, title «имя %», flexWrap wrap, rowGap 3px, marginRight 18px, без LIMITS/PAYG); развёрнутый: заголовок «LIMITS» (10px/600 ls .09em opacity .6) + formatClock (9.5px/.4, marginLeft auto, marginRight 18px); иерархические строки foot-card-plans (заголовок провайдера: logo + имя 11px/600 ellipsis flex:1 + доминирующий %; строки окон: метка 10px/.55/16px + bar 5px + % 10px/.85/minWidth 24px + таймер 9.5px/.45/minWidth 28px — только когда непуст); PAYG-блок: hairline borderTop currentColor 12% + «PAYG» 9px/.4 + строки opacity .72 (logo + имя 11px/500 + text 11px/600 marginRight 18px, color row.color); usageLine/balanceLine/spendProvider/headline/BALANCE_CAP/balanceRow удалены как неиспользуемые; null-snapshot ветка — как в эталоне (свёрнутая: только «—», без GaugeIcon)

## Verification

- LANG_OK (содержательно: `startsWith('zh') ? zh : en` присутствует, count=1), FUNCS_OK, RENDER_OK — зелёные
- Один найденный и исправленный дефект переноса: опечатка в координате ZAI-маски (0.54,0.47 → 0.54-0.47) — исправлено до verify
- Удаление неиспользуемых helpers — необходимость: noUnusedLocals в tsconfig строгий; соответствуют плану (render-path cleanup)

## Notes

- formatTokens/totalTokens импорты убраны (использовались только удалёнными helpers)
