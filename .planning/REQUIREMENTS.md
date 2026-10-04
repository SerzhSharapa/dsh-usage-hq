# Requirements: dsh-usage-hq

**Defined:** 2026-10-04
**Core Value:** Локальные доработки виджета лимитов и парсеров провайдеров живут в версионируемых исходниках собственного плагина, а не в хрупких патчах node_modules.

## v1 Requirements

Требования первого релиза. Каждое маппится на фазы roadmap.

### База форка (BASE)

- [ ] **BASE-01**: Пакет `@linxin666/dsh-usage@0.4.4` (lib, src, конфиги) скопирован из `~/.dsh/profiles/desktop/node_modules/` как стартовая база репозитория
- [ ] **BASE-02**: Лицензия Apache-2.0 сохранена; NOTICE/кредит автору `@linxin666` (upstream zhu1090093659/dsh-web) присутствует
- [ ] **BASE-03**: Пакет переименован в `dsh-usage-hq` (unscoped, по аналогии с dsh-stt-multi/dsh-tls-fallback)
- [ ] **BASE-04**: Plugin/bundle id сменён на `hq-usage` в собственном cordis.patch.yml пакета и в профиле desktop

### Перенос патчей в src/ (PATCH)

- [ ] **PATCH-01**: Патч языка перенесён в `src/`: фолбэк инвертирован — `startsWith("zh") ? zh : en` (не-en локали получают английский, не китайский)
- [ ] **PATCH-02**: Данные виджета перенесены в `src/`: `planRows` (короткие имена OpenAI / ZAI (GLM) / Kimi; порядок OpenAI → ZAI → Kimi → остальные по алфавиту; метки окон 5h/wk/mo/mo-code) и `providerLogo` (официальные SVG в currentColor; OpenAI simple-icons v13, Kimi 11px, Z.AI из Wikimedia с маской hq-zai-z, неизвестный — кружок)
- [ ] **PATCH-03**: Рендер виджета перенесён в `src/`: в `UsageFootCard` (`data-dsh-part: foot-card-plans`) строка на провайдера — лого + колонка имени 64px (ellipsis) + область шкал flex:1; шкалы bar/barFill/barWarn(≥50%)/barLow(≥80%) с меткой окна и %
- [ ] **PATCH-04**: Парсер Kimi перенесён в `src/`: `KIMI_CODING.parse` читает `body.usages` (limit_5h, limit_month_total, limit_month_code), percent = used_ratio*100, resetsAt из reset_time, окна month/month-code, дедуп по key; недельное окно не рисуется

### Сборка и тесты (BUILD)

- [ ] **BUILD-01**: `pnpm build` (tsc + tsdown) проходит зелёным; `node --check` обоих артефактов сборки успешен
- [ ] **BUILD-02**: Тесты `vitest` upstream проходят; патчи 1–4 покрыты новыми тестами
- [ ] **BUILD-03**: npm/pnpm-кэш при сборке и тестах — только внутри ~/hq (обход EPERM-ловушки песочницы DSH)

### Документация (DOCS)

- [ ] **DOCS-01**: README на трёх языках по readme-skill: `README.md` (EN), `README.ru-RU.md`, `README.zh-CN.md` с переключателем языков в шапке; только факты из кода/подтверждённые владельцем
- [ ] **DOCS-02**: README содержит скриншот виджета, список отличий от upstream (патчи 1–4), инструкцию установки, кредиты и лицензию

### Публикация (PUBL)

- [ ] **PUBL-01**: Репозиторий `SerzhSharapa/dsh-usage-hq` создан публичным через `gh repo create --public --source . --push`, описание — осмысленное, из README
- [ ] **PUBL-02**: Перед выкладкой проверено отсутствие секретов, ключей, приватных путей и тяжёлых артефактов в коде и истории

### Подмена и верификация (DEPL)

- [ ] **DEPL-01**: В `~/.dsh/profiles/desktop/` старый `@linxin666/dsh-usage` удалён, tarball `dsh-usage-hq` подключён по `file:` (зависимость + строка в dsh.profile.bundles), DSH перезапущен
- [ ] **DEPL-02**: После перезапуска виджет: лого + сетка шкал, порядок OpenAI → ZAI (GLM) → Kimi; OpenAI — одна шкала wk на всю ширину; ZAI — 5h + wk; Kimi — 5h + mo (+ mo-code)
- [ ] **DEPL-03**: Plans-вкладка живая, значения совпадают с `~/.dsh/dsh-usage/provider-snapshots.json`; дубля id `usage` в конфиге профиля нет

## v2 Requirements

Отложено. Трекается, но не в текущем roadmap.

### Upstream contribution

- **UPST-01**: PR в upstream (zhu1090093659/dsh-web) с фиксом Kimi-парсера (`body.usages`) — отдельная задача, по решению владельца

## Out of Scope

Явно исключено. Задокументировано против scope creep.

| Feature | Reason |
|---------|--------|
| Русский словарь виджета | Выбрана стратегия «английский для не-zh локалей»; не добавлять без прямого запроса владельца |
| 5-часовое окно Codex Lite | Тариф `prolite` отдаёт только `primary_window` (week); фиктивные 0% вводили бы в заблуждение |
| Недельное окно Kimi | В API Kimi его нет — это не баг |
| Пуш в upstream без решения владельца | Наши изменения — в своём форке |
| Изменение других профилей DSH, установок Codex/Claude | За пределами задачи |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| BASE-01 | — | Pending |
| BASE-02 | — | Pending |
| BASE-03 | — | Pending |
| BASE-04 | — | Pending |
| PATCH-01 | — | Pending |
| PATCH-02 | — | Pending |
| PATCH-03 | — | Pending |
| PATCH-04 | — | Pending |
| BUILD-01 | — | Pending |
| BUILD-02 | — | Pending |
| BUILD-03 | — | Pending |
| DOCS-01 | — | Pending |
| DOCS-02 | — | Pending |
| PUBL-01 | — | Pending |
| PUBL-02 | — | Pending |
| DEPL-01 | — | Pending |
| DEPL-02 | — | Pending |
| DEPL-03 | — | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 0
- Unmapped: 18 ⚠️ (заполняется roadmapper'ом)

---
*Requirements defined: 2026-10-04*
*Last updated: 2026-10-04 after initial definition*
