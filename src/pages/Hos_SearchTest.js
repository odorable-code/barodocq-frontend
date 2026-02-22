import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Hos_Search.css";

import Hos_RegionSelect from "../components/Hos_RegionSelect";
import Hos_DeptSelect from "../components/Hos_DeptSelect";

const FILTERS = ["영업중", "야간진료", "휴일", "여의사", "예약가능"];

// ✅ 환경변수 있으면 쓰고, 없으면 로컬 기본값
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

async function fetchHospitals(params = {}) {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== "")
  );

  const qs = new URLSearchParams(cleaned).toString();

  // ✅ 백엔드 주소랑 맞춰서 통일
  const url = `${API_BASE_URL}/api/v1/hospitals/cards${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    // credentials: "include", // ✅ 지금은 빼!
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`병원 목록 조회 실패 (status: ${res.status})\n${text.slice(0, 120)}`);
  }

  return res.json();
}

export default function Hos_Search() {
  const [tab, setTab] = useState("dept"); // dept | region
  const [activeFilter, setActiveFilter] = useState(null);

  // ✅ 백엔드 데이터
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ 모달 열림 상태
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);

  // ✅ 선택값
  const [selectedDept, setSelectedDept] = useState(""); // "피부과" 등
  const [region, setRegion] = useState({
    sido: "",
    sigungu: "",
    eupmyeon: "",
  });

  // ✅ 라벨(필요하면 UI에 쓸 수 있음)
  const deptLabel = selectedDept || "진료과 선택";
  const regionLabel = useMemo(() => {
    const parts = [region.sido, region.sigungu, region.eupmyeon].filter(Boolean);
    return parts.length ? parts.join(" ") : "지역 선택";
  }, [region]);

  // ✅ 백엔드 요청 파라미터 만들기
  // (서버가 원하는 키로 맞춰주면 됨)
  const queryParams = useMemo(() => {
    const params = {};

    // 탭을 서버가 구분할 필요 없으면 이 줄 삭제해도 됨
    params.tab = tab;

    // 진료과
    if (selectedDept) params.dept = selectedDept;

    // 지역
    if (region.sido) params.sido = region.sido;
    if (region.sigungu) params.sigungu = region.sigungu;
    if (region.eupmyeon) params.eupmyeon = region.eupmyeon;

    // 필터(단일 선택 상태라서 activeFilter 하나만 전송)
    if (activeFilter) params.filter = activeFilter;

    return params;
  }, [tab, selectedDept, region, activeFilter]);

  // ✅ 백엔드에서 병원 목록 가져오기
  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchHospitals(queryParams);

        // 서버 응답이
        // 1) 배열: [...]
        // 2) 페이지 객체: { content: [...] }
        // 둘 다 커버
        const list = Array.isArray(data) ? data : (data?.content ?? []);

        // ✅ 프론트에서 쓰기 좋게 매핑 (DTO 키가 뭐든 대응)
        const mapped = list.map((r, idx) => ({
          // ✅ 기준은 ho_num (맞음)
          id: r.ho_num ?? idx + 1,

          name: r.ho_name ?? "병원이름",
          addr: r.ho_addr ?? "",
          phone: r.ho_phone ?? "",
          photo: r.ho_photo ?? "",

          dept: r.dept_name ?? "",           // ✅ 진료과
          rating: r.rv_rating ?? null,       // ✅ 별점(평균)

          openYn: r.hh_open_yn ?? null,      // ✅ 오늘 운영여부 (true/false/null)
          openTime: r.hh_open_time ?? null,
          closeTime: r.hh_close_time ?? null,
          lunchStart: r.hh_lunch_start ?? null,
          lunchEnd: r.hh_lunch_end ?? null,
        }));

        if (!ignore) setHospitals(mapped);
      } catch (e) {
        if (!ignore) {
          setHospitals([]);
          setError(e?.message || "에러가 발생했어");
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

  // ✅ 서버가 필터를 처리해줄 수도 있지만,
  // 지금은 “프론트에서도 한번 더” 적용하게 유지(원하면 삭제 가능)
  const visibleHospitals = useMemo(() => {
    let list = hospitals;

    if (activeFilter === "야간진료") list = list.filter((h) => h.night);
    if (activeFilter === "휴일") list = list.filter((h) => h.holiday);
    if (activeFilter === "영업중") list = list.filter((h) => h.openYn === true);

    // 지역 문자열 매칭(서버가 안 해주는 경우 대비)
    if (region.sido) list = list.filter((h) => (h.info || "").includes(region.sido));
    if (region.sigungu) list = list.filter((h) => (h.info || "").includes(region.sigungu));
    if (region.eupmyeon) list = list.filter((h) => (h.info || "").includes(region.eupmyeon));

    if (selectedDept) {
      list = list.filter((h) => {
        if (!h.dept) return true; // dept 데이터가 없으면 일단 유지(테스트)
        return h.dept === selectedDept;
      });
    }

    return list;
  }, [hospitals, activeFilter, region, selectedDept]);

  return (
    <div className="hs">
      <div className="hs__topbar-placeholder">상단바 자리</div>

      <div className="hs__content">
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

        <div className="hs__filters">
          <div className="hs__filters-title">필터 나열</div>

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
        </div>

        {loading && <div style={{ padding: 12 }}>병원 불러오는 중...</div>}
        {error && <div style={{ padding: 12, color: "crimson" }}>{error}</div>}

        <div className="hs__grid">
          {!loading && !error && visibleHospitals.length === 0 && (
            <div style={{ padding: 12 }}>검색 결과가 없어.</div>
          )}

          {visibleHospitals.map((h) => (
            <HospitalCard key={h.id} hospital={h} />
          ))}
        </div>
      </div>

      {/* ✅ 진료과 모달 */}
      <Hos_DeptSelect
        isOpen={isDeptOpen}
        onClose={() => setIsDeptOpen(false)}
        selectedDept={selectedDept}
        onConfirm={(dept) => {
          setSelectedDept(dept);
          setIsDeptOpen(false);
        }}
      />

      {/* ✅ 지역 모달 */}
      <Hos_RegionSelect
        isOpen={isRegionOpen}
        onClose={() => setIsRegionOpen(false)}
        value={region}
        onConfirm={(nextRegion) => {
          setRegion(nextRegion);
          setIsRegionOpen(false);
        }}
      />
    </div>
  );
}

function HospitalCard({ hospital }) {
  const navigate = useNavigate();

  const timeText =
    hospital.openTime && hospital.closeTime
      ? `${hospital.openTime} ~ ${hospital.closeTime}`
      : "운영시간 정보 없음";

  const lunchText =
    hospital.lunchStart && hospital.lunchEnd
      ? `점심 ${hospital.lunchStart} ~ ${hospital.lunchEnd}`
      : "";

  const openBadge =
    hospital.openYn === true ? "영업중" : hospital.openYn === false ? "휴무" : "영업여부 미정";

  return (
    <div className="hs-card" onClick={() => navigate(`/hos_detail/${hospital.id}`)}>
      <div className="hs-card__left">
        <div className="hs-card__name">{hospital.name}</div>
        <div className="hs-card__info">{hospital.addr}</div>

        <div className="hs-card__meta">
          {hospital.dept ? `진료과: ${hospital.dept}` : "진료과 정보 없음"}
        </div>

        <div className="hs-card__meta">
          {hospital.rating != null ? `⭐ ${hospital.rating}` : "⭐ 별점 없음"}
          {" · "}
          {openBadge}
        </div>

        <div className="hs-card__meta">{timeText}</div>
        {lunchText && <div className="hs-card__meta">{lunchText}</div>}
        {hospital.phone && <div className="hs-card__meta">☎ {hospital.phone}</div>}
      </div>

      <div className="hs-card__right">
        <div className="hs-card__imgbox">
          {hospital.photo ? "병원사진" : "이미지 없음"}
        </div>
      </div>
    </div>
  );
}