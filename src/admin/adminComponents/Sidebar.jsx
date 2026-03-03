import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

const MENUS = [
  {
    key: "members",
    label: "회원관리",
    to: "/admin/users",
    children: [
      { key: "admins", label: "관리자 회원관리", to: "/admin/admins" },
      { key: "users", label: "사용자 회원관리", to: "/admin/users" },
      { key: "me", label: "내 정보 보기", to: "/admin/me" },
    ],
  },
  {
    key: "hospitals",
    label: "병원관리",
    to: "/admin/hospitals",
    children: [
      { key: "allHospitals", label: "전체 병원 정보", to: "/admin/hospitals" },
      { key: "myHospital", label: "내 병원 정보", to: "/admin/hospitals/me" },
      { key: "hours", label: "운영시간/휴무변경", to: "/admin/hospitals/hours" },
    ],
  },
  { key: "reservations", label: "예약관리", to: "/admin/reservations" },
  {
    key: "posts",
    label: "게시글관리",
    to: "/admin/posts/reviews",
    children: [
      { key: "reviews", label: "병원후기", to: "/admin/posts/reviews" },
      { key: "qna", label: "Q&A", to: "/admin/posts/qna" },
    ],
  },
  { key: "chats", label: "1:1문의", to: "/admin/chats" },
  { key: "settings", label: "설정", to: "/admin/settings" },
];

export default function Sidebar() {
  const [hoverKey, setHoverKey] = useState(null);
  const [openKey, setOpenKey] = useState(null);
  const { pathname } = useLocation();

  const activeKey = openKey ?? hoverKey;

  // ✅ 현재 경로가 해당 메뉴(또는 자식)의 prefix면 active 처리
  const isMenuActive = (menu) => {
    if (pathname === menu.to) return true;
    if (pathname.startsWith(menu.to + "/")) return true;
    if (menu.children?.some((c) => pathname === c.to || pathname.startsWith(c.to + "/")))
      return true;
    return false;
  };

  return (
    <div className="adm-sb">
      {/* ✅ 로고 클릭 시 /admin 메인으로 이동 */}
      <NavLink
        to="/admin"
        className="adm-sb-logo"
        style={{ textDecoration: "none", color: "inherit" }}
        onClick={() => setOpenKey(null)}
      >
        BarodocQ
      </NavLink>

      <nav className="adm-sb-nav">
        {MENUS.map((m) => {
          const hasChildren = Array.isArray(m.children) && m.children.length > 0;
          const isOpen = activeKey === m.key;

          // ✅ 상위 메뉴 active: 현재 경로 기반
          const parentActive = isMenuActive(m);

          return (
            <div
              key={m.key}
              className="adm-sb-group"
              onMouseEnter={() => setHoverKey(m.key)}
              onMouseLeave={() => setHoverKey(null)}
            >
              <div className="adm-sb-parent">
                <NavLink
                  to={m.to}
                  className={() =>
                    "adm-sb-item" + (parentActive ? " adm-active" : "")
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

              {hasChildren && (
                <div className={"adm-sb-sub" + (isOpen ? " adm-open" : "")}>
                  {m.children.map((c) => (
                    <NavLink
                      key={c.key}
                      to={c.to}
                      className={({ isActive }) =>
                        "adm-sb-sub-item" + (isActive ? " adm-active" : "")
                      }
                      onClick={() => setOpenKey(null)}
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