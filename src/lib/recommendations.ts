import type { RiskLevel, UserInput } from '../types'

export function getDietRecs(input: UserInput, maxRisk: RiskLevel): string[] {
  const recs: string[] = []

  if (input.ldl >= 130) {
    recs.push('少吃飽和脂肪：肥肉、豬皮、奶油、椰子油，每週控制在 1–2 次以內')
    recs.push('多吃膳食纖維：燕麥、豆類、蘋果、秋葵，每天目標 10 g 以上')
    recs.push('少吃加工食品：餅乾、速食、油炸物大多含有對心臟不好的脂肪')
    recs.push('採用地中海飲食：以橄欖油、魚、蔬菜、全穀物為主食')
  }

  if (input.tg >= 150) {
    recs.push('少喝含糖飲料：手搖杯、果汁、精緻澱粉吃多都會讓三酸甘油酯升高')
    recs.push('每週吃 2–3 次深海魚（鮭魚、鯖魚、秋刀魚），對三酸甘油酯有幫助')
    recs.push('嚴格限制喝酒：三酸甘油酯偏高者，酒精會讓數值急速升高')
    recs.push('主食以糙米、全麥麵包取代白飯、白吐司')
  }

  if ((input.sex === 'male' && input.hdl < 40) || (input.sex === 'female' && input.hdl < 50)) {
    recs.push('用橄欖油炒菜、多吃酪梨和堅果，有助提升好的膽固醇')
    recs.push('戒菸對提升好的膽固醇有直接效果')
  }

  if (input.dm) {
    recs.push('控制血糖很重要：定時定量吃飯，選低升糖食物，避免暴飲暴食')
  }

  if (['very-high', 'extreme'].includes(maxRisk)) {
    recs.push('您的風險等級較高，飲食調整只是輔助，請諮詢醫師評估是否需要藥物治療')
  }

  const unique = [...new Set(recs)]
  if (unique.length < 3) {
    unique.push('多吃蔬菜水果、減少加工食品，是改善血脂最基本的方法')
    unique.push('維持健康體重：體重減少 5–10%，膽固醇數值通常會跟著改善')
  }
  return unique.slice(0, 5)
}

export function getExerciseRecs(maxRisk: RiskLevel): string[] {
  if (maxRisk === 'low' || maxRisk === 'moderate') {
    return [
      '每週至少 150 分鐘中等強度運動：快走、游泳、騎腳踏車都算',
      '每週 2 次以上肌力訓練：深蹲、伏地挺身、啞鈴等',
      '避免久坐：每坐 30–60 分鐘，起來走動 5 分鐘',
      '運動強度目標：微喘但仍可說話，不需要很激烈',
    ]
  } else {
    return [
      '⚠️ 您的心血管風險較高，增加運動量前請先諮詢醫師',
      '可從輕鬆散步開始：每天 20–30 分鐘，量力而為',
      '慢慢進步，目標是每週累積 150 分鐘有氧運動',
      '避免突然進行高強度或爆發性運動',
      '若運動中出現胸悶、喘不過氣或頭暈，請立即停止並就醫',
    ]
  }
}
