import { Routes, Route, Link } from 'react-router-dom'
import {BrowserRouter} from 'react-router-dom';
import AdminLogin from "./adminLogin";
import Find from "./find";
import HoAndPhar from "./hoAndPhar";
import HoAndPhar공지 from "./hoAndPhar공지";
import Pharmacy from "./pharmacy";
import ResetPassword from "./resetPassword";
import UserLogin from "./userLogin";
import UserSignup from "./userSignup";

function App() {
  return (
    <BrowserRouter>
    <Link to="/login/adminLogin">관리자로그인. </Link>
    <Link to="/find">찾기. </Link>
    <Link to="/hoAndPharmacy">병원&약국. </Link>
    <Link to="/hoAndPharmacy공지">병원&약국공지. </Link>
    <Link to="/pharmacy">약국. </Link>
    <Link to="/passwordReset">비번재설정. </Link>
    <Link to="/login/userLogin">사용자로그인. </Link>
    <Link to="/signup/userSignup">사용자회원가입. </Link>
      <Routes>
        <Route path='/login/adminLogin' element={<AdminLogin />} />
        <Route path='/find' element={<Find />} />
        <Route path='/hoAndPharmacy' element={<HoAndPhar />} />
        <Route path='/hoAndPharmacy공지' element={<HoAndPhar공지 />} />
        <Route path='/pharmacy' element={<Pharmacy />} />
        <Route path='/passwordReset' element={<ResetPassword />} />
        <Route path='/login/userLogin' element={<UserLogin />} />
        <Route path='/signup/userSignup' element={<UserSignup />} />
      </Routes>
    </BrowserRouter>
    
  );
}

export default App;
