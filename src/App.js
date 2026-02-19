import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hos_Search from "./pages/Hos_Search";
import Hos_Detail from "./pages/Hos_Detail";
import Main from "./Main";


 function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" exact element={<Main/>} />
        <Route path="/hos_search" element={<Hos_Search />} />
        <Route path="/hos_detail" element={<Hos_Detail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
