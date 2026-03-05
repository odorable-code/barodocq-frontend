import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/HospitalSearch.css";

import RegionSelect from "../components/RegionSelect";
import HospitalDeptSelect from "../components/HospitalDeptSelect";
import ReservationModal from "../components/ReservationModal";
import { useSocket } from "../WebSocketContext";

/* ─────────────────────────────────────────
   필터 태그
───────────────────────────────────────── */
const FILTER_TAGS = [
  { id: "open", label: "진료중", icon: "circle-check", color: "#10b981" },
  { id: "night", label: "야간진료", icon: "moon", color: "#6366f1" },
  {
    id: "holiday",
    label: "공휴일진료",
    icon: "calendar-day",
    color: "#ec4899",
  },
  {
    id: "parking",
    label: "주차가능",
    icon: "square-parking",
    color: "#0ea5e9",
  },
];

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

/* ─────────────────────────────────────────
   util
───────────────────────────────────────── */
const ynToBool = (v) => {
  if (v === true || v === false) return v;
  if (v === 1 || v === 0) return Boolean(v);
  if (v == null) return null;

  const s = String(v).trim().toUpperCase();
  if (["Y", "YES", "TRUE", "T", "1"].includes(s)) return true;
  if (["N", "NO", "FALSE", "F", "0"].includes(s)) return false;
  return null;
};

const pickFirstNumber = (...cands) => {
  for (const v of cands) {
    const n = Number(v);
    if (v != null && Number.isFinite(n)) return n;
  }
  return null;
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

  const sidoName = regionPick?.sido?.name;
  const sigunguName = regionPick?.sigungu?.name;
  const emdName = regionPick?.emd?.name;

  if (!sidoName && !sigunguName && !emdName) return true;

  if (sidoName) {
    const token = normalizeSidoToken(sidoName);
    if (token && !a.includes(token)) return false;
  }
  if (sigunguName && !a.includes(sigunguName)) return false;
  if (emdName && !a.includes(emdName)) return false;

  return true;
};

const stripSeconds = (t) => {
  if (!t) return "";
  const s = String(t).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!m) return s;
  return `${m[1].padStart(2, "0")}:${m[2]}`;
};

const timeToMin = (t) => {
  const s = stripSeconds(t);
  const m = String(s).match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  return hh * 60 + mm;
};

const toTimeRange = (openTime, closeTime) => {
  const o = stripSeconds(openTime);
  const c = stripSeconds(closeTime);
  if (!o || !c) return "";
  return `${o} - ${c}`;
};

const toLunchRange = (lunchStart, lunchEnd) => {
  const s = stripSeconds(lunchStart);
  const e = stripSeconds(lunchEnd);
  if (!s || !e) return "";
  return `${s} - ${e}`;
};

// "open" | "break" | "closed"
const getOpenStatusNow = (
  openYn,
  openTime,
  closeTime,
  lunchStart,
  lunchEnd,
  now = new Date(),
) => {
  if (openYn === false) return "closed";

  const o = timeToMin(openTime);
  const c = timeToMin(closeTime);
  if (o == null || c == null) return "closed";

  const cur = now.getHours() * 60 + now.getMinutes();
  const is24h = o === c;

  const inBusiness = (() => {
    if (is24h) return true;
    if (c > o) return cur >= o && cur < c;
    return cur >= o || cur < c; // 야간/익일
  })();

  if (!inBusiness) return "closed";

  const ls = timeToMin(lunchStart);
  const le = timeToMin(lunchEnd);

  const inLunch =
    ls != null &&
    le != null &&
    (() => {
      if (le > ls) return cur >= ls && cur < le;
      return cur >= ls || cur < le;
    })();

  if (inLunch) return "break";
  return "open";
};

const getTodayKoreanDay = () => {
  const days = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ];
  return days[new Date().getDay()];
};

// ✅ 수정 전
// async function fetchHospitals(params = {}) {
//   const cleaned = Object.fromEntries(
//     Object.entries(params).filter(
//       ([_, v]) => v !== null && v !== undefined && v !== "",
//     ),
//   );
//   const qs = new URLSearchParams(cleaned).toString();
//   const url = `${API_BASE_URL}/api/v1/hospitals/cards${qs ? `?${qs}` : ""}`;

