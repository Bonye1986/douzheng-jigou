'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { statusesForMode, type OrderStatus, type SampleMode } from './orders-data'

export type ModeKey = 'all' | SampleMode
export type StatusKey = 'all' | OrderStatus

const modeOptions: { key: ModeKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'self', label: '自采样' },
  { key: 'onsite', label: '定点采样' },
]

export function OrderFilterSheet({
  mode,
  status,
  onApply,
  onClose,
}: {
  mode: ModeKey
  status: StatusKey
  onApply: (mode: ModeKey, status: StatusKey) => void
  onClose: () => void
}) {
  const [draftMode, setDraftMode] = useState<ModeKey>(mode)
  const [draftStatus, setDraftStatus] = useState<StatusKey>(status)
  const statusOptions: { key: StatusKey; label: string }[] = [{ key: 'all', label: '全部' }, ...statusesForMode(draftMode)]

  const pickMode = (next: ModeKey) => {
    setDraftMode(next)
    if (draftStatus !== 'all' && !statusesForMode(next).some((s) => s.key === draftStatus)) setDraftStatus('all')
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end">
      <button type="button" aria-label="关闭筛选" onClick={onClose} className="absolute inset-0 bg-black/45" />
      <section role="dialog" aria-modal="true" aria-label="筛选订单" className="relative flex max-h-[80%] flex-col rounded-t-3xl bg-white">
        <header className="relative flex h-14 shrink-0 items-center justify-center">
          <h2 className="text-title font-semibold text-foreground">筛选</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="absolute right-3 flex size-9 items-center justify-center text-faint"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pb-2 [scrollbar-width:none]">
          <OptionGroup label="采样方式" options={modeOptions} value={draftMode} onChange={pickMode} />
          <OptionGroup label="订单状态" options={statusOptions} value={draftStatus} onChange={setDraftStatus} />
        </div>
        <footer className="flex shrink-0 gap-3 px-4 pb-8 pt-3">
          <button
            type="button"
            onClick={() => {
              setDraftMode('all')
              setDraftStatus('all')
            }}
            className="h-11 flex-1 rounded-full border border-[#dfe6f0] bg-white text-body font-medium text-foreground transition-transform active:scale-[0.98]"
          >
            重置
          </button>
          <button
            type="button"
            onClick={() => onApply(draftMode, draftStatus)}
            className="h-11 flex-[2] rounded-full bg-brand text-body font-medium text-white shadow-brand transition-transform active:scale-[0.98]"
          >
            确定
          </button>
        </footer>
      </section>
    </div>
  )
}

function OptionGroup<K extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { key: K; label: string }[]
  value: K
  onChange: (key: K) => void
}) {
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="mb-2.5 text-body font-semibold text-foreground">{label}</legend>
      <div role="radiogroup" aria-label={label} className="grid grid-cols-3 gap-2">
        {options.map((option) => {
          const active = option.key === value
          return (
            <button
              key={option.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.key)}
              className={cn(
                'h-9 rounded-lg text-note transition-colors',
                active
                  ? 'bg-secondary font-medium text-primary ring-1 ring-inset ring-primary/40'
                  : 'bg-[#f4f7fb] text-muted-foreground',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
