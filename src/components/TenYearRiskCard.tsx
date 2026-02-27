interface Props {
  pce: number | null
  score2: number | null
}

export function TenYearRiskCard({ pce, score2 }: Props) {
  if (pce === null && score2 === null) return null

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      border: '1px solid #E2E8F0',
      overflow: 'hidden',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        padding: '14px 16px 12px',
        borderBottom: '1px solid #F0F0F0',
      }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748B' }}>
          10 年心血管風險預測
        </div>
      </div>

      <div style={{ display: 'flex', padding: '16px' }}>
        {/* PCE column */}
        <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #F0F0F0', paddingRight: '16px' }}>
          <div style={{ fontSize: '0.72rem', color: '#9AA0A6', fontWeight: 600, marginBottom: '8px' }}>
            PCE（ACC/AHA）
          </div>
          {pce !== null ? (
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#1A1A1A', lineHeight: 1 }}>
                {pce}
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748B' }}>%</span>
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: '#9AA0A6', fontWeight: 500 }}>
              N/A（年齡範圍外）
            </div>
          )}
        </div>

        {/* SCORE2 column */}
        <div style={{ flex: 1, textAlign: 'center', paddingLeft: '16px' }}>
          <div style={{ fontSize: '0.72rem', color: '#9AA0A6', fontWeight: 600, marginBottom: '8px' }}>
            SCORE2（ESC）
          </div>
          {score2 !== null ? (
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#1A1A1A', lineHeight: 1 }}>
                {score2}
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748B' }}>%</span>
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: '#9AA0A6', fontWeight: 500 }}>
              N/A（年齡範圍外）
            </div>
          )}
        </div>
      </div>

      {/* Warning */}
      <div style={{
        margin: '0 16px 16px',
        backgroundColor: '#FFF8E6',
        border: '1px solid #FFCC6E',
        borderRadius: '8px',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
      }}>
        <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>⚠️</span>
        <div style={{ fontSize: '0.72rem', color: '#664D00', lineHeight: 1.65 }}>
          以上數字以西方族群（美國/歐洲）為驗證基準。研究顯示台灣人的實際心血管風險可能低於此預測值 20–40%，僅供與醫師討論參考，請勿作為獨立診斷依據。
        </div>
      </div>
    </div>
  )
}
