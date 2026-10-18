import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import { askAiAssistant } from '../../../services/ai-api'
import { MarkdownRenderer } from '../../notebooks/components/MarkdownRenderer'

export function ChatPanel({ courseId, sessionId, courseName, sessionTitle, onSeekTimestamp }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `سلام! من دستیار هوشمند مطالعه شما برای درس **${courseName || 'این دوره'}** هستم.

می‌توانید درباره فرمول‌ها، مباحث تدریس شده، نکات امتحانی یا هر ابهامی در جلسه سوال بپرسید. تمام پاسخ‌های من بر اساس منابع درسی و گفتار استاد در کلاس استخراج می‌شود.`,
      citations: [],
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSend = async (e) => {
    e?.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMsg = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: trimmed,
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await askAiAssistant({
        courseId,
        sessionId,
        question: trimmed,
        history: messages.slice(-6),
      })

      const botMsg = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        citations: response.citations || [],
      }

      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      setError(err.message || 'خطا در ارتباط با دستیار هوش مصنوعی.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      {/* Header with context info */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              دستیار هوشمند درس
            </h3>
            <p className="text-2xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]" title={sessionTitle}>
              زمینه: {sessionTitle || courseName || 'محتوای درس'}
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
          RAG متصل
        </span>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        {messages.map((msg) => {
          const isUser = msg.role === 'user'

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-emerald-600 text-white shadow-2xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-tl-none text-slate-800 dark:text-slate-100'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                ) : (
                  <div>
                    <MarkdownRenderer content={msg.content} />

                    {/* Citations / Source links */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 text-xs">
                        <span className="font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                          ارجاعات و مستندات تدریس:
                        </span>
                        <div className="space-y-1.5">
                          {msg.citations.map((cite, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
                            >
                              <span className="text-2xs text-slate-600 dark:text-slate-300 truncate">
                                {cite.text}
                              </span>
                              {cite.timestamp && (
                                <button
                                  onClick={() => onSeekTimestamp && onSeekTimestamp(cite.timestampSeconds || 0)}
                                  className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-mono font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 transition-colors"
                                  title="پرش به این لحظه در صوت"
                                  dir="ltr"
                                >
                                  <Clock className="w-3 h-3" />
                                  <span>{cite.timestamp}</span>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {isLoading && (
          <div className="flex gap-3 items-center text-slate-500 dark:text-slate-400 text-xs py-2">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>دستیار در حال جستجو در متن تدریس و تدوین پاسخ...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input box */}
      <form onSubmit={handleSend} className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800">
        <div className="relative flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="سوال خود را درباره درس بنویسید (Enter برای ارسال)..."
            rows={1}
            className="w-full pl-12 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 resize-none max-h-24 text-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute left-2 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-colors"
            title="ارسال سوال"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </form>
    </div>
  )
}

