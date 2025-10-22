import { useEffect, useRef, useState } from 'react'
import './App.css'



function App() {

  const msgRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);



  useEffect(() => {
    // wsRef.current = new WebSocket(`wss://chat-app-2oso.onrender.com`);
    const wsUrl = window.location.hostname === "localhost"
      ? "ws://localhost:8000"
      : "wss://chat-app-2oso.onrender.com";
    const ws = new WebSocket(wsUrl);

    wsRef.current = ws;


    wsRef.current.addEventListener('open', () => {
      const username = prompt("Enter your chat name");
      wsRef.current?.send(JSON.stringify({ type: 'identify', username }));
    });

    wsRef.current.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data]);
    });



    return () => {
      wsRef.current?.close();
    }
  }, [])



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (msgRef.current?.value.trim()) {
      wsRef.current?.send(JSON.stringify({ type: 'message', text: msgRef.current.value }));
      msgRef.current.value = '';
    }
  }

  return (
    <>
      <div className="max-w-md mx-auto mt-8 p-5 border-2 border-black rounded-md bg-gray-100 font-mono">
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
              className={`mb-2 p-2 rounded-md ${m.system
                ? "bg-gray-200 text-gray-600"
                : "bg-white border border-black text-black"
                }`}
            >
              {m.system ? m.message : `${m.username}: ${m.message}`}
            </li>
          ))}
        </ul>
      </div>
    </>

  )
}

export default App