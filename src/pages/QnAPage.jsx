import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/QnAPage.css";

/* ─────────────────────────────────────────
   QnA 게시판 데이터
───────────────────────────────────────── */
const QNA_DATA = [
  {
    id: 1,
    category: "예약",
    title: "병원 예약 취소는 어떻게 하나요?",
    author: "김민수",
    date: "2026-02-22",
    views: 145,
    status: "답변완료",
    hasAnswer: true,
    content: "예약을 취소하고 싶은데 방법을 모르겠어요. 어디서 취소할 수 있나요?",
    answer: {
      author: "바로닥큐 관리자",
      date: "2026-02-22",
      content: "안녕하세요. 예약 취소는 [마이페이지 > 예약내역]에서 가능합니다. 예약 시간 2시간 전까지 무료 취소가 가능하며, 그 이후에는 병원에 직접 연락 부탁드립니다."
    }
  },
  {
    id: 2,
    category: "결제",
    title: "결제 오류가 발생했어요",
    author: "이서연",
    date: "2026-02-21",
    views: 89,
    status: "답변완료",
    hasAnswer: true,
    content: "카드 결제를 시도했는데 계속 오류가 나요. 해결 방법 좀 알려주세요.",
    answer: {
      author: "바로닥큐 관리자",
      date: "2026-02-21",
      content: "결제 오류는 주로 카드사 승인 문제로 발생합니다. 다른 카드로 시도해보시거나, 고객센터(1588-1234)로 연락주시면 즉시 도와드리겠습니다."
    }
  },
  {
    id: 3,
    category: "서비스",
    title: "AI 추천 기능이 정확한가요?",
    author: "박준호",
    date: "2026-02-20",
    views: 234,
    status: "답변완료",
    hasAnswer: true,
    content: "AI가 추천한 병원이 제 증상과 맞을까요? 신뢰할 수 있나요?",
    answer: {
      author: "바로닥큐 관리자",
      date: "2026-02-20",
      content: "AI 추천 시스템은 의료 빅데이터와 사용자 리뷰를 기반으로 작동합니다. 평균 95% 이상의 만족도를 보이고 있으며, 최종 선택은 사용자 리뷰를 참고하여 결정하시면 됩니다."
    }
  },
  {
    id: 4,
    category: "회원",
    title: "회원 탈퇴 후 재가입이 가능한가요?",
    author: "최지혜",
    date: "2026-02-19",
    views: 67,
    status: "대기중",
    hasAnswer: false,
    content: "탈퇴했다가 다시 가입하고 싶은데 가능한가요?"
  },
  {
    id: 5,
    category: "예약",
    title: "예약 시간 변경은 어떻게 하나요?",
    author: "정민지",
    date: "2026-02-18",
    views: 178,
    status: "대기중",
    hasAnswer: false,
    content: "예약한 시간을 변경하고 싶습니다."
  },
  {
    id: 6,
    category: "서비스",
    title: "병원 리뷰는 어떻게 작성하나요?",
    author: "강동현",
    date: "2026-02-17",
    views: 92,
    status: "답변완료",
    hasAnswer: true,
    content: "진료 받은 병원에 리뷰를 남기고 싶어요.",
    answer: {
      author: "바로닥큐 관리자",
      date: "2026-02-17",
      content: "[마이페이지 > 진료내역]에서 리뷰 작성이 가능합니다. 솔직한 리뷰는 다른 사용자들에게 큰 도움이 됩니다!"
    }
  },
  {
    id: 7,
    category: "기타",
    title: "모바일 앱은 언제 출시되나요?",
    author: "윤서준",
    date: "2026-02-16",
    views: 312,
    status: "답변완료",
    hasAnswer: true,
    content: "모바일에서 더 편하게 사용하고 싶어요.",
    answer: {
      author: "바로닥큐 관리자",
      date: "2026-02-16",
      content: "현재 모바일 앱 개발 중이며, 2026년 상반기 출시 예정입니다. 많은 관심 부탁드립니다!"
    }
  },
  {
    id: 8,
    category: "결제",
    title: "포인트 적립은 어떻게 되나요?",
    author: "한소희",
    date: "2026-02-15",
    views: 143,
    status: "대기중",
    hasAnswer: false,
    content: "예약하면 포인트가 쌓인다고 들었는데 어디서 확인하나요?"
  }
];

