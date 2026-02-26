import React, { useEffect, useMemo, useState, useCallback } from "react";
import RegionSelect from "../components/RegionSelect";
import "../assets/styles/PharmacySearch.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPills,
  faLocationDot,
  faMagnifyingGlass,
  faFilter,
  faMapLocationDot,
  faPhone,
  faClock,
  faMoon,
  faCalendarDay,
  faArrowRight,
  faAngleLeft,
  faAngleRight,
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faHeart,
  faXmark,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

/* ─────────────────────────────────────────
   더미 데이터
───────────────────────────────────────── */
const DUMMY_PHARMACIES = [
  {
    id: 1,
    name: "하나로 약국",
    addr: "서울특별시 강남구 테헤란로 123 1층",
    phone: "02-1234-5678",
    weekdayOpen: "09:00",
    weekdayClose: "20:00",
    saturdayOpen: "09:00",
    saturdayClose: "14:00",
    isNight: false,
    is24h: false,
    isSunday: false,
    distanceKm: "0.3",
    status: "open",
    tags: ["야간운영"],
    thumbnail: null,
  },
  {
    id: 2,
    name: "건강 약국",
    addr: "서울특별시 강남구 역삼동 456-7",
    phone: "02-9876-5432",
    weekdayOpen: "08:00",
    weekdayClose: "22:00",
    saturdayOpen: "09:00",
    saturdayClose: "18:00",
    isNight: true,
    is24h: false,
    isSunday: true,
    distanceKm: "0.7",
    status: "open",
    tags: ["야간운영", "일요일운영"],
    thumbnail: null,
  },
  {
    id: 3,
    name: "24시 메디팜 약국",
    addr: "서울특별시 강남구 삼성동 789 상가 B101호",
    phone: "02-5555-7777",
    weekdayOpen: "00:00",
    weekdayClose: "23:59",
    saturdayOpen: "00:00",
    saturdayClose: "23:59",
    isNight: true,
    is24h: true,
    isSunday: true,
    distanceKm: "1.2",
    status: "open",
    tags: ["24시간", "야간운영", "일요일운영"],
    thumbnail: null,
  },
  {
    id: 4,
    name: "참사랑 약국",
    addr: "서울특별시 서초구 서초동 321",
    phone: "02-3333-4444",
    weekdayOpen: "09:30",
    weekdayClose: "19:00",
    saturdayOpen: "10:00",
    saturdayClose: "14:00",
    isNight: false,
    is24h: false,
    isSunday: false,
    distanceKm: "1.5",
    status: "closed",
    tags: [],
    thumbnail: null,
  },
  {
    id: 5,
    name: "온누리 약국",
    addr: "서울특별시 송파구 잠실동 1004",
    phone: "02-8888-9999",
    weekdayOpen: "09:00",
    weekdayClose: "21:00",
    saturdayOpen: "09:00",
    saturdayClose: "18:00",
    isNight: false,
    is24h: false,
    isSunday: false,
    distanceKm: "2.1",
    status: "open",
    tags: [],
    thumbnail: null,
  },
  {
    id: 6,
    name: "미래 약국",
    addr: "서울특별시 마포구 홍익로 55",
    phone: "02-7777-2222",
    weekdayOpen: "09:00",
    weekdayClose: "20:00",
    saturdayOpen: "09:00",
    saturdayClose: "15:00",
    isNight: false,
    is24h: false,
    isSunday: false,
    distanceKm: "2.8",
    status: "open",
    tags: [],
    thumbnail: null,
  },
  {
    id: 7,
    name: "행복 야간 약국",
    addr: "서울특별시 종로구 종로 100 2층",
    phone: "02-1111-3333",
    weekdayOpen: "10:00",
    weekdayClose: "23:00",
    saturdayOpen: "10:00",
    saturdayClose: "23:00",
    isNight: true,
    is24h: false,
    isSunday: true,
    distanceKm: "3.4",
    status: "open",
    tags: ["야간운영", "일요일운영"],
    thumbnail: null,
  },
  {
    id: 8,
    name: "OK 약국",
    addr: "서울특별시 용산구 한남대로 200",
    phone: "02-6666-8888",
    weekdayOpen: "09:00",
    weekdayClose: "19:30",
    saturdayOpen: "09:00",
    saturdayClose: "13:00",
    isNight: false,
    is24h: false,
    isSunday: false,
    distanceKm: null,
    status: "closed",
    tags: [],
    thumbnail: null,
  },
];

