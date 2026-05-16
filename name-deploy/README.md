# 名字评测网站 - 部署说明

## ECS 前置环境（首次部署时安装，只需一次）

### 1. 安装 Node.js 18+

以下命令请逐条执行：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### 2. 安装 PM2

以下命令请逐条执行：

```bash
npm install -g pm2
pm2 startup
```

按照提示执行输出的命令（用于开机自启）

### 3. 安装 MySQL 8.0

以下命令请逐条执行：

```bash
sudo apt update
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 4. 创建数据库

```bash
sudo mysql
```

进入 MySQL 后执行：

```sql
CREATE DATABASE name_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '你的密码';
FLUSH PRIVILEGES;
EXIT;
```

---

## 部署步骤

### 1. 上传文件到 ECS

将整个 `name-deploy/` 文件夹上传到 ECS（替换为你的 ECS IP）：

```bash
scp -r name-deploy/ root@你的ECS_IP:/root/
```

### 2. 配置环境变量

以下命令请逐条执行：

```bash
cd /root/name-deploy
cp .env.example app/.env
nano app/.env
```

填入真实值：
- `DATABASE_URL`：替换 `你的MySQL密码` 为步骤 4 中设置的密码
- `DEEPSEEK_API_KEY`：填入真实 Key
- `MINIMAX_API_KEY`：填入真实 Key（如使用 minimax）

### 3. 运行部署脚本

```bash
bash /root/name-deploy/deploy.sh
```

脚本自动完成：安装依赖 → 数据库迁移 → 构建 → 启动

---

## 更新代码

重新上传 `name-deploy/` 后执行：

```bash
bash /root/name-deploy/deploy.sh
```

---

## 常用命令

```bash
pm2 status               # 查看运行状态
pm2 logs name-website    # 查看日志
pm2 restart name-website # 手动重启
pm2 stop name-website    # 停止服务
```

---

## 开放端口

在阿里云控制台 → 安全组，添加**入方向**规则：

| 端口 | 用途 |
|------|------|
| 3000 | 直接访问网站 |
| 80   | 如配置 Nginx 反向代理 |
