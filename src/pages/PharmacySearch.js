import { useMemo, useState } from "react";
import RegionSelect from "../components/RegionSelect";
import "./PharmacySearch.css";

function HoAndPhar() {

  const initialPharmacies = [
    { id: 1, name: "든든약국", addr: "서울특별시 종로구 청운동", isOpen: true, isNight: false, isHoliday: true, desc: "친절한 약국입니다." },
    { id: 2, name: "야간샘약국", addr: "경기도 성남시 분당구", isOpen: false, isNight: true, isHoliday: false, desc: "밤 12시까지 운영해요." },
    { id: 3, name: "365약국", addr: "서울특별시 강남구 역삼동", isOpen: true, isNight: true, isHoliday: true, desc: "항상 열려있습니다." },
    { id: 4, name: "우리동네약국", addr: "인천광역시 연수구", isOpen: true, isNight: false, isHoliday: false, desc: "우리 동네 친절한 약국" }
  ];

  const [filteredPharmacies, setFilteredPharmacies] = useState(initialPharmacies);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ 지역 모달 열림 상태/선택값
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [region, setRegion] = useState({ level: "", sido: null, sigungu: null, emd: null });

  // ✅ 병원에서 쓰던 로직 그대로 가져와도 됨
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
    if (sigunguName) {
      if (!a.includes(sigunguName)) return false;
    }
    if (emdName) {
      if (!a.includes(emdName)) return false;
    }
    return true;
  };

  // ✅ 지역 라벨
  const regionLabel = useMemo(() => {
    const parts = [region?.sido?.name, region?.sigungu?.name, region?.emd?.name].filter(Boolean);
    return parts.length ? parts.join(" ") : "지역 검색";
  }, [region]);

  // 3. 필터 함수(진료중/야간/공휴일)
  function handleFilterChange(type) {
    let result = [];
    if (type === "진료중") result = initialPharmacies.filter((p) => p.isOpen);
    else if (type === "야간진료") result = initialPharmacies.filter((p) => p.isNight);
    else if (type === "공휴일") result = initialPharmacies.filter((p) => p.isHoliday);
    else result = initialPharmacies;

    setFilteredPharmacies(result);
  }

  // 4. 검색 함수 (이름 + 지역까지 같이 적용하도록 개선)
  const handleSearch = () => {
    const result = initialPharmacies.filter((p) => {
      const byName = p.name.includes(searchTerm);
      const byRegion = matchRegionByAddr(p.addr, region);
      return byName && byRegion;
    });
    setFilteredPharmacies(result);
  };

  // ✅ 지역 선택만 바뀌면 자동으로 리스트도 갱신되게(선택사항)
  const visiblePharmacies = useMemo(() => {
    return filteredPharmacies.filter((p) => matchRegionByAddr(p.addr, region));
  }, [filteredPharmacies, region]);

  return (
    <div className="browser">
      <div className="container">
        <div className="upperContainer">
          <div className="logo">바로닥큐</div>
          <div className="searchbarDiv">
            <div className="searchbar">검색창</div>
          </div>
          <div className="login">로그인</div>
          <div className="signup">회원가입</div>
        </div>

        <div className="middleContainser">
          <div className="regionSearch">
            {/* ✅ 여기! navigate 대신 모달 열기 */}
            <div className="regionSearch1" onClick={() => setIsRegionOpen(true)}>
              {regionLabel}
            </div>

            <div className="searchLine"></div>

            <input
              className="regionSearch2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="약국 이름을 입력하세요."
            />

            <div className="searchBtn" onClick={handleSearch}>
              검색버튼
            </div>
          </div>

          <button className="filter1 filter2" onClick={() => handleFilterChange("진료중")}>진료중</button>
          <button className="filter1 filter2" onClick={() => handleFilterChange("야간진료")}>야간진료</button>
          <button className="filter1 filter2" onClick={() => handleFilterChange("공휴일")}>공휴일</button>
          <button className="filter1 filter2" onClick={() => handleFilterChange("전체")}>전체보기</button>
        </div>

        <div className="container2">
          <div className="map">지도</div>

          <div className="pharmacyContainer">
            {visiblePharmacies.length > 0 ? (
              visiblePharmacies.map((pharmacy) => (
                <div className="pharmacy" key={pharmacy.id}>
                  <div className="pharName">{pharmacy.name}</div>
                  <div className="pharExplain">
                    <div className="pharExplain1">{pharmacy.desc}</div>
                    <div className="pharPhoto">약국 사진</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="pharmacy">해당하는 약국이 없습니다.</div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ 지역 모달 붙이기 */}
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

export default HoAndPhar;