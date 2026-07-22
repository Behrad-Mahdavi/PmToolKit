'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ListTree, 
  Calculator, 
  TrendingUp, 
  FolderKanban,
  Moon,
  Sun,
  ShieldCheck,
  FlaskConical,
  Network,
  Tag,
  Target,
  FileText,
  LogOut
} from 'lucide-react'
import { useAuth } from './AuthProvider'

interface SidebarProps {
  projectId: string
  darkMode: boolean
  setDarkMode: (val: boolean) => void
}

export function Sidebar({ projectId, darkMode, setDarkMode }: SidebarProps) {
  const pathname = usePathname()
  const { signOut, user } = useAuth()

  const navItems = [
    { name: 'داشبورد مرکزی', href: `/`, icon: LayoutDashboard },
    { name: 'اولویت‌بندی بک‌لاگ', href: `/projects/${projectId}/backlog`, icon: FolderKanban },
    { name: 'اقتصاد واحد (Unit Economics)', href: `/projects/${projectId}/unit-economics`, icon: Calculator },
    { name: 'سلسله‌مراتب متریک‌ها (KPI)', href: `/projects/${projectId}/metrics`, icon: TrendingUp },
    { name: 'محاسبه‌گر تست A/B', href: `/projects/${projectId}/experiments`, icon: FlaskConical },
    { name: 'فانل و کوهورت (Analytics)', href: `/projects/${projectId}/analytics`, icon: Network },
    { name: 'قیمت‌گذاری و مدل کانو (Pricing)', href: `/projects/${projectId}/pricing`, icon: Tag },
    { name: 'مدیریت OKR فصلی', href: `/projects/${projectId}/okrs`, icon: Target },
    { name: 'مرکز گزارشات و خروجی', href: `/projects/${projectId}/reports`, icon: FileText },
  ]

  return (
    <aside className="w-72 shrink-0 border-l border-[var(--border-subtle)] bg-[var(--card-bg)] flex flex-col justify-between p-4 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-[var(--border-subtle)]">
          <Image src="/logo.png" alt="PM Toolkit" width={32} height={32} className="rounded" />
          <div>
            <h1 className="font-display font-bold text-sm tracking-tight">PM Toolkit</h1>
            <p className="text-[11px] opacity-60">ابزار مهندسی تصمیم محصول</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-[var(--signal-teal)] text-white font-medium'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[var(--signal-teal)]'}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center justify-between px-3 py-2 rounded text-xs hover:bg-black/5 dark:hover:bg-white/5 border border-[var(--border-subtle)] transition-colors"
        >
          <span className="flex items-center gap-2">
            {darkMode ? <Sun className="w-3.5 h-3.5 text-[var(--watch-amber)]" /> : <Moon className="w-3.5 h-3.5 text-[var(--signal-teal)]" />}
            <span>حالت نمایش</span>
          </span>
          <span className="font-mono-num font-medium opacity-80">{darkMode ? 'شب (Night Base)' : 'روز (Paper)'}</span>
        </button>

        {user && (
          <button
            onClick={signOut}
            className="w-full flex items-center justify-between px-3 py-2 rounded text-xs hover:bg-[var(--risk-red)]/10 border border-[var(--border-subtle)] transition-colors"
          >
            <span className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5 text-[var(--risk-red)]" />
              <span>خروج از حساب</span>
            </span>
            <span className="font-mono-num text-[10px] opacity-50 truncate max-w-[120px]">{user.email}</span>
          </button>
        )}

        <div className="px-2 text-[10px] opacity-50 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[var(--guardrail-green)]" />
          <span>Supabase RLS Active</span>
        </div>
      </div>
    </aside>
  )
}
