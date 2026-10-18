# قرارداد ارتباط کلاینت و سرور FastAPI (NoteAI Backend Contract)

این سند مرجع رسمی هماهنگی بین فرانت‌اند (React/Vite) و بک‌اند (FastAPI + Python) برای پلتفرم «کلاس هوشمند NoteAI» است.

---

## ۱. تنظیمات عمومی (General Settings)

- **پیشوند روت‌ها**: `/api`
- **فرمت ارسال و دریافت متادیتا**: `application/json; charset=utf-8`
- **کد وضعیت‌ها**:
  - `200 OK`: موفقیت درخواست
  - `201 Created`: ثبت با موفقیت
  - `400 Bad Request`: اعتبارسنجی ناموفق یا نقص پارامترها
  - `404 Not Found`: جلسه، درس یا چانک یافت نشد
  - `409 Conflict`: چانک تکراری با شناسه مشابه اما حجم متفاوت
  - `422 Unprocessable Entity`: فرمت نامعتبر
  - `500/503`: خطای داخلی یا عدم آمادگی سرویس هوش مصنوعی

---

## ۲. روت‌های دروس و برنامه کلاسی (Courses & Timetable)

### `GET /api/courses`
دریافت لیست دروس کاربر.
```json
[
  {
    "id": "course-math-advanced",
    "name": "ریاضی مهندسی پیشرفته",
    "code": "MATH401",
    "department": "دانشکده مهندسی برق و کامپیوتر",
    "instructor": "دکتر حسینی",
    "sessionsCount": 12,
    "lastSessionDate": "2026-10-14T09:30:00Z",
    "color": "#3b82f6",
    "icon": "calculator"
  }
]
```

### `POST /api/courses`
ایجاد درس جدید.
```json
{
  "name": "مدارهای الکتریکی ۱",
  "code": "EE201",
  "instructor": "دکتر مرادی",
  "department": "مهندسی برق"
}
```

### `GET /api/timetable`
دریافت برنامه زمانی هفتگی برای پیشنهاد خودکار درس در هنگام شروع ضبط.
```json
{
  "days": {
    "saturday": [
      { "period": 1, "start": "08:00", "end": "09:30", "courseId": "course-math-advanced" },
      { "period": 2, "start": "10:00", "end": "11:30", "courseId": "course-ai" }
    ],
    "monday": [
      { "period": 1, "start": "08:00", "end": "09:30", "courseId": "course-math-advanced" }
    ]
  }
}
```

---

## ۳. مدیریت جلسات و آپلود صوت (Sessions & Audio Chunks)

### `POST /api/sessions`
ایجاد جلسه ضبط جدید پیش از شروع ضبط یا هنگام همگام‌سازی اولیه.
**درخواست:**
```json
{
  "localSessionId": "session_1730000000_abc123",
  "courseId": "course-math-advanced",
  "title": "جلسه ۵: تبدیل لاپلاس و کاربرد آن در معادلات دیفرانسیل",
  "period": "ساعت ۸ تا ۱۰",
  "mimeType": "audio/webm;codecs=opus",
  "startedAt": "2026-10-18T08:05:00Z"
}
```
**پاسخ:**
```json
{
  "sessionId": "srv_session_9942",
  "localSessionId": "session_1730000000_abc123",
  "status": "recording",
  "createdAt": "2026-10-18T08:05:02Z"
}
```

### `POST /api/sessions/{sessionId}/chunks`
آپلود مستقل تکه‌های صوت (Chunk-by-chunk Upload). این روت از نوع `multipart/form-data` است.

**فیلدهای Form-Data:**
- `chunkId`: رشته یکتا، مثلاً `session_abc_chunk_0`
- `sequence`: عدد صحیح ترتیب چانک (`0, 1, 2, ...`)
- `durationMs`: طول چانک به میلی‌ثانیه (مثلاً `300000`)
- `isFinal`: بولی (`true` اگر آخرین چانک باشد)
- `audio`: فایل صوتی باینری (`Blob`)

