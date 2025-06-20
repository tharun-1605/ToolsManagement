import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      newSocket.emit('join-role', user.role);

      // Listen for notifications based on user role
      if (user.role === 'supervisor') {
        newSocket.on('tool-threshold-alert', (data) => {
          addNotification({
            type: 'warning',
            title: 'Tool Life Low',
            message: `${data.tool} has ${data.remainingLife.toFixed(1)} hours remaining (threshold: ${data.thresholdLimit})`,
            timestamp: new Date()
          });
        });

        newSocket.on('order-status-update', (data) => {
          addNotification({
            type: 'info',
            title: 'Order Update',
            message: `Your order for ${data.tool} has been ${data.status}`,
            timestamp: new Date()
          });
        });
      }

      if (user.role === 'shopkeeper') {
        newSocket.on('new-order', (data) => {
          addNotification({
            type: 'info',
            title: 'New Order',
            message: `${data.supervisor} ordered ${data.quantity}x ${data.tool}`,
            timestamp: new Date()
          });
        });
      }

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { ...notification, id }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAllNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};