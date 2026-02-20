import Main from "./Main";
import { Navigate } from "react-router-dom";

// 예약 현황 조회 불러오기
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ReservationDetail from "./pages/ReservationDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/ReservationDetail" />} />
        <Route path="/ReservationDetail" element={<ReservationDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
