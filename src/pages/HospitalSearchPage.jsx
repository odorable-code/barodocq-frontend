import React, { useEffect, useRef, useState } from "react";
import "../assets/styles/HospitalSearchPage.css";
import RegionSelect from "../components/RegionSelect";
import HospitalDeptSelect from "../components/HospitalDeptSelect";

/* ─────────────────────────────────────────
   데이터 상수
───────────────────────────────────────── */
const FILTER_TAGS = [
  { id: "open",      label: "영업중",   icon: "circle-check",   color: "#10b981" },
  { id: "night",     label: "야간진료", icon: "moon",           color: "#6366f1" },
  { id: "weekend",   label: "주말진료", icon: "calendar-week",  color: "#ec4899" },
  { id: "available", label: "예약가능", icon: "calendar-check", color: "#14b8a6" },
  { id: "parking",   label: "주차가능", icon: "square-parking", color: "#0ea5e9" },
];

const DEPT_CATEGORIES = [
  { id: "all",          label: "전체",       icon: "th-large"  },
  { id: "pediatrics",   label: "소아청소년과", icon: "baby"      },
  { id: "internal",     label: "내과",        icon: "heartbeat" },
  { id: "orthopedics",  label: "정형외과",    icon: "bone"      },
  { id: "obstetrics",   label: "산부인과",    icon: "venus"     },
  { id: "dermatology",  label: "피부과",      icon: "spa"       },
  { id: "neurosurgery", label: "신경외과",    icon: "brain"     },
];

