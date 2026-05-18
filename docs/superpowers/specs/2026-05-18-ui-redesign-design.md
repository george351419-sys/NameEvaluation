# UI 重设计：山水淡雅风格

**日期**: 2026-05-18  
**目标**: 将 name-static/ 的 UI 升级为"山水淡雅"风格，温润棕金配色，保持现有单列布局结构

---

## 配色系统

| Token | 值 | 用途 |
|---|---|---|
| `--color-text` | `#3d2b10` | 主文字 |
| `--color-brand` | `#8b653a` | 品牌深棕 |
| `--color-gold` | `#c4954a` | 品牌金色 |
| `--color-muted` | `#9b7d5a` | 次要文字 |
| `--color-bg` | `#fdfaf5` | 页面背景（暖奶白） |
| `--color-card` | `#ffffff` | 卡片背景 |
| `--color-border` | `rgba(196,149,74,0.2)` | 卡片边框 |
| `--color-accent-light` | `#fef3e2` | 金色浅底 |

渐变背景: `linear-gradient(160deg, #fdfaf5, #f7f0e6, #efe8d8)`  
按钮渐变: `linear-gradient(135deg, #8b653a, #c4954a)`

---

## 吉凶徽标颜色

| 等级 | 背景 | 文字 | 边框 |
|---|---|---|---|
| 大吉 | `#fef3e2` | `#9a6820` | `rgba(196,149,74,0.3)` |
| 吉 | `#edf7f0` | `#2d7a4f` | `rgba(45,122,79,0.2)` |
| 小吉 | `#e8f4fd` | `#2a6496` | `rgba(42,100,150,0.2)` |
| 半吉 | `#f5f5f0` | `#7a7a6a` | `rgba(122,122,106,0.2)` |
| 半凶 | `#fff8e6` | `#c47c00` | `rgba(196,124,0,0.2)` |
| 凶 | `#fef0f0` | `#a04040` | `rgba(160,64,64,0.2)` |
| 大凶 | `#f5e6e6` | `#7a1a1a` | `rgba(122,26,26,0.2)` |

---

## 组件设计规范

### 导航栏
- 背景: `rgba(255,255,255,0.92)` + backdrop-blur
- Logo: 棕金渐变圆形图标 + 字重 800 标题
- 导航标签: 棕金渐变激活态，圆角 overflow 容器

### Hero 区域（首页）
- 装饰标签: `✦ 传统命理 · 现代解读`（金色细边框圆角）
- 主标题: `font-size 30px, font-weight 900, letter-spacing 4px`
- 副标题: `letter-spacing 2px`
- 装饰分隔线: 两侧细线 + 中间 ◆

### 卡片
- 背景: `white`，圆角 `14px`
- 阴影: `0 4px 20px rgba(139,101,58,0.10)`
- 边框: `1px solid rgba(196,149,74,0.18)`
- 标题: 左侧 3px 棕金渐变竖条 + 粗体文字

### 表单输入
- 背景: `#fdfaf5`，聚焦变 `white`
- 边框: `1.5px solid rgba(196,149,74,0.25)`，聚焦变 `#c4954a`

### 按钮（主要）
- 棕金渐变背景，letter-spacing 2px，box-shadow 带暖色

---

## 结果页新增：综合评分横幅

位于结果页顶部，第一张卡片之前：
- 棕金渐变背景，左侧大数字评分（基于笔画吉凶计算）
- 右侧：吉凶总评标签 + 生肖 + 提示文字

**评分计算规则**（新增 lib/scoreUtils.ts）：
- 大吉=20, 吉=15, 小吉=10, 半吉=5, 半凶=-5, 凶=-10, 大凶=-20
- 取 5 个笔画格的平均值，映射到 0-100 分

---

## 页面改动范围

| 文件 | 改动 |
|---|---|
| `app/globals.css` | 新增 CSS 变量，替换 amber 配色 |
| `app/layout.tsx` | 字体、背景色 |
| `app/page.tsx` | Hero 区域、导航 |
| `app/company/page.tsx` | 同上 |
| `app/naming/page.tsx` | 同上 |
| `app/result/ResultPageContent.tsx` | 新增评分横幅，卡片样式 |
| `app/company/result/CompanyResultContent.tsx` | 同上 |
| `app/history/page.tsx` | 列表样式、吉凶徽标 |
| `components/name/AIInterpretation.tsx` | 卡片样式 |
| `lib/scoreUtils.ts` | 新增：评分计算 |

---

## 不改动范围

- 所有业务逻辑和计算函数
- localStorage 存储
- 路由结构
