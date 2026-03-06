import React from "react";
import Modal from "./Modal"; // 기존 범용 모달 컴포넌트 임포트

const NotificationsModal = ({
  isOpen,
  onClose,
  notifications = [],
  setNotifications,
}) => {
  // 모든 알림 읽음 처리 함수
  const markAllAsRead = () => {
    setNotifications((prev) => 
      prev.map((n) => ({ ...n, ntIsRead: true }))
    );
  };

  // 개별 알림 읽음 처리 함수
  const handleItemClick = (ntNum) => {
    setNotifications((prev) =>
      prev.map((n) => (n.ntNum === ntNum ? { ...n, ntIsRead: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.ntIsRead).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="알림"
      size="md"
      icon="bell"
      iconBg="linear-gradient(135deg,#14b8a6,#0d9488)"
    >
      {/* 알림 헤더: 읽지 않은 개수 및 모두 읽음 버튼 */}
      <div className="mp-notif-header">
        <span className="mp-notif-count">
          {unreadCount}개 읽지 않음
        </span>
        <button className="mp-text-btn" onClick={markAllAsRead}>
          모두 읽음
        </button>
      </div>

      <div className="mp-list">
        {notifications.length === 0 ? (
          /* 알림이 없을 때의 UI */
          <div className="mp-empty">
            <i className="fas fa-bell-slash" />
            <p>새로운 알림이 없습니다.</p>
          </div>
        ) : (
          /* 알림 리스트 렌더링 */
          notifications.map((n) => (
            <div
              key={n.ntNum}
              className={`mp-list-item mp-notif-item ${n.ntIsRead ? "read" : ""}`}
              onClick={() => handleItemClick(n.ntNum)}
            >
              <div
                className="mp-list-icon"
                style={{ background: "#14b8a622", color: "#14b8a6" }}
              >
                <i className="fas fa-bell" />
              </div>
              
              <div className="mp-list-info">
                <strong>{n.ntFinalContent}</strong>
                <span className="mp-notif-time">{n.ntCreatedAt}</span>
              </div>

              {/* 읽지 않은 알림일 경우 표시되는 파란 점 */}
              {!n.ntIsRead && <div className="mp-notif-dot" />}
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default NotificationsModal;