import { useEffect, useMemo, useState, useCallback } from "react";
import RegionSelect from "../components/RegionSelect";
import "../assets/styles/PharmacySearch.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faMagnifyingGlass,
  faSun,
  faMoon,
  faCalendarDay,
  faPhone,
  faClock,
  faAngleDoubleLeft,
  faAngleLeft,
  faAngleRight,
  faAngleDoubleRight,
  faPills,
  faLocationDot,
  faFilter,
  faMapLocationDot,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

const ynToBool = (v) => {
  if (v === true || v === false) return v;
  if (v === 1 || v === 0) return Boolean(v);
  if (v == null) return null;
  const s = String(v).trim().toUpperCase();
  if (["Y", "YES", "TRUE", "T", "1"].includes(s)) return true;
  if (["N", "NO", "FALSE", "F", "0"].includes(s)) return false;
  return null;
};

const normalizeSidoToken = (name) => {
  if (!name) return "";
  return name
    .replace("특별자치시", "")
    .replace("특별자치도", "")
    .replace("특별시", "")
    .replace("광역시", "")
    .replace("자치도", "")
    .replace("도", "")
    .trim();
};

const matchRegionByAddr = (addr, regionPick) => {
  if (!regionPick) return true;
  const a = String(addr || "");
  const { sido, sigungu, emd } = regionPick;
  if (sido?.name) {
    const token = normalizeSidoToken(sido.name);
    if (token && !a.includes(token)) return false;
  }
  if (sigungu?.name && !a.includes(sigungu.name)) return false;
  if (emd?.name && !a.includes(emd.name)) return false;
  return true;
};

async function fetchPharmacies() {
  const res = await fetch(`${API_BASE_URL}/api/v1/pharmacy/cards`);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `약국 목록 조회 실패 (status: ${res.status})\n${txt.slice(0, 120)}`
    );
  }
  return res.json();
}

