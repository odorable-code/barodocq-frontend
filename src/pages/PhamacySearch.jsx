import React, { useEffect, useMemo, useState, useRef } from "react";
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
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

const PAGE_SIZE = 6;
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 };

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

  /* ---------------- API FETCH ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("http://localhost:8080/api/v1/pharmacy/cards");
        if (!res.ok) throw new Error("API 호출 실패");

        const data = await res.json();

        const normalized = (Array.isArray(data) ? data : []).map((x) => ({
          id: x.phNum,
          name: x.phName,
          addr: x.phAddr,
          phone: x.phPhone,
          thumbnail: x.phPhoto || null,
          weekdayOpen: x.phhOpenTime?.slice(0, 5),
          weekdayClose: x.phhCloseTime?.slice(0, 5),
          is24h:
            x.phhOpenTime === "00:00:00" &&
            (x.phhCloseTime === "23:59:00" ||
              x.phhCloseTime === "24:00:00"),
          isNight: x.phNightYn === 1,
          isSunday: x.phHolidayYn === 1,
          status:
            x.phhOpenYn === 1
              ? "open"
              : x.phhOpenYn === 0
              ? "closed"
              : "unknown",
          lat: parseFloat(x.phLat),
          lng: parseFloat(x.phLng),
          distanceKm: null,
        }));

        setPharmacies(normalized);
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ---------------- 위치 ---------------- */
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocError("위치 기능을 지원하지 않습니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setLocError("위치 권한이 없어 서울시청 기준으로 보여드려요.");
      }
    );
  }, []);

  /* ---------------- 카카오맵 초기화 ---------------- */
  useEffect(() => {
    if (!window.kakao) return;

    window.kakao.maps.load(() => {
      const container = document.getElementById("kakao-map");
      if (!container) return;

      const options = {
        center: new window.kakao.maps.LatLng(
          myPos.lat,
          myPos.lng
        ),
        level: 5,
      };

      const map = new window.kakao.maps.Map(container, options);
      mapRef.current = map;
    });
  }, [myPos]);

  /* ---------------- 거리 계산 ---------------- */
  const haversineKm = (lat1, lng1, lat2, lng2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  };

  const filtered = useMemo(() => {
    return pharmacies.filter((p) => {
      const matchRegion = !regionQuery || p.addr?.includes(regionQuery);
      const matchSearch =
        !searchTerm ||
        p.name?.includes(searchTerm) ||
        p.addr?.includes(searchTerm);
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
      if (!p.lat || !p.lng) return { ...p, distanceKm: null };
      const d = haversineKm(myPos.lat, myPos.lng, p.lat, p.lng);
      return { ...p, distanceKm: Number(d.toFixed(2)) };
    });

    return base.sort(
      (a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999)
    );
  }, [filtered, myPos]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSorted.length / PAGE_SIZE)
  );

  const paged = filteredSorted.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  /* ---------------- 지도 마커 ---------------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.kakao?.maps) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new window.kakao.maps.LatLngBounds();

    paged.forEach((p) => {
      if (!p.lat || !p.lng) return;
      const pos = new window.kakao.maps.LatLng(p.lat, p.lng);
      const marker = new window.kakao.maps.Marker({
        position: pos,
        map,
      });
      markersRef.current.push(marker);
      bounds.extend(pos);
    });

    if (paged.length > 0) map.setBounds(bounds);
  }, [paged]);

  const handleSearch = () => {
    setSearchTerm(inputValue);
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
      {/* 히어로 UI는 기존 그대로 사용 */}
      {/* ... (UI 부분 동일) */}

      <section className="phar-body">
        <div className="phar-container phar-body-grid">
          <aside className="phar-map-col">
            <div className="phar-map-card">
              <div className="phar-map-header">
                <FontAwesomeIcon icon={faMapLocationDot} />
                지도
              </div>
              <div id="kakao-map" style={{ width: "100%", height: "400px" }} />
            </div>
          </aside>

          <div className="phar-result-col">
            <div className="phar-result-header">
              <strong>{filteredSorted.length}</strong>개의 약국
            </div>

            {paged.map((p) => (
              <PharmacyCard key={p.id} data={p} />
            ))}

            {totalPages > 1 && (
              <div className="phar-pagination">
                {getPageNumbers().map((n) => (
                  <button
                    key={n}
                    onClick={() => setCurrentPage(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <RegionSelect
        isOpen={showRegionModal}
        onClose={() => setShowRegionModal(false)}
        onConfirm={(r) => {
          setRegionLabel(r?.label || "지역 선택");
          setRegionQuery(r?.label || "");
        }}
      />
    </div>
  );
}

/* ---------------- 카드 ---------------- */
function PharmacyCard({ data: p }) {
  return (
    <div className="phar-card">
      <h3>{p.name}</h3>
      <p>{p.addr}</p>
      <p>{p.phone}</p>
      <p>
        {p.distanceKm != null
          ? `${p.distanceKm}km`
          : "거리 미확인"}
      </p>
    </div>
  );
}