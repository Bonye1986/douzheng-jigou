import Image from 'next/image'
import { cn } from '@/lib/utils'

export const institutionTabs = [
  { key: 'workbench', label: '工作台', icon: '/images/icons/inst-workbench.png' },
  { key: 'orders', label: '订单管理', icon: '/images/icons/inst-orders.png' },
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
    <nav
      aria-label="底部导航"
      className="shrink-0 bg-white/95 pb-5 shadow-[0_-1px_0_#e9eef5,0_-8px_20px_-12px_rgb(36_64_110/0.12)] backdrop-blur"
    >
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
                  'flex w-full flex-col items-center gap-1 text-tag transition-colors',
                  isActive ? 'font-semibold text-primary' : 'text-muted-foreground',
                )}
              >
                <Image
                  src={icon}
                  alt=""
                  width={52}
                  height={52}
                  className={cn(
                    'size-[26px] object-contain transition',
                    isActive ? 'scale-105 drop-shadow-[0_2px_3px_rgb(58_130_228/0.25)]' : 'opacity-40 grayscale',
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
