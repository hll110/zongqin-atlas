# 中华宗亲称谓图谱

> 传承千年礼仪文化，明晰血脉亲缘关系

一个覆盖 **Web 端 + 微信小程序端** 的中国亲属称谓智能查询系统。收录 **334+** 条核心亲属关系数据，支持自然语言查询、可视化族谱图谱、分类浏览、南北地域差异对比、速查表截图等功能。

---

## 项目概述

中国亲属称谓体系是世界上最复杂的亲属称谓系统之一，区分辈分、父系/母系、长幼、性别、血亲/姻亲等多个维度。本项目旨在通过现代化的技术手段，将这套复杂的称谓体系以直观、易用的方式呈现，帮助用户快速查找和理解各种亲属关系的正确称呼。

---

## 系统架构

```
┌──────────────────────────────────────────────────────────────────┐
│                        用户访问层                                  │
├───────────────────────────────┬──────────────────────────────────┤
│         Web 端 (SPA)          │       微信小程序端                │
│   React 19 + Vite + TailwindCSS  │   uni-app 3 + Vue 3           │
│   shadcn/ui + react-router    │   本地 JSON 数据                 │
├───────────────────────────────┼──────────────────────────────────┤
│         tRPC Client           │        独立运行                   │
│   @trpc/react-query           │   无需后端依赖                    │
└──────────────┬────────────────┴──────────────────────────────────┘
               │
┌──────────────▼────────────────┐
│         API 层                 │
│   Hono + tRPC 11.x            │
│   自然语言解析引擎              │
│   JWT 认证 (Kimi OAuth)        │
├───────────────────────────────┤
│         数据层                  │
│   Drizzle ORM + MySQL          │
│   334+ 条亲属关系种子数据       │
└───────────────────────────────┘
```

### 技术栈详情

| 层次 | 技术选型 | 说明 |
|------|---------|------|
| **前端框架** | React 19 + TypeScript | 最新 React 版本，严格类型安全 |
| **构建工具** | Vite 7 | 极速 HMR，开发体验优秀 |
| **样式方案** | Tailwind CSS 3.4 + shadcn/ui | 原子化 CSS + 高质量无头组件库 |
| **状态管理** | Zustand + React Query | 客户端状态持久化 + 服务端数据缓存 |
| **路由** | react-router 7 | 声明式路由，懒加载页面 |
| **后端框架** | Hono 4 | 轻量高性能 Web 框架 |
| **API 协议** | tRPC 11 | 端到端类型安全的 API 调用 |
| **ORM** | Drizzle ORM 0.45 | 类型安全的 SQL 查询构建器 |
| **数据库** | MySQL 8 | 关系型数据库，存储亲属关系数据 |
| **认证** | Kimi OAuth + JWT (jose) | 第三方 OAuth 认证 |
| **小程序** | uni-app 3 + Vue 3 | 跨平台小程序框架 |

---

## 核心功能

### 1. AI 智能称呼查询

输入自然语言描述，系统自动解析关系链并返回精确结果：

```
输入: "爸爸的哥哥的儿子怎么称呼？"

输出:
├─ 标准称呼: 堂兄/堂弟
├─ 口语称呼: 堂哥/堂弟
├─ 辈分关系: 平辈
├─ 地域差异: 北方叫"堂哥"，南方叫"堂兄"
└─ 关系说明: 伯父的儿子，同宗同辈
```

**技术实现**：基于关键词模式匹配的自然语言解析引擎，支持 60+ 种关系词汇识别，支持性别/视角/辈分多维解析。

### 2. 可视化族谱图谱

- **Web 端**：SVG 交互式绘制，鼠标拖拽移动、滚轮缩放（0.3x ~ 3x）
- **小程序端**：Canvas 2D 渲染，触摸拖拽、双指缩放
- 节点 hover/点击高亮，父系/母系/配偶/姻亲分类过滤
- 五辈分层次展示：祖辈 → 父辈 → 平辈 → 子辈 → 孙辈

### 3. 分类浏览

按亲属类型分为五大类，支持辈分筛选：

| 分类 | 数量 | 示例 |
|------|------|------|
| 父系亲属 | 80+ | 祖父、伯父、叔父、堂兄弟、侄子女 |
| 母系亲属 | 50+ | 外祖父母、舅父、姨母、表兄弟 |
| 夫妻亲属 | 40+ | 公婆、岳父母、大伯子、小姑子 |
| 姻亲 | 70+ | 嫂子、弟媳、姐夫、妹夫、亲家 |
| 旁系亲属 | 30+ | 伯祖父、叔祖父、堂伯父 |

