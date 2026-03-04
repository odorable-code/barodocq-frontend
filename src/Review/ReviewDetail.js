// ═══════════════════════════════════════════════════
//  ReviewDetail.jsx
//  역할 : 후기 상세 페이지
//  구성 : 좌(메인 콘텐츠) + 우(사이드바) 2컬럼 레이아웃
//  기능 : 후기 조회 / 좋아요 토글 / 댓글 조회·작성
// ═══════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { authFetch } from "../utils/AuthFetch";
import "../assets/styles/ReviewDetail.css";

// 별점 숫자 → 한글 라벨 매핑
const RATING_LABELS = ["", "별로예요", "그저 그래요", "보통이에요", "좋았어요", "최고예요!"];

// ─────────────────────────────────────────────────
function ReviewDetail() {
  const { rvNum }  = useParams();   // URL 파라미터에서 후기 번호 추출
  const navigate   = useNavigate();

  // ── 데이터 상태 ───────────────────────────────
  const [review,     setReview]     = useState(null);  // 후기 상세 데이터
  const [files,      setFiles]      = useState([]);    // 첨부 이미지 목록
  const [comments,   setComments]   = useState([]);    // 댓글 목록
  const [newComment, setNewComment] = useState("");    // 입력 중인 댓글 텍스트
  const [liked,      setLiked]      = useState(false); // 현재 유저의 좋아요 여부


  // ─────────────────────────────────────────────
  //  댓글 목록 불러오기
  //  - GET /api/v1/reviews/:rvNum/comments
  //  - 서버 응답이 배열이면 그대로, 아니면 data.comments 사용
  // ─────────────────────────────────────────────
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await authFetch(
          `http://localhost:8080/api/v1/reviews/${rvNum}/comments`
        );
        const data = await response.json();
        const commentArray = Array.isArray(data) ? data : (data.comments || []);
        setComments(commentArray);
      } catch (err) {
        console.error("댓글 불러오기 오류:", err);
        setComments([]);
      }
    };
    fetchComments();
  }, [rvNum]);


  // ─────────────────────────────────────────────
  //  후기 상세 불러오기
  //  - GET /api/v1/reviews/:rvNum
  //  - 응답 구조: { review: {...}, files: [...] }
  //  - rlLike === 1 이면 현재 유저가 좋아요 누른 상태
  // ─────────────────────────────────────────────
  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await authFetch(
          `http://localhost:8080/api/v1/reviews/${rvNum}`
        );
        const data = await response.json();
        setReview(data.review);
        setLiked(data.review.rlLike === 1);
        setFiles(data.files || []);
      } catch (err) {
        console.error("후기 불러오기 오류:", err);
        alert("후기를 불러오지 못했습니다.");
      }
    };
    fetchReview();
  }, [rvNum]);


  // ─────────────────────────────────────────────
  //  좋아요 토글
  //  - POST /api/v1/reviews/:rvNum/likes
  //  - 토글 후 최신 좋아요 수 반영을 위해 후기 재조회
  // ─────────────────────────────────────────────
  const handleLike = async () => {
    try {
      await authFetch(`http://localhost:8080/api/v1/reviews/${rvNum}/likes`, {
        method: "POST",
      });
      setLiked((prev) => !prev); // 낙관적 UI 업데이트

      // 최신 좋아요 수 반영을 위해 후기 재조회
      const updated = await authFetch(`http://localhost:8080/api/v1/reviews/${rvNum}`);
      const data    = await updated.json();
      setReview(data.review);
      setFiles(data.files || []);
    } catch (err) {
      console.error("좋아요 오류:", err);
      alert("좋아요 처리에 실패했습니다.");
    }
  };


  // ─────────────────────────────────────────────
  //  댓글 등록
  //  - POST /api/v1/reviews/:rvNum/comments
  //  - 등록 후 댓글 목록 재조회하여 최신화
  // ─────────────────────────────────────────────
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return alert("댓글 내용을 입력하세요.");

    try {
      await authFetch(`http://localhost:8080/api/v1/reviews/${rvNum}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rcContent: newComment }),
      });

      // 댓글 등록 후 목록 재조회
      const updated = await authFetch(
        `http://localhost:8080/api/v1/reviews/${rvNum}/comments`
      );
      const data = await updated.json();
      setComments(Array.isArray(data) ? data : (data.comments || []));
      setNewComment(""); // 입력창 초기화
    } catch (err) {
      console.error("댓글 작성 오류:", err);
      alert("댓글 작성에 실패했습니다.");
    }
  };


  // ── 로딩 상태 ──────────────────────────────────
  if (!review) {
    return (
      <div className="rd-loading">
        <div className="rd-spinner" />
        <p>후기를 불러오는 중...</p>
      </div>
    );
  }


  // ─────────────────────────────────────────────
  //  렌더링
  // ─────────────────────────────────────────────
  return (
    <div className="review-detail-page">
      <div className="rd-container">

        {/* ════════════════════════════════
            2컬럼 레이아웃
            좌: 메인 콘텐츠 / 우: 사이드바
        ════════════════════════════════ */}
        <div className="review-detail-layout">

          {/* ── 메인 콘텐츠 ── */}
          <main className="review-main-content">

            {/* 브레드크럼 네비게이션 */}
            <nav className="breadcrumb">
              <Link to="/">홈</Link>
              <i className="fas fa-chevron-right" />
              <Link to="/reviews">병원 후기</Link>
              <i className="fas fa-chevron-right" />
              <span>후기 상세</span>
            </nav>

            {/* ── 후기 헤더: 병원명 + 수정 버튼 ── */}
            <div className="review-detail-header">
              <div className="hospital-info-detail">
                <div className="hospital-badge-detail">
                  <i className="fas fa-hospital" />
                </div>
                <div>
                  <h2>{review.hoName || "병원명 없음"}</h2>
                  <span className="dept-tag-detail">
                    {review.deptName || "진료과 정보 없음"}
                  </span>
                </div>
              </div>
              {/* 실제 방문 인증 뱃지 */}
              <div className="verified-badge-detail">
                <i className="fas fa-circle-check" /> 실제 방문
              </div>
            </div>

            {/* ── 제목 + 별점 ── */}
            <div className="review-title-section">
              <h1>{review.rvTitle}</h1>
              <div className="review-rating-detail">
                {[1, 2, 3, 4, 5].map((n) => (
                  <i
                    key={n}
                    className={`fas fa-star ${n <= review.rvRating ? "filled" : ""}`}
                  />
                ))}
                <span className="rating-text-detail">
                  {review.rvRating}.0 — {RATING_LABELS[review.rvRating]}
                </span>
              </div>
            </div>

            {/* ── 메타 바: 작성자 + 통계 ── */}
            <div className="review-meta-bar">
              <div className="author-info-detail">
                <div className="author-avatar-detail">
                  {review.userName?.charAt(0) ?? "?"}
                </div>
                <div>
                  <strong>{review.userName}</strong>
                  <span>{review.rvCreatedAt?.substring(0, 10)}</span>
                </div>
              </div>
              <div className="meta-stats">
                <span><i className="fas fa-eye" /> {review.rvViewCount}</span>
                <span><i className="fas fa-heart" /> {review.rvLikesCount}</span>
                <span><i className="fas fa-comment" /> {review.rvCommentCount}</span>
              </div>
            </div>

            {/* ── 첨부 이미지 갤러리 ── */}
            {files.length > 0 && (
              <div className="review-images-gallery">
                {files.map((file) => (
                  <div key={file.rfNum} className="gallery-item">
                    <img
                      src={`http://localhost:8080${file.rfPath}`}
                      alt="후기 이미지"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ── 후기 본문 ── */}
            <div className="review-body">
              <p>{review.rvContent}</p>
            </div>

            {/* ── 액션 버튼: 좋아요 / 수정 / 목록 ── */}
            <div className="review-actions">
              {/* 좋아요 버튼 — liked 여부에 따라 스타일 변경 */}
              <button
                className={`btn-like-review ${liked ? "liked" : ""}`}
                onClick={handleLike}
              >
                <i className={`fas fa-heart`} />
                {liked ? "좋아요 취소" : "좋아요"}
                <span>({review.rvLikesCount})</span>
              </button>
              <button onClick={() => navigate(`/reviews/revise/${rvNum}`)}>
                <i className="fas fa-pen" /> 수정하기
              </button>
              <button onClick={() => navigate("/reviews")}>
                <i className="fas fa-list" /> 목록으로
              </button>
            </div>

            {/* ════════════════════════════════
                댓글 섹션
            ════════════════════════════════ */}
            <div className="comments-section">
              <h3>
                <i className="fas fa-comments" />
                댓글
                <span className="comment-count">{comments.length}</span>
              </h3>

              {/* 댓글 작성 폼 */}
              <div className="comment-write">
                <div className="comment-avatar">
                  <i className="fas fa-user" />
                </div>
                <textarea
                  placeholder="후기에 대한 댓글을 남겨주세요"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  // Ctrl+Enter로도 등록 가능
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === "Enter") handleCommentSubmit();
                  }}
                />
                <button
                  className="btn-comment-submit"
                  onClick={handleCommentSubmit}
                >
                  <i className="fas fa-paper-plane" /> 등록
                </button>
              </div>

              {/* 댓글 목록 */}
              <div className="comments-list">
                {comments.length === 0 ? (
                  <div className="rd-no-comments">
                    <i className="fas fa-comment-slash" />
                    <p>첫 번째 댓글을 남겨보세요!</p>
                  </div>
                ) : (
                  comments.map((c) => (
                    <div key={c.rcNum ?? c.id} className="comment-item">
                      {/* 아바타 — 작성자 이름 첫 글자 */}
                      <div className="comment-avatar-small">
                        {c.userName?.charAt(0) ?? c.userNum?.toString().charAt(0) ?? "?"}
                      </div>
                      <div className="comment-content-wrap">
                        <div className="comment-header-small">
                          <strong>{c.userName ?? `사용자 ${c.userNum}`}</strong>
                          <span>{c.rcCreatedAt?.substring(0, 10)}</span>
                        </div>
                        <p className="comment-text">{c.rcContent}</p>
                        <div className="comment-actions-small">
                          <button>
                            <i className="fas fa-thumbs-up" /> 도움돼요
                          </button>
                          <button>
                            <i className="fas fa-flag" /> 신고
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </main>


          {/* ── 사이드바 ── */}
          <aside className="review-sidebar">

            {/* 작성자 정보 카드 */}
            <div className="sidebar-card author-card">
              <div className="author-header">
                <div className="author-avatar-large">
                  {review.userName?.charAt(0) ?? "?"}
                </div>
                <div>
                  <strong>{review.userName}</strong>
                  <span>후기 작성자</span>
                </div>
              </div>
              <div className="author-stats">
                <div className="stat">
                  <i className="fas fa-star" />
                  <div>
                    <strong>{review.rvRating}.0</strong>
                    <span>평균 별점</span>
                  </div>
                </div>
                <div className="stat">
                  <i className="fas fa-heart" />
                  <div>
                    <strong>{review.rvLikesCount}</strong>
                    <span>좋아요</span>
                  </div>
                </div>
              </div>
              <button className="btn-view-profile">
                <i className="fas fa-user" /> 프로필 보기
              </button>
            </div>

            {/* 병원 정보 카드 */}
            <div className="sidebar-card hospital-card">
              <h4>
                <i className="fas fa-hospital" /> 방문 병원 정보
              </h4>
              <div className="hospital-detail-info">
                <p className="hospital-name-side">{review.hoName}</p>
                {/* 별점 표시 */}
                <div className="hospital-rating-side">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <i
                      key={n}
                      className={`fas fa-star ${n <= review.rvRating ? "" : "rd-star-empty"}`}
                    />
                  ))}
                  <strong>{review.rvRating}.0</strong>
                  <span>이 후기 기준</span>
                </div>
              </div>
              <button
                className="btn-make-reservation"
                onClick={() => navigate("/hospitals")}
              >
                <i className="fas fa-calendar-plus" /> 예약하기
              </button>
            </div>

            {/* 조회 통계 카드 */}
            <div className="sidebar-card">
              <h4 style={{ fontWeight: 800, marginBottom: "1rem", fontSize: "0.95rem" }}>
                <i className="fas fa-chart-bar" style={{ color: "var(--primary-mint)", marginRight: "0.4rem" }} />
                후기 통계
              </h4>
              <div className="author-stats">
                <div className="stat">
                  <i className="fas fa-eye" />
                  <div>
                    <strong>{review.rvViewCount}</strong>
                    <span>조회수</span>
                  </div>
                </div>
                <div className="stat">
                  <i className="fas fa-comment" />
                  <div>
                    <strong>{review.rvCommentCount}</strong>
                    <span>댓글수</span>
                  </div>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}

export default ReviewDetail;
