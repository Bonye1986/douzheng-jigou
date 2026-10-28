export type OrderStatus =
  | 'unpaid'
  | 'toDeliver'
  | 'toArrive'
  | 'toVerify'
  | 'toSample'
  | 'toShip'
  | 'toReceive'
  | 'toTest'
  | 'testing'
  | 'done'
  | 'closed'

export type StatusTone = 'warning' | 'primary' | 'success' | 'muted'

/** self：用户在家自采样并寄回实验室；onsite：用户到合作机构定点采样。 */
export type SampleMode = 'self' | 'onsite'

const BOTH: SampleMode[] = ['self', 'onsite']

export const orderStatuses: { key: OrderStatus; label: string; tone: StatusTone; hint: string; modes: SampleMode[] }[] = [
  { key: 'unpaid', label: '待付款', tone: 'warning', hint: '用户尚未完成支付，超时 30 分钟自动关闭', modes: BOTH },
  { key: 'toDeliver', label: '待发货', tone: 'warning', hint: '用户已支付自采样订单，平台待寄出采样盒', modes: ['self'] },
  { key: 'toArrive', label: '待收货', tone: 'primary', hint: '采样盒运输中，用户签收后自行采样并寄回实验室', modes: ['self'] },
  { key: 'toVerify', label: '待核销', tone: 'warning', hint: '用户到店后出示核销码，核销后进入采样', modes: ['onsite'] },
  { key: 'toSample', label: '待采样', tone: 'primary', hint: '请扫描采样盒上的样本编码，将样本与订单绑定', modes: ['onsite'] },
  { key: 'toShip', label: '待寄样', tone: 'primary', hint: '样本已采集，请预约物流上门取件，支持批量寄件', modes: ['onsite'] },
  { key: 'toReceive', label: '待收样', tone: 'primary', hint: '样本运输中，实验室签收后进入检测', modes: BOTH },
  { key: 'toTest', label: '待检测', tone: 'primary', hint: '实验室已签收样本，等待上机检测', modes: BOTH },
  { key: 'testing', label: '检测中', tone: 'primary', hint: '样本检测中，报告出具后将通知用户', modes: BOTH },
  { key: 'done', label: '已完成', tone: 'success', hint: '检测报告已出具', modes: BOTH },
  { key: 'closed', label: '已关闭', tone: 'muted', hint: '订单已取消或超时关闭', modes: BOTH },
]

export function statusesForMode(mode: 'all' | SampleMode) {
  return mode === 'all' ? orderStatuses : orderStatuses.filter((s) => s.modes.includes(mode))
}

export type OrderAction = { label: string; primary?: boolean; tel?: boolean; disabled?: boolean }

/** 实验室（平台检测方）或合作机构（诊所 / 药店）。 */
export type InstitutionRole = 'lab' | 'partner'

export const sampleModeLabel: Record<SampleMode, string> = { self: '自采样', onsite: '定点采样' }

export const LAB_NAME = '都正生物医学检验实验室'
export const LAB_CODE = 'SYS-430100-0001'

export const partnerInstitutions = {
  'JG-430102-0018': '仁和堂中西医结合诊所',
  'JG-430104-0032': '康泰大药房（岳麓店）',
} as const

export type ResampleState = 'pending' | 'agreed' | 'refunded'

export const resampleReasons = ['样本量不足', '样本污染', 'DNA 浓度不达标', '检测失败需重新采样'] as const

export type Resample = {
  state: ResampleState
  reason: string
  /** 发起重采样时间 */
  at: string
  /** 客户确认时间 */
  decidedAt?: string
  operator: string
  /** 发起时的订单快照，用于还原此前的订单跟踪 */
  snapshot: Pick<Order, 'status' | 'sampleCode' | 'tracking' | 'records' | 'tester'>
}

/** Partner-facing actions; lab actions are derived in getOrderActions. */
export const statusActions: Record<OrderStatus, OrderAction[]> = {
  unpaid: [],
  toDeliver: [],
  toArrive: [],
  toVerify: [{ label: '联系用户', tel: true }, { label: '核销订单', primary: true }],
  toSample: [{ label: '扫码采样', primary: true }],
  toShip: [{ label: '预约寄样', primary: true }],
  toReceive: [{ label: '查看物流' }],
  toTest: [],
  testing: [],
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
  /** Unmasked number, only used for the tel: link and never rendered. */
  mobile: string
  time: string
  amount: number
  sampleCode?: string
  verifyCode?: string
  verifier?: string
  sampler?: string
  tracking?: string
  tester?: string
  mode: SampleMode
  /** 定点采样订单所属合作机构编号 */
  institutionCode?: string
  resample?: Resample
  records?: Record<string, string>
}

