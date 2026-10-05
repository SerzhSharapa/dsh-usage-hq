/** @vitest-environment jsdom */

/**
 * The sidebar limits foot card's content rules (HQ fork, final UI iteration 5):
 * a "LIMITS" caption with the updated-at clock, one hierarchical block per
 * subscription provider (logo + name + dominant percent, then per-window rows
 * with label, 5px bar, percent and reset countdown), an optional dimmed PAYG
 * block for pay-as-you-go providers with a live balance, and a collapsed strip
 * of logo+percent chips. The month-code window never reaches the widget; the
 * visibility gates (settings flag off, 404 host) are unchanged from upstream.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import type { ConfigForm, ConfigFormSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'
import { FOOT_CARD_COLLAPSED_KEY, UsageFootCard, type UsageFootCardProps } from '../src/client/UsageFootCard.tsx'
import type { UsageSettings } from '../src/client/UsageSectionCard.tsx'
import type { UsageStoreInstance, UsageUiState } from '../src/client/usage-store.ts'
import { emptyTotals, type PlanWindowView, type ProviderSnapshotView, type UsageOverviewView } from '../src/core/types.ts'

/** Previous localStorage descriptor, restored after each test. */
let originalStorage: PropertyDescriptor | undefined

/**
 * Ensure a working Web Storage backing store. jsdom supplies one, but on
 * Node >= 23 the runtime's own flag-less localStorage shadows it (vitest's
 * populateGlobal keeps the pre-existing global), so a standards-shaped
 * in-memory store takes its place for this spec; CI on Node 22 keeps the
 * jsdom original.
 */
function installStorage(): PropertyDescriptor | undefined {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  if (typeof window.localStorage?.setItem === 'function') return original
  const store = new Map<string, string>()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      get length() { return store.size },
      key: (index: number) => [...store.keys()][index] ?? null,
      getItem: (name: string) => store.get(name) ?? null,
      setItem: (name: string, value: string) => { store.set(name, value) },
      removeItem: (name: string) => { store.delete(name) },
      clear: () => { store.clear() },
    },
  })
  return original
}

beforeEach(() => {
  originalStorage = installStorage()
  window.localStorage.clear()
  // HQ fallback: pin zh where the zh copy is asserted; the inverted default
  // (non-zh => en) has its own dedicated test below.
  document.documentElement.lang = 'zh'
})

afterEach(() => {
  cleanup()
  document.documentElement.lang = ''
  if (originalStorage !== undefined) Object.defineProperty(globalThis, 'localStorage', originalStorage)
})

/** A wire provider row with view defaults; callers override the credential. */
function provider(row: Partial<ProviderSnapshotView> & Pick<ProviderSnapshotView, 'provider'>): ProviderSnapshotView {
  return { displayName: row.provider, credential: 'none', supported: true, ...row }
}

/** A subscription provider carrying plan windows. */
function planProvider(row: Partial<ProviderSnapshotView> & Pick<ProviderSnapshotView, 'provider'>, windows: PlanWindowView[]): ProviderSnapshotView {
  return provider({ ...row, planSupported: true, plan: { windows, updatedAt: 1 } })
}

/** A minimal overview document; the today bucket and provider list are the caller's. */
function overview(providers: ProviderSnapshotView[], today: Partial<UsageOverviewView['usage']['today']['totals']> = {}): UsageOverviewView {
  return {
    updatedAt: 1_700_000_000_000,
    providers,
    current: { provider: 'deepseek', model: '', source: 'live' },
    usage: {
      today: { date: '2026-01-01', totals: { ...emptyTotals(), ...today }, providers: [] },
      days: [],
      range: { from: '2026-01-01', to: '2026-01-01', totals: emptyTotals(), providers: [] },
    },
  }
}

/** A mutable store fake; set() republishes to the subscribed component. */
function fakeStore(initial: UsageUiState): { store: UsageStoreInstance; set: (next: UsageUiState) => void } {
  let state = initial
  const listeners = new Set<() => void>()
  return {
    store: {
      subscribe: (listener: () => void) => {
        listeners.add(listener)
        return () => { listeners.delete(listener) }
      },
      getSnapshot: () => state,
    } as unknown as UsageStoreInstance,
    set: (next: UsageUiState) => {
      state = next
      for (const listener of [...listeners]) listener()
    },
  }
}

