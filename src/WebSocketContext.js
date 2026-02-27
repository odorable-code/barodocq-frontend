// WebSocketContext.js
import { createContext, useContext, useState, useEffect, useRef } from 'react';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [activeChatRoom, setActiveChatRoom] = useState(null);
	const [cmContents, setCmContents] = useState([]);
	const [cmContent, setCmContent] = useState("");
	const chatRef = useRef(null);
	const chatEndRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/chat");
    
    ws.onopen = () => console.log("서버와 연결되었습니다.");

		ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // 서버에서 온 메시지를 목록에 추가       
      setCmContents((prev) => [...prev, data]);
    };

		ws.onclose = () => console.log("연결이 끊겼습니다."); //사용자가 채팅을 종료할 때

    setSocket(ws);
    return () => ws.close(); //연결이 끊어졌을 때 브라우저가 무슨 일을 할지 미리 정해두는 예약
  }, []);

  return (
    <WebSocketContext.Provider value={{
				socket, activeChatRoom, setActiveChatRoom, cmContent, setCmContent, 
				cmContents, setCmContents, chatRef, chatEndRef }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useSocket = () => useContext(WebSocketContext);