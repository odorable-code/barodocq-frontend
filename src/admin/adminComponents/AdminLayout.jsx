import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import "../Admin.css"; 

export default function AdminLayout() {
  return (
    <div className="adm-scope">
      {/* 좌측 고정 사이드바 */}
      <Sidebar />

      {/* 우측 메인 영역 */}
      <div className="adm-main-wrap">
        <TopHeader />
        
        <div className="adm-content-area">
          {/* 실제 페이지(AdminMe, AdminUsers 등)가 렌더링되는 구멍 */}
          <Outlet /> 
        </div>
      </div>
    </div>
  );
}