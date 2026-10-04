---
phase: "1"
slug: "fork-i-perenos-patchey"
status: approved
shadcn_initialized: false
preset: none
created: "2026-10-04"
---

# Phase 1 — UI Design Contract (v2, финальный UI итерации 5)

> Контракт **существующего финального** поведения виджета лимитов (патчи 2, 3, 5, 7, 8
> KICKOFF от 04.10.2026). Это НЕ новый дизайн: фаза портирует одобренный владельцем
> эталон из пропатченного `lib/client.js` в `src/` форка дословно.
> Эталон — фактический код
> `~/.dsh/profiles/desktop/node_modules/@linxin666/dsh-usage/lib/client.js`:
> `providerLogo` ~стр.1886, `planRows` ~стр.1910, `paygRows` ~стр.1922,
> `resetCountdown` ~стр.1934, рендер `UsageFootCard` ~стр.2039–2140
> (чипы footStrip ~2052, «LIMITS» ~2084, `foot-card-plans` ~2092, «PAYG» ~2116).
>
> v2 заменяет v1: v1 описывала старый однострочный макет (колонка имени 64px),
> который отвергнут владельцем. Эталон — итерация 5, иерархический макет.
>
> Визуальный якорь развёрнутой карточки — блок подписочных провайдеров (лого +
> доминирующий % с порогами цвета); PAYG-блок приглушён и визуально подчинён.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none (React jsx-runtime напрямую, CSS-modules upstream + inline-стили) |
| Icon library | inline SVG — официальные пути: OpenAI (simple-icons v13, 13px, margin 0.5px), Kimi (cdn.simpleicons.org, 11px, margin 1px), Z.AI (Wikimedia, viewBox 30, маска `hq-zai-z`, 13px), MiniMax (simple-icons, 13px), OpenCode Go (opencode.ai/favicon-v3.svg, viewBox 512: рамка currentColor + внутренний квадрат opacity .45), DeepSeek (simple-icons, 11px, margin 1px), Moonshot PAYG = знак Kimi (`providerLogo("kimi-coding")`), OpenRouter (simple-icons, 11px, margin 1px), SiliconFlow (framerusercontent, viewBox 1024, волна в currentColor), неизвестный — кружок r8 |
| Font | наследуется от хоста DSH (`font: inherit`), числа — `font-variant-numeric: tabular-nums` |

---

## Component Inventory

Could not enumerate: проект не использует дизайн-систему; виджет — самодостаточный компонент `UsageFootCard` (scoped CSS `usage.module.css`, префикс `cvtkAW_`) + inline-стили патчей. Используются только существующие классы upstream (`footCard`, `footMain`, `footLine`, `footStrip`, `bar`, `barFill`, `barWarn`, `barLow`) — новые классы не вводятся, патчи работают inline-стилями.

---

## Spacing Scale

Фактические значения из эталонного кода (не шкала 4px — повторяем как есть):

| Token | Value | Usage |
|-------|-------|-------|
| header-gap | 6px | gap строки заголовка «LIMITS»↔время; marginBottom 2px |
| prov-head-gap | 5px | gap лого↔имя↔дом.% в заголовке провайдера |
| win-gap | 5px | gap метка↔полоса↔цифры в строке окна |
| win-row-gap | 2px | gap между строками окон одного провайдера |
| prov-gap | 6px | marginTop между провайдерами (у первого 0) |
| payg-sep | marginTop 8px / paddingTop 6px | отступ PAYG-блока + hairline borderTop 1px currentColor 12% |
| payg-row-gap | 6px / marginTop 3px | gap и отступ строк PAYG |
| chips-gap | 7px / rowGap 3px | gap между чипами свёрнутой полоски |
| chip-inner-gap | 2px | лого↔% внутри чипа |
| arrow-clearance | marginRight 18px | зазор под стрелку-переключатель (чипы, PAYG-баланс, время обновления) |

Exceptions: вся шкала — upstream/патч-наследие, менять запрещено (поведенческая эквивалентность).

---

## Typography

