import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark, faCalendarDays, faClock,
  faHospital, faStethoscope, faCheck, faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { authFetch } from "../utils/AuthFetch";
import "../assets/styles/ReservationModals.css";

const TIME_SLOTS = Array.from({ length: 18 }, (_, i) => {
  const h = Math.floor(i / 2) + 9;
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

const ReservationChangeModal = ({ reservation: r, onClose, onSuccess }) => {
  const [newDate, setNewDate] = useState(r?.reDate ?? "");
  const [newTime, setNewTime] = useState(r?.reTime?.slice(0, 5) ?? "");
  const [newMemo, setNewMemo] = useState(r?.reMemo ?? "");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState("");
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {          // ✅ 추가
    setIsClosing(true);
    setTimeout(() => onClose(), 160);
  };

  if (!r) return null;

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async () => {
    if (!newDate || !newTime) {
      setError("날짜와 시간을 모두 선택해주세요.");
      return;
    }
    
    // 💡 1. 변경 사항이 아예 없을 때 서버로 요청 안 보내기 (선택 사항)
    const isNotChanged = 
      newDate === r.reDate && 
      (newTime === r.reTime?.slice(0, 5) || newTime + ":00" === r.reTime) && 
      newMemo === (r.reMemo || "");

    if (isNotChanged) {
      setError("변경된 내용이 없습니다.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 💡 2. 서버로 보내는 데이터 확인용 로그
      const payload = {
        reDate: newDate,
        reTime: newTime + ":00", 
        reMemo: newMemo || "", // null을 원하면 newMemo || null 로 변경
      };
      console.log("📡 백엔드로 보내는 데이터:", payload);

      const res = await authFetch(`/api/v1/reservations/${r.reNum}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // 💡 3. 백엔드가 보내주는 구체적인 에러 텍스트 뽑아내기
        const errorText = await res.text();
        console.error(`❌ 서버 에러 상세 (${res.status}):`, errorText);
        throw new Error(errorText); 
      }

      setDone(true);
      setTimeout(() => { onSuccess?.(); }, 2200);
    } catch (err) {
      console.error("❌ 요청 실패:", err);
      setError("서버 처리 중 오류가 발생했습니다. (개발자 도구 콘솔 확인)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`rvm-overlay${isClosing ? " rvm-overlay--out" : ""}`}
      onClick={handleClose}
    >
      <div className="rvm rvm--change" onClick={(e) => e.stopPropagation()}>

        {/* 헤더 */}
        <div className="rvm-head">
          <div className="rvm-head-left">
            <div className="rvm-head-icon rvm-head-icon--blue">
              <FontAwesomeIcon icon={faCalendarDays} />
            </div>
            <div>
              <h2 className="rvm-head-title">예약 변경</h2>
              <p className="rvm-head-sub">
                #{r.reNum} · {r.hoName ?? `병원 #${r.hoNum}`}
              </p>
            </div>
          </div>
          <button className="rvm-close" onClick={handleClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* 본문 */}
        <div className="rvm-body">
          {/* 현재 예약 요약 */}
          <div className="rvm-current-box">
            <p className="rvm-current-label">현재 예약 정보</p>
            <div className="rvm-chip-row">
              <div className="rvm-chip rvm-chip--gray">
                <FontAwesomeIcon icon={faHospital} />
                <span>{r.hoName ?? `병원 #${r.hoNum}`}</span>
              </div>
              <div className="rvm-chip rvm-chip--gray">
                <FontAwesomeIcon icon={faStethoscope} />
                <span>{r.deptName ?? `진료과 #${r.deptNum}`}</span>
              </div>
              <div className="rvm-chip rvm-chip--gray">
                <FontAwesomeIcon icon={faCalendarDays} />
                <span>{r.reDate}</span>
              </div>
              <div className="rvm-chip rvm-chip--gray">
                <FontAwesomeIcon icon={faClock} />
                <span>{r.reTime?.slice(0, 5)}</span>
              </div>
            </div>
          </div>

          <div className="rvm-arrow-down">↓ 아래에서 새 일정을 선택하세요</div>

          {/* 날짜 */}
          <div className="rvm-section">
            <p className="rvm-section-label">
              <FontAwesomeIcon icon={faCalendarDays} /> 새 날짜
            </p>
            <input
              type="date"
              className="rvm-date-input"
              value={newDate}
              min={today}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>

          {/* 시간 슬롯 */}
          <div className="rvm-section">
            <p className="rvm-section-label">
              <FontAwesomeIcon icon={faClock} /> 새 시간
            </p>
            <div className="rvm-time-grid">
              {TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  className={`rvm-time-slot${newTime === t ? " rvm-time-slot--active" : ""}`}
                  onClick={() => setNewTime(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 메모 */}
          <div className="rvm-section">
            <p className="rvm-section-label">
              <FontAwesomeIcon icon={faStethoscope} /> 증상 / 메모
            </p>
            <textarea
              className="rvm-textarea"
              rows={3}
              placeholder="증상이나 특이사항을 입력해주세요 (선택)"
              value={newMemo}
              onChange={(e) => setNewMemo(e.target.value)}
            />
          </div>

          {error && <p className="rvm-error">{error}</p>}
          {done  && (
            <p className="rvm-success">
              <FontAwesomeIcon icon={faCheck} />
              예약이 성공적으로 변경되었습니다!
            </p>
          )}
        </div>

        {/* 푸터 */}
        <div className="rvm-footer">
          <button className="rvm-btn rvm-btn--outline" onClick={handleClose}>
            취소
          </button>
          <button
            className="rvm-btn rvm-btn--fill"
            onClick={handleSubmit}
            disabled={loading || done}
            style={{ flex: 2 }}
          >
            {loading ? (
              <><FontAwesomeIcon icon={faSpinner} className="rvm-btn-spinner" /> 변경 중...</>
            ) : done ? (
              <><FontAwesomeIcon icon={faCheck} /> 변경 완료!</>
            ) : (
              "예약 변경 확인"
            )}
          </button>
        </div>

        {/* 🌟 여기에 토스트 팝업 추가됨! (푸터 아래, 모달 창 내부에 떠오름) 🌟 */}
        {done && (
          <div className="rvm-toast-popup">
            <div className="rvm-toast-popup-icon">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <div className="rvm-toast-popup-text">
              <p className="rvm-toast-popup-title">예약 변경 완료</p>
              <p className="rvm-toast-popup-sub">예약이 성공적으로 변경되었습니다!</p>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default ReservationChangeModal;
