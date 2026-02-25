import React, { useState, useEffect, useRef } from 'react';

const Chat = ({ hospitalName, id }) => {
  // 1. 상태 관리: 메시지 리스트, 입력값, 연결 상태
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // 2. 참조 변수: 소켓 객체 유지, 자동 스크롤 제어
  const socketRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    // 3. 소켓 연결 시작 (서버의 WebSocketConfig 주소와 일치해야 함)
    socketRef.current = new WebSocket("ws://localhost:8080/chat");

    // [연결 성공]
    socketRef.current.onopen = () => {
      console.log("서버와 연결되었습니다.");
      //setIsConnected(true);
    };

    // [메시지 수신] 서버(Java)에서 보내준 메시지를 처리
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data); // 서버에서 JSON 형태로 보냈다고 가정
      setMessages((prev) => [...prev, {
        cm_sender_type: data.cm_sender_type === 'cm_sender_type' ? 'me' : 'hospital',
        cm_content: data.cm_content,
        cm_created_at: new Date().toLocaleTimeString()
      }]);
    };

    // [연결 종료]
    socketRef.current.onclose = () => {
      console.log("연결이 끊겼습니다.");
      // setIsConnected(false);
    };

    // 컴포넌트가 사라질 때 소켓 닫기
    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [id]);

  // 4. 새 메시지 올 때마다 채팅창 맨 아래로 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 5. 전송 버튼 클릭 시 실행
  const handleSend = () => {
    if (input.trim() !== "") {
      const chatData = {
        id: id,
        hospitalName: hospitalName,
        message: input,
        type: "CHAT"
      };

      // 서버(ChatHandler)로 JSON 문자열 전송
      socketRef.current.send(JSON.stringify(chatData));
      
      // 입력창 비우기
      setInput("");
    }
  };

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <h4>{hospitalName} 문의 상담</h4>
        {/* <span style={{color: isConnected ? '#4CAF50' : '#f44336'}}>
          {isConnected ? '● 온라인' : '○ 오프라인'}
        </span> */}
      </div>

      {/* 메시지창 */}
      <div style={styles.chatWindow} ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} style={msg.cm_sender_type === 'me' ? styles.myRow : styles.otherRow}>
            <div style={msg.cm_sender_type === 'me' ? styles.myMsg : styles.otherMsg}>
              {msg.text}
              <div style={styles.time}>{msg.time}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 입력 영역 */}
      <div style={styles.inputArea}>
        <input 
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="문의사항을 입력하세요..."
        />
        <button style={styles.sendBtn} onClick={handleSend}>
          전송
        </button>
      </div>
    </div>
  );
};

// CSS-in-JS 스타일
const styles = {
  container: { marginTop: '200px', marginBottom: '100px', width: '400px', border: '1px solid #ddd', borderRadius: '10px', display: 'flex', flexDirection: 'column', height: '500px', backgroundColor: '#fff' },
  header: { padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa' },
  chatWindow: { flex: 1, padding: '15px', overflowY: 'auto', backgroundColor: '#f0f2f5' },
  myRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' },
  otherRow: { display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' },
  myMsg: { backgroundColor: '#007bff', color: '#fff', padding: '10px', borderRadius: '10px 10px 0 10px', maxWidth: '70%' },
  otherMsg: { backgroundColor: '#fff', color: '#333', padding: '10px', borderRadius: '10px 10px 10px 0', maxWidth: '70%', border: '1px solid #ddd' },
  time: { fontSize: '10px', marginTop: '5px', opacity: 0.7 },
  inputArea: { display: 'flex', padding: '10px', borderTop: '1px solid #eee' },
  input: { flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '5px', outline: 'none' },
  sendBtn: { marginLeft: '10px', padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default Chat;