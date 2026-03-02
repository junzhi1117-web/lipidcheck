# LipidCheck — Claude Rules

## Project
- 三大指引血脂判讀工具 PWA
- GitHub: `junzhi1117-web/lipidcheck`
- Vercel: `prj_mWBSwt80SEahmrCMvn6Om5lwuxaX` (auto-deploy ✅)
- Live: `lipidcheck.drjunzhi.com`

## Stack
- React 19 + Vite + Tailwind v4 + PWA
- pnpm

## Layout (已定稿，不要動)
- Desktop: 2-col Input | 3-col Result | max-w-4xl
- Mobile first, responsive

## Features (已實作)
1. 非 HDL-C 計算
2. LDL 降幅百分比
3. URL 分享
4. 10-Year CVD Risk
5. 歷史記錄

## Design
- ❌ No gradients, no neon
- Medical tool aesthetic: clean, trustworthy

## Common Commands
```bash
pnpm dev
pnpm build
```

## Critical Rules
- 血脂判讀邏輯依據三大指引（ACC/AHA, ESC/EAS, 台灣）
- 任何判讀邏輯修改必須先確認醫學正確性
- 10 案例醫學驗證已全通過，新功能需同等驗證
