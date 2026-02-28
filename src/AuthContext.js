import { createContext, useContext, useEffect, useState } from "react";
import { authFetch } from "./utils/AuthFetch";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const TEST_MODE = false;
  const [user, setUser] = useState(null);

  const getMe = async () => {
    try {
      const resp = await authFetch("/api/v1/auth/me");
      if (resp.ok) {
        const res = await resp.json();
        return res;
      }
    } catch (err) {
      // 401은 정상적인 비로그인 상태이므로 콘솔 노이즈 제거
      if (!err.message?.includes("401")) {
        console.error(err);
      }
    }
    return null;
  };

  const getMeAndSetUser = async () => {
    const me = await getMe();
    setUser(me);

    // ✅ userNum을 localStorage에 저장 (ReservationModal 등에서 사용)
    if (me?.num) {
      localStorage.setItem("userNum", me.num);
    } else {
      localStorage.removeItem("userNum");
    }

    return me;
  };

  useEffect(() => {
    const initAuth = async () => {
      if (TEST_MODE) {
        setUser({
          id: 1,
          name: "테스트유저",
          email: "test@test.com",
        });
        setIsLoading(false);
        return;
      }

      try {
        await getMeAndSetUser();
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const logout = async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userNum");
    try {
      const resp = await authFetch("/api/v1/auth/logout", {
        method: "POST",
      });
      if (!resp.ok) {
        alert("로그아웃 실패");
        return;
      }
    } catch (err) {
      console.error(err);
    }
    setUser(null);
    alert("로그아웃 완료");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, getMeAndSetUser, logout }}>
      {!isLoading ? children : <p>Loading...</p>}
    </AuthContext.Provider>
  );
}

const useAuth = () => {
  const context = useContext(AuthContext);
  return context || {};
};

// ✅ AuthContext도 함께 export (useContext로 직접 쓸 경우 대비)
export { useAuth, AuthProvider, AuthContext };
