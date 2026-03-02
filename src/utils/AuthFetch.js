/**
 * 서버에 요청할 때 header에 토큰 정보를 자동으로 추가해주는 함수
 */

let isRedirecting = false; // 🔑 전역 플래그: 리다이렉트 중복 방지

export async function authFetch(url, options = {}, retry = true) {
  const accessToken = localStorage.getItem("accessToken");
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const resp = await fetch(url, {
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
    // /auth/me, /auth/login 등 인증 관련 요청은 조용히 throw
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

    // ✅ 정확한 공개 페이지 목록
    const isPublicPage =
      currentPath === "/" ||
      currentPath === "/login" ||
      currentPath === "/signup" ||
      currentPath === "/user/signup" ||
      currentPath === "/admin/signup" || // 병원 회원가입만 공개
      currentPath === "/find/id" ||
      currentPath === "/found/id" ||
      currentPath === "/resetPw";

    if (isPublicPage) {
      throw new Error("401");
    }

    if (isRedirecting) {
      throw new Error("401");
    }

    // ── refresh 토큰으로 재발급 시도 ──
    try {
      const refresh = await fetch("/api/v1/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!refresh.ok) {
        // refresh 실패 → 로그아웃 처리 후 리다이렉트
        handleSessionExpired();
        throw new Error("로그인 만료");
      }

      const data = await refresh.json();
      const newToken = data.accessToken || data.token || data.access_token;

      if (!newToken) {
        handleSessionExpired();
        throw new Error("로그인 만료");
      }

      // 새 토큰 저장 후 원래 요청 재시도
      localStorage.setItem("accessToken", newToken);
      return authFetch(url, options, false); // retry = false 로 재귀 1회만
    } catch (err) {
      // refresh 요청 자체가 네트워크 에러인 경우
      if (err.message !== "로그인 만료") {
        handleSessionExpired();
      }
      throw err;
    }
  }

  // retry = false 상태에서 401 → 루프 없이 종료
  throw new Error(`요청 실패: ${resp.status}`);
}

// ─────────────────────────────────────────
// ✅ 세션 만료 처리 함수 (중복 실행 방지 포함)
// ─────────────────────────────────────────
function handleSessionExpired() {
  if (isRedirecting) return; // 이미 처리 중이면 무시
  isRedirecting = true;

  localStorage.removeItem("accessToken");
  localStorage.removeItem("userNum");

  alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
  window.location.href = "/login";

  // 페이지 이동 완료 후 플래그 리셋
  setTimeout(() => {
    isRedirecting = false;
  }, 3000);
}
