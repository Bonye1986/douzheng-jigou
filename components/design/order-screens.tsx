import type { BoardScreen } from './design-board'
import { InstitutionApp } from '@/components/mini/institution-app'
import { orderStatuses, orders, statusActions, type OrderStatus } from '@/components/mini/orders-data'

type StatusSpec = {
  list: { desc: string; features: string[]; interactions: string[] }
  detail: { desc: string; features: string[]; interactions: string[] }
}

const specs: Record<OrderStatus, StatusSpec> = {
  unpaid: {
    list: {
      desc: '用户已下单但尚未支付的订单，机构可提醒用户尽快完成支付',
  features: ['订单卡片展示应付金额，无操作按钮', '超时 30 分钟未支付自动关闭，流转至「已关闭」'],
  interactions: ['点击卡片进入待付款订单详情'],
    },
    detail: {
      desc: '待付款订单详情，展示应付金额与支付倒计时提示',
      features: ['服务进度停留在「付款」步骤', '金额区展示「应付金额」', '订单信息不展示支付方式与支付时间'],
      interactions: ['页面无底部操作栏', '用户完成支付后自动流转至「待核销」'],
    },
  },
  toVerify: {
    list: {
      desc: '用户已支付、待到店核销的订单，列表顶部展示处理说明',
      features: ['状态说明条：「用户到店后出示核销码，核销后进入采样」', '订单卡片展示实付金额与下单时间'],
      interactions: ['点击「核销订单」进入核销页，核销成功后流转至「待采样」', '从工作台「订单核销」进入时默认定位到此状态'],
    },
    detail: {
      desc: '待核销订单详情，机构核对用户信息后完成核销',
      features: ['服务进度：付款已完成，当前为「核销」', '展示支付方式与支付时间', '受检人信息仅展示，不可操作'],
      interactions: ['底部「核销订单」为主按钮，核销后进入采样流程', '「联系用户」确认到店时间'],
    },
  },
  toSample: {
    list: {
      desc: '已核销、待采集样本的订单',
      features: ['状态说明条：「请扫描采样管条码，完成口腔拭子采样」', '样本编号未绑定，卡片展示下单时间'],
      interactions: ['点击「扫码采样」调起扫码绑定采样管', '从工作台「扫码采样」进入时默认定位到此状态'],
    },
    detail: {
      desc: '待采样订单详情，新增样本信息卡片',
      features: ['服务进度：当前为「采样」', '样本信息：样本编号显示「扫码采样后自动绑定」', '订单信息新增核销时间'],
      interactions: ['底部「扫码采样」扫描采样管条码，完成后流转至「待寄样」'],
    },
  },
  toShip: {
    list: {
      desc: '已完成采样、待寄往实验室的订单',
      features: ['状态说明条：「样本已采集，请预约快递上门取件」', '卡片展示样本编号'],
      interactions: ['点击「预约寄样」进入寄样预约，可多个样本合并寄送', '从工作台「预约寄样」进入时默认定位到此状态'],
    },
    detail: {
      desc: '待寄样订单详情，展示已绑定的样本编号与采样时间',
      features: ['服务进度：当前为「寄样」', '样本编号支持复制', '订单跟踪新增「完成采样」节点'],
      interactions: ['底部「预约寄样」预约快递上门取件，取件后流转至「待收样」'],
    },
  },
  toReceive: {
    list: {
      desc: '样本运输中、等待实验室签收的订单',
      features: ['状态说明条：「样本运输中，实验室签收后进入检测」', '卡片展示样本编号'],
      interactions: ['点击「查看物流」查看快递轨迹'],
    },
    detail: {
      desc: '待收样订单详情，展示物流公司与运单号',
      features: ['服务进度：当前为「收样」', '样本信息新增物流公司、运单号（可复制）', '订单跟踪新增「预约寄样」节点'],
      interactions: ['底部「查看物流」查看快递实时轨迹', '实验室签收后自动流转至「待检测」'],
    },
  },
  toTest: {
    list: {
      desc: '实验室已签收、等待上机检测的订单',
      features: ['状态说明条：「实验室已签收样本，等待上机检测」'],
      interactions: ['点击「查看进度」进入订单详情查看检测进度'],
    },
    detail: {
      desc: '待检测订单详情，样本已由实验室签收',
      features: ['服务进度：当前为「检测」', '订单跟踪新增「实验室签收」节点'],
      interactions: ['底部「查看进度」查看实验室处理进度', '样本质检合格后流转至「检测中」'],
    },
  },
  testing: {
    list: {
      desc: '样本正在检测的订单',
      features: ['状态说明条：「样本检测中，预计 5-7 个工作日出具报告」'],
      interactions: ['点击「查看进度」进入订单详情'],
    },
    detail: {
      desc: '检测中订单详情，展示预计出报告时间',
      features: ['服务进度：当前为「检测」', '订单跟踪新增「开始检测」节点'],
      interactions: ['底部「查看进度」查看检测进度', '报告出具后流转至「已完成」并通知用户'],
    },
  },
  done: {
    list: {
      desc: '检测报告已出具的订单，标签不显示数量',
      features: ['状态颜色为绿色', '卡片展示样本编号与实付金额'],
      interactions: ['点击「查看报告」在线查看检测报告'],
    },
    detail: {
      desc: '已完成订单详情，新增检测报告入口',
      features: ['服务进度全部完成', '检测报告卡片展示出具时间', '订单跟踪展示完整流转记录'],
      interactions: ['点击报告卡片或底部「查看报告」查看 PDF 报告'],
    },
  },
  closed: {
    list: {
      desc: '已取消或超时关闭的订单，标签不显示数量',
      features: ['状态颜色为灰色', '卡片无操作按钮'],
      interactions: ['点击卡片进入已关闭订单详情'],
    },
    detail: {
      desc: '已关闭订单详情，整体采用灰色状态头',
      features: ['不展示服务进度与样本信息', '状态头展示关闭时间，订单信息展示关闭原因', '受检人手机号不提供拨号按钮'],
      interactions: ['底部无操作栏，仅可查看'],
    },
  },
}

