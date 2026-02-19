import React, { useState } from "react";
import ReservationDateSelect from "./pages/ReservationDateSelect";

function App() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div>
      <button onClick={() => setShowPopup(true)}>예약하기</button>
      {showPopup && (
        <ReservationDateSelect onClose={() => setShowPopup(false)} />
      )}
    </div>
  );
}

export default App;
