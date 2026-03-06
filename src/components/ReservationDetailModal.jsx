import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faHospital,
  faCalendarDays,
  faClock,
  faStethoscope,
  faNotesMedical,
  faCircleDot,
  faPen,
  faTrash,
  faCircleCheck,
  faHourglassHalf,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import "../assets/styles/ReservationModals.css";

const STATUS_MAP = {
  예약확정: {
    cls: "confirmed",
    icon: faCircleCheck,
    label: "예약이 확정되었습니다",
  },
  예약대기: {
    cls: "pending",
    icon: faHourglassHalf,
    label: "병원 승인 대기 중입니다",
  },
  예약취소: { cls: "cancelled", icon: faBan, label: "취소된 예약입니다" },
};

const ReservationDetailModal = ({
  reservation: r,
  onClose,
  onChangePage,
  onCancelPage,
}) => {
  const [isClosing, setIsClosing] = useState(false); // ✅

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 160);
  };

  if (!r) return null;
  const st = STATUS_MAP[r.reStatus] ?? STATUS_MAP["예약대기"];

  return (
    // ✅ handleClose 사용, rvm-overlay--out 클래스 토글
    <div
      className={`rvm-overlay${isClosing ? " rvm-overlay--out" : ""}`}
      onClick={handleClose}
    >
      <div className="rvm rvm--detail" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="rvm-head">
          <div className="rvm-head-left">
            <div className="rvm-head-icon">
              <FontAwesomeIcon icon={faCalendarDays} />
            </div>
            <div>
              <h2 className="rvm-head-title">예약 상세 정보</h2>
              <p className="rvm-head-sub">예약번호 · #{r.reNum}</p>
            </div>
          </div>
          {/* ✅ handleClose */}
          <button className="rvm-close" onClick={handleClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* 상태 배너 */}
        <div className={`rvm-status-banner rvm-status-banner--${st.cls}`}>
          <FontAwesomeIcon icon={st.icon} />
          <span>{st.label}</span>
          <span className={`rvm-status-chip rvm-status-chip--${st.cls}`}>
            {r.reStatus}
          </span>
        </div>

        {/* 본문 */}
        <div className="rvm-body">
          {/* 병원 정보 */}
          <div className="rvm-section">
            <p className="rvm-section-label">병원 정보</p>
            <div className="rvm-info-row">
              <div
                className="rvm-info-icon"
                style={{
                  background: "linear-gradient(135deg,#14b8a6,#0f766e)",
                }}
              >
                <FontAwesomeIcon icon={faHospital} />
              </div>
              <div>
                <p className="rvm-info-primary">
                  {r.hoName ?? `병원 #${r.hoNum}`}
                </p>
                <p className="rvm-info-secondary">
                  <FontAwesomeIcon icon={faStethoscope} />
                  {r.deptName ?? `진료과 #${r.deptNum}`}
                </p>
              </div>
            </div>
          </div>

          {/* 진료 일정 */}
          <div className="rvm-section">
            <p className="rvm-section-label">진료 일정</p>
            <div className="rvm-chip-row">
              <div className="rvm-chip rvm-chip--teal">
                <FontAwesomeIcon icon={faCalendarDays} />
                <span>{r.reDate}</span>
              </div>
              <div className="rvm-chip rvm-chip--teal">
                <FontAwesomeIcon icon={faClock} />
                <span>{r.reTime?.slice(0, 5)}</span>
              </div>
              {r.waitNum !== null && (
                <div className="rvm-chip rvm-chip--orange">
                  <FontAwesomeIcon icon={faCircleDot} />
                  <span>
                    대기 <strong>{r.waitNum}명</strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 진료 정보 */}
          <div className="rvm-section">
            <p className="rvm-section-label">진료 정보</p>
            <div className="rvm-grid2">
              <div className="rvm-kv">
                <span className="rvm-kv-key">방문 유형</span>
                <span className="rvm-kv-val rvm-kv-val--purple">
                  {r.reVisitType}
                </span>
              </div>
              <div className="rvm-kv">
                <span className="rvm-kv-key">예약 상태</span>
                <span className={`rvm-status-chip rvm-status-chip--${st.cls}`}>
                  {r.reStatus}
                </span>
              </div>
            </div>
          </div>

          {/* 메모 */}
          {r.reMemo && (
            <div className="rvm-section">
              <p className="rvm-section-label">증상 / 메모</p>
              <div className="rvm-memo-box">
                <FontAwesomeIcon
                  icon={faNotesMedical}
                  className="rvm-memo-icon"
                />
                <p style={{ margin: 0 }}>{r.reMemo}</p>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        {/* ✅ 취소된 예약에는 취소/변경 버튼 숨기기 */}
        <div className="rvm-footer">
          {r.reStatus !== "예약취소" && (
            <>
              <button
                className="rvm-btn rvm-btn--outline-red"
                onClick={() => {
                  onCancelPage(r);
                }}
              >
                <FontAwesomeIcon icon={faTrash} />
                예약 취소
              </button>
              <button
                className="rvm-btn rvm-btn--outline"
                onClick={() => {
                  onChangePage(r);
                }}
              >
                <FontAwesomeIcon icon={faPen} />
                예약 변경
              </button>
            </>
          )}
          {/* ✅ handleClose */}
          <button className="rvm-btn rvm-btn--fill" onClick={handleClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailModal;
