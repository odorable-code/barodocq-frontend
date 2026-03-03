import { useMemo, useState } from "react";

// ✅ 라디오 필터 (상태)
const STATUS = ["전체", "정상", "삭제"];

// ✅ 더미데이터 (리뷰)
const DUMMY_REVIEWS = Array.from({ length: 18 }).map((_, i) => ({
  rv_num: i + 1,
  rv_rating: (i % 5) + 1,
  rv_title: `후기 제목 ${i + 1}`,
  rv_content: `후기 내용 ${i + 1} ...`,
  rv_comment_count: i % 7,
  rv_view_count: 10 * (i + 1),
  rv_likes_count: i % 9,
  rv_created_at: "2026.03.03",
  rv_updated_at: "2026.03.03",
  rv_deleted_yn: i % 6 === 0 ? 1 : 0, // 0 정상, 1 삭제
  user_num: 100 + i,
  user_id: `user${String(i + 1).padStart(2, "0")}`, // ✅ 실제론 user 조인
  ho_num: (i % 4) + 1,
  hospital_name: i % 2 === 0 ? "바로닥큐 병원" : "클린페이 의원", // ✅ 실제론 hospital 조인
}));

// ✅ 더미데이터 (사진 테이블: review_files)
const DUMMY_FILES = [
  // rv_num 1에 2장
  { rf_num: 1, rv_num: 1, rf_ori_name: "a.jpg", rf_name: "a1.jpg", rf_path: "/uploads", rf_order: 1, rf_created_at: "2026.03.03" },
  { rf_num: 2, rv_num: 1, rf_ori_name: "b.jpg", rf_name: "b1.jpg", rf_path: "/uploads", rf_order: 2, rf_created_at: "2026.03.03" },

  // rv_num 3에 1장
  { rf_num: 3, rv_num: 3, rf_ori_name: "c.jpg", rf_name: "c1.jpg", rf_path: "/uploads", rf_order: 1, rf_created_at: "2026.03.03" },

  // rv_num 7에 3장
  { rf_num: 4, rv_num: 7, rf_ori_name: "d.jpg", rf_name: "d1.jpg", rf_path: "/uploads", rf_order: 1, rf_created_at: "2026.03.03" },
  { rf_num: 5, rv_num: 7, rf_ori_name: "e.jpg", rf_name: "e1.jpg", rf_path: "/uploads", rf_order: 2, rf_created_at: "2026.03.03" },
  { rf_num: 6, rv_num: 7, rf_ori_name: "f.jpg", rf_name: "f1.jpg", rf_path: "/uploads", rf_order: 3, rf_created_at: "2026.03.03" },
];

