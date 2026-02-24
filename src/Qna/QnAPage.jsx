// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { authFetch } from "../utils/authFetch";
// import "../assets/styles/QnAPage.css";

// /* ─────────────────────────────────────────
//    QnA 게시판
// ───────────────────────────────────────── */
// const QnAPage = () => {
//   const navigate = useNavigate();
//   const [qnas, setQnas] = useState([]);
//   const [activeCategory, setActiveCategory] = useState("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedQnA, setSelectedQnA] = useState(null);
//   const [sortBy, setSortBy] = useState("latest"); // latest | views | unanswered

//   // JWT에서 현재 사용자
//   const token = localStorage.getItem("accessToken");
//   let currentUser = null;
//   if (token) {
//     try {
//       const payloadBase64 = token.split('.')[1];
//       const payloadJson = atob(payloadBase64);
//       const payload = JSON.parse(payloadJson);
//       currentUser = payload.sub;
//       console.log("현재 사용자:", currentUser);
//     } catch (err) {
//       console.error("토큰 디코딩 실패", err);
//     }
//   }


//   // QNA 가져오기 & 매핑
//   useEffect(() => {
//     const getQnas = async () => {
//       if (!token) return;

//       try {
//         const data = await authFetch("http://localhost:8080/api/v1/qnas");

//         // DTO → QnACard 형식으로 변환
//         const mappedData = data.map(q => ({
//           id: q.qn_num,
//           category: "예약", // 필요하면 q.qn_is_private, ho_num 등으로 실제 카테고리
//           title: q.qn_title || "제목 없음",
//           author: "익명", // user_num으로 실제 이름 매핑 가능
//           date: q.qn_created_at ? q.qn_created_at.split("T")[0] : "",
//           views: q.qn_view_count || 0,
//           status: q.qn_status || "대기중",
//           hasAnswer: q.qn_status === "답변완료",
//           content: q.qn_content || "내용 없음",
//           answer: null // 관리자 답변이 있다면 추가 매핑
//         }));

//         setQnas(mappedData);
//         console.log("매핑된 QNA 데이터:", mappedData);
//       } catch (err) {
//         console.error("QNA 로드 에러:", err);
//       }
//     };
//     getQnas();
//   }, [token]);

//   // 필터링 + 정렬
//   const filteredData = qnas
//     .filter(q => activeCategory === "all" || q.category === activeCategory)
//     .filter(q => 
//       q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       q.content.toLowerCase().includes(searchQuery.toLowerCase())
//     )
//     .sort((a, b) => {
//       if (sortBy === "views") return b.views - a.views;
//       if (sortBy === "unanswered") return a.hasAnswer - b.hasAnswer;
//       return b.id - a.id; // latest
//     });

//   const handleWriteClick = () => {
//     navigate("/qna/write");
//   };

//   const CATEGORIES = [
//     { id: "all", label: "전체", icon: "th-large" },
//     { id: "예약", label: "예약", icon: "calendar-check" },
//     { id: "결제", label: "결제", icon: "credit-card" },
//     { id: "서비스", label: "서비스", icon: "concierge-bell" },
//     { id: "회원", label: "회원", icon: "user" },
//     { id: "기타", label: "기타", icon: "circle-question" }
//   ];

//   return (
//     <div className="qna-page">
//       {/* HERO + 검색 + 통계 생략, 기존 코드 그대로 사용 가능 */}

//       <section className="qna-content">
//         <div className="container-s2">
//           {/* 카테고리 + 작성 버튼 */}
//           <div className="qna-controls">
//             <div className="qna-categories">
//               {CATEGORIES.map(cat => (
//                 <button
//                   key={cat.id}
//                   className={`qna-cat-btn ${activeCategory === cat.id ? "active" : ""}`}
//                   onClick={() => setActiveCategory(cat.id)}
//                 >
//                   <i className={`fas fa-${cat.icon}`} />
//                   <span>{cat.label}</span>
//                 </button>
//               ))}
//             </div>
//             <button className="btn-write-qna" onClick={handleWriteClick}>
//               <i className="fas fa-pen" /> 문의하기
//             </button>
//           </div>

//           {/* QnA 리스트 */}
//           <div className="qna-list">
//             {filteredData.length === 0 ? (
//               <div className="qna-empty">
//                 <i className="fas fa-inbox" />
//                 <p>검색 결과가 없습니다</p>
//               </div>
//             ) : (
//               filteredData.map(qna => (
//                 <QnACard
//                   key={qna.id}
//                   {...qna}
//                   onSelect={() => setSelectedQnA(qna)}
//                   isSelected={selectedQnA?.id === qna.id}
//                 />
//               ))
//             )}
//           </div>

