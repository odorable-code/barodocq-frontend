// WebSocketContext.js
import { createContext, useContext, useState, useEffect, useRef } from 'react';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [activeChatRoom, setActiveChatRoom] = useState(null); // 전역으로 관리!
	const [cm_contents, setCm_contents] = useState([]);
	const [cm_content, setCm_content] = useState("");
	const chatRef = useRef(null);
	const chatEndRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/chat");
    
    ws.onopen = () => console.log("서버와 연결되었습니다.");

		ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // 서버에서 온 메시지를 목록에 추가
      setCm_contents((prev) => [...prev, data]);
    };

		ws.onclose = () => console.log("연결이 끊겼습니다.");

    setSocket(ws);
    return () => ws.close();
  }, []);

  return (
    <WebSocketContext.Provider value={{
				socket, activeChatRoom, setActiveChatRoom, cm_content, setCm_content, 
				cm_contents, setCm_contents, chatRef, chatEndRef }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useSocket = () => useContext(WebSocketContext);