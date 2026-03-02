// import { useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../AuthContext";

// // 사용자가 카카오 로그인을 마치고 다시 내 사이트로 돌아왔을 때 실행. url에 붙어있는 인가 코드를 읽어서 백엔드에 전달.
// function KakaoCallback() {
//   const navigate = useNavigate();
//   const { setUser } = useAuth();
//   const hasCalled = useRef(false); // 중복 호출 방지를 위한 플래그

//   useEffect(() => {
//     //현재 URL에서 파라미터 부분을 가져옵니다.
//     const params = new URLSearchParams(window.location.search);
    

//     //"code"라는 이름의 파라미터 값을 추출합니다.
//     const code = params.get("code");

//       // 여기서 axios나 fetch를 사용하여 백엔드(/api/v1/auth/kakao)에 코드를 넘겨줌.
//         const sendCodeToBackend = async (kakaoCode) => {

//             // 1. 이미 호출 중이라면 중단
//             if (hasCalled.current) return;
//             hasCalled.current = true; // 호출 시작 도장 쾅

//             try {
//                 console.log("서버로 전송할 인가 코드:", kakaoCode);

//                 //백엔드 API 호출
//                 const response = await fetch(`http://localhost:8080/api/v1/auth/kakao?code=${kakaoCode}`,
//                 { method : "GET", });

//                 if(!response.ok){
//                     throw new Error("실패!.");
//                 }

//                 const data = await response.json();
//                 console.log("프론트. 카카오 소셜 로그인 백엔드 응답 데이터:", data);


//                 localStorage.setItem("accessToken", data.access_token);
//                 localStorage.setItem("tokenType", data.token_type);
//                 localStorage.setItem("refreshToken", data.refresh_token);
//                 localStorage.setItem("expiresIn", data.expires_in);

//                 setUser({
//                 isLoggedIn: true,
//                 userId: data.userId || "KakaoUser",
//                 });
                
//                 //성공 시 메인으로 이동 (이동해야 주소창의 1회용 코드가 사라짐)
//                 navigate("/", { replace: true });

//                 }catch(err){
//                 console.error("sendCodeToBackend 오류 발생:", err);
//                 };
//         };

//         if (code) {
//         sendCodeToBackend(code);
//         }

//       // 성공하면 navigate("/")로 메인 이동
//   }, [navigate, setUser]);

//   return <div style={{ textAlign: 'center', marginTop: '200px' }}>로그인 처리 중... 잠시만 기다려주세요.</div>;
// }

// export default KakaoCallback;





// import { useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../AuthContext";

// // 사용자가 카카오 로그인을 마치고 다시 내 사이트로 돌아왔을 때 실행. url에 붙어있는 인가 코드를 읽어서 백엔드에 전달.
// function KakaoCallback() {
//   const navigate = useNavigate();
//   const { setUser } = useAuth();
//   const hasCalled = useRef(false); // 중복 호출 방지를 위한 플래그

//   useEffect(() => {
//     // 현재 URL에서 파라미터 부분을 가져옵니다.
//     const params = new URLSearchParams(window.location.search);

//     // "code"라는 이름의 파라미터 값을 추출합니다.
//     const code = params.get("code");

//     // 여기서 axios나 fetch를 사용하여 백엔드(/api/v1/auth/kakao)에 코드를 넘겨줌.
//     const sendCodeToBackend = async (kakaoCode) => {
//       // 1. 이미 호출 중이라면 중단
//       if (hasCalled.current) return;
//       hasCalled.current = true; // 호출 시작 도장 쾅

//       try {
//         console.log("서버로 전송할 인가 코드:", kakaoCode);

//         // 백엔드 API 호출
//         const response = await fetch(`http://localhost:8080/api/v1/auth/kakao?code=${kakaoCode}`, {
//           method: "GET",
//         });

//         if (!response.ok) {
//           throw new Error("실패!.");
//         }

//         const data = await response.json();
//         console.log("프론트. 카카오 소셜 로그인 백엔드 응답 데이터:", data);

