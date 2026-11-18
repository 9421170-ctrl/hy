const { execSync, exec } = require('child_process');
const fs = require('fs');

console.log("Initializing web service...");

try {
  // 1. 自动生成自签 TLS 证书（解决 cert.crt 缺失报错）
  if (!fs.existsSync('cert.crt') || !fs.existsSync('cert.key')) {
    console.log("Generating self-signed TLS certificates...");
    execSync('openssl req -x509 -newkey rsa:2048 -keyout cert.key -out cert.crt -days 365 -nodes -subj "/CN=bing.com"');
  }

  // 2. 动态下载 Hysteria 2 核心
  if (!fs.existsSync('core')) {
    console.log("Downloading Hysteria 2 core...");
    execSync('curl -L https://github.com/apernet/hysteria/releases/latest/download/hysteria-linux-amd64 -o core && chmod +x core');
  }

  // 3. 动态生成配置文件（自动适配平台分配的 PORT）
  const port = process.env.PORT || 8080;
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

  console.log(`Starting service on port ${port}...`);
  
  // 4. 启动服务进程
  const child = exec('./core server --config config.yaml');
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

} catch (err) {
  console.error(`Initialization error: ${err.message}`);
}
