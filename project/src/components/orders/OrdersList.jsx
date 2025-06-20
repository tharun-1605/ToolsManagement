import React from 'react';
import { 
  Check, 
  X, 
  Clock, 
  Package, 
  User,
  Calendar,
  MessageSquare
} from 'lucide-react';

const OrdersList = ({ orders, onStatusUpdate, userRole }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fulfilled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <Check className="w-4 h-4" />;
      case 'fulfilled':
        return <Package className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">{order.tool?.name}</h3>
              <p className="text-sm text-gray-600 capitalize">{order.tool?.category}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="capitalize">{order.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-gray-600" />
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{order.quantity}</span>
              </div>
              
              {userRole === 'shopkeeper' && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">Supervisor:</span>
                  <span className="font-medium">{order.supervisor?.name}</span>
                </div>
              )}
              
              {userRole === 'supervisor' && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">Shop:</span>
                  <span className="font-medium">{order.shopkeeper?.shopId}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-gray-600">Ordered:</span>
                <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              
              {order.approvedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Approved:</span>
                  <span className="font-medium">{new Date(order.approvedAt).toLocaleDateString()}</span>
                </div>
              )}
              
              {order.fulfilledAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600">Fulfilled:</span>
                  <span className="font-medium">{new Date(order.fulfilledAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {order.notes && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Notes:</span>
              </div>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}

          {/* Actions for Shopkeeper */}
          {userRole === 'shopkeeper' && order.status === 'pending' && onStatusUpdate && (
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => onStatusUpdate(order._id, 'approved')}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => {
                  const notes = prompt('Reason for rejection (optional):');
                  onStatusUpdate(order._id, 'rejected', notes || '');
                }}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}

          {userRole === 'shopkeeper' && order.status === 'approved' && onStatusUpdate && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => onStatusUpdate(order._id, 'fulfilled')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                Mark as Fulfilled
              </button>
            </div>
          )}
        </div>
      ))}

      {orders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No orders found</div>
          <p className="text-gray-400 text-sm mt-2">
            {userRole === 'supervisor' ? 'You haven\'t placed any orders yet' : 'No orders have been placed'}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrdersList;