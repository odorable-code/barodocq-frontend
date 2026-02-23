import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import RegionSelect from "../components/RegionSelect";
import Hos_DeptSelect from "../components/Hos_DeptSelect";
import "./Hos_Search.css";

const FILTERS = ["영업중", "야간진료", "휴일", "여의사", "예약가능"]; // 예시

const DUMMY = [
  { id: 1, name: "병원이름", info: "병원정보 블라블라", image: true },
  { id: 2, name: "병원이름", info: "병원정보 블라블라", image: false },
  { id: 3, name: "병원이름", info: "병원정보 블라블라", image: true },
  { id: 4, name: "병원이름", info: "병원정보 블라블라", image: false },
  { id: 5, name: "병원이름", info: "병원정보 블라블라", image: true },
  { id: 6, name: "병원이름", info: "병원정보 블라블라", image: false },
  { id: 7, name: "병원이름", info: "병원정보 블라블라", image: true },
  { id: 8, name: "병원이름", info: "병원정보 블라블라", image: false },
];

export default function HospitalSearchPage() {
  const [tab, setTab] = useState("dept"); // 'dept' | 'region'
  const [activeFilter, setActiveFilter] = useState(null);

  // 모달 열림 상태
  const [regionOpen, setRegionOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);

  // 선택 결과 텍스트
  const [regionText, setRegionText] = useState("");
  const [deptText, setDeptText] = useState(""); 

  // (선택) 나중에 API 파라미터용 코드 저장해두고 싶으면 여기에
  const [regionCodes, setRegionCodes] = useState({
    sidoCode: null,
    sigunguCode: null,
    emdCode: null,
  });

  const hospitals = useMemo(() => {
    // TODO: 나중에 tab, filter, regionText에 따라 API 호출/필터링
    return DUMMY;
  }, [tab, activeFilter, regionText]);

    // 탭 클릭 선택시 : 해당 모달 열기
  const handleDeptTab = () => {
    setTab("dept");
    setRegionOpen(false);
    setDeptOpen(true);
  };

  const handleRegionTab = () => {
    setTab("region");
    setDeptOpen(false); //진료과
    setRegionOpen(true); //지역
  };

   // ✅ 모달 닫기 공통 (원하면 닫을 때 탭을 dept로 돌릴 수도 있음)
  const closeDeptModal = () => setDeptOpen(false);
  const closeRegionModal = () => setRegionOpen(false);


  return (
    <div className="hs">
      {/* ✅ 상단바 자리 */}
      <div className="hs__topbar-placeholder">상단바 자리</div>

      <div className="hs__content">
        {/* 탭 버튼 */}
        <div className="hs__tabs">
          <button
            className={`hs__tab ${tab === "dept" ? "is-active" : ""}`}
            onClick={handleDeptTab}
            type="button"
          >
            진료과별 찾기
          </button>

          <button
            className={`hs__tab ${tab === "region" ? "is-active" : ""}`}
            onClick={handleRegionTab}
            type="button"
          >
            지역별 찾기
          </button>
        </div>

         {/* ✅ 선택 결과 표시(원하는 경우) */}
        <div className="hs__selected-row">
          <div className="hs__selected-pill">
            <span className="hs__selected-label">진료과:</span>{" "}
            <span className="hs__selected-value">{deptText || "미선택"}</span>
          </div>

          <div className="hs__selected-pill">
            <span className="hs__selected-label">지역:</span>{" "}
            <span className="hs__selected-value">{regionText || "미선택"}</span>
          </div>
        </div>


        {/* 필터 나열 */}
        <div className="hs__filters">
          <div className="hs__filters-title">
            필터 나열 (ex. 영업중, 야간진료 등등 추후 데이터 정리)
          </div>

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

        {/* 병원 카드 그리드 */}
        <div className="hs__grid">
          {hospitals.map((h) => (
            <HospitalCard key={h.id} hospital={h} />
          ))}
        </div>
      </div>

       {/* ✅ 지역 선택 모달 */}
      <RegionSelect
        isOpen={regionOpen}
        onClose={closeRegionModal}
        onConfirm={({ sido, sigungu, emd }) => {
          const text = `${sido?.name ?? ""} ${sigungu?.name ?? ""} ${emd?.name ?? ""}`.trim();
          setRegionText(text);

          setRegionCodes({
            sidoCode: sido?.code ?? null,
            sigunguCode: sigungu?.code ?? null,
            emdCode: emd?.code ?? null,
          });

          setRegionOpen(false);
        }}
      />

      {/* ✅ 진료과 선택 모달 */}
      <Hos_DeptSelect
        isOpen={deptOpen}
        onClose={closeDeptModal}
        onConfirm={({ deptName }) => {
          setDeptText(deptName);
          setDeptOpen(false);
        }}
      />
    </div>
  );
}


function HospitalCard({ hospital }) {
  const navigate = useNavigate();

  return (
    <div className="hs-card" onClick={() => navigate(`/hospitals/${hospital.id}`)}>
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