/** A settings-form fake over one effective value; publish() stands in for a Host answer. */
function fakeForm(initial: UsageSettings = {}): { form: ConfigForm<UsageSettings>; publish: (patch: UsageSettings) => void } {
  const listeners = new Set<() => void>()
  const snapshot = (value: UsageSettings): ConfigFormSnapshot<UsageSettings> => ({
    status: 'ready',
    value,
    base: undefined,
    user: undefined,
    revision: 1,
    writable: true,
    mode: 'host',
  })
  let held = snapshot(initial)
  return {
    form: {
      getSnapshot: () => held,
      subscribe: (listener: () => void) => {
        listeners.add(listener)
        return () => { listeners.delete(listener) }
      },
      set: () => Promise.resolve(true),
      unset: () => Promise.resolve(false),
      mutate: () => Promise.resolve(false),
    } as unknown as ConfigForm<UsageSettings>,
    publish: (patch) => {
      held = snapshot({ ...held.value, ...patch })
      for (const listener of [...listeners]) listener()
    },
  }
}

/** A locale source whose listeners the test fires by hand. */
function fakeLocale(): { locale: NonNullable<UsageFootCardProps['locale']>; emit: () => void } {
  const listeners = new Set<() => void>()
  return {
    locale: {
      subscribe: (listener: () => void) => {
        listeners.add(listener)
        return () => { listeners.delete(listener) }
      },
    },
    emit: () => { for (const listener of [...listeners]) listener() },
  }
}

function cardProps(over: UsageOverviewView | null, extra: Partial<UsageFootCardProps> = {}): UsageFootCardProps {
  return {
    store: fakeStore({ snapshot: over, status: over === null ? 'loading' : 'ready', error: null }).store,
    poll: () => {},
    onOpen: () => {},
    settings: fakeForm().form,
    ...extra,
  }
}

/** Reset countdown pointing `minutes` into the future (30s margin against clock drift). */
function inMinutes(minutes: number): string {
  return new Date(Date.now() + minutes * 60_000 + 30_000).toISOString()
}

/** The canonical subscription roster: fixed-order providers plus a catch-all. */
const roster = (): ProviderSnapshotView[] => [
  planProvider({ provider: 'kimi-coding', displayName: 'Kimi For Coding' }, [
    { key: '5h', percent: 30, resetsAt: inMinutes(4 * 60 + 12) },
    { key: 'month', percent: 55, resetsAt: inMinutes(6 * 24 * 60 + 180) },
  ]),
  planProvider({ provider: 'openai-codex', displayName: 'Codex' }, [
    { key: 'week', percent: 85 },
  ]),
  planProvider({ provider: 'zai-coding-cn', displayName: 'GLM Coding Plan' }, [
    { key: '5h', percent: 10 },
    { key: 'week', percent: 40 },
  ]),
]

const deepseekBalance = provider({ provider: 'deepseek', displayName: 'DeepSeek', credential: 'env', balanceSupported: true, balance: { currency: 'CNY', totalBalance: '42.00', updatedAt: 1 } })

