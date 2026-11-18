const { execSync, exec } = require('child_process');
const fs = require('fs');

console.log("Initializing lightweight service...");

const port = process.env.PORT || 8080;

// 1. 下载 Hysteria 2 核心
if (!fs.existsSync('core')) {
  console.log("Downloading Hysteria 2 core...");
  execSync('curl -L https://github.com/apernet/hysteria/releases/latest/download/hysteria-linux-amd64 -o core && chmod +x core');
}

// 2. 采用 Hysteria 2 官方原生支持的自签模式（无需在本地维护 cert.crt 和 cert.key 文件）
// 这样可以 100% 避开所有 x509 malformed certificate 或找不到 PEM 块的报错
const configContent = `
listen: :${port}
auth:
  type: password
  password: "MyStrongPassword123"
tls:
  self_signed: true
masquerade:
  type: proxy
  proxy:
    url: https://bing.com
`;

fs.writeFileSync('config.yaml', configContent);

console.log(`Running on port ${port} with built-in self-signed TLS...`);

// 3. 启动核心并保持常驻
const child = exec('./core server --config config.yaml');
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

process.stdin.resume();
