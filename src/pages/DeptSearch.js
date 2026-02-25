import React, { useState } from "react";

// 1. 데이터는 함수 밖 상단에 딱 한 번!
const DEPARTMENTS = [
  "내과", "산부인과", "성형외과", "비뇨기과", "외과", 
  "영상의학과", "소아청소년과", "이비인후과", "안과", "정형외과", 
  "가정의학과", "흉부외과", "신경과", "치과", "피부과", 
  "정신의학과", "한의과", "신경외과", "마취통증과", "재활의학과"
];

// 2. 스타일 객체는 함수 밖으로 빼두는 게 깔끔
const listStyle = {
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  backgroundColor: "white",
  border: "1px solid #ccc",
  listStyle: "none",
  padding: 0,
  margin: 0,
  zIndex: 10,
  maxHeight: "200px",
  overflowY: "auto"
};

const itemStyle = {
  padding: "10px",
  cursor: "pointer",
  borderBottom: "1px solid #eee",
  backgroundColor: "white",
};

// 3. 함수 선언은 한 번만!
function DeptSearch() {
  const [searchTerm, setSearchTerm] = useState(""); 
  const [showList, setShowList] = useState(false); 

  const filteredDepts = DEPARTMENTS.filter((dept) =>
    dept.includes(searchTerm)
  );

  return (
    <div style={{ position: "relative", width: "300px", margin: "50px auto" }}>
      <input
        type="text"
        placeholder="진료과목 검색 (예: 이)"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowList(true);
        }}
        onFocus={() => setShowList(true)}
        style={{ width: "100%", padding: "10px", boxSizing: "border-box" }}
      />

      {showList && searchTerm && (
        <ul style={listStyle}>
          {filteredDepts.length > 0 ? (
            filteredDepts.map((dept, index) => (
              <li
                key={index}
                onClick={() => {
                  setSearchTerm(dept);
                  setShowList(false);
                }}
                style={itemStyle}
              >
                {dept}
              </li>
            ))
          ) : (
            <li style={{ padding: "10px", color: "#999" }}>검색 결과가 없습니다.</li>
          )}
        </ul>
      )}
    </div>
  );
} // 함수 닫기

export default DeptSearch;