#!/bin/sh
# 1. 下载并解压 Hysteria 2 Linux 客户端/服务端核心
echo "Downloading Hysteria 2..."
curl -L https://github.com/apernet/hysteria/releases/latest/download/hysteria-linux-amd64 -o hysteria
chmod +x hysteria

# 2. 生成简单的临时配置文件
cat <<EOF > config.yaml
listen: :${PORT:-8080}

auth:
  type: password
  password: "MyStrongPassword123"

tls:
  cert: /etc/hysteria/cert.crt
  key: /etc/hysteria/cert.key

masquerade:
  type: proxy
  proxy:
    url: https://bing.com
EOF

# 3. 启动 Hysteria 2
echo "Starting Hysteria 2..."
./hysteria server --config config.yaml
