import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/AuthFetch";
import "../assets/styles/QnAPage.css";

const QnAPage = () => {
  const [qnas, setQnas] = useState([]);
  const [currentUserNum, setCurrentUserNum] = useState(null); // 서버에서 가져올 로그인 user_num
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQnA, setSelectedQnA] = useState(null);
  const [sortBy, setSortBy] = useState("latest"); // latest / views
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  let currentUserId = null;    // user_id
  let userRole = null;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      currentUserId = payload.sub;
      userRole = payload.role;   // 유저 role
      console.log("currentUserId:", currentUserId, "currentUserNum:", currentUserNum, "role:", userRole);
    } catch (err) {
      console.error("토큰 디코딩 실패", err);
    }
  }
const isLoggedIn = !!currentUserId;
const canWriteQnA = isLoggedIn && userRole === "USER"; // USER 테이블만 허용

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
        author: q.userName,
        authorNum: q.userNum,
        date: q.qnCreatedAt ? q.qnCreatedAt.split("T")[0] : "",
        views: q.qnViewCount || 0,
        status: q.qnStatus || "대기중",
        hasAnswer: q.qnStatus === "답변완료",
        content: q.qnContent || "내용 없음",
        answer: q.qaContent
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
  const fetchCurrentUserNum = async () => {
    if (!token) return;

    try {
      const resp = await fetch(`http://localhost:8080/api/v1/qnas/me`, {
        method: "GET", // GET으로 변경
        headers: {
          "Authorization": `Bearer ${token}`, // 토큰 넣기
        },
      });

      if (!resp.ok) throw new Error("사용자 정보 가져오기 실패");

      const data = await resp.json();
      setCurrentUserNum(data.num); // 로그인한 사용자 번호 저장
      console.log(data.num)
    } catch (err) {
      console.error(err);
    }
  };

  fetchCurrentUserNum();
  fetchQnas(sortBy); // QnA 목록 가져오기
}, [token, sortBy]);

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

  // QnA 삭제
  const handleDeleteQnA = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const resp = await fetch(`http://localhost:8080/api/v1/qnas/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error("삭제 실패");
      setQnas(prev => prev.filter(q => q.id !== id));
      alert("삭제되었습니다.");
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 필터링
  const filteredData = qnas
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
    <div className="rv-page">
      {/* ── 히어로 헤더 ── */}
      <section className="rv-hero">
        <div className="rv-hero__blob rv-hero__blob--a" />
        <div className="rv-hero__blob rv-hero__blob--b" />
        <div className="rv-hero__inner">
          <h1 className="rv-hero__title">
            실제 환자들의 <span className="rv-hero__accent">생생한 Q&A</span>
          </h1>
          <p className="rv-hero__sub">
            잘 모르는곳을 병원한테 물어보세요
          </p>
        </div>
      </section>
    {/* ── 툴바 ── */}
    <div className="rv-toolbar">
      <div className="rv-toolbar__inner">

        {/* 검색창 */}
        <div className="rv-search">
          <i className="fas fa-search rv-search__icon" />
          <input
            className="rv-search__input"
            type="text"
            placeholder="제목으로 검색"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchQuery && (
            <button
              className="rv-search__clear"
              onClick={() => setSearchQuery("")}
            >
              <i className="fas fa-times" />
            </button>
          )}
        </div>

        {/* 정렬 + 작성 버튼 */}
        <div className="rv-toolbar__right">

          <div className="rv-sort">
            <button
              className={`rv-sort__btn ${sortBy === "latest" ? "active" : ""}`}
              onClick={() => setSortBy("latest")}
            >
              <i className="fas fa-clock" /> 최신순
            </button>

            <button
              className={`rv-sort__btn ${sortBy === "views" ? "active" : ""}`}
              onClick={() => setSortBy("views")}
            >
              <i className="fas fa-eye" /> 조회순
            </button>

            <button
              className={`rv-sort__btn ${sortBy === "status" ? "active" : ""}`}
              onClick={() => setSortBy("status")}
            >
              <i className="fas fa-clock" /> 미답변
            </button>
          </div>

          {canWriteQnA && (
            <button className="rv-write-btn" onClick={handleWriteClick}>
              <i className="fas fa-pen-to-square" /> 문의하기
            </button>
          )}

        </div>
      </div>
    </div>
  <section className="qna-content">
  <div className="container-s2">   
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
                  id={qna.id}
                  {...qna}
                  onSelect={() => handleSelectQnA(qna)}
                  isSelected={selectedQnA?.id === qna.id}
                  currentUserNum={currentUserNum}
                  currentUserId={currentUserId}
                  onDelete={handleDeleteQnA}
                />
              ))
            )}
          </div>

          <div className="d-flex justify-content-center mt-3 rv-pagination">
            <div className="rv-pagination">
          <button
            className="rv-page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <i className="fas fa-chevron-left" />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`rv-page-btn ${currentPage === i + 1 ? "active" : ""}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="rv-page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <i className="fas fa-chevron-right" />
          </button>
        </div>
          </div>
        </div>
      </section>

      {selectedQnA && (
        <QnAModal
          qna={selectedQnA}
          onClose={() => setSelectedQnA(null)}
          canWriteQnA={canWriteQnA}
          handleWriteClick={handleWriteClick}
          isAdmin={userRole === "ADMIN"}
          setQnas={setQnas} 
        />
      )}
    </div>
  );
};

