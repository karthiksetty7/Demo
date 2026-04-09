import { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import './index.css';

// ✅ Updated Railway backend URL
const BASE_URL = 'https://demo-production-bf0f.up.railway.app/api';

const Tenants = () => {
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

  // Fetch tenants from Railway backend
  const loadTenants = async () => {
    try {
      const res = await fetch(`${BASE_URL}/tenants/getTenants`);
      const data = await res.json();
      setTenants(data);
    } catch (err) {
      console.error('Failed to load tenants', err);
    }
  };

  useEffect(() => { loadTenants(); }, []);

  const handleFileChange = e => {
    const selected = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    setFiles(selected);
  };

  const validateForm = () => {
    if (!/^[a-zA-Z\s]+$/.test(name)) { alert('Tenant name must be letters'); return false; }
    if (!/^\d+$/.test(phone)) { alert('Phone must be numbers'); return false; }
    if (!buildingId || !floorId || !roomId) { alert('Select building/floor/room'); return false; }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('advance', advance);
    formData.append('joining_date', joiningDate);
    formData.append('building_id', buildingId);
    formData.append('floor_id', floorId);
    formData.append('room_id', roomId);
    files.forEach(f => formData.append('files', f));

    const url = editingId
      ? `${BASE_URL}/tenants/updateTenant/${editingId}`
      : `${BASE_URL}/tenants/addTenant`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method, body: formData });
      if (!res.ok) return alert('Failed to save tenant');
      await loadTenants();
      handleCancel();
    } catch (err) {
      console.error('Error saving tenant:', err);
    }
  };

  const handleEdit = t => {
    setEditingId(t.id);
    setName(t.name);
    setPhone(t.phone);
    setAdvance(t.advance);
    setJoiningDate(t.joining_date?.split('T')[0] || '');
    setBuildingId(t.building_id);
    setFloorId(t.floor_id);
    setRoomId(t.room_id);
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete tenant?')) return;
    try {
      await fetch(`${BASE_URL}/tenants/deleteTenant/${id}`, { method: 'DELETE' });
      loadTenants();
    } catch (err) {
      console.error('Error deleting tenant:', err);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setName(''); setPhone(''); setAdvance(''); setJoiningDate('');
    setBuildingId(''); setFloorId(''); setRoomId(''); setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Layout>
      <h2>{editingId ? 'Edit Tenant' : 'Add Tenant'}</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder='Building ID' value={buildingId} onChange={e => setBuildingId(e.target.value)} required />
        <input placeholder='Floor ID' value={floorId} onChange={e => setFloorId(e.target.value)} required />
        <input placeholder='Room ID' value={roomId} onChange={e => setRoomId(e.target.value)} required />

        <input placeholder='Name' value={name} onChange={e => setName(e.target.value)} required />
        <input placeholder='Phone' value={phone} onChange={e => setPhone(e.target.value)} required />
        <input placeholder='Advance' type='number' value={advance} onChange={e => setAdvance(e.target.value)} required />
        <input type='date' value={joiningDate} onChange={e => setJoiningDate(e.target.value)} required />
        <input type='file' multiple ref={fileInputRef} onChange={handleFileChange} />

        <button type='submit'>{editingId ? 'Update' : 'Add'}</button>
        {editingId && <button type='button' onClick={handleCancel}>Cancel</button>}
      </form>

      <h2>Tenants List</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th><th>Phone</th><th>Building</th><th>Floor</th><th>Room</th><th>Advance</th><th>Joining</th><th>Images</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map(t => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.phone}</td>
              <td>{t.building?.name || t.building_id}</td>
              <td>{t.floor?.floor_number || t.floor_id}</td>
              <td>{t.room?.room_number || t.room_id}</td>
              <td>{t.advance}</td>
              <td>{t.joining_date?.split('T')[0]}</td>
              <td>
                {t.files?.map((f, i) => (
                  <a key={i} href={`https://demo-production-bf0f.up.railway.app${f.url}`} target='_blank' rel='noreferrer'>View</a>
                ))}
              </td>
              <td>
                <button onClick={() => handleEdit(t)}>Edit</button>
                <button onClick={() => handleDelete(t.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default Tenants;
