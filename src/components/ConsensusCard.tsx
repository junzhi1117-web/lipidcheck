interface Props {
  strictestTarget: number | null
  achieved: boolean | null
  summary: string
  consistent: boolean
  currentLdl: number
}

export function ConsensusCard({ strictestTarget, achieved, summary, consistent, currentLdl }: Props) {
  return (
    <div style={{
      backgroundColor: '#E6F0F1',
      borderLeft: '4px solid #006A7A',
      borderRadius: '12px',
      padding: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <div style={{ fontSize: '2rem' }}>
          {achieved === true ? '🛡️' : achieved === false ? '⚠️' : '📋'}
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6C757D', marginBottom: '2px' }}>
            統合結論
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#006A7A' }}>
            {strictestTarget !== null ? (
              <>建議 LDL-C 目標：<span style={{ fontSize: '1.3rem' }}>{'< '}{strictestTarget}</span> mg/dL</>
            ) : (
              '生活型態介入為主'
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <div style={{
          flex: 1, minWidth: '120px', textAlign: 'center',
          backgroundColor: 'white', borderRadius: '10px', padding: '10px',
        }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#006A7A', fontFamily: 'Lexend, sans-serif' }}>
            {currentLdl}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6C757D' }}>目前 LDL-C (mg/dL)</div>
        </div>
        {strictestTarget !== null && (
          <div style={{
            flex: 1, minWidth: '120px', textAlign: 'center',
            backgroundColor: 'white', borderRadius: '10px', padding: '10px',
          }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: achieved ? '#28A745' : '#DC3545', fontFamily: 'Lexend, sans-serif' }}>
              {'< '}{strictestTarget}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6C757D' }}>建議目標 (mg/dL)</div>
          </div>
        )}
      </div>

      <p style={{ fontSize: '0.9rem', color: '#212529', lineHeight: 1.7, margin: 0 }}>
        {summary}
      </p>

      {!consistent && (
        <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#6C757D', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
          <span>ℹ️</span>
          <span>三大指引對您的風險分層有所差異，本結論採用最嚴格標準。</span>
        </div>
      )}
    </div>
  )
}
