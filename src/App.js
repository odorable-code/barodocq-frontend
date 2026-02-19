import Main from './Main';

// 예약 현황 조회 불러오기
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ReservationDetail from "./pages/ReservationDetail";

function App() {
  return (
    // <div className="App">
    //   <Main/>
    // </div>
    <Router>
      <Routes>
        <Route path="/reservation-detail" element={<ReservationDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
