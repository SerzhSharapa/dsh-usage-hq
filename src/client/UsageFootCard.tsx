/**
 * Sidebar foot card: the limits glance seated below the shell sidebar's
 * Settings row. HQ fork: the card is about SUBSCRIPTIONS (and PAYG balances),
 * not today's tokens — the owner runs subscriptions, token counters are not
 * actionable here (they stay in the settings section). States:
 *
 * - expanded (default): a "LIMITS" caption + updated-at clock, one
 *   hierarchical block per subscription provider (logo + name + dominant
 *   percent, then one row per window: label, 5px bar, percent, reset
 *   countdown), then an optional dimmed PAYG block (hairline separator +
 *   one row per pay-as-you-go provider with a live balance);
 * - collapsed: a wrapping strip of chips — provider logo + its hottest
 *   subscription percent (no "LIMITS" caption, PAYG not shown).
 *
 * The card body is one button that opens the settings panel on the usage
 * section, so detail lives in exactly one place; the corner chevron toggles
 * the collapse state (sibling buttons — buttons inside a button are invalid
 * HTML).
 *
 * Data comes from the same shared store the settings section reads; the card
 * runs its own relaxed poll loop (30 s, visible-tab only) because the sidebar
 * foot is permanently mounted. The card disappears while the plugin is
 * disabled (settings flag) or while the host serves no usage routes (a 404
 * means the host half is off), matching the section's own gating.
 * @module dsh-usage-hq/client/UsageFootCard
 */

import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import { t } from './locales.ts'
import styles from './usage.module.css'
import type { UsageSettings } from './UsageSectionCard.tsx'
import type { BalanceView, ProviderSnapshotView, UsageOverviewView } from '../core/types.ts'
import type { UsageStoreInstance } from './usage-store.ts'

/** Props the mount forwards into the React tree. */
export interface UsageFootCardProps {
  /** The shared overview store (section and card read the same snapshot). */
  store: UsageStoreInstance
  /** Fetch one overview now. */
  poll: () => void
  /** Card-body click: open the settings panel on the usage section. */
  onOpen: () => void
  /** The shared settings form; the card hides while the plugin is disabled. */
  settings: ConfigForm<UsageSettings>
  /** Locale-change source; the plain copy re-renders on a language switch. */
  locale?: { subscribe(listener: () => void): () => void }
}

/** Poll cadence of the permanently seated card; the section's 10 s loop stays its own. */
export const FOOT_CARD_POLL_MS = 30_000

/** localStorage key holding the collapsed flag ('1' = collapsed strip). */
export const FOOT_CARD_COLLAPSED_KEY = 'dsh-usage.foot-card.collapsed'

/** Read the persisted collapsed flag (absent = expanded). */
export function readFootCardCollapsed(): boolean {
  try {
    return window.localStorage.getItem(FOOT_CARD_COLLAPSED_KEY) === '1'
  } catch {
    // Storage can be unavailable (privacy modes); the card stays expanded.
    return false
  }
}

/** Persist the collapsed flag; storage failures keep the session state. */
function writeFootCardCollapsed(collapsed: boolean): void {
  try {
    window.localStorage.setItem(FOOT_CARD_COLLAPSED_KEY, collapsed ? '1' : '0')
  } catch {
    // Storage unavailable: the state still flips for this session.
  }
}

/** Inline gauge glyph, 14px beside the card title. */
function GaugeIcon(): ReactNode {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 12.5a7 7 0 0 1 11 -4.3" />
      <path d="M8 12.5V8.2l2.9-2.1" />
      <circle cx="8" cy="12.5" r="1" />
    </svg>
  )
}

/** Disclosure chevrons: down collapses the expanded card, up expands the strip. */
function ChevronIcon(props: { collapsed: boolean }): ReactNode {
  return props.collapsed
    ? (
      <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m4 10 4-4 4 4" />
      </svg>
    )
    : (
      <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m4 6 4 4 4-4" />
      </svg>
    )
}

/** Currency-symbol prefix for the priced balances (CNY/USD), else the ISO code. */
function formatBalance(balance: BalanceView): string {
  const currency = balance.currency.toUpperCase()
  if (currency === 'CNY') return '¥' + balance.totalBalance
  if (currency === 'USD') return '$' + balance.totalBalance
  return currency + ' ' + balance.totalBalance
}

function formatClock(ms: number): string {
  try {
    return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

/** HQ patch: official provider marks, currentColor, optically balanced sizes. */
function providerLogo(id: string): ReactNode {
  const common = { width: '13', height: '13', viewBox: '0 0 24 24', 'aria-hidden': true as const, style: { flex: 'none', display: 'block' } }
  if (id === 'openai-codex') {
    return (
      <svg {...common} style={{ flex: 'none', display: 'block', margin: '0.5px' }} fill="currentColor">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
      </svg>
    )
  }
  if (id === 'kimi-coding') {
    return (
      <svg {...common} width="11" height="11" style={{ flex: 'none', display: 'block', margin: '1px 1px' }} fill="currentColor">
        <path d="M21.765.351C22.998.351 24 1.353 24 2.586S22.998 4.82 21.765 4.82h-1.974c-.15 0-.26-.12-.26-.26V2.586A2.237 2.237 0 0 1 21.765.35M9.41 13.388l8.447-8.377c.16-.16.07-.471-.14-.471h-4.55s-.1.02-.14.06l-9.099 9.029c-.14.14-.35.02-.35-.21V4.81c0-.15-.1-.27-.221-.27H.22c-.12 0-.22.12-.22.27v18.57c0 .15.1.27.22.27h3.137c.12 0 .22-.12.22-.27v-3.79c0-.08.03-.16.08-.21l2.826-2.796c.07-.07.16-.08.241-.03l7.546 5.551a8.9 8.9 0 0 0 4.018 1.493c.12.01.23-.11.23-.27V19.76c0-.14-.08-.25-.19-.26a5.8 5.8 0 0 1-2.355-.942l-6.533-4.73c-.14-.09-.15-.32-.03-.441" />
      </svg>
    )
  }
  if (id === 'zai-coding-cn' || id === 'zai-coding' || id === 'zai') {
    return (
      <svg {...common} viewBox="0 0 30 30">
        <defs>
          <mask id="hq-zai-z">
            <rect x="0" y="0" width="30" height="30" fill="#fff" />
            <path d="M15.47,7.1l-1.3,1.85c-0.2,0.29-0.54,0.47-0.9,0.47h-7.1V7.09C6.16,7.1,15.47,7.1,15.47,7.1z" fill="#000" />
            <polygon points="24.3,7.1 13.14,22.91 5.7,22.91 16.86,7.1" fill="#000" />
            <path d="M14.53,22.91l1.31-1.86c0.2-0.29,0.54-0.47,0.9-0.47h7.09v2.33H14.53z" fill="#000" />
          </mask>
        </defs>
        <path d="M24.51,28.51H5.49c-2.21,0-4-1.79-4-4V5.49c0-2.21,1.79-4,4-4h19.03c2.21,0,4,1.79,4,4v19.03 C28.51,26.72,26.72,28.51,24.51,28.51z" fill="currentColor" mask="url(#hq-zai-z)" />
      </svg>
    )
  }
  if (id === 'minimax' || id === 'minimax-cn') {
    return (
      <svg {...common} fill="currentColor">
        <path d="M11.43 3.92a.86.86 0 1 0-1.718 0v14.236a1.999 1.999 0 0 1-3.997 0V9.022a.86.86 0 1 0-1.718 0v3.87a1.999 1.999 0 0 1-3.997 0V11.49a.57.57 0 0 1 1.139 0v1.404a.86.86 0 0 0 1.719 0V9.022a1.999 1.999 0 0 1 3.997 0v9.134a.86.86 0 0 0 1.719 0V3.92a1.998 1.998 0 1 1 3.996 0v11.788a.57.57 0 1 1-1.139 0zm10.572 3.105a2 2 0 0 0-1.999 1.997v7.63a.86.86 0 0 1-1.718 0V3.923a1.999 1.999 0 0 0-3.997 0v16.16a.86.86 0 0 1-1.719 0V18.08a.57.57 0 1 0-1.138 0v2a1.998 1.998 0 0 0 3.996 0V3.92a.86.86 0 0 1 1.719 0v12.73a1.999 1.999 0 0 0 3.996 0V9.023a.86.86 0 1 1 1.72 0v6.686a.57.57 0 0 0 1.138 0V9.022a2 2 0 0 0-1.998-1.997" />
      </svg>
    )
  }
  if (id === 'opencode-go') {
    return (
      <svg {...common} viewBox="0 0 512 512">
        <path d="M384 416H128V96H384V416ZM320 160H192V352H320V160Z" fill="currentColor" />
        <path d="M320 224V352H192V224H320Z" fill="currentColor" opacity="0.45" />
      </svg>
    )
  }
  if (id === 'deepseek' || id === 'deepseek-official') {
    return (
      <svg {...common} width="11" height="11" style={{ flex: 'none', display: 'block', margin: '1px' }} fill="currentColor">
        <path d="M23.748 4.651c-.254-.124-.364.113-.512.233-.051.04-.094.09-.137.137-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.155-.708-.311-.955-.65-.172-.24-.219-.509-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.094.172.187.129.323-.082.28-.18.553-.266.833-.055.179-.137.218-.328.14a5.5 5.5 0 0 1-1.737-1.179c-.857-.828-1.631-1.743-2.597-2.46a12 12 0 0 0-.689-.47c-.985-.957.13-1.743.387-1.836.27-.098.094-.433-.778-.428-.872.003-1.67.295-2.687.685a3 3 0 0 1-.465.136 9.6 9.6 0 0 0-2.883-.101c-1.885.21-3.39 1.1-4.497 2.622C.082 8.776-.231 10.854.152 13.02c.403 2.284 1.568 4.175 3.36 5.653 1.857 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.132-.284 4.994-1.86.47.234.962.328 1.78.398.629.058 1.235-.031 1.705-.129.735-.155.684-.836.418-.961-2.155-1.004-1.682-.595-2.112-.926 1.095-1.295 2.768-3.598 3.284-6.733.05-.346.115-.834.108-1.114-.004-.171.035-.238.23-.257a4.2 4.2 0 0 0 1.545-.475c1.397-.763 1.96-2.016 2.093-3.517.02-.23-.004-.467-.247-.588M11.58 18.168c-2.088-1.642-3.101-2.183-3.52-2.16-.39.024-.32.472-.234.763.09.288.207.487.371.74.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.168-1.361-.801-2.5-1.86-3.301-3.306-.775-1.393-1.225-2.888-1.299-4.482-.02-.385.094-.522.477-.592a4.7 4.7 0 0 1 1.53-.038c2.131.311 3.946 1.264 5.467 2.774.868.86 1.525 1.887 2.202 2.89.72 1.066 1.494 2.082 2.48 2.915.348.291.626.513.892.677-.802.09-2.14.109-3.055-.615zm1.001-6.44a.306.306 0 0 1 .415-.287.3.3 0 0 1 .113.074.3.3 0 0 1 .086.214c0 .17-.136.307-.308.307a.303.303 0 0 1-.306-.307m3.11 1.596c-.2.081-.4.151-.591.16a1.25 1.25 0 0 1-.798-.254c-.274-.23-.47-.358-.551-.758a1.7 1.7 0 0 1 .015-.588c.07-.327-.007-.537-.238-.727-.188-.156-.426-.199-.689-.199a.6.6 0 0 1-.254-.078.253.253 0 0 1-.114-.358 1 1 0 0 1 .192-.21c.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.392.451.462.576.685.915.176.264.336.536.446.848.066.194-.02.353-.25.45" />
      </svg>
    )
  }
  if (id === 'moonshotai' || id === 'moonshotai-cn') return providerLogo('kimi-coding')
  if (id === 'openrouter') {
    return (
      <svg {...common} width="11" height="11" style={{ flex: 'none', display: 'block', margin: '1px' }} fill="currentColor">
        <path d="M16.778 1.844v1.919q-.569-.026-1.138-.032-.708-.008-1.415.037c-1.93.126-4.023.728-6.149 2.237-2.911 2.066-2.731 1.95-4.14 2.75-.396.223-1.342.574-2.185.798-.841.225-1.753.333-1.751.333v4.229s.768.108 1.61.333c.842.224 1.789.575 2.185.799 1.41.798 1.228.683 4.14 2.75 2.126 1.509 4.22 2.11 6.148 2.236.88.058 1.716.041 2.555.005v1.918l7.222-4.168-7.222-4.17v2.176c-.86.038-1.611.065-2.278.021-1.364-.09-2.417-.357-3.979-1.465-2.244-1.593-2.866-2.027-3.68-2.508.889-.518 1.449-.906 3.822-2.59 1.56-1.109 2.614-1.377 3.978-1.466.667-.044 1.418-.017 2.278.02v2.176L24 6.014Z" />
      </svg>
    )
  }
  if (id === 'siliconflow' || id === 'siliconflow-cn' || id === 'siliconflow-intl') {
    return (
      <svg {...common} viewBox="0 0 1024 1024">
        <path d="M21.678 848.384A21.59 21.59 0 0 1 .771 820.992l182.272-661.163a43.18 43.18 0 0 1 65.451-24.746l239.787 157.354a43.26 43.26 0 0 0 47.445 0l240.81-157.354a43.18 43.18 0 0 1 65.366 24.746l181.333 661.163a21.59 21.59 0 0 1-20.906 27.307H771.075a268.63 268.63 0 0 0 65.195-175.531v-7.595a259.7 259.7 0 0 0-64.512-171.349l-29.781-149.163a18.688 18.688 0 0 0-29.61-11.349l-112.044 84.053a31.92 31.92 0 0 1-27.904 5.12 220 220 0 0 0-120.832 0 31.83 31.83 0 0 1-27.904-5.12l-112.128-84.138a18.517 18.517 0 0 0-29.354 11.52l-28.758 155.818a228.7 228.7 0 0 0-65.706 160.427v14.165c0 62.891 22.528 123.734 63.488 171.52l1.365 1.622H21.678z" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg {...common} fill="currentColor">
      <circle cx="12" cy="12" r="8" />
    </svg>
  )
}

/** HQ patch: subscription plan rows, ordered and renamed (OpenAI → ZAI (GLM) → Kimi → OpenCode → MiniMax). */
function planRows(snapshot: UsageOverviewView) {
  const names: Record<string, string> = { 'openai-codex': 'OpenAI', 'zai-coding-cn': 'ZAI (GLM)', 'zai-coding': 'ZAI (GLM)', 'zai': 'ZAI (GLM)', 'kimi-coding': 'Kimi', 'opencode-go': 'OpenCode', 'minimax': 'MiniMax', 'minimax-cn': 'MiniMax' }
  const order: Record<string, number> = { 'openai-codex': 0, 'zai-coding-cn': 1, 'zai-coding': 1, 'zai': 1, 'kimi-coding': 2, 'opencode-go': 3, 'minimax': 4, 'minimax-cn': 4 }
  const keyLabel = (key: string): string => key === '5h' ? '5h' : key === 'week' ? 'wk' : key === 'month' ? 'mo' : String(key)
  return snapshot.providers
    .filter((provider: ProviderSnapshotView) => provider.plan !== undefined && Array.isArray(provider.plan?.windows) && provider.plan.windows.length > 0)
    .map((provider: ProviderSnapshotView) => ({
      id: provider.provider,
      name: names[provider.provider] ?? provider.displayName,
      windows: provider.plan!.windows
        // The month-code window stays on the Plans tab; the glance shows the headline windows only.
        .filter((w) => w.key !== 'month-code')
        .map((w) => ({ label: keyLabel(w.key), percent: Math.max(0, Math.min(100, Math.round(Number(w.percent ?? 0)))), resetsAt: typeof w.resetsAt === 'string' ? w.resetsAt : undefined }))
    }))
    .sort((a, b) => (order[a.id] ?? 9) - (order[b.id] ?? 9) || a.name.localeCompare(b.name))
}

/** HQ patch: pay-as-you-go providers with a live balance, after subscription rows. */
function paygRows(snapshot: UsageOverviewView) {
  const names: Record<string, string> = { 'openrouter': 'OpenRouter', 'deepseek-official': 'DeepSeek', 'deepseek': 'DeepSeek', 'moonshotai': 'Moonshot', 'moonshotai-cn': 'Moonshot', 'siliconflow': 'SiliconFlow', 'siliconflow-cn': 'SiliconFlow', 'siliconflow-intl': 'SiliconFlow' }
  return snapshot.providers
    .filter((provider: ProviderSnapshotView) => provider.credential !== 'none' && provider.balance !== undefined)
    .map((provider: ProviderSnapshotView) => {
      const usd = (Number(provider.balance!.totalBalance) || 0) / (String(provider.balance!.currency).toUpperCase() === 'CNY' ? 7.2 : 1)
      return {
        id: provider.provider,
        name: names[provider.provider] ?? provider.displayName,
        text: formatBalance(provider.balance!),
        color: usd < 1 ? '#dc2626' : usd < 10 ? '#d97706' : undefined
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** HQ patch: compact countdown to a reset time, e.g. "4h12m", "6d3h"; empty when unknown/past. */
function resetCountdown(iso: string | undefined): string {
  if (typeof iso !== 'string') return ''
  const ms = Date.parse(iso)
  if (!Number.isFinite(ms)) return ''
  const left = ms - Date.now()
  if (left <= 0) return 'reset'
  const m = Math.floor(left / 60_000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d >= 1) return d + 'd' + (h % 24) + 'h'
  if (h >= 1) return h + 'h' + (m % 60) + 'm'
  return Math.max(1, m) + 'm'
}

/** Card chrome classes for the current collapse state. */
function cardClass(collapsed: boolean): string {
  return collapsed ? styles.footCard + ' ' + styles.footCardCollapsed : styles.footCard
}

/**
 * Render the foot card content for the current store snapshot.
 * @param props - store, poller, settings form and open callback from the mount.
 * @returns the card, or null while disabled / host-off.
 */
export function UsageFootCard(props: UsageFootCardProps): ReactNode {
  const { store, poll, onOpen, settings, locale } = props
  const ui = useSyncExternalStore(store.subscribe, store.getSnapshot)
  // Settings writes and locale switches both re-render the card's copy/visibility.
  const [, bump] = useState(0)
  useEffect(() => settings.subscribe(() => bump((count) => count + 1)), [settings])
  useEffect(() => locale?.subscribe(() => bump((count) => count + 1)), [locale])
  const enabled = settings.getSnapshot().value?.enabled ?? true

  // The collapse choice is one localStorage flag, read at mount and persisted
  // on every flip (the old sidebar strip used the same contract shape).
  const [collapsed, setCollapsed] = useState(readFootCardCollapsed)
  const toggleCollapsed = (): void => {
    setCollapsed((current) => {
      writeFootCardCollapsed(!current)
      return !current
    })
  }

  // The permanently seated card pays a relaxed cadence; a hidden tab pauses.
  useEffect(() => {
    if (!enabled) return undefined
    poll()
    let timer: number | undefined
    const start = (): void => {
      if (timer === undefined && document.visibilityState === 'visible') timer = window.setInterval(poll, FOOT_CARD_POLL_MS)
    }
    const onVisibility = (): void => {
      if (document.visibilityState === 'visible') {
        poll()
        start()
      } else if (timer !== undefined) {
        window.clearInterval(timer)
        timer = undefined
      }
    }
    start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      if (timer !== undefined) window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [poll, enabled])

  if (!enabled) return null
  const snapshot = ui.snapshot
  // A 404 means the host half serves no usage routes (plugin off): the card
  // bows out instead of pinning a permanent error to the sidebar foot.
  if (snapshot === null && ui.status === 'error' && /failed: 404/.test(ui.error ?? '')) return null

  const toggle = (
    <button
      type="button"
      className={styles.footToggle}
      data-dsh-part="foot-card-toggle"
      aria-label={t(collapsed ? 'usage.foot.expand' : 'usage.foot.collapse')}
      title={t(collapsed ? 'usage.foot.expand' : 'usage.foot.collapse')}
      onClick={toggleCollapsed}
    >
      <ChevronIcon collapsed={collapsed} />
    </button>
  )

  if (snapshot === null) {
    const quiet = ui.status === 'error' ? t('usage.error', { error: ui.error ?? '' }) : t('usage.loading')
    return (
      <div className={cardClass(collapsed)} data-dsh-plugin="usage" data-dsh-part="foot-card">
        <button type="button" className={styles.footMain} data-dsh-part="foot-card-main" aria-label={t('usage.foot.open')} title={t('usage.foot.open')} onClick={onOpen}>
          {collapsed
            ? <span className={styles.footStrip} data-dsh-part="foot-card-strip"><span className={styles.footStripValue}>—</span></span>
            : (
              <>
                <span className={styles.footHead}>
                  <span className={styles.footTitle}><GaugeIcon />{t('usage.title')}</span>
                </span>
                <span className={styles.footLine}>{quiet}</span>
              </>
            )}
        </button>
        {toggle}
      </div>
    )
  }

  const plans = planRows(snapshot)

  if (collapsed) {
    return (
      <div className={cardClass(true)} data-dsh-plugin="usage" data-dsh-part="foot-card">
        <button type="button" className={styles.footMain} data-dsh-part="foot-card-main" aria-label={t('usage.foot.open')} title={t('usage.foot.open')} onClick={onOpen}>
          <span className={styles.footStrip} data-dsh-part="foot-card-strip" style={{ display: 'flex', flexWrap: 'wrap', rowGap: '3px', whiteSpace: 'normal' }}>
            <span style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '7px', marginRight: '18px' }}>
              {plans.map((row) => {
                const pct = row.windows.reduce((m, w) => Math.max(m, w.percent), 0)
                const color = pct >= 80 ? '#dc2626' : pct >= 50 ? '#d97706' : 'inherit'
                return (
                  <span key={'p-' + row.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontVariantNumeric: 'tabular-nums', color, opacity: pct >= 50 ? 1 : 0.75 }} title={row.name + ' ' + pct + '%'}>
                    {providerLogo(row.id)}
                    <span style={{ fontSize: '11px', fontWeight: 600 }}>{pct + '%'}</span>
                  </span>
                )
              })}
            </span>
          </span>
        </button>
        {toggle}
      </div>
    )
  }

  return (
    <div className={cardClass(false)} data-dsh-plugin="usage" data-dsh-part="foot-card">
      <button type="button" className={styles.footMain} data-dsh-part="foot-card-main" aria-label={t('usage.foot.open')} title={t('usage.foot.open')} onClick={onOpen}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '10px', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', opacity: 0.6 }}>LIMITS</span>
          <span style={{ opacity: 0.4, fontSize: '9.5px', fontVariantNumeric: 'tabular-nums', marginLeft: 'auto', marginRight: '18px' }}>{formatClock(snapshot.updatedAt)}</span>
        </span>
        {plans.length > 0 && plans.map((row, i) => (
          <span key={'plan-' + row.id} className={styles.footLine} data-dsh-part="foot-card-plans" style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: i === 0 ? '0' : '6px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {providerLogo(row.id)}
              <span style={{ fontWeight: 600, fontSize: '11px', flex: '1', minWidth: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</span>
              <span style={{ fontSize: '11px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: row.windows.reduce((m, w) => Math.max(m, w.percent), 0) >= 80 ? '#dc2626' : row.windows.reduce((m, w) => Math.max(m, w.percent), 0) >= 50 ? '#d97706' : 'inherit', opacity: row.windows.reduce((m, w) => Math.max(m, w.percent), 0) < 50 ? 0.75 : 1 }}>{row.windows.reduce((m, w) => Math.max(m, w.percent), 0) + '%'}</span>
            </span>
            {row.windows.map((w, j) => (
              <span key={'w-' + j} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ opacity: 0.55, fontSize: '10px', flex: 'none', width: '16px' }}>{w.label}</span>
                <span className={styles.bar} style={{ display: 'block', height: '5px', flex: '1', minWidth: '0' }}>
                  <span className={styles.barFill + (w.percent >= 80 ? ' ' + styles.barLow : w.percent >= 50 ? ' ' + styles.barWarn : '')} style={{ width: w.percent + '%', display: 'block' }} />
                </span>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: '3px', flex: 'none', fontVariantNumeric: 'tabular-nums' }}>
                  <span style={{ fontSize: '10px', opacity: 0.85, minWidth: '24px', textAlign: 'right' }}>{w.percent + '%'}</span>
                  {resetCountdown(w.resetsAt) !== '' && <span style={{ fontSize: '9.5px', opacity: 0.45, minWidth: '28px', textAlign: 'right' }}>{resetCountdown(w.resetsAt)}</span>}
                </span>
              </span>
            ))}
          </span>
        ))}
        {paygRows(snapshot).length > 0 && (
          <span key="payg-sep" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid color-mix(in srgb, currentColor 12%, transparent)' }} data-dsh-part="foot-card-payg-sep">
            <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', opacity: 0.4 }}>PAYG</span>
          </span>
        )}
        {paygRows(snapshot).map((row) => (
          <span key={'payg-' + row.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', opacity: 0.72 }} data-dsh-part="foot-card-payg">
            {providerLogo(row.id)}
            <span style={{ fontSize: '11px', fontWeight: 500, flex: '1', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</span>
            <span style={{ fontSize: '11px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', marginRight: '18px', color: row.color, opacity: row.color !== undefined ? 1 : undefined }}>{row.text}</span>
          </span>
        ))}
      </button>
      {toggle}
    </div>
  )
}