export default function AdminReviews() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("전체");
  const [searchField, setSearchField] = useState("전체");

  // ✅ 리뷰별 사진 개수 맵 (rv_num -> count)
  const fileCountMap = useMemo(() => {
    const map = new Map();
    for (const f of DUMMY_FILES) {
      map.set(f.rv_num, (map.get(f.rv_num) || 0) + 1);
    }
    return map;
  }, []);

  // ✅ 검색필드 매핑
  const fieldMap = useMemo(
    () => ({
      전체: (row) => [row.hospital_name, row.user_id, row.rv_title, row.rv_content],
      병원명: (row) => [row.hospital_name],
      작성자아이디: (row) => [row.user_id],
      제목: (row) => [row.rv_title],
      내용: (row) => [row.rv_content],
    }),
    []
  );

  const filtered = useMemo(() => {
    const kw = keyword.trim();

    return DUMMY_REVIEWS.filter((row) => {
      const hitStatus =
        status === "전체"
          ? true
          : status === "정상"
          ? row.rv_deleted_yn === 0
          : row.rv_deleted_yn === 1;

      if (kw === "") return hitStatus;

      const candidates = (fieldMap[searchField] || fieldMap["전체"])(row);
      const hitKeyword = candidates.some((v) => String(v).includes(kw));

      return hitStatus && hitKeyword;
    });
  }, [keyword, status, searchField, fieldMap]);

  // ✅ 클릭 이벤트만(라우팅은 나중에)
  const handleClickTitle = (rvNum) => {
    console.log("리뷰 상세로 이동:", rvNum);
    // 예) navigate(`/admin/reviews/${rvNum}`);
  };

  const handleClickHospital = (hoNum) => {
    console.log("병원 리뷰 목록/병원상세로 이동:", hoNum);
    // 예) navigate(`/admin/hospitals/${hoNum}`) or navigate(`/admin/reviews?hoNum=${hoNum}`)
  };

  return (
    <div className="adm-page adm-review-page">
      <style>{`
        /* ====== 리뷰관리 페이지 전용 스코프 ====== */
        .adm-review-page .adm-table { table-layout: fixed; }

        .adm-review-page .adm-table th,
        .adm-review-page .adm-table td {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ✅ No. 50px 고정 */
        .adm-review-page .adm-table th:nth-child(1),
        .adm-review-page .adm-table td:nth-child(1) { width: 50px; }

        /* 상태 */
        .adm-review-page .adm-table th:nth-child(2),
        .adm-review-page .adm-table td:nth-child(2) { width: 80px; }

        /* 병원명 */
        .adm-review-page .adm-table th:nth-child(3),
        .adm-review-page .adm-table td:nth-child(3) { width: 170px; }

        /* 작성자 */
        .adm-review-page .adm-table th:nth-child(4),
        .adm-review-page .adm-table td:nth-child(4) { width: 120px; }

        /* 별점 */
        .adm-review-page .adm-table th:nth-child(5),
        .adm-review-page .adm-table td:nth-child(5) { width: 80px; }

        /* 제목(가장 넓게) */
        .adm-review-page .adm-table th:nth-child(6),
        .adm-review-page .adm-table td:nth-child(6) { width: 260px; }

        /* 사진 */
        .adm-review-page .adm-table th:nth-child(7),
        .adm-review-page .adm-table td:nth-child(7) { width: 90px; }

        /* 등록일 */
        .adm-review-page .adm-table th:nth-child(8),
        .adm-review-page .adm-table td:nth-child(8) { width: 120px; }

        /* 조회수 */
        .adm-review-page .adm-table th:nth-child(9),
        .adm-review-page .adm-table td:nth-child(9) { width: 90px; }

        /* 👍 좋아요 */
        .adm-review-page .adm-table th:nth-child(10),
        .adm-review-page .adm-table td:nth-child(10) { width: 90px; }

        /* 댓글수 */
        .adm-review-page .adm-table th:nth-child(10),
        .adm-review-page .adm-table td:nth-child(10) { width: 90px; }

        .adm-review-page td.adm-cell-center { text-align: center; }

        /* 클릭 가능한 텍스트 */
        .adm-review-page .adm-linklike {
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        /* 삭제된 행 톤다운(선택) */
        .adm-review-page tr.is-deleted td { opacity: 0.55; }
      `}</style>

      <div className="adm-page-head">
        <div>
          <div className="adm-breadcrumb">게시글관리 &gt; 후기관리</div>
          <h1 className="adm-page-title">후기관리</h1>
        </div>
        {/* 필요하면 버튼 */}
        {/* <button className="adm-primary-btn">+ 신규등록</button> */}
      </div>

      <div className="adm-card">
        <div className="adm-filters">
          <div className="adm-filter-row">
            <span className="adm-label">상태</span>
            <div className="adm-chips">
              {STATUS.map((s) => (
                <label key={s} className="adm-chip">
                  <input
                    type="radio"
                    name="status"
                    checked={status === s}
                    onChange={() => setStatus(s)}
                  />
                  <span>{s}</span>
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
              <option>병원명</option>
              <option>작성자아이디</option>
              <option>제목</option>
              <option>내용</option>
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

        <table className="adm-table adm-table-reviews">
          <thead>
            <tr>
               <th>No.</th>
              <th>상태</th>
              <th>병원명</th>
              <th>작성자ID</th>
              <th>별점</th>
              <th>제목</th>
              <th>사진</th>
              <th>등록일</th>
              <th>조회수</th>
              <th>좋아요</th>
              <th>댓글수</th>
            </tr>
          </thead>

          <tbody>
            {filtered.slice(0, 10).map((r, idx) => {
              const fileCount = fileCountMap.get(r.rv_num) || 0;
              const isDeleted = r.rv_deleted_yn === 1;

              return (
                <tr key={r.rv_num} className={isDeleted ? "is-deleted" : ""}>
                  <td className="adm-cell-center">{idx + 1}</td>

                  <td className="adm-cell-center">
                    <span className={"adm-badge " + (isDeleted ? "adm-off" : "adm-on")}>
                      {isDeleted ? "삭제" : "정상"}
                    </span>
                  </td>

                  <td title={r.hospital_name}>
                    <span
                      className="adm-linklike"
                      onClick={() => handleClickHospital(r.ho_num)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && handleClickHospital(r.ho_num)}
                    >
                      {r.hospital_name}
                    </span>
                  </td>

                  <td>{r.user_id}</td>

                  <td className="adm-cell-center" title={`${r.rv_rating}점`}>
                    {Number(r.rv_rating).toFixed(1)}점
                  </td>

                  <td title={r.rv_title}>
                    <span
                      className="adm-linklike"
                      onClick={() => handleClickTitle(r.rv_num)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && handleClickTitle(r.rv_num)}
                    >
                      {r.rv_title}
                    </span>
                  </td>

                  <td className="adm-cell-center" title={fileCount ? `사진 ${fileCount}장` : "사진 없음"}>
                    {fileCount > 0 ? `📷 ${fileCount}` : "-"}
                  </td>

                  <td className="adm-cell-center">{r.rv_created_at}</td>
                  <td className="adm-cell-center">{r.rv_view_count}</td>
                  <td className="adm-cell-center">{r.rv_likes_count}</td>
                  <td className="adm-cell-center">{r.rv_comment_count}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="adm-more">∨ 더보기 (1/12)</div>
      </div>
    </div>
  );
}
