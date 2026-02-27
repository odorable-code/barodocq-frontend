import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSocket } from "../WebSocketContext";
import {
  faPaperPlane,
  faArrowLeft,
  faEllipsisVertical,
} from "@fortawesome/free-solid-svg-icons";

const Chat = ({ hospitalName, userId, cr_num: crNum, ho_num: hoNum, user_num: userNum }) => {
  const {
    cm_content,
    setCm_content,
    cm_contents,
    setCm_contents,
    socket,
    activeChatRoom,
    setActiveChatRoom,
    chatRef,
    chatEndRef
  } = useSocket();
  
  const scrollRef = useRef(null);

  // 1. 채팅 내역 불러오기 및 웹소켓 연결
  useEffect(() => {
    // [채팅 내역 로드]
    const fetchHistory = async () => {

      try {
        const response = await fetch(`/api/chat/history/${crNum}`);
        const data = await response.json();
        setCm_contents(data);
      } catch (err) {
        console.error("이전 대화 로드 실패:", err);
      }
    };

  if (crNum) fetchHistory();
  }, [crNum]); // cr_num(방 번호)이 바뀔 때마다 실행

  // 2. 새 메시지 올 때마다 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [cm_contents]);

  // 3. 메시지 전송 로직
  const handleSend = () => {
    if (cm_content.trim() !== "" && socket?.readyState === WebSocket.OPEN) {
      
      const now = new Date();
      const t = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

      const messageData = {
        cr_num: crNum,
        ho_num: hoNum,
        user_num: userNum,
        cm_content: cm_content,
        cm_sender_type: userId, // 현재 로그인한 ID
        cm_created_at: t, // 서버 형성에 맞게 조정 가능
      };
      // 서버로 데이터 전송
      socket.send(JSON.stringify(messageData));
      
      // 입력창 비우기
      setCm_content("");
    }
  };

  return (
        <div className="hdr__cw" ref={chatRef}>
          {/* 헤더 */}
          <div className="hdr__cw-head">
            <button
              className="hdr__cw-back"
              onClick={() => setActiveChatRoom(null)}
            >
            <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <div className="hdr__cw-avatar">{activeChatRoom.avatar}</div>
            <div className="hdr__cw-hinfo">
              <span className="hdr__cw-hname">{activeChatRoom.hospital}</span>
              <span className="hdr__cw-hdept">{activeChatRoom.dept}</span>
            </div>
            <button className="hdr__cw-more">
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </button>
          </div>

          {/* 메시지 영역 */}
          <div className="hdr__cw-body">
            {(cm_contents || []).map((msg, i) => (
              <div key={i} className={`hdr__cw-msg hdr__cw-msg--${msg.from}`}>
                {msg.user_num === "hospital" && (
                  <div className="hdr__cw-msg-avatar">
                    {activeChatRoom.avatar}
                  </div>
                )}
                <div className="hdr__cw-msg-wrap">
                  <div className="hdr__cw-bubble">{msg.cm_content}</div>
                  <span className="hdr__cw-time">{msg.cm_created_at}</span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* 입력창 */}
          <div className="hdr__cw-input-wrap">
            <input
              type="text"
              className="hdr__cw-input"
              placeholder="메시지를 입력하세요..."
              value={cm_content}
              onChange={(e) => setCm_content(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              className={`hdr__cw-send${cm_content.trim() ? " hdr__cw-send--active" : ""}`}
              onClick={handleSend}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </div>
     
  );
}


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