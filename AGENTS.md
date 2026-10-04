<!-- GSD:project-start source:PROJECT.md -->

## Project

**dsh-usage-hq**

Собственный форк npm-плагина `@linxin666/dsh-usage@0.4.4` для DeepSeek Harness
(upstream: github.com/zhu1090093659/dsh-web, Apache-2.0). Плагин показывает в DSH расход
токенов и балансы API-ключей (Settings → Usage Statistics), квоты coding-подписок
(GLM Coding Plan, Kimi For Coding, Codex/ChatGPT, OpenCode Go, MiniMax) с процентами и
временем сброса по окнам 5ч/нед/мес (вкладка Plans) и карточку-виджет внизу сайдбара.
Форк переносит пять локальных патчей, сейчас живущих прямо в `node_modules` установленного
плагина (и слетающих при любом обновлении), в собственные исходники, собирает свой пакет
`dsh-usage-hq` и публикует его в открытый GitHub-репозиторий владельца.

**Core Value:** Локальные доработки виджета лимитов и парсеров провайдеров должны жить в версионируемых
исходниках собственного плагина, а не в хрупких патчах `node_modules`: после форка
обновление/переустановка не уничтожает рабочий виджет.

### Constraints

- **Лицензия**: Apache-2.0 с сохранением кредита автору `@linxin666` — обязательное наследие upstream, MIT нельзя
- **Публикация**: открытый GitHub `SerzhSharapa/dsh-usage-hq` — решение владельца от 04.10.2026; перед выкладкой проверить отсутствие секретов, ключей, приватных путей, тяжёлых артефактов
- **Модели**: исполнители и координатор — Kimi (`kimi-coding`: `kimi-for-coding`, `kimi-for-coding-highspeed`); `openai-codex` НЕ использовать (недельный лимит Codex Lite выжат, сброс ~10.10.2026 14:07 МСК); GLM (`zai-coding-cn`, max) разрешён как fallback. Override toolkit/dsh/model-routing.md для этого проекта; выбор явно через `subagent` с provider/model
- **Сборка**: pnpm + tsc + tsdown, тесты vitest; npm-кэш только внутри ~/hq (EPERM-ловушка)
- **Профиль**: трогается только `~/.dsh/profiles/desktop`; подмена пакета требует перезапуска DSH (host-половина)
- **Песочница**: `.planning/` только в этой папке; GSD-комплект не переустанавливать

<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->

## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `$gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `$gsd-debug` for investigation and bug fixing
- `$gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `$gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
