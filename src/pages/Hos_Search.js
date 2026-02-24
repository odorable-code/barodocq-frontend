import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import RegionSelect from "../components/RegionSelect";
import Hos_DeptSelect from "../components/Hos_DeptSelect";
import "./Hos_Search.css";

const FILTERS = ["영업중", "야간진료", "휴일", "여의사", "예약가능"];

// ✅ 환경변수 있으면 쓰고, 없으면 로컬 기본값
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

// ✅ Y/N, 1/0, true/false 등 → boolean(or null)
const ynToBool = (v) => {
  if (v === true || v === false) return v;
  if (v === 1 || v === 0) return Boolean(v);
  if (v == null) return null;

  const s = String(v).trim().toUpperCase();
  if (s === "Y" || s === "YES" || s === "TRUE" || s === "T" || s === "1") return true;
  if (s === "N" || s === "NO" || s === "FALSE" || s === "F" || s === "0") return false;
  return null;
};

// ✅ 시/도 정규화 (주소 매칭용)
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

// ✅ 주소 기반 지역 매칭 (DB에 지역코드 없어도 프론트에서 필터 가능)
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
  if (sigunguName) {
    if (!a.includes(sigunguName)) return false;
  }
  if (emdName) {
    if (!a.includes(emdName)) return false;
  }
  return true;
};

