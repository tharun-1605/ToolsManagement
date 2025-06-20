import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Play, 
  Settings,
  Filter,
  Search
} from 'lucide-react';

const ToolMonitor = ({ tools }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.shopkeeper?.shopId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (filter) {
      case 'low-life':
        return tool.remainingLife <= tool.thresholdLimit;
      case 'in-use':
        return tool.status === 'in-use';
      case 'available':
        return tool.status === 'available';
      case 'maintenance':
        return tool.status === 'maintenance';
      default:
        return true;
    }
  });

  const getStatusColor = (tool) => {
    if (tool.remainingLife <= tool.thresholdLimit) return 'border-red-500 bg-red-50';
    if (tool.status === 'in-use') return 'border-blue-500 bg-blue-50';
    if (tool.status === 'available') return 'border-green-500 bg-green-50';
    return 'border-gray-300 bg-gray-50';
  };

  const getStatusIcon = (tool) => {
    if (tool.remainingLife <= tool.thresholdLimit) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (tool.status === 'in-use') return <Play className="w-5 h-5 text-blue-500" />;
    if (tool.status === 'available') return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <Settings className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools, shops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Tools</option>
              <option value="low-life">Low Life</option>
              <option value="in-use">In Use</option>
              <option value="available">Available</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <div key={tool._id} className={`border-2 rounded-xl p-6 transition-all hover:shadow-md ${getStatusColor(tool)}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">{tool.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{tool.category}</p>
                <p className="text-xs text-blue-600">Shop: {tool.shopkeeper?.shopId}</p>
              </div>
              {getStatusIcon(tool)}
            </div>

            <div className="space-y-3">
              {/* Life Progress */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Tool Life</span>
                  <span className="text-sm font-bold">
                    {tool.remainingLife.toFixed(1)}h / {tool.lifeLimit}h
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      tool.remainingLife <= tool.thresholdLimit ? 'bg-red-500' :
                      tool.remainingLife <= tool.lifeLimit * 0.3 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.max(0, (tool.remainingLife / tool.lifeLimit) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium capitalize">{tool.status}</span>
              </div>

              {/* Usage Info */}
              {tool.status === 'in-use' && tool.usageStartTime && (
                <div className="text-sm">
                  <span className="text-gray-600">Started:</span>
                  <span className="font-medium ml-1">
                    {new Date(tool.usageStartTime).toLocaleTimeString()}
                  </span>
                </div>
              )}

              {/* Alert */}
              {tool.remainingLife <= tool.thresholdLimit && (
                <div className="flex items-center gap-2 p-2 bg-red-100 rounded-lg border border-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700">Needs replacement</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No tools match your criteria</div>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter settings</p>
        </div>
      )}
    </div>
  );
};

export default ToolMonitor;