describe('UsageFootCard content (final UI)', () => {
  it('user sees the LIMITS caption, the clock and one block per subscription', () => {
    // Given an overview whose providers carry plan windows
    const { container } = render(<UsageFootCard {...cardProps(overview(roster()))} />)

    // Then the caption and the per-provider blocks render, tokens/balances/meta do not
    const card = container.querySelector('[data-dsh-part="foot-card"]')!
    expect(card.textContent).toContain('LIMITS')
    const rows = container.querySelectorAll('[data-dsh-part="foot-card-plans"]')
    expect(rows).toHaveLength(3)
    expect(container.querySelector('[data-dsh-part="foot-card-usage"]')).toBeNull()
    expect(container.querySelector('[data-dsh-part="foot-card-balances"]')).toBeNull()
    expect(container.querySelector('[data-dsh-part="foot-card-payg-sep"]')).toBeNull()
    expect(container.querySelector('[data-dsh-part="foot-card-payg"]')).toBeNull()
  })

  it('user reads the providers in the fixed order OpenAI, ZAI (GLM), Kimi', () => {
    // Given the roster declared out of order
    const { container } = render(<UsageFootCard {...cardProps(overview(roster()))} />)

    // Then the provider blocks follow the HQ order (short names, not displayNames)
    const names = [...container.querySelectorAll('[data-dsh-part="foot-card-plans"]')]
      .map((row) => row.querySelector('span span:nth-child(2)')?.textContent)
    expect(names).toEqual(['OpenAI', 'ZAI (GLM)', 'Kimi'])
  })

  it('user sees window rows with label, bar, percent and a reset countdown', () => {
    // Given a Kimi row whose 5h window resets in 4h12m
    const { container } = render(<UsageFootCard {...cardProps(overview(roster()))} />)

    // Then each window row shows the localized label, a 5px bar, the percent
    // and the compact countdown; the month-code window never reaches the widget
    const kimi = container.querySelectorAll('[data-dsh-part="foot-card-plans"]')[2]!
    expect(kimi.textContent).toContain('5h')
    expect(kimi.textContent).toContain('30%')
    expect(kimi.textContent).toContain('4h12m')
    expect(kimi.textContent).toContain('mo')
    expect(kimi.textContent).toContain('55%')
    expect(kimi.textContent).toContain('6d3h')
  })

  it('user never sees the month-code window on the widget', () => {
    // Given a Kimi row that also carries the month-code window
    const roster2 = roster()
    roster2[0] = planProvider({ provider: 'kimi-coding', displayName: 'Kimi For Coding' }, [
      { key: '5h', percent: 30 },
      { key: 'month', percent: 55 },
      { key: 'month-code', percent: 90 },
    ])
    const { container } = render(<UsageFootCard {...cardProps(overview(roster2))} />)

    // Then the widget skips it (it stays on the Plans tab)
    const kimi = container.querySelectorAll('[data-dsh-part="foot-card-plans"]')[2]!
    expect(kimi.textContent).not.toContain('90%')
    expect(kimi.textContent).not.toContain('month-code')
  })

  it('the dominant percent and the bar warn below the 50/80 thresholds', () => {
    // Given windows at 85% (low), 55% (warn) and 30% (plain)
    const { container } = render(<UsageFootCard {...cardProps(overview(roster()))} />)

    // Then the fill classes follow barWarn >=50 / barLow >=80, and the provider
    // header percent shows the window maximum with the matching color
    const fills = [...container.querySelectorAll('[data-dsh-part="foot-card-plans"] span span[class*="barFill"]')]
    expect(fills.some((el) => el.className.includes('barLow'))).toBe(true)
    expect(fills.some((el) => el.className.includes('barWarn'))).toBe(true)
    const codex = container.querySelectorAll('[data-dsh-part="foot-card-plans"]')[0]!
    expect(codex.textContent).toContain('85%')
    // The dominant percent carries the threshold color as a style (≥80 → red)
    const headerPercent = codex.firstElementChild!.lastElementChild as HTMLElement
    expect(headerPercent.style.color).toBe('rgb(220, 38, 38)')
  })

  it('user sees the PAYG block only for configured providers with a live balance', () => {
    // Given one configured balance (CNY 42) and one unconfigured stale row
    const over = overview([
      ...roster(),
      deepseekBalance,
      provider({ provider: 'zenmux', displayName: 'ZenMux', balance: { currency: 'USD', totalBalance: '3.10', updatedAt: 1 } }),
    ])
    const { container } = render(<UsageFootCard {...cardProps(over)} />)

    // Then the PAYG section lists DeepSeek after the subscriptions, dimmed,
    // and the unconfigured row never renders
    expect(container.querySelector('[data-dsh-part="foot-card-payg-sep"]')?.textContent).toContain('PAYG')
    const payg = [...container.querySelectorAll('[data-dsh-part="foot-card-payg"]')]
    expect(payg).toHaveLength(1)
    expect(payg[0]!.textContent).toContain('DeepSeek')
    expect(payg[0]!.textContent).toContain('¥42.00')
  })

  it('the PAYG balance color follows the 1/10 USD thresholds with CNY at /7.2', () => {
    // Given balances below $1, below $10 and above (one CNY row converting to $1)
    const over = overview([
      provider({ provider: 'openrouter', displayName: 'OpenRouter', credential: 'api-key', balance: { currency: 'USD', totalBalance: '0.50', updatedAt: 1 } }),
      provider({ provider: 'deepseek', displayName: 'DeepSeek', credential: 'env', balance: { currency: 'CNY', totalBalance: '43.20', updatedAt: 1 } }),
      provider({ provider: 'siliconflow', displayName: 'SiliconFlow', credential: 'api-key', balance: { currency: 'USD', totalBalance: '20.00', updatedAt: 1 } }),
    ])
    const { container } = render(<UsageFootCard {...cardProps(over)} />)

    // Then the colors are red / yellow / uncolored, alphabetical by name
    const payg = [...container.querySelectorAll('[data-dsh-part="foot-card-payg"]')]
    expect(payg.map((row) => row.textContent)).toEqual(['DeepSeek¥43.20', 'OpenRouter$0.50', 'SiliconFlow$20.00'])
    expect((payg[0]!.lastElementChild as HTMLElement).style.color).toBe('rgb(217, 119, 6)')
    expect((payg[1]!.lastElementChild as HTMLElement).style.color).toBe('rgb(220, 38, 38)')
    expect((payg[2]!.lastElementChild as HTMLElement).style.color).toBe('')
  })

  it('user sees no plan blocks and no PAYG separator when nothing qualifies', () => {
    // Given a catalog with neither plans nor balances
    const { container } = render(<UsageFootCard {...cardProps(overview([provider({ provider: 'zenmux', displayName: 'ZenMux' })]))} />)

    // Then the LIMITS caption stands alone
    expect(container.querySelector('[data-dsh-part="foot-card"]')?.textContent).toContain('LIMITS')
    expect(container.querySelector('[data-dsh-part="foot-card-plans"]')).toBeNull()
    expect(container.querySelector('[data-dsh-part="foot-card-payg-sep"]')).toBeNull()
  })

  it('the expired reset reads "reset" and a missing one renders no timer', () => {
    // Given a window whose reset passed and one without a reset instant
    const roster2 = roster()
    roster2[0] = planProvider({ provider: 'kimi-coding', displayName: 'Kimi For Coding' }, [
      { key: '5h', percent: 30, resetsAt: new Date(Date.now() - 60_000).toISOString() },
      { key: 'month', percent: 55 },
    ])
    const { container } = render(<UsageFootCard {...cardProps(overview(roster2))} />)

    // Then the countdown reads "reset" and the month row stays timer-less
    const kimi = container.querySelectorAll('[data-dsh-part="foot-card-plans"]')[2]!
    expect(kimi.textContent).toContain('reset')
    const timers = kimi.textContent!.match(/reset/g)?.length ?? 0
    expect(timers).toBe(1)
  })
})

