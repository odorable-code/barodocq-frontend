import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authFetch } from "./utils/authFetch";

function ReviewDetail() {
  const { rvNum } = useParams();
  const navigate = useNavigate();

  const [review, setReview] = useState(null);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const data = await authFetch(
          `http://localhost:8080/api/v1/reviews/${rvNum}`
        );

        setReview(data);  // 이미 JSON 객체로 반환됨
        console.log(data);
      } catch (err) {
        console.error(err);
        alert("후기 불러오기 실패");
      }
    };

    fetchReview();
  }, [rvNum]);
  
  if (!review) return <div className="text-center mt-5">로딩중...</div>;

  return (
    <div className="container mt-4" style={{ maxWidth: "800px" }}>
      
				<div className="mb-2">
  				<strong>{review.user_name}</strong> 평점: {"⭐".repeat(review.rv_rating)}
				</div>

      <div className="mb-2 text-muted">
        작성일: {review.rv_created_at}
      </div>

      <hr />
			<h3 className="mb-3">{review.rv_title}</h3>
      <div className="mb-4" style={{ whiteSpace: "pre-line" }}>
        {review.rv_content}
      </div>

      <div className="d-flex justify-content-between">
        <div>
          조회수: {review.rv_view_count} | 좋아요수: {review.rv_likes_count} | 댓글수: {review.rv_comment_count}
        </div>
        <div>{review.ho_name}</div>
      </div>

      <div className="mt-4">
        <button
          className="btn btn-warning me-2"
          onClick={() => navigate(`/reviews/revise/${rvNum}`)}
        >
          수정
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => navigate("/reviews")}
        >
          목록
        </button>
      </div>
    </div>
  );
}

export default ReviewDetail;
