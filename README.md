# SOS Brigade Gallery（凉宫春日同好会画廊）

全栈图片与音乐分享平台，支持图片上传、网易云音乐嵌入、用户系统、点赞关注等社交功能。
<img width="2552" height="1405" alt="image" src="https://github.com/user-attachments/assets/a3ad1d94-1f59-47db-9268-666d70ddc27e" />
<img width="2552" height="1405" alt="image" src="https://github.com/user-attachments/assets/8c34b90a-0706-4a48-987e-899e4c6f4312" />

<img width="2552" height="1405" alt="image" src="https://github.com/user-attachments/assets/2751de2d-e11d-4614-8f24-30fcea988db1" />


## 技术栈

| 层 | 技术 |
|---|---|
| 后端 | Go 1.25 + Gin + GORM |
| 数据库 | SQLite（modernc.org/sqlite，纯 Go，无需 CGO）|
| 前端 | React 19 + TypeScript + Vite 7 |
| 样式 | Tailwind CSS 3 + Framer Motion |
| 状态管理 | Zustand |
| 路由 | React Router v7 |
| 移动端 | Capacitor 8（Android / iOS）|
| PWA | vite-plugin-pwa |
| 认证 | JWT + bcrypt |

## 项目结构

```
haruhi-gallery/
├── cmd/main.go              # 入口，Gin 路由
├── handlers/                # HTTP 处理器（auth, upload, images, follow, profile）
├── middleware/               # JWT 认证中间件
├── internal/                 # 数据库初始化 + JWT 工具
├── models/                   # GORM 模型（User, Image, UserLike, Follow）
├── repositories/             # 数据访问层
├── serializers/              # 响应格式化
├── frontend/                 # React 前端
│   ├── src/
│   │   ├── components/       # 组件（GalleryCard, UploadModal, DetailOverlay 等）
│   │   ├── pages/            # 页面（Login, ImageDetail, Music, UserProfile）
│   │   ├── contexts/         # AuthContext, ToastContext
│   │   ├── store/            # Zustand store
│   │   ├── config/           # API 配置
│   │   └── utils/            # 工具函数
│   └── ...
├── uploads/                  # 上传文件存储
├── build.sh                  # Windows 构建脚本
├── install.sh                # Linux 部署脚本（systemd + nginx + Let's Encrypt）
├── go.mod
└── go.sum
```

## 快速开始

### 后端

```bash
# 安装依赖
go mod tidy

# 运行（默认端口 8081）
go run cmd/main.go
```

环境变量：
- `PORT` — 服务端口（默认 `8081`）
- `DB_PATH` — SQLite 数据库路径（默认 `gallery.db`）
- `JWT_SECRET` — JWT 签名密钥

### 前端

```bash
cd frontend
npm install
npm run dev       # Vite 开发服务器，代理 /api -> localhost:8081
```

### 生产构建

```bash
./build.sh        # 构建前端 + Go 二进制，输出到 deploy/ 目录
```

### 服务器部署

将 `deploy/` 上传到服务器后：

```bash
bash install.sh   # 配置 systemd 服务 + nginx 反向代理 + HTTPS 证书
```

## 功能

- 图片画廊（瀑布流 + 无限滚动）
- 音乐分享（网易云音乐 iframe 嵌入）
- 用户注册/登录（JWT 认证）
- 头像上传与个人资料编辑
- 点赞/取消点赞
- 关注/取消关注
- 图片详情（下载、分享链接、删除）
- PWA 离线支持
- Android/iOS 原生应用（Capacitor）
- 响应式设计（移动端到桌面端）
