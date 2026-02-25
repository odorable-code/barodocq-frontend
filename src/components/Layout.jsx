// Layout.jsx
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ onOpenReservation }) => {
  return (
    <div className="app-layout">
      <Header onOpenReservation={onOpenReservation} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;