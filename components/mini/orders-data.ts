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
  unpaid: [{ label: '联系用户' }],
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
