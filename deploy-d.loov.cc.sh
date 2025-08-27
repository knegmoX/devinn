#!/bin/bash

# AI笔记DevInn - d.loov.cc 自动部署脚本
# 使用方法: ./deploy-d.loov.cc.sh [server-ip] [username]

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
DOMAIN="d.loov.cc"
LOCAL_OUT_DIR="./out"
LOCAL_NGINX_CONF="./nginx.conf"
REMOTE_USER=${2:-"root"}
SERVER_IP=${1}

# 函数定义
print_step() {
    echo -e "${BLUE}[步骤] $1${NC}"
}

print_success() {
    echo -e "${GREEN}[成功] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[警告] $1${NC}"
}

print_error() {
    echo -e "${RED}[错误] $1${NC}"
}

check_prerequisites() {
    print_step "检查部署前提条件..."
    
    # 检查参数
    if [ -z "$SERVER_IP" ]; then
        print_error "请提供服务器IP地址"
        echo "使用方法: $0 <server-ip> [username]"
        echo "示例: $0 192.168.1.100 ubuntu"
        exit 1
    fi
    
    # 检查本地文件
    if [ ! -d "$LOCAL_OUT_DIR" ]; then
        print_error "静态文件目录 $LOCAL_OUT_DIR 不存在"
        echo "请先运行: npm run build"
        exit 1
    fi
    
    if [ ! -f "$LOCAL_NGINX_CONF" ]; then
        print_error "Nginx配置文件 $LOCAL_NGINX_CONF 不存在"
        exit 1
    fi
    
    # 检查必要工具
    command -v rsync >/dev/null 2>&1 || { print_error "需要安装 rsync"; exit 1; }
    command -v ssh >/dev/null 2>&1 || { print_error "需要安装 ssh"; exit 1; }
    
    print_success "前提条件检查通过"
}

upload_files() {
    print_step "上传静态文件到服务器..."
    
    # 创建临时目录并上传文件
    ssh $REMOTE_USER@$SERVER_IP "mkdir -p /tmp/devinn-static"
    
    rsync -avz --progress $LOCAL_OUT_DIR/ $REMOTE_USER@$SERVER_IP:/tmp/devinn-static/
    
    print_success "静态文件上传完成"
}

upload_nginx_config() {
    print_step "上传Nginx配置文件..."
    
    scp $LOCAL_NGINX_CONF $REMOTE_USER@$SERVER_IP:/tmp/nginx-devinn.conf
    
    print_success "Nginx配置文件上传完成"
}

setup_server() {
    print_step "在服务器上设置应用..."
    
    ssh $REMOTE_USER@$SERVER_IP << 'EOF'
        # 更新系统
        sudo apt update
        
        # 安装Nginx（如果未安装）
        if ! command -v nginx &> /dev/null; then
            echo "安装 Nginx..."
            sudo apt install nginx -y
        fi
        
        # 创建网站目录
        sudo mkdir -p /var/www/devinn/out
        
        # 移动静态文件
        sudo cp -r /tmp/devinn-static/* /var/www/devinn/out/
        
        # 设置权限
        sudo chown -R www-data:www-data /var/www/devinn
        sudo chmod -R 755 /var/www/devinn
        
        # 配置Nginx
        sudo cp /tmp/nginx-devinn.conf /etc/nginx/sites-available/d.loov.cc
        
        # 启用站点
        sudo ln -sf /etc/nginx/sites-available/d.loov.cc /etc/nginx/sites-enabled/
        
        # 删除默认站点
        sudo rm -f /etc/nginx/sites-enabled/default
        
        # 测试Nginx配置
        sudo nginx -t
        
        # 启动并启用Nginx
        sudo systemctl enable nginx
        sudo systemctl start nginx
        sudo systemctl reload nginx
        
        # 清理临时文件
        rm -rf /tmp/devinn-static /tmp/nginx-devinn.conf
        
        echo "服务器设置完成"
EOF
    
    print_success "服务器设置完成"
}

setup_ssl() {
    print_step "设置SSL证书..."
    
    ssh $REMOTE_USER@$SERVER_IP << EOF
        # 安装Certbot
        if ! command -v certbot &> /dev/null; then
            echo "安装 Certbot..."
            sudo apt install certbot python3-certbot-nginx -y
        fi
        
        # 获取SSL证书
        echo "获取SSL证书..."
        sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
        
        # 设置自动续期
        echo "设置SSL证书自动续期..."
        (sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -
        
        # 测试自动续期
        sudo certbot renew --dry-run
        
        echo "SSL证书设置完成"
EOF
    
    print_success "SSL证书设置完成"
}

verify_deployment() {
    print_step "验证部署..."
    
    echo "等待服务启动..."
    sleep 5
    
    # 检查HTTP响应
    if curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN | grep -q "301\|200"; then
        print_success "HTTP访问正常"
    else
        print_warning "HTTP访问可能有问题"
    fi
    
    # 检查HTTPS响应
    if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200"; then
        print_success "HTTPS访问正常"
    else
        print_warning "HTTPS访问可能有问题（SSL证书可能还在设置中）"
    fi
    
    print_success "部署验证完成"
}

show_completion_info() {
    echo ""
    echo "🎉 部署完成！"
    echo ""
    echo "您的AI笔记DevInn应用现在可以通过以下地址访问："
    echo "• 主页: https://$DOMAIN/"
    echo "• 演示: https://$DOMAIN/demo/"
    echo "• 创建笔记: https://$DOMAIN/notes/create/"
    echo ""
    echo "📊 部署信息："
    echo "• 域名: $DOMAIN"
    echo "• 服务器: $SERVER_IP"
    echo "• SSL: Let's Encrypt (自动续期已设置)"
    echo "• 静态文件: /var/www/devinn/out/"
    echo ""
    echo "🔧 管理命令："
    echo "• 查看状态: ssh $REMOTE_USER@$SERVER_IP 'sudo systemctl status nginx'"
    echo "• 查看日志: ssh $REMOTE_USER@$SERVER_IP 'sudo tail -f /var/log/nginx/devinn_access.log'"
    echo "• 重启服务: ssh $REMOTE_USER@$SERVER_IP 'sudo systemctl restart nginx'"
    echo ""
}

# 主执行流程
main() {
    echo "🚀 开始部署 AI笔记DevInn 到 $DOMAIN"
    echo "服务器: $SERVER_IP"
    echo "用户: $REMOTE_USER"
    echo ""
    
    check_prerequisites
    upload_files
    upload_nginx_config
    setup_server
    
    # 询问是否设置SSL
    read -p "是否设置SSL证书？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_ssl
    else
        print_warning "跳过SSL设置，您可以稍后手动设置"
    fi
    
    verify_deployment
    show_completion_info
}

# 执行主函数
main "$@"
