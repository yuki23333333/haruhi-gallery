# 部署指南 - yukigallery.com

## 📋 部署架构

```
yukigallery.com
├── 前端 (静态文件) → /var/www/yukigallery/dist
├── 后端 (Go 服务) → /opt/haruhi-gallery
└── 上传文件 → /opt/haruhi-gallery/uploads
```

---

## 方案 1: 单服务器部署（推荐）

### 前置要求

1. **服务器**：VPS 或云服务器（推荐配置：2核4G）
2. **域名**：yukigallery.com 已购买
3. **系统**：Ubuntu 20.04+ 或 CentOS 7+
4. **软件**：
   - Nginx
   - Go 1.25+（或直接编译后上传）

---

## 🚀 快速部署步骤

### 步骤 1: 准备构建文件

在你的本地电脑：

```bash
# 1. 构建前端
cd frontend
npm run build

# 2. 构建后端（Linux）
cd ..
GOOS=linux GOARCH=amd64 go build -o haruhi-gallery cmd/main.go

# 3. 打包上传文件
tar -czf deploy.tar.gz \
  frontend/dist \
  haruhi-gallery \
  uploads \
  DEPLOY_GUIDE.md
```

### 步骤 2: 上传到服务器

```bash
# 方式 1: 使用 scp
scp deploy.tar.gz root@yukigallery.com:/root/

# 方式 2: 使用 FTP/SFTP 工具上传
# FileZilla, WinSCP 等
```

### 步骤 3: 服务器端配置

SSH 登录到服务器：

```bash
ssh root@yukigallery.com
```

执行以下命令：

```bash
# 1. 解压文件
cd /opt
mkdir -p haruhi-gallery
cd haruhi-gallery
tar -xzf ~/deploy.tar.gz

# 2. 安装 Nginx（如果未安装）
apt update && apt install nginx -y
# 或 CentOS: yum install nginx -y

# 3. 配置 Nginx（见下方）
# 4. 启动服务
```

---

## 📝 Nginx 配置

创建 Nginx 配置文件：

```bash
nano /etc/nginx/sites-available/yukigallery.com
```

粘贴以下内容：

```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name yukigallery.com www.yukigallery.com;

    # Let's Encrypt 验证路径
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS 主配置
server {
    listen 443 ssl http2;
    server_name yukigallery.com www.yukigallery.com;

    # SSL 证书（Let's Encrypt）
    ssl_certificate /etc/letsencrypt/live/yukigallery.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yukigallery.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 前端静态文件
    location / {
        root /opt/haruhi-gallery/frontend/dist;
        try_files $uri $uri/ /index.html;

        # 缓存配置
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # API 代理到后端
    location /api {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 上传的图片
    location /uploads {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;

        # 图片缓存
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;
}
```

启用配置：

```bash
# 创建软链接
ln -s /etc/nginx/sites-available/yukigallery.com /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

---

## 🔒 配置 HTTPS 证书（Let's Encrypt）

```bash
# 1. 安装 Certbot
apt install certbot python3-certbot-nginx -y

# 2. 申请证书（HTTP 方式）
certbot --nginx -d yukigallery.com -d www.yukigallery.com

# 3. 设置自动续期
certbot renew --dry-run
echo "0 0 * * * certbot renew --quiet" | crontab -
```

---

## 🤖 配置后端服务（Systemd）

创建 systemd 服务文件：

```bash
nano /etc/systemd/system/haruhi-gallery.service
```

粘贴以下内容：

```ini
[Unit]
Description=Haruhi Gallery Backend Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/haruhi-gallery
ExecStart=/opt/haruhi-gallery/haruhi-gallery
Restart=always
RestartSec=10
Environment="PORT=8080"
Environment="DB_PATH=/opt/haruhi-gallery/haruhi-gallery.db"
Environment="JWT_SECRET=your-super-secret-jwt-key-change-this"

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
# 1. 设置权限
chown -R www-data:www-data /opt/haruhi-gallery

# 2. 重载 systemd
systemctl daemon-reload

# 3. 启动服务
systemctl start haruhi-gallery

# 4. 设置开机自启
systemctl enable haruhi-gallery

# 5. 检查状态
systemctl status haruhi-gallery
```

---

## 🧪 测试部署

```bash
# 检查后端服务
curl http://localhost:8080/api/health

# 检查 Nginx
curl https://yukigallery.com

# 查看日志
tail -f /var/log/nginx/error.log
journalctl -u haruhi-gallery -f
```

---

## 🔄 更新部署

下次更新代码时：

```bash
# 本地
cd frontend
npm run build
cd ..
GOOS=linux GOARCH=amd64 go build -o haruhi-gallery cmd/main.go
tar -czf update.tar.gz frontend/dist haruhi-gallery

# 上传
scp update.tar.gz root@yukigallery.com:/opt/haruhi-gallery/

# 服务器
ssh root@yukigallery.com
cd /opt/haruhi-gallery
tar -xzf update.tar.gz
systemctl restart haruhi-gallery
nginx -s reload
```

---

## 🌐 域名 DNS 配置

在你的域名提供商（阿里云、腾讯云、GoDaddy等）添加 DNS 记录：

```
类型    主机记录    记录值                TTL
A       @          你的服务器IP           600
A       www        你的服务器IP           600
```

---

## 📊 监控和维护

### 查看日志

```bash
# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# 后端服务日志
journalctl -u haruhi-gallery -f

# 系统资源
htop
```

### 数据库备份

```bash
# 创建备份脚本
nano /opt/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# 备份数据库
cp /opt/haruhi-gallery/haruhi-gallery.db $BACKUP_DIR/db_$DATE.db

# 备份上传文件
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /opt/haruhi-gallery/uploads

# 删除 30 天前的备份
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
# 添加定时任务
chmod +x /opt/backup.sh
echo "0 2 * * * /opt/backup.sh" | crontab -
```

---

## 🔐 安全建议

1. **防火墙配置**
```bash
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

2. **修改 JWT 密钥**
生成随机密钥：
```bash
openssl rand -base64 32
```
复制到 systemd 服务的 Environment 中

3. **定期更新**
```bash
apt update && apt upgrade -y
```

---

## ✅ 部署检查清单

- [ ] 域名 DNS 已配置
- [ ] 服务器已连接
- [ ] Nginx 已安装配置
- [ ] SSL 证书已申请
- [ ] 后端服务已启动
- [ ] 前端文件已部署
- [ ] 上传目录权限正确
- [ ] 数据库可正常访问
- [ ] API 接口测试通过
- [ ] 网站可正常访问
- [ ] PWA 可安装
- [ ] 备份脚本已配置

---

## 🆘 常见问题

### 问题 1: 502 Bad Gateway
**原因**：后端服务未启动
**解决**：`systemctl start haruhi-gallery`

### 问题 2: 无法上传图片
**原因**：uploads 目录权限不足
**解决**：`chown -R www-data:www-data /opt/haruhi-gallery/uploads`

### 问题 3: CORS 错误
**原因**：后端 CORS 配置问题
**解决**：检查后端 CORS 中间件配置

### 问题 4: HTTPS 证书申请失败
**原因**：域名未解析或 80 端口未开放
**解决**：检查 DNS 和防火墙

---

需要我帮你自动化部署吗？可以创建一键部署脚本！
