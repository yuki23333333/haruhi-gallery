# Haruhi Gallery 部署指南

## 支持的平台

本项目支持三种部署方式：
1. **Web 应用 (PWA)** - 浏览器访问，可安装到桌面
2. **Android App** - 原生 Android 应用
3. **iOS App** - 原生 iOS 应用

---

## 一、Web 部署 (PWA)

### 开发环境
```bash
# 前端
cd frontend
npm run dev

# 后端 (另一个终端)
cd haruhi-gallery
go run cmd/main.go
```

### 生产构建

#### 1. 构建前端
```bash
cd frontend
npm run build
```

构建产物在 `frontend/dist/` 目录

#### 2. 部署后端
将后端二进制文件和前端 dist 目录一起部署：

```bash
# 编译后端
go build -o haruhi-gallery cmd/main.go

# 复制前端构建产物
cp -r frontend/dist ./public

# 运行
./haruhi-gallery
```

#### 3. 使用 Nginx 部署 (推荐)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 上传的图片
    location /uploads {
        proxy_pass http://localhost:8080;
    }
}
```

---

## 二、Android App 部署

### 前置要求
- Android Studio
- JDK 17 或更高版本
- Android SDK

### 构建步骤

#### 1. 添加 Android 平台
```bash
cd frontend
npm run build
npx cap add android
```

#### 2. 同步代码到原生项目
```bash
npx cap sync android
```

#### 3. 打开 Android Studio
```bash
npx cap open android
```

#### 4. 在 Android Studio 中构建
- 菜单：Build → Build Bundle(s) / APK(s) → Build APK(s)
- 或直接连接设备运行

### 配置签名 (发布到应用商店)

1. 生成签名密钥：
```bash
keytool -genkey -v -keystore haruhi-gallery.keystore -alias haruhi -keyalg RSA -keysize 2048 -validity 10000
```

2. 在 `android/app/build.gradle` 中配置签名

3. 构建发布版 APK 或 AAB

### 发布到 Google Play
- 创建 Google Play 开发者账号 ($25 一次性费用)
- 上传 AAB 文件
- 填写应用信息和截图
- 等待审核

---

## 三、iOS App 部署

### 前置要求
- macOS 电脑
- Xcode 15 或更高版本
- Apple Developer 账号 ($99/年)

### 构建步骤

#### 1. 添加 iOS 平台
```bash
cd frontend
npm run build
npx cap add ios
```

#### 2. 同步代码到原生项目
```bash
npx cap sync ios
```

#### 3. 打开 Xcode
```bash
npx cap open ios
```

#### 4. 在 Xcode 中配置
- 设置 Bundle Identifier
- 配置签名证书和 Provisioning Profile
- 添加权限说明（相机、相册访问）

#### 5. 构建和运行
- 连接 iOS 设备
- 点击 Run 按钮

### 发布到 App Store
1. 在 Xcode 中：Product → Archive
2. 在 Organizer 中：Distribute App
3. 选择 App Store Connect
4. 上传并填写应用信息
5. 提交审核

---

## 四、环境变量配置

### 创建 `.env` 文件

**前端 (`frontend/.env`)**:
```env
VITE_API_URL=https://your-api-domain.com
```

**后端**:
```env
DB_PATH=./haruhi-gallery.db
JWT_SECRET=your-secret-key
PORT=8080
```

### Capacitor 生产环境配置

编辑 `frontend/capacitor.config.ts`:
```typescript
server: {
  url: 'https://your-frontend-domain.com',  // 生产环境 URL
  cleartext: false  // 生产环境使用 HTTPS
}
```

---

## 五、快速开始脚本

创建 `package.json` 脚本：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "cap:sync": "npm run build && npx cap sync",
    "cap:android": "npm run build && npx cap sync android && npx cap open android",
    "cap:ios": "npm run build && npx cap sync ios && npx cap open ios",
    "android:build": "npm run build && npx cap sync android && cd android && ./gradlew assembleDebug"
  }
}
```

---

## 六、常见问题

### Q: Android 构建失败
A: 检查 JDK 版本，确保是 JDK 17+

### Q: iOS 无法运行
A: 需要苹果开发者账号和真机测试

### Q: PWA 无法安装
A: 确保 HTTPS 已配置（localhost 除外）

### Q: 图片上传失败
A: 检查后端 CORS 配置和文件大小限制

---

## 七、性能优化建议

1. **启用 CDN** - 将静态文件上传到 CDN
2. **图片优化** - 使用 WebP 格式，压缩图片
3. **代码分割** - 使用 React.lazy() 懒加载组件
4. **Service Worker** - 已配置，会自动缓存资源
5. **数据库索引** - 为常用查询字段添加索引

---

## 八、安全建议

1. **HTTPS** - 生产环境必须使用 HTTPS
2. **JWT 密钥** - 使用强随机密钥
3. **文件验证** - 验证上传文件类型和大小
4. **SQL 注入** - 使用 GORM 参数化查询（已实现）
5. **CORS 配置** - 限制允许的域名

---

## 九、备份和恢复

### 数据库备份
```bash
# 备份
cp haruhi-gallery.db backup/haruhi-gallery-$(date +%Y%m%d).db

# 恢复
cp backup/haruhi-gallery-20231225.db haruhi-gallery.db
```

### 上传文件备份
```bash
# 备份 uploads 目录
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/
```

---

## 十、监控和日志

### 查看日志
```bash
# 后端日志
./haruhi-gallery 2>&1 | tee server.log

# 使用 systemd (Linux)
sudo systemctl status haruhi-gallery
sudo journalctl -u haruhi-gallery -f
```

### 健康检查端点
可以添加一个健康检查端点：
```go
r.GET("/health", func(c *gin.Context) {
    c.JSON(200, gin.H{"status": "ok"})
})
```

---

需要帮助？请查看：
- [Capacitor 官方文档](https://capacitorjs.com/)
- [Vite PWA 插件文档](https://vite-pwa-org.netlify.app/)
- [Gin 框架文档](https://gin-gonic.com/)
