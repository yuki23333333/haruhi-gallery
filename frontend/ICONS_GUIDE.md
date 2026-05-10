# 应用图标指南

## 需要的图标尺寸

### PWA 图标
放置在 `frontend/public/` 目录：
- `icon-192x192.png` - PWA 标准图标
- `icon-512x512.png` - PWA 高清图标

### 移动端 App 图标
使用 Capacitor 资源生成器自动生成所有所需尺寸：
```bash
# 1. 准备一个 1024x1024 像素的 PNG 图标
# 2. 放置在 frontend/resources/icon.png
# 3. 运行生成命令：
npm install @capacitor/assets
npx cap-assets generate --iconBackgroundColor '#F2F2F2' --iconBackgroundColorDark '#1d1d1f'
```

### 启动屏
放置在 `frontend/resources/` 目录：
- `splash.png` - 2732x2732 像素（会自动裁剪）
- `splash-dark.png` - 深色模式版本（可选）

## 图标设计建议

1. **颜色**：使用浅色背景 (#F2F2F2) 以匹配应用主题
2. **风格**：简洁、现代、玻璃态风格
3. **内容**：可以使用 SOS 团相关元素（凉宫春日主题）
4. **安全区**：重要内容避开边缘 15%

## 在线工具

- [Canva](https://www.canva.com/) - 免费设计工具
- [Figma](https://www.figma.com/) - 专业设计工具
- [AppIconGenerator](https://appicon-generator.com/) - 自动生成多尺寸图标
