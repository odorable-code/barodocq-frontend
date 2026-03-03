import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays, faClock, faHospital, faStethoscope,
  faCircleDot, faNotesMedical, faChevronRight, faSearch,
  faXmark, faFilter, faSortAmountDown, faArrowLeft,
  faCheckCircle, faHourglassHalf, faBan, faListUl,
} from "@fortawesome/free-solid-svg-icons";
import { authFetch } from "../utils/AuthFetch";
import ReservationDetailModal from "../components/ReservationDetailModal";
import ReservationChangeModal from "../components/ReservationChangeModal";
import ReservationCancelModal from "../components/ReservationCancelModal";
import "../assets/styles/MyReservationsPage.css";

/* ── 상태 탭 설정 ── */
const STATUS_TABS = [
  { key: "전체",   label: "전체",   icon: faListUl,       color: "#14b8a6" },
  { key: "예약대기", label: "대기 중", icon: faHourglassHalf, color: "#d97706" },
  { key: "예약확정", label: "확정",   icon: faCheckCircle,  color: "#059669" },
  { key: "예약취소",   label: "취소됨",  icon: faBan,          color: "#dc2626" },
];

/* ── 정렬 옵션 ── */
const SORT_OPTIONS = [
  { key: "latest",  label: "최신순" },
  { key: "oldest",  label: "오래된순" },
  { key: "hospital",label: "병원명순" },
];

const MyReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState("전체");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [sortKey,      setSortKey]      = useState("latest");
  const [showSort,     setShowSort]     = useState(false);

  /* 모달 상태 */
  const [modalType, setModalType]               = useState(null);
  const [modalReservation, setModalReservation] = useState(null);

  /* 데이터 fetch */
  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await authFetch("/api/v1/reservations/my");
      const data = await res.json();
      setReservations(Array.isArray(data) ? data : []);
    } catch {
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  /* 모달 핸들러 */
  const openModal  = (type, rv) => { setModalType(type); setModalReservation(rv); };
  const closeModal = () => { setModalType(null); setModalReservation(null); };
  const handleSuccess = () => { fetchReservations(); closeModal(); };

  /* 필터 & 정렬 */
  const filtered = reservations
    .filter((r) => {
      const matchTab = activeTab === "전체" || r.reStatus === activeTab;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q
        || (r.hoName ?? "").toLowerCase().includes(q)
        || (r.deptName ?? "").toLowerCase().includes(q)
        || String(r.reNum).includes(q);
      return matchTab && matchSearch;
    })
    .sort((a, b) => {
      if (sortKey === "latest")   return new Date(b.reDate) - new Date(a.reDate);
      if (sortKey === "oldest")   return new Date(a.reDate) - new Date(b.reDate);
      if (sortKey === "hospital") return (a.hoName ?? "").localeCompare(b.hoName ?? "");
      return 0;
    });

  /* 통계 */
  const stats = {
    total:     reservations.length,
    pending:   reservations.filter((r) => r.reStatus === "예약대기").length,
    confirmed: reservations.filter((r) => r.reStatus === "예약확정").length,
    cancelled: reservations.filter((r) => r.reStatus === "예약취소").length,
  };

  return (
    <div className="mrp">

      {/* ── 페이지 헤더 ── */}
      <div className="mrp-page-header">
        <div className="mrp-page-header-inner">
          <Link to="/mypage" className="mrp-back-btn">
            <FontAwesomeIcon icon={faArrowLeft} />
          </Link>
          <div>
            <h1 className="mrp-page-title">
              <FontAwesomeIcon icon={faCalendarDays} />
              내 예약 현황
            </h1>
            <p className="mrp-page-sub">예약 내역을 확인하고 관리하세요</p>
          </div>
        </div>
      </div>

      <div className="mrp-inner">

        {/* ── 통계 카드 ── */}
        <div className="mrp-stats-row">
          <StatCard label="전체 예약"  value={stats.total}     color="#14b8a6" icon={faListUl}       />
          <StatCard label="대기 중"    value={stats.pending}   color="#d97706" icon={faHourglassHalf}/>
          <StatCard label="확정"       value={stats.confirmed} color="#059669" icon={faCheckCircle}  />
          <StatCard label="취소됨"     value={stats.cancelled} color="#dc2626" icon={faBan}          />
        </div>

        {/* ── 필터 바 ── */}
        <div className="mrp-filter-bar">
          {/* 탭 */}
          <div className="mrp-tabs">
            {STATUS_TABS.map((t) => (
              <button
                key={t.key}
                className={`mrp-tab${activeTab === t.key ? " mrp-tab--active" : ""}`}
                style={activeTab === t.key ? { "--tab-color": t.color } : {}}
                onClick={() => setActiveTab(t.key)}
              >
                <FontAwesomeIcon icon={t.icon} />
                {t.label}
                <span className="mrp-tab-count">
                  {t.key === "전체"
                    ? stats.total
                    : t.key === "예약대기"
                    ? stats.pending
                    : t.key === "예약확정"
                    ? stats.confirmed
                    : stats.cancelled}
                </span>
              </button>
            ))}
          </div>

          {/* 검색 + 정렬 */}
          <div className="mrp-filter-right">
            <div className="mrp-search-wrap">
              <FontAwesomeIcon icon={faSearch} className="mrp-search-icon" />
              <input
                type="text"
                className="mrp-search-input"
                placeholder="병원명·진료과 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="mrp-search-clear" onClick={() => setSearchQuery("")}>
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              )}
            </div>

            <div className="mrp-sort-wrap">
              <button
                className="mrp-sort-btn"
                onClick={() => setShowSort((v) => !v)}
              >
                <FontAwesomeIcon icon={faSortAmountDown} />
                {SORT_OPTIONS.find((s) => s.key === sortKey)?.label}
              </button>
              {showSort && (
                <div className="mrp-sort-dropdown">
                  {SORT_OPTIONS.map((s) => (
                    <button
                      key={s.key}
                      className={`mrp-sort-option${sortKey === s.key ? " mrp-sort-option--active" : ""}`}
                      onClick={() => { setSortKey(s.key); setShowSort(false); }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 결과 수 ── */}
        <p className="mrp-result-count">
          총 <strong>{filtered.length}</strong>건의 예약
        </p>

        {/* ── 예약 목록 ── */}
        {loading ? (
          <div className="mrp-loading">
            <div className="mrp-loading-spinner" />
            <p>예약 내역을 불러오는 중...</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState activeTab={activeTab} />
        ) : (
          <div className="mrp-list">
            {filtered.map((r) => (
              <ReservationCard
                key={r.reNum}
                r={r}
                onDetail={() => openModal("detail", r)}
                onChange={() => openModal("change", r)}
                onCancel={() => openModal("cancel", r)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── 모달 ── */}
      {modalType === "detail" && (
        <ReservationDetailModal
          reservation={modalReservation}
          onClose={closeModal}
          onChangePage={(rv) => openModal("change", rv)}
          onCancelPage={(rv) => openModal("cancel", rv)}
        />
      )}
      {modalType === "change" && (
        <ReservationChangeModal
          reservation={modalReservation}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}
      {modalType === "cancel" && (
        <ReservationCancelModal
          reservation={modalReservation}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

/* ── 통계 카드 ── */
const StatCard = ({ label, value, color, icon }) => (
  <div className="mrp-stat-card" style={{ "--sc-color": color }}>
    <div className="mrp-stat-icon">
      <FontAwesomeIcon icon={icon} />
    </div>
    <div>
      <p className="mrp-stat-value">{value}</p>
      <p className="mrp-stat-label">{label}</p>
    </div>
  </div>
);

/* ── 예약 카드 ── */
const STATUS_STYLE = {
  예약확정: { cls: "confirmed", label: "예약 확정" },
  예약대기: { cls: "pending",   label: "예약 대기" },
  예약취소:    { cls: "cancelled", label: "취소됨"   },
};

const ReservationCard = ({ r, onDetail, onChange, onCancel }) => {
  const st = STATUS_STYLE[r.reStatus] ?? STATUS_STYLE["예약대기"];

  return (
    <div className={`mrp-card mrp-card--${st.cls}`}>
      {/* 좌측 컬러 스트라이프 */}
      <div className={`mrp-card-stripe mrp-card-stripe--${st.cls}`} />

      <div className="mrp-card-content">
        {/* 상단: 병원명 + 상태 뱃지 */}
        <div className="mrp-card-top">
          <div className="mrp-card-hospital-wrap">
            <div className="mrp-card-hosp-icon">
              <FontAwesomeIcon icon={faHospital} />
            </div>
            <div>
              <p className="mrp-card-hosp-name">
                {r.hoName ?? `병원 #${r.hoNum}`}
              </p>
              <p className="mrp-card-renum">예약번호 #{r.reNum}</p>
            </div>
          </div>
          <span className={`mrp-card-status mrp-card-status--${st.cls}`}>
            <span className="mrp-card-status-dot" />
            {st.label}
          </span>
        </div>

        {/* 진료과 + 방문유형 */}
        <div className="mrp-card-tags">
          <div className="mrp-card-dept">
            <FontAwesomeIcon icon={faStethoscope} />
            <span>{r.deptName ?? `진료과 #${r.deptNum}`}</span>
          </div>
          {r.reVisitType && (
            <div className="mrp-card-visit-type">{r.reVisitType}</div>
          )}
        </div>

        {/* 날짜 · 시간 · 대기 칩 */}
        <div className="mrp-card-chips">
          <div className="mrp-chip mrp-chip--time">
            <FontAwesomeIcon icon={faCalendarDays} />
            <span>{r.reDate}</span>
          </div>
          <div className="mrp-chip mrp-chip--time">
            <FontAwesomeIcon icon={faClock} />
            <span>{r.reTime?.slice(0, 5)}</span>
          </div>
          {r.waitNum !== null && (
            <div className="mrp-chip mrp-chip--wait">
              <FontAwesomeIcon icon={faCircleDot} />
              <span>대기 <strong>{r.waitNum}명</strong></span>
            </div>
          )}
        </div>

        {/* 메모 */}
        {r.reMemo && (
          <div className="mrp-card-memo">
            <FontAwesomeIcon icon={faNotesMedical} />
            <span>{r.reMemo}</span>
          </div>
        )}

        {/* 구분선 */}
        <div className="mrp-card-sep" />

        {/* 버튼 */}
        <div className="mrp-card-btns">
          {r.reStatus !== "예약취소" && (
            <>
              <button className="mrp-btn mrp-btn--outline" onClick={onChange}>
                변경
              </button>
              <button
                className="mrp-btn mrp-btn--outline mrp-btn--red"
                onClick={onCancel}
              >
                취소
              </button>
            </>
          )}
          <button className="mrp-btn mrp-btn--fill" onClick={onDetail}>
            <FontAwesomeIcon icon={faChevronRight} />
            상세보기
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── 빈 상태 ── */
const EmptyState = ({ activeTab }) => (
  <div className="mrp-empty">
    <div className="mrp-empty-icon">
      <FontAwesomeIcon icon={faCalendarDays} />
    </div>
    <h3 className="mrp-empty-title">
      {activeTab === "전체" ? "예약 내역이 없어요" : `${activeTab} 예약이 없어요`}
    </h3>
    <p className="mrp-empty-sub">
      {activeTab === "전체"
        ? "병원 찾기에서 원하는 병원을 예약해보세요"
        : "다른 탭에서 확인해보세요"}
    </p>
    {activeTab === "전체" && (
      <Link to="/hospitals" className="mrp-empty-btn">
        병원 찾기 →
      </Link>
    )}
  </div>
);

export default MyReservationsPage;
