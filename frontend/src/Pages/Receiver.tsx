import { useEffect, useState } from "react"
import { useWebSocket } from "../Hooks/useSocket";
import { Spinner } from "../Components/Spinner";
import { useParams } from "react-router-dom";

export const Receiver = () => {
    const { socket } = useWebSocket();
    const roomId = useParams();
    const [isOfferReceived, setIsOfferReceived] = useState(false);
    const [localVideo, setLocalVideo] = useState<HTMLVideoElement | null>(null);
    const [remoteVideo, setRemoteVideo] = useState<HTMLVideoElement | null>(null);
    const [pc, setPc] = useState<RTCPeerConnection | null>(null);

    useEffect(() => {
        const p = new RTCPeerConnection();
        setPc(p);
    },[])

    useEffect(() => { 
        socket!.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'offer') {
                setIsOfferReceived(true);
                pc!.setRemoteDescription(message.offer).then(() => {
                    pc!.createAnswer().then((answer) => {
                        pc!.setLocalDescription(answer);
                        socket!.send(JSON.stringify({
                            type: 'create-answer',
                            answer: answer,
                            roomId
                        }));
                    });
                });
            } else if (message.type === 'ice-candidate') {
                pc!.addIceCandidate(message.candidate);
                getCameraStreamAndSend();
            }
        };
        
        
    }, [socket]);

    const getCameraStreamAndSend = () => {
        const localVideoElement = document.createElement('video');
        const remoteVideoElement = document.createElement('video');
        
        localVideoElement.classList.add('local-video');
        remoteVideoElement.classList.add('remote-video');

        document.body.appendChild(localVideoElement);
        document.body.appendChild(remoteVideoElement);

        setLocalVideo(localVideoElement);
        setRemoteVideo(remoteVideoElement);

        
        pc!.ontrack = (event) => {
            if (event.track.kind === 'video') {
                remoteVideoElement.srcObject = new MediaStream([event.track]);
                remoteVideoElement.play();
            }
        };

        return () => {
            document.body.removeChild(localVideoElement);
            document.body.removeChild(remoteVideoElement);
        };
    }

    return (
        <div>
            {!isOfferReceived ? (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <Spinner />
    </div>) : (
                <div className="video-container">
                    <div className="video-wrapper">
                        {/* Placeholder for local video */}
                        <div className="local-video-container">
                            {localVideo && (
                                <video
                                    className="local-video"
                                    ref={(video) => {
                                        if (video) video.srcObject = localVideo.srcObject;
                                    }}
                                    autoPlay
                                    muted
                                />
                            )}
                        </div>

                        {/* Placeholder for remote video */}
                        <div className="remote-video-container">
                            {remoteVideo && (
                                <video
                                    className="remote-video"
                                    ref={(video) => {
                                        if (video) video.srcObject = remoteVideo.srcObject;
                                    }}
                                    autoPlay
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
