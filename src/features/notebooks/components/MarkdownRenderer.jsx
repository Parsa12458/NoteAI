import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { MermaidDiagram } from './MermaidDiagram'
import { Check, Copy } from 'lucide-react'

function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false)
  const isMermaid = className?.includes('language-mermaid')
  const codeString = String(children).replace(/\n$/, '')

  if (isMermaid) {
    return <MermaidDiagram code={codeString} />
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 text-slate-100 text-left font-mono text-sm" dir="ltr">
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-800/80 text-xs text-slate-400 border-b border-slate-700/60">
        <span>{className?.replace('language-', '') || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-slate-200 transition-colors py-0.5 px-1.5 rounded bg-slate-700/50"
          title="کپی در حافظه"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-sans">کپی شد</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-sans">کپی</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  )
}

export function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null

  return (
    <div className={`prose dark:prose-invert max-w-none font-vazir text-slate-800 dark:text-slate-100 leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            if (!inline && (match || String(children).includes('\n'))) {
              return <CodeBlock className={className}>{children}</CodeBlock>
            }
            return (
              <code
                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-mono text-sm border border-slate-200 dark:border-slate-700"
                dir="ltr"
                {...props}
              >
                {children}
              </code>
            )
          },
          blockquote({ children }) {
            return (
              <blockquote className="my-4 border-r-4 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-l-xl not-italic text-slate-700 dark:text-slate-300">
                {children}
              </blockquote>
            )
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-6 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
                <table className="w-full text-right text-sm">{children}</table>
              </div>
            )
          },
          th({ children }) {
            return <th className="p-3 bg-slate-100/80 dark:bg-slate-800 font-semibold border-b border-slate-200 dark:border-slate-700">{children}</th>
          },
          td({ children }) {
            return <td className="p-3 border-b border-slate-100 dark:border-slate-800/60">{children}</td>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
