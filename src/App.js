import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "./Main";
import Hos_Detail from "./pages/Hos_Detail";
import Hos_SearchTest from "./pages/Hos_SearchTest";


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
