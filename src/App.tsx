import { useEffect, useRef, useState } from 'react'
import './App.css'
import { useUser } from './contexts/UserContext.tsx';
import Username from './components/Username.tsx';


function App() {

  interface ChatMessage {
    type: "system" | "message";
    username?: string;
    message: string;
    system?: boolean; // Add this
  }

  const msgRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  // const [username, setUsername] = useState<string | null>(null);
  const { username, setUsername } = useUser();

  // useEffect(() => {
  //   if (!username) {
  //     const name = prompt("Enter your chat name") || `User${Math.floor(Math.random() * 1000)}`;
  //     setUsername(name);
  //   }
  // }, []);

  // useEffect(() => {
  //   setMessages([]);
  // }, [username]);


  const connectSocket = () => {
    setStatus("connecting");

    // wsRef.current = new WebSocket(`wss://chat-app-2oso.onrender.com`);
    const wsUrl = window.location.hostname === "localhost"
      ? "ws://localhost:8000"
      : "wss://chat-app-2oso.onrender.com";
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      // const username = prompt("Enter your chat name") || "Anonymous";
      if (username) {
        ws.send(JSON.stringify({ type: 'identify', username }));
      }
      // wsRef.current?.send(JSON.stringify({ type: 'identify', username }));
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Mark system messages explicitly
        if (data.type === "system") data.system = true;
        else data.system = false;


        setMessages(prev => [...prev, data]);
      } catch (e: unknown) {
        console.warn("Invalid JSON received:", event.data, e);
      }
    }

    ws.onclose = () => {
      setStatus("disconnected");
      setTimeout(() => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          connectSocket();
        }
      }, 2000);
    }

    ws.onerror = () => {
      setStatus("disconnected");
    }
  }


  useEffect(() => {
    // if (!username) return;
    // if (!wsRef.current) {
    //   connectSocket();
    // }

    if (!username) return;

    // Close old socket if it exists
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Reset messages
    setMessages([]);

    // Connect new socket
    connectSocket();

    // Cleanup on unmount
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
    return () => {
      // wsRef.current?.close();
      // wsRef.current = null;
    };
  }, [username]);


  const handleLogout = () => {
    wsRef.current?.close();
    wsRef.current = null;
    setMessages([]);
    setUsername("");
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (msgRef.current?.value.trim()) {
      wsRef.current?.send(JSON.stringify({ type: 'message', text: msgRef.current.value }));
      msgRef.current.value = "";
    }
  }

  if (!username) return <Username />;

  return (
    <>
      <div className="max-w-md mx-auto mt-8 rounded-lg font-mono flex gap-3">
        <div className={`flex-1 text-center  p-3 rounded-lg border-2
      ${status === "connected"
            ? "border-green-400 text-green-700 bg-green-100"
            : status === "connecting"
              ? "border-yellow-400 text-yellow-700 bg-yellow-100"
              : "border-red-400 text-red-700 bg-red-100"
          } font-semibold text-sm shadow-sm`}>
          {status === "connected"
            ? "Connected"
            : status === "connecting"
              ? "Connecting..."
              : "Disconnected, retrying..."}
        </div>

        <button
          className="bg-red-200 text-red-800 font-semibold border-2 border-red-400 rounded-lg px-4 py-2 hover:bg-red-300 hover:text-white transition-colors shadow-sm"
          onClick={() => {
            handleLogout();
          }}
        >
          Logout
        </button>
      </div>
      <div className="max-w-md mx-auto mt-3 p-5 border-2 border-black rounded-md bg-gray-100 font-mono">
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <input
            ref={msgRef}
            placeholder="Type message..."
            className="flex-1 p-2 border-2 border-black rounded-md outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 border-2 border-black rounded-md bg-gray-300 hover:bg-gray-400 transition-colors"
          >
            Send
          </button>
        </form>
        <ul className="list-none p-0 max-h-72 overflow-y-auto border-t-2 border-black pt-2">
          {messages.map((m, i) => (
            <li
              key={i}
              className={`mb-2 p-2 rounded-md ${m.type === "system" ? "bg-gray-200 text-gray-600" : "bg-white border border-black text-black"
                }`}
            >
              {m.type === "system" ? m.message : `${m.username}: ${m.message}`}
            </li>

          ))}
        </ul>
      </div>

    </>

  )
}

export default App