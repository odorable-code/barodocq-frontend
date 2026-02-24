import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authFetch } from "../utils/authFetch";
import "../assets/styles/HospitalReviews.css";

/* ─────────────────────────────────────────
   데이터 상수
───────────────────────────────────────── */
const REVIEW_CATEGORIES = [
  { id: "all", label: "전체", icon: "th-large" },
  { id: "pediatrics", label: "소아청소년과", icon: "baby" },
  { id: "internal", label: "내과", icon: "heartbeat" },
  { id: "surgery", label: "외과", icon: "cut" },
  { id: "orthopedics", label: "정형외과", icon: "bone" },
  { id: "ophthalmology", label: "안과", icon: "eye" },
  { id: "dental", label: "치과", icon: "tooth" },
  { id: "dermatology", label: "피부과", icon: "spa" },
];

const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "rating", label: "평점높은순" },
  { value: "likes", label: "좋아요순" },
  { value: "views", label: "조회수순" },
];

const REVIEWS_DATA = [
  {
    id: 1,
    hospital: "서울아동병원",
    dept: "소아청소년과",
    deptId: "pediatrics",
    author: "박민지",
    avatar: "박",
    rating: 5,
    title: "아이가 무서워하지 않도록 세심하게 배려해주셨어요",
    content:
      "3살 아이가 병원을 무서워해서 걱정했는데, 선생님께서 아이 눈높이에 맞춰 천천히 설명해주시고 스티커도 주시면서 진료해주셨어요. 덕분에 아이도 울지 않고 잘 받았습니다.",
    likes: 47,
    views: 892,
    comments: 12,
    date: "2026-02-23",
    images: 2,
    verified: true,
  },
  {
    id: 2,
    hospital: "강남메디컬센터",
    dept: "내과",
    deptId: "internal",
    author: "이준호",
    avatar: "이",
    rating: 5,
    title: "대기시간 짧고 진료도 꼼꼼하게 봐주셨어요",
    content:
      "AI 추천으로 처음 방문했는데 예약 시스템이 잘 되어 있어서 대기 거의 없이 진료 받았습니다. 의사 선생님도 증상에 대해 자세히 설명해주시고 궁금한 점도 친절하게 답변해주셔서 만족스러웠습니다.",
    likes: 38,
    views: 1243,
    comments: 8,
    date: "2026-02-22",
    images: 1,
    verified: true,
  },
  {
    id: 3,
    hospital: "스마일치과의원",
    dept: "치과",
    deptId: "dental",
    author: "김서연",
    avatar: "김",
    rating: 5,
    title: "치료 과정 설명이 정말 상세하고 통증도 거의 없었어요",
    content:
      "스케일링과 충치 치료를 받았는데, 치료 전에 어떤 과정으로 진행되는지 모니터로 보여주시면서 설명해주셨어요. 마취도 잘 해주셔서 통증이 거의 없었고, 치료 후 관리 방법도 꼼꼼하게 알려주셨습니다.",
    likes: 29,
    views: 756,
    comments: 15,
    date: "2026-02-21",
    images: 3,
    verified: false,
  },
  {
    id: 4,
    hospital: "한강정형외과의원",
    dept: "정형외과",
    deptId: "orthopedics",
    author: "최민수",
    avatar: "최",
    rating: 4,
    title: "물리치료 시설이 잘 갖춰져 있어요",
    content:
      "허리 통증으로 방문했는데 물리치료실 시설이 깨끗하고 최신 장비들이 많았습니다. 치료사 분들도 친절하시고 운동법도 자세히 가르쳐주셔서 좋았어요.",
    likes: 22,
    views: 634,
    comments: 6,
    date: "2026-02-20",
    images: 0,
    verified: true,
  },
  {
    id: 5,
    hospital: "밝은눈안과",
    dept: "안과",
    deptId: "ophthalmology",
    author: "정하윤",
    avatar: "정",
    rating: 5,
    title: "라식 상담 정말 솔직하게 해주셨어요",
    content:
      "라식 수술 상담을 받으러 갔는데, 무조건 수술을 권하는게 아니라 제 눈 상태를 정확히 검사하고 장단점을 솔직하게 말씀해주셨어요. 과장 광고 없이 신뢰가 갔습니다.",
    likes: 35,
    views: 1089,
    comments: 19,
    date: "2026-02-19",
    images: 1,
    verified: true,
  },
  {
    id: 6,
    hospital: "맑은피부과",
    dept: "피부과",
    deptId: "dermatology",
    author: "송지우",
    avatar: "송",
    rating: 4,
    title: "여드름 치료 효과 좋았어요",
    content:
      "여드름이 심해서 방문했는데 피부 타입에 맞는 치료를 제안해주시고, 생활습관 개선 방법도 알려주셨어요. 2주 정도 지나니까 확실히 좋아졌습니다.",
    likes: 18,
    views: 523,
    comments: 7,
    date: "2026-02-18",
    images: 2,
    verified: false,
  },
];

const HospitalReviews = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [searchKeyword, setSearchKeyword] = useState("");

  const filteredReviews = REVIEWS_DATA.filter((review) => {
    const matchCategory =
      activeCategory === "all" || review.deptId === activeCategory;
    const matchSearch =
      review.title.includes(searchKeyword) ||
      review.hospital.includes(searchKeyword);
    return matchCategory && matchSearch;
  });

  return (
    
    <div className="reviews-page">
      {/* ══════════════════════════════
          HEADER
      ══════════════════════════════ */}
      <section className="reviews-header">
        <div className="reviews-header-blob blob-1" />
        <div className="reviews-header-blob blob-2" />
        <div className="container-s2">
          <div className="reviews-header-content">
            <span className="reviews-label">
              <span className="label-icon">💬</span>HOSPITAL REVIEWS
            </span>
            <h1 className="reviews-title">
              진료 후기 <span className="gradient-text-s2">게시판</span>
            </h1>
            <p className="reviews-subtitle">
              실제 방문 환자들의 생생한 후기를 확인하고
              <br />
              나에게 맞는 병원을 찾아보세요
            </p>

            {/* 검색바 */}
            <div className="reviews-search-bar">
              <div className="search-input-wrapper">
                <i className="fas fa-search" />
                <input
                  type="text"
                  placeholder="병원명, 증상, 후기 내용으로 검색"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
              <button
                className="btn-write-review"
                onClick={() => navigate("/reviews/create")}
              >
                <i className="fas fa-pen" />
                후기 작성하기
              </button>
            </div>

            {/* 통계 */}
            <div className="reviews-stats">
              <div className="stat-box">
                <i className="fas fa-file-alt" />
                <div>
                  <strong>2,847</strong>
                  <span>전체 후기</span>
                </div>
              </div>
              <div className="stat-box">
                <i className="fas fa-star" />
                <div>
                  <strong>4.8</strong>
                  <span>평균 평점</span>
                </div>
              </div>
              <div className="stat-box">
                <i className="fas fa-check-circle" />
                <div>
                  <strong>89%</strong>
                  <span>인증 후기</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          FILTERS & LIST
      ══════════════════════════════ */}
      <section className="reviews-content">
        <div className="container-s2">
          {/* 카테고리 필터 */}
          <div className="category-filter-scroll">
            <div className="category-filter">
              {REVIEW_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-btn ${activeCategory === cat.id ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <i className={`fas fa-${cat.icon}`} />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 정렬 & 결과 수 */}
          <div className="reviews-toolbar">
            <div className="result-count">
              총 <strong>{filteredReviews.length}</strong>개의 후기
            </div>
            <div className="sort-dropdown">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <i className="fas fa-chevron-down" />
            </div>
          </div>

          {/* 후기 리스트 */}
          <div className="reviews-grid">
            {filteredReviews.map((review) => (
              <ReviewCard key={review.id} {...review} />
            ))}
            {filteredReviews.length === 0 && (
              <div className="no-reviews">
                <i className="fas fa-inbox" />
                <p>검색 결과가 없습니다</p>
              </div>
            )}
          </div>

          {/* 페이지네이션 */}
          <div className="pagination">
            <button className="page-btn prev">
              <i className="fas fa-chevron-left" />
            </button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">4</button>
            <button className="page-btn">5</button>
            <button className="page-btn next">
              <i className="fas fa-chevron-right" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ─────────────────────────────────────────
   ReviewCard Component
───────────────────────────────────────── */
const ReviewCard = ({
  hospital,
  dept,
  author,
  avatar,
  rating,
  title,
  content,
  likes,
  views,
  comments,
  date,
  images,
  verified,
}) => {
  return (
    <div className="review-card">
      {/* 상단: 병원정보 */}
      <div className="review-card-header">
        <div className="hospital-info">
          <div className="hospital-badge-mini">
            <i className="fas fa-hospital" />
          </div>
          <div>
            <strong>{hospital}</strong>
            <span className="dept-tag-mini">{dept}</span>
          </div>
        </div>
        {verified && (
          <span className="verified-badge">
            <i className="fas fa-check-circle" />
            인증
          </span>
        )}
      </div>

      {/* 평점 */}
      <div className="review-rating">
        {[...Array(5)].map((_, i) => (
          <i key={i} className={`fas fa-star ${i < rating ? "filled" : ""}`} />
        ))}
        <span className="rating-text">{rating}.0</span>
      </div>

      {/* 제목 & 내용 */}
      <h3 className="review-title">{title}</h3>
      <p className="review-content">{content}</p>

      {/* 이미지 표시 */}
      {images > 0 && (
        <div className="review-images-indicator">
          <i className="fas fa-image" />
          <span>사진 {images}장</span>
        </div>
      )}

      {/* 하단: 작성자 & 메타 */}
      <div className="review-card-footer">
        <div className="author-info">
          <div className="author-avatar">{avatar}</div>
          <div>
            <span className="author-name">{author}</span>
            <span className="review-date">{date}</span>
          </div>
        </div>
        <div className="review-meta">
          <span>
            <i className="fas fa-heart" />
            {likes}
          </span>
          <span>
            <i className="fas fa-comment" />
            {comments}
          </span>
          <span>
            <i className="fas fa-eye" />
            {views}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HospitalReviews;
