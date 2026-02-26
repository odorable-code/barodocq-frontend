import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/AuthFetch";
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

  const navigate = useNavigate();
  // DB에서 가져오기
  const fetchQnas = async (sort = "latest") => {
    try {
      // 서버에서 정렬, 검색, 페이지 처리 가능
      const resp = await authFetch(
        `http://localhost:8080/api/v1/qnas?sort=${sort}`
      );
      const data = await resp.json();
      const mappedData = data.map(q => ({
        id: q.qnNum,
        title: q.qnTitle || "제목 없음",
        author: q.userNum,
        date: q.qnCreatedAt ? q.qnCreatedAt.split("T")[0] : "",
        views: q.qnViewCount || 0,
        status: q.qnStatus || "대기중",
        hasAnswer: q.qnStatus === "답변완료",
        content: q.qnContent || "내용 없음",
      }));
      console.log(token)
      setQnas(mappedData);
      setCurrentPage(1);
    } catch (err) {
      console.log(token)
      console.error("QNA 로드 실패:", err);
    }
  };

  useEffect(() => {
    fetchQnas(sortBy);
  }, [sortBy]);

  const handleSelectQnA = async (qna) => {
  setSelectedQnA(qna); // 모달 열기

  try {
    await authFetch(`http://localhost:8080/api/v1/qnas/${qna.id}/view`, {
      method: "POST", // 일부만 업데이트할 때 PATCH 사용
    });

    // 성공하면 프론트에서도 조회수 1 증가
    setQnas(prev =>
      prev.map(item =>
        item.id === qna.id ? { ...item, views: item.views + 1 } : item
      )
    );

  } catch (err) {
    console.error("조회수 증가 실패"+err);
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
    navigate("/qna/write")
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