/**
 * Realistic development fixtures for NoteAI Smart Classroom.
 * Contains academic courses, authentic lecture sessions with KaTeX formulas,
 * Mermaid flowcharts, exam tips (explicit teacher quotes vs AI inferred),
 * quizzes, and 2-minute study summaries.
 */

export const MOCK_COURSES = [
  {
    id: 'course-math-advanced',
    name: 'ریاضی مهندسی پیشرفته',
    code: 'MATH-401',
    instructor: 'دکتر علیرضا حسینی',
    department: 'مهندسی برق و کامپیوتر',
    description: 'تحلیل تبدیل‌های انتگرالی، سری فوریه، تبدیل لاپلاس و حل معادلات با مشتقات جزئی (PDE).',
    color: '#4f46e5', // indigo
    icon: 'Calculator',
    sessionsCount: 8,
    lastSessionDate: '2026-10-18T08:00:00Z',
    timetableSlots: [
      { day: 0, dayName: 'شنبه', startTime: '08:00', endTime: '10:00', room: 'تالار ۳' },
      { day: 2, dayName: 'دوشنبه', startTime: '08:00', endTime: '10:00', room: 'تالار ۳' },
    ],
  },
  {
    id: 'course-circuits',
    name: 'مدارهای الکتریکی ۱',
    code: 'EE-201',
    instructor: 'دکتر مریم شریفی',
    department: 'مهندسی برق',
    description: 'قوانین KVL و KCL، مدارهای مرتبه اول RC و RL، پاسخ پله و ضربه و تحلیل در حوزه فازور.',
    color: '#0891b2', // cyan
    icon: 'Cpu',
    sessionsCount: 6,
    lastSessionDate: '2026-10-17T10:30:00Z',
    timetableSlots: [
      { day: 1, dayName: 'یکشنبه', startTime: '10:00', endTime: '12:00', room: 'کلاس ۱۰۲' },
      { day: 3, dayName: 'سه‌شنبه', startTime: '10:00', endTime: '12:00', room: 'کلاس ۱۰۲' },
    ],
  },
  {
    id: 'course-ai',
    name: 'مبانی هوش مصنوعی و یادگیری ماشین',
    code: 'CS-350',
    instructor: 'دکتر محمدرضا کمالی',
    department: 'مهندسی کامپیوتر',
    description: 'الگوریتم‌های جستجوی آگاهانه، گرادیان کاهشی، شبکه‌های عصبی و ارزیابی مدل‌های طبقه‌بندی.',
    color: '#059669', // emerald
    icon: 'Brain',
    sessionsCount: 5,
    lastSessionDate: '2026-10-16T13:30:00Z',
    timetableSlots: [
      { day: 0, dayName: 'شنبه', startTime: '13:30', endTime: '15:30', room: 'سایت ۲' },
      { day: 4, dayName: 'چهارشنبه', startTime: '13:30', endTime: '15:30', room: 'سایت ۲' },
    ],
  },
  {
    id: 'course-physics',
    name: 'فیزیک مدرن و کوانتوم',
    code: 'PHYS-220',
    instructor: 'دکتر بهمن رستمی',
    department: 'علوم پایه',
    description: 'نسبیت خاص، اثر فوتوالکتریک، تابش جسم سیاه و معادله موج شرودینگر یک‌بعدی.',
    color: '#d97706', // amber
    icon: 'Atom',
    sessionsCount: 4,
    lastSessionDate: '2026-10-15T09:00:00Z',
    timetableSlots: [
      { day: 2, dayName: 'دوشنبه', startTime: '10:00', endTime: '12:00', room: 'تالار فیزیک' },
    ],
  },
]

