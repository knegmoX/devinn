# Cloudflare域名配置指南 - d.loov.cc

## 🌐 概览

本指南将帮助您在Cloudflare中配置d.loov.cc域名，使其指向AI笔记DevInn服务器，并启用CDN、SSL等功能。

---

## 📋 前提条件

### 服务器信息
- **服务器IP**: `34.80.213.213` (外网IP)
- **内网IP**: `172.16.104.203`
- **服务端口**: 80 (HTTP), 8080 (开发端口)
- **后端服务**: localhost:3000 (Next.js)

### 域名信息
- **主域名**: d.loov.cc
- **子域名**: www.d.loov.cc
- **当前状态**: 已在服务器配置nginx反向代理

---

## 🚀 Cloudflare配置步骤

### 步骤1: 添加站点到Cloudflare

1. **登录Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com/
   - 使用您的Cloudflare账户登录

2. **添加站点**
   ```
   点击 "Add a Site" 按钮
   输入域名: d.loov.cc
   选择计划: Free (免费计划即可)
   点击 "Continue"
   ```

3. **扫描DNS记录**
   - Cloudflare会自动扫描现有DNS记录
   - 如果没有现有记录，可以手动添加

### 步骤2: 配置DNS记录

在Cloudflare DNS管理页面添加以下记录：

#### A记录配置
```
类型: A
名称: @
内容: 34.80.213.213
代理状态: 已代理 (橙色云朵图标)
TTL: Auto
```

#### CNAME记录配置
```
类型: CNAME
名称: www
内容: d.loov.cc
代理状态: 已代理 (橙色云朵图标)
TTL: Auto
```

#### 可选的开发子域名
```
类型: A
名称: dev
内容: 34.80.213.213
代理状态: 已代理 (橙色云朵图标)
TTL: Auto
```

### 步骤3: 更新域名服务器

1. **获取Cloudflare名称服务器**
   - 在Cloudflare中查看分配的名称服务器
   - 通常格式为: `xxx.ns.cloudflare.com`

2. **在域名注册商处更新**
   - 登录您的域名注册商控制面板
   - 将名称服务器更改为Cloudflare提供的服务器
   - 保存更改

3. **等待DNS传播**
   - DNS更改通常需要24-48小时完全传播
   - 可以使用在线工具检查DNS传播状态

---

## 🔧 Cloudflare功能配置

### SSL/TLS设置

1. **访问SSL/TLS页面**
   ```
   Dashboard → SSL/TLS → Overview
   ```

2. **选择加密模式**
   ```
   推荐设置: "Flexible" 或 "Full"
   
   - Flexible: Cloudflare到用户HTTPS，Cloudflare到服务器HTTP
   - Full: 端到端加密 (需要服务器SSL证书)
   ```

3. **启用Always Use HTTPS**
   ```
   Dashboard → SSL/TLS → Edge Certificates
   开启 "Always Use HTTPS"
   ```

### 缓存设置

1. **缓存级别**
   ```
   Dashboard → Caching → Configuration
   缓存级别: Standard
   ```

2. **页面规则 (Page Rules)**
   ```
   规则1: d.loov.cc/api/*
   设置: Bypass Cache
   
   规则2: d.loov.cc/_next/static/*
   设置: Cache Everything, Edge Cache TTL: 1 month
   
   规则3: d.loov.cc/*
   设置: Cache Level: Standard
   ```

### 安全设置

1. **防火墙规则**
   ```
   Dashboard → Security → WAF
   启用 "Managed Rules"
   ```

2. **速率限制**
   ```
   Dashboard → Security → Rate Limiting
   创建规则:
   - 路径: /api/*
   - 限制: 100 requests per minute per IP
   ```

3. **Bot Fight Mode**
   ```
   Dashboard → Security → Bots
   启用 "Bot Fight Mode"
   ```

---

## 🌟 高级配置

### 性能优化

1. **Auto Minify**
   ```
   Dashboard → Speed → Optimization
   启用: JavaScript, CSS, HTML
   ```

2. **Brotli压缩**
   ```
   Dashboard → Speed → Optimization
   启用 "Brotli"
   ```

3. **Rocket Loader**
   ```
   Dashboard → Speed → Optimization
   启用 "Rocket Loader" (可选)
   ```

### 负载均衡 (Pro计划及以上)

如果需要高可用性：

