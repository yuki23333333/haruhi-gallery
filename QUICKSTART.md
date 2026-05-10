# Haruhi Gallery - 部署配置完成

## 项目类型

现在你的项目支持**三种部署方式**：

| 部署方式 | 说明 | 状态 |
|---------|------|------|
| **Web PWA** | 可安装的 Web 应用，支持离线 | ✅ 已配置 |
| **Android App** | 原生 Android 应用 | ✅ 已配置 |
| **iOS App** | 原生 iOS 应用 | ✅ 已配置 |

---

## 快速开始

### 开发环境

#### 启动前端
```bash
cd frontend
npm run dev
```
访问: http://localhost:5173

#### 启动后端
```bash
cd haruhi-gallery
go run cmd/main.go
```
API: http://localhost:8080

---

## 构建命令

### Web 应用 (PWA)
```bash
cd frontend
npm run build
```

构建产物在 `frontend/dist/` 目录，可直接部署到任何静态服务器。

### Android App
```bash
cd frontend
npm run cap:android    # 构建 + 打开 Android Studio
```

在 Android Studio 中：
1. 连接 Android 设备或启动模拟器
2. 点击 Run 按钮

### iOS App
```bash
cd frontend
npm run cap:ios    # 构建 + 打开 Xcode
```

在 Xcode 中：
1. 选择目标设备
2. 点击 Run 按钮

---

## 项目结构

```
haruhi-gallery/
├── frontend/                 # React 前端
│   ├── dist/                # 构建产物
│   ├── android/             # Android 原生项目
│   ├── ios/                 # iOS 原生项目
│   ├── public/              # 静态资源
│   │   ├── manifest.webmanifest  # PWA 配置
│   │   └── icon-*.png       # 应用图标
│   ├── capacitor.config.ts  # Capacitor 配置
│   └── vite.config.ts       # Vite + PWA 配置
├── cmd/main.go              # 后端入口
├── internal/                # 内部包
├── models/                  # 数据模型
├── handlers/                # API 处理器
├── repositories/            # 数据访问层
└── uploads/                 # 上传的图片
```

---

## 下一步

### 1. 添加应用图标
详见 `frontend/ICONS_GUIDE.md`

**快速方法**：
- 准备一个 1024x1024 的 PNG 图标
- 放在 `frontend/resources/icon.png`
- 运行 `npx cap-assets generate`

### 2. 配置生产环境

编辑 `frontend/capacitor.config.ts`：
```typescript
server: {
  url: 'https://your-domain.com',  // 改为你的域名
  cleartext: false
}
```

### 3. 部署到服务器

**Web 部署**：
```bash
# 构建前端
cd frontend && npm run build

# 部署 dist 目录到 Nginx/Apache
```

**后端部署**：
```bash
# 编译后端
go build -o haruhi-gallery cmd/main.go

# 运行
./haruhi-gallery
```

### 4. 发布到应用商店

**Android (Google Play)**：
1. 在 Android Studio 中生成签名 APK/AAB
2. 创建 Google Play 开发者账号
3. 上传并发布

**iOS (App Store)**：
1. 在 Xcode 中配置签名和证书
2. Product → Archive
3. 上传到 App Store Connect

---

## 常用命令

```bash
# 开发
npm run dev                    # 启动开发服务器

# 构建
npm run build                  # 构建 Web (跳过 TS 检查)
npm run build:ts               # 构建 Web (包含 TS 检查)

# 预览
npm run preview                # 预览构建产物

# Capacitor
npm run cap:sync               # 同步到所有平台
npm run cap:android            # 构建 + 打开 Android Studio
npm run cap:ios                # 构建 + 打开 Xcode
npm run android:build          # 仅构建 Android
npm run ios:build              # 仅构建 iOS
```

---

## 环境变量

创建 `.env` 文件：

**前端 (`frontend/.env`)**:
```env
VITE_API_URL=http://localhost:8080
```

**后端**:
```env
DB_PATH=./haruhi-gallery.db
JWT_SECRET=your-secret-key
PORT=8080
```

---

## 特性

### PWA 功能
- ✅ 可安装到桌面/主屏幕
- ✅ 离线支持（Service Worker）
- ✅ 自动更新
- ✅ 推送通知支持

### 移动端功能
- ✅ 原生相机集成
- ✅ 文件系统访问
- ✅ 触觉反馈
- ✅ 键盘处理
- ✅ 状态栏配置

---

## 故障排查

### 问题：Android 构建失败
- 确保 JDK 17+ 已安装
- 检查 ANDROID_HOME 环境变量

### 问题：iOS 无法打开
- 需要 macOS 电脑
- 需要 Xcode 15+

### 问题：PWA 无法安装
- 确保使用 HTTPS（localhost 除外）
- 检查 manifest.webmanifest 路径

### 问题：图片上传失败
- 检查后端 CORS 配置
- 检查文件大小限制

---

## 文档

- **部署指南**: `DEPLOYMENT_GUIDE.md` - 完整的部署文档
- **图标指南**: `frontend/ICONS_GUIDE.md` - 图标设计说明

---

## 技术栈

### 前端
- React 19 + TypeScript
- Vite (构建工具)
- Tailwind CSS (样式)
- Framer Motion (动画)
- React Router (路由)
- Zustand (状态管理)

### 后端
- Go 1.25
- Gin (Web 框架)
- GORM (ORM)
- SQLite (数据库)
- JWT (认证)

### 跨平台
- Capacitor (原生包装)
- Vite PWA (PWA 支持)

---

需要帮助？查看 `DEPLOYMENT_GUIDE.md` 获取更多详情。
