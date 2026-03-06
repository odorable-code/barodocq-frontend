import React from "react";
import axios from "axios";
import Modal from "./Modal";

const NotificationsModal = ({
  isOpen,
  onClose,
  notifications = [],
  setNotifications,
  userNum,
}) => {

  // ✅ 올바른 URL + PATCH 메서드 + PathVariable 방식
  const markAllAsRead = async () => {
    try {
      await axios.patch(`/api/v1/notifications/user/${userNum}/read-all`);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, ntIsRead: true }))
      );
    } catch (error) {
      console.error("모두 읽음 처리 실패:", error);
      alert("처리 중 오류가 발생했습니다.");
    }
  };

  // ✅ 올바른 URL + PATCH 메서드 + PathVariable 방식
  const handleItemClick = async (ntNum) => {
    try {
      await axios.patch(`/api/v1/notifications/${ntNum}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.ntNum === ntNum ? { ...n, ntIsRead: true } : n))
      );
    } catch (error) {
      console.error("읽음 처리 실패:", error);
    }
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
      <div className="mp-notif-header">
        <span className="mp-notif-count">{unreadCount}개 읽지 않음</span>
        <button className="mp-text-btn" onClick={markAllAsRead}>
          모두 읽음
        </button>
      </div>

      <div className="mp-list">
        {notifications.length === 0 ? (
          <div className="mp-empty">
            <i className="fas fa-bell-slash" />
            <p>새로운 알림이 없습니다.</p>
          </div>
        ) : (
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
              {!n.ntIsRead && <div className="mp-notif-dot" />}
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default NotificationsModal;
