import React, { useState } from "react";
import "../assets/styles/ReviewBoard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faHeart } from "@fortawesome/free-solid-svg-icons";

// Mock 데이터
const mockReviews = Array.from({ length: 23 }).map((_, i) => ({
  id: i + 1,
  user: `사용자${i + 1}`,
  avatar: `U${i + 1}`,
  hospital: ["서울병원", "강남클리닉", "한양병원"][i % 3],
  dept: ["내과", "소아청소년과", "정형외과"][i % 3],
  date: `2026-02-${(i % 28) + 1}`,
  rating: (i % 5) + 1,
  text: `리뷰 내용 샘플 ${i + 1}번. 진료 경험에 대한 후기입니다.`,
  likes: Math.floor(Math.random() * 10),
}));

export default function ReviewBoard() {
  const [reviews, setReviews] = useState(mockReviews);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 6;

  const handleLike = (id) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, likes: r.likes + 1 } : r))
    );
  };

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const paginatedReviews = reviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  return (
    <div className="review-board-container">
      <h2 className="review-board-title">💬 방문객 리뷰</h2>

      <div className="review-list">
        {paginatedReviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-left">
              <div className="review-avatar">{review.avatar}</div>
            </div>

            <div className="review-body">
              <div className="review-top">
                <span className="review-user">{review.user}</span>
                <span className="review-hospital">{review.hospital}</span>
                <span className="review-dept">{review.dept}</span>
                <span className="review-date">{review.date}</span>
              </div>

              <div className="review-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    color={i < review.rating ? "#fbbf24" : "#e2e8f0"}
                  />
                ))}
              </div>

              <p className="review-text">{review.text}</p>

              <div className="review-footer">
                <button
                  className="review-like-btn"
                  onClick={() => handleLike(review.id)}
                >
                  <FontAwesomeIcon icon={faHeart} /> {review.likes}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="review-pagination">
        <button
          className="page-btn"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          &lt; 이전
        </button>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className="page-btn"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          다음 &gt;
        </button>
      </div>
    </div>
  );
}