'use client'

import { useState, type ReactNode } from 'react'
import { Check, MapPin, Package, Phone, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NavBar, StatusBar } from './phone-frame'
import type { Order } from './orders-data'
import type { InstitutionProfile } from './workbench-data'

export const pickupSlots = ['今天 14:00-16:00', '今天 16:00-18:00', '明天 09:00-11:00', '明天 14:00-16:00']

export function ShipBookingScreen({
  orders,
  profile,
  initialSelected,
  onBack,
  onSubmit,
}: {
  orders: Order[]
  profile: InstitutionProfile
  initialSelected?: string[]
  onBack: () => void
  onSubmit: (orderIds: string[], slot: string) => void
}) {
  const [selected, setSelected] = useState<string[]>(initialSelected ?? orders.map((o) => o.id))
  const [slot, setSlot] = useState(pickupSlots[0])
  const allSelected = orders.length > 0 && selected.length === orders.length

  const toggle = (id: string) =>
    setSelected((current) => (current.includes(id) ? current.filter((v) => v !== id) : [...current, id]))

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="shrink-0 bg-white">
        <StatusBar />
        <NavBar title="预约寄样" showBack onBack={onBack} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3 [scrollbar-width:none] *:shrink-0">
        <section className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-[#5fa2f0] p-4 text-white">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <Truck className="size-5" aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-col">
            <p className="text-body font-semibold">顺丰速运 · 医学样本专线</p>
            <p className="text-caption text-white/85">快递员上门取件，多个样本可合并一单寄送</p>
          </div>
        </section>

        <Card title="取件信息">
          <ul className="flex flex-col gap-2.5">
            <InfoLine icon={<MapPin className="size-4" aria-hidden="true" />}>{profile.address}</InfoLine>
            <InfoLine icon={<Phone className="size-4" aria-hidden="true" />}>
              {profile.name} · <span className="tabular-nums">{profile.phone}</span>
            </InfoLine>
          </ul>
        </Card>

        <Card title="期望取件时间">
          <div role="radiogroup" aria-label="期望取件时间" className="grid grid-cols-2 gap-2">
            {pickupSlots.map((value) => {
              const active = slot === value
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSlot(value)}
                  className={cn(
                    'h-10 rounded-xl border text-note tabular-nums transition-colors',
                    active ? 'border-primary bg-secondary font-medium text-primary' : 'border-border text-foreground',
                  )}
                >
                  {value}
                </button>
              )
            })}
          </div>
        </Card>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-body font-semibold text-foreground">
              寄送样本 <span className="text-note font-normal text-muted-foreground">（{orders.length} 件待寄）</span>
            </h3>
            {orders.length > 0 && (
              <button
                type="button"
                onClick={() => setSelected(allSelected ? [] : orders.map((o) => o.id))}
                className="text-note text-primary"
              >
                {allSelected ? '取消全选' : '全选'}
              </button>
            )}
          </div>
          {orders.length === 0 ? (
            <p className="py-8 text-center text-note text-faint">暂无待寄样的样本</p>
          ) : (
            <ul className="flex flex-col">
              {orders.map((order) => {
                const checked = selected.includes(order.id)
                return (
                  <li key={order.id} className="border-t border-border first:border-t-0">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      onClick={() => toggle(order.id)}
                      className="flex w-full items-center gap-3 py-3 text-left"
                    >
                      <span
                        className={cn(
                          'flex size-5 shrink-0 items-center justify-center rounded-full border',
                          checked ? 'border-primary bg-primary text-white' : 'border-[#c9d3e0]',
                        )}
                      >
                        {checked && <Check className="size-3" strokeWidth={3} aria-hidden="true" />}
                      </span>
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                        <Package className="size-4" aria-hidden="true" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-note font-medium tabular-nums text-foreground">
                          {order.sampleCode}
                        </span>
                        <span className="truncate text-caption text-muted-foreground">
                          {order.patient} · {order.product}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <p className="px-1 text-caption text-faint">请将样本放入专用运输袋并密封，快递员取件时核对样本数量。</p>
      </div>

      <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-white px-4 pb-7 pt-2.5">
        <p className="text-note text-muted-foreground">
          已选 <span className="text-title font-semibold tabular-nums text-primary">{selected.length}</span> 件
        </p>
        <button
          type="button"
          disabled={selected.length === 0}
          onClick={() => onSubmit(selected, slot)}
          className={cn(
            'h-10 min-w-32 rounded-full px-5 text-body font-medium text-white transition-transform active:scale-95',
            selected.length === 0
              ? 'bg-[#c3d4ea]'
              : 'bg-gradient-to-r from-primary to-[#5fa2f0] shadow-[0_4px_12px_#3a82e440]',
          )}
        >
          {selected.length > 1 ? `批量预约（${selected.length}）` : '立即预约'}
        </button>
      </footer>
    </div>
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

function InfoLine({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-note text-foreground">
      <span className="mt-0.5 shrink-0 text-faint">{icon}</span>
      <span className="min-w-0">{children}</span>
    </li>
  )
}