### 4. 南北地域差异

- **16 组核心称谓对照**：如 大爷 vs 伯伯、姥爷 vs 外公、姥姥 vs 外婆
- **6 大方言区特色**：粤语区、闽南语区、吴语区、西南官话区、东北官话区、湘语区

### 5. 亲属关系速查表

- **Web 端**：使用 html2canvas 一键截图保存 PNG
- **小程序端**：长按复制单条信息

### 6. 深色模式

- **Web 端**：全局切换，zustand 持久化用户偏好
- **小程序端**：跟随系统主题

---

## 项目结构

```
zongqin-atlas/
├── api/                        # 后端 API
│   ├── boot.ts                 # 服务入口 (Hono)
│   ├── router.ts               # tRPC 路由聚合
│   ├── kinship-router.ts       # 亲属关系 API (CRUD + 自然语言查询)
│   ├── auth-router.ts          # 认证相关 API
│   ├── middleware.ts           # tRPC 中间件
│   ├── context.ts              # 请求上下文
│   ├── kimi/                   # Kimi OAuth 集成
│   ├── queries/                # 数据库查询层
│   └── lib/                    # 工具库 (env/cookies/http)
├── src/                        # 前端 React 应用
│   ├── main.tsx                # 应用入口
│   ├── App.tsx                 # 路由配置
│   ├── pages/                  # 页面组件
│   │   ├── Home.tsx            # 首页
│   │   ├── GenealogyTree.tsx   # 族谱图谱
│   │   ├── SmartQuery.tsx      # 智能查询
│   │   ├── Categories.tsx      # 分类浏览
│   │   ├── RegionalDiff.tsx    # 地域差异
│   │   ├── QuickRef.tsx        # 速查表
│   │   └── Login.tsx           # 登录页
│   ├── components/             # 公共组件
│   │   └── ui/                 # shadcn/ui 组件库
│   ├── hooks/                  # 自定义 Hooks
│   ├── providers/              # tRPC Provider
│   └── lib/                    # 工具函数
├── contracts/                  # 前后端共享类型
├── db/                         # 数据库层
│   ├── schema.ts               # Drizzle ORM 表结构
│   ├── relations.ts            # 表关系定义
│   └── seed.ts                 # 334 条种子数据
├── miniapp/                    # 微信小程序 (独立项目)
│   ├── pages/                  # 7 个小程序页面
│   ├── common/                 # 数据逻辑层 + JSON 数据
│   ├── App.vue                 # 根组件
│   └── pages.json              # 路由配置
├── vite.config.ts              # Vite 构建配置
├── drizzle.config.ts           # Drizzle Kit 配置
├── vercel.json                 # Vercel 部署配置
├── tsconfig.json               # TypeScript 配置
├── eslint.config.js            # ESLint 配置
└── package.json                # 依赖管理
```

---

## 快速开始

### 环境要求

- Node.js >= 20
- MySQL 8.x
- npm

### 安装与运行

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填入 DATABASE_URL 等配置

# 3. 推送数据库表结构
npm run db:push

# 4. 导入种子数据（334 条亲属关系）
npx tsx db/seed.ts

# 5. 启动开发服务器（前端 + 后端同时启动）
npm run dev
```

访问 http://localhost:3000 即可使用。

### 环境变量

```env
# 数据库（必填）
DATABASE_URL=mysql://user:pass@host:3306/database

# OAuth 认证（可选，不填则无法使用登录功能）
APP_ID=your-app-id
APP_SECRET=your-app-secret
VITE_KIMI_AUTH_URL=https://auth.kimi.com
VITE_APP_ID=your-app-id
KIMI_AUTH_URL=https://auth.kimi.com
KIMI_OPEN_URL=https://open.kimi.com

# 管理员（可选）
OWNER_UNION_ID=admin-union-id
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（前端 + 后端） |
| `npm run build` | 构建生产环境 |
| `npm run lint` | ESLint 代码检查 |
| `npm run check` | TypeScript 类型检查 |
| `npm run format` | Prettier 代码格式化 |
| `npm run test` | 运行单元测试 (Vitest) |
| `npm run db:push` | 推送数据库结构 |
| `npm run db:generate` | 生成数据库迁移文件 |
| `npm run db:migrate` | 执行数据库迁移 |

