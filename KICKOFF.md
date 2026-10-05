# KICKOFF — dsh-usage-hq: свой форк плагина лимитов подписок для DSH

Вводные для новой DSH-сессии. Запускать сессию **из этой папки**
(`~/hq/build/dsh-plugins/dsh-usage-hq/`) — задача со своими файлами, по карте
в корневом `CLAUDE.md` (build/ → в сервисе). Методология — **GSD Core**
(комплект DSH: `toolkit/dsh/gsd/`, перед любым `gsd-*` читать
`toolkit/dsh/gsd/ADAPTER.md`).

## Политика моделей на этот проект (прямое указание пользователя, 04.10.2026)

- **Исполнители и координатор — Kimi** (`kimi-coding`: `kimi-for-coding`,
  `kimi-for-coding-highspeed`).
- **`openai-codex` НЕ использовать** — недельный лимит подписки Codex Lite
  выжат на 100%, сброс ~10.10.2026 14:07 МСК. Это override
  `toolkit/dsh/model-routing.md` для данного проекта.
- GLM (`zai-coding-cn`, план max, окна свободны) — разрешён как fallback.
- Выбор моделей — явно через `subagent` с `provider`/`model`.

## Контекст: что за плагин и почему форк

В `~/.dsh/profiles/desktop` стоит сторонний плагин `@linxin666/dsh-usage@0.4.4`
(npm; upstream: https://github.com/zhu1090093659/dsh-web, лицензия
**Apache-2.0** — форк правомерен при сохранении лицензии и указания автора).
Он показывает в DSH:

- вкладку Settings → Usage Statistics: расход токенов, балансы API-ключей;
- вкладку **Plans**: квоты coding-подписок (GLM Coding Plan, Kimi For Coding,
  Codex/ChatGPT, OpenCode Go, MiniMax) — % и время сброса по окнам 5ч/нед/мес;
- карточку-виджет внизу сайдбара.

Плагин доведён до нужного вида **семью локальными патчами прямо в
`node_modules`** (плюс один зафиксированный факт про Codex) — они слетят
при любом обновлении. Задача форка: перенести
эти доработки в исходники, собрать **свой** плагин, опубликовать в наш GitHub.

## Текущие локальные патчи (все в `~/.dsh/profiles/desktop/node_modules/@linxin666/dsh-usage/`)

1. **Язык** — `lib/client.js`, функция `dictionary()` (~строка 182): фолбэк
   инвертирован — `startsWith("zh") ? zh : en` (было: всё не-en → китайский;
   русского словаря у upstream нет; наши строки виджета на английском).
2. **Виджет лимитов, данные** — `lib/client.js`, HQ-patch-функции
   `providerLogo(id)` и `planRows(snapshot)` (~строки 1886–1940):
   - `planRows`: провайдеры → короткие имена `OpenAI`, `ZAI (GLM)`, `Kimi`,
     фиксированный порядок OpenAI → ZAI → Kimi → остальные по алфавиту;
     окна → метки `5h`/`wk`/`mo`/`mo-code`;
   - `providerLogo`: официальные SVG в `currentColor`, 13px (`flex:none`,
     `display:block`): OpenAI — path из simple-icons v13 (узел), Kimi —
     официальный path из cdn.simpleicons.org/kimi (уменьшен до 11px —
     оптический баланс), Z.AI — официальный знак из Wikimedia
     «Z.ai (company logo).svg» (viewBox 30, скруглённый квадрат + «Z»
     вырезана SVG-маской `hq-zai-z`); неизвестный провайдер — кружок.
    - Остальные провайдеры (добавлено 04.10.2026, вечером): MiniMax —
      официальный path simple-icons (13px); OpenCode Go — ОФИЦИАЛЬНЫЙ знак
      из https://opencode.ai/favicon-v3.svg (viewBox 512: белая рамка
      fill currentColor + внутренний квадрат opacity .45); DeepSeek —
      официальный path
      simple-icons (11px — сплошной знак); Moonshot (PAYG) — тот же знак
      Kimi (одна компания); OpenRouter — официальный path simple-icons
      (11px); SiliconFlow — ОФИЦИАЛЬНАЯ зелёная волна из
      https://framerusercontent.com/images/KG9tiGO3i5GSvUZSozEJa14Qxc.svg
      (viewBox 1024, fill currentColor). Имена/порядок в planRows: OpenAI → ZAI (GLM) → Kimi →
      OpenCode → MiniMax → прочие по алфавиту. Исходники path-данных —
      кэш в /tmp/logo_*.svg не вечен: при сборке форка взять заново с
      cdn.simpleicons.org / Wikimedia и закоммитить в docs/ репозитория.
