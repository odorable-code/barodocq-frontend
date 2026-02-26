import React, { useState, useEffect, useRef } from 'react';

// Chat을 사용하는 페이지에 넣기
{/* <Chat 
        hospitalName="서울병원"
        userId="user1"
        cr_num="ROOM1"
        ho_num="H1"
        user_num="U1"
      /> */} 

const Chat = ( { hospitalName, userId, cr_num, ho_num, user_num }) => {
  // 상태 관리
  const [cm_contents, setCm_contents] = useState([]);
	const [formData, setFormData] = useState({
    cm_num: "",
    cm_sender_type: "",
    cm_content: "",
    cm_created_at: "",
    cr_num: cr_num,
    cr_status: "",
		cr_created_at: "",
    cr_closed_at: "",
    cr_last_msg_at: "",
    cr_last_msg_preview: "",
    ho_num: ho_num,
    user_num: user_num,
    hospitalName: hospitalName,
    userId: userId
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      cr_num,
      ho_num,
      user_num,
      hospitalName,
      userId
    }));
  }, [cr_num, ho_num, user_num, hospitalName, userId]);

  const { cm_content } = formData;

  // 참조 변수: 소켓 객체 유지, 자동 스크롤 제어
  const socketRef = useRef(null);
  const scrollRef = useRef(null);

	const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, cm_content: e.target.value }));
  };

  useEffect(() => {
    // 3. 소켓 연결 시작 (서버의 WebSocketConfig 주소와 일치해야 함)
    socketRef.current = new WebSocket("ws://localhost:8080/chat"); //http://는 요청하면 응답하고 끊기는 방식이지만, ws://는 WebSocket의 약자로, 한 번 연결하면 계속 열려 있는 실시간 통로를 의미
		//리액트에서 useRef()를 호출하면 항상 { current: null } (초기값) 이 만들어진다.
		//socketRef.current = new WebSocket(...)의 null 자리에 웹소켓 연결 객체가 들어가고 그 후부터 소켓에 명령을 내릴 땐 반드시 이 current라는 문을 열고 들어가야함
    
		// [연결 성공]
    socketRef.current.onopen = () => {
      console.log("서버와 연결되었습니다.");
    };

    // [메시지 수신] 서버(Java)에서 보내준 메시지를 처리
    socketRef.current.onmessage = (event) => { //onmessage는 웹소켓 객체가 원래부터 가지고 있는 내장 이벤트 리스너.
			// onopen: 서버와 연결이 성공했을 때 실행
			// onmessage: 서버로부터 데이터를 받았을 때 실행
			// onerror: 연결 중 에러가 발생했을 때 실행
			// onclose: 연결이 끊겼을 때 실행

      const data = JSON.parse(event.data); 
      	setCm_contents((prev) => [...prev, data]);
    };

    useEffect(() => {
    const fetchHistory = async () => {
        const response = await fetch(`http://localhost:8080/api/chat/history/${cr_num}`);
        const data = await response.json();
        setCm_contents(data);
    };

    if (cr_num) fetchHistory();

    socketRef.current = new WebSocket("ws://localhost:8080/chat");
    
    socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.userId !== userId) {
            setCm_contents((prev) => [...prev, data]);
        }
    };
    return () => socketRef.current?.close();
    }, [cr_num]);

    // // [연결 종료]
    // socketRef.current.onclose = () => {
    //   console.log("연결이 끊겼습니다.");
    // };

    // socketRef.current에 값이 있다면 연결을 끊어서 서버 자원을 아껴주자!
    return () => {
      if (socketRef.current) socketRef.current.close(); 
    };
  }, []);

  // 4. 새 메시지 올 때마다 채팅창 맨 아래로 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [cm_contents]);

  // 5. 전송 버튼 클릭 시 실행
  const handleSend = () => {
    if (cm_content.trim() !== "") {
      
      // [추가된 부분] 보낼 데이터 객체 생성 (화면 표시용 데이터와 일치시킴)
      const messageData = { 
        ...formData, 
        cm_sender_type: userId, 
        cm_created_at: new Date().toLocaleTimeString()
      };

      socketRef.current.send(JSON.stringify(messageData));

			//서버로 보내는 url이 handleSend 함수 안에 없는 이유: 웹소켓은 처음 한 번 연결할 때만 URL이 필요하고, 그다음부터는 뚫린 구멍으로 데이터만 던지는 방식이기 때문

      // 입력창 비우기
      setFormData(prev => ({ ...prev, cm_content: "" }));
    }
  };

  return (
    <div style={styles.chatContainer}>
      {/* 헤더 */}
      <div style={styles.chatHeader}>
        <h4>{hospitalName} 문의 상담</h4>
      </div>

      {/* 메시지창 */}
      <div style={styles.chatWindow} ref={scrollRef}>
				{/* 태그의 ref 속성에 이 상자를 꽂아두면, 리액트가 화면을 다 그린 후 상자(current) 안에 실제 HTML 태그 정보를 쏙 넣어줌. 용도: 채팅창 스크롤 조작, 포커스 주기, 태그의 실제 크기 측정 등 */}
        {cm_contents.map((msg, idx) => (
          <div key={idx} style={msg.cm_sender_type === userId ? styles.myRow : styles.otherRow}>
            <div style={msg.cm_sender_type === userId ? styles.myMsg : styles.otherMsg}>
              {msg.cm_content}
              <div style={styles.time}>{msg.cm_created_at}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 입력 영역 */}
      <div style={styles.cm_contentArea}>
        <input 
<<<<<<< HEAD
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()} //키보드가 눌렸을 때(onKeyDown), 그 키(e.key)가 'Enter'라면 handleSend() 함수를 실행해라 의미. if (e.key === 'Enter') { handleSend(); }를 줄여씀
=======
          style={styles.cm_content}
          value={formData.cm_content}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()} //.key는 KeyboradEvent의 표준 속성 > 엔터키를 누르면 e.key의 값은 "Enter"로 들어가서 어떤 키가 눌렸는지 문자열을 담아준다. 
>>>>>>> seoyeon
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
  chatContainer: { margin: 'auto', position: 'relative', top: '200px', marginBottom: '300px', width: '600px', height: '800px', border: '1px solid #ddd', borderRadius: '10px', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' },
  chatHeader: { padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa' },
  chatWindow: { flex: 1, padding: '15px', overflowY: 'auto', backgroundColor: '#f0f2f5' },
  myRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' },
  otherRow: { display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' },
  myMsg: { backgroundColor: '#007bff', color: '#fff', padding: '10px', borderRadius: '10px 10px 0 10px', maxWidth: '70%' },
  otherMsg: { backgroundColor: '#fff', color: '#333', padding: '10px', borderRadius: '10px 10px 10px 0', maxWidth: '70%', border: '1px solid #ddd' },
  time: { fontSize: '10px', marginTop: '5px', opacity: 0.7 },
  cm_contentArea: { display: 'flex', padding: '10px', borderTop: '1px solid #eee' },
  cm_content: { flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '5px', outline: 'none' },
  sendBtn: { marginLeft: '10px', padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }
	};
export default Chat;