export const labStatusActions: Record<OrderStatus, OrderAction[]> = {
  unpaid: [],
  toDeliver: [],
  toArrive: [{ label: '查看物流' }],
  toVerify: [],
  toSample: [],
  toShip: [],
  toReceive: [{ label: '查看物流' }],
  toTest: [{ label: '重采样' }, { label: '扫码检测', primary: true }],
  testing: [{ label: '重采样' }],
  done: [{ label: '查看报告', primary: true }],
  closed: [],
}

/** 实验室本身也是定点采样网点，可承接用户到实验室采样的订单。 */
export function isLabOwnOrder(order: Order) {
  return order.mode === 'onsite' && order.institutionCode === LAB_CODE
}

const institutionStages: OrderStatus[] = ['toVerify', 'toSample', 'toShip']

export function getOrderActions(order: Order, role: InstitutionRole): OrderAction[] {
  if (order.resample?.state === 'pending') {
    return role === 'lab' ? [{ label: '待客户确认', disabled: true }] : []
  }
  if (role === 'lab' && isLabOwnOrder(order) && institutionStages.includes(order.status)) {
    return statusActions[order.status]
  }
  return (role === 'lab' ? labStatusActions : statusActions)[order.status]
}

export function canSeeOrder(order: Order, role: InstitutionRole, institutionCode?: string) {
  if (role === 'lab') return true
  return order.mode === 'onsite' && order.institutionCode === institutionCode
}

export function getSourceLabel(order: Order) {
  if (order.mode === 'self') return '自采样'
  if (order.institutionCode === LAB_CODE) return '本实验室'
  return partnerInstitutions[order.institutionCode as keyof typeof partnerInstitutions] ?? '合作机构'
}

const productImageRules: [RegExp, string][] = [
  [/心脑血管/, '/images/products/cardio.png'],
  [/精神/, '/images/products/mental.png'],
  [/高血压|糖尿病/, '/images/products/chronic.png'],
]

export function getProductImage(product: string) {
  return productImageRules.find(([rule]) => rule.test(product))?.[1] ?? '/images/products/full.png'
}

export const SAMPLE_CODE_PATTERN = /^YW\d{10}$/

const RHT = 'JG-430102-0018'
const KT = 'JG-430104-0032'

