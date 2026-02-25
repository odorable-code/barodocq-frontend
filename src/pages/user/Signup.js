import { Link } from "react-router-dom";
import "./Signup.css";

function Signup(){
	return (
		<div className="container1">
			<div className="container2">
				<Link to="/user/signup" className="user">사용자</Link>
				<Link to="/admin/signup" className="admin">병원</Link>
			</div>
			<Link to="/main" className="main">메인으로</Link>
			<br />
			<Link to="/chat" className="chat">채팅</Link>
			<br />
			<Link to="/chat/list" className="chatList">채팅목록</Link>
		</div>
	)
}

export default Signup;