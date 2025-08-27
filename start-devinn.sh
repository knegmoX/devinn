#!/bin/bash
cd /usr/local/google/home/waynefan/devinn
nohup python3 -m http.server 8080 --directory ./out --bind 0.0.0.0 > devinn-server.log 2>&1 &
echo $! > devinn-server.pid
echo "AI笔记DevInn 服务已在后台启动"
echo "PID: $(cat devinn-server.pid)"
echo "日志: devinn-server.log"
echo "访问: http://localhost:8080/"
