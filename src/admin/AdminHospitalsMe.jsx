import { useMemo, useState } from "react";

// ✅ 요일 상수 (DB의 hh_day_of_week 매핑용)
const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

const ALL_DEPTS = [
  "내과", "산부인과", "성형외과", "비뇨기과", "외과", "영상의학과",
  "소아청소년과", "이비인후과", "안과", "정형외과", "가정의학과",
  "흉부외과", "신경과", "치과", "피부과", "정신의학과", "한의과",
  "신경외과", "마취통증과", "재활의학과",
];

const makeDefaultHours = () =>
  DAYS.map((d) => ({
    day: d,
    open: "09:00",
    close: "18:00",
    lunch_s: "13:00",
    lunch_e: "14:00",
    yn: d !== "일", // 예시: 일요일은 휴무
  }));

export default function HospitalDetailPage() {
  const [isEdit, setIsEdit] = useState(false);

  // ✅ 초기 데이터 (실제로는 API나 Props로 받게 됩니다)
  const [formData, setFormData] = useState({
    ho_name: "메디움강남요양병원",
    ho_phone: "02-1234-5678",
    ho_addr: "서울특별시 강남구 테헤란로 123",
    ho_doc_count: 5,

    // ✅ 요일 전부 채워주기 (빠진 요일 있으면 자동 생성되게)
    hours: [
      { day: "월", open: "09:00", close: "18:00", lunch_s: "13:00", lunch_e: "14:00", yn: true },
      { day: "화", open: "09:00", close: "18:00", lunch_s: "13:00", lunch_e: "14:00", yn: true },
      // ... 일부만 있어도 아래에서 merge 처리됨
    ],

    // 진료과목 (M:N 조인 결과)
    deptMode: "select",
    depts: ["내과", "신경과", "정형외과"],
  });

  // ✅ hours가 일부만 들어와도 월~일 고정으로 보이게 정렬/보정
  const normalizedHours = useMemo(() => {
    const map = new Map(formData.hours.map((h) => [h.day, h]));
    return DAYS.map((d) => map.get(d) ?? makeDefaultHours().find((x) => x.day === d));
  }, [formData.hours]);

  // 입력값 핸들러 (기본 정보)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ 운영시간 변경 핸들러
  const handleHourChange = (idx, key, value) => {
    setFormData((prev) => {
      const next = [...normalizedHours]; // 화면에 보이는 정규화 배열 기준
      next[idx] = { ...next[idx], [key]: value };

      // normalizedHours를 그대로 hours로 저장 (월~일 모두 유지)
      return { ...prev, hours: next };
    });
  };

  // ✅ 진료여부 토글
  const handleToggleYn = (idx) => {
    setFormData((prev) => {
      const next = [...normalizedHours];
      const cur = next[idx];

      const toggled = !cur.yn;
      // 꺼질 때 시간값을 유지할지/지울지 선택 가능 (일단 유지)
      next[idx] = { ...cur, yn: toggled };
      return { ...prev, hours: next };
    });
  };

  // ✅ 저장 (예시)
  const handleSave = async () => {
    // TODO: 여기서 API 호출
    // await api.put(`/admin/hospitals/${id}`, formData);
    setIsEdit(false);
  };

  return (
    <div className="adm-page adm-hosp-detail">
      <style>{`
        /* ----- 레이아웃 ----- */
        .adm-hosp-detail .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .adm-hosp-detail .dept-tag-group {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        /* ----- INPUT UI 개선 (관리자 상세페이지 스코프에만 적용) ----- */
        .adm-hosp-detail .adm-search-row { display:flex; align-items:center; gap:12px; }
        .adm-hosp-detail .adm-label { min-width: 90px; color:#334155; font-weight:700; }

        .adm-hosp-detail .adm-input {
          width: 100%;
          height: 40px;
          padding: 0 12px;
          border: 1px solid #cbd5e1;     /* ✅ 경계 확실히 */
          border-radius: 10px;
          background: #ffffff;
          outline: none;
          transition: box-shadow .15s ease, border-color .15s ease, background .15s ease;
        }
        .adm-hosp-detail .adm-input:focus {
          border-color: #0f766e;         /* ✅ 포커스 */
          box-shadow: 0 0 0 4px rgba(20,184,166,.18);
        }

        /* readOnly일 때는 살짝 톤 다운 */
        .adm-hosp-detail .adm-input[readonly]{
          background: #f8fafc;
          color: #475569;
          cursor: default;
        }

        /* time input 크기 */
        .adm-hosp-detail .time-input {
          width: 120px;
        }

        /* 체크박스 보기 좋게 */
        .adm-hosp-detail .adm-check {
          width: 18px;
          height: 18px;
          accent-color: #14b8a6;
          cursor: pointer;
        }
        .adm-hosp-detail .adm-check:disabled{
          cursor: not-allowed;
          opacity: .55;
        }

        /* 진료여부 off일 때 행 비활성 느낌 */
        .adm-hosp-detail tr.is-off td {
          opacity: .55;
        }

        /* 칩(진료과목) 체크 UI */
        .adm-hosp-detail .adm-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 999px;
          background: #fff;
          cursor: pointer;
          user-select: none;
        }
        .adm-hosp-detail .adm-chip input {
          accent-color: #14b8a6;
        }
      `}</style>

      <div className="adm-page-head">
        <div>
          <div className="adm-breadcrumb">병원관리 &gt; 정보수정</div>
          <h1 className="adm-page-title">{isEdit ? "병원 정보 수정" : "병원 정보 상세"}</h1>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {isEdit ? (
            <>
              <button className="adm-ghost-btn" onClick={() => setIsEdit(false)}>
                취소
              </button>
              <button className="adm-primary-btn" onClick={handleSave}>
                저장하기
              </button>
            </>
          ) : (
            <button className="adm-primary-btn" onClick={() => setIsEdit(true)}>
              수정모드 전환
            </button>
          )}
        </div>
      </div>

      {/* 1. 기본 정보 */}
      <div className="adm-card">
        <h3 className="adm-label" style={{ width: "100%", marginBottom: "15px", fontSize: "16px" }}>
          기본 정보
        </h3>
        <div className="info-grid">
          <div className="adm-search-row">
            <span className="adm-label">병원명</span>
            <input
              name="ho_name"
              className="adm-input"
              value={formData.ho_name}
              readOnly={!isEdit}
              onChange={handleChange}
            />
          </div>
          <div className="adm-search-row">
            <span className="adm-label">전화번호</span>
            <input
              name="ho_phone"
              className="adm-input"
              value={formData.ho_phone}
              readOnly={!isEdit}
              onChange={handleChange}
            />
          </div>
          <div className="adm-search-row" style={{ gridColumn: "span 2" }}>
            <span className="adm-label">주소</span>
            <input
              name="ho_addr"
              className="adm-input"
              value={formData.ho_addr}
              readOnly={!isEdit}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* 2. 운영 시간 */}
      <div className="adm-table-wrap">
        <h3 className="adm-label" style={{ width: "100%", marginBottom: "15px", fontSize: "16px" }}>
          진료 시간 설정
        </h3>

        <table className="adm-table">
          <thead>
            <tr>
              <th>요일</th>
              <th>진료 여부</th>
              <th>진료 시간</th>
              <th>점심 시간</th>
            </tr>
          </thead>
          <tbody>
            {normalizedHours.map((item, idx) => (
              <tr key={item.day} className={!item.yn ? "is-off" : ""}>
                <td>{item.day}요일</td>

                <td className="adm-cell-center">
                  <input
                    type="checkbox"
                    className="adm-check"
                    checked={!!item.yn}
                    disabled={!isEdit}
                    onChange={() => handleToggleYn(idx)}
                  />
                </td>

                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="time"
                      className="adm-input time-input"
                      value={item.open}
                      disabled={!isEdit || !item.yn}
                      onChange={(e) => handleHourChange(idx, "open", e.target.value)}
                    />
                    <span>~</span>
                    <input
                      type="time"
                      className="adm-input time-input"
                      value={item.close}
                      disabled={!isEdit || !item.yn}
                      onChange={(e) => handleHourChange(idx, "close", e.target.value)}
                    />
                  </div>
                </td>

                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="time"
                      className="adm-input time-input"
                      value={item.lunch_s}
                      disabled={!isEdit || !item.yn}
                      onChange={(e) => handleHourChange(idx, "lunch_s", e.target.value)}
                    />
                    <span>~</span>
                    <input
                      type="time"
                      className="adm-input time-input"
                      value={item.lunch_e}
                      disabled={!isEdit || !item.yn}
                      onChange={(e) => handleHourChange(idx, "lunch_e", e.target.value)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. 진료 과목 (departments 조인 데이터) */}
      <div className="adm-card" style={{ marginTop: "20px" }}>
        <h3 className="adm-label" style={{ width: "100%", marginBottom: "15px", fontSize: "16px" }}>
          진료 과목
        </h3>

        {/* ✅ 전체 토글 */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <label className="adm-chip">
            <input
              type="checkbox"
              disabled={!isEdit}
              checked={formData.deptMode === "all"}
              onChange={() => {
                setFormData((prev) => ({
                  ...prev,
                  deptMode: prev.deptMode === "all" ? "select" : "all",
                  // ✅ 전체로 바꾸면 depts는 "전체 표기"를 위해 전체 리스트로 채워둠
                  depts: prev.deptMode === "all" ? prev.depts : [...ALL_DEPTS],
                }));
              }}
            />
            <span>전체</span>
          </label>

          <span style={{ color: "#64748b", fontSize: "13px" }}>
            {formData.deptMode === "all" ? "전체 과목 표시 중" : "선택한 과목만 표시 중"}
          </span>
        </div>

        {/* ✅ 전체면: 전부 표기 / 선택모드면: 체크로 선택 */}
        <div className="dept-tag-group">
          {ALL_DEPTS.map((dept) => {
            const isAll = formData.deptMode === "all";
            const checked = isAll || formData.depts.includes(dept);

            return (
              <label
                key={dept}d
                className="adm-chip"
                style={isAll ? { opacity: 0.9, cursor: "default" } : undefined}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={!isEdit || isAll}
                  onChange={() => {
                    if (isAll) return;

                    const nextDepts = formData.depts.includes(dept)
                      ? formData.depts.filter((d) => d !== dept)
                      : [...formData.depts, dept];

                    setFormData((prev) => ({ ...prev, depts: nextDepts }));
                  }}
                />
                <span>{dept}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}