describe('UsageFootCard collapse state (chips strip)', () => {
  it('user collapses the card into logo+percent chips and expands it back', () => {
    // Given an expanded card with subscriptions and a PAYG balance
    const over = overview([...roster(), deepseekBalance])
    const { container } = render(<UsageFootCard {...cardProps(over)} />)

    // When the user clicks the corner toggle
    fireEvent.click(container.querySelector('[data-dsh-part="foot-card-toggle"]')!)

    // Then the strip shows one chip per subscription (logo svg + hottest percent,
    // colored by threshold) without LIMITS or PAYG, and the choice persists
    const strip = container.querySelector('[data-dsh-part="foot-card-strip"]')!
    expect(strip.textContent).not.toContain('LIMITS')
    expect(strip.textContent).not.toContain('PAYG')
    expect(strip.querySelectorAll('svg')).toHaveLength(3)
    expect(strip.textContent).toContain('85%')
    const chip = [...strip.querySelectorAll('span')].find((el) => el.getAttribute('title') === 'OpenAI 85%')!
    expect(chip).toBeTruthy()
    expect((chip as HTMLElement).style.color).toBe('rgb(220, 38, 38)')
    expect(window.localStorage.getItem(FOOT_CARD_COLLAPSED_KEY)).toBe('1')

    // When the user expands again
    fireEvent.click(container.querySelector('[data-dsh-part="foot-card-toggle"]')!)

    // Then the hierarchical card returns and the flag clears
    expect(container.querySelectorAll('[data-dsh-part="foot-card-plans"]')).toHaveLength(3)
    expect(window.localStorage.getItem(FOOT_CARD_COLLAPSED_KEY)).toBe('0')
  })

  it('user reads the loading state as a quiet strip while collapsed', () => {
    // Given a collapsed card whose first fetch is still in flight
    window.localStorage.setItem(FOOT_CARD_COLLAPSED_KEY, '1')

    // When the card renders
    const { container } = render(<UsageFootCard {...cardProps(null)} />)

    // Then the strip renders a neutral placeholder instead of the loading prose
    expect(container.querySelector('[data-dsh-part="foot-card-strip"]')?.textContent).toContain('—')
  })

  it('user opens the usage settings section from the collapsed strip', () => {
    // Given a collapsed card
    window.localStorage.setItem(FOOT_CARD_COLLAPSED_KEY, '1')
    let opened = 0
    const { container } = render(<UsageFootCard {...cardProps(overview(roster()), { onOpen: () => { opened += 1 } })} />)

    // When the user clicks the strip body
    fireEvent.click(container.querySelector('[data-dsh-part="foot-card-main"]')!)

    // Then the open callback fires and the strip stays collapsed
    expect(opened).toBe(1)
    expect(container.querySelector('[data-dsh-part="foot-card-strip"]')).toBeTruthy()
  })
})

