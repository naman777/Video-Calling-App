import { WebSocketServer } from 'ws';
import { RoomManager } from './classes/roomManager';
import { createAnswer, createOffer, createRoom, endCall, iceCandidate, joinRoom } from './classes/messages';

const wss = new WebSocketServer({ port: 8080 });

const roomManager:any = new RoomManager();

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(data) {
        const message = JSON.parse(data.toString());
        
        if(message.type === createRoom) {
            roomManager.createRoom(ws, message.name);
        }
        else if(message.type === joinRoom) {
            roomManager.joinRoom(ws, message.roomId, message.name);
        }
        else if(message.type === createOffer) {
           roomManager.createOffer(ws, message.roomId, message.offer); 
        }
        else if(message.type === createAnswer) {
           roomManager.createAnswer(ws, message.roomId, message.answer);
        }
        else if(message.type === iceCandidate) {
            roomManager.iceCandidate(ws, message.roomId, message.candidate);
        }
        else if(message.type === endCall) {
            roomManager.removeRoom(ws, message.roomId);
        }

    });

});


console.log('Server started on port 8080');