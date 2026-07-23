'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { getFunnels, saveFunnel, getCohortEntries, saveCohortEntry, Funnel, CohortEntry, FunnelStep } from '@/lib/pmStore'
import { useDarkMode } from '@/hooks/useDarkMode'
import { FieldLabel } from '@/components/FieldLabel'
import { Network, BarChart2, Plus, Save } from 'lucide-react'

export default function AnalyticsPage() {
  const params = useParams()
  const projectId = (params?.id as string) || 'proj-1'
  const [darkMode, setDarkMode] = useDarkMode()
  const [funnels, setFunnels] = useState<Funnel[]>([])
  const [selectedFunnelId, setSelectedFunnelId] = useState('')
  const [funnelName, setFunnelName] = useState('')
  const [steps, setSteps] = useState<FunnelStep[]>([])
  const [cohorts, setCohorts] = useState<CohortEntry[]>([])
  const [newCohortName, setNewCohortName] = useState('')
  const [newCohortSize, setNewCohortSize] = useState<number>(1000)
  const [newPeriods, setNewPeriods] = useState<string>('100, 70, 55, 45, 38')

  useEffect(() => {
    getFunnels(projectId).then(fnList => {
      setFunnels(fnList)
      if (fnList.length > 0) loadFunnel(fnList[0])
    })
    getCohortEntries(projectId).then(setCohorts)
  }, [projectId])

  const loadFunnel = (f: Funnel) => {
    setSelectedFunnelId(f.id)
    setFunnelName(f.name)
    setSteps(f.steps)
  }



  const getHeatmapColor = (pct: number) => {
    if (pct === 100) return 'bg-[var(--signal-teal)] text-white font-bold'
    if (pct >= 70) return 'bg-[var(--signal-teal)]/80 text-white'
    if (pct >= 50) return 'bg-[var(--signal-teal)]/60 text-white'
    if (pct >= 30) return 'bg-[var(--signal-teal)]/40'
    if (pct >= 10) return 'bg-[var(--signal-teal)]/20'
    return 'bg-black/5 opacity-40'
  }

  const handleCreateNewFunnel = async () => {
    await saveFunnel({
      projectId, name: 'قیف جدید فروش', steps: [
        { name: 'مرحله ۱', users: 1000 },
        { name: 'مرحله ۲', users: 100 }
      ]
    })
    const list = await getFunnels(projectId)
    setFunnels(list)
    if (list.length > 0) loadFunnel(list[list.length - 1])
  }

  const handleSaveFunnel = async () => {
    await saveFunnel({ id: selectedFunnelId, projectId, name: funnelName, steps })
    setFunnels(await getFunnels(projectId))
  }

  const handleAddCohort = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCohortName.trim()) return
    const periodsArr = newPeriods.split(',').map(s => Number(s.trim()))
    await saveCohortEntry({ projectId, cohortName: newCohortName, size: newCohortSize, periods: periodsArr })
    setCohorts(await getCohortEntries(projectId))
    setNewCohortName('')
    setNewCohortSize(1000)
    setNewPeriods('100, 70, 55, 45, 38')
  }

  const handleUpdateStepUser = (idx: number, userVal: number) => {
    const updated = [...steps]; updated[idx].users = userVal; setSteps(updated)
  }
  const handleUpdateStepName = (idx: number, nameVal: string) => {
    const updated = [...steps]; updated[idx].name = nameVal; setSteps(updated)
  }
  const handleAddStep = () => {
    setSteps([...steps, { name: `مرحله ${steps.length + 1}`, users: 100 }])
  }
  const handleRemoveStep = (idx: number) => {
    setSteps(steps.filter((_, i) => i !== idx))
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={projectId} darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--card-bg)] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Network className="w-5 h-5 text-[var(--signal-teal)]" />
            <h1 className="font-display font-bold text-lg">تحلیل فانل و کوهورت پویا</h1>
          </div>
          <button onClick={handleCreateNewFunnel}
            className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--signal-teal)] text-white text-sm font-medium hover:opacity-90">
            <Plus className="w-4 h-4" /><span>تعریف قیف جدید</span>
          </button>
        </header>
        <div className="p-8 max-w-7xl w-full mx-auto space-y-8 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 pm-card p-6 space-y-4">
              <h3 className="font-display font-bold text-xs opacity-70 uppercase pb-2 border-b border-[var(--border-subtle)]">ساختار قیف (Funnel Builder)</h3>
              <div className="text-sm space-y-4">
                <div>
                  <label className="block text-xs font-medium opacity-70 mb-1"><FieldLabel label="نام قیف" hint="به قیفت یه اسم بده، مثلاً «قیف فروش فروردین»" /></label>
                  <input type="text" value={funnelName} onChange={e => setFunnelName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)]" />
                </div>
                <div className="space-y-3">
                  <span className="block text-xs font-bold opacity-60">مراحل:</span>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {steps.map((step, idx) => (
                      <div key={idx} className="flex gap-2 items-center text-xs">
                        <span className="w-4 h-4 text-center font-mono">{idx + 1}</span>
                        <input type="text" value={step.name} onChange={e => handleUpdateStepName(idx, e.target.value)}
                          className="flex-1 px-2 py-1 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)]" />
                        <input type="number" value={step.users} onChange={e => handleUpdateStepUser(idx, Number(e.target.value))}
                          className="w-16 px-2 py-1 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] font-mono-num" />
                        {steps.length > 2 && <button onClick={() => handleRemoveStep(idx)} className="text-[var(--risk-red)]">×</button>}
                      </div>
                    ))}
                  </div>
                  <button onClick={handleAddStep} className="w-full py-1 rounded border border-dashed border-[var(--border-subtle)] text-xs opacity-80">+ افزودن مرحله</button>
                </div>
                <button onClick={handleSaveFunnel}
                  className="w-full py-2 rounded bg-[var(--signal-teal)] text-white text-xs font-bold hover:opacity-90 flex items-center justify-center gap-1">
                  <Save className="w-4 h-4" /><span>ذخیره قیف</span>
                </button>
              </div>
            </div>
            <div className="lg:col-span-2 pm-card p-6 space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-[var(--border-subtle)]">
                <h3 className="font-display font-bold text-base"><BarChart2 className="w-5 h-5 inline text-[var(--signal-teal)] ml-1" />تحلیل ریزش قیف</h3>
                <select value={selectedFunnelId} onChange={e => {
                  const found = funnels.find(f => f.id === e.target.value)
                  if (found) loadFunnel(found)
                }}
                  className="px-2 py-1 rounded text-xs bg-[var(--bg-paper)] border border-[var(--border-subtle)]">
                  {funnels.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div className="space-y-4">
                {steps.map((step, idx) => {
                  const prevUsers = idx === 0 ? step.users : steps[idx - 1].users
                  const stepConv = prevUsers > 0 ? ((step.users / prevUsers) * 100).toFixed(1) : '0'
                  const overallConv = steps[0].users > 0 ? ((step.users / steps[0].users) * 100).toFixed(1) : '0'
                  const widthPct = steps[0].users > 0 ? (step.users / steps[0].users) * 100 : 0
                  const dropoff = prevUsers > 0 ? (((prevUsers - step.users) / prevUsers) * 100).toFixed(1) : '0'
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-[var(--signal-teal)]/10 text-[var(--signal-teal)] text-xs flex items-center justify-center font-mono font-bold">{idx + 1}</span>
                          <span>{step.name}</span>
                        </span>
                        <span className="text-xs font-mono-num">{step.users.toLocaleString()} کاربر ({overallConv}%)</span>
                      </div>
                      <div className="w-full h-8 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] overflow-hidden flex items-center p-1">
                        <div className="h-full rounded bg-[var(--signal-teal)] flex items-center px-3 text-xs text-white font-mono-num font-medium" style={{ width: `${Math.max(widthPct, 5)}%` }}>{widthPct.toFixed(1)}%</div>
                      </div>
                      {idx > 0 && <div className="text-[11px] opacity-60 text-left font-mono-num">↓ افت: <span className="text-[var(--risk-red)]">{dropoff}%</span> (تبدیل: {stepConv}%)</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 pm-card p-6 space-y-4">
              <h3 className="font-display font-bold text-xs opacity-70 uppercase pb-2 border-b border-[var(--border-subtle)]">ثبت کوهورت جدید</h3>
              <form onSubmit={handleAddCohort} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-medium opacity-70 mb-1"><FieldLabel label="نام کوهورت" hint="این گروه کاربر کی عضو شدن؟ مثلاً «فروردین ۱۴۰۵»" /></label>
                  <input type="text" required value={newCohortName} onChange={e => setNewCohortName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)]" />
                </div>
                <div>
                  <label className="block text-xs font-medium opacity-70 mb-1"><FieldLabel label="سایز" hint="تعداد کل کاربرانی که در این کوهورت عضو شدن" /></label>
                  <input type="number" required value={newCohortSize} onChange={e => setNewCohortSize(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] font-mono-num" />
                </div>
                <div>
                  <label className="block text-xs font-medium opacity-70 mb-1"><FieldLabel label="درصدهای ماندگاری" hint="از این کوهورت، توی هر دوره چند درصد هنوز فعالن؟ اولی همیشه ۱۰۰ (مثلاً 100, 70, 55, 45, 38)" /></label>
                  <input type="text" required value={newPeriods} onChange={e => setNewPeriods(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] font-mono-num" />
                </div>
                <button type="submit"
                  className="w-full py-2 rounded bg-[var(--signal-teal)] text-white text-xs font-bold hover:opacity-90 flex items-center justify-center gap-1">
                  <Plus className="w-4 h-4" /><span>ثبت کوهورت</span>
                </button>
              </form>
            </div>
            <div className="lg:col-span-2 pm-card p-6 space-y-4">
              <h3 className="font-display font-bold text-base pb-3 border-b border-[var(--border-subtle)]">نقشه حرارتی کوهورت</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs font-mono-num">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] opacity-70">
                      <th className="py-2 text-right font-medium">کوهورت</th>
                      <th className="py-2 font-medium">سایز</th>
                      <th className="py-2 font-medium">د۰</th><th className="py-2 font-medium">د۱</th><th className="py-2 font-medium">د۲</th>
                      <th className="py-2 font-medium">د۳</th><th className="py-2 font-medium">د۴</th><th className="py-2 font-medium">د۵</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {cohorts.map(row => (
                      <tr key={row.id}>
                        <td className="py-3 text-right font-medium font-sans">{row.cohortName}</td>
                        <td className="py-3 opacity-80">{row.size.toLocaleString()}</td>
                        {[0, 1, 2, 3, 4, 5].map(pIdx => {
                          const val = row.periods[pIdx]
                          return <td key={pIdx} className="py-2 px-1">
                            {val !== undefined ? <div className={`py-1.5 rounded ${getHeatmapColor(val)}`}>{val}%</div> : <span className="opacity-20">-</span>}
                          </td>
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
