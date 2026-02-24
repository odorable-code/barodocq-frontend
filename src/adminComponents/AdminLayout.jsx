import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import "./Admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <Sidebar />
      </aside>

      <div className="admin-main">
        <header className="admin-top">
          <TopHeader />
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}