import { useState } from 'react'
import type { AnalysisResult, HistoryEntry } from '../types'
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

export function ResultPage({ result, onBack, historyEntry }: Props) {
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

  const { nonHdl, ldlReduction } = result

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F9FC' }}>
      <WaveHeader />

      <div className="result-outer-wrap" style={{ margin: '0 auto', padding: '20px 20px 40px' }}>

        {/* Friedewald 估算提示 */}
        {result.ldlSource === 'friedewald' && (
          <div style={{
            backgroundColor: '#FFFBEB',
            border: '1px solid #F59E0B',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '0.82rem',
            color: '#92400E',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}>
            <span style={{ fontSize: '1rem' }}>🔶</span>
            <span>本次 LDL-C 由 <strong>Friedewald 公式</strong>（TC − HDL − TG/5）估算，並非直接實測值。建議定期抽血確認實際數值。</span>
          </div>
        )}

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
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748B', marginBottom: '12px' }}>
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
            border: '1px solid #E2E8F0',
            padding: '14px 16px',
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0A2540', marginBottom: '10px' }}>
              非 HDL 膽固醇（TC − HDL）
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '10px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0052CC' }}>{nonHdl.value}</span>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>mg/dL</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B' }}>🇺🇸 ACC/AHA</span>
                {nonHdl.accahaTarget !== null ? (
                  <span style={{ fontWeight: 600, color: nonHdl.accahaAchieved ? '#10B981' : '#EF4444' }}>
                    {nonHdl.accahaAchieved ? '✅' : '❌'} 目標 {'<'} {nonHdl.accahaTarget}
                  </span>
                ) : (
                  <span style={{ color: '#94A3B8' }}>無固定目標</span>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B' }}>🇪🇺 ESC/EAS</span>
                <span style={{ fontWeight: 600, color: nonHdl.esceasAchieved ? '#10B981' : '#EF4444' }}>
                  {nonHdl.esceasAchieved ? '✅' : '❌'} 目標 {'<'} {nonHdl.esceasTarget}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B' }}>🇹🇼 台灣指引</span>
                <span style={{ color: '#94A3B8' }}>未設定 non-HDL 目標</span>
              </div>
            </div>
          </div>
        </div>

        {/* LDL 還需降低 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '14px 16px',
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0A2540', marginBottom: '10px' }}>
              LDL 還需降低
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
              {/* Taiwan */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B', fontSize: '0.78rem' }}>🇹🇼 台灣指引</span>
                {ldlReduction.taiwan === null ? (
                  <span style={{ color: '#94A3B8', fontSize: '0.78rem' }}>—</span>
                ) : ldlReduction.taiwan.achieved ? (
                  <span style={{ color: '#10B981', fontWeight: 600, fontSize: '0.78rem' }}>✓ 已達標</span>
                ) : (
                  <span style={{ color: '#EF4444', fontWeight: 600, fontSize: '0.78rem' }}>
                    還需降低 {ldlReduction.taiwan.needed} mg/dL（{ldlReduction.taiwan.percent}%）
                  </span>
                )}
              </div>
              {/* ACC/AHA */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B', fontSize: '0.78rem' }}>🇺🇸 ACC/AHA</span>
                {ldlReduction.accaha === null ? (
                  <span style={{ color: '#94A3B8', fontSize: '0.78rem' }}>—</span>
                ) : 'rangeMode' in ldlReduction.accaha ? (
                  <span style={{ color: '#F59E0B', fontWeight: 600, fontSize: '0.78rem' }}>
                    建議降低 {ldlReduction.accaha.rangePercentMin}–{ldlReduction.accaha.rangePercentMax}%（約 {ldlReduction.accaha.rangeMin}–{ldlReduction.accaha.rangeMax} mg/dL）
                  </span>
                ) : ldlReduction.accaha.achieved ? (
                  <span style={{ color: '#10B981', fontWeight: 600, fontSize: '0.78rem' }}>✓ 已達標</span>
                ) : (
                  <span style={{ color: '#EF4444', fontWeight: 600, fontSize: '0.78rem' }}>
                    還需降低 {ldlReduction.accaha.needed} mg/dL（{ldlReduction.accaha.percent}%）
                  </span>
                )}
              </div>
              {/* ESC/EAS */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B', fontSize: '0.78rem' }}>🇪🇺 ESC/EAS</span>
                {ldlReduction.esceas === null ? (
                  <span style={{ color: '#94A3B8', fontSize: '0.78rem' }}>—</span>
                ) : ldlReduction.esceas.achieved ? (
                  <span style={{ color: '#10B981', fontWeight: 600, fontSize: '0.78rem' }}>✓ 已達標</span>
                ) : (
                  <span style={{ color: '#EF4444', fontWeight: 600, fontSize: '0.78rem' }}>
                    還需降低 {ldlReduction.esceas.needed} mg/dL（{ldlReduction.esceas.percent}%）
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 建議 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748B', marginBottom: '12px' }}>
            給您的建議
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <RecommendationCard type="diet" items={result.recommendations.diet} />
            <RecommendationCard type="exercise" items={result.recommendations.exercise} />
          </div>
        </div>

        {/* 免責聲明 */}
        <div style={{ backgroundColor: '#F6F9FC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.7 }}>
            ℹ️ 本工具僅供衛教參考，不取代醫師診斷。若您有任何疑慮，請諮詢您的家庭醫師或心臟科醫師。
          </div>
        </div>

        {/* 重新計算按鈕 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <button
            onClick={onBack}
            style={{
              width: '100%',
              maxWidth: '360px',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#0052CC',
              color: 'white',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            重新計算
          </button>
        </div>

        {/* 分享區塊 */}
        <div style={{ margin: '16px 0' }}>
          <p style={{ fontSize: '0.78rem', color: '#64748B', textAlign: 'center', marginBottom: '8px' }}>
            ⚠️ 分享連結包含您的健康資料，請謹慎使用
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              onClick={handleCopyLink}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: '#0052CC',
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
          <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: 0 }}>
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
              color: '#0A2540',
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
