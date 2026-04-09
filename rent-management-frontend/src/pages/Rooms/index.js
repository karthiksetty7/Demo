import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import './index.css';

const BASE_URL = 'https://demo-production-bf0f.up.railway.app/api';

const Rooms = () => {
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [buildingId, setBuildingId] = useState('');
  const [floorId, setFloorId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [editId, setEditId] = useState(null);

  const getToken = () => localStorage.getItem('token');

  // Fetch buildings
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

  // Fetch floors
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

  // Fetch rooms
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

  const filteredFloors = floors.filter(f => f.buildingId === parseInt(buildingId));

  const handleSubmit = async e => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      alert('Please login.');
      return;
    }
    if (!buildingId || !floorId || !roomNumber) return;

    const payload = { building_id: parseInt(buildingId), floor_id: parseInt(floorId), room_number: roomNumber };

    try {
      let res, data;
      if (editId) {
        res = await fetch(`${BASE_URL}/rooms/updateRoom/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        data = await res.json();
        setRooms(prev =>
          prev.map(r =>
            r.id === editId
              ? { ...r, buildingId: parseInt(buildingId), buildingName: buildings.find(b => b.id === parseInt(buildingId))?.name, floorId: parseInt(floorId), floorName: floors.find(f => f.id === parseInt(floorId))?.floorName, roomNumber }
              : r
          )
        );
        setEditId(null);
      } else {
        res = await fetch(`${BASE_URL}/rooms/addRoom`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        data = await res.json();
        const newRoom = {
          id: data.room.id,
          buildingId: data.room.building_id,
          buildingName: buildings.find(b => b.id === data.room.building_id)?.name,
          floorId: data.room.floor_id,
          floorName: floors.find(f => f.id === data.room.floor_id)?.floorName,
          roomNumber: data.room.room_number,
        };
        setRooms(prev => [...prev, newRoom]);
      }

      handleCancel();
    } catch (err) {
      console.error('Failed to save room:', err);
    }
  };

  const handleEdit = room => {
    setEditId(room.id);
    setBuildingId(room.buildingId.toString());
    setFloorId(room.floorId.toString());
    setRoomNumber(room.roomNumber);
  };

  const handleDelete = async id => {
    const token = getToken();
    if (!token) return;
    if (!window.confirm('Delete this room?')) return;

    try {
      const res = await fetch(`${BASE_URL}/rooms/deleteRoom/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        alert('Token invalid. Please login again.');
        localStorage.removeItem('token');
        return;
      }
      setRooms(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete room:', err);
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setBuildingId('');
    setFloorId('');
    setRoomNumber('');
  };

  return (
    <Layout>
      <div className='room-container'>
        <h2>{editId ? 'Update Room' : 'Add Room'}</h2>

        <form className='room-form' onSubmit={handleSubmit}>
          <select value={buildingId} onChange={e => { setBuildingId(e.target.value); setFloorId(''); }} required>
            <option value=''>Select Building</option>
            {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          <select value={floorId} onChange={e => setFloorId(e.target.value)} required>
            <option value=''>Select Floor</option>
            {filteredFloors.map(f => <option key={f.id} value={f.id}>{f.floorName}</option>)}
          </select>

          <input type='text' placeholder='Room Number' value={roomNumber} onChange={e => setRoomNumber(e.target.value)} required />
          <button type='submit'>{editId ? 'Update Room' : 'Save Room'}</button>
          {editId && <button type='button' className='cancel-btn' onClick={handleCancel}>Cancel</button>}
        </form>

        <h2>Rooms List</h2>
        <div className='table-container desktop-table'>
          <table>
            <thead>
              <tr><th>Building</th><th>Floor</th><th>Room</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {rooms.map(r => (
                <tr key={r.id}>
                  <td>{r.buildingName}</td>
                  <td>{r.floorName}</td>
                  <td>{r.roomNumber}</td>
                  <td>
                    <button className='edit-btn' onClick={() => handleEdit(r)}>Edit</button>
                    <button className='delete-btn' onClick={() => handleDelete(r.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='mobile-list'>
          {rooms.map(r => (
            <div key={r.id} className='mobile-row'>
              <div className='mobile-field'><span className='label'>Building:</span> <span className='value'>{r.buildingName}</span></div>
              <div className='mobile-field'><span className='label'>Floor:</span> <span className='value'>{r.floorName}</span></div>
              <div className='mobile-field'><span className='label'>Room:</span> <span className='value'>{r.roomNumber}</span></div>
              <div className='mobile-field'>
                <button className='edit-btn' onClick={() => handleEdit(r)}>Edit</button>
                <button className='delete-btn' onClick={() => handleDelete(r.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Rooms
