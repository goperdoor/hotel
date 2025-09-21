import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { hotelApi, uploadApi } from '../../services/api';

const AdminDashboard = () => {
  const { logout, token } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: '',
    type: 'veg',
    location: '',
    rating: 0,
    email: '',
    password: '',
    confirmPassword: '',
    active: true,
    image: ''
  });
  const [uploading, setUploading] = useState(false);

  const loadHotels = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await hotelApi.listAdmin(token);
      setHotels(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { loadHotels(); // eslint-disable-next-line
  }, [token]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const addHotel = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return alert('Passwords do not match');
    try {
      await hotelApi.create(token, {
        name: form.name,
        type: form.type,
        location: form.location,
        rating: Number(form.rating),
        email: form.email,
        password: form.password,
        active: form.active,
        image: form.image
      });
      setForm({ name: '', type: 'veg', location: '', rating: 0, email: '', password: '', confirmPassword: '', active: true, image: '' });
      loadHotels();
    } catch (e) {
      alert(e.message);
    }
  };

  const toggleActive = async (id) => {
    try { await hotelApi.toggle(token, id); loadHotels(); } catch (e) { alert(e.message); }
  };

  const deleteHotel = async (id) => {
    if (!window.confirm('Delete this hotel?')) return;
    try { await hotelApi.remove(token, id); loadHotels(); } catch (e) { alert(e.message); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <button onClick={logout} className="text-sm text-red-600">Logout</button>
      </div>

      <form onSubmit={addHotel} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded border mb-8">
        <input name="name" placeholder="Hotel Name" value={form.name} onChange={handleChange} required className="border px-3 py-2 rounded text-sm" />
        <select name="type" value={form.type} onChange={handleChange} className="border px-3 py-2 rounded text-sm">
          <option value="veg">Veg</option>
          <option value="non-veg">Non Veg</option>
        </select>
        <input name="location" placeholder="Location" value={form.location} onChange={handleChange} className="border px-3 py-2 rounded text-sm" />
        <input name="rating" type="number" step="0.1" placeholder="Rating" value={form.rating} onChange={handleChange} className="border px-3 py-2 rounded text-sm" />
        <input name="email" type="email" placeholder="Owner Email" value={form.email} onChange={handleChange} className="border px-3 py-2 rounded text-sm" />
        <div className="space-y-2">
          <input name="image" placeholder="Image URL or upload below" value={form.image} onChange={handleChange} className="border px-3 py-2 rounded text-sm w-full" />
          <div className="flex items-center gap-2 text-xs">
            <label className="bg-gray-100 hover:bg-gray-200 cursor-pointer px-3 py-1 rounded border text-gray-700">
              <span>{uploading ? 'Uploading...' : 'Upload Logo'}</span>
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                try {
                  const res = await uploadApi.image(token, file);
                  setForm(prev => ({ ...prev, image: res.url }));
                } catch (err) {
                  alert(err.message);
                } finally {
                  setUploading(false);
                }
              }} />
            </label>
            {form.image && <span className="text-[10px] text-green-600 truncate max-w-[140px]" title={form.image}>Set</span>}
          </div>
        </div>
        <input name="password" type="password" placeholder="Owner Password" value={form.password} onChange={handleChange} className="border px-3 py-2 rounded text-sm" />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} className="border px-3 py-2 rounded text-sm" />
        <label className="flex items-center space-x-2 text-sm">
          <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
          <span>Active</span>
        </label>
        <div className="md:col-span-2">
          <button className="bg-primary-600 text-white px-4 py-2 rounded text-sm disabled:opacity-60" disabled={uploading}>{uploading ? 'Please wait...' : 'Add Hotel'}</button>
        </div>
      </form>

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Hotels</h2>
        <button onClick={loadHotels} className="text-xs px-2 py-1 bg-gray-100 rounded">Refresh</button>
      </div>
      {loading && <div className="text-sm text-gray-500">Loading...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="space-y-3">
        {(!loading && hotels.length === 0) && <div className="text-sm text-gray-500">No hotels found.</div>}
        {hotels.map(h => (
          <div key={h._id} className="bg-white border rounded p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {h.image && <img src={h.image} alt={h.name} className="w-12 h-12 object-cover rounded border" />}
              <div>
                <p className="font-medium">{h.name} <span className="text-xs text-gray-500">({h.type})</span></p>
                <p className="text-xs text-gray-500">{h.location} • Rating: {h.rating} • {h.active ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleActive(h._id)} className="text-xs px-2 py-1 rounded bg-gray-100">{h.active ? 'Deactivate' : 'Activate'}</button>
              <button onClick={() => deleteHotel(h._id)} className="text-xs px-2 py-1 rounded bg-red-100 text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
