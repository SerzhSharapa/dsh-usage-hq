# dsh-usage-hq

## What This Is

Собственный форк npm-плагина `@linxin666/dsh-usage@0.4.4` для DeepSeek Harness
(upstream: github.com/zhu1090093659/dsh-web, Apache-2.0). Плагин показывает в DSH расход
токенов и балансы API-ключей (Settings → Usage Statistics), квоты coding-подписок
(GLM Coding Plan, Kimi For Coding, Codex/ChatGPT, OpenCode Go, MiniMax) с процентами и
временем сброса по окнам 5ч/нед/мес (вкладка Plans) и карточку-виджет внизу сайдбара.
Форк переносит **семь локальных патчей** (плюс зафиксированный факт про Codex Lite),
сейчас живущих прямо в `node_modules` установленного плагина (и слетающих при любом
обновлении), в собственные исходники, собирает свой пакет `dsh-usage-hq` и публикует
его в открытый GitHub-репозиторий владельца.

**Форма проекта — форк, не переписывание с нуля** (решение владельца 04.10.2026): наши
доработки — ~150 строк поверх ~4000 строк движка upstream (адаптеры провайдеров,
host-пробы, ledger, i18n, dsh.client-обвязка, Settings-секция); переписывание — недели
работы без новой ценности, а код «по образцу» юридически всё равно производный.
Обязанности форка: сохранить Apache-2.0, NOTICE/кредит `@linxin666`, в README объявить
происхождение («fork of…»).

## Core Value

Локальные доработки виджета лимитов и парсеров провайдеров должны жить в версионируемых
исходниках собственного плагина, а не в хрупких патчах `node_modules`: после форка
обновление/переустановка не уничтожает рабочий виджет. Финальный UI виджета
(итерация 5 от 04.10.2026, одобрен владельцем) — **эталон**, отклонения недопустимы.

## Requirements

### Validated

(Пока нет — текущий код upstream с патчами работает, но не версионируется; ship to validate)

### Active

