'use client'

import React, { useState } from 'react'
import { HelpCircle } from 'lucide-react'

interface FieldLabelProps {
  label: string
  hint: string
  className?: string
}

export function FieldLabel({ label, hint, className = '' }: FieldLabelProps) {
  const [show, setShow] = useState(false)

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span>{label}</span>
      <span
        className="relative inline-flex"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        <HelpCircle className="w-3.5 h-3.5 text-[var(--signal-teal)] cursor-help" />
        {show && (
          <span className="absolute bottom-full right-0 mb-2 z-50 w-64 p-3 rounded bg-[var(--ink)] text-[var(--bg-paper)] text-[11px] leading-relaxed shadow-lg pointer-events-none">
            {hint}
            <span className="absolute top-full right-2 w-2 h-2 bg-[var(--ink)] rotate-45 translate-y-[-50%]" />
          </span>
        )}
      </span>
    </span>
  )
}
