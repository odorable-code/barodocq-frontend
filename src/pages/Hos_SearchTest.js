import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";
import "./Hos_Search.css";

// ✅ 너가 만든 모달 컴포넌트들 (경로는 네 프로젝트에 맞게 수정!)
import Hos_RegionSelect from "../components/Hos_RegionSelect";
import Hos_DeptSelect from "../components/Hos_DeptSelect";

const FILTERS = ["영업중", "야간진료", "휴일", "여의사", "예약가능"];

export default function Hos_Search() {
  const [tab, setTab] = useState("dept"); // dept | region
  const [activeFilter, setActiveFilter] = useState(null);

  // ✅ CSV 데이터
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ 모달 열림 상태
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);

  // ✅ 선택값 (Hos_Search가 최종 상태를 들고 있음)
  const [selectedDept, setSelectedDept] = useState(""); // "피부과" 등
  const [region, setRegion] = useState({
    sido: "",
    sigungu: "",
    eupmyeon: "",
  });

  // ✅ 라벨
  const deptLabel = selectedDept || "진료과 선택";
  const regionLabel = useMemo(() => {
    const parts = [region.sido, region.sigungu, region.eupmyeon].filter(Boolean);
    return parts.length ? parts.join(" ") : "지역 선택";
  }, [region]);

  // ✅ CSV 불러오기
  useEffect(() => {
    const loadCsv = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/hospitals.csv"); // public/hospitals.csv
        if (!res.ok) throw new Error("CSV 파일을 못 불러왔어. public 폴더 확인!");

        const csvText = await res.text();

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const rows = results.data;

            // ⚠️ 여기 매핑은 너 CSV 컬럼에 맞춰 쓰면 됨
            const mapped = rows.map((r, idx) => ({
              id: r.ho_num || r.id || idx + 1,
              name: r.ho_name || r.name || "병원이름",
              info: r.ho_addr || r.address || "병원정보",
              image: Boolean(r.ho_photo || r.photo || r.imageUrl),

              // 필터용
              night: String(r.ho_night_yn) === "1" || String(r.ho_night_yn).toLowerCase() === "true",
              holiday: String(r.ho_holiday_yn) === "1" || String(r.ho_holiday_yn).toLowerCase() === "true",
              open: String(r.ho_open_yn) === "1" || String(r.ho_open_yn).toLowerCase() === "true",

              // 진료과/지역 컬럼이 CSV에 없으면 여기 값은 비어있을 수 있음 (괜찮음)
              dept: r.dept_name || r.ho_dept || "",
            }));

            setHospitals(mapped);
          },
          error: () => setError("CSV 파싱 중 에러가 났어"),
        });
      } catch (e) {
        setError(e.message || "에러가 발생했어");
      } finally {
        setLoading(false);
      }
    };

    loadCsv();
  }, []);

  // ✅ 탭은 “표시용”이고, 모달은 버튼으로 열어 (자동오픈 X)
  const openDept = () => setIsDeptOpen(true);
  const openRegion = () => setIsRegionOpen(true);

  // ✅ 필터 적용
  const visibleHospitals = useMemo(() => {
    let list = hospitals;

    // 칩 필터 예시
    if (activeFilter === "야간진료") list = list.filter((h) => h.night);
    if (activeFilter === "휴일") list = list.filter((h) => h.holiday);
    if (activeFilter === "영업중") list = list.filter((h) => h.open);

    // ✅ 지역 필터 (CSV에 지역 분리 컬럼이 없으니까 주소(info) 문자열로 매칭)
    if (region.sido) list = list.filter((h) => (h.info || "").includes(region.sido));
    if (region.sigungu) list = list.filter((h) => (h.info || "").includes(region.sigungu));
    if (region.eupmyeon) list = list.filter((h) => (h.info || "").includes(region.eupmyeon));

    // ✅ 진료과 필터 (CSV에 dept 컬럼이 있을 때만 동작)
    if (selectedDept) {
      list = list.filter((h) => {
        if (!h.dept) return true; // CSV에 dept가 없으면 “일단 전체 유지” (테스트 단계)
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
              setIsDeptOpen(true);      // ✅ 탭 누르면 진료과 모달 열기
              setIsRegionOpen(false);   // ✅ 혹시 열려있던 지역 모달 닫기
           }}
              type="button"
          >
            진료과별 찾기
          </button>

          <button
            className={`hs__tab ${tab === "region" ? "is-active" : ""}`}
            onClick={() => {
              setTab("region");
              setIsRegionOpen(true);    // ✅ 탭 누르면 지역 모달 열기
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

        {loading && <div style={{ padding: 12 }}>CSV 불러오는 중...</div>}
        {error && <div style={{ padding: 12, color: "crimson" }}>{error}</div>}

        <div className="hs__grid">
          {visibleHospitals.map((h) => (
            <HospitalCard key={h.id} hospital={h} />
          ))}
        </div>
      </div>

      {/* ✅ 너가 만든 진료과 모달 */}
      <Hos_DeptSelect
        isOpen={isDeptOpen}
        onClose={() => setIsDeptOpen(false)}
        selectedDept={selectedDept}
        onConfirm={(dept) => {
          setSelectedDept(dept);
          setIsDeptOpen(false);
        }}
      />

      {/* ✅ 너가 만든 지역 모달 */}
      <Hos_RegionSelect
        isOpen={isRegionOpen}
        onClose={() => setIsRegionOpen(false)}
        value={region} // {sido,sigungu,eupmyeon}
        onConfirm={(nextRegion) => {
          // nextRegion도 {sido,sigungu,eupmyeon} 형태로 보내주면 제일 편함
          setRegion(nextRegion);
          setIsRegionOpen(false);
        }}
      />
    </div>
  );
}

function HospitalCard({ hospital }) {
  const navigate = useNavigate();

  return (
    <div className="hs-card" onClick={() => navigate(`/hos_detail/${hospital.id}`)}>
      <div className="hs-card__left">
        <div className="hs-card__name">{hospital.name}</div>
        <div className="hs-card__info">{hospital.info}</div>
      </div>

      <div className="hs-card__right">
        <div className="hs-card__imgbox">{hospital.image ? "병원사진" : "이미지 없음"}</div>
      </div>
    </div>
  );
}