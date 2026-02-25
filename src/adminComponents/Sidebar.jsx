import { NavLink } from "react-router-dom";
import { useState } from "react";

const MENUS = [
  {
    key: "material",
    label: "회원관리",
    to: "/admin/users",
    children: [
      { label: "관리자 회원관리", to: "/admin/url지정" },
      { label: "사용자 회원관리", to: "/admin/url지정" },
      { label: "내 정보 보기", to: "/admin/url지정" },
    ],
  },
  { key: "pay", label: "병원정보", to: "/admin/hospitals" },
  { key: "approve", label: "예약관리", to: "/admin/approve" },
  {
    key: "community",
    label: "게시글관리",
    to: "/admin/claims",
    children: [
      { label: "하단1", to: "/admin/claims" },
      { label: "하단2", to: "/admin/claims/request" },
      { label: "하단3", to: "/admin/claims/hold" },
    ],
  },
  { key: "order", label: "일반4", to: "/admin/order" },
];

export default function Sidebar() {
  const [hoverKey, setHoverKey] = useState(null);
  const [openKey, setOpenKey] = useState(null);

  const activeKey = openKey ?? hoverKey;

  return (
    <div className="adm-sb">
      <div className="adm-sb-logo">BarodocQ</div>

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
                      key={c.to}
                      to={c.to}
                      className={({ isActive }) =>
                        "adm-sb-sub-item" + (isActive ? " adm-active" : "")
                      }
                      onClick={() => {
                        // 서브 클릭하면 고정 해제하고 싶으면:
                        // setOpenKey(null);
                      }}
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