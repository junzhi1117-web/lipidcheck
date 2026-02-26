import { useState } from 'react'
import type { AnalysisResult, HistoryEntry, RiskLevel } from '../types'
import { WaveHeader } from './WaveHeader'
import { ConsensusCard } from './ConsensusCard'
import { TenYearRiskCard } from './TenYearRiskCard'
import { GuidelineCard } from './GuidelineCard'
import { RecommendationCard } from './RecommendationCard'
import { HistoryChart } from './HistoryChart'

interface Props {
  result: AnalysisResult
  onBack: () => void
  historyEntry: HistoryEntry
}

function getMaxRisk(result: AnalysisResult): RiskLevel {
  const order: Record<RiskLevel, number> = { low: 0, moderate: 1, high: 2, 'very-high': 3, extreme: 4 }
  return [result.taiwan.riskLevel, result.accaha.riskLevel, result.esceas.riskLevel].reduce(
    (max, r) => (order[r] > order[max] ? r : max),
    'low' as RiskLevel
  )
}

export function ResultPage({ result, onBack, historyEntry }: Props) {
  const maxRisk = getMaxRisk(result)
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}`

  // Non-HDL card
  const { nonHdl, ldlReduction } = result

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

        {/* 10 年心血管風險 */}
        {(result.tenYearRisk.pce !== null || result.tenYearRisk.score2 !== null) && (
          <div style={{ marginBottom: '20px' }}>
            <TenYearRiskCard pce={result.tenYearRisk.pce} score2={result.tenYearRisk.score2} />
          </div>
        )}

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

        {/* Non-HDL 膽固醇 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #DEE2E6',
            padding: '14px 16px',
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '10px' }}>
              非 HDL 膽固醇（TC − HDL）
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '10px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#006A7A' }}>{nonHdl.value}</span>
              <span style={{ fontSize: '0.78rem', color: '#6C757D' }}>mg/dL</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6C757D' }}>🇺🇸 ACC/AHA</span>
                {nonHdl.accahaTarget !== null ? (
                  <span style={{ fontWeight: 600, color: nonHdl.accahaAchieved ? '#28A745' : '#DC3545' }}>
                    {nonHdl.accahaAchieved ? '✅' : '❌'} 目標 {'<'} {nonHdl.accahaTarget}
                  </span>
                ) : (
                  <span style={{ color: '#9AA0A6' }}>無固定目標</span>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6C757D' }}>🇪🇺 ESC/EAS</span>
                <span style={{ fontWeight: 600, color: nonHdl.esceasAchieved ? '#28A745' : '#DC3545' }}>
                  {nonHdl.esceasAchieved ? '✅' : '❌'} 目標 {'<'} {nonHdl.esceasTarget}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6C757D' }}>🇹🇼 台灣指引</span>
                <span style={{ color: '#9AA0A6' }}>未設定 non-HDL 目標</span>
              </div>
            </div>
          </div>
        </div>

        {/* LDL 還需降低 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #DEE2E6',
            padding: '14px 16px',
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '10px' }}>
              LDL 還需降低
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
              {/* Taiwan */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6C757D', fontSize: '0.78rem' }}>🇹🇼 台灣指引</span>
                {ldlReduction.taiwan === null ? (
                  <span style={{ color: '#9AA0A6', fontSize: '0.78rem' }}>—</span>
                ) : ldlReduction.taiwan.achieved ? (
                  <span style={{ color: '#28A745', fontWeight: 600, fontSize: '0.78rem' }}>✓ 已達標</span>
                ) : (
                  <span style={{ color: '#DC3545', fontWeight: 600, fontSize: '0.78rem' }}>
                    還需降低 {ldlReduction.taiwan.needed} mg/dL（{ldlReduction.taiwan.percent}%）
                  </span>
                )}
              </div>
              {/* ACC/AHA */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6C757D', fontSize: '0.78rem' }}>🇺🇸 ACC/AHA</span>
                {ldlReduction.accaha === null ? (
                  <span style={{ color: '#9AA0A6', fontSize: '0.78rem' }}>—</span>
                ) : 'rangeMode' in ldlReduction.accaha ? (
                  <span style={{ color: '#E67E00', fontWeight: 600, fontSize: '0.78rem' }}>
                    建議降低 {ldlReduction.accaha.rangePercentMin}–{ldlReduction.accaha.rangePercentMax}%（約 {ldlReduction.accaha.rangeMin}–{ldlReduction.accaha.rangeMax} mg/dL）
                  </span>
                ) : ldlReduction.accaha.achieved ? (
                  <span style={{ color: '#28A745', fontWeight: 600, fontSize: '0.78rem' }}>✓ 已達標</span>
                ) : (
                  <span style={{ color: '#DC3545', fontWeight: 600, fontSize: '0.78rem' }}>
                    還需降低 {ldlReduction.accaha.needed} mg/dL（{ldlReduction.accaha.percent}%）
                  </span>
                )}
              </div>
              {/* ESC/EAS */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6C757D', fontSize: '0.78rem' }}>🇪🇺 ESC/EAS</span>
                {ldlReduction.esceas === null ? (
                  <span style={{ color: '#9AA0A6', fontSize: '0.78rem' }}>—</span>
                ) : ldlReduction.esceas.achieved ? (
                  <span style={{ color: '#28A745', fontWeight: 600, fontSize: '0.78rem' }}>✓ 已達標</span>
                ) : (
                  <span style={{ color: '#DC3545', fontWeight: 600, fontSize: '0.78rem' }}>
                    還需降低 {ldlReduction.esceas.needed} mg/dL（{ldlReduction.esceas.percent}%）
                  </span>
                )}
              </div>
            </div>
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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
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

        {/* 分享區塊 */}
        <div style={{ margin: '16px 0' }}>
          <p style={{ fontSize: '0.78rem', color: '#6C757D', textAlign: 'center', marginBottom: '8px' }}>
            ⚠️ 分享連結包含您的健康資料，請謹慎使用
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              onClick={handleCopyLink}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #DEE2E6',
                backgroundColor: '#FFFFFF',
                color: '#006A7A',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {copied ? '已複製！' : '📋 複製連結'}
            </button>
            <a
              href={lineShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #06C755',
                backgroundColor: '#06C755',
                color: '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              LINE 分享
            </a>
          </div>
        </div>

        {/* 歷史記錄 */}
        <div style={{ marginBottom: '20px' }}>
          <HistoryChart currentEntry={historyEntry} />
        </div>

        {/* Buy Me a Coffee */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <p style={{ fontSize: '0.78rem', color: '#9AA0A6', margin: 0 }}>
            這個工具對你有幫助嗎？
          </p>
          <a
            href="https://buymeacoffee.com/junzhi"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 22px',
              borderRadius: '12px',
              backgroundColor: '#FFDD00',
              color: '#1A1A1A',
              fontSize: '0.9rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)'
            }}
          >
            ☕ 請我喝杯咖啡
          </a>
        </div>
      </div>
    </div>
  )
}
