import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Star, Clock, MapPin } from 'lucide-react';
import { hotelApi } from '../services/api';

const isWithinBusinessHours = (open, close) => {
  if (!open || !close) return true;
  const now = new Date();
  const [openH, openM] = open.split(':').map(Number);
  const [closeH, closeM] = close.split(':').map(Number);
  const openTime = new Date();
  openTime.setHours(openH, openM, 0, 0);
  const closeTime = new Date();
  closeTime.setHours(closeH, closeM, 0, 0);
  return now >= openTime && now <= closeTime;
};

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search') || '';
    setSearch(q);
    const load = async () => {
      setLoading(true);
      try {
        const data = await hotelApi.publicList(q);
        setHotels(data);
        setError(null);
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    };
    load();
  }, [location.search]);

  const handleHotelClick = (hotelId) => {
    navigate(`/hotel/${hotelId}`);
  };
  const filteredHotels = hotels; // server already filters if search provided

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Order Food from Your Favorite Hotels
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Fresh, delicious meals delivered to your table
          </p>

          {/* Search Bar */}
          <form onSubmit={(e) => { e.preventDefault(); navigate(`/?search=${encodeURIComponent(search)}`); }} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search hotels..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-32 py-4 text-gray-900 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
              <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-2 px-6 py-2 bg-secondary-600 hover:bg-secondary-700 text-white rounded-md font-medium transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Hotels Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="text-center text-gray-500">Loading hotels...</div>
        )}
        {error && (
          <div className="text-center text-red-600">{error}</div>
        )}
        {!loading && filteredHotels.length === 0 && !error && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hotels found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => (
            <HotelCard
              key={hotel._id}
              hotel={hotel}
              onClick={() => handleHotelClick(hotel._id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

// Hotel Card Component
const HotelCard = ({ hotel, onClick }) => {
  const isOpen = isWithinBusinessHours('08:00', '23:00');
  return (
    <div
      onClick={onClick}
      className="card hover:shadow-lg transition-shadow cursor-pointer group"
    >
      {/* Hotel Image */}
      <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-gray-200">
        {hotel.image ? (
          <img
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl font-bold">{hotel.name.charAt(0)}</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isOpen
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>

      {/* Hotel Info */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
          {hotel.name}
        </h3>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-current text-yellow-400" />
            <span className="text-sm font-medium text-gray-900">
              {(hotel.rating || 0).toFixed(1)}
            </span>
          </div>
          <div className="text-xs text-gray-500">{hotel.type}</div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{hotel.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;