3. **Виджет лимитов, рендер (финальный UI, итерация 5 от 04.10.2026)** —
   `lib/client.js`, блок рендера в `UsageFootCard` (искать
   `data-dsh-part": "foot-card-plans"`). Иерархический макет:
   - строка-заголовок провайдера: лого + имя (11px/600, ellipsis,
     `flex:1`) + справа доминирующий % (max по окнам, 11px/600;
     цвет: `#dc2626` ≥80, `#d97706` ≥50, иначе inherit/opacity .75);
   - под ней по окну на строку, на всю ширину карточки: метка окна
     (10px, opacity .55, 16px), полоса `flex:1` высотой 5px — классы
     `bar`/`barFill`/`barWarn`(≥50%)/`barLow`(≥80%), затем выровненные
     вправо цифры: % (10px, minWidth 24px) и таймер (9.5px, opacity .45,
     minWidth 28px), оба `text-align: right`, `tabular-nums`;
   - провайдеры разделены `marginTop: 6px`, окна — `gap: 2px`.
   Отвергнутые компоновки (не возвращаться): все окна в одну строку —
   не влезают с таймерами; фиксированная колонка имён + колонка окон —
   мёртвая зона и рваный правый край.
4. **Kimi, новый формат API** — `lib/index.js`, адаптер `KIMI_CODING.parse`:
   upstream ждёт `body.usage` (Weekly) — Kimi уже отдаёт `body.usages`:
   `limit_5h` (used_ratio 0..1), `limit_month_total`, `limit_month_code`.
   Патч добавляет окна `month`/`month-code` из `usages` (percent =
   `used_ratio*100`, resetsAt из `reset_time`, дедуп по key). У Kimi
   **нет недельного окна** — это не баг.
5. **Таймеры сброса в виджете** — `lib/client.js`: `planRows` сохраняет
   `resetsAt` окна; функция `resetCountdown(iso)` рендерит рядом с
   процентом серый мини-таймер `· 4h12m` / `· 6d3h` (минуты — `m`,
   истёкшее — `reset`, нет данных — не рисуется). Окно `month-code`
   из виджета отфильтровано (в Plans-вкладке остаётся).
6. **Codex факт** (не патч): у пользователя план **Lite** (`prolite`) — API
   `chatgpt.com/backend-api/wham/usage` отдаёт только `primary_window`
   (week), `secondary_window: null`. 5-часового окна у тарифа нет; не
   «чинить» и не рисовать фиктивные 0%.
7. **Виджет только про подписки** (решение владельца 04.10.2026): из
    развёрнутой карточки удалены строка «сегодня токенов · calls»
    (`usageLine`), строка балансов (`balances`) и нижняя `footMeta`.
    Заголовок карточки: «LIMITS» без иконки (10px/600, uppercase, letterSpacing
    .09em, opacity .6 — мелкий каптал в едином стиле) слева, время обновления
    (`formatClock(snapshot.updatedAt)`, 10px, opacity .45) справа.
    Обоснование: у владельца подписки, а не PAYG — счётчики токенов
    не actionable; расход и балансы остаются в Settings-секции.
