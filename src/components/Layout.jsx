import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ onOpenReservation, onOpenPopup }) => (
  <>
    <Header
      onOpenReservation={onOpenReservation}
      onOpenPopup={onOpenPopup}
    />
    <Outlet />
    <Footer />
  </>
);

export default Layout;
