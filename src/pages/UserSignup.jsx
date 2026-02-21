import "../assets/styles/UserSignup.css";
import axios from "axios";
import { useState, useEffect } from "react";

function UserSignup() {
  const [formData, setFormData] = useState({
    id: "",
    pw: "",
    pw2: "",
    name: "",
    phone: "",
    gender: "",
  });

  const [agreements, setAgreements] = useState({
    term1: false,
    term2: false,
  });

  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimeActive, setIsTimeActive] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    let timer;

    if (isTimeActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0) {
      setIsTimeActive(false);
    }

    return () => clearInterval(timer);
  }, [isTimeActive, timeLeft]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const signupButton = () => {
    const { pw, pw2, phone } = formData;

    if (!pw.trim()) {
      alert("비밀번호를 입력하세요.");
      return;
    }

    const pwRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    if (!pwRegex.test(pw)) {
      alert("비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.");
      return;
    }

    if (pw !== pw2) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const phoneRegex = /^010\d{7,8}$/;

    if (!phoneRegex.test(phone)) {
      alert("올바른 휴대폰 번호를 입력해주세요.");
      return;
    }

    if (!(agreements.term1 && agreements.term2)) {
      alert("필수 약관에 동의해주세요.");
      return;
    }

    alert("테스트용 회원가입 완료");
  };

  return (
    <div className="signupWrapper">
      <div className="container">
        <div className="signup">회원가입</div>
        <div className="line"></div>

        <div className="container2">
          <input
            className="id"
            name="id"
            placeholder="아이디"
            value={formData.id}
            onChange={handleChange}
          />

          <input
            type="password"
            className="pw"
            name="pw"
            placeholder="비밀번호"
            value={formData.pw}
            onChange={handleChange}
          />

          <input
            type="password"
            className="pw2"
            name="pw2"
            placeholder="비밀번호 확인"
            value={formData.pw2}
            onChange={handleChange}
          />

          <input
            className="name"
            name="name"
            placeholder="이름"
            value={formData.name}
            onChange={handleChange}
          />

          <div className="phoneLine">
            <input
              className="phone"
              name="phone"
              placeholder="휴대폰번호"
              value={formData.phone}
              onChange={handleChange}
            />

            <button
              type="button"
              className="sendCode"
              onClick={() => {
                setIsTimeActive(true);
                setTimeLeft(180);
              }}
            >
              {isTimeActive ? formatTime(timeLeft) : "인증번호 전송"}
            </button>
          </div>

          <div className="genderBox">
            <span>성별</span>
            <div>
              <input
                type="radio"
                checked={formData.gender === "men"}
                onChange={() =>
                  setFormData({ ...formData, gender: "men" })
                }
              />
              남성
              <input
                type="radio"
                checked={formData.gender === "women"}
                onChange={() =>
                  setFormData({ ...formData, gender: "women" })
                }
              />
              여성
            </div>
          </div>

          <div className="term">
            <label>
              <input
                type="checkbox"
                checked={agreements.term1 && agreements.term2}
                onChange={(e) =>
                  setAgreements({
                    term1: e.target.checked,
                    term2: e.target.checked,
                  })
                }
              />
              전체 동의
            </label>

            <label>
              <input
                type="checkbox"
                checked={agreements.term1}
                onChange={(e) =>
                  setAgreements({
                    ...agreements,
                    term1: e.target.checked,
                  })
                }
              />
              약관1 (필수)
            </label>

            <label>
              <input
                type="checkbox"
                checked={agreements.term2}
                onChange={(e) =>
                  setAgreements({
                    ...agreements,
                    term2: e.target.checked,
                  })
                }
              />
              약관2 (필수)
            </label>
          </div>

          <button type="button" className="go" onClick={signupButton}>
            가입하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserSignup;