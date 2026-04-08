import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import './index.css';

const BASE_URL = 'https://demo-production-bf0f.up.railway.app/api'; // Railway API base

const Floors = () => {
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [buildingId, setBuildingId] = useState('');
  const [floorName, setFloorName] = useState('');
  const [editId, setEditId] = useState(null);

  // Fetch buildings
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await fetch(`${BASE_URL}/buildings/getBuildings`);
        const data = await res.json();
        if (Array.isArray(data)) setBuildings(data);
        else if (Array.isArray(data.buildings)) setBuildings(data.buildings);
        else setBuildings([]);
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
      try {
        const res = await fetch(`${BASE_URL}/floors/getFloors`);
        const data = await res.json();
        const floorsArray = Array.isArray(data)
          ? data
          : Array.isArray(data.floors)
          ? data.floors
          : [];
        setFloors(
          floorsArray.map(f => ({
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

  const handleSubmit = async e => {
    e.preventDefault();
    if (!buildingId || !floorName) return;

    const payload = { building_id: parseInt(buildingId), floor_number: floorName };

    try {
      if (editId) {
        // Update floor
        await fetch(`${BASE_URL}/floors/updateFloor/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        setFloors(prev =>
          prev.map(f =>
            f.id === editId
              ? {
                  ...f,
                  buildingId: parseInt(buildingId),
                  buildingName: buildings.find(b => b.id === parseInt(buildingId))?.name,
                  floorName,
                }
              : f
          )
        );
        setEditId(null);
      } else {
        // Add floor
        const res = await fetch(`${BASE_URL}/floors/addFloor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        const newFloor = {
          id: data.floor.id,
          buildingId: data.floor.building_id,
          buildingName: buildings.find(b => b.id === data.floor.building_id)?.name,
          floorName: data.floor.floor_number,
        };
        setFloors(prev => [...prev, newFloor]);
      }

      handleCancel();
    } catch (err) {
      console.error('Failed to save floor:', err);
    }
  };

  const handleEdit = floor => {
    setEditId(floor.id);
    setBuildingId(floor.buildingId.toString());
    setFloorName(floor.floorName);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this floor?')) return;

    try {
      await fetch(`${BASE_URL}/floors/deleteFloor/${id}`, { method: 'DELETE' });
      setFloors(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error('Failed to delete floor:', err);
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setBuildingId('');
    setFloorName('');
  };

  return (
    <Layout>
      <div className='floor-container'>
        <h2>{editId ? 'Update Floor' : 'Add Floor'}</h2>

        <form className='floor-form' onSubmit={handleSubmit}>
          <select value={buildingId} onChange={e => setBuildingId(e.target.value)} required>
            <option value=''>Select Building</option>
            {Array.isArray(buildings) &&
              buildings.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
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

          <button type='submit'>{editId ? 'Update Floor' : 'Save Floor'}</button>
          {editId && <button type='button' className='cancel-btn' onClick={handleCancel}>Cancel</button>}
        </form>

        <h2>Floors List</h2>

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
              {floors.map(f => (
                <tr key={f.id}>
                  <td>{f.buildingName}</td>
                  <td>{f.floorName}</td>
                  <td>
                    <button className='edit-btn' onClick={() => handleEdit(f)}>Edit</button>
                    <button className='delete-btn' onClick={() => handleDelete(f.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='mobile-list'>
          {floors.map(f => (
            <div key={f.id} className='mobile-row'>
              <div className='mobile-field'>
                <span className='label'>Building:</span> <span className='value'>{f.buildingName}</span>
              </div>
              <div className='mobile-field'>
                <span className='label'>Floor:</span> <span className='value'>{f.floorName}</span>
              </div>
              <div className='mobile-field'>
                <button className='edit-btn' onClick={() => handleEdit(f)}>Edit</button>
                <button className='delete-btn' onClick={() => handleDelete(f.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Floors
