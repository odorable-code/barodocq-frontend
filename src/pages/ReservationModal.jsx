import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "../assets/styles/ReservationModal.css";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

const DAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

const generateDates = () => {
  const dates = [];
  for (let i = 0; i < 28; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
};

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

const toDateStr = (d) => d.toISOString().split("T")[0];

const nowHHMM = () => {
  const n = new Date();
  return `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
};

const groupByMonth = (dates) => {
  const map = new Map();
  dates.forEach((d) => {
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(d);
  });
  return Array.from(map.entries());
};

export default function ReservationModal({ hoNum, onClose }) {
  const [hospital,      setHospital]      = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [selectedDate,  setSelectedDate]  = useState(null);
  const [reservedTimes, setReservedTimes] = useState([]);
  const [selectedTime,  setSelectedTime]  = useState(null);
  const [visitType,     setVisitType]     = useState("초진");
  const [memo,          setMemo]          = useState("");
  const [step,          setStep]          = useState(1);
  const [submitting,    setSubmitting]    = useState(false);
  const [done,          setDone]          = useState(false);

  const overlayRef     = useRef(null);
  const bodyRef        = useRef(null);       // rm-body 스크롤 컨테이너
  const timeSectionRef = useRef(null);       // STEP2 시간 섹션
  const step3Ref       = useRef(null);       // STEP3 확인 섹션

  /* rm-body 내부에서 특정 섹션으로 부드럽게 스크롤 */
  const scrollToRef = (ref, delay = 160) => {
    setTimeout(() => {
      if (!ref.current || !bodyRef.current) return;
      const bodyRect    = bodyRef.current.getBoundingClientRect();
      const sectionRect = ref.current.getBoundingClientRect();
      const scrollTop   = bodyRef.current.scrollTop + (sectionRect.top - bodyRect.top) - 12;
      bodyRef.current.scrollTo({ top: Math.max(0, scrollTop), behavior: "smooth" });
    }, delay);
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

  const isTimeDisabled = (time) => {
    if (reservedTimes.includes(time)) return true;
    if (!selectedDate) return false;
    if (toDateStr(selectedDate) === toDateStr(new Date()) && time <= nowHHMM()) return true;
    return false;
  };

  /* ── 날짜 선택 → STEP2로 + 시간 섹션 스크롤 ── */
  const handleSelectDate = (dateObj) => {
    setSelectedDate(dateObj);
    setSelectedTime(null);
    setStep(2);
    scrollToRef(timeSectionRef);
  };

  /* ── 시간 선택 → STEP3로 + 확인 섹션 스크롤 ── */
  const handleSelectTime = (t) => {
    setSelectedTime(t);
    setStep(3);
    scrollToRef(step3Ref);
  };

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

  const dates    = generateDates();
  const todayStr = toDateStr(new Date());

  /* ── 완료 화면 ── */
  if (done) {
    return (
      <div className="rm-overlay open" ref={overlayRef}
        onClick={(e) => e.target === overlayRef.current && onClose()}>
        <div className="rm-sheet rm-sheet-sm">
          <button className="rm-close" onClick={onClose}><i className="fas fa-xmark" /></button>
          <div className="rm-done-screen">
            <div className="rm-done-icon"><i className="fas fa-circle-check" /></div>
            <div className="rm-done-badge">예약 완료</div>
            <h2>예약이 확정되었습니다!</h2>
            <div className="rm-done-info">
              <div className="rm-done-info-row">
                <i className="fas fa-hospital" />
                <span>{hospital?.hoName}</span>
              </div>
              <div className="rm-done-info-row">
                <i className="fas fa-calendar-check" />
                <span>{toDateStr(selectedDate)} · {selectedTime}</span>
              </div>
              <div className="rm-done-info-row">
                <i className="fas fa-user-doctor" />
                <span>{visitType}</span>
              </div>
            </div>
            <button className="rm-btn rm-btn-primary rm-btn-full" onClick={onClose}>
              <i className="fas fa-check" /> 확인
            </button>
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
          <div className="rm-header-icon-wrap">
            <i className="fas fa-hospital" />
          </div>
          <div className="rm-header-info">
            {loading
              ? <>
                  <div className="rm-skeleton rm-skeleton-title" />
                  <div className="rm-skeleton rm-skeleton-sub" />
                </>
              : <>
                  <h2 className="rm-hospital-name">{hospital?.hoName ?? "병원 정보 없음"}</h2>
                  <p className="rm-hospital-sub">
                    {hospital?.hoAddress &&
                      <span><i className="fas fa-location-dot" />{hospital.hoAddress}</span>}
                    {hospital?.hoPhone &&
                      <span><i className="fas fa-phone" />{hospital.hoPhone}</span>}
                  </p>
                </>
            }
          </div>
          <button className="rm-close" onClick={onClose}><i className="fas fa-xmark" /></button>
        </div>

        {/* ─── 스텝 인디케이터 ─── */}
        <div className="rm-steps">
          {[
            { n: 1, label: "날짜" },
            { n: 2, label: "시간" },
            { n: 3, label: "확인" },
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
        <div className="rm-body" ref={bodyRef}>

          {/* ══ STEP 1 : 날짜 선택 ══ */}
          <div className={`rm-section ${step >= 1 ? "visible" : ""}`}>
            <div className="rm-section-header">
              <span className="rm-section-icon"><i className="fas fa-calendar-days" /></span>
              <h3>날짜를 선택하세요</h3>
            </div>

            {groupByMonth(dates).map(([monthKey, monthDates]) => {
              const [year, month] = monthKey.split("-");
              const firstDow = monthDates[0].getDay();
              return (
                <div key={monthKey} className="rm-month-group">
                  <div className="rm-month-label">
                    <span className="rm-month-year">{year}년</span>
                    <strong className="rm-month-num">{month}월</strong>
                    <div className="rm-month-label-line" />
                  </div>

                  {/* 요일 헤더 */}
                  <div className="rm-day-header-row">
                    {DAY_KO.map((d, i) => (
                      <span key={i} className={`rm-day-header-cell ${i === 0 ? "sun" : i === 6 ? "sat" : ""}`}>
                        {d}
                      </span>
                    ))}
                  </div>

                  {/* 날짜 그리드 */}
                  <div className="rm-date-grid">
                    {Array.from({ length: firstDow }).map((_, i) => (
                      <div key={`offset-${i}`} className="rm-date-offset" />
                    ))}
                    {monthDates.map((d) => {
                      const ds      = toDateStr(d);
                      const dow     = d.getDay();
                      const past    = ds < todayStr;
                      const sel     = selectedDate && toDateStr(selectedDate) === ds;
                      const isToday = ds === todayStr;
                      return (
                        <button
                          key={ds}
                          className={[
                            "rm-date-btn",
                            sel       ? "selected"  : "",
                            past      ? "disabled"  : "",
                            isToday   ? "today"     : "",
                            dow === 0 ? "sunday"    : "",
                            dow === 6 ? "saturday"  : "",
                          ].filter(Boolean).join(" ")}
                          disabled={past}
                          onClick={() => handleSelectDate(d)}
                        >
                          <span className="rm-date-num">{d.getDate()}</span>
                          {isToday && <span className="rm-date-today-label">오늘</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ══ STEP 2 : 시간 선택 ══ */}
          {step >= 2 && (
            <div className="rm-section visible rm-section-animate" ref={timeSectionRef}>
              <div className="rm-section-header">
                <span className="rm-section-icon"><i className="fas fa-clock" /></span>
                <h3>시간을 선택하세요</h3>
                {selectedDate && (
                  <span className="rm-section-sub">
                    {toDateStr(selectedDate)} ({DAY_KO[selectedDate.getDay()]})
                  </span>
                )}
              </div>

              <div className="rm-time-block">
                <div className="rm-time-block-label"><i className="fas fa-sun" /> 오전</div>
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
                        onClick={() => handleSelectTime(t)}
                      >
                        <span className="rm-time-label">{t}</span>
                        {res && <span className="rm-time-tag">예약됨</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rm-lunch-divider">
                <i className="fas fa-utensils" />
                <span>점심시간 (12:00 ~ 13:00)</span>
              </div>

              <div className="rm-time-block">
                <div className="rm-time-block-label"><i className="fas fa-moon" /> 오후</div>
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
                        onClick={() => handleSelectTime(t)}
                      >
                        <span className="rm-time-label">{t}</span>
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
            <div className="rm-section visible rm-section-animate" ref={step3Ref}>
              <div className="rm-summary-banner">
                <div className="rm-summary-left">
                  <div className="rm-summary-icon"><i className="fas fa-calendar-check" /></div>
                  <div className="rm-summary-text">
                    <span className="rm-summary-date">
                      {selectedDate && toDateStr(selectedDate)}
                      <span className="rm-summary-dow">({selectedDate && DAY_KO[selectedDate.getDay()]})</span>
                    </span>
                    <strong className="rm-summary-time">{selectedTime}</strong>
                  </div>
                </div>
                <button className="rm-edit-btn"
                  onClick={() => { setSelectedTime(null); setStep(2); scrollToRef(timeSectionRef, 50); }}>
                  <i className="fas fa-pen-to-square" /> 변경
                </button>
              </div>

              <div className="rm-section-header" style={{ marginTop: "1.5rem" }}>
                <span className="rm-section-icon"><i className="fas fa-user-doctor" /></span>
                <h3>방문 유형</h3>
              </div>
              <div className="rm-visit-grid">
                {["초진", "재진"].map(v => (
                  <label key={v} className={`rm-visit-card ${visitType === v ? "selected" : ""}`}>
                    <input type="radio" name="visitType" value={v}
                      checked={visitType === v} onChange={() => setVisitType(v)} />
                    <div className="rm-visit-icon-wrap">
                      <i className={`fas fa-${v === "초진" ? "user-plus" : "rotate-left"}`} />
                    </div>
                    <strong>{v}</strong>
                    <span>{v === "초진" ? "처음 방문" : "재방문"}</span>
                  </label>
                ))}
              </div>

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
