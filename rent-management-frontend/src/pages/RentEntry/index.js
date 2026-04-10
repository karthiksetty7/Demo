import { useState, useEffect, useCallback } from 'react'
import Layout from '../../components/Layout'
import './index.css'

const BASE_URL = 'https://demo-production-bf0f.up.railway.app/api'

const RentEntry = () => {
  const [tenants, setTenants] = useState([])
  const [entries, setEntries] = useState([])

  const [buildings, setBuildings] = useState([])
  const [rooms, setRooms] = useState([])

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

  const [editingId, setEditingId] = useState(null)

  const [filterRoom, setFilterRoom] = useState('')
  const [filterBuilding, setFilterBuilding] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear, setFilterYear] = useState('')

  const getToken = () => localStorage.getItem('token')

  /* ================= FETCH TENANTS ================= */
  useEffect(() => {
    const fetchTenants = async () => {
      const res = await fetch(`${BASE_URL}/tenants/getTenants`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      setTenants(Array.isArray(data) ? data : [])
    }
    fetchTenants()
  }, [])

  /* ================= FETCH BUILDINGS & ROOMS ================= */
  useEffect(() => {
    const fetchBuildings = async () => {
      const res = await fetch(`${BASE_URL}/buildings/getBuildings`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      setBuildings(Array.isArray(data) ? data : [])
    }
    fetchBuildings()

    const fetchRooms = async () => {
      const res = await fetch(`${BASE_URL}/rooms/getRooms`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      setRooms(Array.isArray(data) ? data : [])
    }
    fetchRooms()
  }, [])

  /* ================= FETCH ENTRIES (FIXED ESLINT WARNING) ================= */
  const fetchEntries = useCallback(async () => {
    const res = await fetch(`${BASE_URL}/rent/getRentEntries`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    const data = await res.json()
    setEntries(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  /* ================= AUTO FILL FROM LAST ENTRY ================= */
  useEffect(() => {
    if (!tenantId || editingId) return

    const tenantEntries = entries
      .filter(e => e.tenant_id === parseInt(tenantId))
      .sort((a, b) => new Date(a.month) - new Date(b.month))

    if (tenantEntries.length > 0) {
      const last = tenantEntries[tenantEntries.length - 1]

      setBuilding(last.building || '')
      setRoom(last.room || '')
      setRent(last.rent || '')
      setWater(last.water || 300)
      setMaintenance(last.maintenance || '')
      setElectricity(last.electricity || '')
      setPreviousDue(Number(last.due || 0))
    } else {
      setBuilding('')
      setRoom('')
      setRent('')
      setWater(300)
      setMaintenance('')
      setElectricity('')
      setPreviousDue(0)
    }
  }, [tenantId, entries, editingId])

  /* ================= CALCULATIONS ================= */
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

  /* ================= SAVE ================= */
  const handleSubmit = async e => {
    e.preventDefault()

    const payload = {
      tenant_id: tenantId,
      building,
      room,
      month,
      rent,
      water,
      maintenance,
      electricity,
      previous_due: previousDue,
      total,
      paid,
      advance,
      status,
      due,
    }

    if (editingId) {
      await fetch(`${BASE_URL}/rent/updateRentEntry/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch(`${BASE_URL}/rent/createRentEntry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      })
    }

    fetchEntries()
    handleCancel()
  }

  /* ================= EDIT ================= */
  const handleEdit = entry => {
    setEditingId(entry.id)
    setTenantId(entry.tenant_id.toString())
    setBuilding(entry.building)
    setRoom(entry.room)
    setMonth(entry.month)
    setRent(entry.rent)
    setWater(entry.water)
    setMaintenance(entry.maintenance)
    setElectricity(entry.electricity)
    setPreviousDue(entry.previous_due)
    setPaid(entry.paid)
    setAdvance(entry.advance)
    setStatus(entry.status)
  }

  /* ================= DELETE ================= */
  const handleDelete = async id => {
    if (!window.confirm('Delete this entry?')) return

    await fetch(`${BASE_URL}/rent/deleteRentEntry/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    })

    fetchEntries()
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

  /* ================= FILTER OPTIONS ================= */
  const buildingOptions = buildings.map(b => b.name)
  const roomOptions = rooms.map(r => r.room_number)
  const monthOptions = [...new Set(entries.map(e => e.month.split('-')[1]))]
  const yearOptions = [...new Set(entries.map(e => e.month.split('-')[0]))]

  const filteredEntries = entries.filter(e => {
    const [year, m] = e.month.split('-')
    return (
      (!filterRoom || e.room === filterRoom) &&
      (!filterBuilding || e.building === filterBuilding) &&
      (!filterMonth || m === filterMonth) &&
      (!filterYear || year === filterYear)
    )
  })

  return (
    <Layout>
      <div className='rent-page'>
        <h2>{editingId ? 'Update Rent Entry' : 'Add Rent Entry'}</h2>

        <form className='rent-form' onSubmit={handleSubmit}>
          <select value={tenantId} onChange={e => setTenantId(e.target.value)} required>
            <option value=''>Select Tenant</option>
            {tenants.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select value={building} onChange={e => setBuilding(e.target.value)} required>
            <option value=''>Select Building</option>
            {buildingOptions.map((b, i) => (
              <option key={i} value={b}>{b}</option>
            ))}
          </select>

          <select value={room} onChange={e => setRoom(e.target.value)} required>
            <option value=''>Select Room</option>
            {roomOptions.map((r, i) => (
              <option key={i} value={r}>{r}</option>
            ))}
          </select>

          <input type='month' value={month} onChange={e => setMonth(e.target.value)} required />

          <input type='number' placeholder='Rent' value={rent} onChange={e => setRent(e.target.value)} />
          <input type='number' placeholder='Water' value={water} onChange={e => setWater(e.target.value)} />
          <input type='number' placeholder='Maintenance' value={maintenance} onChange={e => setMaintenance(e.target.value)} />
          <input type='number' placeholder='Electricity' value={electricity} onChange={e => setElectricity(e.target.value)} />

          <input type='number' placeholder='Previous Due' value={previousDue} readOnly />

          <input type='number' placeholder='Paid' value={paid} onChange={e => setPaid(e.target.value)} />
          <input type='number' placeholder='Advance' value={advance} onChange={e => setAdvance(e.target.value)} />

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
          <select value={filterBuilding} onChange={e => setFilterBuilding(e.target.value)}>
            <option value=''>All Buildings</option>
            {buildingOptions.map((b, i) => (
              <option key={i} value={b}>{b}</option>
            ))}
          </select>

          <select value={filterRoom} onChange={e => setFilterRoom(e.target.value)}>
            <option value=''>All Rooms</option>
            {roomOptions.map((r, i) => (
              <option key={i} value={r}>{r}</option>
            ))}
          </select>

          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
            <option value=''>All Months</option>
            {monthOptions.map((m, i) => (
              <option key={i} value={m}>{m}</option>
            ))}
          </select>

          <select value={filterYear} onChange={e => setFilterYear(e.target.value)}>
            <option value=''>All Years</option>
            {yearOptions.map((y, i) => (
              <option key={i} value={y}>{y}</option>
            ))}
          </select>
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
                  <td>{e.tenant?.name}</td>
                  <td>{e.building}</td>
                  <td>{e.room}</td>
                  <td>{e.month}</td>
                  <td>{e.total}</td>
                  <td>{e.paid}</td>
                  <td className={e.due > 0 ? 'due-overdue' : 'due-refund'}>
                    {e.due}
                  </td>
                  <td>
                    <button className='edit-btn' onClick={() => handleEdit(e)}>Edit</button>
                    <button className='delete-btn' onClick={() => handleDelete(e.id)}>Delete</button>
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
