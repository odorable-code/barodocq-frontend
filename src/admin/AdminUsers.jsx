import { useMemo, useState } from "react";

// ✅ 성별 필터(라디오)
const GENDER = ["전체", "남", "여"];

// ✅ Font Awesome 소셜 아이콘
const SocialIcon = ({ provider }) => {
  if (!provider) return <span>-</span>;

  const p = String(provider).toLowerCase();

  if (p === "kakao") {
    return (
      <i
        className="fa-solid fa-comment"
        title="Kakao"
        aria-label="Kakao"
      />
    );
  }
  if (p === "naver") {
    return (
      <span
        title="Naver"
        aria-label="Naver"
        style={{ fontWeight: 900, fontSize: 16, lineHeight: 1 }}
      >
        N
      </span>
    );
  }
  if (p === "google") {
    return (
      <i
        className="fa-brands fa-google"
        title="Google"
        aria-label="Google"
      />
    );
  }

  return <span>-</span>;
};

// ✅ 더미데이터
const DUMMY = Array.from({ length: 18 }).map((_, i) => {
  const social =
    i % 4 === 0 ? null : i % 4 === 1 ? "kakao" : i % 4 === 2 ? "naver" : "google";

  return {
    id: i + 1,
    userId: `user${String(i + 1).padStart(2, "0")}`,
    name: i % 2 === 0 ? "킹세종" : "홍길동",
    birth: `199${i % 10}-${String((i % 12) + 1).padStart(2, "0")}-${String(
      (i % 27) + 1
    ).padStart(2, "0")}`, // yyyy-mm-dd
    gender: i % 2 === 0 ? "여" : "남",
    address:
      i % 3 === 0
        ? "서울특별시 종로구 세종대로 123-45, 바로닥큐빌딩 10층 (테스트 주소가 길어질 수 있어요)"
        : i % 3 === 1
        ? "경기도 광명시 철산로 77, 2층"
        : "인천광역시 남동구 예술로 11, 301호",
    phone: `010-12${String(i).padStart(2, "0")}-56${String(i).padStart(2, "0")}`,
    email: `user${String(i + 1).padStart(2, "0")}@barodocq.com`,
    joinedAt: `2025.${String((i % 12) + 1).padStart(2, "0")}.${String(
      (i % 28) + 1
    ).padStart(2, "0")}`,
    updatedAt: `2026.${String((i % 2) + 1).padStart(2, "0")}.${String(
      (i % 28) + 1
    ).padStart(2, "0")}`,
    alertAllowed: i % 2 === 0,
    socialProvider: social,
  };
});

