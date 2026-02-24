import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/HospitalSearch.css";

import RegionSelect from "../components/RegionSelect";
import HospitalDeptSelect from "../components/HospitalDeptSelect";

/* ─────────────────────────────────────────
   필터 태그
───────────────────────────────────────── */
const FILTER_TAGS = [
  { id: "open", label: "영업중", icon: "circle-check", color: "#10b981" }, // 오늘 기준 open
  { id: "available", label: "예약가능", icon: "calendar-check", color: "#14b8a6" }, // ho_reservable_yn
  { id: "night", label: "야간진료", icon: "moon", color: "#6366f1" }, // ho_night_yn
  { id: "holiday", label: "공휴일진료", icon: "calendar-day", color: "#ec4899" }, // ho_holiday_yn
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
  // "09:00:00" -> "09:00"
  const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!m) return s;
  return `${m[1].padStart(2, "0")}:${m[2]}`;
};

const toTimeRange = (openTime, closeTime) => {
  const o = stripSeconds(openTime);
  const c = stripSeconds(closeTime);
  if (!o || !c) return "";
  return `${o} - ${c}`;
};

// 오늘 요일을 "월요일" 형태로
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
   Component
───────────────────────────────────────── */
export default function HospitalSearchPage() {
  const navigate = useNavigate();

  // 검색/필터
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortBy, setSortBy] = useState("distance"); // distance | rating | reviews

  // 모달 상태
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(""); // 모달에서 선택한 dept_name
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

  // ✅ API 파라미터: 모달 선택값만 사용
  const queryParams = useMemo(() => {
    const params = {};

    if (searchQuery.trim()) params.q = searchQuery.trim();
    if (selectedDept && selectedDept !== "전체") params.dept = selectedDept;

    if (region?.sido?.code) params.sidocode = region.sido.code;
    if (region?.sigungu?.code) params.sigungucode = region.sigungu.code;
    if (region?.emd?.code) params.eupmyeondongcode = region.emd.code;

    return params;
  }, [searchQuery, selectedDept, region]);

  // ✅ 백엔드 호출 + (중요) 병원별 그룹핑해서 "휴진일" 만들기
  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const list = await fetchHospitals(queryParams);

        const today = getTodayKoreanDay();

        // 1) 병원별로 모으기
        const byId = new Map();

        for (let i = 0; i < list.length; i++) {
          const r = list[i];
          const id = r.ho_num ?? i + 1;

          const openYn = ynToBool(r.hh_open_yn); // 0/1 들어와도 처리됨
          const day = r.hh_day_of_week;          // "월요일" 형태

          // 병원 기본객체 초기화
          if (!byId.has(id)) {
            const night = ynToBool(r.ho_night_yn) === true;
            const holiday = ynToBool(r.ho_holiday_yn) === true;
            const femaleDoctor = ynToBool(r.ho_female_doctor_yn) === true;
            const reservable = ynToBool(r.ho_reservable_yn) === true;
            const parking = ynToBool(r.ho_parking) === true;

            const thumbnail =
              r.ho_photo && String(r.ho_photo).trim()
                ? r.ho_photo
                : "https://via.placeholder.com/400x250/0ea5e9/ffffff?text=Hospital";

            byId.set(id, {
              id,
              name: r.ho_name ?? "병원명",
              dept: r.dept_name ?? "",
              address: r.ho_addr ?? "",
              phone: r.ho_phone ?? "",
              rating: r.rv_rating ?? null,
              reviews: r.rv_review_count ?? null,
              distance: r.distance ?? "0km",

              // 아래는 나중에 계산
              open: false,                 // 오늘 기준으로 계산해서 넣음
              openTime: "",                // 대표 운영시간(하나만 표시)
              closedDays: [],              // 휴진 요일들 모음

              // 태그용
              tagsBase: { night, holiday, reservable, parking, femaleDoctor },

              thumbnail,
              _raw: r,
            });
          }

          const acc = byId.get(id);

          // 휴진 요일 모으기 (openYn === false)
          if (openYn === false && day) {
            acc.closedDays.push(day);
          }

          // 대표 운영시간은 "운영하는 요일"의 시간을 하나만 채택(처음 만난 운영일 기준)
          if (!acc.openTime && openYn === true) {
            const range = toTimeRange(r.hh_open_time, r.hh_close_time);
            if (range) acc.openTime = range;
          }
        }

        // 2) 최종 배열로 변환 + 오늘 영업중 여부/태그 만들기
        const mapped = Array.from(byId.values()).map((h) => {
          const closedDaysUnique = Array.from(new Set(h.closedDays)).filter(Boolean);

          const openToday = !closedDaysUnique.includes(today); // 오늘이 휴진이면 false

          const tags = [];
          if (openToday) tags.push("open");
          if (h.tagsBase.night) tags.push("night");
          if (h.tagsBase.holiday) tags.push("holiday");
          if (h.tagsBase.reservable) tags.push("available");
          if (h.tagsBase.parking) tags.push("parking");
          if (h.tagsBase.femaleDoctor) tags.push("female");

          // 휴진 텍스트: 휴진일 있으면 "휴진일: ...", 없으면 "24시간운영"
          const closedText =
            closedDaysUnique.length > 0
              ? `휴진일 : ${closedDaysUnique.join(", ")}`
              : "24시간운영";

          return {
            ...h,
            open: openToday,
            openTime: h.openTime || "운영시간 정보 없음",
            closedDays: closedDaysUnique,
            closedText,
            tags,
            femaleDoctor: h.tagsBase.femaleDoctor,
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

    // 1) 병원명 검색
    const q = searchQuery.trim();
    if (q) list = list.filter((h) => (h.name || "").toLowerCase().includes(q.toLowerCase()));

    // 2) 모달 진료과 선택
    if (selectedDept && selectedDept !== "전체") {
      list = list.filter((h) => !h.dept || h.dept === selectedDept);
    }

    // 3) 모달 지역 선택
    list = list.filter((h) => matchRegionByAddr(h.address, region));

    // 4) 상세 필터(AND)
    if (activeFilters.length > 0) {
      list = list.filter((h) =>
        activeFilters.every((f) => {
          if (f === "female") return h.femaleDoctor === true;
          return (h.tags || []).includes(f);
        })
      );
    }

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

  return (
    <div className="hospital-search-page">
      {/* 검색 헤더 */}
      <section className="search-header-section">
        <div className="container-s2">
          <div className="search-header-content">
            <h1 className="search-page-title">
              <i className="fas fa-hospital-user" />
              병원 찾기
            </h1>
            <p className="search-page-subtitle">원하는 조건으로 가장 적합한 병원을 찾아보세요</p>

            {/* 검색바 */}
            <div className="search-input-wrapper">
              <div className="search-input-container">
                <i className="fas fa-search" />
                <input
                  type="text"
                  placeholder="병원명을 검색하세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="clear-search-btn"
                    onClick={() => setSearchQuery("")}
                    type="button"
                  >
                    <i className="fas fa-times" />
                  </button>
                )}
              </div>
            </div>

            {/* 지역/진료과 모달 버튼 */}
            <div className="quick-actions">
              <button type="button" className="quick-action-btn primary" onClick={() => setIsDeptOpen(true)}>
                <i className="fas fa-stethoscope" />
                <span>진료과별 찾기</span>
              </button>

              <button type="button" className="quick-action-btn ghost" onClick={() => setIsRegionOpen(true)}>
                <i className="fas fa-map-marked-alt" />
                <span>지역별 찾기</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 필터 섹션 */}
      <section className="filter-section">
        <div className="container-s2">
          {/* 상세 필터 */}
          <div className="filter-tags-section">
            <div className="filter-tags-label">
              <i className="fas fa-filter" />
              <span>상세 필터</span>
            </div>

            <div className="filter-tags-wrapper">
              {FILTER_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={`filter-tag ${activeFilters.includes(tag.id) ? "active" : ""}`}
                  style={{ "--tag-color": tag.color }}
                  onClick={() => toggleFilter(tag.id)}
                >
                  <i className={`fas fa-${tag.icon}`} />
                  <span>{tag.label}</span>
                  {activeFilters.includes(tag.id) && <i className="fas fa-check filter-check" />}
                </button>
              ))}
            </div>
          </div>

          {/* 결과/정렬 */}
          <div className="results-header">
            <div className="results-info">
              <span className="results-count">{sortedHospitals.length}</span>
              <span className="results-text">개의 병원</span>

              {activeFilters.length > 0 && (
                <button className="reset-filter-btn" onClick={() => setActiveFilters([])} type="button">
                  <i className="fas fa-rotate-left" />
                  필터 초기화
                </button>
              )}
            </div>

            <div className="sort-options">
              <span className="sort-label">정렬:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
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

      {/* 병원 리스트 */}
      <section className="hospital-list-section">
        <div className="container-s2">
          {!loading && !error && sortedHospitals.length === 0 ? (
            <div className="no-results">
              <i className="fas fa-search" />
              <h3>검색 결과가 없습니다</h3>
              <p>다른 조건으로 검색해보세요</p>
            </div>
          ) : (
            <div className="hospital-cards-grid">
              {sortedHospitals.map((hospital) => (
                <HospitalDetailCard
                  key={hospital.id}
                  hospital={hospital}
                  isBookmarked={bookmarkedHospitals.has(hospital.id)}
                  onToggleBookmark={() => toggleBookmark(hospital.id)}
                  onClick={() => navigate(`/hos_detail/${hospital.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 모달 유지 */}
      <HospitalDeptSelect
        isOpen={isDeptOpen}
        onClose={() => setIsDeptOpen(false)}
        onConfirm={({ deptName }) => {
          setSelectedDept(deptName);
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

/* 카드 컴포넌트 */
function HospitalDetailCard({ hospital, isBookmarked, onToggleBookmark, onClick }) {
  const ratingText = hospital.rating != null ? hospital.rating : "-";
  const reviewsText = hospital.reviews != null ? hospital.reviews : "-";

  return (
    <div className="hospital-detail-card" role="button" tabIndex={0} onClick={onClick}>
      <div className="hospital-thumbnail">
        <img src={hospital.thumbnail} alt={hospital.name} />
        <div className="thumbnail-overlay" onClick={(e) => e.stopPropagation()}>
          <button
            className={`bookmark-btn ${isBookmarked ? "active" : ""}`}
            onClick={onToggleBookmark}
            type="button"
          >
            <i className="fas fa-bookmark" />
          </button>

          {hospital.open ? (
            <span className="status-badge open">
              <i className="fas fa-circle" />
              진료중
            </span>
          ) : (
            <span className="status-badge closed">
              <i className="fas fa-circle" />
              진료종료
            </span>
          )}
        </div>
      </div>

      <div className="hospital-card-content">
        <div className="hospital-card-header">
          <div className="hospital-title-row">
            <h3 className="hospital-name">{hospital.name}</h3>
            <span className="dept-badge">{hospital.dept || "진료과 미정"}</span>
          </div>

          <div className="hospital-rating-row">
            <div className="rating-stars">
              <i className="fas fa-star" />
              <span className="rating-value">{ratingText}</span>
              <span className="rating-count">({reviewsText})</span>
            </div>

            {hospital.femaleDoctor && (
              <span className="female-doctor-badge">
                <i className="fas fa-user-doctor" />
                여의사
              </span>
            )}
          </div>
        </div>

        <div className="hospital-location">
          <div className="location-row">
            <i className="fas fa-location-dot" />
            <span className="address">{hospital.address || "주소 정보 없음"}</span>
          </div>

          <div className="location-detail">
            {hospital.distance && hospital.distance !== "0km" && (
              <span className="distance">
                <i className="fas fa-walking" />
                {hospital.distance}
              </span>
            )}
          </div>
        </div>

        <div className="hospital-info-grid">
          <div className="info-item">
            <i className="fas fa-phone" />
            <span>{hospital.phone || "전화번호 없음"}</span>
          </div>
          <div className="info-item">
            <i className="fas fa-clock" />
            <span>{hospital.openTime || "운영시간 정보 없음"}</span>
          </div>
        </div>

        {/* ✅ 점심 제거하고, 휴진일/24시간운영 표시 */}
        <div className="closed-days">
          <i className="fas fa-calendar-xmark" />
          <span>{hospital.closedText}</span>
        </div>

        <div className="hospital-features">
          {(hospital.tags || []).includes("night") && <span className="feature-tag">야간진료</span>}
          {(hospital.tags || []).includes("holiday") && <span className="feature-tag">공휴일진료</span>}
          {(hospital.tags || []).includes("available") && <span className="feature-tag">예약가능</span>}
          {(hospital.tags || []).includes("open") && <span className="feature-tag">영업중</span>}
        </div>

        <div className="hospital-card-actions" onClick={(e) => e.stopPropagation()}>
          <button className="btn-reserve-detail" type="button">
            <i className="fas fa-calendar-check" />
            <span>예약하기</span>
          </button>
          <button className="btn-call" type="button">
            <i className="fas fa-phone" />
          </button>
          <button className="btn-directions" type="button">
            <i className="fas fa-route" />
          </button>
        </div>
      </div>
    </div>
  );
}