import React, { useState } from "react";
import "../assets/styles/HospitalSearchPage.css";

/* ─────────────────────────────────────────
   데이터 상수
───────────────────────────────────────── */
const DEPT_CATEGORIES = [
  { id: "all", label: "전체", icon: "th-large" },
  { id: "pediatrics", label: "소아청소년과", icon: "baby" },
  { id: "internal", label: "내과", icon: "heartbeat" },
  { id: "surgery", label: "외과", icon: "cut" },
  { id: "orthopedics", label: "정형외과", icon: "bone" },
  { id: "ophthalmology", label: "안과", icon: "eye" },
  { id: "dental", label: "치과", icon: "tooth" },
  { id: "dermatology", label: "피부과", icon: "spa" },
  { id: "ent", label: "이비인후과", icon: "ear-listen" },
  { id: "neuro", label: "신경과", icon: "brain" },
  { id: "psychiatry", label: "정신건강의학과", icon: "brain" },
  { id: "obgyn", label: "산부인과", icon: "baby-carriage" },
];

const FILTER_TAGS = [
  { id: "open", label: "영업중", icon: "circle-check", color: "#10b981" },
  { id: "night", label: "야간진료", icon: "moon", color: "#6366f1" },
  { id: "weekend", label: "주말진료", icon: "calendar-week", color: "#ec4899" },
  { id: "available", label: "예약가능", icon: "calendar-check", color: "#14b8a6" },
  { id: "parking", label: "주차가능", icon: "square-parking", color: "#0ea5e9" },
];

