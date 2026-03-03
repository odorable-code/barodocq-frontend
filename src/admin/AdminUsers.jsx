import { useEffect, useMemo, useState } from "react";

const GENDER = ["전체", "남", "여"];
const PAGE_SIZES = [20, 50, 100];

const SocialIcon = ({ kakaoLinked }) => {
  if (!kakaoLinked) return <span>-</span>;
  return <i className="fa-solid fa-comment" title="Kakao" aria-label="Kakao" />;
};

const pick = (obj, keys, fallback = null) => {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return fallback;
};

const normalizeList = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.list)) return payload.list;   // ✅ 백엔드 응답(list) 대응
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.result)) return payload.result;
  return [];
};

const toDateOnly = (v) => {
  if (!v) return "-";
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return s.slice(0, 10);
};

export default function UserMembersPage() {
  const [keyword, setKeyword] = useState("");
  const [gender, setGender] = useState("전체");
  const [searchField, setSearchField] = useState("전체");

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20); // ✅ 기본 20
  const [total, setTotal] = useState(0);

  const [usersRaw, setUsersRaw] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ 프론트 검색용 필드 매핑
  const fieldMap = useMemo(
    () => ({
      전체: (row) => [
        row.userId,
        row.name,
        row.birth,
        row.gender,
        row.address,
        row.phone,
        row.email,
        row.joinedAt,
        row.updatedAt,
        row.alertAllowed ? "허용" : "미허용",
        row.kakaoLinked ? "kakao" : "-",
      ],
      아이디: (row) => [row.userId],
      성함: (row) => [row.name],
      전화번호: (row) => [row.phone],
      이메일: (row) => [row.email],
      주소: (row) => [row.address],
      소셜연동: (row) => [row.kakaoLinked ? "kakao" : "-"],
    }),
    []
  );

  // ✅ 백엔드 페이징으로 목록 불러오기 (page/size 바뀌면 재호출)
  useEffect(() => {
    const controller = new AbortController();

    const fetchUsers = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/v1/admin/users?page=${page}&size=${size}`, {
          signal: controller.signal,
          credentials: "include",
        });

        if (!res.ok) throw new Error(`users fetch failed: ${res.status}`);

        const payload = await res.json();
        const list = normalizeList(payload);

        setUsersRaw(list);
        setTotal(Number(payload?.total ?? list.length));
      } catch (e) {
        if (e.name !== "AbortError") console.error(e);
        setUsersRaw([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    return () => controller.abort();
  }, [page, size]);

  // ✅ 서버에서 내려온 users를 화면용으로 정리 (social merge 삭제)
  const mergedRows = useMemo(() => {
    return usersRaw.map((u) => ({
      userNum: pick(u, ["user_num", "userNum"]),
      userId: pick(u, ["user_id", "userId"], "-"),
      name: pick(u, ["user_name", "userName"], "-"),
      birth: toDateOnly(pick(u, ["user_birth", "userBirth"])),
      gender: pick(u, ["user_gender", "userGender"], "-"),
      address: pick(u, ["user_addr", "userAddr"], "-"),
      phone: pick(u, ["user_phone", "userPhone"], "-"),
      email: pick(u, ["user_email", "userEmail"], "-"),
      joinedAt: toDateOnly(pick(u, ["user_created_at", "userCreatedAt"])),
      updatedAt: toDateOnly(pick(u, ["user_updated_at", "userUpdatedAt"])),
      alertAllowed: Number(pick(u, ["user_alert", "userAlert"], 0)) === 1,
      kakaoLinked: Boolean(pick(u, ["kakaoLinked"] , false)),
    }));
  }, [usersRaw]);

  // ✅ 프론트 필터(주의: 현재 페이지 데이터 기준)
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    return mergedRows.filter((row) => {
      const hitGender = gender === "전체" ? true : row.gender === gender;
      if (!hitGender) return false;

      if (!kw) return true;

      const candidates = (fieldMap[searchField] || fieldMap["전체"])(row);
      return candidates.some((v) => String(v ?? "").toLowerCase().includes(kw));
    });
  }, [mergedRows, keyword, gender, searchField, fieldMap]);

  // ✅ 서버 페이징이므로 totalPages는 서버 total 기준
  const totalPages = Math.max(1, Math.ceil(total / size));

  // 검색/필터/페이지크기 바뀌면 1페이지로
  useEffect(() => setPage(1), [keyword, gender, searchField, size]);

  return (
    <div className="adm-page adm-users-page">
      <div className="adm-page-head">
        <div>
          <div className="adm-breadcrumb">회원관리 &gt; 사용자 회원관리</div>
          <h1 className="adm-page-title">사용자 회원관리</h1>
        </div>
      </div>
      <style>{`
        .adm-users-page .adm-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .adm-users-page .adm-table th,
        .adm-users-page .adm-table td {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          vertical-align: middle;
        }

        /* ✅ No. 50px 고정 */
        .adm-users-page .col-no { width: 50px; }

        /* ✅ 이메일 넓게 */
        .adm-users-page .col-email { width: 220px; }

        /* ✅ 소셜 아이콘은 작게 */
        .adm-users-page .col-social { width: 80px; }

        /* 주소는 2줄까지 */
        .adm-users-page .adm-addr {
          white-space: normal;
          word-break: keep-all;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .adm-users-page td.adm-cell-center {
          display: table-cell;
          text-align: center;
          vertical-align: middle;
        }
        .adm-users-page .adm-cell-center i {
          font-size: 18px;
          line-height: 1;
        }

        /* ✅ 테이블 위 토글(20/50/100) */
        .adm-users-page .adm-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 10px 0;
        }
        .adm-users-page .adm-size-toggle {
          display: inline-flex;
          border: 1px solid var(--adm-line);
          border-radius: 999px;
          overflow: hidden;
          background: #fff;
        }
        .adm-users-page .adm-size-toggle button {
          border: 0;
          background: transparent;
          padding: 7px 12px;
          cursor: pointer;
          font-weight: 800;
          font-size: 13px;
          color: var(--adm-muted);
        }
        .adm-users-page .adm-size-toggle button.is-active {
          background: var(--primary-mint, #14b8a6);
          color: #fff;
        }

        .adm-users-page .adm-pager {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
          color: var(--adm-muted);
          font-size: 13px;
        }
        .adm-users-page .adm-pager button {
          border: 1px solid var(--adm-line);
          background: #fff;
          border-radius: 10px;
          padding: 6px 10px;
          cursor: pointer;
          font-weight: 700;
        }
        .adm-users-page .adm-pager button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }
      `}</style>

      <div className="adm-card">
        <div className="adm-filters">
          <div className="adm-filter-row">
            <span className="adm-label">성별</span>
            <div className="adm-chips">
              {GENDER.map((g) => (
                <label key={g} className="adm-chip">
                  <input
                    type="radio"
                    name="gender"
                    checked={gender === g}
                    onChange={() => setGender(g)}
                  />
                  <span>{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="adm-search-row">
            <span className="adm-label">검색</span>
            <select
              className="adm-select"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
            >
              <option>전체</option>
              <option>아이디</option>
              <option>성함</option>
              <option>전화번호</option>
              <option>이메일</option>
              <option>주소</option>
              <option>소셜연동</option>
            </select>

            <input
              className="adm-input"
              placeholder="검색어를 입력해주세요."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />

            <button className="adm-ghost-btn" type="button">
              검색
            </button>
          </div>
        </div>
      </div>
      <div className="adm-table-wrap">
        {/* ✅ 테이블 위 토글 + meta */}
        <div className="adm-topbar">
          <div className="adm-table-meta">
            전체 {total}건 {loading ? "· 불러오는 중..." : ""}
          </div>

          <div className="adm-size-toggle" role="tablist" aria-label="페이지당 개수">
            {PAGE_SIZES.map((n) => (
              <button
                key={n}
                type="button"
                className={n === size ? "is-active" : ""}
                onClick={() => setSize(n)}
              >
                {n}개
              </button>
            ))}
          </div>
        </div>

        <table className="adm-table">
          {/* ✅ colgroup으로 폭 제어 */}
          <colgroup>
            <col className="col-no" />
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
            <col className="col-email" />
            <col />
            <col />
            <col />
            <col className="col-social" />
          </colgroup>

          <thead>
            <tr>
              <th>No.</th>
              <th>아이디</th>
              <th>성함</th>
              <th>생년월일</th>
              <th>성별</th>
              <th>주소</th>
              <th>전화번호</th>
              <th>이메일</th>
              <th>가입일</th>
              <th>정보수정일</th>
              <th>알림허용여부</th>
              <th>소셜연동</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r, idx) => (
              <tr key={r.userNum ?? `${r.userId}-${idx}`}>
                {/* ✅ 서버 페이징 기준 No. */}
                <td>{(page - 1) * size + idx + 1}</td>
                <td>{r.userId}</td>
                <td>{r.name}</td>
                <td>{r.birth}</td>
                <td>{r.gender}</td>
                <td title={r.address}>
                  <div className="adm-addr">{r.address}</div>
                </td>
                <td>{r.phone}</td>
                <td title={r.email}>{r.email}</td>
                <td>{r.joinedAt}</td>
                <td>{r.updatedAt}</td>

                <td className="adm-cell-center">
                  <span className={"adm-badge " + (r.alertAllowed ? "adm-on" : "adm-off")}>
                    {r.alertAllowed ? "허용" : "미허용"}
                  </span>
                </td>

                <td className="adm-cell-center">
                  <SocialIcon kakaoLinked={r.kakaoLinked} />
                </td>
              </tr>
            ))}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={12} style={{ padding: 20, color: "var(--adm-muted)" }}>
                  조회 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="adm-pager">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            이전
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            다음
          </button>
        </div>

        {/* ⚠️ 참고: 지금 필터는 "현재 페이지 데이터" 기준이야.
            전체 데이터 기준 필터/검색을 하려면 백엔드에 keyword/gender 파라미터로 검색 API를 붙이는 게 정답! */}
      </div>
    </div>
  );
}