import {useState} from 'react'
import Layout from '../../components/Layout'
import './index.css'

const Ledger = () => {
const [records] = useState([
{
id: 1,
tenant: 'Ravi',
room: '101',
total: 8000,
paid: 7000,
due: 1000,
},
{
id: 2,
tenant: 'Suresh',
room: '201',
total: 9000,
paid: 9000,
due: 0,
},
])

return ( <Layout> <div className="ledger-container"> <h2>Tenant Ledger</h2>


    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Tenant</th>
            <th>Room</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Due</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {records.map(item => (
            <tr key={item.id}>
              <td>{item.tenant}</td>
              <td>{item.room}</td>
              <td>{item.total}</td>
              <td>{item.paid}</td>
              <td>{item.due}</td>
              <td>
                <span
                  className={
                    item.due === 0 ? 'status paid' : 'status pending'
                  }
                >
                  {item.due === 0 ? 'Paid' : 'Pending'}
                </span>
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

export default Ledger