- [ ] Скопировать пакет `@linxin666/dsh-usage@0.4.4` (lib, src, конфиги) как стартовую базу с сохранением Apache-2.0 и NOTICE/кредита автору; объявление «fork of…» в README
- [ ] Переименовать пакет в `dsh-usage-hq`, plugin/bundle id сменить на `hq-usage` (со сменой id в собственном cordis.patch.yml пакета и в профиле desktop)
- [ ] Перенести патч 1 (язык: фолбэк инвертирован, не-en → английский) в `src/`
- [ ] Перенести патч 2 (данные виджета: `providerLogo` + `planRows`; короткие имена OpenAI / ZAI (GLM) / Kimi / OpenCode / MiniMax; порядок OpenAI → ZAI → Kimi → OpenCode → MiniMax → прочие по алфавиту; официальные SVG-лого в currentColor: OpenAI 13px, Kimi 11px, Z.AI маска hq-zai-z, MiniMax 13px, OpenCode из opencode.ai/favicon-v3.svg, DeepSeek 11px, Moonshot = знак Kimi, OpenRouter 11px, SiliconFlow зелёная волна viewBox 1024; исходники path-данных взять заново с cdn.simpleicons.org/Wikimedia и закоммитить в docs/) в `src/`
- [ ] Перенести патч 3 (рендер виджета, финальный UI итерации 5: иерархический макет — строка-заголовок провайдера с лого+именем 11px/600 ellipsis flex:1 и доминирующим % справа (#dc2626 ≥80, #d97706 ≥50, иначе inherit/.75); под ней по окну на строку на всю ширину: метка 10px/opacity .55/16px + полоса 5px bar/barFill/barWarn/barLow + выровненные вправо % (10px, minWidth 24px) и таймер (9.5px, opacity .45, minWidth 28px), tabular-nums; провайдеры разделены marginTop 6px, окна gap 2px; отвергнутые компоновки не возвращать) в `src/`
- [ ] Перенести патч 4 (Kimi: `body.usages` — окна month/month-code из limit_5h/limit_month_total/limit_month_code, percent=used_ratio*100, resetsAt из reset_time, дедуп по key) в `src/`
- [ ] Перенести патч 5 (таймеры сброса: `planRows` сохраняет resetsAt; `resetCountdown(iso)` → `· 4h12m` / `· 6d3h`, истёкшее — `reset`, нет данных — не рисуется; окно month-code из виджета отфильтровано, в Plans-вкладке остаётся) в `src/`
- [ ] Перенести патч 7 (виджет только про подписки: удалены usageLine, balances, footMeta; заголовок «LIMITS» 10px/600 uppercase letterSpacing .09em opacity .6 слева + время обновления 10px/opacity .45 справа) в `src/`
- [ ] Перенести патч 8 (PAYG-балансы: строки после подписок для credential≠none && balance≠void 0; лого+имя 11px/500 + formatBalance справа 11px/600 tabular marginRight 18px; порядок по алфавиту; hairline borderTop 1px currentColor 12% + микро-подпись «PAYG» 9px/opacity .4; строки приглушены opacity .72; пороги баланса <$1 → #dc2626, <$10 → #d97706, CNY/7.2; свёрнутая полоска — чипы лого+горячий % без надписи LIMITS, flexWrap wrap, выравнивание влево, marginRight 18px, тултип «имя %», в загрузке «—») в `src/`
- [ ] Сборка `pnpm build` (tsc + tsdown) зелёная; тесты `vitest` upstream пройдены, наши доработки покрыты новыми тестами
- [ ] README на трёх языках (EN/RU/ZH, переключатель в шапке) по readme-skill: отличия от upstream (патчи 1–8), установка, кредиты, происхождение форка — только подтверждённые факты; **скриншоты обязательны** (свёрнутый и развёрнутый виджет, `docs/screenshot-*.png`, в шапку всех трёх README; проверить отсутствие секретов и лишних чатов на скринах)
- [ ] Публикация в GitHub `SerzhSharapa/dsh-usage-hq` (публичный), лицензия Apache-2.0, без секретов/приватных путей
- [ ] Подмена в профиле `~/.dsh/profiles/desktop`: remove старого пакета, подключение tarball по file:, запись в dsh.profile.bundles, перезапуск DSH
- [ ] Верификация после перезапуска: виджет соответствует эталону (лого, иерархические строки, порядок провайдеров, таймеры, PAYG-блок, чипы в свёрнутом виде); Plans-вкладка совпадает с provider-snapshots.json; node --check артефактов; нет дубля id `usage` в конфиге профиля

### Out of Scope

- Русский словарь виджета — выбрана стратегия «английский для не-zh локалей», не добавлять без прямого запроса
- «Починка» Codex Lite: у тарифа `prolite` API отдаёт только `primary_window` (week), 5-часового окна нет — не рисовать фиктивные 0%
- Недельное окно Kimi — у Kimi его нет в API, это не баг
- Отвергнутые компоновки виджета (все окна в одну строку; фиксированные колонки имён+окон) — не возвращаться
- PAYG в свёрнутых чипах — только развёрнутый вид
- Пуш в upstream-репозиторий автора — без отдельного решения владельца (опциональный PR с фиксом Kimi-парсера — отдельная задача позже)
- Изменение установок Codex/Claude и других профилей DSH

## Context

- Исходная точка: установленный `~/.dsh/profiles/desktop/node_modules/@linxin666/dsh-usage@0.4.4`; npm-пакет содержит `lib/`, `src/`, LICENSE, cordis.patch.yml, но **не содержит** tsconfig/tsdown/vitest-конфиги и tests/ — они берутся из upstream GitHub (ветка dev, packages/dsh-usage/).
- Финальный UI (патчи 3, 5, 7, 8) уже живёт в пропатченном `lib/client.js` (проверено 04.10.2026 вечером): `providerLogo` ~стр.1886 (включая moonshotai→kimi alias), `planRows` ~стр.1910, `resetCountdown` ~стр.1934, чипы footStrip ~стр.2052, «LIMITS» ~стр.2084, блок `foot-card-plans` ~стр.2092, блок «PAYG» ~стр.2116.
- Рабочие стейты плагина: `~/.dsh/dsh-usage/provider-snapshots.json` (квоты, опрос 60 с) и `usage-ledger.json` (расход); креды из `~/.dsh/.credentials.yaml` (refs/env + OAuth-гранты). Виджет обновляется 30 с.
- Детали всех патчей зафиксированы в `KICKOFF.md` этого репозитория — входной документ проекта.
- Исходники SVG path-данных лого: кэш `/tmp/logo_*.svg` не вечен — при сборке форка взять заново с cdn.simpleicons.org / Wikimedia / opencode.ai / framerusercontent и закоммитить в `docs/` репозитория.
- Соседние плагины `dsh-stt-multi` и `dsh-tls-fallback` — образец именования (unscoped), сборки tarball и подключения по `file:` в профиль desktop.
- Известная ловушка песочницы DSH: npm-кэш вне ~/hq падает с EPERM → `--cache ~/hq/...`.
- Методология: GSD Core (DSH-комплект `toolkit/dsh/gsd/`), dispatch субагентов по ADAPTER.md.
- 04.10.2026 ~21:31: диспатч planner'а на `kimi-coding` упал с «Недействительный ключ API» — сбой среды (auth), не качество модели; при повторении — fallback на GLM (разрешён KICKOFF).

## Constraints

- **Лицензия**: Apache-2.0 с сохранением кредита автору `@linxin666` — обязательное наследие upstream, MIT нельзя
- **Публикация**: открытый GitHub `SerzhSharapa/dsh-usage-hq` — решение владельца от 04.10.2026; перед выкладкой проверить отсутствие секретов, ключей, приватных путей, тяжёлых артефактов (включая скриншоты)
- **Модели**: исполнители и координатор — Kimi (`kimi-coding`: `kimi-for-coding`, `kimi-for-coding-highspeed`); `openai-codex` НЕ использовать (недельный лимит Codex Lite выжат, сброс ~10.10.2026 14:07 МСК); GLM (`zai-coding-cn`, max) разрешён как fallback. Override toolkit/dsh/model-routing.md для этого проекта; выбор явно через `subagent` с provider/model
- **Эталон UI**: финальный вид виджета (итерация 5, одобрен владельцем 04.10.2026) не менять; портируется дословно
- **Сборка**: pnpm + tsc + tsdown, тесты vitest; npm-кэш только внутри ~/hq (EPERM-ловушка)
- **Профиль**: трогается только `~/.dsh/profiles/desktop`; подмена пакета требует перезапуска DSH (host-половина)
- **Песочница**: `.planning/` только в этой папке; GSD-комплект не переустанавливать

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Форк, а не переписывание с нуля | ~150 строк доработок поверх ~4000 строк движка upstream; нет новой ценности в переписывании, юридически всё равно производное (решение владельца 04.10.2026) | ✓ Good |
| Имя пакета `dsh-usage-hq` (unscoped) | По аналогии с `dsh-stt-multi` и `dsh-tls-fallback` (решение владельца 04.10.2026) | — Pending |
| Plugin id `hq-usage` (не `usage`) | Явный id форка; требует правок собственного cordis.patch.yml и dsh.profile.bundles (решение владельца 04.10.2026) | — Pending |
| Английский для не-zh локалей | Русского словаря у upstream нет; инвертированный фолбэк `startsWith("zh") ? zh : en` | ✓ Good (работает в патче) |
| Codex Lite: только week-окно | API фактически отдаёт только `primary_window`; фиктивный 5h-0% вводил бы в заблуждение | ✓ Good (подтверждено API) |
| Kimi: окна month/month-code из `body.usages` | Kimi сменил формат API; недельного окна нет и не будет рисоваться | ✓ Good (работает в патче) |
| Финальный UI виджета (итерация 5) как эталон | Одобрен владельцем 04.10.2026 («великолепно»); иерархический макет, отвергнутые компоновки задокументированы | ✓ Good (живёт в node_modules) |
| Виджет только про подписки + PAYG-блок | У владельца подписки, не PAYG — счётчики токенов не actionable; PAYG-балансы отдельным приглушённым блоком (решения владельца 04.10.2026) | ✓ Good (живёт в node_modules) |
| Пороги цвета баланса PAYG: <$1 красный, <$10 жёлтый, CNY/7.2 | Решение владельца 04.10.2026 | ✓ Good (живёт в node_modules) |
| GitHub публичный, Apache-2.0 | Полезно сообществу; лицензия наследуется от upstream | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-10-04 after KICKOFF update (7 патчей + эталонный UI итерации 5)*
