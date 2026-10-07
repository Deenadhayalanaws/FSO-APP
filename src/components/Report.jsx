import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, User, MapPin, Building, Plus, Trash2, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { generatePDF } from '../utils/pdfGenerator'

export default function Report({ month, samples, dispatches, config, setConfig, extras, setExtras, showToast }) {
  const [sampleType, setSampleType] = useState('Surveillance')
  const [extraItem, setExtraItem] = useState({ name: '', amount: 0 })
  const [previewHTML, setPreviewHTML] = useState('')

  const filteredSamples = samples.filter(
    s => s.date.startsWith(month) && s.type === sampleType
  )

  const monthlyExtras = extras.filter(x => x.month === month)

  const addExtra = () => {
    if (!extraItem.name || !extraItem.amount) {
      showToast('Enter the item name and amount.', 'error')
      return
    }

    setExtras([...extras, {
      id: Date.now(),
      month,
      name: extraItem.name,
      amount: Number(extraItem.amount),
    }])
    setExtraItem({ name: '', amount: 0 })
    showToast('Expense item added!')
  }

  const deleteExtra = (id) => {
    setExtras(extras.filter(x => x.id !== id))
    showToast('Expense removed')
  }

  // Generate preview HTML
  useEffect(() => {
    const generatePreview = () => {
      const monthName = format(new Date(month + '-01'), 'MMMM yyyy')
      const monthNameDash = format(new Date(month + '-01'), 'MMMM-yyyy')

      // Group samples by dispatch
      const groups = []
      const seen = {}

      filteredSamples.forEach(sample => {
        if (sample.dispatch && dispatches.some(d => d.id.toString() === sample.dispatch.toString())) {
          const dispatchId = sample.dispatch.toString()
          if (!(dispatchId in seen)) {
            seen[dispatchId] = groups.length
            const dispatch = dispatches.find(d => d.id.toString() === dispatchId)
            groups.push({
              courierCost: dispatch.cost,
              samples: []
            })
          }
          groups[seen[dispatchId]].samples.push(sample)
        } else {
          groups.push({
            courierCost: 0,
            samples: [sample]
          })
        }
      })

      const extrasTotal = monthlyExtras.reduce((sum, x) => sum + x.amount, 0)
      let grandTotal = extrasTotal

      let tableRows = ''
      let serialNo = 0

      groups.forEach(group => {
        const groupSum = group.samples.reduce((sum, s) => sum + s.cost, 0)
        const groupTotal = groupSum + group.courierCost
        grandTotal += groupTotal

        group.samples.forEach((sample, idx) => {
          serialNo++
          const dateFormatted = format(new Date(sample.date), 'dd.MM.yyyy')

          tableRows += `<tr>
            <td style="border:1px solid #000;padding:6px;text-align:center">${serialNo}</td>
            <td style="border:1px solid #000;padding:6px;">${dateFormatted}</td>
            <td style="border:1px solid #000;padding:6px;">${escapeHtml(sample.article)}</td>
            <td style="border:1px solid #000;padding:6px;">${escapeHtml(sample.sampleNo)}</td>
            <td style="border:1px solid #000;padding:6px;text-align:right">${sample.cost}</td>`

          if (idx === 0) {
            tableRows += `<td style="border:1px solid #000;padding:6px;text-align:center" rowspan="${group.samples.length}">${group.courierCost || ''}</td>
            <td style="border:1px solid #000;padding:6px;text-align:center" rowspan="${group.samples.length}">${groupTotal}</td>`
          }

          tableRows += '</tr>'
        })
      })

      if (extrasTotal > 0) {
        const extraNames = monthlyExtras.map(x => escapeHtml(x.name)).join(', ')
        tableRows += `<tr>
          <td colspan="6" style="border:1px solid #000;padding:6px;text-align:center">${extraNames}</td>
          <td style="border:1px solid #000;padding:6px;text-align:center">${extrasTotal}</td>
        </tr>`
      }

      const html = `
        <div style="background:#fff;color:#000;padding:24px;border:2px solid #e2e8f0;border-radius:12px;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;max-width:100%;overflow-x:auto;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
          <p style="margin-bottom:8px;"><strong>From</strong></p>
          <p style="margin-bottom:16px;">${escapeHtml(config.name)}<br>
          ${escapeHtml(config.designation)}<br>
          ${escapeHtml(config.block)}<br>
          Food Safety &amp; Drug Administration Department<br>
          ${escapeHtml(config.district)} District</p>

          <p style="margin-bottom:8px;"><strong>To</strong></p>
          <p style="margin-bottom:16px;">The Designated Officer<br>
          Food Safety &amp; Drug Administration Department<br>
          ${escapeHtml(config.district)} District</p>

          <p style="margin-bottom:12px;"><strong>Subject:</strong> Regarding Sample collection expenditure reimbursement for ${monthNameDash} ${sampleType} Samples</p>
          <p style="margin-bottom:16px;"><strong>${escapeHtml(config.salutation)}</strong></p>
          <p style="margin-bottom:20px;">Kindly requesting you to sanction below mentioned expenditure for ${sampleType} sample collection for the Month of ${monthName}</p>

          ${filteredSamples.length > 0 ? `
            <table style="border-collapse:collapse;width:100%;margin:16px 0;min-width:700px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background:#d9d9d9;">
                  <th style="border:1px solid #000;padding:10px;font-weight:bold;font-size:13px;">S.No</th>
                  <th style="border:1px solid #000;padding:10px;font-weight:bold;font-size:13px;">Date of sample collection</th>
                  <th style="border:1px solid #000;padding:10px;font-weight:bold;font-size:13px;">Name / nature of article</th>
                  <th style="border:1px solid #000;padding:10px;font-weight:bold;font-size:13px;">Sample No:</th>
                  <th style="border:1px solid #000;padding:10px;font-weight:bold;font-size:13px;">Sample Cost</th>
                  <th style="border:1px solid #000;padding:10px;font-weight:bold;font-size:13px;">Courier Cost</th>
                  <th style="border:1px solid #000;padding:10px;font-weight:bold;font-size:13px;">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
                <tr style="background:#f3f4f6;">
                  <td colspan="6" style="border:1px solid #000;padding:10px;text-align:center;font-weight:bold;font-size:13px;">
                    Total Expenditure for ${sampleType} Sample collection for the Month of ${monthName}
                  </td>
                  <td style="border:1px solid #000;padding:10px;text-align:center;font-weight:bold;font-size:14px;">${grandTotal}</td>
                </tr>
              </tbody>
            </table>
            <p style="margin-top:20px;padding:16px;background:#e0f2fe;border-left:4px solid #0284c7;border-radius:8px;">
              <strong>Kindly Requested to provide the above expenses for ${sampleType} Sample collection for The Month of ${monthName}</strong>
            </p>
          ` : `<div style="padding:40px;text-align:center;background:#f8fafc;border-radius:12px;"><p style="color:#64748b;font-size:16px;margin:0;">📋 No ${sampleType.toLowerCase()} samples found for this month.</p></div>`}
        </div>
      `

      setPreviewHTML(html)
    }

    generatePreview()
  }, [month, sampleType, filteredSamples, dispatches, config, monthlyExtras])

  const escapeHtml = (text) => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  const handleDownloadPDF = () => {
    if (filteredSamples.length === 0) {
      showToast(`There are no ${sampleType.toLowerCase()} samples in this month to put in the report.`, 'error')
      return
    }

    try {
      // Group samples by dispatch
      const groups = []
      const seen = {}

      filteredSamples.forEach(sample => {
        if (sample.dispatch && dispatches.some(d => d.id.toString() === sample.dispatch.toString())) {
          const dispatchId = sample.dispatch.toString()
          if (!(dispatchId in seen)) {
            seen[dispatchId] = groups.length
            const dispatch = dispatches.find(d => d.id.toString() === dispatchId)
            groups.push({
              courierCost: dispatch.cost,
              samples: []
            })
          }
          groups[seen[dispatchId]].samples.push(sample)
        } else {
          groups.push({
            courierCost: 0,
            samples: [sample]
          })
        }
      })

      const extrasTotal = monthlyExtras.reduce((sum, x) => sum + x.amount, 0)
      const samplesTotal = filteredSamples.reduce((sum, s) => sum + s.cost, 0)
      const courierTotal = groups.reduce((sum, g) => sum + g.courierCost, 0)
      const grandTotal = samplesTotal + courierTotal + extrasTotal

      const reportData = {
        config: {
          name: config.name,
          designation: config.designation,
          block: config.block,
          district: config.district,
          salutation: config.salutation
        },
        sampleType: sampleType,
        monthName: format(new Date(month + '-01'), 'MMMM yyyy'),
        monthNameDash: format(new Date(month + '-01'), 'MMMM-yyyy'),
        groups: groups.map(g => ({
          courierCost: g.courierCost,
          samples: g.samples.map(s => ({
            date: s.date,
            article: s.article,
            sampleNo: s.sampleNo,
            cost: s.cost
          }))
        })),
        extras: {
          items: monthlyExtras.map(x => ({ name: x.name, amount: x.amount })),
          total: extrasTotal
        },
        grandTotal
      }

      const pdfBytes = generatePDF(reportData)
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Reimbursement_${sampleType}_${month}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      showToast('PDF generated successfully!')
    } catch (error) {
      console.error('PDF generation error:', error)
      showToast('Error generating PDF', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Form Card - Enhanced Modern UI */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              Generate Report
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Configure and download your expense report</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-primary-500 rounded-full"></span>
                Sample Type
              </label>
              <select
                value={sampleType}
                onChange={(e) => setSampleType(e.target.value)}
                className="input-field text-base font-medium"
              >
                <option value="Surveillance">Surveillance</option>
                <option value="Act">Act (statutory)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-500" />
                  From: your name
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary-500" />
                  Designation
                </label>
                <input
                  type="text"
                  value={config.designation}
                  onChange={(e) => setConfig({ ...config, designation: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500" />
                Block / Area
              </label>
              <input
                type="text"
                value={config.block}
                onChange={(e) => setConfig({ ...config, block: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  District
                </label>
                <input
                  type="text"
                  value={config.district}
                  onChange={(e) => setConfig({ ...config, district: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  Salutation
                </label>
                <input
                  type="text"
                  value={config.salutation}
                  onChange={(e) => setConfig({ ...config, salutation: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Other Expenses Section - Enhanced */}
          <div className="pt-6 border-t-2 border-slate-200 dark:border-slate-700">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-amber-500 rounded-full"></span>
              Other Expenses This Month
            </label>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">Courier cover, gum, stationery, etc.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={extraItem.name}
                onChange={(e) => setExtraItem({ ...extraItem, name: e.target.value })}
                placeholder="Item name (e.g., A4 courier cover)"
                className="input-field"
              />
              <input
                type="number"
                value={extraItem.amount}
                onChange={(e) => setExtraItem({ ...extraItem, amount: e.target.value })}
                placeholder="₹ Amount"
                className="input-field"
                min="0"
              />
            </div>

            <button onClick={addExtra} className="btn-secondary w-full">
              <Plus className="w-5 h-5 inline mr-2" />
              Add Expense Item
            </button>

            {monthlyExtras.length > 0 && (
              <div className="mt-4 space-y-2">
                {monthlyExtras.map((extra) => (
                  <motion.div
                    key={extra.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 border-2 border-slate-200 dark:border-slate-600"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <span className="text-lg">💰</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{extra.name}</span>
                        <div className="text-sm text-primary-600 dark:text-primary-400 font-bold">₹{extra.amount}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteExtra(extra.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleDownloadPDF} className="btn-primary w-full text-lg py-4">
            <Download className="w-6 h-6 inline mr-2" />
            Generate & Download PDF Report
          </button>
        </div>
      </motion.div>

      {/* Report Preview - Enhanced */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Report Preview</h3>
        </div>
        <div
          className="overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: previewHTML }}
        />
      </motion.div>
    </div>
  )
}