const actionText = (status: OrderStatus) =>
  statusActions[status].length
    ? `操作按钮：${statusActions[status].map((a) => `「${a.label}」`).join('')}`
    : '无操作按钮'

export const orderListScreens: BoardScreen[] = [
  {
    id: '07',
    title: '订单列表 · 全部',
    desc: '底部菜单「订单管理」，在一个列表中查看本机构全部检测订单，每种订单状态均在列表中体现，并可直接执行对应操作',
    features: [
      '订单状态：全部、待付款、待核销、待采样、待寄样、待收样、待检测、检测中、已完成、已关闭，横向滑动筛选',
      '进行中的状态标签后显示订单数量，已完成 / 已关闭不显示数量',
      '搜索：支持按订单号、用户姓名、手机号、检测项目搜索',
      '状态颜色：待付款 / 待核销为橙色，流转中为蓝色，已完成为绿色，已关闭为灰色',
      ...orderStatuses.map((status) => `${status.label}：${actionText(status.key)}`),
    ],
    interactions: [
      '点击状态标签筛选对应状态订单，标签自动滚动居中',
      '点击订单卡片进入对应状态的订单详情',
      '列表下拉刷新，上拉加载更多；筛选无结果时展示空状态',
    ],
    node: <InstitutionApp initialTab="orders" />,
  },
]

export const orderDetailScreens: BoardScreen[] = orderStatuses.map((status, index) => {
  const order = orders.find((o) => o.status === status.key) ?? orders[0]
  return {
    id: `09-${index + 1}`,
    title: `订单详情 · ${status.label}`,
    desc: specs[status.key].detail.desc,
    features: [
      ...specs[status.key].detail.features,
      '通用模块：检测项目与金额、受检人信息、订单信息（订单号可复制）、订单跟踪时间轴',
    ],
    interactions: [...specs[status.key].detail.interactions, '点击左上角返回订单列表'],
    node: <InstitutionApp initialTab="orders" initialOrderStatus={status.key} initialOrderId={order.id} />,
  }
})
