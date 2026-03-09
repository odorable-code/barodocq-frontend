/**
 * 서버에 요청할 때 header에 토큰 정보를 자동으로 추가해주는 함수
 */

// 1. 백엔드 서버의 실제 주소 설정 (포트 번호 8080 확인)
const BASE_URL = process.env.REACT_APP_API_URL;

let isRedirecting = false; // 🔑 전역 플래그: 리다이렉트 중복 방지

export async function authFetch(url, options = {}, retry = true) {
  const accessToken = localStorage.getItem("accessToken");
  const isFormData = options.body instanceof FormData;

  // 2. 전달받은 url이 이미 http로 시작하지 않는 경우 BASE_URL을 붙여서 풀 주소를 만듭니다.
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  // 3. fetch 호출 시 가공된 fullUrl을 사용합니다.
  const resp = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: "include",
  });

  // ✅ 성공
  if (resp.ok) return resp;

  // ─────────────────────────────────────────
  // ✅ 403 처리 — /auth/ 경로는 alert 안 띄움
  // ─────────────────────────────────────────
  if (resp.status === 403) {
    if (url.includes("/auth/")) {
      throw new Error("403");
    }
    alert("권한이 없습니다.");
    throw new Error("권한 없음");
  }

  // ─────────────────────────────────────────
  // ✅ 401 처리 — refresh 시도
  // ─────────────────────────────────────────
  if (resp.status === 401 && retry) {
    const currentPath = window.location.pathname;

    const isPublicPage =
      currentPath === "/" ||
      currentPath === "/login" ||
      currentPath === "/signup" ||
      currentPath === "/user/signup" ||
      currentPath === "/admin/signup" ||
      currentPath === "/find/id" ||
      currentPath === "/found/id" ||
      currentPath === "/resetPw" ;

    if (isPublicPage) {
      throw new Error("401");
    }

    if (isRedirecting) {
      throw new Error("401");
    }

    // ── refresh 토큰으로 재발급 시도 ──
    try {
      // 4. 리프레시 요청도 백엔드 주소로 가도록 수정
      const refresh = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!refresh.ok) {
        handleSessionExpired();
        throw new Error("로그인 만료");
      }

      const data = await refresh.json();
      const newToken = data.accessToken || data.token || data.access_token;

      if (!newToken) {
        handleSessionExpired();
        throw new Error("로그인 만료");
      }

      localStorage.setItem("accessToken", newToken);
      // 재시도 시에도 원래의 url을 넘기면 위에서 다시 fullUrl로 변환됩니다.
      return authFetch(url, options, false); 
    } catch (err) {
      if (err.message !== "로그인 만료") {
        handleSessionExpired();
      }
      throw err;
    }
  }

  throw new Error(`요청 실패: ${resp.status}`);
}

// ─────────────────────────────────────────
// ✅ 세션 만료 처리 함수 (중복 실행 방지 포함)
// ─────────────────────────────────────────
function handleSessionExpired() {
  if (isRedirecting) return;
  isRedirecting = true;

  localStorage.removeItem("accessToken");
  localStorage.removeItem("userNum");

  if (window.location.pathname !== '/login') {
    // 필요 시 알림 및 리다이렉트 로직 활성화
  }

  setTimeout(() => {
    isRedirecting = false;
  }, 3000);
}