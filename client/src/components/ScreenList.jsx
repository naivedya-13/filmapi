import React, { useEffect, useState } from "react";
import axios from "axios";

const ScreenList = () => {
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    cinemaId: "",
    screenNumber: "",
    shortName: "",
    isConcept: "",
  });

  const fetchScreens = async (filterParams = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      Object.entries(filterParams).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
           if (key === 'isConcept') {
               params[key] = value === 'true';
           } else {
               params[key] = value;
           }
        }
      });

      const res = await axios.get("http://localhost:3000/screens", { params });

      if (Array.isArray(res.data)) {
          setScreens(res.data);
      } else {
          console.error("API response data is not an array:", res.data);
          setScreens([]);
      }

    } catch (err) {
      setError("Failed to fetch screens");
      console.error("Error fetching screens:", err.message);
      setScreens([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreens();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchScreens(filters);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Screen List</h1>

      <form onSubmit={handleSearch} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          name="cinemaId"
          placeholder="Cinema ID"
          value={filters.cinemaId}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="screenNumber"
          placeholder="Screen Number"
          value={filters.screenNumber}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="shortName"
          placeholder="Short Name"
          value={filters.shortName}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <select
          name="isConcept"
          value={filters.isConcept}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">All Concepts</option>
          <option value="true">Concept Only</option>
          <option value="false">Non-Concept</option>
        </select>
        <div className="col-span-2 md:col-span-1 flex items-end">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Search
          </button>
        </div>
      </form>

      {loading && <p className="text-blue-500">Loading screens...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          {screens.length === 0 ? (
            <p className="text-gray-500">No screens found.</p>
          ) : (
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">ID</th>
                  <th className="border px-4 py-2">Cinema ID</th>
                  <th className="border px-4 py-2">Screen #</th>
                  <th className="border px-4 py-2">Short Name</th>
                  <th className="border px-4 py-2">Concept</th>
                </tr>
              </thead>
              <tbody>
                {screens.map((screen) => (
                  <tr key={screen.id}>
                    <td className="border px-4 py-2">{screen.id}</td>
                    <td className="border px-4 py-2">{screen.cinemaId}</td>
                    <td className="border px-4 py-2">{screen.screenNumber}</td>
                    <td className="border px-4 py-2">{screen.shortName}</td>
                    <td className="border px-4 py-2">{screen.isConcept ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default ScreenList;