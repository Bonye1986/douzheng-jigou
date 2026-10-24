import { DesignBoard, type BoardSection } from '@/components/design/design-board'
import { orderDetailScreens, orderFlowScreens, orderListScreens } from '@/components/design/order-screens'
import { BrandMark } from '@/components/mini/brand'
import { InstitutionApp } from '@/components/mini/institution-app'
import { InstitutionSettingsScreen } from '@/components/mini/institution-settings'
import { DEMO_ACCOUNT, DEMO_PASSWORD } from '@/components/mini/demo-credentials'
import { InstitutionEntry } from '@/components/mini/institution-entry'
import { LoginScreen } from '@/components/mini/login-screen'

const sections: BoardSection[] = [
  {
    key: 'login',
    title: '登录',
    screens: [
      {
        id: '01',
        title: '机构登录页',
        summary: '机构端唯一入口，使用平台分配的机构账号与密码登录。账号由都正生物平台统一开通，不支持自主注册',
        fields: [
          '品牌区：平台 Logo、「机构端登录 · 合作机构专用」标识',
          '登录账号：文本输入，最多 32 位，有内容时右侧显示清空按钮',
          '登录密码：默认密文，可点击眼睛图标切换明文 / 密文',
          '记住密码：复选框，默认不勾选',
          '登录按钮、忘记密码入口',
        ],
        flow: [
          '输入登录账号与密码',
          '按需勾选「记住密码」',
          '点击「登录」，按钮进入加载态',
          '校验通过后 Toast 提示「登录成功」，进入机构工作台',
        ],
        rules: [
          '账号与密码均填写后「登录」按钮才可点击，否则置灰',
          '勾选记住密码并登录成功后，下次进入自动回填账号与密码',
          '忘记密码不提供自助找回，引导联系平台管理员重置',
          `演示账号 ${DEMO_ACCOUNT} / 密码 ${DEMO_PASSWORD}`,
        ],
        exceptions: [
          '账号或密码错误：输入框标红并提示原因，不区分「账号不存在」与「密码错误」',
          '连续输错 5 次：锁定账号 30 分钟，期间提示剩余锁定时间',
          '账号已停用：提示「账号已停用，请联系平台管理员」',
          '网络异常：提示「网络异常，请稍后重试」，按钮恢复可点击',
        ],
        node: <InstitutionEntry />,
      },
      {
        id: '02',
        title: '登录页 · 已记住密码',
        summary: '上次登录时勾选了记住密码，再次进入时自动回填账号与密码，可直接登录',
        fields: ['登录账号：明文回填', '登录密码：密文回填', '记住密码：保持勾选'],
        flow: ['进入登录页，账号密码自动回填', '直接点击「登录」', '校验通过后进入机构工作台'],
        rules: [
          '取消勾选「记住密码」并登录后，清除本地保存的密码',
          '修改密码或退出后重新登录时，以最新一次的勾选状态为准',
        ],
        exceptions: [
          '密码已在其他设备修改：登录失败并提示错误，需重新输入新密码',
          '账号被停用：已保存的密码自动失效',
        ],
        node: <InstitutionEntry initialAccount={DEMO_ACCOUNT} initialPassword={DEMO_PASSWORD} initialRemember />,
      },
      {
        id: '03',
        title: '登录页 · 账号或密码错误',
        summary: '登录校验失败时的错误提示状态',
        fields: ['账号、密码输入框：边框标红', '错误提示：输入框下方展示错误原因与锁定规则'],
        flow: ['登录校验失败，展示错误状态', '修改账号或密码', '重新点击「登录」'],
        rules: ['为保护账号安全，统一提示「账号或密码错误」', '修改任一输入框后错误提示与标红立即消失'],
        exceptions: ['第 5 次输错：提示「账号已锁定，请 30 分钟后再试」，登录按钮置灰'],
        node: (
          <LoginScreen
            initialAccount={DEMO_ACCOUNT}
            initialPassword="12345678"
            initialError="账号或密码错误，请重新输入（连续错误 5 次将锁定 30 分钟）"
          />
        ),
      },
    ],
  },
  {
    key: 'workbench',
    title: '工作台',
    screens: [
      {
        id: '04',
        title: '机构工作台',
        summary: '机构登录后的首页，集中展示机构信息、今日业务数据、常用功能入口与最新业务动态',
        fields: [
          '机构信息卡：机构名称、机构类型（诊所 / 药店）、机构编号、工作时间、联系电话、地址',
          '今日数据：今日核销（单）、今日采样（例）、待寄样（份）',
          '常用功能：订单核销、扫码采样、预约寄样、数据统计',
          '最新动态：核销、采样、寄样、样本到达、报告出具，含标题、内容、操作人、操作时间与未读红点；右上角「更多」',
          '底部菜单：工作台 / 订单管理 / 数据统计',
        ],
        flow: [
          '点击机构信息卡进入机构设置',
          '点击今日数据跳转至订单列表并选中对应状态（待核销 / 待采样 / 待寄样）',
          '点击常用功能进入扫码核销、扫码采样、预约寄样或数据统计',
          '点击某条动态进入对应订单详情，红点消失',
          '点击「更多」进入动态列表查看全部动态记录',
          '点击底部菜单切换页面',
        ],
        rules: [
          '今日数据每日 0 点重置，待寄样为实时数量',
          '动态按时间倒序展示，工作台仅展示最新 4 条，仅展示本机构相关业务',
          '操作人为执行该操作的机构店员；样本到达、检测、报告类动态的操作人为实验室',
          '顶部导航与底部菜单固定，内容区可滚动',
        ],
        exceptions: [
          '暂无动态：展示空状态「暂无业务动态」',
          '数据加载失败：展示上次数据并提示下拉刷新',
          '登录状态失效：提示「登录已过期」并返回登录页',
        ],
        node: <InstitutionApp />,
      },
      {
        id: '04-1',
        title: '动态列表',
        summary: '从工作台「最新动态 · 更多」进入，按日期分组查看本机构全部业务动态记录',
        fields: [
          '顶部导航：「全部动态」+ 返回',
          '日期分组：今天 / 昨天 / X 月 X 日 + 完整日期',
          '动态条目：图标、标题、未读红点、内容、操作人、操作时间（时:分）',
          '底部说明：「仅展示近 30 天动态」',
        ],
        flow: ['点击某条动态进入对应订单详情，红点消失', '从订单详情返回动态列表', '点击返回回到工作台'],
        rules: ['动态按操作时间倒序排列，同一天归入同一分组', '仅保留近 30 天动态记录', '已读状态与工作台同步'],
        exceptions: ['暂无动态：展示空状态「暂无业务动态」', '关联订单已删除：提示「订单不存在」'],
        node: <InstitutionApp initialShowActivities />,
      },
    ],
  },
  {
    key: 'orders',
    title: '订单列表',
    screens: orderListScreens,
  },
  {
    key: 'order-detail',
    title: '订单详情',
    screens: orderDetailScreens,
  },
  {
    key: 'order-flow',
    title: '订单操作',
    screens: orderFlowScreens,
  },
  {
    key: 'stats',
    title: '数据统计',
    screens: [
      {
        id: '08',
        title: '数据统计',
        summary: '按时间段与订单状态统计本机构业务数据，展示成交金额、订单趋势、状态分布、检测项目排行与订单明细',
        fields: [
          '时间段：今日 / 近7天 / 近30天 / 本月 / 自定义（开始日期、结束日期），下方显示日期范围与天数',
          '状态筛选：全部 / 待付款 / 待核销 / 待采样 / 待寄样 / 检测中 / 已完成 / 已关闭',
          '核心指标：成交金额（元）、订单数、客单价、已出报告',
          '订单趋势：柱状图，可切换订单量 / 金额，显示合计或选中时段数值',
          '状态分布：各状态订单数、占比与进度条',
          '检测项目排行：前 5 名项目的订单数与金额',
          '订单明细：受检人、状态、检测项目、订单号、下单时间、金额',
        ],
        flow: [
          '切换时间段，所有模块按新的日期范围刷新；选择自定义后用日期选择器设定范围',
          '点击状态标签或状态分布中的某一行筛选订单，再次点击同一行取消筛选',
          '在趋势图上切换订单量 / 金额，点击某根柱子查看该时段数值，再次点击取消',
          '点击订单明细中的某一单进入订单详情',
        ],
        rules: [
          '成交金额与客单价只统计已付款订单，不含待付款和已关闭订单',
          '客单价 = 成交金额 ÷ 已付款订单数；已出报告 = 已完成订单数',
          '今日按 2 小时为一段展示趋势，超过 31 天按周汇总，其余按天汇总',
          '自定义日期不能晚于今日；开始日期晚于结束日期时自动对调',
          '订单明细按下单时间倒序，最多显示最近 20 单',
          '状态分布占比以当前时间段的全部订单为基数，不受状态筛选影响',
        ],
        exceptions: [
          '当前筛选无订单：排行与明细显示「当前筛选条件下暂无订单」，指标显示为 0',
          '数据加载失败：保留上次结果并提示重试',
          '登录状态失效：提示「登录已过期」并返回登录页',
        ],
        node: <InstitutionApp initialTab="stats" />,
      },
    ],
  },
  {
    key: 'settings',
    title: '机构设置',
    screens: [
      {
        id: '05',
        title: '机构设置',
        summary: '维护对外展示的机构资料，修改后自动保存；同时提供修改登录密码与退出登录入口',
        fields: [
          '机构类型、机构编号：只读，由平台分配',
          '机构名称：必填，最多 30 字',
          '工作时间：开始时间、结束时间',
          '联系电话：必填，手机号或座机号',
          '机构地址：必填，最多 60 字，两行展示',
          '登录密码：进入修改密码页',
          '退出登录：固定在页面底部',
        ],
        flow: [
          '在工作台点击机构信息卡进入',
          '点击字段修改内容，输入框失焦后自动保存，Toast 提示「机构信息已保存」',
          '点击「登录密码」进入修改密码页',
          '点击底部「退出登录」，清除登录状态并返回登录页',
        ],
        rules: [
          '内容未变化时失焦不触发保存',
          '机构名称、工作时间、联系电话与地址同步展示给用户端预约采样的受检人',
          '保存后返回工作台，机构信息卡同步更新',
          '退出登录固定在页面底部，与资料表单分开，防止误操作',
        ],
        exceptions: [
          '必填项为空：在表单下方提示「请填写xx」，不保存并保留输入',
          '结束时间早于开始时间：提示「结束时间需晚于开始时间」',
          '电话格式错误：提示「请输入正确的手机号或座机号」',
          '保存失败：提示「保存失败，请重试」，再次失焦时重新提交',
        ],
        node: <InstitutionSettingsScreen />,
      },
      {
        id: '06',
        title: '修改登录密码',
        summary: '验证原密码后设置新密码，修改成功后需重新登录',
        fields: [
          '原密码、新密码、确认新密码：均支持明文 / 密文切换',
          '密码规则说明：8-20 位，须同时包含字母和数字',
          '确认修改按钮',
        ],
        flow: ['输入原密码', '输入并确认新密码', '点击「确认修改」', '修改成功 Toast 提示，自动退出并返回登录页'],
        rules: [
          '三项均填写后「确认修改」按钮才可点击',
          '新密码需为 8-20 位，且同时包含字母和数字',
          '修改成功后所有设备需重新登录，已「记住」的密码失效',
          `演示原密码 ${DEMO_PASSWORD}`,
        ],
        exceptions: [
          '原密码错误：提示「原密码不正确」',
          '新密码格式不符：提示密码规则',
          '新密码与原密码相同：提示「新密码不能与原密码相同」',
          '两次输入不一致：提示「两次输入的新密码不一致」',
        ],
        node: <InstitutionSettingsScreen initialView="password" />,
      },
    ],
  },
]

const pageCount = sections.reduce((count, section) => count + section.screens.length, 0)

export default function Page() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e6f1fe_0%,#f4f8fe_45%)] px-6 py-10 lg:px-12">
      <DesignBoard
        sections={sections}
        header={
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-10">
            <div className="flex items-center gap-4">
              <BrandMark size="lg" />
              <div>
                <p className="text-note font-medium text-primary">都正生物 · 药问基因机构端小程序</p>
                <h1 className="mt-1 text-headline font-bold text-foreground md:text-display">UI设计</h1>
              </div>
            </div>
            <dl className="flex gap-6 text-note text-muted-foreground">
              <div>
                <dt>画板尺寸</dt>
                <dd className="font-medium text-foreground">375 × 812</dd>
              </div>
              <div>
                <dt>登录方式</dt>
                <dd className="font-medium text-foreground">机构账号 + 密码</dd>
              </div>
              <div>
                <dt>页面数</dt>
                <dd className="font-medium text-foreground">{pageCount} 个</dd>
              </div>
            </dl>
          </div>
        }
      />
    </main>
  )
}
