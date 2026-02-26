import { useMemo, useState } from "react";

// ✅ 성별 필터(라디오)
const GENDER = ["전체", "남", "여"];

// ✅ Font Awesome 소셜 아이콘
// (Font Awesome CSS가 로드돼 있어야 아이콘 보임)
const SocialIcon = ({ provider }) => {
  if (!provider) return <span>-</span>;

  const p = String(provider).toLowerCase();

  if (p === "kakao") {
    // 카카오는 free에서 브랜드 아이콘이 없을 수도 있어서 안전하게 solid로 처리
    return <i className="fa-solid fa-comment" title="Kakao" aria-label="Kakao" />;
  }
  if (p === "naver") {
    // 네이버도 환경에 따라 brand 아이콘이 없을 수 있어 N 뱃지로 안전 처리
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
    return <i className="fa-brands fa-google" title="Google" aria-label="Google" />;
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
    ).padStart(2, "0")}`, // ✅ yyyy-mm-dd
    gender: i % 2 === 0 ? "여" : "남",
    address:
      i % 3 === 0
        ? "서울특별시 종로구 ..."
        : i % 3 === 1
        ? "경기도 광명시 ..."
        : "인천광역시 ...",
    phone: `010-12${String(i).padStart(2, "0")}-56${String(i).padStart(2, "0")}`,
    email: `user${String(i + 1).padStart(2, "0")}@barodocq.com`,
    joinedAt: `2025.${String((i % 12) + 1).padStart(2, "0")}.${String(
      (i % 28) + 1
    ).padStart(2, "0")}`,
    updatedAt: `2026.${String((i % 2) + 1).padStart(2, "0")}.${String(
      (i % 28) + 1
    ).padStart(2, "0")}`,
    alertAllowed: i % 2 === 0,
    socialProvider: social, // null | kakao | naver | google
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
    <div className="adm-page">
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

        <table className="adm-table adm-table-customers">
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
                <td>{r.address}</td>
                <td>{r.phone}</td>
                <td>{r.email}</td>
                <td>{r.joinedAt}</td>
                <td>{r.updatedAt}</td>

                <td>
                  <div className="adm-cell-center">
                    <span
                      className={
                        "adm-badge " + (r.alertAllowed ? "adm-on" : "adm-off")
                      }
                    >
                      {r.alertAllowed ? "허용" : "미허용"}
                    </span>
                  </div>
                </td>

                <td>
                  <div className="adm-cell-center" title={r.socialProvider ?? "-"}>
                    <SocialIcon provider={r.socialProvider} />
                  </div>
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