export const MOCK_SESSIONS = {
  'course-math-advanced': [
    {
      id: 'session-math-5',
      courseId: 'course-math-advanced',
      title: 'جلسه ۵: تبدیل لاپلاس و حل معادلات دیفرانسیل غیرهمگن',
      date: '2026-10-18T08:00:00Z',
      period: 'ساعت ۸:۰۰ تا ۱۰:۰۰',
      durationSeconds: 5240, // ~87 mins
      audioUrl: '/audio/math-5.mp3',
      hasAudio: true,
      status: 'completed', // 'completed' | 'processing' | 'recording'
      syncStatus: 'synced',
      totalChunks: 17,
      uploadedChunks: 17,
      examTipsCount: 3,
    },
    {
      id: 'session-math-4',
      courseId: 'course-math-advanced',
      title: 'جلسه ۴: بسط نیم‌دامنه‌ای سری فوریه و همگرایی یکنواخت',
      date: '2026-10-14T08:00:00Z',
      period: 'ساعت ۸:۰۰ تا ۱۰:۰۰',
      durationSeconds: 5400,
      audioUrl: null,
      hasAudio: false,
      status: 'completed',
      syncStatus: 'synced',
      totalChunks: 18,
      uploadedChunks: 18,
      examTipsCount: 2,
    },
    {
      id: 'session-math-3',
      courseId: 'course-math-advanced',
      title: 'جلسه ۳: انتگرال فوریه و تعریف اولیه تبدیل فوریه',
      date: '2026-10-11T08:00:00Z',
      period: 'ساعت ۸:۰۰ تا ۱۰:۰۰',
      durationSeconds: 4900,
      audioUrl: null,
      hasAudio: false,
      status: 'completed',
      syncStatus: 'synced',
      totalChunks: 16,
      uploadedChunks: 16,
      examTipsCount: 1,
    },
  ],
  'course-circuits': [
    {
      id: 'session-circuits-4',
      courseId: 'course-circuits',
      title: 'جلسه ۴: مدارهای مرتبه اول RC و RL با منابع متغیر',
      date: '2026-10-17T10:00:00Z',
      period: 'ساعت ۱۰:۰۰ تا ۱۲:۰۰',
      durationSeconds: 5100,
      audioUrl: null,
      hasAudio: false,
      status: 'completed',
      syncStatus: 'synced',
      totalChunks: 17,
      uploadedChunks: 17,
      examTipsCount: 2,
    },
  ],
  'course-ai': [
    {
      id: 'session-ai-3',
      courseId: 'course-ai',
      title: 'جلسه ۳: بهینه‌سازی با گرادیان کاهشی (SGD) و ممنتوم',
      date: '2026-10-16T13:30:00Z',
      period: 'ساعت ۱۳:۳۰ تا ۱۵:۳۰',
      durationSeconds: 5350,
      audioUrl: null,
      hasAudio: false,
      status: 'completed',
      syncStatus: 'synced',
      totalChunks: 18,
      uploadedChunks: 18,
      examTipsCount: 2,
    },
  ],
  'course-physics': [
    {
      id: 'session-phys-2',
      courseId: 'course-physics',
      title: 'جلسه ۲: اثر فوتوالکتریک و رابطه دوبروی',
      date: '2026-10-15T09:00:00Z',
      period: 'ساعت ۹:۰۰ تا ۱۱:۰۰',
      durationSeconds: 4800,
      audioUrl: null,
      hasAudio: false,
      status: 'completed',
      syncStatus: 'synced',
      totalChunks: 16,
      uploadedChunks: 16,
      examTipsCount: 2,
    },
  ],
}

