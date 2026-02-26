import { useEffect, useMemo, useState, useCallback } from "react";
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
      !searchTerm ||
      p.name.includes(searchTerm) ||
      p.addr.includes(searchTerm);
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
    currentPage * PAGE_SIZE
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
              <FontAwesomeIcon icon={faChevronDown} className="phar-region-arrow" />
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
   약국 카드
───────────────────────────────────────── */
function PharmacyCard({ data: p }) {
  return (
    <div className="phar-card">
      {/* 썸네일 */}
      <div className="phar-card-thumb">
        {p.thumbnail ? (
          <img src={p.thumbnail} alt={p.name} />
        ) : (
          <div className="phar-card-thumb-placeholder">
            <FontAwesomeIcon icon={faPills} />
          </div>
        )}
        {/* 영업 상태 배지 */}
        <span className={`phar-status-badge ${p.status === "open" ? "open" : "closed"}`}>
          {p.status === "open" && <span className="phar-status-dot" />}
          {p.status === "open" ? "영업중" : "영업종료"}
        </span>
      </div>

      {/* 내용 */}
      <div className="phar-card-body">
        {/* 이름 + 지도 버튼 */}
        <div className="phar-card-name-row">
          <h3 className="phar-card-name">{p.name}</h3>
          <button className="phar-map-btn" title="지도에서 보기">
            <FontAwesomeIcon icon={faMapLocationDot} />
          </button>
        </div>

        {/* 거리 + 주소 */}
        <div className="phar-card-addr-wrap">
          <span className={`phar-dist-chip ${!p.distanceKm ? "unknown" : ""}`}>
            <FontAwesomeIcon icon={faLocationDot} />
            {p.distanceKm ? `${p.distanceKm}km` : "거리 미확인"}
          </span>
          <p className="phar-card-addr">{p.addr}</p>
        </div>

        {/* 전화번호 */}
        <p className="phar-card-phone">
          <FontAwesomeIcon icon={faPhone} />
          {p.phone}
        </p>

        {/* 운영 시간 */}
        <p className="phar-card-hours">
          <FontAwesomeIcon icon={faClock} />
          평일 {p.weekdayOpen} ~ {p.weekdayClose}
          {p.saturdayOpen && (
            <span className="phar-card-hours-sat">
              &nbsp;· 토 {p.saturdayOpen} ~ {p.saturdayClose}
            </span>
          )}
        </p>

        {/* 태그 + 상세 버튼 */}
        <div className="phar-card-footer">
          <div className="phar-card-tags">
            {p.is24h && <span className="phar-tag tag-24h">24시간</span>}
            {p.isNight && !p.is24h && (
              <span className="phar-tag tag-night">
                <FontAwesomeIcon icon={faMoon} />
                야간
              </span>
            )}
            {p.isSunday && (
              <span className="phar-tag tag-sunday">
                <FontAwesomeIcon icon={faCalendarDay} />
                일요일
              </span>
            )}
          </div>
          <button className="phar-detail-btn">
            상세보기
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   지역 선택 모달 (간이)
───────────────────────────────────────── */
const REGIONS = [
  "서울", "경기", "인천", "부산", "대구",
  "광주", "대전", "울산", "세종", "강원",
  "충북", "충남", "전북", "전남", "경북",
  "경남", "제주",
];

function RegionSelectModal({ onSelect, onClose }) {
  return (
    <div className="phar-modal-overlay" onClick={onClose}>
      <div
        className="phar-modal-box"
        onClick={(e) => e.stopPropagation()}
      >
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
