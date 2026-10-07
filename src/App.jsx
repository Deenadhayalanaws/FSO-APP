import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Sun, Moon } from 'lucide-react'
import Samples from './components/Samples'
import Courier from './components/Courier'
import Report from './components/Report'
import Toast from './components/Toast'
import { useLocalStorage } from './hooks/useLocalStorage'

function App() {
  const [activeTab, setActiveTab] = useState('samples')
  const [darkMode, setDarkMode] = useState(false)
  const [toast, setToast] = useState(null)
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))

  const [samples, setSamples] = useLocalStorage('fso-samples', [])
  const [dispatches, setDispatches] = useLocalStorage('fso-dispatches', [])
  const [extras, setExtras] = useLocalStorage('fso-extras', [])
  const [config, setConfig] = useLocalStorage('fso-config', {
    name: 'K. Rajeswari',
    designation: 'Food Safety Officer',
    block: 'Thirumayam & Arimalam Block',
    district: 'Pudukkottai',
    salutation: 'Respected Madam'
  })

  useEffect(() => {
    // Check system dark mode preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const tabs = [
    { id: 'samples', label: 'Samples' },
    { id: 'courier', label: 'Courier' },
    { id: 'report', label: 'Report' },
  ]

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                FSO Sample Diary
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Works offline. Data stays on this phone.
              </p>
            </div>

            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-primary-500 transition-all duration-200"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-primary-500" />
              ) : (
                <Moon className="w-5 h-5 text-primary-600" />
              )}
            </button>
          </div>

          {/* Month Selector */}
          <div className="glass-card p-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Month
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="input-field"
            />
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-2 mb-6"
        >
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${
                  activeTab === tab.id ? 'tab-active' : 'tab-inactive'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'samples' && (
              <Samples
                month={month}
                samples={samples}
                setSamples={setSamples}
                dispatches={dispatches}
                setDispatches={setDispatches}
                showToast={showToast}
              />
            )}
            {activeTab === 'courier' && (
              <Courier
                month={month}
                dispatches={dispatches}
                setDispatches={setDispatches}
                samples={samples}
                showToast={showToast}
              />
            )}
            {activeTab === 'report' && (
              <Report
                month={month}
                samples={samples}
                dispatches={dispatches}
                config={config}
                setConfig={setConfig}
                extras={extras}
                setExtras={setExtras}
                showToast={showToast}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Toast Notifications */}
        <Toast toast={toast} />
      </div>
    </div>
  )
}

export default App
