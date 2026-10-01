// Homepage copy. The two languages share one layout (src/components/Home.astro); keep the keys in step.
// Numbers come from brain/results (G18b release, bench v25); update both languages together.

export const APP_DOWNLOAD = 'https://github.com/deskmind-ai/app/releases/latest';

const en = {
  lang: 'en',
  title: 'DeskMind: open-source AI computer use for your Mac',
  description:
    'DeskMind is an open-source AI agent that operates your Mac: small local models (MLX) see the screen, decide each step with a probability for every option, and ask when a task is ambiguous. Free Mac app, models and code.',
  docs: '/docs/',
  quickstart: '/docs/start/quickstart/',
  other: { href: '/zh/', label: '中文' },
  nav: { how: 'How it works', cases: 'Use cases', results: 'Results', docs: 'Docs', download: 'Download for Mac' },
  homeLabel: 'DeskMind home',
  navLabel: 'Main',
  footerLabel: 'Footer',
  hero: {
    eyebrow: 'Open-source computer use for your Mac',
    title: ['Small enough to run on your Mac.', ' Smart enough to ask'],
    lead: 'DeskMind reads the screen, works out the next step and acts, all with a small model on your Mac. When a task could mean two things, it asks you instead of guessing.',
    github: 'View on GitHub',
    meta: 'macOS 15+ · Apple Silicon · free and open source',
    posterAlt: 'DeskMind asks which of two matching orders to use, and a person types the answer',
    play: 'Watch the demo · 56 s',
    playLabel: 'Play the 56-second demo',
    video: '/video/demo-en.mp4',
    caption: 'Real recording, released model. Two orders match “Lisa Wong”, so it asks first.',
  },
  diff: {
    title: 'What makes it different',
    cards: [
      {
        title: 'A small model, on your Mac',
        body: 'A 0.8B model decides each step and a 4B checks the hard ones. Both run on your Mac: no cloud round-trip, no per-step bill.',
        proof: '0.8B decides in ~0.5 s · 4B checks in ~3.6 s',
      },
      {
        title: 'System One: choices, not guesses',
        body: 'Each step is a multiple-choice question: the model scores every option instead of writing text, so each one gets a probability. Unsure steps go to the 4B or to you, and any agent can call it through <code>/v1/systemone</code>.',
        proof: 'No generated text · 0 false “done” in 39 real-desktop runs',
      },
      {
        title: 'Open, from eyes to hands',
        body: 'Eyes, Brain, Hands and the Mac app are all open source, along with Bench, which grades them. Every result lists its sample size, so you can reproduce it.',
        proof: '5 repositories · Apache-2.0 code',
      },
    ],
  },
  how: {
    title: 'How it works',
    lead: 'One loop, three parts, packaged in one app. A separate bench measures the whole loop on a real desktop.',
    eyes: 'Sees the screen. Finds the target when there is no accessibility tree.',
    brain: 'Decides the next step: a probability for every option, a question when unsure.',
    hands: 'Acts on your desktop and checks the result before calling it done.',
    app: 'All of it, in one Mac app: permissions, models and the run loop, ready to use.',
    bench: 'Measured on a real desktop. Sandbox tasks with graders that check the final state, not the agent’s word.',
  },
  cases: {
    title: 'Three real runs',
    lead: 'Recorded with the released model. Waits are shortened in the videos; nothing else is cut.',
    items: [
      {
        img: '/assets/shots/ask.jpg',
        alt: 'The question card: two Lisa Wong orders, which one should I use',
        title: 'Two orders match — it asks which one before writing',
        goal: '“Find Lisa Wong’s order in records.txt and add it to ledger.csv as Date, Customer, Order, Amount, then save.”',
        note: 'Guessing would write the wrong row. Asking costs one sentence.',
      },
      {
        img: '/assets/shots/live.jpg',
        alt: 'NetEase Cloud Music playing the live version, account details blurred',
        title: 'Find a song’s live version and play it',
        goal: '“Open NetEase Cloud Music, search Billie Eilish’s BIRDS OF A FEATHER and play the live version.”',
        note: 'No API, only pixels: it reads the screen and picks the live track from look-alike results.',
      },
      {
        img: '/assets/shots/copy.jpg',
        alt: 'A parts table in Safari copied into parts.csv in TextEdit, highest quantity first',
        title: 'Copy a web table into a CSV file, then save and close it',
        goal: '“Open parts.csv from the attached folder, append the table’s four rows sorted by Qty from high to low, then save and close it.”',
        note: 'Across two apps: read in Safari, open the file from a folder, write, save, close.',
      },
    ],
  },
  results: {
    title: 'Results, with the sample size',
    lead: 'Measured on one Mac (M4 Pro, 48 GB) with the released 0.8B → 4B router. Small samples; we say where it still fails.',
    stats: [
      ['39/39', 'real-desktop runs passed, strict graders (bench v25, 13 tasks × 3)'],
      ['0', 'times it said “done” when the task was not done (same 39 runs)'],
      ['0.835', 'JevBench public items, 4B model (231 items; no sealed score yet)'],
    ],
    hardTitle: 'Still hard',
    hard: [
      'Copying long tables (more than about four rows) or filtered rows',
      'Filling a form from a photographed receipt',
      'Steps the 4B has to check take a few seconds',
    ],
    howTitle: 'How we measure',
    how: 'Graders check the final state of files and apps. Every attempt counts, environment failures are listed, and the bench is open.',
    more: 'All results and methods →',
  },
  faq: {
    title: 'Questions people ask first',
    more: 'All questions →',
    href: '/docs/start/faq/',
    items: [
      ['Does anything leave my Mac?', 'The app itself only goes online to download the models. After that, every decision runs on your Mac and the model servers listen on 127.0.0.1 only. Apps it operates for you, such as Safari, use the network as usual.'],
      ['Which Macs does it run on?', 'Apple Silicon with macOS 15 or later. The decision models use about 7 GB of memory while running; Macs with less than 12 GB get a warning.'],
      ['How big is the download?', 'About 5.3 GB of models on first run, checked file by file. If Hugging Face is slow, the app switches to the ModelScope mirror by itself.'],
      ['Can it do something I did not want?', 'It shows each step, asks before sending, deleting, paying or publishing, stops on ⌘. and pauses when you touch the mouse or keyboard. It can still make mistakes, so start with tasks you can check.'],
      ['Is it free?', 'Yes. The app, code and models are free. Code is Apache-2.0; model weights follow the terms on each model card.'],
    ],
  },
  cta: {
    mascotAlt: 'Xiaofang, the DeskMind companion, with a task done',
    title: 'See. Think. Act.',
    lead: '得心，应手。 Download the app, or start with the models and the code.',
    download: 'Download for Mac',
    quickstart: 'Read the quickstart',
    meta: 'macOS 15+ · Apple Silicon · signed and notarized',
  },
  footer: {
    licence: 'Code under Apache-2.0, docs under CC BY 4.0. Model weights, base models and datasets follow their own terms.',
    docs: 'Docs',
    discussions: 'Discussions',
    faq: 'FAQ',
    security: 'Security',
    brand: 'Brand',
  },
};

