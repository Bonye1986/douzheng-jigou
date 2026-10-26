'use client'

import Image from 'next/image'
import { ChevronRight, Clock, MapPin, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBar, Capsule } from './phone-frame'
import { ActivityRows } from './activity-feed'
import {
  WORKBENCH_ACTIVITY_LIMIT,
  activities,
  institution,
  quickActions,
  type ActivityItem,
  type InstitutionProfile,
  type Metric,
  type QuickActionKey,
} from './workbench-data'
import type { OrderStatus } from './orders-data'

export function WorkbenchScreen({
  profile = institution,
  metrics,
  actions = quickActions,
  feed = activities,
  readIds,
  onAction,
  onOpenOrders,
}: {
  profile?: InstitutionProfile
  metrics: Metric[]
  actions?: typeof quickActions
  feed?: ActivityItem[]
  readIds?: Set<string>
  onAction?: (key: QuickActionKey | 'activity' | 'feed' | 'profile', label: string) => void
  onOpenOrders?: (status: OrderStatus) => void
}) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[320px] bg-[radial-gradient(90%_70%_at_100%_0%,#c4dcff_0%,#c4dcff00_70%),radial-gradient(70%_60%_at_0%_10%,#dff4f7_0%,#dff4f700_70%),linear-gradient(180deg,#e2eeff_0%,#eef5fe_60%,#f5f8fc_100%)]"
      />
      <div className="relative z-10 shrink-0">
        <StatusBar />
        <div className="flex h-11 items-center justify-between px-4">
          <h1 className="text-heading font-bold text-foreground">工作台</h1>
          <Capsule />
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-5 pt-2 [scrollbar-width:none] *:shrink-0">
        <InstitutionCard
          profile={profile}
          metrics={metrics}
          onOpen={() => onAction?.('profile', '机构信息')}
          onMetric={(status) => onOpenOrders?.(status)}
        />

        <section aria-labelledby="wb-quick" className="rounded-2xl bg-white p-4 shadow-sm">
          <SectionTitle id="wb-quick" title="常用功能" />
          <ul className="mt-3.5 grid grid-cols-4 gap-2">
            {actions.map(({ key, label, icon }) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onAction?.(key, label)}
                  className="group flex w-full flex-col items-center gap-2 rounded-xl py-1 transition-transform active:scale-95"
                >
                  <span className="flex size-[52px] items-center justify-center rounded-[18px] bg-[linear-gradient(160deg,#f6f9ff_0%,#e8f0fc_100%)] ring-1 ring-inset ring-white">
                    <Image src={icon} alt="" width={80} height={80} className="size-10 object-contain drop-shadow-[0_3px_4px_rgb(58_130_228/0.18)]" />
                  </span>
                  <span className="text-caption font-medium text-foreground">{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="wb-feed" className="rounded-2xl bg-white px-4 pb-1 pt-4 shadow-sm">
          <div className="flex items-center justify-between">
            <SectionTitle id="wb-feed" title="最新动态" />
            <button
              type="button"
              onClick={() => onAction?.('feed', '全部动态')}
              aria-label="最新动态：查看更多"
              className="-mr-1 flex items-center gap-0.5 px-1 py-0.5 text-caption text-muted-foreground"
            >
              更多
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-1">
            <ActivityRows
              items={feed.slice(0, WORKBENCH_ACTIVITY_LIMIT)}
              readIds={readIds}
              onOpen={(item) => onAction?.('activity', item.id)}
            />
          </div>
        </section>
      </div>
    </div>
  )
}

function SectionTitle({ id, title }: { id: string; title: string }) {
  return (
    <h2 id={id} className="text-title font-semibold tracking-tight text-foreground">
      {title}
    </h2>
  )
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Clock
  label: string
  children: React.ReactNode
}) {
  return (
    <span className="flex min-w-0 items-center gap-2 text-caption">
      <Icon className="size-3.5 shrink-0 text-primary/70" aria-hidden="true" />
      <span className="w-14 shrink-0 text-muted-foreground">{label}</span>
      <span className="flex min-w-0 flex-1 items-center gap-2 font-medium text-foreground">{children}</span>
    </span>
  )
}

function InstitutionCard({
  profile,
  metrics,
  onOpen,
  onMetric,
}: {
  profile: InstitutionProfile
  metrics: Metric[]
  onOpen: () => void
  onMetric: (status: OrderStatus) => void
}) {
  return (
    <section aria-labelledby="wb-inst" className="overflow-hidden rounded-2xl bg-white shadow-md">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${profile.name}，进入机构设置`}
        className="flex w-full flex-col gap-3 p-4 text-left transition-colors active:bg-secondary/40"
      >
        <span className="flex w-full items-center gap-3">
          {profile.logo ? (
            <Image
              src={profile.logo || '/placeholder.svg'}
              alt={`${profile.name} logo`}
              width={96}
              height={96}
              className="size-12 shrink-0 rounded-2xl border border-border bg-white object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-title font-bold text-primary"
            >
              {profile.name.slice(0, 1)}
            </span>
          )}
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="flex min-w-0 items-center gap-1.5">
              <span id="wb-inst" className="truncate text-title font-bold text-foreground">
                {profile.name}
              </span>
              <span className="shrink-0 rounded-md bg-secondary px-1.5 py-px text-tag font-medium text-primary">
                {profile.role === 'lab' ? '实验室' : `合作机构 · ${profile.type}`}
              </span>
            </span>
            <span className="text-caption tabular-nums text-faint">编号 {profile.code}</span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-faint" aria-hidden="true" />
        </span>

        <span className="flex w-full flex-col gap-2.5 rounded-xl bg-[#f5f8fd] px-3 py-3">
          <InfoRow icon={Clock} label={profile.role === 'lab' ? '收样时间' : '营业时间'}>
            <span className="tabular-nums">
              {profile.openTime} - {profile.closeTime}
            </span>
            <span className="ml-auto shrink-0 rounded-full bg-success-soft px-2 py-px text-tag font-medium text-success">
              营业中
            </span>
          </InfoRow>
          <InfoRow icon={Phone} label="联系电话">
            <span className="tabular-nums">{profile.phone}</span>
          </InfoRow>
          <InfoRow icon={MapPin} label="机构地址">
            <span className="truncate">{profile.address}</span>
          </InfoRow>
        </span>
      </button>
      <ul className="mx-4 grid grid-cols-3 border-t border-dashed border-border py-2">
        {metrics.map((metric, index) => (
          <li key={metric.label} className={cn('flex', index > 0 && 'border-l border-border')}>
            <button
              type="button"
              onClick={() => onMetric(metric.status)}
              aria-label={`${metric.label} ${metric.value}${metric.unit}，查看订单`}
              className="mx-1 flex flex-1 flex-col-reverse items-center gap-0.5 rounded-xl py-1.5 transition-colors active:bg-muted"
            >
              <span className="text-caption text-muted-foreground">{metric.label}</span>
              <span className="text-headline font-bold tabular-nums tracking-tight text-foreground">
                {metric.value}
                <span className="ml-0.5 text-caption font-normal text-muted-foreground">{metric.unit}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
