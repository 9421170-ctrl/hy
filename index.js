const { execSync, exec } = require('child_process');
const fs = require('fs');

console.log("Initializing lightweight service...");

const port = process.env.PORT || 8080;

// 1. 下载 Hysteria 2 核心
if (!fs.existsSync('core')) {
  console.log("Downloading Hysteria 2 core...");
  execSync('curl -L https://github.com/apernet/hysteria/releases/latest/download/hysteria-linux-amd64 -o core && chmod +x core');
}

// 2. 生成合规的自签证书和私钥
if (!fs.existsSync('cert.key')) {
  console.log("Generating TLS keys...");
  const crypto = require('crypto');
  const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  fs.writeFileSync('cert.key', privateKey.export({ type: 'pkcs8', format: 'pem' }));
}

if (!fs.existsSync('cert.crt')) {
  // 写入标准的自签证书占位或由 Node 生成
  fs.writeFileSync('cert.crt', `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIUY5fK2g9q...
...
-----END CERTIFICATE-----`);
}

// 3. 生成配置文件
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

console.log(`Running on port ${port}...`);

// 4. 启动核心并保持常驻
const child = exec('./core server --config config.yaml');
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

process.stdin.resume();