const HOSPITAL_LIST = [
  {
    id: 1,
    name: "서울아동병원",
    dept: "소아청소년과",
    deptId: "pediatrics",
    region: "gangnam",
    thumbnail: "https://via.placeholder.com/400x250/14b8a6/ffffff?text=Hospital",
    address: "서울 강남구 테헤란로 123",
    phone: "02-1234-5678",
    rating: 4.9,
    reviews: 312,
    distance: "0.8km",
    open: true,
    openTime: "09:00 - 18:00",
    closedDays: ["일요일", "공휴일"],
    tags: ["open", "available", "parking", "insurance"],
    features: ["야간진료", "주차가능", "예약가능"],
    femaleDoctor: false,
  },
  {
    id: 2,
    name: "강남메디컬센터",
    dept: "내과",
    deptId: "internal",
    region: "gangnam",
    thumbnail: "https://via.placeholder.com/400x250/0d9488/ffffff?text=Medical+Center",
    address: "서울 강남구 논현로 456",
    detailAddress: "3층 내과",
    phone: "02-2345-6789",
    rating: 4.8,
    reviews: 245,
    distance: "1.2km",
    open: true,
    openTime: "08:00 - 20:00",
    closedDays: ["일요일"],
    tags: ["open", "night", "weekend", "available", "insurance"],
    features: ["야간진료", "주말진료", "예약가능"],
    femaleDoctor: true,
  },
  {
    id: 3,
    name: "한강정형외과의원",
    dept: "정형외과",
    deptId: "orthopedics",
    region: "gangnam",
    thumbnail: "https://via.placeholder.com/400x250/0f766e/ffffff?text=Orthopedics",
    address: "서울 용산구 이태원로 78",
    detailAddress: "2층",
    phone: "02-3456-7890",
    rating: 5.0,
    reviews: 198,
    distance: "2.1km",
    open: true,
    openTime: "09:00 - 19:00",
    closedDays: ["일요일", "공휴일"],
    tags: ["open", "available", "parking", "insurance"],
    features: ["주차가능", "즉시예약"],
    femaleDoctor: false,
  },
  {
    id: 4,
    name: "밝은눈안과",
    dept: "안과",
    deptId: "ophthalmology",
    region: "gangnam",
    thumbnail: "https://via.placeholder.com/400x250/115e59/ffffff?text=Eye+Clinic",
    address: "서울 마포구 홍익로 90",
    detailAddress: "4층 안과",
    phone: "02-4567-8901",
    rating: 4.7,
    reviews: 167,
    distance: "1.5km",
    open: false,
    openTime: "10:00 - 18:00",
    closedDays: ["토요일", "일요일"],
    tags: ["insurance"],
    features: ["보험적용"],
    femaleDoctor: true,
  },
  {
    id: 5,
    name: "스마일치과의원",
    dept: "치과",
    deptId: "dental",
    region: "gangnam",
    thumbnail: "https://via.placeholder.com/400x250/14b8a6/ffffff?text=Dental+Clinic",
    address: "서울 서초구 방배로 200",
    detailAddress: "1층",
    phone: "02-5678-9012",
    rating: 4.8,
    reviews: 289,
    distance: "0.5km",
    open: true,
    openTime: "09:00 - 21:00",
    closedDays: ["공휴일"],
    tags: ["open", "night", "weekend", "available", "parking"],
    features: ["야간진료", "주말진료", "주차가능"],
    femaleDoctor: false,
  },
  {
    id: 6,
    name: "맑은피부과",
    dept: "피부과",
    deptId: "dermatology",
    region: "gangnam",
    thumbnail: "https://via.placeholder.com/400x250/0d9488/ffffff?text=Dermatology",
    address: "서울 강남구 청담동 55",
    detailAddress: "빌딩 전체",
    phone: "02-6789-0123",
    rating: 4.6,
    reviews: 134,
    distance: "1.8km",
    open: true,
    openTime: "10:00 - 19:00",
    closedDays: ["일요일"],
    tags: ["open", "female", "available", "insurance"],
    features: ["여의사", "예약가능"],
    femaleDoctor: true,
  },
  {
    id: 7,
    name: "우리아이클리닉",
    dept: "소아청소년과",
    deptId: "pediatrics",
    region: "gangnam",
    thumbnail: "https://via.placeholder.com/400x250/0f766e/ffffff?text=Kids+Clinic",
    address: "서울 송파구 올림픽로 301",
    detailAddress: "2층 소아과",
    phone: "02-7890-1234",
    rating: 4.7,
    reviews: 156,
    distance: "3.0km",
    open: true,
    openTime: "09:00 - 18:00",
    closedDays: ["토요일", "일요일"],
    tags: ["open", "available", "parking", "insurance"],
    features: ["주차가능", "예약가능"],
    femaleDoctor: true,
  },
  {
    id: 8,
    name: "소화기내과의원",
    dept: "내과",
    deptId: "internal",
    region: "gangnam",
    thumbnail: "https://via.placeholder.com/400x250/115e59/ffffff?text=GI+Clinic",
    address: "서울 영등포구 여의대방로 12",
    detailAddress: "3층",
    phone: "02-8901-2345",
    rating: 4.9,
    reviews: 203,
    distance: "2.4km",
    open: true,
    openTime: "08:30 - 17:30",
    closedDays: ["일요일", "공휴일"],
    tags: ["open", "available", "insurance"],
    features: ["즉시예약", "보험적용"],
    femaleDoctor: false,
  },
  {
    id: 9,
    name: "여성메디컬센터",
    dept: "산부인과",
    deptId: "obgyn",
    region: "gangnam",
    thumbnail: "https://via.placeholder.com/400x250/14b8a6/ffffff?text=Women+Medical",
    address: "서울 강남구 선릉로 234",
    detailAddress: "6-7층",
    phone: "02-9012-3456",
    rating: 4.8,
    reviews: 421,
    distance: "1.1km",
    open: true,
    openTime: "09:00 - 20:00",
    closedDays: ["일요일"],
    tags: ["open", "night", "female", "available", "parking", "insurance"],
    features: ["여의사", "야간진료", "주차가능"],
    femaleDoctor: true,
  },
  {
    id: 10,
    name: "서울이비인후과",
    dept: "이비인후과",
    deptId: "ent",
    region: "gangnam",
    thumbnail: "https://via.placeholder.com/400x250/0d9488/ffffff?text=ENT+Clinic",
    address: "서울 강남구 역삼동 567",
    detailAddress: "4층",
    phone: "02-0123-4567",
    rating: 4.7,
    reviews: 198,
    distance: "0.9km",
    open: false,
    openTime: "09:00 - 18:00",
    closedDays: ["토요일", "일요일"],
    tags: ["insurance"],
    features: ["보험적용"],
    femaleDoctor: false,
  },
];

