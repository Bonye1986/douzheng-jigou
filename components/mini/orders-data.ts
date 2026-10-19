export type OrderStatus =
  | 'unpaid'
  | 'toVerify'
  | 'toSample'
  | 'toShip'
  | 'toReceive'
  | 'toTest'
  | 'testing'
  | 'done'
  | 'closed'

export type StatusTone = 'warning' | 'primary' | 'success' | 'muted'

export const orderStatuses: { key: OrderStatus; label: string; tone: StatusTone; hint: string }[] = [
  { key: 'unpaid', label: '待付款', tone: 'warning', hint: '用户尚未完成支付，超时 30 分钟自动关闭' },
  { key: 'toVerify', label: '待核销', tone: 'warning', hint: '用户到店后出示核销码，核销后进入采样' },
  { key: 'toSample', label: '待采样', tone: 'primary', hint: '请扫描采样管条码，完成口腔拭子采样' },
  { key: 'toShip', label: '待寄样', tone: 'primary', hint: '样本已采集，请预约快递上门取件' },
  { key: 'toReceive', label: '待收样', tone: 'primary', hint: '样本运输中，实验室签收后进入检测' },
  { key: 'toTest', label: '待检测', tone: 'primary', hint: '实验室已签收样本，等待上机检测' },
  { key: 'testing', label: '检测中', tone: 'primary', hint: '样本检测中，预计 5-7 个工作日出具报告' },
  { key: 'done', label: '已完成', tone: 'success', hint: '检测报告已出具' },
  { key: 'closed', label: '已关闭', tone: 'muted', hint: '订单已取消或超时关闭' },
]

export type OrderAction = { label: string; primary?: boolean }

export const statusActions: Record<OrderStatus, OrderAction[]> = {
  unpaid: [],
  toVerify: [{ label: '联系用户' }, { label: '核销订单', primary: true }],
  toSample: [{ label: '扫码采样', primary: true }],
  toShip: [{ label: '预约寄样', primary: true }],
  toReceive: [{ label: '查看物流' }],
  toTest: [{ label: '查看进度' }],
  testing: [{ label: '查看进度' }],
  done: [{ label: '查看报告', primary: true }],
  closed: [],
}

export type Order = {
  id: string
  no: string
  status: OrderStatus
  product: string
  spec: string
  patient: string
  phone: string
  time: string
  amount: number
  sampleCode?: string
}

export const orders: Order[] = [
  {
    id: '1',
    no: 'DZ202610190031',
    status: 'unpaid',
    product: '药物基因检测 · 心脑血管用药',
    spec: '覆盖 32 种常用药物',
    patient: '刘*芳',
    phone: '139****2086',
    time: '10-19 10:42',
    amount: 699,
  },
  {
    id: '2',
    no: 'DZ202610190027',
    status: 'toVerify',
    product: '高血压个体化用药基因检测',
    spec: '覆盖 5 大类降压药',
    patient: '张*华',
    phone: '138****6621',
    time: '10-19 09:58',
    amount: 499,
  },
  {
    id: '3',
    no: 'DZ202610190019',
    status: 'toSample',
    product: '药物基因检测 · 精神类用药',
    spec: '覆盖 46 种常用药物',
    patient: '王*',
    phone: '186****3390',
    time: '10-19 09:15',
    amount: 899,
  },
  {
    id: '4',
    no: 'DZ202610180088',
    status: 'toShip',
    product: '叶酸代谢能力基因检测',
    spec: 'MTHFR / MTRR 位点',
    patient: '李*敏',
    phone: '135****7712',
    time: '10-18 16:20',
    amount: 299,
    sampleCode: 'YW2610180088',
  },
  {
    id: '5',
    no: 'DZ202610180062',
    status: 'toReceive',
    product: '药物基因检测 · 心脑血管用药',
    spec: '覆盖 32 种常用药物',
    patient: '陈*国',
    phone: '137****0458',
    time: '10-18 11:06',
    amount: 699,
    sampleCode: 'YW2610180062',
  },
  {
    id: '6',
    no: 'DZ202610170045',
    status: 'toTest',
    product: '糖尿病个体化用药基因检测',
    spec: '覆盖 4 大类降糖药',
    patient: '赵*',
    phone: '150****2231',
    time: '10-17 15:32',
    amount: 499,
    sampleCode: 'YW2610170045',
  },
  {
    id: '7',
    no: 'DZ202610160021',
    status: 'testing',
    product: '药物基因检测 · 精神类用药',
    spec: '覆盖 46 种常用药物',
    patient: '周*琳',
    phone: '188****5067',
    time: '10-16 10:18',
    amount: 899,
    sampleCode: 'YW2610160021',
  },
  {
    id: '8',
    no: 'DZ202610120013',
    status: 'done',
    product: '高血压个体化用药基因检测',
    spec: '覆盖 5 大类降压药',
    patient: '吴*强',
    phone: '133****8820',
    time: '10-12 14:47',
    amount: 499,
    sampleCode: 'YW2610120013',
  },
  {
    id: '9',
    no: 'DZ202610110009',
    status: 'closed',
    product: '叶酸代谢能力基因检测',
    spec: 'MTHFR / MTRR 位点',
    patient: '孙*',
    phone: '159****4416',
    time: '10-11 09:03',
    amount: 299,
  },
]

