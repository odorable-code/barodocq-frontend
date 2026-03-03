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

   const handleClose = () => {          // ✅ 추가
    setIsClosing(true);
    setTimeout(() => onClose(), 160);
  };

  if (!r) return null;

  const handleCancel = async () => {
    // ✅ 디버그 로그 추가
    console.log("🔴 [취소모달] 버튼 클릭됨");
    console.log("  reNum:", r.reNum);
    console.log("  reason:", reason);

    if (!reason) {
      setError("취소 사유를 선택해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("📡 API 요청:", `/api/v1/reservations/${r.reNum}/cancel`);

      const res = await authFetch(`/api/v1/reservations/${r.reNum}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelReason: reason }),
      });

      // ✅ 응답 상세 로그
      console.log("📡 응답 status:", res.status);
      const text = await res.text();
      console.log("📡 응답 body:", text);

      if (!res.ok) {
        // ✅ 서버 에러 메시지를 직접 표시
        setError(`서버 오류 (${res.status}): ${text}`);
        return;
      }

      setDone(true);
      // ✅ onSuccess만 호출 (onClose 제거)
      setTimeout(() => { onSuccess?.(); }, 1500);

    } catch (err) {
      // ✅ 에러 변수 반드시 catch(err)로 받아야 콘솔에 출력됨
      console.error("❌ [취소모달] 네트워크 오류:", err);
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div  className={`rvm-overlay${isClosing ? " rvm-overlay--out" : ""}`}
      onClick={handleClose} >
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

          {/* 예약 요약 */}
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

          {/* 취소 사유 */}
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

          {/* ✅ 에러/성공 메시지 - 항상 보이도록 */}
          {error && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: 8,
              padding: "10px 14px",
              color: "#dc2626",
              fontSize: 13,
              margin: "0 0 8px 0"
            }}>
              ❌ {error}
            </div>
          )}
          {done && (
            <div style={{
              background: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: 8,
              padding: "10px 14px",
              color: "#16a34a",
              fontSize: 13
            }}>
              <FontAwesomeIcon icon={faCheck} /> 예약이 취소되었습니다.
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="rvm-footer">
          <button className="rvm-btn rvm-btn--outline"
                  onClick={handleClose}> {/* ✅ */}
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
      </div>
    </div>
  );
};

export default ReservationCancelModal;
