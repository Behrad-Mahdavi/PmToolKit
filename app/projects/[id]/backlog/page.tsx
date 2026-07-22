'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { 
  getBacklogItems,
  saveBacklogItem,
  deleteBacklogItem,
  BacklogItem
} from '@/lib/pmStore'
import { calculateRICE, calculateICE } from '@/lib/formulas'
import { FolderKanban, Plus, Trash2, BarChart2 } from 'lucide-react'
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function BacklogPage() {
  const params = useParams()
  const projectId = (params?.id as string) || 'proj-1'
  const [darkMode, setDarkMode] = useState(false)
  const [items, setItems] = useState<BacklogItem[]>([])
  const [filterKano, setFilterKano] = useState<string>('all')
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [reach, setReach] = useState<number>(1000)
  const [impact, setImpact] = useState<number>(2)
  const [confidence, setConfidence] = useState<number>(80)
  const [effort, setEffort] = useState<number>(1)
  const [iceImpact, setIceImpact] = useState<number>(7)
  const [iceConfidence, setIceConfidence] = useState<number>(7)
  const [iceEase, setIceEase] = useState<number>(7)
  const [kanoCategory, setKanoCategory] = useState<any>('Performance')
  const [status, setStatus] = useState<any>('backlog')

  useEffect(() => {
    getBacklogItems(projectId).then(setItems)
  }, [projectId])

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [darkMode])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await saveBacklogItem({ projectId, title, description, reach, impact, confidence, effort, iceImpact, iceConfidence, iceEase, kanoCategory, status })
    setItems(await getBacklogItems(projectId))
    setIsAdding(false)
    setTitle('')
    setDescription('')
  }

  const handleDelete = async (id: string) => {
    if (confirm('آیا از حذف این آیتم اطمینان دارید؟')) {
      await deleteBacklogItem(id)
      setItems(await getBacklogItems(projectId))
    }
  }

  const filteredItems = items.filter(i => filterKano === 'all' || i.kanoCategory === filterKano)
  const scatterData = items.map(item => ({
    name: item.title,
    x: item.effort || 1,
    y: item.impact || 1,
    rice: item.riceScore || 0,
    status: item.status
  }))

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar projectId={projectId} darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--card-bg)] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <FolderKanban className="w-5 h-5 text-[var(--signal-teal)]" />
            <h1 className="font-display font-bold text-lg">اولویت‌بندی بک‌لاگ (RICE / ICE / Kano)</h1>
          </div>
          <button onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--signal-teal)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            <span>{isAdding ? 'بستن فرم' : 'افزودن آیتم جدید'}</span>
          </button>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto space-y-8 flex-1">
          {isAdding && (
            <div className="pm-card p-6 bg-[var(--card-bg)] border-2 border-[var(--signal-teal)]/40">
              <h3 className="font-display font-bold text-base mb-4">ثبت فیچر جدید</h3>
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="md:col-span-2 space-y-3">
                  <div>
                    <label className="block text-xs font-medium opacity-70 mb-1">عنوان فیچر</label>
                    <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="مثلا سیستم گزارش‌گیری پیشرفته"
                      className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--signal-teal)]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium opacity-70 mb-1">توضیحات</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)}
                      rows={2} className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] focus:outline-none" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium opacity-70 mb-1">دسته Kano</label>
                    <select value={kanoCategory} onChange={e => setKanoCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)]">
                      <option value="Must-be">Must-be</option>
                      <option value="Performance">Performance</option>
                      <option value="Attractive">Attractive</option>
                      <option value="Indifferent">Indifferent</option>
                      <option value="Reverse">Reverse</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium opacity-70 mb-1">وضعیت</label>
                    <select value={status} onChange={e => setStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)]">
                      <option value="backlog">بک‌لاگ</option>
                      <option value="in-progress">در حال انجام</option>
                      <option value="shipped">منتشر شده</option>
                      <option value="killed">متوقف شده</option>
                    </select>
                  </div>
                </div>
                <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)]">
                  <div>
                    <label className="block text-xs font-medium opacity-70 mb-1">Reach</label>
                    <input type="number" value={reach} onChange={e => setReach(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded bg-[var(--card-bg)] border border-[var(--border-subtle)] font-mono-num" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium opacity-70 mb-1">Impact</label>
                    <input type="number" step="0.25" value={impact} onChange={e => setImpact(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded bg-[var(--card-bg)] border border-[var(--border-subtle)] font-mono-num" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium opacity-70 mb-1">Confidence</label>
                    <input type="number" value={confidence} onChange={e => setConfidence(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded bg-[var(--card-bg)] border border-[var(--border-subtle)] font-mono-num" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium opacity-70 mb-1">Effort</label>
                    <input type="number" step="0.1" value={effort} onChange={e => setEffort(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded bg-[var(--card-bg)] border border-[var(--border-subtle)] font-mono-num" />
                  </div>
                </div>
                <div className="md:col-span-3 flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsAdding(false)}
                    className="px-4 py-2 rounded border border-[var(--border-subtle)] text-xs font-medium">انصراف</button>
                  <button type="submit"
                    className="px-6 py-2 rounded bg-[var(--signal-teal)] text-white text-xs font-medium hover:opacity-90">
                    ذخیره و محاسبه RICE</button>
                </div>
              </form>
            </div>
          )}

          <div className="pm-card p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="font-display font-bold text-base flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[var(--signal-teal)]" />
                <span>نمودار ارزش در برابر تلاش (Value vs Effort)</span>
              </h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="x" name="تلاش" unit=" نفر-ماه" />
                  <YAxis type="number" dataKey="y" name="ارزش" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="آیتم‌ها" data={scatterData} fill="var(--signal-teal)" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pm-card p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="font-display font-bold text-base">لیست آیتم‌ها و امتیازات RICE</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="opacity-70">فیلتر Kano:</span>
                <select value={filterKano} onChange={e => setFilterKano(e.target.value)}
                  className="px-3 py-1.5 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)]">
                  <option value="all">همه</option>
                  <option value="Must-be">Must-be</option>
                  <option value="Performance">Performance</option>
                  <option value="Attractive">Attractive</option>
                  <option value="Indifferent">Indifferent</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-xs opacity-60">
                    <th className="py-3 font-medium">عنوان</th>
                    <th className="py-3 font-medium text-center">Kano</th>
                    <th className="py-3 font-medium text-center">وضعیت</th>
                    <th className="py-3 font-medium text-center">Reach</th>
                    <th className="py-3 font-medium text-center">Impact</th>
                    <th className="py-3 font-medium text-center">Confidence</th>
                    <th className="py-3 font-medium text-center">Effort</th>
                    <th className="py-3 font-medium text-left">RICE</th>
                    <th className="py-3 font-medium text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-black/5">
                      <td className="py-3 font-medium">{item.title}</td>
                      <td className="py-3 text-center text-xs">{item.kanoCategory || '-'}</td>
                      <td className="py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          item.status === 'in-progress' ? 'bg-[var(--watch-amber)]/10 text-[var(--watch-amber)]' :
                          item.status === 'shipped' ? 'bg-[var(--guardrail-green)]/10 text-[var(--guardrail-green)]' :
                          'opacity-70'}`}>{item.status}</span>
                      </td>
                      <td className="py-3 text-center font-mono-num">{item.reach?.toLocaleString()}</td>
                      <td className="py-3 text-center font-mono-num">{item.impact}</td>
                      <td className="py-3 text-center font-mono-num">{item.confidence}%</td>
                      <td className="py-3 text-center font-mono-num">{item.effort}m</td>
                      <td className="py-3 text-left font-mono-num font-bold text-[var(--signal-teal)]">{item.riceScore?.toLocaleString()}</td>
                      <td className="py-3 text-center">
                        <button onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded hover:bg-[var(--risk-red)]/10 text-[var(--risk-red)]">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center opacity-60 text-sm">آیتمی یافت نشد.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
