'use client'

import { useMemo, useState } from 'react'
import { ChevronRight, ClipboardList, Copy, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NavBar, StatusBar } from './phone-frame'
import {
  orderStatuses,
  orders,
  statusActions,
  type Order,
  type OrderStatus,
  type StatusTone,
} from './orders-data'

type FilterKey = 'all' | OrderStatus

const toneClass: Record<StatusTone, string> = {
  warning: 'text-warning',
  primary: 'text-primary',
  success: 'text-success',
  muted: 'text-faint',
}

const statusMap = Object.fromEntries(orderStatuses.map((s) => [s.key, s])) as Record<
  OrderStatus,
  (typeof orderStatuses)[number]
>

export function OrdersScreen({
  initialStatus = 'all',
  onAction,
}: {
  initialStatus?: FilterKey
  onAction?: (label: string, order?: Order) => void
}) {
  const [filter, setFilter] = useState<FilterKey>(initialStatus)
  const [keyword, setKeyword] = useState('')

  const counts = useMemo(() => {
    const map: Partial<Record<FilterKey, number>> = { all: orders.length }
    for (const order of orders) map[order.status] = (map[order.status] ?? 0) + 1
    return map
  }, [])

  const list = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    return orders.filter((order) => {
      if (filter !== 'all' && order.status !== filter) return false
      if (!q) return true
      return [order.no, order.patient, order.phone, order.product].some((v) => v.toLowerCase().includes(q))
    })
  }, [filter, keyword])

  const tabs: { key: FilterKey; label: string }[] = [{ key: 'all', label: '全部' }, ...orderStatuses]

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="shrink-0 bg-white">
        <StatusBar />
        <NavBar title="订单管理" />
        <div className="px-4 pb-2 pt-1">
          <label className="flex h-9 items-center gap-2 rounded-full bg-[#f2f5fa] px-3.5">
            <Search className="size-4 shrink-0 text-faint" aria-hidden="true" />
            <span className="sr-only">搜索订单</span>
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索订单号 / 用户姓名 / 手机号"
              className="min-w-0 flex-1 bg-transparent text-note text-foreground outline-none placeholder:text-faint [&::-webkit-search-cancel-button]:hidden"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword('')}
                aria-label="清空搜索"
                className="flex size-4 items-center justify-center rounded-full bg-faint text-white"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            )}
          </label>
        </div>
        <div
          role="tablist"
          aria-label="订单状态"
          className="flex gap-5 overflow-x-auto border-b border-border px-4 [scrollbar-width:none]"
        >
          {tabs.map((tab) => {
            const active = filter === tab.key
            const count = counts[tab.key]
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={(e) => {
                  setFilter(tab.key)
                  e.currentTarget.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
                }}
                className={cn(
                  'relative flex shrink-0 items-center gap-0.5 py-2.5 text-body transition-colors',
                  active ? 'font-semibold text-foreground' : 'text-muted-foreground',
                )}
              >
                {tab.label}
                {tab.key !== 'all' && tab.key !== 'done' && tab.key !== 'closed' && count ? (
                  <span
                    className={cn(
                      'text-caption tabular-nums',
                      active ? 'text-primary' : 'text-faint',
                    )}
                  >
                    {count}
                  </span>
                ) : null}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 mx-auto h-[3px] w-5 rounded-full bg-primary"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div
        role="tabpanel"
        aria-label={tabs.find((t) => t.key === filter)?.label}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-5 pt-3 [scrollbar-width:none] *:shrink-0"
      >
        {filter !== 'all' && (
          <p className="rounded-xl bg-secondary px-3 py-2 text-caption text-primary">
            {statusMap[filter].hint}
          </p>
        )}
        {list.length === 0 ? (
          <EmptyState keyword={keyword} />
        ) : (
          <ul className="flex flex-col gap-3">
            {list.map((order) => (
              <li key={order.id}>
                <OrderCard order={order} onAction={onAction} />
              </li>
            ))}
          </ul>
        )}
        {list.length > 0 && <p className="py-1 text-center text-caption text-faint">没有更多订单了</p>}
      </div>
    </div>
  )
}

function OrderCard({ order, onAction }: { order: Order; onAction?: (label: string, order?: Order) => void }) {
  const status = statusMap[order.status]
  const actions = statusActions[order.status]
  const closed = order.status === 'closed'

  return (
    <article className="rounded-2xl bg-white shadow-sm">
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <span className="flex min-w-0 items-center gap-1 text-caption text-muted-foreground">
          订单号
          <span className="truncate tabular-nums text-foreground">{order.no}</span>
          <button
            type="button"
            onClick={() => onAction?.('订单号已复制', order)}
            aria-label={`复制订单号 ${order.no}`}
            className="flex size-5 shrink-0 items-center justify-center text-faint"
          >
            <Copy className="size-3" aria-hidden="true" />
          </button>
        </span>
        <span className={cn('shrink-0 text-note font-semibold', toneClass[status.tone])}>{status.label}</span>
      </header>

      <button
        type="button"
        onClick={() => onAction?.('订单详情', order)}
        aria-label={`查看订单 ${order.no} 详情`}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span
          className={cn(
            'flex size-14 shrink-0 items-center justify-center rounded-xl',
            closed ? 'bg-muted text-faint' : 'bg-gradient-to-br from-[#e3efff] to-[#f1f7ff] text-primary',
          )}
        >
          <ClipboardList className="size-6" aria-hidden="true" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className={cn('truncate text-body font-medium', closed ? 'text-muted-foreground' : 'text-foreground')}>
            {order.product}
          </span>
          <span className="truncate text-caption text-faint">{order.spec}</span>
          <span className="mt-0.5 flex items-center gap-2 text-caption text-muted-foreground">
            <span>{order.patient}</span>
            <span aria-hidden="true" className="h-2.5 w-px bg-border" />
            <span className="tabular-nums">{order.phone}</span>
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1 self-stretch">
          <span className="text-title font-semibold tabular-nums text-foreground">
            <span className="text-caption">¥</span>
            {order.amount}
          </span>
          <ChevronRight className="mt-auto size-4 text-faint" aria-hidden="true" />
        </span>
      </button>

      {(order.sampleCode || actions.length > 0) && (
      <footer className="flex items-center justify-between gap-2 px-4 pb-3">
        <span className="min-w-0 truncate text-caption tabular-nums text-faint">
          {order.sampleCode ? `样本 ${order.sampleCode}` : null}
        </span>
        {actions.length > 0 && (
          <span className="flex shrink-0 gap-2">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => onAction?.(action.label, order)}
                className={cn(
                  'h-7 rounded-full px-3.5 text-caption font-medium transition-transform active:scale-95',
                  action.primary
                    ? 'bg-gradient-to-r from-primary to-[#5fa2f0] text-white shadow-[0_2px_8px_#3a82e440]'
                    : 'border border-border text-foreground',
                )}
              >
                {action.label}
              </button>
            ))}
          </span>
        )}
      </footer>
      )}
    </article>
  )
}

function EmptyState({ keyword }: { keyword: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
        <ClipboardList className="size-7" aria-hidden="true" />
      </span>
      <p className="text-body text-muted-foreground">
        {keyword ? `未找到与「${keyword}」相关的订单` : '暂无该状态的订单'}
      </p>
    </div>
  )
}
