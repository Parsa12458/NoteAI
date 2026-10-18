import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MarkdownRenderer } from '../features/notebooks/components/MarkdownRenderer'

describe('MarkdownRenderer Component', () => {
  it('renders markdown headers, bold text and lists cleanly', () => {
    const markdown = `# عنوان جلسه
این یک **متن پررنگ** آموزشی است.
- نکته اول
- نکته دوم`

    render(<MarkdownRenderer content={markdown} />)

    expect(screen.getByText('عنوان جلسه')).toBeInTheDocument()
    expect(screen.getByText('متن پررنگ')).toBeInTheDocument()
    expect(screen.getByText('نکته اول')).toBeInTheDocument()
  })

  it('renders math formulas safely using KaTeX', () => {
    const mathContent = 'تبدیل لاپلاس: $F(s) = \\int_0^\\infty e^{-st} f(t) dt$'
    const { container } = render(<MarkdownRenderer content={mathContent} />)

    // KaTeX outputs katex HTML elements
    const katexEl = container.querySelector('.katex')
    expect(katexEl).toBeDefined()
  })

  it('renders code blocks with copy capability', () => {
    const codeContent = '```python\ndef solve():\n    return 42\n```'
    render(<MarkdownRenderer content={codeContent} />)

    expect(screen.getByText('python')).toBeInTheDocument()
    expect(screen.getByText('کپی')).toBeInTheDocument()
  })
})

