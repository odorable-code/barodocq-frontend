import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/UserLogin.css";

function UserLogin() {
  const navigate = useNavigate();

  // 1. 원본 데이터 (추후 DB 연동 가능)
  const initialPharmacies = [
    { id: 1, name: "든든약국", isOpen: true, isNight: false, isHoliday: true, desc: "친절한 약국입니다." },
    { id: 2, name: "야간샘약국", isOpen: false, isNight: true, isHoliday: false, desc: "밤 12시까지 운영해요." },
    { id: 3, name: "365약국", isOpen: true, isNight: true, isHoliday: true, desc: "항상 열려있습니다." },
    { id: 4, name: "우리동네약국", isOpen: true, isNight: false, isHoliday: false, desc: "우리 동네 친절한 약국" }
  ];

  // 2. 상태
  const [filteredPharmacies, setFilteredPharmacies] = useState(initialPharmacies);
  const [searchTerm, setSearchTerm] = useState("");

  // 3. 필터 함수
  const handleFilterChange = (type) => {
    let result = [];

    if (type === "진료중") {
      result = initialPharmacies.filter((p) => p.isOpen);
    } else if (type === "야간진료") {
      result = initialPharmacies.filter((p) => p.isNight);
    } else if (type === "공휴일") {
      result = initialPharmacies.filter((p) => p.isHoliday);
    } else {
      result = initialPharmacies; // 전체보기
    }

    setFilteredPharmacies(result);
  };

  // 4. 검색 함수
  const handleSearch = () => {
    const result = initialPharmacies.filter((p) =>
      p.name.includes(searchTerm)
    );
    setFilteredPharmacies(result);
  };

  return (
    <div className="browser">
      <div className="container">
        <div className="upperContainer">
          <div className="logo">바로닥큐</div>

          <div className="searchbarDiv">
            <div className="searchbar">검색창</div>
          </div>

          <div className="login">로그인</div>
          <div className="signup">회원가입</div>
        </div>

        <div className="middleContainer">
          <div className="regionSearch">
            {/* 클릭할 때만 이동 */}
            <div
              className="regionSearch1"
              onClick={() => navigate("/지역검색모달페이지")}
            >
              지역 검색
            </div>

            <div className="searchLine"></div>

            <input
              className="regionSearch2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="약국 이름을 입력하세요."
            />

            <div className="searchBtn" onClick={handleSearch}>
              검색버튼
            </div>
          </div>

          {/* 필터 버튼 */}
          <button onClick={() => handleFilterChange("진료중")}>
            진료중
          </button>
          <button onClick={() => handleFilterChange("야간진료")}>
            야간진료
          </button>
          <button onClick={() => handleFilterChange("공휴일")}>
            공휴일
          </button>
          <button onClick={() => handleFilterChange("전체")}>
            전체보기
          </button>
        </div>

        <div className="container2">
          <div className="map">지도</div>

          <div className="pharmacyContainer">
            {filteredPharmacies.length > 0 ? (
              filteredPharmacies.map((pharmacy) => (
                <div className="pharmacy" key={pharmacy.id}>
                  <div className="pharName">{pharmacy.name}</div>
                  <div className="pharExplain">
                    <div className="pharExplain1">{pharmacy.desc}</div>
                    <div className="pharPhoto">약국 사진</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="pharmacy">
                해당하는 약국이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;