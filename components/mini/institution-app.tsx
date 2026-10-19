'use client'

import { useRef, useState } from 'react'
import { Check, ChartColumn, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ActionSheet, SheetRow } from './action-sheet'
import { InstitutionTabBar, type InstitutionTabKey } from './institution-tab-bar'
import { NavBar, StatusBar } from './phone-frame'
import { InstitutionSettingsScreen } from './institution-settings'
import { LogisticsScreen } from './logistics-screen'
import { OrderDetailScreen } from './order-detail-screen'
import {
  SAMPLE_CODE_PATTERN,
  nowText,
  orders as seedOrders,
  type Order,
  type OrderStatus,
} from './orders-data'
import { OrdersScreen } from './orders-screen'
import { ReportScreen } from './report-screen'
import { ScanScreen } from './scan-screen'
import { ShipBookingScreen } from './ship-booking-screen'
import { historyOrders } from './stats-data'
import { StatsScreen } from './stats-screen'
import { institution, type InstitutionProfile } from './workbench-data'
import { WorkbenchScreen } from './workbench-screen'

const copiedLabels = ['订单号已复制', '样本编号已复制', '运单号已复制']
const CURRENT_STAFF = '店员 李晓'

export type InstitutionFlow =
  | { type: 'verify'; orderId?: string }
  | { type: 'sample'; orderId?: string }
  | { type: 'ship'; orderIds?: string[] }
  | { type: 'logistics'; orderId: string }
  | { type: 'report'; orderId: string }

type Pending =
  | { type: 'verify'; code: string; orderId: string }
  | { type: 'sample'; code: string; orderId?: string }

