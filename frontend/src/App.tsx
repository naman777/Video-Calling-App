import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Home from './Pages/Home';
import { WebSocketProvider } from './Hooks/useSocket';
import { Receiver } from './Pages/Receiver';
import Sender from './Pages/Sender';

export default function App() {
  return (
    <WebSocketProvider>

    <BrowserRouter>
      <div className="relative h-screen w-full bg-black overflow-hidden">
        {/* Background Design */}
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle_400px_at_50%_300px,#fbfbfb36,#000)]"></div>

        {/* Routes */}
        <div className="relative z-10 h-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sender/:roomId" element={<Sender />} />
            <Route path="/receiver/:roomId" element={<Receiver />} />

          </Routes>
        </div>
      </div>
    </BrowserRouter>
    </WebSocketProvider>
  );
}
