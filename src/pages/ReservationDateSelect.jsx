import React, { useState } from "react";
import "../assets/styles/ReservationDateSelect.css";

function ReservationDateSelect({ onClose }) {
  const START_HOUR = 9;
  const END_HOUR = 21;
  const INTERVAL_MINUTES = 15;

  const today = new Date();
  const now = new Date();

  // 오늘이 속한 달 (기준 달)
  const baseYear = today.getFullYear();
  const baseMonth = today.getMonth();

  // 현재 보고 있는 달
  const [viewDate, setViewDate] = useState(
    new Date(baseYear, baseMonth, 1)
  );

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const firstDay = new Date(currentYear, currentMonth, 1);
  const firstDayWeek = firstDay.getDay();
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays = [];

  for (let i = 0; i < firstDayWeek; i++) {
    calendarDays.push(null);
  }

  for (let i = 1; i <= lastDate; i++) {
    calendarDays.push(new Date(currentYear, currentMonth, i));
  }

  // 🔥 이전달 버튼 표시 조건 (보고있는 달이 기준달보다 이후일 때)
  const canGoPrev =
    currentYear > baseYear ||
    (currentYear === baseYear && currentMonth > baseMonth);

  const goToPrevMonth = () => {
    if (!canGoPrev) return;
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const generateTimeSlots = () => {
    const morning = [];
    const afternoon = [];

    for (
      let minutes = START_HOUR * 60;
      minutes <= END_HOUR * 60;
      minutes += INTERVAL_MINUTES
    ) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;

      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const label = `${displayHour}:${minute.toString().padStart(2, "0")}`;
      const value = `${hour}:${minute.toString().padStart(2, "0")}`;

      if (hour < 12) {
        morning.push({ label, value });
      } else {
        afternoon.push({ label, value });
      }
    }

    return { morning, afternoon };
  };

  const timeSlots = selectedDate ? generateTimeSlots() : null;

  const toggleDate = (date) => {
    if (!date) return;

    const compare = new Date(date);
    compare.setHours(0, 0, 0, 0);

    const todayCopy = new Date(today);
    todayCopy.setHours(0, 0, 0, 0);

    if (compare < todayCopy) return;

    setSelectedDate(date);
    setSelectedTime(null);
  };

  const toggleTime = (value, disabled) => {
    if (disabled) return;
    setSelectedTime(value);
  };

  const resetSelection = () => {
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const confirmSelection = () => {
    if (!selectedDate || !selectedTime) return;

    alert(
      `${selectedDate.getFullYear()}.${
        selectedDate.getMonth() + 1
      }.${selectedDate.getDate()} / ${selectedTime}`
    );
  };

  const formatDate = (date) => {
    return `${date.getFullYear()}.${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}.${date.getDate().toString().padStart(2, "0")}`;
  };

  const isTimeDisabled = (value) => {
    if (!selectedDate) return false;

    const isToday =
      selectedDate.toDateString() === today.toDateString();

    if (!isToday) return false;

    const [hour, minute] = value.split(":").map(Number);
    const slotMinutes = hour * 60 + minute;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    return slotMinutes <= nowMinutes;
  };

  const isConfirmDisabled = !selectedDate || !selectedTime;

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="popup"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>언제 예약할까요?</h2>

        {/* 달 이동 */}
        <div className="month-header">
          {canGoPrev && (
            <button className="month-btn" onClick={goToPrevMonth}>
              ◀ 이전달
            </button>
          )}

          <div className="month-title">
            {currentYear}년 {currentMonth + 1}월
          </div>

          <button className="month-btn" onClick={goToNextMonth}>
            다음달 ▶
          </button>
        </div>

        <div className="subtitle">
          {formatDate(firstDay)} ~{" "}
          {formatDate(new Date(currentYear, currentMonth, lastDate))}
        </div>

        {selectedDate && selectedTime && (
          <div className="selection-summary">
            선택됨: {formatDate(selectedDate)} / {selectedTime}
          </div>
        )}

        <hr />

        <div className="calendar">
          <div className="days-of-week">
            {["일", "월", "화", "수", "목", "금", "토"].map(
              (d, idx) => (
                <div
                  key={d}
                  className={idx === 0 || idx === 6 ? "weekend" : ""}
                >
                  {d}
                </div>
              )
            )}
          </div>

          <div className="dates">
            {calendarDays.map((date, i) => {
              if (!date)
                return <div key={i} className="date empty" />;

              const isPast =
                date <
                new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate()
                );

              const isWeekend =
                date.getDay() === 0 || date.getDay() === 6;

              const isSelected =
                selectedDate &&
                date.getTime() === selectedDate.getTime();

              return (
                <div
                  key={i}
                  className={`date
                    ${isWeekend ? "weekend" : ""}
                    ${isPast ? "disabled" : ""}
                    ${isSelected ? "selected" : ""}
                  `}
                  onClick={() => toggleDate(date)}
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>
        </div>

        {timeSlots && (
          <>
            <div className="time-section-title">오전</div>
            <div className="time-slots">
              {timeSlots.morning.map((slot) => {
                const disabled = isTimeDisabled(slot.value);
                return (
                  <div
                    key={slot.value}
                    className={`time-slot
                      ${selectedTime === slot.value ? "selected" : ""}
                      ${disabled ? "disabled" : ""}
                    `}
                    onClick={() => toggleTime(slot.value, disabled)}
                  >
                    {slot.label}
                  </div>
                );
              })}
            </div>

            <div className="time-section-title">오후</div>
            <div className="time-slots">
              {timeSlots.afternoon.map((slot) => {
                const disabled = isTimeDisabled(slot.value);
                return (
                  <div
                    key={slot.value}
                    className={`time-slot
                      ${selectedTime === slot.value ? "selected" : ""}
                      ${disabled ? "disabled" : ""}
                    `}
                    onClick={() => toggleTime(slot.value, disabled)}
                  >
                    {slot.label}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="popup-buttons">
          <button className="reset" onClick={resetSelection}>
            초기화
          </button>

          <button
            className={`confirm ${
              isConfirmDisabled ? "confirm-disabled" : ""
            }`}
            onClick={confirmSelection}
            disabled={isConfirmDisabled}
          >
            선택 완료
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReservationDateSelect;