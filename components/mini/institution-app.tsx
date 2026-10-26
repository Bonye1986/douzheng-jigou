'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ActionSheet, SheetRow } from './action-sheet'
import { InstitutionTabBar, type InstitutionTabKey } from './institution-tab-bar'
import { NavBar, StatusBar } from './phone-frame'
import { InstitutionSettingsScreen } from './institution-settings'
import { LogisticsScreen } from './logistics-screen'
import { OrderDetailScreen } from './order-detail-screen'
import {
  SAMPLE_CODE_PATTERN,
  canSeeOrder,
  getSourceLabel,
  nowText,
  orderStatuses,
  orders as seedOrders,
  resampleReasons,
  resampleReentry,
  sampleModeLabel,
  type InstitutionRole,
  type Order,
  type OrderStatus,
} from './orders-data'
import { OrdersScreen } from './orders-screen'
import { ReportScreen } from './report-screen'
import { ScanScreen } from './scan-screen'
import { ShipBookingScreen } from './ship-booking-screen'
import { historyOrders } from './stats-data'
import { StatsScreen } from './stats-screen'
import { ActivityListScreen } from './activity-feed'
import {
  activities,
  institution,
  labActivities,
  labProfile,
  labQuickActions,
  quickActions,
  type ActivityItem,
  type InstitutionProfile,
  type Metric,
} from './workbench-data'
import { WorkbenchScreen } from './workbench-screen'

const copiedLabels = ['订单号已复制', '样本编号已复制', '运单号已复制']
const PARTNER_STAFF = '店员 李晓'
const LAB_STAFF = '检验员 陈静'

export type InstitutionFlow =
  | { type: 'verify'; orderId?: string }
  | { type: 'sample'; orderId?: string }
  | { type: 'detect'; orderId?: string }
  | { type: 'ship'; orderIds?: string[] }
  | { type: 'logistics'; orderId: string }
  | { type: 'report'; orderId: string }

type Pending =
  | { type: 'verify'; code: string; orderId: string }
  | { type: 'sample'; code: string; orderId?: string }
  | { type: 'detect'; code: string; orderId: string }

