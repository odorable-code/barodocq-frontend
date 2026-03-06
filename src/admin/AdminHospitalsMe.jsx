import { useEffect, useMemo, useState } from "react";
import axios from "axios";

/* ───────── 상수 및 도우미 함수 ───────── */
const DAYS = ["월", "화", "수", "목", "금", "토", "일"];
const ALL_DEPTS = [
  "내과","산부인과","성형외과","비뇨기과","외과","영상의학과",
  "소아청소년과","이비인후과","안과","정형외과","가정의학과",
  "흉부외과","신경과","치과","피부과","정신의학과","한의과",
  "신경외과","마취통증과","재활의학과",
];

const makeDefaultHours = () =>
  DAYS.map((d) => ({
    day: d,
    open: "09:00",
    close: "18:00",
    lunch_s: "13:00",
    lunch_e: "14:00",
    yn: d !== "일",
  }));

const DAY_COLORS = {
  월: "#14b8a6", 화: "#0d9488", 수: "#0f766e",
  목: "#14b8a6", 금: "#0d9488", 토: "#3b82f6", 일: "#94a3b8",
};

export default function HospitalDetailPage() {
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ 더미 제거: 기본값만 (화면 깨짐 방지용)
  const [formData, setFormData] = useState({
    ho_name: "",
    ho_phone: "",
    ho_addr: "",
    ho_doc_count: 0,
    hours: makeDefaultHours(),
    deptMode: "select",
    depts: [],
  });

  // ✅ 실데이터 불러오기 (JWT 포함)
  useEffect(() => {
    const fetchHospital = async () => {
      try {
        setLoading(true);

        const token =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("token") ||
          localStorage.getItem("jwt");

        const res = await axios.get("/api/v1/admin/hospitals/me", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const data = res.data || {};

        setFormData((prev) => ({
          ...prev,
          ho_name: data.hoName ?? "",
          ho_phone: data.hoPhone ?? "",
          ho_addr: data.hoAddr ?? "",
          ho_doc_count: data.hoDocCount ?? 0,

          // hours: 백엔드가 내려주면 변환해서 넣고, 없으면 기존 기본값 유지
          hours:
            Array.isArray(data.hours) && data.hours.length
              ? data.hours.map((h) => ({
                  day: h.day,                 // "월" 기대
                  open: h.open ?? "09:00",
                  close: h.close ?? "18:00",
                  lunch_s: h.lunchS ?? "13:00", // ✅ lunchS -> lunch_s
                  lunch_e: h.lunchE ?? "14:00", // ✅ lunchE -> lunch_e
                  yn: !!h.yn,
                }))
              : prev.hours,

          // depts
          depts: Array.isArray(data.depts) ? data.depts : prev.depts,

          deptMode: "select",
        }));
      } catch (err) {
        console.error("병원 정보 로딩 실패:", err);
        alert("병원 정보를 불러오지 못했습니다. 로그인/토큰/권한을 확인해주세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchHospital();
  }, []);

  const normalizedHours = useMemo(() => {
    const map = new Map((formData.hours ?? []).map((h) => [h.day, h]));
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

  const handleSave = () => {
    if (!window.confirm("변경 내용을 저장하시겠습니까?")) return;
    // ✅ 저장(PUT)은 다음 단계에서 붙이면 됨
    setIsEdit(false);
  };

  return (
    <div className="adm-page detail-scope">
      {/* 🎨 [핵심] 환골탈태 CSS 스펙 */}
      <style>{`
        .detail-scope {
          --primary: #14b8a6; --primary-dark: #0d9488;
          --bg-main: #f8fafc; --bg-card: #ffffff;
          --border: #e2e8f0; --text-main: #0f172a; --text-sub: #64748b;
          --radius: 16px; --radius-sm: 8px;
        }
        .detail-inner { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; padding: 2rem 1rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .title-area h1 { font-size: 2rem; font-weight: 900; margin: 0; color: var(--text-main); letter-spacing: -1px; }
        .title-area h1 span { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .breadcrumb { font-size: 0.85rem; color: var(--text-sub); font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }

        .btn-wrap { display: flex; gap: 10px; }
        .btn-modern { padding: 0.8rem 1.6rem; border-radius: var(--radius-sm); font-weight: 800; font-size: 0.9rem; cursor: pointer; border: none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; gap: 8px; }
        .btn-save { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; box-shadow: 0 10px 20px rgba(20, 184, 166, 0.2); }
        .btn-save:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(20, 184, 166, 0.3); }
        .btn-cancel { background: #fff; border: 2px solid var(--border); color: var(--text-sub); }
        .btn-cancel:hover { border-color: #fca5a5; color: #ef4444; }

        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
        .summary-item { background: #fff; padding: 1.5rem; border-radius: var(--radius); border: 1px solid var(--border); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .sum-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: #fff; margin-bottom: 12px; }
        .sum-val { font-size: 1.1rem; font-weight: 800; color: var(--text-main); margin-bottom: 2px; }
        .sum-lbl { font-size: 0.75rem; color: var(--text-sub); font-weight: 700; }

        .card-modern { background: #fff; border-radius: var(--radius); border: 1px solid var(--border); padding: 2.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .sec-title { display: flex; align-items: center; gap: 10px; font-size: 1.25rem; font-weight: 800; margin-bottom: 2rem; color: var(--text-main); }
        .sec-title i { color: var(--primary); }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .form-field { display: flex; flex-direction: column; gap: 8px; }
        .form-field.full { grid-column: span 2; }
        .form-label { font-size: 0.85rem; font-weight: 800; color: var(--text-sub); display: flex; align-items: center; gap: 6px; }
        .input-modern { height: 48px; border: 2px solid var(--border); border-radius: var(--radius-sm); padding: 0 16px; font-size: 0.95rem; font-weight: 600; outline: none; transition: all 0.2s; background: #fff; }
        .input-modern:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1); }
        .input-modern[readonly] { background: #f8fafc; border-color: transparent; color: #64748b; }

        .hours-container { display: flex; flex-direction: column; gap: 12px; }
        .hour-header { display: grid; grid-template-columns: 120px 80px 1.5fr 1.5fr; padding: 0 20px 10px; font-size: 0.8rem; font-weight: 800; color: var(--text-sub); border-bottom: 2px solid var(--bg-main); }
        .hour-row { display: grid; grid-template-columns: 120px 80px 1.5fr 1.5fr; align-items: center; padding: 14px 20px; background: var(--bg-main); border-radius: 12px; transition: all 0.2s; border: 1px solid transparent; }
        .hour-row:hover { background: #fff; border-color: var(--primary); transform: scale(1.01); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .day-box { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 0.95rem; }
        .day-dot { width: 10px; height: 10px; border-radius: 50%; }
        .time-input-wrap { display: flex; align-items: center; gap: 8px; justify-content: center; background: #fff; border: 1px solid var(--border); padding: 6px 12px; border-radius: 8px; transition: 0.2s; }
        .time-input-wrap:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1); }
        .time-input-modern { border: none; font-family: 'Pretendard'; font-size: 0.9rem; font-weight: 700; color: var(--text-main); outline: none; background: transparent; cursor: pointer; }
        .time-sep { font-weight: 900; color: var(--border); }

        .switch-wrap { display: flex; justify-content: center; }
        .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; inset: 0; background-color: #cbd5e1; transition: .4s; border-radius: 34px; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: var(--primary); }
        input:checked + .slider:before { transform: translateX(20px); }
        input:disabled + .slider { opacity: 0.4; cursor: not-allowed; }

        .chip-grid { display: flex; flex-wrap: wrap; gap: 10px; }
        .chip-modern { padding: 10px 18px; border-radius: 12px; border: 2px solid var(--border); font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.2s; background: #fff; color: var(--text-sub); display: flex; align-items: center; gap: 8px; }
        .chip-modern:hover:not(.disabled) { border-color: var(--primary); color: var(--primary); background: rgba(20, 184, 166, 0.05); }
        .chip-modern.active { border-color: var(--primary); background: var(--primary); color: #fff; box-shadow: 0 4px 10px rgba(20, 184, 166, 0.3); }
        .chip-modern.disabled { opacity: 0.5; cursor: not-allowed; }

        .loading-box { padding: 16px 20px; border: 1px dashed var(--border); border-radius: 12px; background: #fff; color: var(--text-sub); font-weight: 700; }
      `}</style>

      <div className="detail-inner">
        <header className="page-header">
          <div className="title-area">
            <div className="breadcrumb">
              <i className="fas fa-hospital" /> 병원관리
              <i className="fas fa-chevron-right" style={{ fontSize: "0.6rem" }} />
              <span>정보 상세 설정</span>
            </div>
            <h1>
              {isEdit ? (
                <>
                  <span>병원 정보</span> 수정하기
                </>
              ) : (
                <>
                  <span>병원 정보</span> 상세내역
                </>
              )}
            </h1>
          </div>

          <div className="btn-wrap">
            {isEdit ? (
              <>
                <button className="btn-modern btn-cancel" onClick={() => setIsEdit(false)}>
                  <i className="fas fa-times" /> 취소
                </button>
                <button className="btn-modern btn-save" onClick={handleSave}>
                  <i className="fas fa-check" /> 설정 저장
                </button>
              </>
            ) : (
              <button className="btn-modern btn-save" onClick={() => setIsEdit(true)} disabled={loading}>
                <i className="fas fa-pen-to-square" /> 정보 수정 모드
              </button>
            )}
          </div>
        </header>

        {loading && <div className="loading-box">병원 정보를 불러오는 중...</div>}

        <div className="summary-grid">
          <Summary icon="hospital" label="진료 기관명" val={formData.ho_name || "-"} color="#14b8a6" />
          <Summary icon="phone-volume" label="대표 연락처" val={formData.ho_phone || "-"} color="#0d9488" />
          <Summary icon="user-doctor" label="소속 의사" val={`${formData.ho_doc_count ?? 0}명`} color="#0f766e" />
          <Summary icon="calendar-check" label="진료 일수" val={`${normalizedHours.filter(h => h.yn).length}일 / 7일`} color="#115e59" />
        </div>

        <section className="card-modern">
          <h2 className="sec-title"><i className="fas fa-id-card" /> 기관 기본 정보</h2>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">병원 명칭</label>
              <input name="ho_name" className="input-modern" value={formData.ho_name} readOnly={!isEdit} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label className="form-label">연락처</label>
              <input name="ho_phone" className="input-modern" value={formData.ho_phone} readOnly={!isEdit} onChange={handleChange} />
            </div>
            <div className="form-field full">
              <label className="form-label">소재지 주소</label>
              <input name="ho_addr" className="input-modern" value={formData.ho_addr} readOnly={!isEdit} onChange={handleChange} />
            </div>
          </div>
        </section>

        <section className="card-modern">
          <h2 className="sec-title"><i className="fas fa-clock-rotate-left" /> 운영 및 점심 시간 설정</h2>

          <div className="hours-container">
            <div className="hour-header">
              <span>요일</span>
              <span style={{ textAlign: "center" }}>진료여부</span>
              <span style={{ textAlign: "center" }}>진료 시간</span>
              <span style={{ textAlign: "center" }}>점심 시간</span>
            </div>

            {normalizedHours.map((item, idx) => (
              <div key={item.day} className={`hour-row ${!item.yn ? "is-off" : ""}`}>
                <div className="day-box">
                  <div className="day-dot" style={{ background: DAY_COLORS[item.day] }} />
                  {item.day}요일
                </div>

                <div className="switch-wrap">
                  <label className="switch">
                    <input type="checkbox" checked={!!item.yn} disabled={!isEdit} onChange={() => handleToggleYn(idx)} />
                    <span className="slider" />
                  </label>
                </div>

                <div className="time-input-wrap">
                  <i className="far fa-clock" style={{ fontSize: "0.8rem", color: "var(--text-sub)" }} />
                  <input type="time" className="time-input-modern" value={item.open} disabled={!isEdit || !item.yn} onChange={(e) => handleHourChange(idx, "open", e.target.value)} />
                  <span className="time-sep">~</span>
                  <input type="time" className="time-input-modern" value={item.close} disabled={!isEdit || !item.yn} onChange={(e) => handleHourChange(idx, "close", e.target.value)} />
                </div>

                <div className="time-input-wrap">
                  <i className="fas fa-utensils" style={{ fontSize: "0.8rem", color: "var(--text-sub)" }} />
                  <input type="time" className="time-input-modern" value={item.lunch_s} disabled={!isEdit || !item.yn} onChange={(e) => handleHourChange(idx, "lunch_s", e.target.value)} />
                  <span className="time-sep">~</span>
                  <input type="time" className="time-input-modern" value={item.lunch_e} disabled={!isEdit || !item.yn} onChange={(e) => handleHourChange(idx, "lunch_e", e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card-modern" style={{ marginBottom: "5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <h2 className="sec-title" style={{ marginBottom: 0 }}><i className="fas fa-stethoscope" /> 진료 과목 관리</h2>
            <label
              className="chip-modern active"
              style={{ fontSize: "0.8rem", padding: "8px 14px" }}
              onClick={() => {
                if (!isEdit) return;
                setFormData((p) => ({ ...p, depts: [...ALL_DEPTS], deptMode: "all" }));
              }}
            >
              <i className="fas fa-check-double" /> 전체 선택
            </label>
          </div>

          <div className="chip-grid">
            {ALL_DEPTS.map((dept) => {
              const isChecked = formData.depts.includes(dept);
              return (
                <div
                  key={dept}
                  className={`chip-modern ${isChecked ? "active" : ""} ${!isEdit ? "disabled" : ""}`}
                  onClick={() => {
                    if (!isEdit) return;
                    const next = isChecked ? formData.depts.filter((d) => d !== dept) : [...formData.depts, dept];
                    setFormData((p) => ({ ...p, depts: next }));
                  }}
                >
                  {isChecked && <i className="fas fa-check" />}
                  {dept}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ── 내부 컴포넌트: 요약 아이템 ── */
function Summary({ icon, label, val, color }) {
  return (
    <div className="summary-item">
      <div className="sum-icon" style={{ background: color }}>
        <i className={`fas fa-${icon}`} />
      </div>
      <div className="sum-val">{val}</div>
      <div className="sum-lbl">{label}</div>
    </div>
  );
}