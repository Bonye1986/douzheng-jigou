'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NavBar, StatusBar } from './phone-frame'
import { orderStatuses, type Order, type OrderStatus, type StatusTone } from './orders-data'
import {
  STATS_TODAY,
  buildTrend,
  formatMoney,
  fromInputDate,
  getPeriodRange,
  inRange,
  isPaid,
  orderDate,
  periods,
  rangeDays,
  startOfDay,
  toInputDate,
  type DateRange,
  type PeriodKey,
} from './stats-data'

type StatusFilter = 'all' | OrderStatus
type Metric = 'count' | 'amount'

const toneBar: Record<StatusTone, string> = {
  warning: 'bg-warning',
  primary: 'bg-primary',
  success: 'bg-success',
  muted: 'bg-faint',
}
const toneText: Record<StatusTone, string> = {
  warning: 'text-warning',
  primary: 'text-primary',
  success: 'text-success',
  muted: 'text-faint',
}

const LIST_LIMIT = 20

export function StatsScreen({ orders, onOpenOrder }: { orders: Order[]; onOpenOrder: (order: Order) => void }) {
  const [period, setPeriod] = useState<PeriodKey>('7d')
  const [custom, setCustom] = useState<DateRange>(() => getPeriodRange('30d'))
  const [status, setStatus] = useState<StatusFilter>('all')
  const [metric, setMetric] = useState<Metric>('count')
  const [activeBar, setActiveBar] = useState<number | undefined>()

  const range = period === 'custom' ? custom : getPeriodRange(period)

  const periodOrders = useMemo(() => orders.filter((o) => inRange(o, range)), [orders, range.start, range.end])
  const filtered = useMemo(
    () => (status === 'all' ? periodOrders : periodOrders.filter((o) => o.status === status)),
    [periodOrders, status],
  )

  const summary = useMemo(() => {
    const paid = filtered.filter(isPaid)
    const amount = paid.reduce((sum, o) => sum + o.amount, 0)
    return {
      count: filtered.length,
      amount,
      average: paid.length ? amount / paid.length : 0,
      reports: filtered.filter((o) => o.status === 'done').length,
    }
  }, [filtered])

  const trend = useMemo(() => buildTrend(filtered, range), [filtered, range.start, range.end])

  const statusCounts = useMemo(() => {
    const map = new Map<OrderStatus, number>()
    for (const o of periodOrders) map.set(o.status, (map.get(o.status) ?? 0) + 1)
    return map
  }, [periodOrders])

  const ranking = useMemo(() => {
    const map = new Map<string, { count: number; amount: number }>()
    for (const o of filtered) {
      const item = map.get(o.product) ?? { count: 0, amount: 0 }
      item.count += 1
      if (isPaid(o)) item.amount += o.amount
      map.set(o.product, item)
    }
    return [...map.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 5)
  }, [filtered])

  const recent = useMemo(
    () => [...filtered].sort((a, b) => orderDate(b).getTime() - orderDate(a).getTime()).slice(0, LIST_LIMIT),
    [filtered],
  )

  const changePeriod = (key: PeriodKey) => {
    setPeriod(key)
    setActiveBar(undefined)
  }

  const changeCustom = (field: keyof DateRange, value: string) => {
    if (!value) return
    const next = { ...custom, [field]: fromInputDate(value) }
    if (next.start > next.end) [next.start, next.end] = [next.end, next.start]
    setCustom(next)
    setActiveBar(undefined)
  }

  const statusLabel = status === 'all' ? '全部状态' : orderStatuses.find((s) => s.key === status)?.label

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="shrink-0 bg-white">
        <StatusBar />
        <NavBar title="数据统计" />
        <div className="flex flex-col gap-2.5 px-4 pb-3 pt-1">
          <div role="tablist" aria-label="统计时间段" className="flex rounded-full bg-[#f2f5fa] p-0.5">
            {periods.map((p) => (
              <button
                key={p.key}
                type="button"
                role="tab"
                aria-selected={period === p.key}
                onClick={() => changePeriod(p.key)}
                className={cn(
                  'h-7 flex-1 rounded-full text-note transition-colors',
                  period === p.key ? 'bg-white font-semibold text-primary shadow-sm' : 'text-muted-foreground',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          {period === 'custom' ? (
            <div className="flex items-center gap-2">
              <DateField label="开始日期" value={custom.start} onChange={(v) => changeCustom('start', v)} />
              <span className="text-caption text-faint">至</span>
              <DateField label="结束日期" value={custom.end} onChange={(v) => changeCustom('end', v)} />
            </div>
          ) : (
            <p className="flex items-center gap-1.5 text-caption text-muted-foreground">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {toInputDate(range.start)}
              {rangeDays(range) > 1 && ` 至 ${toInputDate(range.end)}`}
              <span className="text-faint">· 共 {rangeDays(range)} 天</span>
            </p>
          )}
        </div>
        <div
          role="tablist"
          aria-label="订单状态"
          className="flex gap-2 overflow-x-auto border-t border-border px-4 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {[{ key: 'all' as const, label: '全部' }, ...orderStatuses].map((s) => (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={status === s.key}
              onClick={() => setStatus(s.key)}
              className={cn(
                'h-7 shrink-0 rounded-full border px-3 text-caption transition-colors',
                status === s.key
                  ? 'border-primary bg-secondary font-medium text-primary'
                  : 'border-border text-muted-foreground',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <section aria-label="核心指标" className="rounded-2xl bg-primary px-4 pb-4 pt-3.5 text-white shadow-sm">
          <p className="text-caption text-white/75">{statusLabel} · 成交金额（元）</p>
          <p className="mt-1 text-[28px] font-bold leading-9 tabular-nums">¥{formatMoney(summary.amount)}</p>
          <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-white/20 pt-3">
            <Kpi label="订单数" value={summary.count} />
            <Kpi label="客单价" value={`¥${formatMoney(summary.average)}`} />
            <Kpi label="已出报告" value={summary.reports} />
          </dl>
        </section>

        <section aria-label="订单趋势" className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-body font-semibold text-foreground">订单趋势</h3>
            <div role="tablist" aria-label="趋势指标" className="flex rounded-full bg-[#f2f5fa] p-0.5">
              {(['count', 'amount'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={metric === m}
                  onClick={() => setMetric(m)}
                  className={cn(
                    'h-6 rounded-full px-2.5 text-caption',
                    metric === m ? 'bg-white font-medium text-primary shadow-sm' : 'text-muted-foreground',
                  )}
                >
                  {m === 'count' ? '订单量' : '金额'}
                </button>
              ))}
            </div>
          </div>
          <TrendChart
            trend={trend}
            metric={metric}
            active={activeBar}
            onSelect={(i) => setActiveBar((cur) => (cur === i ? undefined : i))}
          />
        </section>

        <section aria-label="状态分布" className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-body font-semibold text-foreground">状态分布</h3>
            <span className="text-caption text-faint">点击状态可筛选</span>
          </div>
          <ul className="flex flex-col gap-2.5">
            {orderStatuses.map((s) => {
              const count = statusCounts.get(s.key) ?? 0
              const pct = periodOrders.length ? (count / periodOrders.length) * 100 : 0
              const active = status === s.key
              return (
                <li key={s.key}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => setStatus(active ? 'all' : s.key)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-1 py-0.5 text-left',
                      status !== 'all' && !active && 'opacity-45',
                    )}
                  >
                    <span className={cn('w-12 shrink-0 text-caption', active ? toneText[s.tone] : 'text-foreground')}>
                      {s.label}
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className={cn('block h-full rounded-full transition-[width]', toneBar[s.tone])}
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                    <span className="w-16 shrink-0 text-right text-caption tabular-nums text-muted-foreground">
                      <span className="font-medium text-foreground">{count}</span> · {pct.toFixed(0)}%
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <section aria-label="项目排行" className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-body font-semibold text-foreground">检测项目排行</h3>
          {ranking.length === 0 ? (
            <Empty />
          ) : (
            <ol className="flex flex-col">
              {ranking.map(([product, item], index) => (
                <li key={product} className="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0 first:pt-0">
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-md text-caption font-semibold',
                      index < 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-note text-foreground">{product}</span>
                  <span className="shrink-0 text-right text-caption tabular-nums text-muted-foreground">
                    {item.count} 单 · ¥{formatMoney(item.amount)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section aria-label="订单明细" className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-body font-semibold text-foreground">订单明细</h3>
            <span className="text-caption text-faint">
              共 {filtered.length} 单{filtered.length > LIST_LIMIT && `，显示最近 ${LIST_LIMIT} 单`}
            </span>
          </div>
          {recent.length === 0 ? (
            <Empty />
          ) : (
            <ul className="flex flex-col">
              {recent.map((order) => {
                const meta = orderStatuses.find((s) => s.key === order.status)!
                return (
                  <li key={order.id} className="border-t border-border first:border-t-0">
                    <button
                      type="button"
                      onClick={() => onOpenOrder(order)}
                      className="flex w-full items-center gap-3 py-3 text-left"
                    >
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-note font-medium text-foreground">{order.patient}</span>
                          <span className={cn('shrink-0 text-caption', toneText[meta.tone])}>{meta.label}</span>
                        </span>
                        <span className="truncate text-caption text-muted-foreground">{order.product}</span>
                        <span className="text-caption tabular-nums text-faint">
                          {order.no} · {order.time}
                        </span>
                      </span>
                      <span className="shrink-0 text-note font-semibold tabular-nums text-foreground">
                        ¥{order.amount}
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-faint" aria-hidden="true" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
        <p className="pb-2 text-center text-caption text-faint">成交金额不含待付款与已关闭订单</p>
      </div>
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-caption text-white/75">{label}</dt>
      <dd className="text-title font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

function DateField({ label, value, onChange }: { label: string; value: Date; onChange: (value: string) => void }) {
  return (
    <label className="flex h-8 flex-1 items-center rounded-lg bg-[#f2f5fa] px-2.5">
      <span className="sr-only">{label}</span>
      <input
        type="date"
        value={toInputDate(value)}
        max={toInputDate(startOfDay(STATS_TODAY))}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-note tabular-nums text-foreground outline-none"
      />
    </label>
  )
}

function TrendChart({
  trend,
  metric,
  active,
  onSelect,
}: {
  trend: ReturnType<typeof buildTrend>
  metric: Metric
  active?: number
  onSelect: (index: number) => void
}) {
  const values = trend.map((b) => (metric === 'count' ? b.count : b.amount))
  const max = Math.max(...values, 1)
  const total = values.reduce((a, b) => a + b, 0)
  const focus = active !== undefined ? trend[active] : undefined
  const labelIndexes = new Set([0, Math.floor((trend.length - 1) / 2), trend.length - 1])
  const format = (v: number) => (metric === 'count' ? `${v} 单` : `¥${formatMoney(v)}`)

  return (
    <div>
      <p className="mb-2 text-caption text-muted-foreground" aria-live="polite">
        {focus ? (
          <>
            {focus.fullLabel}
            <span className="ml-2 font-semibold text-primary">{format(values[active!])}</span>
          </>
        ) : (
          <>
            合计 <span className="font-semibold text-foreground">{format(total)}</span>
          </>
        )}
      </p>
      <div className="flex h-28 items-end gap-[3px] border-b border-border">
        {trend.map((b, i) => {
          const h = (values[i] / max) * 100
          return (
            <button
              key={b.fullLabel}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`${b.fullLabel} ${format(values[i])}`}
              className="flex h-full min-w-0 flex-1 items-end"
            >
              <span
                className={cn(
                  'block w-full rounded-t-[3px] transition-colors',
                  active === undefined || active === i ? 'bg-primary' : 'bg-primary/25',
                )}
                style={{ height: `${Math.max(h, values[i] ? 4 : 1.5)}%` }}
              />
            </button>
          )
        })}
      </div>
      <div className="mt-1.5 flex text-[10px] tabular-nums text-faint">
        {trend.map((b, i) => (
          <span
            key={b.fullLabel}
            className={cn(
              'flex-1 whitespace-nowrap',
              i === 0 ? 'text-left' : i === trend.length - 1 ? 'text-right' : 'text-center',
            )}
          >
            {labelIndexes.has(i) ? b.label : ''}
          </span>
        ))}
      </div>
    </div>
  )
}

function Empty() {
  return <p className="py-6 text-center text-note text-faint">当前筛选条件下暂无订单</p>
}

