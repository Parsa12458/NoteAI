import { useEffect, useRef } from 'react'

export function WaveformCanvas({ getFrequencyData, isRecording, isPaused, className = '' }) {
  const canvasRef = useRef(null)
  const animFrameId = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const bufferLength = 64
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animFrameId.current = requestAnimationFrame(draw)

      const width = canvas.width
      const height = canvas.height

      ctx.clearRect(0, 0, width, height)

      const hasData = getFrequencyData ? getFrequencyData(dataArray) : false

      // Bar sizing
      const barWidth = (width / bufferLength) * 1.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        // If recording and not paused, use real frequency values; otherwise gentle idle baseline
        let barHeight = 4
        if (isRecording && !isPaused && hasData) {
          const val = dataArray[i]
          barHeight = Math.max(4, (val / 255) * (height - 8))
        } else if (isPaused) {
          barHeight = 4 // flat when paused
        }

        // Color gradient: warm indigo to violet with high amplitude highlight
        const gradient = ctx.createLinearGradient(0, height, 0, 0)
        if (isRecording && !isPaused) {
          gradient.addColorStop(0, '#4f46e5') // indigo
          gradient.addColorStop(0.5, '#7c3aed') // purple
          gradient.addColorStop(1, '#ec4899') // pink for peak
        } else if (isPaused) {
          gradient.addColorStop(0, '#f59e0b') // amber
          gradient.addColorStop(1, '#d97706')
        } else {
          gradient.addColorStop(0, '#94a3b8') // slate
          gradient.addColorStop(1, '#cbd5e1')
        }

        ctx.fillStyle = gradient

        // Center vertically
        const y = (height - barHeight) / 2
        ctx.beginPath()
        ctx.roundRect(x, y, Math.max(2, barWidth - 2), barHeight, 2)
        ctx.fill()

        x += barWidth + 2
        if (x > width) break
      }
    }

    draw()

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current)
      }
    }
  }, [getFrequencyData, isRecording, isPaused])

  return (
    <div className={`relative w-full h-24 overflow-hidden rounded-xl bg-slate-900/5 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-2 ${className}`}>
      <canvas
        ref={canvasRef}
        width={600}
        height={96}
        className="w-full h-full block"
      />
    </div>
  )
}

