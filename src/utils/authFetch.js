export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("토큰이 없습니다. 로그인 필요");

  const headers = {
    ...(options.headers || {}),
    "Authorization": `Bearer ${token}`,
  };

  //body가 FormData면 Content-Type 설정하지 않음
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const responseText = await res.text(); // 한 번만 읽음

  // 실패 시 에러 처리
  if (!res.ok) {
    console.error("인증 실패 또는 권한 없음", res);
    throw new Error(responseText || `${res.status} ${res.statusText}`);
  }

  // 성공 시, JSON이면 파싱, 아니면 문자열 그대로 반환
  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
};