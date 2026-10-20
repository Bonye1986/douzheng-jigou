import Image from 'next/image'
import { cn } from '@/lib/utils'

export function BrandMark({ size = 'md', className }: { size?: 'md' | 'lg'; className?: string }) {
  return (
    <div aria-hidden="true" className={cn('relative shrink-0', size === 'lg' ? 'size-16' : 'size-11', className)}>
      <Image src="/images/drugene-icon.png" alt="" fill sizes="64px" className="object-contain" />
    </div>
  )
}

export function BrandLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/images/drugene-logo.png"
      alt="DRUGENE 临床精准用药助手"
      width={436}
      height={147}
      priority
      className={cn('h-auto w-[164px]', className)}
    />
  )
}
