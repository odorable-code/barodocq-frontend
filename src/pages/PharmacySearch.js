import { useEffect, useMemo, useState } from "react";
import RegionSelect from "../components/RegionSelect";
import "../assets/styles/PharmacySearch.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

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
  const { sido, sigungu, emd } = regionPick;
  if (sido?.name) {
    const token = normalizeSidoToken(sido.name);
    if (token && !a.includes(token)) return false;
  }
  if (sigungu?.name && !a.includes(sigungu.name)) return false;
  if (emd?.name && !a.includes(emd.name)) return false;
  return true;
};

async function fetchPharmacies() {
  const res = await fetch(`${API_BASE_URL}/api/v1/pharmacy/cards`);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `약국 목록 조회 실패 (status: ${res.status})\n${txt.slice(0, 120)}`
    );
  }
  return res.json();
}

export default function HoAndPhar() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("전체");

  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [region, setRegion] = useState({
    level: "",
    sido: null,
    sigungu: null,
    emd: null,
  });

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const isOpenNow = useCallback((openTime, closeTime) => {
    if (!openTime || !closeTime) return null;
    const now = new Date();
    const [oh, om] = String(openTime).split(":").map(Number);
    const [ch, cm] = String(closeTime).split(":").map(Number);
    if ([oh, om, ch, cm].some(isNaN)) return null;
    const open = new Date(now);
    open.setHours(oh, om, 0, 0);
    const close = new Date(now);
    close.setHours(ch, cm, 0, 0);
    if (close < open) close.setDate(close.getDate() + 1);
    return now >= open && now <= close;
  }, []);

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
          isNight: ynToBool(r.ph_night_yn),
          isHoliday: ynToBool(r.ph_holiday_yn),
        }));
        if (!ignore) {
          setPharmacies(mapped);
          setPage(1);
        }
      } catch (e) {
        if (!ignore) {
          setPharmacies([]);
          setError(e?.message || "에러 발생");
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

  const filteredPharmacies = useMemo(() => {
    let result = pharmacies;
    if (activeFilter === "진료중")
      result = result.filter((p) => isOpenNow(p.openTime, p.closeTime));
    else if (activeFilter === "야간진료") result = result.filter((p) => p.isNight);
    else if (activeFilter === "공휴일") result = result.filter((p) => p.isHoliday);

    const keyword = searchTerm.trim();
    if (keyword)
      result = result.filter(
        (p) => p.name.includes(keyword) || p.addr.includes(keyword)
      );
    result = result.filter((p) => matchRegionByAddr(p.addr, region));
    return result;
  }, [pharmacies, activeFilter, searchTerm, region, isOpenNow]);

  const totalCount = filteredPharmacies.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pagedPharmacies = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredPharmacies.slice(start, start + PAGE_SIZE);
  }, [filteredPharmacies, page]);

  const regionLabel = useMemo(() => {
    const parts = [region?.sido?.name, region?.sigungu?.name, region?.emd?.name].filter(Boolean);
    return parts.length ? parts.join(" ") : "지역 검색";
  }, [region]);

  const handleFilterChange = useCallback((type) => {
    setActiveFilter(type);
    setPage(1);
  }, []);
  const handleSearch = useCallback(() => setPage(1), []);
  const handleRegionConfirm = useCallback((nextRegion) => {
    setRegion(nextRegion);
    setIsRegionOpen(false);
    setPage(1);
  }, []);
  const timeText = useCallback(
    (open, close) => (open && close ? `${open} ~ ${close}` : "운영시간 정보 없음"),
    []
  );

  const PAGE_GROUP = 5;
  const currentGroupStart = Math.floor((page - 1) / PAGE_GROUP) * PAGE_GROUP + 1;
  const currentGroupEnd = Math.min(totalPages, currentGroupStart + PAGE_GROUP - 1);
  const pageNumbers = useMemo(() => {
    const numbers = [];
    for (let i = currentGroupStart; i <= currentGroupEnd; i++) numbers.push(i);
    return numbers;
  }, [currentGroupStart, currentGroupEnd]);

  return (
    <div className="browser">
      <div className="container">
        {/* 검색 + 필터 */}
        <div className="middleContainser">
          <div className="regionSearch">
            <div className="regionSearch1" onClick={() => setIsRegionOpen(true)}>
              <FontAwesomeIcon icon={faMapMarkerAlt} /> {regionLabel}
            </div>
            <div className="searchLine" />
            <input
              className="regionSearch2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="약국 이름 또는 주소를 입력하세요"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="searchBtn" onClick={handleSearch}>
              <FontAwesomeIcon icon={faMagnifyingGlass} /> 검색
            </button>
          </div>
          <div className="filter-group">
            {["진료중", "야간진료", "공휴일", "전체"].map((f) => {
              let icon = null;
              if (f === "진료중") icon = faSun;
              else if (f === "야간진료") icon = faMoon;
              else if (f === "공휴일") icon = faCalendarDay;
              return (
                <button
                  key={f}
                  className={`filter1 filter2 ${activeFilter === f ? "is-active" : ""}`}
                  onClick={() => handleFilterChange(f)}
                >
                  {icon && <span className="filterIcon"><FontAwesomeIcon icon={icon} /></span>}
                  <span className="filterText">{f}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 지도 + 결과 */}
        <div className="container2">
          <div className="map">지도 영역</div>
          <div className="resultWrap">
            <div className="resultHeader">
              <h2 className="resultTitle">약국정보</h2>
              <div className="resultCount">
                {totalCount}건 · {page}/{totalPages}페이지
              </div>
            </div>

            {loading && <div className="stateText">약국 불러오는 중...</div>}
            {error && <div className="stateText error">{error}</div>}

            {!loading && !error && (
              <>
                <div className="pharmacyContainer">
                  {pagedPharmacies.length > 0 ? (
                    pagedPharmacies.map((p) => (
                      <article className="pharmacyCard" key={p.id}>
                        <div className="cardThumb">
                          {p.photo ? (
                            <img
                              className="cardThumbImg"
                              src={p.photo}
                              alt={`${p.name} 썸네일`}
                              loading="lazy"
                            />
                          ) : (
                            <div className="noImage">이미지 없음</div>
                          )}
                        </div>
                        <div className="cardBody">
                          <div className="cardTopRow">
                            <h3 className="pharName">{p.name}</h3>
                            <div className="badgeRow">
                              {p.isNight && <span className="badge">야간</span>}
                              {p.isHoliday && <span className="badge">공휴일</span>}
                            </div>
                          </div>
                          <p className="pharAddr">{p.addr}</p>
                          <div className="pharMeta">
                            <FontAwesomeIcon icon={faPhone} className="metaIcon" /> {p.phone || "전화번호 정보 없음"}
                          </div>
                          <div className="pharMeta">
                            <FontAwesomeIcon icon={faClock} className="metaIcon" /> {timeText(p.openTime, p.closeTime)}
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="emptyState">
                      <FontAwesomeIcon icon={faSun} className="emptyStateIcon" />
                      <div className="emptyText">
                        {totalCount}건 · {page}/{totalPages}페이지
                        <br />
                        해당하는 약국이 없습니다.
                      </div>
                    </div>
                  )}
                </div>

                {/* 페이지네이션 */}
                <nav className="pagination">
                  {currentGroupStart !== 1 && totalCount > 0 && (
                    <>
                      <button onClick={() => setPage(1)}><FontAwesomeIcon icon={faAngleDoubleLeft} /> 처음</button>
                      <button onClick={() => setPage((prev) => Math.max(1, prev - 1))}><FontAwesomeIcon icon={faAngleLeft} /> 이전</button>
                    </>
                  )}
                  <div className="pageNums">
                    {pageNumbers.map((n) => (
                      <button key={n} className={n === page ? "active" : ""} onClick={() => setPage(n)}>
                        {n}
                      </button>
                    ))}
                  </div>
                  {currentGroupEnd !== totalPages && totalCount > 0 && (
                    <>
                      <button onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>다음 <FontAwesomeIcon icon={faAngleRight} /></button>
                      <button onClick={() => setPage(totalPages)}>끝 <FontAwesomeIcon icon={faAngleDoubleRight} /></button>
                    </>
                  )}
                </nav>
              </>
            )}
          </div>
        </div>
      </div>

      <RegionSelect
        isOpen={isRegionOpen}
        onClose={() => setIsRegionOpen(false)}
        onConfirm={handleRegionConfirm}
      />
    </div>
  );
}