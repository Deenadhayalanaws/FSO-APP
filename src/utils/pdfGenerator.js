// Custom PDF Generator - matches original HTML implementation
export function generatePDF(reportData) {
  const { config, sampleType, monthName, monthNameDash, groups, extras, grandTotal } = reportData

  const PW = 595
  const PH = 842
  const MX = 42
  const TW = 511
  const cw = [32, 70, 150, 78, 50, 55, 76]
  const cx = []
  let a = MX
  cw.forEach(w => {
    cx.push(a)
    a += w
  })

  const pg = []
  let o, y

  const ex = s => String(s).replace(/[^\x20-\x7e]/g, '?').replace(/([\\()])/g, '\\$1')

  const fw = (s, z, b) => {
    let n = 0
    for (const ch of String(s)) {
      n += /[iljtfI.,:;' ()\-\/!]/.test(ch) ? 0.3 : /[MWmw]/.test(ch) ? 0.85 : /[A-Z0-9]/.test(ch) ? 0.62 : 0.52
    }
    return n * z * (b ? 1.06 : 1)
  }

  const np = () => {
    o = ['0.6 w']
    pg.push(o)
    y = PH - 48
  }

  const T = (s, x, yy, z = 10, b = 0) =>
    o.push(`BT /F${b ? 2 : 1} ${z} Tf ${x.toFixed(1)} ${yy.toFixed(1)} Td (${ex(s)}) Tj ET`)

  const Rc = (x, yt, w, h, f) =>
    o.push(f ? `0.85 g ${x} ${yt - h} ${w} ${h} re f 0 g ${x} ${yt - h} ${w} ${h} re S` : `${x} ${yt - h} ${w} ${h} re S`)

  const wrap = (s, w, z, b) => {
    const out = []
    let l = ''
    String(s).split(/\s+/).forEach(wd => {
      const t = l ? l + ' ' + wd : wd
      if (l && fw(t, z, b) > w) {
        out.push(l)
        l = wd
      } else {
        l = t
      }
    })
    if (l) out.push(l)
    return out.length ? out : ['']
  }

  const cell = (i, s, yt, h, al, z = 10, b = 0, span = 1) => {
    const w = cw.slice(i, i + span).reduce((p, q) => p + q)
    const ls = wrap(s, w - 8, z, b)
    const lh = z + 2
    const top = yt - (h - ls.length * lh) / 2 - z + 1
    ls.forEach((l, k) => {
      const tw = fw(l, z, b)
      T(l, al === 'c' ? cx[i] + (w - tw) / 2 : al === 'r' ? cx[i] + w - 4 - tw : cx[i] + 4, top - k * lh, z, b)
    })
  }

  const head = () => {
    const hs = ['S.No', 'Date of sample collection', 'Name / nature of article', 'Sample No:', 'Sample Cost', 'Courier Cost', 'Total Amount']
    const h = 34
    hs.forEach((s, i) => {
      Rc(cx[i], y, cw[i], h, 1)
      cell(i, s, y, h, 'c', 9, 1)
    })
    y -= h
  }

  const room = h => {
    if (y - h < 48) {
      np()
      head()
    }
  }

  const L = (s, b) => {
    T(s, MX, y, 10, b)
    y -= 14
  }

  const fd = d => d.split('-').reverse().join('.')

  np()

  L('From', 1)
  L(config.name)
  L(config.designation)
  L(config.block)
  L('Food Safety & Drug Administration Department')
  L(config.district + ' District')
  y -= 8

  L('To', 1)
  L('The Designated Officer')
  L('Food Safety & Drug Administration Department')
  L(config.district + ' District')
  y -= 10

  T('Subject:', MX, y, 10, 1)
  wrap(`Regarding Sample collection expenditure reimbursement for ${monthNameDash} ${sampleType} Samples`, TW - 50, 10).forEach(l => {
    T(l, MX + 46, y, 10)
    y -= 14
  })

  L(config.salutation, 1)
  y -= 4

  wrap(`Kindly requesting you to sanction below mentioned expenditure for ${sampleType} sample collection for the Month of ${monthName}`, TW, 10).forEach(l => {
    T(l, MX, y, 10)
    y -= 14
  })

  y -= 4

  head()

  let i = 0
  groups.forEach(g => {
    const hs = g.samples.map(s => Math.max(20, wrap(s.article, cw[2] - 8, 10).length * 12 + 8))
    const gh = hs.reduce((p, q) => p + q)
    const sum = g.samples.reduce((p, s) => p + s.cost, 0)

    room(gh)
    let yt = y

    g.samples.forEach((s, k) => {
      const h = hs[k]
      ;[0, 1, 2, 3, 4].forEach(c => Rc(cx[c], yt, cw[c], h))
      cell(0, String(++i), yt, h, 'c')
      cell(1, fd(s.date), yt, h, 'l')
      cell(2, s.article, yt, h, 'l')
      cell(3, s.sampleNo, yt, h, 'l')
      cell(4, String(s.cost), yt, h, 'r')
      yt -= h
    })

    Rc(cx[5], y, cw[5], gh)
    Rc(cx[6], y, cw[6], gh)
    cell(5, g.courierCost ? String(g.courierCost) : '', y, gh, 'c')
    cell(6, String(sum + g.courierCost), y, gh, 'c')
    y -= gh
  })

  const sw = TW - cw[6]

  if (extras.total > 0) {
    const t = extras.items.map(x => x.name).join(', ')
    const h = Math.max(22, wrap(t, sw - 8, 10).length * 12 + 8)
    room(h)
    Rc(cx[0], y, sw, h)
    Rc(cx[6], y, cw[6], h)
    cell(0, t, y, h, 'c', 10, 0, 6)
    cell(6, String(extras.total), y, h, 'c')
    y -= h
  }

  const lt = `Total Expenditure for ${sampleType} Sample collection for the Month of ${monthName}`
  const h = Math.max(26, wrap(lt, sw - 8, 10, 1).length * 12 + 10)
  room(h)
  Rc(cx[0], y, sw, h)
  Rc(cx[6], y, cw[6], h)
  cell(0, lt, y, h, 'l', 10, 1, 6)
  cell(6, String(grandTotal), y, h, 'c', 11, 1)
  y -= h

  y -= 18
  if (y < 70) np()

  // Add closing line
  wrap(`Kindly Requested to provide the above expenses for ${sampleType} Sample collection for The Month of ${monthName}`, TW, 10).forEach(l => {
    T(l, MX, y, 10)
    y -= 14
  })

  const objs = []
  const kids = pg.map((_, k) => `${5 + k * 2} 0 R`).join(' ')

  objs[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objs[2] = `<< /Type /Pages /Kids [${kids}] /Count ${pg.length} >>`
  objs[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
  objs[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'

  pg.forEach((p, k) => {
    const c = p.join('\n')
    objs[5 + k * 2] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + k * 2} 0 R >>`
    objs[6 + k * 2] = `<< /Length ${c.length} >>\nstream\n${c}\nendstream`
  })

  let out = '%PDF-1.4\n'
  const off = []

  for (let k = 1; k < objs.length; k++) {
    off.push(out.length)
    out += `${k} 0 obj\n${objs[k]}\nendobj\n`
  }

  const xr = out.length
  out += `xref\n0 ${objs.length}\n0000000000 65535 f \n`
  out += off.map(v => String(v).padStart(10, '0') + ' 00000 n \n').join('')
  out += `trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF`

  return Uint8Array.from(out, c => c.charCodeAt(0) & 255)
}
