'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { getExperiments, saveExperiment, Experiment } from '@/lib/pmStore'
import { FlaskConical, AlertTriangle, CheckCircle2, Calculator, Plus, Check } from 'lucide-react'

export default function ExperimentsPage() {
  const params = useParams()
  const projectId = (params?.id as string) || 'proj-1'
  const [darkMode, setDarkMode] = useState(false)
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [selectedExpId, setSelectedExpId] = useState<string>('')
  const [name, setName] = useState('بهینه‌سازی دکمه خرید')
  const [baselineRate, setBaselineRate] = useState<number>(10)
  const [mde, setMde] = useState<number>(2)
  const [alpha, setAlpha] = useState<number>(0.05)
  const [power, setPower] = useState<number>(0.8)
  const [n1, setN1] = useState<number>(3500)
  const [x1, setX1] = useState<number>(350)
  const [n2, setN2] = useState<number>(3450)
  const [x2, setX2] = useState<number>(414)
  const [status, setStatus] = useState<'planned' | 'running' | 'concluded'>('running')

  useEffect(() => {
    getExperiments(projectId).then(list => {
      setExperiments(list)
      if (list.length > 0) loadExp(list[0])
    })
  }, [projectId])

  const loadExp = (exp: Experiment) => {
    setSelectedExpId(exp.id)
    setName(exp.name)
    setBaselineRate(exp.baselineRate)
    setMde(exp.mde)
    setAlpha(exp.alpha)
    setPower(exp.power)
    setN1(exp.n1)
    setX1(exp.x1)
    setN2(exp.n2)
    setX2(exp.x2)
    setStatus(exp.status as any)
  }

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [darkMode])

  const p1 = baselineRate / 100
  const p2 = (baselineRate + mde) / 100
  const zAlpha = alpha === 0.01 ? 2.576 : alpha === 0.05 ? 1.96 : 1.645
  const zBeta = power === 0.9 ? 1.282 : 0.842
  const numerator = Math.pow(zAlpha + zBeta, 2) * (p1 * (1 - p1) + p2 * (1 - p2))
  const denominator = Math.pow(p1 - p2, 2)
  const requiredSampleSizePerVariant = denominator > 0 ? Math.ceil(numerator / denominator) : 0
  const totalRequiredSample = requiredSampleSizePerVariant * 2
  const pObserved1 = n1 > 0 ? x1 / n1 : 0
  const pObserved2 = n2 > 0 ? x2 / n2 : 0
  const pPooled = (n1 + n2) > 0 ? (x1 + x2) / (n1 + n2) : 0
  const se = pPooled > 0 && n1 > 0 && n2 > 0 ? Math.sqrt(pPooled * (1 - pPooled) * (1 / n1 + 1 / n2)) : 0
  const zScore = se > 0 ? (pObserved2 - pObserved1) / se : 0
  const isSampleSufficient = n1 >= requiredSampleSizePerVariant && n2 >= requiredSampleSizePerVariant
  const isSignificant = Math.abs(zScore) >= zAlpha

  const handleCreateNew = async () => {
    await saveExperiment({ projectId, name: 'آزمایش جدید', baselineRate: 8, mde: 2, alpha: 0.05, power: 0.8, n1: 0, x1: 0, n2: 0, x2: 0, status: 'planned' })
    const list = await getExperiments(projectId)
    setExperiments(list)
    if (list.length > 0) loadExp(list[list.length - 1])
  }

  const handleSaveCurrent = async () => {
    await saveExperiment({ id: selectedExpId, projectId, name, baselineRate, mde, alpha, power, n1, x1, n2, x2, status })
    setExperiments(await getExperiments(projectId))
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={projectId} darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--card-bg)] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <FlaskConical className="w-5 h-5 text-[var(--signal-teal)]" />
            <h1 className="font-display font-bold text-lg">محاسبه‌گر و مدیریت تست A/B</h1>
          </div>
          <button onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--signal-teal)] text-white text-sm font-medium hover:opacity-90">
            <Plus className="w-4 h-4" /><span>تعریف آزمایش جدید</span>
          </button>
        </header>
        <div className="p-8 max-w-7xl w-full mx-auto space-y-8 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 pm-card p-4 space-y-3">
              <h3 className="font-display font-bold text-xs opacity-70 uppercase pb-2 border-b border-[var(--border-subtle)]">آزمایش‌ها</h3>
              {experiments.map(e => (
                <button key={e.id} onClick={() => loadExp(e)}
                  className={`w-full text-right px-3 py-2 rounded text-xs block ${selectedExpId === e.id ? 'bg-[var(--signal-teal)] text-white font-bold' : 'hover:bg-black/5 opacity-85'}`}>
                  <div className="truncate">{e.name}</div>
                  <div className="text-[10px] opacity-60">{e.status}</div>
                </button>
              ))}
            </div>
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="pm-card p-6 space-y-6">
                <h3 className="font-display font-bold text-base pb-3 border-b border-[var(--border-subtle)]">
                  <Calculator className="w-5 h-5 inline text-[var(--signal-teal)] ml-1" />
                  ۱. مشخصات و محاسبه حجم نمونه
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium opacity-70 mb-1">نام آزمایش</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium opacity-70 mb-1">وضعیت</label>
                    <select value={status} onChange={e => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)]">
                      <option value="planned">برنامه‌ریزی شده</option>
                      <option value="running">در حال اجرا</option>
                      <option value="concluded">پایان یافته</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium opacity-70 mb-1">نرخ تبدیل پایه (%)</label>
                    <input type="number" step="0.1" value={baselineRate} onChange={e => setBaselineRate(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] font-mono-num" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium opacity-70 mb-1">MDE (%)</label>
                    <input type="number" step="0.1" value={mde} onChange={e => setMde(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] font-mono-num" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1">Alpha</label>
                      <select value={alpha} onChange={e => setAlpha(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)]">
                        <option value={0.05}>0.05</option>
                        <option value={0.01}>0.01</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1">Power</label>
                      <select value={power} onChange={e => setPower(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)]">
                        <option value={0.8}>0.8</option>
                        <option value={0.9}>0.9</option>
                      </select>
                    </div>
                  </div>
                  <div className="p-4 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="opacity-70">نمونه لازم هر گروه:</span>
                      <span className="font-mono-num font-bold text-base text-[var(--signal-teal)]">
                        {requiredSampleSizePerVariant.toLocaleString()} نفر
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pm-card p-6 space-y-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <h3 className="font-display font-bold text-base pb-3 border-b border-[var(--border-subtle)]">
                    <FlaskConical className="w-5 h-5 inline text-[var(--signal-teal)] ml-1" />
                    ۲. نتایج و ارزیابی Z-Test
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1">کنترل (n1)</label>
                      <input type="number" value={n1} onChange={e => setN1(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] font-mono-num" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1">کنترل (x1)</label>
                      <input type="number" value={x1} onChange={e => setX1(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] font-mono-num" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1">جدید (n2)</label>
                      <input type="number" value={n2} onChange={e => setN2(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] font-mono-num" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium opacity-70 mb-1">جدید (x2)</label>
                      <input type="number" value={x2} onChange={e => setX2(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] font-mono-num" />
                    </div>
                  </div>
                  <div className={`p-4 rounded border ${
                    !isSampleSufficient ? 'bg-[var(--watch-amber)]/10 border-[var(--watch-amber)]/30 text-[var(--watch-amber)]' :
                    isSignificant ? 'bg-[var(--guardrail-green)]/10 border-[var(--guardrail-green)]/30 text-[var(--guardrail-green)]' :
                    'bg-black/5 border-[var(--border-subtle)] opacity-80'}`}>
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {!isSampleSufficient ? <><AlertTriangle className="w-4 h-4" /><span>حجم نمونه ناکافی!</span></>
                        : isSignificant ? <><CheckCircle2 className="w-4 h-4" /><span>معنادار است!</span></>
                        : <span>معنادار نیست.</span>}
                    </div>
                    <p className="text-xs opacity-80 mt-1">
                      {!isSampleSufficient ? `حداقل ${requiredSampleSizePerVariant.toLocaleString()} نفر نیاز است.`
                        : isSignificant ? `کنترل: ${(pObserved1*100).toFixed(2)}%, جدید: ${(pObserved2*100).toFixed(2)}%`
                        : `Z = ${zScore.toFixed(2)}`}
                    </p>
                  </div>
                </div>
                <button onClick={handleSaveCurrent}
                  className="w-full py-2.5 rounded bg-[var(--signal-teal)] text-white text-xs font-bold hover:opacity-95 flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" /><span>ذخیره آزمایش</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
