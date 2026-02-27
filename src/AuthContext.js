import { createContext, useContext, useEffect, useState } from "react";
import { authFetch } from "./utils/AuthFetch";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
	const TEST_MODE = false;
  const [user, setUser] = useState(null);

  // 로그인인척 위장하는 테스트용 코드
  // const [user, setUser] = useState({
  //   id: 1,
  //   name: "테스트유저",
  //   email: "test@test.com",
  // });

  const getMe = async () => {
    try {
      const resp = await authFetch("/api/v1/auth/me");
      if (resp.ok) {
        const res = await resp.json();
        return res;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const getMeAndSetUser = async () => {
    const me = await getMe();
    console.log(me);
    setUser(me);
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
    try {
      const resp = await authFetch("/api/v1/auth/logout", {
        method: "POST",
      });
      console.log(resp);
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

  // 만약 context가 null이면 빈 객체라도 반환해서 에러 방지
  return context || {};
};

export { useAuth, AuthProvider };
