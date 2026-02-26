import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../assets/styles/ReviewDetail.css";
import { authFetch } from "../utils/AuthFetch";
function ReviewDetail() {
  const { rvNum } = useParams();
  const navigate = useNavigate();

  const [review, setReview] = useState(null);
  const [files, setFiles] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [liked, setLiked] = useState(false); // 기본값 false

  // useEffect(() => {
  //   const fetchComments = async () => {
  //     try {
  //       const data = await authFetch(
  //         `http://localhost:8080/api/v1/reviews/${rvNum}/comments`
  //       );
  //       console.log("comments from server:", data);
  //       setComments(data); // [{ id, user_name, content, created_at }]
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };

  //   fetchComments();
  // }, [rvNum]);
  useEffect(() => {
  const fetchComments = async () => {
    try {
      const response = await authFetch(
        `http://localhost:8080/api/v1/reviews/${rvNum}/comments`
      );
      const data = await response.json();
      console.log("comments from server:", data);
      // 서버가 배열을 직접 내려주면 그대로, 아니면 data.comments
      const commentArray = Array.isArray(data) ? data : data.comments || [];
      setComments(commentArray);
    } catch (err) {
      console.error(err);
      setComments([]); // 에러 시 빈 배열
    }
  };

  fetchComments();
}, [rvNum]);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await authFetch(
          `http://localhost:8080/api/v1/reviews/${rvNum}`
        );
        const data = await response.json();
        setReview(data.review);// 이미 JSON 객체로 반환됨
        setLiked(data.review.rlLike === 1);//후기, 좋아요 상태 가져오기
        setFiles(data.files || []); // 필요하면 files 별도 state
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
    const data = await updated.json();

    // review는 data.review, files는 data.files
    setReview(data.review);
    setFiles(data.files || []); // files state도 별도로 유지
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
  				<strong>{review.userName}</strong> 평점: {"⭐".repeat(review.rvRating)}
				</div>

      <div className="mb-2 text-muted">
        작성일: {review.rvCreatedAt}
      </div>

      <hr />
      <h2>{review.rvTitle}</h2>

      {files && files.map((file) => (
    <img
      key={file.rfNum}
      src={`http://localhost:8080${file.rfPath}`}
      alt="후기 이미지"
      style={{ width: "300px", marginBottom: "10px" }}
    />
  ))}
			<h3 className="mb-3">{review.rvTitle}</h3>
      <div className="mb-4" style={{ whiteSpace: "pre-line" }}>
        {review.rvContent}
      </div>

      <div className="d-flex justify-content-between">
        <div>
          조회수: {review.rvViewCount} | 좋아요수: {review.rvLikesCount} | 댓글수: {review.rvCommentCount}
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
        <span>{review.rvLikesCount}</span>
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
              const updatedd = await updated.json();
              setComments(updatedd);
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
