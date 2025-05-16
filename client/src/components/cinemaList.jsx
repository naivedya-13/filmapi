import React, { useState, useEffect } from "react";

const CinemaList = () => {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [giftStoreFilter, setGiftStoreFilter] = useState("all"); // "all", "yes", "no"

  const fetchCinemas = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();

      if (giftStoreFilter === "yes") {
        params.append("isGiftStore", "true");
      } else if (giftStoreFilter === "no") {
        params.append("isGiftStore", "false");
      }

      const url = `http://localhost:3000/fetchcinema?${params.toString()}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error("Failed to fetch cinemas");

      const data = await res.json();
      setCinemas(data);
    } catch (err) {
      setError(err.message);
      setCinemas([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCinemas();
  }, [giftStoreFilter]);

  // Styles
  const containerStyle = {
    maxWidth: 900,
    margin: "auto",
    padding: 20,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
  };

  const filterContainer = {
    marginBottom: 20,
    display: "flex",
    gap: 20,
    alignItems: "center",
    flexWrap: "wrap",
  };

  const labelStyle = {
    fontWeight: "600",
    fontSize: 16,
  };

  const selectStyle = {
    marginLeft: 10,
    padding: "6px 10px",
    borderRadius: 5,
    border: "1px solid #ccc",
    fontSize: 14,
    cursor: "pointer",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  };

  const thStyle = {
    backgroundColor: "#4A90E2",
    color: "white",
    padding: "12px 15px",
    textAlign: "left",
    fontWeight: "600",
  };

  const tdStyle = {
    padding: "12px 15px",
    borderBottom: "1px solid #ddd",
  };

  const trHover = {
    transition: "background-color 0.3s",
    cursor: "default",
  };

  const errorStyle = {
    color: "red",
    fontWeight: "600",
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: 20 }}>Cinema List</h2>

      {/* Filters */}
      <div style={filterContainer}>
        <label style={labelStyle}>
          Gift Store:
          <select
            value={giftStoreFilter}
            onChange={(e) => setGiftStoreFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
      </div>

      {/* Loading/Error/No Data */}
      {loading && <p>Loading...</p>}
      {error && <p style={errorStyle}>Error: {error}</p>}
      {!loading && cinemas.length === 0 && <p>No cinemas found.</p>}

      {/* Cinema Table */}
      {!loading && cinemas.length > 0 && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Latitude</th>
              <th style={thStyle}>Longitude</th>
              <th style={thStyle}>Gift Store</th>
              <th style={thStyle}>Voucher Validation</th>
              <th style={thStyle}>Time Zone</th>
            </tr>
          </thead>
          <tbody>
            {cinemas.map((cinema) => (
              <tr
                key={cinema.id}
                style={trHover}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f5faff")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <td style={tdStyle}>{cinema.id}</td>
                <td style={tdStyle}>{cinema.name}</td>
                <td style={tdStyle}>{cinema.latitude ?? "N/A"}</td>
                <td style={tdStyle}>{cinema.longitude ?? "N/A"}</td>
                <td style={tdStyle}>{cinema.isGiftStore ? "Yes" : "No"}</td>
                <td style={tdStyle}>
                  {cinema.allowOnlineVoucherValidation ? "Yes" : "No"}
                </td>
                <td style={tdStyle}>{cinema.timeZoneId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CinemaList;
