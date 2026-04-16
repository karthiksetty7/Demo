import {Routes, Route} from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Buildings from './pages/Buildings'
import Floors from './pages/Floors'
import Rooms from './pages/Rooms'
import Tenants from './pages/Tenants'
import RentEntry from './pages/RentEntry'
import Bills from './pages/Bills'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route exact path='/' element={<Login />} />

      <Route
        path='/dashboard'
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path='/buildings'
        element={
          <ProtectedRoute>
            <Buildings />
          </ProtectedRoute>
        }
      />

      <Route
        path='/floors'
        element={
          <ProtectedRoute>
            <Floors />
          </ProtectedRoute>
        }
      />

      <Route
        path='/rooms'
        element={
          <ProtectedRoute>
            <Rooms />
          </ProtectedRoute>
        }
      />

      <Route
        path='/tenants'
        element={
          <ProtectedRoute>
            <Tenants />
          </ProtectedRoute>
        }
      />

      <Route
        path='/rent-entry'
        element={
          <ProtectedRoute>
            <RentEntry />
          </ProtectedRoute>
        }
      />

      <Route
        path='/bills'
        element={
          <ProtectedRoute>
            <Bills />
          </ProtectedRoute>
        }
      />

    </Routes>
  )
}

export default App