---

## 双端功能对照

| 功能 | Web 端 | 微信小程序 |
|------|--------|-----------|
| 智能查询 | 自然语言输入，实时解析匹配 | 自然语言输入，本地解析 |
| 族谱图谱 | SVG 交互式（鼠标拖拽/滚轮缩放） | Canvas 2D（触摸拖拽/双指缩放） |
| 分类浏览 | 父系/母系/夫妻/姻亲/旁系 + 辈分筛选 | 同上 |
| 地域差异 | 16 组南北对照 + 6 大方言区 | 同上 |
| 速查表 | html2canvas 一键截图保存 PNG | 长按复制 |
| 深色模式 | 全局切换，zustand 持久化 | 跟随系统 |
| 数据来源 | MySQL 数据库 (API) | 本地 JSON 文件 |
| 用户认证 | Kimi OAuth 登录 | 微信登录 |

---

## 微信小程序

小程序端是独立项目，位于 `miniapp/` 目录，使用本地 JSON 数据运行，无需后端依赖。

### 运行方式

**方式一：HBuilderX（推荐）**

1. 下载 [HBuilderX](https://www.dcloud.io/hbuilderx.html)
2. 打开 `miniapp/` 文件夹
3. 菜单：运行 → 运行到小程序模拟器 → 微信开发者工具

**方式二：CLI**

```bash
cd miniapp
npm install
npm run dev:mp-weixin
```

---

## 部署

### Vercel 部署（推荐）

项目已配置 `vercel.json`，支持一键部署：

```bash
# 通过 Vercel CLI
vercel --prod
```

注意：Vercel 部署为纯前端静态站点，API 功能需要配合外部数据库服务（如 PlanetScale）。

### Docker 部署

```bash
# 构建镜像
docker build -t zongqin-atlas .

# 运行容器
docker run -p 3000:3000 --env-file .env zongqin-atlas
```

---

## 设计风格

| 元素 | 取值 | 说明 |
|------|------|------|
| 主色 | `#F5F0E6` 宣纸白 | 传统宣纸质感底色 |
| 强调色 | `#9D2933` 朱砂红 | 传统印章、喜庆红 |
| 辅色 | `#4A5742` 竹青 | 自然清雅 |
| 文字色 | `#2C2A25` 墨黑 | 毛笔墨色 |
| 字体 | Noto Serif SC | 宋体衬线，书卷气 |
| 风格 | 新中式国风 | 水墨留白、圆角卡片、磨砂玻璃 |

---

## API 接口

基于 tRPC 协议，所有接口类型安全。

| 接口 | 方法 | 说明 |
|------|------|------|
| `kinship.list` | Query | 分页查询亲属关系列表，支持分类/辈分/性别/关键词筛选 |
| `kinship.getById` | Query | 按 ID 获取单条关系详情 |
| `kinship.search` | Query | 关键词搜索（模糊匹配多字段） |
| `kinship.getByCategory` | Query | 按分类获取关系列表 |
| `kinship.getRegionalVariations` | Query | 获取某关系的南北方言差异 |
| `kinship.getStats` | Query | 获取统计数据（总数、分类统计、辈分统计） |
| `kinship.naturalQuery` | Mutation | 自然语言智能查询 |
| `auth.*` | - | 用户认证相关接口 |

---

## 数据覆盖

共计 **334+** 条亲属关系数据：

| 类别 | 数量 | 包含内容 |
|------|------|---------|
| 父系亲属 | 80+ | 祖辈/父辈/平辈/子辈/孙辈 + 堂亲/姑亲 |
| 母系亲属 | 50+ | 外祖/舅父/姨母 + 表亲 |
| 夫妻亲属 | 40+ | 公婆/岳父母/大伯子/小叔子/大舅子 |
| 姻亲 | 70+ | 嫂子/弟媳/姐夫/妹夫/儿媳/女婿/亲家 |
| 旁系亲属 | 30+ | 伯祖父/叔祖父/堂伯父 |
| 方言差异 | 60+ | 粤语/闽南语/吴语/西南官话/东北官话/湘语 |

每条数据包含：关系路径、书面称呼、口语称呼、北方称呼、南方称呼、方言变体、辈分、性别、分类、关系链、使用说明。

---

## License

MIT