export function InstitutionApp({
  initialTab = 'workbench',
  initialOrderStatus = 'all',
  initialOrderId,
  initialFlow,
}: {
  initialTab?: InstitutionTabKey
  initialOrderStatus?: 'all' | OrderStatus
  initialOrderId?: string
  initialFlow?: InstitutionFlow
}) {
  const [tab, setTab] = useState<InstitutionTabKey>(initialTab)
  const [profile, setProfile] = useState<InstitutionProfile>(institution)
  const [showSettings, setShowSettings] = useState(false)
  const [orderList, setOrderList] = useState<Order[]>(seedOrders)
  const [orderId, setOrderId] = useState<string | undefined>(initialOrderId)
  const [flow, setFlow] = useState<InstitutionFlow | undefined>(initialFlow)
  const [pending, setPending] = useState<Pending | undefined>()
  const [pickedOrderId, setPickedOrderId] = useState<string | undefined>()
  const [toast, setToast] = useState('')
  const toastTimer = useRef<number | undefined>(undefined)

  const [historyList, setHistoryList] = useState<Order[]>(historyOrders)

  const findOrder = (id?: string) => orderList.find((o) => o.id === id) ?? historyList.find((o) => o.id === id)
  const byStatus = (status: OrderStatus) => orderList.filter((o) => o.status === status)

  const showToast = (message: string) => {
    window.clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = window.setTimeout(() => setToast(''), 1800)
  }

  const updateOrders = (ids: string[], patch: (order: Order) => Partial<Order>) => {
    const apply = (list: Order[]) => list.map((o) => (ids.includes(o.id) ? { ...o, ...patch(o) } : o))
    setOrderList(apply)
    setHistoryList(apply)
  }

  const startFlow = (label: string, order?: Order) => {
    if (label === '核销订单') setFlow({ type: 'verify', orderId: order?.id })
    else if (label === '扫码采样') setFlow({ type: 'sample', orderId: order?.id })
    else if (label === '预约寄样') setFlow({ type: 'ship', orderIds: order ? [order.id] : undefined })
    else if (label === '查看物流' && order) setFlow({ type: 'logistics', orderId: order.id })
    else if (label === '查看报告' && order) setFlow({ type: 'report', orderId: order.id })
    else return false
    return true
  }

  const handleOrderAction = (label: string, order?: Order) => {
    if (label === '订单详情' && order) {
      setOrderId(order.id)
      return
    }
    if (startFlow(label, order)) return
    showToast(copiedLabels.includes(label) ? label : `即将进入「${label}」`)
  }

  const confirmVerify = (code: string, id: string) => {
    const time = nowText()
    updateOrders([id], (o) => ({
      status: 'toSample',
      verifyCode: o.verifyCode ?? code,
      verifier: CURRENT_STAFF,
      records: { ...o.records, 订单核销: time },
    }))
    setPending(undefined)
    setFlow(undefined)
    setOrderId(id)
    showToast('核销成功，请为用户采样')
  }

  const confirmSample = (code: string, id: string) => {
    const time = nowText()
    updateOrders([id], (o) => ({ status: 'toShip', sampleCode: code, records: { ...o.records, 完成采样: time } }))
    setPending(undefined)
    setPickedOrderId(undefined)
    setFlow(undefined)
    setOrderId(id)
    showToast('样本已绑定订单')
  }

  const submitShipping = (ids: string[]) => {
    const time = nowText()
    const tracking = `SF14${Date.now().toString().slice(-10)}`
    updateOrders(ids, (o) => ({ status: 'toReceive', tracking, records: { ...o.records, 预约寄样: time } }))
    setFlow(undefined)
    showToast(`已预约 ${ids.length} 件样本，快递员将尽快上门取件`)
  }

  const toastNode = toast && (
    <div
      role="status"
      className="pointer-events-none absolute inset-x-0 top-[44%] z-40 mx-auto w-fit max-w-[260px] rounded-xl bg-[#2a3a52]/85 px-5 py-3 text-center text-body text-white backdrop-blur"
    >
      {toast}
    </div>
  )

  const shell = (content: React.ReactNode) => (
    <div className="relative flex h-full flex-col bg-background">
      {content}
      {toastNode}
    </div>
  )

  if (flow?.type === 'verify') {
    const target = findOrder(flow.orderId)
    const pendingOrder = pending?.type === 'verify' ? findOrder(pending.orderId) : undefined
    return shell(
      <>
        <ScanScreen
          key={pending ? 'paused' : 'live'}
          title="扫码核销"
          tip="请将用户小程序中的核销码放入框内"
          context={target ? `核销订单：${target.patient} · ${target.no}` : undefined}
          manualLabel="核销码"
          manualPlaceholder="请输入 8 位核销码"
          demoCode={target?.verifyCode ?? byStatus('toVerify')[0]?.verifyCode ?? '88264310'}
          validate={(code) => {
            const match = target ?? byStatus('toVerify').find((o) => o.verifyCode === code)
            if (!match) return '未找到该核销码对应的待核销订单'
            if (match.status !== 'toVerify') return '该订单已核销，请勿重复操作'
            if (match.verifyCode && match.verifyCode !== code) return '核销码与当前订单不匹配'
          }}
          onBack={() => setFlow(undefined)}
          onResult={(code) => {
            const match = target ?? byStatus('toVerify').find((o) => o.verifyCode === code)
            if (match) setPending({ type: 'verify', code, orderId: match.id })
          }}
        />
        {pending?.type === 'verify' && pendingOrder && (
          <ActionSheet
            title="确认核销"
            confirmLabel="确认核销"
            onClose={() => setPending(undefined)}
            onConfirm={() => confirmVerify(pending.code, pendingOrder.id)}
          >
            <OrderBrief order={pendingOrder} />
            <dl className="mt-2 border-t border-border pt-2">
              <SheetRow label="核销码" value={pending.code} strong />
              <SheetRow label="受检人" value={`${pendingOrder.patient}  ${pendingOrder.phone}`} />
              <SheetRow label="实付金额" value={`¥${pendingOrder.amount.toFixed(2)}`} />
              <SheetRow label="核销人员" value={CURRENT_STAFF} />
              <SheetRow label="核销时间" value={nowText()} />
            </dl>
            <p className="mt-2 text-caption text-faint">核销后将记录核销人员与时间，订单进入待采样。</p>
          </ActionSheet>
        )}
      </>,
    )
  }

  if (flow?.type === 'sample') {
    const target = findOrder(flow.orderId)
    const candidates = byStatus('toSample')
    const chosenId = pending?.type === 'sample' ? (pending.orderId ?? pickedOrderId) : undefined
    return shell(
      <>
        <ScanScreen
          key={pending ? 'paused' : 'live'}
          title="扫码采样"
          tip="请扫描采样盒上的样本编码条形码"
          context={target ? `绑定订单：${target.patient} · ${target.no}` : undefined}
          manualLabel="样本编码"
          manualPlaceholder="如 YW2610190019"
          demoCode={`YW${(target ?? candidates[0])?.no.slice(-10) ?? '2610190019'}`}
          validate={(code) => {
            if (!SAMPLE_CODE_PATTERN.test(code)) return '样本编码格式有误，应为 YW + 10 位数字'
            if (orderList.some((o) => o.sampleCode === code)) return '该样本编码已绑定其他订单'
            if (!target && candidates.length === 0) return '暂无待采样的订单'
          }}
          onBack={() => setFlow(undefined)}
          onResult={(code) => {
            setPickedOrderId(candidates.length === 1 ? candidates[0].id : undefined)
            setPending({ type: 'sample', code, orderId: target?.id })
          }}
        />
        {pending?.type === 'sample' && (
          <ActionSheet
            title="绑定样本"
            confirmLabel="确认绑定"
            confirmDisabled={!chosenId}
            onClose={() => setPending(undefined)}
            onConfirm={() => chosenId && confirmSample(pending.code, chosenId)}
          >
            <div className="rounded-xl bg-secondary px-3 py-2.5">
              <p className="text-caption text-muted-foreground">样本编码</p>
              <p className="text-title font-semibold tabular-nums text-primary">{pending.code}</p>
            </div>
            {target ? (
              <div className="mt-3">
                <p className="mb-2 text-note text-muted-foreground">将绑定至订单</p>
                <OrderBrief order={target} />
              </div>
            ) : (
              <div className="mt-3">
                <p className="mb-1 text-note text-muted-foreground">选择要绑定的订单</p>
                <ul role="radiogroup" aria-label="选择订单" className="flex flex-col">
                  {candidates.map((order) => {
                    const active = pickedOrderId === order.id
                    return (
                      <li key={order.id} className="border-t border-border first:border-t-0">
                        <button
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setPickedOrderId(order.id)}
                          className="flex w-full items-center gap-3 py-3 text-left"
                        >
                          <span
                            className={cn(
                              'flex size-5 shrink-0 items-center justify-center rounded-full border',
                              active ? 'border-primary bg-primary text-white' : 'border-[#c9d3e0]',
                            )}
                          >
                            {active && <Check className="size-3" strokeWidth={3} aria-hidden="true" />}
                          </span>
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate text-note font-medium text-foreground">
                              {order.patient} · {order.product}
                            </span>
                            <span className="text-caption tabular-nums text-muted-foreground">{order.no}</span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            <p className="mt-2 text-caption text-faint">绑定后样本与订单一一对应，订单进入待寄样。</p>
          </ActionSheet>
        )}
      </>,
    )
  }

  if (flow?.type === 'ship') {
    return shell(
      <ShipBookingScreen
        orders={byStatus('toShip')}
        profile={profile}
        initialSelected={flow.orderIds}
        onBack={() => setFlow(undefined)}
        onSubmit={submitShipping}
      />,
    )
  }

  const logisticsOrder = flow?.type === 'logistics' ? findOrder(flow.orderId) : undefined
  if (logisticsOrder) {
    return shell(
      <LogisticsScreen
        order={logisticsOrder}
        profile={profile}
        onBack={() => setFlow(undefined)}
        onCopy={() => showToast('运单号已复制')}
      />,
    )
  }

  const reportOrder = flow?.type === 'report' ? findOrder(flow.orderId) : undefined
  if (reportOrder) {
    return shell(
      <ReportScreen
        order={reportOrder}
        onBack={() => setFlow(undefined)}
        onDownload={() => showToast('报告 PDF 已开始下载')}
      />,
    )
  }

  const detailOrder = findOrder(orderId)
  if (detailOrder) {
    return shell(
      <OrderDetailScreen
        order={detailOrder}
        onBack={() => setOrderId(undefined)}
        onAction={(label, order) => handleOrderAction(label, order)}
      />,
    )
  }

  if (showSettings) {
    return shell(
      <InstitutionSettingsScreen profile={profile} onBack={() => setShowSettings(false)} onSave={setProfile} />,
    )
  }

  return shell(
    <>
      {tab === 'workbench' ? (
        <WorkbenchScreen
          profile={profile}
          onAction={(key, label) => {
            if (key === 'stats') setTab('stats')
            else if (key === 'profile') setShowSettings(true)
            else if (key === 'verify') setFlow({ type: 'verify' })
            else if (key === 'scan') setFlow({ type: 'sample' })
            else if (key === 'ship') setFlow({ type: 'ship' })
            else showToast(`即将进入「${label}」`)
          }}
        />
      ) : tab === 'orders' ? (
        <OrdersScreen orders={orderList} initialStatus={initialOrderStatus} onAction={handleOrderAction} />
      ) : (
        <StatsScreen orders={[...orderList, ...historyList]} onOpenOrder={(order) => setOrderId(order.id)} />
      )}
      <InstitutionTabBar active={tab} onSelect={setTab} />
    </>,
  )
}

function OrderBrief({ order }: { order: Order }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-border px-3 py-2.5">
      <p className="truncate text-body font-medium text-foreground">{order.product}</p>
      <p className="text-caption tabular-nums text-muted-foreground">订单号 {order.no}</p>
    </div>
  )
}

function TabPlaceholder({ title, icon: Icon }: { title: string; icon: LucideIcon }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <StatusBar />
      <NavBar title={title} />
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
          <Icon className="size-7" aria-hidden="true" />
        </span>
        <p className="text-title font-medium text-foreground">{title}</p>
        <p className="text-note text-muted-foreground">该页面将在后续版本中设计</p>
      </div>
    </div>
  )
}
