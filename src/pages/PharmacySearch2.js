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

// ── 더미 약국 데이터 (위도/경도 포함) ──
const DUMMY_PHARMACIES = [
  {
    id: 1,
    name: "한빛약국",
    addr: "서울 강남구 테헤란로 11111111111111111111111111111112222222222222222222222222222",
    phone: "02-123-4567",
    photo: "",
    openTime: "09:00",
    closeTime: "21:00",
    isNight: false,
    isHoliday: false,
    lat: 37.501,
    lng: 127.039,
  },
  {
    id: 2,
    name: "굿모닝약국",
    addr: "서울 강남구 테헤란로 2",
    phone: "02-234-5678",
    photo: "",
    openTime: "08:00",
    closeTime: "23:00",
    isNight: true,
    isHoliday: false,
    lat: 37.502,
    lng: 127.038,
  },
  {
    id: 3,
    name: "별빛약국",
    addr: "서울 송파구 올림픽로 5",
    phone: "02-345-6789",
    photo: "",
    openTime: "10:00",
    closeTime: "20:00",
    isNight: false,
    isHoliday: true,
    lat: 37.515,
    lng: 127.107,
  },
  {
    id: 4,
    name: "참좋은약국",
    addr: "서울 송파구 올림픽로 10",
    phone: "02-456-7890",
    photo: "",
    openTime: "09:30",
    closeTime: "22:30",
    isNight: true,
    isHoliday: false,
    lat: 37.516,
    lng: 127.106,
  },
  {
    id: 5,
    name: "해피약국",
    addr: "서울 강서구 화곡로 3",
    phone: "02-567-8901",
    photo: "",
    openTime: "09:00",
    closeTime: "21:00",
    isNight: false,
    isHoliday: false,
    lat: 37.551,
    lng: 126.854,
  },
  {
    id: 6,
    name: "푸른약국",
    addr: "서울 강서구 화곡로 5",
    phone: "02-678-9012",
    photo: "",
    openTime: "08:30",
    closeTime: "20:30",
    isNight: true,
    isHoliday: false,
    lat: 37.553,
    lng: 126.856,
  },
  {
    id: 7,
    name: "빛나는약국",
    addr: "서울 마포구 월드컵로 15",
    phone: "02-789-0123",
    photo: "",
    openTime: "10:00",
    closeTime: "22:00",
    isNight: false,
    isHoliday: true,
    lat: 37.565,
    lng: 126.9,
  },
  {
    id: 8,
    name: "행복약국",
    addr: "서울 마포구 월드컵로 20",
    phone: "02-890-1234",
    photo: "",
    openTime: "09:00",
    closeTime: "21:00",
    isNight: false,
    isHoliday: false,
    lat: 37.566,
    lng: 126.902,
  },
  {
    id: 9,
    name: "신나는약국",
    addr: "서울 용산구 한강대로 1",
    phone: "02-901-2345",
    photo: "",
    openTime: "07:00",
    closeTime: "23:00",
    isNight: true,
    isHoliday: false,
    lat: 37.532,
    lng: 126.99,
  },
  {
    id: 10,
    name: "우리약국",
    addr: "서울 용산구 한강대로 5",
    phone: "02-012-3456",
    photo: "",
    openTime: "09:00",
    closeTime: "21:00",
    isNight: false,
    isHoliday: true,
    lat: 37.533,
    lng: 126.992,
  },
];

// ── 유틸 ──
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

