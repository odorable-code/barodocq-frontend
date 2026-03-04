import React, { useEffect, useMemo, useState, useCallback } from "react";
import RegionSelect from "../components/RegionSelect";
import KakaoMap from "../components/KakaoMap"; // ✅ 너가 준 공용 컴포넌트 경로에 맞게 수정
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
  { icon: faPills, value: "25,000+", label: "전국 약국" },
  { icon: faMoon, value: "10,041+", label: "야간운영 약국" },
  { icon: faClock, value: "530+", label: "24시간 약국" },
  { icon: faCalendarDay, value: "4,940+", label: "일요일운영 약국" },
];

/* ─────────────────────────────────────────
   util
───────────────────────────────────────── */
const toHHMM = (t) => {
  if (!t) return null;
  const s = String(t).trim();

  // "09:00:00" -> "09:00"
  if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s.slice(0, 5);

  // "9:00" / "09:00" -> "09:00"
  if (/^\d{1,2}:\d{2}$/.test(s)) {
    const [h, m] = s.split(":");
    return `${h.padStart(2, "0")}:${m}`;
  }

  // "0900" -> "09:00"
  if (/^\d{3,4}$/.test(s)) {
    const padded = s.padStart(4, "0");
    return `${padded.slice(0, 2)}:${padded.slice(2, 4)}`;
  }

  return s;
};

const hhmmToMinutes = (hhmm) => {
  if (!hhmm) return null;
  const [h, m] = String(hhmm).split(":");
  const hh = Number(h);
  const mm = Number(m);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  return hh * 60 + mm;
};

const nowMinutes = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

// ✅ "현재시간 기준 영업중/종료" 계산
// - open/close가 없으면 unknown
// - close가 open보다 작으면(예: 22:00~02:00) 자정 넘어가는 야간 케이스 처리
const calcStatusByTime = (openHHMM, closeHHMM) => {
  const o = hhmmToMinutes(openHHMM);
  const c = hhmmToMinutes(closeHHMM);
  if (o == null || c == null) return "unknown";

  const now = nowMinutes();

  // 같은 시간(혹은 00:00~00:00 같은 이상치)은 unknown 처리
  if (o === c) return "unknown";

  // 일반 케이스 (예: 10:00~19:00)
  if (c > o) {
    return now >= o && now < c ? "open" : "closed";
  }

  // 자정 넘어감 (예: 22:00~02:00)
  // open 이후 ~ 24:00 OR 00:00 ~ close
  return now >= o || now < c ? "open" : "closed";
};


const is24Hours = (openHHMM, closeHHMM) => {
  if (!openHHMM || !closeHHMM) return false;
  return (
    openHHMM === "00:00" &&
    (closeHHMM === "23:59" || closeHHMM === "24:00" || closeHHMM === "23:58")
  );
};

const toBoolOpen = (v) => {
  if (v === true) return true;
  if (v === false) return false;

  // 숫자/문자 1,0 처리
  if (v === 1 || v === "1") return true;
  if (v === 0 || v === "0") return false;

  if (v == null) return null;

  const s = String(v).trim().toUpperCase();
  if (["Y", "YES", "TRUE", "T"].includes(s)) return true;
  if (["N", "NO", "FALSE", "F"].includes(s)) return false;

  return null;
};


// 거리계산(하버사인)
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

export default function PharmacySearch() {
  const [pharmacies, setPharmacies] = useState([]);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [regionQuery, setRegionQuery] = useState("");
  const [regionLabel, setRegionLabel] = useState("지역 선택");
  const [showRegionModal, setShowRegionModal] = useState(false);

  // 내 위치 (미허용시 서울시청으로)
  const [myPos, setMyPos] = useState(DEFAULT_CENTER);

  // 지도 제어용(카드 클릭 → map center 이동)
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapLevel, setMapLevel] = useState(4);

  /* ─────────────────────────────────────────
     1) 약국 리스트 불러오기 (백엔드 연동)
     - 컨트롤러가 lat/lng 내려주는 전제(VO에 있음)
  ────────────────────────────────────────── */
  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch("http://3.38.49.151:8080/api/v1/pharmacy/cards");
        if (!res.ok) throw new Error(`API 실패: ${res.status}`);

        const data = await res.json();
         console.log("API raw sample:", data?.[0]);
      console.log(
        "openYn / nightYn / holidayYn:",
        data?.[0]?.phhOpenYn,
        data?.[0]?.phNightYn,
        data?.[0]?.phHolidayYn
      );


        const normalized = (Array.isArray(data) ? data : []).map((x) => {
          const openTime = toHHMM(x.phhOpenTime);
          const closeTime = toHHMM(x.phhCloseTime);

          //현재시간 기준으로 status 결정
          const status = calcStatusByTime(openTime, closeTime);

          const _is24h = is24Hours(openTime, closeTime);

          // lat/lng (String일 수 있으니 숫자로)
          const lat = x.phLat != null ? parseFloat(x.phLat) : null;
          const lng = x.phLng != null ? parseFloat(x.phLng) : null;

           // ✅ 야간/일요일도 boolean/1/"1" 다 대응
          const nightYn = toBoolOpen(x.phNightYn);
          const holidayYn = toBoolOpen(x.phHolidayYn);
          console.log("status check:", x.phName, openTime, closeTime, status);

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

            lat: Number.isFinite(lat) ? lat : null,
            lng: Number.isFinite(lng) ? lng : null,
            

            distanceKm: null,
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

  /* ─────────────────────────────────────────
     2) 내 위치(권한 거부/실패 → 서울시청)
  ────────────────────────────────────────── */
  useEffect(() => {
    if (!navigator.geolocation) {
      setMyPos(DEFAULT_CENTER);
      setMapCenter(DEFAULT_CENTER);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMyPos(next);
        setMapCenter(next);

        // 처음엔 내 위치로 지도도 맞춰주기
        setMapCenter(next);
      },
      (err) => {
        setMyPos(DEFAULT_CENTER);
        console.warn("geolocation error:", err);
        setMapCenter(DEFAULT_CENTER);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  /* ─────────────────────────────────────────
     3) 필터링 / 정렬(거리순)
  ────────────────────────────────────────── */
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
      if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) {
        return { ...p, distanceKm: null };
      }
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

  /* ─────────────────────────────────────────
     4) 페이지 바뀔 때 → 지도 마커도 "현재 페이지"만 표시
     (KakaoMap 컴포넌트에 markers로 넘기기)
  ────────────────────────────────────────── */
  const pageMarkers = useMemo(() => {
    return (paged || [])
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
      .map((p) => ({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        label: p.name,
      }));
  }, [paged]);

  /* ─────────────────────────────────────────
     5) 카드 "지도에서 보기" → center 이동
  ────────────────────────────────────────── */
  const moveToPharmacy = useCallback((p) => {
    if (!p?.lat || !p?.lng) return;
    setMapCenter({ lat: p.lat, lng: p.lng });
    setMapLevel(3);
  }, []);

  /* ─────────────────────────────────────────
     UI 핸들러
  ────────────────────────────────────────── */
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

              {/* ✅ 공용 KakaoMap 사용 */}
              <KakaoMap
                markers={pageMarkers}
                center={mapCenter}
                level={mapLevel}
                height={400}
                showCenterPin={true}
                fitBounds={true} // 현재 페이지 마커 전체가 보이게
                onMarkerClick={(m) => {
                  // 핀 클릭시 해당 약국으로 center 이동(원하면)
                  const found = paged.find((p) => p.id === m.id);
                  if (found) moveToPharmacy(found);
                }}
              />
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

            {!isLoading && filteredSorted.length === 0 && (
              <div className="phar-empty-box">
                <FontAwesomeIcon icon={faPills} className="phar-empty-icon" />
                <p className="phar-empty-title">검색 결과가 없어요</p>
                <p className="phar-empty-desc">검색어나 필터 조건을 변경해 보세요</p>
              </div>
            )}

            {!isLoading && filteredSorted.length > 0 && (
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

      {/* 지역 선택 모달 (너 프로젝트에선 RegionSelect 쓰는 중) */}
      <RegionSelect
        isOpen={showRegionModal}
        onClose={() => setShowRegionModal(false)}
        onConfirm={handleRegionConfirm}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   약국 카드 (hdc 스타일 유지)
───────────────────────────────────────── */
function PharmacyCard({ data: p, onMoveMap }) {
  const [bookmarked, setBookmarked] = useState(false);

  const isOpen = p.status === "open";
  const is24h = p.is24h ?? false;
  const isNight = p.isNight ?? false;
  const isSunday = p.isSunday ?? false;

  const hours =
    p.weekdayOpen && p.weekdayClose ? ` ${p.weekdayOpen} ~ ${p.weekdayClose}` : "";

  return (
    <article className={`hdc ${isOpen ? "hdc--open" : "hdc--closed"}`}>
      <div className="hdc__body">
        <div className="hdc__icon-wrap">
          <div className="hdc__icon">
            <i className="fas fa-prescription-bottle-alt" />
          </div>
          <span className={`hdc__status ${isOpen ? "hdc__status--open" : "hdc__status--closed"}`}>
            {isOpen ? "영업중" : p.status === "unknown" ? "정보없음" : "영업종료"}
          </span>
        </div>

        <div className="hdc__info">
          <div className="hdc__title-row">
            <h3 className="hdc__name">{p.name}</h3>

            {/* ✅ 지도에서 보기(센터 이동) */}
            <button
              type="button"
              className="phar-map-btn"
              title="지도에서 보기"
              onClick={() => onMoveMap?.(p)}
              disabled={!Number.isFinite(p.lat) || !Number.isFinite(p.lng)}
              style={{ marginLeft: 8 }}
            >
              <FontAwesomeIcon icon={faMapLocationDot} />
            </button>
          </div>

          <div className="hdc__meta">
            <span className="hdc__type">약국</span>
            <span className="hdc__dot">·</span>
            {p.distanceKm != null ? (
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

          <p className="hdc__addr">
            <i className="fas fa-map-marker-alt" />
            {p.addr}
          </p>

          {p.phone && (
            <p className="hdc__phone">
              <i className="fas fa-phone" />
              <a href={`tel:${p.phone}`}>{p.phone}</a>
            </p>
          )}

          {hours && (
            <p className="hdc__hours">
              <i className="fas fa-business-time" />
              {hours}
            </p>
          )}
        </div>
      </div>

       <div className="hdc__badges">
        <span className={`hdc__badge hdc__badge--24h${!is24h ? " hdc__badge--off" : ""}`}>
          <i className="fas fa-clock" /> 24시간
        </span>
        <span className={`hdc__badge hdc__badge--night${!isNight ? " hdc__badge--off" : ""}`}>
          <i className="fas fa-moon" /> 야간
        </span>
        <span
          className={`hdc__badge hdc__badge--sunday${!isSunday ? " hdc__badge--off" : ""}`}
        >
          <i className="fas fa-calendar-day" /> 일요일
        </span>
      </div>
    </article>
  );
}