const REGION_CATEGORIES = [
  { id: "all",       label: "전체" },
  { id: "gangnam",   label: "강남" },
  { id: "sinchon",   label: "신촌" },
  { id: "hongdae",   label: "홍대" },
  { id: "ehwa",      label: "이대" },
  { id: "cheongdam", label: "청담" },
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
    name: "신촌종합병원",
    dept: "정형외과",
    deptId: "orthopedics",
    region: "sinchon",
    thumbnail: "https://via.placeholder.com/400x250/f97316/ffffff?text=Hospital",
    address: "서울 서대문구 연세로 50",
    phone: "02-3456-7890",
    rating: 4.5,
    reviews: 180,
    distance: "2.5km",
    open: false,
    openTime: "09:00 - 17:00",
    closedDays: ["토요일", "일요일"],
    tags: ["available", "parking"],
    features: ["주차가능", "예약가능"],
    femaleDoctor: false,
  },
  {
    id: 4,
    name: "이대여성병원",
    dept: "산부인과",
    deptId: "obstetrics",
    region: "ehwa",
    thumbnail: "https://via.placeholder.com/400x250/8b5cf6/ffffff?text=Hospital",
    address: "서울 서대문구 이화여대길 52",
    phone: "02-4567-8901",
    rating: 4.7,
    reviews: 220,
    distance: "3.1km",
    open: true,
    openTime: "08:30 - 19:00",
    closedDays: ["일요일"],
    tags: ["open", "available", "female"],
    features: ["예약가능", "여의사"],
    femaleDoctor: true,
  },
  {
    id: 5,
    name: "청담서울병원",
    dept: "피부과",
    deptId: "dermatology",
    region: "cheongdam",
    thumbnail: "https://via.placeholder.com/400x250/14b8a6/ffffff?text=Hospital",
    address: "서울 강남구 청담동 101",
    phone: "02-5678-9012",
    rating: 4.6,
    reviews: 155,
    distance: "1.8km",
    open: true,
    openTime: "09:00 - 18:30",
    closedDays: ["공휴일"],
    tags: ["open", "available", "parking"],
    features: ["주차가능", "예약가능"],
    femaleDoctor: false,
  },
  {
    id: 6,
    name: "삼성서울병원",
    dept: "신경외과",
    deptId: "neurosurgery",
    region: "gangnam",
    thumbnail: "https://via.placeholder.com/400x250/0ea5e9/ffffff?text=Medical+Center",
    address: "서울 강남구 일원로 81",
    phone: "02-6789-0123",
    rating: 4.9,
    reviews: 410,
    distance: "4.2km",
    open: true,
    openTime: "08:00 - 21:00",
    closedDays: ["일요일"],
    tags: ["open", "night", "available"],
    features: ["야간진료", "예약가능"],
    femaleDoctor: false,
  },
  {
    id: 7,
    name: "서울소아청소년과의원",
    dept: "소아청소년과",
    deptId: "pediatrics",
    region: "hongdae",
    thumbnail: "https://via.placeholder.com/400x250/f43f5e/ffffff?text=Hospital",
    address: "서울 마포구 양화로 100",
    phone: "02-7890-1234",
    rating: 4.3,
    reviews: 132,
    distance: "3.7km",
    open: false,
    openTime: "09:00 - 17:30",
    closedDays: ["토요일", "일요일"],
    tags: ["available", "parking"],
    features: ["예약가능", "주차가능"],
    femaleDoctor: true,
  },
  {
    id: 8,
    name: "한강내과의원",
    dept: "내과",
    deptId: "internal",
    region: "gangnam",
    thumbnail: "https://via.placeholder.com/400x250/8b5cf6/ffffff?text=Clinic",
    address: "서울 강남구 삼성로 200",
    phone: "02-8901-2345",
    rating: 4.4,
    reviews: 98,
    distance: "2.0km",
    open: true,
    openTime: "08:30 - 18:00",
    closedDays: ["일요일"],
    tags: ["open", "available"],
    features: ["예약가능"],
    femaleDoctor: false,
  },
  {
    id: 9,
    name: "홍대정형외과",
    dept: "정형외과",
    deptId: "orthopedics",
    region: "hongdae",
    thumbnail: "https://via.placeholder.com/400x250/f97316/ffffff?text=Clinic",
    address: "서울 마포구 서교동 50",
    phone: "02-9012-3456",
    rating: 4.2,
    reviews: 76,
    distance: "3.3km",
    open: false,
    openTime: "09:00 - 18:00",
    closedDays: ["토요일", "일요일"],
    tags: ["weekend", "available"],
    features: ["주말진료", "예약가능"],
    femaleDoctor: false,
  },
  {
    id: 10,
    name: "가로수길피부과",
    dept: "피부과",
    deptId: "dermatology",
    region: "gangnam",
    thumbnail: "https://via.placeholder.com/400x250/0d9488/ffffff?text=Clinic",
    address: "서울 강남구 가로수길 77",
    phone: "02-0123-4567",
    rating: 4.7,
    reviews: 134,
    distance: "1.5km",
    open: true,
    openTime: "09:30 - 19:00",
    closedDays: ["공휴일"],
    tags: ["open", "available", "parking"],
    features: ["예약가능", "주차가능"],
    femaleDoctor: true,
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

  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState("");
  const [region, setRegion] = useState({
    level: "", sido: null, sigungu: null, emd: null,
  });

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
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
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
      prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId]
    );

  const toggleBookmark = (id) =>
    setBookmarkedHospitals((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  const filteredHospitals = HOSPITAL_LIST.filter((h) => {
    if (searchQuery && !h.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !h.dept.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory !== "all") {
      if (searchMode === "dept"   && h.deptId !== selectedCategory) return false;
      if (searchMode === "region" && h.region !== selectedCategory) return false;
    }
    if (activeFilters.length > 0) {
      const ok = activeFilters.every((f) =>
        f === "female" ? h.femaleDoctor : h.tags.includes(f)
      );
      if (!ok) return false;
    }
    return true;
  });

  const sortedHospitals = [...filteredHospitals].sort((a, b) => {
    if (sortBy === "distance") return parseFloat(a.distance) - parseFloat(b.distance);
    if (sortBy === "rating")   return b.rating - a.rating;
    if (sortBy === "reviews")  return b.reviews - a.reviews;
    return 0;
  });

  return (
    <div className="hsp-page">

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section className="hsp-hero" ref={headerRef}>
        <div className="hsp-hero-blob hsp-blob1" />
        <div className="hsp-hero-blob hsp-blob2" />
        <div className="container-s2">
          <div className="hsp-hero-inner">

            <h1 className="hsp-hero-title">
              나에게 꼭 맞는<br />
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
                <button className="hsp-clear-btn" onClick={() => setSearchQuery("")}>
                  <i className="fas fa-times" />
                </button>
              )}
              <button className="hsp-search-submit">
                검색 <i className="fas fa-arrow-right" />
              </button>
            </div>

            {/* 퀵 액션 버튼 */}
            <div className="quick-actions">
              <button type="button" className="quick-action-btn primary"
                onClick={() => setIsDeptOpen(true)}>
                <i className="fas fa-stethoscope" />
                <span>진료과별 찾기</span>
              </button>
              <button type="button" className="quick-action-btn ghost"
                onClick={() => setIsRegionOpen(true)}>
                <i className="fas fa-map-marked-alt" />
                <span>지역별 찾기</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          필터 바
      ══════════════════════════════ */}
      <section className="hsp-filter-bar">
        <div className="container-s2">

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
              <i className={`fas fa-chevron-${isFilterOpen ? "up" : "down"} hsp-chevron`} />
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

          {/* 결과 바 */}
          <div className="hsp-results-bar">
            <div className="hsp-results-info">
              <span className="hsp-results-count">{sortedHospitals.length}</span>
              <span className="hsp-results-label">개의 병원을 찾았어요</span>
              {activeFilters.length > 0 && (
                <button className="hsp-reset-btn" onClick={() => setActiveFilters([])}>
                  <i className="fas fa-rotate-left" /> 필터 초기화
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

      {/* ══════════════════════════════
          병원 리스트
      ══════════════════════════════ */}
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

      {/* 모달 */}
      <HospitalDeptSelect
        isOpen={isDeptOpen}
        onClose={() => setIsDeptOpen(false)}
        onConfirm={({ deptName }) => {
          setSelectedDept(deptName);
          setIsDeptOpen(false);
        }}
      />
      <RegionSelect
        isOpen={isRegionOpen}
        onClose={() => setIsRegionOpen(false)}
        onConfirm={(nextRegion) => {
          setRegion(nextRegion);
          setIsRegionOpen(false);
        }}
      />
    </div>
  );
};

