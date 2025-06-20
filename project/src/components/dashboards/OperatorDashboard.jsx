import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Play,
  Square,
  Clock,
  TrendingUp, 
  Wrench,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import StatsCard from '../common/StatsCard';
import ToolsList from '../tools/ToolsList';
import UsageChart from '../charts/UsageChart';
import ActiveUsageList from '../usage/ActiveUsageList';

const OperatorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [tools, setTools] = useState([]);
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, toolsRes, usageRes] = await Promise.all([
        axios.get('https://toolsmanagement.onrender.com/api/dashboard/stats'),
        axios.get('https://toolsmanagement.onrender.com/api/tools'),
        axios.get('https://toolsmanagement.onrender.com/api/usage')
      ]);

      setStats(statsRes.data);
      setTools(toolsRes.data);
      setUsage(usageRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartUsage = async (toolId) => {
    try {
      await axios.post(`https://toolsmanagement.onrender.com/api/tools/${toolId}/start-usage`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error starting tool usage:', error);
      alert(error.response?.data?.message || 'Failed to start tool usage');
    }
  };

  const handleStopUsage = async (toolId) => {
    try {
      await axios.post(`https://toolsmanagement.onrender.com/api/tools/${toolId}/stop-usage`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error stopping tool usage:', error);
      alert(error.response?.data?.message || 'Failed to stop tool usage');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'tools', label: 'Available Tools', icon: Wrench },
    { id: 'active', label: 'Active Usage', icon: Play },
    { id: 'analytics', label: 'My Usage', icon: BarChart3 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Usage Sessions"
          value={stats.totalUsage || 0}
          icon={Clock}
          color="orange"
        />
        <StatsCard
          title="Today's Usage"
          value={stats.todayUsage || 0}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Active Tools"
          value={stats.activeTools || 0}
          icon={Play}
          color="blue"
        />
        <StatsCard
          title="Total Hours"
          value={`${stats.totalHours || 0}h`}
          icon={TrendingUp}
          color="purple"
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
                    ? 'border-orange-500 text-orange-600'
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
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {tools
                  .filter(tool => tool.status === 'available' && tool.remainingLife > 0)
                  .slice(0, 5)
                  .map((tool) => (
                    <div key={tool._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{tool.name}</p>
                        <p className="text-sm text-gray-600">
                          {tool.remainingLife.toFixed(1)}h remaining
                        </p>
                      </div>
                      <button
                        onClick={() => handleStartUsage(tool._id)}
                        className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm hover:bg-orange-700 transition-colors flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        Start
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Current Usage */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-orange-500" />
                Currently Using
              </h3>
              <div className="space-y-3">
                {tools
                  .filter(tool => tool.status === 'in-use' && tool.currentUser)
                  .map((tool) => (
                    <div key={tool._id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div>
                        <p className="font-medium text-gray-900">{tool.name}</p>
                        <p className="text-sm text-orange-600">
                          Started: {new Date(tool.usageStartTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleStopUsage(tool._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-full text-sm hover:bg-red-700 transition-colors flex items-center gap-1"
                      >
                        <Square className="w-3 h-3" />
                        Stop
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Tools</h2>
            <ToolsList 
              tools={tools.filter(tool => tool.status === 'available' && tool.remainingLife > 0)}
              onStartUsage={handleStartUsage}
              userRole="operator"
            />
          </div>
        )}

        {activeTab === 'active' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Active Tool Usage</h2>
            <ActiveUsageList 
              tools={tools.filter(tool => tool.status === 'in-use' && tool.currentUser)}
              onStopUsage={handleStopUsage}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Usage Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UsageChart title="My Usage Pattern" />
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Usage</h3>
                <div className="space-y-3">
                  {usage.slice(0, 8).map((record) => (
                    <div key={record._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{record.tool?.name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{record.duration?.toFixed(1)}h</p>
                        <p className="text-xs text-gray-500">
                          {record.isActive ? 'Active' : 'Completed'}
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

export default OperatorDashboard;