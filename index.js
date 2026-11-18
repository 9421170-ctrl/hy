const { exec } = require('child_process');
const fs = require('fs');

console.log("Initializing web service...");

// 动态下载二进制并赋予权限
const setupCommand = `
  curl -L https://github.com/apernet/hysteria/releases/latest/download/hysteria-linux-amd64 -o core &&
  chmod +x core
`;

exec(setupCommand, (err, stdout, stderr) => {
  if (err) {
    console.error(`Setup error: ${err}`);
    return;
  }
  
  // 生成配置文件
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
  
  // 启动进程
  const child = exec('./core server --config config.yaml');
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
});
