import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

// Configure Mermaid securely
mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'neutral',
  fontFamily: 'Vazirmatn, sans-serif',
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
  },
})

export function MermaidDiagram({ code }) {
  const containerRef = useRef(null)
  const [svgContent, setSvgContent] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`

    async function renderDiagram() {
      try {
        setError(null)
        const { svg } = await mermaid.render(uniqueId, code)
        if (isMounted) {
          setSvgContent(svg)
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Mermaid rendering failed:', err)
          setError('نمودار به دلیل ساختار نامعتبر قابل نمایش نیست.')
        }
      }
    }

    if (code) {
      renderDiagram()
    }

    return () => {
      isMounted = false
    }
  }, [code])

  if (error) {
    return (
      <div className="p-3 my-4 text-xs font-mono rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 text-amber-900 dark:text-amber-200">
        <p className="font-sans font-semibold mb-1">خطا در ترسیم نمودار:</p>
        <pre className="overflow-x-auto p-2 bg-white/60 dark:bg-black/30 rounded">{code}</pre>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="my-6 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto flex justify-center text-center"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  )
}

