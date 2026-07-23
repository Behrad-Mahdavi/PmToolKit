'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { calculateUnitEconomics, UnitEconomicsOutput } from '@/lib/formulas'
import { useDarkMode } from '@/hooks/useDarkMode'
import { FieldLabel } from '@/components/FieldLabel'
import { Calculator, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function UnitEconomicsPage() {
  const params = useParams()
  const projectId = (params?.id as string) || 'proj-1'
  const [darkMode, setDarkMode] = useDarkMode()
  const [marketingCost, setMarketingCost] = useState(15000000)
  const [newCustomers, setNewCustomers] = useState(120)
  const [arpu, setArpu] = useState(250000)
  const [grossMargin, setGrossMargin] = useState(80)
  const [churnRate, setChurnRate] = useState(3.2)
  const [mrr, setMrr] = useState(24800000)

  const [result, setResult] = useState<UnitEconomicsOutput>(
    calculateUnitEconomics({ totalMarketingCost: 15000000, newCustomers: 120, arpu: 250000, grossMarginPct: 80, churnRatePct: 3.2, mrr: 24800000 })
  )

  const handleCalc = (e: React.FormEvent) => {
    e.preventDefault()
    setResult(calculateUnitEconomics({ totalMarketingCost: marketingCost, newCustomers, arpu, grossMarginPct: grossMargin, churnRatePct: churnRate, mrr }))
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={projectId} darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--card-bg)] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3"><Calculator className="w-5 h-5 text-[var(--signal-teal)]" /><h1 className="font-display font-bold text-lg">اقتصاد واحد و سلامت مالی (Unit Economics)</h1></div>
        </header>
        <div className="p-8 max-w-7xl w-full mx-auto space-y-8 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="pm-card p-6 lg:col-span-1">
              <h3 className="font-display font-bold text-base mb-4 pb-3 border-b border-[var(--border-subtle)]">پارامترهای ورودی</h3>
              <form onSubmit={handleCalc} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-medium opacity-70 mb-1"><FieldLabel label="هزینه فروش و بازاریابی (تومان)" hint="توی این بازه چقدر خرج جذب مشتری کردی؟ (تبلیغات + حقوق تیم فروش/مارکتینگ)" /></label>
                  <input type="number" value={marketingCost} onChange={e => setMarketingCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] font-mono-num" />
                </div>
                <div>
                  <label className="block text-xs font-medium opacity-70 mb-1"><FieldLabel label="مشتری جدید" hint="توی همین بازه چند مشتری جدید گرفتی؟" /></label>
                  <input type="number" value={newCustomers} onChange={e => setNewCustomers(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] font-mono-num" />
                </div>
                <div>
                  <label className="block text-xs font-medium opacity-70 mb-1"><FieldLabel label="ARPU (تومان)" hint="میانگین درآمدت از هر مشتری در ماه چقدره؟" /></label>
                  <input type="number" value={arpu} onChange={e => setArpu(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] font-mono-num" />
                </div>
                <div>
                  <label className="block text-xs font-medium opacity-70 mb-1"><FieldLabel label="Gross Margin %" hint="از هر تومن فروش، بعد از کسر هزینه‌ی مستقیم ارائه‌ی خدمت، چند درصد برات می‌مونه؟" /></label>
                  <input type="number" value={grossMargin} onChange={e => setGrossMargin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] font-mono-num" />
                </div>
                <div>
                  <label className="block text-xs font-medium opacity-70 mb-1"><FieldLabel label="Churn Rate %" hint="چند درصد مشتری‌هات توی این بازه از دستت رفتن؟" /></label>
                  <input type="number" step="0.1" value={churnRate} onChange={e => setChurnRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] font-mono-num" />
                </div>
                <div>
                  <label className="block text-xs font-medium opacity-70 mb-1"><FieldLabel label="MRR (تومان)" hint="درآمد ماهانه عادی (تکراری) از همه مشتری‌ها چقدره؟" /></label>
                  <input type="number" value={mrr} onChange={e => setMrr(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] font-mono-num" />
                </div>
                <button type="submit" className="w-full py-2.5 rounded bg-[var(--signal-teal)] text-white font-medium text-xs hover:opacity-90">محاسبه</button>
              </form>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className={`p-5 rounded border flex items-center justify-between ${
                result.healthStatus === 'healthy' ? 'bg-[var(--guardrail-green)]/10 border-[var(--guardrail-green)]/30 text-[var(--guardrail-green)]' :
                result.healthStatus === 'warning' ? 'bg-[var(--watch-amber)]/10 border-[var(--watch-amber)]/30 text-[var(--watch-amber)]' :
                'bg-[var(--risk-red)]/10 border-[var(--risk-red)]/30 text-[var(--risk-red)]'}`}>
                <div className="flex items-center gap-3">
                  {result.healthStatus === 'healthy' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                  <div>
                    <h4 className="font-bold text-base">وضعیت: {result.healthStatus === 'healthy' ? 'سالم (> 3x)' : result.healthStatus === 'warning' ? 'نیازمند پایش' : 'بحرانی (< 1x)'}</h4>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="pm-card p-6"><div className="text-xs opacity-60 uppercase font-mono mb-1">CAC</div><div className="text-3xl font-bold font-mono-num text-[var(--signal-teal)]">{result.cac.toLocaleString()} <span className="text-lg">تومان</span></div></div>
                <div className="pm-card p-6"><div className="text-xs opacity-60 uppercase font-mono mb-1">LTV</div><div className="text-3xl font-bold font-mono-num text-[var(--signal-teal)]">{result.ltv.toLocaleString()} <span className="text-lg">تومان</span></div></div>
                <div className="pm-card p-6"><div className="text-xs opacity-60 uppercase font-mono mb-1">LTV/CAC</div><div className="text-3xl font-bold font-mono-num">{result.ltvCacRatio}x</div></div>
                <div className="pm-card p-6"><div className="text-xs opacity-60 uppercase font-mono mb-1">Payback</div><div className="text-3xl font-bold font-mono-num">{result.paybackMonths} ماه</div></div>
                <div className="pm-card p-6"><div className="text-xs opacity-60 uppercase font-mono mb-1">ARR</div><div className="text-3xl font-bold font-mono-num">{result.arr.toLocaleString()} <span className="text-lg">تومان</span></div></div>
                <div className="pm-card p-6"><div className="text-xs opacity-60 uppercase font-mono mb-1">Retention</div><div className="text-3xl font-bold font-mono-num">{result.retentionRatePct}%</div></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