async function fetchHospitals(params = {}) {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== "")
  );

  const qs = new URLSearchParams(cleaned).toString();
  const url = `${API_BASE_URL}/api/v1/hospitals/cards${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      // 병원 페이지가 토큰 필요 없으면 지워도 됨
      // Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`병원 목록 조회 실패 (status: ${res.status})\n${text.slice(0, 200)}`);
  }

  // 혹시 백엔드가 content 형태로 주는 경우 대비
  const data = await res.json();
  return Array.isArray(data) ? data : data?.content ?? [];
}

export default function Hos_Search() {
  const navigate = useNavigate();

  // ✅ UI 상태
  const [tab, setTab] = useState("dept"); // dept | region
  const [activeFilter, setActiveFilter] = useState(null);

  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);

  const [selectedDept, setSelectedDept] = useState(""); // "피부과", "전체" 등
  const [region, setRegion] = useState({ level: "", sido: null, sigungu: null, emd: null });

  // ✅ 병원명 검색
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ 백엔드 데이터
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ 페이지네이션
  const PAGE_SIZE = 10; // 2열 * 5줄
  const [page, setPage] = useState(1);

  // 라벨
  const deptLabel = selectedDept || "진료과 선택";
  const regionLabel = useMemo(() => {
    const parts = [region?.sido?.name, region?.sigungu?.name, region?.emd?.name].filter(Boolean);
    return parts.length ? parts.join(" ") : "지역 검색";
  }, [region]);

  // ✅ 백엔드 요청 파라미터 (백엔드가 무시해도 문제 없음)
  const queryParams = useMemo(() => {
    const params = {};
    params.tab = tab;

    // 진료과
    if (selectedDept && selectedDept !== "전체") params.dept = selectedDept;

    // 지역 코드
    if (region?.sido?.code) params.sidocode = region.sido.code;
    if (region?.sigungu?.code) params.sigungucode = region.sigungu.code;
    if (region?.emd?.code) params.eupmyeondongcode = region.emd.code;

    // 필터
    if (activeFilter) params.filter = activeFilter;

    // 검색어(병원명) - 백엔드가 아직 미지원이면 프론트에서만 처리됨
    if (searchTerm.trim()) params.q = searchTerm.trim();

    return params;
  }, [tab, selectedDept, region, activeFilter, searchTerm]);

  // ✅ API 호출
  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const list = await fetchHospitals(queryParams);

        const mapped = list.map((r, idx) => ({
          id: r.ho_num ?? idx + 1,
          name: r.ho_name ?? "병원이름",
          addr: r.ho_addr ?? "",
          phone: r.ho_phone ?? "",
          photo: r.ho_photo ?? "",

          dept: r.dept_name ?? "",
          rating: r.rv_rating ?? null,

          openYn: ynToBool(r.hh_open_yn),

          openTime: r.hh_open_time ?? null,
          closeTime: r.hh_close_time ?? null,
          lunchStart: r.hh_lunch_start ?? null,
          lunchEnd: r.hh_lunch_end ?? null,

          night: ynToBool(r.ho_night_yn) === true,
          holiday: ynToBool(r.ho_holiday_yn) === true,
          femaleDoctor: ynToBool(r.ho_female_doctor_yn) === true,
          reservable: ynToBool(r.ho_reservable_yn) === true,
        }));

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

  // ✅ 프론트 필터(백엔드가 아직 미지원이어도 화면 동작 유지)
  const visibleHospitals = useMemo(() => {
    let list = hospitals;

    // 1) 지역
    list = list.filter((h) => matchRegionByAddr(h.addr, region));

    // 2) 진료과
    if (selectedDept && selectedDept !== "전체") {
      list = list.filter((h) => !h.dept || h.dept === selectedDept);
    }

    // 3) 병원명 검색
    const keyword = searchTerm.trim();
    if (keyword) {
      list = list.filter((h) => (h.name || "").includes(keyword));
    }

    // 4) 필터칩
    if (activeFilter === "야간진료") list = list.filter((h) => h.night === true);
    if (activeFilter === "휴일") list = list.filter((h) => h.holiday === true);
    if (activeFilter === "영업중") list = list.filter((h) => h.openYn === true);
    if (activeFilter === "여의사") list = list.filter((h) => h.femaleDoctor === true);
    if (activeFilter === "예약가능") list = list.filter((h) => h.reservable === true);

    return list;
  }, [hospitals, region, selectedDept, activeFilter, searchTerm]);

  // ✅ 조건 바뀌면 1페이지로
  useEffect(() => {
    setPage(1);
  }, [region, selectedDept, activeFilter, searchTerm]);

  // ✅ 페이지네이션 계산
  const totalCount = visibleHospitals.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagedHospitals = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return visibleHospitals.slice(start, start + PAGE_SIZE);
  }, [visibleHospitals, page]);

  // ✅ 페이지 번호 묶음(1~5, 6~10)
  const PAGE_GROUP = 5;
  const currentGroupStart = Math.floor((page - 1) / PAGE_GROUP) * PAGE_GROUP + 1;
  const currentGroupEnd = Math.min(totalPages, currentGroupStart + PAGE_GROUP - 1);
  const pageNumbers = [];
  for (let i = currentGroupStart; i <= currentGroupEnd; i++) pageNumbers.push(i);

  // ✅ 검색 버튼(Enter랑 동일 UX)
  const handleSearch = () => setPage(1);

  return (
    <div className="hs">
      <div className="hs__topbar-placeholder">상단바 자리</div>

      <div className="hs__content">
        {/* ✅ 검색창(지역/진료과 + 병원명) */}
        <div className="hs__searchArea">
          <div className="hs__searchbar">
            <div className="hs__searchRegion" onClick={() => setIsRegionOpen(true)} role="button" tabIndex={0}>
              {regionLabel}
            </div>

            <div className="hs__searchLine" />

            <div className="hs__searchDept" onClick={() => setIsDeptOpen(true)} role="button" tabIndex={0}>
              {deptLabel}
            </div>

            <div className="hs__searchLine" />

            <input
              className="hs__searchInput"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="병원 이름을 입력하세요."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />

            <button className="hs__searchBtn" onClick={handleSearch} type="button">
              검색
            </button>
          </div>
        </div>

        {/* 탭(원하면 숨겨도 됨) */}
        <div className="hs__tabs">
          <button
            className={`hs__tab ${tab === "dept" ? "is-active" : ""}`}
            onClick={() => {
              setTab("dept");
              setIsDeptOpen(true);
              setIsRegionOpen(false);
            }}
            type="button"
          >
            진료과별 찾기
          </button>

          <button
            className={`hs__tab ${tab === "region" ? "is-active" : ""}`}
            onClick={() => {
              setTab("region");
              setIsRegionOpen(true);
              setIsDeptOpen(false);
            }}
            type="button"
          >
            지역별 찾기
          </button>
        </div>

        {/* 필터 + 결과 메타 */}
        <div className="hs__filters">
          <div className="hs__chips">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`hs__chip ${activeFilter === f ? "is-active" : ""}`}
                onClick={() => setActiveFilter((prev) => (prev === f ? null : f))}
                type="button"
              >
                {f}
              </button>
            ))}
          </div>

          <div className="hs__resultMeta">
            {totalCount}건 · {page}/{totalPages}페이지
          </div>
        </div>

        {loading && <div className="hs__stateText">병원 불러오는 중...</div>}
        {error && <div className="hs__stateText error">{error}</div>}

        {/* 카드 2열 */}
        {!loading && !error && (
          <>
            <div className="hs__grid">
              {pagedHospitals.length > 0 ? (
                pagedHospitals.map((h) => <HospitalCard key={h.id} hospital={h} onClick={() => navigate(`/hos_detail/${h.id}`)} />)
              ) : (
                <div className="hs__empty">검색 결과가 없습니다.</div>
              )}
            </div>

            {/* 페이지네이션(이전묶음/다음묶음 없음 + 첫/마지막 묶음에서 버튼 숨김) */}
            {totalCount > 0 && (
              <div className="hs__pagination">
                {currentGroupStart !== 1 && (
                  <>
                    <button className="pageBtn" onClick={() => setPage(1)} type="button">
                      « 처음
                    </button>
                    <button
                      className="pageBtn"
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={page === 1}
                      type="button"
                    >
                      ‹ 이전
                    </button>
                  </>
                )}

                <div className="pageNums">
                  {pageNumbers.map((n) => (
                    <button
                      key={n}
                      className={`pageNum ${n === page ? "active" : ""}`}
                      onClick={() => setPage(n)}
                      type="button"
                    >
                      {n}
                    </button>
                  ))}
                </div>

                {currentGroupEnd !== totalPages && (
                  <>
                    <button
                      className="pageBtn"
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={page === totalPages}
                      type="button"
                    >
                      다음 ›
                    </button>
                    <button className="pageBtn" onClick={() => setPage(totalPages)} type="button">
                      끝 »
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ✅ 진료과 모달 */}
      <Hos_DeptSelect
        isOpen={isDeptOpen}
        onClose={() => setIsDeptOpen(false)}
        onConfirm={({ deptName }) => {
          setSelectedDept(deptName);
          setIsDeptOpen(false);
        }}
      />

      {/* ✅ 지역 모달 */}
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

function HospitalCard({ hospital, onClick }) {
  const timeText =
    hospital.openTime && hospital.closeTime ? `${hospital.openTime} ~ ${hospital.closeTime}` : "운영시간 정보 없음";

  const lunchText =
    hospital.lunchStart && hospital.lunchEnd ? `점심 ${hospital.lunchStart} ~ ${hospital.lunchEnd}` : "";

  const openBadge =
    hospital.openYn === true ? "영업중" : hospital.openYn === false ? "휴무" : "영업여부 미정";

  return (
    <div className="hs-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="hs-card__left">
        <div className="hs-card__name">{hospital.name}</div>
        <div className="hs-card__meta">{hospital.addr || "주소 정보 없음"}</div>

        <div className="hs-card__meta">{hospital.dept ? `진료과: ${hospital.dept}` : "진료과 정보 없음"}</div>

        <div className="hs-card__meta">
          {hospital.rating != null ? `⭐ ${hospital.rating}` : "⭐ 별점 없음"} {" · "} {openBadge}
        </div>

        <div className="hs-card__meta">{timeText}</div>
        {lunchText && <div className="hs-card__meta">{lunchText}</div>}
        {hospital.phone && <div className="hs-card__meta">☎ {hospital.phone}</div>}
      </div>

      <div className="hs-card__right">
        <div className="hs-card__imgbox">
          {hospital.photo ? "병원사진" : <span className="noImage">이미지 없음</span>}
        </div>
      </div>
    </div>
  );
}