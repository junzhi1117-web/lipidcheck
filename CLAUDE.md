# LipidCheck — CLAUDE.md

> 三大指引血脂判讀工具 PWA，定位：醫師與患者協作的臨床決策輔助工具

## Project

- GitHub: `junzhi1117-web/lipidcheck`
- Vercel: `prj_mWBSwt80SEahmrCMvn6Om5lwuxaX` (auto-deploy ✅)
- Live: `lipidcheck.drjunzhi.com`

## Stack

- React 19 + Vite + Tailwind v4 + PWA
- pnpm

## Common Commands

```bash
pnpm dev
pnpm build
```

## Design System

- Style: **Playful Health**（Duolingo × Apple Health，遊戲感，不嚴肅）
- 主色：`#5B4FCF`（深紫），背景 `#F8F6FF`
- 字型：Nunito（圓潤友善）
- UI：大圓角卡片 24px、大數字、emoji 點綴
- 風險顏色：solid mid-saturation
- ❌ 絕對禁止：漸層（gradient）、螢光/霓虹色

## Layout（已定稿，不要動）

- Desktop: 2-col Input | 3-col Result | max-w-4xl
- Mobile first, responsive

## Features（已實作）

1. 非 HDL-C 計算（TC − HDL，自動顯示各指引目標）
2. LDL 降幅百分比（「還需降 X mg/dL (Y%)」）
3. URL 分享（輸入值 encode 進 query string）
4. 10 年 CVD 風險（PCE / SCORE2 已計算，含西方族群免責聲明）
5. 歷史記錄

## Guidelines 邏輯

| 指引 | 版本 | 來源 |
|------|------|------|
| 台灣 | 2024 | 內科學誌 2024:35:426-430（李貽恒）|
| ACC/AHA | 2022 | PCE 算法，亞裔族群高估 20-40% |
| ESC/EAS | 2025 | 極高風險 LDL <40 mg/dL |

**關鍵 files**：`lib/guidelines/taiwan.ts`, `accaha.ts`, `esceas.ts`, `analyze.ts`, `types.ts`

## 醫學驗證規則

- 任何判讀邏輯修改**必須先確認醫學正確性**（俊智確認或 Medical agent 驗證）
- 10 案例醫學驗證已全通過，新功能需同等驗證
- PCE/SCORE2 顯示必須附黃色警示框：「此數字以西方族群為基準，台灣實際風險可能偏低，僅供與醫師討論參考。」

## 待討論功能（實作前必須確認）

- **Statin 強度建議**（Low < 30% / Moderate 30-49% / High ≥50%）：台灣健保規則要不要納入？是否提到 combination therapy？
- **PDF 匯出 + 截圖友善結果卡**（患者帶給醫師看）
- **LINE 分享按鈕**（台灣患者最常用）

## Critical Rules

- 血脂判讀邏輯依據三大指引（ACC/AHA, ESC/EAS, 台灣）
- 指引來源：預設折疊 accordion 顯示
- 不要修改 Layout（已定稿）
