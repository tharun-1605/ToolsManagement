import React, { useState } from 'react';
import { 
  Store, 
  Wrench, 
  ShoppingCart, 
  AlertTriangle,
  CheckCircle,
  Play,
  Package,
  Building
} from 'lucide-react';

const ShopsList = ({ shops, onPlaceOrder }) => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderNotes, setOrderNotes] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);

  const handlePlaceOrder = () => {
    if (selectedTool && orderQuantity > 0) {
      onPlaceOrder(selectedTool._id, orderQuantity, orderNotes);
      setShowOrderModal(false);
      setSelectedTool(null);
      setOrderQuantity(1);
      setOrderNotes('');
    }
  };

  const getToolStatusIcon = (tool) => {
    if (tool.remainingLife <= tool.thresholdLimit) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (tool.status === 'in-use') return <Play className="w-4 h-4 text-blue-500" />;
    if (tool.status === 'available') return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <Wrench className="w-4 h-4 text-gray-500" />;
  };

  const getToolStatusColor = (tool) => {
    if (tool.remainingLife <= tool.thresholdLimit) return 'border-red-200 bg-red-50';
    if (tool.status === 'in-use') return 'border-blue-200 bg-blue-50';
    if (tool.status === 'available') return 'border-green-200 bg-green-50';
    return 'border-gray-200 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      {shops.map((shop) => (
        <div key={shop.shopName} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Shop Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{shop.shopName}</h3>
                <p className="text-sm text-gray-600">
                  Managed by {shop.shopkeeper?.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Tools</p>
              <p className="text-2xl font-bold text-gray-900">{shop.tools.length}</p>
            </div>
          </div>

          {/* Shop Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-sm text-gray-600">Available</p>
              <p className="font-bold text-green-600">
                {shop.tools.filter(tool => tool.status === 'available').length}
              </p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Play className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-sm text-gray-600">In Use</p>
              <p className="font-bold text-blue-600">
                {shop.tools.filter(tool => tool.status === 'in-use').length}
              </p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-1" />
              <p className="text-sm text-gray-600">Low Life</p>
              <p className="font-bold text-red-600">
                {shop.tools.filter(tool => tool.remainingLife <= tool.thresholdLimit).length}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Package className="w-6 h-6 text-gray-600 mx-auto mb-1" />
              <p className="text-sm text-gray-600">Total Stock</p>
              <p className="font-bold text-gray-600">
                {shop.tools.reduce((sum, tool) => sum + (tool.stock || 0), 0)}
              </p>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shop.tools.map((tool) => (
              <div key={tool._id} className={`border rounded-lg p-4 transition-all hover:shadow-sm ${getToolStatusColor(tool)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{tool.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{tool.category}</p>
                  </div>
                  {getToolStatusIcon(tool)}
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Life:</span>
                    <span className="font-medium">
                      {tool.remainingLife.toFixed(1)}h / {tool.lifeLimit}h
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        tool.remainingLife <= tool.thresholdLimit ? 'bg-red-500' :
                        tool.remainingLife <= tool.lifeLimit * 0.3 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.max(0, (tool.remainingLife / tool.lifeLimit) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Stock:</span>
                    <span className="font-medium">{tool.stock || 0}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedTool(tool);
                    setShowOrderModal(true);
                  }}
                  className="w-full bg-green-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Order
                </button>
              </div>
            ))}
          </div>

          {shop.tools.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Wrench className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No tools available in this shop</p>
            </div>
          )}
        </div>
      ))}

      {/* Order Modal */}
      {showOrderModal && selectedTool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Place Order</h2>
            
            <div className="mb-4">
              <h3 className="font-medium text-gray-900">{selectedTool.name}</h3>
              <p className="text-sm text-gray-600 capitalize">{selectedTool.category}</p>
              <p className="text-sm text-blue-600">Shop: {selectedTool.shopkeeper?.shopName}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Add any special instructions..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handlePlaceOrder}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Place Order
              </button>
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setSelectedTool(null);
                  setOrderQuantity(1);
                  setOrderNotes('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {shops.length === 0 && (
        <div className="text-center py-12">
          <Store className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <div className="text-gray-500 text-lg">No shops available</div>
          <p className="text-gray-400 text-sm mt-2">Shops will appear here once tools are added</p>
        </div>
      )}
    </div>
  );
};

export default ShopsList;