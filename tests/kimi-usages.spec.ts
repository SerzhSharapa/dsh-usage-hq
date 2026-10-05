import { describe, expect, it } from 'vitest'
import { adapterFor } from '../src/core/adapters.ts'

/** The Kimi For Coding adapter under test (HQ: new `usages` API shape). */
const kimi = adapterFor('kimi-coding')!

describe('KIMI_CODING.parse — HQ body.usages branch', () => {
  it('reads month/month-code windows from body.usages with used_ratio percents', () => {
    // Given the new Kimi answer carrying used-ratio rows (no weekly usage)
    const status = 200
    const body = {
      usages: {
        limit_5h: { used_ratio: 0.345, reset_time: '2026-10-05T12:00:00Z' },
        limit_month_total: { used_ratio: 0.55, reset_time: '2026-11-01T00:00:00Z' },
        limit_month_code: { used_ratio: 0.9, reset_time: '2026-11-01T00:00:00Z' },
      },
    }

    // When the plan probe parses the body
    const plan = kimi.plan!.parse(status, body)

    // Then the widget-grade windows are month and month-code (percent = ratio*100,
    // rounded; resetsAt from reset_time) — and no weekly window is invented
    expect(plan).toBeDefined()
    const keys = plan!.windows.map((w) => w.key)
    expect(keys).toContain('month')
    expect(keys).toContain('month-code')
    expect(keys).not.toContain('week')
    const month = plan!.windows.find((w) => w.key === 'month')!
    expect(month.percent).toBe(55)
    expect(month.resetsAt).toBe('2026-11-01T00:00:00.000Z')
    const code = plan!.windows.find((w) => w.key === 'month-code')!
    expect(code.percent).toBe(90)
  })

  it('keeps the legacy limits[]/usage answer working alongside the new shape', () => {
    // Given the old answer shape (per-window limits[] plus the weekly usage)
    const status = 200
    const body = {
      limits: [
        { window: { duration: 300, timeUnit: 'TIME_UNIT_MINUTE' }, detail: { name: '5h', used: 10, limit: 100, resetTime: '2026-10-05T12:00:00Z' } },
      ],
      usage: { used: 30, limit: 100, resetTime: '2026-10-12T00:00:00Z' },
    }

    // When the probe parses the body
    const plan = kimi.plan!.parse(status, body)

    // Then the legacy windows (5h + week) still come through
    expect(plan!.windows.map((w) => w.key)).toEqual(['5h', 'week'])
  })

  it('deduplicates by key when both shapes report the same window', () => {
    // Given an answer where limits[] already carries a 5h window and usages repeats one
    const status = 200
    const body = {
      limits: [
        { window: { duration: 300, timeUnit: 'TIME_UNIT_MINUTE' }, detail: { name: '5h', used: 1, limit: 100, resetTime: '2026-10-05T12:00:00Z' } },
      ],
      usages: {
        limit_5h: { used_ratio: 0.5, reset_time: '2026-10-05T13:00:00Z' },
        limit_month_total: { used_ratio: 0.2, reset_time: '2026-11-01T00:00:00Z' },
      },
    }

    // When the probe parses the body
    const plan = kimi.plan!.parse(status, body)

    // Then the usages 5h row is dropped in favor of the limits[] row
    const five = plan!.windows.filter((w) => w.key === '5h')
    expect(five).toHaveLength(1)
    expect(five[0]!.percent).toBe(1)
    expect(plan!.windows.map((w) => w.key)).toEqual(['5h', 'month'])
  })
})
