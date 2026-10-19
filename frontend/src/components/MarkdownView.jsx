import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import { Check, Copy } from 'lucide-react'

export const MarkdownView = ({ content, className = '' }) => {
  return (
    <div className={`prose dark:prose-invert max-w-none text-right font-vazir leading-relaxed text-zinc-800 dark:text-zinc-200 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          code({ className, children, ...props }) {
            const isInline = !className && !String(children).includes('\n')
            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 mx-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-mono text-xs border border-black/[0.05] dark:border-white/[0.08]"
                  dir="ltr"
                  {...props}
                >
                  {children}
                </code>
              )
            }

            return <CodeBlock className={className}>{children}</CodeBlock>
          },
          blockquote({ children }) {
            return (
              <blockquote className="my-4 border-r-2 border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 px-4 py-3 rounded-l-2xl text-zinc-700 dark:text-zinc-300 not-italic">
                {children}
              </blockquote>
            )
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-2xs">
                <table className="w-full text-right text-xs">{children}</table>
              </div>
            )
          },
          th({ children }) {
            return (
              <th className="p-3 bg-zinc-50 dark:bg-zinc-800/80 font-bold border-b border-black/[0.06] dark:border-white/[0.08]">
                {children}
              </th>
            )
          },
          td({ children }) {
            return <td className="p-3 border-b border-black/[0.04] dark:border-white/[0.04]">{children}</td>
          },
          h1({ children }) {
            return <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-6 mb-3">{children}</h1>
          },
          h2({ children }) {
            return <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-5 mb-2.5 border-b border-black/[0.05] dark:border-white/[0.06] pb-2">{children}</h2>
          },
          h3({ children }) {
            return <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-4 mb-2">{children}</h3>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false)
  const codeString = String(children).replace(/\n$/, '')
  const lang = className?.replace('language-', '') || 'code'

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative my-4 rounded-2xl overflow-hidden border border-black/[0.08] dark:border-white/[0.1] bg-zinc-950 text-zinc-100 text-left font-mono text-xs shadow-md" dir="ltr">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-900/90 border-b border-white/[0.08] text-2xs text-zinc-400">
        <span>{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors py-0.5 px-2 rounded-lg bg-zinc-800/70 hover:bg-zinc-800 active:scale-95"
          title="کپی در کلیپ‌بورد"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" strokeWidth={1.5} />
              <span className="text-emerald-400 font-sans">کپی شد</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" strokeWidth={1.5} />
              <span className="font-sans">کپی</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  )
}