8. **PAYG-балансы в виджете** (просьба владельца 04.10.2026): после
    подписочных строк — по строке на PAYG-провайдера с живым балансом
    (`credential != none && balance != void 0`): лого + имя (11px/500)
    + справа остаток `formatBalance(balance)` (11px/600, tabular,
    marginRight 18px). Порядок: после подписок, по алфавиту имени.
    Имена: OpenRouter / DeepSeek / Moonshot / SiliconFlow. Только
    развёрнутый вид; в свёрнутых чипах PAYG не показывать. Блок
    визуально отделён: hairline-разделитель (borderTop 1px, currentColor
    12%) с микро-подписью «PAYG» (9px каптал, opacity .4), строки блока
    приглушены целиком (opacity .72) — яркость лого не должна
    конкурировать с подписочными. Пороги цвета баланса (владелец
    04.10.2026): < $1 → красный #dc2626, < $10 → жёлтый #d97706,
    иначе — без цвета; CNY пересчитывается по курсу /7.2.
    Свёрнутая полоска тоже переделана: надписи «LIMITS» в свёрнутом
    виде НЕТ (только в развёрнутом заголовке), вся полоска — чипы по провайдерам: лого + самый горячий %
    подписки (цвет: #dc2626 ≥80, #d97706 ≥50, иначе inherit/.75);
    в состоянии загрузки — «—». Полоска многострочная: контейнер
    `flexWrap: wrap` (`whiteSpace: normal`), чипы переносятся на вторую
    строку при росте числа провайдеров. Чипы выровнены по ЛЕВОМУ краю,
    как остальные элементы сайдбара (`marginLeft: auto` убрать;
    `marginRight: 18px` держать — зазор под стрелку-переключатель).
    При наведении на чип — тултип `имя %`. Финальное состояние вида
    одобрено владельцем 04.10.2026 («великолепно») — это эталон UI.

Рабочие стейты плагина: `~/.dsh/dsh-usage/provider-snapshots.json` (квоты),
`usage-ledger.json` (расход). Опрос квот — 60 с (`pollIntervalSec`), виджет —
30 с. Креды берутся из `~/.dsh/.credentials.yaml` (refs/env + OAuth-гранты).

## Что сделать (объём форка)

Форма проекта — **форк, не переписывание с нуля** (решение владельца,
обсуждено 04.10.2026). Обоснование: наши доработки — это ~150 строк
поверх ~4 000 строк движка upstream (адаптеры провайдеров, host-пробы,
ledger, i18n, dsh.client-обвязка, Settings-секция); переписывать их с
нуля — недели работы без новой ценности, а код, «написанный с нуля по
образцу», юридически всё равно производный. Обязанности форка:
сохранить Apache-2.0, NOTICE/кредит `@linxin666` (upstream
zhu1090093659/dsh-web), в README объявить происхождение («fork of...»).

1. `git init` здесь; скопировать пакет из
   `~/.dsh/profiles/desktop/node_modules/@linxin666/dsh-usage/`
   (upstream кладёт в npm-пакет и `lib`, и `src`, и конфиги) как стартовую
   базу, сохраняя Apache-2.0 и NOTICE/кредит автору `@linxin666`
   (upstream zhu1090093659/dsh-web).
2. Переименовать: пакет → `dsh-usage-hq` (или scope пользователя),
   bundle/plugin id можно оставить `usage` (или `hq-usage` — тогда сменить id
   в собственном `cordis.patch.yml` пакета и в профиле).
3. Перенести патчи 1–5 и 7–8 из раздела выше **в исходники** (`src/`), не в
   собранный `lib/`. Сборка: `pnpm build` (tsc + tsdown), тесты `vitest`
   (upstream имеет тесты — прогнать, наши доработки покрыть новыми).
   Известная ловушка песочницы DSH: npm-кэш вне ~/hq падает с EPERM —
   `--cache ~/hq/...` (см. DSH-WORKFLOWS.md).
4. README **на трёх языках** по правилам build/CLAUDE.md: `README.md` (EN),
   `README.ru-RU.md`, `README.zh-CN.md`, с переключателем языков в шапке.
   Писать скиллом `readme-skill` (исходник `~/hq/toolkit/readme-skill/`):
   fact-based, каждое утверждение — из кода или подтверждено владельцем;
   отличия от upstream (патчи 1–8), установка, кредиты.
   **Скриншоты обязательны** (просьба владельца 04.10.2026): сделать
   скриншоты свёрнутого и развёрнутого виджета из GUI DSH (владелец может
   предоставить, либо снять самому через доступ к GUI), положить в
   `docs/screenshot-*.png`, подключить в шапку README (все три языка).
   Перед коммитом проверить, что на скрине нет секретов и лишних чатов.
5. Публикация: владелец уже решил «публичный GitHub» (просьба от 04.10.2026)
   — зафиксировать решение в `.planning/PROJECT.md` (поле «Публикация»).
   Перед выкладкой проверить отсутствие секретов/ключей/приватных путей.
   Лицензия — **Apache-2.0** (наследие upstream, MIT нельзя). Команда:
   `gh repo create SerzhSharapa/dsh-usage-hq --public --source . --push`;
   описание репозитория — осмысленное, из README.
6. Подмена в профиле: в `~/.dsh/profiles/desktop/` — `pnpm remove
   @linxin666/dsh-usage`, собрать tarball и подключить по `file:` как
   соседние `dsh-stt-multi`/`dsh-tls-fallback` (зависимость + строка в
   `dsh.profile.bundles` в package.json; собственный bundle-patch пакета
   вставляет plugin row сам). Перезапуск DSH обязателен (host-половина).
7. Верификация (native verify GSD):
   - после перезапуска DSH виджет: лого + сетка шкал, порядок
     OpenAI → ZAI (GLM) → Kimi;
   - OpenAI: одна шкала на всю ширину (wk), ZAI: 5h + wk, Kimi: 5h + mo
     (+ mo-code);
   - Plans-вкладка живая, значения совпадают с
     `~/.dsh/dsh-usage/provider-snapshots.json`;
   - `node --check` обоих артефактов сборки; `pnpm remove` старого пакета
     не оставил дубль id `usage` в конфиге профиля.

## GSD-путь

`gsd-new-project` (PROJECT.md из этого KICKOFF) → `gsd-spec-phase` →
`gsd-plan-phase` → `gsd-execute-phase` → verify. Мелкую правку по ходу —
`gsd-quick`. Dispatch субагентов — по ADAPTER.md, все роли на
`kimi-coding` (см. политику моделей выше), review-независимость
по model-routing.md обеспечивается тем, что и реализация, и review идут
на Kimi разных моделей (kimi-for-coding ↔ highspeed), без openai-codex.

## Чего не делать

- Не трогать установки Codex/Claude и другие профили DSH.
- Не пушить в upstream-репозиторий автора без отдельного решения; наши
  изменения — в своём форке. (Опционально позже: PR с фиксом Kimi-парсера
  upstream — автору пригодится, отдельная задача.)
- Не заводить `.planning/` вне этой папки; не переустанавливать GSD-комплект.
- Русского словаря в виджете не добавлять, пока не попросит пользователь:
  выбрана стратегия «английский для не-zh локалей».