// ── 거리 계산 ──
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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
  const [userPos, setUserPos] = useState(null);
  const PAGE_SIZE = 9;

  // ── 현재 진료중 여부 ──
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

  // ── 사용자 위치 가져오기 ──
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.warn("위치 정보 사용 불가"),
      );
    }
  }, []);

  // ── 더미 데이터 로딩 ──
  useEffect(() => {
    setLoading(true);
    setError("");
    setTimeout(() => {
      setPharmacies(DUMMY_PHARMACIES);
      setLoading(false);
    }, 300);
  }, []);

  // ── 거리 계산 포함한 약국 배열 ──
  const pharmaciesWithDistance = useMemo(() => {
    if (!userPos) return pharmacies;
    return pharmacies.map((p) => {
      if (p.lat && p.lng) {
        const dist = getDistanceKm(userPos.lat, userPos.lng, p.lat, p.lng);
        return { ...p, distanceKm: dist.toFixed(1) };
      }
      return { ...p, distanceKm: null };
    });
  }, [pharmacies, userPos]);

  // ── 필터, 검색, 지역 적용 ──
  const filteredPharmacies = useMemo(() => {
    let result = pharmaciesWithDistance;
    if (activeFilter === "진료중")
      result = result.filter((p) => isOpenNow(p.openTime, p.closeTime));
    else if (activeFilter === "야간진료")
      result = result.filter((p) => p.isNight);
    else if (activeFilter === "공휴일")
      result = result.filter((p) => p.isHoliday);

    const keyword = searchTerm.trim();
    if (keyword)
      result = result.filter(
        (p) => p.name.includes(keyword) || p.addr.includes(keyword),
      );
    result = result.filter((p) => matchRegionByAddr(p.addr, region));
    return result;
  }, [pharmaciesWithDistance, activeFilter, searchTerm, region, isOpenNow]);

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
    [],
  );

  const PAGE_GROUP = 5;
  const currentGroupStart =
    Math.floor((page - 1) / PAGE_GROUP) * PAGE_GROUP + 1;
  const currentGroupEnd = Math.min(
    totalPages,
    currentGroupStart + PAGE_GROUP - 1,
  );
  const pageNumbers = useMemo(() => {
    const numbers = [];
    for (let i = currentGroupStart; i <= currentGroupEnd; i++) numbers.push(i);
    return numbers;
  }, [currentGroupStart, currentGroupEnd]);

  const FILTERS = [
    { key: "전체", icon: null, label: "전체" },
    { key: "진료중", icon: faSun, label: "진료중" },
    { key: "야간진료", icon: faMoon, label: "야간진료" },
    { key: "공휴일", icon: faCalendarDay, label: "공휴일 운영" },
  ];

  return (
    <div className="phar-page">
      {/* Hero, 검색창, 필터, 스탯 */}
      <section className="phar-hero">
        <div className="phar-hero-blob phar-blob1" />
        <div className="phar-hero-blob phar-blob2" />
        <div className="phar-container">
          <div className="phar-hero-inner">
            <h1 className="phar-hero-title">
              내 주변 약국을
              <br />
              <span className="phar-gradient-text">빠르게 찾아보세요</span>
            </h1>
            <p className="phar-hero-desc">
              야간·공휴일 운영 약국까지 실시간으로 확인하고
              <br />
              위치·영업시간을 한눈에 파악하세요
            </p>

            <div className="phar-hero-search">
              <button
                className="phar-region-btn"
                onClick={() => setIsRegionOpen(true)}
              >
                <FontAwesomeIcon icon={faLocationDot} />{" "}
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
                <FontAwesomeIcon icon={faMagnifyingGlass} /> 검색하기
              </button>
            </div>

            <div className="phar-filter-row">
              <FontAwesomeIcon
                icon={faFilter}
                className="phar-filter-label-icon"
              />
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  className={`phar-filter-btn ${activeFilter === f.key ? "active" : ""}`}
                  onClick={() => handleFilterChange(f.key)}
                >
                  {f.icon && <FontAwesomeIcon icon={f.icon} />} {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="phar-hero-stats">
            <div className="phar-stat-item">
              <div className="phar-stat-icon" style={{ background: "#14b8a6" }}>
                <FontAwesomeIcon icon={faPills} />
              </div>
              <div>
                <div className="phar-stat-num">{totalCount}</div>
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

      {/* 본문 */}
      <section className="phar-body">
        <div className="phar-container">
          <div className="phar-layout">
            <div className="phar-map-col">
              <div className="phar-map-card">
                <div className="phar-map-header">
                  <span className="phar-map-title">
                    <FontAwesomeIcon icon={faMapLocationDot} /> 주변 약국 지도
                  </span>
                  <span className="phar-map-count">{totalCount}개 약국</span>
                </div>
                <div className="phar-map-area">
                  <div className="phar-map-placeholder">
                    <div className="phar-map-pulse" />
                    <FontAwesomeIcon
                      icon={faMapLocationDot}
                      className="phar-map-ico"
                    />
                    <span className="phar-map-txt">지도 로딩 중...</span>
                    <span className="phar-map-sub">
                      위치 기반 약국 정보를 불러오는 중입니다
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="phar-result-col">
              <div className="phar-result-header">
                <div className="phar-result-title-wrap">
                  <h2 className="phar-result-title">약국 목록</h2>
                  <span className="phar-result-badge">총 {totalCount}건</span>
                </div>
                <span className="phar-page-info">
                  {page} / {totalPages} 페이지
                </span>
              </div>

              {loading && (
                <div className="phar-state-box">
                  <div className="phar-spinner" />
                  약국 정보를 불러오는 중...
                </div>
              )}
              {error && (
                <div className="phar-state-box phar-state-error">
                  ⚠️ {error}
                </div>
              )}

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
                                  <button className="phar-btn-map">
                                    <FontAwesomeIcon icon={faLocationDot} />
                                  </button>
                                </div>
                                <p className="phar-card-addr">
                                  <FontAwesomeIcon icon={faLocationDot} />{" "}
                                  {/* 지도 아이콘 먼저 */}
                                  {p.distanceKm && (
                                    <span className="phar-card-distance">
                                      {p.distanceKm}km
                                    </span>
                                  )}{" "}
                                  {/* 거리 */}
                                  <span className="phar-card-addr-text">
                                    {p.addr}
                                  </span>{" "}
                                  {/* 주소 */}
                                </p>
                              </div>
                            </div>
                            <div className="phar-card-info-grid">
                              <div className="phar-info-item">
                                <FontAwesomeIcon
                                  icon={faPhone}
                                  className="phar-info-icon"
                                />
                                <span>{p.phone}</span>
                              </div>
                              <div className="phar-info-item">
                                <FontAwesomeIcon
                                  icon={faClock}
                                  className="phar-info-icon"
                                />
                                <span>{timeText(p.openTime, p.closeTime)}</span>
                              </div>
                            </div>
                            <div className="phar-card-footer">
                              {open !== null && (
                                <span
                                  className={`phar-badge ${open ? "open" : "closed"}`}
                                >
                                  {open ? "진료중" : "진료종료"}
                                </span>
                              )}
                              {p.isNight && (
                                <span className="phar-badge night">
                                  <FontAwesomeIcon icon={faMoon} /> 야간
                                </span>
                              )}
                              {p.isHoliday && (
                                <span className="phar-badge holiday">
                                  <FontAwesomeIcon icon={faCalendarDay} />{" "}
                                  공휴일
                                </span>
                              )}
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
