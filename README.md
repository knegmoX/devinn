# AI笔记DevInn - 智能旅行规划助手

> 基于 Gemini 2.5 Pro 的智能旅行规划助手，让旅行规划变得简单高效

## 🎯 项目概述

AI笔记DevInn 是一个创新的旅行规划应用，用户只需分享几个旅行内容链接（小红书、B站等），AI就能自动分析内容并生成个性化的旅行计划，包含详细行程、航班酒店推荐等。

### 核心特性

- 🤖 **智能内容分析**: 自动解析小红书、B站等平台的旅行内容
- 🎯 **个性化规划**: 基于用户偏好生成定制化旅行方案  
- ⚡ **实时优化**: AI助手随时调整行程和路线
- 📱 **响应式设计**: 完美适配移动端和桌面端
- 🔄 **动态文档**: 交互式旅行计划展示

## 🛠 技术栈

### 前端
- **Next.js 15** - React 全栈框架
- **React 19** - 用户界面库
- **TypeScript 5.x** - 类型安全
- **Tailwind CSS** - 样式框架
- **Zustand** - 状态管理
- **Lucide React** - 图标库

### 后端
- **Gemini 2.5 Pro** - AI 核心引擎 (via Vertex AI)
- **Prisma** - 数据库 ORM
- **PostgreSQL** - 主数据库
- **Redis** - 缓存层

### 开发工具
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Jest** - 单元测试
- **Playwright** - E2E 测试

## 🚀 快速开始

### 环境要求

- Node.js 18.x 或更高版本
- npm 或 yarn
- PostgreSQL 数据库
- Redis (可选，用于缓存)
- Google Cloud Platform 账户 (用于 Gemini API)

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd devinn
```

2. **安装依赖**
```bash
npm install
```

3. **环境配置**
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑环境变量
nano .env.local
```

4. **配置环境变量**
```env
# 数据库
DATABASE_URL="postgresql://username:password@localhost:5432/devinn"

# Google Cloud Platform
GOOGLE_CLOUD_PROJECT="cloud-llm-preview3"
GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account-key.json"

# Redis 缓存
REDIS_URL="redis://localhost:6379"

# 其他配置...
```

5. **数据库设置**
```bash
# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev --name init

# (可选) 填充种子数据
npx prisma db seed
```

6. **启动开发服务器**
```bash
npm run dev
```

应用将在 http://localhost:3000 启动

## 📁 项目结构

```
devinn/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 首页
│   ├── components/            # 可复用组件
│   │   ├── ui/               # 基础 UI 组件
│   │   ├── forms/            # 表单组件
│   │   ├── travel/           # 旅行相关组件
│   │   └── ai/               # AI 相关组件
│   ├── lib/                  # 工具库
│   │   └── utils.ts          # 通用工具函数
│   ├── hooks/                # 自定义 Hooks
│   ├── stores/               # 状态管理
│   │   └── useAppStore.ts    # 主应用状态
│   ├── types/                # TypeScript 类型定义
│   │   └── index.ts          # 核心类型
│   └── services/             # 服务层
│       ├── ai/               # AI 服务
│       │   └── GeminiService.ts
│       └── content/          # 内容提取服务
│           ├── ContentExtractionService.ts
│           └── extractors/   # 平台提取器
│               ├── XHSExtractor.ts
│               ├── BilibiliExtractor.ts
│               ├── DouyinExtractor.ts
│               └── MafengwoExtractor.ts
├── prisma/                   # 数据库配置
│   └── schema.prisma         # 数据库模式
├── tests/                    # 测试文件
│   ├── unit/                # 单元测试
│   ├── integration/         # 集成测试
│   └── e2e/                 # 端到端测试
└── docs/                    # 项目文档
```

## 🔧 开发指南

### 可用脚本

```bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器

# 代码质量
npm run lint         # 运行 ESLint
npm run type-check   # TypeScript 类型检查

# 测试
npm test            # 运行单元测试
npm run test:watch  # 监听模式运行测试
npm run test:e2e    # 运行 E2E 测试

# 数据库
npx prisma studio   # 打开数据库管理界面
npx prisma migrate dev  # 运行数据库迁移
npx prisma generate # 生成 Prisma 客户端
```

### 代码规范

项目使用 ESLint 和 Prettier 确保代码质量：

```bash
# 检查代码规范
npm run lint

# 自动修复
npm run lint:fix

# 格式化代码
npm run format
```

## 🧪 测试

### 测试策略

采用测试金字塔模型：
- **70% 单元测试** - 测试独立功能模块
- **20% 集成测试** - 测试模块间交互
- **10% E2E 测试** - 测试完整用户流程

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test -- GeminiService.test.ts

# 生成覆盖率报告
npm run test:coverage

# 运行 E2E 测试
npm run test:e2e
```

## 📊 性能指标

### 目标指标

- **首屏加载时间**: < 2秒
- **内容提取时间**: < 30秒  
- **AI生成时间**: < 60秒
- **页面交互响应**: < 100ms
- **API响应时间**: < 500ms

### 性能监控

```bash
# 性能测试
npm run test:performance

# 构建分析
npm run analyze
```

## 🚀 部署

### 生产环境部署

1. **构建应用**
```bash
npm run build
```

2. **环境变量配置**
确保生产环境的环境变量正确配置

3. **数据库迁移**
```bash
npx prisma migrate deploy
```

4. **启动应用**
```bash
npm start
```

### Docker 部署

```bash
# 构建镜像
docker build -t devinn .

# 运行容器
docker run -p 3000:3000 devinn
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建过程或辅助工具的变动
```

## 📝 更新日志

### v0.1.0 (2024-08-24)

#### ✨ 新功能
- 🎉 项目初始化和基础架构搭建
- 🤖 集成 Gemini 2.5 Pro AI 服务
- 📱 实现内容提取系统（支持小红书、B站、抖音、马蜂窝）
- 🎨 创建响应式用户界面
- 📊 建立状态管理系统
- 🗄️ 设计数据库架构

#### 🛠 技术改进
- ⚡ 使用 Next.js 15 和 React 19
- 🎯 TypeScript 全面类型安全
- 🎨 Tailwind CSS 样式系统
- 📦 Zustand 状态管理
- 🔧 完整的开发工具链

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 全栈框架
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI 核心引擎
- [Tailwind CSS](https://tailwindcss.com/) - 样式框架
- [Prisma](https://www.prisma.io/) - 数据库工具

## 📞 联系我们

- 项目主页: [GitHub Repository]
- 问题反馈: [GitHub Issues]
- 邮箱: contact@devinn.ai

---

**AI笔记DevInn** - 让旅行规划变得简单高效 ✈️
