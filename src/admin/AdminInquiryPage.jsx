import React, { useState } from "react";
import { useSocket } from "../WebSocketContext";
import "../assets/styles/AdminInquiryPage.css";

/* ────────────────────────────────────────────
   유틸: 날짜/시간 포맷
──────────────────────────────────────────── */
const formatTime = (str) => {
  if (!str) return "";
  try {
    const d = new Date(str);
    return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return str;
  }
};

/* ────────────────────────────────────────────
   통계 카드 컴포넌트
──────────────────────────────────────────── */
const StatCard = ({ icon, label, value, color, badge }) => (
  <div className="aiq-stat-card" style={{ "--sc-color": color }}>
    <div className="aiq-stat-icon">
      <i className={`fas fa-${icon}`} />
    </div>
    <div className="aiq-stat-body">
      <span className="aiq-stat-value">{value}</span>
      <span className="aiq-stat-label">{label}</span>
    </div>
    {badge && <span className="aiq-stat-badge"><span className="aiq-stat-badge-pulse" /></span>}
  </div>
);

/* ────────────────────────────────────────────
   채팅 버블 컴포넌트
──────────────────────────────────────────── */
const ChatBubble = ({ msg, isMe }) => {
  const initial = isMe ? "관" : (msg.senderName?.[0] ?? "P");
  return (
    <div className={`aiq-chat-wrapper ${isMe ? "me" : "them"}`}>
      {!isMe && (
        <div className="aiq-bubble-avatar them-avatar">{initial}</div>
      )}
      <div className="aiq-bubble-group">
        {!isMe && (
          <span className="aiq-bubble-name">{msg.senderName ?? "환자"}</span>
        )}
        <div className="aiq-chat-bubble">
          <p>{msg.text}</p>
          <span className="chat-time">{formatTime(msg.createdAt)}</span>
        </div>
      </div>
      {isMe && (
        <div className="aiq-bubble-avatar me-avatar">관</div>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────
   메인 페이지
──────────────────────────────────────────── */
const AdminInquiryPage = () => {
  const {
    chatRooms,
    activeChatRoom,
    setActiveChatRoom,
    messages,
    sendMessage,
    chatEndRef,
    totalUnread,
  } = useSocket();

  const [inputText, setInputText] = useState("");

  const currentMessages = activeChatRoom
    ? messages[activeChatRoom.id] ?? []
    : [];

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="aiq-root">

      {/* ── 헤더 ── */}
      <div className="aiq-top-bar">
        <div className="aiq-top-left">
          <div className="aiq-top-icon">
            <i className="fas fa-headset" />
          </div>
          <div>
            <h1 className="aiq-top-title">실시간 상담 관제 센터</h1>
            <p className="aiq-top-sub">환자분들과의 1:1 대화를 실시간으로 관리합니다</p>
          </div>
        </div>
        <div className="aiq-top-actions">
          {totalUnread > 0 && (
            <span className="aiq-unread-chip">
              <i className="fas fa-bell" /> 미확인 {totalUnread}건
            </span>
          )}
          <button className="aiq-btn-ghost">
            <i className="fas fa-rotate" /> 새로고침
          </button>
        </div>
      </div>

      {/* ── 통계 카드 ── */}
      <div className="aiq-stats-row">
        <StatCard icon="inbox"        label="전체 상담방"      value={chatRooms.length}        color="#14b8a6" />
        <StatCard icon="envelope"     label="읽지 않은 메시지" value={totalUnread}              color="#f59e0b" badge={totalUnread > 0} />
        <StatCard icon="link"         label="현재 연결됨"      value={activeChatRoom ? "1" : "0"} color="#3b82f6" />
        <StatCard icon="circle-check" label="상담 완료율"      value="100%"                    color="#10b981" />
      </div>

      {/* ── 본문 ── */}
      <div className="aiq-body">

        {/* 좌측 목록 패널 */}
        <div className="aiq-list-panel">
          <div className="aiq-filter-bar">
            <span className="aiq-result-count">
              진행 중 <strong>{chatRooms.length}</strong>건
            </span>
            {totalUnread > 0 && (
              <span className="aiq-unread-mini">{totalUnread} 미확인</span>
            )}
          </div>

          <div className="aiq-list">
            {chatRooms.length === 0 ? (
              <div className="aiq-empty">
                <div className="aiq-empty-icon"><i className="fas fa-inbox" /></div>
                <p className="aiq-empty-title">진행 중인 상담 없음</p>
                <p className="aiq-empty-sub">새 상담이 시작되면 여기에 표시됩니다</p>
              </div>
            ) : (
              chatRooms.map((room) => (
                <RoomRow
                  key={room.id}
                  room={room}
                  isActive={activeChatRoom?.id === room.id}
                  onClick={() => setActiveChatRoom(room)}
                />
              ))
            )}
          </div>
        </div>

        {/* 우측 채팅 패널 */}
        <div className="aiq-detail-panel">
          {activeChatRoom ? (
            <div className="aiq-detail">

              {/* 채팅 헤더 */}
              <div className="aiq-detail-header">
                <div className="aiq-detail-header-top">
                  <div className="aiq-detail-tags">
                    <span className="aiq-status-tag status-progress">
                      <span className="status-dot" /> 상담중
                    </span>
                    <span className="aiq-category-tag">
                      {activeChatRoom.dept ?? "일반상담"}
                    </span>
                  </div>
                  <button
                    className="aiq-close-btn"
                    onClick={() => setActiveChatRoom(null)}
                    title="닫기"
                  >
                    <i className="fas fa-xmark" />
                  </button>
                </div>
                <h2 className="aiq-detail-title">
                  <span className="detail-name-avatar">
                    {activeChatRoom.patientName?.[0] ?? "P"}
                  </span>
                  {activeChatRoom.patientName} 님과의 실시간 상담
                </h2>
              </div>

              {/* 메시지 영역 */}
              <div className="aiq-detail-body chat-scroll">
                {currentMessages.length === 0 ? (
                  <div className="aiq-chat-empty">
                    <i className="fas fa-comment-dots" />
                    <p>아직 대화 내용이 없습니다</p>
                    <span>먼저 인사를 건네보세요 👋</span>
                  </div>
                ) : (
                  currentMessages.map((msg, idx) => (
                    <ChatBubble
                      key={idx}
                      msg={msg}
                      isMe={msg.from?.startsWith("hospital")}
                    />
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* 답변 작성 영역 */}
              <div className="aiq-reply-form">
                <div className="aiq-reply-inner">
                  <textarea
                    className="aiq-reply-textarea"
                    rows={3}
                    placeholder="답변을 입력하세요… (Enter 전송 / Shift+Enter 줄바꿈)"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={1000}
                  />
                  <div className="aiq-reply-footer">
                    <span className={`aiq-char-count ${inputText.length > 900 ? "warn" : ""}`}>
                      {inputText.length} / 1000
                    </span>
                    <div className="aiq-reply-btns">
                      <button
                        className="aiq-btn-ghost sm"
                        onClick={() => setInputText("")}
                        disabled={!inputText.trim()}
                      >
                        초기화
                      </button>
                      <button
                        className="aiq-btn-primary sm"
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                      >
                        <i className="fas fa-paper-plane" /> 전송
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* 빈 상태 */
            <div className="aiq-detail-empty">
              <div className="aiq-detail-empty-icon">
                <i className="fas fa-comment-dots" />
              </div>
              <h3>상담을 선택해주세요</h3>
              <p>좌측 목록에서 상담을 클릭하면<br />실시간 대화창이 활성화됩니다</p>
              {chatRooms.length > 0 && (
                <span className="aiq-empty-hint">
                  <i className="fas fa-arrow-left" /> {chatRooms.length}건의 상담이 대기 중입니다
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────
   상담 목록 Row 컴포넌트 (분리)
──────────────────────────────────────────── */
const RoomRow = ({ room, isActive, onClick }) => (
  <div
    className={`aiq-row ${isActive ? "selected" : ""} ${room.unread > 0 ? "unread" : ""}`}
    onClick={onClick}
  >
    {room.unread > 0 && <span className="aiq-unread-dot" />}
    <div className="aiq-row-top">
      <span className="aiq-category-tag">{room.dept ?? "일반상담"}</span>
      <span className="aiq-time">{room.lastTime}</span>
    </div>
    <div className="aiq-row-main">
      <div className="aiq-author-avatar large">
        {room.patientName?.[0] ?? "P"}
      </div>
      <div className="aiq-row-content">
        <h4 className="aiq-row-title">
          {room.patientName ?? "익명 환자"} 님
          {room.unread > 0 && (
            <span className="aiq-row-badge">{room.unread}</span>
          )}
        </h4>
        <p className="aiq-row-preview">{room.lastMsg ?? "대화를 시작하세요."}</p>
      </div>
    </div>
  </div>
);

export default AdminInquiryPage;
