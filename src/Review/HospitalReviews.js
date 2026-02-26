// HospitalReviews.js
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
      className="review-card modern"
      onClick={() => navigate(`/reviews/${review.rvNum}`)}
    >
      {/* 상단: 병원 정보 + 평점 + 수정/삭제 */}
      <div className="review-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        
        {/* 병원 이름 + 평점 */}
        <div className="hospital-info" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="hospital-badge-mini">
            <i className="fas fa-hospital" />
          </div>
          <div>
            <strong>{review.hoName}</strong>
            <span className="dept-tag-mini">⭐ {review.rvRating}.0</span>
          </div>
        </div>

        {/* 작성자만 수정/삭제 버튼 */}
        {review.userId === currentUser && (
          <div className="action-buttons" style={{ display: "flex", gap: "6px" }}>
            <Link
              to={`/reviews/revise/${review.rvNum}`}
              className="btn-edit"
              onClick={(e) => e.stopPropagation()}
            >
              수정
            </Link>
            <button
              className="btn-delete"
              onClick={(e) => {
                e.stopPropagation();
                deletePost(review.rvNum);
              }}
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {/* 이미지 */}
      <h1 className="review-title">{review.rvTitle}</h1>

      {/* 이미지가 있고, 경로가 유효할 때만 렌더링 */}
      {review.files?.length > 0 && (
        <img
          className="review-thumbnail-modern"
          src={`http://localhost:8080${review.files[0].rfPath}`}
          alt="review"
        />
      )}
      {/* 제목과 내용 */}
      <p className="review-content">
        {review.rvContent.length > 120
          ? review.rvContent.substring(0, 120) + "..."
          : review.rvContent}
      </p>

      {/* 하단: 작성자 정보 + 통계 */}
      <div className="review-card-footer">
        <div className="author-info">
          <div>
            <span className="author-name" style={{ marginRight: "500px", fontWeight: "bold" }}>작성자 : {review.userName}</span>
            <span className="review-date">{review.rvCreatedAt?.substring(0, 10)}</span>
          </div>
        </div>

        <div className="review-meta">
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
  const [searchTerm, setSearchTerm] = useState(""); // 검색어
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5; // 한 페이지에 표시
  const navigate = useNavigate();

  // JWT 토큰에서 현재 사용자 가져오기
  const token = localStorage.getItem("accessToken");
  let currentUser = null;
  if (token) {
    try {
      const payloadBase64 = token.split(".")[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      currentUser = payload.sub;
    } catch (err) {
      console.error("토큰 디코딩 실패", err);
    }
  }

  /* ───────────── 후기 가져오기 ───────────── */
  useEffect(() => {
    const getReviews = async () => {
      if (!token) return;

      try {
        const response = await authFetch("http://localhost:8080/api/v1/reviews");
        const data = await response.json(); // ✅ 여기서 JSON으로 변환
        console.log("reviews from server (JSON):", data);
        setReviews(data);
      } catch (err) {
        console.error("후기 불러오기 실패:", err);
      }
    };
    getReviews();
  }, [token]);

  /* ───────────── 삭제 ───────────── */
  const deletePost = async (rvNum) => {
    const isDel = window.confirm("정말 삭제하시겠습니까?");
    if (!isDel) return;

    try {
      await authFetch(`http://localhost:8080/api/v1/reviews/${rvNum}`, { method: "DELETE" });
      alert("삭제 성공!");
      setReviews((prev) =>
        prev.map((r) => (r.rvNum === rvNum ? { ...r, rvDeletedYn: 1 } : r))
      );
    } catch (err) {
      console.error(err);
      alert(err.message || "삭제 실패했습니다.");
    }
  };

  /* ───────────── 정렬 ───────────── */
  const sortReviews = async (type) => {
    try {
      const data = await authFetch(`http://localhost:8080/api/v1/reviews?sort=${type}`);
      setReviews(data);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    }
  };

  /* ───────────── 필터링 + 검색 ───────────── */
  const filteredReviews = reviews
    .filter((review) => review.rvDeletedYn === 0)
    .filter((review) =>
      review.rvTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const indexOfLast = currentPage * reviewsPerPage;
  const indexOfFirst = indexOfLast - reviewsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirst, indexOfLast);

  return (
    <>
      <h3 className="ms-4">전체 후기</h3>

      {/* 모던한 검색 + 작성 + 정렬 툴바 */}
      <div className="reviews-toolbar-modern py-3 mb-4">
        <div className="container d-flex flex-wrap justify-content-between align-items-center gap-3">
          {/* 후기 작성 버튼 */}
            <Link
              to="/reviews/create"
              className="btn-primary-s2"
            >후기 작성하기
            </Link>
          {/* 검색창 */}
          <div className="search-input-wrapper">
                <i className="fas fa-search" />
                <input
                  type="text"
                  placeholder="병원명, 증상, 후기 내용으로 검색"
                  value={setSearchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            
          </div>

          

          {/* 정렬 버튼 */}
          <div className="sort-buttons-modern d-flex gap-2">
            <button
              className="btn-text-s2"
              onClick={() => sortReviews("latest")}
            >
              최신순
            </button>
            <button
              className="btn-text-s2"
              onClick={() => sortReviews("popular")}
            >
              인기순
            </button>
          </div>

        </div>
      </div>

      {/* 후기 리스트 */}
      <div className="reviews-grid">
        {currentReviews.map((review) => (
          <ReviewCard
            key={review.rvNum}
            review={review}
            currentUser={currentUser}
            navigate={navigate}
            deletePost={deletePost}
          />
        ))}
        {currentReviews.length === 0 && <p>검색 결과가 없습니다.</p>}
      </div>

      {/* 페이지네이션 */}
      <div className="d-flex justify-content-center mt-3">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
              Previous
            </button>
          </li>
          {[...Array(totalPages)].map((_, i) => (
            <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
              Next
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}

export default HospitalReviews;