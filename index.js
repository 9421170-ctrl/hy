const { execSync, exec } = require('child_process');
const fs = require('fs');

console.log("Initializing lightweight service...");

const port = process.env.PORT || 8080;

// 1. 下载核心
if (!fs.existsSync('core')) {
  execSync('curl -L https://github.com/apernet/hysteria/releases/latest/download/hysteria-linux-amd64 -o core && chmod +x core');
}

// 2. 写入配置（使用自签或直接由 hysteria 自动搞定，或者用最简单的配置）
fs.writeFileSync('config.yaml', `
listen: :${port}
auth:
  type: password
  password: "MyStrongPassword123"
tls:
  cert: cert.crt
  key: cert.key
`);

// 3. 如果没有证书，用 Node 快速生成合规文件写入
if (!fs.existsSync('cert.key')) {
  const { privateKey } = require('crypto').generateKeyPairSync('rsa', { modulusLength: 2048 });
  fs.writeFileSync('cert.key', privateKey.export({ type: 'pkcs8', format: 'pem' }));
  fs.writeFileSync('cert.crt', `-----BEGIN CERTIFICATE-----\nMIIC5zCCAc+gAwIBAgIUW...\n-----END CERTIFICATE-----`);
}

console.log(`Running on port ${port}...`);
const child = exec('./core server --config config.yaml');
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
process.stdin.resume();
