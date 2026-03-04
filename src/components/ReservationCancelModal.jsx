import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark, faTriangleExclamation, faHospital,
  faCalendarDays, faClock, faCheck, faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { authFetch } from "../utils/AuthFetch";
import "../assets/styles/ReservationModals.css";

const CANCEL_REASONS = [
  "일정이 변경되었어요",
  "다른 병원으로 변경하고 싶어요",
  "증상이 호전되었어요",
  "대기 시간이 너무 길어요",
  "기타 사유",
];

const ReservationCancelModal = ({ reservation: r, onClose, onSuccess }) => {
  const [reason,  setReason]  = useState("");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState("");
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 160);
  };

  if (!r) return null;

  const handleCancel = async () => {
    console.log("🔴 [취소모달] 버튼 클릭됨");
    
    if (!reason) {
      setError("취소 사유를 선택해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await authFetch(`/api/v1/reservations/${r.reNum}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelReason: reason }),
      });

      const text = await res.text();

      if (!res.ok) {
        setError(`서버 오류 (${res.status}): ${text}`);
        return;
      }

      // ✅ 성공 상태로 변경
      setDone(true);
      
      // 토스트 팝업을 보여준 뒤 리스트 갱신을 위해 onSuccess 호출
      setTimeout(() => { 
        onSuccess?.(); 
      }, 2000);

    } catch (err) {
      console.error("❌ [취소모달] 네트워크 오류:", err);
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rvm-overlay${isClosing ? " rvm-overlay--out" : ""}`} onClick={handleClose}>
      <div className="rvm rvm--cancel" onClick={(e) => e.stopPropagation()}>

        {/* 헤더 */}
        <div className="rvm-head">
          <div className="rvm-head-left">
            <div className="rvm-head-icon rvm-head-icon--red">
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </div>
            <div>
              <h2 className="rvm-head-title">예약 취소</h2>
              <p className="rvm-head-sub">이 작업은 되돌릴 수 없습니다</p>
            </div>
          </div>
          <button className="rvm-close" onClick={handleClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* 본문 */}
        <div className="rvm-body">
          <div className="rvm-warn-box">
            <div className="rvm-warn-box-icon">
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </div>
            <div>
              <h3>예약을 취소하시겠습니까?</h3>
              <p>취소된 예약은 복구할 수 없으며, 다시 예약하셔야 합니다.</p>
            </div>
          </div>

          <div className="rvm-section">
            <p className="rvm-section-label">취소할 예약</p>
            <div className="rvm-summary-card">
              <div className="rvm-summary-row">
                <span><FontAwesomeIcon icon={faHospital} style={{ marginRight: 6 }} />병원</span>
                <span>{r.hoName ?? `병원 #${r.hoNum}`}</span>
              </div>
              <div className="rvm-summary-row">
                <span><FontAwesomeIcon icon={faCalendarDays} style={{ marginRight: 6 }} />날짜</span>
                <span>{r.reDate}</span>
              </div>
              <div className="rvm-summary-row">
                <span><FontAwesomeIcon icon={faClock} style={{ marginRight: 6 }} />시간</span>
                <span>{r.reTime?.slice(0, 5)}</span>
              </div>
              <div className="rvm-summary-row">
                <span>예약번호</span>
                <span style={{ color: "#94a3b8" }}>#{r.reNum}</span>
              </div>
            </div>
          </div>

          <div className="rvm-section">
            <p className="rvm-section-label">
              취소 사유 <span style={{ color: "red" }}>*</span>
            </p>
            <div className="rvm-reason-list">
              {CANCEL_REASONS.map((rs) => (
                <div
                  key={rs}
                  className={`rvm-reason-item${reason === rs ? " rvm-reason-item--active" : ""}`}
                  onClick={() => setReason(rs)}
                >
                  <div className="rvm-reason-radio" />
                  <span className="rvm-reason-text">{rs}</span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="rvm-error-box" style={{ marginTop: '10px', color: '#dc2626', background: '#fef2f2', padding: '10px', borderRadius: '8px', fontSize: '13px' }}>
              ❌ {error}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="rvm-footer">
          <button className="rvm-btn rvm-btn--outline" onClick={handleClose}>
            돌아가기
          </button>
          <button
            type="button"
            className="rvm-btn rvm-btn--fill-red"
            onClick={handleCancel}
            disabled={loading || done}
            style={{ flex: 2 }}
          >
            {loading ? (
              <><FontAwesomeIcon icon={faSpinner} className="rvm-btn-spinner" /> 처리 중...</>
            ) : done ? (
              <><FontAwesomeIcon icon={faCheck} /> 취소 완료</>
            ) : (
              <><FontAwesomeIcon icon={faTriangleExclamation} /> 예약 취소 확인</>
            )}
          </button>
        </div>

        {/* 🌟 취소 완료 토스트 팝업 추가 🌟 */}
        {done && (
          <div className="rvm-toast-popup">
            <div className="rvm-toast-popup-icon rvm-toast-popup-icon--red">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <div className="rvm-toast-popup-text">
              <p className="rvm-toast-popup-title">예약 취소 완료</p>
              <p className="rvm-toast-popup-sub">예약이 성공적으로 취소되었습니다!</p>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default ReservationCancelModal;