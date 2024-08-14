// WebSocketProvider.js
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const WebSocketContext = createContext<{ socket: WebSocket | null, isConnected: boolean }>({ socket: null, isConnected: false });

interface WebSocketProviderProps {
    children: ReactNode;
}

const URL = 'ws://localhost:8080';

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);

    useEffect(() => {
        const ws = new WebSocket(URL);

        ws.onopen = () => {
            console.log('WebSocket connection opened');
            setSocket(ws);
            setIsConnected(true);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
            setSocket(null);
            setIsConnected(false);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            ws.close();
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};