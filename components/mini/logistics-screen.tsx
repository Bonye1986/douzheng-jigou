'use client'

import { Building2, Copy, MapPin, Phone, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NavBar, StatusBar } from './phone-frame'
import { getEventTime, trackingNo, type Order } from './orders-data'
import type { InstitutionProfile } from './workbench-data'

const LAB_NAME = '都正生物医学检验实验室'
const LAB_ADDRESS = '湖南省长沙市岳麓区麓谷大道 627 号 · 样本接收中心'
const COURIER = { name: '张师傅', mobile: '15211098826', phone: '152****8826' }

type Track = { status: string; desc: string; time: string }

const pad = (n: number) => String(n).padStart(2, '0')

function shift(base: string, minutes: number) {
  const date = new Date(base.replace(' ', 'T'))
  date.setMinutes(date.getMinutes() + minutes)
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function buildTracks(order: Order, profile: InstitutionProfile): Track[] {
  const booked = getEventTime(order, '预约寄样') ?? order.time
  const justBooked = Boolean(order.records?.预约寄样)
  const steps: (Track & { offset: number })[] = [
    { offset: 0, status: '已下单', desc: `已预约上门取件，等待快递员揽收（${profile.address}）`, time: '' },
    {
      offset: 42,
      status: '已揽收',
      desc: `快递员 ${COURIER.name} 已揽收，医学样本冷链专用箱封装`,
      time: '',
    },
    { offset: 95, status: '运输中', desc: '快件已到达【长沙岳麓营业部】，准备发往【长沙转运中心】', time: '' },
    { offset: 180, status: '运输中', desc: '快件已到达【长沙转运中心】，正在分拣', time: '' },
    { offset: 260, status: '派送中', desc: `快件已从【长沙转运中心】发出，正在派送至${LAB_NAME}`, time: '' },
  ]
  return (justBooked ? steps.slice(0, 1) : steps)
    .map(({ offset, ...track }) => ({ ...track, time: shift(booked, offset) }))
    .reverse()
}

export function LogisticsScreen({
  order,
  profile,
  onBack,
  onCopy,
}: {
  order: Order
  profile: InstitutionProfile
  onBack: () => void
  onCopy: () => void
}) {
  const tracks = buildTracks(order, profile)
  const latest = tracks[0]

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="shrink-0 bg-white">
        <StatusBar />
        <NavBar title="物流详情" showBack onBack={onBack} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3 [scrollbar-width:none] *:shrink-0">
        <section className="flex flex-col gap-3 rounded-2xl bg-gradient-to-r from-primary to-[#5fa2f0] p-4 text-white">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Truck className="size-5" aria-hidden="true" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="text-title font-semibold">{latest.status}</p>
              <p className="text-caption text-white/85">预计今日送达实验室</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/15 px-3 py-2">
            <p className="text-note">
              顺丰速运 <span className="tabular-nums">{trackingNo(order)}</span>
            </p>
            <button
              type="button"
              onClick={onCopy}
              className="flex items-center gap-1 text-caption text-white/90"
              aria-label="复制运单号"
            >
              <Copy className="size-3.5" aria-hidden="true" />
              复制
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <Endpoint
            icon={<MapPin className="size-4" aria-hidden="true" />}
            tag="寄"
            title={profile.name}
            desc={profile.address}
          />
          <Endpoint
            icon={<Building2 className="size-4" aria-hidden="true" />}
            tag="收"
            title={LAB_NAME}
            desc={LAB_ADDRESS}
          />
          <div className="flex items-center justify-between border-t border-border pt-3">
            <p className="text-note text-muted-foreground">
              快递员 {COURIER.name} <span className="tabular-nums">{COURIER.phone}</span>
            </p>
            <a
              href={`tel:${COURIER.mobile}`}
              className="flex items-center gap-1 rounded-full border border-primary px-3 py-1 text-caption text-primary"
            >
              <Phone className="size-3.5" aria-hidden="true" />
              联系快递员
            </a>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-body font-semibold text-foreground">物流轨迹</h3>
          <ol className="flex flex-col">
            {tracks.map((track, i) => {
              const current = i === 0
              const last = i === tracks.length - 1
              return (
                <li key={`${track.time}-${i}`} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        'mt-1 size-2.5 shrink-0 rounded-full',
                        current ? 'bg-primary ring-4 ring-primary/15' : 'bg-[#c9d3e0]',
                      )}
                    />
                    {!last && <span className="w-px flex-1 bg-border" />}
                  </div>
                  <div className={cn('flex min-w-0 flex-1 flex-col gap-0.5', !last && 'pb-4')}>
                    <p className={cn('text-note font-medium', current ? 'text-primary' : 'text-foreground')}>
                      {track.status}
                    </p>
                    <p className={cn('text-note', current ? 'text-foreground' : 'text-muted-foreground')}>
                      {track.desc}
                    </p>
                    <p className="text-caption tabular-nums text-faint">{track.time}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-body font-semibold text-foreground">寄送样本</h3>
          <div className="flex flex-col gap-0.5">
            <p className="text-note text-foreground">
              {order.patient} · {order.product}
            </p>
            <p className="text-caption tabular-nums text-muted-foreground">样本编号 {order.sampleCode ?? '-'}</p>
          </div>
        </section>
      </div>
    </div>
  )
}

function Endpoint({ icon, tag, title, desc }: { icon: React.ReactNode; tag: string; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-caption font-semibold text-primary">
        {tag}
      </span>
      <div className="flex min-w-0 flex-col">
        <p className="flex items-center gap-1 text-note font-medium text-foreground">
          <span className="text-muted-foreground">{icon}</span>
          {title}
        </p>
        <p className="text-caption text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}
