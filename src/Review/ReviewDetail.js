import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authFetch } from "../utils/authFetch";

function ReviewDetail() {
  const { rvNum } = useParams();
  const navigate = useNavigate();

  const [review, setReview] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [liked, setLiked] = useState(false); // 기본값 false

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await authFetch(
          `http://localhost:8080/api/v1/reviews/${rvNum}/comments`
        );
        setComments(data); // [{ id, user_name, content, created_at }]
      } catch (err) {
        console.error(err);
      }
    };

    fetchComments();
  }, [rvNum]);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const data = await authFetch(
          `http://localhost:8080/api/v1/reviews/${rvNum}`
        );

        setReview(data);  // 이미 JSON 객체로 반환됨
        setLiked(data.rlLike === 1);//후기, 좋아요 상태 가져오기
        console.log(data);
      } catch (err) {
        console.error(err);
        alert("후기 불러오기 실패");
      }
    };

    fetchReview();
  }, [rvNum]);
  
  if (!review) return <div className="text-center mt-5">로딩중...</div>;

  // 좋아요
  const handleLike = async () => {
    try {
      await authFetch(`http://localhost:8080/api/v1/reviews/${rvNum}/likes`, {
        method: "POST",
      });
      setLiked(!liked);
      const updated = await authFetch(`http://localhost:8080/api/v1/reviews/${rvNum}`);
      setReview(updated);
    } catch (err) {
      console.error(err);
      alert("좋아요 실패");
    }
  };

  return (
    
    <div className="container mt-4" style={{ maxWidth: "800px" }}>
      <div className="mt-4">
        <button
          className="btn-edit"
          onClick={() => navigate(`/reviews/revise/${rvNum}`)}
        >
          수정
        </button>

        <button
          className="btn-primary-s2"
          onClick={() => navigate("/reviews")}
        >
          목록
        </button>
      </div>
				<div className="mb-2">
  				<strong>{review.review.userName}</strong> 평점: {"⭐".repeat(review.review.rvRating)}
				</div>

      <div className="mb-2 text-muted">
        작성일: {review.review.rvCreatedAt}
      </div>

      <hr />
      <h2>{review.review.rvTitle}</h2>

      {review.files && review.files.map((file) => (
    <img
      key={file.rfNum}
      src={`http://localhost:8080${file.rfPath}`}
      alt="후기 이미지"
      style={{ width: "300px", marginBottom: "10px" }}
    />
  ))}
			<h3 className="mb-3">{review.rvTitle}</h3>
      <div className="mb-4" style={{ whiteSpace: "pre-line" }}>
        {review.review.rvContent}
      </div>

      <div className="d-flex justify-content-between">
        <div>
          조회수: {review.review.rvViewCount} | 좋아요수: {review.review.rvLikesCount} | 댓글수: {review.review.rvCommentCount}
        </div>
        <div>{review.hoName}</div>
      </div>


      <div className="mb-4">
        <button
          className={`btn-text-s2 ${liked ? "btn-edit" : "btn-text-s2"} me-2`}
          onClick={handleLike}
        >
          👍 {liked ? "좋아요 취소" : "좋아요"}
        </button>
        <span>{review.review.rvLikesCount}</span>
      </div>
      
      <div className="mt-4">
        <h4>댓글</h4>
      
      <div>
        {comments.map(c => (
          <div key={c.id} className="mb-2 p-2 border rounded">
            <strong>{c.userNum}</strong> <span className="text-muted">{c.rcCreatedAt}</span>
            <p>{c.rcContent}</p>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <textarea
          className="form-control"
          placeholder="댓글을 입력하세요"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          className="btn btn-primary mt-2"
          onClick={async () => {
            if (!newComment.trim()) return alert("댓글 내용을 입력하세요");

            try {
              await authFetch(`http://localhost:8080/api/v1/reviews/${rvNum}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rcContent: newComment })
              });

              // 댓글 추가 후 다시 가져오기
              const updated = await authFetch(`http://localhost:8080/api/v1/reviews/${rvNum}/comments`);
              setComments(updated);
              setNewComment("");
            } catch (err) {
              console.error(err);
              alert("댓글 작성 실패");
            }
          }}
        >
          등록
        </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewDetail;
