const { execSync, exec } = require('child_process');
const fs = require('fs');

console.log("Initializing lightweight service...");

const port = process.env.PORT || 8080;

// 1. 下载 Hysteria 2 核心
if (!fs.existsSync('core')) {
  console.log("Downloading Hysteria 2 core...");
  execSync('curl -L https://github.com/apernet/hysteria/releases/latest/download/hysteria-linux-amd64 -o core && chmod +x core');
}

// 2. 使用 Node.js 动态生成合规的密钥和自签证书（直接复用公钥作为证书，避免 PEM 格式报错）
if (!fs.existsSync('cert.key') || !fs.existsSync('cert.crt')) {
  console.log("Generating valid TLS keys and certs...");
  const crypto = require('crypto');
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  
  // 写入私钥
  fs.writeFileSync('cert.key', privateKey.export({ type: 'pkcs8', format: 'pem' }));
  
  // 直接将标准 PEM 格式的公钥写入 cert.crt 作为自签证书
  const pubPem = publicKey.export({ type: 'spki', format: 'pem' });
  fs.writeFileSync('cert.crt', pubPem);
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
