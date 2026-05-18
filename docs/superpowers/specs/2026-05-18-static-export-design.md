# 纯前端静态导出版本设计文档

**日期**: 2026-05-18  
**目标**: 将现有 Next.js 全栈项目转换为纯静态前端，无需后端服务器

---

## 目标与约束

- 新建 `name-static/` 文件夹，不修改原有 `app/` 代码
- 产物为 `name-static/out/` 静态文件，可上传任意 Web 服务器
- 去掉所有后端依赖（Prisma、数据库、AI API）
- 保留全部功能页面，AI 解读换为规则文案，历史记录换为 localStorage

---

## 架构

```
name-static/
├── app/                    ← 删除整个 api/ 目录
│   ├── page.tsx            ← 改：直接调用 analyze()
│   ├── result/[id]/        ← 改：纯客户端渲染，读 localStorage
│   ├── company/            ← 改：直接调用 analyzeCompany()
│   ├── naming/             ← 改：直接调用命名算法
│   ├── history/            ← 改：读 localStorage
│   └── compare/            ← 改：读 localStorage
├── lib/
│   ├── analyze.ts          ← 保留不变
│   ├── analyzeCompany.ts   ← 保留不变
│   ├── strokes.ts          ← 保留不变
│   ├── hexagrams.ts        ← 保留不变
│   ├── energyPoints.ts     ← 保留不变
│   ├── energyPointsCompany.ts ← 保留不变
│   ├── plumBlossom.ts      ← 保留不变
│   ├── zodiac.ts           ← 保留不变
│   ├── namingSuggestion.ts ← 保留不变（去掉 AI 调用部分）
│   ├── storage.ts          ← 新建：localStorage CRUD
│   └── ruleText.ts         ← 新建：规则文案生成
├── prisma/                 ← 整个删除
├── next.config.ts          ← 加 output: 'export'
└── package.json            ← 移除 prisma、@prisma/client
```

---

## 各模块改动说明

### 1. next.config.ts
```ts
const nextConfig = {
  output: 'export',
}
```

### 2. lib/storage.ts（新建）

提供与原数据库接口一致的 API，底层用 localStorage：

```ts
// 个人名字测评
saveEvaluation(data: EvaluationData): string       // 返回 id
getEvaluation(id: string): EvaluationData | null
listEvaluations(): EvaluationData[]
deleteEvaluation(id: string): void

// 公司名测评
saveCompanyEvaluation(data): string
getCompanyEvaluation(id: string): CompanyEvaluationData | null
listCompanyEvaluations(): CompanyEvaluationData[]

// 起名测评
saveNamingEvaluation(data): string
getNamingEvaluation(id: string): NamingEvaluationData | null
listNamingEvaluations(): NamingEvaluationData[]
```

ID 用 `crypto.randomUUID()` 生成，数据序列化为 JSON 存储。

### 3. lib/ruleText.ts（新建）

根据计算结果生成规则文案，替代 AI 流式解读：

**个人名字**：
- 总格分数 → 等级（优秀/良好/一般/欠佳）及对应描述段落
- 五行组合 → 性格特点描述
- 天格/地格/人格/外格 → 各格含义说明
- 卦象 → 从 hexagrams.ts 已有数据提取含义

**公司名**：
- 笔画格局 → 商业运势描述
- 五行相生相克 → 发展方向建议

**输出**: 返回字符串，直接渲染到结果页原 AI 解读区域。

### 4. 表单页（主页、公司页、起名页）

改动：提交时不再 `fetch('/api/calculate')`，直接：
```ts
import { analyze } from '@/lib/analyze'
import { saveEvaluation } from '@/lib/storage'

const result = analyze(input)
const id = saveEvaluation({ ...input, result })
router.push(`/result/${id}`)
```

### 5. 结果详情页（动态路由）

静态导出不支持服务端动态路由，改为客户端渲染：
```ts
'use client'
const params = useParams()
const [data, setData] = useState(null)
useEffect(() => {
  setData(getEvaluation(params.id))
}, [params.id])
```

AI 解读区域改为：
```ts
import { generateRuleText } from '@/lib/ruleText'
// 直接展示文本，无流式效果
```

### 6. 历史记录页

```ts
useEffect(() => {
  setRecords(listEvaluations())
}, [])
```

### 7. 删除的文件

- `app/api/` 整个目录
- `lib/db.ts`
- `lib/claude.ts`
- `lib/prompts.ts`
- `lib/promptsCompany.ts`
- `prisma/` 整个目录
- `.env` / `.env.example`（不再需要）

### 8. package.json 依赖变更

移除：
- `prisma`
- `@prisma/client`

保留所有 UI 组件依赖不变。

---

## 构建与部署

```bash
cd name-static
npm install
npm run build
# 产物在 out/ 目录
```

`out/` 目录可直接：
- 上传阿里云 OSS（静态网站托管）
- 放到 Nginx `root` 目录
- 上传 GitHub Pages
- 本地直接用浏览器打开 `index.html`

---

## 不在范围内

- 不修改原 `app/` 任何代码
- 不添加用户登录/账号系统
- 不实现跨设备数据同步
- namingSuggestion 中的 AI 起名建议：保留算法部分，去掉 AI 调用，返回基于规则的候选名