/* ─────────────────────────────────────────
   HospitalSearchPage Component
───────────────────────────────────────── */
const HospitalSearchPage = () => {
  const [searchMode, setSearchMode] = useState("dept"); // dept | region
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeFilters, setActiveFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedHospitals, setBookmarkedHospitals] = useState(new Set());
  const [sortBy, setSortBy] = useState("distance"); // distance | rating | reviews

  // 필터 토글
  const toggleFilter = (filterId) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId]
    );
  };

  // 북마크 토글
  const toggleBookmark = (hospitalId) => {
    setBookmarkedHospitals((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(hospitalId)) {
        newSet.delete(hospitalId);
      } else {
        newSet.add(hospitalId);
      }
      return newSet;
    });
  };

  // 병원 필터링
  const filteredHospitals = HOSPITAL_LIST.filter((hospital) => {
    // 검색어 필터
    if (searchQuery && !hospital.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // 카테고리 필터 (진료과 또는 지역)
    if (selectedCategory !== "all") {
      if (searchMode === "dept") {
        if (hospital.deptId !== selectedCategory) return false;
      } else {
        if (hospital.region !== selectedCategory) return false;
      }
    }

    // 태그 필터
    if (activeFilters.length > 0) {
      const hasAllFilters = activeFilters.every((filter) => {
        if (filter === "female") {
          return hospital.femaleDoctor;
        }
        return hospital.tags.includes(filter);
      });
      if (!hasAllFilters) return false;
    }

    return true;
  });

  // 병원 정렬
  const sortedHospitals = [...filteredHospitals].sort((a, b) => {
    if (sortBy === "distance") {
      return parseFloat(a.distance) - parseFloat(b.distance);
    } else if (sortBy === "rating") {
      return b.rating - a.rating;
    } else if (sortBy === "reviews") {
      return b.reviews - a.reviews;
    }
    return 0;
  });

  return (
    <div className="hospital-search-page">
      {/* ══════════════════════════════
          검색 헤더
      ══════════════════════════════ */}
      <section className="search-header-section">
        <div className="container-s2">
          <div className="search-header-content">
            <h1 className="search-page-title">
              <i className="fas fa-hospital-user" />
              병원 찾기
            </h1>
            <p className="search-page-subtitle">
              원하는 조건으로 가장 적합한 병원을 찾아보세요
            </p>

            {/* 검색바 */}
            <div className="search-input-wrapper">
              <div className="search-input-container">
                <i className="fas fa-search" />
                <input
                  type="text"
                  placeholder="병원명을 검색하세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="clear-search-btn"
                    onClick={() => setSearchQuery("")}
                  >
                    <i className="fas fa-times" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          필터 섹션
      ══════════════════════════════ */}
      <section className="filter-section">
        <div className="container-s2">
          {/* 검색 모드 탭 */}
          <div className="search-mode-tabs">
            <button
              className={`mode-tab ${searchMode === "dept" ? "active" : ""}`}
              onClick={() => {
                setSearchMode("dept");
                setSelectedCategory("all");
              }}
            >
              <i className="fas fa-stethoscope" />
              <span>진료과별 찾기</span>
            </button>
            <button
              className={`mode-tab ${searchMode === "region" ? "active" : ""}`}
              onClick={() => {
                setSearchMode("region");
                setSelectedCategory("all");
              }}
            >
              <i className="fas fa-map-marked-alt" />
              <span>지역별 찾기</span>
            </button>
          </div>


          {/* 필터 태그 */}
          <div className="filter-tags-section">
            <div className="filter-tags-label">
              <i className="fas fa-filter" />
              <span>상세 필터</span>
            </div>
            <div className="filter-tags-wrapper">
              {FILTER_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  className={`filter-tag ${
                    activeFilters.includes(tag.id) ? "active" : ""
                  }`}
                  style={{
                    "--tag-color": tag.color,
                  }}
                  onClick={() => toggleFilter(tag.id)}
                >
                  <i className={`fas fa-${tag.icon}`} />
                  <span>{tag.label}</span>
                  {activeFilters.includes(tag.id) && (
                    <i className="fas fa-check filter-check" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 결과 정보 및 정렬 */}
          <div className="results-header">
            <div className="results-info">
              <span className="results-count">{sortedHospitals.length}</span>
              <span className="results-text">개의 병원</span>
              {activeFilters.length > 0 && (
                <button
                  className="reset-filter-btn"
                  onClick={() => setActiveFilters([])}
                >
                  <i className="fas fa-rotate-left" />
                  필터 초기화
                </button>
              )}
            </div>
            <div className="sort-options">
              <span className="sort-label">정렬:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="distance">거리순</option>
                <option value="rating">평점순</option>
                <option value="reviews">리뷰순</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          병원 리스트
      ══════════════════════════════ */}
      <section className="hospital-list-section">
        <div className="container-s2">
          {sortedHospitals.length === 0 ? (
            <div className="no-results">
              <i className="fas fa-search" />
              <h3>검색 결과가 없습니다</h3>
              <p>다른 조건으로 검색해보세요</p>
            </div>
          ) : (
            <div className="hospital-cards-grid">
              {sortedHospitals.map((hospital) => (
                <HospitalDetailCard
                  key={hospital.id}
                  hospital={hospital}
                  isBookmarked={bookmarkedHospitals.has(hospital.id)}
                  onToggleBookmark={() => toggleBookmark(hospital.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

/* ─────────────────────────────────────────
   병원 상세 카드 컴포넌트
───────────────────────────────────────── */
const HospitalDetailCard = ({ hospital, isBookmarked, onToggleBookmark }) => {
  return (
    <div className="hospital-detail-card">
      {/* 썸네일 영역 */}
      <div className="hospital-thumbnail">
        <img src={hospital.thumbnail} alt={hospital.name} />
        <div className="thumbnail-overlay">
          <button
            className={`bookmark-btn ${isBookmarked ? "active" : ""}`}
            onClick={onToggleBookmark}
          >
            <i className={`fas fa-bookmark`} />
          </button>
          {hospital.open ? (
            <span className="status-badge open">
              <i className="fas fa-circle" />
              진료중
            </span>
          ) : (
            <span className="status-badge closed">
              <i className="fas fa-circle" />
              진료종료
            </span>
          )}
        </div>
      </div>

      {/* 정보 영역 */}
      <div className="hospital-card-content">
        {/* 헤더 */}
        <div className="hospital-card-header">
          <div className="hospital-title-row">
            <h3 className="hospital-name">{hospital.name}</h3>
            <span className="dept-badge">{hospital.dept}</span>
          </div>
          <div className="hospital-rating-row">
            <div className="rating-stars">
              <i className="fas fa-star" />
              <span className="rating-value">{hospital.rating}</span>
              <span className="rating-count">({hospital.reviews})</span>
            </div>
            {hospital.femaleDoctor && (
              <span className="female-doctor-badge">
                <i className="fas fa-user-doctor" />
                여의사
              </span>
            )}
          </div>
        </div>

        {/* 주소 및 거리 */}
        <div className="hospital-location">
          <div className="location-row">
            <i className="fas fa-location-dot" />
            <span className="address">{hospital.address}</span>
          </div>
          <div className="location-detail">
            <span className="detail-address">{hospital.detailAddress}</span>
            <span className="distance">
              <i className="fas fa-walking" />
              {hospital.distance}
            </span>
          </div>
        </div>

        {/* 연락처 및 운영시간 */}
        <div className="hospital-info-grid">
          <div className="info-item">
            <i className="fas fa-phone" />
            <span>{hospital.phone}</span>
          </div>
          <div className="info-item">
            <i className="fas fa-clock" />
            <span>{hospital.openTime}</span>
          </div>
        </div>

        {/* 휴진일 */}
        {hospital.closedDays && hospital.closedDays.length > 0 && (
          <div className="closed-days">
            <i className="fas fa-calendar-xmark" />
            <span>휴진: {hospital.closedDays.join(", ")}</span>
          </div>
        )}

        {/* 특징 태그 */}
        {hospital.features && hospital.features.length > 0 && (
          <div className="hospital-features">
            {hospital.features.map((feature, idx) => (
              <span key={idx} className="feature-tag">
                {feature}
              </span>
            ))}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="hospital-card-actions">
          <button className="btn-reserve-detail">
            <i className="fas fa-calendar-check" />
            <span>예약하기</span>
          </button>
          <button className="btn-call">
            <i className="fas fa-phone" />
          </button>
          <button className="btn-directions">
            <i className="fas fa-route" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HospitalSearchPage;