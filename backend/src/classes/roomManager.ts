import { WebSocket } from "ws";
import { Room } from "./room";
import { CustomWebSocket } from "./socket";

export class RoomManager {
    private rooms : Room[];
    private roomIdMap: Map<string, Room>;

    constructor () {
        this.rooms = [];
        this.roomIdMap = new Map();
    }

    public createRoom (socket: CustomWebSocket, name: string) {
        const room = new Room(socket,name);
        this.roomIdMap.set(room.roomId, room);
        this.rooms.push(room);
        socket.send(JSON.stringify({ type: 'room', roomId: room.roomId }));
    }

    public joinRoom (socket: CustomWebSocket, roomId: string, name: string) {
        const room = this.rooms.find(room => room.roomId === roomId);
        if (!room) {
            socket.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
            return;
        }
        if (room.noOfUsers === 2) {
            socket.send(JSON.stringify({ type: 'error', message: 'Room is full' }));
            return;
        }
        else{
            room.joinRoom(socket,name);
        }

        socket.send(JSON.stringify({ type: 'joined', roomId: room.roomId }));
    }

    public createOffer (socket: CustomWebSocket, roomId: string, offer: any) {
        const room = this.rooms.find(room => room.roomId === roomId);
        if (!room) {
            socket.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
            return;
        }
        room.createOffer(socket,offer);
    }

    public createAnswer (socket: CustomWebSocket, roomId: string, answer: any) {
        const room = this.rooms.find(room => room.roomId === roomId);
        if (!room) {
            socket.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
            return;
        }
        room.createAnswer(socket,answer);
    }

    public iceCandidate (socket: CustomWebSocket, roomId: string, candidate: any) {
        const room = this.rooms.find(room => room.roomId === roomId);
        if (!room) {
            socket.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
            return;
        }
        room.iceCandidate(socket,candidate);
    }

    public removeRoom (socket: CustomWebSocket, roomId: string) {
        const room = this.rooms.find(room => room.roomId === roomId);
        if (!room) {
            socket.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
            return;
        }
        this.rooms = this.rooms.filter(room => room.roomId !== roomId);
        this.roomIdMap.delete(roomId);
        room.sender?.send(JSON.stringify({ type: 'end-call' }));
        room.receiver?.send(JSON.stringify({ type: 'end-call' }));
    }

}