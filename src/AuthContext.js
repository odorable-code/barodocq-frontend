import { createContext, useContext, useEffect, useState } from "react";
import { authFetch } from "./utils/AuthFetch";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const TEST_MODE = false;
  const [user, setUser] = useState(null);

  /* ─────────────────────────────────────────────
     내 정보 조회
     - 비로그인(401) / 권한없음(403) → 조용히 null 반환
     - 그 외 에러만 콘솔 출력
  ───────────────────────────────────────────── */
  const getMe = async () => {
    try {
      const resp = await authFetch("/api/v1/auth/me");
      if (resp.ok) {
        return await resp.json();
      }
      // ok가 아닌 응답(2xx 외)은 null 반환
      return null;
    } catch (err) {
      // ✅ 401 / 403 은 비로그인·권한없음 정상 상태 → alert 없이 null
      if (err.message === "401" || err.message === "403") {
        return null;
      }
      // 로그인 만료로 이미 redirect 된 경우도 조용히 처리
      if (err.message === "로그인 만료") {
        return null;
      }
      // 그 외 진짜 에러만 콘솔 출력
      console.error("getMe 오류:", err);
      return null;
    }
  };

  /* ─────────────────────────────────────────────
     내 정보 조회 후 user 상태에 반영
  ───────────────────────────────────────────── */
  const getMeAndSetUser = async () => {
    const me = await getMe();
    setUser(me);

    // userNum을 localStorage에 저장 (ReservationModal 등에서 사용)
    if (me?.num) {
      localStorage.setItem("userNum", String(me.num));
    } else {
      localStorage.removeItem("userNum");
    }

    return me;
  };

  /* ─────────────────────────────────────────────
     앱 최초 마운트 시 인증 상태 초기화
     - [] 의존성: 딱 한 번만 실행 → 루프 없음
  ───────────────────────────────────────────── */
  useEffect(() => {
    const initAuth = async () => {
      // 테스트 모드
      if (TEST_MODE) {
        setUser({ id: 1, name: "테스트유저", email: "test@test.com" });
        setIsLoading(false);
        return;
      }

      try {
        await getMeAndSetUser();
      } catch {
        // 예상치 못한 에러 → 비로그인 상태로 처리
        setUser(null);
      } finally {
        // ✅ 반드시 로딩 해제 (루프 방지의 핵심)
        setIsLoading(false);
      }
    };

    initAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─────────────────────────────────────────────
     로그아웃
  ───────────────────────────────────────────── */
  const logout = async () => {
    // 먼저 로컬 토큰 정리
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userNum");

    try {
      const resp = await authFetch("/api/v1/auth/logout", {
        method: "POST",
      });
      if (!resp.ok) {
        // 서버 로그아웃 실패해도 클라이언트는 로그아웃 처리
        console.warn("서버 로그아웃 실패 (무시하고 진행)");
      }
    } catch (err) {
      // 네트워크 오류 등 — 클라이언트 로그아웃은 이미 됐으므로 무시
      console.error("로그아웃 요청 오류:", err);
    }

    setUser(null);
    alert("로그아웃 완료");
  };

  /* ─────────────────────────────────────────────
     로딩 중엔 아무것도 렌더링 안 함
     (isLoading = true 동안 PrivateRoute 판단 보류)
  ───────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontSize: "14px",
        color: "#94a3b8",
      }}>
        로딩 중...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        getMeAndSetUser,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => {
  const context = useContext(AuthContext);
  return context || {};
};

export { useAuth, AuthProvider, AuthContext };
