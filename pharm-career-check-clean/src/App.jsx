import React, { useMemo, useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'

const ROLES = [
  { key: 'hospital', label: '病院薬剤師' },
  { key: 'dispense', label: '調剤薬局' },
  { key: 'drug', label: 'ドラッグストア' },
]

const QUESTIONS = [
  {
    text: '多職種と連携しながら臨床現場で患者さんに関わりたい',
    weights: { hospital: 3, dispense: 1, drug: 1 },
  },
  {
    text: '調剤や投薬など、薬のプロとしてコツコツ丁寧に向き合うのが得意',
    weights: { hospital: 1, dispense: 3, drug: 1 },
  },
  {
    text: '接客・販売・POP作りなど“売場づくり”にも興味がある',
    weights: { hospital: 0, dispense: 1, drug: 3 },
  },
  {
    text: '緊急対応や夜間休日勤務など、ある程度の変則勤務も許容できる',
    weights: { hospital: 2, dispense: 1, drug: 1 },
  },
  {
    text: '決められた手順を正確に、スピード感を持ってこなすのが得意',
    weights: { hospital: 1, dispense: 2, drug: 2 },
  },
]

export default function App() {
  const [step, setStep] = useState('lp')          // 'lp' | 'q' | 'result'
  const [idx, setIdx] = useState(0)
  const [scores, setScores] = useState({ hospital: 0, dispense: 0, drug: 0 })

  const totalMax = useMemo(() => {
    // 仮に「YES=そのまま加点、NO=0点」で計算
    return QUESTIONS.reduce((acc, q) => {
      // その設問で最大の重みを足す（満点の想定）
      return acc + Math.max(...Object.values(q.weights))
    }, 0)
  }, [])

  const start = () => {
    setStep('q')
    setIdx(0)
    setScores({ hospital: 0, dispense: 0, drug: 0 })
  }

  const answer = (isYes) => {
    const q = QUESTIONS[idx]
    setScores(prev => {
      const next = { ...prev }
      if (isYes) {
        Object.entries(q.weights).forEach(([k, v]) => (next[k] += v))
      }
      return next
    })
    if (idx + 1 < QUESTIONS.length) {
      setIdx(idx + 1)
    } else {
      setStep('result')
    }
  }

  const chartData = useMemo(() => {
    const arr = ROLES.map(r => ({ name: r.label, score: scores[r.key] }))
    // 表示上分かりやすく降順
    arr.sort((a, b) => b.score - a.score)
    return arr
  }, [scores])

  const percentTop = useMemo(() => {
    if (totalMax === 0) return 0
    const top = chartData[0]?.score ?? 0
    return Math.round((top / totalMax) * 100)
  }, [chartData, totalMax])

  return (
    <div className="container">
      {step === 'lp' && (
        <>
          <div className="hero">
            <h1>薬学部キャリア診断</h1>
            <p className="lead">
              たった5問で、あなたの強みに合う薬剤師の仕事タイプを可視化します。
            </p>
            <button className="btn" onClick={start}>診断を受けてみる</button>
            <div className="spacer" />
            <p className="muted">所要時間：約1分 / 個人情報の入力は不要です</p>
          </div>
        </>
      )}

      {step === 'q' && (
        <div className="qbox">
          <div className="muted">Q{idx + 1} / {QUESTIONS.length}</div>
          <div className="qtext">{QUESTIONS[idx].text}</div>
          <div className="actions">
            <button className="btn" onClick={() => answer(true)}>はい</button>
            <button className="btn secondary" onClick={() => answer(false)}>いいえ</button>
          </div>
        </div>
      )}

      {step === 'result' && (
        <>
          <h1>診断結果</h1>
          <p className="lead">あなたに合う可能性が高いのは… <b>{chartData[0]?.name}</b>（マッチ率{percentTop}%）</p>

          <div className="result" style={{ height: 280, background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 12, right: 24, left: 24, bottom: 12 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={160} />
                <Tooltip />
                <Bar dataKey="score" fill="#2563eb" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="spacer" />
          <button className="btn secondary" onClick={() => setStep('lp')}>最初の画面に戻る</button>
        </>
      )}
    </div>
  )
}
