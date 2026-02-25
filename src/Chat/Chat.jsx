import React, { useState, useEffect, useRef } from 'react';

const Chat = ( //{ hospitalName, id }
	) => {
  // 1. 상태 관리: 메시지 리스트, 입력값, 연결 상태
  const [cm_contents, setCm_contents] = useState([]);
	const [formData, setFormData] = useState({cm_num: "", cm_sender_type: "", cm_content: "", cm_created_at: "", cr_num: "", cr_status: "",
		 		cr_created_at: "", cr_closed_at: "", cr_last_msg_at: "", cr_last_msg_preview: "", ho_num: "", user_num: "", hospitalName: "", userId: ""});

	const {cm_num, cm_sender_type, cm_content, cm_created_at, cr_num, cr_status,
		 		cr_created_at, cr_closed_at, cr_last_msg_at, cr_last_msg_preview, ho_num, user_num, hospitalName, userId} = formData;

  // 2. 참조 변수: 소켓 객체 유지, 자동 스크롤 제어
  const socketRef = useRef(null);
  const scrollRef = useRef(null);

	const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, cm_content: e.target.value }));
  };

  useEffect(() => {
    // 3. 소켓 연결 시작 (서버의 WebSocketConfig 주소와 일치해야 함)
    socketRef.current = new WebSocket("ws://localhost:8080/chat"); //http://는 요청하면 응답하고 끊기는 방식이지만, ws://는 WebSocket의 약자로, 한 번 연결하면 계속 열려 있는 실시간 통로를 의미
		//리액트에서 useRef()를 호출하면 항상 다음과 같은 구조의 객체가 만들어짐
		//{ current: null } (초기값)
		//socketRef.current = new WebSocket(...)이라고 코드를 짜는 순간, 저 null 자리에 진짜 웹소켓 연결 객체가 들어가고 그 후부터 소켓에 명령을 내릴 땐 반드시 이 current라는 문을 열고 들어가야함
    
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
      	setCm_contents((prev) => [...prev, {
				// cm_num, //채팅메시지고유번호
        // cm_sender_type: formData.cm_sender_type === 'cm_sender_type' ? 'user' : 'admin',
				// cm_content: cm_content, // 메시지내용
        // cm_created_at: new Date().toLocaleTimeString(), // 메시지작성일시. new date()는 현재 날짜와 시간 정보를 가진 객체를 생성한 상태이고 그대로 출력하면 Wed Feb 25 2026 19:11:06 GMT+0900... 처럼 아주 길고 복잡하게 나와서 toLocaleTimeString()이 복잡한 날짜 객체에서 날짜는 빼고 "시간" 정보만 추출함. Local이 지역 설정을 따르기 때문에 한국의 시간 정보가 나옴
				// cr_num: cr_num, //채팅방고유번호
				// cr_status: cr_status, //채팅방상태
				// cr_created_at: new Date().toLocaleTimeString(), //채팅방생성일시
				// cr_closed_at: new Date().toLocaleTimeString(), //채팅종료일시
				// cr_last_msg_at: cr_last_msg_at, //마지막메시지일시
				// cr_last_msg_preview: cr_last_msg_preview, //마지막메시지요약
				// ho_num: ho_num, //병원고유번호
				// user_num: user_num, //사용자고유번호
        // hospitalName: hospitalName, //병원이름. "00병원 상담문의" 에 필요.
				// userId: userId
				...data, userId: userId,
				// 만약 서버에서 sender_type을 안 준다면, 일단 화면에 보이게 'me' 혹은 'user'로 매칭
    		cm_sender_type: data.cm_sender_type || 'me', 
    		cm_content: data.cm_content,
				cm_created_at: data.cm_created_at || new Date().toLocaleTimeString()
      }]);
    };

    // [연결 종료]
    socketRef.current.onclose = () => {
      console.log("연결이 끊겼습니다.");
    };

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
      // [추가된 부분] 현재 시간 생성
      const currentTime = new Date().toLocaleTimeString();
      
      // [추가된 부분] 보낼 데이터 객체 생성 (화면 표시용 데이터와 일치시킴)
      const messageData = { 
        ...formData, 
        cm_sender_type: 'me', 
        cm_created_at: currentTime 
      };

			//서버로 보내는 url이 handleSend 함수 안에 없는 이유: 웹소켓은 처음 한 번 연결할 때만 URL이 필요하고, 그다음부터는 뚫린 구멍으로 데이터만 던지는 방식이기 때문

      // 서버로 전송
      socketRef.current.send(JSON.stringify(messageData));

      // [추가된 부분] 서버 응답 기다리지 않고 내 화면에 즉시 추가하여 사라짐 방지
      setCm_contents((prev) => [...prev, messageData]);

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
          <div key={idx} style={msg.cm_sender_type === 'me' ? styles.myRow : styles.otherRow}>
            <div style={msg.cm_sender_type === 'me' ? styles.myMsg : styles.otherMsg}>
              {msg.cm_content}
              <div style={styles.time}>{msg.cm_created_at}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 입력 영역 */}
      <div style={styles.cm_contentArea}>
        <input 
          style={styles.cm_content}
          value={formData.cm_content}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()} //.key는 KeyboradEvent의 표준 속성 > 엔터키를 누르면 e.key의 값은 "Enter"로 들어가서 어떤 키가 눌렸는지 문자열을 담아준다. 
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