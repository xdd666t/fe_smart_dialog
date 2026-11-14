import type { DemoEntry, DemoParamDoc } from '../types/demo';

export interface DemoGuideInfo {
  docPath: string;
  summaryPoints: string[];
  keyParams: DemoParamDoc[];
}

const CUSTOM_BASE_PARAMS: DemoParamDoc[] = [
  {
    name: 'builder',
    type: '({ dismiss }) => SmartContent',
    description: '必填。接收 dismiss(result) 回调，返回 DOM 节点 / DocumentFragment / JSX / VNode。',
  },
  {
    name: 'alignment',
    type: 'Alignment',
    defaultVal: 'Alignment.center',
    description: '支持 9 宫格静态常量或 new Alignment(x, y) 自定义位置。',
  },
  {
    name: 'clickMaskDismiss',
    type: 'boolean',
    defaultVal: 'true',
    description: '点击背景遮罩时是否自动关闭弹窗。',
  },
];

const ATTACH_BASE_PARAMS: DemoParamDoc[] = [
  {
    name: 'targetElement / targetContext',
    type: 'SmartTargetRef',
    description: '锚点宿主元素（HTMLElement、选择器、Ref 或函数 getter）。',
  },
  {
    name: 'alignment',
    type: 'Alignment',
    defaultVal: 'Alignment.bottomCenter',
    description: '弹出卡片相对目标元素的贴靠方向。',
  },
  {
    name: 'config.attach.attachAlignmentType',
    type: 'SmartAttachAlignmentType',
    defaultVal: 'center',
    description: '全局配置边缘对齐模式：outside / center / inside。',
  },
];

const NOTIFY_PARAMS: DemoParamDoc[] = [
  {
    name: 'notifyType',
    type: 'NotifyType',
    description: '内置语义样式：success / failure / warning / alert / error。',
  },
  {
    name: 'msg',
    type: 'string',
    description: '通知正文文案，支持配合 SmartNotifyStyle 全局换肤。',
  },
  {
    name: 'displayTime',
    type: 'SmartDuration',
    defaultVal: '2200ms',
    description: '自动停留关闭时间，传 null 可禁用自动关闭。',
  },
];

