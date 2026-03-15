# LipidCheck

三大指引血脂判讀工具 PWA，定位是給醫師與一般使用者一起討論風險與治療方向的臨床決策輔助工具。

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- PWA (`vite-plugin-pwa`)
- pnpm

## Common Commands

```bash
pnpm dev
pnpm build
pnpm regression
```

## Current Guideline Coverage

| Guideline | Version | Notes |
|---|---|---|
| 台灣 | 2025 | LDL 目標導向 |
| ACC/AHA | 2026 | 已升級為 2026 treatment tree + 10-year PREVENT-ASCVD base model |
| ESC/EAS | 2025 | SCORE2 / SCORE2-OP simplified regional approximation |

## ACC/AHA 2026 status

已完成：
- 2026 treatment pathway 重構
- secondary prevention / LDL ≥190 / diabetes / CKD / young adult / CAC 分流
- LDL-C + non-HDL-C 雙目標輸出
- 10-year PREVENT-ASCVD base model
- BMI 改為身高 + 體重自動計算
- 缺少 PREVENT 必要輸入時不硬算風險

PREVENT 必要輸入：
- 身高 / 體重（系統自動算 BMI）
- eGFR
- statin use

## Validation

代表性 ACC/AHA regression cases 已納入：
- secondary prevention ASCVD
- severe hypercholesterolemia (LDL ≥190)
- PREVENT primary prevention
- CAC ≥300 intensification
- missing PREVENT inputs fallback

執行：
```bash
pnpm regression
```

## Important Notes

- 本工具僅供衛教與 shared decision-making 參考，不取代醫師診斷。
- ACC/AHA 已不再使用舊 PCE 文案；primary prevention 以 PREVENT-ASCVD 為主。
- 台灣與 ESC/EAS 分支目前仍維持各自既有架構。
