import { ChartColumn, ClipboardList, LayoutGrid, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export const institutionTabs = [
  { key: 'workbench', label: '工作台', icon: LayoutGrid },
  { key: 'orders', label: '订单管理', icon: ClipboardList },
  { key: 'stats', label: '数据统计', icon: ChartColumn },
] as const satisfies readonly { key: string; label: string; icon: LucideIcon }[]

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
        {institutionTabs.map(({ key, label, icon: Icon }) => {
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
                <Icon className="size-6" strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