const QnACard = ({ id, title, author, authorNum, date, views, status, hasAnswer, onSelect, isSelected, currentUserNum, onDelete }) => (
  <div className={`qna-card ${isSelected ? "selected" : ""}`} onClick={onSelect}>
    <div className="qna-card-header">
      <span className={`qna-status-badge ${hasAnswer ? "answered" : "waiting"}`}>{status}</span>
      {currentUserNum === authorNum && (
        <button
          className="btn-write-qna"
          style={{ marginLeft: "auto" }}
          onClick={(e) => { e.stopPropagation(); onDelete(id); }}
        >
          삭제
        </button>
      )}
    </div>
    <h3 className="qna-card-title">{title}</h3>
    <div className="qna-card-meta">
      <span className="qna-meta-item"><i className="fas fa-user" />{author}</span>
      <span className="qna-meta-item"><i className="fas fa-calendar" />{date}</span>
      <span className="qna-meta-item"><i className="fas fa-eye" />{views}</span>
    </div>
  </div>
);
    const QnAModal = ({ qna, onClose, isAdmin, setQnas }) => {
  const [answerContent, setAnswerContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  //내부에서 최신 답변 내용을 관리할 상태 추가
  const [currentAnswer, setCurrentAnswer] = useState(qna.answer || "");

  // 모달이 열릴 때나 qna 데이터가 바뀔 때 상태 초기화
  useEffect(() => {
    setCurrentAnswer(qna.answer || "");
    setEditContent(qna.answer || "");
  }, [qna]);

  const handleAnswerSubmit = async () => {
    if (!answerContent.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const resp = await fetch(`http://localhost:8080/api/v1/qnas/${qna.id}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ qaContent: answerContent })
      });
      if (!resp.ok) throw new Error("답변 등록 실패");

      // QnA 목록 상태 갱신
      setQnas(prev =>
        prev.map(item =>
          item.id === qna.id
            ? { ...item, hasAnswer: true, status: "답변완료", answer: answerContent 

            }
            : item
        )
      );

      // ✅ 2. 현재 모달 화면 업데이트
      setCurrentAnswer(answerContent);
      alert("답변이 등록되었습니다!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("답변 등록 중 오류가 발생했습니다.");
    }
  };
  
  const handleUpdateAnswer = async () => {
  const token = localStorage.getItem("accessToken");

  const resp = await fetch(
    `http://localhost:8080/api/v1/qnas/${qna.id}/answer`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ qaContent: editContent })
    }
  );

  if (!resp.ok) {
    alert("수정 실패");
    return;
  }

  setQnas(prev =>
    prev.map(item =>
      item.id === qna.id
        ? { ...item, answer: editContent }
        : item
    )
  );

  setCurrentAnswer(editContent);
  setIsEditing(false);
  alert("수정 완료");
  onClose();
};

  return (
    <div className="qna-modal-overlay" onClick={onClose}>
      <div className="qna-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="qna-modal-header">
          <span className={`qna-status-badge ${qna.hasAnswer ? "answered" : "waiting"}`}>
            {qna.status}
          </span>
          <h2>{qna.title}</h2>
        </div>

        <div className="qna-modal-body">
          <div className="qna-question-section">
            <div className="qna-section-label"><i className="fas fa-circle-question" /> 질문 내용</div>
            <div className="qna-content-box">{qna.content}</div>
          </div>

          {!qna.hasAnswer && isAdmin && (
            <div className="qna-answer-section">
              <div className="qna-section-label"><i className="fas fa-reply" /> 답변 작성</div>
              <textarea
                className="form-textarea"
                rows={5}
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="답변 내용을 입력하세요"
              />
            </div>
          )}

          {!qna.hasAnswer && !isAdmin && (
            <div className="qna-no-answer"><i className="fas fa-clock" /><p>답변을 준비 중입니다.</p></div>
          )}
          {qna.hasAnswer && (
            <div className="qna-answer-section">
              <div className="qna-section-label">
                <i className="fas fa-reply" /> 병원 답변
              </div>
              <div className="qna-content-box">
                {qna.answer}
              </div>
            {isAdmin && (
              <button onClick={() => setIsEditing(true)} className="rv-write-btn">
                수정하기
              </button>
            )}
            {isEditing && (
              <div className="qna-answer-section">
                <div className="qna-section-label">
                  <i className="fas fa-reply" /> 답변수정
                </div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="form-textarea"
                />
                
                <div className="edit-btn-group">
                  <button className="rv-write-btn" onClick={handleUpdateAnswer}>저장</button>
                  <button className="rv-write-btn" onClick={() => setIsEditing(false)}>취소</button>
                </div>
              </div>
            )}
          </div>
          )}
        </div>
        

        <div className="qna-modal-footer">
          {isAdmin && !qna.hasAnswer && (
            <button className="btn-write-qna" onClick={handleAnswerSubmit}>
              <i className="fas fa-pen" /> 답변 등록
            </button>
          )}
          <button className="btn-modal-close" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};

export default QnAPage;