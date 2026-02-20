import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hos_SearchTest from "./pages/Hos_SearchTest";
import Hos_Detail from "./pages/Hos_Detail";
import Main from "./Main";


 function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" exact element={<Main/>} />
        <Route path="/hos_search" element={<Hos_SearchTest />} />
        <Route path="/hos_detail/:hospitalId" element={<Hos_Detail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
