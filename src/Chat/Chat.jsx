import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSocket } from "../WebSocketContext";
import {
  faPaperPlane,
  faArrowLeft,
  faEllipsisVertical,
} from "@fortawesome/free-solid-svg-icons";

const Chat = ({
  hospitalName,
  crNum,
  userNum,
  crStatus,
  hoNum,
  crLastMsgPreview,
  cmSenderType,
  cmNum,
  userId,
}) => {
  const {
    cmContent,
    setCmContent,
    cmContents,
    setCmContents,
    socket,
    activeChatRoom,
    setActiveChatRoom,
    chatRef,
    chatEndRef,
    isAdmin,
  } = useSocket();

  const scrollRef = useRef(null);

  // 1. 채팅 내역 불러오기 및 웹소켓 연결
  useEffect(() => {
    // [채팅 내역 로드]
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/chat/history/${crNum}`);
        const data = await response.json();
        setCmContents(data);
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
  }, [cmContents]);

  // 3. 메시지 전송 로직
  const handleSend = () => {
    if (cmContent.trim() !== "" && socket?.readyState === WebSocket.OPEN) {
      const now = new Date();
      const t = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`; //padStart()는 문자열에서만 사용 가능하기 때문에 String 붙임

      const messageData = {
        crNum: crNum,
        hoNum: hoNum,
        userNum: userNum,
        crStatus: crStatus || 1,
        cmContent: cmContent,
        crCreatedAt: now || 1,
        crClosedAt: now || 1,
        crClosedBy: now,
        crLastMsgAt: now,
        crLastMsgPreview: crLastMsgPreview,
        cmSenderType: cmSenderType,
        cmNum: cmNum,
      };

      // const {
      //   crNum;
      //   hoNum;
      //   userNuml;
      //   crStatus;
      //   cmContent;
      //   crCreatedAt;
      //   crClosedAt;
      //   crClosedBy;
      //   crLastMsgAt;
      //   crLastMsgPreview;
      //   cmSenderType;
      //   cmNum;
      // } = messageData;

      // 서버로 데이터 전송
      try {
        console.log("보낼 데이터 최종 확인:", messageData);

        socket.send(JSON.stringify(messageData));

        // 입력창 비우기
        setCmContent("");
      } catch (err) {
        console.error("전송 에러 발생", err);
      }
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
        <div className="hdr__cw-avatar">
          {/* 🌟 관리자면 환자 이름 첫 글자, 아니면 기존 병원 아바타 */}
          {isAdmin
            ? activeChatRoom?.patientName?.substring(0, 1)
            : activeChatRoom?.avatar}
        </div>
        <div className="hdr__cw-hinfo">
          <span className="hdr__cw-hname">
            {/* 🌟 관리자면 환자 이름, 아니면 병원 이름 */}
            {isAdmin
              ? activeChatRoom?.patientName
              : hospitalName || activeChatRoom?.hospitalName}
          </span>
          <span className="hdr__cw-hdept">{activeChatRoom?.dept}</span>
        </div>
        <button className="hdr__cw-more">
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="hdr__cw-body">
        {(cmContents || []).map((msg, i) => (
          <div
            key={i}
            className={`hdr__cw-msg hdr__cw-msg--${msg.cmSenderType}`}
          >
            {/* 상대방의 메시지인지 확인하는 조건문 (기존 코드가 맞다면 유지) */}
            {msg.userNum === "hospital" && (
              <div className="hdr__cw-msg-avatar">
                {isAdmin
                  ? activeChatRoom?.patientName?.substring(0, 1)
                  : activeChatRoom?.avatar}
              </div>
            )}
            <div className="hdr__cw-msg-wrap">
              <div className="hdr__cw-bubble">{msg.cmContent}</div>
              <span className="hdr__cw-time">{msg.cmCreatedAt}</span>
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
          value={cmContent}
          onChange={(e) => setCmContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          className={`hdr__cw-send${cmContent.trim() ? " hdr__cw-send--active" : ""}`}
          onClick={handleSend}
        >
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </div>
    </div>
  );
};

export default Chat;
