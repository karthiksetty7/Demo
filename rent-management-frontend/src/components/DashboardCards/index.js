import { useEffect, useState } from "react";
import './index.css'
import { Bar, Pie } from 'react-chartjs-2'
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
import { apiRequest } from "../../utils/api"
import { useNavigate } from "react-router-dom"

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
  const navigate = useNavigate();

  const [counts, setCounts] = useState({
    buildings: 0,
    floors: 0,
    rooms: 0,
    tenants: 0,
  });

  // ✅ FETCH DATA FROM BACKEND
  useEffect(() => {
    const fetchData = async () => {
      const buildings = await apiRequest({
        endpoint: "/buildings/getBuildings",
        method: "GET",
        navigate,
      });

      const floors = await apiRequest({
        endpoint: "/floors/getFloors",
        method: "GET",
        navigate,
      });

      const rooms = await apiRequest({
        endpoint: "/rooms/getRooms",
        method: "GET",
        navigate,
      });

      const tenants = await apiRequest({
        endpoint: "/tenants/getTenants",
        method: "GET",
        navigate,
      });

      setCounts({
        buildings: Array.isArray(buildings) ? buildings.length : buildings?.data?.length || 0,
        floors: Array.isArray(floors) ? floors.length : floors?.data?.length || 0,
        rooms: Array.isArray(rooms) ? rooms.length : rooms?.data?.length || 0,
        tenants: Array.isArray(tenants) ? tenants.length : tenants?.data?.length || 0,
      });
    };

    fetchData();
  }, [navigate]);

  // Chart data
  const data = [
    { title: 'Buildings', count: counts.buildings },
    { title: 'Floors', count: counts.floors },
    { title: 'Rooms', count: counts.rooms },
    { title: 'Tenants', count: counts.tenants },
  ];

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
  };

  const pieData = {
    labels: data.map(item => item.title),
    datasets: [
      {
        data: data.map(item => item.count),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        hoverOffset: 10,
      },
    ],
  };

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
            options={{ responsive: true, plugins: { legend: { display: false } } }}
          />
        </div>

        <div className='chart-card'>
          <h3>Pie Chart</h3>
          <Pie
            data={pieData}
            options={{
              responsive: true,
              plugins: { legend: { position: 'bottom' } },
            }}
          />
        </div>
      </div>

    </div>
  );
};

export default DashboardCards;