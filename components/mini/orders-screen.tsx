'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { ChevronRight, Copy, Search, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NavBar, StatusBar } from './phone-frame'
import { OrderFilterSheet, ownerLabel, type ModeKey, type OwnerKey } from './order-filter-sheet'
import {
  getOrderActions,
  getProductImage,
  getSourceLabel,
  isLabOwnOrder,
  orderStatuses,
  resampleReentry,
  sampleModeLabel,
  statusesForMode,
  type InstitutionRole,
  type Order,
  type OrderStatus,
  type StatusTone,
} from './orders-data'

type FilterKey = 'all' | OrderStatus

const toneClass: Record<StatusTone, string> = {
  warning: 'bg-warning-soft text-warning',
  primary: 'bg-secondary text-primary',
  success: 'bg-success-soft text-success',
  muted: 'bg-muted text-faint',
}

const statusMap = Object.fromEntries(orderStatuses.map((s) => [s.key, s])) as Record<
  OrderStatus,
  (typeof orderStatuses)[number]
>

export function OrdersScreen({
  orders: allOrders,
  role = 'partner',
  initialStatus = 'all',
  onAction,
}: {
  orders: Order[]
  role?: InstitutionRole
  initialStatus?: FilterKey
  onAction?: (label: string, order?: Order) => void
}) {
  const [filter, setFilter] = useState<FilterKey>(initialStatus)
  const [source, setSource] = useState<ModeKey>('all')
  const [owner, setOwner] = useState<OwnerKey>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const isLab = role === 'lab'
  const filtered = source !== 'all' || filter !== 'all' || owner !== 'all'

  const orders = useMemo(
    () =>
      allOrders.filter((o) => {
        if (source !== 'all' && o.mode !== source) return false
        if (owner === 'own') return isLabOwnOrder(o)
        if (owner === 'outsourced') return o.mode === 'onsite' && !isLabOwnOrder(o)
        return true
      }),
    [allOrders, source, owner],
  )

  const counts = useMemo(() => {
    const map: Partial<Record<FilterKey, number>> = { all: orders.length }
    for (const order of orders) map[order.status] = (map[order.status] ?? 0) + 1
    return map
  }, [orders])

  const list = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    return orders.filter((order) => {
      if (filter !== 'all' && order.status !== filter) return false
      if (!q) return true
      return [order.no, order.patient, order.phone, order.product, order.sampleCode ?? '', getSourceLabel(order)].some((v) => v.toLowerCase().includes(q))
    })
  }, [orders, filter, keyword])

  const tabs: { key: FilterKey; label: string }[] = [
    { key: 'all', label: '全部' },
    ...statusesForMode(isLab ? source : 'onsite'),
  ]

  const selectTab = (key: FilterKey) => {
    setFilter(key)
    requestAnimationFrame(() =>
      document.getElementById(`order-tab-${key}`)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }),
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="shrink-0 bg-white">
        <StatusBar />
        <NavBar title="订单管理" />
        <div className="flex items-center gap-2 px-4 pb-2 pt-1">
          <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full bg-[#f4f7fb] px-3.5 ring-1 ring-inset ring-[#e9eef6] transition focus-within:bg-white focus-within:ring-primary/40">
            <Search className="size-4 shrink-0 text-faint" aria-hidden="true" />
            <span className="sr-only">搜索订单</span>
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={isLab ? '搜索订单号 / 样本编码 / 姓名 / 机构' : '搜索订单号 / 用户姓名 / 手机号'}
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
          {isLab && (
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              aria-haspopup="dialog"
              aria-label={filtered ? '筛选（已设置筛选条件）' : '筛选'}
              className={cn(
                'relative flex h-9 shrink-0 items-center gap-1 rounded-full px-3 text-note font-medium transition-colors',
                filtered ? 'bg-secondary text-primary' : 'bg-[#f4f7fb] text-muted-foreground',
              )}
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              筛选
              {filtered && <span aria-hidden="true" className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-warning" />}
            </button>
          )}
        </div>
        {isLab && (source !== 'all' || owner !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 px-4 pb-2">
            <span className="text-caption text-faint">已选</span>
            {source !== 'all' && (
              <FilterChip
                label={sampleModeLabel[source]}
                ariaLabel={`清除采样方式筛选：${sampleModeLabel[source]}`}
                onClear={() => {
                  setSource('all')
                  setOwner('all')
                  selectTab(filter)
                }}
              />
            )}
            {owner !== 'all' && (
              <FilterChip
                label={ownerLabel[owner]}
                ariaLabel={`清除订单归属筛选：${ownerLabel[owner]}`}
                onClear={() => setOwner('all')}
              />
            )}
          </div>
        )}
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
                id={`order-tab-${tab.key}`}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectTab(tab.key)}
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
                    className="absolute inset-x-0 bottom-0 mx-auto h-[3px] w-4 rounded-full bg-brand"
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
        {list.length === 0 ? (
          <EmptyState keyword={keyword} />
        ) : (
          <ul className="flex flex-col gap-3">
            {list.map((order) => (
              <li key={order.id}>
                <OrderCard order={order} role={role} onAction={onAction} />
              </li>
            ))}
          </ul>
        )}
        {list.length > 0 && <p className="py-1 text-center text-caption text-faint">没有更多订单了</p>}
      </div>

      {filterOpen && (
        <OrderFilterSheet
          mode={source}
          status={filter}
          owner={owner}
          onClose={() => setFilterOpen(false)}
          onApply={(mode, status, nextOwner) => {
            setSource(mode)
            setOwner(nextOwner)
            selectTab(status)
            setFilterOpen(false)
          }}
        />
      )}
    </div>
  )
}