export const orders: Order[] = [
  {
    id: '1',
    mode: 'onsite',
    institutionCode: RHT,
    no: 'DZ202610190031',
    status: 'unpaid',
    product: '药物基因检测 · 心脑血管用药',
    spec: '覆盖 32 种常用药物',
    patient: '刘*芳',
    phone: '139****2086',
    mobile: '13907312086',
    time: '10-19 10:42',
    amount: 699,
  },
  {
    id: '2',
    mode: 'onsite',
    institutionCode: RHT,
    no: 'DZ202610190027',
    status: 'toVerify',
    product: '高血压个体化用药基因检测',
    spec: '覆盖 5 大类降压药',
    patient: '张*华',
    phone: '138****6621',
    mobile: '13873166621',
    time: '10-19 09:58',
    amount: 499,
    verifyCode: '88264310',
  },
  {
    id: '3',
    mode: 'onsite',
    institutionCode: RHT,
    no: 'DZ202610190019',
    status: 'toSample',
    product: '药物基因检测 · 精神类用药',
    spec: '覆盖 46 种常用药物',
    patient: '王*',
    phone: '186****3390',
    mobile: '18673193390',
    time: '10-19 09:15',
    amount: 899,
  },
  {
    id: '4',
    mode: 'onsite',
    institutionCode: RHT,
    no: 'DZ202610180088',
    status: 'toShip',
    product: '叶酸代谢能力基因检测',
    spec: 'MTHFR / MTRR 位点',
    patient: '李*敏',
    phone: '135****7712',
    mobile: '13574147712',
    time: '10-18 16:20',
    amount: 299,
    sampleCode: 'YW2610180088',
  },
  {
    id: '10',
    mode: 'onsite',
    institutionCode: RHT,
    no: 'DZ202610180071',
    status: 'toShip',
    product: '高血压个体化用药基因检测',
    spec: '覆盖 5 大类降压药',
    patient: '黄*平',
    phone: '177****3054',
    mobile: '17707313054',
    time: '10-18 14:36',
    amount: 499,
    sampleCode: 'YW2610180071',
  },
  {
    id: '5',
    mode: 'onsite',
    institutionCode: RHT,
    no: 'DZ202610180062',
    status: 'toReceive',
    product: '药物基因检测 · 心脑血管用药',
    spec: '覆盖 32 种常用药物',
    patient: '陈*国',
    phone: '137****0458',
    mobile: '13787310458',
    time: '10-18 11:06',
    amount: 699,
    sampleCode: 'YW2610180062',
  },
  {
    id: '6',
    mode: 'onsite',
    institutionCode: RHT,
    no: 'DZ202610170045',
    status: 'toTest',
    product: '糖尿病个体化用药基因检测',
    spec: '覆盖 4 大类降糖药',
    patient: '赵*',
    phone: '150****2231',
    mobile: '15084862231',
    time: '10-17 15:32',
    amount: 499,
    sampleCode: 'YW2610170045',
  },
  {
    id: '7',
    mode: 'onsite',
    institutionCode: RHT,
    no: 'DZ202610160021',
    status: 'testing',
    product: '药物基因检测 · 精神类用药',
    spec: '覆盖 46 种常用药物',
    patient: '周*琳',
    phone: '188****5067',
    mobile: '18874015067',
    time: '10-16 10:18',
    amount: 899,
    sampleCode: 'YW2610160021',
  },
  {
    id: '8',
    mode: 'onsite',
    institutionCode: RHT,
    no: 'DZ202610120013',
    status: 'done',
    product: '高血压个体化用药基因检测',
    spec: '覆盖 5 大类降压药',
    patient: '吴*强',
    phone: '133****8820',
    mobile: '13307318820',
    time: '10-12 14:47',
    amount: 499,
    sampleCode: 'YW2610120013',
  },
  {
    id: '9',
    mode: 'onsite',
    institutionCode: RHT,
    no: 'DZ202610110009',
    status: 'closed',
    product: '叶酸代谢能力基因检测',
    spec: 'MTHFR / MTRR 位点',
    patient: '孙*',
    phone: '159****4416',
    mobile: '15973124416',
    time: '10-11 09:03',
    amount: 299,
  },
  {
    id: '11',
    mode: 'onsite',
    institutionCode: KT,
    no: 'DZ202610170052',
    status: 'toTest',
    product: '药物基因检测 · 心脑血管用药',
    spec: '覆盖 32 种常用药物',
    patient: '何*兰',
    phone: '136****1852',
    mobile: '13607311852',
    time: '10-17 10:26',
    amount: 699,
    sampleCode: 'YW2610170052',
  },
  {
    id: '12',
    mode: 'onsite',
    institutionCode: KT,
    no: 'DZ202610150036',
    status: 'testing',
    product: '叶酸代谢能力基因检测',
    spec: 'MTHFR / MTRR 位点',
    patient: '罗*婷',
    phone: '187****6025',
    mobile: '18707316025',
    time: '10-15 14:12',
    amount: 299,
    sampleCode: 'YW2610150036',
    tester: '检验员 陈静',
  },
  {
    id: '19',
    mode: 'self',
    no: 'DZ202610190045',
    status: 'unpaid',
    product: '叶酸代谢能力基因检测',
    spec: 'MTHFR / MTRR 位点',
    patient: '蒋*',
    phone: '173****6612',
    mobile: '17307316612',
    time: '10-19 11:20',
    amount: 299,
  },
  {
    id: '20',
    mode: 'self',
    no: 'DZ202610190038',
    status: 'toDeliver',
    product: '高血压个体化用药基因检测',
    spec: '覆盖 5 大类降压药',
    patient: '夏*红',
    phone: '151****0937',
    mobile: '15107310937',
    time: '10-19 10:05',
    amount: 499,
  },
  {
    id: '21',
    mode: 'self',
    no: 'DZ202610180102',
    status: 'toDeliver',
    product: '药物基因检测 · 心脑血管用药',
    spec: '覆盖 32 种常用药物',
    patient: '易*',
    phone: '189****2264',
    mobile: '18907312264',
    time: '10-18 21:46',
    amount: 699,
  },
  {
    id: '22',
    mode: 'self',
    no: 'DZ202610180057',
    status: 'toArrive',
    product: '药物基因检测 · 精神类用药',
    spec: '覆盖 46 种常用药物',
    patient: '廖*静',
    phone: '134****5180',
    mobile: '13407315180',
    time: '10-18 09:32',
    amount: 899,
  },
  {
    id: '13',
    mode: 'self',
    no: 'DZ202610180093',
    status: 'toReceive',
    product: '药物基因检测 · 精神类用药',
    spec: '覆盖 46 种常用药物',
    patient: '邓*',
    phone: '155****7340',
    mobile: '15573127340',
    time: '10-16 20:41',
    amount: 899,
    sampleCode: 'YW2610180093',
  },
  {
    id: '14',
    mode: 'self',
    no: 'DZ202610160077',
    status: 'toTest',
    product: '糖尿病个体化用药基因检测',
    spec: '覆盖 4 大类降糖药',
    patient: '曾*军',
    phone: '131****9086',
    mobile: '13107319086',
    time: '10-15 19:03',
    amount: 499,
    sampleCode: 'YW2610160077',
  },
  {
    id: '15',
    mode: 'self',
    no: 'DZ202610150064',
    status: 'toTest',
    product: '高血压个体化用药基因检测',
    spec: '覆盖 5 大类降压药',
    patient: '彭*',
    phone: '182****4471',
    mobile: '18207314471',
    time: '10-14 21:17',
    amount: 499,
    sampleCode: 'YW2610150064',
    resample: {
      state: 'pending',
      reason: 'DNA 浓度不达标',
      at: '2026-10-18 15:20',
      operator: '检验员 陈静',
      snapshot: { status: 'toTest', sampleCode: 'YW2610150064' },
    },
  },
  {
    id: '23',
    mode: 'self',
    no: 'DZ202610130029',
    status: 'testing',
    product: '药物基因检测 · 精神类用药',
    spec: '覆盖 46 种常用药物',
    patient: '袁*',
    phone: '183****7065',
    mobile: '18307317065',
    time: '10-13 20:24',
    amount: 899,
    sampleCode: 'YW2610130029',
    tester: '检验员 陈静',
  },
  {
    id: '16',
    mode: 'self',
    no: 'DZ202610100042',
    status: 'done',
    product: '药物基因检测 · 心脑血管用药',
    spec: '覆盖 32 种常用药物',
    patient: '谭*华',
    phone: '139****5528',
    mobile: '13975125528',
    time: '10-08 18:30',
    amount: 699,
    sampleCode: 'YW2610100042',
    tester: '检验员 陈静',
  },
  {
    id: '17',
    mode: 'onsite',
    institutionCode: RHT,
    no: 'DZ202610140028',
    status: 'toSample',
    product: '药物基因检测 · 心脑血管用药',
    spec: '覆盖 32 种常用药物',
    patient: '欧*明',
    phone: '158****3317',
    mobile: '15874013317',
    time: '10-14 10:05',
    amount: 699,
    resample: {
      state: 'agreed',
      reason: '样本量不足',
      at: '2026-10-17 10:12',
      decidedAt: '2026-10-17 18:46',
      operator: '检验员 陈静',
      snapshot: { status: 'testing', sampleCode: 'YW2610140028', tester: '检验员 陈静' },
    },
  },
  {
    id: '18',
    mode: 'self',
    no: 'DZ202610130015',
    status: 'closed',
    product: '叶酸代谢能力基因检测',
    spec: 'MTHFR / MTRR 位点',
    patient: '任*',
    phone: '176****2209',
    mobile: '17673122209',
    time: '10-12 16:48',
    amount: 299,
    resample: {
      state: 'refunded',
      reason: '样本污染',
      at: '2026-10-16 09:30',
      decidedAt: '2026-10-16 14:05',
      operator: '检验员 陈静',
      snapshot: { status: 'toTest', sampleCode: 'YW2610130015' },
    },
  },
  {
    id: '24',
    mode: 'onsite',
    institutionCode: LAB_CODE,
    no: 'DZ202610200011',
    status: 'toVerify',
    product: '药物基因检测 · 全面版',
    spec: '覆盖 128 种常用药物',
    patient: '邓*平',
    phone: '135****6610',
    mobile: '13574106610',
    time: '10-20 09:12',
    amount: 1299,
    verifyCode: '73150286',
  },
  {
    id: '25',
    mode: 'onsite',
    institutionCode: LAB_CODE,
    no: 'DZ202610200024',
    status: 'toSample',
    product: '药物基因检测 · 精神类用药',
    spec: '覆盖 46 种常用药物',
    patient: '易*婷',
    phone: '187****0932',
    mobile: '18774310932',
    time: '10-20 10:40',
    amount: 899,
    verifyCode: '61027734',
    verifier: '检验员 陈静',
  },
  {
    id: '26',
    mode: 'onsite',
    institutionCode: LAB_CODE,
    no: 'DZ202610190057',
    status: 'toShip',
    product: '药物基因检测 · 高血压用药',
    spec: '覆盖 24 种常用药物',
    patient: '曾*强',
    phone: '139****4475',
    mobile: '13907314475',
    time: '10-19 15:26',
    amount: 499,
    verifyCode: '50391846',
    verifier: '检验员 陈静',
    sampler: '检验员 陈静',
    sampleCode: 'YW2610190057',
  },
]

