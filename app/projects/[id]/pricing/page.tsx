'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { getPricingSettings, savePricingSettings } from '@/lib/pmStore'
import { useDarkMode } from '@/hooks/useDarkMode'
import { FieldLabel } from '@/components/FieldLabel'
import { Tag, Save, HelpCircle as QuestionIcon } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'

export default function PricingPage() {
  const params = useParams()
  const projectId = (params?.id as string) || 'proj-1'
  const [darkMode, setDarkMode] = useDarkMode()
  const [tooCheap, setTooCheap] = useState(10000); const [cheap, setCheap] = useState(20000)
  const [expensive, setExpensive] = useState(45000); const [tooExpensive, setTooExpensive] = useState(70000)
  const [attractiveCount, setAttractiveCount] = useState(15)
  const [performanceCount, setPerformanceCount] = useState(25)
  const [mustBeCount, setMustBeCount] = useState(10)
  const [indifferentCount, setIndifferentCount] = useState(8)

  useEffect(() => {
    getPricingSettings(projectId).then(s => {
      setTooCheap(s.tooCheap); setCheap(s.cheap); setExpensive(s.expensive); setTooExpensive(s.tooExpensive)
      setAttractiveCount(s.attractive); setPerformanceCount(s.performance); setMustBeCount(s.mustBe); setIndifferentCount(s.indifferent)
    })
  }, [projectId])



  const handleSaveSettings = async () => {
    await savePricingSettings({ projectId, tooCheap, cheap, expensive, tooExpensive, attractive: attractiveCount, performance: performanceCount, mustBe: mustBeCount, indifferent: indifferentCount })
  }

  const getPricingData = () => {
    const step = (tooExpensive - tooCheap) / 5
    const prices = Array.from({ length: 6 }, (_, i) => Math.ceil(tooCheap + i * step))
    return prices.map(p => ({
      price: p,
      'خیلی ارزان': Math.round(Math.max(100 - ((p - tooCheap) / (tooExpensive - tooCheap)) * 100, 0)),
      'ارزان/مناسب': Math.round(Math.max(100 - ((p - cheap) / (tooExpensive - cheap)) * 100, 0)),
      'گران': Math.round(Math.min(Math.max(((p - cheap) / (expensive - cheap)) * 100, 0), 100)),
      'خیلی گران': Math.round(Math.min(Math.max(((p - expensive) / (tooExpensive - expensive)) * 100, 0), 100))
    }))
  }

  const pricingData = getPricingData()
  const optimalPricePoint = Math.round((cheap + expensive) / 2)
  const rangeMin = Math.round((tooCheap + cheap) / 2)
  const rangeMax = Math.round((expensive + tooExpensive) / 2)
  const totalKano = attractiveCount + performanceCount + mustBeCount + indifferentCount
  const betterIndex = totalKano > 0 ? ((attractiveCount + performanceCount) / totalKano).toFixed(2) : '0.00'
  const worseIndex = totalKano > 0 ? (-1 * (performanceCount + mustBeCount) / totalKano).toFixed(2) : '0.00'
  const leadingCat = Object.entries({ Attractive: attractiveCount, Performance: performanceCount, 'Must-be': mustBeCount, Indifferent: indifferentCount }).reduce((a, b) => b[1] > a[1] ? b : a)[0]

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={projectId} darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--card-bg)] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-[var(--signal-teal)]" />
            <h1 className="font-display font-bold text-lg">قیمت‌گذاری و مدل کانو</h1>
          </div>
          <button onClick={handleSaveSettings}
            className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--signal-teal)] text-white text-sm font-medium hover:opacity-90">
            <Save className="w-4 h-4" /><span>ذخیره تنظیمات</span>
          </button>
        </header>
        <div className="p-8 max-w-7xl w-full mx-auto space-y-8 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="pm-card p-6 lg:col-span-1 space-y-6">
              <h3 className="font-display font-bold text-base pb-3 border-b border-[var(--border-subtle)]">تنظیمات Van Westendorp</h3>
              <div className="space-y-4 text-sm">
                {[
                  { l: 'خیلی ارزان (تومان)', v: tooCheap, s: setTooCheap, h: 'از چه قیمتی این محصول اونقدر ارزونه که به کیفیتش شک می‌کنی؟' },
                  { l: 'ارزان (تومان)', v: cheap, s: setCheap, h: 'از چه قیمتی احساس می‌کنی داری خوب معامله می‌کنی؟' },
                  { l: 'گران (تومان)', v: expensive, s: setExpensive, h: 'از چه قیمتی شروع می‌کنه گرون به‌نظر برسه ولی بازم می‌خری؟' },
                  { l: 'خیلی گران (تومان)', v: tooExpensive, s: setTooExpensive, h: 'از چه قیمتی دیگه اصلاً نمی‌خری؟' }
                ].map((inp, i) => (
                  <div key={i}>
                    <label className="block text-xs font-medium opacity-70 mb-1"><FieldLabel label={inp.l} hint={inp.h} /></label>
                    <input type="number" value={inp.v} onChange={e => inp.s(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] font-mono-num font-medium" />
                  </div>
                ))}
                <div className="p-4 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] space-y-2.5 text-xs">
                  <div className="flex justify-between"><span className="opacity-70">OPP:</span><span className="font-mono-num font-bold text-[var(--signal-teal)]">{optimalPricePoint.toLocaleString()} تومان</span></div>
                  <div className="flex justify-between"><span className="opacity-70">RAP:</span><span className="font-mono-num font-bold">{rangeMin.toLocaleString()} - {rangeMax.toLocaleString()} تومان</span></div>
                </div>
              </div>
            </div>
            <div className="pm-card p-6 lg:col-span-2 flex flex-col justify-between">
              <h3 className="font-display font-bold text-base pb-3 border-b border-[var(--border-subtle)]">منحنی‌های حساسیت قیمت</h3>
              <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pricingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="price" tickFormatter={v => v.toLocaleString()} />
                    <YAxis unit="%" /><Tooltip formatter={(v: any) => `${v}%`} /><Legend />
                    <Line type="monotone" dataKey="خیلی ارزان" stroke="var(--signal-teal)" strokeWidth={2} />
                    <Line type="monotone" dataKey="ارزان/مناسب" stroke="var(--guardrail-green)" strokeWidth={2} />
                    <Line type="monotone" dataKey="گران" stroke="var(--watch-amber)" strokeWidth={2} />
                    <Line type="monotone" dataKey="خیلی گران" stroke="var(--risk-red)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="pm-card p-6">
            <h3 className="font-display font-bold text-base pb-3 border-b border-[var(--border-subtle)]"><QuestionIcon className="w-5 h-5 inline text-[var(--signal-teal)] ml-1" />مدل کانو</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 text-sm">
              <div className="space-y-4">
                {[
                  { l: 'Attractive', v: attractiveCount, s: setAttractiveCount },
                  { l: 'Performance', v: performanceCount, s: setPerformanceCount },
                  { l: 'Must-be', v: mustBeCount, s: setMustBeCount },
                  { l: 'Indifferent', v: indifferentCount, s: setIndifferentCount }
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1"><span>{item.l}:</span><span className="font-mono-num font-bold">{item.v}</span></div>
                    <input type="range" min="0" max="50" value={item.v} onChange={e => item.s(Number(e.target.value))} className="w-full accent-[var(--signal-teal)]" />
                  </div>
                ))}
              </div>
              <div className="lg:col-span-2 flex flex-col justify-between p-5 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="pm-card p-4 text-center"><div className="text-xs opacity-60">Better</div><div className="text-2xl font-bold font-mono-num text-[var(--guardrail-green)]">+{betterIndex}</div></div>
                  <div className="pm-card p-4 text-center"><div className="text-xs opacity-60">Worse</div><div className="text-2xl font-bold font-mono-num text-[var(--risk-red)]">{worseIndex}</div></div>
                </div>
                <div className="mt-4 p-4 rounded bg-[var(--card-bg)] border border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-xs opacity-70">دسته نهایی:</span>
                  <span className="font-bold text-sm text-[var(--signal-teal)]">{leadingCat}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
