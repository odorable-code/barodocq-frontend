import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TopHeader() {
  const navigate = useNavigate();

  const ACCESS_TOKEN_KEY = "accessToken";
  const REFRESH_TOKEN_KEY = "refreshToken";

  const [hospitalName, setHospitalName] = useState("병원명");
  const [subText, setSubText] = useState("환영합니다"); // ✅ 회색 안내문구

  const handleLogout = async () => {
    try {
      const token =
        localStorage.getItem(ACCESS_TOKEN_KEY) ||
        sessionStorage.getItem(ACCESS_TOKEN_KEY);

      if (token) {
        await axios.post(
          "/api/v1/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (e) {
      console.warn("logout api failed", e);
    } finally {
      // 토큰 삭제
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);

      navigate("/admin/login");
    }
  };

  useEffect(() => {
    const token =
      localStorage.getItem(ACCESS_TOKEN_KEY) ||
      sessionStorage.getItem(ACCESS_TOKEN_KEY);

    if (!token) {
      navigate("/admin/login");
      return;
    }

    // ✅ React 18 StrictMode(개발환경)에서 effect 2번 호출 대비
    const controller = new AbortController();

    axios
      .get("/api/v1/admin/hospitals/me", {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })
      .then((res) => {
        const d = res?.data;

        // ✅ 응답 구조가 뭐든 최대한 안전하게 name 후보를 찾기
        const candidates = [
          d?.hoName,
          d?.hospitalName,
          d?.ho_name,

          d?.data?.hoName,
          d?.data?.hospitalName,
          d?.data?.ho_name,

          d?.hospital?.hoName,
          d?.hospital?.hospitalName,
          d?.hospital?.ho_name,

          d?.result?.hoName,
          d?.result?.hospitalName,
          d?.result?.ho_name,
        ];

        const name = candidates.find((v) => typeof v === "string" && v.trim());

        if (name) {
          setHospitalName(name.trim());
          setSubText("환영합니다");
        } else {
          // name 못 찾았을 때도 오브젝트 표시하지 말고 안내만
          setHospitalName("병원명");
          setSubText("환영합니다");
          console.warn("TopHeader: hospital name not found in response:", d);
        }
      })
      .catch((err) => {
        // ✅ 요청 취소면 무시
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;

        const status = err?.response?.status;

        // ✅ 인증/인가 문제만 로그아웃
        if (status === 401 || status === 403) {
          handleLogout();
          return;
        }

        // ✅ 서버/데이터 문제는 튕기지 말고 회색 문구만 유지
        setSubText("환영합니다");
        console.warn("GET /admin/hospitals/me failed:", {
          status,
          data: err?.response?.data,
          message: err?.message,
        });
      });

    return () => controller.abort();
  }, [navigate]);

  return (
    <div className="adm-th">
      {/* 좌측 공간 */}
      <div style={{ flex: 1 }} />

      {/* 우측 */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <div className="adm-th-user">
          <div className="adm-th-name">{hospitalName} 관리자님</div>

          {/* ✅ 오브젝트 대신 회색 "환영합니다" */}
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
            {subText}
          </div>
        </div>

        <button className="adm-th-btn" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </div>
  );
}