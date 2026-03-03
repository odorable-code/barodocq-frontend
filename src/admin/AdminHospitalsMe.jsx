import { useMemo, useState } from "react";

/* ───────── 상수 ───────── */
const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

const ALL_DEPTS = [
  "내과","산부인과","성형외과","비뇨기과","외과","영상의학과",
  "소아청소년과","이비인후과","안과","정형외과","가정의학과",
  "흉부외과","신경과","치과","피부과","정신의학과","한의과",
  "신경외과","마취통증과","재활의학과",
];

const makeDefaultHours = () =>
  DAYS.map((d) => ({
    day: d, open: "09:00", close: "18:00",
    lunch_s: "13:00", lunch_e: "14:00",
    yn: d !== "일",
  }));

/* ───────── 요일별 색상 ───────── */
const DAY_COLORS = {
  월: "#14b8a6", 화: "#0d9488", 수: "#0f766e",
  목: "#14b8a6", 금: "#0d9488", 토: "#3b82f6", 일: "#94a3b8",
};

/* ═══════════════════════════════════════════
   메인 컴포넌트
═══════════════════════════════════════════ */
export default function HospitalDetailPage() {
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    ho_name: "메디움강남요양병원",
    ho_phone: "02-1234-5678",
    ho_addr: "서울특별시 강남구 테헤란로 123",
    ho_doc_count: 5,
    hours: [
      { day: "월", open: "09:00", close: "18:00", lunch_s: "13:00", lunch_e: "14:00", yn: true },
      { day: "화", open: "09:00", close: "18:00", lunch_s: "13:00", lunch_e: "14:00", yn: true },
    ],
    deptMode: "select",
    depts: ["내과", "신경과", "정형외과"],
  });

  const normalizedHours = useMemo(() => {
    const map = new Map(formData.hours.map((h) => [h.day, h]));
    return DAYS.map((d) => map.get(d) ?? makeDefaultHours().find((x) => x.day === d));
  }, [formData.hours]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHourChange = (idx, key, value) => {
    setFormData((prev) => {
      const next = [...normalizedHours];
      next[idx] = { ...next[idx], [key]: value };
      return { ...prev, hours: next };
    });
  };

  const handleToggleYn = (idx) => {
    setFormData((prev) => {
      const next = [...normalizedHours];
      next[idx] = { ...next[idx], yn: !next[idx].yn };
      return { ...prev, hours: next };
    });
  };

  const handleSave = async () => {
    setIsEdit(false);
  };

  const openDays   = normalizedHours.filter((h) => h.yn).length;
  const closedDays = 7 - openDays;

  return (
    <div className="hdp-root">
      {/* ══════════ 인라인 스타일 ══════════ */}
      <style>{`
        /* ── CSS 변수 (MainPage 동일) ── */
        .hdp-root {
          --pm:  #14b8a6;
          --pt:  #0d9488;
          --pdt: #0f766e;
          --pddt:#115e59;
          --bg1: #ffffff;
          --bg2: #f0fdfa;
          --bg3: #ccfbf1;
          --txt: #0f172a;
          --txt2:#475569;
          --txt3:#94a3b8;
          --bdr: #e2e8f0;
          --shd: 0 4px 6px rgba(0,0,0,.07);
          --shd-xl: 0 20px 25px rgba(0,0,0,.1);
          --shd-mint: 0 10px 30px rgba(20,184,166,.22);
          --r-sm: .5rem;
          --r-md: .75rem;
          --r-lg: 1rem;
          --r-xl: 1.25rem;
          --r-2xl:1.75rem;
          --r-full:9999px;
          --ease: 300ms cubic-bezier(.4,0,.2,1);

          font-family: 'Pretendard','Noto Sans KR',-apple-system,sans-serif;
          background: #f8fafc;
          min-height: 100vh;
          padding: 2rem;
          color: var(--txt);
        }

        /* ── 레이아웃 래퍼 ── */
        .hdp-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        /* ══════════ PAGE HEADER ══════════ */
        .hdp-page-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .hdp-breadcrumb {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          font-size: .78rem;
          font-weight: 600;
          color: var(--txt3);
          margin-bottom: .5rem;
        }
        .hdp-breadcrumb span { color: var(--pm); }
        .hdp-page-title {
          font-size: 1.75rem;
          font-weight: 900;
          color: var(--txt);
          letter-spacing: -.5px;
        }
        .hdp-page-title span {
          background: linear-gradient(135deg, var(--pm), var(--pt));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hdp-btn-group { display: flex; gap: .625rem; align-items: center; flex-shrink:0; }

        /* ── 버튼 공통 ── */
        .hdp-btn {
          display: inline-flex;
          align-items: center;
          gap: .45rem;
          padding: .625rem 1.25rem;
          border: none;
          border-radius: var(--r-lg);
          font-size: .875rem;
          font-weight: 700;
          cursor: pointer;
          transition: var(--ease);
          white-space: nowrap;
        }
        .hdp-btn-primary {
          background: linear-gradient(135deg, var(--pm), var(--pt));
          color: #fff;
          box-shadow: 0 4px 14px rgba(20,184,166,.3);
        }
        .hdp-btn-primary:hover { transform: translateY(-2px); box-shadow: var(--shd-mint); }
        .hdp-btn-ghost {
          background: #fff;
          color: var(--txt2);
          border: 2px solid var(--bdr);
        }
        .hdp-btn-ghost:hover { border-color: var(--pm); color: var(--pm); }

        /* ══════════ STAT STRIP ══════════ */
        .hdp-stat-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        .hdp-stat-item {
          background: var(--bg1);
          border: 2px solid var(--bdr);
          border-radius: var(--r-xl);
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: var(--ease);
          position: relative;
          overflow: hidden;
        }
        .hdp-stat-item::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--pm), var(--pt));
          transform: scaleX(0);
          transform-origin: left;
          transition: var(--ease);
        }
        .hdp-stat-item:hover { border-color: var(--pm); transform: translateY(-3px); box-shadow: var(--shd-xl); }
        .hdp-stat-item:hover::before { transform: scaleX(1); }
        .hdp-stat-ico {
          width: 48px; height: 48px;
          border-radius: var(--r-lg);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.35rem;
          flex-shrink: 0;
        }
        .hdp-stat-content .hdp-stat-val {
          font-size: 1.6rem;
          font-weight: 900;
          color: var(--txt);
          line-height: 1;
          margin-bottom: .2rem;
        }
        .hdp-stat-content .hdp-stat-lbl {
          font-size: .78rem;
          color: var(--txt3);
          font-weight: 600;
        }

        /* ══════════ 카드 공통 ══════════ */
        .hdp-card {
          background: var(--bg1);
          border: 2px solid var(--bdr);
          border-radius: var(--r-2xl);
          padding: 2rem;
          transition: var(--ease);
        }

        /* ── 섹션 헤더 ── */
        .hdp-sec-head {
          display: flex;
          align-items: center;
          gap: .75rem;
          margin-bottom: 1.75rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--bg2);
        }
        .hdp-sec-icon {
          width: 38px; height: 38px;
          border-radius: var(--r-md);
          background: linear-gradient(135deg, var(--pm), var(--pt));
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: .95rem;
          flex-shrink: 0;
        }
        .hdp-sec-head h3 {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--txt);
          flex: 1;
        }
        .hdp-sec-badge {
          display: inline-flex;
          align-items: center;
          gap: .35rem;
          padding: .3rem .75rem;
          background: var(--bg3);
          color: var(--pdt);
          border-radius: var(--r-full);
          font-size: .72rem;
          font-weight: 700;
        }

        /* ══════════ 기본정보 그리드 ══════════ */
        .hdp-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }
        .hdp-field { display: flex; flex-direction: column; gap: .45rem; }
        .hdp-field.span2 { grid-column: span 2; }
        .hdp-field-label {
          display: flex;
          align-items: center;
          gap: .4rem;
          font-size: .78rem;
          font-weight: 700;
          color: var(--txt2);
          text-transform: uppercase;
          letter-spacing: .5px;
        }
        .hdp-field-label i { color: var(--pm); font-size: .8rem; }

        .hdp-input {
          width: 100%;
          height: 44px;
          padding: 0 14px;
          border: 2px solid var(--bdr);
          border-radius: var(--r-lg);
          background: var(--bg1);
          font-size: .9rem;
          color: var(--txt);
          outline: none;
          transition: var(--ease);
          font-family: inherit;
        }
        .hdp-input:focus {
          border-color: var(--pm);
          box-shadow: 0 0 0 4px rgba(20,184,166,.15);
        }
        .hdp-input[readonly] {
          background: var(--bg2);
          color: var(--txt2);
          cursor: default;
          border-color: transparent;
        }

        /* ══════════ 운영시간 테이블 ══════════ */
        .hdp-hours-grid {
          display: flex;
          flex-direction: column;
          gap: .75rem;
        }

        .hdp-hour-row {
          display: grid;
          grid-template-columns: 80px 60px 1fr 1fr;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: var(--bg2);
          border-radius: var(--r-lg);
          border: 2px solid transparent;
          transition: var(--ease);
        }
        .hdp-hour-row:hover { background: var(--bg3); border-color: var(--bdr); }
        .hdp-hour-row.is-off {
          opacity: .5;
          background: #f8fafc;
        }
        .hdp-hour-row.is-edit { border-color: var(--bdr); background: var(--bg1); }
        .hdp-hour-row.is-edit:hover { border-color: var(--pm); }

        /* 요일 라벨 */
        .hdp-day-label {
          display: flex;
          align-items: center;
          gap: .5rem;
          font-weight: 800;
          font-size: .9rem;
          color: var(--txt);
        }
        .hdp-day-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* 진료여부 토글 */
        .hdp-toggle-wrap {
          display: flex;
          justify-content: center;
        }
        .hdp-toggle {
          position: relative;
          width: 42px; height: 24px;
          display: inline-block;
          flex-shrink: 0;
        }
        .hdp-toggle input { opacity: 0; width: 0; height: 0; }
        .hdp-slider {
          position: absolute;
          inset: 0;
          background: #cbd5e1;
          border-radius: var(--r-full);
          cursor: pointer;
          transition: var(--ease);
        }
        .hdp-slider::before {
          content: '';
          position: absolute;
          left: 3px; top: 3px;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #fff;
          transition: var(--ease);
          box-shadow: 0 1px 4px rgba(0,0,0,.2);
        }
        .hdp-toggle input:checked + .hdp-slider { background: var(--pm); }
        .hdp-toggle input:checked + .hdp-slider::before { transform: translateX(18px); }
        .hdp-toggle input:disabled + .hdp-slider { cursor: not-allowed; opacity: .6; }

        /* 시간 인풋 그룹 */
        .hdp-time-group {
          display: flex;
          align-items: center;
          gap: .5rem;
        }
        .hdp-time-group-label {
          font-size: .7rem;
          font-weight: 700;
          color: var(--txt3);
          text-transform: uppercase;
          white-space: nowrap;
        }
        .hdp-time-input {
          width: 110px;
          height: 36px;
          padding: 0 10px;
          border: 2px solid var(--bdr);
          border-radius: var(--r-md);
          background: var(--bg1);
          font-size: .82rem;
          color: var(--txt);
          outline: none;
          transition: var(--ease);
          font-family: inherit;
        }
        .hdp-time-input:focus {
          border-color: var(--pm);
          box-shadow: 0 0 0 3px rgba(20,184,166,.13);
        }
        .hdp-time-input:disabled {
          background: #f1f5f9;
          color: #cbd5e1;
          cursor: not-allowed;
        }
        .hdp-time-sep {
          color: var(--txt3);
          font-weight: 700;
          font-size: .85rem;
        }

        /* 운영 요약 배지 */
        .hdp-hours-summary {
          display: flex;
          gap: .75rem;
          margin-bottom: 1rem;
        }
        .hdp-sum-chip {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          padding: .35rem .85rem;
          border-radius: var(--r-full);
          font-size: .78rem;
          font-weight: 700;
        }
        .hdp-sum-chip.open   { background: #d1fae5; color: #059669; }
        .hdp-sum-chip.closed { background: #fee2e2; color: #dc2626; }

        /* ══════════ 진료과목 ══════════ */
        .hdp-dept-topbar {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }
        .hdp-all-toggle-label {
          display: inline-flex;
          align-items: center;
          gap: .6rem;
          padding: .55rem 1.1rem;
          border: 2px solid var(--bdr);
          border-radius: var(--r-full);
          background: var(--bg1);
          cursor: pointer;
          font-size: .875rem;
          font-weight: 700;
          color: var(--txt2);
          transition: var(--ease);
          user-select: none;
        }
        .hdp-all-toggle-label:hover { border-color: var(--pm); color: var(--pm); }
        .hdp-all-toggle-label.checked {
          background: linear-gradient(135deg, var(--pm), var(--pt));
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 14px rgba(20,184,166,.3);
        }
        .hdp-all-toggle-label input { display: none; }

        .hdp-dept-status {
          font-size: .82rem;
          color: var(--txt3);
          font-weight: 600;
        }
        .hdp-dept-count {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          gap: .35rem;
          padding: .3rem .75rem;
          background: var(--bg3);
          color: var(--pdt);
          border-radius: var(--r-full);
          font-size: .75rem;
          font-weight: 700;
        }

        .hdp-chip-grid {
          display: flex;
          flex-wrap: wrap;
          gap: .6rem;
        }

        .hdp-chip {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          padding: .5rem 1rem;
          border: 2px solid var(--bdr);
          border-radius: var(--r-full);
          background: var(--bg1);
          cursor: pointer;
          user-select: none;
          font-size: .82rem;
          font-weight: 600;
          color: var(--txt2);
          transition: var(--ease);
        }
        .hdp-chip:hover:not(.disabled) {
          border-color: var(--pm);
          color: var(--pm);
          background: var(--bg2);
        }
        .hdp-chip.checked {
          background: linear-gradient(135deg, var(--bg3), #a7f3d0);
          border-color: var(--pm);
          color: var(--pdt);
          font-weight: 700;
        }
        .hdp-chip.all-mode {
          background: var(--bg2);
          border-color: var(--bdr);
          color: var(--txt2);
          opacity: .85;
          cursor: default;
        }
        .hdp-chip input { display: none; }
        .hdp-chip-check {
          width: 16px; height: 16px;
          border-radius: 50%;
          border: 2px solid currentColor;
          display: flex; align-items: center; justify-content: center;
          font-size: .55rem;
          transition: var(--ease);
          flex-shrink: 0;
        }
        .hdp-chip.checked .hdp-chip-check {
          background: var(--pm);
          border-color: var(--pm);
          color: #fff;
        }
        .hdp-chip.all-mode .hdp-chip-check {
          background: var(--pm);
          border-color: var(--pm);
          color: #fff;
        }

        /* ══════════ 반응형 ══════════ */
        @media (max-width: 900px) {
          .hdp-stat-strip { grid-template-columns: repeat(2,1fr); }
          .hdp-hour-row   { grid-template-columns: 70px 50px 1fr; }
          .hdp-hour-row .hdp-time-group:last-child { grid-column: 2 / -1; }
        }
        @media (max-width: 640px) {
          .hdp-root      { padding: 1rem; }
          .hdp-info-grid { grid-template-columns: 1fr; }
          .hdp-field.span2 { grid-column: span 1; }
          .hdp-stat-strip { grid-template-columns: 1fr 1fr; }
          .hdp-hour-row   {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto;
          }
          .hdp-time-group { flex-wrap: wrap; }
          .hdp-time-input { width: 100px; }
          .hdp-page-title { font-size: 1.35rem; }
        }
      `}</style>

      <div className="hdp-inner">

        {/* ══════════ PAGE HEADER ══════════ */}
        <header className="hdp-page-head">
          <div>
            <div className="hdp-breadcrumb">
              <i className="fas fa-hospital" />
              병원관리
              <i className="fas fa-chevron-right" style={{ fontSize: ".6rem" }} />
              <span>정보수정</span>
            </div>
            <h1 className="hdp-page-title">
              {isEdit
                ? <><span>병원 정보</span> 수정</>
                : <><span>병원 정보</span> 상세</>
              }
            </h1>
          </div>
          <div className="hdp-btn-group">
            {isEdit ? (
              <>
                <button className="hdp-btn hdp-btn-ghost" onClick={() => setIsEdit(false)}>
                  <i className="fas fa-times" /> 취소
                </button>
                <button className="hdp-btn hdp-btn-primary" onClick={handleSave}>
                  <i className="fas fa-check" /> 저장하기
                </button>
              </>
            ) : (
              <button className="hdp-btn hdp-btn-primary" onClick={() => setIsEdit(true)}>
                <i className="fas fa-pen" /> 수정모드 전환
              </button>
            )}
          </div>
        </header>

        {/* ══════════ STAT STRIP ══════════ */}
        <div className="hdp-stat-strip">
          <StatStrip
            icon="hospital" label="병원명"
            val={formData.ho_name}
            bg="linear-gradient(135deg,#14b8a6,#0d9488)"
          />
          <StatStrip
            icon="phone" label="전화번호"
            val={formData.ho_phone}
            bg="linear-gradient(135deg,#0d9488,#0f766e)"
          />
          <StatStrip
            icon="user-doctor" label="진료 의사 수"
            val={`${formData.ho_doc_count}명`}
            bg="linear-gradient(135deg,#0f766e,#115e59)"
          />
          <StatStrip
            icon="calendar-check" label="운영 요일"
            val={`${normalizedHours.filter((h) => h.yn).length}일 / 7일`}
            bg="linear-gradient(135deg,#14b8a6,#0f766e)"
          />
        </div>

        {/* ══════════ 1. 기본 정보 ══════════ */}
        <section className="hdp-card">
          <div className="hdp-sec-head">
            <div className="hdp-sec-icon"><i className="fas fa-circle-info" /></div>
            <h3>기본 정보</h3>
            {isEdit && (
              <span className="hdp-sec-badge">
                <i className="fas fa-pen" /> 편집 중
              </span>
            )}
          </div>

          <div className="hdp-info-grid">
            <div className="hdp-field">
              <label className="hdp-field-label">
                <i className="fas fa-hospital" /> 병원명
              </label>
              <input
                name="ho_name"
                className="hdp-input"
                value={formData.ho_name}
                readOnly={!isEdit}
                onChange={handleChange}
                placeholder="병원명을 입력하세요"
              />
            </div>
            <div className="hdp-field">
              <label className="hdp-field-label">
                <i className="fas fa-phone" /> 전화번호
              </label>
              <input
                name="ho_phone"
                className="hdp-input"
                value={formData.ho_phone}
                readOnly={!isEdit}
                onChange={handleChange}
                placeholder="전화번호를 입력하세요"
              />
            </div>
            <div className="hdp-field span2">
              <label className="hdp-field-label">
                <i className="fas fa-location-dot" /> 주소
              </label>
              <input
                name="ho_addr"
                className="hdp-input"
                value={formData.ho_addr}
                readOnly={!isEdit}
                onChange={handleChange}
                placeholder="병원 주소를 입력하세요"
              />
            </div>
          </div>
        </section>

        {/* ══════════ 2. 운영 시간 ══════════ */}
        <section className="hdp-card">
          <div className="hdp-sec-head">
            <div className="hdp-sec-icon"><i className="fas fa-clock" /></div>
            <h3>진료 시간 설정</h3>
            <span className="hdp-sec-badge">
              <i className="fas fa-calendar-week" />
              {normalizedHours.filter((h) => h.yn).length}일 운영
            </span>
          </div>

          {/* 요약 칩 */}
          <div className="hdp-hours-summary">
            <span className="hdp-sum-chip open">
              <i className="fas fa-circle-check" />
              운영 {openDays}일
            </span>
            <span className="hdp-sum-chip closed">
              <i className="fas fa-circle-xmark" />
              휴무 {closedDays}일
            </span>
          </div>

          <div className="hdp-hours-grid">
            {/* 헤더 행 */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "80px 60px 1fr 1fr",
              gap: "1rem",
              padding: "0 1.25rem .5rem",
              fontSize: ".72rem",
              fontWeight: 700,
              color: "var(--txt3)",
              textTransform: "uppercase",
              letterSpacing: ".5px",
            }}>
              <span>요일</span>
              <span style={{ textAlign: "center" }}>진료</span>
              <span>진료 시간</span>
              <span>점심 시간</span>
            </div>

            {normalizedHours.map((item, idx) => (
              <div
                key={item.day}
                className={[
                  "hdp-hour-row",
                  !item.yn ? "is-off" : "",
                  isEdit ? "is-edit" : "",
                ].join(" ")}
              >
                {/* 요일 */}
                <div className="hdp-day-label">
                  <div
                    className="hdp-day-dot"
                    style={{ background: DAY_COLORS[item.day] ?? "#94a3b8" }}
                  />
                  {item.day}요일
                </div>

                {/* 진료 여부 토글 */}
                <div className="hdp-toggle-wrap">
                  <label className="hdp-toggle">
                    <input
                      type="checkbox"
                      checked={!!item.yn}
                      disabled={!isEdit}
                      onChange={() => handleToggleYn(idx)}
                    />
                    <span className="hdp-slider" />
                  </label>
                </div>

                {/* 진료 시간 */}
                <div className="hdp-time-group">
                  <span className="hdp-time-group-label">시작</span>
                  <input
                    type="time"
                    className="hdp-time-input"
                    value={item.open}
                    disabled={!isEdit || !item.yn}
                    onChange={(e) => handleHourChange(idx, "open", e.target.value)}
                  />
                  <span className="hdp-time-sep">~</span>
                  <input
                    type="time"
                    className="hdp-time-input"
                    value={item.close}
                    disabled={!isEdit || !item.yn}
                    onChange={(e) => handleHourChange(idx, "close", e.target.value)}
                  />
                </div>

                {/* 점심 시간 */}
                <div className="hdp-time-group">
                  <span className="hdp-time-group-label">점심</span>
                  <input
                    type="time"
                    className="hdp-time-input"
                    value={item.lunch_s}
                    disabled={!isEdit || !item.yn}
                    onChange={(e) => handleHourChange(idx, "lunch_s", e.target.value)}
                  />
                  <span className="hdp-time-sep">~</span>
                  <input
                    type="time"
                    className="hdp-time-input"
                    value={item.lunch_e}
                    disabled={!isEdit || !item.yn}
                    onChange={(e) => handleHourChange(idx, "lunch_e", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ 3. 진료 과목 ══════════ */}
        <section className="hdp-card">
          <div className="hdp-sec-head">
            <div className="hdp-sec-icon"><i className="fas fa-stethoscope" /></div>
            <h3>진료 과목</h3>
            <span className="hdp-dept-count">
              <i className="fas fa-check" />
              {formData.deptMode === "all"
                ? "전체"
                : `${formData.depts.length}개 선택됨`}
            </span>
          </div>

          {/* 전체 토글 + 상태 */}
          <div className="hdp-dept-topbar">
            <label
              className={`hdp-all-toggle-label ${formData.deptMode === "all" ? "checked" : ""}`}
            >
              <input
                type="checkbox"
                disabled={!isEdit}
                checked={formData.deptMode === "all"}
                onChange={() => {
                  setFormData((prev) => ({
                    ...prev,
                    deptMode: prev.deptMode === "all" ? "select" : "all",
                    depts: prev.deptMode === "all" ? prev.depts : [...ALL_DEPTS],
                  }));
                }}
              />
              <i className={`fas fa-${formData.deptMode === "all" ? "check-double" : "list-check"}`} />
              전체 과목
            </label>
            <span className="hdp-dept-status">
              {formData.deptMode === "all"
                ? "✅ 전체 과목 표시 중"
                : `📋 선택 모드 · ${formData.depts.length}개 선택됨`}
            </span>
          </div>

          {/* 칩 목록 */}
          <div className="hdp-chip-grid">
            {ALL_DEPTS.map((dept) => {
              const isAll     = formData.deptMode === "all";
              const isChecked = isAll || formData.depts.includes(dept);

              return (
                <label
                  key={dept}
                  className={[
                    "hdp-chip",
                    isChecked ? "checked" : "",
                    isAll ? "all-mode" : "",
                    (!isEdit || isAll) ? "disabled" : "",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={!isEdit || isAll}
                    onChange={() => {
                      if (isAll) return;
                      const next = formData.depts.includes(dept)
                        ? formData.depts.filter((d) => d !== dept)
                        : [...formData.depts, dept];
                      setFormData((prev) => ({ ...prev, depts: next }));
                    }}
                  />
                  <span className="hdp-chip-check">
                    {isChecked && <i className="fas fa-check" />}
                  </span>
                  {dept}
                </label>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}

/* ── StatStrip 서브 컴포넌트 ── */
function StatStrip({ icon, label, val, bg }) {
  return (
    <div className="hdp-stat-item">
      <div className="hdp-stat-ico" style={{ background: bg, color: "#fff" }}>
        <i className={`fas fa-${icon}`} />
      </div>
      <div className="hdp-stat-content">
        <div className="hdp-stat-val">{val}</div>
        <div className="hdp-stat-lbl">{label}</div>
      </div>
    </div>
  );
}