export const MOCK_NOTEBOOKS = {
  'session-math-5': {
    sessionId: 'session-math-5',
    courseId: 'course-math-advanced',
    title: 'جلسه ۵: تبدیل لاپلاس و حل معادلات دیفرانسیل غیرهمگن',
    lectureDate: '۲۷ مهر ۱۴۰۵',
    status: 'completed',
    lastProcessed: '2026-10-18T10:15:00Z',
    examTips: [
      {
        id: 'tip-math-1',
        type: 'explicit_teacher_statement',
        statement: 'حتماً قضیه تبدیل لاپلاس مشتق مرتبه $n$ ام و قضیه شیفت زمانی را حفظ باشید؛ در امتحان پایان‌ترم مسئله اول دقیقاً یک معادله مرتبه دوم با تابع پله‌ای هویساید خواهد بود.',
        speaker: 'استاد حسینی',
        timestamp: '00:18:40',
        timestampSeconds: 1120,
        confidence: 0.99,
        context: 'توضیح فرمول $\\mathcal{L}\\{y\'\'\\} = s^2 Y(s) - s y(0) - y\'(0)$',
      },
      {
        id: 'tip-math-2',
        type: 'explicit_teacher_statement',
        statement: 'دانشجویان عزیز دقت کنید: در کسر جزئی اگر ریشه مضاعف داشتید، ضریب توان بالاتر اول محاسبه می‌شود. بارها دیدم در تصحیح اوراق که این بخش نمره منفی می‌اندازد.',
        speaker: 'استاد حسینی',
        timestamp: '00:42:15',
        timestampSeconds: 2535,
        confidence: 0.95,
        context: 'بسط کسرهای جزئی در معکوس لاپلاس',
      },
      {
        id: 'tip-math-3',
        type: 'ai_inferred',
        statement: 'تاکید شدید استاد بر قضیه کانولوشن (پیچش) و حل انتگرال ولترا نشان‌دهنده احتمال بالای طرح سوال تلفیقی از این مبحث در کوییز کلاسی است.',
        speaker: 'تحلیل هوش مصنوعی',
        timestamp: '01:05:10',
        timestampSeconds: 3910,
        confidence: 0.88,
        context: 'مبحث قضیه پیچش انتگرالی',
      },
    ],
    notesMarkdown: `# تبدیل لاپلاس و کاربردهای مهندسی آن

## ۱. مقدمه و تعریف تبدیل لاپلاس

تبدیل لاپلاس یک تبدیل انتگرالی قدرتمند است که معادلات دیفرانسیل خطی با ضرایب ثابت را در حوزه زمان ($t$) به معادلات جبری ساده در حوزه فرکانس مختلط ($s$) تبدیل می‌کند.

اگر تابع $f(t)$ در بازه $[0, \\infty)$ تعریف شده باشد، تبدیل لاپلاس آن به صورت زیر تعریف می‌شود:

$$\\mathcal{L}\\{f(t)\\} = F(s) = \\int_{0}^{\\infty} e^{-st} f(t) \\, dt$$

که در آن $s = \\sigma + i\\omega$ یک متغیر مختلط است.

> [!NOTE]
> برای اینکه انتگرال فوق همگرا باشد، تابع $f(t)$ باید دو شرط زیر را برآورده سازد:
> 1. در هر بازه کراندار **پیوسته تکه‌ای (Piecewise Continuous)** باشد.
> 2. از **مرتبه نمایی (Exponential Order)** باشد، یعنی ثوابتی چون $M > 0$ و $k$ وجود داشته باشند که:
>    $$|f(t)| \\le M e^{kt} \\quad (\\forall t > 0)$$

---

## ۲. جدول تبدیلات پرکاربرد

| تابع زمانی $f(t)$ | تبدیل لاپلاس $F(s)$ | ناحیه همگرایی |
| :--- | :--- | :--- |
| $1$ | $\\frac{1}{s}$ | $s > 0$ |
| $t^n$ ($n \\in \\mathbb{N}$) | $\\frac{n!}{s^{n+1}}$ | $s > 0$ |
| $e^{at}$ | $\\frac{1}{s - a}$ | $s > a$ |
| $\\sin(\\omega t)$ | $\\frac{\\omega}{s^2 + \\omega^2}$ | $s > 0$ |
| $\\cos(\\omega t)$ | $\\frac{s}{s^2 + \\omega^2}$ | $s > 0$ |
| $u(t - a)$ (تابع پله‌ای) | $\\frac{e^{-as}}{s}$ | $s > 0$ |

---

## ۳. ویژگی‌های اساسی و قضایای انتقال

### ۳.۱. قضیه مشتق‌گیری (Derivative Theorem)
تبدیل لاپلاس مشتق اول و دوم تابع:

$$\\mathcal{L}\\{f'(t)\\} = s F(s) - f(0)$$

$$\\mathcal{L}\\{f''(t)\\} = s^2 F(s) - s f(0) - f'(0)$$

### ۳.۲. قضیه اول انتقال (First Shifting Theorem)
اگر $\\mathcal{L}\\{f(t)\\} = F(s)$ باشد، آنگاه:

$$\\mathcal{L}\\{e^{at} f(t)\\} = F(s - a)$$

### ۳.۳. قضیه کانولوشن (Convolution Theorem)
پیچش دو تابع $f$ و $g$ به صورت زیر تعریف می‌شود:

$$(f * g)(t) = \\int_0^t f(\\tau) g(t - \\tau) \\, d\\tau$$

و تبدیل لاپلاس آن برابر است با حاصل‌ضرب تبدیل لاپلاس تک‌تک توابع:

$$\\mathcal{L}\\{(f * g)(t)\\} = F(s) \\cdot G(s)$$

---

## ۴. روند حل معادلات دیفرانسیل با تبدیل لاپلاس

فرایند حل گام‌به‌گام به شرح دیاگرام زیر است:

\`\`\`mermaid
flowchart TD
    A["معادله دیفرانسیل زمانی y(t) با شرایط اولیه"] -->|"اعمال تبدیل لاپلاس"| B["معادله جبری در حوزه s: Y(s)"]
    B -->|"حل جبری برای Y(s)"| C["کسر جبری Y(s)"]
    C -->|"تجزیه به کسرهای جزئی"| D["جملات ساده‌تر با معکوس معلوم"]
    D -->|"اعمال معکوس لاپلاس"| E["پاسخ نهایی دقیق y(t) در زمان"]
\`\`\`

---

## ۵. مثال حل‌شده در کلاس

**مسئله:** معادله دیفرانسیل زیر را با شرایط اولیه داده شده حل کنید:

$$y'' + 4y = 8e^{2t}, \\quad y(0) = 1, \\quad y'(0) = 2$$

**گام ۱: اعمال لاپلاس به طرفین:**
$$(s^2 Y(s) - s y(0) - y'(0)) + 4Y(s) = \\frac{8}{s - 2}$$

جایگذاری شرایط اولیه $y(0) = 1$ و $y'(0) = 2$:
$$(s^2 + 4) Y(s) - s - 2 = \\frac{8}{s - 2}$$

$$(s^2 + 4) Y(s) = s + 2 + \\frac{8}{s - 2} = \\frac{(s+2)(s-2) + 8}{s - 2} = \\frac{s^2 + 4}{s - 2}$$

**گام ۲: ساده‌سازی:**
$$Y(s) = \\frac{s^2 + 4}{(s - 2)(s^2 + 4)} = \\frac{1}{s - 2}$$

**گام ۳: معکوس لاپلاس:**
$$y(t) = \\mathcal{L}^{-1}\\left\\{\\frac{1}{s - 2}\\right\\} = e^{2t}$$

این پاسخ بسیار ساده و شگفت‌انگیز بود زیرا اثر شرایط اولیه و ریشه‌های معادله مشخصه به زیبایی متوازن شدند.
`,
    transcript: [
      {
        id: 't-1',
        timestamp: '00:00:20',
        timestampSeconds: 20,
        speaker: 'استاد حسینی',
        text: 'به نام خدا. سلام دانشجویان گرامی. در جلسه پنجم، مبحث هیجان‌انگیز تبدیل لاپلاس را پی می‌گیریم.',
      },
      {
        id: 't-2',
        timestamp: '00:05:12',
        timestampSeconds: 312,
        speaker: 'استاد حسینی',
        text: 'ابتدا تعریف انتگرالی را یادآوری می‌کنم: ضرب تابع در e به توان منفی st از صفر تا بی‌نهایت.',
      },
      {
        id: 't-3',
        timestamp: '00:18:40',
        timestampSeconds: 1120,
        speaker: 'استاد حسینی',
        text: 'حتماً قضیه تبدیل لاپلاس مشتق مرتبه n ام و قضیه شیفت زمانی را حفظ باشید؛ در امتحان پایان‌ترم مسئله اول دقیقاً یک معادله مرتبه دوم با تابع پله‌ای هویساید خواهد بود.',
      },
      {
        id: 't-4',
        timestamp: '00:29:50',
        timestampSeconds: 1790,
        speaker: 'دانشجو',
        text: 'استاد ببخشید، در مورد قضیه شیفت، اگر توان منفی باشد علامت منفی در مخرج تغییر می‌کند؟',
      },
      {
        id: 't-5',
        timestamp: '00:30:15',
        timestampSeconds: 1815,
        speaker: 'استاد حسینی',
        text: 'بله کاملاً درسته، وقتی e به توان at دارید در مخرج s منهای a داریم، بنابراین برای e به توان منفی ۲t تبدیل می‌شود به یک بر روی s به علاوه ۲.',
      },
      {
        id: 't-6',
        timestamp: '00:42:15',
        timestampSeconds: 2535,
        speaker: 'استاد حسینی',
        text: 'دانشجویان عزیز دقت کنید: در کسر جزئی اگر ریشه مضاعف داشتید، ضریب توان بالاتر اول محاسبه می‌شود. بارها دیدم در تصحیح اوراق که این بخش نمره منفی می‌اندازد.',
      },
      {
        id: 't-7',
        timestamp: '01:05:10',
        timestampSeconds: 3910,
        speaker: 'استاد حسینی',
        text: 'قضیه کانولوشن یک شاهکار در جبر است، به جای انتگرال‌گیری پیچیده زمانی، دو تابع را در حوزه s به راحتی ضرب می‌کنید.',
      },
      {
        id: 't-8',
        timestamp: '01:25:30',
        timestampSeconds: 5130,
        speaker: 'استاد حسینی',
        text: 'برای جلسه آینده حتماً تمرین‌های فصل هفتم کتاب بویس و دیپریما را حل کنید. خسته نباشید.',
      },
    ],
  },
}

