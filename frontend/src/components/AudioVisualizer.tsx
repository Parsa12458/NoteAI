import { useEffect, useRef, type FC } from 'react'

interface AudioVisualizerProps {
  analyser: AnalyserNode | null
  isRecording: boolean
  isPaused: boolean
  className?: string
}

export const AudioVisualizer: FC<AudioVisualizerProps> = ({
  analyser,
  isRecording,
  isPaused,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bufferLength = 48
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw)

      const width = canvas.width
      const height = canvas.height
      ctx.clearRect(0, 0, width, height)

      if (analyser && isRecording && !isPaused) {
        analyser.getByteFrequencyData(dataArray)
      } else {
        dataArray.fill(0)
      }

      const totalBars = bufferLength
      const barWidth = 3
      const barGap = 4
      const contentWidth = totalBars * (barWidth + barGap) - barGap
      const startX = (width - contentWidth) / 2

      for (let i = 0; i < totalBars; i++) {
        let barHeight = 4
        if (isRecording && !isPaused && analyser) {
          const val = dataArray[i]
          barHeight = Math.max(4, (val / 255) * (height - 8))
        } else if (isPaused) {
          barHeight = 4
        } else {
          barHeight = 3
        }

        const x = startX + i * (barWidth + barGap)
        const y = (height - barHeight) / 2

        // Apple pill bar style: rounded continuous pill
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2)

        if (isRecording && !isPaused) {
          // Dynamic gradient
          const gradient = ctx.createLinearGradient(0, height, 0, 0)
          gradient.addColorStop(0, '#3b82f6')
          gradient.addColorStop(0.5, '#60a5fa')
          gradient.addColorStop(1, '#ef4444')
          ctx.fillStyle = gradient
        } else if (isPaused) {
          ctx.fillStyle = '#f59e0b'
        } else {
          ctx.fillStyle = 'rgba(156, 163, 175, 0.3)'
        }

        ctx.fill()
      }
    }

    draw()

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [analyser, isRecording, isPaused])

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        width={340}
        height={64}
        className="w-full h-16 block"
      />
    </div>
  )
}
