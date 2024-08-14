import { WebSocket as WsWebSocket } from 'ws';

interface CustomWebSocket extends WsWebSocket {
    dispatchEvent(event: Event): boolean;
}

export { CustomWebSocket };