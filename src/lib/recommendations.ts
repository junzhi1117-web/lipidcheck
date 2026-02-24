import type { RiskLevel, UserInput } from '../types'

export function getDietRecs(input: UserInput, maxRisk: RiskLevel): string[] {
  const recs: string[] = []

  // LDL 相關飲食建議
  if (input.ldl >= 130) {
    recs.push('減少飽和脂肪攝取（目標 < 每日總熱量 7%），少吃肥肉、奶油、椰子油')
    recs.push('每日攝取可溶性膳食纖維 10–25 g（燕麥、豆類、蘋果、秋葵）')
    recs.push('避免反式脂肪（人造奶油、油炸食品、餅乾）')
    recs.push('採用地中海飲食模式：橄欖油、魚類、蔬果、全穀物為主')
  }

  // TG 相關飲食建議
  if (input.tg >= 150) {
    recs.push('限制精緻糖和含糖飲料（含糖手搖杯、果汁、白麵包）')
    recs.push('每週吃 2–3 次深海魚類（鮭魚、鯖魚、秋刀魚）以補充 Omega-3')
    recs.push('嚴格限制酒精攝取（三酸甘油酯偏高者建議完全戒酒）')
    recs.push('控制每日碳水化合物總攝取量，以全穀類取代精緻澱粉')
  }

  // 低 HDL
  if ((input.sex === 'male' && input.hdl < 40) || (input.sex === 'female' && input.hdl < 50)) {
    recs.push('增加單元不飽和脂肪（橄欖油、酪梨、堅果）有助提升 HDL')
    recs.push('戒菸可有效提升 HDL 膽固醇')
  }

  // 糖尿病
  if (input.dm) {
    recs.push('嚴格控制血糖：低升糖指數飲食，定時定量，避免暴飲暴食')
  }

  // 高風險者通用建議
  if (['very-high', 'extreme'].includes(maxRisk)) {
    recs.push('諮詢醫師評估是否需要植固醇強化食品（每日 2 g 植固醇可降 LDL 約 10%）')
  }

  // 去重並補足至最少 3 條
  const unique = [...new Set(recs)]
  if (unique.length < 3) {
    unique.push('多蔬果、少加工食品，維持均衡飲食')
    unique.push('保持健康體重，體重下降 5–10% 可改善多項血脂指標')
  }
  return unique.slice(0, 5)
}

export function getExerciseRecs(maxRisk: RiskLevel): string[] {
  if (maxRisk === 'low' || maxRisk === 'moderate') {
    return [
      '每週 ≥ 150 分鐘中等強度有氧運動（快走、游泳、騎腳踏車）',
      '每週至少 2 次全身性肌力訓練',
      '減少每日久坐時間，每坐 30–60 分鐘起身活動 5 分鐘',
      '有氧運動強度目標：最大心率的 50–70%（約講話微喘但仍可對話）',
    ]
  } else {
    return [
      '⚠️ 心血管風險較高，開始或增加運動強度前請先諮詢主治醫師',
      '可從低強度開始：每天散步 20–30 分鐘，逐步增加',
      '目標逐漸達到每週 150 分鐘中等強度有氧運動',
      '避免突然進行高強度或無氧爆發性運動',
      '若出現胸悶、喘不過氣或頭暈，請立即停止運動並就醫',
    ]
  }
}
