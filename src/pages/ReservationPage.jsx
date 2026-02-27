import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../assets/styles/ReservationPage.css";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

export default function ReservationPage() {
  const { hoNum } = useParams();

  const [hospital, setHospital] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [reservedTimes, setReservedTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [visitType, setVisitType] = useState("초진");
  const [memo, setMemo] = useState("");

  // 부모 페이지에서 쓰는법!
  // const [selectedHoNum, setSelectedHoNum] = useState(null);

  // <button onClick={() => setSelectedHoNum(hos.hoNum)}>
  //   예약하기
  // </button>

  // {selectedHoNum && (
  //   <ReservationPage
  //     hoNum={selectedHoNum}
  //     onClose={() => setSelectedHoNum(null)}
  //   />
  // )}

  // 병원 정보 불러오기
  useEffect(() => {
    axios.get(`${API}/api/v1/hospitals/${hoNum}`)
      .then(res => setHospital(res.data));
  }, [hoNum]);

  // 날짜 선택 시 예약된 시간 불러오기
  useEffect(() => {
    if (!selectedDate) return;

    axios.get(`${API}/api/v1/reservations/unavailable`, {
      params: { hoNum, date: selectedDate }
    }).then(res => setReservedTimes(res.data));
  }, [selectedDate, hoNum]);

  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  };

  const generateTimes = () => {
    const times = [];
    for (let h = 9; h <= 17; h++) {
      times.push(`${String(h).padStart(2, "0")}:00`);
      times.push(`${String(h).padStart(2, "0")}:30`);
    }
    return times;
  };

  const handleReserve = async () => {
    if (!selectedDate || !selectedTime) {
      alert("날짜와 시간을 선택해주세요.");
      return;
    }

    try {
      await axios.post(`${API}/api/v1/reservations`, {
        hoNum,
        reDate: selectedDate,
        reTime: selectedTime,
        visitType,
        memo
      });
      alert("예약이 완료되었습니다.");
    } catch (err) {
      alert("이미 예약된 시간입니다.");
    }
  };

  if (!hospital) return <div>로딩중...</div>;

  return (
    <div className="reservation-page">
      <div className="hospital-summary">
        <h2>{hospital.hoName}</h2>
        <p>{hospital.hoAddress}</p>
        <p>{hospital.hoPhone}</p>
      </div>

      <div className="section">
        <h3>📅 날짜 선택</h3>
        <div className="date-grid">
          {generateDates().map(date => (
            <button
              key={date}
              className={selectedDate === date ? "active" : ""}
              onClick={() => setSelectedDate(date)}
            >
              {date}
            </button>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div className="section">
          <h3>⏰ 시간 선택</h3>
          <div className="time-grid">
            {generateTimes().map(time => {
              const disabled = reservedTimes.includes(time);
              return (
                <button
                  key={time}
                  disabled={disabled}
                  className={selectedTime === time ? "active" : ""}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="section">
        <h3>방문 유형</h3>
        <label>
          <input
            type="radio"
            value="초진"
            checked={visitType === "초진"}
            onChange={() => setVisitType("초진")}
          />
          초진
        </label>
        <label>
          <input
            type="radio"
            value="재진"
            checked={visitType === "재진"}
            onChange={() => setVisitType("재진")}
          />
          재진
        </label>
      </div>

      <div className="section">
        <h3>요청 사항</h3>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="증상이나 요청 사항을 적어주세요"
        />
      </div>

      <button className="reserve-btn" onClick={handleReserve}>
        예약하기
      </button>
    </div>
  );
}