//         /** [추가/수정] 백엔드 응답 구조(data.token...)에 맞게 안전하게 토큰을 추출합니다. */
//         const tokenInfo = data.token || {}; 
//         const accessToken = tokenInfo.access_token || data.access_token;
//         const refreshToken = tokenInfo.refresh_token || data.refresh_token;

//         /** [삭제] 기존의 localStorage.setItem("accessToken", data.access_token) 등은 
//          * undefined가 저장될 위험이 있어 아래의 통합 저장 로직으로 교체되었습니다. 
//          */

//         if (accessToken) {
//           // [추가] 추출된 올바른 토큰 정보를 저장합니다.
//           localStorage.setItem("accessToken", accessToken);
//           if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
          
//           if (tokenInfo.token_type) localStorage.setItem("tokenType", tokenInfo.token_type);
//           if (tokenInfo.expires_in) localStorage.setItem("expiresIn", tokenInfo.expires_in);

//           // [수정] setUser에 백엔드에서 준 실제 사용자 정보를 담습니다.
//           setUser({
//             isLoggedIn: true,
//             userId: data.user?.usaName || "KakaoUser", // usaName이 있으면 사용
//             userNum: data.user?.userNum // DB의 고유 번호 저장
//           });

//           // 성공 시 메인으로 이동
//           navigate("/", { replace: true });
//         } else {
//           // [추가] 토큰이 없을 경우에 대한 예외 처리
//           throw new Error("응답에 인증 토큰이 포함되어 있지 않습니다.");
//         }

//       } catch (err) {
//         console.error("sendCodeToBackend 오류 발생:", err);
//         // [추가] 사용자에게 알림 후 로그인 페이지로 리다이렉트
//         alert("로그인 처리 중 오류가 발생했습니다.");
//         navigate("/login");
//       }
//     };

//     if (code) {
//       sendCodeToBackend(code);
//     }
//   }, [navigate, setUser]);

//   return (
//     <div style={{ textAlign: "center", marginTop: "200px" }}>
//       로그인 처리 중... 잠시만 기다려주세요.
//     </div>
//   );
// }

// export default KakaoCallback;




import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";

// 사용자가 카카오 로그인을 마치고 다시 사이트로 돌아왔을 때 실행. url의 인가 코드를 백엔드에 전달.
function KakaoCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasCalled = useRef(false); // 중복 호출 방지 플래그

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    const sendCodeToBackend = async (kakaoCode) => {
      // 1. 이미 호출 중이라면 중단
      if (hasCalled.current) return;
      hasCalled.current = true;

      try {
        console.log("서버로 전송할 인가 코드:", kakaoCode);

        // 백엔드 API 호출
        const response = await fetch(`http://localhost:8080/api/v1/auth/kakao?code=${kakaoCode}`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("백엔드 응답 실패!");
        }

        const data = await response.json();
        console.log("프론트. 카카오 소셜 로그인 백엔드 응답 데이터:", data);

        /** [추가/수정] 로그 확인 결과: 토큰은 data.token에, 유저는 data.user에 있습니다. */
        const tokenData = data.token; 
        const userData = data.user;

        // [추가] 토큰이 존재하는지 검증
        if (tokenData && tokenData.access_token) {
          
          /** [수정] LocalStorage에 데이터 구조에 맞춰 정확히 저장 */
          localStorage.setItem("accessToken", tokenData.access_token);
          localStorage.setItem("refreshToken", tokenData.refresh_token);
          localStorage.setItem("tokenType", tokenData.token_type);
          
          if (tokenData.expires_in) {
            localStorage.setItem("expiresIn", tokenData.expires_in);
          }

          /** [수정] setUser에 백엔드에서 준 실제 사용자 정보(박서연 님)를 반영 */
          setUser({
            isLoggedIn: true,
            userId: userData?.usaName || "KakaoUser", // usaName: '박서연' 반영
            userNum: userData?.userNum                // userNum: 8 반영
          });

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

export default KakaoCallback;