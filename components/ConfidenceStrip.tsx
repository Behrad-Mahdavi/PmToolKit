'react'
import React from 'react'

interface ConfidenceStripProps {
  status?: 'healthy' | 'warning' | 'critical'
  sparklineValues?: number[]
  rangeText?: string
}

export function ConfidenceStrip({
  status = 'healthy',
  sparklineValues = [40, 45, 42, 50, 48, 60, 58, 65, 70],
  rangeText = 'بازه نرمال: ۶۰-۸۰٪'
}: ConfidenceStripProps) {
  const colorMap = {
    healthy: 'var(--guardrail-green)',
    warning: 'var(--watch-amber)',
    critical: 'var(--risk-red)'
  }

  const indicatorMap = {
    healthy: '▲',
    warning: '●',
    critical: '▼'
  }

  const color = colorMap[status]
  const indicator = indicatorMap[status]

  // Render a clean SVG sparkline
  const min = Math.min(...sparklineValues)
  const max = Math.max(...sparklineValues)
  const range = max - min || 1
  const width = 120
  const height = 24

  const points = sparklineValues
    .map((val, idx) => {
      const x = (idx / (sparklineValues.length - 1)) * width
      const y = height - ((val - min) / range) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--border-subtle)] text-xs">
      <div className="flex items-center gap-1.5 font-mono-num text-[11px] opacity-80" title={rangeText}>
        <span style={{ color }} className="font-bold text-sm">{indicator}</span>
        <span>{rangeText}</span>
      </div>
      <div className="flex items-center" title="روند ۹۰ روزه">
        <svg width={width} height={height} className="overflow-visible">
          {/* Normal range background band */}
          <rect x="0" y="4" width={width} height={height - 8} fill={color} fillOpacity="0.08" rx="2" />
          {/* Sparkline path */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      </div>
    </div>
  )
}
