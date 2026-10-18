import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExamTipsPanel } from '../features/exam-tips/components/ExamTipsPanel'

describe('ExamTipsPanel Component', () => {
  const mockTips = [
    {
      id: 'tip-1',
      type: 'explicit_teacher_statement',
      statement: 'این سوال در امتحان پایان‌ترم حتماً می‌آید.',
      speaker: 'استاد حسینی',
      timestamp: '00:15:20',
      timestampSeconds: 920,
    },
    {
      id: 'tip-2',
      type: 'ai_inferred',
      statement: 'احتمال طرح سوال تستی از این مبحث بالا است.',
      speaker: 'تحلیل هوش مصنوعی',
      timestamp: '00:40:00',
      timestampSeconds: 2400,
    },
  ]

  it('renders exam tips distinguishing explicit teacher statements from AI inference', () => {
    render(<ExamTipsPanel examTips={mockTips} />)

    expect(screen.getByText('شکارچی نکات امتحانی')).toBeInTheDocument()
    expect(screen.getByText('بیان صریح استاد')).toBeInTheDocument()
    expect(screen.getByText('تشخیص هوش مصنوعی')).toBeInTheDocument()
    expect(screen.getByText('این سوال در امتحان پایان‌ترم حتماً می‌آید.')).toBeInTheDocument()
  })

  it('triggers onSeekTimestamp when clicking the timestamp button', () => {
    const onSeek = vi.fn()
    render(<ExamTipsPanel examTips={mockTips} onSeekTimestamp={onSeek} />)

    const timestampBtn = screen.getByText('00:15:20')
    fireEvent.click(timestampBtn)

    expect(onSeek).toHaveBeenCalledWith(920)
  })

  it('displays empty state message when no exam tips exist', () => {
    render(<ExamTipsPanel examTips={[]} />)
    expect(screen.getByText(/در این جلسه نکته امتحانی صریح یا پرتاکیدی ثبت نشده است/)).toBeInTheDocument()
  })
})

