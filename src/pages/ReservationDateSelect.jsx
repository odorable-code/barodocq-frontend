import React, { useState } from "react";
import "../assets/styles/ReservationDateSelect.css";

function ReservationDateSelect() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimes, setSelectedTimes] = useState([]);

  const generateTimeSlots = () => {
    const times = [];
    for (let hour = 9; hour <= 21; hour++) {
      times.push(`${hour}:00`);
      if (hour !== 21) times.push(`${hour}:30`);
    }
    return times;
  };
  const timeSlots = generateTimeSlots();

  const toggleDate = (i) => setSelectedDate(selectedDate === i ? null : i);

  const toggleTime = (time) => {
    if (selectedTimes.includes(time)) {
      setSelectedTimes(selectedTimes.filter(t => t !== time));
    } else {
      setSelectedTimes([...selectedTimes, time]);
    }
  };

  const resetSelection = () => {
    setSelectedDate(null);
    setSelectedTimes([]);
  };

  const confirmSelection = () => {
    if (selectedDate === null) {
      alert("날짜를 선택해주세요!");
      return;
    }
    if (selectedTimes.length === 0) {
      alert("시간을 선택해주세요!");
      return;
    }
    alert(`선택된 날짜: ${selectedDate + 1}, 시간: ${selectedTimes.join(", ")}`);
  };

  return (
    <div className="overlay">
      <div className="popup">
        <h2>언제 예약할까요?</h2>
        <div className="subtitle">예약 가능한 날짜 예: 2026.02.10 ~ 2026.03.10</div>
        <hr />

        {/* 달력 */}
        <div className="calendar">
          <div className="days-of-week">
            {["일","월","화","수","목","금","토"].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="dates">
            {Array.from({length: 30}, (_, i) => {
              const dayOfWeek = i % 7;
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              return (
                <div
                  key={i}
                  className={`date ${selectedDate===i ? 'selected':''} ${isWeekend ? 'weekend':''}`}
                  onClick={()=>toggleDate(i)}
                >
                  {i+1}
                </div>
              )
            })}
          </div>
        </div>

        {/* 예약 가능 시간 + 버튼 한 줄 */}
        <div className="time-selection-header">
          <div className="title">예약 가능 시간</div>
          <div className="buttons">
            <button className="reset" onClick={resetSelection}>초기화</button>
            <button className="confirm" onClick={confirmSelection}>선택 완료</button>
          </div>
        </div>

        {/* 시간 선택 박스 */}
        <div className="time-slots">
          {timeSlots.map(time => (
            <div
              key={time}
              className={`time-slot ${selectedTimes.includes(time)?'selected':''}`}
              onClick={()=>toggleTime(time)}
            >
              {time}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReservationDateSelect;