export default function HoAndPhar() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("전체");

  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [region, setRegion] = useState({
    level: "",
    sido: null,
    sigungu: null,
    emd: null,
  });

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;

  const isOpenNow = useCallback((openTime, closeTime) => {
    if (!openTime || !closeTime) return null;
    const now = new Date();
    const [oh, om] = String(openTime).split(":").map(Number);
    const [ch, cm] = String(closeTime).split(":").map(Number);
    if ([oh, om, ch, cm].some(isNaN)) return null;
    const open = new Date(now);
    open.setHours(oh, om, 0, 0);
    const close = new Date(now);
    close.setHours(ch, cm, 0, 0);
    if (close < open) close.setDate(close.getDate() + 1);
    return now >= open && now <= close;
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchPharmacies();
        const list = Array.isArray(data) ? data : data?.content ?? [];
        const mapped = list.map((r, idx) => ({
          id: r.ph_num ?? idx + 1,
          name: r.ph_name ?? "약국명",
          addr: r.ph_addr ?? "",
          phone: r.ph_phone ?? "",
          photo: r.ph_photo ?? "",
          openTime: r.phh_open_time ?? null,
          closeTime: r.phh_close_time ?? null,
          isNight: ynToBool(r.ph_night_yn),
          isHoliday: ynToBool(r.ph_holiday_yn),
        }));
        if (!ignore) {
          setPharmacies(mapped);
          setPage(1);
        }
      } catch (e) {
        if (!ignore) {
          setPharmacies([]);
          setError(e?.message || "에러 발생");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, []);

  const filteredPharmacies = useMemo(() => {
    let result = pharmacies;
    if (activeFilter === "진료중")
      result = result.filter((p) => isOpenNow(p.openTime, p.closeTime));
    else if (activeFilter === "야간진료")
      result = result.filter((p) => p.isNight);
    else if (activeFilter === "공휴일")
      result = result.filter((p) => p.isHoliday);

    const keyword = searchTerm.trim();
    if (keyword)
      result = result.filter(
        (p) => p.name.includes(keyword) || p.addr.includes(keyword)
      );
    result = result.filter((p) => matchRegionByAddr(p.addr, region));
    return result;
  }, [pharmacies, activeFilter, searchTerm, region, isOpenNow]);

  const totalCount = filteredPharmacies.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pagedPharmacies = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredPharmacies.slice(start, start + PAGE_SIZE);
  }, [filteredPharmacies, page]);

  const regionLabel = useMemo(() => {
    const parts = [
      region?.sido?.name,
      region?.sigungu?.name,
      region?.emd?.name,
    ].filter(Boolean);
    return parts.length ? parts.join(" ") : "지역 선택";
  }, [region]);

  const handleFilterChange = useCallback((type) => {
    setActiveFilter(type);
    setPage(1);
  }, []);
  const handleSearch = useCallback(() => setPage(1), []);
  const handleRegionConfirm = useCallback((nextRegion) => {
    setRegion(nextRegion);
    setIsRegionOpen(false);
    setPage(1);
  }, []);
  const timeText = useCallback(
    (open, close) =>
      open && close ? `${open} ~ ${close}` : "운영시간 정보 없음",
    []
  );

  const PAGE_GROUP = 5;
  const currentGroupStart =
    Math.floor((page - 1) / PAGE_GROUP) * PAGE_GROUP + 1;
  const currentGroupEnd = Math.min(totalPages, currentGroupStart + PAGE_GROUP - 1);
  const pageNumbers = useMemo(() => {
    const numbers = [];
    for (let i = currentGroupStart; i <= currentGroupEnd; i++) numbers.push(i);
    return numbers;
  }, [currentGroupStart, currentGroupEnd]);

  const FILTERS = [
    { key: "전체",   icon: null,          label: "전체" },
    { key: "진료중", icon: faSun,         label: "진료중" },
    { key: "야간진료", icon: faMoon,      label: "야간진료" },
    { key: "공휴일", icon: faCalendarDay, label: "공휴일 운영" },
  ];

  return (
    <div className="phar-page">

      {/* ── Hero Banner ── */}
      <section className="phar-hero">
        <div className="phar-hero-blob phar-blob1" />
        <div className="phar-hero-blob phar-blob2" />
        <div className="phar-container">
          <div className="phar-hero-inner">
            <h1 className="phar-hero-title">
              내 주변 약국을<br />
              <span className="phar-gradient-text">빠르게 찾아보세요</span>
            </h1>
            <p className="phar-hero-desc">
              야간·공휴일 운영 약국까지 실시간으로 확인하고<br />
              위치·영업시간을 한눈에 파악하세요
            </p>
            {/* 히어로 내 검색창 */}
            <div className="phar-hero-search">
              <button
                className="phar-region-btn"
                onClick={() => setIsRegionOpen(true)}
              >
                <FontAwesomeIcon icon={faLocationDot} />
                <span>{regionLabel}</span>
              </button>
              <div className="phar-search-divider" />
              <input
                className="phar-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="약국명 또는 주소를 검색하세요"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button className="phar-search-btn" onClick={handleSearch}>
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                검색하기
              </button>
            </div>
            {/* 필터 탭 */}
            <div className="phar-filter-row">
              <FontAwesomeIcon icon={faFilter} className="phar-filter-label-icon" />
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  className={`phar-filter-btn ${activeFilter === f.key ? "active" : ""}`}
                  onClick={() => handleFilterChange(f.key)}
                >
                  {f.icon && <FontAwesomeIcon icon={f.icon} />}
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* 히어로 우측 스탯 */}
          <div className="phar-hero-stats">
            <div className="phar-stat-item">
              <div className="phar-stat-icon" style={{ background: "#14b8a6" }}>
                <FontAwesomeIcon icon={faPills} />
              </div>
              <div>
                <div className="phar-stat-num">{totalCount.toLocaleString()}</div>
                <div className="phar-stat-lbl">검색 결과</div>
              </div>
            </div>
            <div className="phar-stat-item">
              <div className="phar-stat-icon" style={{ background: "#0d9488" }}>
                <FontAwesomeIcon icon={faMoon} />
              </div>
              <div>
                <div className="phar-stat-num">
                  {pharmacies.filter((p) => p.isNight).length}
                </div>
                <div className="phar-stat-lbl">야간 운영</div>
              </div>
            </div>
            <div className="phar-stat-item">
              <div className="phar-stat-icon" style={{ background: "#0f766e" }}>
                <FontAwesomeIcon icon={faCalendarDay} />
              </div>
              <div>
                <div className="phar-stat-num">
                  {pharmacies.filter((p) => p.isHoliday).length}
                </div>
                <div className="phar-stat-lbl">공휴일 운영</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 본문 ── */}
      <section className="phar-body">
        <div className="phar-container">
          <div className="phar-layout">

            {/* 좌: 지도 */}
            <div className="phar-map-col">
              <div className="phar-map-card">
                <div className="phar-map-header">
                  <span className="phar-map-title">
                    <FontAwesomeIcon icon={faMapLocationDot} />
                    주변 약국 지도
                  </span>
                  <span className="phar-map-count">
                    {totalCount}개 약국
                  </span>
                </div>
                <div className="phar-map-area">
                  <div className="phar-map-placeholder">
                    <div className="phar-map-pulse" />
                    <FontAwesomeIcon icon={faMapLocationDot} className="phar-map-ico" />
                    <span className="phar-map-txt">지도 로딩 중...</span>
                    <span className="phar-map-sub">위치 기반 약국 정보를 불러오는 중입니다</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 우: 결과 목록 */}
            <div className="phar-result-col">
              {/* 결과 헤더 */}
              <div className="phar-result-header">
                <div className="phar-result-title-wrap">
                  <h2 className="phar-result-title">약국 목록</h2>
                  <span className="phar-result-badge">
                    총 {totalCount}건
                  </span>
                </div>
                <span className="phar-page-info">
                  {page} / {totalPages} 페이지
                </span>
              </div>

              {/* 로딩 */}
              {loading && (
                <div className="phar-state-box">
                  <div className="phar-spinner" />
                  <p>약국 정보를 불러오는 중...</p>
                </div>
              )}

              {/* 에러 */}
              {error && (
                <div className="phar-state-box phar-state-error">
                  <p>⚠️ {error}</p>
                </div>
              )}

              {/* 카드 목록 */}
              {!loading && !error && (
                <>
                  {pagedPharmacies.length > 0 ? (
                    <div className="phar-card-grid">
                      {pagedPharmacies.map((p, idx) => {
                        const open = isOpenNow(p.openTime, p.closeTime);
                        return (
                          <article
                            className="phar-card"
                            key={p.id}
                            style={{ animationDelay: `${idx * 0.06}s` }}
                          >
                            {/* 상단 헤더 */}
                            <div className="phar-card-head">
                              <div className="phar-card-thumb">
                                {p.photo ? (
                                  <img
                                    src={p.photo}
                                    alt={`${p.name} 썸네일`}
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="phar-no-img">
                                    <FontAwesomeIcon icon={faPills} />
                                  </div>
                                )}
                              </div>
                              <div className="phar-card-meta">
                                <div className="phar-card-name-row">
                                  <h3 className="phar-card-name">{p.name}</h3>
                                  {open !== null && (
                                    <span
                                      className={`phar-open-tag ${open ? "open" : "closed"}`}
                                    >
                                      {open ? "진료중" : "진료종료"}
                                    </span>
                                  )}
                                </div>
                                <div className="phar-badge-row">
                                  {p.isNight && (
                                    <span className="phar-badge night">
                                      <FontAwesomeIcon icon={faMoon} /> 야간
                                    </span>
                                  )}
                                  {p.isHoliday && (
                                    <span className="phar-badge holiday">
                                      <FontAwesomeIcon icon={faCalendarDay} /> 공휴일
                                    </span>
                                  )}
                                </div>
                                <p className="phar-card-addr">
                                  <FontAwesomeIcon icon={faLocationDot} />
                                  {p.addr || "주소 정보 없음"}
                                </p>
                              </div>
                            </div>

                            {/* 정보 행 */}
                            <div className="phar-card-info-grid">
                              <div className="phar-info-item">
                                <FontAwesomeIcon
                                  icon={faPhone}
                                  className="phar-info-icon"
                                />
                                <span>{p.phone || "전화번호 없음"}</span>
                              </div>
                              <div className="phar-info-item">
                                <FontAwesomeIcon
                                  icon={faClock}
                                  className="phar-info-icon"
                                />
                                <span>{timeText(p.openTime, p.closeTime)}</span>
                              </div>
                            </div>

                            {/* 푸터 */}
                            <div className="phar-card-footer">
                              <button className="phar-btn-detail">
                                상세보기
                                <FontAwesomeIcon icon={faArrowRight} />
                              </button>
                              <button className="phar-btn-map">
                                <FontAwesomeIcon icon={faLocationDot} />
                                지도보기
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="phar-empty">
                      <div className="phar-empty-icon">
                        <FontAwesomeIcon icon={faPills} />
                      </div>
                      <h3>검색 결과가 없습니다</h3>
                      <p>다른 검색어나 필터 조건을 시도해보세요</p>
                    </div>
                  )}

                  {/* 페이지네이션 */}
                  {totalCount > 0 && (
                    <nav className="phar-pagination">
                      {currentGroupStart > 1 && (
                        <>
                          <button
                            className="phar-page-btn"
                            onClick={() => setPage(1)}
                          >
                            <FontAwesomeIcon icon={faAngleDoubleLeft} />
                          </button>
                          <button
                            className="phar-page-btn"
                            onClick={() =>
                              setPage((prev) => Math.max(1, prev - 1))
                            }
                          >
                            <FontAwesomeIcon icon={faAngleLeft} />
                          </button>
                        </>
                      )}
                      <div className="phar-page-nums">
                        {pageNumbers.map((n) => (
                          <button
                            key={n}
                            className={`phar-page-num ${n === page ? "active" : ""}`}
                            onClick={() => setPage(n)}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      {currentGroupEnd < totalPages && (
                        <>
                          <button
                            className="phar-page-btn"
                            onClick={() =>
                              setPage((prev) => Math.min(totalPages, prev + 1))
                            }
                          >
                            <FontAwesomeIcon icon={faAngleRight} />
                          </button>
                          <button
                            className="phar-page-btn"
                            onClick={() => setPage(totalPages)}
                          >
                            <FontAwesomeIcon icon={faAngleDoubleRight} />
                          </button>
                        </>
                      )}
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <RegionSelect
        isOpen={isRegionOpen}
        onClose={() => setIsRegionOpen(false)}
        onConfirm={handleRegionConfirm}
      />
    </div>
  );
}
