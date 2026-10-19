'use client'

import { useRef, useState } from 'react'
import { ChartColumn, type LucideIcon } from 'lucide-react'
import { InstitutionTabBar, type InstitutionTabKey } from './institution-tab-bar'
import { NavBar, StatusBar } from './phone-frame'
import { InstitutionSettingsScreen } from './institution-settings'
import { OrderDetailScreen } from './order-detail-screen'
import { getOrder, type OrderStatus } from './orders-data'
import { OrdersScreen } from './orders-screen'
import { institution, type InstitutionProfile } from './workbench-data'
import { WorkbenchScreen } from './workbench-screen'

const copiedLabels = ['订单号已复制', '样本编号已复制', '运单号已复制']

export function InstitutionApp({
  initialTab = 'workbench',
  initialOrderStatus = 'all',
  initialOrderId,
}: {
  initialTab?: InstitutionTabKey
  initialOrderStatus?: 'all' | OrderStatus
  initialOrderId?: string
}) {
  const [tab, setTab] = useState<InstitutionTabKey>(initialTab)
  const [profile, setProfile] = useState<InstitutionProfile>(institution)
  const [showSettings, setShowSettings] = useState(false)
  const [orderId, setOrderId] = useState<string | undefined>(initialOrderId)
  const [toast, setToast] = useState('')
  const toastTimer = useRef<number | undefined>(undefined)

  const showToast = (message: string) => {
    window.clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = window.setTimeout(() => setToast(''), 1600)
  }

  const handleOrderAction = (label: string) =>
    showToast(copiedLabels.includes(label) ? label : `即将进入「${label}」`)

  const toastNode = toast && (
    <div
      role="status"
      className="pointer-events-none absolute inset-x-0 top-[44%] z-20 mx-auto w-fit max-w-[260px] rounded-xl bg-[#2a3a52]/80 px-5 py-3 text-center text-body text-white backdrop-blur"
    >
      {toast}
    </div>
  )

  if (orderId) {
    return (
      <div className="relative flex h-full flex-col bg-background">
        <OrderDetailScreen
          order={getOrder(orderId)}
          onBack={() => setOrderId(undefined)}
          onAction={handleOrderAction}
        />
        {toastNode}
      </div>
    )
  }

  if (showSettings) {
    return (
      <div className="relative flex h-full flex-col bg-background">
        <InstitutionSettingsScreen
          profile={profile}
          onBack={() => setShowSettings(false)}
          onSave={setProfile}
        />
      </div>
    )
  }

  return (
    <div className="relative flex h-full flex-col bg-background">
      {tab === 'workbench' ? (
        <WorkbenchScreen
          profile={profile}
          onAction={(key, label) => {
            if (key === 'stats') {
              setTab('stats')
              return
            }
            if (key === 'profile') {
              setShowSettings(true)
              return
            }
            showToast(`即将进入「${label}」`)
          }}
        />
      ) : tab === 'orders' ? (
        <OrdersScreen
          initialStatus={initialOrderStatus}
          onAction={(label, order) => {
            if (label === '订单详情' && order) {
              setOrderId(order.id)
              return
            }
            handleOrderAction(label)
          }}
        />
      ) : (
        <TabPlaceholder title="数据统计" icon={ChartColumn} />
      )}
      <InstitutionTabBar active={tab} onSelect={setTab} />
      {toastNode}
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
