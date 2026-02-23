import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Hos_Search.css";

import Hos_RegionSelect from "../components/Hos_RegionSelect";
import Hos_DeptSelect from "../components/Hos_DeptSelect";

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

// ✅ 시/도 명칭 → 주소 매칭용 토큰으로 정규화
// "서울특별시" -> "서울", "경기도" -> "경기"
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
  // regionPick이 없거나 아무것도 선택 안 했으면 통과
  if (!regionPick) return true;
  const a = String(addr || "");

  const sidoName = regionPick?.sido?.name;
  const sigunguName = regionPick?.sigungu?.name;
  const emdName = regionPick?.emd?.name;

  if (!sidoName && !sigunguName && !emdName) return true;

  // 시/도
  if (sidoName) {
    const token = normalizeSidoToken(sidoName);
    if (token && !a.includes(token)) return false;
  }

  // 시/군/구
  if (sigunguName) {
    if (!a.includes(sigunguName)) return false;
  }

  // 읍/면/동
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

  const res = await fetch(url, { method: "GET" });

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
  const [selectedDept, setSelectedDept] = useState(""); // "피부과", "전체" 등

  // ✅ 지역 선택값: 모달이 넘기는 구조 그대로 보관
  // { level, sido:{code,name}, sigungu:{code,name}, emd:{code,name} }
  const [region, setRegion] = useState({
    level: "",
    sido: null,
    sigungu: null,
    emd: null,
  });

  // 선택 라벨
  const deptLabel = selectedDept || "진료과 선택";
  const regionLabel = useMemo(() => {
    const parts = [region?.sido?.name, region?.sigungu?.name, region?.emd?.name].filter(Boolean);
    return parts.length ? parts.join(" ") : "지역 선택";
  }, [region]);

  // 백엔드 요청
  const queryParams = useMemo(() => {
    const params = {};
    params.tab = tab;

    // ✅ 진료과: "전체"면 파라미터 안 보내기
    if (selectedDept && selectedDept !== "전체") params.dept = selectedDept;

    // ✅ 지역: 일단 코드로 보냄(나중에 백엔드 구현 시 그대로 사용 가능)
    // 백엔드가 아직 미구현이면 무시될 뿐이니 문제 없음
    if (region?.sido?.code) params.sidocode = region.sido.code;
    if (region?.sigungu?.code) params.sigungucode = region.sigungu.code;
    if (region?.emd?.code) params.eupmyeondongcode = region.emd.code;

    if (activeFilter) params.filter = activeFilter;

    return params;
  }, [tab, selectedDept, region, activeFilter]);

  // 백엔드에서 병원 목록 가져오기
  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchHospitals(queryParams);

        const list = Array.isArray(data) ? data : data?.content ?? [];

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

          // 아직 백엔드 없으면 false로 남아도 됨
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

  // 지역 주소 기반  프론트 필터링
  const visibleHospitals = useMemo(() => {
    let list = hospitals;

    // 1) 지역(주소 + JSON 지역명)
    list = list.filter((h) => matchRegionByAddr(h.addr, region));

    // 2) 진료과
    if (selectedDept && selectedDept !== "전체") {
      list = list.filter((h) => !h.dept || h.dept === selectedDept);
    }

    // 3) 필터 칩
    if (activeFilter === "야간진료") list = list.filter((h) => h.night === true);
    if (activeFilter === "휴일") list = list.filter((h) => h.holiday === true);
    if (activeFilter === "영업중") list = list.filter((h) => h.openYn === true);

    if (activeFilter === "여의사") list = list.filter((h) => h.femaleDoctor === true);
    if (activeFilter === "예약가능") list = list.filter((h) => h.reservable === true);

    return list;
  }, [hospitals, region, selectedDept, activeFilter]);

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

            {/*필터*/}
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

          <div style={{ padding: "8px 0", fontSize: 12, opacity: 0.8 }}>
            <span style={{ marginRight: 12 }}>진료과: {deptLabel}</span>
            <span>지역: {regionLabel}</span>
          </div>
        </div>

        {loading && <div style={{ padding: 12 }}>병원 불러오는 중...</div>}
        {error && <div style={{ padding: 12, color: "crimson" }}>{error}</div>}

        <div className="hs__grid">
          {!loading && !error && visibleHospitals.length === 0 && (
            <div style={{ padding: 12 }}>검색 결과가 없습니다.</div>
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
        onConfirm={({ deptName }) => {
          setSelectedDept(deptName);
          setIsDeptOpen(false);
        }}
      />

      {/* ✅ 지역 모달 (모달은 {level,sido,sigungu,emd}로 넘김) */}
      <Hos_RegionSelect
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

function HospitalCard({ hospital }) {
  const navigate = useNavigate();

  const timeText =
    hospital.openTime && hospital.closeTime
      ? `${hospital.openTime} ~ ${hospital.closeTime}`
      : "운영시간 정보 없음";

  const lunchText =
    hospital.lunchStart && hospital.lunchEnd ? `점심 ${hospital.lunchStart} ~ ${hospital.lunchEnd}` : "";

  const openBadge =
    hospital.openYn === true ? "영업중" : hospital.openYn === false ? "휴무" : "영업여부 미정";

  return (
    <div className="hs-card" onClick={() => navigate(`/hos_detail/${hospital.id}`)}>
      <div className="hs-card__left">
        <div className="hs-card__name">{hospital.name}</div>
        <div className="hs-card__info">{hospital.addr}</div>

        <div className="hs-card__meta">{hospital.dept ? `진료과: ${hospital.dept}` : "진료과 정보 없음"}</div>

        <div className="hs-card__meta">
          {hospital.rating != null ? `⭐ ${hospital.rating}` : "⭐ 별점 없음"} {" · "} {openBadge}
        </div>

        <div className="hs-card__meta">{timeText}</div>
        {lunchText && <div className="hs-card__meta">{lunchText}</div>}
        {hospital.phone && <div className="hs-card__meta">☎ {hospital.phone}</div>}
      </div>

      <div className="hs-card__right">
        <div className="hs-card__imgbox">{hospital.photo ? "병원사진" : "이미지 없음"}</div>
      </div>
    </div>
  );
}