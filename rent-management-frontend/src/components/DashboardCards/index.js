import './index.css'
import {Bar, Pie} from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
)

const DashboardCards = () => {
  // temporary static data (later from API)
  const data = [
    {title: 'Buildings', count: 5},
    {title: 'Floors', count: 12},
    {title: 'Rooms', count: 48},
    {title: 'Tenants', count: 40},
  ]

  // Chart data
  const barData = {
    labels: data.map(item => item.title),
    datasets: [
      {
        label: 'Count',
        data: data.map(item => item.count),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        borderRadius: 6,
      },
    ],
  }

  const pieData = {
    labels: data.map(item => item.title),
    datasets: [
      {
        data: data.map(item => item.count),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        hoverOffset: 10,
      },
    ],
  }

  return (
    <div className='dashboard'>
      {/* Cards */}
      <div className='cards-container'>
        {data.map(item => (
          <div className='card' key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.count}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className='charts-container'>
        <div className='chart-card'>
          <h3>Bar Chart</h3>
          <Bar
            data={barData}
            options={{responsive: true, plugins: {legend: {display: false}}}}
          />
        </div>
        <div className='chart-card'>
          <h3>Pie Chart</h3>
          <Pie
            data={pieData}
            options={{
              responsive: true,
              plugins: {legend: {position: 'bottom'}},
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default DashboardCards