export const MOCK_QUIZZES = {
  'session-math-5': {
    sessionId: 'session-math-5',
    courseId: 'course-math-advanced',
    title: 'آزمونک پنج سوالی: تبدیل لاپلاس و قضایای انتقال',
    questions: [
      {
        id: 'q-1',
        text: 'تبدیل لاپلاس تابع $f(t) = e^{3t} \\cos(2t)$ کدام است؟',
        options: [
          '$\\frac{s - 3}{(s - 3)^2 + 4}$',
          '$\\frac{2}{(s - 3)^2 + 4}$',
          '$\\frac{s + 3}{(s + 3)^2 + 4}$',
          '$\\frac{s - 3}{(s - 3)^2 - 4}$',
        ],
        correctIndex: 0,
        explanation: 'طبق قضیه اول انتقال (First Shifting Theorem)، با توجه به اینکه $\\mathcal{L}\\{\\cos(2t)\\} = \\frac{s}{s^2 + 4}$ است، ضرب در $e^{3t}$ متغیر $s$ را به $s - 3$ تبدیل می‌کند.',
        sourceTimestamp: '00:25:10',
      },
      {
        id: 'q-2',
        text: 'کدام شرط برای وجود تبدیل لاپلاس یک تابع $f(t)$ در بازه $[0, \\infty)$ الزامی است؟',
        options: [
          'مشتق‌پذیری بی‌نهایت بار در تمامی نقاط',
          'پیوستگی تکه‌ای و داشتن مرتبه نمایی (Exponential Order)',
          'محدود بودن به یک بازه فشرده بسته',
          'فرد بودن تابع نسبت به مبدا مختصات',
        ],
        correctIndex: 1,
        explanation: 'شرایط کافی برای وجود تبدیل لاپلاس، پیوستگی تکه‌ای در هر بازه متناهی و رشد حداکثر با نرخ نمایی ($|f(t)| \\le M e^{kt}$) است.',
        sourceTimestamp: '00:08:30',
      },
      {
        id: 'q-3',
        text: 'مقدار تبدیل لاپلاس $\\mathcal{L}\\{y\'\'(t)\\}$ با شرایط اولیه $y(0) = 2$ و $y\'(0) = -1$ کدام گزینه است؟',
        options: [
          '$s^2 Y(s) - 2s - 1$',
          '$s^2 Y(s) - 2s + 1$',
          '$s^2 Y(s) + 2s - 1$',
          '$s^2 Y(s) - s + 2$',
        ],
        correctIndex: 1,
        explanation: 'فرمول مشتق دوم برابر است با: $\\mathcal{L}\\{y\'\'\\} = s^2 Y(s) - s y(0) - y\'(0)$. با جایگذاری $y(0)=2$ و $y\'(0)=-1$ خواهیم داشت: $s^2 Y(s) - 2s - (-1) = s^2 Y(s) - 2s + 1$.',
        sourceTimestamp: '00:18:40',
      },
      {
        id: 'q-4',
        text: 'حاصل تبدیل لاپلاس تابع پله واحد تاخیریافته $\\mathcal{L}\\{u(t - 4)\\}$ چیست؟',
        options: [
          '$\\frac{e^{-4s}}{s}$',
          '$\\frac{e^{4s}}{s}$',
          '$\\frac{1}{s - 4}$',
          '$\\frac{4}{s^2}$',
        ],
        correctIndex: 0,
        explanation: 'تبدیل لاپلاس پله واحد با تاخیر $a$ برابر $\\frac{e^{-as}}{s}$ است که به ازای $a = 4$ نتیجه $\\frac{e^{-4s}}{s}$ حاصل می‌شود.',
        sourceTimestamp: '00:35:00',
      },
      {
        id: 'q-5',
        text: 'بر اساس قضیه پیچش (کانولوشن)، اگر $h(t) = (f * g)(t)$ باشد، $\\mathcal{L}\\{h(t)\\}$ چگونه محاسبه می‌شود؟',
        options: [
          '$F(s) + G(s)$',
          '$\\frac{F(s)}{G(s)}$',
          '$F(s) \\cdot G(s)$',
          '$\\int_0^s F(\\tau) G(s - \\tau) d\\tau$',
        ],
        correctIndex: 2,
        explanation: 'قضیه کانولوشن بیان می‌کند که تبدیل لاپلاس پیچش دو تابع، دقیقاً برابر با ضرب جبری تبدیل لاپلاس آنها در حوزه فرکانس است: $F(s) \\cdot G(s)$.',
        sourceTimestamp: '01:05:10',
      },
    ],
  },
}

