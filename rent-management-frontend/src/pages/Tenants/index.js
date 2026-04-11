import { useState, useRef, useEffect } from "react";
import Layout from "../../components/Layout";
import "./index.css";

const BASE_URL = "https://demo-production-bf0f.up.railway.app/api";
const FILE_BASE_URL = "https://demo-production-bf0f.up.railway.app";

const Tenants = () => {
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);

  const [buildingId, setBuildingId] = useState("");
  const [floorId, setFloorId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [advance, setAdvance] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [files, setFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [filterName, setFilterName] = useState("");
  const [filterRoom, setFilterRoom] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("");

  const fileInputRef = useRef(null);
  const getToken = () => localStorage.getItem("token");

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
          alert("Session expired. Please login again.");
          localStorage.removeItem("token");
          return;
        }
        const data = await res.json();
        setBuildings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch buildings:", err);
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
          alert("Session expired. Please login again.");
          localStorage.removeItem("token");
          return;
        }
        const data = await res.json();
        setFloors(
          (Array.isArray(data) ? data : []).map((f) => ({
            id: f.id,
            buildingId: f.building_id,
            buildingName: f.building?.name || "",
            floor_number: f.floor_number,
          })),
        );
      } catch (err) {
        console.error("Failed to fetch floors:", err);
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
          alert("Session expired. Please login again.");
          localStorage.removeItem("token");
          return;
        }
        const data = await res.json();
        setRooms(
          (Array.isArray(data) ? data : []).map((r) => ({
            id: r.id,
            buildingId: r.building_id,
            buildingName: r.building?.name || "",
            floorId: r.floor_id,
            floorName: r.floor?.floor_number || "",
            roomNumber: r.room_number,
          })),
        );
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
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
          alert("Session expired. Please login again.");
          localStorage.removeItem("token");
          return;
        }
        const data = await res.json();
        setTenants(
          (Array.isArray(data) ? data : []).map((t) => ({
            ...t,
            building: {
              name:
                t.building?.name ||
                buildings.find((b) => b.id === t.building_id)?.name ||
                "",
            },
            floor: { floor_number: t.floor?.floor_number || "" },
            room: { room_number: t.room?.room_number || "" },
          })),
        );
      } catch (err) {
        console.error("Failed to fetch tenants:", err);
        setTenants([]);
      }
    };
    fetchTenants();
  }, [buildings, floors, rooms]);

  const filteredFloors = floors.filter(
    (f) => f.buildingId === parseInt(buildingId),
  );
  const filteredRooms = rooms.filter(
    (r) =>
      r.buildingId === parseInt(buildingId) && r.floorId === parseInt(floorId),
  );

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    const validFiles = selectedFiles.filter((f) => {
      if (
        !["image/png", "image/jpeg", "image/jpg", "application/pdf"].includes(
          f.type,
        )
      ) {
        alert(`Invalid file: ${f.name}`);
        return false;
      }
      return true;
    });

    setFiles(validFiles);
  };

  const validate = () => {
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      alert("Tenant name must contain only letters and spaces");
      return false;
    }
    if (!/^\d+$/.test(phone)) {
      alert("Phone number must contain only digits");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (
      !buildingId ||
      !floorId ||
      !roomId ||
      !name ||
      !phone ||
      !advance ||
      !joiningDate
    )
      return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("advance", advance);
    formData.append("join_date", joiningDate);
    formData.append("building_id", buildingId);
    formData.append("floor_id", floorId);
    formData.append("room_id", roomId);
    files.forEach((f) => formData.append("files", f));

    try {
      let res;
      if (editingId) {
        res = await fetch(`${BASE_URL}/tenants/updateTenant/${editingId}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: formData,
        });
      } else {
        res = await fetch(`${BASE_URL}/tenants/addTenant`, {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: formData,
        });
      }

      if (!res.ok) throw new Error("Failed to save tenant");
      const savedTenant = await res.json();

      const mappedTenant = {
        ...savedTenant,
        building: {
          name:
            buildings.find((b) => b.id === parseInt(savedTenant.building_id))
              ?.name || "",
        },
        floor: {
          floor_number:
            floors.find((f) => f.id === parseInt(savedTenant.floor_id))
              ?.floorName || "",
        },
        room: {
          room_number:
            rooms.find((r) => r.id === parseInt(savedTenant.room_id))
              ?.roomNumber || "",
        },
      };

      setTenants((prev) =>
        editingId
          ? prev.map((t) => (t.id === editingId ? mappedTenant : t))
          : [...prev, mappedTenant],
      );

      handleCancel();
    } catch (err) {
      console.error(err);
      alert("Failed to save tenant");
    }
  };

  const handleEdit = (tenant) => {
    setEditingId(tenant.id);
    setName(tenant.name);
    setPhone(tenant.phone);
    setAdvance(tenant.advance);
    setJoiningDate(tenant.join_date);
    setBuildingId(tenant.building_id.toString());
    setFloorId(tenant.floor_id.toString());
    setRoomId(tenant.room_id.toString());
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tenant?")) return;
    try {
      const res = await fetch(`${BASE_URL}/tenants/deleteTenant/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to delete tenant");
      setTenants((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete tenant");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setName("");
    setPhone("");
    setAdvance("");
    setJoiningDate("");
    setBuildingId("");
    setFloorId("");
    setRoomId("");
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const filteredTenants = tenants.filter(
    (t) =>
      (!filterName || t.name === filterName) &&
      (!filterRoom || String(t.room?.room_number) === String(filterRoom)) &&
      (!filterBuilding || String(t.building_id) === String(filterBuilding)),
  );

  // Shared print styles
  const printStyles = `
<style>
  body { font-family: Arial, sans-serif; margin:0; padding:0; }
  .page { page-break-after: always; display:flex; justify-content:center; align-items:center; height:100vh; }
  .page-border { border:2px solid #000; width:95%; height:95%; box-sizing:border-box; padding:30px; display:flex; flex-direction:column; }
  .invoice { width:100%; height:100%; display:flex; flex-direction:column; }
  .header { display:flex; align-items:center; gap:20px; margin-bottom:40px; }
  .logo { max-width:120px; }
  h2 { font-size:28px; margin:0; }
  table { width:100%; border-collapse:collapse; font-size:24px; flex-grow:1; }
  th, td { border:1px solid #000; padding:20px; text-align:left; vertical-align:middle; }
  th { width:30%; background:#f2f2f2; font-weight:bold; }
  td { width:70%; }
  .full-page { width:100%; page-break-after:always; display:flex; justify-content:center; align-items:center; height:100vh; }
  .full-page img, .full-page embed { width:95%; max-height:95vh; object-fit:contain; border:2px solid #000; padding:10px; box-sizing:border-box; }
</style>
`;

  // Generate HTML for a single tenant
  const generateTenantHTML = (tenant) => {
    const buildingName = tenant.building?.name || "";
    const floorName = tenant.floor?.floor_number || "";
    const roomNumber = tenant.room?.room_number || "";

    const filesHtml = Array.isArray(tenant.documents)
      ? tenant.documents
          .map(
            (f) => `
      <div class="full-page">
        ${
          f.url.match(/\.(jpg|jpeg|png|gif)$/i)
            ? `<img src="${FILE_BASE_URL}${f.url}" />`
            : `<embed src="${FILE_BASE_URL}${f.url}" type="application/pdf" />`
        }
      </div>
    `,
          )
          .join("")
      : "";

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
          <tr><th>Building</th><td>${buildingName}</td></tr>
          <tr><th>Floor</th><td>${floorName}</td></tr>
          <tr><th>Room</th><td>${roomNumber}</td></tr>
          <tr><th>Advance</th><td>${tenant.advance}</td></tr>
          <tr><th>Joining Date</th><td>${tenant.join_date}</td></tr>
        </table>
      </div>
    </div>
  </div>

  ${filesHtml}
`;
  };

  // Print all filtered tenants with building check
  const printAllTenants = (filteredTenants, selectedBuilding) => {
    if (!selectedBuilding) {
      alert("Building is mandatory to print filtered tenants");
      return;
    }

    if (!filteredTenants || !filteredTenants.length) {
      alert("No tenants to print.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocked! Allow popups.");
      return;
    }

    const content = filteredTenants.map(generateTenantHTML).join("");

    printWindow.document.write(`
    <html>
      <head>
        <title>All Tenants</title>
        ${printStyles}
      </head>
      <body>
        ${content}
        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
              window.close();
            }, 800);
          }
        </script>
      </body>
    </html>
  `);

    printWindow.document.close();
  };

  return (
    <Layout>
      <div className="tenant-container">
        <h2>{editingId ? "Edit Tenant" : "Add Tenant"}</h2>
        <form className="tenant-form" onSubmit={handleSubmit}>
          <select
            value={buildingId}
            onChange={(e) => {
              setBuildingId(e.target.value);
              setFloorId("");
              setRoomId("");
            }}
            required
          >
            <option value="">Select Building</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={floorId}
            onChange={(e) => {
              setFloorId(e.target.value);
              setRoomId("");
            }}
            required
          >
            <option value="">Select Floor</option>
            {filteredFloors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.floorName}
              </option>
            ))}
          </select>

          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
          >
            <option value="">Select Room</option>
            {filteredRooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.roomNumber}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Tenant Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Advance"
            value={advance}
            onChange={(e) => setAdvance(e.target.value)}
            required
          />
          <input
            type="date"
            value={joiningDate}
            onChange={(e) => setJoiningDate(e.target.value)}
            required
          />

          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <button type="submit">
            {editingId ? "Update Tenant" : "Add Tenant"}
          </button>
          {editingId && (
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </form>

        {/* Filter Section */}
        <h2>Filter Tenants</h2>
        <div className="filter-box">
          <select
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          >
            <option value="">All Tenants</option>
            {[...new Set(tenants.map((t) => t.name))].map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
          >
            <option value="">All Rooms</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.roomNumber}>
                {r.roomNumber}
              </option>
            ))}
          </select>

          <select
            value={filterBuilding}
            onChange={(e) => setFilterBuilding(e.target.value)}
          >
            <option value="">All Buildings</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => printAllTenants(filteredTenants, filterBuilding)}
          >
            Print Filtered
          </button>
        </div>

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
              {filteredTenants.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{t.phone}</td>
                  <td>{t.building?.name}</td>
                  <td>{t.floor?.floor_number}</td>
                  <td>{t.room?.room_number}</td>
                  <td>{t.advance}</td>
                  <td>{t.join_date}</td>
                  <td>
                    {Array.isArray(t.documents) &&
                      t.documents.map((f, i) => (
                        <a
                          key={i}
                          href={`${FILE_BASE_URL}${f.url}`}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          View
                        </a>
                      ))}
                  </td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(t)}>
                      Edit
                    </button>
                    <button
                      className="delete-btn"
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
      </div>
    </Layout>
  );
};

export default Tenants;
