/// ✅ 함수 외부에 Lock 상태와 대기열(Queue)을 선언합니다.
let isRefreshing = false; // 현재 토큰을 갱신 중인지 여부
let refreshSubscribers = []; // 갱신되는 동안 대기할 API 요청들의 큐(Queue)

// 대기 중인 요청들을 큐에 넣는 함수
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// 토큰 갱신이 완료되면 대기 중이던 요청들을 순차적으로 실행하는 함수
const onRefreshed = (accessToken) => {
  refreshSubscribers.forEach((callback) => callback(accessToken));
  refreshSubscribers = []; // 실행 후 큐 비우기
};

/**
 * 서버에 요청할 때 header에 토큰 정보를 자동으로 추가해주는 함수
 * @param {string} url 요청할 URL
 * @param {object} options 전송에 필요한 옵션들
 * @param {boolean} retry 재시도 여부
 */
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

  // ✅ 401 권한 만료 처리
  if (resp.status === 401 && retry) {
    // 1️⃣ 누군가 이미 토큰을 갱신하고 있다면? -> 대기열(Queue)에 등록하고 기다림
    if (isRefreshing) {
      return new Promise((resolve) => {
        addRefreshSubscriber((newToken) => {
          // 새 토큰이 발급되면, 이 함수가 실행되면서 원래 하려던 요청을 재시도함
          resolve(authFetch(url, options, false));
        });
      });
    }

    // 2️⃣ 아무도 갱신하고 있지 않다면? -> 내가 대표로 갱신 시작 (Lock 걸기)
    isRefreshing = true;

    try {
      const refresh = await fetch("/api/v1/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!refresh.ok) {
        throw new Error("Refresh token expired");
      }

      const data = await refresh.json();
      const newToken = data.accessToken || data.token || data.access_token;

      if (!newToken) {
        throw new Error("No token in response");
      }

      // 새 토큰 저장
      localStorage.setItem("accessToken", newToken);
      
      // ✅ 갱신 완료: Lock 풀고 대기 중이던 요청들 일제히 실행
      isRefreshing = false;
      onRefreshed(newToken);

      // 대표로 갱신했던 내 요청도 재시도
      return authFetch(url, options, false);

    } catch (error) {
      // 🚨 리프레시 실패 (완전 로그아웃 상태)
      isRefreshing = false;
      refreshSubscribers = []; // 대기열 초기화
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userNum");
      
      // ✅ 현재 위치가 '/login'이 아닐 때만 알림을 띄우고 이동시킴
      if (window.location.pathname !== "/login") {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        window.location.href = "/login";
      }
      throw new Error("로그인 만료"); 
    }
  }

  // ✅ retry = false 상태에서 401이거나, 기타 에러일 경우
  throw new Error(`요청 실패: ${resp.status}`);
}