function OrderCard({
  order,
  role,
  onAction,
}: {
  order: Order
  role: InstitutionRole
  onAction?: (label: string, order?: Order) => void
}) {
  const status = statusMap[order.status]
  const actions = getOrderActions(order, role)
  const resampleTag =
    order.resample?.state === 'pending' ? '重采样待确认' : order.resample?.state === 'agreed' && order.status === resampleReentry(order) ? '重采样' : undefined
  const closed = order.status === 'closed'

  return (
    <article className="rounded-2xl bg-white shadow-sm">
      <header className="mx-4 flex items-center justify-between gap-2 border-b border-dashed border-border py-2.5">
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
        <span className="flex shrink-0 items-center gap-1.5">
          {resampleTag && (
            <span className="rounded-full bg-warning-soft px-2 py-0.5 text-caption font-medium text-warning">{resampleTag}</span>
          )}
          <span className={cn('rounded-full px-2 py-0.5 text-caption font-medium', toneClass[status.tone])}>
            {status.label}
          </span>
        </span>
      </header>

      <button
        type="button"
        onClick={() => onAction?.('订单详情', order)}
        aria-label={`查看订单 ${order.no} 详情`}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <Image
          src={getProductImage(order.product) || '/placeholder.svg'}
          alt=""
          width={112}
          height={112}
          className={cn('size-16 shrink-0 rounded-xl bg-secondary object-cover ring-1 ring-border/70', closed && 'opacity-50 grayscale')}
        />
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
          {role === 'lab' && (
            <span className="mt-0.5 flex min-w-0 items-center gap-1 text-caption">
              <span
                className={cn(
                  'shrink-0 rounded px-1 text-tag font-medium',
                  order.mode === 'self' ? 'bg-success-soft text-success' : 'bg-secondary text-primary',
                )}
              >
                {order.mode === 'self' ? '自采样' : '定点'}
              </span>
              {order.mode === 'onsite' && <span className="truncate text-faint">{getSourceLabel(order)}</span>}
            </span>
          )}
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
            {actions.map((action) => {
              const className = cn(
                'flex h-[30px] items-center rounded-full px-4 text-caption font-medium transition-transform active:scale-95',
                action.disabled
                  ? 'cursor-not-allowed bg-muted text-faint active:scale-100'
                  : action.primary
                    ? 'bg-brand text-white shadow-brand'
                    : 'border border-[#dfe6f0] bg-white text-foreground',
              )
              return action.tel ? (
                <a
                  key={action.label}
                  href={`tel:${order.mobile}`}
                  aria-label={`拨打 ${order.patient} 的电话`}
                  className={className}
                >
                  {action.label}
                </a>
              ) : (
                <button
                  key={action.label}
                  type="button"
                  disabled={action.disabled}
                  onClick={() => onAction?.(action.label, order)}
                  className={className}
                >
                  {action.label}
                </button>
              )
            })}
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
      <Image src="/images/icons/inst-orders.png" alt="" width={128} height={128} className="size-16 object-contain" />
      <p className="text-body text-muted-foreground">
        {keyword ? `未找到与「${keyword}」相关的订单` : '暂无该状态的订单'}
      </p>
    </div>
  )
}

function FilterChip({ label, ariaLabel, onClear }: { label: string; ariaLabel: string; onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      aria-label={ariaLabel}
      className="flex h-6 items-center gap-1 rounded-full bg-secondary pl-2.5 pr-1.5 text-caption font-medium text-primary"
    >
      {label}
      <X className="size-3" aria-hidden="true" />
    </button>
  )
}