export function getOrder(id: string) {
  return orders.find((order) => order.id === id) ?? orders[0]
}

const flowIndex: Record<OrderStatus, number> = {
  unpaid: 0,
  toDeliver: 1,
  toArrive: 1,
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
  '10': { gender: '男', age: 55 },
  '11': { gender: '女', age: 62 },
  '12': { gender: '女', age: 31 },
  '13': { gender: '男', age: 45 },
  '14': { gender: '男', age: 57 },
  '15': { gender: '男', age: 68 },
  '16': { gender: '女', age: 60 },
  '17': { gender: '男', age: 64 },
  '18': { gender: '女', age: 27 },
  '19': { gender: '男', age: 39 },
  '20': { gender: '女', age: 61 },
  '21': { gender: '男', age: 50 },
  '22': { gender: '女', age: 33 },
}

export function getPatientProfile(order: Order) {
  return patientProfiles[order.id] ?? { gender: Number(order.mobile.slice(-1)) % 2 ? '男' : '女', age: 30 + (Number(order.mobile.slice(-2)) % 40) }
}

export type OrderEvent = { title: string; desc: string; time: string }

type EventTemplate = { title: string; offset: number; desc: (order: Order) => string }

const onsiteTemplates: EventTemplate[] = [
  { title: '用户下单', offset: 0, desc: () => '用户在药问基因小程序提交订单' },
  { title: '支付成功', offset: 3, desc: (o) => `微信支付 ¥${o.amount}` },
  { title: '订单核销', offset: 30, desc: (o) => `扫码核销成功，核销人：${getVerifier(o)}` },
  { title: '完成采样', offset: 45, desc: (o) => `扫码绑定采样盒，样本编号 ${o.sampleCode ?? '-'}，采样人：${getSampler(o)}` },
  { title: '预约寄样', offset: 285, desc: (o) => `已预约顺丰速运上门取件，运单号 ${trackingNo(o)}` },
  { title: '实验室签收', offset: 1485, desc: () => `${LAB_NAME}已签收样本` },
  { title: '开始检测', offset: 1845, desc: (o) => `扫码确认样本 ${o.sampleCode ?? '-'}，已上机检测，检测人：${getTester(o)}` },
  { title: '报告出具', offset: 7605, desc: () => '检测报告已出具，用户可在小程序查看' },
]

