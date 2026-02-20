// ReservationDetail.jsx
import React, { useState } from "react";
import "../assets/styles/ReservationDetail.css";

// 병원 프로필 이미지 경로, 차후 변경가능
// import profileImg from "../assets/images/hospital_profile.png";

function ReservationDetail() {
  const [showPopup, setShowPopup] = useState(false);
  const [activeTab, setActiveTab] = useState("예약");

  // 팝업 닫기 + 탭 초기화
  const handleClose = () => {
    setActiveTab("예약"); // 탭 초기화
    setShowPopup(false);  // 팝업 닫기
  };

  return (
    <div>
      {/* 좌측 상단 내 예약 조회 버튼 */}
      <div style={{ position: "absolute", top: "20px", left: "20px" }}>
        <button
          className="view-btn"
          onClick={() => setShowPopup(true)}
        >
          내 예약 조회
        </button>
      </div>

      {/* 팝업 */}
      {showPopup && (
        <div className="overlay" onClick={handleClose}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            {/* X 버튼 */}
            <button className="close-btn" onClick={handleClose}>
              ×
            </button>

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

            {/* 병원 정보 */}
            <div className="hospital-info">
              <img
                // 나중에 병원 정보 이미지 쓰려면 이거 사용
                // src={profileImg}

                // 이건 임시 트스트용 이미지 경로
                src="https://picsum.photos/200"
                alt="병원"
                className="hospital-profile"
              />
              <div className="hospital-name">샘플 병원 이름</div>
            </div>

            {/* 예약 정보 박스 */}
            <div className="reservation-box">
              <h3>예약 상태 : 확인 완료</h3>
              <p>예약 일시: 2026-02-19 14:30</p>
              <p>방문 횟수: 3회</p>
            </div>

            {/* 공백 채우기 */}
            <div className="spacer"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReservationDetail;
