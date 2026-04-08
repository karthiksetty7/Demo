import {useState, useEffect} from 'react'
import Layout from '../../components/Layout'
import './index.css'

const Bills = () => {
  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('billRecords')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('billRecords', JSON.stringify(records))
  }, [records])

  // LOGO BASE64
  const [logoBase64, setLogoBase64] = useState('')

  useEffect(() => {
    fetch('/SettyRents.png')
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setLogoBase64(reader.result)
        }
        reader.readAsDataURL(blob)
      })
  }, [])

  const [tenantName, setTenantName] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [floor, setFloor] = useState('')
  const [buildingName, setBuildingName] = useState('')
  const [previous, setPrevious] = useState('')
  const [current, setCurrent] = useState('')
  const [units, setUnits] = useState('')
  const [rate, setRate] = useState('')
  const [amount, setAmount] = useState(0)
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')

  const [filterTenant, setFilterTenant] = useState('')
  const [filterRoom, setFilterRoom] = useState('')
  const [filterBuilding, setFilterBuilding] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear, setFilterYear] = useState('')

  useEffect(() => {
    if (previous !== '' && current !== '') {
      const calculatedUnits = Number(current) - Number(previous)
      const finalUnits = calculatedUnits >= 0 ? calculatedUnits : 0
      setUnits(finalUnits)

      if (rate !== '') {
        setAmount(finalUnits * Number(rate))
      } else {
        setAmount(0)
      }
    }
  }, [previous, current, rate])

  const handleSubmit = e => {
    e.preventDefault()

    const newRecord = {
      id: Date.now(),
      tenantName,
      room: roomNumber,
      floor,
      buildingName,
      previous,
      current,
      units,
      rate,
      amount,
      month,
      year,
    }

    setRecords([...records, newRecord])

    setTenantName('')
    setRoomNumber('')
    setFloor('')
    setBuildingName('')
    setPrevious('')
    setCurrent('')
    setUnits('')
    setRate('')
    setAmount(0)
    setMonth('')
    setYear('')
  }

  const handleEdit = id => {
    const record = records.find(r => r.id === id)
    if (!record) return

    setTenantName(record.tenantName)
    setRoomNumber(record.room)
    setFloor(record.floor)
    setBuildingName(record.buildingName)
    setPrevious(record.previous)
    setCurrent(record.current)
    setUnits(record.units)
    setRate(record.rate)
    setAmount(record.amount)
    setMonth(record.month)
    setYear(record.year)

    setRecords(records.filter(r => r.id !== id))
  }

  const handleDelete = id => {
    if (!window.confirm('Delete this bill?')) return
    setRecords(records.filter(r => r.id !== id))
  }

  const generatePrintHTML = records => {
    return (
      `
<html>
<head>
<title>Electricity Bills</title>
<style>
body {
  font-family: Arial, sans-serif;
  margin:0;
  padding:0;
}

.page {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  page-break-after: always;
}

.invoice {
  border:2px solid #000;
  padding:20px;
  margin-bottom:15px;
  width:100%;
  box-sizing:border-box;
}

.logo-container {
  text-align:center;
  margin-bottom:8px;
}

.logo {
  max-width:120px;
}

h2 {
  text-align:center;
  margin:5px 0 12px;
  font-size:18px;
}

table {
  width:100%;
  border-collapse:collapse;
  margin-top:10px;
  font-size:14px;
}

th, td {
  border:1px solid #000;
  padding:8px;
  text-align:left;
}

th {
  background:#f2f2f2;
}

.info-table td {
  width:25%;
}

.total-table {
  margin-top:15px;
  width:100%;
  border-collapse:collapse;
  font-size:15px;
}

.total-table td {
  border:none;
  font-weight:bold;
  padding:8px 4px;
}

.total-label {
  text-align:left;
}

.total-value {
  text-align:right;
  font-size:16px;
}

@media print {
  .page {
    page-break-after: always;
  }
}
</style>
</head>
<body>
` +
      records
        .map((record, index) => {
          const isPageStart = index % 2 === 0
          const isPageEnd = index % 2 === 1

          return `
${isPageStart ? `<div class="page">` : ``}

<div class="invoice">

<div class="logo-container">
<img src="${logoBase64}" class="logo"/>
</div>

<h2>Electricity Bill</h2>

<table class="info-table">
<tr>
<th>Tenant</th>
<td>${record.tenantName}</td>
<th>Room</th>
<td>${record.room}</td>
</tr>
<tr>
<th>Floor</th>
<td>${record.floor}</td>
<th>Building</th>
<td>${record.buildingName}</td>
</tr>
<tr>
<th>Month</th>
<td>${record.month}</td>
<th>Year</th>
<td>${record.year}</td>
</tr>
</table>

<table>
<thead>
<tr>
<th>Previous</th>
<th>Current</th>
<th>Units</th>
<th>Rate</th>
<th>Amount</th>
</tr>
</thead>
<tbody>
<tr>
<td>${record.previous}</td>
<td>${record.current}</td>
<td>${record.units}</td>
<td>${record.rate}</td>
<td>₹ ${record.amount}</td>
</tr>
</tbody>
</table>

<table class="total-table">
<tr>
<td class="total-label">Total Payable</td>
<td class="total-value">₹ ${record.amount}</td>
</tr>
</table>

</div>

${isPageEnd || index === records.length - 1 ? `</div>` : ``}
`
        })
        .join('') +
      `
<script>
window.onload = () => {
setTimeout(() => window.print(), 300);
}
</script>
</body>
</html>
`
    )
  }

  const filteredRecords = records.filter(
    r =>
      (filterTenant
        ? r.tenantName.toLowerCase().includes(filterTenant.toLowerCase())
        : true) &&
      (filterRoom
        ? r.room.toLowerCase().includes(filterRoom.toLowerCase())
        : true) &&
      (filterBuilding
        ? r.buildingName.toLowerCase().includes(filterBuilding.toLowerCase())
        : true) &&
      (filterMonth ? r.month === filterMonth : true) &&
      (filterYear ? r.year.toString() === filterYear.toString() : true),
  )

  // Print all filtered records
  const handlePrintAll = () => {
    const printWindow = window.open('', '', 'height=700,width=900')
    printWindow.document.write(generatePrintHTML(filteredRecords))
    printWindow.document.close()
  }

  return (
    <Layout>
      <div className='bill-container'>
        <h2>Electricity Bills</h2>

        <form className='bill-form' onSubmit={handleSubmit}>
          <input
            placeholder='Tenant Name'
            value={tenantName}
            onChange={e => setTenantName(e.target.value)}
            required
          />
          <input
            placeholder='Room Number'
            value={roomNumber}
            onChange={e => setRoomNumber(e.target.value)}
            required
          />
          <input
            placeholder='Floor'
            value={floor}
            onChange={e => setFloor(e.target.value)}
            required
          />
          <input
            placeholder='Building Name'
            value={buildingName}
            onChange={e => setBuildingName(e.target.value)}
            required
          />
          <input
            type='number'
            placeholder='Previous'
            value={previous}
            onChange={e => setPrevious(e.target.value)}
            required
          />
          <input
            type='number'
            placeholder='Current'
            value={current}
            onChange={e => setCurrent(e.target.value)}
            required
          />
          <input type='number' placeholder='Units' value={units} readOnly />
          <input
            type='number'
            placeholder='Rate'
            value={rate}
            onChange={e => setRate(e.target.value)}
            required
          />
          <input type='number' placeholder='Amount' value={amount} readOnly />
          <input
            placeholder='Month'
            value={month}
            onChange={e => setMonth(e.target.value)}
            required
          />
          <input
            placeholder='Year'
            value={year}
            onChange={e => setYear(e.target.value)}
            required
          />
          <button type='submit'>Save Bill</button>
        </form>

        <h3>Filter Bills</h3>
        <div className='filter-container'>
          <input
            placeholder='Tenant'
            value={filterTenant}
            onChange={e => setFilterTenant(e.target.value)}
          />
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
            placeholder='Month'
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
          />
          <input
            placeholder='Year'
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
          />
          <button onClick={handlePrintAll}>Print Filtered</button>
        </div>

        <div className='table-container'>
          <table>
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Room</th>
                <th>Floor</th>
                <th>Building</th>
                <th>Units</th>
                <th>Amount</th>
                <th>Month</th>
                <th>Year</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(item => (
                <tr key={item.id}>
                  <td>{item.tenantName}</td>
                  <td>{item.room}</td>
                  <td>{item.floor}</td>
                  <td>{item.buildingName}</td>
                  <td>{item.units}</td>
                  <td>{item.amount}</td>
                  <td>{item.month}</td>
                  <td>{item.year}</td>
                  <td>
                    <button
                      className='edit-btn'
                      onClick={() => handleEdit(item.id)}
                    >
                      Edit
                    </button>
                    <button
                      className='delete-btn'
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='mobile-list'>
          {filteredRecords.map(item => (
            <div className='mobile-row' key={item.id}>
              <div className='mobile-field'>
                <span className='label'>Tenant</span>
                <span>{item.tenantName}</span>
              </div>
              <div className='mobile-field'>
                <span className='label'>Room</span>
                <span>{item.room}</span>
              </div>
              <div className='mobile-field'>
                <span className='label'>Floor</span>
                <span>{item.floor}</span>
              </div>
              <div className='mobile-field'>
                <span className='label'>Building</span>
                <span>{item.buildingName}</span>
              </div>
              <div className='mobile-field'>
                <span className='label'>Units</span>
                <span>{item.units}</span>
              </div>
              <div className='mobile-field'>
                <span className='label'>Amount</span>
                <span>₹ {item.amount}</span>
              </div>
              <div className='mobile-field'>
                <span className='label'>Month</span>
                <span>{item.month}</span>
              </div>
              <div className='mobile-field'>
                <span className='label'>Year</span>
                <span>{item.year}</span>
              </div>

              <div className='mobile-actions'>
                <button
                  className='edit-btn'
                  onClick={() => handleEdit(item.id)}
                >
                  Edit
                </button>
                <button
                  className='delete-btn'
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default Bills