const selfTemplates: EventTemplate[] = [
  { title: '用户下单', offset: 0, desc: () => '用户在药问基因小程序提交自采样订单' },
  { title: '支付成功', offset: 3, desc: (o) => `微信支付 ¥${o.amount}` },
  { title: '寄出采样盒', offset: 120, desc: () => '平台已通过顺丰寄出采样盒' },
  { title: '寄回样本', offset: 1500, desc: (o) => `用户完成自采样并寄回，样本编号 ${o.sampleCode ?? '-'}，运单号 ${trackingNo(o)}` },
  { title: '实验室签收', offset: 2900, desc: () => `${LAB_NAME}已签收样本` },
  { title: '开始检测', offset: 3300, desc: (o) => `扫码确认样本 ${o.sampleCode ?? '-'}，已上机检测，检测人：${getTester(o)}` },
  { title: '报告出具', offset: 9000, desc: () => '检测报告已出具，用户可在小程序查看' },
]

const selfFlowIndex: Record<OrderStatus, number> = {
  unpaid: 0,
  toDeliver: 1,
  toArrive: 2,
  toVerify: 1,
  toSample: 2,
  toShip: 2,
  toReceive: 3,
  toTest: 4,
  testing: 5,
  done: 6,
  closed: -1,
}

const templatesFor = (order: Order) => (order.mode === 'self' ? selfTemplates : onsiteTemplates)
const indexFor = (order: Order, status: OrderStatus = order.status) =>
  (order.mode === 'self' ? selfFlowIndex : flowIndex)[status]

