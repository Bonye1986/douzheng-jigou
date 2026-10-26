import type { Order, OrderStatus } from './orders-data'

/** Business "today" for the demo dataset, aligned with the seed orders. */
export const STATS_TODAY = new Date(2026, 9, 19)

const DAY = 86_400_000

export type PeriodKey = 'today' | '7d' | '30d' | 'month' | 'custom'

export const periods: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: '今日' },
  { key: '7d', label: '近7天' },
  { key: '30d', label: '近30天' },
  { key: 'month', label: '本月' },
  { key: 'custom', label: '自定义' },
]

export type DateRange = { start: Date; end: Date }

const pad = (n: number) => String(n).padStart(2, '0')

export const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

export const toInputDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export function fromInputDate(value: string) {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const shortDate = (date: Date) => `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

/** Inclusive day range; `end` is the start of the last included day. */
export function getPeriodRange(key: Exclude<PeriodKey, 'custom'>): DateRange {
  const today = startOfDay(STATS_TODAY)
  if (key === 'today') return { start: today, end: today }
  if (key === '7d') return { start: new Date(today.getTime() - 6 * DAY), end: today }
  if (key === '30d') return { start: new Date(today.getTime() - 29 * DAY), end: today }
  return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: today }
}

export const rangeDays = (range: DateRange) => Math.round((range.end.getTime() - range.start.getTime()) / DAY) + 1

export function orderDate(order: Order) {
  const [md, hm] = order.time.split(' ')
  const [month, day] = md.split('-').map(Number)
  const [hour, minute] = hm.split(':').map(Number)
  return new Date(STATS_TODAY.getFullYear(), month - 1, day, hour, minute)
}

export function inRange(order: Order, range: DateRange) {
  const t = orderDate(order).getTime()
  return t >= range.start.getTime() && t < range.end.getTime() + DAY
}

/** Paid orders count toward revenue; unpaid and closed orders do not. */
export const isPaid = (order: Order) => order.status !== 'unpaid' && order.status !== 'closed'

export type TrendBucket = { label: string; fullLabel: string; count: number; amount: number }

export function buildTrend(list: Order[], range: DateRange): TrendBucket[] {
  const days = rangeDays(range)
  const step = days === 1 ? 2 * 3_600_000 : days > 31 ? 7 * DAY : DAY
  const total = days === 1 ? 12 : Math.ceil(days / (step / DAY))
  const buckets: TrendBucket[] = Array.from({ length: total }, (_, i) => {
    const from = new Date(range.start.getTime() + i * step)
    if (days === 1) {
      const label = `${pad(from.getHours())}:00`
      return { label, fullLabel: `${label}-${pad(from.getHours() + 2)}:00`, count: 0, amount: 0 }
    }
    if (step === DAY) return { label: shortDate(from), fullLabel: shortDate(from), count: 0, amount: 0 }
    const to = new Date(Math.min(from.getTime() + 6 * DAY, range.end.getTime()))
    return { label: shortDate(from), fullLabel: `${shortDate(from)} 至 ${shortDate(to)}`, count: 0, amount: 0 }
  })
  for (const order of list) {
    const index = Math.floor((orderDate(order).getTime() - range.start.getTime()) / step)
    const bucket = buckets[index]
    if (!bucket) continue
    bucket.count += 1
    if (isPaid(order)) bucket.amount += order.amount
  }
  return buckets
}

const products = [
  { product: '药物基因检测 · 心脑血管用药', spec: '覆盖 32 种常用药物', amount: 699 },
  { product: '高血压个体化用药基因检测', spec: '覆盖 5 大类降压药', amount: 499 },
  { product: '药物基因检测 · 精神类用药', spec: '覆盖 46 种常用药物', amount: 899 },
  { product: '叶酸代谢能力基因检测', spec: 'MTHFR / MTRR 位点', amount: 299 },
  { product: '糖尿病个体化用药基因检测', spec: '覆盖 4 大类降糖药', amount: 499 },
]
const surnames = '张王李赵刘陈杨黄周吴徐孙胡朱高林何郭马罗'
const givenNames = '华敏强芳军丽伟静磊婷'
const prefixes = ['138', '139', '135', '186', '177', '150', '188', '133', '159', '137']

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pickStatus(daysAgo: number, r: number): OrderStatus {
  if (r < 0.08) return 'closed'
  if (daysAgo > 12) return 'done'
  if (daysAgo > 8) return r < 0.6 ? 'done' : 'testing'
  if (daysAgo > 4) return r < 0.4 ? 'testing' : r < 0.75 ? 'toTest' : 'toReceive'
  return r < 0.4 ? 'toReceive' : r < 0.7 ? 'toShip' : 'toSample'
}

/** Deterministic historical orders so period stats have realistic volume. */
function generateHistory(): Order[] {
  const rand = mulberry32(20261019)
  const list: Order[] = []
  for (let daysAgo = 90; daysAgo >= 1; daysAgo--) {
    const day = new Date(STATS_TODAY.getTime() - daysAgo * DAY)
    const weekend = day.getDay() === 0 || day.getDay() === 6
    const count = Math.floor(rand() * (weekend ? 6 : 4)) + (daysAgo < 30 ? 1 : 0)
    for (let i = 0; i < count; i++) {
      const p = products[Math.floor(rand() * products.length)]
      const hour = 8 + Math.floor(rand() * 11)
      const minute = Math.floor(rand() * 60)
      const status = pickStatus(daysAgo, rand())
      const md = `${pad(day.getMonth() + 1)}-${pad(day.getDate())}`
      const no = `DZ2026${md.replace('-', '')}${pad(50 + i)}${Math.floor(rand() * 10)}`.slice(0, 14)
      const surname = surnames[Math.floor(rand() * surnames.length)]
      const given = rand() < 0.5 ? givenNames[Math.floor(rand() * givenNames.length)] : ''
      const prefix = prefixes[Math.floor(rand() * prefixes.length)]
      const tail = String(Math.floor(rand() * 10000)).padStart(4, '0')
      const hasSample = !['closed', 'toSample'].includes(status)
      list.push({
        id: `h${list.length + 1}`,
        mode: 'onsite',
        institutionCode: 'JG-430102-0018',
        no,
        status,
        product: p.product,
        spec: p.spec,
        patient: `${surname}*${given}`,
        phone: `${prefix}****${tail}`,
        mobile: `${prefix}${String(Math.floor(rand() * 10000)).padStart(4, '0')}${tail}`,
        time: `${md} ${pad(hour)}:${pad(minute)}`,
        amount: p.amount,
        sampleCode: hasSample ? `YW${no.slice(-10)}` : undefined,
      })
    }
  }
  return list
}

export const historyOrders = generateHistory()

export function formatMoney(value: number) {
  return value.toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}
