# 中华宗亲称谓图谱 - 微信小程序版

## 项目简介

传统亲戚称呼智能查询小程序，覆盖父系、母系、夫妻、姻亲、旁系五大亲属模块，收录334+条核心亲属称谓。支持自然语言查询、可视化族谱图谱、南北地域差异对比、速查表等功能。

## 技术栈

- **框架**: uni-app 3.x + Vue 3
- **平台**: 微信小程序
- **样式**: SCSS + 新中式国风设计
- **数据**: 本地JSON数据库（334条亲属关系数据）

## 目录结构

```
miniapp/
├── pages/               # 页面
│   ├── index/           # 首页
│   ├── query/           # 智能查询
│   ├── tree/            # 族谱图谱（Canvas绘制）
│   ├── categories/      # 分类浏览
│   ├── regional/        # 地域差异
│   ├── quickref/        # 速查表
│   └── result/          # 详情页
├── common/              # 公共模块
│   ├── data.js          # 数据逻辑层
│   ├── kinshipData.js   # 334条亲属数据
│   └── kinshipData.json # 原始JSON
├── static/              # 静态资源
│   └── tabbar/          # TabBar图标
├── App.vue              # 应用入口
├── main.js              # Vue实例
├── pages.json           # 页面路由 + TabBar
├── manifest.json        # 小程序配置
└── uni.scss             # 全局样式变量
```

## 核心功能

1. **智能查询** - 输入自然语言，AI解析关系链，输出标准称呼+地域差异
2. **族谱图谱** - Canvas绘制的交互式族谱树，支持拖拽和双指缩放
3. **分类浏览** - 五大模块分类，按辈分筛选
4. **地域差异** - 16组南北称呼对照表 + 6大方言区特色称谓
5. **速查表** - 四大速查表，长按可复制

## 设计风格

- 主色：宣纸白 #F5F0E6、朱砂红 #9D2933
- 辅色：竹青 #4A5742、墨黑 #2C2A25
- 字体：思源宋体/Noto Serif SC
- 风格：新中式国风、留白优雅

## 开发运行

### 方式一：HBuilderX（推荐）

1. 下载 [HBuilderX](https://www.dcloud.io/hbuilderx.html)
2. 打开项目文件夹 `miniapp/`
3. 点击菜单：运行 -> 运行到小程序模拟器 -> 微信开发者工具
4. 需要安装微信开发者工具并登录

### 方式二：CLI + 微信开发者工具

> **注意**：`miniapp/` 是 uni-app **源码目录**，根目录没有 `app.json`，不能直接作为小程序项目打开。

```powershell
cd miniapp

# 安装依赖（PowerShell 若报脚本策略错误，用 npm.cmd）
npm.cmd install --include=dev

# 编译到微信小程序（保持此命令运行，支持热更新）
npm.cmd run dev:mp-weixin
```

编译成功后，在微信开发者工具中：

- **推荐**：继续打开 `miniapp` 文件夹（已配置 `miniprogramRoot` 指向 `dist/dev/mp-weixin/`）
- **或**：直接打开 `miniapp/dist/dev/mp-weixin` 文件夹

**不要**在未编译时直接打开 `miniapp` 并期望出现 `app.json`。

### 性能优化（按需注入 / 用时注入）

已在 `src/manifest.json` 的 `mp-weixin` 节点配置：

- `"lazyCodeLoading": "requiredComponents"` — 按需注入，仅加载当前页所需代码
- `"lazyloadPlaceholderEnable": true` — 配合占位组件实现用时注入

微信开发者工具请使用 **基础库 2.20.1+**，重新编译后可在「代码质量」面板确认该项已通过。

## 发布部署

1. 在 HBuilderX 中点击：发行 -> 小程序-微信
2. 编译完成后，用微信开发者工具打开 `unpackage/dist/build/mp-weixin`
3. 在微信公众平台注册小程序，获取 AppID
4. 修改 `manifest.json` 中的 `appid`
5. 上传代码 -> 提交审核 -> 发布

## 数据说明

小程序使用本地JSON数据（334条），涵盖：
- 父系亲属（祖辈、父辈、平辈、子辈、孙辈）
- 母系亲属
- 夫妻亲属
- 姻亲
- 旁系亲属
- 方言差异（粤语、闽南语、吴语、西南官话、东北官话、湘语）

## 注意事项

- 小程序包体积限制：2MB（可分包扩展到8MB）
- 当前数据内嵌在JS中，如需扩展建议使用云开发或后端API
- Canvas族谱图在部分低端机型上可能需要优化

## License

MIT
