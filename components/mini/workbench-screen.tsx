'use client'

import { BadgeCheck, Bell, Building2, ChevronRight, MapPin, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBar, Capsule } from './phone-frame'
import { activities, institution, quickActions, todayMetrics, type QuickActionKey } from './workbench-data'

export function WorkbenchScreen({
  onAction,
  unreadCount = activities.filter((item) => item.unread).length,
}: {
  onAction?: (key: QuickActionKey | 'activity' | 'notice' | 'profile', label: string) => void
  unreadCount?: number
}) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[300px] bg-[linear-gradient(180deg,#d6e8ff_0%,#e9f2fe_55%,#f5f8fc00_100%)]"
      />
      <div className="relative z-10 shrink-0">
        <StatusBar />
        <div className="flex h-11 items-center justify-between px-4">
          <h1 className="text-heading font-bold text-foreground">工作台</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onAction?.('notice', '消息通知')}
              aria-label={`消息通知，${unreadCount} 条未读`}
              className="relative flex size-8 items-center justify-center rounded-full bg-white/80 text-foreground"
            >
              <Bell className="size-[18px]" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 size-2 rounded-full bg-destructive ring-2 ring-white" />
              )}
            </button>
            <Capsule />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-5 pt-2 [scrollbar-width:none] *:shrink-0">
        <InstitutionCard onOpen={() => onAction?.('profile', '机构信息')} />

        <section aria-labelledby="wb-quick" className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 id="wb-quick" className="flex items-center gap-1.5 text-title font-semibold text-foreground">
            <span aria-hidden="true" className="h-3.5 w-1 rounded-full bg-gradient-to-b from-primary to-primary/40" />
            常用功能
          </h2>
          <ul className="mt-4 grid grid-cols-4 gap-2">
            {quickActions.map(({ key, label, icon: Icon, tone }) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onAction?.(key, label)}
                  className="flex w-full flex-col items-center gap-2 rounded-xl py-1 transition-transform active:scale-95"
                >
                  <span className={cn('flex size-12 items-center justify-center rounded-2xl', tone)}>
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="text-note font-medium text-foreground">{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="wb-feed" className="rounded-2xl bg-white px-4 pb-1 pt-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 id="wb-feed" className="flex items-center gap-1.5 text-title font-semibold text-foreground">
              <span aria-hidden="true" className="h-3.5 w-1 rounded-full bg-gradient-to-b from-primary to-primary/40" />
              最新动态
            </h2>
            <button
              type="button"
              onClick={() => onAction?.('activity', '全部动态')}
              aria-label="最新动态：查看全部"
              className="-mr-1 flex items-center gap-0.5 px-1 py-0.5 text-caption text-muted-foreground"
            >
              全部
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>
          <ul className="mt-2 divide-y divide-border">
            {activities.map(({ id, title, desc, time, icon: Icon, tone, unread }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onAction?.('activity', title)}
                  className="flex w-full gap-3 py-3 text-left"
                >
                  <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', tone)}>
                    <Icon className="size-[18px]" aria-hidden="true" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-body font-medium text-foreground">
                        {title}
                        {unread && (
                          <span className="size-1.5 rounded-full bg-destructive">
                            <span className="sr-only">未读</span>
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-caption text-faint">{time}</span>
                    </span>
                    <span className="line-clamp-2 text-caption text-muted-foreground">{desc}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

function InstitutionCard({ onOpen }: { onOpen: () => void }) {
  return (
    <section aria-labelledby="wb-inst" className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_#3a82e41a]">
      <button type="button" onClick={onOpen} className="flex w-full items-start gap-3 p-4 text-left">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#5fa2f0] text-white">
          <Building2 className="size-6" aria-hidden="true" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-center gap-1.5">
            <span id="wb-inst" className="truncate text-title font-bold text-foreground">
              {institution.name}
            </span>
            <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-success-soft px-1.5 py-0.5 text-tag font-medium text-success">
              <BadgeCheck className="size-3" aria-hidden="true" />
              已认证
            </span>
          </span>
          <span className="mt-0.5 text-caption text-muted-foreground">
            {institution.department} · {institution.code}
          </span>
          <span className="mt-2 flex items-center gap-1 text-caption text-muted-foreground">
            <Phone className="size-3.5 shrink-0 text-faint" aria-hidden="true" />
            {institution.contact}
          </span>
          <span className="mt-1 flex items-center gap-1 text-caption text-muted-foreground">
            <MapPin className="size-3.5 shrink-0 text-faint" aria-hidden="true" />
            <span className="truncate">{institution.address}</span>
          </span>
        </span>
        <ChevronRight className="mt-3.5 size-4 shrink-0 text-faint" aria-hidden="true" />
      </button>
      <dl className="grid grid-cols-3 border-t border-border bg-[linear-gradient(180deg,#f7faff,#fff)] py-3">
        {todayMetrics.map((metric, index) => (
          <div
            key={metric.label}
            className={cn('flex flex-col-reverse items-center gap-0.5', index > 0 && 'border-l border-border')}
          >
            <dt className="text-caption text-muted-foreground">{metric.label}</dt>
            <dd className="text-headline font-bold tabular-nums text-foreground">
              {metric.value}
              <span className="ml-0.5 text-caption font-normal text-muted-foreground">{metric.unit}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
