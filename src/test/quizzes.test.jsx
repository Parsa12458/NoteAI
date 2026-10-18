import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QuizModal } from '../features/quizzes/components/QuizModal'
import * as aiApi from '../services/ai-api'

describe('QuizModal Component', () => {
  const mockQuiz = {
    sessionId: 'test-session',
    questions: [
      {
        id: 'q-1',
        text: 'شرط وجود تبدیل لاپلاس چیست؟',
        options: ['گزینه الف', 'پیوستگی تکه‌ای و مرتبه نمایی', 'گزینه ج', 'گزینه د'],
        correctIndex: 1,
        explanation: 'توضیح کامل: پیوستگی تکه‌ای الزامی است.',
        sourceTimestamp: '00:10:00',
      },
    ],
  }

  it('renders questions, allows option selection, and displays score upon submission', async () => {
    vi.spyOn(aiApi, 'fetchQuiz').mockResolvedValue(mockQuiz)

    render(
      <QuizModal
        isOpen={true}
        onClose={() => {}}
        courseId="math-101"
        sessionId="test-session"
      />
    )

    // Wait for questions to load
    await waitFor(() => {
      expect(screen.getByText('شرط وجود تبدیل لاپلاس چیست؟')).toBeInTheDocument()
    })

    // Click on option 1 (correct option)
    const option = screen.getByText('پیوستگی تکه‌ای و مرتبه نمایی')
    fireEvent.click(option)

    // Submit quiz
    const submitBtn = screen.getByText('ثبت و محاسبه نمره')
    fireEvent.click(submitBtn)

    // Verify score banner
    expect(screen.getByText('نتیجه ارزیابی آزمونک')).toBeInTheDocument()
    expect(screen.getByText(/1 از 1 سوال/)).toBeInTheDocument()
    expect(screen.getByText('پاسخ درست')).toBeInTheDocument()
    expect(screen.getByText(/توضیح کامل: پیوستگی تکه‌ای الزامی است/)).toBeInTheDocument()
  })
})
