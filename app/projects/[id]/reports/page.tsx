'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { getBacklogItems, getMetricSnapshots, BacklogItem, MetricSnapshot } from '@/lib/pmStore'
import { useDarkMode } from '@/hooks/useDarkMode'
import { FileText, Download, Printer } from 'lucide-react'

export default function ReportsPage() {
  const params = useParams()
  const projectId = (params?.id as string) || 'proj-1'
  const [darkMode, setDarkMode] = useDarkMode()
  const [backlog, setBacklog] = useState<BacklogItem[]>([])
  const [metrics, setMetrics] = useState<MetricSnapshot[]>([])

  useEffect(() => {
    getBacklogItems(projectId).then(setBacklog)
    getMetricSnapshots(projectId).then(setMetrics)
  }, [projectId])

  const exportCSV = () => {
    if (backlog.length === 0) return
    const h = ['title', 'reach', 'impact', 'confidence', 'effort', 'riceScore', 'kanoCategory', 'status']
    const csv = [h.join(','), ...backlog.map(i => [i.title, i.reach || 0, i.impact || 0, i.confidence || 0, i.effort || 0, i.riceScore || 0, i.kanoCategory || '', i.status].join(','))].join('\n')
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', `backlog_${projectId}.csv`)
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  return (
    <div className="flex h-screen overflow-hidden print:h-auto print:overflow-visible">
      <div className="print:hidden flex"><Sidebar projectId={projectId} darkMode={darkMode} setDarkMode={setDarkMode} /></div>
      <main className="flex-1 overflow-y-auto flex flex-col print:overflow-visible">
        <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--card-bg)] px-8 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-[var(--signal-teal)]" /><h1 className="font-display font-bold text-lg">مرکز گزارشات و خروجی</h1></div>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--signal-teal)] text-white text-xs font-medium"><Printer className="w-4 h-4" /><span>چاپ / PDF</span></button>
        </header>
        <div className="p-8 max-w-4xl w-full mx-auto space-y-8 flex-1 print:p-0 print:max-w-full">
          <div className="pm-card p-6 space-y-4 print:hidden">
            <h3 className="font-display font-bold text-base"><Download className="w-5 h-5 inline text-[var(--signal-teal)] ml-1" />خروجی CSV</h3>
            <button onClick={exportCSV} className="px-5 py-2.5 rounded border border-[var(--signal-teal)] text-[var(--signal-teal)] text-xs font-bold hover:bg-[var(--signal-teal)]/5">دانلود CSV بک‌لاگ</button>
          </div>
          <div className="pm-card p-8 bg-white text-black space-y-6 print:border-none print:p-0">
            <div className="flex justify-between items-start border-b-2 border-black/10 pb-4">
              <div><h2 className="font-display font-bold text-xl">گزارش وضعیت محصول</h2><p className="text-xs opacity-60 mt-1">پروژه: {projectId}</p></div>
              <div className="text-left text-xs font-mono-num">{new Date().toLocaleDateString('fa-IR')}</div>
            </div>
            <div className="space-y-3">
              <h3 className="font-display font-bold text-sm border-r-4 border-[var(--signal-teal)] pr-2">۱. متریک‌های پایش‌شده</h3>
              <table className="w-full text-right text-xs">
                <thead><tr className="border-b border-black/10"><th className="py-2">نام</th><th className="py-2 text-center">نوع</th><th className="py-2 text-left">مقدار</th></tr></thead>
                <tbody className="divide-y divide-black/5">{metrics.map(m => <tr key={m.id}><td className="py-2.5 font-medium">{m.metricName}</td><td className="py-2.5 text-center font-mono uppercase text-[10px]">{m.metricType}</td><td className="py-2.5 text-left font-mono-num">{m.value} {m.unit}</td></tr>)}</tbody>
              </table>
            </div>
            <div className="space-y-3 pt-4">
              <h3 className="font-display font-bold text-sm border-r-4 border-[var(--signal-teal)] pr-2">۲. اولویت‌بندی بک‌لاگ (RICE)</h3>
              <table className="w-full text-right text-xs">
                <thead><tr className="border-b border-black/10"><th className="py-2">عنوان</th><th className="py-2 text-center">Kano</th><th className="py-2 text-center">وضعیت</th><th className="py-2 text-left">RICE</th></tr></thead>
                <tbody className="divide-y divide-black/5">{backlog.slice(0, 8).map(i => <tr key={i.id}><td className="py-2.5 font-medium">{i.title}</td><td className="py-2.5 text-center">{i.kanoCategory || '-'}</td><td className="py-2.5 text-center font-mono text-[10px]">{i.status}</td><td className="py-2.5 text-left font-mono-num">{i.riceScore || 0}</td></tr>)}</tbody>
              </table>
            </div>
            <div className="hidden print:flex justify-between items-end pt-12 text-xs">
              <div><p className="font-bold">تاییدکننده:</p><div className="w-32 h-12 border-b border-black/20 mt-2"></div></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