export function InstitutionApp({
  role = 'partner',
  initialResampleId,
  initialTab = 'workbench',
  initialOrderStatus = 'all',
  initialOrderId,
  initialFlow,
  initialShowActivities = false,
  onLogout,
}: {
  initialTab?: InstitutionTabKey
  initialOrderStatus?: 'all' | OrderStatus
  initialOrderId?: string
  initialFlow?: InstitutionFlow
  initialShowActivities?: boolean
  role?: InstitutionRole
  initialResampleId?: string
  onLogout?: () => void
}) {
  const isLab = role === 'lab'
  const CURRENT_STAFF = isLab ? LAB_STAFF : PARTNER_STAFF
  const feed = isLab ? labActivities : activities
  const [tab, setTab] = useState<InstitutionTabKey>(initialTab)
  const [profile, setProfile] = useState<InstitutionProfile>(isLab ? labProfile : institution)
  const [showSettings, setShowSettings] = useState(false)
  const [orderList, setOrderList] = useState<Order[]>(() =>
    [...seedOrders, ...historyOrders].filter((o) => canSeeOrder(o, role, institution.code)),
  )
  const [orderId, setOrderId] = useState<string | undefined>(initialOrderId)
  const [flow, setFlow] = useState<InstitutionFlow | undefined>(initialFlow)
  const [pending, setPending] = useState<Pending | undefined>()
  const [pickedOrderId, setPickedOrderId] = useState<string | undefined>()
  const [callOrder, setCallOrder] = useState<Order | undefined>()
  const [resampleId, setResampleId] = useState<string | undefined>(initialResampleId)
  const [resampleReason, setResampleReason] = useState<string>(resampleReasons[0])
  const [ordersKey, setOrdersKey] = useState(0)
  const [ordersStatus, setOrdersStatus] = useState<'all' | OrderStatus>(initialOrderStatus)
  const [showActivities, setShowActivities] = useState(initialShowActivities)
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set())
  const [toast, setToast] = useState('')
  const toastTimer = useRef<number | undefined>(undefined)

  const findOrder = (id?: string) => orderList.find((o) => o.id === id)
  const byStatus = (status: OrderStatus) => orderList.filter((o) => o.status === status)

  const showToast = (message: string) => {
    window.clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = window.setTimeout(() => setToast(''), 1800)
  }

  const updateOrders = (ids: string[], patch: (order: Order) => Partial<Order>) => {
    const apply = (list: Order[]) => list.map((o) => (ids.includes(o.id) ? { ...o, ...patch(o) } : o))
    setOrderList(apply)
  }

  const startFlow = (label: string, order?: Order) => {
    if (label === '核销订单') setFlow({ type: 'verify', orderId: order?.id })
    else if (label === '扫码采样') setFlow({ type: 'sample', orderId: order?.id })
    else if (label === '扫码检测') setFlow({ type: 'detect', orderId: order?.id })
    else if (label === '预约寄样') setFlow({ type: 'ship', orderIds: order ? [order.id] : undefined })
    else if (label === '查看物流' && order) setFlow({ type: 'logistics', orderId: order.id })
    else if (label === '查看报告' && order) setFlow({ type: 'report', orderId: order.id })
    else return false
    return true
  }

  const openActivity = (item: ActivityItem) => {
    setReadIds((prev) => new Set(prev).add(item.id))
    setOrderId(item.orderId)
  }

  const handleOrderAction = (label: string, order?: Order) => {
    if (label === '订单详情' && order) {
      setOrderId(order.id)
      return
    }
    if (label === '联系用户' && order) {
      setCallOrder(order)
      return
    }
    if (label === '重采样' && order) {
      setResampleReason(resampleReasons[0])
      setResampleId(order.id)
      return
    }
    if ((label === '客户同意重采样' || label === '客户申请退款') && order) {
      decideResample(order.id, label === '客户同意重采样')
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
    updateOrders([id], (o) => ({ status: 'toShip', sampleCode: code, sampler: CURRENT_STAFF, records: { ...o.records, 完成采样: time } }))
    setPending(undefined)
    setPickedOrderId(undefined)
    setFlow(undefined)
    setOrderId(id)
    showToast('样本已绑定订单')
  }

  const confirmDetect = (id: string) => {
    const time = nowText()
    updateOrders([id], (o) => ({ status: 'testing', tester: CURRENT_STAFF, records: { ...o.records, 开始检测: time } }))
    setPending(undefined)
    setFlow(undefined)
    setOrderId(id)
    showToast('已开始检测，订单状态变更为检测中')
  }

  const confirmResample = (id: string) => {
    const time = nowText()
    updateOrders([id], (o) => ({
      resample: {
        state: 'pending',
        reason: resampleReason,
        at: time,
        operator: CURRENT_STAFF,
        snapshot: { status: o.status, sampleCode: o.sampleCode, tracking: o.tracking, records: o.records, tester: o.tester },
      },
    }))
    setResampleId(undefined)
    showToast('已通知客户确认是否重新采样')
  }

  const decideResample = (id: string, agree: boolean) => {
    const time = nowText()
    updateOrders([id], (o) => {
      if (!o.resample) return {}
      const resample = { ...o.resample, state: agree ? ('agreed' as const) : ('refunded' as const), decidedAt: time }
      if (!agree) return { status: 'closed', resample }
      const keep = ['用户下单', '支付成功', '订单核销', '寄出采样盒']
      return {
        status: resampleReentry(o),
        resample,
        sampleCode: undefined,
        tracking: undefined,
        tester: undefined,
        records: Object.fromEntries(Object.entries(o.records ?? {}).filter(([k]) => keep.includes(k))),
      }
    })
    showToast(agree ? '客户已同意重采样' : '客户已申请退款，订单已关闭')
  }

  const submitShipping = (ids: string[]) => {
    const time = nowText()
    const tracking = `SF14${Date.now().toString().slice(-10)}`
    updateOrders(ids, (o) => ({ status: 'toReceive', tracking, records: { ...o.records, 预约寄样: time } }))
    setFlow(undefined)
    showToast(`已预约 ${ids.length} 件样本，快递员将尽快上门取件`)
  }

  const metrics: Metric[] = isLab
    ? [
        { label: '待收样', value: byStatus('toReceive').length, unit: '份', status: 'toReceive' },
        { label: '待检测', value: byStatus('toTest').length, unit: '份', status: 'toTest' },
        { label: '检测中', value: byStatus('testing').length, unit: '份', status: 'testing' },
      ]
    : [
        { label: '待核销', value: byStatus('toVerify').length, unit: '单', status: 'toVerify' },
        { label: '待采样', value: byStatus('toSample').length, unit: '例', status: 'toSample' },
        { label: '待寄样', value: byStatus('toShip').length, unit: '份', status: 'toShip' },
      ]

  const toastNode = toast && (
    <div
      role="status"
      className="pointer-events-none absolute inset-x-0 top-[44%] z-40 mx-auto w-fit max-w-[260px] rounded-xl bg-[#2a3a52]/85 px-5 py-3 text-center text-body text-white backdrop-blur"
    >
      {toast}
    </div>
  )

  const callSheet = callOrder && (
    <ActionSheet
      title="联系用户"
      confirmLabel={`呼叫 ${callOrder.phone}`}
      onClose={() => setCallOrder(undefined)}
      onConfirm={() => {
        setCallOrder(undefined)
        showToast(`正在通过隐私号呼叫 ${callOrder.patient}`)
      }}
    >
      <OrderBrief order={callOrder} />
      <dl className="mt-2 border-t border-border pt-2">
        <SheetRow label="受检人" value={callOrder.patient} />
        <SheetRow label="联系电话" value={callOrder.phone} strong />
      </dl>
      <p className="mt-2 text-caption text-faint">为保护用户隐私，将通过平台虚拟号码接通，通话可能被录音。</p>
    </ActionSheet>
  )

  const resampleOrder = resampleId ? findOrder(resampleId) : undefined
  const resampleSheet = resampleOrder && (
    <ActionSheet
      title="发起重采样"
      confirmLabel="确认发起"
      onClose={() => setResampleId(undefined)}
      onConfirm={() => confirmResample(resampleOrder.id)}
    >
      <OrderBrief order={resampleOrder} />
      <dl className="mt-2 border-t border-border pt-2">
        <SheetRow label="受检人" value={`${resampleOrder.patient}  ${resampleOrder.phone}`} />
        <SheetRow label="样本编码" value={resampleOrder.sampleCode ?? '-'} />
        <SheetRow label="采样方式" value={`${sampleModeLabel[resampleOrder.mode]}${resampleOrder.mode === 'onsite' ? ` · ${getSourceLabel(resampleOrder)}` : ''}`} />
        <SheetRow label="当前状态" value={orderStatuses.find((s) => s.key === resampleOrder.status)?.label ?? ''} />
      </dl>
      <p className="mb-2 mt-3 text-note text-muted-foreground">重采样原因</p>
      <ul role="radiogroup" aria-label="重采样原因" className="grid grid-cols-2 gap-2">
        {resampleReasons.map((reason) => {
          const active = resampleReason === reason
          return (
            <li key={reason}>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setResampleReason(reason)}
                className={cn(
                  'flex h-9 w-full items-center justify-center rounded-xl border text-caption font-medium transition-colors',
                  active ? 'border-primary bg-secondary text-primary' : 'border-border text-foreground',
                )}
              >
                {reason}
              </button>
            </li>
          )
        })}
      </ul>
      <p className="mt-3 text-caption leading-5 text-faint">
        确认后将通知客户选择：同意重采样则订单回到{resampleOrder.mode === 'self' ? '「待收货」并重新寄出采样盒' : '「待采样」'}；不同意则全额退款并关闭订单。客户确认前按钮显示「待客户确认」且不可再次操作。
      </p>
    </ActionSheet>
  )

  const shell = (content: React.ReactNode) => (
    <div className="relative flex h-full flex-col bg-background">
      {content}
      {callSheet}
      {resampleSheet}
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
            if (!SAMPLE_CODE_PATTERN.test(code)) return '样本编码格式有��，应为 YW + 10 位数字'
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

  if (flow?.type === 'detect') {
    const target = findOrder(flow.orderId)
    const testable = orderList.filter((o) => o.status === 'toTest' && o.resample?.state !== 'pending' && o.sampleCode)
    const match = (code: string) => orderList.find((o) => o.sampleCode === code)
    const pendingOrder = pending?.type === 'detect' ? findOrder(pending.orderId) : undefined
    return shell(
      <>
        <ScanScreen
          key={pending ? 'paused' : 'live'}
          title="扫码检测"
          tip="请扫描样本管上的样本编码条形码"
          context={target ? `检测订单：${target.patient} · ${target.sampleCode}` : undefined}
          manualLabel="样本编码"
          manualPlaceholder="如 YW2610170045"
          demoCode={target?.sampleCode ?? testable[0]?.sampleCode ?? 'YW2610170045'}
          validate={(code) => {
            if (!SAMPLE_CODE_PATTERN.test(code)) return '样本编码格式有误，应为 YW + 10 位数字'
            const hit = match(code)
            if (!hit) return '未找到该样本编码对应的订单'
            if (target && hit.id !== target.id) return '样本编码与当前订单不一致'
            if (hit.resample?.state === 'pending') return '该订单已发起重采样，等待客户确认'
            if (hit.status !== 'toTest') {
              const label = orderStatuses.find((s) => s.key === hit.status)?.label
              return `该样本当前为「${label}」，仅待检测样本可开始检测`
            }
          }}
          onBack={() => setFlow(undefined)}
          onResult={(code) => {
            const hit = match(code)
            if (hit) setPending({ type: 'detect', code, orderId: hit.id })
          }}
        />
        {pending?.type === 'detect' && pendingOrder && (
          <ActionSheet
            title="确认开始检测"
            confirmLabel="确认检测"
            onClose={() => setPending(undefined)}
            onConfirm={() => confirmDetect(pendingOrder.id)}
          >
            <div className="rounded-xl bg-secondary px-3 py-2.5">
              <p className="text-caption text-muted-foreground">样本编码</p>
              <p className="text-title font-semibold tabular-nums text-primary">{pending.code}</p>
            </div>
            <div className="mt-3">
              <OrderBrief order={pendingOrder} />
            </div>
            <dl className="mt-2 border-t border-border pt-2">
              <SheetRow label="受检人" value={`${pendingOrder.patient}  ${pendingOrder.phone}`} />
              <SheetRow
                label="采样方式"
                value={`${sampleModeLabel[pendingOrder.mode]}${pendingOrder.mode === 'onsite' ? ` · ${getSourceLabel(pendingOrder)}` : ''}`}
              />
              <SheetRow label="检测人员" value={CURRENT_STAFF} />
              <SheetRow label="开始时间" value={nowText()} />
            </dl>
            <p className="mt-2 text-caption text-faint">确认后订单状态由「待检测」变更为「检测中」，并记录检测人员与时间。</p>
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
        role={role}
        onBack={() => setOrderId(undefined)}
        onAction={(label, order) => handleOrderAction(label, order)}
      />,
    )
  }

  if (showActivities) {
    return shell(
      <ActivityListScreen
        items={feed}
        readIds={readIds}
        onBack={() => setShowActivities(false)}
        onOpen={openActivity}
      />,
    )
  }

  if (showSettings) {
    return shell(
      <InstitutionSettingsScreen
        profile={profile}
        onBack={() => setShowSettings(false)}
        onSave={setProfile}
        onLogout={onLogout}
      />,
    )
  }

  return shell(
    <>
      {tab === 'workbench' ? (
        <WorkbenchScreen
          profile={profile}
          metrics={metrics}
          actions={isLab ? labQuickActions : quickActions}
          feed={feed}
          readIds={readIds}
          onOpenOrders={(status) => {
            setOrdersStatus(status)
            setOrdersKey((k) => k + 1)
            setTab('orders')
          }}
          onAction={(key, label) => {
            if (key === 'stats') setTab('stats')
            else if (key === 'profile') setShowSettings(true)
            else if (key === 'verify') setFlow({ type: 'verify' })
            else if (key === 'scan') setFlow({ type: 'sample' })
            else if (key === 'ship') setFlow({ type: 'ship' })
            else if (key === 'detect') setFlow({ type: 'detect' })
            else if (key === 'toTest' || key === 'reports') {
              setOrdersStatus(key === 'toTest' ? 'toTest' : 'done')
              setOrdersKey((k) => k + 1)
              setTab('orders')
            }
            else if (key === 'feed') setShowActivities(true)
            else if (key === 'activity') {
              const item = feed.find((a) => a.id === label)
              if (item) openActivity(item)
            }
          }}
        />
      ) : tab === 'orders' ? (
        <OrdersScreen key={ordersKey} orders={orderList} role={role} initialStatus={ordersStatus} onAction={handleOrderAction} />
      ) : (
        <StatsScreen orders={orderList} onOpenOrder={(order) => setOrderId(order.id)} />
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

function TabPlaceholder({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <StatusBar />
      <NavBar title={title} />
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <Image src={icon} alt="" width={72} height={72} className="size-18 object-contain" />
        <p className="text-title font-medium text-foreground">{title}</p>
        <p className="text-note text-muted-foreground">该页面将在后续版本中设计</p>
      </div>
    </div>
  )
}
