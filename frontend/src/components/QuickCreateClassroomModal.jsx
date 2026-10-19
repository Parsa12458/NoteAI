import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X, School } from "lucide-react";
import { appleSpring } from "../utils/cn";

export const QuickCreateClassroomModal = ({
  isOpen,
  onClose,
  onSuccess,
  createAction,
}) => {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("دهم");
  const [academicYear, setAcademicYear] = useState("1403-1404");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const created = await createAction({
        name: name.trim(),
        grade: grade.trim(),
        academic_year: academicYear.trim(),
      });
      onSuccess(created);
      setName("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={appleSpring}
                  className="w-full max-w-sm rounded-3xl apple-glass-card p-6 shadow-2xl relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <School className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                      <div>
                        <Dialog.Title className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                          افزودن کلاس جدید
                        </Dialog.Title>
                        <p className="text-2xs text-zinc-500 dark:text-zinc-400">
                          ایجاد سریع کلاس بدون خروج از استودیو
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={onClose}
                      className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <X className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-2xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                        نام کلاس یا شعبه *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="مثال: کلاس ۱۰۱ — دهم ریاضی"
                        className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-2xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                          پایه تحصیلی
                        </label>
                        <input
                          type="text"
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          placeholder="دهم"
                          className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-2xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                          سال تحصیلی
                        </label>
                        <input
                          type="text"
                          value={academicYear}
                          onChange={(e) => setAcademicYear(e.target.value)}
                          placeholder="1403-1404"
                          dir="ltr"
                          className="w-full px-3.5 py-2.5 text-xs font-mono rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 transition-all"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                      >
                        انصراف
                      </button>
                      <button
                        type="submit"
                        disabled={!name.trim() || isSubmitting}
                        className="px-5 py-2 rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white shadow-sm active:scale-95 transition-all"
                      >
                        {isSubmitting ? "در حال ثبت..." : "ایجاد کلاس"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};
