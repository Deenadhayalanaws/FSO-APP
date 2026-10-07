import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Calendar, DollarSign, Package } from 'lucide-react'
import { format } from 'date-fns'

export default function Courier({ month, dispatches, setDispatches, samples, showToast }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    cost: 0,
  })

  const filteredDispatches = dispatches.filter(d => d.date.startsWith(month))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.date) {
      showToast('Please select a date', 'error')
      return
    }

    const newDispatch = {
      id: Date.now(),
      ...formData,
      cost: Number(formData.cost),
    }

    setDispatches([...dispatches, newDispatch])
    setFormData({
      date: new Date().toISOString().slice(0, 10),
      cost: 0,
    })
    showToast('Courier dispatch added!')
  }

  const deleteDispatch = (id) => {
    if (window.confirm('Delete this dispatch? Samples will become ungrouped.')) {
      setDispatches(dispatches.filter(d => d.id !== id))
      showToast('Dispatch deleted')
    }
  }

  const getSamplesCount = (dispatchId) => {
    return samples.filter(s => s.dispatch === dispatchId.toString()).length
  }

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
      >
        <p className="text-sm text-blue-900 dark:text-blue-200">
          <strong>💡 Tip:</strong> One courier dispatch covers many samples. Its cost is split across that group in the report.
        </p>
      </motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary-500" />
          Add Courier Dispatch
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Dispatch Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Courier Cost (₹)
              </label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="input-field"
                min="0"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full">
            <Plus className="w-5 h-5 inline mr-2" />
            Add Dispatch
          </button>
        </form>
      </motion.div>

      {/* Dispatches List */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-bold mb-4">
          Dispatches This Month ({filteredDispatches.length})
        </h2>

        {filteredDispatches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚚</div>
            <p className="text-slate-500 dark:text-slate-400">
              No courier dispatches yet
              <br />
              <span className="text-sm">Add one when sending samples!</span>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDispatches.map((dispatch, index) => (
              <motion.div
                key={dispatch.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-800"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-5 h-5 text-primary-500" />
                    <h3 className="font-semibold text-lg">
                      {format(new Date(dispatch.date), 'dd/MM/yyyy')}
                    </h3>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    📊 {getSamplesCount(dispatch.id)} samples linked
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      ₹{dispatch.cost}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteDispatch(dispatch.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
