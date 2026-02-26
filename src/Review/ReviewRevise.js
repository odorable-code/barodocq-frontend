import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authFetch } from "../utils/AuthFetch";
import "../assets/styles/ReviewRevise.css";

function ReviewRevise() {
  const { rvNum } = useParams(); // URL에서 후기번호 가져오기
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);

  const token = localStorage.getItem("token");
  console.log("현재 token:", token);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await authFetch(
          `http://localhost:8080/api/v1/reviews/revise/${rvNum}`
        );
        const data = await response.json();
        setTitle(data.rvTitle);
        setContent(data.rvContent);
        setRating(data.rvRating);

      } catch (err) {
        console.error(err);
        alert("후기 불러오기 실패");
      }
    };
    fetchReview();
  }, [rvNum]);

  const updateReview = async () => {
  try {
    const res = await authFetch(
      `http://localhost:8080/api/v1/reviews/revise/${rvNum}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rvTitle: title,
          rvContent: content,
          rvRating: rating,
        }),
      }
    );

    // 서버가 text를 보내면
    const result = await res.text(); 
    // 서버가 JSON을 보내면
    // const result = await res.json(); 

    alert(result); 
    navigate("/reviews");

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

  return (
    <div className="container mt-4" style={{ maxWidth: "600px" }}>
      <h3>후기 수정</h3>

      {/* ⭐ 별점 */}
      <div className="mb-3">
        {[1, 2, 3, 4, 5].map((num) => (
          <span
            key={num}
            onClick={() => setRating(num)}
            style={{
              cursor: "pointer",
              fontSize: "30px",
              color: num <= rating ? "gold" : "gray"
            }}
          >
            ★
          </span>
        ))}
        <p>선택한 별점: {rating}</p>
      </div>

      {/* 제목 */}
      <div className="mb-3">
        <input
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
        />
      </div>

      {/* 내용 */}
      <div className="mb-3">
        <textarea
          className="form-control"
          rows="5"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용"
        />
      </div>

      <button className="btn btn-primary" onClick={updateReview}>
        수정 완료
      </button>
      <button
        className="btn btn-secondary ms-2"
        onClick={() => navigate("/reviews")}
      >
        취소
      </button>
    </div>
  );
}

export default ReviewRevise;
