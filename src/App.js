import Main from './Main';

// 예약 현황 조회 불러오기
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ReservationDateSelect from "./pages/ReservationDateSelect";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/reservation-dateSelect" element={<ReservationDateSelect />} />
      </Routes>
    </Router>
  );
}

export default App;
