import { useState } from 'react'
import type { UserInput, AnalysisResult } from './types'
import { analyze } from './lib/analyze'
import { InputForm } from './components/InputForm'
import { ResultPage } from './components/ResultPage'
import { WaveHeader } from './components/WaveHeader'

type Page = 'input' | 'result'

export default function App() {
  const [page, setPage] = useState<Page>('input')
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleSubmit = (input: UserInput) => {
    const r = analyze(input)
    setResult(r)
    setPage('result')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setPage('input')
    window.scrollTo({ top: 0 })
  }

  if (page === 'result' && result) {
    return <ResultPage result={result} onBack={handleBack} />
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      <WaveHeader />
      <InputForm onSubmit={handleSubmit} />
    </div>
  )
}
