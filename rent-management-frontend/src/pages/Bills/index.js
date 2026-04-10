import { useState, useEffect, useCallback } from "react";
import Layout from "../../components/Layout";
import "./index.css";

const Bills = () => {
  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem("billRecords");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("billRecords", JSON.stringify(records));
  }, [records]);

  // LOGO BASE64
  const [logoBase64, setLogoBase64] = useState("");

  useEffect(() => {
    fetch("/SettyRents.png")
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result);
        };
        reader.readAsDataURL(blob);
      });
  }, []);

  const BASE_URL = "https://demo-production-bf0f.up.railway.app/api";
  const getToken = () => localStorage.getItem("token");

  const [previous, setPrevious] = useState("");
  const [current, setCurrent] = useState("");
  const [units, setUnits] = useState("");
  const [rate, setRate] = useState("");
  const [amount, setAmount] = useState(0);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [filterTenant, setFilterTenant] = useState("");
  const [filterRoom, setFilterRoom] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);

  const [buildingId, setBuildingId] = useState("");
  const [floorId, setFloorId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [tenantId, setTenantId] = useState("");

  useEffect(() => {
    fetch(`${BASE_URL}/buildings/getBuildings`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setBuildings(Array.isArray(data) ? data : data.data || []);
      });
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/floors/getFloors`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setFloors(Array.isArray(data) ? data : data.data || []);
      });
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/rooms/getRooms`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setRooms(Array.isArray(data) ? data : data.data || []);
      });
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/tenants/getTenants`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setTenants(Array.isArray(data) ? data : data.data || []);
      });
  }, []);

  useEffect(() => {
    if (previous !== "" && current !== "") {
      const calculatedUnits = Number(current) - Number(previous);
      const finalUnits = calculatedUnits >= 0 ? calculatedUnits : 0;
      setUnits(finalUnits);

      if (rate !== "") {
        setAmount(finalUnits * Number(rate));
      } else {
        setAmount(0);
      }
    }
  }, [previous, current, rate]);

  useEffect(() => {
    const fetchLastBill = async () => {
      if (!tenantId) return;

      try {
        const res = await fetch(`${BASE_URL}/bills/last?tenantId=${tenantId}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });

        const data = await res.json();

        if (data?.current_reading) {
          setPrevious(data.current_reading);
        } else {
          setPrevious(0);
        }
      } catch (err) {
        console.error(err);
        setPrevious(0);
      }
    };

    fetchLastBill();
  }, [tenantId]);

  const fetchBills = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/bills/getBills`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      setRecords(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const filteredFloors = floors.filter(
    (f) => f.building_id === Number(buildingId),
  );

  const filteredRooms = rooms.filter(
    (r) =>
      r.building_id === Number(buildingId) && r.floor_id === Number(floorId),
  );

  const filteredTenants = tenants.filter((t) => t.room_id === Number(roomId));

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BASE_URL}/bills/addBill`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          building_id: Number(buildingId),
          floor_id: Number(floorId),
          room_id: Number(roomId),
          tenant_id: Number(tenantId),
          previous_reading: Number(previous),
          current_reading: Number(current),
          units: Number(units),
          rate: Number(rate),
          amount: Number(amount),
          month,
          year: Number(year),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      fetchBills();
      alert("Bill saved successfully");
    } catch (err) {
      console.error(err);
      alert("Error saving bill");
    }
  };

  const handleEdit = (item) => {
    setTenantId(item.tenant_id);
    setRoomId(item.room_id);
    setFloorId(item.floor_id);
    setBuildingId(item.building_id);

    setPrevious(item.previous_reading);
    setCurrent(item.current_reading);
    setUnits(item.units);
    setRate(item.rate);
    setAmount(item.amount);
    setMonth(item.month);
    setYear(item.year);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bill?")) return;

    await fetch(`${BASE_URL}/bills/deleteBill/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    fetchBills();
  };

  const generatePrintHTML = (records) => {
    return (
      `
<html>
<head>
<title>Electricity Bills</title>
<style>
body {
  font-family: Arial, sans-serif;
  margin:0;
  padding:0;
}

.page {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  page-break-after: always;
}

.invoice {
  border:2px solid #000;
  padding:20px;
  margin-bottom:15px;
  width:100%;
  box-sizing:border-box;
}

.logo-container {
  text-align:center;
  margin-bottom:8px;
}

.logo {
  max-width:120px;
}

h2 {
  text-align:center;
  margin:5px 0 12px;
  font-size:18px;
}

table {
  width:100%;
  border-collapse:collapse;
  margin-top:10px;
  font-size:14px;
}

th, td {
  border:1px solid #000;
  padding:8px;
  text-align:left;
}

th {
  background:#f2f2f2;
}

.info-table td {
  width:25%;
}

.total-table {
  margin-top:15px;
  width:100%;
  border-collapse:collapse;
  font-size:15px;
}

.total-table td {
  border:none;
  font-weight:bold;
  padding:8px 4px;
}

.total-label {
  text-align:left;
}

.total-value {
  text-align:right;
  font-size:16px;
}

@media print {
  .page {
    page-break-after: always;
  }
}
</style>
</head>
<body>
` +
      records
        .map((record, index) => {
          const isPageStart = index % 2 === 0;
          const isPageEnd = index % 2 === 1;

          return `
${isPageStart ? `<div class="page">` : ``}

<div class="invoice">

<div class="logo-container">
<img src="${logoBase64}" class="logo"/>
</div>

<h2>Electricity Bill</h2>

<table class="info-table">
<tr>
<th>Tenant</th>
<td>${record.tenantName}</td>
<th>Room</th>
<td>${record.room}</td>
</tr>
<tr>
<th>Floor</th>
<td>${record.floor}</td>
<th>Building</th>
<td>${record.buildingName}</td>
</tr>
<tr>
<th>Month</th>
<td>${record.month}</td>
<th>Year</th>
<td>${record.year}</td>
</tr>
</table>

<table>
<thead>
<tr>
<th>Previous</th>
<th>Current</th>
<th>Units</th>
<th>Rate</th>
<th>Amount</th>
</tr>
</thead>
<tbody>
<tr>
<td>${record.previous_reading}</td>
<td>${record.current_reading}</td>
<td>${record.units}</td>
<td>${record.rate}</td>
<td>₹ ${record.amount}</td>
</tr>
</tbody>
</table>

<table class="total-table">
<tr>
<td class="total-label">Total Payable</td>
<td class="total-value">₹ ${record.amount}</td>
</tr>
</table>

</div>

${isPageEnd || index === records.length - 1 ? `</div>` : ``}
`;
        })
        .join("") +
      `
<script>
window.onload = () => {
setTimeout(() => window.print(), 300);
}
</script>
</body>
</html>
`
    );
  };

 const filteredRecords = records.filter(
  (r) =>
    (filterTenant ? r.tenant_id === Number(filterTenant) : true) &&
    (filterRoom ? r.room_id === Number(filterRoom) : true) &&
    (filterBuilding ? r.building_id === Number(filterBuilding) : true) &&
    (filterMonth ? r.month === filterMonth : true) &&
    (filterYear ? r.year.toString() === filterYear.toString() : true)
);

  // Print all filtered records
  const handlePrintAll = () => {
    const printWindow = window.open("", "", "height=700,width=900");
    printWindow.document.write(generatePrintHTML(filteredRecords));
    printWindow.document.close();
  };

  // Array Years
  const years = Array.from(
    { length: new Date().getFullYear() - 2020 + 6 },
    (_, i) => 2020 + i,
  );

  return (
    <Layout>
      <div className="bill-container">
        <h2>Electricity Bills</h2>

        <form className="bill-form" onSubmit={handleSubmit}>
          <select
            value={buildingId}
            onChange={(e) => {
              setBuildingId(e.target.value);
              setFloorId("");
              setRoomId("");
              setTenantId("");
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
              setTenantId("");
            }}
            required
          >
            <option value="">Select Floor</option>
            {filteredFloors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.floor_number}
              </option>
            ))}
          </select>

          <select
            value={roomId}
            onChange={(e) => {
              setRoomId(e.target.value);
              setTenantId("");
            }}
            required
          >
            <option value="">Select Room</option>
            {filteredRooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.room_number}
              </option>
            ))}
          </select>

          <select
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            required
          >
            <option value="">Select Tenant</option>
            {filteredTenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Previous"
            value={previous}
            onChange={(e) => setPrevious(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Current"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
          <input type="number" placeholder="Units" value={units} readOnly />
          <input
            type="number"
            placeholder="Rate"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            required
          />
          <input type="number" placeholder="Amount" value={amount} readOnly />
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
          >
            <option value="">Select Month</option>
            <option>January</option>
            <option>February</option>
            <option>March</option>
            <option>April</option>
            <option>May</option>
            <option>June</option>
            <option>July</option>
            <option>August</option>
            <option>September</option>
            <option>October</option>
            <option>November</option>
            <option>December</option>
          </select>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          >
            <option value="">Select Year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button type="submit">Save Bill</button>
        </form>

        <h2>Filter Bills</h2>
        <div className="filter-container">
          <select
            value={filterTenant}
            onChange={(e) => setFilterTenant(e.target.value)}
          >
            <option value="">All Tenants</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
          >
            <option value="">All Rooms</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.room_number}
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

          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="">All Months</option>
            <option>January</option>
            <option>February</option>
            <option>March</option>
            <option>April</option>
            <option>May</option>
            <option>June</option>
            <option>July</option>
            <option>August</option>
            <option>September</option>
            <option>October</option>
            <option>November</option>
            <option>December</option>
          </select>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button onClick={handlePrintAll}>Print Filtered</button>
        </div>

        <h2>Bills Records</h2>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Room</th>
                <th>Floor</th>
                <th>Building</th>
                <th>Units</th>
                <th>Amount</th>
                <th>Month</th>
                <th>Year</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((item) => (
                <tr key={item.id}>
                  <td>
                    {tenants.find((t) => t.id === item.tenant_id)?.name || ""}
                  </td>
                  <td>
                    {rooms.find((r) => r.id === item.room_id)?.room_number ||
                      ""}
                  </td>
                  <td>
                    {floors.find((f) => f.id === item.floor_id)?.floor_number ||
                      ""}
                  </td>
                  <td>
                    {buildings.find((b) => b.id === item.building_id)?.name ||
                      ""}
                  </td>
                  <td>{item.units}</td>
                  <td>{item.amount}</td>
                  <td>{item.month}</td>
                  <td>{item.year}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
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

        <div className="mobile-list">
          {filteredRecords.map((item) => (
            <div className="mobile-row" key={item.id}>
              <div className="mobile-field">
                <span className="label">Tenant</span>
                <span>
                  {tenants.find((t) => t.id === item.tenant_id)?.name || ""}
                </span>
              </div>
              <div className="mobile-field">
                <span className="label">Room</span>
                <span>
                  {rooms.find((r) => r.id === item.room_id)?.room_number || ""}
                </span>
              </div>
              <div className="mobile-field">
                <span className="label">Floor</span>
                <span>
                  {floors.find((f) => f.id === item.floor_id)?.floor_number ||
                    ""}
                </span>
              </div>
              <div className="mobile-field">
                <span className="label">Building</span>
                <span>
                  {buildings.find((b) => b.id === item.building_id)?.name || ""}
                </span>
              </div>
              <div className="mobile-field">
                <span className="label">Units</span>
                <span>{item.units}</span>
              </div>
              <div className="mobile-field">
                <span className="label">Amount</span>
                <span>₹ {item.amount}</span>
              </div>
              <div className="mobile-field">
                <span className="label">Month</span>
                <span>{item.month}</span>
              </div>
              <div className="mobile-field">
                <span className="label">Year</span>
                <span>{item.year}</span>
              </div>

              <div className="mobile-actions">
                <button className="edit-btn" onClick={() => handleEdit(item)}>
                  Edit
                </button>
                <button
                  className="delete-btn"
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
  );
};

export default Bills;
