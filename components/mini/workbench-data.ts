import { ChartColumn, FileCheck, Megaphone, PackageCheck, ScanLine, TicketCheck, Truck, type LucideIcon } from 'lucide-react'

export type InstitutionProfile = {
  name: string
  type: '诊所' | '药店'
  code: string
  openTime: string
  closeTime: string
  phone: string
  address: string
}

export const institution: InstitutionProfile = {
  name: '仁和堂中西医结合诊所',
  type: '诊所',
  code: 'JG-430102-0018',
  openTime: '08:00',
  closeTime: '20:00',
  phone: '0731-8862 6621',
  address: '长沙市天心区解放西路 168 号',
}

export const todayMetrics = [
  { label: '今日核销', value: 12, unit: '单' },
  { label: '今日采样', value: 9, unit: '例' },
  { label: '待寄样', value: 3, unit: '份' },
]

export type QuickActionKey = 'verify' | 'scan' | 'ship' | 'stats'

export const quickActions: { key: QuickActionKey; label: string; icon: LucideIcon; tone: string }[] = [
  { key: 'verify', label: '订单核销', icon: TicketCheck, tone: 'bg-secondary text-primary' },
  { key: 'scan', label: '扫码采样', icon: ScanLine, tone: 'bg-[#e6f6f8] text-accent' },
  { key: 'ship', label: '预约寄样', icon: Truck, tone: 'bg-warning-soft text-warning' },
  { key: 'stats', label: '数据统计', icon: ChartColumn, tone: 'bg-success-soft text-success' },
]

export type ActivityItem = {
  id: string
  title: string
  desc: string
  time: string
  icon: LucideIcon
  tone: string
  unread?: boolean
}

export const activities: ActivityItem[] = [
  {
    id: 'a1',
    title: '订单核销成功',
    desc: '药物基因检测套餐 · 订单 DZ20261019088 · 受检人 李**',
    time: '10 分钟前',
    icon: TicketCheck,
    tone: 'bg-secondary text-primary',
    unread: true,
  },
  {
    id: 'a2',
    title: '样本已绑定',
    desc: '样本编号 YB2610190231 已完成扫码采样，待寄送',
    time: '32 分钟前',
    icon: ScanLine,
    tone: 'bg-[#e6f6f8] text-accent',
    unread: true,
  },
  {
    id: 'a3',
    title: '寄样已揽收',
    desc: '顺丰 SF1402****8817 · 共 6 份样本，预计明日送达实验室',
    time: '今天 09:12',
    icon: Truck,
    tone: 'bg-warning-soft text-warning',
  },
  {
    id: 'a4',
    title: '样本已到达实验室',
    desc: '10 月 17 日寄出的 8 份样本已签收，进入检测流程',
    time: '昨天 16:40',
    icon: PackageCheck,
    tone: 'bg-success-soft text-success',
  },
  {
    id: 'a5',
    title: '检测报告已出具',
    desc: '受检人 张** 的心血管用药基因检测报告已生成',
    time: '昨天 11:05',
    icon: FileCheck,
    tone: 'bg-secondary text-primary',
  },
  {
    id: 'a6',
    title: '平台公告',
    desc: '国庆后样本寄送时效调整说明，请合作机构留意',
    time: '10-15',
    icon: Megaphone,
    tone: 'bg-destructive-soft text-destructive',
  },
]
