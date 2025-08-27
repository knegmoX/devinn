#!/bin/bash

# AI笔记DevInn - Nginx动态部署脚本
# 配置nginx代理到Next.js开发服务器，支持d.loov.cc域名访问

set -e

echo "🚀 开始配置 AI笔记DevInn Nginx动态代理"
echo "目标域名: d.loov.cc"
echo "后端服务: localhost:3000 (Next.js开发服务器)"

# 检查是否为root用户
if [[ $EUID -eq 0 ]]; then
   echo "⚠️  检测到root用户，将直接配置系统nginx"
   NGINX_CONF_DIR="/etc/nginx/sites-available"
   NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
   USE_SUDO=""
else
   echo "📋 检测到普通用户，将使用sudo权限"
   USE_SUDO="sudo"
fi

# 检查nginx是否安装
if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx未安装，正在安装..."
    $USE_SUDO apt update
    $USE_SUDO apt install -y nginx
    echo "✅ Nginx安装完成"
else
    echo "✅ Nginx已安装"
fi

# 检查Next.js服务器是否运行
echo "🔍 检查Next.js开发服务器状态..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Next.js开发服务器运行正常 (localhost:3000)"
else
    echo "⚠️  Next.js开发服务器未运行，请先启动："
    echo "   cd devinn && npm run dev"
    echo "   或者运行: nohup npm run dev > server.log 2>&1 &"
    read -p "是否继续配置nginx? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 备份现有nginx配置
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    echo "📦 备份默认nginx配置..."
    $USE_SUDO cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup.$(date +%Y%m%d_%H%M%S)
fi

# 复制nginx配置文件
echo "📝 配置nginx..."
$USE_SUDO cp nginx-dynamic.conf /etc/nginx/sites-available/devinn-dynamic

# 创建符号链接启用站点
if [ -f "/etc/nginx/sites-enabled/devinn-dynamic" ]; then
    echo "🔄 更新现有配置..."
    $USE_SUDO rm /etc/nginx/sites-enabled/devinn-dynamic
fi

$USE_SUDO ln -s /etc/nginx/sites-available/devinn-dynamic /etc/nginx/sites-enabled/

# 禁用默认站点（避免冲突）
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    echo "🚫 禁用默认nginx站点..."
    $USE_SUDO rm /etc/nginx/sites-enabled/default
fi

# 测试nginx配置
echo "🧪 测试nginx配置..."
if $USE_SUDO nginx -t; then
    echo "✅ Nginx配置测试通过"
else
    echo "❌ Nginx配置测试失败，请检查配置文件"
    exit 1
fi

# 创建日志目录
echo "📁 创建日志目录..."
$USE_SUDO mkdir -p /var/log/nginx
$USE_SUDO touch /var/log/nginx/devinn_dynamic_access.log
$USE_SUDO touch /var/log/nginx/devinn_dynamic_error.log
$USE_SUDO touch /var/log/nginx/devinn_dev_access.log
$USE_SUDO touch /var/log/nginx/devinn_dev_error.log

# 设置日志文件权限
$USE_SUDO chown www-data:www-data /var/log/nginx/devinn_*.log

# 重启nginx服务
echo "🔄 重启nginx服务..."
$USE_SUDO systemctl restart nginx

# 检查nginx状态
if $USE_SUDO systemctl is-active --quiet nginx; then
    echo "✅ Nginx服务运行正常"
else
    echo "❌ Nginx服务启动失败"
    $USE_SUDO systemctl status nginx
    exit 1
fi

# 获取服务器信息
HOSTNAME=$(hostname)
INTERNAL_IP=$(hostname -I | awk '{print $1}')
EXTERNAL_IP=$(curl -s ifconfig.me || echo "无法获取")

echo ""
echo "🎉 AI笔记DevInn Nginx动态代理配置完成！"
echo ""
echo "📊 服务器信息:"
echo "   主机名: $HOSTNAME"
echo "   内网IP: $INTERNAL_IP"
echo "   外网IP: $EXTERNAL_IP"
echo ""
echo "🌐 访问地址:"
echo "   主域名: http://d.loov.cc/"
echo "   开发端口: http://d.loov.cc:8080/"
echo "   直接访问: http://$INTERNAL_IP/"
echo ""
echo "📄 页面链接:"
echo "   • 主页: http://d.loov.cc/"
echo "   • 演示: http://d.loov.cc/demo"
echo "   • 创建笔记: http://d.loov.cc/notes/create"
echo ""
echo "🔧 API端点:"
echo "   • 内容提取: http://d.loov.cc/api/content/extract"
echo "   • AI分析: http://d.loov.cc/api/ai/analyze"
echo "   • 旅行规划: http://d.loov.cc/api/ai/generate-plan"
echo "   • AI推荐: http://d.loov.cc/api/ai/recommend"
echo "   • 航班搜索: http://d.loov.cc/api/booking/flights/search"
echo "   • 酒店搜索: http://d.loov.cc/api/booking/hotels/search"
echo ""
echo "📋 管理命令:"
echo "   • 查看nginx状态: sudo systemctl status nginx"
echo "   • 重启nginx: sudo systemctl restart nginx"
echo "   • 查看nginx日志: sudo tail -f /var/log/nginx/devinn_dynamic_access.log"
echo "   • 查看错误日志: sudo tail -f /var/log/nginx/devinn_dynamic_error.log"
echo "   • 测试nginx配置: sudo nginx -t"
echo ""
echo "⚠️  重要提醒:"
echo "   • 确保Next.js开发服务器在localhost:3000运行"
echo "   • 如需SSL证书，请配置nginx-dynamic.conf中的SSL部分"
echo "   • 生产环境建议启用HTTPS重定向"
echo ""
echo "🔍 测试连接:"
echo "   curl -I http://d.loov.cc/"
echo "   curl -I http://d.loov.cc/api/content/extract"

# 测试连接
echo ""
echo "🧪 正在测试连接..."
if curl -s -I http://localhost/ | grep -q "200 OK"; then
    echo "✅ HTTP连接测试成功"
else
    echo "⚠️  HTTP连接测试失败，请检查配置"
fi

echo ""
echo "🎯 配置完成！AI笔记DevInn现在可以通过 http://d.loov.cc 访问"
