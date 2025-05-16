import { useEffect, useState } from "react";
import { FaSearch, FaSpinner, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const BookingMovie = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    title: "",
    date: "",
    page: 1,
  });
  const [loading, setLoading] = useState(false);
  const [films, setFilms] = useState([]);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const handleMovieBooking = (film) => {
    navigate("/seat-booking", {
      state: {
        filmId: film.id,
        movieTitle: film.title,
        openingDate: film.openingDate,
        distributorName: film.distributorName,
      },
    });
  };

  const fetchFilms = async (e, newPage = searchParams.page) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:3000/films/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: searchParams.title,
          from: searchParams.date,
          page: newPage,
          limit: 10,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch films");
      }

      setFilms(data.data);
      setPagination(data.pagination);
      setSearchParams((prev) => ({ ...prev, page: data.pagination.page }));
    } catch (err) {
      setError(err.message);
      setFilms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilms();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    fetchFilms(null, newPage);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-800 text-white shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <form
            onSubmit={fetchFilms}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="flex-grow">
              <input
                type="text"
                name="title"
                placeholder="Search movies..."
                className="w-full px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchParams.title}
                onChange={handleInputChange}
              />
            </div>

            <input
              type="date"
              name="date"
              className="px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchParams.date}
              onChange={handleInputChange}
            />

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-70"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
              Search
            </button>
          </form>
        </div>
      </nav>

      <div className="container mx-auto py-6 px-4">
        {loading && (
          <div className="flex justify-center py-8">
            <FaSpinner className="animate-spin text-4xl text-blue-600" />
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}

        {!loading && films.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No movies found. Try a different search.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {films.map((film) => (
            <div
              key={film.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-4">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {film.title}
                </h2>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <strong>Rating:</strong> {film.rating || "N/A"}
                  </p>
                  {film.openingDate && (
                    <p>
                      <strong>Release Date:</strong>{" "}
                      {new Date(film.openingDate).toLocaleDateString()}
                    </p>
                  )}
                  {film.distributorName && (
                    <p>
                      <strong>Distributor:</strong> {film.distributorName}
                    </p>
                  )}
                </div>
                {film.synopsis && (
                  <p className="mt-3 text-gray-700 text-sm line-clamp-3">
                    {film.synopsis}
                  </p>
                )}
                <button
                  className="mt-3 p-2 text-md rounded-md bg-blue-800 text-white hover:bg-blue-700"
                  onClick={() => handleMovieBooking(film)}
                >
                  Book now
                </button>
              </div>
            </div>
          ))}
        </div>

        {films.length > 0 && pagination.pages > 1 && (
          <div className="flex items-center justify-center mt-8 gap-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              First
            </button>

            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex items-center px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              <FaArrowLeft className="mr-1" size={12} /> Prev
            </button>

            <div className="px-3 py-1 bg-white border border-gray-300 rounded">
              Page {pagination.page} of {pagination.pages}
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="flex items-center px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Next <FaArrowRight className="ml-1" size={12} />
            </button>

            <button
              onClick={() => handlePageChange(pagination.pages)}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Last
            </button>
          </div>
        )}

        {films.length > 0 && (
          <div className="text-center mt-4 text-sm text-gray-600">
            Showing {films.length} of {pagination.total} results
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingMovie;