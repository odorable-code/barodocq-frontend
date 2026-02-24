import { useMemo, useState } from "react";

const STATUS = ["전체", "임시저장", "등록완료", "승인요청", "승인취소", "내역수정", "청구승인"];

const DUMMY = Array.from({ length: 18 }).map((_, i) => ({
  id: i + 1,
  status: i % 5 === 0 ? "보류" : i % 3 === 0 ? "등록중" : "등록",
  date: "2020.03.04",
  amount: "293,000,000,000원",
  type: "청구",
  requester: "김발주",
  receiver: "이수금",
  site: "A 건설현장",
  contractName: "장애인큰볼경기장 리모델링 공사(건축)",
  contractNo: "112342120312",
}));

export default function ClaimPage() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("등록완료");

  const filtered = useMemo(() => {
    return DUMMY.filter((row) => {
      const hitKeyword =
        keyword.trim() === "" ||
        row.site.includes(keyword) ||
        row.contractName.includes(keyword) ||
        row.contractNo.includes(keyword);

      // 예시: 상태칩(등록완료) 체크 느낌만 구현(실제 상태 매핑은 너 DB값에 맞춰서 수정)
      const hitStatus = status === "전체" ? true : status === "등록완료" ? row.status !== "보류" : true;

      return hitKeyword && hitStatus;
    });
  }, [keyword, status]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="breadcrumb">청구/지급 &gt; 근장재청구</div>
          <h1 className="page-title">근장재청구</h1>
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
            <select className="select">
              <option>전체</option>
              <option>현장명</option>
              <option>계약명</option>
              <option>계약번호</option>
            </select>
            <input
              className="input"
              placeholder="검색어를 입력해주세요."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button className="ghost-btn">검색</button>
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-meta">전체 {filtered.length}건</div>

        <table className="table">
          <thead>
            <tr>
              <th>번호</th>
              <th>상태</th>
              <th>청구년월</th>
              <th>청구금액</th>
              <th>청구구분</th>
              <th>발주자</th>
              <th>수급자</th>
              <th>현장명</th>
              <th>계약명</th>
              <th>계약번호</th>
              <th>등록일</th>
              <th>상세보기</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 7).map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>
                  <span className={`badge ${r.status}`}>
                    {r.status}
                  </span>
                </td>
                <td>{r.date}</td>
                <td className="right">{r.amount}</td>
                <td>{r.type}</td>
                <td>{r.requester}</td>
                <td>{r.receiver}</td>
                <td>{r.site}</td>
                <td>{r.contractName}</td>
                <td>{r.contractNo}</td>
                <td>{r.date}</td>
                <td>
                  <button className="link-btn">상세보기</button>
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