import React, { useState } from "react";
import "../assets/styles/ReservationDetail.css";
import profileImg from "../assets/images/hospital_profile.png";

function ReservationDetail() {
  const [activeTab, setActiveTab] = useState("예약");

  return (
    <div className="overlay">
      <div className="popup">
        {/* 상단 탭 */}
        <div className="tab-menu">
          {["예약", "취소 예약", "지난 예약"].map((tab) => (
            <div
              key={tab}
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* 병원 프로필 */}
        <div className="hospital-info">
          <img src={profileImg} alt="병원" className="hospital-profile" />
          <div className="hospital-name">샘플 병원 이름</div>
        </div>

        {/* 예약 정보 박스 */}
        <div className="reservation-box">
          <h3>예약 상태 : 확인 완료</h3>
          <p>예약 일시: 2026-02-19 14:30</p>
          <p>방문 횟수: 3회</p>
        </div>

        {/* 아래 공백 */}
        <div className="spacer"></div>
      </div>
    </div>
  );
}

export default ReservationDetail;
