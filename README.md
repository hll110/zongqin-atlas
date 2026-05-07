# 中华宗亲称谓图谱

> 传承千年礼仪文化，明晰血脉亲缘关系

一个覆盖 Web 端 + 微信小程序端的亲属称谓智能查询系统，收录 334+ 条核心亲属关系数据，支持自然语言查询、可视化族谱图谱、南北地域差异对比等功能。

---

## 项目结构

```
zongqin-atlas/
├── api/                    # Web 后端 - tRPC + Hono API 路由
├── contracts/              # 前后端共享类型定义
├── db/                     # 数据库 - Drizzle ORM schema + 334 条种子数据
├── src/                    # Web 前端 - React + TypeScript + Tailwind CSS
│   ├── pages/              # 页面组件（首页/族谱/查询/分类/地域/速查表）
│   ├── components/         # 公共组件（导航栏/页脚/加载屏）
│   ├── hooks/              # 自定义 Hooks（主题/认证）
│   └── providers/          # tRPC 客户端 Provider
├── miniapp/                # 微信小程序 - uni-app + Vue 3
│   ├── pages/              # 小程序页面（7 个页面）
│   ├── common/             # 数据逻辑层 + 334 条本地 JSON 数据
│   ├── static/             # TabBar 图标等资源
│   ├── App.vue             # 应用根组件
│   ├── pages.json          # 页面路由 + TabBar 配置
│   └── manifest.json       # 小程序配置
├── dist/                   # Web 构建产物
├── index.html              # Web 入口
├── package.json            # Web 依赖管理
├── vite.config.ts          # Vite 构建配置
├── tsconfig.json           # TypeScript 配置
├── drizzle.config.ts       # 数据库配置
├── .env                    # 环境变量
├── .gitignore
└── README.md               # 本文件
```

---

## 双端功能对照

| 功能 | Web 端 | 微信小程序 |
|------|--------|-----------|
| 智能查询 | 自然语言输入，AI 解析 | 自然语言输入，AI 解析 |
| 族谱图谱 | SVG 交互式（鼠标拖拽/滚轮缩放） | Canvas 2D（触摸拖拽/双指缩放） |
| 分类浏览 | 父系/母系/夫妻/姻亲/旁系 + 辈分筛选 | 同上 |
| 地域差异 | 16 组南北对照 + 6 大方言区 | 同上 |
| 速查表 | 一键截图保存 PNG | 长按复制 |
| 深色模式 | 全局切换，zustand 持久化 | 跟随系统 |

---

## Web 端技术栈

- **前端**：React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **后端**：tRPC 11.x + Hono + Drizzle ORM
- **数据库**：MySQL
- **状态管理**：zustand（主题持久化）
- **路由**：react-router
- **截图**：html2canvas

### Web 端运行

```bash
# 安装依赖
npm install

# 开发模式（前端 + 后端）
npm run dev

# 构建生产环境
npm run build

# 数据库推送
npm run db:push
```

### Web 端环境变量

```env
DATABASE_URL=mysql://user:pass@host:3306/db
VITE_API_URL=/api
VITE_KIMI_AUTH_URL=...
```

---

## 微信小程序端

- **框架**：uni-app 3.x + Vue 3
- **样式**：SCSS + 新中式国风变量系统
- **数据**：本地 JSON（334 条亲属关系）
- **图标**：自定义 TabBar 图标（uni-icon 风格）

### 小程序运行

**方式一：HBuilderX（推荐）**

1. 下载 [HBuilderX](https://www.dcloud.io/hbuilderx.html)
2. 打开项目根目录（`miniapp/` 文件夹）
3. 菜单：运行 → 运行到小程序模拟器 → 微信开发者工具

**方式二：CLI**

```bash
cd miniapp
npm install
npm run dev:mp-weixin
```

### 小程序发布

1. 在 HBuilderX 中：发行 → 小程序-微信
2. 用微信开发者工具打开 `miniapp/unpackage/dist/build/mp-weixin`
3. 在微信公众平台注册小程序，获取 AppID
4. 修改 `miniapp/manifest.json` 中的 `appid`
5. 上传代码 → 提交审核 → 发布

---

## 设计风格

- **主色**：宣纸白 `#F5F0E6`、朱砂红 `#9D2933`
- **辅色**：竹青 `#4A5742`、墨黑 `#2C2A25`
- **字体**：Noto Serif SC / Source Han Serif SC
- **风格**：新中式国风、水墨留白、圆角卡片、磨砂玻璃效果

---

## 数据覆盖

| 类别 | 数量 | 包含内容 |
|------|------|---------|
| 父系亲属 | 80+ | 祖辈/父辈/平辈/子辈/孙辈 + 堂亲/姑亲 |
| 母系亲属 | 50+ | 外祖/舅父/姨母 + 表亲 |
| 夫妻亲属 | 40+ | 公婆/岳父母/大伯子/小叔子/大舅子等 |
| 姻亲 | 70+ | 嫂子/弟媳/姐夫/妹夫/儿媳/女婿/亲家 |
| 旁系 | 30+ | 伯祖父/叔祖父/堂伯父等 |
| 方言差异 | 60+ | 粤语/闽南语/吴语/西南官话/东北官话/湘语 |

---

## 核心功能详解

### 1. 可视化族谱图谱

Web 端使用 SVG 绘制交互式族谱树，小程序端使用 Canvas 2D，均支持：
- 拖拽移动画布
- 滚轮/双指缩放（0.3x - 3x）
- 节点 hover/点击高亮
- 父系/母系/配偶/姻亲分类过滤
- 五辈分层次：祖辈 → 父辈 → 平辈 → 子辈 → 孙辈

### 2. AI 智能称呼查询

输入自然语言如：
- "我是女生，该怎么称呼爸爸的弟弟的儿子？"
- "妻子的姐姐的丈夫叫什么？"

系统自动：
1. 解析关键词关系链
2. 匹配数据库中的称谓
3. 输出：标准称呼 + 关系说明 + 辈分 + 南北差异

### 3. 南北地域差异

- 16 组核心称谓南北对照表（大爷 vs 伯伯、姥爷 vs 外公等）
- 6 大方言区特色称谓（粤语区、闽南语区、吴语区、西南官话区、东北官话区、湘语区）

### 4. 亲属关系速查表

- Web 端：html2canvas 一键截图保存 PNG
- 小程序端：长按复制单条信息

---

## License

MIT
