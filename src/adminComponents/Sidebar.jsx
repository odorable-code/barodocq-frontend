import { NavLink } from "react-router-dom";
import { useState } from "react";

const MENUS = [
  {
    key: "material",
    label: "일반1",
    to: "/admin/users",
    children: [
      { label: "하단1", to: "/admin/url지정" },
      { label: "하단2", to: "/admin/url지정" },
    ],
  },
  { key: "pay", label: "일반2", to: "/admin/pay" },
  { key: "approve", label: "일반3", to: "/admin/approve" },
  {
    key: "claims",
    label: "일반4",
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
  const [openKey, setOpenKey] = useState(null); // 클릭으로 고정하고 싶으면 유지

  const activeKey = openKey ?? hoverKey;

  return (
    <div className="sb">
      <div className="sb-logo">BarodocQ</div>

      <nav className="sb-nav">
        {MENUS.map((m) => {
          const hasChildren = Array.isArray(m.children) && m.children.length > 0;
          const isOpen = activeKey === m.key;

          return (
            <div
              key={m.key}
              className="sb-group"
              onMouseEnter={() => setHoverKey(m.key)}
              onMouseLeave={() => setHoverKey(null)}
            >
              {/* 상위 메뉴 */}
              <div className="sb-parent">
                <NavLink
                  to={m.to}
                  className={({ isActive }) =>
                    "sb-item" + (isActive ? " active" : "")
                  }
                  onClick={(e) => {
                    if (hasChildren) {
                      // 상위 메뉴 클릭 시: 서브메뉴 고정 토글
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
                    className="sb-caret"
                    onClick={() => setOpenKey((prev) => (prev === m.key ? null : m.key))}
                    aria-label="submenu toggle"
                    type="button"
                  >
                    ▾
                  </button>
                )}
              </div>

              {/* ✅ 호버(또는 고정) 시 하단 메뉴 */}
              {hasChildren && (
                <div className={"sb-sub" + (isOpen ? " open" : "")}>
                  {m.children.map((c) => (
                    <NavLink
                      key={c.to}
                      to={c.to}
                      className={({ isActive }) =>
                        "sb-sub-item" + (isActive ? " active" : "")
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