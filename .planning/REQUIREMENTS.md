# Requirements: dsh-usage-hq

**Defined:** 2026-10-04
**Core Value:** Локальные доработки виджета лимитов и парсеров провайдеров живут в версионируемых исходниках собственного плагина, а не в хрупких патчах node_modules. Финальный UI виджета (итерация 5, одобрен владельцем) — эталон.

## v1 Requirements

Требования первого релиза. Каждое маппится на фазы roadmap.

### База форка (BASE)

- [ ] **BASE-01**: Пакет `@linxin666/dsh-usage@0.4.4` (lib, src, LICENSE, cordis.patch.yml, icon.svg, README-исходники upstream) скопирован из `~/.dsh/profiles/desktop/node_modules/` как стартовая база; недостающие конфиги сборки (tsconfig*.json, tsdown.config.ts, vitest.config.ts) и tests/ взяты из upstream GitHub (ветка dev, packages/dsh-usage/)
- [ ] **BASE-02**: Лицензия Apache-2.0 сохранена; NOTICE/кредит автору `@linxin666` (upstream zhu1090093659/dsh-web) присутствует; в README объявлено происхождение («fork of…»)
- [ ] **BASE-03**: Пакет переименован в `dsh-usage-hq` (unscoped, по аналогии с dsh-stt-multi/dsh-tls-fallback)
- [ ] **BASE-04**: Plugin/bundle id сменён на `hq-usage` в собственном cordis.patch.yml пакета и в профиле desktop; RPC-неймспейс `dsh-usage.*` и state-директория `~/.dsh/dsh-usage/` НЕ переименованы (существующие данные профиля продолжают читаться)

### Перенос патчей в src/ (PATCH)

