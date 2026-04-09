import { useState, useRef, useEffect } from 'react';
import Layout from '../../components/Layout';
import './index.css';

const BASE_URL = 'https://demo-production-bf0f.up.railway.app/api';

const Tenants = () => {
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);

  const [buildingId, setBuildingId] = useState('');
  const [floorId, setFloorId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [advance, setAdvance] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [files, setFiles] = useState([]);
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
        setBuildings([]);
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
            buildingName: f.building?.name || '',
            floorName: f.floor_number,
          }))
        );
      } catch (err) {
        console.error('Failed to fetch floors:', err);
        setFloors([]);
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
            buildingName: r.building?.name || '',
            floorId: r.floor_id,
            floorName: r.floor?.floor_number || '',
            roomNumber: r.room_number,
          }))
        );
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
        setRooms([]);
      }
    };
    fetchRooms();
  }, []);

  // Fetch Tenants
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
        // Map building, floor, room names immediately
        setTenants(
          (Array.isArray(data) ? data : []).map(t => ({
            ...t,
            building: { name: t.building?.name || buildings.find(b => b.id === t.building_id)?.name || '' },
            floor: { floor_number: t.floor?.floor_number || floors.find(f => f.id === t.floor_id)?.floorName || '' },
            room: { room_number: t.room?.room_number || rooms.find(r => r.id === t.room_id)?.roomNumber || '' },
          }))
        );
      } catch (err) {
        console.error('Failed to fetch tenants:', err);
        setTenants([]);
      }
    };
    fetchTenants();
  }, [buildings, floors, rooms]);

  const filteredFloors = floors.filter(f => f.buildingId === parseInt(buildingId));
  const filteredRooms = rooms.filter(
    r => r.buildingId === parseInt(buildingId) && r.floorId === parseInt(floorId)
  );

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

  const validate = () => {
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      alert('Tenant name must contain only letters and spaces');
      return false;
    }
    if (!/^\d+$/.test(phone)) {
      alert('Phone number must contain only digits');
      return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    if (!buildingId || !floorId || !roomId || !name || !phone || !advance || !joiningDate) return;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('advance', advance);
    formData.append('join_date', joiningDate);
    formData.append('building_id', buildingId);
    formData.append('floor_id', floorId);
    formData.append('room_id', roomId);
    files.forEach(f => formData.append('files', f));

    try {
      let res;
      if (editingId) {
        res = await fetch(`${BASE_URL}/tenants/updateTenant/${editingId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${getToken()}` },
          body: formData,
        });
      } else {
        res = await fetch(`${BASE_URL}/tenants/addTenant`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${getToken()}` },
          body: formData,
        });
      }

      if (!res.ok) throw new Error('Failed to save tenant');
      const savedTenant = await res.json();

      // Map building, floor, room names immediately
      const mappedTenant = {
        ...savedTenant,
        building: { name: buildings.find(b => b.id === parseInt(savedTenant.building_id))?.name || '' },
        floor: { floor_number: floors.find(f => f.id === parseInt(savedTenant.floor_id))?.floorName || '' },
        room: { room_number: rooms.find(r => r.id === parseInt(savedTenant.room_id))?.roomNumber || '' },
      };

      setTenants(prev =>
        editingId
          ? prev.map(t => (t.id === editingId ? mappedTenant : t))
          : [...prev, mappedTenant]
      );

      handleCancel();
    } catch (err) {
      console.error(err);
      alert('Failed to save tenant');
    }
  };

  const handleEdit = tenant => {
    setEditingId(tenant.id);
    setName(tenant.name);
    setPhone(tenant.phone);
    setAdvance(tenant.advance);
    setJoiningDate(tenant.join_date);
    setBuildingId(tenant.building_id.toString());
    setFloorId(tenant.floor_id.toString());
    setRoomId(tenant.room_id.toString());
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this tenant?')) return;
    try {
      const res = await fetch(`${BASE_URL}/tenants/deleteTenant/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Failed to delete tenant');
      setTenants(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete tenant');
    }
  };

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
      <div className="tenant-container">
        <h2>{editingId ? 'Edit Tenant' : 'Add Tenant'}</h2>
        <form className="tenant-form" onSubmit={handleSubmit}>
          <select
            value={buildingId}
            onChange={e => { setBuildingId(e.target.value); setFloorId(''); setRoomId(''); }}
            required
          >
            <option value="">Select Building</option>
            {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          <select
            value={floorId}
            onChange={e => { setFloorId(e.target.value); setRoomId(''); }}
            required
          >
            <option value="">Select Floor</option>
            {filteredFloors.map(f => <option key={f.id} value={f.id}>{f.floorName}</option>)}
          </select>

          <select
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            required
          >
            <option value="">Select Room</option>
            {filteredRooms.map(r => <option key={r.id} value={r.id}>{r.roomNumber}</option>)}
          </select>

          <input type="text" placeholder="Tenant Name" value={name} onChange={e => setName(e.target.value)} required />
          <input type="text" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} required />
          <input type="number" placeholder="Advance" value={advance} onChange={e => setAdvance(e.target.value)} required />
          <input type="date" value={joiningDate} onChange={e => setJoiningDate(e.target.value)} required />

          <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} />

          <button type="submit">{editingId ? 'Update Tenant' : 'Add Tenant'}</button>
          {editingId && <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>}
        </form>

        <h2>Tenants List</h2>
        <div className="table-container">
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
              {tenants.map(t => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{t.phone}</td>
                  <td>{t.building?.name}</td>
                  <td>{t.floor?.floor_number}</td>
                  <td>{t.room?.room_number}</td>
                  <td>{t.advance}</td>
                  <td>{t.join_date}</td>
                  <td>
                    {t.documents?.map((f, i) => (
                      <a key={i} href={`${BASE_URL}${f.url}`} target="_blank" rel="noreferrer noopener">View</a>
                    ))}
                  </td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(t)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(t.id)}>Delete</button>
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
