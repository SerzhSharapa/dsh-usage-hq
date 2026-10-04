---
phase: "1"
slug: "fork-i-perenos-patchey"
status: draft
shadcn_initialized: false
preset: none
created: "2026-10-04"
---

# Phase 1 — UI Design Contract

> Контракт существующего визуального поведения виджета лимитов (патчи 2–3 KICKOFF).
> Это НЕ новый дизайн: фаза портирует уже работающий рендер из пропатченного
> `lib/client.js` в `src/` форка. Эталон — фактический код
> `~/.dsh/profiles/desktop/node_modules/@linxin666/dsh-usage/lib/client.js`
> (функции `providerLogo` ~стр.1886, `planRows` ~стр.1901, рендер `UsageFootCard`,
> блок `data-dsh-part: foot-card-plans` ~стр.2066).
>
> Визуальный якорь развёрнутой карточки — headline-значение `footValue` (15px/600,
> tabular-nums) в шапке; строки провайдеров с лого и шкалами — вторичный уровень
> иерархии. Исполнителю не выдумывать новую иерархию.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none (React jsx-runtime напрямую, CSS-modules upstream) |
| Icon library | inline SVG (официальные пути: OpenAI simple-icons v13, Kimi cdn.simpleicons.org, Z.AI Wikimedia с маской) |
| Font | наследуется от хоста DSH (`font: inherit`), числа — `font-variant-numeric: tabular-nums` |

---

## Component Inventory

Could not enumerate: проект не использует дизайн-систему; виджет — самодостаточный компонент `UsageFootCard` со scoped CSS (`usage.module.css`, префикс `cvtkAW_`). Используются только существующие классы и inline-стили upstream.

---

## Spacing Scale

Фактические значения из патченного кода (не из шкалы 4px — повторяем как есть):

| Token | Value | Usage |
|-------|-------|-------|
| row-gap | 6px | gap строки провайдера (`foot-card-plans`: logo↔name↔bars) |
| bar-gap | 8px | gap между шкалами окон одного провайдера |
| win-gap | 3px | gap внутри окна: label↔bar↔percent |
| card-pad | 8px | padding `footMain` |
| card-radius | 12px | border-radius карточки `footCard` |

Exceptions: виджет не следует шкале 4px — это upstream-наследие, менять запрещено (поведенческая эквивалентность).

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Provider name | 11px | 500 (opacity .9) | inherit |
| Window label (5h/wk/mo) | 10px | normal (opacity .6) | inherit |
| Percent | 10px | normal, tabular-nums | inherit |
| Foot title | 12px | normal (opacity .65) | inherit |
| Foot value | 15px | 600, tabular-nums | inherit |

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant | `currentColor` + `color-mix(in srgb, currentColor N%, transparent)` | Все поверхности/треки — виджет живёт в теме хоста DSH |
| Bar track | currentColor 10% | фон шкалы (`bar`) |
| Bar fill | currentColor 55% | заполнение < 50% (`barFill`) |
| Warn | `#d97706` | заполнение ≥ 50% (`barWarn`) |
| Low | `#dc2626` | заполнение ≥ 80% (`barLow`) |

Accent reserved for: только пороговые состояния шкал (warn/low). Пороги виджета: **≥50% warn, ≥80% low** (в Settings → Plans карточках upstream пороги 70/90 — не трогаем).

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Provider names | `OpenAI`, `ZAI (GLM)`, `Kimi` (короткие имена из `planRows`; неизвестный — `provider.displayName`) |
| Window labels | `5h`, `wk`, `mo`, `month-code` (фактический вывод keyLabel: month-code выводится как есть; KICKOFF упоминал «mo-code» — расхождение зафиксировано, портируем поведение кода дословно) |
| Percent | `{n}%` (clamp 0–100, Math.round) |
| Updated line | из словаря `usage.updated` (`t()`); локаль: `startsWith("zh") ? zh : en` |
| Empty state | блок планов не рендерится, если `plans.length === 0` (провайдер без `plan.windows` отфильтрован) |

---

## UI Considerations

Applicable state considerations resolved: 4 covered, 0 backstop, 0 unresolved

| Category | Element(s) | Status | Resolution / Reason |
|----------|------------|--------|---------------------|
| empty | plan rows list | ✅ covered | Провайдеры без `plan.windows` фильтруются в `planRows`; пустой список — блок не рендерится |
| loading/stale | весь виджет | ✅ covered | Polling 30 с (FOOT_CARD_POLL_MS), строка `usage.updated` с временем снапшота |
| long-text | имя провайдера | ✅ covered | Колонка имени фиксирована 64px, `text-overflow: ellipsis`, `white-space: nowrap` |
| overflow | шкалы окон | ✅ covered | Каждое окно `flex: 1; min-width: 0` — треки делят область поровну, одна шкала занимает всю ширину |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS (FLAG принят: якорь зафиксирован строкой выше)
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS (FLAG принят: 3 веса шрифта — наследие upstream, менять запрещено ради эквивалентности)
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS
- [x] Dimension 7 Inventory Provenance: PASS (FLAG принят: дизайн-системы нет, honest record)

**Approval:** approved 2026-10-04 (gsd-ui-checker, kimi-for-coding-highspeed)