- [ ] **PATCH-01**: Патч языка перенесён в `src/client/locales.ts` (`dictionary()`): фолбэк инвертирован — `startsWith("zh") ? zh : en`
- [ ] **PATCH-02**: Данные виджета перенесены в `src/client/UsageFootCard.tsx`: `planRows` (короткие имена OpenAI / ZAI (GLM) / Kimi / OpenCode / MiniMax; порядок OpenAI → ZAI → Kimi → OpenCode → MiniMax → прочие по алфавиту; метки окон 5h/wk/mo/month-code) и `providerLogo` (официальные SVG в currentColor: OpenAI 13px; Kimi 11px; Z.AI маска hq-zai-z; MiniMax simple-icons 13px; OpenCode из opencode.ai/favicon-v3.svg viewBox 512; DeepSeek simple-icons 11px; Moonshot (PAYG) = знак Kimi; OpenRouter 11px; SiliconFlow зелёная волна viewBox 1024; неизвестный — кружок). Исходники path-данных взяты заново с cdn.simpleicons.org/Wikimedia/opencode.ai/framerusercontent и закоммичены в docs/ репозитория
- [ ] **PATCH-03**: Рендер виджета (финальный UI, итерация 5) перенесён в `src/client/UsageFootCard.tsx`: иерархический макет — строка-заголовок провайдера (лого + имя 11px/600 ellipsis flex:1 + доминирующий % справа: #dc2626 ≥80, #d97706 ≥50, иначе inherit/opacity .75); под ней по окну на строку на всю ширину (метка 10px/opacity .55/16px + полоса 5px flex:1 классов bar/barFill/barWarn(≥50%)/barLow(≥80%) + вправо: % 10px minWidth 24px и таймер 9.5px opacity .45 minWidth 28px, оба text-align right, tabular-nums); провайдеры разделены marginTop 6px, окна gap 2px
- [ ] **PATCH-04**: Парсер Kimi перенесён в `src/core/adapters.ts`: `KIMI_CODING.parse` читает `body.usages` (limit_5h, limit_month_total, limit_month_code), percent = used_ratio*100, resetsAt из reset_time, окна month/month-code, дедуп по key; недельное окно не рисуется
- [ ] **PATCH-05**: Таймеры сброса перенесены в `src/client/UsageFootCard.tsx`: `planRows` сохраняет resetsAt окна; `resetCountdown(iso)` рендерит `· 4h12m` / `· 6d3h` (минуты — m, истёкшее — `reset`, нет данных — не рисуется); окно month-code из виджета отфильтровано (в Plans-вкладке остаётся)
- [ ] **PATCH-06**: Виджет только про подписки (KICKOFF патч 7): из развёрнутой карточки удалены usageLine, balances, footMeta; заголовок карточки «LIMITS» без иконки (10px/600, uppercase, letterSpacing .09em, opacity .6) слева + время обновления (formatClock, 10px, opacity .45) справа
- [ ] **PATCH-07**: PAYG-балансы (KICKOFF патч 8): после подписочных строк — по строке на PAYG-провайдера (credential≠none && balance≠undefined): лого + имя 11px/500 + formatBalance справа (11px/600, tabular, marginRight 18px); порядок по алфавиту (OpenRouter / DeepSeek / Moonshot / SiliconFlow); hairline-разделитель (borderTop 1px, currentColor 12%) + микро-подпись «PAYG» (9px каптал, opacity .4); строки блока приглушены opacity .72; пороги баланса: < $1 → #dc2626, < $10 → #d97706, иначе без цвета; CNY/7.2. Свёрнутая полоска: без надписи LIMITS; чипы по провайдерам (лого + самый горячий % подписки, цвет ≥80 #dc2626 / ≥50 #d97706 / иначе inherit/.75); flexWrap wrap (многострочная); выравнивание влево; marginRight 18px; тултип «имя %»; в загрузке «—»; PAYG в свёрнутых чипах не показывать

### Сборка и тесты (BUILD)

- [ ] **BUILD-01**: `pnpm build` (tsc + tsdown) проходит зелёным; `node --check` обоих артефактов сборки успешен
- [ ] **BUILD-02**: Тесты `vitest` upstream (из tests/ upstream-репо) проходят; патчи 1–5 и 7–8 покрыты новыми тестами
- [ ] **BUILD-03**: npm/pnpm-кэш при сборке и тестах — только внутри ~/hq (обход EPERM-ловушки песочницы DSH)
- [ ] **BUILD-04**: Собранный из форка `lib/` поведенчески идентичен текущему пропатченному `lib/` node_modules по ключевым функциям (dictionary, providerLogo, planRows, resetCountdown, UsageFootCard, KIMI_CODING.parse) — diff пуст или подтверждённо эквивалентен (кроме переименований пакета/id)

### Документация (DOCS)

- [ ] **DOCS-01**: README на трёх языках по readme-skill: `README.md` (EN), `README.ru-RU.md`, `README.zh-CN.md` с переключателем языков в шапке; только факты из кода/подтверждённые владельцем; объявлено происхождение форка и кредиты
- [ ] **DOCS-02**: README содержит список отличий от upstream (патчи 1–8), инструкцию установки, лицензию
- [ ] **DOCS-03**: Скриншоты свёрнутого и развёрнутого виджета сняты из GUI DSH, лежат в `docs/screenshot-*.png`, подключены в шапку всех трёх README; на скринах нет секретов и лишних чатов. Исходники SVG лого закоммичены в docs/

### Публикация (PUBL)

- [ ] **PUBL-01**: Репозиторий `SerzhSharapa/dsh-usage-hq` создан публичным через `gh repo create --public --source . --push`, описание — осмысленное, из README
- [ ] **PUBL-02**: Перед выкладкой проверено отсутствие секретов, ключей, приватных путей и тяжёлых артефактов в коде, истории и скриншотах

### Подмена и верификация (DEPL)

- [ ] **DEPL-01**: В `~/.dsh/profiles/desktop/` старый `@linxin666/dsh-usage` удалён, tarball `dsh-usage-hq` подключён по `file:` (зависимость + строка в dsh.profile.bundles), DSH перезапущен
- [ ] **DEPL-02**: После перезапуска виджет соответствует эталону итерации 5: иерархические строки провайдеров с лого/именем/доминирующим %, строки окон с полосой+%+таймером, порядок OpenAI → ZAI (GLM) → Kimi → OpenCode → MiniMax, PAYG-блок с разделителем, свёрнутая полоска чипов (wrap, влево, без «LIMITS»)
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
| Отвергнутые компоновки виджета (все окна в одну строку; фикс. колонки имён+окон) | Итерации 1–4 отвергнуты владельцем; эталон — итерация 5 |
| PAYG в свёрнутых чипах | Решение владельца: PAYG только в развёрнутом виде |
| Пуш в upstream без решения владельца | Наши изменения — в своём форке |
| Изменение других профилей DSH, установок Codex/Claude | За пределами задачи |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| BASE-01 | Phase 1 | Pending |
| BASE-02 | Phase 1 | Pending |
| BASE-03 | Phase 1 | Pending |
| BASE-04 | Phase 1 | Pending |
| PATCH-01 | Phase 1 | Pending |
| PATCH-02 | Phase 1 | Pending |
| PATCH-03 | Phase 1 | Pending |
| PATCH-04 | Phase 1 | Pending |
| PATCH-05 | Phase 1 | Pending |
| PATCH-06 | Phase 1 | Pending |
| PATCH-07 | Phase 1 | Pending |
| BUILD-01 | Phase 2 | Pending |
| BUILD-02 | Phase 2 | Pending |
| BUILD-03 | Phase 2 | Pending |
| BUILD-04 | Phase 1 | Pending |
| DOCS-01 | Phase 2 | Pending |
| DOCS-02 | Phase 2 | Pending |
| DOCS-03 | Phase 2 | Pending |
| PUBL-01 | Phase 3 | Pending |
| PUBL-02 | Phase 3 | Pending |
| DEPL-01 | Phase 3 | Pending |
| DEPL-02 | Phase 3 | Pending |
| DEPL-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0 ✓

---
*Requirements defined: 2026-10-04*
*Last updated: 2026-10-04 after KICKOFF update (7 патчей + эталонный UI итерации 5; PATCH-05/06/07, BUILD-04, DOCS-03 добавлены)*
