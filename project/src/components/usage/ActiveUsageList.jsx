import React from 'react';
import { Square, Clock, AlertTriangle } from 'lucide-react';

const ActiveUsageList = ({ tools, onStopUsage }) => {
  const calculateUsageDuration = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const durationMs = now - start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-4">
      {tools.map((tool) => (
        <div key={tool._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">{tool.name}</h3>
              <p className="text-sm text-gray-600 capitalize">{tool.category}</p>
              <p className="text-xs text-blue-600">Shop: {tool.shopkeeper?.shopId}</p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Started</p>
                <p className="font-medium">{new Date(tool.usageStartTime).toLocaleTimeString()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium text-blue-600">{calculateUsageDuration(tool.usageStartTime)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Remaining Life</p>
                <p className={`font-medium ${tool.remainingLife <= tool.thresholdLimit ? 'text-red-600' : 'text-green-600'}`}>
                  {tool.remainingLife.toFixed(1)}h
                </p>
              </div>
            </div>
          </div>

          {/* Life Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Tool Life Progress</span>
              <span className="text-sm text-gray-600">
                {((tool.lifeLimit - tool.remainingLife) / tool.lifeLimit * 100).toFixed(1)}% used
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 bg-gradient-to-r from-green-500 to-orange-500 rounded-full transition-all"
                style={{ width: `${((tool.lifeLimit - tool.remainingLife) / tool.lifeLimit) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Warning if low life */}
          {tool.remainingLife <= tool.thresholdLimit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Low Life Warning</span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                This tool is below the threshold limit of {tool.thresholdLimit} hours
              </p>
            </div>
          )}

          <button
            onClick={() => onStopUsage(tool._id)}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Square className="w-4 h-4" />
            Stop Usage
          </button>
        </div>
      ))}

      {tools.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No active tool usage</div>
          <p className="text-gray-400 text-sm mt-2">Start using a tool to see it here</p>
        </div>
      )}
    </div>
  );
};

export default ActiveUsageList;