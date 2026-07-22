'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { getOKRs, saveOKR, deleteOKR, OKR, KeyResult } from '@/lib/pmStore'
import { Target, Plus } from 'lucide-react'

export default function OkrsPage() {
  const params = useParams()
  const projectId = (params?.id as string) || 'proj-1'
  const [darkMode, setDarkMode] = useState(false)
  const [okrs, setOkrs] = useState<OKR[]>([])
  const [newObjective, setNewObjective] = useState('')
  const [newQuarter, setNewQuarter] = useState('۱۴۰۵ - ۴Q')

  useEffect(() => { getOKRs(projectId).then(setOkrs) }, [projectId])
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [darkMode])

  const handleAddObjective = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newObjective.trim()) return
    await saveOKR({ projectId, objective: newObjective, quarter: newQuarter, keyResults: [] })
    setOkrs(await getOKRs(projectId))
    setNewObjective('')
  }

  const handleDeleteObjective = async (id: string) => {
    if (confirm('آیا از حذف اطمینان دارید؟')) { await deleteOKR(id); setOkrs(await getOKRs(projectId)) }
  }

  const handleAddKeyResult = async (okrId: string, desc: string, start: number, target: number, current: number) => {
    if (!desc.trim()) return
    const okr = okrs.find(o => o.id === okrId)
    if (!okr) return
    await saveOKR({ ...okr, keyResults: [...okr.keyResults, { id: 'kr-' + Date.now(), description: desc, startValue: start, targetValue: target, currentValue: current }] })
    setOkrs(await getOKRs(projectId))
  }

  const handleUpdateKR = async (okrId: string, krId: string, value: number) => {
    const okr = okrs.find(o => o.id === okrId)
    if (!okr) return
    await saveOKR({ ...okr, keyResults: okr.keyResults.map(kr => kr.id === krId ? { ...kr, currentValue: value } : kr) })
    setOkrs(await getOKRs(projectId))
  }

  const calcProg = (kr: KeyResult) => {
    const r = kr.targetValue - kr.startValue
    if (r === 0) return 100
    return Math.min(Math.max(Number((((kr.currentValue - kr.startValue) / r) * 100).toFixed(1)), 0), 100)
  }

  const progColor = (p: number) => p >= 70 ? 'text-[var(--guardrail-green)]' : p >= 30 ? 'text-[var(--watch-amber)]' : 'text-[var(--risk-red)]'
  const progBg = (p: number) => p >= 70 ? 'bg-[var(--guardrail-green)]' : p >= 30 ? 'bg-[var(--watch-amber)]' : 'bg-[var(--risk-red)]'

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={projectId} darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--card-bg)] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3"><Target className="w-5 h-5 text-[var(--signal-teal)]" /><h1 className="font-display font-bold text-lg">مدیریت OKR فصلی</h1></div>
        </header>
        <div className="p-8 max-w-7xl w-full mx-auto space-y-8 flex-1">
          <div className="pm-card p-6">
            <h3 className="font-display font-bold text-base mb-4 pb-2 border-b border-[var(--border-subtle)]">ثبت هدف جدید</h3>
            <form onSubmit={handleAddObjective} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="md:col-span-2">
                <input type="text" required value={newObjective} onChange={e => setNewObjective(e.target.value)}
                  placeholder="هدف فصلی..." className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)]" />
              </div>
              <div>
                <input type="text" required value={newQuarter} onChange={e => setNewQuarter(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)]" />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full py-2 rounded bg-[var(--signal-teal)] text-white text-xs font-medium hover:opacity-90">
                  <Plus className="w-4 h-4 inline" /> ثبت هدف</button>
              </div>
            </form>
          </div>
          <div className="space-y-6">
            {okrs.map(okr => {
              const avgProg = okr.keyResults.length > 0 ? Math.round(okr.keyResults.reduce((s, kr) => s + calcProg(kr), 0) / okr.keyResults.length) : 0
              return (
                <div key={okr.id} className="pm-card p-6 space-y-4">
                  <div className="flex items-start justify-between pb-3 border-b border-[var(--border-subtle)]">
                    <div>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--signal-teal)]/10 text-[var(--signal-teal)] font-mono-num">{okr.quarter}</span>
                      <h4 className="font-display font-bold text-base mt-1">{okr.objective}</h4>
                    </div>
                    <button onClick={() => handleDeleteObjective(okr.id)} className="text-[var(--risk-red)] text-xs hover:underline">حذف</button>
                  </div>
                  <div className="space-y-4">
                    {okr.keyResults.map(kr => {
                      const p = calcProg(kr)
                      return (
                        <div key={kr.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)]">
                          <div className="flex-1 text-sm"><span className="font-medium">{kr.description}</span></div>
                          <div className="flex items-center gap-3">
                            <input type="number" step="0.1" value={kr.currentValue} onChange={e => handleUpdateKR(okr.id, kr.id, Number(e.target.value))}
                              className="w-16 px-1.5 py-1 rounded bg-[var(--card-bg)] border border-[var(--border-subtle)] font-mono-num text-center text-xs" />
                            <div className="w-24 bg-black/10 h-2 rounded overflow-hidden"><div className={`h-full ${progBg(p)}`} style={{ width: `${p}%` }} /></div>
                            <span className={`text-xs font-mono-num font-bold w-12 text-left ${progColor(p)}`}>{p}%</span>
                          </div>
                        </div>
                      )
                    })}
                    <form onSubmit={(e: any) => { e.preventDefault(); handleAddKeyResult(okr.id, e.target.krDesc.value, Number(e.target.krStart.value), Number(e.target.krTarget.value), Number(e.target.krCurrent.value)); e.target.reset() }}
                      className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                      <input name="krDesc" required placeholder="نتیجه کلیدی..." className="md:col-span-2 px-3 py-1.5 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)]" />
                      <input name="krStart" type="number" required placeholder="شروع" className="px-3 py-1.5 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] font-mono-num" />
                      <input name="krTarget" type="number" required placeholder="هدف" className="px-3 py-1.5 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] font-mono-num" />
                      <button type="submit" className="py-1.5 rounded bg-[var(--signal-teal)] text-white text-xs font-medium"><Plus className="w-3.5 h-3.5 inline" /> +KR</button>
                    </form>
                  </div>
                </div>
              )
            })}
            {okrs.length === 0 && <div className="text-center py-12 opacity-60 text-sm">هنوز هدفی ثبت نشده.</div>}
          </div>
        </div>
      </main>
    </div>
  )
}
