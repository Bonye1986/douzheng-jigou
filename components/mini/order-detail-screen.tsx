'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import { Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NavBar, StatusBar } from './phone-frame'
import { getProductImage } from './orders-data'
import {
  getCloseReason,
  getCloseTime,
  getEventTime,
  getOrderActions,
  getOrderEvents,
  getPatientProfile,
  getProgressIndex,
  getSampler,
  getSourceLabel,
  getTester,
  getVerifier,
  orderStatuses,
  sampleModeLabel,
  trackingNo,
  type InstitutionRole,
  type Order,
} from './orders-data'

const statusMap = Object.fromEntries(orderStatuses.map((s) => [s.key, s]))

export function OrderDetailScreen({
  order,
  role = 'partner',
  onBack,
  onAction,
}: {
  order: Order
  role?: InstitutionRole
  onBack?: () => void
  onAction?: (label: string, order: Order) => void
}) {
  const status = statusMap[order.status]
  const closed = order.status === 'closed'
  const actions = getOrderActions(order, role)
  const progress = getProgressIndex(order.status)
  const profile = getPatientProfile(order)
  const events = getOrderEvents(order)
  const onsite = order.mode === 'onsite'
  const sampled = !closed && progress >= 3 && onsite
  const shipped = !closed && progress >= 4
  const tested = !closed && progress >= 5 && order.status !== 'toTest'
  const resample = order.resample
  const statusHint =
    resample?.state === 'pending' ? '已发起重采样，等待客户确认是否重新采样' : status.hint

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
            {closed ? `关闭时间 ${getCloseTime(order)}` : statusHint}
          </p>
        </section>

        <div className="relative z-10 -mt-8 flex flex-col gap-3 px-4 pb-4">
          {resample && <ResampleCard order={order} role={role} onAction={onAction} />}
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
                <p className="text-caption text-muted-foreground">口腔拭子 · {sampleModeLabel[order.mode]}</p>
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
              <Row label="性别" value={profile.gender} />
  <Row label="年龄" value={`${profile.age} 岁`} />
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
              <Row label="采样方式" value={sampleModeLabel[order.mode]} />
              {role === 'lab' && onsite && <Row label="采样机构" value={getSourceLabel(order)} />}
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
              {sampled && (
                <>
                  <Row label="采样时间" value={getEventTime(order, '完成采样') ?? '-'} />
                  <Row label="采样人员" value={getSampler(order)} />
                </>
              )}
              {tested && (
                <>
                  <Row label="检测时间" value={getEventTime(order, '开始检测') ?? '-'} />
                  <Row label="检测人员" value={getTester(order)} />
                </>
              )}
              {closed && <Row label="关闭原因" value={getCloseReason(order)} />}
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
              action.disabled
                ? 'min-w-28 cursor-not-allowed bg-muted text-faint active:scale-100'
                : action.primary
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
        </footer>
      )}
    </div>
  )
}

const resampleCopy = {
  pending: { title: '重采样 · 待客户确认', tone: 'bg-warning-soft text-warning' },
  agreed: { title: '客户已同意重采样', tone: 'bg-secondary text-primary' },
  refunded: { title: '客户已选择退款', tone: 'bg-muted text-muted-foreground' },
} as const

function ResampleCard({
  order,
  role,
  onAction,
}: {
  order: Order
  role: InstitutionRole
  onAction?: (label: string, order: Order) => void
}) {
  const r = order.resample
  if (!r) return null
  const copy = resampleCopy[r.state]
  const next =
    r.state === 'pending'
      ? '客户同意后订单回到' + (order.mode === 'self' ? '「待收货」，平台重新寄出采样盒' : '「待采样」，客户到店重新采样') + '；客户不同意则全额退款并关闭订单'
      : r.state === 'agreed'
        ? order.mode === 'self'
          ? '平台已重新寄出采样盒，等待客户采样后寄回实验室'
          : role === 'partner'
            ? '客户将到店重新采样，请扫描新的采样盒完成绑定'
            : '客户将到合作机构重新采样，订单已回到待采样'
        : '客户不同意重新采样，订单已全额原路退款并关闭'
  return (
    <section aria-label="重采样" className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-body font-semibold text-foreground">重采样</h3>
        <span className={cn('rounded-full px-2 py-0.5 text-caption font-medium', copy.tone)}>{copy.title}</span>
      </div>
      <dl className="mt-3 flex flex-col gap-2">
        <Row label="重采样原因" value={r.reason} />
        <Row label="发起时间" value={r.at} />
        <Row label="发起人" value={r.operator} />
        {r.decidedAt && <Row label="客户确认时间" value={r.decidedAt} />}
        {r.snapshot.sampleCode && <Row label="原样本编号" value={r.snapshot.sampleCode} />}
      </dl>
      <p className="mt-3 rounded-xl bg-[#f5f8fd] px-3 py-2 text-caption leading-5 text-muted-foreground">{next}</p>
      {r.state === 'pending' && role === 'lab' && (
        <div className="mt-2 flex items-center justify-end gap-4 text-caption">
          <span className="mr-auto text-faint">演示：模拟客户选择</span>
          <button type="button" onClick={() => onAction?.('客户同意重采样', order)} className="text-primary">
            同意重采样
          </button>
          <button type="button" onClick={() => onAction?.('客户申请退款', order)} className="text-muted-foreground">
            申请退款
          </button>
        </div>
      )}
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
