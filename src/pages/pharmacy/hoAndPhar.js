// import "./hoAndPhar.css"
// function HoAndPhar(){
//     return (
//         <div className="browser">
//     <div className="container">
//         <div className="upperContainer">
//             <div className="logo">바로닥큐</div>
//             <div className="searchbarDiv">
//                 <div className="searchbar">검색창</div>
//             </div>
//             <div className="login">로그인</div>
//             <div className="signup">회원가입</div>
//         </div>
//         <div className="middleContainer">
//             <div className="regionSearch">
//                 <div className="regionSearch1">지역 검색</div>
//                 <div className="searchLine"></div>
//                 <div className="regionSearch2">~~를 입력하세요.</div>
//                 <div className="searchBtn">검색버튼</div>
//             </div>
//         </div>
//         <div className="filterContainer"> 
//             <div className="filter1">필터</div>
//             <div className="filter1">필터</div>
//             <div className="filter1">필터</div>
//             <div className="filter1">필터</div>
//         </div>
//         <div className="container2">
//             <div className="map">지도</div>
//             <div className="pharmacy">
//                 <div className="pharName">약국 이름</div>
//                 <div className="pharExplain">
//                     <div className="pharExplain1">약국설명1</div>
//                     <div className="pharPhoto">약국 사진</div>
//                 </div>
//             </div>
//             <div className="pharmacy">
//                 <div className="pharName">약국 이름</div>
//                 <div className="pharExplain">
//                     <div className="pharExplain1">약국설명1</div>
//                     <div className="pharPhoto">약국 사진</div>
//                 </div>
//             </div>
//             <div className="pharmacy">
//                 <div className="pharName">약국 이름</div>
//                 <div className="pharExplain">
//                     <div className="pharExplain1">약국설명1</div>
//                     <div className="pharPhoto">약국 사진</div>
//                 </div>
//             </div>
//         </div>
//     </div>
// </div>

//     );
// }
// export default HoAndPhar;

import { useState } from 'react';
import "./pharmacy.css";
import { useNavigate } from 'react-router-dom';

function Pharmacy() {
    const navigate = useNavigate();

    // 1. 원본 데이터 (이후 DB에서 불러올 데이터)
    const initialPharmacies = [
        { id: 1, name: "든든약국", isOpen: true, isNight: false, isHoliday: true, desc: "친절한 약국입니다." },
        { id: 2, name: "야간샘약국", isOpen: false, isNight: true, isHoliday: false, desc: "밤 12시까지 운영해요." },
        { id: 3, name: "365약국", isOpen: true, isNight: true, isHoliday: true, desc: "항상 열려있습니다." },
        { id: 4, name: "우리동네약국", isOpen: true, isNight: false, isHoliday: false, desc: "우리 동네 친절한 약국" }
    ];

    // 2. 상태 관리 (필터링된 결과와 검색어)
    const [filteredPharmacies, setFilteredPharmacies] = useState(initialPharmacies);
    const [searchTerm, setSearchTerm] = useState("");

    // 3. 필터 함수
    function handleFilterChange(type) {
        let result = [];
        if (type === "진료중") {
            result = initialPharmacies.filter(p => p.isOpen);
        } else if (type === "야간진료") {
            result = initialPharmacies.filter(p => p.isNight);
        } else if (type === "공휴일") {
            result = initialPharmacies.filter(p => p.isHoliday);
        } else {
            result = initialPharmacies; // 전체보기
        }
        setFilteredPharmacies(result);
    }

    // 4. 검색 함수
    const handleSearch = () => {
        const result = initialPharmacies.filter(p => 
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

                <div className="middleContainser">
                    <div className="regionSearch">
                        {/* /* 화살표 함수로 감싸야 클릭할 때만 이동 */}
                        <div className="regionSearch1" onClick={() => navigate("/지역검색모달페이지")}>지역 검색</div>
                        <div className="searchLine"></div>
                        <input 
                            className="regionSearch2" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="약국 이름을 입력하세요."
                        />
                        <div className="searchBtn" onClick={handleSearch}>검색버튼</div>
                    </div>
                    
                    <div></div>
                    
                    {/* 필터 버튼들 */}
                    <button className="filter1 filter2" onClick={() => handleFilterChange("진료중")}>진료중</button>
                    <button className="filter1 filter2" onClick={() => handleFilterChange("야간진료")}>야간진료</button>
                    <button className="filter1 filter2" onClick={() => handleFilterChange("공휴일")}>공휴일</button>
                    <button className="filter1 filter2" onClick={() => handleFilterChange("전체")}>전체보기</button>
                </div>
                
                <div className="container2">
                    <div className="map">지도</div>
                    
                    <div className="pharmacyContainer">
                        {/* 데이터가 있을 때만 렌더링, 없으면 안내 문구 */}
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
                            <div className="pharmacy">해당하는 약국이 없습니다.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Pharmacy;