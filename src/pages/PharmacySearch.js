// HoAndPhar.js (DB 연동 + 지역모달필터 + 검색 + 2열/10개 페이지네이션 + 운영시간 없으면 "운영시간 정보 없음")
import { useEffect, useMemo, useState } from "react";
import RegionSelect from "../components/RegionSelect";
import "./PharmacySearch.css";

// 환경변수 있으면 쓰고, 없으면 로컬 기본값
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

// Y/N, 1/0, true/false 등 → boolean(or null)
const ynToBool = (v) => {
  if (v === true || v === false) return v;
  if (v === 1 || v === 0) return Boolean(v);
  if (v == null) return null;

  const s = String(v).trim().toUpperCase();
  if (s === "Y" || s === "YES" || s === "TRUE" || s === "T" || s === "1") return true;
  if (s === "N" || s === "NO" || s === "FALSE" || s === "F" || s === "0") return false;
  return null;
};

// 시/도 정규화 (주소 매칭용)
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

async function fetchPharmacies() {
  const url = `${API_BASE_URL}/api/v1/pharmacy/cards`;
  const res = await fetch(url, { method: "GET" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`약국 목록 조회 실패 (status: ${res.status})\n${text.slice(0, 120)}`);
  }
  return res.json();
}

export default function HoAndPhar() {
  // 백엔드 데이터
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 검색/필터 상태(프론트 필터)
  const [filteredPharmacies, setFilteredPharmacies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("전체"); // "진료중" | "야간진료" | "공휴일" | "전체"

  // 지역 모달 상태/선택값
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [region, setRegion] = useState({ level: "", sido: null, sigungu: null, emd: null });

  // 페이지네이션
  const PAGE_SIZE = 10; // 2열 * 5줄
  const [page, setPage] = useState(1);

  // 지역 라벨
  const regionLabel = useMemo(() => {
    const parts = [region?.sido?.name, region?.sigungu?.name, region?.emd?.name].filter(Boolean);
    return parts.length ? parts.join(" ") : "지역 검색";
  }, [region]);

  // 최초 로딩: DB에서 약국 리스트 가져오기
  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchPharmacies();
        const list = Array.isArray(data) ? data : data?.content ?? [];

        const mapped = list.map((r, idx) => ({
          id: r.ph_num ?? idx + 1,
          name: r.ph_name ?? "약국명",
          addr: r.ph_addr ?? "",
          phone: r.ph_phone ?? "",
          photo: r.ph_photo ?? "",

          openTime: r.phh_open_time ?? null,
          closeTime: r.phh_close_time ?? null,

          // 1이면 표시, 0이면 아예 표시 X
          isNight: ynToBool(r.ph_night_yn) === true,
          isHoliday: ynToBool(r.ph_holiday_yn) === true,
        }));

        if (!ignore) {
          setPharmacies(mapped);
          setFilteredPharmacies(mapped);
          setPage(1);
        }
      } catch (e) {
        if (!ignore) {
          setPharmacies([]);
          setFilteredPharmacies([]);
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
  }, []);

  //  필터 버튼 (진료중/야간/공휴일/전체)
  // - "진료중"은 openTime/closeTime이 있으면 간단 계산(자정넘김 대응)
  const isOpenNow = (openTime, closeTime) => {
    if (!openTime || !closeTime) return null; // 운영시간 정보 없음
    const now = new Date();

    const [oh, om] = String(openTime).split(":").map(Number);
    const [ch, cm] = String(closeTime).split(":").map(Number);

    if (Number.isNaN(oh) || Number.isNaN(om) || Number.isNaN(ch) || Number.isNaN(cm)) return null;

    const open = new Date(now);
    open.setHours(oh, om, 0, 0);

    const close = new Date(now);
    close.setHours(ch, cm, 0, 0);

    // 자정 넘기는 영업시간(예: 18:00~02:00)
    if (close < open) close.setDate(close.getDate() + 1);

    return now >= open && now <= close;
  };

  const handleFilterChange = (type) => {
    setActiveFilter(type);

    let result = pharmacies;

    if (type === "야간진료") result = pharmacies.filter((p) => p.isNight);
    else if (type === "공휴일") result = pharmacies.filter((p) => p.isHoliday);
    else if (type === "진료중")
      result = pharmacies.filter((p) => isOpenNow(p.openTime, p.closeTime) === true);
    else result = pharmacies;

    // 검색어도 같이 유지하고 싶으면 여기서 searchTerm까지 적용
    const keyword = searchTerm.trim();
    if (keyword) result = result.filter((p) => p.name.includes(keyword));

    setFilteredPharmacies(result);
    setPage(1);
  };

  // 검색 (이름 + 지역 적용)
  const handleSearch = () => {
    const keyword = searchTerm.trim();

    let result = pharmacies;

    // 필터 유지
    if (activeFilter === "야간진료") result = result.filter((p) => p.isNight);
    if (activeFilter === "공휴일") result = result.filter((p) => p.isHoliday);
    if (activeFilter === "진료중")
      result = result.filter((p) => isOpenNow(p.openTime, p.closeTime) === true);

    // 이름 검색
    if (keyword) result = result.filter((p) => p.name.includes(keyword));

    setFilteredPharmacies(result);
    setPage(1);
  };

  // 지역 선택 적용(항상 리스트에 반영)
  const regionAppliedList = useMemo(() => {
    return filteredPharmacies.filter((p) => matchRegionByAddr(p.addr, region));
  }, [filteredPharmacies, region]);

  // 지역 바뀌면 1페이지
  useEffect(() => {
    setPage(1);
  }, [region]);

  // 페이지네이션 계산
  const totalCount = regionAppliedList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagedPharmacies = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return regionAppliedList.slice(start, start + PAGE_SIZE);
  }, [regionAppliedList, page]);

  // 페이지 번호 묶음(1~5, 6~10)
  const PAGE_GROUP = 5;
  const currentGroupStart = Math.floor((page - 1) / PAGE_GROUP) * PAGE_GROUP + 1;
  const currentGroupEnd = Math.min(totalPages, currentGroupStart + PAGE_GROUP - 1);
  const pageNumbers = [];
  for (let i = currentGroupStart; i <= currentGroupEnd; i++) pageNumbers.push(i);

  const timeText = (openTime, closeTime) => {
    if (openTime && closeTime) return `${openTime} ~ ${closeTime}`;
    return "운영시간 정보 없음";
  };

  return (
    <div className="browser">
      <div className="container">
        {/* 검색 + 필터 영역 */}
        <div className="middleContainser">
          <div className="regionSearch">
            <div className="regionSearch1" onClick={() => setIsRegionOpen(true)}>
              {regionLabel}
            </div>

            <div className="searchLine"></div>

            <input
              className="regionSearch2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="약국 이름을 입력하세요."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />

            <div className="searchBtn" onClick={handleSearch}>
              검색버튼
            </div>
          </div>

          <div className="filter-group">
            <button
              className={`filter1 filter2 ${activeFilter === "진료중" ? "is-active" : ""}`}
              onClick={() => handleFilterChange("진료중")}
            >
              진료중
            </button>
            <button
              className={`filter1 filter2 ${activeFilter === "야간진료" ? "is-active" : ""}`}
              onClick={() => handleFilterChange("야간진료")}
            >
              야간진료
            </button>
            <button
              className={`filter1 filter2 ${activeFilter === "공휴일" ? "is-active" : ""}`}
              onClick={() => handleFilterChange("공휴일")}
            >
              공휴일
            </button>
            <button
              className={`filter1 filter2 ${activeFilter === "전체" ? "is-active" : ""}`}
              onClick={() => handleFilterChange("전체")}
            >
              전체보기
            </button>
          </div>
        </div>

        {/* 지도 + 결과 영역 */}
        <div className="container2">
          <div className="map">지도영역</div>

          <div className="resultWrap">
            <div className="resultHeader">
              <div className="resultTitle">약국정보</div>
              <div className="resultCount">
                {totalCount}건 · {page}/{totalPages}페이지
              </div>
            </div>

            {loading && <div className="stateText">약국 불러오는 중...</div>}
            {error && <div className="stateText error">{error}</div>}

            {/* ✅ 2열 / 5행 페이지당 10개 */}
            {!loading && !error && (
              <>
                <div className="pharmacyContainer">
                  {pagedPharmacies.length > 0 ? (
                    pagedPharmacies.map((p) => (
                      <div className="pharmacyCard" key={p.id}>
                        {/* 왼쪽: 사진(썸네일) */}
                        <div className="cardThumb">
                          {p.photo ? (
                            <img
                              className="cardThumbImg"
                              src={p.photo}
                              alt={`${p.name} 썸네일`}
                            />
                          ) : (
                            <div className="noImage">이미지 없음</div>
                          )}
                        </div>

                        {/* 오른쪽: 약국 정보 */}
                        <div className="cardBody">
                          <div className="cardTopRow">
                            <div className="pharName">{p.name}</div>

                            <div className="badgeRow">
                              {p.isNight && <span className="badge">야간</span>}
                              {p.isHoliday && <span className="badge">공휴일</span>}
                            </div>
                          </div>

                          <div className="pharAddr">{p.addr}</div>

                          <div className="pharMeta">
                            <span className="metaLabel">☎</span> {p.phone || "전화번호 정보 없음"}
                          </div>

                          <div className="pharMeta">
                            <span className="metaLabel">⏰</span> {timeText(p.openTime, p.closeTime)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="emptyState">해당하는 약국이 없습니다.</div>
                  )}
                </div>

                {/* 페이지네이션 */}
                  {totalCount > 0 && (
                    <div className="pagination">
                      {/* 첫 묶음에서 "처음/이전" 숨김 */}
                      {currentGroupStart !== 1 && (
                        <>
                          <button className="pageBtn" onClick={() => setPage(1)}>
                            « 처음
                          </button>

                          <button
                            className="pageBtn"
                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            disabled={page === 1}
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
                          >
                            {n}
                          </button>
                        ))}
                      </div>

                      {/* 마지막 묶음 "다음/끝" 숨김 */}
                      {currentGroupEnd !== totalPages && (
                        <>
                          <button
                            className="pageBtn"
                            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={page === totalPages}
                          >
                            다음 ›
                          </button>

                          <button className="pageBtn" onClick={() => setPage(totalPages)}>
                            끝 »
                          </button>
                        </>
                      )}
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      </div>

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