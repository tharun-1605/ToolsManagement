import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Store,
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  Eye,
  Plus,
  BarChart3
} from 'lucide-react';
import StatsCard from '../common/StatsCard';
import ShopsList from '../shops/ShopsList';
import OrdersList from '../orders/OrdersList';
import ToolMonitor from '../tools/ToolMonitor';
import UsageChart from '../charts/UsageChart';

const SupervisorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [tools, setTools] = useState([]);
  const [orders, setOrders] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, toolsRes, ordersRes] = await Promise.all([
        axios.get('https://toolsmanagement.onrender.com/api/dashboard/stats'),
        axios.get('https://toolsmanagement.onrender.com/api/tools'),
        axios.get('https://toolsmanagement.onrender.com/api/orders')
      ]);

      setStats(statsRes.data);
      setTools(toolsRes.data);
      setOrders(ordersRes.data);
      
      // Group tools by shop
      const shopMap = {};
      toolsRes.data.forEach(tool => {
        const shopName = tool.shopkeeper?.shopName || 'Unknown';
        if (!shopMap[shopName]) {
          shopMap[shopName] = {
            shopName,
            shopkeeper: tool.shopkeeper,
            tools: []
          };
        }
        shopMap[shopName].tools.push(tool);
      });
      setShops(Object.values(shopMap));
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (toolId, quantity, notes) => {
    try {
      await axios.post('https://toolsmanagement.onrender.com/api/orders', {
        toolId,
        quantity,
        notes
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'shops', label: 'All Shops', icon: Store },
    { id: 'orders', label: 'My Orders', icon: ShoppingCart },
    { id: 'monitor', label: 'Tool Monitor', icon: Eye },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders || 0}
          icon={ShoppingCart}
          color="green"
        />
        <StatsCard
          title="Pending Orders"
          value={stats.pendingOrders || 0}
          icon={AlertTriangle}
          color="yellow"
        />
        <StatsCard
          title="Approved Orders"
          value={stats.approvedOrders || 0}
          icon={TrendingUp}
          color="blue"
        />
        <StatsCard
          title="Low Life Tools"
          value={stats.lowLifeTools || 0}
          icon={AlertTriangle}
          color="red"
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
                    ? 'border-green-500 text-green-600'
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
                      order.status === 'fulfilled' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools Alert */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Tools Below Threshold
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
                          {tool.remainingLife.toFixed(1)}h remaining (Shop: {tool.shopkeeper?.shopName})
                        </p>
                      </div>
                      <button
                        onClick={() => handlePlaceOrder(tool._id, 1, 'Urgent replacement needed')}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded-full hover:bg-green-700 transition-colors"
                      >
                        Order
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shops' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">All Shops & Tools</h2>
            <ShopsList 
              shops={shops}
              onPlaceOrder={handlePlaceOrder}
            />
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">My Orders</h2>
            <OrdersList 
              orders={orders}
              userRole="supervisor"
            />
          </div>
        )}

        {activeTab === 'monitor' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Tool Monitor</h2>
            <ToolMonitor tools={tools} />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Usage Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UsageChart title="Tool Usage Overview" />
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shop Performance</h3>
                <div className="space-y-4">
                  {shops.map((shop) => (
                    <div key={shop.shopName} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{shop.shopName}</p>
                        <p className="text-sm text-gray-600">{shop.tools.length} tools</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {shop.tools.filter(tool => tool.status === 'available').length} Available
                        </p>
                        <p className="text-xs text-gray-500">
                          {shop.tools.filter(tool => tool.remainingLife <= tool.thresholdLimit).length} Low Life
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorDashboard;