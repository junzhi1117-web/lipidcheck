import type { GuidelineResult } from '../types'
import { RiskBadge } from './RiskBadge'

interface Props {
  result: GuidelineResult
}

const GUIDELINE_NAMES = {
  taiwan: '台灣指引',
  accaha: 'ACC/AHA',
  esceas: 'ESC/EAS',
}

const GUIDELINE_YEARS = {
  taiwan: '2025',
  accaha: '2018/2025',
  esceas: '2025',
}

const GUIDELINE_FLAGS = {
  taiwan: '🇹🇼',
  accaha: '🇺🇸',
  esceas: '🇪🇺',
}

const GUIDELINE_COLORS: Record<string, string> = {
  accaha: '#2B5CE6',
  esceas: '#1A7A52',
  taiwan: '#C45820',
}

export function GuidelineCard({ result }: Props) {
  const { guideline, riskLevel, ldlTargetText, ldlTarget, currentLdl, achieved, tenYearRisk, notes } = result
  const barColor = GUIDELINE_COLORS[guideline]

  // LDL progress bar
  const maxBar = ldlTarget !== null ? Math.max(ldlTarget * 1.8, currentLdl * 1.1, 200) : null
  const targetPct = maxBar && ldlTarget !== null ? Math.min((ldlTarget / maxBar) * 100, 95) : null
  const currentPct = maxBar ? Math.min((currentLdl / maxBar) * 100, 98) : null

  return (
    <div style={{
      flex: 1,
      minWidth: 0,
      borderRadius: '14px',
      backgroundColor: '#FFFFFF',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      overflow: 'hidden',
      border: '1px solid #E2E8F0',
    }}>
      {/* Guideline-specific color bar */}
      <div style={{ height: '4px', backgroundColor: barColor }} />

      <div style={{ padding: '16px' }}>
        {/* Guideline name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '1.2rem' }}>{GUIDELINE_FLAGS[guideline]}</span>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0A2540', lineHeight: 1.1 }}>
              {GUIDELINE_NAMES[guideline]}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>
              {GUIDELINE_YEARS[guideline]}
            </div>
          </div>
        </div>

        {/* Risk level */}
        <div style={{ marginBottom: '12px' }}>
          <RiskBadge level={riskLevel} size="sm" />
        </div>

        {/* LDL target */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            建議目標值
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0A2540', lineHeight: 1.4 }}>
            {ldlTargetText}
          </div>
        </div>

        {/* LDL progress bar */}
        {ldlTarget !== null && targetPct !== null && currentPct !== null && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              position: 'relative', height: '8px', backgroundColor: '#F0F0F0',
              borderRadius: '99px', overflow: 'visible', margin: '8px 0 18px',
            }}>
              {/* Target line */}
              <div style={{
                position: 'absolute', left: `${targetPct}%`,
                top: '-3px', bottom: '-3px', width: '2px',
                backgroundColor: '#10B981', borderRadius: '2px',
              }} />
              <div style={{
                position: 'absolute', left: `${targetPct}%`,
                top: '12px', transform: 'translateX(-50%)',
                fontSize: '0.62rem', color: '#10B981', fontWeight: 600, whiteSpace: 'nowrap',
              }}>目標 &lt;{ldlTarget}</div>
              {/* Current value indicator */}
              <div style={{
                position: 'absolute', left: `${currentPct}%`,
                top: '-4px', width: '16px', height: '16px',
                borderRadius: '50%', backgroundColor: achieved ? '#10B981' : '#EF4444',
                border: '2px solid white',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                transform: 'translateX(-50%)',
              }} />
              <div style={{
                position: 'absolute', left: `${currentPct}%`,
                top: '12px', transform: 'translateX(-50%)',
                fontSize: '0.62rem', color: achieved ? '#10B981' : '#EF4444',
                fontWeight: 600, whiteSpace: 'nowrap',
              }}>您：{currentLdl}</div>
              {/* Fill track */}
              <div style={{
                position: 'absolute', left: 0,
                width: `${currentPct}%`, height: '8px',
                backgroundColor: achieved ? '#10B98140' : '#EF444440',
                borderRadius: '99px',
              }} />
            </div>
          </div>
        )}

        {/* Achievement status */}
        {achieved !== null && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 10px', borderRadius: '8px',
            backgroundColor: achieved ? '#ECFDF5' : '#FEF2F2',
            color: achieved ? '#065F46' : '#7F1D1D',
            fontSize: '0.8rem', fontWeight: 600,
            marginBottom: notes ? '10px' : 0,
          }}>
            <span>{achieved ? '✅' : '❌'}</span>
            <span>{achieved ? '已達標 🎉' : `還差 ${(currentLdl - ldlTarget!).toFixed(0)} mg/dL`}</span>
          </div>
        )}

        {/* 10-year risk */}
        {tenYearRisk !== undefined && (
          <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#64748B' }}>
            未來 10 年心血管風險（參考值）：<strong>{tenYearRisk}%</strong>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div style={{
            marginTop: '10px', fontSize: '0.72rem', color: '#475569',
            lineHeight: 1.6, borderTop: '1px solid #F0F0F0', paddingTop: '10px',
          }}>
            {notes}
          </div>
        )}
      </div>
    </div>
  )
}
