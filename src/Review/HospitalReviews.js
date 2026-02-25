import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authFetch } from "../utils/authFetch";

function HospitalReviews() {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5; // 한 페이지에 보여줄 개수
  const navigate = useNavigate();

  // JWT 토큰에서 현재 사용자(sub) 가져오기
  const token = localStorage.getItem("accessToken");
  let currentUser = null;
  if (token) {
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      currentUser = payload.sub;
      console.log(currentUser);
    } catch (err) {
      console.error("토큰 디코딩 실패", err);
    }
  }

  //최신순
  const Last_order = async () => {
    try {
      const data = await authFetch(
        "http://localhost:8080/api/v1/reviews?sort=latest"
      );
      setReviews(data);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    }
  };

  //인기순
  const Popular_order = async () => {
    try {
      const data = await authFetch(
        "http://localhost:8080/api/v1/reviews?sort=popular"
      );
      setReviews(data);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    }
  };


  // 후기 삭제
  const deletePost = async (rvNum) => {
  const isDel = window.confirm("진짜 삭제합니까?");
  if (!isDel) {
    alert("삭제취소했습니다.");
    return;
  }

  try {
    const msg = await authFetch(`http://localhost:8080/api/v1/reviews/${rvNum}`, { method: "DELETE" });
    console.log(msg);
    alert("삭제 성공!");

    // 삭제 성공 시 바로 화면에서 rv_deleted_yn = 1 처리
    setReviews(prev =>
      prev.map(review =>
        review.rv_num === rvNum ? { ...review, rv_deleted_yn: 1 } : review
      )
    );
  } catch (err) {
    console.error("삭제 실패:", err);
    alert(err.message || "삭제 실패했습니다.");
  }
};

  // 후기 가져오기
  useEffect(() => {
    const getReviews = async () => {
      if (!token) return; 
      
      try {
        const data = await authFetch("http://localhost:8080/api/v1/reviews");
        setReviews(data);
        console.log(data);
      } catch (err) {
        console.error("에러:", err);
      }
    };
    getReviews();
  }, []); // 토큰이 준비된 후에만 실행


  // 제목 기준으로 검색된 리뷰만 반환
  const filteredReviews = reviews
    .filter((review) => review.rv_deleted_yn === 0)
    .filter((review) =>
      review.rv_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

  // 현재 페이지에 보여줄 데이터만 자르기
  const indexOfLast = currentPage * reviewsPerPage;
  const indexOfFirst = indexOfLast - reviewsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirst, indexOfLast);


  return (
    <>
      <h3 className="ms-4">전체후기</h3>

      <div className="bg-dark py-3 px-4 mb-3">
        <div className="container d-flex justify-content-center">
          <input
            type="text"
            className="form-control me-2"
            placeholder="검색어를 입력하세요"
            style={{ maxWidth: "500px" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="btn btn-warning ms-3"
            onClick={() => {}} // 필터링은 렌더링 시 처리됨
          >
            검색
          </button>
          <Link to="/reviews/create" className="btn btn-primary me-2">
            후기추가
          </Link>
        </div>
      </div>

      <div className="container">
        <div className="d-flex justify-content-end mt-1 mb-3">
          <a
            href="#"
            className="btn btn-primary btn-sm me-2"
            onClick={() => Last_order()}
          >최신순</a>
          <a
            href="#"
            className="btn btn-primary btn-sm me-2"
            onClick={() => Popular_order()}
          >인기순</a>
        </div>

        {currentReviews.map((review, index) => (
          <div
            key={review.rv_num} // rv_num 없으면 index fallback
            className="px-4 py-3 mb-3 mx-auto"
            style={{ maxWidth: "1500px", border: "1px solid black", borderRadius: "5px" }}
            onClick={() => navigate(`/reviews/${review.rv_num}`)}
          >
            <div className="d-flex align-items-center">
              <img src={
                    review.files && review.files.length > 0
                      ? `http://localhost:8080${review.files[0].rf_path}`
                      : "이미지없습"
                  }
                />
              <div className="flex-grow-1 align-self-start">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <span className="fw-bold me-2">{review.user_name}</span>
                    <span>평점: {"⭐".repeat(review.rv_rating)}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    {/* 작성자만 수정/삭제 버튼 보이기 */}
                    {review.user_id === currentUser && (
                      <>
                        <Link
                          to={`/reviews/revise/${review.rv_num}`}
                          className="btn btn-warning btn-sm me-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          수정
                        </Link>
                        <a
                          className="btn btn-danger btn-sm me-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePost(review.rv_num);
                          }}
                        >
                          삭제
                        </a>
                      </>
                    )}
                    <span className="fw-bold">{review.rv_created_at}</span>
                  </div>
                </div>

                <h5 className="fw-bold">{review.rv_title}</h5>
                <div className="fs-5">{review.rv_content}</div>

                <div className="d-flex justify-content-between mt-2">
                  <div>
                    조회수: {review.rv_view_count} &nbsp;&nbsp; 댓글수: {review.rv_comment_count}
                  </div>
                  <div>
                    <a href="#" onClick={(e) => e.stopPropagation()}>{review.ho_name}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="d-flex justify-content-center mt-3">
          <ul className="pagination">
    
            {/* Previous */}
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
            </li>

            {/* 페이지 번호 */}
            {[...Array(totalPages)].map((_, index) => (
              <li
                key={index}
                className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              </li>
            ))}

            {/* Next */}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </li>

          </ul>
        </div>

      </div>
    </>
  );
}

export default HospitalReviews;
