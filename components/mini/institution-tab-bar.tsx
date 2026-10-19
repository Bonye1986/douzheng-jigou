import Image from 'next/image'
import { cn } from '@/lib/utils'

export const institutionTabs = [
  { key: 'workbench', label: '工作台', icon: '/images/icons/inst-workbench.png' },
  { key: 'orders', label: '订单管理', icon: '/images/icons/sec-orders.png' },
  { key: 'stats', label: '数据统计', icon: '/images/icons/inst-stats.png' },
] as const

export type InstitutionTabKey = (typeof institutionTabs)[number]['key']

export function InstitutionTabBar({
  active,
  onSelect,
}: {
  active: InstitutionTabKey
  onSelect?: (key: InstitutionTabKey) => void
}) {
  return (
    <nav aria-label="底部导航" className="shrink-0 border-t border-border bg-white pb-5">
      <ul className="flex h-[54px] items-center">
        {institutionTabs.map(({ key, label, icon }) => {
          const isActive = key === active
          return (
            <li key={key} className="flex-1">
              <button
                type="button"
                onClick={() => onSelect?.(key)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex w-full flex-col items-center gap-0.5 text-tag transition-colors',
                  isActive ? 'font-medium text-primary' : 'text-muted-foreground',
                )}
              >
                <Image
                  src={icon}
                  alt=""
                  width={24}
                  height={24}
                  className={cn(
                    'size-6 object-contain mix-blend-multiply transition',
                    !isActive && 'opacity-45 grayscale',
                  )}
                />
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
