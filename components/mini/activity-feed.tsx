'use client'

import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { NavBar, StatusBar } from './phone-frame'
import type { ActivityItem } from './workbench-data'

const TODAY = '2026-10-19'
const YESTERDAY = '2026-10-18'

function dayLabel(date: string) {
  if (date === TODAY) return '今天'
  if (date === YESTERDAY) return '昨天'
  const [, month, day] = date.split('-').map(Number)
  return `${month} 月 ${day} 日`
}

function shortTime(time: string) {
  const [date, hm] = time.split(' ')
  return date === TODAY ? `今天 ${hm}` : date === YESTERDAY ? `昨天 ${hm}` : `${date.slice(5)} ${hm}`
}

export function ActivityRows({
  items,
  readIds,
  onOpen,
  fullTime,
}: {
  items: ActivityItem[]
  readIds?: Set<string>
  onOpen?: (item: ActivityItem) => void
  fullTime?: boolean
}) {
  return (
    <ul className="divide-y divide-border">
      {items.map((item) => {
        const unread = item.unread && !readIds?.has(item.id)
        return (
          <li key={item.id}>
            <button type="button" onClick={() => onOpen?.(item)} className="flex w-full gap-3 py-3 text-left">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(160deg,#f6f9ff_0%,#ebf2fc_100%)] ring-1 ring-inset ring-white">
                <Image src={item.icon || '/placeholder.svg'} alt="" width={64} height={64} className="size-7 object-contain" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex items-center gap-1.5 text-body font-medium text-foreground">
                  {item.title}
                  {unread && (
                    <span className="size-1.5 rounded-full bg-destructive">
                      <span className="sr-only">未读</span>
                    </span>
                  )}
                </span>
                <span className="line-clamp-2 text-caption text-muted-foreground">{item.desc}</span>
                <span className="flex items-center gap-1.5 text-caption text-faint">
                  <span className="truncate">操作人：{item.operator}</span>
                  <span aria-hidden="true">·</span>
                  <span className="shrink-0 tabular-nums">{fullTime ? item.time.slice(11) : shortTime(item.time)}</span>
                </span>
              </span>
              <ChevronRight className="mt-0.5 size-4 shrink-0 self-center text-faint" aria-hidden="true" />
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function ActivityListScreen({
  items,
  readIds,
  onBack,
  onOpen,
}: {
  items: ActivityItem[]
  readIds?: Set<string>
  onBack?: () => void
  onOpen?: (item: ActivityItem) => void
}) {
  const groups = items.reduce<{ date: string; items: ActivityItem[] }[]>((acc, item) => {
    const date = item.time.slice(0, 10)
    const last = acc.at(-1)
    if (last?.date === date) last.items.push(item)
    else acc.push({ date, items: [item] })
    return acc
  }, [])

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="shrink-0 bg-white">
        <StatusBar />
        <NavBar title="全部动态" showBack onBack={onBack} />
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-6 pt-3 [scrollbar-width:none] *:shrink-0">
        {groups.length === 0 ? (
          <p className="py-20 text-center text-note text-faint">暂无业务动态</p>
        ) : (
          groups.map((group) => (
            <section key={group.date} aria-label={dayLabel(group.date)} className="rounded-2xl bg-white px-4 pt-3 shadow-sm">
              <h2 className="flex items-baseline gap-2 text-note font-semibold text-foreground">
                {dayLabel(group.date)}
                <span className="text-caption font-normal tabular-nums text-faint">{group.date}</span>
              </h2>
              <ActivityRows items={group.items} readIds={readIds} onOpen={onOpen} fullTime />
            </section>
          ))
        )}
        {groups.length > 0 && <p className="text-center text-caption text-faint">仅展示近 30 天动态</p>}
      </div>
    </div>
  )
}
