import {useState} from 'react'
import Layout from '../../components/Layout'
import './index.css'

const Floors = () => {
  const [buildings] = useState([
    {id: 1, name: 'Sai Residency'},
    {id: 2, name: 'Lakshmi Towers'},
  ])

  const [buildingId, setBuildingId] = useState('')
  const [floorName, setFloorName] = useState('')
  const [floors, setFloors] = useState([])
  const [editId, setEditId] = useState(null)

  const handleSubmit = e => {
    e.preventDefault()

    const selectedBuilding = buildings.find(b => b.id === parseInt(buildingId))

    if (!selectedBuilding) return

    const newFloor = {
      id: editId || Date.now(),
      buildingId: parseInt(buildingId),
      buildingName: selectedBuilding.name,
      floorName,
    }

    if (editId) {
      setFloors(prev => prev.map(f => (f.id === editId ? newFloor : f)))
      setEditId(null)
    } else {
      setFloors(prev => [...prev, newFloor])
    }

    handleCancel()
  }

  const handleEdit = floor => {
    setEditId(floor.id)
    setBuildingId(floor.buildingId.toString())
    setFloorName(floor.floorName)
  }

  const handleDelete = id => {
    if (window.confirm('Delete this floor?')) {
      setFloors(prev => prev.filter(f => f.id !== id))
    }
  }

  const handleCancel = () => {
    setEditId(null)
    setBuildingId('')
    setFloorName('')
  }

  return (
    <Layout>
      <div className='floor-container'>
        <h2>{editId ? 'Update Floor' : 'Add Floor'}</h2>

        <form className='floor-form' onSubmit={handleSubmit}>
          <select
            value={buildingId}
            onChange={e => setBuildingId(e.target.value)}
            required
          >
            <option value=''>Select Building</option>
            {buildings.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <input
            type='text'
            placeholder='Floor Name (Ex: Ground, Floor 1)'
            value={floorName}
            onChange={e => setFloorName(e.target.value)}
            required
          />

          <button type='submit'>
            {editId ? 'Update Floor' : 'Save Floor'}
          </button>

          {editId && (
            <button type='button' className='cancel-btn' onClick={handleCancel}>
              Cancel
            </button>
          )}
        </form>

        <h2>Floors List</h2>

        {/* Desktop Table */}
        <div className='table-container desktop-table'>
          <table>
            <thead>
              <tr>
                <th>Building</th>
                <th>Floor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {floors.map(item => (
                <tr key={item.id}>
                  <td>{item.buildingName}</td>
                  <td>{item.floorName}</td>
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
          {floors.map(item => (
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

export default Floors
