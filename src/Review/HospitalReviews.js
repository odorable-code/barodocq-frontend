import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authFetch } from "../utils/AuthFetch";
import "../assets/styles/HospitalReviews.css";

/* ────────────────────────────────
   ReviewCard 컴포넌트
──────────────────────────────── */
const ReviewCard = ({ review, currentUser, navigate, deletePost }) => {
  return (
    <div
      className="rv-card"
      onClick={() => navigate(`/reviews/${review.rvNum}`)}
    >
      {/* 상단 헤더 */}
      <div className="rv-card__header">
        <div className="rv-card__hospital">
          <div className="rv-card__hospital-icon">
            <i className="fas fa-hospital" />
          </div>
          <div className="rv-card__hospital-info">
            <span className="rv-card__hospital-name">{review.hoName}</span>
            <div className="rv-card__stars">
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className={`fas fa-star ${i < review.rvRating ? "filled" : "empty"}`}
                />
              ))}
              <span className="rv-card__rating-val">{review.rvRating}.0</span>
            </div>
          </div>
        </div>

        {review.userId === currentUser && (
          <div className="rv-card__actions" onClick={(e) => e.stopPropagation()}>
            <Link to={`/reviews/revise/${review.rvNum}`} className="rv-btn rv-btn--edit">
              <i className="fas fa-pen" /> 수정
            </Link>
            <button
              className="rv-btn rv-btn--delete"
              onClick={(e) => { e.stopPropagation(); deletePost(review.rvNum); }}
            >
              <i className="fas fa-trash" /> 삭제
            </button>
          </div>
        )}
      </div>

      {/* 제목 */}
      <h2 className="rv-card__title">{review.rvTitle}</h2>

      {/* 이미지 */}
      {review.files?.length > 0 && (
        <div className="rv-card__thumb-wrap">
          <img
            className="rv-card__thumb"
            src={`http://localhost:8080${review.files[0].rfPath}`}
            alt="review"
          />
        </div>
      )}

      {/* 본문 */}
      <p className="rv-card__content">
        {review.rvContent.length > 120
          ? review.rvContent.substring(0, 120) + "..."
          : review.rvContent}
      </p>

      {/* 푸터 */}
      <div className="rv-card__footer">
        <div className="rv-card__author">
          <div className="rv-card__avatar">
            {review.userName?.charAt(0) ?? "?"}
          </div>
          <span className="rv-card__author-name">{review.userName}</span>
          <span className="rv-card__date">
            <i className="fas fa-calendar-alt" />
            {review.rvCreatedAt?.substring(0, 10)}
          </span>
        </div>
        <div className="rv-card__meta">
          <span><i className="fas fa-eye" /> {review.rvViewCount}</span>
          <span><i className="fas fa-comment" /> {review.rvCommentCount}</span>
          <span><i className="fas fa-heart" /> {review.rvLikesCount}</span>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────
   HospitalReviews 페이지
──────────────────────────────── */
function HospitalReviews() {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSort, setActiveSort] = useState("latest");
  const reviewsPerPage = 5;
  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken");
  let currentUser = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      currentUser = payload.sub;
    } catch (err) {
      console.error("토큰 디코딩 실패", err);
    }
  }

  useEffect(() => {
    const getReviews = async () => {
      if (!token) return;
      try {
        const response = await authFetch("http://localhost:8080/api/v1/reviews");
        const data = await response.json(); // 여기서 JSON으로 변환
        console.log("reviews from server (JSON):", data);
        setReviews(data);
      } catch (err) {
        console.error("후기 불러오기 실패:", err);
      }
    };
    getReviews();
  }, [token]);

  const deletePost = async (rvNum) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await authFetch(`http://localhost:8080/api/v1/reviews/${rvNum}`, { method: "DELETE" });
      alert("삭제 성공!");
      setReviews((prev) =>
        prev.map((r) => (r.rvNum === rvNum ? { ...r, rvDeletedYn: 1 } : r))
      );
    } catch (err) {
      alert(err.message || "삭제 실패했습니다.");
    }
  };

  const sortReviews = async (type) => {
    try {

      // const response = await authFetch(`http://localhost:8080/api/v1/reviews?sort=${type}`);
      // const data = await response.json();
      const res = await authFetch(`http://localhost:8080/api/v1/reviews?sort=${type}`);
      // ✅ 버그 수정
      // sortReviews에서 JSON 변환 누락 const data = await authFetch(...);
      //setReviews(data);  →  const data = await res.json(); 로 수정
      const data = await res.json();
      setReviews(data);
      setActiveSort(type);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredReviews = reviews
    .filter((r) => r.rvDeletedYn === 0)
    .filter((r) => r.rvTitle.toLowerCase().includes(searchTerm.toLowerCase()));

  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const currentReviews = filteredReviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  return (
    <div className="rv-page">

      {/* ── 히어로 헤더 ── */}
      <section className="rv-hero">
        <div className="rv-hero__blob rv-hero__blob--a" />
        <div className="rv-hero__blob rv-hero__blob--b" />
        <div className="rv-hero__inner">
          <h1 className="rv-hero__title">
            실제 환자들의 <span className="rv-hero__accent">생생한 후기</span>
          </h1>
          <p className="rv-hero__sub">
            믿을 수 있는 후기로 나에게 맞는 병원을 찾아보세요
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
              placeholder="병원명, 증상, 후기 내용으로 검색"
              value={searchTerm}
              // ✅ 버그 수정
              // value에 함수가 들어가 있음 value={setSearchTerm}  →  value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            {searchTerm && (
              <button className="rv-search__clear" onClick={() => setSearchTerm("")}>
                <i className="fas fa-times" />
              </button>
            )}
          </div>

          {/* 정렬 + 작성 버튼 */}
          <div className="rv-toolbar__right">
            <div className="rv-sort">
              <button
                className={`rv-sort__btn ${activeSort === "latest" ? "active" : ""}`}
                onClick={() => sortReviews("latest")}
              >
                <i className="fas fa-clock" /> 최신순
              </button>
              <button
                className={`rv-sort__btn ${activeSort === "popular" ? "active" : ""}`}
                onClick={() => sortReviews("popular")}
              >
                <i className="fas fa-fire" /> 인기순
              </button>
            </div>
            <Link to="/reviews/create" className="rv-write-btn">
              <i className="fas fa-pen-to-square" /> 후기 작성
            </Link>
          </div>

        </div>
      </div>

      {/* ── 결과 수 ── */}
      <div className="rv-result-bar">
        <span className="rv-result-bar__count">
          총 <strong>{filteredReviews.length}</strong>개의 후기
        </span>
      </div>

      {/* ── 카드 목록 ── */}
      <div className="rv-list">
        {currentReviews.length > 0 ? (
          currentReviews.map((review) => (
            <ReviewCard
              key={review.rvNum}
              review={review}
              currentUser={currentUser}
              navigate={navigate}
              deletePost={deletePost}
            />
          ))
        ) : (
          <div className="rv-empty">
            <div className="rv-empty__icon"><i className="fas fa-comment-slash" /></div>
            <p className="rv-empty__title">검색 결과가 없습니다</p>
            <p className="rv-empty__sub">다른 키워드로 검색해보세요</p>
          </div>
        )}
      </div>

      {/* ── 페이지네이션 ── */}
      {totalPages > 1 && (
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
      )}
    </div>
  );
}

export default HospitalReviews;
