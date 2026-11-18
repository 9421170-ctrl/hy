const { execSync, exec } = require('child_process');
const fs = require('fs');

console.log("Initializing service with dynamic TLS generator...");

const port = process.env.PORT || 8080;

// 1. 自动下载 Hysteria 2 核心
if (!fs.existsSync('core')) {
  console.log("Downloading Hysteria 2 core...");
  execSync('curl -L https://github.com/apernet/hysteria/releases/latest/download/hysteria-linux-amd64 -o core && chmod +x core');
}

// 2. 动态安装并使用 selfsigned 库生成绝对合规的自签证书，彻底解决 x509 格式报错
if (!fs.existsSync('cert.crt') || !fs.existsSync('cert.key')) {
  console.log("Installing selfsigned generator package...");
  try {
    execSync('npm install selfsigned --no-save', { stdio: 'inherit' });
  } catch (e) {
    console.log("npm install warning, trying alternative...");
  }

  console.log("Generating valid X.509 TLS certificates...");
  const selfsigned = require('selfsigned');
  const attrs = [{ name: 'commonName', value: 'bing.com' }];
  const pems = selfsigned.generate(attrs, { days: 365 });

  fs.writeFileSync('cert.crt', pems.cert);
  fs.writeFileSync('cert.key', pems.private);
  console.log("TLS certificates generated successfully.");
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

// 4. 启动核心进程并保持常驻
const child = exec('./core server --config config.yaml');
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

process.stdin.resume();
