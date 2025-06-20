import React, { useState } from 'react';
import axios from 'axios';
import { 
  Edit, 
  Trash2, 
  Play, 
  Square, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Settings
} from 'lucide-react';
import ToolForm from './ToolForm';

const ToolsList = ({ tools, onUpdate, onStartUsage, userRole }) => {
  const [editingTool, setEditingTool] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const handleDelete = async (toolId) => {
    if (window.confirm('Are you sure you want to delete this tool?')) {
      try {
        await axios.delete(`https://toolsmanagement.onrender.com/api/tools/${toolId}`);
        onUpdate();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete tool');
      }
    }
  };

  const getStatusIcon = (tool) => {
    switch (tool.status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-use':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'maintenance':
        return <Settings className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLifeColor = (tool) => {
    const percentage = (tool.remainingLife / tool.lifeLimit) * 100;
    if (percentage <= (tool.thresholdLimit / tool.lifeLimit) * 100) return 'text-red-600';
    if (percentage <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getLifeBarColor = (tool) => {
    const percentage = (tool.remainingLife / tool.lifeLimit) * 100;
    if (percentage <= (tool.thresholdLimit / tool.lifeLimit) * 100) return 'bg-red-500';
    if (percentage <= 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <div key={tool._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">{tool.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{tool.category}</p>
                {tool.shopkeeper?.shopId && (
                  <p className="text-xs text-blue-600">Shop: {tool.shopkeeper.shopId}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {getStatusIcon(tool)}
                <span className="text-xs text-gray-600 capitalize">{tool.status}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4">{tool.description}</p>

            {/* Life Progress */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Tool Life</span>
                <span className={`text-sm font-bold ${getLifeColor(tool)}`}>
                  {tool.remainingLife.toFixed(1)}h / {tool.lifeLimit}h
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getLifeBarColor(tool)} transition-all`}
                  style={{ width: `${Math.max(0, (tool.remainingLife / tool.lifeLimit) * 100)}%` }}
                ></div>
              </div>
              {tool.remainingLife <= tool.thresholdLimit && (
                <div className="flex items-center gap-1 mt-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs">Below threshold ({tool.thresholdLimit}h)</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p className="text-gray-600">Total Usage</p>
                <p className="font-medium">{tool.totalUsageHours?.toFixed(1) || 0}h</p>
              </div>
              <div>
                <p className="text-gray-600">Stock</p>
                <p className="font-medium">{tool.stock || 0}</p>
              </div>
            </div>

            {/* Current Usage Info */}
            {tool.status === 'in-use' && tool.usageStartTime && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">In Use Since</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  {new Date(tool.usageStartTime).toLocaleTimeString()}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {userRole === 'shopkeeper' && (
                <>
                  <button
                    onClick={() => {
                      setEditingTool(tool);
                      setShowEditForm(true);
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tool._id)}
                    className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}

              {userRole === 'operator' && (
                <>
                  {tool.status === 'available' && tool.remainingLife > 0 && (
                    <button
                      onClick={() => onStartUsage(tool._id)}
                      className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Play className="w-4 h-4" />
                      Start Using
                    </button>
                  )}
                  {tool.status === 'in-use' && (
                    <div className="flex-1 bg-gray-100 text-gray-600 py-2 px-3 rounded-lg text-sm text-center">
                      Currently in use
                    </div>
                  )}
                  {tool.remainingLife <= 0 && (
                    <div className="flex-1 bg-red-100 text-red-600 py-2 px-3 rounded-lg text-sm text-center">
                      Life Expired
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditForm && editingTool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <ToolForm
              tool={editingTool}
              onSubmit={() => {
                setShowEditForm(false);
                setEditingTool(null);
                onUpdate();
              }}
              onCancel={() => {
                setShowEditForm(false);
                setEditingTool(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolsList;