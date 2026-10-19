'use client'

import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ActionSheet({
  title,
  children,
  confirmLabel,
  confirmDisabled,
  onConfirm,
  onClose,
}: {
  title: string
  children: ReactNode
  confirmLabel: string
  confirmDisabled?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end">
      <button type="button" aria-label="关闭" onClick={onClose} className="absolute inset-0 bg-black/45" />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[80%] flex-col rounded-t-3xl bg-white"
      >
        <header className="relative flex h-14 shrink-0 items-center justify-center">
          <h2 className="text-title font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="absolute right-3 flex size-9 items-center justify-center text-faint"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 [scrollbar-width:none]">{children}</div>
        <footer className="shrink-0 px-4 pb-8 pt-3">
          <button
            type="button"
            disabled={confirmDisabled}
            onClick={onConfirm}
            className={cn(
              'h-11 w-full rounded-full text-body font-medium text-white transition-transform active:scale-[0.98]',
              confirmDisabled
                ? 'bg-[#c3d4ea]'
                : 'bg-gradient-to-r from-primary to-[#5fa2f0] shadow-[0_4px_12px_#3a82e440]',
            )}
          >
            {confirmLabel}
          </button>
        </footer>
      </section>
    </div>
  )
}

export function SheetRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <dt className="shrink-0 text-note text-muted-foreground">{label}</dt>
      <dd className={cn('min-w-0 truncate text-right text-note tabular-nums', strong ? 'font-semibold text-primary' : 'text-foreground')}>
        {value}
      </dd>
    </div>
  )
}
