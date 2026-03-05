import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function AdminMe() {
  const [isEdit, setIsEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ 더미 제거: 초기값은 빈값(화면 깨짐 방지)
  const [formData, setFormData] = useState({
    adminNum: "",
    businessNum: "",
    adminId: "",
    adminName: "",
    adminAddr: "",
    adminEmail: "",
    adminPhone: "",

    // ✅ 추가 (병원명/권한)
    hoName: "",
    role: "",

    adminTermsAgreed: 0,
    adminLocationAgreed: 0,
    adminAlert: 0,

    adminCreatedAt: "",
    adminUpdatedAt: "",
  });

  // ✅ formData 선언 이후에 만들어야 함
  const roleLabel = formData.role === "superadmin" ? "최고 관리자" : "관리자";

  const agreeLabel = useMemo(
    () => ({
      adminTermsAgreed: "의료기관 서비스 이용약관 동의",
      adminLocationAgreed: "위치정보 서비스 이용약관 동의",
    }),
    []
  );

  // ✅ 공통: 토큰 헤더
  const getAuthHeaders = () => {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("jwt");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ✅ 내 정보 불러오기
  useEffect(() => {
    const fetchMe = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/v1/admin/me", {
          headers: getAuthHeaders(),
        });

        const data = res.data || {};

        setFormData({
          adminNum: data.adminNum ?? "",
          businessNum: data.businessNum ?? "",
          adminId: data.adminId ?? "",
          adminName: data.adminName ?? "",
          adminAddr: data.adminAddr ?? "",
          adminEmail: data.adminEmail ?? "",
          adminPhone: data.adminPhone ?? "",

          // ✅ 병원명/권한 내려오는 값 매핑
          hoName: data.hoName ?? "",
          role: data.role ?? "",

          adminTermsAgreed: Number(data.adminTermsAgreed ?? 0),
          adminLocationAgreed: Number(data.adminLocationAgreed ?? 0),
          adminAlert: Number(data.adminAlert ?? 0),

          adminCreatedAt: data.adminCreatedAt ?? "",
          adminUpdatedAt: data.adminUpdatedAt ?? "",
        });
      } catch (err) {
        console.error("내 정보 로딩 실패:", err);
        alert("내 정보를 불러오지 못했습니다. 로그인/토큰/권한을 확인해주세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (!isEdit) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setAgree = (key, allowed) => {
    if (!isEdit) return;
    setFormData((prev) => ({ ...prev, [key]: allowed ? 1 : 0 }));
  };

  // ✅ 저장(PUT)
  const handleSave = async () => {
    if (!window.confirm("변경 내용을 저장하시겠습니까?")) return;

    try {
      setIsSaving(true);

      // AdminUpdateDTO에 맞춰서 전송(수정 가능한 것만)
      const payload = {
        adminName: formData.adminName,
        adminAddr: formData.adminAddr,
        adminEmail: formData.adminEmail,
        adminPhone: formData.adminPhone,
        adminTermsAgreed: Number(formData.adminTermsAgreed),
        adminLocationAgreed: Number(formData.adminLocationAgreed),
        adminAlert: Number(formData.adminAlert),
      };

      await axios.put("/api/v1/admin/me", payload, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });

      alert("개인정보가 성공적으로 업데이트되었습니다.");
      setIsEdit(false);

      // 저장 후 최신값 다시 가져오기 (updatedAt 반영용)
      const res = await axios.get("/api/v1/admin/me", {
        headers: getAuthHeaders(),
      });
      const data = res.data || {};

      setFormData((prev) => ({
        ...prev,
        adminName: data.adminName ?? prev.adminName,
        adminAddr: data.adminAddr ?? prev.adminAddr,
        adminEmail: data.adminEmail ?? prev.adminEmail,
        adminPhone: data.adminPhone ?? prev.adminPhone,
        adminTermsAgreed: Number(data.adminTermsAgreed ?? prev.adminTermsAgreed),
        adminLocationAgreed: Number(
          data.adminLocationAgreed ?? prev.adminLocationAgreed
        ),
        adminAlert: Number(data.adminAlert ?? prev.adminAlert),
        adminUpdatedAt: data.adminUpdatedAt ?? prev.adminUpdatedAt,
        adminCreatedAt: data.adminCreatedAt ?? prev.adminCreatedAt,

        // ✅ 유지/갱신
        hoName: data.hoName ?? prev.hoName,
        role: data.role ?? prev.role,
      }));
    } catch (err) {
      console.error("내 정보 저장 실패:", err);
      alert("저장에 실패했습니다. 콘솔 로그를 확인해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="adm-page">
      <style>{`
        /* === AdminMe 전용 스코프 === */
        .me-scope .me-form-grid{
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .me-scope .me-form-field{
          display:flex;
          flex-direction:column;
          gap: 8px;
        }
        .me-scope .me-form-field.full{ grid-column: span 2; }

        .me-scope .me-label{
          display:flex;
          align-items:center;
          gap: 8px;
          font-size: .86rem;
          font-weight: 900;
          color: var(--text-secondary);
          margin-bottom: 2px;
        }
        .me-scope .me-label i{
          color: var(--primary-teal);
          width: 18px;
          text-align:center;
        }

        .me-scope .me-input{
          height: 48px;
          border: 2px solid var(--border-color);
          border-radius: 12px;
          padding: 0 14px;
          background:#fff;
          font-size: .95rem;
          font-weight: 700;
          color: var(--text-primary);
          outline:none;
          transition: all .2s ease;
        }
        .me-scope .me-input:focus{
          border-color: var(--primary-mint);
          box-shadow: 0 0 0 4px rgba(20,184,166,.12);
        }
        .me-scope .me-input[readonly]{
          background: var(--bg-secondary);
          border-color: transparent;
          color: var(--text-muted);
          cursor: not-allowed;
        }

        .me-scope .me-hint{
          font-size: .78rem;
          color: var(--text-muted);
          font-weight: 700;
          margin-top: 4px;
        }
      `}</style>

      {/* ✅ 헤더 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "2rem",
          maxWidth: "calc(320px + 2rem + 960px)",
        }}
      >
        <div>
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
            }}
          >
            <i className="fas fa-home" style={{ marginRight: "4px" }} /> 설정{" "}
            <i
              className="fas fa-chevron-right"
              style={{ fontSize: ".6rem", margin: "0 6px" }}
            />{" "}
            <span style={{ color: "var(--primary-teal)" }}>내 정보 관리</span>
          </div>

          <h1 className="adm-page-title" style={{ marginBottom: 0 }}>
            내 <span>정보 관리</span>
          </h1>
        </div>

        {/* ✅ 버튼 */}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {!isEdit ? (
            <button
              type="button"
              className="adm-th-btn"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary-mint), var(--primary-teal))",
                color: "#fff",
                border: "none",
                padding: "0.75rem 1.25rem",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-mint)",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 800,
                whiteSpace: "nowrap",
                opacity: loading ? 0.6 : 1,
              }}
              onClick={() => setIsEdit(true)}
              disabled={loading}
            >
              <i className="fas fa-pen" style={{ marginRight: "8px" }} />
              수정모드
            </button>
          ) : (
            <>
              <button
                type="button"
                className="adm-th-btn"
                style={{
                  background: "#fff",
                  border: "2px solid var(--border-color)",
                  color: "var(--text-secondary)",
                  padding: "0.75rem 1.25rem",
                  borderRadius: "var(--radius-lg)",
                  cursor: "pointer",
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
                onClick={() => setIsEdit(false)}
                disabled={isSaving}
              >
                <i className="fas fa-times" style={{ marginRight: "8px" }} />
                취소
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="adm-th-btn"
                style={{
                  background: isSaving
                    ? "var(--text-muted)"
                    : "linear-gradient(135deg, var(--primary-mint), var(--primary-teal))",
                  color: "#fff",
                  border: "none",
                  padding: "0.75rem 1.8rem",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: isSaving ? "none" : "var(--shadow-mint)",
                  cursor: isSaving ? "wait" : "pointer",
                  transition: "all 0.3s",
                  fontWeight: 900,
                  whiteSpace: "nowrap",
                }}
                disabled={isSaving}
              >
                {isSaving ? (
                  <i className="fas fa-spinner fa-spin" />
                ) : (
                  <i className="fas fa-save" style={{ marginRight: "8px" }} />
                )}
                {isSaving ? "저장 중..." : "저장"}
              </button>
            </>
          )}
        </div>
      </div>

      {loading && (
        <div style={{ marginBottom: "1rem", color: "var(--text-muted)", fontWeight: 700 }}>
          불러오는 중...
        </div>
      )}

      {/* ✅ 본문 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        {/* LEFT */}
        <div style={{ position: "sticky", top: "92px" }}>
          <div className="adm-card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: "var(--bg-secondary)",
                margin: "0 auto 1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "4px solid var(--primary-mint)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <i className="fas fa-user-tie" style={{ fontSize: "3.5rem", color: "var(--primary-teal)" }} />
            </div>

            {/* ✅ 이름 대신 병원명 */}
            <h2 style={{ fontSize: "1.4rem", fontWeight: 900, marginBottom: "0.5rem" }}>
              {formData.hoName || "병원명"} 관리자
            </h2>

            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              {formData.adminEmail || "-"}
            </p>

            {/* ✅ role에 따라 뱃지 */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 20px",
                borderRadius: "var(--radius-full)",
                background: "linear-gradient(135deg, var(--primary-mint), var(--primary-teal))",
                color: "#fff",
                fontSize: "0.85rem",
                fontWeight: 800,
                boxShadow: "var(--shadow-mint)",
              }}
            >
              <i className="fas fa-shield-halved" /> {roleLabel}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            maxWidth: "960px",
            width: "100%",
            marginRight: "auto",
          }}
        >
          {/* 기본 정보 */}
          <section className="adm-card me-scope" style={{ padding: "2rem" }}>
            <h2 className="sec-title" style={{ marginBottom: "1.5rem" }}>
              <i className="fas fa-id-card" /> 기본 정보
            </h2>

            <div className="me-form-grid">
              <div className="me-form-field">
                <label className="me-label">
                  <i className="fas fa-briefcase" /> 사업자번호
                </label>

                <input
                  name="businessNum"
                  className="me-input"
                  value={formData.businessNum}
                  readOnly
                  onClick={() => {
                    if (isEdit) {
                      alert("사업자번호 변경은 관리자 문의바랍니다.");
                    }
                  }}
                />

                <div className="me-hint">사업자번호 변경은 관리자 문의바랍니다.</div>
              </div>

              <div className="me-form-field">
                <label className="me-label"><i className="fas fa-user" /> 아이디</label>
                <input name="adminId" className="me-input" value={formData.adminId} readOnly />
                <div className="me-hint">아이디는 변경할 수 없습니다.</div>
              </div>

              <div className="me-form-field">
                <label className="me-label"><i className="fas fa-user-tie" /> 관리자 성함</label>
                <input
                  name="adminName"
                  className="me-input"
                  value={formData.adminName}
                  readOnly={!isEdit}
                  onChange={handleChange}
                />
              </div>

              <div className="me-form-field">
                <label className="me-label"><i className="fas fa-phone" /> 전화번호</label>
                <input
                  name="adminPhone"
                  className="me-input"
                  value={formData.adminPhone}
                  readOnly={!isEdit}
                  onChange={handleChange}
                  placeholder="010-0000-0000"
                />
              </div>

              <div className="me-form-field full">
                <label className="me-label"><i className="fas fa-location-dot" /> 주소</label>
                <input
                  name="adminAddr"
                  className="me-input"
                  value={formData.adminAddr}
                  readOnly={!isEdit}
                  onChange={handleChange}
                />
              </div>

              <div className="me-form-field full">
                <label className="me-label"><i className="fas fa-envelope" /> email</label>
                <input
                  name="adminEmail"
                  className="me-input"
                  value={formData.adminEmail}
                  readOnly={!isEdit}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* 동의 설정 */}
          <section className="adm-card" style={{ padding: "2rem" }}>
            <h2 className="sec-title" style={{ marginBottom: "1.5rem" }}>
              <i className="fas fa-user-shield" /> 동의 설정
            </h2>

            <div className="form-grid">
              {Object.entries(agreeLabel).map(([key, label]) => {
                const allowed = Number(formData[key]) === 1;

                return (
                  <div className="form-field" key={key}>
                    <label className="form-label">{label}</label>

                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        background: "var(--bg-secondary)",
                        padding: "0.5rem",
                        borderRadius: "var(--radius-xl)",
                        border: "2px solid var(--border-color)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setAgree(key, true)}
                        disabled={!isEdit || isSaving}
                        style={{
                          flex: 1,
                          height: "42px",
                          borderRadius: "999px",
                          border: "1px solid var(--border-color)",
                          cursor: isEdit ? "pointer" : "not-allowed",
                          fontWeight: 900,
                          background: allowed
                            ? "linear-gradient(135deg, var(--primary-mint), var(--primary-teal))"
                            : "#fff",
                          color: allowed ? "#fff" : "var(--text-secondary)",
                          transition: "all .2s",
                          opacity: isEdit ? 1 : 0.9,
                        }}
                      >
                        <i className="fas fa-check-circle" style={{ marginRight: "6px" }} />
                        허용
                      </button>

                      <button
                        type="button"
                        onClick={() => setAgree(key, false)}
                        disabled={!isEdit || isSaving}
                        style={{
                          flex: 1,
                          height: "42px",
                          borderRadius: "999px",
                          border: "1px solid var(--border-color)",
                          cursor: isEdit ? "pointer" : "not-allowed",
                          fontWeight: 900,
                          background: !allowed ? "#111827" : "#fff",
                          color: !allowed ? "#fff" : "var(--text-secondary)",
                          transition: "all .2s",
                          opacity: isEdit ? 1 : 0.9,
                        }}
                      >
                        <i className="fas fa-ban" style={{ marginRight: "6px" }} />
                        차단
                      </button>
                    </div>

                    <div style={{ marginTop: "8px", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>
                      현재 상태:{" "}
                      <span style={{ color: allowed ? "var(--primary-teal)" : "#111827", fontWeight: 900 }}>
                        {allowed ? "허용" : "차단"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 이력 */}
          <section className="adm-card me-scope" style={{ padding: "2rem" }}>
            <h2 className="sec-title" style={{ marginBottom: "1.5rem" }}>
              <i className="fas fa-clock" /> 이력
            </h2>

            <div className="me-form-grid">
              <div className="me-form-field">
                <label className="me-label"><i className="fas fa-calendar-plus" /> 가입일</label>
                <input className="me-input" value={formData.adminCreatedAt} readOnly />
              </div>

              <div className="me-form-field">
                <label className="me-label"><i className="fas fa-rotate" /> 정보수정일</label>
                <input className="me-input" value={formData.adminUpdatedAt} readOnly />
              </div>

              <div className="me-form-field full">
                <div className="me-hint">* 이력 정보는 시스템에서 자동 반영되며 수정할 수 없습니다.</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}