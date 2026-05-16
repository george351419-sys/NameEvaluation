# 阿里云 ECS 部署方案设计

**日期**: 2026-05-16  
**状态**: 已审核

---

## 背景

当前项目为名字评测网站（Next.js 16 + Prisma + SQLite），需要打包成可上传至阿里云 ECS 的部署包，并将数据库从 SQLite 迁移到 MySQL（安装在同一台 ECS 上）。

---

## 目标

1. 在 `/Users/bessie/cursor/name/` 下新建 `name-deploy/` 文件夹
2. 包含完整源码（排除 `node_modules`、`.next`、`dev.db`）
3. Prisma 数据源从 SQLite 改为 MySQL
4. 提供 `.env.example` 环境变量模板（不含真实 Key）
5. 提供 `deploy.sh` 一键部署脚本
6. 提供 PM2 进程管理配置
7. 提供部署说明 README

---

## 文件夹结构

```
name-deploy/
├── app/                        ← Next.js 源码
│   ├── app/                    ← 页面和 API 路由
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── prisma/
│   │   ├── schema.prisma       ← 改为 MySQL provider
│   │   └── migrations/        ← 重新生成 MySQL 迁移
│   ├── public/
│   ├── types/
│   ├── next.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
├── .env.example                ← 环境变量模板
├── ecosystem.config.js         ← PM2 配置
├── deploy.sh                   ← 一键部署脚本
└── README.md                   ← 部署说明
```

---

## 数据库迁移：SQLite → MySQL

### schema.prisma 变更

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### 迁移文件

删除原有 SQLite 迁移记录，重新生成 MySQL 兼容的迁移文件。

---

## 环境变量（.env.example）

```env
# MySQL（本机安装）
DATABASE_URL="mysql://root:你的密码@localhost:3306/name_db"

# AI 接口 Key
DEEPSEEK_API_KEY="sk-xxx"
MINIMAX_API_KEY="sk-xxx"

# 切换模型：deepseek 或 minimax
LLM_PROVIDER="deepseek"
```

---

## deploy.sh 流程

```bash
#!/bin/bash
cd app
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 start ../ecosystem.config.js
```

- 首次部署：完整执行所有步骤
- 更新代码：重新上传后再次运行，PM2 会自动重启

---

## PM2 配置（ecosystem.config.js）

```js
module.exports = {
  apps: [{
    name: 'name-website',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: './app',
    env: { NODE_ENV: 'production', PORT: 3000 }
  }]
}
```

---

## ECS 前置要求（用户手动完成）

1. 安装 Node.js 18+（推荐用 nvm）
2. 安装 MySQL 8.0，创建数据库 `name_db`
3. 安装 PM2：`npm install -g pm2`
4. 复制 `.env.example` 为 `.env`，填入真实值

---

## 不在此方案内

- Nginx 反向代理配置（可选，用于绑定域名）
- SSL 证书配置
- 防火墙规则配置
