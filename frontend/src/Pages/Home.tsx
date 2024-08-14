import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../Hooks/useSocket';
import { Spinner } from '../Components/Spinner';

const Home: React.FC = () => {
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');

  const {socket,isConnected} = useWebSocket();

  const handleCreateRoom = () => {
    if (name) {
        socket?.send(JSON.stringify({ type: 'create-room', name }));
        socket!.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'room-created') {
                navigate(`/room/${data.roomId}`);
            }
        }
    } else {
      alert("Please enter your name to create a room.");
    }
  };

  const handleJoinRoom = () => {
    if (name && roomId) {
        socket?.send(JSON.stringify({ type: 'join-room', name, roomId }));
        socket!.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'room-joined') {
                navigate(`/room/${data.roomId}`);
            }
        }
      
    } else {
      alert("Please enter your name and room ID to join a room.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-white ">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to VideoConnect</h1>
        <p className="text-lg md:text-2xl max-w-2xl mx-auto">
          Seamless and secure video calling for everyone. Whether it's for work, study, or catching up with loved ones, VideoConnect brings people together with just a click. Connecting People!!!
        </p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Create Room Section */}
        <div className="p-6 rounded-lg shadow-lg flex flex-col items-center justify-center ">
          <h2 className="text-2xl font-semibold mb-4">Create Room</h2>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 mb-4 text-black rounded-lg"
          />
          <button
            className="w-full px-4 py-2 mb-4 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md"
            onClick={handleCreateRoom}
          >
            Create Room
          </button>
        </div>

        {/* Join Room Section */}
        <div className="p-6 rounded-lg shadow-lg flex flex-col items-center justify-center ">
          <h2 className="text-2xl font-semibold mb-4">Join Room</h2>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 mb-4 text-black rounded-lg"
          />
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-4 py-2 mb-4 text-black rounded-lg"
          />
          <button
            className="w-full px-4 py-2 mb-4 bg-green-600 hover:bg-green-700 rounded-lg shadow-md"
            onClick={handleJoinRoom}
          >
            Join Room
          </button>
        </div>
      </div>
      {/* {!isConnected && (<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <Spinner />
    </div>)} */}
    </div>
  );
};

export default Home;
