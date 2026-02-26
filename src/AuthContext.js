import { createContext, useContext,useEffect,useState } from "react";
import { authFetch } from "./utils/authFetch";

const AuthContext = createContext(null);

function AuthProvider({children}) {
	const [isLoading, setIsLoading] = useState(true);
	const [user, setUser] = useState(null);

	useEffect(() => {
    // 🔄 새로고침 되자마자 실행되는 '로그인 유지' 로직
    const initAuth = async () => {
      try {
        // 여기에 기존에 만드신 getMeAndSetUser()와 비슷한 로직을 넣으세요
        await getMeAndSetUser(); 
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false); // 🏁 확인이 끝나면 로딩 완료
      }
    };
    initAuth();
  }, []);
	
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
	}

	useEffect(() => {
		getMeAndSetUser();
	}, []);

	const logout = async () => {
		localStorage.removeItem("accessToken");
		try {
			const resp = await authFetch("/api/v1/auth/logout", {
				method: "POST"
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
	}
	return (
		<AuthContext.Provider value={{user, setUser, getMeAndSetUser, logout}}>
			{!isLoading ? children : <p>Loading...</p>}
		</AuthContext.Provider>
	);
}

const useAuth = () => {
  const context = useContext(AuthContext);
  
  // 만약 context가 null이면 빈 객체라도 반환해서 에러 방지
  return context || {}; 
};

export { useAuth, AuthProvider }