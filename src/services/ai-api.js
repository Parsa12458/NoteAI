import { apiRequest, isMockMode } from '../lib/api-client'
import { MOCK_QUIZZES, MOCK_SUMMARIES } from './mock-data'

export async function askAiAssistant({ courseId, sessionId, question, history = [] }) {
  if (isMockMode()) {
    // Artificial latency for realistic conversational feel
    await new Promise((resolve) => setTimeout(resolve, 600))

    const q = question.toLowerCase()

    if (q.includes('لاپلاس') || q.includes('laplace') || q.includes('مشتق')) {
      return {
        answer: `برای محاسبه تبدیل لاپلاس مشتقات زمانی $y(t)$، فرمول عمومی زیر را به کار می‌بریم:

$$\\mathcal{L}\\{y^{(n)}(t)\\} = s^n Y(s) - \\sum_{k=1}^n s^{n-k} y^{(k-1)}(0)$$

برای مشتق مرتبه دوم ($n=2$):
$$\\mathcal{L}\\{y''(t)\\} = s^2 Y(s) - s y(0) - y'(0)$$

> [!IMPORTANT]
> **نکته کلیدی استاد در دقیقه ۱۸:۴۰:**
> در امتحان، اعمال علامت منفی در شرایط اولیه مانند $y'(0) = -1$ یکی از رایج‌ترین خطاهای محاسباتی دانشجویان است. حتماً دقت کنید که منفی در منفی مثبت خواهد شد!`,
        citations: [
          {
            text: 'استاد حسینی: حتماً قضیه تبدیل لاپلاس مشتق مرتبه n ام و قضیه شیفت زمانی را حفظ باشید...',
            timestamp: '00:18:40',
            timestampSeconds: 1120,
          },
          {
            text: 'قضیه اول انتقال (شیفت فرکانسی): ضرب تابع در e^{at} باعث جابجایی متغیر s می‌شود.',
            timestamp: '00:25:10',
            timestampSeconds: 1510,
          },
        ],
      }
    }

    if (q.includes('امتحان') || q.includes('نکته') || q.includes('پایان‌ترم')) {
      return {
        answer: `بر اساس گفتار صریح استاد و تحلیل داده‌های این جلسه، ۳ نکته امتحانی کلیدی استخراج شده است:

1. **مسئله قطعی اول پایان‌ترم:** حل معادله دیفرانسیل مرتبه دوم شامل تابع پله‌ای هویساید $u(t - a)$ با شرایط اولیه معلوم (دقیقه ۱۸:۴۰).
2. **هشدار نمره منفی در کسرهای جزئی:** در تفکیک ریشه‌های تکراری مخرج، ابتدا ضریب پرتوان‌ترین جمله را تعیین کنید (دقیقه ۴۲:۱۵).
3. **قضیه کانولوشن:** امکان طرح سوال چهارگزینه‌ای از خواص جابجایی و خطی بودن پیچش انتگرالی وجود دارد (دقیقه ۶۵:۱۰).`,
        citations: [
          {
            text: 'بیان صریح استاد حسینی در دقیقه ۱۸:۴۰ درباره سوال اول پایان‌ترم',
            timestamp: '00:18:40',
            timestampSeconds: 1120,
          },
        ],
      }
    }

    if (q.includes('کانولوشن') || q.includes('پیچش')) {
      return {
        answer: `پیچش یا کانولوشن دو تابع $f(t)$ و $g(t)$ به شکل انتگرال زیر تعریف می‌شود:

$$(f * g)(t) = \\int_{0}^{t} f(\\tau) g(t - \\tau) \\, d\\tau$$

مهم‌ترین مزیت تبدیل لاپلاس این است که انتگرال پیچیده کانولوشن را به یک ضرب جبری فوق‌العاده ساده تبدیل می‌کند:

$$\\mathcal{L}\\{(f * g)(t)\\} = F(s) \\cdot G(s)$$`,
        citations: [
          {
            text: 'استاد حسینی در دقیقه ۶۵:۱۰: قضیه کانولوشن یک شاهکار در جبر است...',
            timestamp: '01:05:10',
            timestampSeconds: 3910,
          },
        ],
      }
    }

    // Default academic assistant answer
    return {
      answer: `پاسخ بر اساس محتوای تدریس شده در جلسه منتخب:

موضوع اصلی مطرح شده در این جلسه، بررسی روش‌های تحلیلی و جبر در حوزه فرکانس مختلط است. برای بررسی دقیق‌تر، می‌توانید از بخش **«جزوه هوشمند»** سرفصل‌های مربوطه را مطالعه فرمایید یا تایم‌استمپ‌های رونوشت صوتی را گوش دهید.

اگر مفهوم خاصی مدنظرتان است (مثلاً فرمول‌های شیفت، شرایط اولیه یا مثال‌های حل‌شده)، بفرمایید تا با جزئیات تشریح کنم.`,
      citations: [
        {
          text: 'منبع: متن تدریس جلسه ۵ ریاضی مهندسی پیشرفته',
          timestamp: '00:05:12',
          timestampSeconds: 312,
        },
      ],
    }
  }

  return apiRequest('/ai/chat', {
    method: 'POST',
    body: { courseId, sessionId, question, history },
  })
}

export async function fetchQuiz({ courseId, sessionId }) {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    if (MOCK_QUIZZES[sessionId]) {
      return MOCK_QUIZZES[sessionId]
    }
    return MOCK_QUIZZES['session-math-5']
  }

  return apiRequest('/ai/quiz', {
    method: 'POST',
    body: { courseId, sessionId },
  })
}

export async function fetchSummary({ courseId, sessionId }) {
  if (isMockMode()) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    if (MOCK_SUMMARIES[sessionId]) {
      return MOCK_SUMMARIES[sessionId]
    }
    return MOCK_SUMMARIES['session-math-5']
  }

  return apiRequest('/ai/summary', {
    method: 'POST',
    body: { courseId, sessionId },
  })
}

