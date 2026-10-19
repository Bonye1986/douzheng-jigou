'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NavBar, StatusBar } from './phone-frame'
import { getProductImage } from './orders-data'
import {
  getCloseTime,
  getEventTime,
  getOrderEvents,
  getProgressIndex,
  getVerifier,
  orderStatuses,
  patientProfiles,
  progressSteps,
  statusActions,
  trackingNo,
  type Order,
} from './orders-data'

const statusMap = Object.fromEntries(orderStatuses.map((s) => [s.key, s]))

export function OrderDetailScreen({
  order,
  onBack,
  onAction,
}: {
  order: Order
  onBack?: () => void
  onAction?: (label: string, order: Order) => void
}) {
  const status = statusMap[order.status]
  const closed = order.status === 'closed'
  const actions = statusActions[order.status]
  const progress = getProgressIndex(order.status)
  const profile = patientProfiles[order.id]
  const events = getOrderEvents(order)
  const sampled = !closed && progress >= 3
  const shipped = !closed && progress >= 4

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div
        className={cn(
          'shrink-0 text-white',
          closed ? 'bg-[#97a3b4]' : 'bg-[#3d84e6]',
        )}
      >
        <StatusBar tone="light" />
        <NavBar title="订单详情" tone="light" showBack onBack={onBack} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-width:none] *:shrink-0">
        <section
          aria-label="订单状态"
          className={cn(
            'relative overflow-hidden px-5 pb-12 pt-2 text-white',
            closed
              ? 'bg-[linear-gradient(180deg,#97a3b4_0%,#b3bdca_100%)]'
              : 'bg-[linear-gradient(180deg,#3d84e6_0%,#6aa8f3_100%)]',
          )}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-20 size-48 rounded-full border-[28px] border-white/10"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-16 top-10 size-16 rounded-full bg-white/10 blur-xl"
          />
          <h2 className="relative text-headline font-bold tracking-tight">{status.label}</h2>
          <p className="relative mt-1 text-note text-white/85">
            {closed ? `关闭时间 ${getCloseTime(order)}` : status.hint}
          </p>
        </section>

        <div className="-mt-8 flex flex-col gap-3 px-4 pb-4">
          {!closed && <ProgressCard progress={progress} done={order.status === 'done'} />}

          <Card title="检测项目">
            <div className="flex items-center gap-3">
              <Image
                src={getProductImage(order.product) || '/placeholder.svg'}
                alt=""
                width={112}
                height={112}
                className={cn('size-16 shrink-0 rounded-xl bg-secondary object-cover ring-1 ring-border/70', closed && 'opacity-50 grayscale')}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="truncate text-body font-medium text-foreground">{order.product}</p>
                <p className="truncate text-caption text-faint">{order.spec}</p>
                <p className="text-caption text-muted-foreground">口腔拭子采样</p>
              </div>
            </div>
            <dl className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              <Row label="商品金额" value={`¥${order.amount.toFixed(2)}`} />
              <Row label="优惠券" value="-¥0.00" />
              <div className="flex items-center justify-between">
                <dt className="text-note text-muted-foreground">{order.status === 'unpaid' || closed ? '应付金额' : '实付金额'}</dt>
                <dd className="text-title font-semibold tabular-nums text-foreground">
                  <span className="text-caption">¥</span>
                  {order.amount.toFixed(2)}
                </dd>
              </div>
            </dl>
          </Card>

          <Card title="受检人信息">
            <dl className="flex flex-col gap-2">
              <Row label="姓名" value={order.patient} />
              <Row label="性别 / 年龄" value={`${profile.gender} / ${profile.age} 岁`} />
              <Row label="手机号" value={order.phone} />
            </dl>
          </Card>

          {!closed && progress >= 2 && (
            <Card title="样本信息">
              <dl className="flex flex-col gap-2">
                <Row
                  label="样本编号"
                  value={order.sampleCode ?? '扫码采样后自动绑定'}
                  muted={!order.sampleCode}
                  copy={order.sampleCode ? () => onAction?.('样本编号已复制', order) : undefined}
                />
                <Row label="样本类型" value="口腔拭子" />
                {sampled && <Row label="采样时间" value={getEventTime(order, '完成采样') ?? '-'} />}
                {shipped && (
                  <>
                    <Row label="物流公司" value="顺丰速运" />
                    <Row label="运单号" value={trackingNo(order)} copy={() => onAction?.('运单号已复制', order)} />
                  </>
                )}
              </dl>
            </Card>
          )}

          <Card title="订单信息">
            <dl className="flex flex-col gap-2">
              <Row label="订单编号" value={order.no} copy={() => onAction?.('订单号已复制', order)} />
              <Row label="下单时间" value={getEventTime(order, '用户下单') ?? `2026-${order.time}`} />
              {!closed && order.status !== 'unpaid' && (
                <>
                  <Row label="支付方式" value="微信支付" />
                  <Row label="支付时间" value={getEventTime(order, '支付成功') ?? '-'} />
                </>
              )}
              {getEventTime(order, '订单核销') && (
                <>
                  <Row label="核销时间" value={getEventTime(order, '订单核销') ?? '-'} />
                  <Row label="核销人员" value={getVerifier(order)} />
                </>
              )}
              {closed && <Row label="关闭原因" value="超时未支付" />}
            </dl>
          </Card>

          <Card title="订单跟踪">
            <ol className="flex flex-col">
              {events.map((event, index) => {
                const latest = index === 0
                const last = index === events.length - 1
                return (
                  <li key={event.title} className="flex gap-3">
                    <span className="flex w-3 flex-col items-center pt-1.5">
                      <span
                        aria-hidden="true"
                        className={cn(
                          'size-2.5 shrink-0 rounded-full',
                          latest
                            ? closed
                              ? 'bg-faint'
                              : 'bg-primary ring-4 ring-primary/15'
                            : 'bg-border',
                        )}
                      />
                      {!last && <span aria-hidden="true" className="mt-1 w-px flex-1 bg-border" />}
                    </span>
                    <div className={cn('flex min-w-0 flex-1 flex-col gap-0.5', !last && 'pb-4')}>
                      <p
                        className={cn(
                          'text-note font-medium',
                          latest ? (closed ? 'text-muted-foreground' : 'text-primary') : 'text-foreground',
                        )}
                      >
                        {event.title}
                      </p>
                      <p className="text-caption text-muted-foreground">{event.desc}</p>
                      <p className="text-caption tabular-nums text-faint">{event.time}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </Card>
        </div>
      </div>

      {actions.length > 0 && (
        <footer className="flex shrink-0 items-center justify-end gap-2.5 bg-white px-4 pb-7 pt-2.5 shadow-[0_-1px_0_#e6edf6,0_-6px_16px_-8px_rgb(36_64_110/0.08)]">
          {actions.map((action) => {
            const className = cn(
              'flex h-10 items-center justify-center rounded-full px-5 text-body font-medium transition-transform active:scale-95',
              action.primary
                ? 'min-w-28 bg-brand text-white shadow-brand'
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
              <button key={action.label} type="button" onClick={() => onAction?.(action.label, order)} className={className}>
                {action.label}
              </button>
            )
          })}
        </footer>
      )}
    </div>
  )
}

function ProgressCard({ progress, done }: { progress: number; done: boolean }) {
  const total = progressSteps.length
  const completedCount = done ? total : progress
  return (
    <section aria-label="服务进度" className="rounded-2xl bg-white px-4 pb-4 pt-3.5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-body font-semibold text-foreground">服务进度</h3>
        <span className="text-caption text-muted-foreground">
          {done ? (
            <span className="inline-flex items-center gap-1 font-medium text-success">
              <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
              全部完成
            </span>
          ) : (
            <>
              当前 <span className="font-semibold text-primary">{progressSteps[progress]}</span>
              <span className="mx-1.5 text-faint">·</span>
              {completedCount}/{total}
            </>
          )}
        </span>
      </div>
      <ol className="flex">
        {progressSteps.map((step, index) => {
          const finished = done || index < progress
          const current = !done && index === progress
          return (
            <li key={step} className="relative flex flex-1 flex-col items-center gap-2">
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute right-1/2 top-[7px] h-[2px] w-full rounded-full',
                    finished || current ? 'bg-primary' : 'bg-border',
                  )}
                />
              )}
              <span aria-hidden="true" className="relative flex size-4 items-center justify-center">
                {current && <span className="absolute inset-0 rounded-full bg-primary/20" />}
                <span
                  className={cn(
                    'relative rounded-full',
                    finished && 'size-2.5 bg-primary',
                    current && 'size-2.5 bg-primary ring-2 ring-white',
                    !finished && !current && 'size-2 bg-border',
                  )}
                />
              </span>
              <span
                className={cn(
                  'text-[11px] leading-none',
                  current ? 'font-semibold text-primary' : finished ? 'text-muted-foreground' : 'text-faint',
                )}
              >
                {step}
                <span className="sr-only">{finished ? '（已完成）' : current ? '（进行中）' : '（未开始）'}</span>
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-body font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  )
}

function Row({
  label,
  value,
  muted,
  copy,
}: {
  label: string
  value: string
  muted?: boolean
  copy?: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="shrink-0 text-note text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'flex min-w-0 items-center gap-1 text-note tabular-nums',
          muted ? 'text-faint' : 'text-foreground',
        )}
      >
        <span className="truncate">{value}</span>
        {copy && (
          <button
            type="button"
            onClick={copy}
            aria-label={`复制${label}`}
            className="flex size-5 shrink-0 items-center justify-center text-faint"
          >
            <Copy className="size-3" aria-hidden="true" />
          </button>
        )}
      </dd>
    </div>
  )
}
