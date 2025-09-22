import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { menuApi, orderApi, uploadApi } from '../../services/api';
import { Plus, Image as ImageIcon, Check, X, Loader2, RefreshCw, Eye, EyeOff, Trash2, UtensilsCrossed, Clock, IndianRupee, Package, Loader, ChefHat } from 'lucide-react';

const OwnerDashboard = () => {
  const { logout, token, user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [updatingOrderIds, setUpdatingOrderIds] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', type: 'veg', prepTimeMinutes: '', active: true, image: '' });
  const [menuSearch, setMenuSearch] = useState('');
  const [menuStatusFilter, setMenuStatusFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [orderFilter, setOrderFilter] = useState('active');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [orderSearch, setOrderSearch] = useState('');
  const [activeTab, setActiveTab] = useState('menu');
  const toggleOrderExpand = (id) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const loadMenu = async () => {
    if (!token) return;
    setLoadingMenu(true);
    try { const data = await menuApi.ownerList(token); setMenuItems(data); setError(null); } catch (e) { setError(e.message); }
    setLoadingMenu(false);
  };
  const loadOrders = async () => {
    if (!token) return;
    setLoadingOrders(true);
    try { const data = await orderApi.ownerList(token); setOrders(data); } catch (e) { /* ignore for now */ }
    setLoadingOrders(false);
  };

  useEffect(() => { loadMenu(); loadOrders(); // eslint-disable-next-line
  }, [token]);

  // auto-refresh orders every 5s while on orders tab and user authenticated
  useEffect(() => {
    if (!token) return;
    if (activeTab !== 'orders') return;
    const id = setInterval(() => {
      // avoid overlapping if already loading
      if (!loadingOrders) {
        loadOrders();
      }
    }, 5000);
    return () => clearInterval(id);
  }, [token, activeTab, loadingOrders]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const addItem = async (e) => {
    e.preventDefault();
    try {
      await menuApi.create(token, {
        name: form.name,
        price: Number(form.price),
        type: form.type,
        prepTimeMinutes: form.prepTimeMinutes ? Number(form.prepTimeMinutes) : undefined,
        image: form.image,
        active: form.active
      });
      setForm({ name: '', price: '', type: 'veg', prepTimeMinutes: '', active: true, image: '' });
      loadMenu();
    } catch (e) { alert(e.message); }
  };

  const handleImageSelect = async (e) => {
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
  };

  const toggleActive = async (id) => {
    try { await menuApi.toggle(token, id); loadMenu(); } catch (e) { alert(e.message); }
  };
  const deleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try { await menuApi.remove(token, id); loadMenu(); } catch (e) { alert(e.message); }
  };

  const updateOrderStatus = async (id, status) => {
    setUpdatingOrderIds(prev => [...prev, id]);
    try { await orderApi.updateStatus(token, id, status); await loadOrders(); } catch (e) { alert(e.message); }
    setUpdatingOrderIds(prev => prev.filter(x => x !== id));
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    setUpdatingOrderIds(prev => [...prev, id]);
    try { await orderApi.remove(token, id); await loadOrders(); } catch (e) { alert(e.message); }
    setUpdatingOrderIds(prev => prev.filter(x => x !== id));
  };

  const statusActions = (order) => {
    const s = order.status;
    const buttons = [];
    if (s === 'pending') buttons.push({ label: 'Accept', to: 'accepted' });
    if (s === 'accepted') buttons.push({ label: 'Start Prep', to: 'preparing' });
    if (s === 'preparing') buttons.push({ label: 'Mark Ready', to: 'ready' });
    if (s === 'ready') buttons.push({ label: 'Complete', to: 'completed' });
    if (s === 'completed') buttons.push({ label: 'Mark Paid', to: 'paid' });
    // universal cancel option until finished/cancelled
    if (!['completed','cancelled','paid'].includes(s)) buttons.push({ label: 'Cancel', to: 'cancelled', variant: 'danger' });
    return buttons;
  };

  const statusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'accepted': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'preparing': return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
      case 'ready': return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'completed': return 'bg-green-100 text-green-700 border border-green-200';
      case 'paid': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-600 border border-red-200';
      default: return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold flex items-center gap-2"><ChefHat className="h-7 w-7 text-primary-600" />Owner Dashboard</h1>
        <button onClick={logout} className="text-sm text-red-600">Logout</button>
      </div>
      <div className="flex gap-2 mb-6 border-b">
        {['menu','orders'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${activeTab===tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >{tab === 'menu' ? 'Menu' : 'Orders'}</button>
        ))}
      </div>
      {activeTab === 'menu' && (
        <>
  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><UtensilsCrossed className="h-5 w-5 text-primary-600" /> Menu Items</h2>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <input
          value={menuSearch}
          onChange={e => setMenuSearch(e.target.value)}
          placeholder="Search menu..."
          className="border px-3 py-2 rounded text-sm w-full md:w-64"
        />
        <div className="flex items-center gap-2 text-sm">
          <label className={`cursor-pointer px-2 py-1 rounded border text-xs ${menuStatusFilter==='all' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white'} `}>
            <input type="radio" name="menuStatus" value="all" className="hidden" onChange={() => setMenuStatusFilter('all')} />All
          </label>
          <label className={`cursor-pointer px-2 py-1 rounded border text-xs ${menuStatusFilter==='active' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white'} `}>
            <input type="radio" name="menuStatus" value="active" className="hidden" onChange={() => setMenuStatusFilter('active')} />Active
          </label>
            <label className={`cursor-pointer px-2 py-1 rounded border text-xs ${menuStatusFilter==='inactive' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white'} `}>
            <input type="radio" name="menuStatus" value="inactive" className="hidden" onChange={() => setMenuStatusFilter('inactive')} />Inactive
          </label>
        </div>
      </div>
      <form onSubmit={addItem} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded border mb-4">
        <input name="name" placeholder="Item Name" value={form.name} onChange={handleChange} required className="border px-3 py-2 rounded text-sm" />
        <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required className="border px-3 py-2 rounded text-sm" />
        <select name="type" value={form.type} onChange={handleChange} className="border px-3 py-2 rounded text-sm">
          <option value="veg">Veg</option>
          <option value="non-veg">Non Veg</option>
        </select>
        <input name="prepTimeMinutes" placeholder="Prep Time (mins)" value={form.prepTimeMinutes} onChange={handleChange} className="border px-3 py-2 rounded text-sm" />
        <div className="space-y-2">
          <input name="image" placeholder="Image URL or upload below" value={form.image} onChange={handleChange} className="border px-3 py-2 rounded text-sm w-full" />
          <div className="flex items-center gap-2 text-xs">
            <label className="bg-gray-100 hover:bg-gray-200 cursor-pointer px-3 py-1 rounded border text-gray-700 flex items-center gap-1">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              <span>{uploading ? 'Uploading...' : 'Image'}</span>
              <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" disabled={uploading} />
            </label>
            {form.image && <span className="text-[10px] text-green-600 truncate max-w-[140px]" title={form.image}>Set</span>}
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" name="active" checked={form.active} onChange={handleChange} /> Active (visible to users)</label>
        <div className="md:col-span-2">
          <button className="bg-primary-600 text-white px-4 py-2 rounded text-sm disabled:opacity-60 flex items-center gap-1" disabled={uploading}>{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {uploading ? 'Please wait...' : 'Add Item'}</button>
        </div>
      </form>
      {loadingMenu && <div className="text-sm text-gray-500 mb-2">Loading menu...</div>}
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      <div className="space-y-3 mb-8">
        {(() => {
          const filtered = menuItems.filter(m => {
            const matchText = m.name.toLowerCase().includes(menuSearch.toLowerCase());
            const statusOk = menuStatusFilter === 'all' || (menuStatusFilter === 'active' && m.active) || (menuStatusFilter === 'inactive' && !m.active);
            return matchText && statusOk;
          });
          if (!loadingMenu && filtered.length === 0) return <div className="text-sm text-gray-500">No items found.</div>;
          return filtered.map(m => {
            const fallback = 'https://via.placeholder.com/100x100.png?text=No+Img';
            return (
              <div key={m._id} className="bg-white border rounded p-4 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center ring-1 ring-gray-200 text-[10px] text-gray-400">
                    {m.image ? (
                      <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      <img src={fallback} alt="placeholder" className="w-full h-full object-cover opacity-70" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="font-medium flex items-center gap-2 truncate">
                      <span className="truncate max-w-[180px]" title={m.name}>{m.name}</span>
                      <span className="text-xs text-gray-500">({m.type})</span>
                      {!m.active && (<span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">Inactive</span>)}
                    </p>
                    <p className="text-xs text-gray-500">Rs {m.price} • {m.prepTimeMinutes || 0} mins</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleActive(m._id)} className="text-xs px-2 py-1 rounded bg-gray-100 flex items-center gap-1">{m.active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}{m.active ? 'Deactivate' : 'Activate'}</button>
                  <button onClick={() => deleteItem(m._id)} className="text-xs px-2 py-1 rounded bg-red-100 text-red-600 flex items-center gap-1"><Trash2 className="h-3 w-3" />Delete</button>
                </div>
              </div>
            );
          });
        })()}
      </div>
      </>
      )}

      {activeTab === 'orders' && (
        <>
  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><Package className="h-5 w-5 text-primary-600" /> Orders</h2>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
          {[
            { key: 'active', label: 'Active' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled' },
            { key: 'all', label: 'All' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setOrderFilter(f.key)}
              className={`px-3 py-1 rounded border ${orderFilter===f.key ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 hover:text-gray-800'}`}
            >{f.label}</button>
          ))}
          </div>
          <input
            value={orderSearch}
            onChange={e => setOrderSearch(e.target.value)}
            placeholder="Search order #..."
            className="border px-3 py-2 rounded text-sm w-full md:w-56"
          />
        </div>
        {loadingOrders && <div className="text-sm text-gray-500">Loading orders...</div>}
        <div className="space-y-4">
          {(() => {
            const filtered = orders.filter(o => {
              if (orderFilter === 'all') return true;
              if (orderFilter === 'active') return !['completed','cancelled','paid'].includes(o.status);
              return o.status === orderFilter; // completed or cancelled specific
            });
            const searched = filtered.filter(o => {
              if (!orderSearch.trim()) return true;
              const num = o.orderNumber != null ? String(o.orderNumber).padStart(4,'0') : o._id.slice(-6);
              return num.includes(orderSearch.trim());
            });
            if (!loadingOrders && searched.length === 0) return <div className="text-sm text-gray-500">No orders found.</div>;
            return searched.map(o => {
            const isUpdating = updatingOrderIds.includes(o._id);
            const displayNum = o.orderNumber != null ? String(o.orderNumber).padStart(4,'0') : o._id.slice(-6);
            return (
              <div key={o._id} className="bg-white border rounded p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm flex items-center gap-2">Order #{displayNum} <span className={`ml-1 px-2 py-0.5 rounded text-xs capitalize ${statusBadgeClass(o.status)}`}>{o.status}</span>
                      <button
                        type="button"
                        onClick={() => toggleOrderExpand(o._id)}
                        className="text-[10px] px-2 py-0.5 rounded border bg-gray-50 hover:bg-gray-100 flex items-center gap-1"
                      >{expandedOrders[o._id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}{expandedOrders[o._id] ? 'Hide' : 'Show'}</button>
                    </p>
                    <p className="text-xs text-gray-500">Table {o.tableNumber} • Total Rs {o.total}</p>
                    { (o.customerName || o.customerContact) && (
                      <p className="text-[11px] text-gray-500 mt-1">{o.customerName} {o.customerContact && '• '+o.customerContact}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {statusActions(o).map(btn => {
                      const iconMap = {
                        'Accept': <Check className="h-3 w-3" />,
                        'Start Prep': <Loader className="h-3 w-3" />,
                        'Mark Ready': <RefreshCw className="h-3 w-3" />,
                        'Complete': <Check className="h-3 w-3" />,
                        'Cancel': <X className="h-3 w-3" />
                      };
                      return (
                        <button
                          key={btn.label}
                          disabled={isUpdating}
                          onClick={() => updateOrderStatus(o._id, btn.to)}
                          className={`text-xs px-2 py-1 rounded border flex items-center gap-1 ${btn.variant==='danger' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-primary-600 text-white border-primary-600'} disabled:opacity-50`}
                        >{iconMap[btn.label]}{btn.label}</button>
                      );
                    })}
                    {['completed','cancelled','paid'].includes(o.status) && (
                      <button
                        disabled={isUpdating}
                        onClick={() => deleteOrder(o._id)}
                        className="text-xs px-2 py-1 rounded border bg-white text-red-600 border-red-300 disabled:opacity-50 flex items-center gap-1"
                      ><Trash2 className="h-3 w-3" />Delete</button>
                    )}
                  </div>
                </div>
                {expandedOrders[o._id] && (
                  <div className="mt-3 border-t pt-3">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-gray-500">
                          <th className="py-1 font-medium w-16">Image</th>
                          <th className="py-1 font-medium">Item</th>
                          <th className="py-1 font-medium w-14">Qty</th>
                          <th className="py-1 font-medium w-20">Price</th>
                          <th className="py-1 font-medium w-24">Line Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {o.items.map((it, idx) => {
                          const fallback = 'https://via.placeholder.com/60x60.png?text=No+Img';
                          const img = it.item?.image;
                          return (
                            <tr key={idx} className="border-t align-middle">
                              <td className="py-1 pr-2">
                                <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 ring-1 ring-gray-200 flex items-center justify-center">
                                  {img ? (
                                    <img src={img} alt={it.item?.name || 'item'} className="w-full h-full object-cover" />
                                  ) : (
                                    <img src={fallback} alt="placeholder" className="w-full h-full object-cover opacity-70" />
                                  )}
                                </div>
                              </td>
                              <td className="py-1 pr-2 max-w-[160px] truncate" title={it.item?.name}>{it.item?.name || 'Item deleted'}</td>
                              <td className="py-1">{it.quantity}</td>
                              <td className="py-1">Rs {it.price}</td>
                              <td className="py-1">Rs {it.price * it.quantity}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
            });
          })()}
        </div>
        </>
      )}
    </div>
  );
};

export default OwnerDashboard;