**پاسخ سرور:**
```json
{
  "serverChunkId": "chk_88120",
  "chunkId": "session_abc_chunk_0",
  "sequence": 0,
  "size": 1548290,
  "status": "acknowledged",
  "acknowledgedAt": "2026-10-18T08:10:05Z"
}
```

### `POST /api/sessions/{sessionId}/finalize`
اعلام پایان ضبط جلسه به سرور جهت آغاز فرایند رونویسی کامل (Transcription) و تولید جزوه.
```json
{
  "totalChunks": 6,
  "totalDurationMs": 1800000,
  "endedAt": "2026-10-18T08:35:00Z"
}
```

---

## ۴. دریافت جزوه، رونوشت و نکات امتحانی (Notebook & Exam Tips)

### `GET /api/courses/{courseId}/sessions/{sessionId}/notebook`
دریافت خروجی‌های هوش مصنوعی برای جلسه مورد نظر:
```json
{
  "sessionId": "srv_session_9942",
  "courseId": "course-math-advanced",
  "status": "ready",
  "notesMarkdown": "# تبدیل لاپلاس (Laplace Transform)\n\nتبدیل لاپلاس یک تبدیل انتگرالی است که تابع را از حوزه زمان به حوزه فرکانس مختلط انتقال می‌دهد: ...",
  "transcript": [
    {
      "timestamp": "00:01:15",
      "timestampMs": 75000,
      "speaker": "استاد",
      "text": "سلام به همه دانشجویان عزیز. امروز جلسه پنجم درس ریاضی مهندسی رو شروع می‌کنیم."
    }
  ],
  "examTips": [
    {
      "id": "tip-1",
      "type": "explicit_teacher_statement",
      "statement": "این فرمول تبدیل لاپلاس مشتقات حتماً در سوال اول پایان‌ترم به عنوان یک مسئله ۱۰ نمره‌ای خواهد آمد.",
      "timestamp": "00:14:20",
      "timestampMs": 860000,
      "confidence": 0.98
    },
    {
      "id": "tip-2",
      "type": "ai_inferred",
      "statement": "تاکید مکرر بر شرط همگرایی انتگرال ناسره نشان‌دهنده پتانسیل بالای طرح تست نمره‌منفی از این بخش است.",
      "timestamp": "00:27:45",
      "timestampMs": 1665000,
      "confidence": 0.85
    }
  ]
}
```

---

## ۵. تعامل هوش مصنوعی (AI Study Assistant)

### `POST /api/ai/chat`
چت هوشمند متصل به محتوای درس (RAG).
```json
{
  "courseId": "course-math-advanced",
  "sessionId": "srv_session_9942",
  "question": "شرایط وجود تبدیل لاپلاس برای یک تابع پیوسته تکه‌ای چیست؟",
  "history": []
}
```
پاسخ سرور:
```json
{
  "answer": "برای وجود تبدیل لاپلاس $F(s) = \\mathcal{L}\\{f(t)\\}$، تابع $f(t)$ باید دو شرط زیر را برآورده کند:\n1. **پیوسته تکه‌ای** باشد در بازه $[0, \\infty)$.\n2. از **مرتبه نمایی (Exponential Order)** باشد، یعنی وجود داشته باشند مقادیر ثابت $M > 0$ و $k$ به طوری که:\n$$|f(t)| \\le M e^{kt}$$",
  "citations": [
    {
      "text": "استاد در دقیقه ۱۵ اشاره کردند که شرط مرتبه نمایی برای تضمین همگرایی انتگرال ضروری است.",
      "timestamp": "00:15:30",
      "sessionId": "srv_session_9942"
    }
  ]
}
```

### `POST /api/ai/quiz`
تولید آزمونک ۵ سوالی تستی با توضیحات تشریحی.
```json
{
  "courseId": "course-math-advanced",
  "sessionId": "srv_session_9942"
}
```

### `POST /api/ai/summary`
دریافت خلاصه متنی و صوتی ۲ دقیقه‌ای از جلسه منتخب.
```json
{
  "courseId": "course-math-advanced",
  "sessionId": "srv_session_9942"
}
```

