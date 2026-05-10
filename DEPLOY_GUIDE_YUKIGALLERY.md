# 部署指南 - yukigallery.fun

## 概述

本指南详细说明如何将 Haruhi Gallery 项目部署到生产服务器 `yukigallery.fun`。

## 构建状态

✅ 前端已构建：`frontend/dist/`
✅ 后端已构建：`server.exe`
✅ 配置已更新：`https://yukigallery.fun`

## 服务器要求

- **操作系统**: Linux (Ubuntu 20.04+ 推荐)
- **域名**: yukigallery.fun
- **Web 服务器**: Nginx
- **SSL 证书**: Let's Encrypt
- **数据库**: SQLite (自带)
- **运行时**: Go 1.25+ (如需重新构建后端)

## 部署步骤

### 1. 准备服务器

#### 1.1 连接到服务器

```bash
ssh root@yukigallery.fun
```

#### 1.2 安装必要软件

```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Nginx
apt install nginx -y

# 安装 Certbot (用于 SSL)
apt install certbot python3-certbot-nginx -y

# 安装 SQLite3
apt install sqlite3 -y

# 如需运行 Go 程序，安装 Go
wget https://go.dev/dl/go1.25.4.linux-amd64.tar.gz
tar -C /usr/local -xzf go1.25.4.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc
```

### 2. 上传构建文件

#### 2.1 在本地打包文件

```bash
# 在项目根目录执行
tar -czf deploy.tar.gz server.exe frontend/dist uploads gallery.db
```

#### 2.2 上传到服务器

```bash
scp deploy.tar.gz root@yukigallery.fun:/root/
```

### 3. 服务器端配置

#### 3.1 解压文件

```bash
ssh root@yukigallery.fun
cd /root
tar -xzf deploy.tar.gz -C /opt/haruhi-gallery
mkdir -p /opt/haruhi-gallery/uploads
mkdir -p /opt/haruhi-gallery/frontend/dist
```

#### 3.2 设置后端服务

创建 systemd 服务文件：

```bash
nano /etc/systemd/system/haruhi-gallery.service
```

添加以下内容：

```ini
[Unit]
Description=Haruhi Gallery Backend Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/haruhi-gallery
ExecStart=/opt/haruhi-gallery/server.exe
Restart=always
RestartSec=3
Environment=GIN_MODE=release

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
systemctl daemon-reload
systemctl enable haruhi-gallery
systemctl start haruhi-gallery
systemctl status haruhi-gallery
```

验证后端运行：

```bash
curl http://localhost:8081/api/images
```

### 4. 配置 Nginx

#### 4.1 创建 Nginx 配置

```bash
nano /etc/nginx/sites-available/yukigallery.fun
```

添加以下配置：

```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yukigallery.fun www.yukigallery.fun;

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yukigallery.fun www.yukigallery.fun;

    # SSL 证书配置 (Certbot 会自动填充)
    # ssl_certificate /etc/letsencrypt/live/yukigallery.fun/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yukigallery.fun/privkey.pem;

    # 前端静态文件
    location / {
        root /opt/haruhi-gallery/frontend/dist;
        try_files $uri $uri/ /index.html;

        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://localhost:8081/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # CORS headers (如果需要)
        add_header Access-Control-Allow-Origin "https://yukigallery.fun" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, Content-Type, Authorization" always;
    }

    # 上传文件访问
    location /uploads/ {
        alias /opt/haruhi-gallery/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
```

#### 4.2 启用配置

```bash
ln -s /etc/nginx/sites-available/yukigallery.fun /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 5. 配置 SSL 证书

#### 5.1 获取 Let's Encrypt 证书

```bash
certbot --nginx -d yukigallery.fun -d www.yukigallery.fun
```

按提示输入邮箱并同意服务条款。Certbot 会自动配置 SSL。

#### 5.2 设置自动续期

```bash
certbot renew --dry-run
```

Certbot 会自动创建 cron 任务进行续期。

### 6. 防火墙配置

```bash
# 允许 HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# 启用防火墙
ufw enable

