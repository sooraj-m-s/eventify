import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'sonner';
import WebSocketInstance from './websocketService';


const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    WebSocketInstance.connect();
    WebSocketInstance.addCallbacks(handleNewNotification);
    
    return () => {
      WebSocketInstance.removeCallbacks();
      WebSocketInstance.disconnect();
    };
  }, []);

  const handleNewNotification = (notification) => {
    // Add new notification to state (with a generated ID)
    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show toast notification
    toast(notification.message, {
      onClick: () => {
        // Navigate to event if clicked
        if (notification.type === 'new_event') {
          window.location.href = `/events/event_detail/${notification.event_id}`;
        }
      },
    });
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};