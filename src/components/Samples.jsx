import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Calendar, Tag, DollarSign, FileText, Package } from 'lucide-react'
import { format } from 'date-fns'

export default function Samples({ month, samples, setSamples, dispatches, setDispatches, showToast }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    article: '',
    sampleNo: '',
    cost: 0,
    type: 'Surveillance',
    dispatch: '',
  })
  const [newParcelCost, setNewParcelCost] = useState(0)
  const [showNewParcel, setShowNewParcel] = useState(false)

  const filteredSamples = samples.filter(s => s.date.startsWith(month))
  const filteredDispatches = dispatches.filter(d => d.date.startsWith(month))

  // Auto-suggest next sample number
  useEffect(() => {
    if (!formData.sampleNo && samples.length > 0) {
      const lastSample = samples[samples.length - 1]
      const match = lastSample.sampleNo.match(/^(\d+)(\/.*)$/)
      if (match) {
        const nextNo = (parseInt(match[1]) + 1) + match[2]
        setFormData(prev => ({ ...prev, sampleNo: nextNo }))
      }
    }
  }, [samples, formData.sampleNo])

  useEffect(() => {
    setShowNewParcel(formData.dispatch === 'new')
  }, [formData.dispatch])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.article || !formData.sampleNo || !formData.date) {
      showToast('Enter the date, article name and sample number.', 'error')
      return
    }

    let dispatchId = formData.dispatch

    // Create new dispatch if "new" selected
    if (formData.dispatch === 'new') {
      dispatchId = Date.now() + 1
      const newDispatch = {
        id: dispatchId,
        date: formData.date,
        cost: Number(newParcelCost),
      }
      setDispatches([...dispatches, newDispatch])
      setNewParcelCost(0)
    }

    const newSample = {
      id: Date.now(),
      date: formData.date,
      article: formData.article,
      sampleNo: formData.sampleNo,
      cost: Number(formData.cost),
      type: formData.type,
      dispatch: dispatchId || '',
    }

    setSamples([...samples, newSample])
    setFormData({
      ...formData,
      article: '',
      cost: 0,
      dispatch: dispatchId || '',
    })
    showToast('Sample saved successfully!')
  }

  const deleteSample = (id) => {
    if (window.confirm('Delete this sample?')) {
      setSamples(samples.filter(s => s.id !== id))
      showToast('Sample deleted')
    }
  }

  const updateDispatch = (sampleId, dispatchId) => {
    setSamples(samples.map(s => s.id === sampleId ? { ...s, dispatch: dispatchId } : s))
    showToast('Dispatch updated')
  }

  const getDispatchLabel = (dispatch) => {
    const sampleCount = samples.filter(s => s.dispatch === dispatch.id.toString()).length
    return `Parcel ${format(new Date(dispatch.date), 'dd.MM.yyyy')} · ₹${dispatch.cost} · ${sampleCount} sample${sampleCount === 1 ? '' : 's'}`
  }

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary-500" />
          Add New Sample
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Date of sample collection
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
              Name / nature of article
            </label>
            <input
              type="text"
              value={formData.article}
              onChange={(e) => setFormData({ ...formData, article: e.target.value })}
              placeholder="e.g. Toor dal (loose condition)"
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Sample no.
              </label>
              <input
                type="text"
                value={formData.sampleNo}
                onChange={(e) => setFormData({ ...formData, sampleNo: e.target.value })}
                placeholder="499/2026-27"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Sample cost (₹)
              </label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="input-field"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input-field"
              >
                <option value="Surveillance">Surveillance</option>
                <option value="Act">Act (statutory)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Courier dispatch
              </label>
              <select
                value={formData.dispatch}
                onChange={(e) => setFormData({ ...formData, dispatch: e.target.value })}
                className="input-field"
              >
                <option value="">No courier cost</option>
                {filteredDispatches.map(d => (
                  <option key={d.id} value={d.id}>
                    {getDispatchLabel(d)}
                  </option>
                ))}
                <option value="new">+ New parcel</option>
              </select>
            </div>
          </div>

          {showNewParcel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Courier cost for this new parcel (₹)
              </label>
              <input
                type="number"
                value={newParcelCost}
                onChange={(e) => setNewParcelCost(e.target.value)}
                className="input-field"
                min="0"
              />
            </motion.div>
          )}

          <button type="submit" className="btn-primary w-full">
            <Plus className="w-5 h-5 inline mr-2" />
            Save sample
          </button>
        </form>
      </motion.div>

      {/* Samples List */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-bold mb-4">
          Samples This Month ({filteredSamples.length})
        </h2>

        {filteredSamples.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-slate-500 dark:text-slate-400">
              No samples this month
              <br />
              <span className="text-sm">Save your first one above</span>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSamples.map((sample, index) => (
              <motion.div
                key={sample.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-800"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{sample.article}</h3>
                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1 mb-2">
                      <div>{format(new Date(sample.date), 'dd.MM.yyyy')} · {sample.sampleNo} · {sample.type} · ₹{sample.cost}</div>
                    </div>
                    <select
                      value={sample.dispatch}
                      onChange={(e) => updateDispatch(sample.id, e.target.value)}
                      className="input-field text-sm py-2"
                    >
                      <option value="">No courier cost</option>
                      {filteredDispatches.map(d => (
                        <option key={d.id} value={d.id}>
                          {getDispatchLabel(d)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => deleteSample(sample.id)}
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
