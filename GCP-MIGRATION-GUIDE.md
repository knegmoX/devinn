# DevInn GCP VM 迁移指南

## 概述

本指南提供了将DevInn项目从当前开发服务器迁移到GCP VM (movieclip-vm) 的完整步骤。所有相关的开发文档和部署配置已推送到GitHub仓库。

## GitHub仓库信息

- **仓库地址**: https://github.com/knegmoX/devinn
- **克隆命令**: `git clone https://github.com/knegmoX/devinn.git`
- **最新提交**: 包含所有开发文档和GCP部署配置

## 已推送的关键文档

### 📋 项目核心文档
- `README.md` - 完整的项目文档和安装指南
- `PROJECT-RELEASE-SUMMARY.md` - v1.0.0版本发布总结
- `package.json` - 项目依赖和脚本配置

### 🚀 部署相关文档
- `GCP-VM-DEPLOYMENT-PLAN.md` - GCP VM部署详细计划
- `FINAL-GCP-DEPLOYMENT-STATUS.md` - 部署状态和限制说明
- `DEPLOYMENT-GUIDE.md` - 通用部署指南
- `INTERNAL-TESTING-DEPLOYMENT.md` - 内部测试部署说明

### 🔧 配置文件
- `next.config.js` - Next.js动态配置
- `nginx.conf` / `nginx-http-only.conf` - Nginx配置文件
- `deploy-nginx-dynamic.sh` - Nginx部署脚本
- `.env.example` - 环境变量模板

### 📚 开发文档
- `TASK-001-CREATE-NOTE-PAGE.md` - 笔记创建页面开发
- `TASK-002-CONTENT-EXTRACTION.md` - 内容提取功能
- `TASK-003-ADDITIONAL-EXTRACTORS.md` - 额外提取器
- `TASK-004-GEMINI-AI-INTEGRATION.md` - Gemini AI集成
- `TASK-005-DYNAMIC-TRAVEL-DOCUMENT.md` - 动态旅行文档
- `TASK-006-FLIGHT-HOTEL-INTEGRATION.md` - 航班酒店集成
- `TASK-007-INTEGRATION-DEMO.md` - 集成演示

## GCP VM 迁移步骤

### 1. 环境准备

```bash
# 在GCP VM上安装必要软件
sudo apt update
sudo apt install -y nodejs npm nginx git

# 安装Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装PM2
sudo npm install -g pm2
```

### 2. 项目部署

```bash
# 克隆项目
git clone https://github.com/knegmoX/devinn.git
cd devinn

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 添加必要的API密钥

# 构建项目
npm run build

# 使用PM2启动
pm2 start npm --name "devinn" -- start
pm2 save
pm2 startup
```

### 3. Nginx配置

```bash
# 复制nginx配置
sudo cp nginx-http-only.conf /etc/nginx/sites-available/devinn
sudo ln -s /etc/nginx/sites-available/devinn /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启nginx
sudo systemctl restart nginx
```

### 4. 防火墙配置

```bash
# 在GCP控制台创建防火墙规则
# 或使用gcloud命令
gcloud compute firewall-rules create devinn-http \
    --allow tcp:80 \
    --source-ranges 0.0.0.0/0 \
    --target-tags movieclip-server \
    --description "Allow HTTP traffic for DevInn"
```

## 环境变量配置

在GCP VM上需要配置以下环境变量：

```bash
# .env.local
GOOGLE_AI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_API_URL=http://your-vm-ip
NODE_ENV=production
```

## 验证部署

1. **应用访问**: `http://your-vm-ip`
2. **API端点测试**: `http://your-vm-ip/api/health`
3. **功能测试**: 创建笔记、内容提取、AI分析

## 监控和维护

```bash
# 查看应用状态
pm2 status
pm2 logs devinn

# 查看nginx状态
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log

# 更新应用
cd devinn
git pull origin main
npm install
npm run build
pm2 restart devinn
```

## 故障排除

### 常见问题

1. **端口冲突**: 确保3000端口未被占用
2. **权限问题**: 检查文件权限和nginx用户权限
3. **API密钥**: 验证Gemini API密钥配置正确
4. **防火墙**: 确保GCP防火墙规则正确配置

### 日志位置

- **应用日志**: `~/.pm2/logs/`
- **Nginx日志**: `/var/log/nginx/`
- **系统日志**: `/var/log/syslog`

## 性能优化

1. **启用gzip压缩** (已在nginx配置中)
2. **配置缓存策略**
3. **监控资源使用**
4. **定期更新依赖**

## 安全考虑

1. **定期更新系统**
2. **配置SSL证书** (生产环境)
3. **限制API访问**
4. **监控异常访问**

## 联系信息

如遇到部署问题，请参考GitHub仓库中的详细文档或提交Issue。

---

**最后更新**: 2025-08-27
**版本**: v1.0.0
**状态**: 准备迁移