export const MOCK_SUMMARIES = {
  'session-math-5': {
    sessionId: 'session-math-5',
    courseId: 'course-math-advanced',
    title: 'مرور فوق فشرده ۲ دقیقه‌ای: جلسه ۵ تبدیل لاپلاس',
    bulletPoints: [
      'تعریف تبدیل لاپلاس: تبدیل معادلات دیفرانسیل زمانی به معادلات جبری در حوزه مختلط s.',
      'شرایط وجود: پیوستگی تکه‌ای و نرخ رشد زیر نمایی (Exponential order).',
      'فرمول کلیدی مشتقات: $\\mathcal{L}\\{y\'\'\\} = s^2 Y(s) - s y(0) - y\'(0)$.',
      'قضیه شیفت: ضریب $e^{at}$ باعث انتقال $s \\to s - a$ در تمام جملات مخرج می‌شود.',
      'نکته امتحانی قطعی: سوال اول پایان‌ترم بر اساس حل معادله مرتبه دوم با شرایط اولیه است.',
    ],
    fullText: `در این جلسه، استاد حسینی تبدیل لاپلاس را به عنوان قوی‌ترین ابزار حل معادلات دیفرانسیل مهندسی معرفی کردند. تبدیل لاپلاس با عملگر انتگرالی خود، مشتقات پیچیده زمانی را با اعمال شرایط اولیه به روابط ساده جبری در متغیر s تبدیل می‌کند. همچنین قضیه اول انتقال (شیفت فرکانسی) و کانولوشن تدریس شد. مهم‌ترین هشدار امتحانی استاد مربوط به اعمال دقیق شرایط اولیه منفی و بسط ریشه‌های مکرر در کسرهای جزئی بود.`,
    estimatedReadingTime: '۱ دقیقه و ۴۵ ثانیه',
  },
}