export function getOrder(id: string) {
  return orders.find((order) => order.id === id) ?? orders[0]
}

const flowIndex: Record<OrderStatus, number> = {
  unpaid: 0,
  toVerify: 1,
  toSample: 2,
  toShip: 3,
  toReceive: 4,
  toTest: 5,
  testing: 6,
  done: 7,
  closed: -1,
}

export const progressSteps = ['付款', '核销', '采样', '寄样', '收样', '检测', '报告']

export function getProgressIndex(status: OrderStatus) {
  if (status === 'testing') return 5
  return flowIndex[status]
}

export const patientProfiles: Record<string, { gender: '男' | '女'; age: number }> = {
  '1': { gender: '女', age: 58 },
  '2': { gender: '男', age: 63 },
  '3': { gender: '男', age: 34 },
  '4': { gender: '女', age: 29 },
  '5': { gender: '男', age: 71 },
  '6': { gender: '男', age: 52 },
  '7': { gender: '女', age: 41 },
  '8': { gender: '男', age: 66 },
  '9': { gender: '女', age: 37 },
}

export type OrderEvent = { title: string; desc: string; time: string }

const eventTemplates: { title: string; offset: number; desc: (order: Order) => string }[] = [
  { title: '用户下单', offset: 0, desc: () => '用户在药问基因小程序提交订单' },
  { title: '支付成功', offset: 3, desc: (o) => `微信支付 ¥${o.amount}` },
  { title: '订单核销', offset: 30, desc: () => '用户到店出示核销码，核销人：店员 李晓' },
  { title: '完成采样', offset: 45, desc: (o) => `口腔拭子采样，样本编号 ${o.sampleCode ?? '-'}` },
  { title: '预约寄样', offset: 285, desc: (o) => `顺丰速运 ${trackingNo(o)}，快递员已上门取件` },
  { title: '实验室签收', offset: 1485, desc: () => '都正生物医学检验实验室已签收样本' },
  { title: '开始检测', offset: 1845, desc: () => '样本质检合格，已上机检测' },
  { title: '报告出具', offset: 7605, desc: () => '检测报告已出具，用户可在小程序查看' },
]

export function trackingNo(order: Order) {
  return `SF14${order.no.slice(-8)}`
}

function parseTime(time: string) {
  const [md, hm] = time.split(' ')
  const [month, day] = md.split('-').map(Number)
  const [hour, minute] = hm.split(':').map(Number)
  return new Date(2026, month - 1, day, hour, minute)
}

const pad = (n: number) => String(n).padStart(2, '0')

export function formatTime(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function timeAt(order: Order, offsetMinutes: number) {
  return formatTime(new Date(parseTime(order.time).getTime() + offsetMinutes * 60_000))
}

export function getOrderEvents(order: Order): OrderEvent[] {
  if (order.status === 'closed') {
    return [
      { title: '订单关闭', desc: '用户超时未支付，系统自动关闭订单', time: timeAt(order, 30) },
      { title: '用户下单', desc: eventTemplates[0].desc(order), time: timeAt(order, 0) },
    ]
  }
  return eventTemplates
    .slice(0, flowIndex[order.status] + 1)
    .map((t) => ({ title: t.title, desc: t.desc(order), time: timeAt(order, t.offset) }))
    .reverse()
}

export function getEventTime(order: Order, title: string) {
  const template = eventTemplates.find((t) => t.title === title)
  const index = eventTemplates.findIndex((t) => t.title === title)
  if (!template || order.status === 'closed' || flowIndex[order.status] < index) return undefined
  return timeAt(order, template.offset)
}

export function getCloseTime(order: Order) {
  return timeAt(order, 30)
}