describe('UsageFootCard locale and visibility gates', () => {
  it('the inverted locale fallback reads English for non-zh documents', () => {
    // Given an empty document language (HQ: English is the default now)
    document.documentElement.lang = ''
    const { container } = render(<UsageFootCard {...cardProps(overview(roster()))} />)

    // Then the toggle copy is English
    const toggle = container.querySelector('[data-dsh-part="foot-card-toggle"]')!
    expect(toggle.getAttribute('aria-label')).toBe('Collapse the usage card')
  })

  it('user reads the card in Chinese after a language switch to zh', () => {
    // Given an English-rendered card wired to a locale source
    document.documentElement.lang = 'en'
    const locale = fakeLocale()
    const { container } = render(<UsageFootCard {...cardProps(overview(roster()), { locale: locale.locale })} />)
    expect(container.querySelector('[data-dsh-part="foot-card-toggle"]')!.getAttribute('aria-label')).toBe('Collapse the usage card')

    // When the document language switches to Chinese
    document.documentElement.lang = 'zh'
    act(() => { locale.emit() })

    // Then the card copy follows without a reload
    expect(container.querySelector('[data-dsh-part="foot-card-toggle"]')!.getAttribute('aria-label')).toBe('收起用量卡片')
  })

  it('user loses the card while the plugin is disabled and gets it back on enable', () => {
    // Given a rendered card whose settings flag is on
    const form = fakeForm({ enabled: true })
    const { container } = render(<UsageFootCard {...cardProps(overview(roster()), { settings: form.form })} />)
    expect(container.querySelector('[data-dsh-part="foot-card"]')?.textContent).toContain('LIMITS')

    // When the Host answers with the plugin disabled
    act(() => { form.publish({ enabled: false }) })

    // Then the card leaves the sidebar foot
    expect(container.querySelector('[data-dsh-part="foot-card"]')).toBeNull()

    // When the user re-enables the plugin
    act(() => { form.publish({ enabled: true }) })

    // Then the card returns
    expect(container.querySelector('[data-dsh-part="foot-card"]')?.textContent).toContain('LIMITS')
  })

  it('user sees no card while the host serves no usage routes', () => {
    // Given the overview endpoint answering 404 (the host half is off)
    const store = fakeStore({ snapshot: null, status: 'error', error: 'usage /api/dsh-usage/overview failed: 404' })

    // When the foot card renders
    const { container } = render(<UsageFootCard {...cardProps(null, { store: store.store })} />)

    // Then the card bows out instead of pinning a permanent error to the foot
    expect(container.querySelector('[data-dsh-part="foot-card"]')).toBeNull()
  })

  it('user reads the load failure on the card when no snapshot exists yet', () => {
    // Given a transport failure before the first snapshot (not a 404)
    const store = fakeStore({ snapshot: null, status: 'error', error: 'network unreachable' })

    // When the foot card renders
    const { container } = render(<UsageFootCard {...cardProps(null, { store: store.store })} />)

    // Then the card stays clickable and carries the failure line
    const card = container.querySelector('[data-dsh-part="foot-card"]')
    expect(card?.textContent).toContain('加载失败：network unreachable')
  })

  it('user keeps the last snapshot when a later poll fails', () => {
    // Given a rendered card with data whose next poll fails
    const store = fakeStore({ snapshot: overview(roster()), status: 'ready', error: null })
    const { container } = render(<UsageFootCard {...cardProps(null, { store: store.store })} />)

    // When the store flips to the error state but keeps the snapshot
    act(() => { store.set({ snapshot: overview(roster()), status: 'error', error: 'network unreachable' }) })

    // Then the card still shows the last good rows
    expect(container.querySelectorAll('[data-dsh-part="foot-card-plans"]')).toHaveLength(3)
  })

  it('user opens the usage settings section from the card', () => {
    // Given a rendered card
    let opened = 0
    const { container } = render(<UsageFootCard {...cardProps(overview(roster()), { onOpen: () => { opened += 1 } })} />)

    // When the user clicks the card body
    const card = container.querySelector<HTMLButtonElement>('[data-dsh-part="foot-card-main"]')
    fireEvent.click(card!)

    // Then the open callback fires once and the card stays rendered
    expect(opened).toBe(1)
    expect(container.querySelector('[data-dsh-part="foot-card"]')?.textContent).toContain('LIMITS')
  })
})
