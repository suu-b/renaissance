import React, { useMemo } from 'react'

type TextHighlightProps = {
  children: React.ReactNode
  className?: string
  color?: string
  intensity?: number
}

const BRUSH_PATH = "M6,20 C4,10 14,4 34,6 C90,2 180,8 260,4 C310,2 360,6 392,14 C398,20 396,30 390,34 C360,42 300,36 240,40 C160,44 90,38 40,42 C18,44 6,40 3,32 C1,27 4,23 6,20 Z"

export default function TextHighlight({
  children,
  className,
  color = "bg-primary",
  intensity = 60,
}: TextHighlightProps) {
  const maskUrl = useMemo(() => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 60' preserveAspectRatio='none'><path d='${BRUSH_PATH}' fill='black'/></svg>`
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  }, [])

  const highlightStyle: React.CSSProperties = {
    opacity: intensity / 100,
    WebkitMaskImage: maskUrl,
    maskImage: maskUrl,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    transform: 'rotate(-4deg) scaleY(1.06) translateY(8px)',
    transformOrigin: 'center center',
  }

  return (
    <span className={`relative inline-block px-[0.15em] ${className || ''}`}>
      <span
        aria-hidden="true"
        className={`absolute -inset-x-[6%] -inset-y-[10%] ${color}`}
        style={highlightStyle}
      />
      <span className="relative z-10">{children}</span>
    </span>
  )
}