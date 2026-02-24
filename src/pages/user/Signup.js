import { Link } from "react-router-dom";

function Signup(){
	return (
		<div style={{marginTop : "150px"}}>
			<Link to="/user/signup">사용자</Link>
			<Link to="/admin/signup">병원</Link>
		</div>
	)
}

export default Signup;