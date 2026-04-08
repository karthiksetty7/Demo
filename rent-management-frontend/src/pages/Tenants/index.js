import {useState, useRef, useEffect} from 'react'
import Layout from '../../components/Layout'
import './index.css'

const Tenants = () => {
  const [buildings] = useState([
    {id: 1, name: 'Sai Residency'},
    {id: 2, name: 'Lakshmi Towers'},
  ])

  const [floors] = useState([
    {id: 1, buildingId: 1, name: 'Ground'},
    {id: 2, buildingId: 1, name: 'Floor 1'},
    {id: 3, buildingId: 2, name: 'Floor 1'},
  ])

  const [rooms] = useState([
    {id: 1, floorId: 1, buildingId: 1, number: '101'},
    {id: 2, floorId: 2, buildingId: 1, number: '201'},
    {id: 3, floorId: 3, buildingId: 2, number: '301'},
  ])

  const [buildingId, setBuildingId] = useState('')
  const [floorId, setFloorId] = useState('')
  const [roomId, setRoomId] = useState('')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [advance, setAdvance] = useState('')
  const [joiningDate, setJoiningDate] = useState('')
  const [files, setFiles] = useState([])

  const [tenants, setTenants] = useState([])
  const [editingId, setEditingId] = useState(null)

  const [filterName, setFilterName] = useState('')
  const [filterRoom, setFilterRoom] = useState('')
  const [filterBuilding, setFilterBuilding] = useState('')

  const fileInputRef = useRef(null)

  const filteredFloors = floors.filter(
    f => f.buildingId === parseInt(buildingId),
  )
  const filteredRooms = rooms.filter(
    r =>
      r.buildingId === parseInt(buildingId) && r.floorId === parseInt(floorId),
  )

  useEffect(() => {
    const stored = localStorage.getItem('tenants')
    if (stored) setTenants(JSON.parse(stored))
  }, [])

  useEffect(() => {
    localStorage.setItem('tenants', JSON.stringify(tenants))
  }, [tenants])

  const filteredTenants = tenants.filter(
    t =>
      t.name.toLowerCase().includes(filterName.toLowerCase()) &&
      t.room.toLowerCase().includes(filterRoom.toLowerCase()) &&
      t.building.toLowerCase().includes(filterBuilding.toLowerCase()),
  )

  const handleFileChange = e => {
    const selectedFiles = Array.from(e.target.files)
    const validFiles = selectedFiles.filter(f =>
      ['image/png', 'image/jpeg', 'image/jpg'].includes(f.type),
    )
    setFiles(validFiles)
  }

  const handleSubmit = e => {
    e.preventDefault()
    const building = buildings.find(b => b.id === parseInt(buildingId))
    const floor = floors.find(f => f.id === parseInt(floorId))
    const room = rooms.find(r => r.id === parseInt(roomId))

    const filesData = files.map(f => ({
      url: URL.createObjectURL(f),
      type: f.type,
    }))

    if (editingId) {
      setTenants(prev =>
        prev.map(t =>
          t.id === editingId
            ? {
                ...t,
                name,
                phone,
                advance,
                joiningDate,
                building: building?.name,
                floor: floor?.name,
                room: room?.number,
                files: filesData.length ? filesData : t.files,
              }
            : t,
        ),
      )
      setEditingId(null)
    } else {
      setTenants(prev => [
        ...prev,
        {
          id: Date.now(),
          name,
          phone,
          advance,
          joiningDate,
          building: building?.name,
          floor: floor?.name,
          room: room?.number,
          files: filesData,
        },
      ])
    }

    handleCancel()
  }

  const handleEdit = tenant => {
    setEditingId(tenant.id)
    setName(tenant.name)
    setPhone(tenant.phone)
    setAdvance(tenant.advance)
    setJoiningDate(tenant.joiningDate)

    const buildingObj = buildings.find(b => b.name === tenant.building)
    setBuildingId(buildingObj?.id || '')

    const floorObj = floors.find(
      f => f.name === tenant.floor && f.buildingId === buildingObj?.id,
    )
    setFloorId(floorObj?.id || '')

    const roomObj = rooms.find(
      r =>
        r.number === tenant.room &&
        r.buildingId === buildingObj?.id &&
        r.floorId === floorObj?.id,
    )
    setRoomId(roomObj?.id || '')

    if (fileInputRef.current) fileInputRef.current.value = ''
    setFiles([])
  }

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      setTenants(prev => prev.filter(t => t.id !== id))
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setName('')
    setPhone('')
    setAdvance('')
    setJoiningDate('')
    setBuildingId('')
    setFloorId('')
    setRoomId('')
    setFiles([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // shared styles
  const printStyles = `
<style>
  body { font-family: Arial, sans-serif; margin:0; padding:0; }

  .page {
    page-break-after: always;
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
  }

  .page-border {
    border:2px solid #000;
    width:95%;
    height:95%;
    box-sizing:border-box;
    padding:30px;
    display:flex;
    flex-direction:column;
  }

  .invoice {
    width:100%;
    height:100%;
    display:flex;
    flex-direction:column;
  }

  .header {
    display:flex;
    align-items:center;
    gap:20px;
    margin-bottom:40px;
  }

  .logo { max-width:120px; }

  h2 { font-size:28px; margin:0; }

  table {
    width:100%;
    border-collapse:collapse;
    font-size:24px;
    flex-grow:1;
  }

  th, td {
    border:1px solid #000;
    padding:20px;
    text-align:left;
    vertical-align:middle;
  }

  th {
    width:30%;
    background:#f2f2f2;
    font-weight:bold;
  }

  td { width:70%; }

  .full-page {
    width:100%;
    page-break-after:always;
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
  }

  .full-page img, .full-page embed {
    width:95%;
    max-height:95vh;
    object-fit:contain;
    border:2px solid #000;
    padding:10px;
    box-sizing:border-box;
  }
</style>
`

  // generate tenant HTML (ORDER FIXED)
  const generateTenantHTML = tenant => {
    const filesHtml = tenant.files
      ? tenant.files
          .map(
            f => `
      <div class="full-page">
        ${
          f.type.includes('image')
            ? `<img src="${f.url}" />`
            : `<embed src="${f.url}" type="${f.type}" />`
        }
      </div>
    `,
          )
          .join('')
      : ''

    return `
    <div class="page">
      <div class="page-border">
        <div class="invoice">
          <div class="header">
            <img src="${window.location.origin}/SettyRents.png" class="logo" />
            <h2>Tenant Details</h2>
          </div>
          <table>
            <tr><th>Name</th><td>${tenant.name}</td></tr>
            <tr><th>Phone</th><td>${tenant.phone}</td></tr>
            <tr><th>Building</th><td>${tenant.building}</td></tr>
            <tr><th>Floor</th><td>${tenant.floor}</td></tr>
            <tr><th>Room</th><td>${tenant.room}</td></tr>
            <tr><th>Advance</th><td>${tenant.advance}</td></tr>
            <tr><th>Joining Date</th><td>${tenant.joiningDate}</td></tr>
          </table>
        </div>
      </div>
    </div>

    ${filesHtml}
  `
  }

  // PRINT ALL (ORDER SAFE)
  const printAll = () => {
    if (!filterBuilding.trim()) {
      alert('Building is mandatory to print filtered tenants')
      return
    }

    const printWindow = window.open('', '_blank')

    if (!printWindow) {
      alert('Popup blocked! Allow popups.')
      return
    }

    const content = filteredTenants
      .map(tenant => generateTenantHTML(tenant))
      .join('')

    printWindow.document.write(`
    <html>
      <head>
        <title>All Tenants</title>
        ${printStyles}
      </head>
      <body>
        ${content}
        <script>
          setTimeout(()=>{ window.print(); window.close(); }, 300)
        </script>
      </body>
    </html>
  `)

    printWindow.document.close()
  }

  return (
    <Layout>
      <div className='tenant-container'>
        <h2>{editingId ? 'Edit Tenant' : 'Add Tenant'}</h2>
        <form className='tenant-form' onSubmit={handleSubmit}>
          <select
            value={buildingId}
            onChange={e => setBuildingId(e.target.value)}
            required
          >
            <option value=''>Select Building</option>
            {buildings.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={floorId}
            onChange={e => setFloorId(e.target.value)}
            required
          >
            <option value=''>Select Floor</option>
            {filteredFloors.map(f => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          <select
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            required
          >
            <option value=''>Select Room</option>
            {filteredRooms.map(r => (
              <option key={r.id} value={r.id}>
                {r.number}
              </option>
            ))}
          </select>

          <input
            type='text'
            placeholder='Tenant Name'
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            type='text'
            placeholder='Phone'
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
          />
          <input
            type='number'
            placeholder='Advance'
            value={advance}
            onChange={e => setAdvance(e.target.value)}
            required
          />
          <input
            type='date'
            value={joiningDate}
            onChange={e => setJoiningDate(e.target.value)}
            required
          />
          <input
            type='file'
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <button type='submit'>
            {editingId ? 'Update Tenant' : 'Add Tenant'}
          </button>

          {editingId && (
            <button type='button' className='cancel-btn' onClick={handleCancel}>
              Cancel
            </button>
          )}
        </form>
        <h2>Filter Tenants</h2>
        <div className='filter-box'>
          <input
            placeholder='Tenant'
            value={filterName}
            onChange={e => setFilterName(e.target.value)}
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
          <button onClick={printAll}>Print Filtered</button>
        </div>
        <h2>Tenants List</h2>
        <div className='table-container'>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Building</th>
                <th>Floor</th>
                <th>Room</th>
                <th>Advance</th>
                <th>Joining</th>
                <th>Document</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map(t => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{t.phone}</td>
                  <td>{t.building}</td>
                  <td>{t.floor}</td>
                  <td>{t.room}</td>
                  <td>{t.advance}</td>
                  <td>{t.joiningDate}</td>
                  <td>
                    {t.files?.map((f, i) => (
                      <a key={i} href={f.url} target='_blank' rel='noreferrer'>
                        View
                      </a>
                    ))}
                  </td>
                  <td>
                    <button className='edit-btn' onClick={() => handleEdit(t)}>
                      Edit
                    </button>
                    <button
                      className='delete-btn'
                      onClick={() => handleDelete(t.id)}
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
          {filteredTenants.map(t => (
            <div key={t.id} className='mobile-row'>
              <div className='mobile-field'>
                <span className='label'>Name:</span>
                <span className='value'>{t.name}</span>
              </div>

              <div className='mobile-field'>
                <span className='label'>Phone:</span>
                <span className='value'>{t.phone}</span>
              </div>

              <div className='mobile-field'>
                <span className='label'>Building:</span>
                <span className='value'>{t.building}</span>
              </div>

              <div className='mobile-field'>
                <span className='label'>Floor:</span>
                <span className='value'>{t.floor}</span>
              </div>

              <div className='mobile-field'>
                <span className='label'>Room:</span>
                <span className='value'>{t.room}</span>
              </div>

              <div className='mobile-field'>
                <span className='label'>Advance:</span>
                <span className='value'>{t.advance}</span>
              </div>

              <div className='mobile-field'>
                <span className='label'>Joining:</span>
                <span className='value'>{t.joiningDate}</span>
              </div>

              {t.files?.map((f, i) => (
                <div className='mobile-field' key={i}>
                  <span className='label'>Document {i + 1}:</span>
                  <span className='value'>
                    <a href={f.url} target='_blank' rel='noreferrer'>
                      View
                    </a>
                  </span>
                </div>
              ))}

              <div className='mobile-field'>
                <button className='edit-btn' onClick={() => handleEdit(t)}>
                  Edit
                </button>
                <button
                  className='delete-btn'
                  onClick={() => handleDelete(t.id)}
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

export default Tenants