/* ─────────────────────────────────────────
   병원 카드 컴포넌트
───────────────────────────────────────── */
// ══════════════════════════════════════════════
//  HospitalDetailCard  (리디자인 버전)
// ══════════════════════════════════════════════
function HospitalDetailCard({ hospital, isBookmarked, onToggleBookmark, onReserve }) {
  const [bookmarked, setBookmarked] = React.useState(isBookmarked ?? false);
  const [expanded,   setExpanded]   = React.useState(false);

  // ── 필드 정규화 (HOSPITAL_LIST 구조 대응) ──
  const isOpen       = hospital.isOpen   ?? hospital.open   ?? true;
  const reviewCount  = hospital.reviewCount ?? hospital.reviews ?? 0;
  const hours        = hospital.hours    ?? hospital.openTime ?? "";
  const isNightCare  = hospital.isNightCare  ?? hospital.tags?.includes("night")   ?? false;
  const isEmergency  = hospital.isEmergency  ?? hospital.tags?.includes("emergency") ?? false;
  const isPark       = hospital.isPark       ?? hospital.tags?.includes("parking") ?? false;
  const isReservable = hospital.isReservable ?? hospital.tags?.includes("available") ?? false;

  /* 진료과목 태그 최대 표시 수 */
  const MAX_TAGS = expanded ? 999 : 4;

  /* 별점 렌더 */
  const renderStars = (score) => {
    const full  = Math.floor(score);
    const half  = score - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <>
        {'★'.repeat(full)}
        {half  && <span className="hdc__star--half">★</span>}
        {'☆'.repeat(empty)}
      </>
    );
  };

  return (
    <article className={`hdc ${isOpen ? 'hdc--open' : 'hdc--closed'}`}>

      {/* ── 상단 배지 줄 ── */}
      <div className="hdc__badges">
        {hospital.isNightCare  && <span className="hdc__badge hdc__badge--night">🌙 야간진료</span>}
        {hospital.isEmergency  && <span className="hdc__badge hdc__badge--emergency">🚨 응급실</span>}
        {hospital.isPark       && <span className="hdc__badge hdc__badge--park">🅿 주차가능</span>}
        {hospital.isReservable && <span className="hdc__badge hdc__badge--res">📅 예약가능</span>}
      </div>

      {/* ── 메인 콘텐츠 ── */}
      <div className="hdc__body">

        {/* 왼쪽 : 병원 아이콘 */}
        <div className="hdc__icon-wrap">
          <div className="hdc__icon">
            <i className="fas fa-hospital-alt" />
          </div>
          <span className={`hdc__status ${isOpen ? 'hdc__status--open' : 'hdc__status--closed'}`}>
            {isOpen ? '진료중' : '진료종료'}
          </span>
        </div>

        {/* 오른쪽 : 정보 */}
        <div className="hdc__info">

          {/* 병원명 + 북마크 */}
          <div className="hdc__title-row">
            <h3 className="hdc__name">{hospital.name}</h3>
            <button
              className={`hdc__bookmark ${bookmarked ? 'hdc__bookmark--on' : ''}`}
              onClick={() => setBookmarked(b => !b)}
              aria-label="북마크"
            >
              <i className={bookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'} />
            </button>
          </div>

          {/* 유형 + 거리 */}
          <div className="hdc__meta">
            <span className="hdc__type">{hospital.type ?? '종합병원'}</span>
            <span className="hdc__dot">·</span>
            {hospital.distance && (
              <span className="hdc__distance">
                <i className="fas fa-location-dot" /> {hospital.distance}
              </span>
            )}
            {hospital.waitTime && (
              <>
                <span className="hdc__dot">·</span>
                <span className="hdc__wait">
                  <i className="fas fa-clock" /> 대기 {hospital.waitTime}분
                </span>
              </>
            )}
          </div>

          {/* 별점 */}
          <div className="hdc__rating">
            <span className="hdc__stars">{renderStars(hospital.rating ?? 4.3)}</span>
            <span className="hdc__score">{(hospital.rating ?? 4.3).toFixed(1)}</span>
            <span className="hdc__review-cnt">({hospital.reviewCount ?? 0}개 리뷰)</span>
          </div>

          {/* 주소 */}
          <p className="hdc__addr">
            <i className="fas fa-map-marker-alt" />
            {hospital.address}
          </p>

          {/* 전화 */}
          {hospital.phone && (
            <p className="hdc__phone">
              <i className="fas fa-phone" />
              <a href={`tel:${hospital.phone}`}>{hospital.phone}</a>
            </p>
          )}

          {/* 진료시간 */}
          {hospital.hours && (
            <p className="hdc__hours">
              <i className="fas fa-business-time" />
              {hospital.hours}
            </p>
          )}

          {/* 진료과목 태그 */}
          {hospital.departments?.length > 0 && (
            <div className="hdc__tags">
              {hospital.departments.slice(0, MAX_TAGS).map(dept => (
                <span key={dept} className="hdc__tag">{dept}</span>
              ))}
              {hospital.departments.length > 4 && (
                <button
                  className="hdc__tag hdc__tag--more"
                  onClick={() => setExpanded(e => !e)}
                >
                  {expanded ? '접기 ▲' : `+${hospital.departments.length - 4}개 더보기`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── 하단 액션 버튼 ── */}
      <div className="hdc__actions">
        <button className="hdc__btn hdc__btn--ghost">
          <i className="fas fa-map" /> 길찾기
        </button>
        <button className="hdc__btn hdc__btn--ghost">
          <i className="fas fa-phone-volume" /> 전화
        </button>
        <button className="hdc__btn hdc__btn--ghost">
          <i className="fas fa-star" /> 리뷰
        </button>
        <button
          className="hdc__btn hdc__btn--primary"
          onClick={() => onReserve?.(hospital)}
          disabled={!hospital.isReservable}
        >
          <i className="fas fa-calendar-check" />
          {hospital.isReservable ? '예약하기' : '예약불가'}
        </button>
      </div>

    </article>
  );
};

export default HospitalSearchPage;
