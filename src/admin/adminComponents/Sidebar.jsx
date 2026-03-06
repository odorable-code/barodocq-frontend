import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";

const MENUS = [
  { key: "members", label: "회원관리", to: "/admin/users", icon: "fa-users",
    children: [
      { key: "admins", label: "관리자 회원관리", to: "/admin/admins", roles: ["SUPERADMIN"] },
      { key: "users", label: "사용자 회원관리", to: "/admin/users", roles: ["SUPERADMIN"] },
      { key: "me", label: "내 정보 보기", to: "/admin/me", roles: ["ADMIN"] },
    ],
  },
  { key: "hospitals", label: "병원관리", to: "/admin/hospitals", icon: "fa-hospital",
    children: [
      { key: "allHospitals", label: "전체 병원 정보", to: "/admin/hospitals", roles: ["SUPERADMIN"] },
      { key: "myHospital", label: "내 병원 정보", to: "/admin/hospitals/me", roles: ["ADMIN"] },
    ],
  },
  { key: "reservations", label: "예약관리", to: "/admin/reservations", icon: "fa-calendar-check" },
  { key: "posts", label: "게시글관리", to: "/admin/posts/reviews", icon: "fa-paste",
    children: [
      { key: "reviews", label: "병원후기", to: "/admin/posts/reviews" },
      { key: "qna", label: "Q&A", to: "/admin/posts/qna" },
    ],
  },
  { key: "chats", label: "1:1문의", to: "/admin/inquiry", icon: "fa-comments" },
];

export default function Sidebar() {
  
  const { pathname } = useLocation();
  const { user, isLoading } = useAuth();

  const role = user?.role;
  console.log("현재 role =", role, user);

  const [openKey, setOpenKey] = useState(null);

  // ✅ 현재 URL 경로를 파악해서 해당 부모 메뉴를 자동으로 열어줍니다

  
  useEffect(() => {
    const activeParent = MENUS.find(m => 
      pathname === m.to || (m.children && m.children.some(c => pathname.startsWith(c.to)))
    );
    if (activeParent) {
      setOpenKey(activeParent.key);
    }
  }, [pathname]);

  if (isLoading) return null;

  return (
    
    <div className="adm-sb">
      <NavLink to="/admin" className="adm-sb-logo">
        Barodoc<span>Q</span>
      </NavLink>

      <nav className="adm-sb-nav">
        {MENUS.map((m) => {
          const hasChildren = m.children && m.children.length > 0;
          const isOpen = openKey === m.key;
          
          // ✅ 자식 메뉴 중 하나라도 활성화되어 있으면 부모 메뉴도 활성화(민트색) 처리
          const isParentActive = pathname === m.to || (hasChildren && m.children.some(c => pathname.startsWith(c.to)));

          return (
            <div key={m.key} className="adm-sb-group">
              <div className="adm-sb-parent">
                <NavLink 
                  to={m.to} 
                  className={`adm-sb-item ${isParentActive ? "adm-active" : ""}`}
                  onClick={(e) => {
                    if (hasChildren) {
                      e.preventDefault();
                      setOpenKey(isOpen ? null : m.key);
                    }
                  }}
                >
                  <i className={`fas ${m.icon}`} style={{width: '20px'}}/>
                  {m.label}
                </NavLink>
                {hasChildren && (
                  <button className="adm-sb-caret" onClick={() => setOpenKey(isOpen ? null : m.key)}>
                    <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`} style={{fontSize: '0.7rem'}}/>
                  </button>
                )}
              </div>

              {hasChildren && (
                <div className={"adm-sb-sub" + (isOpen ? " adm-open" : "")}>
                  {m.children
                    .filter((c) => !c.roles || c.roles.includes(role))
                    .map((c) => (
                    <NavLink 
                      key={c.key} 
                      to={c.to} 
                      className={({isActive}) => "adm-sb-sub-item" + (isActive ? " adm-active" : "")}
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