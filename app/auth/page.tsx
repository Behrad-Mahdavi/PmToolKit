'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Moon, Sun, ArrowRight, KeyRound, Mail } from 'lucide-react'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Check if session already exists
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/')
      }
    })
  }, [router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setSuccessMsg('ثبت‌نام با موفقیت انجام شد! لطفاً ایمیل خود را تایید کنید یا وارد شوید.')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'خطایی در فرآیند احراز هویت رخ داد.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-paper)] text-[var(--ink)] flex flex-col justify-between p-6">
      {/* Top Navbar */}
      <header className="flex justify-between items-center max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[var(--signal-teal)] text-white flex items-center justify-center font-display font-bold">
            PM
          </div>
          <div>
            <h1 className="font-display font-bold text-sm tracking-tight">PM Toolkit</h1>
            <p className="text-[10px] opacity-60">دروازه ورود مدیر محصول</p>
          </div>
        </div>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 border border-[var(--border-subtle)] text-xs flex items-center gap-1.5"
        >
          {darkMode ? <Sun className="w-3.5 h-3.5 text-[var(--watch-amber)]" /> : <Moon className="w-3.5 h-3.5 text-[var(--signal-teal)]" />}
          <span>{darkMode ? 'حالت روز' : 'حالت شب'}</span>
        </button>
      </header>

      {/* Main Authentication Box */}
      <main className="max-w-md w-full mx-auto my-auto pm-card p-8 space-y-6 bg-[var(--card-bg)]">
        <div className="text-center space-y-2">
          <h2 className="font-display font-bold text-xl tracking-tight">
            {isSignUp ? 'ایجاد حساب کاربری جدید' : 'ورود به ابزار جامع مدیریت محصول'}
          </h2>
          <p className="text-xs opacity-60">داده‌های مالی، بک‌لاگ‌های RICE و متریک‌های KPI پروژه شما</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded bg-[var(--risk-red)]/10 border border-[var(--risk-red)]/30 text-[var(--risk-red)] text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded bg-[var(--guardrail-green)]/10 border border-[var(--guardrail-green)]/30 text-[var(--guardrail-green)] text-xs font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium opacity-70 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[var(--signal-teal)]" />
              <span>آدرس ایمیل</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] font-mono-num focus:outline-none focus:border-[var(--signal-teal)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium opacity-70 mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[var(--signal-teal)]" />
              <span>کلمه عبور</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded bg-[var(--bg-paper)] border border-[var(--border-subtle)] font-mono-num focus:outline-none focus:border-[var(--signal-teal)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded bg-[var(--signal-teal)] text-white font-bold text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>{isSignUp ? 'ثبت‌نام حساب کاربری' : 'ورود به پنل کاربری'}</span>
                <ArrowRight className="w-4 h-4 transform rotate-180" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[var(--border-subtle)] text-center text-xs space-y-2">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[var(--signal-teal)] hover:underline font-bold"
          >
            {isSignUp ? 'حساب کاربری دارید؟ وارد شوید' : 'حساب کاربری ندارید؟ ثبت‌نام کنید'}
          </button>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-7xl w-full mx-auto text-center py-4 border-t border-[var(--border-subtle)] flex items-center justify-center gap-2 text-[10px] opacity-50">
        <ShieldCheck className="w-4 h-4 text-[var(--guardrail-green)]" />
        <span>پروتکل امنیتی RLS فعال است • ارتباط مستقیم رمزگذاری شده با Supabase</span>
      </footer>
    </div>
  )
}
