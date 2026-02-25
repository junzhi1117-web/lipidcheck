interface Props {
  strictestTarget: number | null
  achieved: boolean | null
  summary: string
  consistent: boolean
  currentLdl: number
  crossGuidelineNote?: string
}

export function ConsensusCard({ strictestTarget, achieved, summary, consistent, currentLdl, crossGuidelineNote }: Props) {
  const gap = strictestTarget !== null ? currentLdl - strictestTarget : null
  const gapAbs = gap !== null ? Math.abs(gap) : null
  const pct = strictestTarget !== null
    ? Math.min(Math.max((currentLdl / (strictestTarget * 1.8)) * 100, 4), 96)
    : null
  const targetPct = strictestTarget !== null
    ? Math.min((strictestTarget / (strictestTarget * 1.8)) * 100, 90)
    : null

  return (
    <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,106,122,0.12)' }}>
      {/* 頂部色塊 */}
      <div style={{
        background: 'linear-gradient(135deg, #006A7A 0%, #008899 100%)',
        padding: '20px 20px 16px',
        color: 'white',
      }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.75, marginBottom: '6px' }}>
          三大指引綜合建議
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>
            {strictestTarget !== null ? `< ${strictestTarget}` : '—'}
          </div>
          {strictestTarget !== null && (
            <div style={{ fontSize: '0.9rem', opacity: 0.85, fontWeight: 500 }}>mg/dL</div>
          )}
        </div>
        <div style={{ fontSize: '0.82rem', opacity: 0.8, marginTop: '4px' }}>
          {strictestTarget !== null ? '您的膽固醇目標（最嚴格標準）' : '以飲食運動調整為主'}
        </div>
      </div>

      {/* 主體 */}
      <div style={{ backgroundColor: 'white', padding: '20px' }}>

        {/* LDL 現況 + 達標 */}
        {strictestTarget !== null && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
              <div style={{
                flex: 1, textAlign: 'center', padding: '12px 8px',
                backgroundColor: '#F8F9FA', borderRadius: '12px',
              }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1A1A1A', lineHeight: 1 }}>
                  {currentLdl}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#9AA0A6', marginTop: '4px', fontWeight: 500 }}>您目前的膽固醇</div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem', color: '#9AA0A6',
              }}>→</div>
              <div style={{
                flex: 1, textAlign: 'center', padding: '12px 8px',
                backgroundColor: achieved ? '#d4edda' : '#fdecea', borderRadius: '12px',
              }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: achieved ? '#155724' : '#7B1C1C', lineHeight: 1 }}>
                  {'< '}{strictestTarget}
                </div>
                <div style={{ fontSize: '0.7rem', color: achieved ? '#1E7E34' : '#9B2020', marginTop: '4px', fontWeight: 500 }}>
                  {achieved ? '✅ 已達標 🎉' : `❌ 還差 ${gapAbs} mg/dL`}
                </div>
              </div>
            </div>

            {/* 進度條 */}
            {pct !== null && targetPct !== null && (
              <div style={{ position: 'relative', height: '8px', backgroundColor: '#F0F0F0', borderRadius: '99px', overflow: 'visible', marginBottom: '20px' }}>
                <div style={{
                  position: 'absolute', left: `${targetPct}%`,
                  top: '-3px', bottom: '-3px', width: '2px',
                  backgroundColor: '#006A7A', borderRadius: '2px',
                }} />
                <div style={{
                  position: 'absolute', left: `${targetPct}%`,
                  top: '12px', transform: 'translateX(-50%)',
                  fontSize: '0.62rem', color: '#006A7A', fontWeight: 600, whiteSpace: 'nowrap',
                }}>目標 &lt;{strictestTarget}</div>
                <div style={{
                  position: 'absolute', left: `${pct}%`,
                  top: '-5px', width: '18px', height: '18px',
                  borderRadius: '50%',
                  backgroundColor: achieved ? '#28A745' : '#DC3545',
                  border: '2.5px solid white',
                  boxShadow: '0 1px 5px rgba(0,0,0,0.2)',
                  transform: 'translateX(-50%)',
                }} />
                <div style={{
                  position: 'absolute', left: 0,
                  width: `${pct}%`, height: '8px',
                  backgroundColor: achieved ? '#28A74540' : '#DC354530',
                  borderRadius: '99px',
                }} />
              </div>
            )}
          </div>
        )}

        {/* 結論文字 */}
        <p style={{ fontSize: '0.88rem', color: '#333', lineHeight: 1.75, margin: '0 0 14px' }}>
          {summary}
        </p>

        {/* 指引不一致提示 */}
        {!consistent && !crossGuidelineNote && (
          <div style={{ fontSize: '0.78rem', color: '#6C757D', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <span>ℹ️</span>
            <span>三大指引的風險分類略有差異，本結論採用最嚴格標準。</span>
          </div>
        )}

        {/* 跨指引提示（白話文，橘色醒目框） */}
        {crossGuidelineNote && (
          <div style={{
            marginTop: '4px',
            backgroundColor: '#FFF8E6',
            border: '1px solid #FFCC6E',
            borderLeft: '4px solid #F0A000',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex', alignItems: 'flex-start', gap: '10px',
          }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>⚠️</span>
            <div style={{ fontSize: '0.82rem', color: '#664D00', lineHeight: 1.7 }}>
              {crossGuidelineNote}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
