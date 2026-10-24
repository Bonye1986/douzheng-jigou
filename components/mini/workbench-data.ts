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
  /** Operation time, `YYYY-MM-DD HH:mm`. */
  time: string
  operator: string
  icon: string
  unread?: boolean
  orderId: string
}

export const WORKBENCH_ACTIVITY_LIMIT = 4

export const activities: ActivityItem[] = [
  {
    id: 'a1',
    orderId: '3',
    title: '订单核销成功',
    desc: '药物基因检测 · 精神类用药 · 受检人 王*',
    time: '2026-10-19 09:45',
    operator: '店员 李晓',
    icon: instIcons.verify,
    unread: true,
  },
  {
    id: 'a2',
    orderId: '4',
    title: '样本已绑定',
    desc: '样本编号 YW2610180088 已完成扫码采样，待寄样',
    time: '2026-10-19 09:20',
    operator: '店员 王芳',
    icon: instIcons.scan,
    unread: true,
  },
  {
    id: 'a3',
    orderId: '5',
    title: '寄样已揽收',
    desc: '顺丰速运 SF1410180062 已上门揽收，预计明日送达实验室',
    time: '2026-10-19 09:12',
    operator: '店员 李晓',
    icon: instIcons.ship,
  },
  {
    id: 'a4',
    orderId: '6',
    title: '样本已到达实验室',
    desc: '受检人 赵* 的样本已签收，进入检测流程',
    time: '2026-10-18 16:40',
    operator: '都正检验实验室',
    icon: instIcons.arrived,
  },
  {
    id: 'a5',
    orderId: '10',
    title: '样本已绑定',
    desc: '样本编号 YW2610180071 已完成扫码采样，待寄样',
    time: '2026-10-18 15:08',
    operator: '店员 王芳',
    icon: instIcons.scan,
  },
  {
    id: 'a6',
    orderId: '7',
    title: '样本开始检测',
    desc: '受检人 周*琳 的样本质检合格，已上机检测',
    time: '2026-10-18 11:30',
    operator: '都正检验实验室',
    icon: instIcons.arrived,
  },
  {
    id: 'a7',
    orderId: '8',
    title: '检测报告已出具',
    desc: '受检人 吴*强 的高血压个体化用药基因检测报告已生成',
    time: '2026-10-18 11:05',
    operator: '都正检验实验室',
    icon: instIcons.report,
  },
  {
    id: 'a8',
    orderId: '5',
    title: '订单核销成功',
    desc: '药物基因检测 · 心脑血管用药 · 受检人 陈*国',
    time: '2026-10-18 11:36',
    operator: '店员 李晓',
    icon: instIcons.verify,
  },
  {
    id: 'a9',
    orderId: '6',
    title: '寄样已揽收',
    desc: '顺丰速运 SF1410170045 已上门揽收',
    time: '2026-10-17 20:05',
    operator: '店员 王芳',
    icon: instIcons.ship,
  },
].sort((a, b) => b.time.localeCompare(a.time))
