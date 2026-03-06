import React, { useEffect, useState } from "react";
import {faMagnifyingGlass, faXmark} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

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

function search(searchTerm) {

  return DEPARTMENTS.filter((dept) =>
    dept.includes(searchTerm)
  );
}
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

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
// function DeptSearch4() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showList, setShowList] = useState(false);
//   const navigate = useNavigate();

//   const filteredDepts = DEPARTMENTS.filter((dept) =>
//     dept.includes(searchTerm)
//   );

//   // 검색 실행 함수
//   const handleSearch = (e) => {
    
//     console.log("1. 함수 진입");
//     if (e) e.preventDefault();
//     console.log("2. 새로고침 방지 완료");

//     if (searchTerm.trim()) {
//       navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
//       setShowList(false);
//     } else {
//       alert("검색어를 입력해주세요.");
//     }
//   };

//   function HospitalList() {
//   const [searchParams] = useSearchParams();
//   const [hospitals, setHospitals] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // 1. URL 파라미터에서 'query'(진료과 이름) 추출
//   const deptName = searchParams.get("query");

//   useEffect(() => {
//     const fetchHospitals = async () => {
//       if (!deptName) return;

//       try {
//         setLoading(true);
//         const response = await fetch(`/api/hospitals?deptName=${encodeURIComponent(deptName)}`, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           }
//         });

//         if (!response.ok) {
//           throw new Error("서버 응답에 실패했습니다.");
//         }

//         // 3. 응답 데이터를 JSON으로 변환
//         const data = await response.json();
        
//         // 4. 상태 업데이트 (화면에 병원 목록 출력)
//         setHospitals(data);
//       } catch (error) {
//         console.error("DB 조회 중 오류 발생:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHospitals();
//   }, [deptName]); // 검색어가 바뀔 때마다 다시 실행

//   return (
//     <div style={{ position: "relative", zIndex: "2147483647" }}>
//       <style>
//         {`
//           /* 1. 검색창 활성화 시 부모 레이아웃 우선순위 강제 격상 */
//           body:has(.custom-scrollbar ul) .hdr__nav-inner,
//           body:has(.custom-scrollbar ul) .auth-layout {
//             z-index: 0 !important;
//             position: relative !important;
//           }

//           /* 2. 기존 스크롤바 및 리스트 스타일 */
//           .custom-scrollbar::-webkit-scrollbar {
//             width: 16px;
//           }
//           .custom-scrollbar::-webkit-scrollbar-track {
//             background: #f1f5f9;
//             border-radius: 0 0 15px 15px;
//           }
//           .custom-scrollbar::-webkit-scrollbar-thumb {
//             background: #14b8a6;
//             border-radius: 10px;
//           }
//           .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//             background: #0d9488;
//           }
//           .custom-scrollbar li:hover {
//             background-color: #f0fdfa;
//             cursor: pointer;
//           }

//           /* 부모 요소 중 overflow: hidden이 있다면 해제 */
//           body:has(.custom-scrollbar ul) .hdr__nav {
//             overflow: visible !important;
//           }
//         `}
//       </style>

      
//       <form 
//         className="search-container-s2"
//         onSubmit={handleSearch}
//         style={{ 
//           borderRadius: (showList && searchTerm) ? "15px 15px 0 0" : "15px", 
//           zIndex: "2147483647",
//           display: "flex", // 버튼과 입력을 한 줄에 배치
//           alignItems: "center"
//         }}
//       >  
//         <div className="search-field-s2" style={{ flex: 1, display: "flex", alignItems: "center" }}>
//           <i className="fas fa-search" />
//           <input
//             type="text"
//             placeholder="병원·약국·증상을 검색하세요"
//             value={searchTerm}
//             onChange={(e) => {
//               setSearchTerm(e.target.value);
//               setShowList(true);
//             }}
//             onFocus={() => setShowList(true)}
//             style={{ width: "100%", border: "none", outline: "none" }}
//           />
//         </div>
        
//         <button type="submit" className="btn-search-s2">
//           검색하기 <i className="fas fa-arrow-right" />
//         </button>
//       </form>

//       {/* 검색 결과 리스트 */}
//       {showList && searchTerm && (
//         <div className="custom-scrollbar" style={{
//           background: "white", 
//           position: "absolute", 
//           top: "100%", 
//           left: 0, 
//           right: 0, 
//           zIndex: 1000, 
//           overflow: "auto", 
//           maxHeight: "250px",
//           boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
//           borderRadius: "0 0 15px 15px",
//           border: "1px solid #14b8a6",
//           borderTop: "none"
//         }}>
//           <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
//             {filteredDepts.length > 0 ? (
//               filteredDepts.map((dept, index) => (
//                 <li
//                   key={index}
//                   onClick={() => {
//                     setSearchTerm(dept);
//                     setShowList(false);
//                     // 클릭 즉시 검색을 원하면 아래 주석 해제
//                     // navigate(`/search?query=${encodeURIComponent(dept)}`);
//                   }}
//                   style={{
//                     padding: "10px 15px", 
//                     boxSizing: "border-box",
//                     borderBottom: index === filteredDepts.length - 1 ? "none" : "0.5px solid #eee"
//                   }}
//                 >
//                   {dept} 
//                 </li>
//               ))
//             ) : (
//               <li style={{ padding: "10px", color: "#999" }}>검색 결과가 없습니다.</li>
//             )}
//           </ul>
//         </div>
//       )}
//     </div>
//     );
//   }
// }

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

