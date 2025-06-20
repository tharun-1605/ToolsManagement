import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Wrench, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  Edit,
  Trash2,
  Check,
  X,
  Package,
  Clock
} from 'lucide-react';
import StatsCard from '../common/StatsCard';
import ToolForm from '../tools/ToolForm';
import ToolsList from '../tools/ToolsList';
import OrdersList from '../orders/OrdersList';

const ShopkeeperDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [tools, setTools] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToolForm, setShowToolForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, toolsRes, ordersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/dashboard/stats'),
        axios.get('http://localhost:5000/api/tools'),
        axios.get('http://localhost:5000/api/orders')
      ]);

      setStats(statsRes.data);
      setTools(toolsRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId, status, notes = '') => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, {
        status,
        notes
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'tools', label: 'Manage Tools', icon: Wrench },
    { id: 'orders', label: 'Orders', icon: ShoppingCart }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Tools"
          value={stats.totalTools || 0}
          icon={Wrench}
          color="blue"
        />
        <StatsCard
          title="Low Life Tools"
          value={stats.lowLifeTools || 0}
          icon={AlertTriangle}
          color="red"
        />
        <StatsCard
          title="Pending Orders"
          value={stats.pendingOrders || 0}
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="Total Stock"
          value={stats.totalStock || 0}
          icon={Package}
          color="green"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{order.tool?.name}</p>
                      <p className="text-sm text-gray-600">Qty: {order.quantity}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Life Tools Alert */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Tools Requiring Attention
              </h3>
              <div className="space-y-3">
                {tools
                  .filter(tool => tool.remainingLife <= tool.thresholdLimit)
                  .slice(0, 5)
                  .map((tool) => (
                    <div key={tool._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <p className="font-medium text-gray-900">{tool.name}</p>
                        <p className="text-sm text-red-600">
                          {tool.remainingLife.toFixed(1)}h remaining
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        Low Life
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Manage Tools</h2>
              <button
                onClick={() => setShowToolForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Tool
              </button>
            </div>
            
            <ToolsList 
              tools={tools} 
              onUpdate={fetchData}
              userRole="shopkeeper"
            />
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Management</h2>
            <OrdersList 
              orders={orders}
              onStatusUpdate={handleOrderStatusUpdate}
              userRole="shopkeeper"
            />
          </div>
        )}
      </div>

      {/* Tool Form Modal */}
      {showToolForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <ToolForm
              onSubmit={() => {
                setShowToolForm(false);
                fetchData();
              }}
              onCancel={() => setShowToolForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopkeeperDashboard;