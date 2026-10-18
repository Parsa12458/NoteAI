import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  Search,
  Plus,
  Calendar,
  Layers,
  ChevronLeft,
  X,
  Calculator,
  Cpu,
  Brain,
  Atom,
  GraduationCap,
} from 'lucide-react'
import { fetchCourses, createCourse } from '../../../services/courses-api'
import { formatPersianDate } from '../../../utils/date-utils'

const ICON_MAP = {
  Calculator,
  Cpu,
  Brain,
  Atom,
  BookOpen,
  GraduationCap,
}

export function CoursesLibrary() {
  const [search, setSearch] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newCourseName, setNewCourseName] = useState('')
  const [newCourseCode, setNewCourseCode] = useState('')
  const [newInstructor, setNewInstructor] = useState('')
  const [newDepartment, setNewDepartment] = useState('')

  const queryClient = useQueryClient()

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  })

  const addCourseMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      setIsAddModalOpen(false)
      setNewCourseName('')
      setNewCourseCode('')
      setNewInstructor('')
      setNewDepartment('')
    },
  })

  const handleCreateCourse = (e) => {
    e.preventDefault()
    if (!newCourseName.trim()) return

    addCourseMutation.mutate({
      name: newCourseName.trim(),
      code: newCourseCode.trim() || 'GEN-101',
      instructor: newInstructor.trim() || 'استاد محترم',
      department: newDepartment.trim() || 'دانشکده فنی و مهندسی',
      color: '#4f46e5',
      icon: 'BookOpen',
    })
  }

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            کتابخانه دروس و جزوات هوشمند
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            دسترسی به جلسات ضبط‌شده، جزوات پیاده‌سازی‌شده با هوش مصنوعی و آزمونک‌های درسی
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن درس جدید</span>
        </button>
      </div>

      {/* Search & Statistics Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی عنوان درس، نام استاد، کد درس..."
            className="w-full pr-10 pl-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 w-full sm:w-auto justify-between sm:justify-start">
          <span>مجموع دروس: <strong className="text-slate-800 dark:text-slate-200 font-bold">{courses.length}</strong></span>
          <span>جلسات در دسترس: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{courses.reduce((acc, c) => acc + (c.sessionsCount || 0), 0)}</strong></span>
        </div>
      </div>

      {/* Courses Cards Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-slate-400 text-sm">در حال بارگذاری دروس...</div>
      ) : filteredCourses.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h2 className="text-base font-bold text-slate-700 dark:text-slate-300">هیچ درسی یافت نشد</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            عبارت جستجو را تغییر دهید یا یک درس جدید برای ضبط کلاس‌های این ترم ایجاد کنید.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const IconComponent = ICON_MAP[course.icon] || BookOpen

            return (
              <div
                key={course.id}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Icon & Code */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div
                      className="p-3 rounded-xl text-white shadow-xs"
                      style={{ backgroundColor: course.color || '#4f46e5' }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <span className="text-2xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" dir="ltr">
                      {course.code}
                    </span>
                  </div>

                  {/* Title & Instructor */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {course.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    مدرس: {course.instructor}
                  </p>
                  <p className="text-2xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {course.department}
                  </p>

                  {course.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  )}
                </div>

                {/* Bottom Details & Link */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="space-y-1 text-2xs text-slate-500">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{course.sessionsCount || 0} جلسه ضبط‌شده</span>
                    </div>
                    {course.lastSessionDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>آخرین جلسه: {formatPersianDate(course.lastSessionDate)}</span>
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/notebooks/${course.id}`}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                  >
                    <span>میزکار جزوه</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Course Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                ایجاد درس و پوشه جدید
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  نام درس *
                </label>
                <input
                  type="text"
                  required
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="مثال: مبانی کنترل خطی"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    کد درس
                  </label>
                  <input
                    type="text"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="EE-310"
                    dir="ltr"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    نام استاد
                  </label>
                  <input
                    type="text"
                    value={newInstructor}
                    onChange={(e) => setNewInstructor(e.target.value)}
                    placeholder="دکتر صادقی"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  دانشکده یا گروه آموزشی
                </label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="دانشکده مهندسی برق"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={!newCourseName.trim() || addCourseMutation.isPending}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs"
                >
                  {addCourseMutation.isPending ? 'در حال ثبت...' : 'ایجاد درس'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
