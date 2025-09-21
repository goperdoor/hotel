import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, Clock, MapPin, ArrowLeft, IndianRupee, Plus, UtensilsCrossed } from 'lucide-react';
import { hotelApi, menuApi, orderApi } from '../services/api';

const HotelDetailPage = () => {
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);

  useEffect(() => {
    if (!hotelId) return;
    const load = async () => {
      setLoading(true);
      try {
        const h = await hotelApi.publicGet(hotelId);
        setHotel(h);
        const m = await menuApi.publicList(hotelId);
        setMenu(m);
        setError(null);
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    };
    load();
  }, [hotelId]);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(ci => ci.item._id === item._id);
      if (existing) return prev.map(ci => ci.item._id === item._id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      return [...prev, { item, quantity: 1 }];
    });
  };
  const updateQty = (id, delta) => {
    setCart(prev => prev.map(ci => ci.item._id === id ? { ...ci, quantity: Math.max(1, ci.quantity + delta) } : ci));
  };
  const removeFromCart = (id) => setCart(prev => prev.filter(ci => ci.item._id !== id));
  const total = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);

  const placeOrder = async () => {
    if (!cart.length) return;
    setPlacing(true);
    try {
  const payload = { hotelId: hotelId, items: cart.map(ci => ({ item: ci.item._id, quantity: ci.quantity, price: ci.item.price })) };
  const order = await orderApi.create(payload);
  setOrderId(order._id);
  if (order.orderNumber != null) setOrderNumber(order.orderNumber);
      setCart([]);
    } catch (e) { alert(e.message); }
    setPlacing(false);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!hotel) return <div className="p-6">Not found</div>;
  const isOpen = true;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button onClick={() => navigate('/')} className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold">{hotel.name}</h1>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              {hotel.image ? (
                <img src={hotel.image} alt={hotel.name} className="w-full h-48 object-cover rounded-lg" />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-400">{hotel.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{hotel.name}</h2>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 fill-current text-yellow-400 mr-1" />
                  <span className="font-medium">{(hotel.rating || 0).toFixed(1)}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{isOpen ? 'Open' : 'Closed'}</span>
              </div>
              <p className="text-gray-600 mb-4">{hotel.location}</p>
              <div className="text-xs text-gray-500">{hotel.type}</div>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><UtensilsCrossed className="h-5 w-5 text-primary-600" /> Menu</h3>
            <div className="space-y-3">
              {menu.length === 0 && <div className="text-sm text-gray-500">No items available.</div>}
              {menu.map(item => {
                const fallback = 'https://via.placeholder.com/120x120.png?text=No+Img';
                return (
                  <div key={item._id} className="bg-white border rounded p-5 flex items-center justify-between gap-6 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-5">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center ring-1 ring-gray-200">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <img src={fallback} alt="placeholder" className="w-full h-full object-cover opacity-70" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-3">
                          <span className="flex items-center gap-1"><IndianRupee className="h-4 w-4" /> {item.price}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">{item.type}</span>
                        </p>
                      </div>
                    </div>
                    <button onClick={() => addToCart(item)} className="text-sm px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md shadow-sm flex items-center gap-1"><Plus className="h-4 w-4" /> Add</button>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Cart</h3>
            <div className="bg-white border rounded p-4 space-y-3">
              {cart.length === 0 && <div className="text-sm text-gray-500">No items.</div>}
              {cart.map(ci => (
                <div key={ci.item._id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{ci.item.name}</p>
                    <p className="text-xs text-gray-500">Rs {ci.item.price} x {ci.quantity}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(ci.item._id, -1)} className="px-2 py-1 bg-gray-100 rounded">-</button>
                    <span>{ci.quantity}</span>
                    <button onClick={() => updateQty(ci.item._id, 1)} className="px-2 py-1 bg-gray-100 rounded">+</button>
                    <button onClick={() => removeFromCart(ci.item._id)} className="px-2 py-1 bg-red-100 text-red-600 rounded">x</button>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t mt-2 text-sm flex items-center justify-between">
                <span>Total</span>
                <span className="font-semibold">Rs {total}</span>
              </div>
              <button disabled={!cart.length || placing} onClick={placeOrder} className="w-full bg-primary-600 text-white py-2 rounded text-sm disabled:opacity-50">
                {placing ? 'Placing...' : 'Place Order'}
              </button>
              {orderId && (
                <div className="text-xs text-green-600 space-y-1">
                  <div>Order placed!</div>
                  {orderNumber != null ? (
                    <div>Your Order Number: <span className="font-semibold">{String(orderNumber).padStart(4,'0')}</span></div>
                  ) : (
                    <div>Ref: {orderId.slice(-8)}</div>
                  )}
                  <div>
                    <button onClick={() => navigate(`/track-order/${orderNumber != null ? String(orderNumber).padStart(4,'0') : ''}`)} className="underline text-primary-600">Track Order</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetailPage;