'use client'

import { useRef, useState } from 'react'
import { ChartColumn } from 'lucide-react'
import { InstitutionTabBar, type InstitutionTabKey } from './institution-tab-bar'
import { NavBar, StatusBar } from './phone-frame'
import { WorkbenchScreen } from './workbench-screen'

export function InstitutionApp({ initialTab = 'workbench' }: { initialTab?: InstitutionTabKey }) {
  const [tab, setTab] = useState<InstitutionTabKey>(initialTab)
  const [toast, setToast] = useState('')
  const toastTimer = useRef<number | undefined>(undefined)

  const showToast = (message: string) => {
    window.clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = window.setTimeout(() => setToast(''), 1600)
  }

  return (
    <div className="relative flex h-full flex-col bg-background">
      {tab === 'workbench' ? (
        <WorkbenchScreen
          onAction={(key, label) => {
            if (key === 'stats') {
              setTab('stats')
              return
            }
            showToast(`即将进入「${label}」`)
          }}
        />
      ) : (
        <StatsPlaceholder />
      )}
      <InstitutionTabBar active={tab} onSelect={setTab} />

      {toast && (
        <div
          role="status"
          className="pointer-events-none absolute inset-x-0 top-[44%] z-20 mx-auto w-fit max-w-[260px] rounded-xl bg-[#2a3a52]/80 px-5 py-3 text-center text-body text-white backdrop-blur"
        >
          {toast}
        </div>
      )}
    </div>
  )
}

function StatsPlaceholder() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <StatusBar />
      <NavBar title="数据统计" />
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
          <ChartColumn className="size-7" aria-hidden="true" />
        </span>
        <p className="text-title font-medium text-foreground">数据统计</p>
        <p className="text-note text-muted-foreground">该页面将在后续版本中设计</p>
      </div>
    </div>
  )
}
