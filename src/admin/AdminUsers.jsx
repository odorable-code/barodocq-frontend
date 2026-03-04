import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const GENDER_OPTIONS = ["전체", "남", "여"];
const PAGE_SIZES = [20, 50, 100];

/**
 * ✅ 백엔드 응답 형태가 다양할 수 있어서 "배열 뽑기"를 최대한 유연하게 처리
 * - res.data 가 배열이면 그대로
 * - res.data.items / res.data.data / res.data.result 등 흔한 케이스 대응
 */
function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.list)) return data.list;  
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.content)) return data.content; // spring pageable 흔한 키
  return [];
}

/**
 * ✅ snake_case / camelCase 섞여도 UI가 안 깨지게 안전 매핑
 * (너희 백엔드 DTO 이름에 맞춰 여기만 살짝 수정하면 끝)
 */
function normalizeUser(u) {
  return {
    userNum: u.userNum ?? u.user_num ?? u.id ?? u.userIdNum ?? u.user_no,
    userId: u.userId ?? u.user_id ?? u.userid ?? u.loginId ?? u.user_login_id,
    name: u.name ?? u.userName ?? u.user_name ?? u.username ?? u.user_nm,
    birth: u.birth ?? u.userBirth ?? u.user_birth ?? u.birthDay ?? u.user_birth_day,
    gender: u.gender ?? u.userGender ?? u.user_gender ?? u.sex,
    address: u.address ?? u.userAddr ?? u.user_addr ?? u.addr ?? u.user_address,
    phone: u.phone ?? u.userPhone ?? u.user_phone ?? u.tel ?? u.user_tel,
    email: u.email ?? u.userEmail ?? u.user_email ?? u.mail,
    joinedAt: u.joinedAt ?? u.userCreatedAt ?? u.user_created_at ?? u.createdAt ?? u.created_at,
    updatedAt: u.updatedAt ?? u.userUpdatedAt ?? u.user_updated_at ?? u.updatedAt ?? u.updated_at,
    alertAllowed:
      u.alertAllowed ?? u.userAlert ?? u.user_alert ?? u.alert_yn ?? u.alertYn ?? false,
    kakaoLinked:
      u.kakaoLinked ?? u.kakaoLinkedYn ?? u.kakao_linked ?? u.kakao_yn ?? u.kakaoYn ?? false,
  };
}