| Role | Size | Weight | Extra |
|------|------|--------|-------|
| «LIMITS» / «PAYG» капталы | 10px / 9px | 600 | uppercase, letterSpacing .09em, opacity .6 / .4 |
| Имя провайдера (подписка) | 11px | 600 | flex:1, ellipsis, nowrap |
| Доминирующий % провайдера | 11px | 600 | tabular-nums; цвет по порогу; opacity .75 если <50 |
| Метка окна (5h/wk/mo) | 10px | normal | opacity .55, width 16px, flex none |
| % окна | 10px | normal | opacity .85, minWidth 24px, text-align right, tabular-nums |
| Таймер сброса | 9.5px | normal | opacity .45, minWidth 28px, text-align right, tabular-nums |
| Имя PAYG | 11px | 500 | flex:1, ellipsis; строка целиком opacity .72 |
| Баланс PAYG | 11px | 600 | tabular-nums, marginRight 18px |
| Чип % (свёрнутый) | 11px | 600 | tabular-nums |
| Время обновления | 9.5px | normal | opacity .4, marginLeft auto, marginRight 18px, tabular-nums (эталон = код; KICKOFF писал 10px/.45) |

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant | `currentColor` + `color-mix(currentColor N%)` | все поверхности/треки — тема хоста DSH |
| Bar track | currentColor 10% (`bar`) | фон полосы, height 5px, radius 999px |
| Bar fill | currentColor 55% (`barFill`) | < 50% |
| Warn | `#d97706` (`barWarn`) | ≥ 50% |
| Low | `#dc2626` (`barLow`) | ≥ 80% |
| Доминирующий % / чип % | #dc2626 ≥80 / #d97706 ≥50 / inherit (opacity .75) <50 | заголовок провайдера и свёрнутые чипы |
| Баланс PAYG | #dc2626 < $1 / #d97706 < $10 / без цвета иначе | CNY пересчитывается /7.2 |
| PAYG-блок | opacity .72 на строке | приглушение против подписочных строк |

Accent reserved for: пороговые состояния (warn/low %, низкий баланс).

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Заголовок карточки | `LIMITS` (только развёрнутый вид; в свёрнутом нет) |
| Микро-подпись PAYG | `PAYG` |
| Имена подписок | `OpenAI`, `ZAI (GLM)`, `Kimi`, `OpenCode`, `MiniMax`; неизвестный — `provider.displayName` |
| Имена PAYG | `OpenRouter`, `DeepSeek`, `Moonshot`, `SiliconFlow` |
| Метки окон | `5h`, `wk`, `mo` (month-code из виджета отфильтрован — только Plans-вкладка) |
| Таймер | `4h12m` / `6d3h` / `47m`; истёкшее — `reset`; нет данных — не рисуется |
| Чип тултип | `{имя} {%}%` (title-атрибут) |
| Загрузка (свёрнутый) | `—` |
| Empty state | блоки не рендерятся: plans.length===0 → нет подписочных строк; paygRows пуст → нет разделителя и строк |

---

## UI Considerations

Applicable state considerations resolved: 6 covered, 0 backstop, 0 unresolved

| Category | Element(s) | Status | Resolution / Reason |
|----------|------------|--------|---------------------|
| empty | plans / payg rows | ✅ covered | Фильтры в planRows/paygRows; пустые блоки не рендерятся (включая PAYG-разделитель) |
| loading | свёрнутая полоска | ✅ covered | Состояние загрузки — `—` |
| stale | весь виджет | ✅ covered | Polling 30 с; время обновления в заголовке справа |
| expired timer | таймер окна | ✅ covered | `reset` при истёкшем; пусто при отсутствии resetsAt |
| long-text | имена провайдеров | ✅ covered | flex:1 + ellipsis + nowrap в обоих блоках |
| overflow | свёрнутая полоска | ✅ covered | flexWrap: wrap (многострочная), выравнивание влево, marginRight 18px под стрелку |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |

---

## Отвергнутые компоновки (не возвращаться)

- Все окна в одну строку — не влезают с таймерами.
- Фиксированная колонка имён + колонка окон — мёртвая зона и рваный правый край.
- Надпись «LIMITS» в свёрнутом виде — удалена решением владельца.
- usageLine / balances / footMeta в развёрнутой карточке — удалены (виджет только про подписки + PAYG).

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS (якорь зафиксирован)
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS (наследие upstream — осознанно)
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS
- [x] Dimension 7 Inventory Provenance: PASS (дизайн-системы нет, honest record)

**Approval:** v1 approved 2026-10-04 (gsd-ui-checker, kimi-for-coding-highspeed); v2 — переписан оркестратором под финальный UI итерации 5 по фактическому эталонному коду после обновления KICKOFF; все значения выше сверены с кодом построчно.
