// ReservationDetail.jsx
import React, { useState } from "react";
import "../assets/styles/ReservationDetail.css";

/* ─────────────────────────────────────────
   더미 데이터
───────────────────────────────────────── */
const RESERVATIONS = {
  예약: [
    {
      id: 1,
      hospital: "서울아동병원",
      dept: "소아청소년과",
      doctor: "김민수",
      date: "2026-03-05",
      time: "14:30",
      visitCount: 4,
      status: "확인완료",
      statusType: "confirmed",
      address: "서울 강남구 테헤란로 123",
      phone: "02-1234-5678",
      memo: "초진 — 발열 및 기침 증상",
    },
    {
      id: 2,
      hospital: "스마일치과의원",
      dept: "치과",
      doctor: "박지수",
      date: "2026-03-10",
      time: "11:00",
      visitCount: 2,
      status: "대기중",
      statusType: "pending",
      address: "서울 서초구 방배로 200",
      phone: "02-9876-5432",
      memo: "스케일링 예약",
    },
  ],
  "취소 예약": [
    {
      id: 3,
      hospital: "강남메디컬센터",
      dept: "내과",
      doctor: "이서연",
      date: "2026-02-28",
      time: "10:00",
      visitCount: 1,
      status: "취소됨",
      statusType: "cancelled",
      address: "서울 강남구 논현로 456",
      phone: "02-5555-1234",
      memo: "환자 요청으로 취소",
    },
  ],
  "지난 예약": [
    {
      id: 4,
      hospital: "한강정형외과의원",
      dept: "정형외과",
      doctor: "박준호",
      date: "2026-02-10",
      time: "15:00",
      visitCount: 3,
      status: "진료완료",
      statusType: "done",
      address: "서울 용산구 이태원로 78",
      phone: "02-7777-8888",
      memo: "무릎 통증 추적 관찰",
    },
    {
      id: 5,
      hospital: "밝은눈안과",
      dept: "안과",
      doctor: "최지혜",
      date: "2026-01-25",
      time: "13:30",
      visitCount: 1,
      status: "진료완료",
      statusType: "done",
      address: "서울 마포구 홍익로 90",
      phone: "02-3333-4444",
      memo: "시력 검사 및 안압 측정",
    },
  ],
};

const STATUS_MAP = {
  confirmed: { label: "확인완료", cls: "status-confirmed" },
  pending:   { label: "대기중",   cls: "status-pending"   },
  cancelled: { label: "취소됨",   cls: "status-cancelled" },
  done:      { label: "진료완료", cls: "status-done"      },
};

const DEPT_ICON_MAP = {
  소아청소년과: "baby",
  내과:        "heartbeat",
  외과:        "cut",
  정형외과:    "bone",
  안과:        "eye",
  치과:        "tooth",
  피부과:      "spa",
  이비인후과:  "ear-listen",
  신경과:      "brain",
};

