import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Clock, CheckCircle, Truck, ArrowLeft, RefreshCw } from 'lucide-react';
import { orderApi } from '../services/api';

// Inline helper utilities (previously imported from missing helpers file)
const formatCurrency = (n) => `Rs ${Number(n || 0).toFixed(2)}`;
const formatDateTime = (d) => {
  try { return new Date(d).toLocaleString(); } catch { return '--'; }
};
const getStatusClass = (status) => {
  switch (status) {
    case 'pending': return 'bg-gray-100 text-gray-700';
    case 'accepted': return 'bg-blue-100 text-blue-700';
    case 'preparing': return 'bg-yellow-100 text-yellow-700';
    case 'ready': return 'bg-indigo-100 text-indigo-700';
    case 'completed': return 'bg-green-100 text-green-700';
    case 'cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-600';
  }
};
const getOrderProgress = (status) => {
  const map = {
    pending: 10,
    accepted: 30,
    preparing: 60,
    ready: 85,
    completed: 100,
    cancelled: 0,
  };
  return map[status] ?? 0;
};

// Simple toast stand‑ins (optional). If you later add react-hot-toast, replace these.
const toast = {
  success: (m) => console.log('SUCCESS:', m),
  error: (m) => console.error('ERROR:', m)
};

const OrderTrackingPage = () => {
  const { orderNumber: urlOrderNumber } = useParams();
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState(urlOrderNumber || '');
  const [trackingData, setTrackingData] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  // Track order function
  const trackOrder = async (orderNum = orderNumber) => {
    if (!orderNum.trim()) {
      toast.error('Please enter an order number');
      return;
    }

    setIsTracking(true);
    try {
      const order = await orderApi.byNumber(orderNum.trim());
      setTrackingData(order);
      // Real-time socket updates removed until socket service is implemented
    } catch (error) {
      toast.error(error.message || 'Order not found');
      setTrackingData(null);
    } finally {
      setIsTracking(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    trackOrder();
  };

  // Track order on mount if order number is provided
  useEffect(() => {
    if (urlOrderNumber) {
      trackOrder(urlOrderNumber);
    }
  }, [urlOrderNumber]);

  // Real-time updates disabled (socket service not present). Re-enable when available.
  // Poll every 3s while order is active
  useEffect(() => {
    if (!trackingData || !orderNumber) return;
    if (['completed','cancelled'].includes(trackingData.status)) return; // stop polling for terminal states
    const id = setInterval(() => {
      if (!isTracking) {
        trackOrder(orderNumber);
      }
    }, 3000);
    return () => clearInterval(id);
  }, [trackingData, orderNumber, isTracking]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => navigate('/')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold">Track Your Order</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="card mb-8">
          <h2 className="text-lg font-semibold mb-4">Enter Order Details</h2>
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Enter your order number (e.g., ORD123456)"
                className="input-field"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isTracking}
              className="btn-primary disabled:opacity-50"
            >
              {isTracking ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Tracking...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Track Order
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Details */}
        {trackingData && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Order #{String(trackingData.orderNumber).padStart(4,'0')}
                  </h2>
                  <p className="text-gray-600">
                    Placed on {formatDateTime(trackingData.createdAt)}
                  </p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusClass(trackingData.status)}`}>
                    {trackingData.status.charAt(0).toUpperCase() + trackingData.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Hotel Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                {/* Hotel info not populated in current simplified order structure unless populated server-side */}
                <p className="text-sm text-gray-600">Hotel ID: {trackingData.hotel}</p>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{trackingData.customerName}</p>
                </div>
                <div></div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium text-primary-600">
                    {formatCurrency(trackingData.total)}
                  </p>
                </div>
              </div>

              {/* Order Progress */}
              <OrderProgress status={trackingData.status} />
            </div>

            {/* Order Items */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>
              <div className="space-y-3">
                {trackingData.items.map((it, index) => {
                  const name = it.item?.name || 'Item';
                  const lineTotal = it.price * it.quantity;
                  return (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{name}</h4>
                        <p className="text-sm text-gray-600">Qty: {it.quantity} @ Rs {it.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(lineTotal)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {trackingData.specialInstructions && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Special Instructions:</strong> {trackingData.specialInstructions}
                  </p>
                </div>
              )}
            </div>

            {/* Estimated Time */}
            {trackingData.estimatedDeliveryTime && trackingData.status !== 'served' && trackingData.status !== 'cancelled' && (
              <div className="card bg-blue-50 border-blue-200">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-900">Estimated Ready Time</p>
                    <p className="text-blue-700">
                      {formatDateTime(trackingData.estimatedDeliveryTime)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => trackOrder()}
                className="btn-outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn-primary"
              >
                Order More Food
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="card mt-8">
          <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• Your order number was provided when you placed the order</p>
            <p>• Order status updates in real-time</p>
            <p>• Contact the restaurant directly if you have any concerns</p>
            <p>• Orders typically take 15-30 minutes to prepare</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Order Progress Component
const OrderProgress = ({ status }) => {
  const steps = [
    { key: 'pending', label: 'Placed', icon: CheckCircle },
    { key: 'accepted', label: 'Accepted', icon: CheckCircle },
    { key: 'preparing', label: 'Preparing', icon: Clock },
    { key: 'ready', label: 'Ready', icon: Truck },
    { key: 'completed', label: 'Completed', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(step => step.key === status);
  const progress = getOrderProgress(status);

  if (status === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-medium">Order Cancelled</p>
        <p className="text-red-600 text-sm">Your order has been cancelled.</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Order Status</h3>
        <span className="text-sm text-gray-600">{progress}% Complete</span>
      </div>
      
      {/* Progress Bar */}
      <div className="progress-bar mb-6">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step.key} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  isCompleted
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : isCurrent
                    ? 'bg-primary-100 border-primary-600 text-primary-600'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}
              >
                <StepIcon className="h-5 w-5" />
              </div>
              <p
                className={`mt-2 text-xs text-center ${
                  isCompleted || isCurrent ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTrackingPage;