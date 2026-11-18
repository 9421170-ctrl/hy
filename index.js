const { execSync, exec } = require('child_process');
const fs = require('fs');

console.log("Initializing web service...");

try {
  // 1. 使用 Node.js 自带模块或纯 JS 模拟生成空证书（或利用内置方法）
  // 既然运行需要 cert.crt 和 cert.key，我们用最简单的方式在内存/文件中写入占位或基础自签证书
  if (!fs.existsSync('cert.crt') || !fs.existsSync('cert.key')) {
    console.log("Creating basic TLS key and cert files...");
    // 写入最基础的虚拟 PEM 格式占位，或者用内置 crypto 生成
    const crypto = require('crypto');
    const { privateKey, certificate } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    fs.writeFileSync('cert.key', privateKey);
    // 生成一个简易自签结构给核心读取
    fs.writeFileSync('cert.crt', certificate);
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
  
  // 4. 启动服务进程并保持在前台，防止应用过早退出
  const child = exec('./core server --config config.yaml');
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  // 保持 Node 进程不退出
  process.stdin.resume();

} catch (err) {
  console.error(`Initialization error: ${err.message}`);
}