const FILTER_OPTIONS = [
  { key: "all", label: "전체" },
  { key: "open", label: "영업중" },
  { key: "night", label: "야간운영" },
  { key: "24h", label: "24시간" },
  { key: "sunday", label: "일요일운영" },
];

const STAT_ITEMS = [
  { icon: faPills, value: "12,400+", label: "전국 약국" },
  { icon: faMoon, value: "1,820+", label: "야간운영 약국" },
  { icon: faClock, value: "530+", label: "24시간 약국" },
  { icon: faCalendarDay, value: "3,100+", label: "일요일운영 약국" },
];

const PAGE_SIZE = 6;

/* ─────────────────────────────────────────
   메인 컴포넌트
───────────────────────────────────────── */
export default function PharmacySearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [regionLabel, setRegionLabel] = useState("지역 선택");
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);

  /* 필터링 */
  const filtered = DUMMY_PHARMACIES.filter((p) => {
    const matchSearch =
      !searchTerm || p.name.includes(searchTerm) || p.addr.includes(searchTerm);
    const matchFilter =
      activeFilter === "all" ||
      (activeFilter === "open" && p.status === "open") ||
      (activeFilter === "night" && p.isNight) ||
      (activeFilter === "24h" && p.is24h) ||
      (activeFilter === "sunday" && p.isSunday);
    return matchSearch && matchFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleSearch = () => {
    setIsLoading(true);
    setSearchTerm(inputValue);
    setCurrentPage(1);
    setTimeout(() => setIsLoading(false), 600);
  };

  const handleFilterChange = (key) => {
    setActiveFilter(key);
    setCurrentPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    setRegionLabel(region?.label || "지역 선택");
    setShowRegionModal(false);
    setCurrentPage(1);
  };

  /* 페이지 번호 배열 */
  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="phar-page">
      {/* ── 히어로 ── */}
      <section className="phar-hero">
        <div className="phar-hero-blob phar-blob1" />
        <div className="phar-hero-blob phar-blob2" />
        <div className="phar-container phar-hero-inner">
          <h1 className="phar-hero-title">
            내 주변 약국을
            <br />
            <span className="phar-hero-accent">빠르게 찾아보세요</span>
          </h1>
          <p className="phar-hero-desc">
            영업 중인 약국, 야간 약국, 24시간 약국까지 — 지금 바로 찾아드립니다.
          </p>

          {/* 검색 바 */}
          <div className="phar-search-bar">
            <button
              className="phar-region-btn"
              onClick={() => setShowRegionModal(true)}
            >
              <FontAwesomeIcon icon={faLocationDot} />
              {regionLabel}
              <FontAwesomeIcon
                icon={faChevronDown}
                className="phar-region-arrow"
              />
            </button>
            <div className="phar-search-divider" />
            <div className="phar-search-input-wrap">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="phar-search-icon"
              />
              <input
                className="phar-search-input"
                type="text"
                placeholder="약국명 또는 주소 검색..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {inputValue && (
                <button
                  className="phar-search-clear"
                  onClick={() => {
                    setInputValue("");
                    setSearchTerm("");
                  }}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              )}
            </div>
            <button className="phar-search-btn" onClick={handleSearch}>
              <FontAwesomeIcon icon={faMagnifyingGlass} />
              검색
            </button>
          </div>

          {/* 필터 탭 */}
          <div className="phar-filter-row">
            <FontAwesomeIcon icon={faFilter} className="phar-filter-icon" />
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.key}
                className={`phar-filter-btn ${activeFilter === f.key ? "active" : ""}`}
                onClick={() => handleFilterChange(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* 통계 카드 */}
          <div className="phar-stat-row">
            {STAT_ITEMS.map((s, i) => (
              <div key={i} className="phar-stat-card">
                <div className="phar-stat-icon">
                  <FontAwesomeIcon icon={s.icon} />
                </div>
                <div>
                  <p className="phar-stat-value">{s.value}</p>
                  <p className="phar-stat-label">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 본문 ── */}
      <section className="phar-body">
        <div className="phar-container phar-body-grid">
          {/* 지도 */}
          <aside className="phar-map-col">
            <div className="phar-map-card">
              <div className="phar-map-header">
                <FontAwesomeIcon icon={faMapLocationDot} />
                지도
              </div>
              <div className="phar-map-placeholder">
                <div className="phar-map-ring phar-map-ring1" />
                <div className="phar-map-ring phar-map-ring2" />
                <FontAwesomeIcon
                  icon={faMapLocationDot}
                  className="phar-map-center-icon"
                />
                <p>지도 서비스 준비 중</p>
                <span>검색 결과를 지도에서 확인하세요</span>
              </div>
            </div>
          </aside>

          {/* 결과 목록 */}
          <div className="phar-result-col">
            {/* 결과 헤더 */}
            <div className="phar-result-header">
              <div className="phar-result-count">
                <strong>{filtered.length}</strong>개의 약국을 찾았어요
                {searchTerm && (
                  <span className="phar-result-keyword">
                    "{searchTerm}" 검색 결과
                  </span>
                )}
              </div>
              <span className="phar-result-sort">거리순</span>
            </div>

            {/* 로딩 */}
            {isLoading && (
              <div className="phar-loading-box">
                <div className="phar-spinner" />
                <p>약국 정보를 불러오는 중...</p>
              </div>
            )}

            {/* 결과 없음 */}
            {!isLoading && filtered.length === 0 && (
              <div className="phar-empty-box">
                <FontAwesomeIcon icon={faPills} className="phar-empty-icon" />
                <p className="phar-empty-title">검색 결과가 없어요</p>
                <p className="phar-empty-desc">
                  검색어나 필터 조건을 변경해 보세요
                </p>
              </div>
            )}

            {/* 카드 그리드 */}
            {!isLoading && filtered.length > 0 && (
              <div className="phar-card-grid">
                {paged.map((p) => (
                  <PharmacyCard key={p.id} data={p} />
                ))}
              </div>
            )}

            {/* 페이지네이션 */}
            {!isLoading && totalPages > 1 && (
              <div className="phar-pagination">
                <button
                  className="phar-page-btn"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <FontAwesomeIcon icon={faAngleDoubleLeft} />
                </button>
                <button
                  className="phar-page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <FontAwesomeIcon icon={faAngleLeft} />
                </button>
                {getPageNumbers().map((n) => (
                  <button
                    key={n}
                    className={`phar-page-btn ${currentPage === n ? "active" : ""}`}
                    onClick={() => setCurrentPage(n)}
                  >
                    {n}
                  </button>
                ))}
                <button
                  className="phar-page-btn"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <FontAwesomeIcon icon={faAngleRight} />
                </button>
                <button
                  className="phar-page-btn"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <FontAwesomeIcon icon={faAngleDoubleRight} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 지역 선택 모달 */}
      {showRegionModal && (
        <RegionSelectModal
          onSelect={handleRegionSelect}
          onClose={() => setShowRegionModal(false)}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   약국 카드 — 병원 카드(hdc) 구조 동일 적용
   DUMMY_PHARMACIES 필드명에 맞게 정규화
───────────────────────────────────────── */
function PharmacyCard({ data: p }) {
  const [bookmarked, setBookmarked] = React.useState(false);

  // ── 필드 정규화 (DUMMY_PHARMACIES 구조 대응) ──
  const isOpen = p.status === "open";
  const is24h = p.is24h ?? false;
  const isNight = p.isNight ?? false;
  const isSunday = p.isSunday ?? false;

  // 영업시간 문자열 조합
  const hours =
    p.weekdayOpen && p.weekdayClose
      ? `평일 ${p.weekdayOpen} ~ ${p.weekdayClose}${
          p.saturdayOpen ? `  ·  토 ${p.saturdayOpen} ~ ${p.saturdayClose}` : ""
        }`
      : "";

  // ── 별점 렌더 (약국은 rating 없으므로 기본값 표시 안 함) ──
  const renderStars = (score) => {
    const full = Math.floor(score);
    const half = score - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <>
        {"★".repeat(full)}
        {half && <span className="hdc__star--half">★</span>}
        {"☆".repeat(empty)}
      </>
    );
  };

  return (
    <article className={`hdc ${isOpen ? "hdc--open" : "hdc--closed"}`}>
      <button
        className={`hdc__bookmark ${bookmarked ? "hdc__bookmark--on" : ""}`}
        onClick={() => setBookmarked((b) => !b)}
        aria-label="북마크"
      >
        <i className={bookmarked ? "fas fa-bookmark" : "far fa-bookmark"} />
      </button>

      {/* ── 상단 배지 줄 — 항상 3개 렌더링, 해당 없으면 --off로 회색 표시 ── */}
      <div className="hdc__badges">
        <span
          className={`hdc__badge hdc__badge--24h${!is24h ? " hdc__badge--off" : ""}`}
        >
          <i className="fas fa-clock" /> 24시간
        </span>
        <span
          className={`hdc__badge hdc__badge--night${!isNight ? " hdc__badge--off" : ""}`}
        >
          <i className="fas fa-moon" /> 야간
        </span>
        <span
          className={`hdc__badge hdc__badge--sunday${!isSunday ? " hdc__badge--off" : ""}`}
        >
          <i className="fas fa-calendar-day" /> 일요일
        </span>
      </div>

      {/* ── 메인 콘텐츠 ── */}
      <div className="hdc__body">
        {/* 왼쪽: 약국 아이콘 + 영업 상태 */}
        <div className="hdc__icon-wrap">
          <div className="hdc__icon">
            {/* 약국 아이콘 (병원과 구분) */}
            <i className="fas fa-prescription-bottle-alt" />
          </div>
          <span
            className={`hdc__status ${isOpen ? "hdc__status--open" : "hdc__status--closed"}`}
          >
            {isOpen ? "영업중" : "영업종료"}
          </span>
        </div>

        {/* 오른쪽: 상세 정보 */}
        <div className="hdc__info">
          {/* 약국명 */}
          <div className="hdc__title-row">
            <h3 className="hdc__name">{p.name}</h3>
          </div>

          {/* 유형 · 거리 */}
          <div className="hdc__meta">
            <span className="hdc__type">약국</span>
            <span className="hdc__dot">·</span>
            {p.distanceKm ? (
              <span className="hdc__distance">
                <i className="fas fa-location-dot" />
                {p.distanceKm}km
              </span>
            ) : (
              <span className="hdc__distance" style={{ color: "#94a3b8" }}>
                거리 미확인
              </span>
            )}
          </div>

          {/* 별점 — 약국 데이터에 rating이 있을 때만 표시 */}
          {p.rating != null && (
            <div className="hdc__rating">
              <span className="hdc__stars">{renderStars(p.rating)}</span>
              <span className="hdc__score">{p.rating.toFixed(1)}</span>
              {p.reviews != null && (
                <span className="hdc__review-cnt">({p.reviews}개 리뷰)</span>
              )}
            </div>
          )}

          {/* 주소 */}
          <p className="hdc__addr">
            <i className="fas fa-map-marker-alt" />
            {p.addr}
          </p>

          {/* 전화번호 */}
          {p.phone && (
            <p className="hdc__phone">
              <i className="fas fa-phone" />
              <a href={`tel:${p.phone}`}>{p.phone}</a>
            </p>
          )}

          {/* 영업시간 */}
          {hours && (
            <p className="hdc__hours">
              <i className="fas fa-business-time" />
              {hours}
            </p>
          )}
        </div>
      </div>

      {/* ── 하단 액션 버튼 ── */}
      <div className="hdc__actions">
        <button className="hdc__btn hdc__btn--ghost">
          <i className="fas fa-map" /> 길찾기
        </button>
        <button
          className="hdc__btn hdc__btn--ghost"
          onClick={() => window.open(`tel:${p.phone}`)}
        >
          <i className="fas fa-phone-volume" /> 전화
        </button>
        <button className="hdc__btn hdc__btn--ghost">
          <i className="fas fa-star" /> 리뷰
        </button>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────
   지역 선택 모달 (간이)
───────────────────────────────────────── */
const REGIONS = [
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "광주",
  "대전",
  "울산",
  "세종",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
];

function RegionSelectModal({ onSelect, onClose }) {
  return (
    <div className="phar-modal-overlay" onClick={onClose}>
      <div className="phar-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="phar-modal-header">
          <h4>지역 선택</h4>
          <button className="phar-modal-close" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div className="phar-modal-grid">
          {REGIONS.map((r) => (
            <button
              key={r}
              className="phar-modal-region-btn"
              onClick={() => onSelect({ label: r })}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
