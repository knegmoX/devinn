# AI笔记DevInn - d.loov.cc 部署指南

## 🎯 专为您的域名定制的部署方案

本指南专门为域名 `d.loov.cc` 定制，提供完整的部署步骤。

## 📋 部署前检查清单

### ✅ 已准备就绪的文件
- **静态网站文件**: `/devinn/out/` 目录（已生成）
- **Nginx配置**: `nginx.conf`（已更新为 d.loov.cc）
- **部署文档**: 本指南

### 🔧 服务器要求
- Ubuntu/Debian 或 CentOS/RHEL 服务器
- Nginx 1.18+ 
- 具有 sudo 权限的用户账户
- 域名 `d.loov.cc` 已指向您的服务器IP

## 🚀 详细部署步骤

### 第1步：上传静态文件到服务器

```bash
# 在本地执行（从 devinn 目录）
# 方法1：使用 scp
scp -r ./out/* username@your-server-ip:/tmp/devinn-static/

# 方法2：使用 rsync（推荐）
rsync -avz --progress ./out/ username@your-server-ip:/tmp/devinn-static/

# 在服务器上执行
sudo mkdir -p /var/www/devinn
sudo mv /tmp/devinn-static/* /var/www/devinn/out/
sudo chown -R www-data:www-data /var/www/devinn
sudo chmod -R 755 /var/www/devinn
```

### 第2步：安装和配置 Nginx

```bash
# 更新系统包
sudo apt update

# 安装 Nginx
sudo apt install nginx -y

# 启动并启用 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 检查 Nginx 状态
sudo systemctl status nginx
```

### 第3步：配置 Nginx 站点

```bash
# 上传 nginx 配置文件
scp ./nginx.conf username@your-server-ip:/tmp/

# 在服务器上配置
sudo cp /tmp/nginx.conf /etc/nginx/sites-available/d.loov.cc

# 启用站点
sudo ln -s /etc/nginx/sites-available/d.loov.cc /etc/nginx/sites-enabled/

# 删除默认站点（可选）
sudo rm -f /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
sudo nginx -t

# 如果测试通过，重新加载 Nginx
sudo systemctl reload nginx
```

### 第4步：设置 SSL 证书（Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取 SSL 证书
sudo certbot --nginx -d d.loov.cc -d www.d.loov.cc

# 设置自动续期
sudo crontab -e
# 添加以下行：
# 0 12 * * * /usr/bin/certbot renew --quiet

# 测试自动续期
sudo certbot renew --dry-run
```

### 第5步：验证部署

```bash
# 检查网站状态
curl -I https://d.loov.cc

# 检查 Nginx 日志
sudo tail -f /var/log/nginx/devinn_access.log
sudo tail -f /var/log/nginx/devinn_error.log

# 检查 SSL 证书
openssl s_client -connect d.loov.cc:443 -servername d.loov.cc
```

## 🌐 访问您的应用

部署完成后，您可以通过以下URL访问：

- **主页**: https://d.loov.cc/
- **演示页面**: https://d.loov.cc/demo/
- **创建笔记**: https://d.loov.cc/notes/create/

## 🔧 故障排除

### 常见问题及解决方案

#### 1. 域名无法访问
```bash
# 检查域名解析
nslookup d.loov.cc
dig d.loov.cc

# 检查防火墙
sudo ufw status
sudo ufw allow 'Nginx Full'
```

#### 2. SSL 证书问题
```bash
# 检查证书状态
sudo certbot certificates

# 强制续期证书
sudo certbot renew --force-renewal
```

#### 3. 静态文件404错误
```bash
# 检查文件权限
ls -la /var/www/devinn/out/

# 修复权限
sudo chown -R www-data:www-data /var/www/devinn
sudo chmod -R 755 /var/www/devinn
```

#### 4. Nginx 配置错误
```bash
# 检查配置语法
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

## 📊 性能优化建议

### 1. 启用 HTTP/2
已在配置中启用，确保使用 HTTPS。

### 2. 配置缓存
静态资源已配置1年缓存，提升加载速度。

### 3. 监控设置
```bash
# 安装监控工具
sudo apt install htop iotop -y

# 监控 Nginx 进程
sudo htop -p $(pgrep nginx)
```

## 🔒 安全配置

### 1. 防火墙设置
```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw status
```

### 2. 定期更新
```bash
# 设置自动安全更新
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📈 监控和维护

### 1. 日志轮转
```bash
# 检查日志轮转配置
sudo cat /etc/logrotate.d/nginx
```

### 2. 性能监控
```bash
# 监控磁盘使用
df -h

# 监控内存使用
free -h

# 监控网络连接
sudo netstat -tulpn | grep nginx
```

## 🎯 部署验证清单

完成部署后，请验证以下项目：

- [ ] https://d.loov.cc 可以正常访问
- [ ] https://d.loov.cc/demo 演示页面正常
- [ ] https://d.loov.cc/notes/create 创建页面正常
- [ ] SSL 证书有效且自动续期已设置
- [ ] 静态资源（CSS、JS、图片）正常加载
- [ ] 页面间导航正常工作
- [ ] 移动端响应式设计正常
- [ ] 页面加载速度满意
- [ ] 安全头部已正确设置
- [ ] 日志记录正常工作

## 🆘 紧急联系

如果遇到部署问题：

1. **检查服务状态**: `sudo systemctl status nginx`
2. **查看错误日志**: `sudo tail -f /var/log/nginx/error.log`
3. **验证配置**: `sudo nginx -t`
4. **重启服务**: `sudo systemctl restart nginx`

## 🎉 恭喜！

您的 AI笔记DevInn 应用现在已在 `d.loov.cc` 成功部署！

---

**部署完成时间**: 预计 15-30 分钟  
**维护建议**: 每月检查一次 SSL 证书和系统更新  
**备份建议**: 定期备份 `/var/www/devinn` 目录