# 查看状态
ufw status
```

### 7. 验证部署

#### 7.1 检查网站访问

```bash
curl https://yukigallery.fun
```

#### 7.2 检查 API

```bash
curl https://yukigallery.fun/api/images
```

#### 7.3 检查后端日志

```bash
journalctl -u haruhi-gallery -f
```

#### 7.4 检查 Nginx 日志

```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 8. 更新部署

当需要更新代码时：

```bash
# 本地重新构建
cd frontend
npm run build
cd ..
go build -o server.exe cmd/main.go

# 打包
tar -czf update.tar.gz server.exe frontend/dist

# 上传
scp update.tar.gz root@yukigallery.fun:/opt/haruhi-gallery/

# 服务器上更新
ssh root@yukigallery.fun
cd /opt/haruhi-gallery
tar -xzf update.tar.gz
systemctl restart haruhi-gallery
```

## 目录结构

部署后的目录结构：

```
/opt/haruhi-gallery/
├── server.exe              # 后端可执行文件
├── gallery.db              # SQLite 数据库
├── uploads/                # 上传的图片
│   └── img_*.jpg
└── frontend/
    └── dist/               # 前端静态文件
        ├── index.html
        ├── assets/
        │   ├── index-*.js
        │   └── index-*.css
        ├── manifest.webmanifest
        └── sw.js           # Service Worker
```

## 监控和维护

### 查看服务状态

```bash
# 后端服务
systemctl status haruhi-gallery

# Nginx 服务
systemctl status nginx

# 查看端口占用
netstat -tlnp
```

### 备份数据

```bash
# 备份数据库和上传文件
tar -czf backup-$(date +%Y%m%d).tar.gz gallery.db uploads

# 复制到本地
scp root@yukigallery.fun:/opt/haruhi-gallery/backup-*.tar.gz ./
```

### 性能优化

1. **启用 Nginx 缓存**：已配置静态资源缓存
2. **启用 Gzip 压缩**：已配置
3. **数据库优化**：定期执行 VACUUM

```bash
sqlite3 /opt/haruhi-gallery/gallery.db "VACUUM;"
```

## 故障排查

### 问题1：网站无法访问

```bash
# 检查 Nginx 是否运行
systemctl status nginx

# 检查配置文件
nginx -t

# 查看错误日志
tail -f /var/log/nginx/error.log
```

### 问题2：API 请求失败

```bash
# 检查后端服务
systemctl status haruhi-gallery

# 查看后端日志
journalctl -u haruhi-gallery -f

# 检查端口是否监听
netstat -tlnp | grep 8081
```

### 问题3：图片上传失败

```bash
# 检查 uploads 目录权限
ls -la /opt/haruhi-gallery/uploads

# 修复权限
chown -R root:root /opt/haruhi-gallery/uploads
chmod -R 755 /opt/haruhi-gallery/uploads
```

### 问题4：SSL 证书问题

```bash
# 重新获取证书
certbot --nginx -d yukigallery.fun -d www.yukigallery.fun --force-renewal

# 检查证书有效期
certbot certificates
```

## 安全建议

1. **定期更新系统**
   ```bash
   apt update && apt upgrade -y
   ```

2. **配置防火墙**
   ```bash
   ufw allow 22/tcp  # SSH
   ufw allow 80/tcp  # HTTP
   ufw allow 443/tcp # HTTPS
   ufw enable
   ```

3. **修改 SSH 端口** (可选)
   ```bash
   nano /etc/ssh/sshd_config
   # 修改 Port 22 为其他端口
   systemctl restart sshd
   ```

4. **定期备份数据**
   - 设置自动备份任务
   - 将备份文件存储到远程位置

## 移动应用部署

### Android 应用

```bash
cd frontend
npx cap sync android
npx cap open android
# 在 Android Studio 中构建 APK
```

### iOS 应用

```bash
cd frontend
npx cap sync ios
npx cap open ios
# 在 Xcode 中构建 IPA
```

## 支持和联系

如有问题，请查看：
- 项目文档：`DEPLOYMENT_GUIDE.md`
- 配置说明：`CONFIG_SUMMARY.md`
- 快速开始：`QUICKSTART.md`

---

**部署完成后，请访问 https://yukigallery.fun 验证！**
