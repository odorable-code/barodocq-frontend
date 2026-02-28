import React, { useState } from "react";
import "../assets/styles/ReservationDateSelect.css";

function ReservationDateSelect() {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const today = new Date();
  const now = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const baseYear = today.getFullYear();
  const baseMonth = today.getMonth();

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handleClose = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setShowPopup(false);
  };

  const canGoPrev =
    currentYear > baseYear || (currentYear === baseYear && currentMonth > baseMonth);

  const goToPrevMonth = () => {
    if (!canGoPrev) return;
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const goToNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  // 시간 슬롯 관리
  const OPEN_HOUR = 9;
  const CLOSE_HOUR = 21;
  const INTERVAL_MIN = 15;
  const END_OFFSET_MIN = 30;

  const generateTimes = () => {
    const morning = [];
    const afternoon = [];
    for (let hour = OPEN_HOUR; hour <= CLOSE_HOUR; hour++) {
      for (let min = 0; min < 60; min += INTERVAL_MIN) {
        const totalMinutes = hour * 60 + min;
        const lastSlotTime = CLOSE_HOUR * 60 - END_OFFSET_MIN;
        if (totalMinutes > lastSlotTime) break;
        const timeStr = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
        if (hour < 12) morning.push(timeStr);
        else afternoon.push(timeStr);
      }
    }
    return { morning, afternoon };
  };

  const timeSlots = selectedDate !== null ? generateTimes() : { morning: [], afternoon: [] };

  const toggleDate = (i, disabled) => {
    if (disabled) return;
    if (selectedDate === i) {
      setSelectedDate(null);
      setSelectedTime(null);
    } else {
      setSelectedDate(i);
      setSelectedTime(null);
    }
  };

  const toggleTime = (time, disabled) => {
    if (disabled) return;
    if (selectedTime === time) setSelectedTime(null);
    else setSelectedTime(time);
  };

  // 선택된 날짜/시간 문자열 반환
  const formatFullDate = () => {
    if (selectedDate === null || !selectedTime) return "";
    const dateStr = `${currentYear}.${String(currentMonth + 1).padStart(2, "0")}.${String(selectedDate + 1).padStart(2, "0")}`;
    return `${dateStr} ${selectedTime}`;
  };

  // 선택 완료 처리
  const handleConfirm = async () => {
  if (!selectedDate || !selectedTime) {
    alert("날짜와 시간을 선택해주세요!");
    return;
  }

  const reservationData = {
    date: formatFullDate(),
  };

  // 실제 API URL
  const API_URL = "http://localhost:8080/api/v1/reservations";

  try {
    // 백엔드 호출 시도
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reservationData),
    });

    if (!response.ok) throw new Error("서버 응답 실패");

    const data = await response.json();
    alert(`예약확정: ${data.date || formatFullDate()}`);
    handleClose();
  } catch (err) {
    console.warn("실제 호출 실패, Mock으로 처리:", err);

    // Mock 동작
    setTimeout(() => {
      alert(`예약확정 (Mock): ${formatFullDate()}`);
      handleClose();
    }, 500);
  }
};

  return (
    <div>
      <button onClick={() => setShowPopup(true)}>예약 날짜 선택</button>

      {showPopup && (
        <div className="overlay" onClick={handleClose}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={handleClose}>×</button>

            <div className="title-row">
              <h2>언제 예약할까요?</h2>
              <h2 className="month-title">{currentYear}년 {currentMonth + 1}월</h2>
            </div>

            <div className="range-row">
              <div className="subtitle">
                {String(currentMonth + 1).padStart(2, "0")}.01 ~ {String(currentMonth + 1).padStart(2, "0")}.{lastDate}
              </div>
              <div className="month-buttons">
                {canGoPrev && <button className="month-btn" onClick={goToPrevMonth}>이전달</button>}
                <button className="month-btn" onClick={goToNextMonth}>다음달</button>
              </div>
            </div>

            {selectedDate !== null && selectedTime && (
              <div className="selection-summary">선택됨: {formatFullDate()}</div>
            )}

            <hr />

            <div className="calendar">
              <div className="days-of-week">
                {["일","월","화","수","목","금","토"].map((d, idx) => (
                  <div key={d} className={idx === 0 || idx === 6 ? "weekend" : ""}>{d}</div>
                ))}
              </div>
              <div className="dates">
                {Array.from({ length: lastDate }, (_, i) => {
                  const dateObj = new Date(currentYear, currentMonth, i + 1);
                  const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                  return (
                    <div
                      key={i}
                      className={`date ${selectedDate === i ? "selected" : ""} ${isWeekend ? "weekend" : ""} ${isPast ? "disabled" : ""}`}
                      onClick={() => toggleDate(i, isPast)}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedDate !== null && (
              <>
                {timeSlots.morning.length > 0 && (
                  <>
                    <div className="time-section-title">오전 진료</div>
                    <div className="time-slots">
                      {timeSlots.morning.map(slot => {
                        let disabled = false;
                        const selectedFullDate = new Date(currentYear, currentMonth, selectedDate + 1);
                        if (selectedFullDate.toDateString() === today.toDateString()) {
                          const [h, m] = slot.split(":").map(Number);
                          if (h * 60 + m <= now.getHours() * 60 + now.getMinutes()) disabled = true;
                        }
                        return (
                          <div key={slot} className={`time-slot ${selectedTime === slot ? "selected" : ""} ${disabled ? "disabled" : ""}`} onClick={() => toggleTime(slot, disabled)}>
                            {slot}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {timeSlots.afternoon.length > 0 && (
                  <>
                    <div className="time-section-title">오후 진료</div>
                    <div className="time-slots">
                      {timeSlots.afternoon.map(slot => {
                        let disabled = false;
                        const selectedFullDate = new Date(currentYear, currentMonth, selectedDate + 1);
                        if (selectedFullDate.toDateString() === today.toDateString()) {
                          const [h, m] = slot.split(":").map(Number);
                          if (h * 60 + m <= now.getHours() * 60 + now.getMinutes()) disabled = true;
                        }
                        return (
                          <div key={slot} className={`time-slot ${selectedTime === slot ? "selected" : ""} ${disabled ? "disabled" : ""}`} onClick={() => toggleTime(slot, disabled)}>
                            {slot}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}

            <div className="popup-buttons">
              <button className="reset" onClick={() => { setSelectedDate(null); setSelectedTime(null); }}>초기화</button>
              <button className={`confirm ${selectedDate === null || !selectedTime ? "confirm-disabled" : ""}`} onClick={handleConfirm} disabled={selectedDate === null || !selectedTime}>
                선택 완료
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default ReservationDateSelect;