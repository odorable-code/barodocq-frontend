import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "../assets/styles/ReservationModal.css";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

const DAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

/* 09:00 ~ 17:00 (30분 간격, 12:00·12:30 점심 제외) */
const generateTimes = () => {
  const times = [];
  for (let h = 9; h <= 17; h++) {
    for (const m of ["00", "30"]) {
      const t = `${String(h).padStart(2, "0")}:${m}`;
      if (t === "12:00" || t === "12:30") continue;
      if (h === 17 && m === "30") continue;
      times.push(t);
    }
  }
  return times;
};

const ALL_TIMES = generateTimes();
const AM_TIMES  = ALL_TIMES.filter(t => parseInt(t) < 12);
const PM_TIMES  = ALL_TIMES.filter(t => parseInt(t) >= 13);

/* 날짜 포맷 "YYYY-MM-DD" — timezone 이슈 없이 로컬 기준 */
const toDateStr = (d) => {
  const y   = d.getFullYear();
  const mo  = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
};

/* 현재 HH:MM */
const nowHHMM = () => {
  const n = new Date();
  return `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
};

/* ── 달력 유틸 ──
   해당 year/month 의 달력 셀 배열 반환
   null  → 빈칸 (1일 이전 공백)
   Date  → 실제 날짜 */
const buildCalendarCells = (year, month) => {
  const firstDow    = new Date(year, month, 1).getDay();   // 0=일
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
};

/* ─────────────────────────────────────────
   ReservationModal
───────────────────────────────────────── */
export default function ReservationModal({ hoNum, onClose }) {
  /* 오늘 자정 기준 */
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr   = toDateStr(today);

  /* 예약 가능 최대 날짜: 오늘 + 60일 */
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 60);
  const maxDateStr = toDateStr(maxDate);

  /* ── state ── */
  const [hospital,      setHospital]      = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [calYear,       setCalYear]       = useState(today.getFullYear());
  const [calMonth,      setCalMonth]      = useState(today.getMonth());   // 0-based
  const [selectedDate,  setSelectedDate]  = useState(null);
  const [reservedTimes, setReservedTimes] = useState([]);
  const [selectedTime,  setSelectedTime]  = useState(null);
  const [visitType,     setVisitType]     = useState("초진");
  const [memo,          setMemo]          = useState("");
  const [step,          setStep]          = useState(1);
  const [submitting,    setSubmitting]    = useState(false);
  const [done,          setDone]          = useState(false);
  const overlayRef = useRef(null);

  /* ── 이전 달 이동 가능 여부: 오늘이 속한 달 이전으론 불가 ── */
  const canPrevMonth =
    calYear > today.getFullYear() ||
    (calYear === today.getFullYear() && calMonth > today.getMonth());

  /* ── 다음 달 이동 가능 여부: maxDate 가 속한 달까지만 ── */
  const canNextMonth = (() => {
    const nY = calMonth === 11 ? calYear + 1 : calYear;
    const nM = calMonth === 11 ? 0            : calMonth + 1;
    return nY < maxDate.getFullYear() ||
      (nY === maxDate.getFullYear() && nM <= maxDate.getMonth());
  })();

  const goPrevMonth = () => {
    if (!canPrevMonth) return;
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const goNextMonth = () => {
    if (!canNextMonth) return;
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  /* body 스크롤 잠금 */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  /* ESC 닫기 */
  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  /* 병원 정보 로드 */
  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/api/v1/hospitals/${hoNum}`)
      .then(res => setHospital(res.data))
      .catch(() => setHospital(null))
      .finally(() => setLoading(false));
  }, [hoNum]);

  /* 날짜 선택 시 예약 불가 시간 로드 */
  useEffect(() => {
    if (!selectedDate) return;
    axios.get(`${API}/api/v1/reservations/unavailable`, {
      params: { hoNum, date: toDateStr(selectedDate) }
    })
      .then(res => setReservedTimes(res.data))
      .catch(() => setReservedTimes([]));
  }, [selectedDate, hoNum]);

  /* 시간 비활성 여부 */
  const isTimeDisabled = (time) => {
    if (reservedTimes.includes(time)) return true;
    if (!selectedDate) return false;
    if (toDateStr(selectedDate) === todayStr && time <= nowHHMM()) return true;
    return false;
  };

  /* 날짜 선택 핸들러 */
  const handleSelectDate = (dateObj) => {
    setSelectedDate(dateObj);
    setSelectedTime(null);
    setStep(2);
  };

  /* 예약 제출 */
  const handleReserve = async () => {
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    try {
      await axios.post(`${API}/api/v1/reservations`, {
        hoNum,
        reDate: toDateStr(selectedDate),
        reTime: selectedTime,
        visitType,
        memo,
      });
      setDone(true);
    } catch {
      alert("이미 예약된 시간이거나 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  /* 달력 셀 배열 */
  const calCells = buildCalendarCells(calYear, calMonth);

  /* ── 완료 화면 ── */
  if (done) {
    return (
      <div className="rm-overlay open" ref={overlayRef}
        onClick={(e) => e.target === overlayRef.current && onClose()}>
        <div className="rm-sheet rm-sheet-sm">
          <button className="rm-close" onClick={onClose}><i className="fas fa-xmark" /></button>
          <div className="rm-done-screen">
            <div className="rm-done-icon"><i className="fas fa-circle-check" /></div>
            <h2>예약 완료!</h2>
            <p>
              <strong>{hospital?.hoName}</strong> 예약이 완료되었습니다.<br />
              <span>{toDateStr(selectedDate)} · {selectedTime} · {visitType}</span>
            </p>
            <button className="rm-btn rm-btn-primary" onClick={onClose}>확인</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rm-overlay open" ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}>
      <div className="rm-sheet">

        {/* ─── 헤더 ─── */}
        <div className="rm-header">
          <div className="rm-header-left">
            <div className="rm-header-icon"><i className="fas fa-hospital" /></div>
            <div>
              {loading
                ? <div className="rm-skeleton rm-skeleton-title" />
                : <>
                    <h2 className="rm-hospital-name">{hospital?.hoName ?? "병원 정보 없음"}</h2>
                    <p className="rm-hospital-sub">
                      <i className="fas fa-location-dot" />{hospital?.hoAddress}
                      {hospital?.hoPhone && (
                        <><span className="rm-dot">·</span>
                          <i className="fas fa-phone" />{hospital?.hoPhone}</>
                      )}
                    </p>
                  </>
              }
            </div>
          </div>
          <button className="rm-close" onClick={onClose}><i className="fas fa-xmark" /></button>
        </div>

        {/* ─── 스텝 인디케이터 ─── */}
        <div className="rm-steps">
          {[
            { n: 1, label: "날짜 선택" },
            { n: 2, label: "시간 선택" },
            { n: 3, label: "예약 확인" },
          ].map((s, i, arr) => (
            <div key={s.n} className="rm-step-wrap">
              <div className={`rm-step ${step >= s.n ? "done" : ""} ${step === s.n ? "active" : ""}`}>
                <div className="rm-step-circle">
                  {step > s.n ? <i className="fas fa-check" /> : s.n}
                </div>
                <span>{s.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className={`rm-step-line ${step > s.n ? "done" : ""}`} />
              )}
            </div>
          ))}
        </div>

        {/* ─── 바디 ─── */}
        <div className="rm-body">

          {/* ══ STEP 1 : 날짜 선택 (월간 달력) ══ */}
          <div className={`rm-section ${step >= 1 ? "visible" : ""}`}>
            <div className="rm-section-header">
              <span className="rm-section-icon"><i className="fas fa-calendar-days" /></span>
              <h3>날짜를 선택하세요</h3>
              <span className="rm-section-sub">오늘부터 60일 이내</span>
            </div>

            {/* ── 월 네비게이션 ── */}
            <div className="rm-cal-nav">
              <button
                className={`rm-cal-nav-btn ${!canPrevMonth ? "rm-cal-nav-btn--off" : ""}`}
                onClick={goPrevMonth}
                disabled={!canPrevMonth}
                aria-label="이전 달"
              >
                <i className="fas fa-chevron-left" />
              </button>

              <span className="rm-cal-nav-title">
                {calYear}년 {String(calMonth + 1).padStart(2, "0")}월
              </span>

              <button
                className={`rm-cal-nav-btn ${!canNextMonth ? "rm-cal-nav-btn--off" : ""}`}
                onClick={goNextMonth}
                disabled={!canNextMonth}
                aria-label="다음 달"
              >
                <i className="fas fa-chevron-right" />
              </button>
            </div>

            {/* ── 요일 헤더 ── */}
            <div className="rm-cal-dow-row">
              {DAY_KO.map((d, i) => (
                <span
                  key={d}
                  className={[
                    "rm-cal-dow",
                    i === 0 ? "sunday"   : "",
                    i === 6 ? "saturday" : "",
                  ].filter(Boolean).join(" ")}
                >
                  {d}
                </span>
              ))}
            </div>

            {/* ── 날짜 그리드 ── */}
            <div className="rm-cal-grid">
              {calCells.map((d, idx) => {
                /* 빈칸 */
                if (!d) return <div key={`gap-${idx}`} className="rm-cal-cell rm-cal-cell--empty" />;

                const ds       = toDateStr(d);
                const dow      = d.getDay();
                const isPast   = ds < todayStr;
                const isOver   = ds > maxDateStr;
                const disabled = isPast || isOver;
                const sel      = selectedDate && toDateStr(selectedDate) === ds;
                const isToday  = ds === todayStr;

                return (
                  <button
                    key={ds}
                    className={[
                      "rm-cal-cell",
                      sel      ? "rm-cal-cell--selected" : "",
                      disabled ? "rm-cal-cell--disabled" : "",
                      isToday  ? "rm-cal-cell--today"    : "",
                      dow === 0 ? "rm-cal-cell--sunday"   : "",
                      dow === 6 ? "rm-cal-cell--saturday" : "",
                    ].filter(Boolean).join(" ")}
                    disabled={disabled}
                    onClick={() => !disabled && handleSelectDate(d)}
                  >
                    <span className="rm-cal-num">{d.getDate()}</span>
                    {isToday && <span className="rm-cal-today-dot" />}
                  </button>
                );
              })}
            </div>

            {/* ── 범례 ── */}
            <div className="rm-cal-legend">
              <span><em className="rm-leg rm-leg--today" />오늘</span>
              <span><em className="rm-leg rm-leg--sel"   />선택</span>
              <span><em className="rm-leg rm-leg--sun"   />일요일</span>
              <span><em className="rm-leg rm-leg--sat"   />토요일</span>
            </div>
          </div>

          {/* ══ STEP 2 : 시간 선택 ══ */}
          {step >= 2 && (
            <div className="rm-section visible rm-section-animate">
              <div className="rm-section-header">
                <span className="rm-section-icon"><i className="fas fa-clock" /></span>
                <h3>시간을 선택하세요</h3>
                <span className="rm-section-sub">
                  {selectedDate &&
                    `${toDateStr(selectedDate)} (${DAY_KO[selectedDate.getDay()]})`}
                </span>
              </div>

              <div className="rm-time-group">
                <p className="rm-time-group-label"><i className="fas fa-sun" /> 오전</p>
                <div className="rm-time-grid">
                  {AM_TIMES.map(t => {
                    const dis = isTimeDisabled(t);
                    const res = reservedTimes.includes(t);
                    return (
                      <button key={t}
                        className={["rm-time-btn",
                          selectedTime === t ? "selected" : "",
                          dis ? "disabled" : "",
                          res ? "reserved" : "",
                        ].filter(Boolean).join(" ")}
                        disabled={dis}
                        onClick={() => { setSelectedTime(t); setStep(3); }}
                      >
                        {t}
                        {res && <span className="rm-time-tag">예약됨</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rm-lunch-divider">
                <i className="fas fa-utensils" /> 점심시간 (12:00 ~ 13:00)
              </div>

              <div className="rm-time-group">
                <p className="rm-time-group-label"><i className="fas fa-moon" /> 오후</p>
                <div className="rm-time-grid">
                  {PM_TIMES.map(t => {
                    const dis = isTimeDisabled(t);
                    const res = reservedTimes.includes(t);
                    return (
                      <button key={t}
                        className={["rm-time-btn",
                          selectedTime === t ? "selected" : "",
                          dis ? "disabled" : "",
                          res ? "reserved" : "",
                        ].filter(Boolean).join(" ")}
                        disabled={dis}
                        onClick={() => { setSelectedTime(t); setStep(3); }}
                      >
                        {t}
                        {res && <span className="rm-time-tag">예약됨</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══ STEP 3 : 방문유형 + 요청사항 + 확인 ══ */}
          {step >= 3 && (
            <div className="rm-section visible rm-section-animate">
              {/* 예약 요약 배너 */}
              <div className="rm-summary-banner">
                <div className="rm-summary-row">
                  <i className="fas fa-calendar-check" />
                  <span>
                    {selectedDate && toDateStr(selectedDate)}&nbsp;
                    <strong>{selectedTime}</strong>
                  </span>
                </div>
                <button className="rm-edit-btn"
                  onClick={() => { setSelectedTime(null); setStep(2); }}>
                  <i className="fas fa-pen" /> 변경
                </button>
              </div>

              {/* 방문 유형 */}
              <div className="rm-section-header" style={{ marginTop: "1.5rem" }}>
                <span className="rm-section-icon"><i className="fas fa-user-doctor" /></span>
                <h3>방문 유형</h3>
              </div>
              <div className="rm-visit-grid">
                {["초진", "재진"].map(v => (
                  <label key={v} className={`rm-visit-card ${visitType === v ? "selected" : ""}`}>
                    <input type="radio" name="visitType" value={v}
                      checked={visitType === v}
                      onChange={() => setVisitType(v)} />
                    <i className={`fas fa-${v === "초진" ? "user-plus" : "rotate-left"}`} />
                    <strong>{v}</strong>
                    <span>{v === "초진" ? "처음 방문" : "재방문"}</span>
                  </label>
                ))}
              </div>

              {/* 요청 사항 */}
              <div className="rm-section-header" style={{ marginTop: "1.5rem" }}>
                <span className="rm-section-icon"><i className="fas fa-file-lines" /></span>
                <h3>요청 사항 <span className="rm-optional">(선택)</span></h3>
              </div>
              <textarea
                className="rm-textarea"
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="증상이나 요청 사항을 적어주세요..."
                rows={3}
              />

              {/* 최종 예약 버튼 */}
              <button
                className={`rm-btn rm-btn-primary rm-btn-full ${submitting ? "loading" : ""}`}
                onClick={handleReserve}
                disabled={submitting}
              >
                {submitting
                  ? <><i className="fas fa-spinner fa-spin" /> 예약 중...</>
                  : <><i className="fas fa-calendar-plus" /> 예약 확정하기</>}
              </button>
            </div>
          )}

        </div>{/* /rm-body */}
      </div>{/* /rm-sheet */}
    </div>
  );
}