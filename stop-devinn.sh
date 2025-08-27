#!/bin/bash
if [ -f devinn-server.pid ]; then
    PID=$(cat devinn-server.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "AI笔记DevInn 服务已停止 (PID: $PID)"
    else
        echo "服务进程不存在"
    fi
    rm -f devinn-server.pid
else
    echo "PID文件不存在"
fi
