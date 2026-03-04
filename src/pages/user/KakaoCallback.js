import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";

// 사용자가 카카오 로그인을 마치고 다시 사이트로 돌아왔을 때 실행. url의 인가 코드를 백엔드에 전달.
function KakaoCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasCalled = useRef(false); // 중복 호출 방지 플래그
  const { getMeAndSetUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    
    const sendCodeToBackend = async (kakaoCode) => {
      // 1. 이미 호출 중이라면 중단
      if (hasCalled.current) return;
      hasCalled.current = true;

      try {
        console.log("서버로 전송할 인가 코드:", kakaoCode);

        const data = await getKakaoUserInfo(kakaoCode);
        
        console.log("프론트. 카카오 소셜 로그인 백엔드 응답 데이터:", data);

        /** [추가/수정] 로그 확인 결과: 토큰은 data.token에, 유저는 data.user에 있습니다. */
        login(data, setUser, navigate);
        await getMeAndSetUser();

      } catch (err) {
        console.error("sendCodeToBackend 오류 발생:", err);
        alert("로그인 처리 중 문제가 발생했습니다.");
        navigate("/login");
      }
    };

    if (code) {
      sendCodeToBackend(code);
    }
  }, [navigate, setUser]);

  return (
    <div style={{ textAlign: 'center', marginTop: '200px' }}>
      로그인 처리 중... 잠시만 기다려주세요.
    </div>
  );
}

function KakaoCallbackAdmin() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasCalled = useRef(false); // 중복 호출 방지 플래그
  const { getMeAndSetUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    const sendCodeToBackend = async (kakaoCode) => {
      // 1. 이미 호출 중이라면 중단
      if (hasCalled.current) return;
      hasCalled.current = true;

      try {
        const data = await getKakaoUserInfo(code);
            
        console.log("프론트. 카카오 소셜 로그인 백엔드 응답 데이터:", data);

        /** [추가/수정] 로그 확인 결과: 토큰은 data.token에, 유저는 data.user에 있습니다. */
        const user = data.user;
        const userInfo = data.userInfo;

        if(user && user.usaNum > 0){
          alert("이미 가입된 사용자입니다.");
          login(data, setUser, navigate); // 바로 로그인 처리
          await getMeAndSetUser(); // 사용자 정보 업데이트
          return;
          //navigate("/login");
        }
        //있어서는 안되는 상황
        // if(userInfo == null){
        //   // alert("카카오 로그인 성공");
        //   // navigate("/main");
        //   return;
        // }

        const confirmed = window.confirm("회원가입을 진행하시겠습니까?");

        if(!user && !userInfo){
          //회원가입 안함 => 어느페이지로 보낼건지 결정

          if(!confirmed){
            navigate("/user/signup");
            //return;
          }

          if (confirmed) {
          // 서버에 userInfo 보내서 회원가입 진행
          const response = await fetch("/api/v1/auth/kakao/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userInfo)
          });

        if (response.ok) {
          const signupData = await response.json();
          alert("회원가입 성공!");
          login(signupData, setUser, navigate);
        }
        } else {
          navigate("/login");
        }
          
          }
          //회원가입성공후서버에서보낸데이터
          login(data, setUser, navigate);
        } catch (err) {
          console.error("sendCodeToBackend 오류 발생:", err);
          alert("로그인 처리 중 문제가 발생했습니다.");
          navigate("/login");
        }
      };

      if (code) {
        sendCodeToBackend(code);
      }
    }, [navigate, setUser]);
  

  return (
    <div style={{ textAlign: 'center', marginTop: '200px' }}>
      로그인 처리 중... 잠시만 기다려주세요.
    </div>
  );
}

async function getKakaoUserInfo(kakaoCode) {
  // 백엔드 API 호출
  const response = await fetch(`/api/v1/auth/kakao?code=${kakaoCode}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("백엔드 응답 실패!");
  }

  const data = await response.json();
  return data;
}

async function login(data, setUser, navigate, ) {
  
  if(!data){
    return false;
  }
  const access_token = data.accessToken || data.access_token; 
  const userData = data.user;

  // [추가] 토큰이 존재하는지 검증
  if (access_token) {
    
    /** [수정] LocalStorage에 데이터 구조에 맞춰 정확히 저장 */
    localStorage.setItem("accessToken", access_token);
    

    /** [수정] setUser에 백엔드에서 준 실제 사용자 정보(박서연 님)를 반영 */
    // setUser({
    //   isLoggedIn: true,
    //   userId: userData?.usaName || "KakaoUser", // usaName: '박서연' 반영
    //   userNum: userData?.userNum                // userNum: 8 반영
    // });
    console.log("토큰 및 유저 정보 저장 완료. 메인으로 이동합니다.");

    /** [추가] 401 Unauthorized 방지 로직 
     * LocalStorage 저장이 완료된 후 메인 페이지의 auth/me가 실행되도록 0.1초 지연을 줍니다.
     */
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 100);

  } else {
    throw new Error("응답 데이터에 유효한 토큰이 없습니다.");
  }
  return true;
}
export {KakaoCallback, KakaoCallbackAdmin};