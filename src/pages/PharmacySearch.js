import { useEffect, useMemo, useState, useRef } from "react";
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
  faXmark,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

const PAGE_SIZE = 6;

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 }; // 서울시청

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

export default function PharmacySearch() {
  const [pharmacies, setPharmacies] = useState([]);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [regionQuery, setRegionQuery] = useState(""); // 주소 필터
  const [regionLabel, setRegionLabel] = useState("지역 선택");
  const [showRegionModal, setShowRegionModal] = useState(false);

    // 내 위치
  const [myPos, setMyPos] = useState(DEFAULT_CENTER); // 기본값 서울시청
  const [locError, setLocError] = useState(null);

  // ✅ 카카오맵 ref
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const toHHMM = (t) => {
    if (!t) return null;
    const s = String(t).trim();

    if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s.slice(0, 5);
    if (/^\d{1,2}:\d{2}$/.test(s)) {
      const [h, m] = s.split(":");
      return `${h.padStart(2, "0")}:${m}`;
    }
    if (/^\d{3,4}$/.test(s)) {
      const padded = s.padStart(4, "0");
      return `${padded.slice(0, 2)}:${padded.slice(2, 4)}`;
    }
    return s;
  };

  const is24Hours = (openHHMM, closeHHMM) => {
    if (!openHHMM || !closeHHMM) return false;
    return (
      openHHMM === "00:00" &&
      (closeHHMM === "23:59" || closeHHMM === "24:00" || closeHHMM === "23:58")
    );
  };


  // 거리계산 함수
  const haversineKm = (lat1, lng1, lat2, lng2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

  // ✅ 1) 약국 리스트 불러오기
  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch("http://localhost:8080/api/v1/pharmacy/cards");
        if (!res.ok) throw new Error(`API 실패: ${res.status}`);

        const data = await res.json();
        console.log("RAW:", data?.[0]);

        const normalized = (Array.isArray(data) ? data : []).map((x) => {
          const openTime = toHHMM(x.phhOpenTime);
          const closeTime = toHHMM(x.phhCloseTime);

          const openYnValue = x.phhOpenYn;
          const status =
            openYnValue === null || openYnValue === undefined
              ? "unknown"
              : openYnValue === 1 || openYnValue === true
              ? "open"
              : "closed";

          const _is24h = is24Hours(openTime, closeTime);

          // ✅ lat/lng (String이면 숫자로 변환)
          const latRaw = x.phLat;
          const lngRaw = x.phLng;
          const lat = latRaw != null ? parseFloat(latRaw) : null;
          const lng = lngRaw != null ? parseFloat(lngRaw) : null;

          return {
            id: x.phNum,
            name: x.phName,
            addr: x.phAddr,
            phone: x.phPhone,
            thumbnail: x.phPhoto || null,

            weekdayOpen: openTime,
            weekdayClose: closeTime,

            is24h: _is24h,
            isNight: x.phNightYn === 1 && !_is24h,
            isSunday: x.phHolidayYn === 1,

            status,

            // ✅ 지도용 좌표
            lat: Number.isFinite(lat) ? lat : null,
            lng: Number.isFinite(lng) ? lng : null,

            distanceKm: null,
            tags: [],
          };
        });

        setPharmacies(normalized);
      } catch (e) {
        console.error(e);
        setError(e.message);
        setPharmacies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPharmacies();
  }, []);

    useEffect(() => {
    if (!navigator.geolocation) {
      setMyPos(DEFAULT_CENTER);
      setLocError("위치 기능을 지원하지 않아 서울시청 기준으로 보여집니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocError(null);
      },
      (err) => {
        // 권한 거부/실패 → 서울시청 기준으로 보여줌
        setMyPos(DEFAULT_CENTER);
        setLocError("위치 권한이 없어 서울시청 기준으로 보여드려요.");
        console.warn("geolocation error:", err);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

    useEffect(() => {
      setCurrentPage(1);
    }, [myPos]);

    useEffect(() => {
    const initMap = () => {
      const container = document.getElementById("kakao-map");
      if (!container) return;

      const center = new window.kakao.maps.LatLng(37.5665, 126.9780); // 서울시청
      const map = new window.kakao.maps.Map(container, { center, level: 5 });

      mapRef.current = map;
    };

    if (window.kakao && window.kakao.maps) {
      // index.html에 autoload=false면 load 필요
      if (window.kakao.maps.load) window.kakao.maps.load(initMap);
      else initMap();
    } else {
      console.error("Kakao SDK not loaded");
    }
  }, []);

 
   // ✅ 카드 "지도에서 보기" 버튼 누르면 해당 약국으로 이동
  const moveToPharmacy = (p) => {
    const map = mapRef.current;
    if (!map || !p?.lat || !p?.lng) 
      return;

    const pos = new window.kakao.maps.LatLng(p.lat, p.lng);
    map.setLevel(3);
    map.panTo(pos);
  };

  const filtered = useMemo(() => {
    return pharmacies.filter((p) => {
      const matchRegion = !regionQuery ? true : (p.addr || "").includes(regionQuery);

      const matchSearch =
        !searchTerm ||
        (p.name || "").includes(searchTerm) ||
        (p.addr || "").includes(searchTerm);

      const matchFilter =
        activeFilter === "all" ||
        (activeFilter === "open" && p.status === "open") ||
        (activeFilter === "night" && p.isNight) ||
        (activeFilter === "24h" && p.is24h) ||
        (activeFilter === "sunday" && p.isSunday);

      return matchRegion && matchSearch && matchFilter;
    });
  }, [pharmacies, regionQuery, searchTerm, activeFilter]);

    const filteredSorted = useMemo(() => {
    const base = filtered.map((p) => {
      if (p.lat == null || p.lng == null) return { ...p, distanceKm: null };
    const d = haversineKm(myPos.lat, myPos.lng, p.lat, p.lng);
      return { ...p, distanceKm: Number(d.toFixed(2)) };
  });

    base.sort((a, b) => {
      if (a.distanceKm == null && b.distanceKm == null) return 0;
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });

  return base;
}, [filtered, myPos]);

    const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));

    const paged = useMemo(() => {
      return filteredSorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    }, [filteredSorted, currentPage]);

   // page 바뀔 때 마커 찍기
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.kakao?.maps) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const withPos = (paged || []).filter(
      (p) =>
        Number.isFinite(p.lat) &&
        Number.isFinite(p.lng) &&
        !(p.lat === 0 && p.lng === 0)
    );

    if (withPos.length === 0) return;

    const bounds = new window.kakao.maps.LatLngBounds();

    withPos.forEach((p) => {
      const pos = new window.kakao.maps.LatLng(p.lat, p.lng);
      const marker = new window.kakao.maps.Marker({ position: pos, map });
      markersRef.current.push(marker);
      bounds.extend(pos);
    });

  // ✅ 페이지 바뀔 때마다 자동으로 마커들 보이게
    map.setBounds(bounds);
  }, [paged]);

  
  const handleSearch = () => {
    setSearchTerm(inputValue);
    setCurrentPage(1);
  };

  const handleFilterChange = (key) => {
    setActiveFilter(key);
    setCurrentPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleRegionConfirm = (payload) => {
    const picked =
      payload?.emd?.name ||
      payload?.sigungu?.name ||
      payload?.sido?.name ||
      payload?.label ||
      "";

    setRegionLabel(picked || "지역 선택");
    setRegionQuery(picked);
    setShowRegionModal(false);
    setCurrentPage(1);
  };

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
            <button className="phar-region-btn" onClick={() => setShowRegionModal(true)}>
              <FontAwesomeIcon icon={faLocationDot} />
              {regionLabel}
              <FontAwesomeIcon icon={faChevronDown} className="phar-region-arrow" />
            </button>

            <div className="phar-search-divider" />

            <div className="phar-search-input-wrap">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="phar-search-icon" />
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
                    setCurrentPage(1);
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

          {locError && <div className="phar-loc-note">{locError}</div>}

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

              {/* ✅ 여기 지도 박힘 */}
              <div id="kakao-map" style={{ width: "100%", height: "400px" }} />
            </div>
          </aside>

          {/* 결과 목록 */}
          <div className="phar-result-col">
            <div className="phar-result-header">
              <div className="phar-result-count">
                <strong>{filteredSorted.length}</strong>개의 약국을 찾았어요
                {searchTerm && (
                  <span className="phar-result-keyword">"{searchTerm}" 검색 결과</span>
                )}
              </div>
              <span className="phar-result-sort">거리순</span>
            </div>

            {isLoading && (
              <div className="phar-loading-box">
                <div className="phar-spinner" />
                <p>약국 정보를 불러오는 중...</p>
              </div>
            )}

            {!isLoading && error && (
              <div className="phar-empty-box">
                <p className="phar-empty-title">약국 정보를 불러오지 못했어요</p>
                <p className="phar-empty-desc">{error}</p>
              </div>
            )}

            {!isLoading && filtered.length === 0 && (
              <div className="phar-empty-box">
                <FontAwesomeIcon icon={faPills} className="phar-empty-icon" />
                <p className="phar-empty-title">검색 결과가 없어요</p>
                <p className="phar-empty-desc">검색어나 필터 조건을 변경해 보세요</p>
              </div>
            )}

            {!isLoading && filtered.length > 0 && (
              <div className="phar-card-grid">
                {paged.map((p) => (
                  <PharmacyCard key={p.id} data={p} onMoveMap={moveToPharmacy} />
                ))}
              </div>
            )}

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
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
      <RegionSelect
        isOpen={showRegionModal}
        onClose={() => setShowRegionModal(false)}
        onConfirm={handleRegionConfirm}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   약국 카드
───────────────────────────────────────── */
function PharmacyCard({ data: p, onMoveMap }) {
  return (
    <div className="phar-card">
      <div className="phar-card-thumb">
        {p.thumbnail ? (
          <img src={p.thumbnail} alt={p.name} />
        ) : (
          <div className="phar-card-thumb-placeholder">
            <FontAwesomeIcon icon={faPills} />
          </div>
        )}

        <span className={`phar-status-badge ${p.status === "open" ? "open" : "closed"}`}>
          {p.status === "open" && <span className="phar-status-dot" />}
          {p.status === "open" ? "영업중" : p.status === "unknown" ? "정보없음" : "영업종료"}
        </span>
      </div>

      <div className="phar-card-body">
        <div className="phar-card-name-row">
          <h3 className="phar-card-name">{p.name}</h3>
          <button
            className="phar-map-btn"
            title="지도에서 보기"
            onClick={() => onMoveMap?.(p)}
            disabled={!p.lat || !p.lng}
          >
            <FontAwesomeIcon icon={faMapLocationDot} />
          </button>
        </div>

        <div className="phar-card-addr-wrap">
          <span className={`phar-dist-chip ${!p.distanceKm ? "unknown" : ""}`}>
            <FontAwesomeIcon icon={faLocationDot} />
            {p.distanceKm != null ? `${p.distanceKm}km` : "거리 미확인"}
          </span>
          <p className="phar-card-addr">{p.addr}</p>
        </div>

        <p className="phar-card-phone">
          <FontAwesomeIcon icon={faPhone} />
          {p.phone}
        </p>

        <p className="phar-card-hours">
          <FontAwesomeIcon icon={faClock} />
          {p.status === "unknown"
            ? "운영정보 없음"
            : p.status === "closed"
            ? "오늘 휴무"
            : p.weekdayOpen && p.weekdayClose
            ? `오늘 ${p.weekdayOpen} ~ ${p.weekdayClose}`
            : "운영시간 정보 없음"}
        </p>

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