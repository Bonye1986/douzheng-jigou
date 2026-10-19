import { DesignBoard, type BoardSection } from '@/components/design/design-board'
import { BrandMark } from '@/components/mini/brand'
import { InstitutionApp } from '@/components/mini/institution-app'
import { InstitutionSettingsScreen } from '@/components/mini/institution-settings'
import { DEMO_ACCOUNT, DEMO_PASSWORD, LoginScreen } from '@/components/mini/login-screen'

const sections: BoardSection[] = [
  {
    key: 'login',
    title: '登录',
    screens: [
      {
        id: '01',
        title: '机构登录页',
        desc: '机构端唯一入口：使用平台分配的机构账号与密码登录，账号由都正生物平台统一开通，不支持自主注册',
        features: [
          '平台 Logo 与「机构端登录 · 合作机构专用」标识，与用户端视觉保持一致',
          '登录账号：最多 32 位，输入后右侧出现清空按钮',
          '登录密码：默认密文显示，可点击眼睛图标切换明文 / 密文',
          '记住密码：勾选后登录成功，下次进入自动回填账号与密码',
          '忘记密码不提供自助找回，引导联系平台管理员重置',
        ],
        interactions: [
          '账号与密码均填写后「登录」按钮才可点击，否则置灰',
          '点击登录按钮进入加载态，防止重复提交',
          `账号或密码错误时输入框标红并提示原因，修改任一输入框后提示消失（演示账号 ${DEMO_ACCOUNT} / 密码 ${DEMO_PASSWORD}）`,
          '连续输错 5 次锁定账号 30 分钟',
          '登录成功 Toast 提示后进入机构工作台',
        ],
        node: <LoginScreen />,
      },
      {
        id: '02',
        title: '登录页 · 已记住密码',
        desc: '上次登录时勾选了记住密码，再次进入时自动回填账号与密码，可直接点击登录',
        features: [
          '账号明文回填，密码密文回填',
          '「记住密码」保持勾选状态，取消勾选并登录后清除本地保存的密码',
          '修改密码或账号被停用后，已保存的密码自动失效',
        ],
        interactions: [
          '进入页面即回填，登录按钮直接可点击',
          '点击登录后按正常流程校验，成功后进入机构工作台',
        ],
        node: <LoginScreen initialAccount={DEMO_ACCOUNT} initialPassword={DEMO_PASSWORD} initialRemember />,
      },
      {
        id: '03',
        title: '登录页 · 账号或密码错误',
        desc: '登录校验失败时的错误提示状态',
        features: [
          '账号、密码输入框边框标红',
          '输入框下方展示错误原因与剩余尝试规则',
          '为保护账号安全，不区分提示「账号不存在」或「密码错误」',
        ],
        interactions: ['修改任一输入框后错误提示与标红消失', '重新输入正确的账号密码后可正常登录'],
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
        desc: '机构登录后的首页，集中展示机构信息、今日业务数据、常用功能入口与最新业务动态。底部菜单分为「工作台」「数据统计」两项',
        features: [
          '机构信息：机构名称、机构类型（诊所 / 药店）、机构编号、工作时间、联系电话与地址，点击进入机构设置',
          '今日数据：今日核销单数、今日采样例数、待寄样份数，每日 0 点重置',
          '常用功能：订单核销、扫码采样、预约寄样、数据统计 4 个快捷入口',
          '最新动态：按时间倒序展示核销、采样、寄样、样本到达、报告出具与平台公告，未读动态带红点',
          '底部菜单：工作台 / 订单管理 / 数据统计，当前页高亮',
        ],
        interactions: [
          '点击常用功能「订单核销」「扫码采样」「预约寄样」进入对应功能页（演示中以 Toast 提示）',
          '点击「数据统计」快捷入口与底部菜单「数据统计」效果一致，切换至数据统计页',
          '点击某条动态进入对应订单 / 样本 / 报告 / 公告详情，查看后红点消失',
          '点击「全部」进入动态列表页，支持按类型筛选',
          '页面内容超出一屏时上下滚动，顶部导航与底部菜单固定',
        ],
        node: <InstitutionApp />,
      },
    ],
  },
  {
    key: 'orders',
    title: '订单管理',
    screens: [
      {
        id: '07',
        title: '订单管理 · 全部',
        desc: '底部菜单「订单管理」，按订单状态查看本机构的全部检测订单，并对订单执行核销、采样、寄样等操作',
        features: [
          '订单状态：全部、待付款、待核销、待采样、待寄样、待收样、待检测、检测中、已完成、已关闭，横向滑动切换',
          '进行中的状态标签后显示订单数量，已完成 / 已关闭不显示数量',
          '搜索：支持按订单号、用户姓名、手机号、检测项目搜索',
          '订单卡片：订单号（可复制）、订单状态、检测项目、用户姓名与手机号（脱敏）、订单金额、样本编号或下单时间',
          '状态颜色：待付款 / 待核销为橙色，流转中为蓝色，已完成为绿色，已关闭为灰色',
        ],
        interactions: [
          '点击状态标签切换列表，标签自动滚动居中',
          '按状态展示操作按钮：待付款「联系用户」、待核销「核销订单」、待采样「扫码采样」、待寄样「预约寄样」、待收样「查看物流」、待检测 / 检测中「查看进度」、已完成「查看报告」，已关闭无操作',
          '点击订单卡片进入订单详情',
          '列表下拉刷新，上拉加载更多',
        ],
        node: <InstitutionApp initialTab="orders" />,
      },
      {
        id: '08',
        title: '订单管理 · 待核销',
        desc: '切换至具体状态后，列表顶部展示该状态的处理说明，引导机构完成下一步操作',
        features: [
          '状态说明条：如「用户到店后出示核销码，核销后进入采样」',
          '无订单时展示空状态「暂无该状态的订单」',
          '搜索无结果时提示「未找到与 xx 相关的订单」',
        ],
        interactions: [
          '点击「核销订单」进入核销页，核销成功后订单流转至「待采样」',
          '从工作台「订单核销」等快捷入口进入时，默认定位至对应状态',
        ],
        node: <InstitutionApp initialTab="orders" initialOrderStatus="toVerify" />,
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
        desc: '在工作台点击机构信息卡片进入，可维护对外展示的机构资料，并入口修改登录密码',
        features: [
          '顶部展示机构类型与机构编号（只读，由平台分配）',
          '机构名称：最多 30 字',
          '工作时间：分别选择开始与结束时间，工作台展示为「每日 08:00 - 20:00」',
          '联系电话：支持手机号或座机号',
          '机构地址：最多 60 字，两行展示',
          '登录密码：点击进入修改密码页',
        ],
        interactions: [
          '任一字段有修改时「保存」按钮才可点击',
          '保存时校验必填项、时间先后与电话格式，不通过时在表单下方提示原因',
          '保存成功 Toast 提示，返回工作台后机构信息同步更新',
        ],
        node: <InstitutionSettingsScreen />,
      },
      {
        id: '06',
        title: '修改登录密码',
        desc: '验证原密码后设置新密码，修改成功后需重新登录',
        features: [
          '原密码、新密码、确认新密码三项，均支持明文 / 密文切换',
          '新密码规则：8-20 位，须同时包含字母和数字',
          '底部说明密码规则、重新登录与「记住密码」失效提示',
        ],
        interactions: [
          '三项均填写后「确认修改」按钮才可点击',
          `依次校验原密码是否正确（演示原密码 ${DEMO_PASSWORD}）、新密码格式、是否与原密码相同、两次输入是否一致`,
          '修改成功 Toast 提示，退出登录并返回登录页',
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