//           {/* 페이지네이션 생략 */}
//         </div>
//       </section>

//       {/* 상세 모달 */}
//       {selectedQnA && <QnAModal qna={selectedQnA} onClose={() => setSelectedQnA(null)} />}
//     </div>
//   );
// };

// /* ─────────────────────────────────────────
//    QnA 카드
// ───────────────────────────────────────── */
// const QnACard = ({ category, title, author, date, views, status, hasAnswer, onSelect, isSelected }) => (
//   <div className={`qna-card ${isSelected ? "selected" : ""}`} onClick={onSelect}>
//     <div className="qna-card-header">
//       <span className={`qna-category-badge ${category}`}>{category}</span>
//       <span className={`qna-status-badge ${hasAnswer ? "answered" : "waiting"}`}>{status}</span>
//     </div>
//     <h3 className="qna-card-title">{title}</h3>
//     <div className="qna-card-meta">
//       <span className="qna-meta-item"><i className="fas fa-user" />{author}</span>
//       <span className="qna-meta-item"><i className="fas fa-calendar" />{date}</span>
//       <span className="qna-meta-item"><i className="fas fa-eye" />{views}</span>
//     </div>
//     {hasAnswer && <div className="qna-answer-preview"><i className="fas fa-reply" /><span>답변이 등록되었습니다</span></div>}
//   </div>
// );

// /* ─────────────────────────────────────────
//    QnA 상세 모달
// ───────────────────────────────────────── */
// const QnAModal = ({ qna, onClose }) => (
//   <div className="qna-modal-overlay" onClick={onClose}>
//     <div className="qna-modal-content" onClick={(e) => e.stopPropagation()}>
//       <div className="qna-modal-header">
//         <div className="qna-modal-title-row">
//           <span className={`qna-category-badge ${qna.category}`}>{qna.category}</span>
//           <span className={`qna-status-badge ${qna.hasAnswer ? "answered" : "waiting"}`}>{qna.status}</span>
//         </div>
//         <h2>{qna.title}</h2>
//         <div className="qna-modal-meta">
//           <span><i className="fas fa-user" />{qna.author}</span>
//           <span><i className="fas fa-calendar" />{qna.date}</span>
//           <span><i className="fas fa-eye" />{qna.views}</span>
//         </div>
//         <button className="qna-modal-close" onClick={onClose}><i className="fas fa-times" /></button>
//       </div>
//       <div className="qna-modal-body">
//         <div className="qna-question-section">
//           <div className="qna-section-label"><i className="fas fa-circle-question" /> 질문 내용</div>
//           <div className="qna-content-box">{qna.content}</div>
//         </div>
//         {!qna.hasAnswer && <div className="qna-no-answer"><i className="fas fa-clock" /><p>답변을 준비 중입니다.</p></div>}
//       </div>
//       <div className="qna-modal-footer">
//         {/* <button className="btn-write-qna" onClick={onDelete}>삭제</button> */}
//         <button className="btn-modal-close" onClick={onClose}>닫기</button>
//       </div>
//     </div>
//   </div>
// );

// export default QnAPage;

import React, { useEffect, useState } from "react";
import "../assets/styles/QnAPage.css";

