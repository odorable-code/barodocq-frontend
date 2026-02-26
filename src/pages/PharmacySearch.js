import { useEffect, useMemo, useState, useRef, useCallback } from "react";
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
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

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
  const [regionQuery, setRegionQuery] = useState("");
  const [regionLabel, setRegionLabel] = useState("지역 선택");
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [myPos, setMyPos] = useState(DEFAULT_CENTER);
  const [locError, setLocError] = useState(null);

  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // ── 헬퍼 함수 ──
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

  const is24Hours = (open, close) => {
    if (!open || !close) return false;
    return open === "00:00" && ["23:59", "24:00", "23:58"].includes(close);
  };

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

  // ── 데이터 페칭 ──
  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("http://localhost:8080/api/v1/pharmacy/cards");
        if (!res.ok) throw new Error(`API 실패: ${res.status}`);
        const data = await res.json();

        const normalized = (Array.isArray(data) ? data : []).map((x) => {
          const openTime = toHHMM(x.phhOpenTime);
          const closeTime = toHHMM(x.phhCloseTime);
          const _is24h = is24Hours(openTime, closeTime);
          const lat = x.phLat != null ? parseFloat(x.phLat) : null;
          const lng = x.phLng != null ? parseFloat(x.phLng) : null;

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
            status: x.phhOpenYn === 1 ? "open" : x.phhOpenYn === 0 ? "closed" : "unknown",
            lat: Number.isFinite(lat) ? lat : null,
            lng: Number.isFinite(lng) ? lng : null,
            distanceKm: null,
          };
        });
        setPharmacies(normalized);
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPharmacies();
  }, []);

  // ── 내 위치 가져오기 ──
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocError("위치 기능을 지원하지 않습니다.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setLocError("위치 권한을 허용해주세요."),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  // ── 지도 초기화 ──
  useEffect(() => {
    const initMap = () => {
      const container = document.getElementById("kakao-map");
      if (!container || mapRef.current) return;
      const options = { center: new window.kakao.maps.LatLng(myPos.lat, myPos.lng), level: 5 };
      mapRef.current = new window.kakao.maps.Map(container, options);
    };

    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(initMap);
    }
  }, [myPos.lat, myPos.lng]);

  // ── 필터링 및 정렬 (useMemo) ──
  const filteredSorted = useMemo(() => {
    const base = pharmacies.filter((p) => {
      const matchRegion = !regionQuery || (p.addr || "").includes(regionQuery);
      const matchSearch = !searchTerm || (p.name || "").includes(searchTerm) || (p.addr || "").includes(searchTerm);
      const matchFilter =
        activeFilter === "all" ||
        (activeFilter === "open" && p.status === "open") ||
        (activeFilter === "night" && p.isNight) ||
        (activeFilter === "24h" && p.is24h) ||
        (activeFilter === "sunday" && p.isSunday);
      return matchRegion && matchSearch && matchFilter;
    });

    return base
      .map((p) => ({
        ...p,
        distanceKm: p.lat && p.lng ? Number(haversineKm(myPos.lat, myPos.lng, p.lat, p.lng).toFixed(2)) : null,
      }))
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }, [pharmacies, regionQuery, searchTerm, activeFilter, myPos]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const paged = useMemo(() => {
    return filteredSorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  }, [filteredSorted, currentPage]);

  // ── 마커 업데이트 (핵심: paged 변화에만 반응) ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.kakao?.maps) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new window.kakao.maps.LatLngBounds();
    let hasCoords = false;

    paged.forEach((p) => {
      if (p.lat && p.lng) {
        const pos = new window.kakao.maps.LatLng(p.lat, p.lng);
        const marker = new window.kakao.maps.Marker({ position: pos, map });
        markersRef.current.push(marker);
        bounds.extend(pos);
        hasCoords = true;
      }
    });

    if (hasCoords) map.setBounds(bounds);
  }, [paged]);

  const moveToPharmacy = useCallback((p) => {
    if (!mapRef.current || !p.lat) return;
    const pos = new window.kakao.maps.LatLng(p.lat, p.lng);
    mapRef.current.setLevel(3);
    mapRef.current.panTo(pos);
  }, []);

  const handleSearch = () => { setSearchTerm(inputValue); setCurrentPage(1); };
  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearch(); };
  const handleRegionConfirm = (payload) => {
    const picked = payload?.emd?.name || payload?.sigungu?.name || payload?.sido?.name || "";
    setRegionLabel(picked || "지역 선택");
    setRegionQuery(picked);
    setShowRegionModal(false);
    setCurrentPage(1);
  };

  return (
    <div className="phar-page">
      <section className="phar-hero">
        <div className="phar-container phar-hero-inner">
          <h1 className="phar-hero-title">내 주변 약국 <span className="phar-hero-accent">빠르게 찾기</span></h1>
          <div className="phar-search-bar">
            <button className="phar-region-btn" onClick={() => setShowRegionModal(true)}>
              <FontAwesomeIcon icon={faLocationDot} /> {regionLabel} <FontAwesomeIcon icon={faChevronDown} />
            </button>
            <div className="phar-search-input-wrap">
              <input 
                className="phar-search-input" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                onKeyDown={handleKeyDown} 
                placeholder="약국명 또는 주소 검색..." 
              />
            </div>
            <button className="phar-search-btn" onClick={handleSearch}>검색</button>
          </div>
          <div className="phar-filter-row">
            {FILTER_OPTIONS.map((f) => (
              <button key={f.key} className={`phar-filter-btn ${activeFilter === f.key ? "active" : ""}`} onClick={() => {setActiveFilter(f.key); setCurrentPage(1);}}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="phar-body">
        <div className="phar-container phar-body-grid">
          <aside className="phar-map-col">
            <div className="phar-map-card">
              <div id="kakao-map" style={{ width: "100%", height: "400px", borderRadius: "12px" }} />
            </div>
          </aside>

          <div className="phar-result-col">
            <div className="phar-result-header">
              <strong>{filteredSorted.length}</strong>개의 약국
            </div>
            {isLoading ? (
              <div className="phar-loading-box">로딩 중...</div>
            ) : (
              <div className="phar-card-grid">
                {paged.map((p) => (
                  <PharmacyCard key={p.id} data={p} onMoveMap={moveToPharmacy} />
                ))}
              </div>
            )}
            
            {totalPages > 1 && (
              <div className="phar-pagination">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pNum = i + 1;
                  return (
                    <button key={pNum} className={`phar-page-btn ${currentPage === pNum ? "active" : ""}`} onClick={() => setCurrentPage(pNum)}>
                      {pNum}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <RegionSelect isOpen={showRegionModal} onClose={() => setShowRegionModal(false)} onConfirm={handleRegionConfirm} />
    </div>
  );
}

function PharmacyCard({ data: p, onMoveMap }) {
  return (
    <div className="phar-card">
      <div className="phar-card-body">
        <h3 className="phar-card-name">{p.name}</h3>
        <p className="phar-card-addr">{p.addr}</p>
        <div className="phar-card-footer">
          <span className="phar-dist-chip">{p.distanceKm ? `${p.distanceKm}km` : "거리 미확인"}</span>
          <button className="phar-map-btn" onClick={() => onMoveMap(p)}>지도보기</button>
        </div>
      </div>
    </div>
  );
}