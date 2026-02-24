import { useMemo, useState } from "react";

// ✅ 라디오 필터
const STATUS = ["전체", "승인요청", "승인완료"];

// ✅ 더미데이터
const DUMMY = Array.from({ length: 18 }).map((_, i) => ({
  id: i + 1,
  bizNo: "245-34-34235",
  adminId: `admin${String(i + 1).padStart(2, "0")}`,
  hospitalName: i % 2 === 0 ? "바로닥큐 병원" : "클린페이 의원",
  department: i % 3 === 0 ? "내과" : i % 3 === 1 ? "피부과" : "정형외과",
  address: "서울특별시 종로구 어딘가 123",
  phone: "02-1234-5678",
  alertAllowed: i % 2 === 0,
  firstJoinedAt: "2020.03.04",
  lastUpdatedAt: "2020.04.01",
  approveStatus: i % 3 === 0 ? "승인완료" : "승인요청",
}));

export default function ClaimPage() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("전체");
  const [searchField, setSearchField] = useState("전체");

  // ✅ 검색필드별로 어떤 컬럼을 검색할지 "매핑"으로 정리
  const fieldMap = useMemo(
    () => ({
      전체: (row) => [
        row.bizNo,
        row.adminId,
        row.hospitalName,
        row.department,
        row.address,
        row.phone,
      ],
      사업자번호: (row) => [row.hNo],
      관리자아이디: (row) => [row.adminId],
      병원명: (row) => [row.hospitalName],
      진료과: (row) => [row.department],
      주소: (row) => [row.address],
      전화번호: (row) => [row.phone],
    }),
    []
  );

  const filtered = useMemo(() => {
    const kw = keyword.trim();

    return DUMMY.filter((row) => {
      // 1) ✅ 상태 필터
      const hitStatus = status === "전체" ? true : row.approveStatus === status;

      // 2) ✅ 키워드 필터
      if (kw === "") return hitStatus;

      // 선택된 searchField에 맞는 값 배열 뽑기
      const candidates = (fieldMap[searchField] || fieldMap["전체"])(row);

      // candidates 중 하나라도 keyword 포함하면 true
      const hitKeyword = candidates.some((v) => String(v).includes(kw));

      return hitStatus && hitKeyword;
    });
  }, [keyword, status, searchField, fieldMap]);

  const handleApproveClick = (row) => {
    // 승인요청 버튼 눌렀을 때만 호출되게 아래에서 분기함
    alert(`승인요청 처리: ${row.hospitalName}`);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="breadcrumb">회원관리 &gt; 병원관리</div>
          <h1 className="page-title">병원관리</h1>
        </div>
        <button className="primary-btn">+ 신규등록</button>
      </div>

      <div className="card">
        <div className="filters">
          <div className="filter-row">
            <span className="label">검색옵션</span>
            <div className="chips">
              {STATUS.map((s) => (
                <label key={s} className="chip">
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

          <div className="search-row">
            <span className="label">검색명</span>
            <select
              className="select"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
            >
              <option>전체</option>
              <option>사업자번호</option>
              <option>관리자아이디</option>
              <option>병원명</option>
              <option>진료과</option>
              <option>주소</option>
              <option>전화번호</option>
            </select>

            <input
              className="input"
              placeholder="검색어를 입력해주세요."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />

            {/* 지금은 입력 즉시 필터라 버튼은 그냥 UI용 */}
            <button className="ghost-btn" type="button">
              검색
            </button>
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-meta">전체 {filtered.length}건</div>

        <table className="table">
          <thead>
            <tr>
              <th>사업자번호</th>
              <th>관리자아이디</th>
              <th>병원명</th>
              <th>진료과</th>
              <th>주소</th>
              <th>전화번호</th>
              <th>알림허용여부</th>
              <th>최초가입일</th>
              <th>마지막 정보수정일</th>
              <th>승인여부</th>
            </tr>
          </thead>

          <tbody>
            {filtered.slice(0, 10).map((r) => (
              <tr key={r.id}>
                <td>{r.bizNo}</td>
                <td>{r.adminId}</td>
                <td>{r.hospitalName}</td>
                <td>{r.department}</td>
                <td>{r.address}</td>
                <td>{r.phone}</td>

                <td className="cell-center">
                  <span className={`badge ${r.alertAllowed ? "ON" : "OFF"}`}>
                    {r.alertAllowed ? "허용" : "미허용"}
                  </span>
                </td>

                <td>{r.firstJoinedAt}</td>
                <td>{r.lastUpdatedAt}</td>

                {/* ✅ 승인여부 규칙 적용 */}
                <td className="cell-center">
                  {r.approveStatus === "승인요청" ? (
                    <button className="approve-btn request" type="button">
                      승인요청
                    </button>
                  ) : (
                    <span className="approve-done">승인완료</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="more">∨ 더보기 (1/12)</div>
      </div>
    </div>
  );
}