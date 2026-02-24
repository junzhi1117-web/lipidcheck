# LipidCheck UI/UX 設計規格（Gemini 3.1 Pro 設計）

## 1. 色彩系統

- **Primary:** `#006A7A`（健康青）— 主要按鈕、標題、焦點邊框
- **Secondary:** `#E6F0F1`（寧靜藍灰）— 卡片背景、區塊分隔
- **Accent:** `#FF6F61`（活力珊瑚橘）— 最重要 CTA 按鈕、進度條
- **Background:** `#F8F9FA`
- **Card:** `#FFFFFF`
- **Text Primary:** `#212529`
- **Text Secondary:** `#6C757D`
- **Border:** `#DEE2E6`

**風險等級色：**
- 低：`#28A745`（安心綠）
- 中：`#FFC107`（警示黃）
- 高：`#FD7E14`（注意橘）
- 非常高：`#DC3545`（嚴肅紅）
- 極高：`#B22222`（深酒紅）

## 2. 字型系統

- **中文：** Noto Sans TC（Google Fonts）
- **英文/數字：** Lexend（Google Fonts）

字型層級：
- Display：2rem / 600
- h1：1.75rem / 600
- h2：1.25rem / 500
- Body：1rem / 400
- Sub-body/Button：0.9375rem / 500
- Caption：0.8125rem / 400

## 3. 組件規格

### 表單輸入
下邊框式設計（非傳統方框）：
```css
.form-input {
  border: none;
  border-bottom: 2px solid #DEE2E6;
  padding: 12px 4px;
  background-color: transparent;
  transition: border-color 0.2s ease-in-out;
}
.form-input:focus {
  outline: none;
  border-bottom-color: #006A7A;
}
```

### 血脂數值輸入
統一卡片包覆 TC / LDL / HDL / TG，左側名稱+縮寫，右側輸入框+單位(mg/dL)。

### 共病症選擇
Pill Toggle（膠囊形 toggle，非 checkbox）：
- 未選：white background + #DEE2E6 border
- 選中：#006A7A background + white text
- border-radius: 9999px

### 統合結論卡片
- 位置：結果頁最頂端
- 背景：#E6F0F1
- 左邊框：2px solid #006A7A
- 顯示最保守的 LDL-C 目標（主色加粗）

### 三欄比較卡片
台灣指引 / ACC/AHA / ESC 三欄並排（手機垂直堆疊），每欄顯示：
- 指引名稱
- 風險等級標籤（對應色彩）
- LDL-C 目標

### 建議卡片
飲食 + 運動各一張，含：
- 線條風格圖示（Heroicons outline）
- 簡短標題
- 3-4 點條列建議

## 4. 頁面流程

### 輸入頁（單頁式）
1. 基本資料（年齡、性別、收縮壓、是否服降壓藥）
2. 血脂數值（TC、LDL-C、HDL-C、TG，non-HDL 自動計算）
3. 共病症/風險因子（Pill toggle：ASCVD、糖尿病、CKD、FH、吸菸）
4. 懸浮 CTA 按鈕「查看分析結果」

### 結果頁（資訊層次）
1. **統合結論卡片**（最醒目）
2. **三欄比較卡片**（台灣/ACC/ESC）
3. **建議區塊**（飲食/運動）
4. **免責聲明**（頁尾小字）

### 轉場動畫
按鈕 Loading 狀態 → 結果頁從下方滑入 (translateY 100%→0，400ms，cubic-bezier(0.4,0,0.2,1))

## 5. 視覺特色

- **Header 波浪 SVG**：結果頁動態變色為對應風險等級色（App 標誌性元素）
- **Icon：** Heroicons outline（stroke-width 1.5px，一致）
- **插圖：** 建議區塊用單色幾何點狀插圖

## 結論卡片「統合結論」規則式邏輯
三個指引中取**最嚴格的 LDL 目標**作為主結論，並說明各指引差異。
ESC 顯示時附帶免責聲明：「SCORE2 風險計算基於歐洲族群，僅供參考」。
