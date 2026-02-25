import { NavLink } from "react-router-dom";
import { useState } from "react";

const MENUS = [
  {
    key: "users", // ✅ 회원관리
    label: "회원관리",
    to: "/admin/users",
    children: [
      { key: "admins", label: "관리자 회원관리", to: "/admin/hospitals" },
      { key: "customers", label: "사용자 회원관리", to: "/admin/customers" },
      { key: "my", label: "내 정보 보기", to: "/admin" },
    ],
  },
  { key: "hospitals", label: "병원정보", to: "/admin/hospitals" }, // ✅ 병원정보
  { key: "reservations", label: "예약관리", to: "/admin/reservations" }, // ✅ 예약관리
  {
    key: "posts", // ✅ 게시글관리
    label: "게시글관리",
    to: "/admin/claims",
    children: [
      { key: "reviews", label: "병원후기", to: "/admin/claims" },
      { key: "qna", label: "Q&A", to: "/admin/claims/request" },
      { key: "events", label: "이벤트", to: "/admin/claims/hold" },
    ],
  },
  { key: "inquiries", label: "1:1문의", to: "/admin/order" }, // ✅ 1:1문의
];

export default function Sidebar() {
  const [hoverKey, setHoverKey] = useState(null);
  const [openKey, setOpenKey] = useState(null);

  const activeKey = openKey ?? hoverKey;

  return (
    <div className="adm-sb">
      {/* ✅ 로고 클릭 시 /admin 메인으로 이동 */}
      <NavLink to="/admin" className="adm-sb-logo" style={{ textDecoration: "none", color: "inherit" }}>
        BarodocQ
      </NavLink>

      <nav className="adm-sb-nav">
        {MENUS.map((m) => {
          const hasChildren = Array.isArray(m.children) && m.children.length > 0;
          const isOpen = activeKey === m.key;

          return (
            <div
              key={m.key}
              className="adm-sb-group"
              onMouseEnter={() => setHoverKey(m.key)}
              onMouseLeave={() => setHoverKey(null)}
            >
              {/* 상위 메뉴 */}
              <div className="adm-sb-parent">
                <NavLink
                  to={m.to}
                  className={({ isActive }) =>
                    "adm-sb-item" + (isActive ? " adm-active" : "")
                  }
                  onClick={(e) => {
                    if (hasChildren) {
                      e.preventDefault();
                      setOpenKey((prev) => (prev === m.key ? null : m.key));
                    } else {
                      setOpenKey(null);
                    }
                  }}
                >
                  {m.label}
                </NavLink>

                {hasChildren && (
                  <button
                    className="adm-sb-caret"
                    onClick={() =>
                      setOpenKey((prev) => (prev === m.key ? null : m.key))
                    }
                    aria-label="submenu toggle"
                    type="button"
                  >
                    ▾
                  </button>
                )}
              </div>

              {/* 하단 메뉴 */}
              {hasChildren && (
                <div className={"adm-sb-sub" + (isOpen ? " adm-open" : "")}>
                  {m.children.map((c) => (
                    <NavLink
                      key={c.key ?? c.to} // ✅ key가 있으면 key, 없으면 to
                      to={c.to}
                      className={({ isActive }) =>
                        "adm-sb-sub-item" + (isActive ? " adm-active" : "")
                      }
                    >
                      {c.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}