//   const res = await fetch(url, { method: "GET" });

//   if (!res.ok) {
//     const text = await res.text().catch(() => "");
//     throw new Error(
//       `병원 목록 조회 실패 (status: ${res.status})\n${text.slice(0, 200)}`,
//     );
//   }

//   const data = await res.json();
//   return Array.isArray(data) ? data : (data?.content ?? []);
// }

// ✅ 수정 후 (토큰 추가)
async function fetchHospitals(params = {}) {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== "")
  );
  const qs = new URLSearchParams(cleaned).toString();
  const url = `${API_BASE_URL}/api/v1/hospitals/cards-new${qs ? `?${qs}` : ""}`;

  const accessToken = localStorage.getItem("accessToken"); // 토큰 가져오기
  const res = await fetch(url, {
    method: "GET",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), // 토큰 추가
    },
  });

  if (!res.ok) { /* 에러 처리 */ }
  const data = await res.json();
  return Array.isArray(data) ? data : (data?.content ?? []);
}

// ✅ 찜(scraps) 토글
async function toggleHospitalScrap(hospitalId) {
  const url = `${API_BASE_URL}/api/v1/hospitals/${hospitalId}/scraps`;
  const accessToken = localStorage.getItem("accessToken");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `북마크(스크랩) 실패 (status: ${res.status})\n${text.slice(0, 200)}`,
    );
  }

  // 서버가 json 안 줄 수도 있음
  return await res.json().catch(() => null);
}

