import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../Hooks/useSocket';
import { useParams } from 'react-router-dom';

const Sender: React.FC = () => {
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [localVideo, setLocalVideo] = useState<HTMLVideoElement | null>(null);
  const [remoteVideo, setRemoteVideo] = useState<HTMLVideoElement | null>(null);
  const { socket } = useWebSocket();
  const {roomId} = useParams();

  const initiateConnection = async () => {
    if (!socket) {
      alert("Socket not found");
      return;
    }

    const p = new RTCPeerConnection();
    setPc(p);

    const offer = await pc!.createOffer();
      await pc!.setLocalDescription(offer);
      socket.send(JSON.stringify({
        type: 'create-offer',
        offer: pc!.localDescription,
        roomId
      }));

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'answer') {
        await pc!.setRemoteDescription(new RTCSessionDescription(message.answer));
      } else if (message.type === 'ice-candidate') {
        await pc!.addIceCandidate(new RTCIceCandidate(message.candidate));
      }
    };

    pc!.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate,
          roomId
        }));
      }
    };

    pc!.ontrack = (event) => {
      if (remoteVideo) {
        remoteVideo.srcObject = event.streams[0];
        remoteVideo.play();
      }
    };

    getCameraStreamAndSend(pc!);
  };

  const getCameraStreamAndSend = (pc: RTCPeerConnection) => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (!localVideo) return;

      localVideo.srcObject = stream;
      localVideo.play();
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    });
  };

  useEffect(() => {
    const localVideoElement = document.createElement('video');
    const remoteVideoElement = document.createElement('video');

    localVideoElement.classList.add('local-video');
    remoteVideoElement.classList.add('remote-video');

    document.body.appendChild(localVideoElement);
    document.body.appendChild(remoteVideoElement);

    setLocalVideo(localVideoElement);
    setRemoteVideo(remoteVideoElement);

    return () => {
      if (localVideoElement) document.body.removeChild(localVideoElement);
      if (remoteVideoElement) document.body.removeChild(remoteVideoElement);
    };
  }, []);

  return (
    <div>
      <button
        className='w-full px-4 py-2 mb-4 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md'
        onClick={initiateConnection}
      >
        Start Video Call...
      </button>
      <div className="video-container">
        {/* Local video (sender) */}
        {localVideo && <video className="local-video" ref={el => el && (el.srcObject = localVideo.srcObject)} autoPlay muted />}
        
        {/* Remote video (receiver) */}
        {remoteVideo && <video className="remote-video" ref={el => el && (el.srcObject = remoteVideo.srcObject)} autoPlay />}
      </div>
    </div>
  );
};

export default Sender;