export function trackingNo(order: Order) {
  return order.tracking ?? `SF14${order.no.slice(-8)}`
}

export function getVerifier(order: Order) {
  return order.verifier ?? '店员 李晓'
}

export function getSampler(order: Order) {
  return order.sampler ?? '店员 王芳'
}

export function getTester(order: Order) {
  return order.tester ?? '检验员 陈静'
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

function baseEvents(order: Order, from = 0): OrderEvent[] {
  return templatesFor(order)
    .slice(from, indexFor(order) + 1)
    .map((t) => ({
      title: t.title,
      desc: t.desc(order),
      time: order.records?.[t.title] ?? timeAt(order, t.offset),
    }))
}

/** Status the order returns to once the customer agrees to resample. */
export function resampleReentry(order: Order): OrderStatus {
  return order.mode === 'self' ? 'toArrive' : 'toSample'
}

export function getOrderEvents(order: Order): OrderEvent[] {
  const r = order.resample
  if (r) {
    const before = baseEvents({ ...order, ...r.snapshot })
    const events: OrderEvent[] = [
      ...before,
      { title: '发起重采样', desc: `${r.reason}，${r.operator}发起重采样，已通知客户确认`, time: r.at },
    ]
    if (r.state === 'agreed') {
      events.push({
        title: '客户同意重采样',
        desc: order.mode === 'self' ? '平台已重新寄出采样盒，等待客户采样后寄回' : '客户将到店重新采样，订单回到待采样',
        time: r.decidedAt ?? r.at,
      })
      const reentryIndex = indexFor(order, resampleReentry(order))
      for (const e of baseEvents(order, reentryIndex + 1)) {
        events.push({ ...e, title: `${e.title}（重采样）`, time: order.records?.[e.title] ?? r.decidedAt ?? r.at })
      }
    }
    if (r.state === 'refunded') {
      events.push({ title: '客户申请退款', desc: '客户不同意重新采样，订单已全额原路退款并关闭', time: r.decidedAt ?? r.at })
    }
    return events.reverse()
  }
  if (order.status === 'closed') {
    return [
      { title: '订单关闭', desc: '用户超时未支付，系统自动关闭订单', time: timeAt(order, 30) },
      { title: '用户下单', desc: onsiteTemplates[0].desc(order), time: timeAt(order, 0) },
    ]
  }
  return baseEvents(order).reverse()
}

export function getEventTime(order: Order, title: string) {
  const templates = templatesFor(order)
  const index = templates.findIndex((t) => t.title === title)
  if (index < 0) return undefined
  const source = order.resample && index > indexFor(order, resampleReentry(order)) ? order : order.resample ? { ...order, ...order.resample.snapshot } : order
  if (source.status === 'closed' || indexFor(source) < index) return undefined
  return source.records?.[title] ?? timeAt(source, templates[index].offset)
}

export function nowText() {
  return formatTime(new Date())
}

export function getCloseTime(order: Order) {
  return order.resample?.decidedAt ?? timeAt(order, 30)
}

export function getCloseReason(order: Order) {
  return order.resample?.state === 'refunded' ? '客户不同意重采样，已全额退款' : '超时未支付'
}
