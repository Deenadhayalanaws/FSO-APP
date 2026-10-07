import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

export default function Toast({ toast }) {
  if (!toast) return null

  const icons = {
    success: <CheckCircle2 className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
  }

  const colors = {
    success: 'from-primary-500 to-primary-600',
    error: 'from-red-500 to-red-600',
  }

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div
            className={`bg-gradient-to-r ${colors[toast.type]} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px]`}
          >
            {icons[toast.type]}
            <span className="flex-1 font-semibold">{toast.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