function DeptSearch4() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showList, setShowList] = useState(false);
  const navigate = useNavigate();

  const filteredDepts = DEPARTMENTS.filter((dept) =>
    dept.includes(searchTerm)
  );

  const handleSearch = (e) => {
    if (e) e.preventDefault(); // 폼 제출 시 새로고침 방지
    
    if (searchTerm.trim()) {
      // 주소창 이동
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
      setShowList(false);
    } else {
      alert("검색어를 입력해주세요.");
    }
  };

  // ✅ HospitalList 함수는 DeptSearch4의 return 안에 있으면 안 됩니다. 
  // 별도의 페이지 컴포넌트로 분리하거나, 여기서는 검색창만 리턴해야 합니다.

  return (
    <div style={{ position: "relative", zIndex: "2147483647" }}>
      <style>
        {`
          body:has(.custom-scrollbar ul) .hdr__nav-inner,
          body:has(.custom-scrollbar ul) .auth-layout {
            z-index: 0 !important;
            position: relative !important;
          }
          .custom-scrollbar::-webkit-scrollbar { width: 16px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 0 0 15px 15px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #14b8a6; border-radius: 10px; }
          .custom-scrollbar li:hover { background-color: #f0fdfa; cursor: pointer; }
          body:has(.custom-scrollbar ul) .hdr__nav { overflow: visible !important; }
        `}
      </style>

      {/* 검색창 본체 - form 태그가 확실히 닫히고 return 되어야 보입니다 */}
      <form 
        className="search-container-s2"
        onSubmit={handleSearch}
        style={{ 
          borderRadius: (showList && searchTerm) ? "15px 15px 0 0" : "15px", 
          zIndex: "2147483647",
          display: "flex",
          alignItems: "center",
        }}
      >  
        <div className="search-field-s2" style={{ flex: 1, display: "flex", alignItems: "center", padding: "10px" }}>
          <i className="fas fa-search" style={{ marginRight: "10px" }} />
          <input
            type="text"
            placeholder="병원·약국·증상을 검색하세요"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowList(true);
            }}
            onFocus={() => setShowList(true)}
            style={{ width: "100%", border: "none", outline: "none" }}
          />
        </div>
        
        <button type="submit" className="btn-search-s2" style={{ padding: "10px 20px", background: "#14b8a6", color: "#fff", border: "none", cursor: "pointer" }}>
          검색하기 <i className="fas fa-arrow-right" />
        </button>
      </form>

      {/* 검색 결과 리스트 */}
      <AutoCompleteResult searchTerm={null} />
      {/* {showList && searchTerm && (
        <div className="custom-scrollbar" style={{
          background: "white", 
          position: "absolute", 
          top: "100%", 
          left: 0, 
          right: 0, 
          zIndex: 1000, 
          overflow: "auto", 
          maxHeight: "250px",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          borderRadius: "0 0 15px 15px",
          border: "1px solid #14b8a6",
          borderTop: "none"
        }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {filteredDepts.length > 0 ? (
              filteredDepts.map((dept, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setSearchTerm(dept);
                    setShowList(false);
                  }}
                  style={{
                    padding: "10px 15px", 
                    boxSizing: "border-box",
                    borderBottom: index === filteredDepts.length - 1 ? "none" : "0.5px solid #eee"
                  }}
                >
                  {dept} 
                </li>
              ))
            ) : (
              <li style={{ padding: "10px", color: "#999" }}>검색 결과가 없습니다.</li>
            )}
          </ul>
        </div>
      )} */}
    </div>
  );
}

function AutoCompleteResult({styles, searchTerm, setSearchTerm, showList, setShowList }) {
  // const [searchTerm, setSearchTerm] = useState(search);
  // const [showList, setShowList] = useState(true);
  const filteredDepts = DEPARTMENTS.filter((dept) =>
    dept.includes(searchTerm)
  );
  console.log(showList, searchTerm);
  return (
    <div style={styles}>
      {showList && searchTerm && (
        <div className="custom-scrollbar" style={ {
          background: "white", 
          // position: "absolute", 
          // top: "100%", 
          // left: 0, 
          // right: 0, 
          zIndex: 1000, 
          overflow: "auto", 
          maxHeight: "250px",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          borderRadius: "0 0 15px 15px",
          // border: "1px solid #14b8a6",
          borderTop: "none"
        }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {filteredDepts.length > 0 ? (
              filteredDepts.map((dept, index) => (
                <li
                  key={dept}
                  onClick={() => {
                    console.log("검색어 선택:", dept);
                    setSearchTerm(dept);
                    setShowList(false);
                  }}
                  style={{
                    padding: "10px 15px", 
                    boxSizing: "border-box",
                    borderBottom: index === filteredDepts.length - 1 ? "none" : "0.5px solid #eee"
                  }}
                >
                  {dept} 
                </li>
              ))
            ) : (
              <li style={{ padding: "10px", color: "#999" }}>검색 결과가 없습니다.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export { DeptSearch, DeptSearch2, DeptSearch4 , search, AutoCompleteResult};