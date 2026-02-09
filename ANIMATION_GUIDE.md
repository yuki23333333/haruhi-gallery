# 🎬 App Store 风格动画实现指南

## 预期效果说明

### 点击前：瀑布流列表
- 图片以瀑布流布局展示
- 每个卡片有玻璃拟态效果
- Hover 时卡片轻微上浮

### 点击时：卡片展开动画

#### 1. **"飞起"效果**（共享元素过渡）
```
列表中的图片 → 全屏覆盖层的图片
     ↓
layoutId 匹配：image-${id}
     ↓
Framer Motion 自动计算位置插值
     ↓
图片平滑地从列表位置"飞"到屏幕中心
```

#### 2. **背景磨砂遮罩**
```css
background: rgba(0, 0, 0, 0.6)
backdrop-filter: blur(4px)
```

#### 3. **文字优雅浮现**
```typescript
// 延迟 0.2s 后文字淡入
transition={{ delay: 0.2 }}
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
```

### 关闭时：卡片收回动画

#### 1. **文字先消失**
```typescript
// 文字快速淡出
exit={{ opacity: 0, y: 10 }}
transition={{ duration: 0.2 }}
```

#### 2. **卡片"缩回"原位**
```
全屏图片 → 列表中的图片
     ↓
Spring 物理效果
     ↓
type: "spring"
stiffness: 300
damping: 30
     ↓
图片平滑地"飞回"列表原位
```

## 技术实现细节

### 共享元素过渡（Magic Motion）

#### 列表卡片（GalleryCard）
```tsx
<motion.img
  layoutId={`image-${image.id}`}  // 关键：唯一标识
  src={imageUrl}
  className="w-full h-auto object-cover"
  transition={{
    type: "spring",
    stiffness: 300,
    damping: 30
  }}
/>
```

#### 详情覆盖层（DetailOverlay）
```tsx
<motion.img
  layoutId={`image-${image.id}`}  // 相同的 layoutId
  src={imageUrl}
  className="w-full h-auto object-cover rounded-t-3xl"
  transition={{
    type: "spring",
    stiffness: 300,
    damping: 30
  }}
/>
```

### 关键原则

1. **唯一性**：同一时间只能有一个元素使用特定的 `layoutId`
   - ✅ 图片使用 `layoutId={image-${id}}`
   - ❌ 外层容器也使用相同 `layoutId`（已修复）

2. **同步过渡**：两个组件必须使用相同的 spring 配置
   ```typescript
   type: "spring"
   stiffness: 300
   damping: 30
   ```

3. **视觉隐藏但保留占位**
   ```typescript
   animate={{
     opacity: isHidden ? 0 : 1,
     scale: isHidden ? 0.95 : 1
   }}
   style={{
     pointerEvents: isHidden ? 'none' : 'auto'
   }}
   ```

### 动画时序

#### 打开时序
```
0ms:    点击卡片
        ↓
0ms:    图片开始过渡（layoutId 匹配）
        背景 fade in
        ↓
0ms:    列表中的卡片 opacity → 0（隐藏）
        ↓
200ms:  文字开始 fade in（delay: 0.2）
        ↓
300ms:  动画完成
```

#### 关闭时序
```
0ms:    点击背景/关闭按钮
        ↓
0ms:    文字开始 fade out（duration: 0.2）
        关闭按钮 fade out
        ↓
0ms:    图片开始"飞回"（spring 动画）
        ↓
200ms:  文字完全消失
        ↓
400ms+:  Spring 动画完成（取决于物理计算）
        ↓
完成:    列表中的卡片 opacity → 1（显示）
```

## CSS 配置

### Spring 物理参数说明
```typescript
{
  type: "spring",     // 弹簧动画类型
  stiffness: 300,     // 刚度（1-500）
                      // 值越大，动画越快
  damping: 30         // 阻尼（0-100）
                      // 值越小，回弹越明显
}
```

### 推荐组合
| 效果 | stiffness | damping |
|------|-----------|---------|
| 快速干脆 | 400-500 | 40-50 |
| 平滑平衡 | 300 | 30 | ✅ 当前使用
| 明显回弹 | 200-250 | 15-20 |
| 缓慢优雅 | 150-200 | 25-30 |

## 浏览器兼容性

### Framer Motion 共享元素过渡要求
- ✅ Chrome/Edge 90+
- ✅ Safari 14+
- ✅ Firefox 88+
- ⚠️ 需要支持 FLIP 技术

### 降级方案
如果浏览器不支持，动画会自动降级为淡入淡出。

## 调试技巧

### 检查 layoutId 冲突
```javascript
// 在控制台运行
document.querySelectorAll('[data-framer-layout-id]')
```

### 查看动画性能
```javascript
// Chrome DevTools
Performance Monitor → Recording
```

### 调整动画速度
```typescript
// 临时加速测试
stiffness: 500,  // 更快
damping: 50      // 更干脆
```

## 常见问题

### Q: 动画卡顿？
A: 检查图片大小，建议压缩到 500KB 以下

### Q: layoutId 不生效？
A: 确保两个组件使用**完全相同**的 layoutId 字符串

### Q: 图片位置不对？
A: 检查图片的 `object-fit` 属性是否一致

### Q: 关闭时没有"飞回"效果？
A: 确保列表中的卡片没有被卸载（unmount）

## 性能优化

1. **图片懒加载**：使用 `IntersectionObserver`
2. **缓存解码**：`<img decoding="async" />`
3. **GPU 加速**：`will-change: transform, opacity`
4. **避免重排**：使用 `transform` 代替 `top/left`

## 下一步优化

- [ ] 添加图片预加载
- [ ] 实现手势滑动关闭
- [ ] 添加视差效果（Parallax）
- [ ] 支持视频内容的过渡
