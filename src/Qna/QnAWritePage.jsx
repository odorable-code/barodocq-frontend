// 사용자가 특정 병원을 지정해서 1:1로 궁금한 점을 문의하는 용도의 코드
import React, { useState, useEffect } from "react"; // 변수의 편리한 값 변경을 위한 useState, 화면이 재렌더링 되는 기준을 설정하기 위한 useEffect
import { useNavigate } from "react-router-dom"; // 경로를 쉽게 이동할 수 있는 useNavigate
import "../assets/styles/QnAWritePage.css";
import { authFetch } from "../utils/AuthFetch"; // 토큰을 관리하는 AuthFetch

const QnAWritePage = () => {
  const navigate = useNavigate();

  // ---------------- 토큰 상태 ----------------

  // 토큰이 없으면 로그인 창으로 보내고, 있으면 accessToken에 token 값 저장
  const [accessToken, setAccessToken] = useState(null);
  useEffect(() => {
    // 로컬스토리지에서 accesstoken 값 가져옴
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login"); //accessToken값이 없으면 로그인 페이지로 이동시킴
    } else {
      setAccessToken(token);
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    ho_num: "", // 병원 번호
    title: "", //qna 제목
    content: "", //qna 내용
    isPrivate: false, // 공개, 비공개 여부
  });

  const [hospitalKeyword, setHospitalKeyword] = useState(""); // 사용자가 병원 검색창에 직접 타이핑한 병원명의 이름을 저장
  const [hospitalList, setHospitalList] = useState([]); // map 함수를 이용해서 hospitalList에 들어있는 hoNum, hoName 과 같은 값들을 호출한 곳에 뿌려준다.
  const [errors, setErrors] = useState({}); // 예를들어 formData의 병원번호가 선택되지 않았으면 errors에 "병원을 선택해주세요"; 가 들어간다. 

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value })); // formData의 이전 값들을 모두 저장하고, 새로운 값을 추가한다.
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null })); //errors의 이전 값들을 모두 저장하고 새로운 값을 추가한다.
  };

  // ---------------- 병원 검색 ----------------
  const searchHospital = async (keyword) => {
    if (keyword.length < 2) { // 사용자의 검색어를 keyword로 받아서 1글자 이하인 경우 hospitalList에 값을 저장하지 않고 돌려보낸다.
      setHospitalList([]);
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/hospitals/search?keyword=${keyword}` // 서버에 사용자의 검색어를 쿼리스트링으로 실어보낸다.
      );
      const data = await response.json(); // 서버로부터 받은 응답을 json 형태로 변환해서 저장한다.
      setHospitalList(data); // hospitalList에 data 값을 저장한다.
    } catch (err) {
      console.error("병원 검색 에러:", err); 
    }
  };

  // ---------------- 유효성 검사 ----------------
  // formData에 값이 없으면 errors에 똑같은 속성을 추가하고 "00을 선택해주세요"라는 값을 저장한다. 
  const validate = () => {
    const newErrors = {}; // validate()가 새로 실행될 때마다 저장된 errors의 값이 비워진다.
    if (!formData.ho_num) newErrors.ho_num = "병원을 선택해주세요";
    if (!formData.title.trim()) newErrors.title = "제목을 입력해주세요";
    if (formData.title.trim().length < 5)
      newErrors.title = "제목은 최소 5자 이상 입력해주세요";
    if (!formData.content.trim()) newErrors.content = "내용을 입력해주세요";
    if (formData.content.trim().length < 10)
      newErrors.content = "내용은 최소 10자 이상 입력해주세요";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // errors의 key 값들을 리스트로 만들어서 반환. 길이가 0이면 false, 0이 아니면 true
  };

  // ---------------- QnA 등록 ----------------
  // accessToken에 값이 없으면 로그인 페이지로 이동시킴.
  const createQnA = async () => {
    if (!accessToken) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

  const qnaData = {
    qnTitle: formData.title, //formData의 title의 값이 qnTitle의 값이 된다.
    qnContent: formData.content, // formData의 content 값이 qnContent의 값이 된다.
    qnIsPrivate: formData.isPrivate ? 1 : 0, // false가 참이므로 1이 된다.
    qnStatus: "답변기다리는중", // 기본값이 "답변기다리는중"
    qnDeletedYn: 0,// 데이터가 삭제가 된게 Yes or No인지 > 0이니까 false
    hoNum: formData.ho_num, // formData의 hoNum 값이 qnHoNum의 값이 된다.
  };

    try {
      await authFetch("http://localhost:8080/api/v1/qnawrite", { // 서버 전송 url
        method: "POST",
        body: JSON.stringify(qnaData), // qnaData 객체를 문자열로 변환
      });
      console.log(qnaData)
      alert("문의 등록 완료!");
      navigate("/qna"); // /qna 페이지로 이동
    } catch (err) {
      console.log(qnaData)
      console.error("문의 등록 실패:", err);
      alert("문의 등록 실패");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // handleSubmit이 걸린 이벤트의 기본 속성을 막음 => onSubmit의 제출 기능을 막는다. 
    if (validate()) createQnA(); // validate의 return 값은 
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "작성을 취소하시겠습니까? 입력한 내용은 저장되지 않습니다." // confirm()는 window 객체 소속이다.
      )
    ) {
      navigate("/qna"); // /qna 페이지로 이동
    }
  };

  return (
    <div className="qna-write-page">
      {/* section 태그는 아무 의미 없는 시멘틱 태그이고, 블락 요소이다 */}
      <section className="qna-write-content"> 
        <div className="container-s2">
          <div className="qna-write-form-container">
            <form className="qna-write-form" onSubmit={handleSubmit}> 
              {/* 병원 선택 */}
              <div className="form-group">
                <label className="form-label">
                  병원 선택 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.ho_num ? "error" : ""}`} // errors.ho_num 에 값이 있으면 => formData.ho_num에 값이 없으면 클래스명은 form-input error
                  placeholder="병원명을 입력하세요"
                  value={hospitalKeyword} // value는 사용자가 입력한 병원명
                  onChange={(e) => {
                    setHospitalKeyword(e.target.value); // 사용자가 입력한 병원명이 hospitalKeyword의 값이 된다.
                    searchHospital(e.target.value); //
                  }}
                />
                {hospitalList.length > 0 && (
                  <ul className="hospital-list">
                    {hospitalList.map((hospital) => ( //hospitalList에 있는 모든 값들을 하나씩 차례대로 도는 hospital
                      <li
                        key={hospital.hoNum}
                        onClick={() => {
                          handleChange("ho_num", hospital.hoNum); // handleChange() 함수의 매개변수로 "ho_num"과 hospital.hoNum을 넣음 => "ho_num"이 키가 되고 사용자가 입력한 병원의 hoNum이 값이 된다. 
                          setHospitalKeyword(hospital.hoName);
                          setHospitalList([]);
                        }}
                      >
                        {hospital.hoName} - {hospital.hoAddr}
                      </li>
                    ))}
                  </ul>
                )}
                {errors.ho_num && (
                  <span className="error-message">{errors.ho_num}</span> // 병원을 선택하지 않아 errors.ho_num에 에러 메시지가 들어있을 때만, 그 내용을 빨간 경고 문구로 화면에 보여준다
                )}
              </div>

              {/* 제목 */}
              <div className="form-group">
                <label>제목 *</label>
                <input
                  type="text"
                  value={formData.title}
                  className={`form-input ${errors.title ? "error" : ""}`}
                  onChange={(e) => handleChange("title", e.target.value)}
                  maxLength={50}
                />
                {errors.title && (
                  <span className="error-message">{errors.title}</span>  // 앞에 있는 errors.title에 값이 있으면(True), 뒤에 있는 <span>...</span>을 화면에 보여준다
                )}
              </div>

              {/* 내용 */}
              <div className="form-group">
                <label>내용 *</label>
                <textarea
                  rows={8} // 8줄
                  value={formData.content}
                  className={`form-textarea ${errors.content ? "error" : ""}`} // errors.content 값이 있으면 =? formData.content에 값이 없다면 클래스명은 form-textarea error
                  onChange={(e) => handleChange("content", e.target.value)}
                />
                {errors.content && (
                  <span className="error-message">{errors.content}</span>
                )}
              </div>

              {/* 비공개 */}
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isPrivate} // 체크 여부는 formData.isPrivate 값(true/false)을 따른다.
                    onChange={(e) =>
                      handleChange("isPrivate", e.target.checked) // 체크박스를 누를 때마다 true와  false 값이 뒤바뀐다.
                    }
                  />
                  공개 문의
                </label>
              </div>

              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel} // "작성을 취소하시겠습니까?" 알림이 뜨고 /qna 페이지로 이동한다.
              >
                취소
              </button>
              {/* 이 버튼을 클릭하면 <form onSubmit={handleSubmit}></form> 이 실행됨 */}
              <button type="submit" className="btn-submit"> 
                문의 등록
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QnAWritePage;