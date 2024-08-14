import { useEffect, useState, useRef } from "react";
import { useWebSocket } from "../Hooks/useSocket";
import { Spinner } from "../Components/Spinner";
import { useParams } from "react-router-dom";

export const Receiver = () => {
    const { socket } = useWebSocket();
    const { roomId } = useParams();
    const [isOfferReceived, setIsOfferReceived] = useState(false);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const p = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] // You might want to configure TURN servers here
        });
        pcRef.current = p;
        p.addTransceiver('video', { direction: 'recvonly' });



        // Handle ICE candidates
        p.addEventListener("icecandidate", (event) => {
            if (event.candidate) {
              console.log("ICE candidate generated:", event.candidate);
              socket!.send(JSON.stringify({
                type: 'ice-candidate',
                candidate: event.candidate,
                roomId
              }));
            } else {
              console.log("End of candidate gathering.");
            }
          });

        // Handle incoming remote stream
        p.ontrack = (event) => {
            console.log("Received remote track:", event.streams[0]);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
                remoteVideoRef.current.play();
            }
        };

        // Clean up peer connection
        return () => {
            if (pcRef.current) {
                pcRef.current.close();
                pcRef.current = null;
            }
        };
    }, [socket, roomId]);

    useEffect(() => {
        if (!socket || !pcRef.current) return;

        const handleSocketMessage = async (event: MessageEvent) => {
            const message = JSON.parse(event.data);
            console.log("Received socket message:", message);

            if (message.type === 'offer') {
                setIsOfferReceived(true);
                await pcRef.current!.setRemoteDescription(new RTCSessionDescription(message.offer));
                
                const answer = await pcRef.current!.createAnswer();
                await pcRef.current!.setLocalDescription(answer);

                socket.send(JSON.stringify({
                    type: 'create-answer',
                    answer,
                    roomId
                }));
            } else if (message.type === 'ice-candidate') {
                console.log("Adding ICE candidate:", message.candidate);
                await pcRef.current!.addIceCandidate(new RTCIceCandidate(message.candidate));
            }
        };

        socket.onmessage = handleSocketMessage;

        return () => {
            socket.onmessage = null;
        };
    }, [socket, roomId]);

    const getCameraStreamAndSend = async () => {
        if (!pcRef.current || !localVideoRef.current) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play();

            stream.getTracks().forEach(track => {
                pcRef.current!.addTrack(track, stream);
            });

            // This will trigger the ontrack event for the remote peer
            console.log("Local stream added:", stream);
        } catch (error) {
            console.error("Error accessing camera stream:", error);
        }
    };

    useEffect(() => {
        if (isOfferReceived) {
            getCameraStreamAndSend();
        }
    }, [isOfferReceived]);

    return (
        <div>
            {!isOfferReceived ? (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <Spinner />
                </div>
            ) : (
                <div className="video-container">
                    <div className="video-wrapper text-white">
                        {/* Local video (sender) */}
                        <div className="local-video-container">
                            sender
                            <video ref={localVideoRef} className="local-video" autoPlay muted />
                        </div>

                        {/* Remote video (receiver) */}
                        <div className="remote-video-container">
                            receiver
                            <video ref={remoteVideoRef} className="remote-video" autoPlay />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
