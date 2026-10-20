export const instIcons = {
  verify: '/images/icons/inst-verify.png',
  scan: '/images/icons/inst-scan.png',
  ship: '/images/icons/inst-ship.png',
  stats: '/images/icons/inst-stats.png',
  arrived: '/images/icons/inst-arrived.png',
  report: '/images/icons/mine-report.png',
  sample: '/images/icons/mine-tosample.png',
} as const

export type InstitutionProfile = {
  name: string
  /** Logo uploaded by the institution in the admin backend; falls back to the name initial. */
  logo?: string
  type: '诊所' | '药店'
  code: string
  openTime: string
  closeTime: string
  phone: string
  address: string
}

export const institution: InstitutionProfile = {
  name: '仁和堂中西医结合诊所',
  logo: '/images/inst-logo-renhetang.png',
  type: '诊所',
  code: 'JG-430102-0018',
  openTime: '08:00',
  closeTime: '20:00',
  phone: '0731-8862 6621',
  address: '长沙市天心区解放西路 168 号',
}

export const todayMetrics = [
  { label: '今日核销', value: 12, unit: '单', status: 'toVerify' },
  { label: '今日采样', value: 9, unit: '例', status: 'toSample' },
  { label: '待寄样', value: 3, unit: '份', status: 'toShip' },
] as const

export type QuickActionKey = 'verify' | 'scan' | 'ship' | 'stats'

export const quickActions: { key: QuickActionKey; label: string; icon: string }[] = [
  { key: 'verify', label: '订单核销', icon: instIcons.verify },
  { key: 'scan', label: '扫码采样', icon: instIcons.scan },
  { key: 'ship', label: '预约寄样', icon: instIcons.ship },
  { key: 'stats', label: '数据统计', icon: instIcons.stats },
]

export type ActivityItem = {
  id: string
  title: string
  desc: string
  time: string
  icon: string
  unread?: boolean
  orderId: string
}

export const activities: ActivityItem[] = [
  {
    id: 'a1',
    orderId: '3',
    title: '订单核销成功',
    desc: '药物基因检测套餐 · 订单 DZ20261019088 · 受检人 李**',
    time: '10 分钟前',
    icon: instIcons.verify,
    unread: true,
  },
  {
    id: 'a2',
    orderId: '4',
    title: '样本已绑定',
    desc: '样本编号 YB2610190231 已完成扫码采样，待寄送',
    time: '32 分钟前',
    icon: instIcons.scan,
    unread: true,
  },
  {
    id: 'a3',
    orderId: '5',
    title: '寄样已揽收',
    desc: '顺丰 SF1402****8817 · 共 6 份样本，预计明日送达实验室',
    time: '今天 09:12',
    icon: instIcons.ship,
  },
  {
    id: 'a4',
    orderId: '6',
    title: '样本已到达实验室',
    desc: '10 月 17 日寄出的 8 份样本已签收，进入检测流程',
    time: '昨天 16:40',
    icon: instIcons.arrived,
  },
  {
    id: 'a5',
    orderId: '8',
    title: '检测报告已出具',
    desc: '受检人 张** 的心血管用药基因检测报告已生成',
    time: '昨天 11:05',
    icon: instIcons.report,
  },
]