const openKakaoDirections = ({
  fromLat,
  fromLng,
  fromName,
  toLat,
  toLng,
  toName,
}) => {
  if ([fromLat, fromLng, toLat, toLng].some((v) => v == null)) {
    alert("출발/도착 정보가 없어서 길찾기를 열 수 없어요.");
    return;
  }

  const sName = encodeURIComponent(fromName || "현재위치");
  const dName = encodeURIComponent(toName || "목적지");

  // ✅ 카카오맵 길찾기 URL (웹/앱 공통으로 동작하는 편)
  const url = `https://map.kakao.com/link/from/${sName},${fromLat},${fromLng}/to/${dName},${toLat},${toLng}`;

  window.open(url, "_blank", "noopener,noreferrer");
};

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default function HospitalSearch() {
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const { createRoom, setActiveChatRoom, setNotifOpen  } = useSocket();

  const PAGE_SIZE = 15;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef(null);

  // 검색/필터/정렬
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortBy, setSortBy] = useState("distance");
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  // 모달
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState("");
  const [region, setRegion] = useState({
    level: "",
    sido: null,
    sigungu: null,
    emd: null,
  });

  // 데이터
  const [hospitals, setHospitals] = useState([]);
  const [bookmarkedHospitals, setBookmarkedHospitals] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isReserveOpen, setIsReserveOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  // 북마크 중복 클릭 방지
  const bookmarkingRef = useRef(new Set());

  // 위치감지 병원거리 계산
  const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }; // 서울시청
  const [userPos, setUserPos] = useState(DEFAULT_CENTER);
  const [geoError, setGeoError] = useState("");

  // 로그인 감지
  const isLoggedIn = () => {
    return Boolean(localStorage.getItem("accessToken"));
  };
  // 로그인 안되어있으면 알럿
  const requireLogin = () => {
    if (!isLoggedIn()) {
      alert("로그인 후 이용해주세요");
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("이 브라우저는 위치 기능을 지원하지 않습니다.");
      setUserPos(DEFAULT_CENTER);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setGeoError(err?.message || "위치 정보를 가져오지 못했어요.");
        setUserPos(DEFAULT_CENTER);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    );
  }, []);

  const handleInquiry = async (hospital) => {
  if (!requireLogin()) return;

  const room = await createRoom({
    hospitalId: hospital.id,
    hospitalName: hospital.name,
  });

  if (room) {
    setActiveChatRoom(room);
    setNotifOpen(true);   // 🔥 이거 핵심
  }
};

  const toggleFilter = (filterId) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId],
    );
  };

  // ✅ 찜 토글 (낙관적 업데이트 + 실패 롤백)
  const toggleBookmark = async (hospitalId) => {
    if (!requireLogin()) return;
    if (bookmarkingRef.current.has(hospitalId)) return;
    bookmarkingRef.current.add(hospitalId);

    // 낙관적 UI 업데이트
    setBookmarkedHospitals((prev) => {
      const next = new Set(prev);
      next.has(hospitalId) ? next.delete(hospitalId) : next.add(hospitalId);
      return next;
    });

    try {
      const data = await toggleHospitalScrap(hospitalId);

      // 서버가 최종 상태를 내려주는 경우 동기화
      const scrapped =
        data?.scrapped ?? data?.isScrapped ?? data?.bookmarked ?? null;
      if (scrapped !== null) {
        setBookmarkedHospitals((prev) => {
          const next = new Set(prev);
          scrapped ? next.add(hospitalId) : next.delete(hospitalId);
          return next;
        });
      }
    } catch (e) {
      // 실패 롤백
      setBookmarkedHospitals((prev) => {
        const next = new Set(prev);
        next.has(hospitalId) ? next.delete(hospitalId) : next.add(hospitalId);
        return next;
      });
      console.error(e);
      alert(e?.message || "북마크 처리 중 오류가 발생했어요.");
    } finally {
      bookmarkingRef.current.delete(hospitalId);
    }
  };

  // ✅ API 파라미터
  const queryParams = useMemo(() => {
    const params = {};
    if (searchQuery.trim()) params.q = searchQuery.trim();
    if (selectedDept && selectedDept !== "전체") params.dept = selectedDept;
    if (region?.sido?.code) params.sidocode = region.sido.code;
    if (region?.sigungu?.code) params.sigungucode = region.sigungu.code;
    if (region?.emd?.code) params.eupmyeondongcode = region.emd.code;
    return params;
  }, [searchQuery, selectedDept, region]);

  // ✅ 병원 데이터 로드 + 1개 병원=1카드로 정리
  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const list = await fetchHospitals(queryParams);
        const today = getTodayKoreanDay();
        const byId = new Map();

        // 🔥 [추가] 서버에서 받아온 찜 목록을 저장할 임시 Set
        const initialBookmarks = new Set();

        for (let i = 0; i < list.length; i++) {
          const r = list[i];
          const id = r.hoNum ?? r.ho_num ?? i + 1;

          // 🔥 [추가] 서버에서 준 찜 여부 확인 (필드명은 DB/API 확인 필요)
          // 보통 isScrapped, scrapped, bookmarked 등으로 내려옵니다.
          const isScrappedFromServer = ynToBool(r.isScrapped ?? r.scrapped ?? r.bookmarked);
          if (isScrappedFromServer) {
            initialBookmarks.add(id);
          }

          const openYn = ynToBool(r.hhOpenYn ?? r.hh_open_yn);
          const day = r.hhDayOfWeek ?? r.hh_day_of_week;

          if (!byId.has(id)) {
            const night = ynToBool(r.hoNightYn ?? r.ho_night_yn) === true;
            const holiday = ynToBool(r.hoHolidayYn ?? r.ho_holiday_yn) === true;
            const reservable =
              ynToBool(r.hoReservableYn ?? r.ho_reservable_yn) === true;
            const parking = ynToBool(r.hoParking ?? r.ho_parking) === true;

            const photo = r.hoPhoto ?? r.ho_photo;
            const thumbnail =
              photo && String(photo).trim()
                ? photo
                : "https://via.placeholder.com/400x250/0ea5e9/ffffff?text=Hospital";

            byId.set(id, {
              id,
              name: r.hoName ?? r.ho_name ?? "병원명",
              dept: r.deptName ?? r.dept_name ?? "",
              lat: pickFirstNumber(r.hoLat, r.ho_lat, r.lat),
              lng: pickFirstNumber(r.hoLng, r.ho_lng, r.lng),
              address: r.hoAddr ?? r.ho_addr ?? "",
              phone: r.hoPhone ?? r.ho_phone ?? "",
              rating: pickFirstNumber(r.rvRating, r.rv_rating, r.rating),
              reviews: pickFirstNumber(
                r.rvReviewCount,
                r.rv_review_count,
                r.reviewCount,
                r.review_count,
                r.rvCnt,
                r.rv_cnt,
                r.rv_review_cnt,
                r.reviews,
                r.review_cnt,
                r.rvCount,
                r.rv_count,
              ),
              distance: r.distance ?? "0km",
              thumbnail,

              // 표시용
              openTime: "",
              lunchTime: "",
              closedDays: [],
              closedTextFromApi: r.closedDaysText ?? r.closed_days_text ?? "",

              tagsBase: { night, holiday, reservable, parking },

              // 오늘 row 저장
              todayOpenYn: null,
              todayOpenTime: "",
              todayCloseTime: "",
              todayLunchStart: "",
              todayLunchEnd: "",
            });
          }

          const acc = byId.get(id);

          // 휴진 요일 모으기
          if (openYn === false && day) acc.closedDays.push(day);

          // 대표 운영시간(운영하는 요일의 시간을 하나 채택)
          if (!acc.openTime && openYn === true) {
            const range = toTimeRange(
              r.hhOpenTime ?? r.hh_open_time,
              r.hhCloseTime ?? r.hh_close_time,
            );
            if (range) acc.openTime = range;
          }

          // 오늘 요일 row 저장
          if (day === today) {
            acc.todayOpenYn = openYn;
            acc.todayOpenTime = r.hhOpenTime ?? r.hh_open_time;
            acc.todayCloseTime = r.hhCloseTime ?? r.hh_close_time;
            acc.todayLunchStart = r.hhLunchStart ?? r.hh_lunch_start;
            acc.todayLunchEnd = r.hhLunchEnd ?? r.hh_lunch_end;

            const lunch = toLunchRange(acc.todayLunchStart, acc.todayLunchEnd);
            if (lunch) acc.lunchTime = lunch;
          }
        }

        const mapped = Array.from(byId.values()).map((acc) => {
          const status = getOpenStatusNow(
            acc.todayOpenYn,
            acc.todayOpenTime,
            acc.todayCloseTime,
            acc.todayLunchStart,
            acc.todayLunchEnd,
          );

          const openNow = status === "open";
          const breakNow = status === "break";

          const tags = [];
          if (openNow) tags.push("open");
          if (acc.tagsBase.night) tags.push("night");
          if (acc.tagsBase.holiday) tags.push("holiday");
          if (acc.tagsBase.reservable) tags.push("available");
          if (acc.tagsBase.parking) tags.push("parking");

          const features = [];
          if (breakNow) features.push("휴게중");
          if (tags.includes("night")) features.push("야간진료");
          if (tags.includes("holiday")) features.push("공휴일진료");
          if (tags.includes("parking")) features.push("주차가능");

          const apiClosed = String(acc.closedTextFromApi ?? "").trim();

          const closedText =
            apiClosed ||
            (acc.closedDays.length
              ? acc.closedDays.join(", ")
              : "휴진일 정보 없음");

          const hasCoord = acc.lat != null && acc.lng != null;
          const distKm = hasCoord
            ? haversineKm(userPos.lat, userPos.lng, acc.lat, acc.lng)
            : null;

          return {
            ...acc,
            status,
            open: openNow,
            breakNow,
            tags,
            features,
            closedText,
            distanceKm: distKm,
            distance:
              distKm != null
                ? `${distKm.toFixed(1)}km`
                : (acc.distance ?? "0km"),
          };
        });

        if (!ignore)
          setHospitals(mapped);
          setBookmarkedHospitals(initialBookmarks); // 🔥 [중요] 받아온 찜 상태를 상태값에 반영!
      } catch (e) {
        if (!ignore) {
          setHospitals([]);
          setError(e?.message || "에러가 발생했습니다.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [queryParams, userPos]);

  // ✅ 프론트 필터
  const filteredHospitals = useMemo(() => {
    let list = hospitals;

    // 1) 검색어: 병원명 + 진료과
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((h) => {
        const name = String(h.name || "").toLowerCase();
        const dept = String(h.dept || "").toLowerCase();
        return name.includes(q) || dept.includes(q);
      });
    }

    // 2) 진료과
    if (selectedDept && selectedDept !== "전체") {
      list = list.filter((h) => !h.dept || h.dept === selectedDept);
    }

    // 3) 지역
    list = list.filter((h) => matchRegionByAddr(h.address, region));

    // 4) 상세필터
    if (activeFilters.length > 0) {
      list = list.filter((h) =>
        activeFilters.every((f) => (h.tags || []).includes(f)),
      );
    }

    return list;
  }, [hospitals, searchQuery, selectedDept, region, activeFilters]);

  // ✅ 정렬
  const sortedHospitals = useMemo(() => {
    const list = [...filteredHospitals];

    if (sortBy === "distance") {
      const toNum = (d) => {
        const n = parseFloat(
          String(d || "")
            .replace("km", "")
            .trim(),
        );
        return Number.isFinite(n) ? n : 999999;
      };
      list.sort((a, b) => toNum(a.distance) - toNum(b.distance));
    } else if (sortBy === "rating") {
      const toNum = (v) => (v == null ? -1 : Number(v));
      list.sort((a, b) => toNum(b.rating) - toNum(a.rating));
    } else if (sortBy === "reviews") {
      const toNum = (v) => (v == null ? -1 : Number(v));
      list.sort((a, b) => toNum(b.reviews) - toNum(a.reviews));
    }

    return list;
  }, [filteredHospitals, sortBy]);

  // ✅ 무한 스크롤
  const visibleHospitals = useMemo(
    () => sortedHospitals.slice(0, visibleCount),
    [sortedHospitals, visibleCount],
  );
  const hasMore = visibleCount < sortedHospitals.length;

  useEffect(() => {
    // 필터/검색/정렬이 바뀌면 다시 처음부터 보여주게
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, selectedDept, region, activeFilters, sortBy, PAGE_SIZE]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    if (!hasMore) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + PAGE_SIZE, sortedHospitals.length),
          );
        }
      },
      { root: null, threshold: 0.1, rootMargin: "200px 0px" },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, sortedHospitals.length, PAGE_SIZE]);

  // ✅ 스크롤 애니메이션(.hdc)
  useEffect(() => {
    const root = headerRef.current?.closest(".hsp-page");
    const cards = root?.querySelectorAll(".hdc");
    if (!cards?.length) return;

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
  }, [visibleHospitals.length]);

  return (
    <div className="hsp-page">
      {/* HERO */}
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
                  type="button"
                >
                  <i className="fas fa-times" />
                </button>
              )}
              <button className="hsp-search-submit" type="button">
                검색 <i className="fas fa-arrow-right" />
              </button>
            </div>

            {/* 퀵 액션 버튼 */}
            <div className="quick-actions">
              <button
                type="button"
                className="quick-action-btn primary"
                onClick={() => setIsDeptOpen(true)}
              >
                <i className="fas fa-stethoscope" />
                <span>
                  {selectedDept ? `${selectedDept} 보기` : "진료과별 찾기"}
                </span>
              </button>
              <button
                type="button"
                className="quick-action-btn ghost"
                onClick={() => setIsRegionOpen(true)}
              >
                <i className="fas fa-map-marked-alt" />
                <span>
                  {(() => {
                    const parts = [
                      region?.sido?.name,
                      region?.sigungu?.name,
                      region?.emd?.name,
                    ].filter(Boolean);
                    return parts.length ? parts.join(" ") : "지역별 찾기";
                  })()}
                </span>
              </button>
            </div>


            {/* {geoError && (
              //<div style={{ marginTop: 8, color: "#b91c1c" }}>{geoError}</div>
              <span>지역별 찾기</span>
            )} */}
          </div>
        </div>
      </section>

      {/* 필터 바 */}
      <section className="hsp-filter-bar">
        <div className="container-s2">
          <div className="hsp-detail-filter">
            <button
              className="hsp-filter-toggle"
              onClick={() => setIsFilterOpen((p) => !p)}
              type="button"
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
                    type="button"
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

          <div className="hsp-results-bar">
            <div className="hsp-results-info">
              <span className="hsp-results-count">
                {sortedHospitals.length}
              </span>
              <span className="hsp-results-label">개의 병원을 찾았어요</span>

              {(searchQuery ||
                activeFilters.length > 0 ||
                selectedDept ||
                region?.sido?.name) && (
                <button
                  className="hsp-reset-btn"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveFilters([]);
                    setSelectedDept("");
                    setRegion({
                      level: "",
                      sido: null,
                      sigungu: null,
                      emd: null,
                    });
                  }}
                  type="button"
                >
                  <i className="fas fa-rotate-left" /> 전체 초기화
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

          {loading && <div style={{ padding: 10 }}>병원 불러오는 중...</div>}
          {error && (
            <div
              style={{ padding: 10, color: "crimson", whiteSpace: "pre-wrap" }}
            >
              {error}
            </div>
          )}
        </div>
      </section>

      {/* 리스트 */}
      <section className="hsp-list-section">
        <div className="container-s2">
          {!loading && !error && sortedHospitals.length === 0 ? (
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
                  setSelectedDept("");
                  setRegion({
                    level: "",
                    sido: null,
                    sigungu: null,
                    emd: null,
                  });
                }}
                type="button"
              >
                <i className="fas fa-rotate-left" /> 전체 초기화
              </button>
            </div>
          ) : (
            <div className="hsp-cards-grid">
              {visibleHospitals.map((h) => (
                <HospitalDetailCard
                  key={h.id}
                  hospital={h}
                  isBookmarked={bookmarkedHospitals.has(h.id)}
                  onToggleBookmark={() => toggleBookmark(h.id)}
                  onReserve={() => {
                    if (!requireLogin()) return;
                    setSelectedHospital(h);
                    setIsReserveOpen(true);
                  }}
                  onInquiry={() => handleInquiry(h)}
                  onGoDetail={() => navigate(`/details/${h.id}`)}
                  onDirection={() => {
                    openKakaoDirections({
                      fromLat: userPos.lat,
                      fromLng: userPos.lng,
                      fromName: "현재위치",
                      toLat: h.lat,
                      toLng: h.lng,
                      toName: h.name,
                    });
                  }}
                />
              ))}
              {hasMore && <div ref={loadMoreRef} style={{ height: 1 }} />}
            </div>
          )}
        </div>
      </section>

      {/* 모달 */}
      <HospitalDeptSelect
        isOpen={isDeptOpen}
        onClose={() => setIsDeptOpen(false)}
        onConfirm={(result) => {
          const deptName =
            result?.deptName ?? (typeof result === "string" ? result : "");
          setSelectedDept(deptName === "전체" ? "" : deptName);
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
      {isReserveOpen && selectedHospital && (
        <ReservationModal
          hoNum={selectedHospital.id}
          deptNum={selectedHospital.deptNum ?? 1}
          onClose={() => {
            setIsReserveOpen(false);
            setSelectedHospital(null);
          }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   카드 컴포넌트 (HD C UI)
───────────────────────────────────────── */
function HospitalDetailCard({
  hospital,
  isBookmarked,
  onToggleBookmark,
  onReserve,
  onGoDetail,
  onDirection,
  onInquiry,
}) {
  const [expanded, setExpanded] = useState(false);

  // 상태
  const status = hospital.status || "closed";
  const isOpenNow = status === "open";
  const isBreakNow = status === "break";

  // 태그(필터용) 기반 파생
  const tagSet = new Set(hospital.tags || []);
  const isNightCare = tagSet.has("night");
  const isHolidayCare = tagSet.has("holiday");
  const isPark = tagSet.has("parking");
  const isReservable = tagSet.has("available");

  const MAX_TAGS = expanded ? 999 : 4;

  const renderStars = (score) => {
    const s = Number(score || 0);
    const full = Math.floor(s);
    const half = s - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <>
        {"★".repeat(Math.max(0, full))}
        {half && <span className="hdc__star--half">★</span>}
        {"☆".repeat(Math.max(0, empty))}
      </>
    );
  };

  const rating = hospital.rating != null ? Number(hospital.rating) : 0;
  const reviewCount = Number.isFinite(Number(hospital.reviews))
    ? Number(hospital.reviews)
    : 0;

  return (
    <article
      className={`hdc ${isOpenNow ? "hdc--open" : "hdc--closed"}`}
      role="button"
      tabIndex={0}
      onClick={() => onGoDetail?.(hospital)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onGoDetail?.(hospital);
      }}
    >
      <div className="hdc__badges">
        {isBreakNow && (
          <span className="hdc__badge hdc__badge--res">🍚 휴게중</span>
        )}
        {isNightCare && (
          <span className="hdc__badge hdc__badge--night">🌙 야간진료</span>
        )}
        {isHolidayCare && (
          <span className="hdc__badge hdc__badge--emergency">
            📅 공휴일진료
          </span>
        )}
        {isPark && (
          <span className="hdc__badge hdc__badge--park">🅿 주차가능</span>
        )}
      </div>

      <div className="hdc__body">
        <div className="hdc__icon-wrap">
          <div className="hdc__icon">
            <i className="fas fa-hospital-alt" />
          </div>
          <span
            className={`hdc__status ${isOpenNow ? "hdc__status--open" : "hdc__status--closed"}`}
          >
            {isOpenNow ? "진료중" : isBreakNow ? "휴게중" : "진료종료"}
          </span>
        </div>

        <div className="hdc__info">
          <div className="hdc__title-row">
            <h3 className="hdc__name">{hospital.name}</h3>
            <button
              className={`hdc__bookmark ${isBookmarked ? "hdc__bookmark--on" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark?.();
              }}
              aria-label="북마크"
              type="button"
            >
              <i
                className={isBookmarked ? "fas fa-bookmark" : "far fa-bookmark"}
              />
            </button>
          </div>

          <div className="hdc__meta">
            <span className="hdc__type">
              {hospital.dept ? "의원/클리닉" : "종합병원"}
            </span>
            <span className="hdc__dot">·</span>
            {hospital.distance && (
              <span className="hdc__distance">
                <i className="fas fa-location-dot" /> {hospital.distance}
              </span>
            )}
          </div>

          <div className="hdc__rating">
            <span className="hdc__stars">{renderStars(rating || 0)}</span>
            <span className="hdc__score">
              {rating ? rating.toFixed(1) : "-"}
            </span>
            <span className="hdc__review-cnt">({reviewCount ?? 0}개 리뷰)</span>
          </div>

          <p className="hdc__addr">
            <i className="fas fa-map-marker-alt" />
            {hospital.address || "주소 정보 없음"}
          </p>

          {hospital.phone && (
            <p className="hdc__phone" onClick={(e) => e.stopPropagation()}>
              <i className="fas fa-phone" />
              <a href={`tel:${hospital.phone}`}>{hospital.phone}</a>
            </p>
          )}

          {hospital.openTime && (
            <p className="hdc__hours">
              <i className="fas fa-business-time" />
              {hospital.openTime}
            </p>
          )}

          {isBreakNow && hospital.lunchTime && (
            <p className="hdc__hours">
              <i className="fas fa-utensils" />
              점심시간: {hospital.lunchTime}
            </p>
          )}

          {hospital.closedText && (
            <p className="hdc__hours">
              <i className="fas fa-calendar-xmark" />
              {hospital.closedText}
            </p>
          )}
        </div>
      </div>

      <div className="hdc__actions" onClick={(e) => e.stopPropagation()}>
        <button
          className="hdc__btn hdc__btn--ghost"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDirection?.();
          }}
        >
          <i className="fas fa-map" /> 길찾기
        </button>
        <button
          className="hdc__btn hdc__btn--ghost"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onInquiry?.();
          }}
        >
          <i className="fas fa-comment-dots" /> 1:1문의
        </button>
        <button className="hdc__btn hdc__btn--ghost" type="button">
          <i className="fas fa-star" /> 리뷰
        </button>
        <button
          className="hdc__btn hdc__btn--primary"
          onClick={(e) => {
            onReserve?.(hospital);
          }}
          type="button"
        >
          <i className="fas fa-calendar-check" />
          예약하기
        </button>
      </div>
    </article>
  );
}
