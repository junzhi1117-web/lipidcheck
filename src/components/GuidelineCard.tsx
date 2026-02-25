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

export function GuidelineCard({ result }: Props) {
  const { guideline, riskLevel, ldlTargetText, currentLdl, achieved, tenYearRisk, notes } = result

  return (
    <div style={{ flex: 1, minWidth: 0, border: '1px solid #DEE2E6', borderRadius: '12px', padding: '16px', backgroundColor: '#FAFAFA' }}>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '0.8rem', color: '#6C757D', fontWeight: 500 }}>
          {GUIDELINE_YEARS[guideline]}
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#212529' }}>
          {GUIDELINE_NAMES[guideline]}
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <RiskBadge level={riskLevel} size="sm" />
      </div>

      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '0.75rem', color: '#6C757D', marginBottom: '2px' }}>LDL 目標</div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#212529' }}>{ldlTargetText}</div>
      </div>

      {achieved !== null && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 10px', borderRadius: '8px',
          backgroundColor: achieved ? '#d4edda' : '#f8d7da',
          color: achieved ? '#155724' : '#721c24',
          fontSize: '0.8rem', fontWeight: 500
        }}>
          <span>{achieved ? '✅' : '❌'}</span>
          <span>{achieved ? '已達標' : `目前 ${currentLdl} mg/dL，未達標`}</span>
        </div>
      )}

      {tenYearRisk !== undefined && (
        <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#6C757D' }}>
          10年ASCVD風險：{tenYearRisk}%
        </div>
      )}

      {notes && (
        <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#6C757D', lineHeight: 1.5, borderTop: '1px solid #DEE2E6', paddingTop: '8px' }}>
          {notes}
        </div>
      )}
    </div>
  )
}
