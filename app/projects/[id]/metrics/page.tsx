'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { getMetricSnapshots, saveMetricSnapshot, MetricSnapshot } from '@/lib/pmStore'
import { ConfidenceStrip } from '@/components/ConfidenceStrip'
import { useDarkMode } from '@/hooks/useDarkMode'
import { FieldLabel } from '@/components/FieldLabel'
import { TrendingUp, Plus } from 'lucide-react'

export default function MetricsPage() {
  const params = useParams()
  const projectId = (params?.id as string) || 'proj-1'
  const [darkMode, setDarkMode] = useDarkMode()
  const [metrics, setMetrics] = useState<MetricSnapshot[]>([])
  const [name, setName] = useState('')
  const [metricType, setMetricType] = useState<'north-star' | 'leading' | 'lagging' | 'guardrail'>('leading')
  const [value, setValue] = useState<number>(0)
  const [unit, setUnit] = useState('%')
  const [normMin, setNormMin] = useState<number>(0)
  const [normMax, setNormMax] = useState<number>(100)

  useEffect(() => { getMetricSnapshots(projectId).then(setMetrics) }, [projectId])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await saveMetricSnapshot({ projectId, metricName: name, metricType, value, unit, normalMin: normMin, normalMax: normMax })
    setMetrics(await getMetricSnapshots(projectId))
    setName(''); setValue(0)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={projectId} darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--card-bg)] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-[var(--signal-teal)]" /><h1 className="font-display font-bold text-lg">سلسله‌مراتب متریک‌ها و KPI</h1></div>
        </header>
        <div className="p-8 max-w-7xl w-full mx-auto space-y-8 flex-1">
          <div className="pm-card p-6">
            <h3 className="font-display font-bold text-base mb-4 pb-3 border-b border-[var(--border-subtle)]">ثبت سنجش متریک جدید</h3>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-6 gap-4 text-sm">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium opacity-70 mb-1"><FieldLabel label="نام متریک" hint="این متریک چیه؟ (مثلاً «تعداد کاربر فعال روزانه»)" /></label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="مثلاً کاربر فعال روزانه"
                  className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)]" />
              </div>
              <div>
                <label className="block text-xs font-medium opacity-70 mb-1"><FieldLabel label="نوع متریک" hint="North Star: اصلی‌ترین متریک کسب‌وکار / Leading: پیش‌بینی‌کننده / Lagging: نتیجه نهایی / Guardrail: مرز هشدار" /></label>
                <select value={metricType} onChange={e => setMetricType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)]">
                  <option value="north-star">North Star</option>
                  <option value="leading">Leading</option>
                  <option value="lagging">Lagging</option>
                  <option value="guardrail">Guardrail</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium opacity-70 mb-1"><FieldLabel label="مقدار" hint="امروز این متریک روی چه عددیه؟" /></label>
                <input type="number" step="0.01" required value={value} onChange={e => setValue(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] font-mono-num" />
              </div>
              <div>
                <label className="block text-xs font-medium opacity-70 mb-1"><FieldLabel label="واحد" hint="مثلاً نفر، درصد، تومان، دقیقه" /></label>
                <input type="text" value={unit} onChange={e => setUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)]" />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full py-2 rounded bg-[var(--signal-teal)] text-white font-medium text-xs hover:opacity-90">
                  <Plus className="w-4 h-4 inline" /> ثبت</button>
              </div>
            </form>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metrics.map(m => {
              const status = m.metricType === 'guardrail' && m.value > 3.0 ? 'warning' : 'healthy'
              const rangeStr = m.normalMin !== undefined ? `بازه: ${m.normalMin}-${m.normalMax} ${m.unit}` : 'بازه پایدار'
              return (
                <div key={m.id} className="pm-card p-6">
                  <div className="text-xs opacity-60 uppercase font-mono mb-2">
                    <span className="px-2 py-0.5 rounded bg-black/5">{m.metricType}</span>
                  </div>
                  <h4 className="font-display font-bold text-base">{m.metricName}</h4>
                  <div className="text-4xl font-bold font-mono-num mt-3">{m.value.toLocaleString()} <span className="text-lg font-normal opacity-70">{m.unit}</span></div>
                  <ConfidenceStrip status={status} rangeText={rangeStr} />
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
