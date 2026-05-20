import React, { useState } from "react";
import "../assets/styles/ReservationDateSelect.css";

function ReservationDateSelect() {

  const [showPopup, setShowPopup] = useState(false); // 팝업창 열림/닫힘 상태
  const [selectedDate, setSelectedDate] = useState(null); // 사용자가 선택한 '일(Date)' (0부터 시작하는 인덱스 개념)
  const [selectedTime, setSelectedTime] = useState(null); // 사용자가 선택한 '시간' (예: "09:15")

  const today = new Date(); // 실제 오늘 날짜
  const now = new Date(); // 현재 시간 (당일 예약 시 지난 시간 비활성화에 사용)
  
  // 달력에 보여줄 연도와 월을 관리하는 상태 (초기값은 이번 달 1일)
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const baseYear = today.getFullYear(); // 올해 연도
  const baseMonth = today.getMonth(); // 이번 달

  const currentYear = viewDate.getFullYear(); // 현재 달력에서 보고 있는 연도
  const currentMonth = viewDate.getMonth(); // 현재 달력에서 보고 있는 월
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate(); // 현재 보고 있는 월의 마지막 일(28, 30, 31 등) 구하기

  // 팝업 닫기 및 선택 초기화
  const handleClose = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setShowPopup(false);
  };

  // 이전 달력으로 돌아갈 수 있는지 확인 (과거 달로는 이동 불가하도록)
  const canGoPrev =
    currentYear > baseYear || (currentYear === baseYear && currentMonth > baseMonth);

  // 이전 달로 이동
  const goToPrevMonth = () => {
    if (!canGoPrev) return; // 갈 수 없으면 함수 종료
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDate(null); // 달이 바뀌면 선택된 날짜/시간 초기화
    setSelectedTime(null);
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  // 시간 슬롯(예약 가능 시간) 생성 로직
  const OPEN_HOUR = 9; // 오픈 시간 (오전 9시)
  const CLOSE_HOUR = 21; // 마감 시간 (오후 9시)
  const INTERVAL_MIN = 15; // 예약 간격 (15분 단위)
  const END_OFFSET_MIN = 30; // 마감 전 최소 예약 가능 시간 (마감 30분 전까지만 예약 가능)

  const generateTimes = () => {
    const morning = [];
    const afternoon = [];
    
    // 오픈 시간부터 마감 시간까지 반복
    for (let hour = OPEN_HOUR; hour <= CLOSE_HOUR; hour++) {
      for (let min = 0; min < 60; min += INTERVAL_MIN) {
        const totalMinutes = hour * 60 + min;
        const lastSlotTime = CLOSE_HOUR * 60 - END_OFFSET_MIN;
        
        // 마감 시간 30분 전이 넘어가면 생성 중단
        if (totalMinutes > lastSlotTime) break;
        
        // 시간을 "09:15" 형태로 포맷팅 -> padStart(목표_길이, 채울_문자)
        const timeStr = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
        
        // 12시 이전이면 오전, 아니면 오후 배열에 추가
        if (hour < 12) morning.push(timeStr);
        else afternoon.push(timeStr);
      }
    }
    return { morning, afternoon };
  };

  // 날짜가 선택되었을 때만 시간 슬롯을 생성
  const timeSlots = selectedDate !== null ? generateTimes() : { morning: [], afternoon: [] };

  // 날짜 클릭 시 실행
  const toggleDate = (i, disabled) => {
    if (disabled) return; // 과거 날짜면 클릭 무시
    if (selectedDate === i) {
      // 이미 선택된 날짜를 다시 누르면 선택 해제
      setSelectedDate(null);
      setSelectedTime(null);
    } else {
      // 새로운 날짜 선택
      setSelectedDate(i);
      setSelectedTime(null); // 날짜가 바뀌면 기존에 선택한 시간은 초기화
    }
  };

  // 시간 클릭 시 실행
  const toggleTime = (time, disabled) => {
    if (disabled) return; // 지나간 시간이면 클릭 무시
    if (selectedTime === time) setSelectedTime(null); // 다시 누르면 해제
    else setSelectedTime(time); // 선택
  };

  // 선택된 날짜와 시간을 합쳐서 "YYYY.MM.DD HH:mm" 형태의 문자열로 만들어주는 함수
  const formatFullDate = () => {
    if (selectedDate === null || !selectedTime) return "";
    const dateStr = `${currentYear}.${String(currentMonth + 1).padStart(2, "0")}.${String(selectedDate + 1).padStart(2, "0")}`;
    return `${dateStr} ${selectedTime}`;
  };

  // 예약 확인 (API 호출 및 예외 처리)
  const handleConfirm = async () => {
    // 날짜나 시간이 선택되지 않았다면 경고
    if (!selectedDate || !selectedTime) {
      alert("날짜와 시간을 선택해주세요!");
      return;
    }

    const reservationData = {
      date: formatFullDate(), // 백엔드로 보낼 포맷팅된 데이터
    };

    const API_URL = "http://localhost:8080/api/v1/reservations";

    try {
      // 백엔드 API로 POST 요청 보내기
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationData),
      });

      if (!response.ok) throw new Error("서버 응답 실패");

      const data = await response.json();
      alert(`예약확정: ${data.date || formatFullDate()}`);
      handleClose(); // 성공 시 팝업 닫기
      
    } catch (err) {
      // 백엔드 서버가 안 켜져 있거나 에러가 났을 때(개발 환경) 실행되는 부분
      console.warn("실제 호출 실패, Mock으로 처리:", err);

      // 사용자에게는 정상 동작하는 것처럼 Mock(가짜) 알림 띄워주기
      setTimeout(() => {
        alert(`예약확정 (Mock): ${formatFullDate()}`);
        handleClose();
      }, 500);
    }
  };

  // 화면 렌더링 (UI)
  return (
    <div>
      {/* 팝업을 여는 트리거 버튼 */}
      <button onClick={() => setShowPopup(true)}>예약 날짜 선택</button>

      {/* showPopup이 true일 때만 화면에 렌더링됨 */}
      {showPopup && (
        <div className="overlay" onClick={handleClose}>
          {/* 팝업 내부를 클릭했을 때 overlay의 onClick이 실행되어 팝업이 닫히는 것을 방지 */}
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={handleClose}>×</button>

            {/* 달력 헤더 (연/월 및 이전/다음 달 버튼) */}
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

            {/* 현재 선택된 날짜와 시간 요약 표시 */}
            {selectedDate !== null && selectedTime && (
              <div className="selection-summary">선택됨: {formatFullDate()}</div>
            )}

            <hr />

            {/* 달력 본문 */}
            <div className="calendar">
              <div className="days-of-week">
                {["일","월","화","수","목","금","토"].map((d, idx) => (
                  <div key={d} className={idx === 0 || idx === 6 ? "weekend" : ""}>{d}</div>
                ))}
              </div>
              
              <div className="dates">
                {/* lastDate(마지막 일)만큼 배열을 만들어 날짜 칸 생성 */}
                {Array.from({ length: lastDate }, (_, i) => {
                  const dateObj = new Date(currentYear, currentMonth, i + 1);
                  // 오늘보다 과거인지 체크
                  const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  // 주말인지 체크
                  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                  
                  return (
                    <div
                      key={i}
                      // 선택됨, 주말, 과거(비활성화)에 따른 클래스 동적 부여
                      className={`date ${selectedDate === i ? "selected" : ""} ${isWeekend ? "weekend" : ""} ${isPast ? "disabled" : ""}`}
                      onClick={() => toggleDate(i, isPast)}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 날짜를 선택했을 때만 하단에 시간 슬롯 노출 */}
            {selectedDate !== null && (
              <>
                {/* 오전 슬롯 렌더링 */}
                {timeSlots.morning.length > 0 && (
                  <>
                    <div className="time-section-title">오전 진료</div>
                    <div className="time-slots">
                      {timeSlots.morning.map(slot => {
                        let disabled = false;
                        const selectedFullDate = new Date(currentYear, currentMonth, selectedDate + 1);
                        
                        // '오늘'을 선택했을 경우, 현재 시간보다 과거인 시간 슬롯은 비활성화
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

                {/* 오후 슬롯 렌더링 */}
                {timeSlots.afternoon.length > 0 && (
                  <>
                    <div className="time-section-title">오후 진료</div>
                    <div className="time-slots">
                      {timeSlots.afternoon.map(slot => {
                        let disabled = false;
                        const selectedFullDate = new Date(currentYear, currentMonth, selectedDate + 1);
                        
                        // '오늘'을 선택했을 경우, 현재 시간보다 과거인 시간 슬롯은 비활성화
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

            {/* 하단 제어 버튼 (초기화, 완료) */}
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