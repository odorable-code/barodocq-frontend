import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authFetch } from "../utils/authFetch";
import "../assets/styles/ReviewDetail.css";

const ReviewDetail = () => {
  const [likedReview, setLikedReview] = useState(false);
  const [likedComments, setLikedComments] = useState([]);

  // 후기 데이터
  const reviewData = {
    id: 1,
    hospital: "서울아동병원",
    dept: "소아청소년과",
    author: "박민지",
    avatar: "박",
    rating: 5,
    title: "아이가 무서워하지 않도록 세심하게 배려해주셨어요",
    content: `3살 아이가 병원을 무서워해서 걱정이 많았습니다. 
    
그런데 선생님께서 아이 눈높이에 맞춰 천천히 설명해주시고, 진료 과정에서도 계속 아이에게 말을 걸어주시면서 불안감을 덜어주셨어요. 

진료가 끝난 후에는 아이가 잘 참았다고 칭찬하시면서 스티커도 붙여주셨습니다. 덕분에 아이도 울지 않고 잘 받았고, 다음에 또 오고 싶다고 하네요.

병원 시설도 깨끗하고 대기실에 아이들이 놀 수 있는 공간이 마련되어 있어서 좋았습니다. 접수부터 진료, 수납까지 모든 과정이 친절하고 신속했습니다.

소아청소년과를 찾으시는 부모님들께 강력 추천드립니다!`,
    date: "2026-02-23",
    views: 892,
    likes: 47,
    comments: 12,
    verified: true,
    images: [
      "https://via.placeholder.com/800x600/14b8a6/ffffff?text=Hospital+Image+1",
      "https://via.placeholder.com/800x600/0d9488/ffffff?text=Hospital+Image+2",
    ],
    visitDate: "2026-02-20",
    doctor: "김민수",
    waitTime: "약 15분",
    treatment: "감기 진료",
  };

  // 댓글 데이터
  const commentsData = [
    {
      id: 1,
      author: "이서연",
      avatar: "이",
      content: "저희 아이도 여기서 진료 받았는데 정말 좋더라구요! 선생님이 너무 친절하세요.",
      date: "2026-02-23",
      likes: 5,
    },
    {
      id: 2,
      author: "최준호",
      avatar: "최",
      content: "후기 보고 예약했습니다. 기대되네요 ^^",
      date: "2026-02-23",
      likes: 2,
    },
    {
      id: 3,
      author: "정하윤",
      avatar: "정",
      content: "대기 시간은 얼마나 걸렸나요?",
      date: "2026-02-22",
      likes: 1,
    },
  ];

  // 관련 후기
  const relatedReviews = [
    {
      id: 2,
      hospital: "우리아이클리닉",
      dept: "소아청소년과",
      author: "김서연",
      rating: 5,
      title: "예방접종 맞으러 갔는데 아이가 울지도 않았어요",
      date: "2026-02-22",
    },
    {
      id: 3,
      hospital: "서울아동병원",
      dept: "소아청소년과",
      author: "송민재",
      rating: 4,
      title: "친절하고 꼼꼼하게 진료해주셨습니다",
      date: "2026-02-21",
    },
  ];

  const toggleLikeReview = () => {
    setLikedReview(!likedReview);
  };

  const toggleLikeComment = (commentId) => {
    if (likedComments.includes(commentId)) {
      setLikedComments(likedComments.filter((id) => id !== commentId));
    } else {
      setLikedComments([...likedComments, commentId]);
    }
  };

  return (
    <div className="review-detail-page">
      <div className="container-s2">
        <div className="review-detail-layout">
          {/* ══════════════════════════════
              LEFT: 후기 본문
          ══════════════════════════════ */}
          <div className="review-main-content">
            {/* 브레드크럼 */}
            <div className="breadcrumb">
              <a href="#">홈</a>
              <i className="fas fa-chevron-right" />
              <a href="#">후기 게시판</a>
              <i className="fas fa-chevron-right" />
              <span>후기 상세</span>
            </div>

            {/* 후기 헤더 */}
            <div className="review-detail-header">
              <div className="hospital-info-detail">
                <div className="hospital-badge-detail">
                  <i className="fas fa-hospital" />
                </div>
                <div>
                  <h2>{reviewData.hospital}</h2>
                  <span className="dept-tag-detail">{reviewData.dept}</span>
                </div>
              </div>
              {reviewData.verified && (
                <span className="verified-badge-detail">
                  <i className="fas fa-check-circle" />
                  인증된 후기
                </span>
              )}
            </div>

            {/* 제목 & 메타 */}
            <div className="review-title-section">
              <h1>{reviewData.title}</h1>
              <div className="review-rating-detail">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className={`fas fa-star ${i < reviewData.rating ? "filled" : ""}`} />
                ))}
                <span className="rating-text-detail">{reviewData.rating}.0</span>
              </div>
            </div>

            <div className="review-meta-bar">
              <div className="author-info-detail">
                <div className="author-avatar-detail">{reviewData.avatar}</div>
                <div>
                  <strong>{reviewData.author}</strong>
                  <span>{reviewData.date}</span>
                </div>
              </div>
              <div className="meta-stats">
                <span>
                  <i className="fas fa-eye" />
                  {reviewData.views}
                </span>
                <span>
                  <i className="fas fa-comment" />
                  {reviewData.comments}
                </span>
              </div>
            </div>

            {/* 진료 정보 카드 */}
            <div className="treatment-info-card">
              <h3>
                <i className="fas fa-clipboard-check" />
                진료 정보
              </h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">방문일</span>
                  <span className="info-value">{reviewData.visitDate}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">담당의</span>
                  <span className="info-value">{reviewData.doctor}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">대기시간</span>
                  <span className="info-value">{reviewData.waitTime}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">진료내용</span>
                  <span className="info-value">{reviewData.treatment}</span>
                </div>
              </div>
            </div>

            {/* 후기 본문 */}
            <div className="review-body">
              <p>{reviewData.content}</p>
            </div>

            {/* 이미지 갤러리 */}
            {reviewData.images && reviewData.images.length > 0 && (
              <div className="review-images-gallery">
                {reviewData.images.map((img, idx) => (
                  <div key={idx} className="gallery-item">
                    <img src={img} alt={`후기 이미지 ${idx + 1}`} />
                  </div>
                ))}
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="review-actions">
              <button
                className={`btn-like-review ${likedReview ? "liked" : ""}`}
                onClick={toggleLikeReview}
              >
                <i className={likedReview ? "fas fa-heart" : "far fa-heart"} />
                도움이 돼요 {reviewData.likes + (likedReview ? 1 : 0)}
              </button>
              <button className="btn-share">
                <i className="fas fa-share-alt" />
                공유하기
              </button>
              <button className="btn-report">
                <i className="fas fa-flag" />
                신고하기
              </button>
            </div>

            {/* 댓글 섹션 */}
            <div className="comments-section">
              <h3>
                댓글 <span className="comment-count">{commentsData.length}</span>
              </h3>

              {/* 댓글 작성 */}
              <div className="comment-write">
                <div className="comment-avatar">💬</div>
                <textarea placeholder="따뜻한 댓글을 남겨주세요" rows="3" />
                <button className="btn-comment-submit">
                  <i className="fas fa-paper-plane" />
                  등록
                </button>
              </div>

              {/* 댓글 리스트 */}
              <div className="comments-list">
                {commentsData.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    liked={likedComments.includes(comment.id)}
                    onToggleLike={() => toggleLikeComment(comment.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════
              RIGHT: 사이드바
          ══════════════════════════════ */}
          <aside className="review-sidebar">
            {/* 작성자 카드 */}
            <div className="sidebar-card author-card">
              <div className="author-header">
                <div className="author-avatar-large">{reviewData.avatar}</div>
                <div>
                  <strong>{reviewData.author}</strong>
                  <span>후기 작성자</span>
                </div>
              </div>
              <div className="author-stats">
                <div className="stat">
                  <i className="fas fa-pen" />
                  <div>
                    <strong>12</strong>
                    <span>작성 후기</span>
                  </div>
                </div>
                <div className="stat">
                  <i className="fas fa-heart" />
                  <div>
                    <strong>284</strong>
                    <span>받은 좋아요</span>
                  </div>
                </div>
              </div>
              <button className="btn-view-profile">프로필 보기</button>
            </div>

            {/* 병원 정보 카드 */}
            <div className="sidebar-card hospital-card">
              <h4>
                <i className="fas fa-hospital" />
                병원 정보
              </h4>
              <div className="hospital-detail-info">
                <p className="hospital-name-side">{reviewData.hospital}</p>
                <div className="hospital-rating-side">
                  <i className="fas fa-star" />
                  <strong>4.9</strong>
                  <span>(312개 후기)</span>
                </div>
                <div className="hospital-address">
                  <i className="fas fa-map-marker-alt" />
                  <span>서울 강남구 테헤란로 123</span>
                </div>
                <div className="hospital-phone">
                  <i className="fas fa-phone" />
                  <span>02-1234-5678</span>
                </div>
              </div>
              <button className="btn-hospital-detail">병원 상세보기</button>
              <button className="btn-make-reservation">
                <i className="fas fa-calendar-check" />
                예약하기
              </button>
            </div>

            {/* 관련 후기 */}
            <div className="sidebar-card related-reviews">
              <h4>
                <i className="fas fa-list" />
                관련 후기
              </h4>
              <div className="related-list">
                {relatedReviews.map((review) => (
                  <RelatedReviewItem key={review.id} review={review} />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   CommentItem Component
───────────────────────────────────────── */
const CommentItem = ({ comment, liked, onToggleLike }) => {
  return (
    <div className="comment-item">
      <div className="comment-avatar-small">{comment.avatar}</div>
      <div className="comment-content-wrap">
        <div className="comment-header-small">
          <strong>{comment.author}</strong>
          <span>{comment.date}</span>
        </div>
        <p className="comment-text">{comment.content}</p>
        <div className="comment-actions-small">
          <button className={`btn-like-comment ${liked ? "liked" : ""}`} onClick={onToggleLike}>
            <i className={liked ? "fas fa-heart" : "far fa-heart"} />
            {comment.likes + (liked ? 1 : 0)}
          </button>
          <button className="btn-reply-comment">
            <i className="fas fa-reply" />
            답글
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   RelatedReviewItem Component
───────────────────────────────────────── */
const RelatedReviewItem = ({ review }) => {
  return (
    <div className="related-item">
      <div className="related-header">
        <span className="related-hospital">{review.hospital}</span>
        <div className="related-rating">
          {[...Array(review.rating)].map((_, i) => (
            <i key={i} className="fas fa-star" />
          ))}
        </div>
      </div>
      <p className="related-title">{review.title}</p>
      <div className="related-footer">
        <span className="related-author">{review.author}</span>
        <span className="related-date">{review.date}</span>
      </div>
    </div>
  );
};

export default ReviewDetail;
