import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/authFetch";

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

const CreateReservation = async () => {
  try {
    const response = await authFetch("http://localhost:8080/api/v1/reservations",
      {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        re_date: redate,
        re_time: retime,
        re_status: restatus,
        re_visit_type: revisittype,
        re_memo: rememo,
        user_num: usernum,
        ho_num: honum,
        dept_num: deptnum
      })
    });

    if (response.ok) {
      const text = await response.text(); // 문자열로 읽기
      alert(text); // 서버에서 보낸 "예약 등록 성공" 그대로 출력
      alert("예약 등록 완료! 이제 후기를 작성할 수 있습니다.");
    } else {
      alert("예약 등록 실패");
    }
  } catch (err) {
    console.error(err);
    alert("서버 오류");
  }
};
     const CreateReview = async () => {
  if (!renum) {
    alert("예약이 먼저 등록되어야 합니다!");
    return;
  }

  const formData = new FormData();

  const reviewData = {
    re_num: renum,
    user_num: usernum,
    ho_num: honum,
    rv_title: title,
    rv_content: content,
    rv_rating: rating,
    rv_deleted_yn: 0
  };

  // 핵심
  formData.append(
    "review",
    new Blob([JSON.stringify(reviewData)], {
      type: "application/json"
    })
  );

  // 파일 추가
  for (let i = 0; i < files.length; i++) {
  if (files[i]) {
    formData.append("files", files[i]);
  }
}

  try {
    const result = await authFetch(
      "http://localhost:8080/api/v1/reviews",
      {
        method: "POST",
        body: formData
      }
    );

    alert(result);
    navigate("/reviews");

  } catch (err) {
    console.error(err);
    alert("후기 등록 실패");
  }
};
//   const CreateReview = async () => {
//     if (!renum) {
//       alert("예약이 먼저 등록되어야 합니다!");
//       return;
//     }

//     try {
//       const result = await authFetch("http://localhost:8080/api/v1/reviews",
//         {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           re_num: renum,
//           user_num: usernum,
//           ho_num: honum,
//           rv_title: title,
//           rv_content: content,
//           rv_rating: rating,
//           rv_deleted_yn: 0
//         })
//       });

//       alert(result); // 서버에서 "후기 등록 성공" 오면 그대로 표시
//     navigate("/reviews");

//   } catch (err) {
//     console.error(err);
//     alert(err.message); // 서버가 보낸 에러 메시지 출력
//   }
// };


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
      <input value={renum} onChange={(e) => setRenum(e.target.value)} placeholder="예약고유번호" />
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용" />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const newFiles = [...files];
          newFiles[0] = e.target.files[0];
          setFiles(newFiles);
        }}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const newFiles = [...files];
          newFiles[1] = e.target.files[0];
          setFiles(newFiles);
        }}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const newFiles = [...files];
          newFiles[2] = e.target.files[0];
          setFiles(newFiles);
        }}
      />
      <button type="button" onClick={CreateReview}>후기 등록</button>
    </div>
  );
}

export default ReservationAndReview;
