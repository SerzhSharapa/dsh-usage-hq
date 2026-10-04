# Roadmap: dsh-usage-hq

## Overview

Путь от хрупких патчей в `node_modules` до собственного опубликованного плагина: сначала форкаем пакет `@linxin666/dsh-usage@0.4.4` и переносим все семь доработок (патчи 1–5, 7–8 по нумерации KICKOFF) в версионируемые `src/` (фаза 1), затем добиваемся зелёной сборки и тестов и пишем README на трёх языках со скриншотами (фаза 2), наконец публикуем репозиторий и переключаем на свой пакет профиль desktop, верифицируя виджет после перезапуска (фаза 3).

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Форк и перенос патчей** - Свой пакет `dsh-usage-hq` (id `hq-usage`) с семью доработками в `src/`, идентичный пропатченному `node_modules` по поведению (эталон UI — итерация 5)
- [ ] **Phase 2: Сборка, тесты и документация** - Зелёный `pnpm build`, зелёные vitest (upstream + новые на патчи), README EN/RU/ZH по readme-skill со скриншотами
- [ ] **Phase 3: Публикация и подмена в профиле** - Публичный GitHub `SerzhSharapa/dsh-usage-hq` без секретов; профиль desktop на `file:`-тарболе; виджет живой после перезапуска

## Phase Details

### Phase 1: Форк и перенос патчей
**Goal**: Существует собственный пакет `dsh-usage-hq` с plugin/bundle id `hq-usage`, функционально идентичный текущему пропатченному `@linxin666/dsh-usage@0.4.4`, но с семью доработками, живущими в версионируемых исходниках `src/`, а не в `node_modules`
**Depends on**: Nothing (first phase)
**Requirements**: BASE-01, BASE-02, BASE-03, BASE-04, PATCH-01, PATCH-02, PATCH-03, PATCH-04, PATCH-05, PATCH-06, PATCH-07, BUILD-04
**Success Criteria** (what must be TRUE):
  1. Репозиторий содержит полную копию пакета `@linxin666/dsh-usage@0.4.4` (lib, src, LICENSE, cordis.patch.yml, icon.svg) из `~/.dsh/profiles/desktop/node_modules/` + конфиги сборки и tests/ из upstream GitHub (dev, packages/dsh-usage/), с сохранённой Apache-2.0 и NOTICE/кредитом автору `@linxin666`
  2. Пакет везде переименован в `dsh-usage-hq` (unscoped), plugin/bundle id сменён на `hq-usage` — в собственном `cordis.patch.yml` пакета и (в фазе 3) профиле desktop; RPC-неймспейс `dsh-usage.*` и state-директория не тронуты
  3. В `src/` воспроизведены все семь патчей: языковой фолбэк (`startsWith("zh") ? zh : en`); данные виджета (`providerLogo` с 8 официальными SVG-лого + `planRows` с порядком OpenAI → ZAI (GLM) → Kimi → OpenCode → MiniMax → прочие по алфавиту); рендер `UsageFootCard` по эталону итерации 5 (иерархический макет, заголовок «LIMITS», без usageLine/balances/footMeta); парсер `KIMI_CODING.parse` из `body.usages`; таймеры `resetCountdown` (month-code отфильтрован из виджета); PAYG-блок балансов с порогами цвета; свёрнутая полоска чипов (wrap, влево, без «LIMITS»)
  4. Исходники SVG path-данных лого взяты заново с cdn.simpleicons.org / Wikimedia / opencode.ai / framerusercontent и закоммичены в `docs/`
  5. Собранный из `src/` код поведенчески идентичен текущему пропатченному `lib/`: по ключевым функциям (dictionary, providerLogo, planRows, resetCountdown, UsageFootCard, KIMI_CODING.parse) diff пуст или подтверждённо эквивалентен
**Plans**: TBD
**UI hint**: yes

### Phase 2: Сборка, тесты и документация
**Goal**: Пакет `dsh-usage-hq` собирается зелёно (tsc + tsdown), все тесты проходят, npm-кэш работает внутри ~/hq, README на трёх языках со скриншотами готов к публикации — только подтверждённые факты
**Depends on**: Phase 1
**Requirements**: BUILD-01, BUILD-02, BUILD-03, DOCS-01, DOCS-02, DOCS-03
**Success Criteria** (what must be TRUE):
  1. `pnpm build` (tsc + tsdown) проходит без ошибок; `node --check` успешен для обоих артефактов сборки
  2. Все тесты `vitest` зелёные: upstream-тесты (из tests/ upstream-репо) проходят без правок, патчи 1–5 и 7–8 покрыты новыми тестами
  3. Сборка и тесты работают с npm/pnpm-кэшем внутри ~/hq — падений EPERM от песочницы DSH нет
  4. Существуют `README.md` (EN), `README.ru-RU.md`, `README.zh-CN.md` с переключателем языков в шапке; содержат скриншоты свёрнутого и развёрнутого виджета (`docs/screenshot-*.png`, без секретов и лишних чатов), список отличий от upstream (патчи 1–8), инструкцию установки, происхождение форка, кредиты и лицензию; каждое утверждение — из кода или подтверждено владельцем
**Plans**: TBD

### Phase 3: Публикация и подмена в профиле
**Goal**: Репозиторий `SerzhSharapa/dsh-usage-hq` опубликован публично и чист от секретов, профиль `~/.dsh/profiles/desktop` живёт на собственном `file:`-тарболе, и после перезапуска DSH виджет и вкладка Plans работают как до форка (эталон итерации 5)
**Depends on**: Phase 2
**Requirements**: PUBL-01, PUBL-02, DEPL-01, DEPL-02, DEPL-03
**Success Criteria** (what must be TRUE):
  1. Репозиторий `SerzhSharapa/dsh-usage-hq` создан публичным (`gh repo create --public --source . --push`) с осмысленным описанием из README; перед выкладкой проверено отсутствие секретов, ключей, приватных путей и тяжёлых артефактов в коде, истории и скриншотах
  2. В `~/.dsh/profiles/desktop/` старый `@linxin666/dsh-usage` удалён (`pnpm remove`), tarball `dsh-usage-hq` подключён по `file:` (зависимость + строка в `dsh.profile.bundles`), DSH перезапущен, дубля id `usage` в конфиге профиля нет
  3. После перезапуска DSH виджет соответствует эталону итерации 5: иерархические строки провайдеров (лого + имя + доминирующий % с порогами цвета), строки окон (полоса + % + таймер), порядок OpenAI → ZAI (GLM) → Kimi → OpenCode → MiniMax, PAYG-блок с hairline-разделителем, свёрнутая полоска чипов с wrap и выравниванием влево
  4. Вкладка Settings → Plans живая, значения квот совпадают с `~/.dsh/dsh-usage/provider-snapshots.json`
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Форк и перенос патчей | 0/TBD | Not started | - |
| 2. Сборка, тесты и документация | 0/TBD | Not started | - |
| 3. Публикация и подмена в профиле | 0/TBD | Not started | - |
