import {useState} from 'react'
import Layout from '../../components/Layout'
import './index.css'

const Buildings = () => {
  const [buildingName, setBuildingName] = useState('')
  const [address, setAddress] = useState('')
  const [buildings, setBuildings] = useState([])
  const [editId, setEditId] = useState(null)

  const handleSubmit = e => {
    e.preventDefault()

    if (!buildingName || !address) {
      alert('Please provide building name and address')
      return
    }

    if (editId) {
      setBuildings(
        buildings.map(b =>
          b.id === editId ? {...b, buildingName, address} : b,
        ),
      )
      setEditId(null)
    } else {
      const newBuilding = {
        id: Date.now(),
        buildingName,
        address,
      }
      setBuildings([...buildings, newBuilding])
    }

    setBuildingName('')
    setAddress('')
  }

  const handleEdit = building => {
    setBuildingName(building.buildingName)
    setAddress(building.address)
    setEditId(building.id)
  }

  const handleDelete = id => {
    if (window.confirm('Delete this building?')) {
      setBuildings(prev => prev.filter(b => b.id !== id))
    }
  }

  const handleCancel = () => {
    setEditId(null)
    setBuildingName('')
    setAddress('')
  }

  return (
    <Layout>
      <div className='building-container'>
        <h2>{editId ? 'Update Building' : 'Add Building'}</h2>

        <form className='building-form' onSubmit={handleSubmit}>
          <input
            type='text'
            placeholder='Building Name'
            value={buildingName}
            onChange={e => setBuildingName(e.target.value)}
            required
          />
          <input
            type='text'
            placeholder='Address'
            value={address}
            onChange={e => setAddress(e.target.value)}
            required
          />

          <button type='submit'>
            {editId ? 'Update Building' : 'Save Building'}
          </button>

          {editId && (
            <button type='button' className='cancel-btn' onClick={handleCancel}>
              Cancel
            </button>
          )}
        </form>

        <h2>Buildings List</h2>

        {/* Desktop Table */}
        <div className='table-container desktop-table'>
          <table>
            <thead>
              <tr>
                <th>Building Name</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {buildings.map(item => (
                <tr key={item.id}>
                  <td>{item.buildingName}</td>
                  <td>{item.address}</td>
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
          {buildings.map(item => (
            <div key={item.id} className='mobile-row'>
              <div className='mobile-field'>
                <span className='label'>Building:</span>
                <span className='value'>{item.buildingName}</span>
              </div>

              <div className='mobile-field'>
                <span className='label'>Address:</span>
                <span className='value'>{item.address}</span>
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

export default Buildings
