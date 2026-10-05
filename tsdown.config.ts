import { clientBundle } from './shared/tsdown.client.ts'

// HQ fork: vendored shared preset (shared/tsdown.client.ts, from upstream
// zhu1090093659/dsh-web shared/), package identity renamed to dsh-usage-hq.
export default clientBundle('dsh-usage-hq', ['src/index.ts'], {})
