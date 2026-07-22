'use client'

import React, { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { ConfidenceStrip } from '@/components/ConfidenceStrip'
import { 
  getProjects,
  getCurrentProjectId,
  setCurrentProjectId,
  getBacklogItems,
  getMetricSnapshots,
  getUnitEconomicsDefaults,
  Project,
  BacklogItem,
  MetricSnapshot
} from '@/lib/pmStore'
import Link from 'next/link'
import { TrendingUp, Layers, AlertTriangle, DollarSign } from 'lucide-react'

export default function CentralDashboard() {
  const [darkMode, setDarkMode] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProjId, setCurrentProjId] = useState('proj-1')
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>([])
  const [metrics, setMetrics] = useState<MetricSnapshot[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function load() {
      const pList = await getProjects()
      setProjects(pList)
      const curId = await getCurrentProjectId()
      setCurrentProjId(curId)
      setBacklogItems(await getBacklogItems(curId))
      setMetrics(await getMetricSnapshots(curId))
      setLoaded(true)
    }
    load()
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const handleProjectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value
    setCurrentProjId(newId)
    await setCurrentProjectId(newId)
    setBacklogItems(await getBacklogItems(newId))
    setMetrics(await getMetricSnapshots(newId))
  }

  const unitEco = getUnitEconomicsDefaults()

  const topBacklog = [...backlogItems]
    .filter(b => b.status !== 'shipped' && b.status !== 'killed')
    .sort((a, b) => (b.riceScore || 0) - (a.riceScore || 0))
    .slice(0, 5)

  const guardrailMetric = metrics.find(m => m.metricType === 'guardrail')
  const isGuardrailWarning = guardrailMetric ? guardrailMetric.value > 3.0 : false

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[var(--bg-paper)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--signal-teal)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={currentProjId} darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--card-bg)] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold opacity-60">انتخاب پروژه:</span>
            <select
              value={currentProjId}
              onChange={handleProjectChange}
              className="px-3 py-1.5 rounded text-sm bg-[var(--bg-paper)] border border-[var(--border-subtle)] font-medium focus:outline-none focus:border-[var(--signal-teal)]"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono-num opacity-75">
            <span>تاریخ: {new Date().toLocaleDateString('fa-IR')}</span>
          </div>
        </header>
        <div className="p-8 max-w-7xl w-full mx-auto space-y-8 flex-1">
          {isGuardrailWarning && (
            <div className="p-4 rounded bg-[var(--watch-amber)]/10 border border-[var(--watch-amber)]/30 flex items-center gap-3 text-sm">
              <AlertTriangle className="w-5 h-5 text-[var(--watch-amber)] shrink-0" />
              <div>
                <span className="font-bold">هشدار متقابل Guardrail:</span> نرخ ریزش از آستانه امن عبور کرده است.
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-2xl tracking-tight">داشبورد مرکزی و سلامت محصول</h2>
              <p className="text-sm opacity-70 mt-1">نمای جامع متریک‌ها و اولویت‌های RICE</p>
            </div>
            <Link
              href={`/projects/${currentProjId}/metrics`}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--signal-teal)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <TrendingUp className="w-4 h-4" />
              <span>مدیریت KPI</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => {
              const status = metric.metricType === 'guardrail' && metric.value > 3.0 ? 'warning' : 'healthy'
              const rangeStr = metric.normalMin !== undefined ? `بازه نرمال: ${metric.normalMin} - ${metric.normalMax} ${metric.unit}` : 'بازه پایدار'
              return (
                <div key={metric.id} className="pm-card p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs opacity-60 mb-1">
                      <span className="uppercase font-mono tracking-wider">{metric.metricType}</span>
                      <span className="font-medium text-[var(--signal-teal)]">{metric.unit}</span>
                    </div>
                    <h3 className="text-sm font-medium opacity-90">{metric.metricName}</h3>
                    <div className="text-3xl font-bold font-mono-num mt-2 tracking-tight">
                      {metric.value.toLocaleString('fa-IR')}
                    </div>
                  </div>
                  <ConfidenceStrip status={status} rangeText={rangeStr} />
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="pm-card p-6 lg:col-span-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)]">
                  <h3 className="font-display font-bold text-base flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[var(--signal-teal)]" />
                    <span>اقتصاد واحد (Unit Economics)</span>
                  </h3>
                  <Link href={`/projects/${currentProjId}/unit-economics`} className="text-xs text-[var(--signal-teal)] hover:underline font-medium">
                    محاسبه‌گر کامل ←
                  </Link>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="opacity-70">هزینه جذب (CAC):</span>
                    <span className="font-mono-num font-bold">{unitEco.cac.toLocaleString()} تومان</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-70">ارزش طول عمر (LTV):</span>
                    <span className="font-mono-num font-bold">{unitEco.ltv.toLocaleString()} تومان</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-70">نسبت LTV / CAC:</span>
                    <span className="font-mono-num font-bold px-2 py-0.5 rounded bg-[var(--guardrail-green)]/10 text-[var(--guardrail-green)]">
                      {unitEco.ltvCacRatio}x
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-70">دوره بازگشت سرمایه:</span>
                    <span className="font-mono-num font-bold">{unitEco.paybackMonths} ماه</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pm-card p-6 lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)]">
                  <h3 className="font-display font-bold text-base flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[var(--signal-teal)]" />
                    <span>بالاترین اولویت‌های بک‌لاگ (Top RICE Score)</span>
                  </h3>
                  <Link href={`/projects/${currentProjId}/backlog`} className="text-xs text-[var(--signal-teal)] hover:underline font-medium">
                    مدیریت بک‌لاگ ←
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] text-xs opacity-60">
                        <th className="py-2 font-medium">عنوان فیچر</th>
                        <th className="py-2 font-medium text-center">دسته Kano</th>
                        <th className="py-2 font-medium text-center">وضعیت</th>
                        <th className="py-2 font-medium text-left">امتیاز RICE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {topBacklog.map((item) => (
                        <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                          <td className="py-3 font-medium">{item.title}</td>
                          <td className="py-3 text-center text-xs">
                            <span className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 opacity-80">
                              {item.kanoCategory || 'Performance'}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              item.status === 'in-progress' ? 'bg-[var(--watch-amber)]/10 text-[var(--watch-amber)]' :
                              item.status === 'shipped' ? 'bg-[var(--guardrail-green)]/10 text-[var(--guardrail-green)]' :
                              'opacity-70'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 text-left font-mono-num font-bold text-[var(--signal-teal)]">
                            {item.riceScore?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {topBacklog.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center opacity-60 text-sm">
                            هنوز آیتمی ثبت نشده.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
