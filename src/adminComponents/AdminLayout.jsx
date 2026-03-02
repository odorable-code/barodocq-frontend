import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import "./Admin.css";

export default function AdminLayout({children}) {
  return (
    <div className="adm-scope adm-root">
      <aside className="adm-sidebar">
        <Sidebar />
      </aside>

      <div className="adm-main">
        <header className="adm-top">
          <TopHeader />
        </header>

        <main className="adm-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}