export type HomeCopy = typeof en;

const zh: HomeCopy = {
  lang: 'zh-CN',
  title: 'DeskMind：在你的 Mac 上替你操作电脑的开源 AI',
  description: 'DeskMind 是全栈开源的电脑操作 AI（computer use）：本地小模型在你的 Mac 上看屏幕、决定每一步、给出每个选项的概率，任务有歧义时先问你。Mac App、模型和代码免费。',
  docs: '/zh/docs/',
  quickstart: '/zh/docs/start/quickstart/',
  other: { href: '/', label: 'English' },
  nav: { how: '工作原理', cases: '真实用例', results: '成绩', docs: '文档', download: '下载 Mac App' },
  homeLabel: 'DeskMind 首页',
  navLabel: '主导航',
  footerLabel: '页脚导航',
  hero: {
    eyebrow: '全栈开源 · 在你的 Mac 上替你操作电脑',
    title: ['小到能在你的 Mac 上跑，', '聪明到知道该问你'],
    lead: 'DeskMind 会看屏幕、想下一步、动手操作，靠的是跑在你 Mac 上的小模型。任务有两种理解时，它先问你一句，不瞎猜。',
    github: '在 GitHub 上查看',
    meta: 'macOS 15 及以上 · Apple Silicon · 免费开源',
    posterAlt: 'DeskMind 发现两笔订单都匹配，先问用哪一笔，由真人输入回答',
    play: '观看演示 · 56 秒',
    playLabel: '播放 56 秒演示',
    video: '/video/demo-zh.mp4',
    caption: '真实录屏，发布版模型。两笔订单都叫 Lisa Wong，所以它先问。',
  },
  diff: {
    title: '和别的电脑操作 AI 有什么不同',
    cards: [
      {
        title: '小模型，就在你的 Mac 上',
        body: '每一步先由 0.8B 判断，难的再交给 4B 复核。两个模型都在本机运行，不走云端，也不按次付费。',
        proof: '0.8B 判断约 0.5 秒 · 4B 复核约 3.6 秒',
      },
      {
        title: 'System One：选择，不是猜',
        body: '每一步是一道选择题，模型给每个选项打分而不是写文字，所以每个选项都有概率。没把握就交给 4B 或先问你，任何 agent 都能通过 <code>/v1/systemone</code> 接入。',
        proof: '不生成文字 · 39 次真机运行零误报完成',
      },
      {
        title: '从眼到手，全部开源',
        body: 'Eyes、Brain、Hands 和 Mac App 全部开源，连同给它们打分的 Bench。每个成绩都附样本量，可以自己复现。',
        proof: '5 个仓库 · 代码 Apache-2.0',
      },
    ],
  },
  how: {
    title: '工作原理',
    lead: '一个循环，三个部分，装在一个 App 里。另有一套评测，在真实桌面上衡量整个循环。',
    eyes: '看清屏幕。在没有辅助功能信息的应用里，也能找到要点的位置。',
    brain: '想好下一步：每个选项都有概率，拿不准就先问。',
    hands: '在桌面上动手，宣布完成前先核对结果。',
    app: '一个 App，开箱即用：系统权限、模型和运行循环都装好了。',
    bench: '真实桌面上的公开评测。沙箱任务配评分程序，看最终状态，不听 agent 自己说。',
  },
  cases: {
    title: '三段真实运行',
    lead: '用发布版模型录制。视频里只缩短了等待，其他一律不剪。',
    items: [
      {
        img: '/assets/shots/ask.jpg',
        alt: '提问卡片：两笔 Lisa Wong 订单，该用哪一笔',
        title: '两笔订单都叫 Lisa Wong，它先问你要哪一笔，再写入',
        goal: '「在 records.txt 里找到 Lisa Wong 的订单，按 Date、Customer、Order、Amount 追加进 ledger.csv 并保存。」',
        note: '猜错就会写错一行；先问一句就能避免。',
      },
      {
        img: '/assets/shots/live.jpg',
        alt: '网易云音乐正在播放现场版，账号信息已打码',
        title: '在网易云音乐里，找到歌曲的现场版并播放',
        goal: '「打开网易云音乐，搜索 Billie Eilish 的 BIRDS OF A FEATHER，播放现场版。」',
        note: '没有接口，只能看屏幕：在一堆同名歌曲里认出现场版。',
      },
      {
        img: '/assets/shots/copy.jpg',
        alt: '把 Safari 里的零件表按数量从高到低抄进 TextEdit 的 parts.csv',
        title: '把网页上的零件表抄进 CSV 文件，保存并关闭',
        goal: '「用 TextEdit 打开附带文件夹里的 parts.csv，把表格的四行按数量从高到低追加进去，然后保存并关闭。」',
        note: '跨两个应用：在 Safari 里读，从文件夹打开文件，写入、保存、关闭。',
      },
    ],
  },
  results: {
    title: '成绩，附样本量',
    lead: '在一台 Mac（M4 Pro，48 GB）上，用发布版 0.8B → 4B 路由测得。样本不大，做不好的地方也写在下面。',
    stats: [
      ['39/39', '次真机运行全部通过，严格评分（bench v25，13 个任务 × 3 次）'],
      ['0', '次没做完却说完成（同样 39 次运行）'],
      ['0.835', 'JevBench 公开题，4B 模型（231 题；密封题成绩待出）'],
    ],
    hardTitle: '还做不好的',
    hard: ['抄写长表格（超过约四行）或按条件筛选的行', '根据收据图片填写报销表单', '需要 4B 复核的步骤要几秒钟'],
    howTitle: '我们怎么测',
    how: '评分程序检查文件和应用的最终状态。每次尝试都计入，环境故障单独列出，评测本身开源。',
    more: '全部成绩和方法 →',
  },
  faq: {
    title: '大家最先问的问题',
    more: '全部常见问题 →',
    href: '/zh/docs/start/faq/',
    items: [
      ['会有数据离开我的 Mac 吗？', 'App 自己只在下载模型时联网。之后每一步决策都在你的 Mac 上完成，模型服务只监听 127.0.0.1。它替你操作的应用（比如 Safari）照常联网。'],
      ['哪些 Mac 能用？', 'Apple Silicon 芯片、macOS 15 及以上。决策模型运行时约占 7 GB 内存，内存小于 12 GB 的 Mac 会收到提示。'],
      ['要下载多少东西？', '第一次运行时下载约 5.3 GB 模型，逐个文件校验。Hugging Face 慢的话，App 会自动改从 ModelScope 镜像下载。'],
      ['它会不会做我不想做的事？', '它边做边显示每一步；发送、删除、付款、发布前会先问你；按 ⌘. 停止，碰一下鼠标或键盘就暂停。它仍然会出错，建议先从你能检查结果的任务开始。'],
      ['免费吗？', '免费。App、代码和模型都免费。代码采用 Apache-2.0，模型权重遵循各模型卡上的条款。'],
    ],
  },
  cta: {
    mascotAlt: '小方：任务完成',
    title: '得心，应手。',
    lead: 'See. Think. Act. 下载 App，或者从模型和代码开始。',
    download: '下载 Mac App',
    quickstart: '阅读快速上手',
    meta: 'macOS 15 及以上 · Apple Silicon · 已签名并公证',
  },
  footer: {
    licence: '代码采用 Apache-2.0，文档采用 CC BY 4.0；模型权重、基座模型和数据集遵循各自条款。',
    docs: '文档',
    discussions: '讨论区',
    faq: '常见问题',
    security: '安全',
    brand: '品牌',
  },
};

export const home = { en, zh };