export default function UserMembersPage() {
  const [keyword, setKeyword] = useState("");
  const [gender, setGender] = useState("전체");
  const [searchField, setSearchField] = useState("전체");

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
        row.socialProvider ?? "-",
      ],
      아이디: (row) => [row.userId],
      성함: (row) => [row.name],
      전화번호: (row) => [row.phone],
      이메일: (row) => [row.email],
      주소: (row) => [row.address],
      소셜연동: (row) => [row.socialProvider ?? "-"],
    }),
    []
  );

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    return DUMMY.filter((row) => {
      const hitGender = gender === "전체" ? true : row.gender === gender;
      if (kw === "") return hitGender;

      const candidates = (fieldMap[searchField] || fieldMap["전체"])(row);
      const hitKeyword = candidates.some((v) =>
        String(v ?? "").toLowerCase().includes(kw)
      );

      return hitGender && hitKeyword;
    });
  }, [keyword, gender, searchField, fieldMap]);

  return (
    // ✅ 회원관리 페이지 전용 스코프
    <div className="adm-page adm-users-page">
      <style>{`
        /* ===== 회원관리(User) 전용 스코프 ===== */
        .adm-users-page .adm-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;     /* ✅ 컬럼폭 안정화 */
        }

        /* 기본은 한 줄 + ... */
        .adm-users-page .adm-table th,
        .adm-users-page .adm-table td {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          vertical-align: middle;
        }

        /* ✅ 주소는 줄바꿈 허용 + 2줄까지만(너무 길면 깔끔하게) */
        .adm-users-page .adm-addr {
          white-space: normal;
          word-break: keep-all;
          line-height: 1.35;

          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ===== 필요한 컬럼만 최소 지정 (노가다 최소) ===== */
        .adm-users-page .adm-table th:nth-child(1),
        .adm-users-page .adm-table td:nth-child(1) { width: 50px; }   /* No */
        .adm-users-page .adm-table th:nth-child(2),
        .adm-users-page .adm-table td:nth-child(2) { width: 120px; }  /* 아이디 */
        .adm-users-page .adm-table th:nth-child(3),
        .adm-users-page .adm-table td:nth-child(3) { width: 90px; }   /* 성함 */
        .adm-users-page .adm-table th:nth-child(4),
        .adm-users-page .adm-table td:nth-child(4) { width: 120px; }  /* 생년월일 */
        .adm-users-page .adm-table th:nth-child(5),
        .adm-users-page .adm-table td:nth-child(5) { width: 70px; }   /* 성별 */
        .adm-users-page .adm-table th:nth-child(6),
        .adm-users-page .adm-table td:nth-child(6) { width: 260px; }  /* 주소 */
        .adm-users-page .adm-table th:nth-child(7),
        .adm-users-page .adm-table td:nth-child(7) { width: 140px; }  /* 전화 */
        .adm-users-page .adm-table th:nth-child(8),
        .adm-users-page .adm-table td:nth-child(8) { width: 220px; }  /* 이메일 */
        .adm-users-page .adm-table th:nth-child(9),
        .adm-users-page .adm-table td:nth-child(9) { width: 120px; }  /* 가입 */
        .adm-users-page .adm-table th:nth-child(10),
        .adm-users-page .adm-table td:nth-child(10) { width: 120px; } /* 수정 */
        .adm-users-page .adm-table th:nth-child(11),
        .adm-users-page .adm-table td:nth-child(11) { width: 140px; } /* 알림 */
        .adm-users-page .adm-table th:nth-child(12),
        .adm-users-page .adm-table td:nth-child(12) { width: 90px; }  /* 소셜 */

        /* ✅ 중앙정렬 깨짐 방지 */
        .adm-users-page td.adm-cell-center {
          display: table-cell;
          text-align: center;
          vertical-align: middle;
        }

        /* 폰트어썸 아이콘 크기 */
        .adm-users-page .adm-cell-center i {
          font-size: 18px;
          line-height: 1;
        }
      `}</style>

      <div className="adm-page-head">
        <div>
          <div className="adm-breadcrumb">회원관리 &gt; 사용자 회원관리</div>
          <h1 className="adm-page-title">사용자 회원관리</h1>
        </div>
      </div>

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
        <div className="adm-table-meta">전체 {filtered.length}건</div>

        <table className="adm-table">
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
            {filtered.slice(0, 10).map((r, idx) => (
              <tr key={r.id}>
                <td>{idx + 1}</td>
                <td>{r.userId}</td>
                <td>{r.name}</td>
                <td>{r.birth}</td>
                <td>{r.gender}</td>

                {/* ✅ 주소만 전용 클래스 */}
                <td>
                  <div className="adm-addr" title={r.address}>
                    {r.address}
                  </div>
                </td>

                <td>{r.phone}</td>
                <td title={r.email}>{r.email}</td>
                <td>{r.joinedAt}</td>
                <td>{r.updatedAt}</td>

                <td className="adm-cell-center">
                  <span
                    className={
                      "adm-badge " + (r.alertAllowed ? "adm-on" : "adm-off")
                    }
                  >
                    {r.alertAllowed ? "허용" : "미허용"}
                  </span>
                </td>

                <td className="adm-cell-center" title={r.socialProvider ?? "-"}>
                  <SocialIcon provider={r.socialProvider} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="adm-more">∨ 더보기 (1/12)</div>
      </div>
    </div>
  );
}