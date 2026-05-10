#!/bin/bash

# Haruhi Gallery 服务器安装脚本
# 在服务器上运行此脚本

set -e

echo "========================================"
echo "  Haruhi Gallery - 服务器安装"
echo "========================================"
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo "请使用 root 权限运行此脚本"
    exit 1
fi

# 配置变量
INSTALL_DIR="/opt/haruhi-gallery"
DOMAIN="yukigallery.com"
ADMIN_EMAIL="admin@${DOMAIN}"

echo "[1/8] 更新系统..."
apt update && apt upgrade -y

echo ""
echo "[2/8] 安装依赖..."
apt install -y nginx certbot python3-certbot-nginx

echo ""
echo "[3/8] 创建应用目录..."
mkdir -p $INSTALL_DIR
mkdir -p $INSTALL_DIR/uploads

echo ""
echo "[4/8] 部署应用文件..."
# 假设你已经在当前目录解压了 deploy.tar.gz
if [ -f "haruhi-gallery" ]; then
    cp haruhi-gallery $INSTALL_DIR/
    chmod +x $INSTALL_DIR/haruhi-gallery
fi

if [ -d "frontend/dist" ]; then
    cp -r frontend/dist $INSTALL_DIR/frontend/
fi

echo ""
echo "[5/8] 创建 Systemd 服务..."
cat > /etc/systemd/system/haruhi-gallery.service <<'EOF'
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
Environment="JWT_SECRET=$(openssl rand -base64 32)"

[Install]
WantedBy=multi-user.target
EOF

echo ""
echo "[6/8] 配置 Nginx..."
cat > /etc/nginx/sites-available/$DOMAIN <<EOF
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS 主配置
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL 证书（稍后配置）
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    # 前端静态文件
    location / {
        root $INSTALL_DIR/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # API 代理
    location /api {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # 上传文件
    location /uploads {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host \$host;
        expires 30d;
    }

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;
}
EOF

ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo ""
echo "[7/8] 设置权限..."
chown -R www-data:www-data $INSTALL_DIR
chmod -R 755 $INSTALL_DIR

echo ""
echo "[8/8] 启动服务..."
systemctl daemon-reload
systemctl enable haruhi-gallery
systemctl start haruhi-gallery
systemctl restart nginx

echo ""
echo "========================================"
echo "  安装完成！"
echo "========================================"
echo ""
echo "服务状态检查:"
echo "  后端: systemctl status haruhi-gallery"
echo "  Nginx: systemctl status nginx"
echo ""
echo "配置 HTTPS (Let's Encrypt):"
echo "  certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "查看日志:"
echo "  后端: journalctl -u haruhi-gallery -f"
echo "  Nginx: tail -f /var/log/nginx/error.log"
echo ""
echo "网站访问: http://$DOMAIN"
echo ""
