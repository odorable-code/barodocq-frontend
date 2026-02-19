import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const hospitals = useMemo(() => {
    // TODO: 나중에 tab, filter에 따라 API 호출/필터링
    return DUMMY;
  }, [tab, activeFilter]);

  return (
    <div className="hs">
      {/* ✅ 상단바 자리만 확보 (나중에 TopBar가 들어갈 자리) */}
      <div className="hs__topbar-placeholder">상단바 자리</div>

      <div className="hs__content">
        {/* 탭 버튼 */}
        <div className="hs__tabs">
          <button
            className={`hs__tab ${tab === "dept" ? "is-active" : ""}`}
            onClick={() => setTab("dept")}
          >
            진료과별 찾기
          </button>
          <button
            className={`hs__tab ${tab === "region" ? "is-active" : ""}`}
            onClick={() => setTab("region")}
          >
            지역별 찾기
          </button>
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
    </div>
  );
}

function HospitalCard({ hospital }) {
  const navigate = useNavigate();

  return (
    <div
      className="hs-card"
      onClick={() => navigate(`/hospitals/${hospital.id}`)}
    >
      <div className="hs-card__left">
        <div className="hs-card__name">{hospital.name}</div>
        <div className="hs-card__info">{hospital.info}</div>
      </div>

      <div className="hs-card__right">
        <div className="hs-card__imgbox">
          {hospital.image ? "병원사진" : "이미지 없음"}
        </div>
      </div>
    </div>
  );
}
