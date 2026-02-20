import React, { useState } from "react";
import "../assets/styles/ReservationDateSelect.css";

function ReservationDateSelect() {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // 팝업 닫기 + 상태 초기화
  const handleClose = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setShowPopup(false);
  };

  // 날짜별 예약 가능한 시간 예시 (9:00~21:00)
  const dateTimeMap = Array.from({ length: 30 }, () => {
    const times = [];
    for (let hour = 9; hour <= 21; hour++) {
      times.push(`${hour}:00`);
      if (hour !== 21) times.push(`${hour}:30`);
    }
    return times;
  });

  const toggleDate = (i) => {
    if (selectedDate === i) {
      setSelectedDate(null);
      setSelectedTime(null);
    } else {
      setSelectedDate(i);
      setSelectedTime(null);
    }
  };

  const toggleTime = (time) => {
    if (selectedTime === time) setSelectedTime(null);
    else setSelectedTime(time);
  };

  const resetSelection = () => {
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const confirmSelection = () => {
    if (selectedDate === null) {
      alert("날짜를 선택해주세요!");
      return;
    }
    if (!selectedTime) {
      alert("시간을 선택해주세요!");
      return;
    }
    alert(
      `선택된 날짜: 2026.02.${selectedDate + 1}, 시간: ${selectedTime}`
    );
  };

  const timeSlots =
    selectedDate !== null ? dateTimeMap[selectedDate] : [];

  return (
    <div>
      {/* 팝업 열기 버튼 */}
      <button onClick={() => setShowPopup(true)}>
        예약 날짜 선택
      </button>

      {/* 팝업 */}
      {showPopup && (
        <div className="overlay" onClick={handleClose}>
          <div
            className="popup"
            onClick={(e) => e.stopPropagation()}
          >
            {/* X 버튼 */}
            <button
              className="close-btn"
              onClick={handleClose}
            >
              ×
            </button>

            <h2>언제 예약할까요?</h2>
            <div className="subtitle">
              예약 가능한 날짜 예: 2026.02.10 ~ 2026.03.10
            </div>
            <hr />

            {/* 달력 */}
            <div className="calendar">
              <div className="days-of-week">
                {["일", "월", "화", "수", "목", "금", "토"].map(
                  (d) => (
                    <div key={d}>{d}</div>
                  )
                )}
              </div>

              <div className="dates">
                {Array.from({ length: 30 }, (_, i) => {
                  const dayOfWeek = i % 7;
                  const isWeekend =
                    dayOfWeek === 0 || dayOfWeek === 6;

                  return (
                    <div
                      key={i}
                      className={`date ${
                        selectedDate === i
                          ? "selected"
                          : ""
                      } ${
                        isWeekend ? "weekend" : ""
                      }`}
                      onClick={() => toggleDate(i)}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 시간 선택 */}
            <div className="time-slots">
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className={`time-slot ${
                    selectedTime === time
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => toggleTime(time)}
                >
                  {time}
                </div>
              ))}
            </div>

            {/* 하단 버튼 */}
            <div className="popup-buttons">
              <button
                className="reset"
                onClick={resetSelection}
              >
                초기화
              </button>
              <button
                className="confirm"
                onClick={confirmSelection}
              >
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