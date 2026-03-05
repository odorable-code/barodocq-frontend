import React, { useState } from "react";

// 1. 데이터는 함수 밖 상단에 딱 한 번!
const DEPARTMENTS = [
  "내과", "소화기내과", "순환기내과", "호흡기내과", "내분비내과", "신장내과", "혈액종양내과", "감염내과", "류마티스내과",
  "외과", "간담췌외과", "위장관외과", "대장항문외과", "유방내분비외과", "흉부외과", "혈관외과", "정형외과",
  "신경외과", "신경과", "재할의학과", "소아청소년과", "산부인과", "소아외과", "피부과", "성형외과", "안과",
  "이비인후과", "정신건강의학과", "영상의학과", "진단검사의학과", "핵의학과", "병리과", "마취통증의학과", 
  "응급의학과", "통증클리닉", "비뇨의학과", "심장내과", "가정의학과", "직업환경의학과", "예방의학과",
  "구강악안면외과", "치과", "한방내과", "침구과", "한방재활의학과"
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

function DeptSearch() {
  const [searchTerm, setSearchTerm] = useState(""); 
  const [showList, setShowList] = useState(false); 

  const filteredDepts = DEPARTMENTS.filter((dept) =>
    dept.includes(searchTerm)
  );

  return (
    <div 
    //style={{ position: "relative", width: "300px", margin: "50px auto" }}
    >
      <input
        type="text"
        placeholder="진료과목 검색 (예: 이)"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowList(true);
        }}
        onFocus={() => setShowList(true)}
        //style={{ width: "100%", padding: "10px", boxSizing: "border-box" }}
      />

      {/* showList가 true이고, searchTerm이 빈 값이 아닐 때만 <ul> 태그를 화면에 그린다. */}
      {showList && searchTerm && (
        <ul 
        //style={listStyle}
        >
          {filteredDepts.length > 0 ? (
            filteredDepts.map((dept, index) => (
              <li
                key={index}
                onClick={() => {
                  setSearchTerm(dept);
                  setShowList(false);
                }}
                //style={itemStyle}
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
}




//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡDeptSearch2ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
function DeptSearch2() {
  const [searchTerm, setSearchTerm] = useState(""); 
  const [showList, setShowList] = useState(false); 

  const filteredDepts = DEPARTMENTS.filter((dept) =>
    dept.includes(searchTerm)
  );
  

  return (
    <div style={{position : "relative"}}>

      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 16px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 0 0 15px 15px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #14b8a6;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #0d9488;
          }
          /* 마우스 올렸을 때 배경색 변화 추가 (선택사항) */
          .custom-scrollbar li:hover {
            background-color: #f0fdfa;
            cursor: pointer;
          }
        `}
      </style>

      <div className="search-container-s2"
      style={{borderRadius: searchTerm ? "15px 15px 0 0" : "15px"}}
      >  
        <div className="search-field-s2"
        >
          <i className="fas fa-search" />
          <input
            type="text"
            placeholder="증상이나 진료과를 검색하세요"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowList(true);
            }}
            onFocus={() => setShowList(true)}
          />
        </div>
        <button className="btn-search-s2">
          검색하기 <i className="fas fa-arrow-right" />
        </button>
      </div>
      <div className="custom-scrollbar" style={{background:"white", position:"absolute", top:"100%", left:0, right:0, zIndex:10,
                  overflow: "auto", maxHeight: "250px"
      }}>

        {/* showList가 true이고, searchTerm이 빈 값이 아닐 때만 <ul> 태그를 화면에 그린다. */}
        {showList && searchTerm && (
          <ul
            style={{listStyle:"none"}}
          >
            {filteredDepts.length > 0 ? (
              filteredDepts.map((dept, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setSearchTerm(dept);
                    setShowList(false);
                  }}

                  style={{padding: "3px 15px 0 15px", boxSizing: "border-box",  borderStyle: "solid",
                          borderColor: "#14b8a6",
                          borderWidth: "0 0.5px 0 0.5px"}}
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

    </div>
  );
}

export { DeptSearch, DeptSearch2 } ;