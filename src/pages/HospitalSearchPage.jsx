import React, { useState, useEffect, useRef } from "react";
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

const REGION_CATEGORIES = [
  { id: "all", label: "전체" },
  { id: "gangnam", label: "강남구" },
  { id: "mapo", label: "마포구" },
  { id: "yongsan", label: "용산구" },
  { id: "seocho", label: "서초구" },
  { id: "songpa", label: "송파구" },
  { id: "yeongdeungpo", label: "영등포구" },
];

const FILTER_TAGS = [
  { id: "open", label: "영업중", icon: "circle-check", color: "#10b981" },
  { id: "night", label: "야간진료", icon: "moon", color: "#6366f1" },
  { id: "weekend", label: "주말진료", icon: "calendar-week", color: "#ec4899" },
  {
    id: "available",
    label: "예약가능",
    icon: "calendar-check",
    color: "#14b8a6",
  },
  {
    id: "parking",
    label: "주차가능",
    icon: "square-parking",
    color: "#0ea5e9",
  },
];

const HOSPITAL_LIST = [
  {
    id: 1,
    name: "서울아동병원",
    dept: "소아청소년과",
    deptId: "pediatrics",
    region: "gangnam",
    thumbnail:
      "https://via.placeholder.com/400x250/14b8a6/ffffff?text=Hospital",
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
    thumbnail:
      "https://via.placeholder.com/400x250/0d9488/ffffff?text=Medical+Center",
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
    thumbnail:
      "https://via.placeholder.com/400x250/0f766e/ffffff?text=Orthopedics",
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
    thumbnail:
      "https://via.placeholder.com/400x250/115e59/ffffff?text=Eye+Clinic",
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
    thumbnail:
      "https://via.placeholder.com/400x250/14b8a6/ffffff?text=Dental+Clinic",
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
    thumbnail:
      "https://via.placeholder.com/400x250/0d9488/ffffff?text=Dermatology",
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
    thumbnail:
      "https://via.placeholder.com/400x250/0f766e/ffffff?text=Kids+Clinic",
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
    thumbnail:
      "https://via.placeholder.com/400x250/115e59/ffffff?text=GI+Clinic",
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
    thumbnail:
      "https://via.placeholder.com/400x250/14b8a6/ffffff?text=Women+Medical",
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
    thumbnail:
      "https://via.placeholder.com/400x250/0d9488/ffffff?text=ENT+Clinic",
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
  const [searchMode, setSearchMode] = useState("dept");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeFilters, setActiveFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedHospitals, setBookmarkedHospitals] = useState(new Set());
  const [sortBy, setSortBy] = useState("distance");
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const headerRef = useRef(null);

  /* 스크롤 헤더 효과 */
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const cards = el.closest(".hsp-page")?.querySelectorAll(".hsp-card");
    if (!cards) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.style.opacity = "1";
            e.target.style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" },
    );
    cards.forEach((c) => {
      c.style.opacity = "0";
      c.style.transform = "translateY(28px)";
      c.style.transition = "opacity .5s ease, transform .5s ease";
      obs.observe(c);
    });
    return () => obs.disconnect();
  }, [selectedCategory, activeFilters, searchQuery]);

  const toggleFilter = (filterId) =>
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId],
    );

  const toggleBookmark = (id) =>
    setBookmarkedHospitals((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  const filteredHospitals = HOSPITAL_LIST.filter((h) => {
    if (
      searchQuery &&
      !h.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    if (selectedCategory !== "all") {
      if (searchMode === "dept" && h.deptId !== selectedCategory) return false;
      if (searchMode === "region" && h.region !== selectedCategory)
        return false;
    }
    if (activeFilters.length > 0) {
      const ok = activeFilters.every((f) =>
        f === "female" ? h.femaleDoctor : h.tags.includes(f),
      );
      if (!ok) return false;
    }
    return true;
  });

  const sortedHospitals = [...filteredHospitals].sort((a, b) => {
    if (sortBy === "distance")
      return parseFloat(a.distance) - parseFloat(b.distance);
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "reviews") return b.reviews - a.reviews;
    return 0;
  });

  return (
    <div className="hsp-page">
      {/* ══════════ HERO 헤더 ══════════ */}
      <section className="hsp-hero" ref={headerRef}>
        <div className="hsp-hero-blob hsp-blob1" />
        <div className="hsp-hero-blob hsp-blob2" />
        <div className="container-s2">
          <div className="hsp-hero-inner">
            <h1 className="hsp-hero-title">
              나에게 꼭 맞는
              <br />
              <span className="gradient-text-s2">최적의 병원</span>을 찾아드려요
            </h1>
            <p className="hsp-hero-sub">
              진료과·위치·조건을 설정하면 AI가 가장 적합한 병원을 추천해드립니다
            </p>

            {/* 검색바 */}
            <div className="hsp-searchbar">
              <i className="fas fa-search hsp-searchbar-icon" />
              <input
                type="text"
                className="hsp-searchbar-input"
                placeholder="병원명, 진료과, 증상으로 검색하세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="hsp-clear-btn"
                  onClick={() => setSearchQuery("")}
                >
                  <i className="fas fa-times" />
                </button>
              )}
              <button className="hsp-search-submit">
                검색 <i className="fas fa-arrow-right" />
              </button>
            </div>

            {/* 퀵 태그 */}
            <div className="hsp-quick-tags">
              {["감기", "두통", "피부트러블", "치아교정", "눈 건조"].map(
                (t) => (
                  <button
                    key={t}
                    className="hsp-quick-tag"
                    onClick={() => setSearchQuery(t)}
                  >
                    <i className="fas fa-fire" />
                    {t}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ 필터 바 ══════════ */}
      <section className="hsp-filter-bar">
        <div className="container-s2">
          {/* 모드 탭 */}
          <div className="hsp-mode-tabs">
            {[
              { key: "dept", icon: "stethoscope", label: "진료과별" },
              { key: "region", icon: "map-location-dot", label: "지역별" },
            ].map((m) => (
              <button
                key={m.key}
                className={`hsp-mode-tab ${searchMode === m.key ? "active" : ""}`}
                onClick={() => {
                  setSearchMode(m.key);
                  setSelectedCategory("all");
                }}
              >
                <i className={`fas fa-${m.icon}`} />
                {m.label}
              </button>
            ))}
          </div>

          {/* 진료과 카테고리 스크롤 */}
          <div className="hsp-cat-scroll">
            <div className="hsp-cat-inner">
              {(searchMode === "dept"
                ? DEPT_CATEGORIES
                : REGION_CATEGORIES
              ).map((cat) => (
                <button
                  key={cat.id}
                  className={`hsp-cat-btn ${selectedCategory === cat.id ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {searchMode === "dept" && (
                    <i className={`fas fa-${cat.icon}`} />
                  )}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 상세 필터 */}
          <div className="hsp-detail-filter">
            <button
              className="hsp-filter-toggle"
              onClick={() => setIsFilterOpen((p) => !p)}
            >
              <i className="fas fa-sliders" />
              <span>상세 필터</span>
              {activeFilters.length > 0 && (
                <span className="hsp-filter-badge">{activeFilters.length}</span>
              )}
              <i
                className={`fas fa-chevron-${isFilterOpen ? "up" : "down"} hsp-chevron`}
              />
            </button>

            {isFilterOpen && (
              <div className="hsp-filter-tags-wrap">
                {FILTER_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    className={`hsp-ftag ${activeFilters.includes(tag.id) ? "active" : ""}`}
                    style={{ "--ftag-color": tag.color }}
                    onClick={() => toggleFilter(tag.id)}
                  >
                    <i className={`fas fa-${tag.icon}`} />
                    {tag.label}
                    {activeFilters.includes(tag.id) && (
                      <i className="fas fa-check hsp-ftag-check" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 결과 헤더 */}
          <div className="hsp-results-bar">
            <div className="hsp-results-info">
              <span className="hsp-results-count">
                {sortedHospitals.length}
              </span>
              <span className="hsp-results-label">개의 병원을 찾았어요</span>
              {activeFilters.length > 0 && (
                <button
                  className="hsp-reset-btn"
                  onClick={() => setActiveFilters([])}
                >
                  <i className="fas fa-rotate-left" />
                  필터 초기화
                </button>
              )}
            </div>
            <div className="hsp-sort-wrap">
              <i className="fas fa-sort" />
              <select
                className="hsp-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="distance">거리순</option>
                <option value="rating">평점순</option>
                <option value="reviews">리뷰순</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ 병원 리스트 ══════════ */}
      <section className="hsp-list-section">
        <div className="container-s2">
          {sortedHospitals.length === 0 ? (
            <div className="hsp-no-results">
              <div className="hsp-no-icon">
                <i className="fas fa-hospital-slash" />
              </div>
              <h3>검색 결과가 없습니다</h3>
              <p>다른 조건이나 검색어로 다시 시도해보세요</p>
              <button
                className="hsp-no-reset"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilters([]);
                  setSelectedCategory("all");
                }}
              >
                <i className="fas fa-rotate-left" /> 전체 초기화
              </button>
            </div>
          ) : (
            <div className="hsp-cards-grid">
              {sortedHospitals.map((h) => (
                <HospitalDetailCard
                  key={h.id}
                  hospital={h}
                  isBookmarked={bookmarkedHospitals.has(h.id)}
                  onToggleBookmark={() => toggleBookmark(h.id)}
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
   병원 카드 컴포넌트
───────────────────────────────────────── */
const HospitalDetailCard = ({ hospital, isBookmarked, onToggleBookmark }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`hsp-card ${hovered ? "hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 썸네일 */}
      <div className="hsp-card-thumb">
        <img src={hospital.thumbnail} alt={hospital.name} />
        <div className="hsp-card-thumb-overlay" />

        {/* 상태 배지 */}
        <span
          className={`hsp-status-badge ${hospital.open ? "open" : "closed"}`}
        >
          <i className="fas fa-circle" />
          {hospital.open ? "진료중" : "진료종료"}
        </span>

        {/* 북마크 */}
        <button
          className={`hsp-bookmark-btn ${isBookmarked ? "active" : ""}`}
          onClick={onToggleBookmark}
        >
          <i className="fas fa-bookmark" />
        </button>

        {/* 거리 칩 */}
        <span className="hsp-distance-chip">
          <i className="fas fa-location-dot" />
          {hospital.distance}
        </span>
      </div>

      {/* 카드 바디 */}
      <div className="hsp-card-body">
        {/* 병원명 + 진료과 */}
        <div className="hsp-card-title-row">
          <h3 className="hsp-card-name">{hospital.name}</h3>
          <span className="hsp-dept-pill">{hospital.dept}</span>
        </div>

        {/* 평점 */}
        <div className="hsp-card-rating-row">
          <div className="hsp-stars">
            {[...Array(5)].map((_, i) => (
              <i
                key={i}
                className={`fas fa-star ${i < Math.floor(hospital.rating) ? "filled" : "empty"}`}
              />
            ))}
            <span className="hsp-rating-val">{hospital.rating}</span>
            <span className="hsp-rating-cnt">({hospital.reviews})</span>
          </div>
          {hospital.femaleDoctor && (
            <span className="hsp-female-badge">
              <i className="fas fa-user-doctor" /> 여의사
            </span>
          )}
        </div>

        {/* 주소 */}
        <div className="hsp-card-address">
          <i className="fas fa-location-dot" />
          <span>{hospital.address}</span>
          {hospital.detailAddress && (
            <span className="hsp-detail-addr">{hospital.detailAddress}</span>
          )}
        </div>

        {/* 연락처 / 운영시간 */}
        <div className="hsp-card-info-grid">
          <div className="hsp-info-chip">
            <i className="fas fa-phone" />
            <span>{hospital.phone}</span>
          </div>
          <div className="hsp-info-chip">
            <i className="fas fa-clock" />
            <span>{hospital.openTime}</span>
          </div>
        </div>

        {/* 휴진일 */}
        {hospital.closedDays?.length > 0 && (
          <div className="hsp-closed-days">
            <i className="fas fa-calendar-xmark" />
            <span>휴진: {hospital.closedDays.join(", ")}</span>
          </div>
        )}

        {/* 특징 태그 */}
        {hospital.features?.length > 0 && (
          <div className="hsp-features-row">
            {hospital.features.map((f, i) => (
              <span key={i} className="hsp-feature-tag">
                {f}
              </span>
            ))}
          </div>
        )}

        {/* 구분선 */}
        <div className="hsp-card-divider" />

        {/* 액션 버튼 */}
        <div className="hsp-card-actions">
          <button className="hsp-btn-reserve">
            <i className="fas fa-calendar-check" />
            <span>예약하기</span>
          </button>
          <button className="hsp-btn-icon" title="전화">
            <i className="fas fa-phone" />
          </button>
          <button className="hsp-btn-icon" title="길찾기">
            <i className="fas fa-route" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HospitalSearchPage;
