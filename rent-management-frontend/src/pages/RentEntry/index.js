import {useState, useEffect} from 'react'
import Layout from '../../components/Layout'
import './index.css'

const RentEntry = () => {
  const [tenants] = useState([
    {id: 1, name: 'Ravi'},
    {id: 2, name: 'Suresh'},
  ])

  const [tenantId, setTenantId] = useState('')
  const [building, setBuilding] = useState('')
  const [room, setRoom] = useState('')
  const [month, setMonth] = useState('')
  const [rent, setRent] = useState('')
  const [water, setWater] = useState('')
  const [maintenance, setMaintenance] = useState('')
  const [electricity, setElectricity] = useState('')
  const [previousDue, setPreviousDue] = useState(0)
  const [paid, setPaid] = useState('')
  const [advance, setAdvance] = useState('')
  const [status, setStatus] = useState('not vacated')

  const [entries, setEntries] = useState([])
  const [editingId, setEditingId] = useState(null)

  // FILTER STATES
  const [filterRoom, setFilterRoom] = useState('')
  const [filterBuilding, setFilterBuilding] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear, setFilterYear] = useState('')

  // LOGO BASE64
  const [logoBase64, setLogoBase64] = useState('')

  useEffect(() => {
    fetch('/SettyRents.png')
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader()
        reader.onloadend = () => setLogoBase64(reader.result)
        reader.readAsDataURL(blob)
      })
  }, [])

  useEffect(() => {
    if (!tenantId || editingId) return

    const tId = parseInt(tenantId)

    const tenantEntries = entries
      .filter(e => e.tenantId === tId)
      .sort((a, b) => (a.month > b.month ? 1 : -1))

    if (tenantEntries.length) {
      const lastEntry = tenantEntries[tenantEntries.length - 1]
      setRent(lastEntry.rent)
      setWater(lastEntry.water)
      setMaintenance(lastEntry.maintenance)
      setElectricity(lastEntry.electricity)
      setPreviousDue(lastEntry.due)
    } else {
      setRent('')
      setWater(300)
      setMaintenance('')
      setElectricity('')
      setPreviousDue(0)
    }
  }, [tenantId, entries, editingId])

  const calculateTotal = () =>
    Number(rent || 0) +
    Number(water || 300) +
    Number(maintenance || 0) +
    Number(electricity || 0) +
    Number(previousDue || 0)

  const calculateDue = () => {
    const total = calculateTotal()
    const p = Number(paid || 0)
    const adv = Number(advance || 0)
    if (status === 'vacating') return total - p - adv
    return total - p
  }

  const total = calculateTotal()
  const due = calculateDue()

  const handleSubmit = e => {
    e.preventDefault()

    const tenant = tenants.find(t => t.id === parseInt(tenantId))

    const newEntry = {
      id: editingId || Date.now(),
      tenantId: parseInt(tenantId),
      tenant: tenant?.name,
      building,
      room,
      month,
      rent: Number(rent || 0),
      water: Number(water || 300),
      maintenance: Number(maintenance || 0),
      electricity: Number(electricity || 0),
      previousDue,
      total,
      paid: Number(paid || 0),
      advance: Number(advance || 0),
      status,
      due,
    }

    if (editingId) {
      setEntries(prev => prev.map(e => (e.id === editingId ? newEntry : e)))
      setEditingId(null)
    } else {
      setEntries(prev => [...prev, newEntry])
    }

    handleCancel()
  }

  const handleEdit = entry => {
    setEditingId(entry.id)
    setTenantId(entry.tenantId.toString())
    setBuilding(entry.building)
    setRoom(entry.room)
    setMonth(entry.month)
    setRent(entry.rent)
    setWater(entry.water)
    setMaintenance(entry.maintenance)
    setElectricity(entry.electricity)
    setPreviousDue(entry.previousDue)
    setPaid(entry.paid)
    setAdvance(entry.advance)
    setStatus(entry.status)
  }

  const handleDelete = id => {
    if (window.confirm('Delete this entry?')) {
      setEntries(prev => prev.filter(e => e.id !== id))
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setTenantId('')
    setBuilding('')
    setRoom('')
    setMonth('')
    setRent('')
    setWater('')
    setMaintenance('')
    setElectricity('')
    setPreviousDue(0)
    setPaid('')
    setAdvance('')
    setStatus('not vacated')
  }

  // FILTER LOGIC
  const getFilteredEntries = () => {
    return entries.filter(e => {
      const [year, m] = e.month.split('-')
      return (
        (!filterRoom || e.room.includes(filterRoom)) &&
        (!filterBuilding || e.building.includes(filterBuilding)) &&
        (!filterMonth || m === filterMonth) &&
        (!filterYear || year === filterYear)
      )
    })
  }

  const filteredEntries = getFilteredEntries()

  const handlePrint = () => {
    if (!filterBuilding.trim()) {
      alert('Please enter Building name to print report')
      return
    }

    if (filteredEntries.length === 0) {
      alert('No records found')
      return
    }

    const monthDisplay = filterMonth || ''
    const yearDisplay = filterYear || ''

    const printWindow = window.open('', '', 'width=900,height=700')

    const tableRows = filteredEntries
      .map(
        (e, idx) => `
      <tr style="background:${idx % 2 === 0 ? '#fdfdfd' : '#f1f4f8'}">
        <td>${e.tenant}</td>
        <td>${e.building}</td>
        <td>${e.room}</td>
        <td>${e.month}</td>
        <td>₹ ${e.total}</td>
        <td>₹ ${e.paid}</td>
        <td>₹ ${e.due}</td>
      </tr>
    `,
      )
      .join('')

    const totalAmount = filteredEntries.reduce(
      (sum, e) => sum + Number(e.total),
      0,
    )
    const totalPaid = filteredEntries.reduce(
      (sum, e) => sum + Number(e.paid),
      0,
    )
    const totalDue = filteredEntries.reduce((sum, e) => sum + Number(e.due), 0)

    printWindow.document.open()
    printWindow.document.write(`
    <html>
      <head>
        <title>Rent Report</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin:0; padding:30px; color:#333; background:#fff; }
          .header { text-align:center; margin-bottom:15px; }
          .logo { max-width:120px; display:block; margin:0 auto 10px auto; }
          .company-name { font-size:28px; font-weight:bold; color:#2c3e50; margin-bottom:5px; }
          .report-title { font-size:20px; color:#2980b9; margin-bottom:10px; font-weight:600; }

          .info-bar { text-align:center; margin-bottom:25px; font-size:14px; color:#555; }
          .info-bar span { margin: 0 15px; }

          table { width:100%; border-collapse: collapse; font-size:14px; box-shadow: 0 3px 6px rgba(0,0,0,0.05); }
          th { background: #2980b9; color: #fff; padding:12px 8px; text-align:center; font-weight:600; }
          td { padding:10px 8px; text-align:center; border-bottom:1px solid #e0e0e0; }

          tr:nth-child(even) { background:#f9f9f9; }

          .totals { margin-top:20px; text-align:right; font-size:16px; font-weight:600; color:#2c3e50; }
          .totals span { margin-left:25px; }

          @media print {
            body { -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${
            logoBase64
              ? `<img src="${logoBase64}" class="logo" id="logoImg" />`
              : ''
          }
          
          <div class="report-title">Rent Collection Report</div>
        </div>

        <div class="info-bar">
          <span>Building: <b>${filterBuilding}</b></span>
          <span>Month: <b>${monthDisplay}</b></span>
          <span>Year: <b>${yearDisplay}</b></span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Building</th>
              <th>Room</th>
              <th>Month</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Due</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="totals">
          <span>Total Amount: ₹ ${totalAmount}</span>
          <span>Total Paid: ₹ ${totalPaid}</span>
          <span>Total Due: ₹ ${totalDue}</span>
        </div>
      </body>
    </html>
  `)

    printWindow.document.close()

    // ✅ Fix: Wait for logo to load before printing
    const triggerPrint = () => {
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }

    const waitForImage = () => {
      const img = printWindow.document.getElementById('logoImg')

      if (img) {
        if (img.complete) {
          triggerPrint()
        } else {
          img.onload = triggerPrint
          img.onerror = triggerPrint
        }
      } else {
        triggerPrint()
      }
    }

    // Small delay ensures DOM is ready
    setTimeout(waitForImage, 100)
  }

  return (
    <Layout>
      <div className='rent-page'>
        <h2>{editingId ? 'Update Rent Entry' : 'Add Rent Entry'}</h2>

        <form className='rent-form' onSubmit={handleSubmit}>
          <select
            value={tenantId}
            onChange={e => setTenantId(e.target.value)}
            required
          >
            <option value=''>Select Tenant</option>
            {tenants.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <input
            placeholder='Building'
            value={building}
            onChange={e => setBuilding(e.target.value)}
            required
          />
          <input
            placeholder='Room'
            value={room}
            onChange={e => setRoom(e.target.value)}
            required
          />

          <input
            type='month'
            value={month}
            onChange={e => setMonth(e.target.value)}
            required
          />

          <input
            type='number'
            placeholder='Rent'
            value={rent}
            onChange={e => setRent(e.target.value)}
          />
          <input
            type='number'
            placeholder='Water'
            value={water}
            onChange={e => setWater(e.target.value)}
          />
          <input
            type='number'
            placeholder='Maintenance'
            value={maintenance}
            onChange={e => setMaintenance(e.target.value)}
          />
          <input
            type='number'
            placeholder='Electricity'
            value={electricity}
            onChange={e => setElectricity(e.target.value)}
          />

          <input
            type='number'
            placeholder='Previous Due'
            value={previousDue}
            readOnly
          />

          <input
            type='number'
            placeholder='Paid'
            value={paid}
            onChange={e => setPaid(e.target.value)}
          />
          <input
            type='number'
            placeholder='Advance'
            value={advance}
            onChange={e => setAdvance(e.target.value)}
          />

          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value='not vacated'>Not Vacated</option>
            <option value='vacating'>Vacating</option>
          </select>

          <div className='rent-calculation'>
            <p>Total: {total}</p>
            <p className={due > 0 ? 'due-overdue' : 'due-refund'}>Due: {due}</p>
          </div>

          <button type='submit'>
            {editingId ? 'Update Entry' : 'Save Entry'}
          </button>
        </form>

        <h2>Filter Rent Details</h2>
        <div className='filter-box'>
          <input
            placeholder='Room'
            value={filterRoom}
            onChange={e => setFilterRoom(e.target.value)}
          />
          <input
            placeholder='Building'
            value={filterBuilding}
            onChange={e => setFilterBuilding(e.target.value)}
          />
          <input
            placeholder='Month (MM)'
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
          />
          <input
            placeholder='Year (YYYY)'
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
          />
          <button onClick={handlePrint}>Print Filtered</button>
        </div>

        <h2>Rent Records</h2>
        <div className='table-container'>
          <table>
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Building</th>
                <th>Room</th>
                <th>Month</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map(e => (
                <tr key={e.id}>
                  <td>{e.tenant}</td>
                  <td>{e.building}</td>
                  <td>{e.room}</td>
                  <td>{e.month}</td>
                  <td>{e.total}</td>
                  <td>{e.paid}</td>
                  <td className={e.due > 0 ? 'due-overdue' : 'due-refund'}>
                    {e.due}
                  </td>
                  <td>
                    <button className='edit-btn' onClick={() => handleEdit(e)}>
                      Edit
                    </button>
                    <button
                      className='delete-btn'
                      onClick={() => handleDelete(e.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}

export default RentEntry
