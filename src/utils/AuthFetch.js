/**
 * 서버에 요청할 때 header에 토큰 정보를 자동으로 추가해주는 함수
 * @param {string} url 요청할 URL
 * @param {object} options 전송에 필요한 옵션들로, method, headers, body등이 옴
 * @param {boolean} retry 재시도 여부 (내부용 — 외부에서 직접 전달 불필요)
 */
export async function authFetch(url, options = {}, retry = true) {
  // 토큰 정보를 가져옴
  const accessToken = localStorage.getItem("accessToken");
  // FormData인지 확인
  const isFormData = options.body instanceof FormData;
  // 헤더를 설정함
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };
  // 토큰이 있으면 헤더에 토큰 정보를 추가
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  // fetch를 이용해서 요청
  const resp = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  // ✅ 성공하면 요청 결과를 반환
  if (resp.ok) {
    return resp;
  }

  // ✅ 403 권한 없음 처리
  if (resp.status === 403) {
    alert("권한이 없습니다.");
    throw new Error("권한 없음");
  }

  // ✅ 401이고 첫 번째 시도일 때만 refresh 진행 (retry = false면 바로 에러)
  if (resp.status === 401 && retry) {
    const refresh = await fetch("/api/v1/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    // ✅ refresh 실패 → 토큰 정리 + 로그인 페이지 이동
    if (!refresh.ok) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userNum");
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      //window.location.href = "/login"; // 로그인 경로에 맞게 수정
      throw new Error("로그인 만료");
    }

    // ✅ 안전한 버전 - 어떤 키 이름이든 처리
    const data = await refresh.json();

    // 실제 키 이름에 맞게 수정
    const newToken = data.accessToken || data.token || data.access_token;

    if (!newToken) {
      // 토큰이 아예 없으면 로그아웃 처리
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userNum");
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      //window.location.href = "/login";
      throw new Error("로그인 만료");
    }

    localStorage.setItem("accessToken", newToken);
    return authFetch(url, options, false);
  }

  // ✅ retry = false 상태에서 401 → 루프 없이 에러 throw
  throw new Error(`요청 실패: ${resp.status}`);
}
