#!/bin/bash

# AI笔记DevInn - 本地部署脚本
# 适用于当前Google服务器环境

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
PORT=8080
HOST="0.0.0.0"
OUT_DIR="./out"

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
    
    # 检查静态文件目录
    if [ ! -d "$OUT_DIR" ]; then
        print_error "静态文件目录 $OUT_DIR 不存在"
        echo "请先运行: npm run build"
        exit 1
    fi
    
    # 检查Python
    if ! command -v python3 &> /dev/null; then
        print_error "需要Python3"
        exit 1
    fi
    
    # 检查端口是否被占用
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "端口 $PORT 已被占用，尝试终止现有进程..."
        pkill -f "python3 -m http.server $PORT" || true
        sleep 2
    fi
    
    print_success "前提条件检查通过"
}

get_server_info() {
    print_step "获取服务器信息..."
    
    # 获取主机名
    HOSTNAME=$(hostname)
    
    # 获取内网IP
    LOCAL_IP=$(hostname -I | awk '{print $1}')
    
    # 检查是否有外网IP（可能在Google环境中不可用）
    PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "不可用")
    
    echo "主机名: $HOSTNAME"
    echo "内网IP: $LOCAL_IP"
    echo "外网IP: $PUBLIC_IP"
    echo "端口: $PORT"
}

start_server() {
    print_step "启动HTTP服务器..."
    
    cd "$(dirname "$0")"
    
    echo "正在启动服务器..."
    echo "静态文件目录: $OUT_DIR"
    echo "监听地址: $HOST:$PORT"
    echo ""
    
    # 启动Python HTTP服务器
    python3 -m http.server $PORT --directory $OUT_DIR --bind $HOST &
    SERVER_PID=$!
    
    # 等待服务器启动
    sleep 3
    
    # 检查服务器是否启动成功
    if kill -0 $SERVER_PID 2>/dev/null; then
        print_success "HTTP服务器启动成功 (PID: $SERVER_PID)"
    else
        print_error "HTTP服务器启动失败"
        exit 1
    fi
}

show_access_info() {
    echo ""
    echo "🎉 AI笔记DevInn 本地部署成功！"
    echo ""
    echo "📱 访问地址："
    echo "• 本地访问: http://localhost:$PORT/"
    echo "• 内网访问: http://$LOCAL_IP:$PORT/"
    if [ "$PUBLIC_IP" != "不可用" ]; then
        echo "• 外网访问: http://$PUBLIC_IP:$PORT/"
    fi
    echo ""
    echo "📄 页面链接："
    echo "• 主页: http://localhost:$PORT/"
    echo "• 演示: http://localhost:$PORT/demo/"
    echo "• 创建笔记: http://localhost:$PORT/notes/create/"
    echo ""
    echo "🔧 管理命令："
    echo "• 查看进程: ps aux | grep 'python3 -m http.server'"
    echo "• 停止服务: kill $SERVER_PID"
    echo "• 查看日志: 服务器日志会显示在终端"
    echo ""
    echo "⚠️  注意事项："
    echo "• 这是开发环境部署，不适用于生产环境"
    echo "• 服务器会在终端关闭时停止"
    echo "• 如需生产部署，请使用 nginx 配置"
    echo ""
}

setup_background_service() {
    read -p "是否要在后台运行服务？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_step "设置后台服务..."
        
        # 创建启动脚本
        cat > start-devinn.sh << EOF
#!/bin/bash
cd $(pwd)
nohup python3 -m http.server $PORT --directory $OUT_DIR --bind $HOST > devinn-server.log 2>&1 &
echo \$! > devinn-server.pid
echo "AI笔记DevInn 服务已在后台启动"
echo "PID: \$(cat devinn-server.pid)"
echo "日志: devinn-server.log"
echo "访问: http://localhost:$PORT/"
EOF
        
        # 创建停止脚本
        cat > stop-devinn.sh << EOF
#!/bin/bash
if [ -f devinn-server.pid ]; then
    PID=\$(cat devinn-server.pid)
    if kill -0 \$PID 2>/dev/null; then
        kill \$PID
        echo "AI笔记DevInn 服务已停止 (PID: \$PID)"
    else
        echo "服务进程不存在"
    fi
    rm -f devinn-server.pid
else
    echo "PID文件不存在"
fi
EOF
        
        chmod +x start-devinn.sh stop-devinn.sh
        
        # 停止当前前台进程
        kill $SERVER_PID 2>/dev/null || true
        
        # 启动后台服务
        ./start-devinn.sh
        
        print_success "后台服务设置完成"
        echo "使用 ./start-devinn.sh 启动服务"
        echo "使用 ./stop-devinn.sh 停止服务"
    else
        echo ""
        print_warning "服务运行在前台，按 Ctrl+C 停止"
        echo "服务器日志："
        echo "----------------------------------------"
        
        # 等待并显示日志
        wait $SERVER_PID
    fi
}

# 主执行流程
main() {
    echo "🚀 开始本地部署 AI笔记DevInn"
    echo "环境: $(uname -s) $(uname -r)"
    echo "用户: $(whoami)"
    echo ""
    
    check_prerequisites
    get_server_info
    start_server
    show_access_info
    setup_background_service
}

# 执行主函数
main "$@"
