import {useState} from 'react'
import Layout from '../../components/Layout'
import './index.css'

const Rooms = () => {
  const [buildings] = useState([
    {id: 1, name: 'Sai Residency'},
    {id: 2, name: 'Lakshmi Towers'},
  ])

  const [floors] = useState([
    {id: 1, buildingId: 1, name: 'Ground'},
    {id: 2, buildingId: 1, name: 'Floor 1'},
    {id: 3, buildingId: 2, name: 'Floor 1'},
  ])

  const [buildingId, setBuildingId] = useState('')
  const [floorId, setFloorId] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [rooms, setRooms] = useState([])
  const [editId, setEditId] = useState(null)

  const filteredFloors = floors.filter(
    floor => floor.buildingId === parseInt(buildingId),
  )

  const handleSubmit = e => {
    e.preventDefault()

    const building = buildings.find(b => b.id === parseInt(buildingId))
    const floor = floors.find(f => f.id === parseInt(floorId))

    if (!building || !floor) return

    const newRoom = {
      id: editId || Date.now(),
      buildingId: parseInt(buildingId),
      floorId: parseInt(floorId),
      buildingName: building.name,
      floorName: floor.name,
      roomNumber,
    }

    if (editId) {
      setRooms(prev => prev.map(r => (r.id === editId ? newRoom : r)))
      setEditId(null)
    } else {
      setRooms(prev => [...prev, newRoom])
    }

    handleCancel()
  }

  const handleEdit = room => {
    setEditId(room.id)
    setBuildingId(room.buildingId.toString())
    setFloorId(room.floorId.toString())
    setRoomNumber(room.roomNumber)
  }

  const handleDelete = id => {
    if (window.confirm('Delete this room?')) {
      setRooms(prev => prev.filter(r => r.id !== id))
    }
  }

  const handleCancel = () => {
    setEditId(null)
    setBuildingId('')
    setFloorId('')
    setRoomNumber('')
  }

  return (
    <Layout>
      <div className='room-container'>
        <h2>{editId ? 'Update Room' : 'Add Room'}</h2>

        <form className='room-form' onSubmit={handleSubmit}>
          <select
            value={buildingId}
            onChange={e => {
              setBuildingId(e.target.value)
              setFloorId('') // reset floor when building changes
            }}
            required
          >
            <option value=''>Select Building</option>
            {buildings.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <select
            value={floorId}
            onChange={e => setFloorId(e.target.value)}
            required
          >
            <option value=''>Select Floor</option>
            {filteredFloors.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <input
            type='text'
            placeholder='Room Number'
            value={roomNumber}
            onChange={e => setRoomNumber(e.target.value)}
            required
          />

          <button type='submit'>{editId ? 'Update Room' : 'Save Room'}</button>

          {editId && (
            <button type='button' className='cancel-btn' onClick={handleCancel}>
              Cancel
            </button>
          )}
        </form>

        <h2>Rooms List</h2>

        {/* Desktop Table */}
        <div className='table-container desktop-table'>
          <table>
            <thead>
              <tr>
                <th>Building</th>
                <th>Floor</th>
                <th>Room</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(item => (
                <tr key={item.id}>
                  <td>{item.buildingName}</td>
                  <td>{item.floorName}</td>
                  <td>{item.roomNumber}</td>
                  <td>
                    <button
                      className='edit-btn'
                      onClick={() => handleEdit(item)}
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

        {/* Mobile View */}
        <div className='mobile-list'>
          {rooms.map(item => (
            <div key={item.id} className='mobile-row'>
              <div className='mobile-field'>
                <span className='label'>Building:</span>
                <span className='value'>{item.buildingName}</span>
              </div>

              <div className='mobile-field'>
                <span className='label'>Floor:</span>
                <span className='value'>{item.floorName}</span>
              </div>

              <div className='mobile-field'>
                <span className='label'>Room:</span>
                <span className='value'>{item.roomNumber}</span>
              </div>

              <div className='mobile-field'>
                <button className='edit-btn' onClick={() => handleEdit(item)}>
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

export default Rooms