export default function UserMembersPage() {
  const [usersRaw, setUsersRaw] = useState([]);

  const [keyword, setKeyword] = useState("");
  const [genderFilter, setGenderFilter] = useState("전체");
  const [searchField, setSearchField] = useState("전체");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ✅ 실제 데이터 로드
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setLoadError("");

      const res = await axios.get("/api/v1/admin/users", {
        params: { page, size },
        withCredentials: true,
      });

      const list = extractList(res.data).map(normalizeUser);

      setUsersRaw(list);
      setTotal(res.data?.total ?? list.length);
      setTotalPages(res.data?.totalPages ?? 1);
      // setPage(1) 여기서는 빼야 함! (페이지 이동이 막혀버림)
    } catch (e) {
      setLoadError(e?.response?.data?.message || e?.message || "회원 목록을 불러오지 못했습니다.");
      setUsersRaw([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  // ✅ [기능] 검색 및 필터링 로직
  const filteredData = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    return usersRaw.filter((row) => {
      const hitGender = genderFilter === "전체" ? true : row.gender === genderFilter;
      if (!hitGender) return false;
      if (!kw) return true;

      const searchValues = {
        전체: [row.userId, row.name, row.phone, row.email, row.address],
        아이디: [row.userId],
        성함: [row.name],
        전화번호: [row.phone],
        이메일: [row.email],
        주소: [row.address],
      };
      const targets = searchValues[searchField] || searchValues["전체"];
      return targets.some((v) => String(v ?? "").toLowerCase().includes(kw));
    });
  }, [usersRaw, keyword, genderFilter, searchField]);


  // page가 totalPages보다 커지는 상황 방지(필터링 후)
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);



  return (
    <div className="adm-page">
      {/* 🟢 헤더 영역 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "2.5rem",
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
            <i className="fas fa-home" style={{ marginRight: "4px" }} /> 회원관리{" "}
            <i className="fas fa-chevron-right" style={{ fontSize: ".6rem", margin: "0 6px" }} />{" "}
            <span style={{ color: "var(--primary-teal)" }}>사용자 회원관리</span>
          </div>
          <h1 className="adm-page-title" style={{ marginBottom: 0 }}>
            사용자 <span>회원관리</span>
          </h1>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          style={{
            border: "none",
            padding: "10px 14px",
            borderRadius: "var(--radius-lg)",
            cursor: loading ? "not-allowed" : "pointer",
            background: loading ? "var(--bg-secondary)" : "var(--primary-mint)",
            color: loading ? "var(--text-muted)" : "#fff",
            fontWeight: 800,
          }}
          title="새로고침"
        >
          <i className="fas fa-rotate-right" style={{ marginRight: 8 }} />
          {loading ? "불러오는 중..." : "새로고침"}
        </button>
      </div>

      {/* ✅ 로딩/에러 배너 */}
      {loadError && (
        <div
          className="adm-card"
          style={{
            padding: "1rem 1.25rem",
            marginBottom: "1rem",
            borderLeft: "5px solid #ef4444",
            color: "#b91c1c",
            fontWeight: 700,
          }}
        >
          {loadError}
        </div>
      )}

      {/* 🟢 검색 및 필터 카드 */}
      <div className="adm-card" style={{ padding: "1.5rem 2rem" }}>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-secondary)" }}>
              성별필터
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {GENDER_OPTIONS.map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setGenderFilter(g);
                    setPage(1);
                  }}
                  style={{
                    width: "80px",
                    height: "38px",
                    borderRadius: "var(--radius-full)",
                    border: "2px solid",
                    borderColor: genderFilter === g ? "transparent" : "var(--border-color)",
                    background:
                      genderFilter === g
                        ? "linear-gradient(135deg, var(--primary-mint), var(--primary-teal))"
                        : "#fff",
                    color: genderFilter === g ? "#fff" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "var(--bg-secondary)",
              padding: "0.4rem",
              borderRadius: "var(--radius-xl)",
              border: "2px solid var(--border-color)",
            }}
          >
            <select
              className="adm-select"
              value={searchField}
              onChange={(e) => {
                setSearchField(e.target.value);
                setPage(1);
              }}
              style={{
                border: "none",
                background: "transparent",
                padding: "0 1rem",
                fontWeight: 700,
                color: "var(--primary-dark-teal)",
                outline: "none",
              }}
            >
              <option>전체</option>
              <option>아이디</option>
              <option>성함</option>
              <option>전화번호</option>
              <option>이메일</option>
              <option>주소</option>
            </select>

            <input
              className="adm-input"
              placeholder="검색어를 입력해주세요..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setKeyword("");
              }}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                height: "40px",
                outline: "none",
              }}
            />

            <button
              onClick={() => setPage(1)}
              style={{
                background: "var(--primary-mint)",
                color: "#fff",
                border: "none",
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-lg)",
                cursor: "pointer",
              }}
              title="검색"
            >
              <i className="fas fa-search" />
            </button>
          </div>
        </div>
      </div>

      {/* 🟢 데이터 테이블 영역 */}
      <div className="adm-table-wrap">
        <div
          style={{
            padding: "1.25rem 1.5rem",
            background: "#fff",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-secondary)" }}>
            검색 결과 <span style={{ color: "var(--primary-teal)" }}>{total}</span>건
          </span>

          <div style={{ display: "flex", gap: "6px" }}>
            {PAGE_SIZES.map((n) => (
              <button
                key={n}
                onClick={() => {
                  setSize(n);
                  setPage(1);
                }}
                style={{
                  border: "none",
                  background: n === size ? "var(--primary-mint)" : "var(--bg-secondary)",
                  color: n === size ? "#fff" : "var(--text-secondary)",
                  padding: "5px 14px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {n}개씩
              </button>
            ))}
          </div>
        </div>

        {/* ✅ 빈 데이터 처리 */}
        {!loading && total === 0 ? (
          <div
            style={{
              background: "#fff",
              padding: "3rem 1.5rem",
              textAlign: "center",
              color: "var(--text-muted)",
              borderTop: "1px solid var(--border-color)",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <div style={{ fontSize: "1.05rem", fontWeight: 900, marginBottom: 6 }}>
              표시할 회원이 없습니다
            </div>
            <div style={{ fontSize: ".9rem" }}>필터/검색 조건을 바꿔보세요.</div>
          </div>
        ) : (
          <table className="adm-table" style={{ tableLayout: "fixed", width: "100%", minWidth: "1500px" }}>
            <thead>
              <tr>
                <th style={{ width: "60px", textAlign: "center" }}>NO.</th>
                <th style={{ width: "130px", textAlign: "left" }}>아이디</th>
                <th style={{ width: "100px", textAlign: "left" }}>성함</th>
                <th style={{ width: "110px", textAlign: "center" }}>생년월일</th>
                <th style={{ width: "80px", textAlign: "center" }}>성별</th>
                <th style={{ textAlign: "left" }}>주소</th>
                <th style={{ width: "140px", textAlign: "left" }}>전화번호</th>
                <th style={{ width: "180px", textAlign: "left" }}>이메일</th>
                <th style={{ width: "110px", textAlign: "center" }}>가입일</th>
                <th style={{ width: "90px", textAlign: "center" }}>알림</th>
                <th style={{ width: "80px", textAlign: "center" }}>소셜</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((r, idx) => (
                <tr key={r.userNum ?? `${r.userId}-${idx}`} style={{ height: "64px" }}>
                  <td style={{ textAlign: "center", color: "var(--text-muted)" }}>
                    {(page - 1) * size + idx + 1}
                  </td>

                  <td style={{ textAlign: "left", fontWeight: 800, color: "var(--primary-teal)" }}>
                    {r.userId ?? "-"}
                  </td>

                  <td style={{ textAlign: "left", fontWeight: 700 }}>{r.name ?? "-"}</td>

                  <td style={{ textAlign: "center" }}>{r.birth ?? "-"}</td>

                  <td style={{ textAlign: "center" }}>{r.gender ?? "-"}</td>

                  <td
                    style={{
                      textAlign: "left",
                      fontSize: "0.85rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={r.address || ""}
                  >
                    {r.address ?? "-"}
                  </td>

                  <td style={{ textAlign: "left" }}>{r.phone ?? "-"}</td>

                  <td style={{ textAlign: "left", fontSize: "0.85rem" }}>{r.email ?? "-"}</td>

                  <td style={{ textAlign: "center", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    {r.joinedAt ?? "-"}
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <span
                      className={`adm-badge ${r.alertAllowed ? "adm-on" : "adm-off"}`}
                      style={{ width: "55px" }}
                    >
                      {r.alertAllowed ? "ON" : "OFF"}
                    </span>
                  </td>

                  <td style={{ textAlign: "center" }}>
                    {r.kakaoLinked ? (
                      <i
                        className="fa-solid fa-comment"
                        style={{
                          color: "#FEE500",
                          fontSize: "1.3rem",
                          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))",
                        }}
                        title="Kakao"
                      />
                    ) : (
                      <span style={{ color: "var(--border-color)" }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 🟢 페이지네이션 */}
        <div
          style={{
            padding: "1.5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1.5rem",
            background: "#fff",
            borderTop: "1px solid var(--border-color)",
          }}
        >
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "var(--radius-md)",
              border: "2px solid var(--border-color)",
              background: "#fff",
              color: "var(--text-secondary)",
              cursor: page === 1 ? "not-allowed" : "pointer",
              opacity: page === 1 ? 0.4 : 1,
            }}
            title="이전"
          >
            <i className="fas fa-chevron-left" />
          </button>

          <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)" }}>
            <span style={{ color: "var(--primary-teal)" }}>{page}</span> / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "var(--radius-md)",
              border: "2px solid var(--border-color)",
              background: "#fff",
              color: "var(--text-secondary)",
              cursor: page === totalPages ? "not-allowed" : "pointer",
              opacity: page === totalPages ? 0.4 : 1,
            }}
            title="다음"
          >
            <i className="fas fa-chevron-right" />
          </button>
        </div>
      </div>
    </div>
  );
}