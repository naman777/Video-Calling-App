import React, { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../Hooks/useSocket';
import { useParams } from 'react-router-dom';

const Sender: React.FC = () => {
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const { socket } = useWebSocket();
  const { roomId } = useParams();

  useEffect(() => {
    return () => {
      if (pc) {
        pc.close();
        if (localVideoRef.current && localVideoRef.current.srcObject) {
          (localVideoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
      }
    };
  }, [pc]);

  const initiateConnection = async () => {
    if (!socket) {
      alert("Socket not found");
      return;
    }
  
    try {
      const p = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] 
      });
      p.addTransceiver('video', { direction: 'recvonly' });
      setPc(p);

      // Set up ICE candidate event handler
      p.addEventListener("icecandidate", (event) => {
        if (event.candidate) {
          console.log("ICE candidate generated:", event.candidate);
          socket.send(JSON.stringify({
            type: 'ice-candidate',
            candidate: event.candidate,
            roomId
          }));
        } else {
          console.log("End of candidate gathering.");
        }
      });

      // Set up WebSocket message handler
      socket.onmessage = async (event) => {
        console.log("Message received from WebSocket:", event.data);
        const message = JSON.parse(event.data);
        if (message.type === 'answer') {
          await p.setRemoteDescription(new RTCSessionDescription(message.answer));
        } else if (message.type === 'ice-candidate') {
          await p.addIceCandidate(new RTCIceCandidate(message.candidate));
          console.log("ICE candidate received and added:", message.candidate);
        }
      };

      // Create and send offer
      const offer = await p.createOffer();
      await p.setLocalDescription(offer);
      socket.send(JSON.stringify({
        type: 'create-offer',
        offer: p.localDescription,
        roomId
      }));
      
      // Set up track event handler to handle remote stream
      p.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          remoteVideoRef.current.play();
        }
      };

      // Get user media and add it to the peer connection
      getCameraStreamAndSend(p);
    } catch (error) {
      console.error("Error during connection setup:", error);
    }
  };

  const getCameraStreamAndSend = (p: RTCPeerConnection) => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play();
        }

        // Add each track to the RTCPeerConnection
        stream.getTracks().forEach((track) => {
          p.addTrack(track, stream);
        });
      })
      .catch((error) => {
        console.error("Error accessing camera:", error);
      });
  };

  return (
    <div>
      <button
        className='w-full px-4 py-2 mb-4 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md'
        onClick={initiateConnection}
      >
        Start Video Call...
      </button>
      <div className="video-container text-white">
        {/* Local video (sender) */}
        <video ref={localVideoRef} className="local-video" autoPlay muted />
        
        {/* Remote video (receiver) */}
        <video ref={remoteVideoRef} className="remote-video" autoPlay />
      </div>
    </div>
  );
};

export default Sender;
