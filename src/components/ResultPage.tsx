import type { AnalysisResult, RiskLevel } from '../types'
import { WaveHeader } from './WaveHeader'
import { ConsensusCard } from './ConsensusCard'
import { GuidelineCard } from './GuidelineCard'
import { RecommendationCard } from './RecommendationCard'

interface Props {
  result: AnalysisResult
  onBack: () => void
}

function getMaxRisk(result: AnalysisResult): RiskLevel {
  const order: Record<RiskLevel, number> = { low: 0, moderate: 1, high: 2, 'very-high': 3, extreme: 4 }
  return [result.taiwan.riskLevel, result.accaha.riskLevel, result.esceas.riskLevel].reduce(
    (max, r) => (order[r] > order[max] ? r : max),
    'low' as RiskLevel
  )
}

export function ResultPage({ result, onBack }: Props) {
  const maxRisk = getMaxRisk(result)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <WaveHeader riskLevel={maxRisk} />

      <div className="result-outer-wrap" style={{ margin: '0 auto', padding: '20px 20px 40px' }}>

        {/* 統合結論 */}
        <div style={{ marginBottom: '20px' }}>
          <ConsensusCard
            strictestTarget={result.consensus.strictestTarget}
            achieved={result.consensus.achieved}
            summary={result.consensus.summary}
            consistent={result.consensus.consistent}
            currentLdl={result.taiwan.currentLdl}
            crossGuidelineNote={result.consensus.crossGuidelineNote}
          />
        </div>

        {/* 三欄比較 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6C757D', marginBottom: '12px' }}>
            三大指引怎麼說
          </div>
          <div className="guideline-cards">
            <GuidelineCard result={result.taiwan} />
            <GuidelineCard result={result.accaha} />
            <GuidelineCard result={result.esceas} />
          </div>
        </div>

        {/* 建議 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6C757D', marginBottom: '12px' }}>
            給您的建議
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <RecommendationCard type="diet" items={result.recommendations.diet} />
            <RecommendationCard type="exercise" items={result.recommendations.exercise} />
          </div>
        </div>

        {/* 免責聲明 */}
        <div style={{ backgroundColor: '#F8F9FA', border: '1px solid #DEE2E6', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: '#6C757D', lineHeight: 1.7 }}>
            ℹ️ 本工具僅供衛教參考，不取代醫師診斷。若您有任何疑慮，請諮詢您的家庭醫師或心臟科醫師。
          </div>
        </div>

        {/* 重新評估按鈕 */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onBack}
            style={{
              width: '100%',
              maxWidth: '360px',
              padding: '14px',
              borderRadius: '12px',
              border: '2px solid #006A7A',
              backgroundColor: 'transparent',
              color: '#006A7A',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ← 重新輸入資料
          </button>
        </div>
      </div>
    </div>
  )
}
