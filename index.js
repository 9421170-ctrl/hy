const { execSync, exec } = require('child_process');
const fs = require('fs');

console.log("Initializing Hysteria 2 service...");

const port = process.env.PORT || 8080;

// 1. 如果本地没有核心，则下载 Hysteria 2 核心
if (!fs.existsSync('core')) {
  console.log("Downloading Hysteria 2 core...");
  execSync('curl -L https://github.com/apernet/hysteria/releases/latest/download/hysteria-linux-amd64 -o core && chmod +x core');
}

// 2. 动态生成配置文件（直接使用仓库里自带的 cert.crt 和 cert.key）
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

// 3. 启动核心进程并常驻
const child = exec('./core server --config config.yaml');
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

process.stdin.resume();
