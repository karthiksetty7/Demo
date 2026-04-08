import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // for redirect
import Layout from '../../components/Layout';
import './index.css';

const Buildings = () => {
  const [buildingName, setBuildingName] = useState('');
  const [address, setAddress] = useState('');
  const [buildings, setBuildings] = useState([]);
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();

  const API_URL = 'https://demo-production-bf0f.up.railway.app/api/buildings';

  // Fetch buildings on load
  useEffect(() => {
    fetchBuildings();
  }, []);

  const getToken = () => localStorage.getItem('token');

  const fetchBuildings = async () => {
    const token = getToken();
    if (!token) {
      alert('No token found. Please login.');
      navigate('/login'); // redirect to login page
      return;
    }

    try {
      const res = await fetch(`${API_URL}/getBuildings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        alert('Token missing or invalid. Please login again.');
        localStorage.removeItem('token'); // clear bad token
        navigate('/login');
        return;
      }

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setBuildings(data);
    } catch (err) {
      console.error('Error fetching buildings:', err);
      alert('Failed to fetch buildings.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!buildingName || !address) {
      alert('Please provide building name and address');
      return;
    }

    const token = getToken();
    if (!token) {
      alert('No token found. Please login.');
      navigate('/login');
      return;
    }

    try {
      if (editId) {
        alert('Update feature not implemented in backend');
      } else {
        const res = await fetch(`${API_URL}/addBuilding`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: buildingName, address }),
        });

        if (res.status === 401) {
          alert('Token invalid. Please login again.');
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      }

      setBuildingName('');
      setAddress('');
      setEditId(null);
      fetchBuildings();
    } catch (err) {
      console.error('Error saving building:', err);
      alert('Failed to save building.');
    }
  };

  const handleEdit = (building) => {
    setBuildingName(building.name);
    setAddress(building.address);
    setEditId(building.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this building?')) return;

    const token = getToken();
    if (!token) {
      alert('No token found. Please login.');
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/deleteBuilding/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        alert('Token invalid. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      setBuildings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Error deleting building:', err);
      alert('Failed to delete building.');
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setBuildingName('');
    setAddress('');
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

          <button type="submit">
            {editId ? 'Update Building' : 'Save Building'}
          </button>

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

export default Buildings
