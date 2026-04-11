import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import './index.css';

const Buildings = () => {
  const [buildingName, setBuildingName] = useState('');
  const [address, setAddress] = useState('');
  const [buildings, setBuildings] = useState([]);
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();

  const API_URL = 'https://demo-production-bf0f.up.railway.app/api/buildings';

  const getToken = () => localStorage.getItem('token');

  // Wrap fetchBuildings in useCallback so it can safely go in useEffect dependencies
  const fetchBuildings = useCallback(async () => {
    const token = getToken();
    if (!token) {
      alert('Please login to access buildings.');
      navigate('/');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/getBuildings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/');
        return;
      }

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setBuildings(data);
    } catch (err) {
      console.error('Error fetching buildings:', err);
      alert('Failed to fetch buildings.');
    }
  }, [navigate]);

  // Fetch all buildings on mount
  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]); // eslint warning resolved

  // Add or Update building
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!buildingName || !address) {
    alert('Please provide building name and address.');
    return;
  }

  const token = getToken();
  if (!token) {
    alert('Please login.');
    navigate('/');
    return;
  }

  try {
    let res;

    if (editId) {
      res = await fetch(`${API_URL}/updateBuilding/${editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: buildingName, address }),
      });
    } else {
      res = await fetch(`${API_URL}/addBuilding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: buildingName, address }),
      });
    }

    const data = await res.json();

    if (res.status === 401) {
      alert('Session expired. Please login again.');
      localStorage.removeItem('token');
      navigate('/');
      return;
    }

    if (!res.ok) {
      alert(data.error || data.message || 'Something went wrong');
      return;
    }

    // success
    setBuildingName('');
    setAddress('');
    setEditId(null);
    fetchBuildings();

  } catch (err) {
    console.error('Error saving building:', err);
    alert('Network error. Please try again.');
  }
};

  // Edit building
  const handleEdit = (building) => {
    setBuildingName(building.name);
    setAddress(building.address);
    setEditId(building.id);
  };

  // Cancel edit
  const handleCancel = () => {
    setEditId(null);
    setBuildingName('');
    setAddress('');
  };

  // Delete building
  const handleDelete = async (id) => {
  if (!window.confirm('Delete this building?')) return;

  const token = getToken();
  if (!token) {
    alert('Please login.');
    navigate('/');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/deleteBuilding/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (res.status === 401) {
      alert('Session expired. Please login again.');
      localStorage.removeItem('token');
      navigate('/');
      return;
    }

    if (!res.ok) {
      alert(data.error || data.message || 'Failed to delete building');
      return;
    }

    // success
    setBuildings((prev) => prev.filter((b) => b.id !== id));

  } catch (err) {
    console.error('Error deleting building:', err);
    alert('Network error. Please try again.');
  }
};

  return (
    <Layout>
      <div className="building-container">
        <h2>{editId ? 'Update Building' : 'Add Building'}</h2>

        <form className="building-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Building Name"
            value={buildingName}
            onChange={(e) => setBuildingName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <button type="submit">{editId ? 'Update Building' : 'Save Building'}</button>

          {editId && (
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </form>

        <h2>Buildings List</h2>

        <div className="table-container desktop-table">
          <table>
            <thead>
              <tr>
                <th>Building Name</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {buildings.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.address}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(item)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mobile-list">
          {buildings.map((item) => (
            <div key={item.id} className="mobile-row">
              <div className="mobile-field">
                <span className="label">Building:</span>
                <span className="value">{item.name}</span>
              </div>
              <div className="mobile-field">
                <span className="label">Address:</span>
                <span className="value">{item.address}</span>
              </div>
              <div className="mobile-field">
                <button className="edit-btn" onClick={() => handleEdit(item)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Buildings;
