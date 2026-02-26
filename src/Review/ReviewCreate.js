import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/authFetch";
import "../assets/styles/ReviewCreate.css";

function ReservationAndReview() {
  const [redate, setRedate] = useState("");
  const [retime, setRetime] = useState("");
  const [restatus, setRestatus] = useState("");
  const [revisittype, setRevisittype] = useState("");
  const [rememo, setRememo] = useState("");
  const [usernum, setUsernum] = useState("");
  const [honum, setHonum] = useState("");
  const [deptnum, setDeptnum] = useState("");

  const [renum, setRenum] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [files, setFiles] = useState([null, null, null]);
  const navigate = useNavigate();

  // 예약 등록
  const CreateReservation = async () => {
    try {
      const response = await authFetch("http://localhost:8080/api/v1/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reDate: redate,
          reTime: retime,
          reStatus: restatus,
          reVisitType: revisittype,
          reMemo: rememo,
          userNum: usernum,
          hoNum: honum,
          deptNum: deptnum
        })
      });

      if (response.ok) {
        const text = await response.text();
        alert(text);
        alert("예약 등록 완료! 이제 후기를 작성할 수 있습니다.");
      } else {
        alert("예약 등록 실패");
      }
    } catch (err) {
      console.error(err);
      alert("서버 오류");
    }
  };

  // 후기 등록
  const CreateReview = async () => {
    if (!renum) {
      alert("예약이 먼저 등록되어야 합니다!");
      return;
    }

    const formData = new FormData();

    // JSON Blob 제거하고 각 필드를 FormData에 직접 추가
    formData.append("reNum", renum);
    formData.append("userNum", usernum);
    formData.append("hoNum", honum);
    formData.append("rvTitle", title);
    formData.append("rvContent", content);
    formData.append("rvRating", rating);
    formData.append("rvDeletedYn", 0);

    // 이미지 파일 추가
    files.forEach(file => {
      if (file) formData.append("files", file);
    });

    try {
      const res = await authFetch("http://localhost:8080/api/v1/reviews", {
        method: "POST",
        body: formData
      });

      const text = await res.text(); // 서버가 문자열 반환한다고 가정
      alert(text); // "후기 등록 성공"
      navigate("/reviews");
    } catch (err) {
      console.error(err);
      alert("후기 등록 실패");
    }
  };

  return (
    <div>
      <h3>예약 등록</h3>
      <input value={redate} onChange={(e) => setRedate(e.target.value)} placeholder="예약 날짜" />
      <input value={retime} onChange={(e) => setRetime(e.target.value)} placeholder="예약 시간" />
      <input value={restatus} onChange={(e) => setRestatus(e.target.value)} placeholder="예약 상태" />
      <input value={revisittype} onChange={(e) => setRevisittype(e.target.value)} placeholder="초진/재진" />
      <input value={rememo} onChange={(e) => setRememo(e.target.value)} placeholder="예약 요청사항" />
      <input value={usernum} onChange={(e) => setUsernum(e.target.value)} placeholder="사용자 번호" />
      <input value={honum} onChange={(e) => setHonum(e.target.value)} placeholder="병원 번호" />
      <input value={deptnum} onChange={(e) => setDeptnum(e.target.value)} placeholder="진료과 번호" />
      <button type="button" onClick={CreateReservation}>예약 등록</button>

      <hr />

      <h3>후기 등록</h3>
      {[1, 2, 3, 4, 5].map(num => (
        <span
          key={num}
          onClick={() => setRating(num)}
          style={{ cursor: "pointer", fontSize: "30px", color: num <= rating ? "gold" : "gray" }}
        >
          ★
        </span>
      ))}
      <p>선택한 별점: {rating}</p>
      <input value={renum} onChange={(e) => setRenum(e.target.value)} placeholder="예약고유번호" />
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용" />

      {files.map((file, idx) => (
        <input
          key={idx}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const newFiles = [...files];
            newFiles[idx] = e.target.files[0];
            setFiles(newFiles);
          }}
        />
      ))}

      <button type="button" onClick={CreateReview}>후기 등록</button>
    </div>
  );
}

export default ReservationAndReview;