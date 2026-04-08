import {useState} from 'react'
import Layout from '../../components/Layout'
import './index.css'

const Reports = () => {
const [building, setBuilding] = useState('')
const [month, setMonth] = useState('')

const data = [
{
id: 1,
building: 'A',
tenant: 'Ravi',
room: '101',
month: 'March',
total: 8000,
paid: 7000,
due: 1000,
},
{
id: 2,
building: 'B',
tenant: 'Suresh',
room: '201',
month: 'March',
total: 9000,
paid: 9000,
due: 0,
},
]

const filtered = data.filter(item => {
return (
(building === '' || item.building === building) &&
(month === '' || item.month === month)
)
})

const totalAmount = filtered.reduce((sum, item) => sum + item.total, 0)
const totalPaid = filtered.reduce((sum, item) => sum + item.paid, 0)
const totalDue = filtered.reduce((sum, item) => sum + item.due, 0)

const handlePrint = () => {
window.print()
}

return ( <Layout> <div className="reports-container"> <h2>Reports</h2>


    <div className="filters">
      <select value={building} onChange={e => setBuilding(e.target.value)}>
        <option value="">All Buildings</option>
        <option value="A">Building A</option>
        <option value="B">Building B</option>
      </select>

      <select value={month} onChange={e => setMonth(e.target.value)}>
        <option value="">All Months</option>
        <option value="March">March</option>
        <option value="April">April</option>
      </select>

      <button onClick={handlePrint}>Print</button>
    </div>

    <div className="summary">
      <div>Total: ₹{totalAmount}</div>
      <div>Paid: ₹{totalPaid}</div>
      <div>Due: ₹{totalDue}</div>
    </div>

    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Building</th>
            <th>Tenant</th>
            <th>Room</th>
            <th>Month</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Due</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map(item => (
            <tr key={item.id}>
              <td>{item.building}</td>
              <td>{item.tenant}</td>
              <td>{item.room}</td>
              <td>{item.month}</td>
              <td>{item.total}</td>
              <td>{item.paid}</td>
              <td>{item.due}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</Layout>


)
}

export default Reports
