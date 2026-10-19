'use client'

import { useState } from 'react'
import { Download, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NavBar, StatusBar } from './phone-frame'
import { getEventTime, patientProfiles, type Order } from './orders-data'

type Level = 'normal' | 'adjust' | 'caution'

const levelMeta: Record<Level, { label: string; className: string }> = {
  normal: { label: '正常使用', className: 'bg-success/10 text-success' },
  adjust: { label: '调整剂量', className: 'bg-[#fff4e5] text-[#d97706]' },
  caution: { label: '谨慎使用', className: 'bg-destructive/10 text-destructive' },
}

const genes = [
  { gene: 'CYP2C19', genotype: '*1/*2', phenotype: '中间代谢型' },
  { gene: 'CYP2C9', genotype: '*1/*1', phenotype: '正常代谢型' },
  { gene: 'VKORC1', genotype: '-1639 AA', phenotype: '敏感型' },
  { gene: 'SLCO1B1', genotype: '*1a/*1b', phenotype: '正常功能' },
  { gene: 'CYP3A5', genotype: '*3/*3', phenotype: '慢代谢型' },
  { gene: 'ADRB1', genotype: 'Arg/Arg', phenotype: '敏感型' },
]

const drugs: { name: string; category: string; level: Level; advice: string }[] = [
  { name: '氯吡格雷', category: '抗血小板', level: 'caution', advice: 'CYP2C19 活性降低，药效可能减弱，建议考虑替格瑞洛等替代药物' },
  { name: '华法林', category: '抗凝', level: 'adjust', advice: 'VKORC1 敏感型，建议降低起始剂量并密切监测 INR' },
  { name: '美托洛尔', category: 'β 受体阻滞剂', level: 'normal', advice: 'ADRB1 敏感型，常规剂量即可获得较好疗效' },
  { name: '阿托伐他汀', category: '调脂', level: 'normal', advice: 'SLCO1B1 功能正常，肌病风险未见升高' },
  { name: '瑞舒伐他汀', category: '调脂', level: 'normal', advice: '按常规剂量使用' },
  { name: '硝苯地平', category: '钙通道阻滞剂', level: 'normal', advice: 'CYP3A5 慢代谢型，按常规剂量使用即可' },
  { name: '氯沙坦', category: '降压', level: 'normal', advice: 'CYP2C9 正常代谢，按常规剂量使用' },
  { name: '他克莫司', category: '免疫抑制', level: 'adjust', advice: 'CYP3A5 慢代谢型，血药浓度偏高，建议降低剂量' },
]

const filters: { key: 'all' | Level; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'caution', label: '谨慎使用' },
  { key: 'adjust', label: '调整剂量' },
  { key: 'normal', label: '正常使用' },
]

export function ReportScreen({
  order,
  onBack,
  onDownload,
}: {
  order: Order
  onBack: () => void
  onDownload: () => void
}) {
  const [filter, setFilter] = useState<'all' | Level>('all')
  const profile = patientProfiles[order.id]
  const issuedAt = getEventTime(order, '报告出具') ?? '-'
  const counts = drugs.reduce<Record<Level, number>>(
    (acc, d) => ({ ...acc, [d.level]: acc[d.level] + 1 }),
    { normal: 0, adjust: 0, caution: 0 },
  )
  const visible = filter === 'all' ? drugs : drugs.filter((d) => d.level === filter)

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="shrink-0 bg-white">
        <StatusBar />
        <NavBar title="检测报告" showBack onBack={onBack} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3 [scrollbar-width:none] *:shrink-0">
        <section className="rounded-2xl bg-gradient-to-br from-primary to-[#5fa2f0] p-4 text-white">
          <p className="text-caption text-white/80">{order.product}</p>
          <h2 className="mt-1 text-headline font-bold">药物基因检测报告</h2>
          <p className="mt-1 text-caption tabular-nums text-white/85">出具时间 {issuedAt}</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(['caution', 'adjust', 'normal'] as Level[]).map((level) => (
              <div key={level} className="flex flex-col items-center rounded-xl bg-white/15 py-2">
                <span className="text-headline font-bold tabular-nums">{counts[level]}</span>
                <span className="text-caption text-white/85">{levelMeta[level].label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-body font-semibold text-foreground">受检者信息</h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            <Info label="姓名" value={order.patient} />
            <Info label="性别 / 年龄" value={profile ? `${profile.gender} / ${profile.age} 岁` : '-'} />
            <Info label="样本编号" value={order.sampleCode ?? '-'} />
            <Info label="样本类型" value="口腔拭子" />
            <Info label="采样时间" value={getEventTime(order, '完成采样')?.slice(0, 10) ?? '-'} />
            <Info label="检测方法" value="荧光 PCR 法" />
          </dl>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-body font-semibold text-foreground">基因检测结果</h3>
          <table className="w-full text-note">
            <thead>
              <tr className="text-caption text-muted-foreground">
                <th scope="col" className="pb-2 text-left font-normal">基因</th>
                <th scope="col" className="pb-2 text-left font-normal">基因型</th>
                <th scope="col" className="pb-2 text-right font-normal">表型</th>
              </tr>
            </thead>
            <tbody>
              {genes.map((g) => (
                <tr key={g.gene} className="border-t border-border">
                  <th scope="row" className="py-2 text-left font-medium text-foreground">{g.gene}</th>
                  <td className="py-2 tabular-nums text-muted-foreground">{g.genotype}</td>
                  <td className="py-2 text-right text-foreground">{g.phenotype}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-body font-semibold text-foreground">用药建议</h3>
          <div role="tablist" aria-label="按建议筛选" className="mb-2 flex gap-2 overflow-x-auto [scrollbar-width:none]">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1 text-caption',
                  filter === f.key ? 'bg-primary text-white' : 'bg-muted text-muted-foreground',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <ul className="flex flex-col">
            {visible.map((d) => (
              <li key={d.name} className="flex flex-col gap-1 border-t border-border py-3 first:border-t-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-body font-medium text-foreground">
                    {d.name}
                    <span className="ml-2 text-caption font-normal text-faint">{d.category}</span>
                  </p>
                  <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-caption', levelMeta[d.level].className)}>
                    {levelMeta[d.level].label}
                  </span>
                </div>
                <p className="text-caption leading-relaxed text-muted-foreground">{d.advice}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex gap-2 rounded-2xl bg-white p-4 shadow-sm">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-faint" aria-hidden="true" />
          <p className="text-caption leading-relaxed text-faint">
            本报告由都正生物医学检验实验室出具，仅对本次送检样本负责。检测结果仅供临床医生参考，用药调整请遵医嘱。
          </p>
        </section>
      </div>

      <footer className="flex shrink-0 items-center gap-2.5 border-t border-border bg-white px-4 pb-7 pt-2.5">
        <button
          type="button"
          onClick={onDownload}
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-[#5fa2f0] text-body font-medium text-white shadow-[0_4px_12px_#3a82e440] transition-transform active:scale-95"
        >
          <Download className="size-4" aria-hidden="true" />
          下载 PDF 报告
        </button>
      </footer>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col">
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd className="truncate text-note tabular-nums text-foreground">{value}</dd>
    </div>
  )
}
