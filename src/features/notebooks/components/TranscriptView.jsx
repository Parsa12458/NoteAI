import { useState } from 'react'
import { Search, Clock, User, Mic } from 'lucide-react'

export function TranscriptView({ transcript = [], activeTimestamp = null, onSeekTimestamp }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = transcript.filter((item) =>
    item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.speaker && item.speaker.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-4">
      {/* Search within transcript */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="جستجو در متن سخنان استاد و دانشجویان..."
          className="w-full pr-10 pl-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
        />
      </div>

      {filteredItems.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          هیچ متنی مطابق با عبارت جستجو شده یافت نشد.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item, index) => {
            const isTeacher = item.speaker?.includes('استاد')
            const isHighlight =
              activeTimestamp !== null &&
              Math.abs((item.timestampSeconds || 0) - activeTimestamp) < 15

            return (
              <div
                key={item.id || index}
                className={`p-3.5 rounded-xl border transition-all text-xs ${
                  isHighlight
                    ? 'border-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-400/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`p-1 rounded-md text-white text-2xs ${
                        isTeacher ? 'bg-indigo-600' : 'bg-slate-500'
                      }`}
                    >
                      {isTeacher ? <Mic className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {item.speaker || 'گوینده'}
                    </span>
                  </div>

                  {item.timestamp && (
                    <button
                      onClick={() => onSeekTimestamp && onSeekTimestamp(item.timestampSeconds || 0)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-mono font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition-colors"
                      title="پخش از این ثانیه"
                      dir="ltr"
                    >
                      <Clock className="w-3 h-3" />
                      <span>{item.timestamp}</span>
                    </button>
                  )}
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {item.text}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

