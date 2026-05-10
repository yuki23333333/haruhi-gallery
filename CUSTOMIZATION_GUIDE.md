# 自定义配置指南

## 一、域名配置

### 前端 API 域名配置

创建文件 `frontend/.env`：
```env
# 本地开发
VITE_API_URL=http://localhost:8080

# 生产环境（替换为你的域名）
# VITE_API_URL=https://your-domain.com
```

### Capacitor 生产环境配置

编辑 `frontend/capacitor.config.ts`：

```typescript
const config: CapacitorConfig = {
  appId: 'com.haruhigallery.app',  // 包名，可以改成自己的
  appName: 'SOS 团',                 // 应用名称
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    // 本地开发环境
    url: 'http://localhost:8080',

    // 生产环境（替换为你的域名）
    // url: 'https://your-domain.com',

    cleartext: true   // 生产环境改为 false（使用 HTTPS）
  },
  // ... 其他配置
};
```

### 修改 appId（包名）

如果你想改成自己的包名，例如 `com.yourname.haruhigallery`：

```typescript
appId: 'com.yourname.haruhigallery',
```

**注意**：修改 appId 后需要重新运行：
```bash
npx cap sync
```

---

## 二、应用图标配置

### 方法一：在线生成（推荐）

1. **准备一个 1024x1024 的 PNG 图标**
   - 格式：PNG
   - 尺寸：1024x1024 像素
   - 背景：透明或使用应用主题色 (#F2F2F2)
   - 内容：简洁、易识别

2. **安装资源生成工具**
   ```bash
   cd frontend
   npm install -D @capacitor/assets
   ```

3. **创建资源目录**
   ```bash
   mkdir -p frontend/resources
   ```

4. **放置图标**
   ```
   frontend/resources/icon.png  (1024x1024)
   ```

5. **生成所有尺寸的图标**
   ```bash
   npx cap-assets generate \
     --iconBackgroundColor '#F2F2F2' \
     --iconBackgroundColorDark '#1d1d1f'
   ```

   这会自动生成：
   - PWA 图标 (192x192, 512x512)
   - Android 图标 (多种尺寸)
   - iOS 图标 (多种尺寸)
   - 启动屏

### 方法二：手动替换

#### PWA 图标
替换 `frontend/public/` 目录下的文件：
- `icon-192x192.png`
- `icon-512x512.png`

#### Android 图标
替换以下文件：
```
frontend/android/app/src/main/res/
  ├── mipmap-hdpi/     (72x72)
  ├── mipmap-mdpi/     (48x48)
  ├── mipmap-xhdpi/    (96x96)
  ├── mipmap-xxhdpi/   (144x144)
  └── mipmap-xxxhdpi/  (192x192)
```

#### iOS 图标
替换以下文件：
```
frontend ios/App/App/Assets.xcassets/AppIcon.appiconset/
```

### 方法三：使用在线工具

**推荐工具**：
- [AppIconGenerator](https://appicon-generator.com/)
- [MakeAppIcon](https://makeappicon.com/)
- [IconKitchen](https://icon.kitchen/)

1. 上传你的 1024x1024 图标
2. 下载生成的资源包
3. 解压并替换到对应目录

---

## 三、应用名称配置

### 修改显示名称

**Web/PWA**：
编辑 `frontend/index.html`：
```html
<title>SOS 团</title>
<meta name="apple-mobile-web-app-title" content="SOS 团">
```

编辑 `frontend/public/manifest.webmanifest`：
```json
{
  "name": "SOS 团图片画廊",
  "short_name": "SOS 团"
}
```

**Android/iOS App**：
编辑 `frontend/capacitor.config.ts`：
```typescript
const config: CapacitorConfig = {
  appName: 'SOS 团',  // 修改这里
  // ...
};
```

然后运行：
```bash
npx cap sync
```

---

## 四、应用主题色配置

### 修改应用颜色

**Web/PWA**：
编辑 `frontend/index.html`：
```html
<meta name="theme-color" content="#F2F2F2">
```

编辑 `frontend/public/manifest.webmanifest`：
```json
{
  "theme_color": "#F2F2F2",
  "background_color": "#F2F2F2"
}
```

**Android/iOS App**：
编辑 `frontend/capacitor.config.ts`：
```typescript
const config: CapacitorConfig = {
  ios: {
    backgroundColor: '#F2F2F2'  // iOS 背景色
  },
  android: {
    backgroundColor: '#F2F2F2'  // Android 背景色
  }
};
```

**前端组件主题色**：
编辑 `frontend/src/App.tsx`：
```tsx
<div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#F2F2F2] to-[#D1D8C5]" />
```

---

## 五、完整配置示例

### 假设你想配置成：

- **域名**：`gallery.example.com`
- **应用名称**：`我的图片库`
- **包名**：`com.example.gallery`

#### 步骤 1: 更新环境变量

`frontend/.env`:
```env
VITE_API_URL=https://gallery.example.com
```

#### 步骤 2: 更新 Capacitor 配置

`frontend/capacitor.config.ts`:
```typescript
const config: CapacitorConfig = {
  appId: 'com.example.gallery',
  appName: '我的图片库',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: 'https://gallery.example.com',
    cleartext: false
  },
  ios: {
    backgroundColor: '#F2F2F2'
  },
  android: {
    backgroundColor: '#F2F2F2',
    allowMixedContent: true
  }
};
```

#### 步骤 3: 更新 PWA 配置

`frontend/index.html`:
```html
<title>我的图片库</title>
<meta name="apple-mobile-web-app-title" content="我的图片库">
```

`frontend/public/manifest.webmanifest`:
```json
{
  "name": "我的图片库",
  "short_name": "图片库",
  "theme_color": "#F2F2F2"
}
```

#### 步骤 4: 同步到原生平台
```bash
cd frontend
npm run build
npx cap sync
```

#### 步骤 5: 替换应用图标
```bash
# 1. 准备 icon.png (1024x1024)
# 2. 放到 frontend/resources/icon.png
# 3. 运行生成命令
npx cap-assets generate --iconBackgroundColor '#F2F2F2'
```

---

## 六、常用域名配置场景

### 场景 1: 本地开发
```typescript
server: {
  url: 'http://localhost:8080',
  cleartext: true
}
```

### 场景 2: 测试服务器 (HTTP)
```typescript
server: {
  url: 'http://test.example.com',
  cleartext: true  // 允许 HTTP
}
```

### 场景 3: 生产服务器 (HTTPS)
```typescript
server: {
  url: 'https://gallery.example.com',
  cleartext: false  // 强制 HTTPS
}
```

### 场景 4: 使用默认路由
```typescript
server: {
  // 不设置 url，使用本地打包的文件
  cleartext: false
}
```

---

## 七、验证配置

### 检查域名配置

**Web 端**：
```bash
cd frontend
npm run build
npm run preview
```

打开浏览器控制台，检查 API 请求地址。

**移动端**：
```bash
npm run cap:android  # 或 npm run cap:ios
```

在设备/模拟器中打开，检查是否能访问后端。

### 检查图标

**PWA**：
1. 在 Chrome 中打开应用
2. 打开开发者工具 → Application → Manifest
3. 查看图标是否正确显示

**Android**：
```bash
npm run cap:android
# 在 Android Studio 中运行
# 查看应用图标
```

**iOS**：
```bash
npm run cap:ios
# 在 Xcode 中运行
# 查看应用图标
```

---

## 八、故障排查

### 问题：修改后没生效
**解决**：
```bash
cd frontend
npm run build
npx cap sync
```

### 问题：无法连接到服务器
**解决**：
1. 检查域名是否正确
2. 检查服务器是否允许 CORS
3. 检查防火墙设置
4. 检查 HTTPS 证书（生产环境）

### 问题：图标没更新
**解决**：
1. 清理构建缓存：`rm -rf frontend/dist`
2. 重新构建：`npm run build`
3. 清理应用数据并重新安装

---

## 九、快速修改命令

创建一个脚本 `frontend/scripts/update-config.sh`:

```bash
#!/bin/bash

# 更新配置后运行此脚本

echo "🔨 重新构建..."
npm run build

echo "🔄 同步到 Capacitor..."
npx cap sync

echo "✅ 配置更新完成！"
echo ""
echo "下一步："
echo "  - Android: npm run cap:android"
echo "  - iOS: npm run cap:ios"
echo "  - Web: npm run preview"
```

使用方法：
```bash
chmod +x frontend/scripts/update-config.sh
./frontend/scripts/update-config.sh
```

---

需要更多帮助？查看：
- `DEPLOYMENT_GUIDE.md` - 部署指南
- `ICONS_GUIDE.md` - 图标设计指南