```
Dashboard → Traffic → Load Balancing
创建负载均衡器:
- 名称: devinn-lb
- 主机名: d.loov.cc
- 源池: 
  - 主服务器: 34.80.213.213:80
  - 备用服务器: (如有)
```

---

## 📊 监控和分析

### Analytics设置

1. **Web Analytics**
   ```
   Dashboard → Analytics & Logs → Web Analytics
   启用免费的Web Analytics
   ```

2. **Real User Monitoring**
   ```
   Dashboard → Speed → Optimization
   启用 "Real User Monitoring"
   ```

### 日志配置

1. **Logpush (Enterprise)**
   ```
   Dashboard → Analytics & Logs → Logs
   配置日志推送到外部服务
   ```

---

## 🔍 验证和测试

### DNS验证
```bash
# 检查DNS解析
nslookup d.loov.cc
dig d.loov.cc

# 检查CNAME
nslookup www.d.loov.cc
```

### SSL验证
```bash
# 检查SSL证书
curl -I https://d.loov.cc/
openssl s_client -connect d.loov.cc:443 -servername d.loov.cc
```

### 性能测试
```bash
# 测试响应时间
curl -w "@curl-format.txt" -o /dev/null -s https://d.loov.cc/

# 测试API端点
curl -I https://d.loov.cc/api/content/extract
```

---

## 🛠️ 服务器端配置调整

### Nginx配置更新

由于启用了Cloudflare代理，需要更新nginx配置以获取真实IP：

```nginx
# 在nginx配置中添加
real_ip_header CF-Connecting-IP;
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 131.0.72.0/22;
```

### SSL重定向配置

如果启用了Cloudflare的SSL：

```nginx
# 检查Cloudflare的SSL状态
if ($http_cf_visitor ~ '{"scheme":"https"}') {
    set $ssl_redirect 1;
}

# 重定向HTTP到HTTPS (如果需要)
if ($ssl_redirect != 1) {
    return 301 https://$server_name$request_uri;
}
```

---

## 📱 移动端优化

### AMP支持 (可选)
```
Dashboard → Speed → Optimization
启用 "AMP Real URL"
```

### 图片优化
```
Dashboard → Speed → Optimization
启用 "Polish" (Pro计划)
启用 "Mirage" (Pro计划)
```

---

## 🚨 故障排除

### 常见问题

1. **522错误 (Connection timed out)**
   ```
   检查服务器防火墙设置
   确认nginx正在运行
   验证端口80/443是否开放
   ```

2. **525错误 (SSL handshake failed)**
   ```
   检查SSL/TLS设置
   确认服务器SSL证书配置
   尝试使用"Flexible"SSL模式
   ```

3. **DNS解析问题**
   ```
   检查DNS记录配置
   等待DNS传播完成
   清除本地DNS缓存
   ```

### 调试命令
```bash
# 检查Cloudflare IP
curl -H "Host: d.loov.cc" http://34.80.213.213/

# 检查SSL握手
openssl s_client -connect d.loov.cc:443

# 检查HTTP头
curl -I https://d.loov.cc/
```

---

## 📈 性能监控

### 关键指标
- **响应时间**: < 200ms (通过Cloudflare CDN)
- **缓存命中率**: > 80%
- **SSL握手时间**: < 100ms
- **DNS解析时间**: < 50ms

### 监控工具
- Cloudflare Analytics
- GTmetrix
- Pingdom
- WebPageTest

---

## 🎯 配置完成检查清单

- [ ] DNS记录已添加 (A记录和CNAME)
- [ ] 名称服务器已更新
- [ ] SSL/TLS已配置
- [ ] 缓存规则已设置
- [ ] 安全功能已启用
- [ ] 性能优化已配置
- [ ] 服务器nginx已更新
- [ ] 域名解析正常
- [ ] HTTPS访问正常
- [ ] API端点可访问

---

## 📞 支持资源

### Cloudflare文档
- [DNS管理](https://developers.cloudflare.com/dns/)
- [SSL/TLS配置](https://developers.cloudflare.com/ssl/)
- [缓存配置](https://developers.cloudflare.com/cache/)

### 联系支持
- Cloudflare社区: https://community.cloudflare.com/
- 官方文档: https://developers.cloudflare.com/

---

**🌐 配置完成后，d.loov.cc将通过Cloudflare CDN提供更快、更安全的访问体验！**

*配置指南版本: 1.0*  
*适用于: AI笔记DevInn项目*  
*更新时间: 2025-08-26*