const QnAPage = () => {
  const [qnas, setQnas] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQnA, setSelectedQnA] = useState(null);
  const [sortBy, setSortBy] = useState("latest"); // latest / views
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const token = localStorage.getItem("accessToken");
  const isLoggedIn = !!token;

  // DB에서 가져오기
  const fetchQnas = async (sort = "latest") => {
    try {
      // 서버에서 정렬, 검색, 페이지 처리 가능
      const res = await fetch(
        `http://localhost:8080/api/v1/qnas?sort=${sort}`
      );
      const data = await res.json();

      const mappedData = data.map(q => ({
        id: q.qn_num,
        title: q.qn_title || "제목 없음",
        author: "익명",
        date: q.qn_created_at ? q.qn_created_at.split("T")[0] : "",
        views: q.qn_view_count || 0,
        status: q.qn_status || "대기중",
        hasAnswer: q.qn_status === "답변완료",
        content: q.qn_content || "내용 없음",
        category: q.qn_category || "기타"
      }));

      setQnas(mappedData);
      setCurrentPage(1);
    } catch (err) {
      console.error("QNA 로드 실패:", err);
    }
  };

  useEffect(() => {
    fetchQnas(sortBy);
  }, [sortBy]);

  const handleSelectQnA = async (qna) => {
  setSelectedQnA(qna); // 모달 열기

  try {
    const res = await fetch(`http://localhost:8080/api/v1/qnas/${qna.id}/view`, {
      method: "POST", // 일부만 업데이트할 때 PATCH 사용
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("조회수 증가 실패");

    // 성공하면 프론트에서도 조회수 1 증가
    setQnas(prev =>
      prev.map(item =>
        item.num === qna.num ? { ...item, views: item.views + 1 } : item
      )
    );

  } catch (err) {
    console.error(err);
  }
};

  // 필터링
  const filteredData = qnas
    .filter(q => activeCategory === "all" || q.category === activeCategory)
    .filter(q =>
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentQnas = filteredData.slice(indexOfFirst, indexOfLast);

  const handleWriteClick = () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      return;
    }
    window.location.href = "/qna/write";
  };

  return (
    <div className="qna-page">
      <section className="qna-content">
        <div className="container-s2">
          <div className="qna-controls">
            

            <div className="qna-sort-buttons">
              <button
                className={`btn ${sortBy === "latest" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setSortBy("latest")}
              >
                최신순
              </button>
              <button
                className={`btn ${sortBy === "views" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setSortBy("views")}
              >
                조회순
              </button>
              <button
                className={`btn ${sortBy === "status" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setSortBy("status")}
              >
                미답변
              </button>
            </div>

            <button 
              className={`btn-write-qna ${!isLoggedIn ? "disabled" : ""}`} 
              onClick={handleWriteClick}>
              <i className="fas fa-pen" /> 문의하기
            </button>

            <input
              type="text"
              className="form-control me-2"
              placeholder="검색어를 입력하세요"
              style={{ maxWidth: "500px" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="qna-list">
            {currentQnas.length === 0 ? (
              <div className="qna-empty">
                <i className="fas fa-inbox" />
                <p>검색 결과가 없습니다</p>
              </div>
            ) : (
              currentQnas.map(qna => (
                <QnACard
                  key={qna.id}
                  {...qna}
                  onSelect={() => handleSelectQnA(qna)}
                  isSelected={selectedQnA?.id === qna.id}
                />
              ))
            )}
          </div>

          <div className="d-flex justify-content-center mt-3">
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </button>
              </li>

              {[...Array(totalPages)].map((_, index) => (
                <li
                  key={index}
                  className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}

              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {selectedQnA && <QnAModal qna={selectedQnA} onClose={() => setSelectedQnA(null)} />}
    </div>
  );
};

const QnACard = ({ title, author, date, views, status, hasAnswer, onSelect, isSelected }) => (
  <div className={`qna-card ${isSelected ? "selected" : ""}`} onClick={onSelect}>
    <div className="qna-card-header">
      <span className={`qna-status-badge ${hasAnswer ? "answered" : "waiting"}`}>{status}</span>
    </div>
    <h3 className="qna-card-title">{title}</h3>
    <div className="qna-card-meta">
      <span className="qna-meta-item"><i className="fas fa-user" />{author}</span>
      <span className="qna-meta-item"><i className="fas fa-calendar" />{date}</span>
      <span className="qna-meta-item"><i className="fas fa-eye" />{views}</span>
    </div>
  </div>
);

const QnAModal = ({ qna, onClose }) => (
  <div className="qna-modal-overlay" onClick={onClose}>
    <div className="qna-modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="qna-modal-header">
        <div className="qna-modal-title-row">
          <span className={`qna-status-badge ${qna.hasAnswer ? "answered" : "waiting"}`}>{qna.status}</span>
        </div>
        <h2>{qna.title}</h2>
        <div className="qna-modal-meta">
          <span><i className="fas fa-user" />{qna.author}</span>
          <span><i className="fas fa-calendar" />{qna.date}</span>
          <span><i className="fas fa-eye" />{qna.views}</span>
        </div>
        <button className="qna-modal-close" onClick={onClose}><i className="fas fa-times" /></button>
      </div>
      <div className="qna-modal-body">
        <div className="qna-question-section">
          <div className="qna-section-label"><i className="fas fa-circle-question" /> 질문 내용</div>
          <div className="qna-content-box">{qna.content}</div>
        </div>
        {!qna.hasAnswer && <div className="qna-no-answer"><i className="fas fa-clock" /><p>답변을 준비 중입니다.</p></div>}
      </div>
      <div className="qna-modal-footer">
        <button className="btn-modal-close" onClick={onClose}>닫기</button>
      </div>
    </div>
  </div>
);

export default QnAPage;