const { execSync, exec } = require('child_process');
const fs = require('fs');

console.log("Initializing service...");

const port = process.env.PORT || 8080;

// 1. 如果没有核心则下载 Hysteria 2 核心
if (!fs.existsSync('core')) {
  console.log("Downloading Hysteria 2 core...");
  execSync('curl -L https://github.com/apernet/hysteria/releases/latest/download/hysteria-linux-amd64 -o core && chmod +x core');
}

// 2. 采用两步法用系统 openssl 生成绝对合规的自签证书与私钥
if (!fs.existsSync('cert.crt') || !fs.existsSync('cert.key')) {
  console.log("Generating valid TLS certificate via split openssl commands...");
  execSync('openssl genrsa -out cert.key 2048');
  execSync('openssl req -new -x509 -key cert.key -out cert.crt -days 365 -subj "/CN=bing.com"');
}

// 3. 写入标准的 Hysteria 2 配置文件
const configContent = `
listen: :${port}
auth:
  type: password
  password: "MyStrongPassword123"
tls:
  cert: cert.crt
  key: cert.key
masquerade:
  type: proxy
  proxy:
    url: https://bing.com
`;

fs.writeFileSync('config.yaml', configContent);

console.log(`Starting Hysteria 2 server on port ${port}...`);

// 4. 启动核心进程并常驻
const child = exec('./core server --config config.yaml');
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

process.stdin.resume();
