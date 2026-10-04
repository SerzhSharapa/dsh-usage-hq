# Roadmap: dsh-usage-hq

## Overview

Путь от хрупких патчей в `node_modules` до собственного опубликованного плагина: сначала форкаем пакет `@linxin666/dsh-usage@0.4.4` и переносим все четыре доработки в версионируемые `src/` (фаза 1), затем добиваемся зелёной сборки и тестов и пишем README на трёх языках (фаза 2), наконец публикуем репозиторий и переключаем на свой пакет профиль desktop, верифицируя виджет после перезапуска (фаза 3).

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Форк и перенос патчей** - Свой пакет `dsh-usage-hq` (id `hq-usage`) с четырьмя доработками в `src/`, идентичный пропатченному `node_modules` по поведению
- [ ] **Phase 2: Сборка, тесты и документация** - Зелёный `pnpm build`, зелёные vitest (upstream + новые на патчи), README EN/RU/ZH по readme-skill
- [ ] **Phase 3: Публикация и подмена в профиле** - Публичный GitHub `SerzhSharapa/dsh-usage-hq` без секретов; профиль desktop на `file:`-тарболе; виджет живой после перезапуска

## Phase Details

### Phase 1: Форк и перенос патчей
**Goal**: Существует собственный пакет `dsh-usage-hq` с plugin/bundle id `hq-usage`, функционально идентичный текущему пропатченному `@linxin666/dsh-usage@0.4.4`, но с четырьмя доработками, живущими в версионируемых исходниках `src/`, а не в `node_modules`
**Depends on**: Nothing (first phase)
**Requirements**: BASE-01, BASE-02, BASE-03, BASE-04, PATCH-01, PATCH-02, PATCH-03, PATCH-04
**Success Criteria** (what must be TRUE):
  1. Репозиторий содержит полную копию пакета `@linxin666/dsh-usage@0.4.4` (lib, src, конфиги) из `~/.dsh/profiles/desktop/node_modules/`, с сохранённой Apache-2.0 и NOTICE/кредитом автору `@linxin666` (upstream zhu1090093659/dsh-web)
  2. Пакет везде переименован в `dsh-usage-hq` (unscoped), plugin/bundle id сменён на `hq-usage` — в собственном `cordis.patch.yml` пакета и в профиле desktop
  3. В `src/` воспроизведены все четыре патча: инвертированный языковой фолбэк (`startsWith("zh") ? zh : en`), данные виджета (`providerLogo` + `planRows` — короткие имена, порядок OpenAI → ZAI (GLM) → Kimi, метки 5h/wk/mo/mo-code, SVG в currentColor), рендер `UsageFootCard` (строка на провайдера, 64px-имя ellipsis, шкалы bar/barFill/barWarn/barLow), парсер `KIMI_CODING.parse` из `body.usages` (окна month/month-code, дедуп по key, недельного окна нет)
  4. Собранный из `src/` код поведенчески идентичен текущему пропатченному `lib/`: по ключевым функциям (dictionary, providerLogo, planRows, UsageFootCard, KIMI_CODING.parse) diff пуст или подтверждённо эквивалентен
**Plans**: TBD
**UI hint**: yes

### Phase 2: Сборка, тесты и документация
**Goal**: Пакет `dsh-usage-hq` собирается зелёно (tsc + tsdown), все тесты проходят, npm-кэш работает внутри ~/hq, README на трёх языках готов к публикации — только подтверждённые факты
**Depends on**: Phase 1
**Requirements**: BUILD-01, BUILD-02, BUILD-03, DOCS-01, DOCS-02
**Success Criteria** (what must be TRUE):
  1. `pnpm build` (tsc + tsdown) проходит без ошибок; `node --check` успешен для обоих артефактов сборки
  2. Все тесты `vitest` зелёные: upstream-тесты проходят без правок, патчи 1–4 покрыты новыми тестами (языковой фолбэк, planRows/providerLogo, рендер шкал, Kimi-парсер)
  3. Сборка и тесты работают с npm/pnpm-кэшем внутри ~/hq — падений EPERM от песочницы DSH нет
  4. Существуют `README.md` (EN), `README.ru-RU.md`, `README.zh-CN.md` с переключателем языков в шапке; содержат скриншот виджета, список отличий от upstream (патчи 1–4), инструкцию установки, кредиты и лицензию; каждое утверждение — из кода или подтверждено владельцем
**Plans**: TBD

### Phase 3: Публикация и подмена в профиле
**Goal**: Репозиторий `SerzhSharapa/dsh-usage-hq` опубликован публично и чист от секретов, профиль `~/.dsh/profiles/desktop` живёт на собственном `file:`-тарболе, и после перезапуска DSH виджет и вкладка Plans работают как до форка
**Depends on**: Phase 2
**Requirements**: PUBL-01, PUBL-02, DEPL-01, DEPL-02, DEPL-03
**Success Criteria** (what must be TRUE):
  1. Репозиторий `SerzhSharapa/dsh-usage-hq` создан публичным (`gh repo create --public --source . --push`) с осмысленным описанием из README; перед выкладкой проверено отсутствие секретов, ключей, приватных путей и тяжёлых артефактов в коде и истории
  2. В `~/.dsh/profiles/desktop/` старый `@linxin666/dsh-usage` удалён (`pnpm remove`), tarball `dsh-usage-hq` подключён по `file:` (зависимость + строка в `dsh.profile.bundles`), DSH перезапущен, дубля id `usage` в конфиге профиля нет
  3. После перезапуска DSH виджет в сайдбаре показывает лого и сетку шкал в порядке OpenAI → ZAI (GLM) → Kimi: OpenAI — одна шкала wk на всю ширину, ZAI — 5h + wk, Kimi — 5h + mo (+ mo-code), цветовые пороги barWarn ≥50% / barLow ≥80% работают
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
