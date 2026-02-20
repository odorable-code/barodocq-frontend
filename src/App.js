// import ReservationDateSelect from "./pages/ReservationDateSelect";
import Main from "./Main";
import { Navibar } from "./components/Navibar";

function App() {
  // const [showPopup, setShowPopup] = useState(false);

  return (
    <div>
      <Navibar />
      {/* <button onClick={() => setShowPopup(true)}>예약하기</button>
      {showPopup && (
        <ReservationDateSelect onClose={() => setShowPopup(false)} />
      )} */}
      <Main />
    </div>
  );
}

export default App;
