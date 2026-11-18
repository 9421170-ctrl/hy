const { execSync, exec } = require('child_process');
const fs = require('fs');

console.log("Initializing service...");

const port = process.env.PORT || 8080;

// 1. 下载 Hysteria 2 核心
if (!fs.existsSync('core')) {
  console.log("Downloading Hysteria 2 core...");
  execSync('curl -L https://github.com/apernet/hysteria/releases/latest/download/hysteria-linux-amd64 -o core && chmod +x core');
}

// 2. 写入配置：利用 Hysteria 2 内置的自签名支持（无需本地手动提供 cert 文件）
const configContent = `
listen: :${port}
auth:
  type: password
  password: "MyStrongPassword123"
tls:
  cert: ""
  key: ""
`;

fs.writeFileSync('config.yaml', configContent);

console.log(`Starting Hysteria 2 server on port ${port}...`);

// 3. 启动核心
const child = exec('./core server --config config.yaml');
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

process.stdin.resume();