/* ─────────────────────────────────────────
   ReservationDetail Component
───────────────────────────────────────── */
function ReservationDetail() {
  const [showPopup, setShowPopup]       = useState(false);
  const [activeTab, setActiveTab]       = useState("예약");
  const [selectedCard, setSelectedCard] = useState(null);

  const handleClose = () => {
    setShowPopup(false);
    setSelectedCard(null);
    setTimeout(() => setActiveTab("예약"), 300);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const currentList = RESERVATIONS[activeTab] || [];

  return (
    <>
      {/* 예약 조회 트리거 버튼 */}
      <button className="rd-trigger-btn" onClick={() => setShowPopup(true)}>
        <i className="fas fa-calendar-check" />
        내 예약 조회
        {RESERVATIONS["예약"].length > 0 && (
          <span className="rd-trigger-badge">{RESERVATIONS["예약"].length}</span>
        )}
      </button>

      {/* 오버레이 + 모달 */}
      {showPopup && (
        <div className="rd-overlay" onClick={handleOverlayClick}>
          <div className="rd-modal">

            {/* ── 모달 헤더 ── */}
            <div className="rd-modal-header">
              <div className="rd-modal-title">
                <span className="rd-modal-icon">
                  <i className="fas fa-calendar-check" />
                </span>
                <div>
                  <h2>내 예약 조회</h2>
                  <p>예약 현황을 확인하고 관리하세요</p>
                </div>
              </div>
              <button className="rd-close-btn" onClick={handleClose}>
                <i className="fas fa-xmark" />
              </button>
            </div>

            {/* ── 탭 바 ── */}
            <div className="rd-tab-bar">
              {Object.keys(RESERVATIONS).map((tab) => {
                const count = RESERVATIONS[tab].length;
                return (
                  <button
                    key={tab}
                    className={`rd-tab-btn ${activeTab === tab ? "active" : ""}`}
                    onClick={() => {
                      setActiveTab(tab);
                      setSelectedCard(null);
                    }}
                  >
                    {tab}
                    {count > 0 && (
                      <span className={`rd-tab-count ${activeTab === tab ? "active" : ""}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── 모달 바디 ── */}
            <div className="rd-modal-body">
              {currentList.length === 0 ? (
                <div className="rd-empty-state">
                  <div className="rd-empty-icon">
                    <i className="fas fa-calendar-xmark" />
                  </div>
                  <p>해당 예약 내역이 없습니다</p>
                  <span>새로운 예약을 추가해보세요</span>
                </div>
              ) : (
                <div className="rd-card-list">
                  {currentList.map((item) => (
                    <ReservationCard
                      key={item.id}
                      {...item}
                      isSelected={selectedCard === item.id}
                      onClick={() =>
                        setSelectedCard(selectedCard === item.id ? null : item.id)
                      }
                      tabType={activeTab}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── 모달 푸터 ── */}
            <div className="rd-modal-footer">
              <button className="rd-btn-new">
                <i className="fas fa-plus" />새 예약 추가
              </button>
              <button className="rd-btn-close-footer" onClick={handleClose}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────
   ReservationCard 서브 컴포넌트
───────────────────────────────────────── */
function ReservationCard({
  hospital, dept, doctor, date, time,
  visitCount, status, statusType, address, phone, memo,
  isSelected, onClick, tabType,
}) {
  const statusInfo = STATUS_MAP[statusType] || { label: status, cls: "status-done" };
  const deptIcon   = DEPT_ICON_MAP[dept] || "hospital";

  return (
    <div
      className={`rd-card ${isSelected ? "expanded" : ""}`}
      onClick={onClick}
    >
      {/* 카드 상단 */}
      <div className="rd-card-main">
        {/* 병원 아이콘 */}
        <div className="rd-card-avatar">
          <i className={`fas fa-${deptIcon}`} />
        </div>

        {/* 병원 정보 */}
        <div className="rd-card-info">
          <div className="rd-card-name-row">
            <h3>{hospital}</h3>
            <span className={`rd-status-chip ${statusInfo.cls}`}>{statusInfo.label}</span>
          </div>
          <span className="rd-dept-tag">{dept}</span>
          <div className="rd-card-meta">
            <span><i className="fas fa-user-doctor" />{doctor} 원장</span>
            <span><i className="fas fa-calendar" />{date}</span>
            <span><i className="fas fa-clock" />{time}</span>
          </div>
        </div>

        {/* 펼치기 화살표 */}
        <button className={`rd-expand-btn ${isSelected ? "rotated" : ""}`}>
          <i className="fas fa-chevron-down" />
        </button>
      </div>

      {/* 확장 상세 정보 */}
      {isSelected && (
        <div className="rd-card-detail" onClick={(e) => e.stopPropagation()}>
          <div className="rd-detail-divider" />

          <div className="rd-detail-grid">
            <DetailRow icon="location-dot"  label="주소"        value={address} />
            <DetailRow icon="phone"          label="전화번호"    value={phone} />
            <DetailRow icon="rotate-right"   label="방문 횟수"   value={`${visitCount}회 방문`} />
            <DetailRow icon="file-lines"     label="메모"        value={memo} highlight />
          </div>

          {/* 탭에 따라 액션 버튼 다르게 */}
          <div className="rd-card-actions">
            {tabType === "예약" && (
              <>
                <button className="rd-action-btn primary">
                  <i className="fas fa-pen-to-square" />예약 변경
                </button>
                <button className="rd-action-btn danger">
                  <i className="fas fa-ban" />예약 취소
                </button>
              </>
            )}
            {tabType === "취소 예약" && (
              <button className="rd-action-btn primary">
                <i className="fas fa-calendar-plus" />재예약하기
              </button>
            )}
            {tabType === "지난 예약" && (
              <>
                <button className="rd-action-btn primary">
                  <i className="fas fa-calendar-plus" />재방문 예약
                </button>
                <button className="rd-action-btn secondary">
                  <i className="fas fa-star" />후기 작성
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   DetailRow 서브 컴포넌트
───────────────────────────────────────── */
function DetailRow({ icon, label, value, highlight }) {
  return (
    <div className="rd-detail-row">
      <span className="rd-detail-label">
        <i className={`fas fa-${icon}`} />{label}
      </span>
      <span className={`rd-detail-value ${highlight ? "highlight" : ""}`}>{value}</span>
    </div>
  );
}

export default ReservationDetail;