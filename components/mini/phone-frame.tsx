import { BatteryFull, ChevronLeft, Circle, Ellipsis, Signal, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tone = 'light' | 'dark'

export function PhoneFrame({
  children,
  className,
  label,
}: {
  children: React.ReactNode
  className?: string
  label: string
}) {
  return (
    <div
      role="region"
      aria-label={label}
      className={cn(
        'relative h-[812px] w-[375px] box-content shrink-0 overflow-hidden rounded-[44px] border-[6px] border-[#2a3a52] bg-background shadow-[0_22px_60px_#3a82e42e]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function StatusBar({ tone = 'dark' }: { tone?: Tone }) {
  const color = tone === 'light' ? 'text-white' : 'text-foreground'
  return (
    <div className={cn('flex h-11 items-center justify-between px-6 text-note font-semibold', color)}>
      <span>09:41</span>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <Signal className="size-3.5" />
        <Wifi className="size-3.5" />
        <BatteryFull className="size-4" />
      </div>
    </div>
  )
}

export function Capsule({ tone = 'dark', className }: { tone?: Tone; className?: string }) {
  const isLight = tone === 'light'
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex h-8 items-center gap-3 rounded-full border px-3',
        isLight ? 'border-white/25 bg-white/10 text-white' : 'border-border bg-white/80 text-foreground',
        className,
      )}
    >
      <Ellipsis className="size-4" />
      <span className={cn('h-4 w-px', isLight ? 'bg-white/30' : 'bg-border')} />
      <Circle className="size-3.5" strokeWidth={3} />
    </div>
  )
}

export function NavBar({
  title,
  tone = 'dark',
  showBack = false,
  onBack,
}: {
  title?: string
  tone?: Tone
  showBack?: boolean
  onBack?: () => void
}) {
  const isLight = tone === 'light'
  return (
    <div className={cn('relative flex h-11 items-center justify-center px-4', isLight ? 'text-white' : 'text-foreground')}>
      {showBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="返回"
          className="absolute left-2 flex size-9 items-center justify-center rounded-full"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}
      {title && <h2 className="text-title font-medium">{title}</h2>}
      <div
        aria-hidden="true"
        className={cn(
          'absolute right-3 flex h-8 items-center gap-3 rounded-full border px-3',
          isLight ? 'border-white/25 bg-white/10' : 'border-border bg-white/80',
        )}
      >
        <Ellipsis className="size-4" />
        <span className={cn('h-4 w-px', isLight ? 'bg-white/30' : 'bg-border')} />
        <Circle className="size-3.5" strokeWidth={3} />
      </div>
    </div>
  )
}
