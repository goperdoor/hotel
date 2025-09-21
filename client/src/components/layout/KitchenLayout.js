import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  ChefHat, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  LogOut,
  Menu,
  Bell,
  User,
  RefreshCw,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const KitchenLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { socket, isConnected } = useSocket();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
  });

  // Socket listeners for real-time updates
  useEffect(() => {
    if (socket && user?.hotel) {
      socket.emit('join-kitchen', user.hotel);
      
      socket.on('new-order', handleNewOrder);
      socket.on('order-updated', handleOrderUpdate);
      socket.on('kitchen-stats', setStats);
      
      return () => {
        socket.off('new-order', handleNewOrder);
        socket.off('order-updated', handleOrderUpdate);
        socket.off('kitchen-stats', setStats);
      };
    }
  }, [socket, user]);

  const handleNewOrder = (order) => {
    setStats(prev => ({
      ...prev,
      pendingOrders: prev.pendingOrders + 1,
    }));
    
    setNotifications(prev => [
      {
        id: Date.now(),
        type: 'new-order',
        message: `New order #${order._id.slice(-6)} received`,
        timestamp: new Date(),
      },
      ...prev.slice(0, 4) // Keep only last 5 notifications
    ]);
    
    toast.success(`New order received: #${order._id.slice(-6)}`, {
      duration: 5000,
      icon: '🔔',
    });
  };

  const handleOrderUpdate = (order) => {
    // Update stats based on status change
    setStats(prev => {
      const newStats = { ...prev };
      
      switch (order.status) {
        case 'preparing':
          newStats.pendingOrders = Math.max(0, prev.pendingOrders - 1);
          newStats.preparingOrders = prev.preparingOrders + 1;
          break;
        case 'ready':
          newStats.preparingOrders = Math.max(0, prev.preparingOrders - 1);
          newStats.readyOrders = prev.readyOrders + 1;
          break;
        case 'delivered':
          newStats.readyOrders = Math.max(0, prev.readyOrders - 1);
          break;
        default:
          break;
      }
      
      return newStats;
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getConnectionStatus = () => {
    if (isConnected) {
      return (
        <div className="flex items-center text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <span className="text-xs">Connected</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-red-600">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
          <span className="text-xs">Disconnected</span>
        </div>
      );
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 bg-gray-800">
        <div className="flex items-center">
          <ChefHat className="h-8 w-8 text-orange-400" />
          <span className="ml-2 text-white font-semibold text-lg">Kitchen</span>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-orange-100 p-2 rounded-full">
              <User className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-gray-400">Kitchen Staff</p>
            </div>
          </div>
        </div>
        <div className="mt-2">
          {getConnectionStatus()}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Order Status</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-yellow-400 mr-2" />
              <span className="text-sm text-gray-300">Pending</span>
            </div>
            <span className="text-sm font-medium text-white bg-yellow-600 px-2 py-1 rounded">
              {stats.pendingOrders}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ChefHat className="h-4 w-4 text-blue-400 mr-2" />
              <span className="text-sm text-gray-300">Preparing</span>
            </div>
            <span className="text-sm font-medium text-white bg-blue-600 px-2 py-1 rounded">
              {stats.preparingOrders}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
              <span className="text-sm text-gray-300">Ready</span>
            </div>
            <span className="text-sm font-medium text-white bg-green-600 px-2 py-1 rounded">
              {stats.readyOrders}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="p-4 border-b border-gray-700 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-300">Recent Activity</h3>
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="text-xs text-gray-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-xs text-gray-500">No recent activity</p>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="bg-gray-800 p-2 rounded text-xs">
                <div className="flex items-start">
                  <Bell className="h-3 w-3 text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-300">{notification.message}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-3" />
          Refresh
        </button>
        
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-400 rounded-lg hover:bg-red-900 hover:bg-opacity-20 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
          <div className="fixed top-0 left-0 w-64 h-full">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center">
              <ChefHat className="h-6 w-6 text-orange-600" />
              <span className="ml-2 text-gray-900 font-semibold">Kitchen</span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Urgent Orders Indicator */}
              {stats.pendingOrders > 0 && (
                <div className="flex items-center bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">{stats.pendingOrders}</span>
                </div>
              )}
              
              {/* Connection Status */}
              <div className="hidden sm:block">
                {getConnectionStatus()}
              </div>
              
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Alert Bar for Urgent Orders */}
        {stats.pendingOrders > 5 && (
          <div className="bg-red-600 text-white px-4 py-2 text-center">
            <div className="flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">
                High order volume: {stats.pendingOrders} pending orders
              </span>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default KitchenLayout;