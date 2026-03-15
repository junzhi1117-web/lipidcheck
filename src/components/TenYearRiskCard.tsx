interface Props {
  accaha: number | null
  score2: number | null
}

export function TenYearRiskCard({ accaha, score2 }: Props) {
  if (accaha === null && score2 === null) return null

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
        <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #F0F0F0', paddingRight: '16px' }}>
          <div style={{ fontSize: '0.72rem', color: '#9AA0A6', fontWeight: 600, marginBottom: '8px' }}>
            PREVENT-ASCVD（ACC/AHA）
          </div>
          {accaha !== null ? (
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#1A1A1A', lineHeight: 1 }}>
                {accaha}
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748B' }}>%</span>
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: '#9AA0A6', fontWeight: 500 }}>
              N/A（年齡範圍外）
            </div>
          )}
        </div>

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
          ACC/AHA 2026 已改採 PREVENT-ASCVD。本版已接上 10 年 PREVENT-ASCVD base model；若缺少身高/體重、eGFR 或 statin 使用資訊，就不會硬算風險數字。結果適合拿來和醫師討論，不建議單獨作為診斷依據。
        </div>
      </div>
    </div>
  )
}
