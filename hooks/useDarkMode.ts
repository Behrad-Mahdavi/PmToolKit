'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'pmtool_dark_mode'

export function useDarkMode(): [boolean, (val: boolean) => void] {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(STORAGE_KEY) === 'true'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(dark))
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [dark])

  return [dark, setDark]
}