const CATEGORIES = [
  { id: "all", label: "전체", icon: "th-large" },
  { id: "예약", label: "예약", icon: "calendar-check" },
  { id: "결제", label: "결제", icon: "credit-card" },
  { id: "서비스", label: "서비스", icon: "concierge-bell" },
  { id: "회원", label: "회원", icon: "user" },
  { id: "기타", label: "기타", icon: "circle-question" }
];

/* ─────────────────────────────────────────
   QnAPage Component
───────────────────────────────────────── */
const QnAPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQnA, setSelectedQnA] = useState(null);
  const [sortBy, setSortBy] = useState("latest"); // latest | views | unanswered

  // 필터링
  const filteredData = QNA_DATA
    .filter(q => activeCategory === "all" || q.category === activeCategory)
    .filter(q => 
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "views") return b.views - a.views;
      if (sortBy === "unanswered") return a.hasAnswer - b.hasAnswer;
      return b.id - a.id; // latest
    });

  const handleWriteClick = () => {
    navigate("/qna/write");
  };

  return (
    <div className="qna-page">
      {/* HERO SECTION */}
      <section className="qna-hero">
        <div className="qna-hero-blob blob-1" />
        <div className="qna-hero-blob blob-2" />
        <div className="container-s2">
          <div className="qna-hero-content">
            <span className="qna-hero-label">
              <i className="fas fa-circle-question" />
              고객문의
            </span>
            <h1>무엇을 도와드릴까요?</h1>
            <p>궁금한 점을 남겨주시면 빠르게 답변해드리겠습니다</p>
            
            {/* 검색바 */}
            <div className="qna-search-bar">
              <i className="fas fa-search" />
              <input
                type="text"
                placeholder="궁금한 내용을 검색해보세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="qna-search-btn">
                <i className="fas fa-search" />
              </button>
            </div>

            {/* 통계 */}
            <div className="qna-stats">
              <div className="qna-stat-item">
                <div className="stat-icon">
                  <i className="fas fa-comments" />
                </div>
                <div className="stat-info">
                  <span className="stat-number">{QNA_DATA.length}</span>
                  <span className="stat-label">전체 문의</span>
                </div>
              </div>
              <div className="qna-stat-item">
                <div className="stat-icon">
                  <i className="fas fa-check-circle" />
                </div>
                <div className="stat-info">
                  <span className="stat-number">{QNA_DATA.filter(q => q.hasAnswer).length}</span>
                  <span className="stat-label">답변완료</span>
                </div>
              </div>
              <div className="qna-stat-item">
                <div className="stat-icon">
                  <i className="fas fa-clock" />
                </div>
                <div className="stat-info">
                  <span className="stat-number">{QNA_DATA.filter(q => !q.hasAnswer).length}</span>
                  <span className="stat-label">답변대기</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="qna-content">
        <div className="container-s2">
          
          {/* 카테고리 + 작성 버튼 */}
          <div className="qna-controls">
            <div className="qna-categories">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`qna-cat-btn ${activeCategory === cat.id ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <i className={`fas fa-${cat.icon}`} />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
            <button className="btn-write-qna" onClick={handleWriteClick}>
              <i className="fas fa-pen" />
              문의하기
            </button>
          </div>

          {/* 정렬 + 결과 수 */}
          <div className="qna-toolbar">
            <div className="qna-result-count">
              <i className="fas fa-list" />
              총 <strong>{filteredData.length}</strong>개의 문의
            </div>
            <div className="qna-sort">
              <button
                className={sortBy === "latest" ? "active" : ""}
                onClick={() => setSortBy("latest")}
              >
                최신순
              </button>
              <button
                className={sortBy === "views" ? "active" : ""}
                onClick={() => setSortBy("views")}
              >
                조회순
              </button>
              <button
                className={sortBy === "unanswered" ? "active" : ""}
                onClick={() => setSortBy("unanswered")}
              >
                미답변
              </button>
            </div>
          </div>

          {/* QnA 리스트 */}
          <div className="qna-list">
            {filteredData.length === 0 ? (
              <div className="qna-empty">
                <i className="fas fa-inbox" />
                <p>검색 결과가 없습니다</p>
              </div>
            ) : (
              filteredData.map(qna => (
                <QnACard
                  key={qna.id}
                  {...qna}
                  onSelect={() => setSelectedQnA(qna)}
                  isSelected={selectedQnA?.id === qna.id}
                />
              ))
            )}
          </div>

          {/* 페이지네이션 (간단 예시) */}
          <div className="qna-pagination">
            <button className="page-btn">
              <i className="fas fa-chevron-left" />
            </button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">
              <i className="fas fa-chevron-right" />
            </button>
          </div>

        </div>
      </section>

      {/* 상세 모달 */}
      {selectedQnA && (
        <QnAModal qna={selectedQnA} onClose={() => setSelectedQnA(null)} />
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   QnA 카드
───────────────────────────────────────── */
const QnACard = ({ category, title, author, date, views, status, hasAnswer, onSelect, isSelected }) => (
  <div className={`qna-card ${isSelected ? "selected" : ""}`} onClick={onSelect}>
    <div className="qna-card-header">
      <span className={`qna-category-badge ${category}`}>
        {category}
      </span>
      <span className={`qna-status-badge ${hasAnswer ? "answered" : "waiting"}`}>
        {status}
      </span>
    </div>
    
    <h3 className="qna-card-title">{title}</h3>
    
    <div className="qna-card-meta">
      <span className="qna-meta-item">
        <i className="fas fa-user" />
        {author}
      </span>
      <span className="qna-meta-item">
        <i className="fas fa-calendar" />
        {date}
      </span>
      <span className="qna-meta-item">
        <i className="fas fa-eye" />
        {views}
      </span>
    </div>

    {hasAnswer && (
      <div className="qna-answer-preview">
        <i className="fas fa-reply" />
        <span>답변이 등록되었습니다</span>
      </div>
    )}
  </div>
);

/* ─────────────────────────────────────────
   QnA 상세 모달
───────────────────────────────────────── */
const QnAModal = ({ qna, onClose }) => (
  <div className="qna-modal-overlay" onClick={onClose}>
    <div className="qna-modal-content" onClick={(e) => e.stopPropagation()}>
      
      {/* 모달 헤더 */}
      <div className="qna-modal-header">
        <div className="qna-modal-title-row">
          <span className={`qna-category-badge ${qna.category}`}>
            {qna.category}
          </span>
          <span className={`qna-status-badge ${qna.hasAnswer ? "answered" : "waiting"}`}>
            {qna.status}
          </span>
        </div>
        <h2>{qna.title}</h2>
        <div className="qna-modal-meta">
          <span><i className="fas fa-user" />{qna.author}</span>
          <span><i className="fas fa-calendar" />{qna.date}</span>
          <span><i className="fas fa-eye" />{qna.views}</span>
        </div>
        <button className="qna-modal-close" onClick={onClose}>
          <i className="fas fa-times" />
        </button>
      </div>

      {/* 모달 바디 */}
      <div className="qna-modal-body">
        
        {/* 질문 */}
        <div className="qna-question-section">
          <div className="qna-section-label">
            <i className="fas fa-circle-question" />
            질문 내용
          </div>
          <div className="qna-content-box">
            {qna.content}
          </div>
        </div>

        {/* 답변 */}
        {qna.hasAnswer && qna.answer && (
          <div className="qna-answer-section">
            <div className="qna-section-label answer">
              <i className="fas fa-reply" />
              관리자 답변
            </div>
            <div className="qna-answer-box">
              <div className="qna-answer-header">
                <div className="qna-answer-author">
                  <div className="answer-avatar">
                    <i className="fas fa-user-tie" />
                  </div>
                  <div>
                    <strong>{qna.answer.author}</strong>
                    <span>{qna.answer.date}</span>
                  </div>
                </div>
              </div>
              <div className="qna-answer-content">
                {qna.answer.content}
              </div>
            </div>
          </div>
        )}

        {!qna.hasAnswer && (
          <div className="qna-no-answer">
            <i className="fas fa-clock" />
            <p>답변을 준비 중입니다. 빠른 시일 내에 답변드리겠습니다.</p>
          </div>
        )}

      </div>

      {/* 모달 푸터 */}
      <div className="qna-modal-footer">
        <button className="btn-modal-close" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  </div>
);

export default QnAPage;