export const DEMO_GUIDE_BY_ID: Record<string, DemoGuideInfo> = {
  'dialog-easy': {
    docPath: 'features/custom-dialog',
    summaryPoints: [
      '零挂载 boilerplate：无需提前在模板里写 Modal 占位节点，随时函数式唤起。',
      '推荐 Vanilla TS 搭配 html`` 标签模板，内置转义所有插值防 XSS 注入。',
    ],
    keyParams: CUSTOM_BASE_PARAMS,
  },
  'dialog-location': {
    docPath: 'features/custom-dialog',
    summaryPoints: [
      '支持全部 9 宫格方位（topCenter 顶部通知、bottomCenter 底部抽屉、centerLeft/Right 侧栏等）。',
      '默认动画 centerScale_otherSlide 会按贴边方向自动匹配滑出动画。',
    ],
    keyParams: [
      CUSTOM_BASE_PARAMS[1]!,
      {
        name: 'animationType',
        type: 'SmartAnimationType',
        defaultVal: 'centerScale_otherSlide',
        description: '控制居中缩放与贴边滑动的组合过渡效果。',
      },
    ],
  },
  'dialog-penetrate': {
    docPath: 'features/custom-dialog',
    summaryPoints: [
      '开启 usePenetrate: true 后遮罩不吞掉点击，底层列表滚动与按钮可继续正常交互。',
      '通过 SmartDialog.config.custom.maskTriggerType 可控制按下/抬起/滑动触发遮罩回调。',
    ],
    keyParams: [
      {
        name: 'usePenetrate',
        type: 'boolean',
        defaultVal: 'false',
        description: '设为 true 允许鼠标与触摸事件穿透遮罩到底层元素。',
      },
      {
        name: 'ignoreArea',
        type: 'SmartRect',
        description: '即便遮罩拦截，也可单独抠出允许点击穿透的矩形安全区。',
      },
    ],
  },
  'dialog-single': {
    docPath: 'guide/concepts',
    summaryPoints: [
      'keepSingle: true 会复用当前同位单实例容器刷新内容，避免重复弹叠黑罩。',
      '适合高频刷新倒计时、状态面板或避免连点触发多个同类弹窗。',
    ],
    keyParams: [
      {
        name: 'keepSingle',
        type: 'boolean',
        defaultVal: 'false',
        description: '开启后刷新并复用现有 keepSingle 实例而非追加栈。',
      },
    ],
  },
  'dialog-stack': {
    docPath: 'guide/concepts',
    summaryPoints: [
      '多层叠加弹窗可通过唯一 tag 标记，支持越级调用 dismiss({ tag }) 定点销毁中间某层。',
      '搭配 SmartDialog.checkExist({ tag }) 可随时查询任意弹窗是否仍在栈中。',
    ],
    keyParams: [
      {
        name: 'tag',
        type: 'string',
        description: '为弹窗分配唯一标识，供 dismiss({ tag }) 与 checkExist({ tag }) 定位。',
      },
    ],
  },
  'dialog-system': {
    docPath: 'features/custom-dialog',
    summaryPoints: [
      'useSystem: true 基于浏览器原生 <dialog>.showModal() Top Layer 渲染。',
      '彻底脱离父级 overflow: hidden 或高 z-index 陷阱，原生带 Esc 与焦点回溯。',
    ],
    keyParams: [
      {
        name: 'useSystem',
        type: 'boolean',
        defaultVal: 'false',
        description: '使用原生 <dialog>.showModal() 顶层渲染与无障碍焦点锁定。',
      },
      {
        name: 'ariaLabel',
        type: 'string',
        description: '无障碍读屏标签名称。',
      },
    ],
  },
  'dialog-bindpage': {
    docPath: 'guide/lifecycle-routing',
    summaryPoints: [
      '开启 bindPage: true 后，路由跳转到新页面时原页面的弹窗会自动隐藏。',
      '当用户回退返回原页面时，弹窗自动恢复展示；支持 History 自动跟踪与 observer 手动接入。',
    ],
    keyParams: [
      {
        name: 'bindPage',
        type: 'boolean',
        defaultVal: 'true (custom/attach/loading)',
        description: '是否将弹窗生命周期绑定到当前激活路由页面。',
      },
      {
        name: 'SmartDialog.observer',
        type: 'SmartNavigatorObserver',
        description: '可手动调用 didPush/didReplace/didPop 同步框架路由。',
      },
    ],
  },
  'dialog-carry-result': {
    docPath: 'features/custom-dialog',
    summaryPoints: [
      '每次 show() 都返回 Promise<T | undefined>，默认在退出动画完成后携带 result 解析。',
      '无需回调函数嵌套，直接 const ok = await SmartDialog.show<boolean>(...) 同步编写业务流。',
    ],
    keyParams: [
      {
        name: 'dismiss(result)',
        type: '<T>(result?: T) => Promise<void>',
        description: '传入返回值即可让调用处的 await SmartDialog.show<T>() 拿到强类型结果。',
      },
      {
        name: 'awaitOverType',
        type: 'SmartAwaitOverType',
        defaultVal: 'dialogDismiss',
        description: '控制 Promise 何时 resolve：dialogDismiss / dialogAppear / none。',
      },
    ],
  },
  'dialog-permanent': {
    docPath: 'guide/concepts',
    summaryPoints: [
      'permanent: true 锁定弹窗：普通 dismiss()、点击遮罩与 Esc 均无法关闭。',
      '需强制关闭时必须显式传 dismiss({ tag }) 或 dismiss({ force: true })。',
    ],
    keyParams: [
      {
        name: 'permanent',
        type: 'boolean',
        defaultVal: 'false',
        description: '常驻锁保护，避免强提醒被误关。',
      },
    ],
  },
  'dialog-animation': {
    docPath: 'features/custom-dialog',
    summaryPoints: [
      '通过 animationBuilder 接管 Web Animations API，实现任意弹性、翻转或物理曲线动效。',
      '通过 animationTime 或 nonAnimationTypes 精细控制开/关动画耗时或局部免动画。',
    ],
    keyParams: [
      {
        name: 'animationBuilder',
        type: '(controller, child, animationParam) => HTMLElement | void',
        description: '绑定 animationParam.onForward 与 onDismiss 触发自定义动画。',
      },
      {
        name: 'animationTime',
        type: 'SmartDuration',
        defaultVal: '260ms',
        description: '支持数字毫秒或 Duration.milliseconds(ms)。',
      },
    ],
  },
  'dialog-bindwidget': {
    docPath: 'guide/lifecycle-routing',
    summaryPoints: [
      'bindWidget（别名 bindElement）通过 MutationObserver 监测目标 DOM 是否从文档销毁。',
      '一旦宿主页签/抽屉被卸载，绑定的悬浮窗会立刻自动关闭清理，彻底消灭僵尸弹窗。',
    ],
    keyParams: [
      {
        name: 'bindWidget / bindElement',
        type: 'SmartTargetRef',
        description: '支持传入 HTMLElement、CSS 选择器、React/Vue Ref（useBindWidget）。',
      },
    ],
  },
  'dialog-hardclose': {
    docPath: 'guide/concepts',
    summaryPoints: [
      '对比 SmartDialogController.refresh() 原地刷新内容与多弹窗堆叠强拆策略。',
      '在弹窗内直接调用 dismiss({ force: true, status: SmartStatus.allDialog }) 一次退场。',
    ],
    keyParams: [
      {
        name: 'controller',
        type: 'SmartDialogController',
        description: '调用 controller.refresh() 可不关闭弹窗直接重绘内容。',
      },
      {
        name: 'force',
        type: 'boolean',
        defaultVal: 'false',
        description: '传 force: true 连同 permanent 常驻弹窗一起移除。',
      },
    ],
  },
  'attach-location': {
    docPath: 'features/attach-spotlight',
    summaryPoints: [
      '围绕锚点元素四周精确贴靠定位，适合 Popover、Tooltip 与筛选面板。',
      '通过 config.attach.attachAlignmentType 可在 outside / center / inside 间全局切换。',
    ],
    keyParams: ATTACH_BASE_PARAMS,
  },
  'attach-point': {
    docPath: 'features/attach-spotlight',
    summaryPoints: [
      '无固定锚点 DOM 时，传入 targetBuilder 返回点击位置 new Offset(e.clientX, e.clientY)。',
      '常用于鼠标右键自定义上下文菜单、长按操作浮窗或画布点击气泡。',
    ],
    keyParams: [
      {
        name: 'targetBuilder',
        type: '(offset, size) => SmartOffset',
        description: '实时计算并返回锚定坐标点（支持 Offset 实例）。',
      },
      {
        name: 'keepSingle',
        type: 'boolean',
        description: '快速重点击空白处时平滑移动并刷新同一浮窗实例。',
      },
    ],
  },
  'attach-target': {
    docPath: 'features/attach-spotlight',
    summaryPoints: [
      '除了直接贴靠元素外，targetBuilder 也可返回固定边缘坐标（如视口左侧 x=0）。',
      '配合 centerLeft / centerRight 可做出贴边滑出的浮动工具条。',
    ],
    keyParams: ATTACH_BASE_PARAMS,
  },
  'attach-imitate': {
    docPath: 'features/attach-spotlight',
    summaryPoints: [
      '结合 attachAlignmentType.outside 与输入框宽度匹配，快速实现下拉联想菜单。',
      '借助 nonAnimationTypes 可关闭部分过渡帧获得更跟手的下拉响应。',
    ],
    keyParams: [
      ...ATTACH_BASE_PARAMS,
      {
        name: 'nonAnimationTypes',
        type: 'SmartNonAnimationType[]',
        description: '按需跳过打开/关闭/继续 keepSingle 等特定场景动画。',
      },
    ],
  },
  'attach-business': {
    docPath: 'features/attach-spotlight',
    summaryPoints: [
      '内置点击下拉筛选、带箭头卡片与外部异步刷新列表交互模式。',
      '配合 maskColor: "transparent" 或浅黑遮罩灵活适配业务级联筛选面板。',
    ],
    keyParams: ATTACH_BASE_PARAMS,
  },
  'attach-guide': {
    docPath: 'features/attach-spotlight',
    summaryPoints: [
      'highlightBuilder 返回 rect 或 circle 挖空坐标，库自动渲染 SVG evenodd 聚光灯遮罩。',
      '多步引导时传入 keepSingle: true 可让高亮孔位从第一步无缝过渡到第二步。',
    ],
    keyParams: [
      {
        name: 'highlightBuilder',
        type: '(offset, size) => HighlightRegion | HTMLElement',
        description: '定义高光镂空区域、圆角与 shape（rect / circle）。',
      },
      {
        name: 'nonAnimationTypes',
        type: 'SmartNonAnimationType[]',
        description: '开启 continueKeepSingle 让引导卡片切换更连贯。',
      },
    ],
  },
  'attach-scale-point': {
    docPath: 'features/attach-spotlight',
    summaryPoints: [
      '默认气泡从中心放大；使用 scalePointBuilder 可将 transform-origin 锚定到气泡尖角或边缘。',
      '搭配 topRight / bottomLeft 菜单时，动画从按钮角落自然生长出来。',
    ],
    keyParams: [
      {
        name: 'scalePointBuilder',
        type: '(selfSize) => SmartOffset',
        description: '根据弹出面板自身尺寸返回缩放原点 Offset(x, y)。',
      },
    ],
  },
  'attach-adjust': {
    docPath: 'features/attach-spotlight',
    summaryPoints: [
      '气泡贴靠视口底部或右侧可能溢屏：adjustBuilder 允许检测 selfOffset 后返回新方位。',
      '同时可在 AttachAdjustParam 中替换带反向指示箭头的 builder，实现完美防裁切。',
    ],
    keyParams: [
      {
        name: 'adjustBuilder',
        type: '(param: AttachParam) => AttachAdjustParam',
        description: '检测溢屏边界并返回修正后的 alignment 与可选新 builder。',
      },
    ],
  },
  'loading-default': {
    docPath: 'features/toast-loading-notify',
    summaryPoints: [
      'Loading 位于第 4 独立层，绝不会被底层的 Custom 业务弹窗遮挡。',
      '全局单例管理，统一用 SmartDialog.dismiss({ status: SmartStatus.loading }) 关闭。',
    ],
    keyParams: [
      {
        name: 'msg',
        type: 'string',
        description: '加载提示文字，支持 --fsd-bg / --fsd-loading-radius 等 CSS 变量换肤。',
      },
    ],
  },
  'loading-param': {
    docPath: 'features/toast-loading-notify',
    summaryPoints: [
      '演示 Loading 层专属的 maskColor、usePenetrate 穿透操作以及定时 displayTime。',
      '设置 usePenetrate: true 时可做不锁页面操作栏的后台同步提示。',
    ],
    keyParams: [
      {
        name: 'usePenetrate',
        type: 'boolean',
        defaultVal: 'false',
        description: 'Loading 期间是否仍允许点击底层其他按钮。',
      },
      {
        name: 'backType',
        type: 'SmartBackType',
        defaultVal: 'normal',
        description: '加载期间按 Esc 键时是否拦截（SmartBackType.block 防止中途关闭）。',
      },
    ],
  },
  'loading-custom': {
    docPath: 'guide/theming-styling',
    summaryPoints: [
      '在 SmartDialog.init({ loadingBuilder }) 全局定制或单次传 builder 自定义旋转动效。',
      '支持随时返回原生的 SVG / Lottie / 品牌动画元素。',
    ],
    keyParams: [
      {
        name: 'loadingBuilder',
        type: '(msg: string) => SmartContent',
        description: '传入 SmartDialog.init() 全局覆盖默认 Loading 卡片样式。',
      },
    ],
  },
  'loading-least-time': {
    docPath: 'features/toast-loading-notify',
    summaryPoints: [
      '极快接口在 50ms 返回会导致 Loading 一闪而逝产生频闪感。',
      '设置 SmartDialog.config.loading.leastLoadingTime 保证至少展示最短时长后再平滑关停。',
    ],
    keyParams: [
      {
        name: 'config.loading.leastLoadingTime',
        type: 'SmartDuration',
        defaultVal: '0',
        description: '最短保底展示时间（毫秒或 Duration 实例）。',
      },
    ],
  },
  'toast-default': {
    docPath: 'features/toast-loading-notify',
    summaryPoints: [
      '第 5 最高层，直接 SmartDialog.showToast("文案") 即可一句触发。',
      '移动端软键盘弹起时会自动读取 VisualViewport 偏移，防止被输入法挡住。',
    ],
    keyParams: [
      {
        name: 'msg',
        type: 'string',
        description: '提示文案，支持短字符串直传或对象选项。',
      },
    ],
  },
  'toast-custom': {
    docPath: 'guide/theming-styling',
    summaryPoints: [
      '通过 builder（单次）或 SmartDialog.init({ toastBuilder })（全局）完全定制气泡外观。',
      '也可仅改 --fsd-toast-radius 等 CSS 变量实现轻量主题调整。',
    ],
    keyParams: [
      {
        name: 'toastBuilder',
        type: '(msg: string) => SmartContent',
        description: '全局默认 Toast UI 工厂。',
      },
    ],
  },
  'toast-type': {
    docPath: 'features/toast-loading-notify',
    summaryPoints: [
      '完整演示 4 种 SmartToastType 队列行为：normal 排队、last 替换、onlyRefresh 刷新计时、multi 并行多条。',
      '依据场景选对队列策略可消除海量 toast 排队“延迟几分钟消失”的痛点。',
    ],
    keyParams: [
      {
        name: 'displayType',
        type: 'SmartToastType',
        defaultVal: 'normal',
        description: '可选 normal / last / onlyRefresh / multi。',
      },
    ],
  },
  'toast-smart': {
    docPath: 'features/toast-loading-notify',
    summaryPoints: [
      '对比不同位置 alignment 与多条并行 Toast 组合；同时演示 dismiss({ status: SmartStatus.allToast })。',
    ],
    keyParams: [
      {
        name: 'alignment',
        type: 'Alignment',
        defaultVal: 'Alignment.bottomCenter',
        description: '自定义 Toast 出现在顶部、中部或底部安全区。',
      },
    ],
  },
  'toast-interval': {
    docPath: 'features/toast-loading-notify',
    summaryPoints: [
      '设置 SmartDialog.config.toast.intervalTime 可在最短间隔内过滤高频连续误触发的提示。',
    ],
    keyParams: [
      {
        name: 'config.toast.intervalTime',
        type: 'SmartDuration',
        defaultVal: '0',
        description: '相邻两条 Toast 间最短冷却阈值。',
      },
    ],
  },
  'other-trick': {
    docPath: 'guide/concepts',
    summaryPoints: [
      '演示多弹窗间相互通信与跨层驱动更新的实用技巧。',
      '可作为侧栏/工具条与居中预览画布协同操作的范本。',
    ],
    keyParams: CUSTOM_BASE_PARAMS,
  },
  'framework-react': {
    docPath: 'guide/frameworks',
    summaryPoints: [
      'React 18/19 必须挂载 <SmartDialogProvider>，弹窗 JSX 通过 Portal 继承根组件 Context。',
      '搭配 useSmartDialog / useSmartDialogController / useBindWidget 获得完备的类型推导。',
    ],
    keyParams: [
      {
        name: 'SmartDialogProvider',
        type: 'React.FC<SmartDialogProviderProps>',
        description: '顶层 Portal 容器，接收与 SmartDialog.init 一致的全局配置。',
      },
      {
        name: 'useBindWidget<T>()',
        type: '() => RefObject<T | null>',
        description: '用于组件销毁自动关弹窗与 Attach targetContext 锚定。',
      },
    ],
  },
  'framework-vue': {
    docPath: 'guide/frameworks',
    summaryPoints: [
      'Vue 3 支持 app.use(SmartDialogPlugin) 或局部挂载 <SmartDialogProvider>，继承 Pinia 与 provide/inject。',
      '所有 VNode / h() 返回值通过原生 Teleport 渲染进 5 层容器。',
    ],
    keyParams: [
      {
        name: 'SmartDialogPlugin',
        type: 'Plugin<[SmartInitOptions?]>',
        description: '注册全局 $smartDialog 属性与 <SmartDialogProvider /> 组件。',
      },
      {
        name: 'useSmartDialog()',
        type: '() => typeof VueSmartDialog',
        description: '组合式 API 内直接调用类型安全弹窗方法。',
      },
    ],
  },
};

export function getDemoGuide(demo: DemoEntry): DemoGuideInfo {
  if (demo.docPath || demo.summaryPoints || demo.keyParams) {
    const fallback = DEMO_GUIDE_BY_ID[demo.id];
    return {
      docPath: demo.docPath ?? fallback?.docPath ?? 'guide/getting-started',
      summaryPoints: demo.summaryPoints ?? fallback?.summaryPoints ?? [demo.description],
      keyParams: demo.keyParams ?? fallback?.keyParams ?? [],
    };
  }
  if (demo.category === 'notify') {
    const fallback = DEMO_GUIDE_BY_ID[demo.id];
    return (
      fallback ?? {
        docPath: 'features/toast-loading-notify',
        summaryPoints: [
          'Notify 属于第 3 层语义横幅，常用于操作成功/预警/校验错误状态通知。',
          '可通过 SmartDialog.init({ notifyStyle }) 全局自定义 5 种语义 UI。',
        ],
        keyParams: NOTIFY_PARAMS,
      }
    );
  }
  return (
    DEMO_GUIDE_BY_ID[demo.id] ?? {
      docPath: 'features/toast-loading-notify',
      summaryPoints: [demo.description],
      keyParams: [],
    }
  );
}
