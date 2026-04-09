import { useState, useRef, useEffect } from 'react';
import Layout from '../../components/Layout';
import './index.css';

const BASE_URL = 'https://demo-production-bf0f.up.railway.app/api';

const Tenants = () => {
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [buildingId, setBuildingId] = useState('');
  const [floorId, setFloorId] = useState('');
  const [roomId, setRoomId] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [advance, setAdvance] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [files, setFiles] = useState([]);

  const [tenants, setTenants] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const fileInputRef = useRef(null);

  const getToken = () => localStorage.getItem('token');

  // Fetch Buildings
  useEffect(() => {
    const fetchBuildings = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch(`${BASE_URL}/buildings/getBuildings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          alert('Session expired. Please login again.');
          localStorage.removeItem('token');
          return;
        }
        const data = await res.json();
        setBuildings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch buildings:', err);
      }
    };
    fetchBuildings();
  }, []);

  // Fetch Floors
  useEffect(() => {
    const fetchFloors = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch(`${BASE_URL}/floors/getFloors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          alert('Session expired. Please login again.');
          localStorage.removeItem('token');
          return;
        }
        const data = await res.json();
        setFloors(
          (Array.isArray(data) ? data : []).map(f => ({
            id: f.id,
            buildingId: f.building_id,
            floorName: f.floor_number,
          }))
        );
      } catch (err) {
        console.error('Failed to fetch floors:', err);
      }
    };
    fetchFloors();
  }, []);

  // Fetch Rooms
  useEffect(() => {
    const fetchRooms = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch(`${BASE_URL}/rooms/getRooms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          alert('Session expired. Please login again.');
          localStorage.removeItem('token');
          return;
        }
        const data = await res.json();
        setRooms(
          (Array.isArray(data) ? data : []).map(r => ({
            id: r.id,
            buildingId: r.building_id,
            floorId: r.floor_id,
            roomNumber: r.room_number,
          }))
        );
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
      }
    };
    fetchRooms();
  }, []);

  // Fetch tenants from backend
  useEffect(() => {
    const fetchTenants = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch(`${BASE_URL}/tenants/getTenants`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          alert('Session expired. Please login again.');
          localStorage.removeItem('token');
          return;
        }
        const data = await res.json();
        setTenants(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch tenants:', err);
      }
    };
    fetchTenants();
  }, []);

  // Filtered floors and rooms
  const filteredFloors = floors.filter(f => f.buildingId === Number(buildingId));
  const filteredRooms = rooms.filter(r => r.buildingId === Number(buildingId) && r.floorId === Number(floorId));

  // File handler: only images allowed
  const handleFileChange = e => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(f => {
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(f.type)) {
        alert(`File "${f.name}" is not an image. Only PNG/JPG/JPEG allowed.`);
        return false;
      }
      return true;
    });
    setFiles(validFiles);
  };

  // Add/Edit tenant
  const handleSubmit = async e => {
    e.preventDefault();
    if (!buildingId || !floorId || !roomId || !name || !phone || !advance || !joiningDate) return;

    const token = getToken();
    if (!token) {
      alert('Please login.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('advance', advance);
    formData.append('joiningDate', joiningDate);
    formData.append('building_id', buildingId);
    formData.append('floor_id', floorId);
    formData.append('room_id', roomId);
    files.forEach(f => formData.append('files', f));

    try {
      let res, data;
      if (editingId) {
        res = await fetch(`${BASE_URL}/tenants/updateTenant/${editingId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        data = await res.json();
        setTenants(prev =>
          prev.map(t => (t.id === editingId ? data.tenant : t))
        );
        setEditingId(null);
      } else {
        res = await fetch(`${BASE_URL}/tenants/addTenant`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        data = await res.json();
        setTenants(prev => [...prev, data.tenant]);
      }

      handleCancel();
    } catch (err) {
      console.error('Failed to save tenant:', err);
      alert('Failed to save tenant. Check console for details.');
    }
  };

  // Edit tenant
  const handleEdit = tenant => {
    setEditingId(tenant.id);
    setName(tenant.name);
    setPhone(tenant.phone);
    setAdvance(tenant.advance);
    setJoiningDate(tenant.joiningDate);

    const buildingObj = buildings.find(b => b.id === tenant.building_id);
    setBuildingId(buildingObj?.id || '');

    const floorObj = floors.find(f => f.id === tenant.floor_id && f.buildingId === buildingObj?.id);
    setFloorId(floorObj?.id || '');

    const roomObj = rooms.find(r => r.id === tenant.room_id && r.buildingId === buildingObj?.id && r.floorId === floorObj?.id);
    setRoomId(roomObj?.id || '');

    if (fileInputRef.current) fileInputRef.current.value = '';
    setFiles([]);
  };

  // Delete tenant
  const handleDelete = async id => {
    const token = getToken();
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this tenant?')) return;

    try {
      const res = await fetch(`${BASE_URL}/tenants/deleteTenant/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        alert('Token invalid. Please login again.');
        localStorage.removeItem('token');
        return;
      }
      setTenants(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete tenant:', err);
      alert('Failed to delete tenant. Check console for details.');
    }
  };

  // Cancel form
  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setPhone('');
    setAdvance('');
    setJoiningDate('');
    setBuildingId('');
    setFloorId('');
    setRoomId('');
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Layout>
      <div className='tenant-container'>
        <h2>{editingId ? 'Edit Tenant' : 'Add Tenant'}</h2>
        <form className='tenant-form' onSubmit={handleSubmit}>
          <select
            value={buildingId}
            onChange={e => { setBuildingId(e.target.value); setFloorId(''); setRoomId(''); }}
            required
          >
            <option value=''>Select Building</option>
            {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          <select
            value={floorId}
            onChange={e => { setFloorId(e.target.value); setRoomId(''); }}
            required
          >
            <option value=''>Select Floor</option>
            {filteredFloors.map(f => <option key={f.id} value={f.id}>{f.floorName}</option>)}
          </select>

          <select
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            required
          >
            <option value=''>Select Room</option>
            {filteredRooms.map(r => <option key={r.id} value={r.id}>{r.roomNumber}</option>)}
          </select>

          <input type='text' placeholder='Tenant Name' value={name} onChange={e => setName(e.target.value)} required />
          <input type='text' placeholder='Phone' value={phone} onChange={e => setPhone(e.target.value)} required />
          <input type='number' placeholder='Advance' value={advance} onChange={e => setAdvance(e.target.value)} required />
          <input type='date' value={joiningDate} onChange={e => setJoiningDate(e.target.value)} required />

          <input type='file' multiple ref={fileInputRef} onChange={handleFileChange} />

          <button type='submit'>{editingId ? 'Update Tenant' : 'Add Tenant'}</button>
          {editingId && <button type='button' className='cancel-btn' onClick={handleCancel}>Cancel</button>}
        </form>

        <h2>Tenants List</h2>
        <div className='table-container'>
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Phone</th><th>Building</th><th>Floor</th><th>Room</th><th>Advance</th><th>Joining</th><th>Document</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{t.phone}</td>
                  <td>{t.building_name || t.building}</td>
                  <td>{t.floor_name || t.floor}</td>
                  <td>{t.room_number || t.room}</td>
                  <td>{t.advance}</td>
                  <td>{t.joiningDate}</td>
                  <td>
                    {t.files?.map((f, i) => (
                      <a key={i} href={f.url} target='_blank' rel='noreferrer noopener'>View</a>
                    ))}
                  </td>
                  <td>
                    <button className='edit-btn' onClick={() => handleEdit(t)}>Edit</button>
                    <button className='delete-btn' onClick={() => handleDelete(t.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Tenants;
