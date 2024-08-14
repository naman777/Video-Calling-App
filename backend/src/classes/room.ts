import { v4 as uuidv4 } from 'uuid';
import { CustomWebSocket } from './socket';
import { receiver } from './messages';

export class Room {
    public roomId: string;
    public sender: CustomWebSocket | null;
    public receiver: CustomWebSocket | null;
    public senderName: string;
    public receiverName: string;
    public noOfUsers: number;

    constructor (socket: CustomWebSocket, name: string) {
        this.roomId = uuidv4();
        this.sender = socket;
        this.receiver = null;
        this.noOfUsers = 1;
        this.senderName = name;
        this.receiverName = '';
        socket.send(JSON.stringify({ type: 'room-created', roomId: this.roomId }));
    }


    public joinRoom (socket: CustomWebSocket, name: string) {
        this.receiver = socket;
        this.receiverName = name;
        this.noOfUsers++;
        socket.send(JSON.stringify({ type: 'room-joined', roomId: this.roomId, senderName: this.senderName }));
        this.sender?.send(JSON.stringify({ type: 'room-joined', roomId: this.roomId, receiverName: name }));
    }

    public createOffer (socket: CustomWebSocket, offer: any) {
        if(socket === this.sender) {
            this.receiver?.send(JSON.stringify({ type: 'offer', offer: offer }));
            this.sender?.send(JSON.stringify({ type: 'offer-sent' }));
        }
        else{
            this.sender?.send(JSON.stringify({ type: 'error', message: 'You are not the sender' }));
        }
    }

    public createAnswer (socket: CustomWebSocket, answer: any) {
        if(socket === this.receiver) {
            this.sender?.send(JSON.stringify({ type: 'answer', answer: answer }));
            this.receiver?.send(JSON.stringify({ type: 'answer-sent' }));
        }
        else{
            this.receiver?.send(JSON.stringify({ type: 'error', message: 'You are not the receiver' }));
        }
    }   

    public iceCandidate (socket: CustomWebSocket, candidate: any) {
        if(socket === this.sender) {
            this.receiver?.send(JSON.stringify({ type: 'ice-candidate', candidate: candidate }));
        }
        else if(socket === this.receiver) {
            this.sender?.send(JSON.stringify({ type: 'ice-candidate', candidate: candidate }));
        }
        else{
            this.sender?.send(JSON.stringify({ type: 'error', message: 'You are not the sender' }));
        }
    }
} 