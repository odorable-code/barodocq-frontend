import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/HospitalSearchPage.css";

import RegionSelect from "../components/RegionSelect";
import HospitalDeptSelect from "../components/HospitalDeptSelect";

/* ─────────────────────────────────────────
   필터 태그 (API 기반)
───────────────────────────────────────── */
const FILTER_TAGS = [
  { id: "open", label: "영업중", icon: "circle-check", color: "#10b981" },
  { id: "available", label: "예약가능", icon: "calendar-check", color: "#14b8a6" },
  { id: "night", label: "야간진료", icon: "moon", color: "#6366f1" },
  { id: "holiday", label: "공휴일진료", icon: "calendar-day", color: "#ec4899" },
  { id: "parking", label: "주차가능", icon: "square-parking", color: "#0ea5e9" },
];

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

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
const getOpenStatusNow = (openYn, openTime, closeTime, lunchStart, lunchEnd, now = new Date()) => {
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
  const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  return days[new Date().getDay()];
};

async function fetchHospitals(params = {}) {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== "")
  );
  const qs = new URLSearchParams(cleaned).toString();
  const url = `${API_BASE_URL}/api/v1/hospitals/cards${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, { method: "GET" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`병원 목록 조회 실패 (status: ${res.status})\n${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : data?.content ?? [];
}

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default function HospitalSearchPage() {
  const navigate = useNavigate();
  const headerRef = useRef(null);

  // 검색/필터/정렬
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortBy, setSortBy] = useState("distance");
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  // 모달
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState("");
  const [region, setRegion] = useState({ level: "", sido: null, sigungu: null, emd: null });

  // 데이터
  const [hospitals, setHospitals] = useState([]);
  const [bookmarkedHospitals, setBookmarkedHospitals] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleFilter = (filterId) => {
    setActiveFilters((prev) =>
      prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId]
    );
  };

  const toggleBookmark = (hospitalId) => {
    setBookmarkedHospitals((prev) => {
      const next = new Set(prev);
      next.has(hospitalId) ? next.delete(hospitalId) : next.add(hospitalId);
      return next;
    });
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

  // ✅ 백엔드 호출 + 병원 1개당 1카드로 정리
  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const list = await fetchHospitals(queryParams);
        const today = getTodayKoreanDay();
        const byId = new Map();

        for (let i = 0; i < list.length; i++) {
          const r = list[i];
          const id = r.hoNum ?? r.ho_num ?? i + 1;

          const openYn = ynToBool(r.hhOpenYn ?? r.hh_open_yn);
          const day = r.hhDayOfWeek ?? r.hh_day_of_week;

          if (!byId.has(id)) {
            const night = ynToBool(r.hoNightYn ?? r.ho_night_yn) === true;
            const holiday = ynToBool(r.hoHolidayYn ?? r.ho_holiday_yn) === true;
            const reservable = ynToBool(r.hoReservableYn ?? r.ho_reservable_yn) === true;
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
              address: r.hoAddr ?? r.ho_addr ?? "",
              phone: r.hoPhone ?? r.ho_phone ?? "",
              rating: r.rvRating ?? r.rv_rating ?? null,
              reviews: r.rvReviewCount ?? r.rv_review_count ?? r.reviews ?? null,
              distance: r.distance ?? "0km",
              thumbnail,

              // 표시용
              openTime: "",
              lunchTime: "",
              closedDays: [],

              // ✅ API에서 내려오는 텍스트(있으면 1순위로 쓰기)
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

          // 휴진 요일 모으기 (API 텍스트가 없을 때 대비)
          if (openYn === false && day) acc.closedDays.push(day);

          // 대표 운영시간(운영하는 요일의 시간을 하나 채택)
          if (!acc.openTime && openYn === true) {
            const range = toTimeRange(r.hhOpenTime ?? r.hh_open_time, r.hhCloseTime ?? r.hh_close_time);
            if (range) acc.openTime = range;
          }

          // 오늘 요일 row면 오늘 기준 시간/점심 저장
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
            acc.todayLunchEnd
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
          if (tags.includes("available")) features.push("예약가능");
          if (tags.includes("parking")) features.push("주차가능");

          // ✅ 휴무 텍스트 우선순위: API 텍스트 > 프론트 계산(요일모음) > 안전문구
          const closedText =
            (acc.closedTextFromApi && String(acc.closedTextFromApi).trim()) ||
            (acc.closedDays.length ? acc.closedDays.join(", ") : "휴진일 정보 없음");

          return {
            ...acc,
            status,
            open: openNow,
            breakNow,
            tags,
            features,
            closedText,
          };
        });

        if (!ignore) setHospitals(mapped);
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
  }, [queryParams]);

  // ✅ 프론트 필터
  const filteredHospitals = useMemo(() => {
    let list = hospitals;

    // 1) 검색어
    const q = searchQuery.trim();
    if (q) list = list.filter((h) => (h.name || "").toLowerCase().includes(q.toLowerCase()));

    // 2) 진료과
    if (selectedDept && selectedDept !== "전체") {
      list = list.filter((h) => !h.dept || h.dept === selectedDept);
    }

    // 3) 지역
    list = list.filter((h) => matchRegionByAddr(h.address, region));


    return list;
  }, [hospitals, searchQuery, selectedDept, region, activeFilters]);

  // ✅ 정렬
  const sortedHospitals = useMemo(() => {
    const list = [...filteredHospitals];

    if (sortBy === "distance") {
      const toNum = (d) => {
        const n = parseFloat(String(d || "").replace("km", "").trim());
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

  // (선택) 스크롤 애니메이션
  useEffect(() => {
    const cards = document.querySelectorAll(".hsp-card");
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
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );

    cards.forEach((c) => {
      c.style.opacity = "0";
      c.style.transform = "translateY(28px)";
      c.style.transition = "opacity .5s ease, transform .5s ease";
      obs.observe(c);
    });

    return () => obs.disconnect();
  }, [sortedHospitals.length]);

  return (
    <div className="hsp-page">
      {/* ══════════ HERO ══════════ */}
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
              진료과·위치·조건을 설정하면 가장 적합한 병원을 보여드려요
            </p>

            {/* 검색바 */}
            <div className="hsp-searchbar">
              <i className="fas fa-search hsp-searchbar-icon" />
              <input
                type="text"
                className="hsp-searchbar-input"
                placeholder="병원명으로 검색하세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="hsp-clear-btn" onClick={() => setSearchQuery("")} type="button">
                  <i className="fas fa-times" />
                </button>
              )}
              <button className="hsp-search-submit" type="button">
                검색 <i className="fas fa-arrow-right" />
              </button>
            </div>

            {/* 진료과/지역 모달 버튼 */}
            <div className="quick-actions">
              <button
                type="button"
                className="quick-action-btn primary"
                onClick={() => setIsDeptOpen(true)}
              >
                <i className="fas fa-stethoscope" />
                <span>{selectedDept ? `${selectedDept} 보기` : "진료과별 찾기"}</span>
              </button>

              <button
                type="button"
                className="quick-action-btn ghost"
                onClick={() => setIsRegionOpen(true)}
              >
                <i className="fas fa-map-marked-alt" />
                <span>
                  {(() => {
                    const parts = [region?.sido?.name, region?.sigungu?.name, region?.emd?.name].filter(Boolean);
                    return parts.length ? parts.join(" ") : "지역별 찾기";
                  })()}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ 필터 바 ══════════ */}
      <section className="hsp-filter-bar">
        <div className="container-s2">
          <div className="hsp-detail-filter">
            <button className="hsp-filter-toggle" onClick={() => setIsFilterOpen((p) => !p)} type="button">
              <i className="fas fa-sliders" />
              <span>상세 필터</span>
              {activeFilters.length > 0 && <span className="hsp-filter-badge">{activeFilters.length}</span>}
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
                    type="button"
                  >
                    <i className={`fas fa-${tag.icon}`} />
                    {tag.label}
                    {activeFilters.includes(tag.id) && <i className="fas fa-check hsp-ftag-check" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 결과/정렬 */}
          <div className="hsp-results-bar">
            <div className="hsp-results-info">
              <span className="hsp-results-count">{sortedHospitals.length}</span>
              <span className="hsp-results-label">개의 병원을 찾았어요</span>

              {(searchQuery || activeFilters.length > 0 || selectedDept || region?.sido?.name) && (
                <button
                  className="hsp-reset-btn"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveFilters([]);
                    setSelectedDept("");
                    setRegion({ level: "", sido: null, sigungu: null, emd: null });
                  }}
                  type="button"
                >
                  <i className="fas fa-rotate-left" />
                  전체 초기화
                </button>
              )}
            </div>

            <div className="hsp-sort-wrap">
              <i className="fas fa-sort" />
              <select className="hsp-sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="distance">거리순</option>
                <option value="rating">평점순</option>
                <option value="reviews">리뷰순</option>
              </select>
            </div>
          </div>

          {loading && <div style={{ padding: 10 }}>병원 불러오는 중...</div>}
          {error && <div style={{ padding: 10, color: "crimson", whiteSpace: "pre-wrap" }}>{error}</div>}
        </div>
      </section>

      {/* ══════════ 리스트 ══════════ */}
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
                  setRegion({ level: "", sido: null, sigungu: null, emd: null });
                }}
                type="button"
              >
                <i className="fas fa-rotate-left" /> 전체 초기화
              </button>
            </div>
          ) : (
            <div className="hsp-cards-grid">
              {sortedHospitals.map((h) => (
                <HospitalCard
                  key={h.id}
                  hospital={h}
                  isBookmarked={bookmarkedHospitals.has(h.id)}
                  onToggleBookmark={() => toggleBookmark(h.id)}
                  onClick={() => navigate(`/details/${h.id}`)}
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
    </div>
  );
}

/* ─────────────────────────────────────────
   Card
───────────────────────────────────────── */
function HospitalCard({ hospital, isBookmarked, onToggleBookmark, onClick }) {
  const rating = hospital.rating != null ? Number(hospital.rating) : null;
  const reviews = hospital.reviews != null ? hospital.reviews : "-";

  return (
    <div className="hsp-card" role="button" tabIndex={0} onClick={onClick}>
      {/* 썸네일 */}
      <div className="hsp-card-thumb">
        <img src={hospital.thumbnail} alt={hospital.name} />
        <div className="hsp-card-thumb-overlay" />

        <span
          className={`hsp-status-badge ${
            hospital.status === "open" ? "open" : hospital.status === "break" ? "break" : "closed"
          }`}
        >
          <i className="fas fa-circle" />
          {hospital.status === "open" ? "진료중" : hospital.status === "break" ? "휴게중" : "진료종료"}
        </span>

        <button
          className={`hsp-bookmark-btn ${isBookmarked ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark();
          }}
          type="button"
        >
          <i className="fas fa-bookmark" />
        </button>

        {hospital.distance && hospital.distance !== "0km" && (
          <span className="hsp-distance-chip">
            <i className="fas fa-location-dot" />
            {hospital.distance}
          </span>
        )}
      </div>

      {/* 바디 */}
      <div className="hsp-card-body">
        <div className="hsp-card-title-row">
          <h3 className="hsp-card-name">{hospital.name}</h3>
          <span className="hsp-dept-pill">{hospital.dept || "진료과 미정"}</span>
        </div>

        <div className="hsp-card-rating-row">
          <div className="hsp-stars">
            {[...Array(5)].map((_, i) => (
              <i
                key={i}
                className={`fas fa-star ${rating != null && i < Math.floor(rating) ? "filled" : "empty"}`}
              />
            ))}
            <span className="hsp-rating-val">{rating != null ? rating : "-"}</span>
            <span className="hsp-rating-cnt">({reviews})</span>
          </div>
        </div>

        <div className="hsp-card-address">
          <i className="fas fa-location-dot" />
          <span>{hospital.address || "주소 정보 없음"}</span>
        </div>

        <div className="hsp-card-info-grid">
          <div className="hsp-info-chip">
            <i className="fas fa-phone" />
            <span>{hospital.phone || "전화번호 없음"}</span>
          </div>
          <div className="hsp-info-chip">
            <i className="fas fa-clock" />
            <span>{hospital.openTime || "운영시간 정보 없음"}</span>
          </div>
        </div>

        {/* ✅ 휴게중이면 점심시간 표시 */}
        {hospital.status === "break" && hospital.lunchTime && (
          <div className="hsp-closed-days">
            <i className="fas fa-utensils" />
            <span>점심시간: {hospital.lunchTime}</span>
          </div>
        )}

        {/* 휴진일/정기휴무 */}
        <div className="hsp-closed-days">
          <i className="fas fa-calendar-xmark" />
          <span>{hospital.closedText}</span>
        </div>

        {/* 특징 태그 */}
        {hospital.features?.length > 0 && (
          <div className="hsp-features-row">
            {hospital.features.map((f, i) => (
              <span key={i} className="hsp-feature-tag">
                {f}
              </span>
            ))}
          </div>
        )}

        <div className="hsp-card-divider" />

        <div className="hsp-card-actions" onClick={(e) => e.stopPropagation()}>
          <button className="hsp-btn-reserve" type="button">
            <i className="fas fa-calendar-check" />
            <span>예약하기</span>
          </button>
          <button className="hsp-btn-icon" title="전화" type="button">
            <i className="fas fa-phone" />
          </button>
          <button className="hsp-btn-icon" title="길찾기" type="button">
            <i className="fas fa-route" />
          </button>
        </div>
      </div>
    </div>
  );
}