import { createContext, useContext, useEffect, useState, type ReactNode} from 'react';
import { useAuthStore } from '../store/slices/authSlice';

interface WebSocketContextType {
  lastMessage: any | null;
  clearMessage: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  const [lastMessage, setLastMessage] = useState<any | null>(null);

  useEffect(() => {
    console.log("WebSocket Effect running. User:", user);
    
    if (!user) {
      console.log("No user found, skipping WebSocket connection.");
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log("No token found, skipping WebSocket connection.");
      return;
    }

    const wsUrl = `ws://127.0.0.1:8000/ws/notifications/?token=${token}`;
    console.log("Attempting to connect to:", wsUrl);
    
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log("✅ WebSocket connected successfully!");
    };
    
    socket.onmessage = (event) => {
      console.log("📨 Message received:", event.data);
      const data = JSON.parse(event.data);
      setLastMessage(data);
    };
    
    socket.onerror = (error) => {
      console.error("❌ WebSocket Error:", error);
    };
    
    socket.onclose = (event) => {
      console.log("🔌 WebSocket disconnected. Code:", event.code, "Reason:", event.reason);
    };

    return () => {
      socket.close();
    };
  }, [user]);

  const clearMessage = () => setLastMessage(null);

  return (
    <WebSocketContext.Provider value={{ lastMessage, clearMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocket must be used within WebSocketProvider');
  return context;
};