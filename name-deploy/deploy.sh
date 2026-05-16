#!/bin/bash
set -e

echo "=========================================="
echo "  名字评测网站 - 部署脚本"
echo "=========================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$SCRIPT_DIR/app"

# 检查 .env 文件
if [ ! -f "$APP_DIR/.env" ]; then
  echo "❌ 错误：找不到 app/.env 文件"
  echo "   请先执行：cp .env.example app/.env"
  echo "   然后编辑 app/.env 填入真实的数据库密码和 API Key"
  exit 1
fi

echo ""
echo "▶ 安装依赖..."
cd "$APP_DIR"
npm install --production=false

echo ""
echo "▶ 生成 Prisma 客户端..."
npx prisma generate

echo ""
echo "▶ 执行数据库迁移..."
npx prisma migrate deploy

echo ""
echo "▶ 构建 Next.js 生产包..."
npm run build

echo ""
echo "▶ 启动/重启 PM2 服务..."
cd "$SCRIPT_DIR"
if pm2 list | grep -q "name-website"; then
  pm2 restart name-website
else
  pm2 start ecosystem.config.js
fi

pm2 save

echo ""
echo "✅ 部署完成！网站运行在 http://localhost:3000"
echo "   查看日志：pm2 logs name-website"
echo "   查看状态：pm2 status"
